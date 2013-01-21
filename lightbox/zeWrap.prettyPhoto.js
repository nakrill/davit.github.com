(function() {
	
	var $=null;
	
	PrettyPhoto=function(items,pp_settings) {
		
		$=zeQuery;
		
		var holder,overlay,title,btn={};
		var isSet=true;
		var idx=0;
		
		
		_checkItems();
		
		var item=items[idx];
		
		var correctSizes=null;
		var settings=pp_settings = $.extend({
			animation_speed: 'fast', /* fast/slow/normal */
			slideshow: false, /* false OR interval time in ms */
			autoplay_slideshow: false, /* true/false */
			opacity: 0.80, /* Value between 0 and 1 */
			show_title: true, /* true/false */
			allow_resize: true, /* Resize the photos bigger than viewport. true/false */
			fit_default_dim: false, /* by Cincopa fit img to the default_width x default_height. true/false */
			default_width: 600,
			default_height: 450,
			counter_separator_label: '/', /* The separator for the gallery counter 1 "of" 2 */
			theme: 'facebook', /* light_rounded / dark_rounded / light_square / dark_square / facebook */
			hideflash: false, /* Hides all the flash object on a page, set to TRUE if flash appears over prettyPhoto */
			wmode: 'opaque', /* Set the flash wmode attribute */
			autoplay: true, /* Automatically start videos: True/False */
			modal: false, /* If set to true, only the close button will close the window */
			overlay_gallery: false, /* If set to true, a gallery will overlay the fullscreen image on mouse over */
			keyboard_shortcuts: true, /* Set to false if you open forms inside prettyPhoto */
			changepicturecallback: function() { }, /* Called everytime an item is shown/changed */
			callback: function() { }, /* Called when prettyPhoto is closed */
			markup: '<div class="pp_pic_holder"> \
						<div class="ppt">&nbsp;</div> \
						<div class="pp_top"> \
							<div class="pp_left"></div> \
							<div class="pp_middle"></div> \
							<div class="pp_right"></div> \
						</div> \
						<div class="pp_content_container"> \
							<div class="pp_left"> \
							<div class="pp_right"> \
								<div class="pp_content"> \
									<div class="pp_loaderIcon"></div> \
									<div class="pp_fade"> \
										<a href="#" class="pp_expand" title="Expand the image">Expand</a> \
										<div class="pp_hoverContainer"> \
											<a class="pp_next" href="#">next</a> \
											<a class="pp_previous" href="#">previous</a> \
										</div> \
										<div id="pp_full_res"></div> \
										<div class="pp_details clearfix"> \
											<p class="pp_description"></p> \
											<a class="pp_close" href="#">Close</a> \
											<div class="pp_nav"> \
												<a href="#" class="pp_arrow_previous">Previous</a> \
												<p class="currentTextHolder">0/0</p> \
												<a href="#" class="pp_arrow_next">Next</a> \
											</div> \
										</div> \
									</div> \
								</div> \
							</div> \
							</div> \
						</div> \
						<div class="pp_bottom"> \
							<div class="pp_left"></div> \
							<div class="pp_middle"></div> \
							<div class="pp_right"></div> \
						</div> \
					</div> \
					<div class="pp_overlay"></div>',
			gallery_markup: '<div class="pp_gallery"> \
								<a href="#" class="pp_arrow_previous">Previous</a> \
								<ul> \
									{gallery} \
								</ul> \
								<a href="#" class="pp_arrow_next">Next</a> \
							</div>',
			image_markup: '<img id="fullResImage" src="" />',
			flash_markup: '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="{width}" height="{height}"><param name="wmode" value="{wmode}" /><param name="allowfullscreen" value="true" /><param name="allowscriptaccess" value="always" /><param name="movie" value="{path}" /><embed src="{path}" type="application/x-shockwave-flash" allowfullscreen="true" allowscriptaccess="always" width="{width}" height="{height}" wmode="{wmode}"></embed></object>',
			quicktime_markup: '<object classid="clsid:02BF25D5-8C17-4B23-BC80-D3488ABDDC6B" codebase="http://www.apple.com/qtactivex/qtplugin.cab" height="{height}" width="{width}"><param name="src" value="{path}"><param name="autoplay" value="{autoplay}"><param name="type" value="video/quicktime"><embed src="{path}" height="{height}" width="{width}" autoplay="{autoplay}" type="video/quicktime" pluginspage="http://www.apple.com/quicktime/download/"></embed></object>',
			iframe_markup: '<iframe src ="{path}" width="{width}" height="{height}" frameborder="no"></iframe>',
			inline_markup: '<div class="pp_inline clearfix">{content}</div>',
			custom_markup: ''
		}, pp_settings);

		// Global variables accessible only by prettyPhoto
		var percentBased = false, correctSizes, movie_width,movie_height,callback_cookie,

		// prettyPhoto container specific
		pp_contentHeight, pp_contentWidth, pp_containerHeight, pp_containerWidth,

		// Window size
		windowHeight = $(window).height(), windowWidth = $(window).width(),

		// Global elements
		pp_slideshow;

		doresize = true, scroll_pos = _get_scroll();

		var global_events={
			window:{
				resize:function(){
					windowHeight = $(window).height(), windowWidth = $(window).width(),
					_center_overlay();
					_resize_overlay();
				},
				scroll:_center_overlay
			}	
		};
		
		if(pp_settings.keyboard_shortcuts){
			global_events.document={
				keydown:function(e) {
					if (typeof holder != 'undefined') {
						if (holder.isVisible()) {
							switch (e.keyCode) {
								case 37:
									changePage('previous');
									break;
								case 39:
									changePage('next');
									break;
								case 27:
									if (!settings.modal)
										close();
									break;
							};
							return false;
						};
					};
				}	
			};
		}
		
		function _checkItems(){
			
			//debugger;
			
			if(items instanceof $===false) return;
			
			var is=[];
			
			//extract data from <A>
			items.each(function(i){
				is.push({
					image:i.attr('href'),
					title:i.find('img').attr('alt'),
					description:i.attr('title')	
				});
			});
			
			var i=0;
			items.each(function(v){
				var n=i;
				v.click(function(){
					idx=n;
					item=items[idx];
					initialize();
					return false;
				});
				i++;
			});
			
			items=is;
		}
		
		/**
		* Initialize prettyPhoto.
		*/
		function initialize() {
			
			_buildOverlay(); // Build the overlay {this} being the caller
			
			$.bind(global_events);
			
			_center_overlay();

			open();

			return false;
		}
		
		this.open=function(){
			open.apply(this,arguments);
		};

		/**
		* Opens the prettyPhoto modal box.
		* @param image {String,Array} Full path to the image to be open, can also be an array containing full images paths.
		* @param title {String,Array} The title to be displayed with the picture, can also be an array containing all the titles.
		* @param description {String,Array} The description to be displayed with the picture, can also be an array containing all the descriptions.
		*/
		function open(position) {
			
			if(position!==undefined){
				idx=position;
				item=items[idx];
				initialize();
				return;
			}
			
			if ($.isIE(6)) $('select').css('visibility', 'hidden'); // To fix the bug with IE select boxes

			if (settings.hideflash) $('object,embed').css('visibility', 'hidden'); // Hide the flash
			
			$('.pp_loaderIcon').show();

			// Fade the content in
			//if (title.isHidden())title.css('opacity', 0).show();
			//title.show();
			overlay.show().fadeTo(settings.animation_speed, settings.opacity);

			// Display the current position
			holder.find('.currentTextHolder').text((idx + 1) + settings.counter_separator_label + items.length);

			// Set the description
			holder.find('.pp_description').show().html(unescape(item.description));

			// Set the title
			(settings.show_title && item.title != "") ? title.html(unescape(item.title)) : title.html('&nbsp;');

			// Get the dimensions
			var ps=parse_params(item.image);

			movie_width = parseFloat(ps.width)?ps.width:settings.default_width.toString();
			movie_height = parseFloat(ps.height)?ps.height:settings.default_height.toString();
			callback_cookie = ps.callback_cookie;

			// If the size is % based, calculate according to window dimensions
			if (movie_width.indexOf('%') != -1 || movie_height.indexOf('%') != -1) {
				movie_height = parseFloat(($(window).height() * parseFloat(movie_height) / 100) - 100);
				movie_width = parseFloat(($(window).width() * parseFloat(movie_width) / 100) - 100);
				percentBased = true;
			} else {
				percentBased = false;
			}
			
			// Fade the holder
			holder.fadeIn(function() {
				_center_overlay();
				imgPreloader = "";

				// Inject the proper content
				switch (_getFileType(item)) {
					case 'image':
					//debugger;
						//trace('OPEN IMAGE');
						imgPreloader = new Image();

						// Preload the neighbour images
						nextImage = new Image();
						if (isSet && idx > items.length) nextImage.src = items[idx + 1];
						prevImage = new Image();
						if (isSet && items[idx - 1]) prevImage.src = items[idx - 1];

						holder.find('#pp_full_res')[0].innerHTML = settings.image_markup;
						holder.find('#fullResImage').attr('src', item.image);

						imgPreloader.onload = 
						function() {
							// Fit item to viewport
							correctSizes = _fitToViewport(imgPreloader.width, imgPreloader.height);
							_showContent();
						};

						imgPreloader.onerror = function() {
							alert('Image cannot be loaded. Make sure the path is correct and image exist.');
							close();
						};
						
						imgPreloader.src = item.image;
						//setTimeout(_showContent,1000);
						break;

					case 'youtube':
						correctSizes = _fitToViewport(movie_width, movie_height); // Fit item to viewport

						movie = 'http://www.youtube.com/v/' + grab_param('v', item);
						if (settings.autoplay) movie += "&autoplay=1";

						toInject = settings.flash_markup.replace(/{width}/g, correctSizes['width']).replace(/{height}/g, correctSizes['height']).replace(/{wmode}/g, settings.wmode).replace(/{path}/g, movie);
						break;

					case 'vimeo':
						correctSizes = _fitToViewport(movie_width, movie_height); // Fit item to viewport

						movie_id = item;
						var regExp = /http:\/\/(www\.)?vimeo.com\/(\d+)/;
						var match = movie_id.match(regExp);

						movie = 'http://player.vimeo.com/video/' + match[2] + '?title=0&amp;byline=0&amp;portrait=0';
						if (settings.autoplay) movie += "&autoplay=1;";

						vimeo_width = correctSizes['width'] + '/embed/?moog_width=' + correctSizes['width'];

						toInject = settings.iframe_markup.replace(/{width}/g, vimeo_width).replace(/{height}/g, correctSizes['height']).replace(/{path}/g, movie);
						break;

					case 'quicktime':
						correctSizes = _fitToViewport(movie_width, movie_height); // Fit item to viewport
						correctSizes['height'] += 15; correctSizes['contentHeight'] += 15; correctSizes['containerHeight'] += 15; // Add space for the control bar

						toInject = settings.quicktime_markup.replace(/{width}/g, correctSizes['width']).replace(/{height}/g, correctSizes['height']).replace(/{wmode}/g, settings.wmode).replace(/{path}/g, item).replace(/{autoplay}/g, settings.autoplay);
						break;

					case 'flash':
						correctSizes = _fitToViewport(movie_width, movie_height); // Fit item to viewport

						flash_vars = item;
						flash_vars = flash_vars.substring(item.indexOf('flashvars') + 10, item.length);

						filename = item;
						filename = filename.substring(0, filename.indexOf('?'));

						toInject = settings.flash_markup.replace(/{width}/g, correctSizes['width']).replace(/{height}/g, correctSizes['height']).replace(/{wmode}/g, settings.wmode).replace(/{path}/g, filename + '?' + flash_vars);
						break;

					case 'iframe':
						correctSizes = _fitToViewport(movie_width, movie_height); // Fit item to viewport

						frame_url = item;
						frame_url = frame_url.substr(0, frame_url.indexOf('iframe') - 1);

						toInject = settings.iframe_markup.replace(/{width}/g, correctSizes['width']).replace(/{height}/g, correctSizes['height']).replace(/{path}/g, frame_url);
						break;

					case 'custom':
						
						correctSizes = _fitToViewport(movie_width, movie_height); // Fit item to viewport

						toInject = settings.custom_markup;
						break;

					case 'inline':
						// to get the item height clone it, apply default width, wrap it in the prettyPhoto containers , then delete
						myClone = $(item).clone().css({ 'width': settings.default_width }).wrapInner('<div id="pp_full_res"><div class="pp_inline clearfix"></div></div>').appendTo(document.body);
						correctSizes = _fitToViewport($(myClone).width(), $(myClone).height());
						$(myClone).remove();
						toInject = settings.inline_markup.replace(/{content}/g, $(item).html());
						break;
				};

				if (!imgPreloader) {
					holder.find('#pp_full_res')[0].innerHTML = toInject;

					// Show content
					_showContent();
				};
			});

			return false;
		};


		/**
		* Change page in the prettyPhoto modal box
		* @param direction {String} Direction of the paging, previous or next.
		*/
		function changePage(direction) {
			
			trace('changePage: '+direction);
			currentGalleryPage = 0;

			if (direction == 'previous') {
				idx--;
				if (idx < 0) {
					idx = items.length-1
				};
			} else if (direction == 'next') {
				idx++;
				if (idx > items.length - 1) {
					idx = 0;
				}
			} else {
				idx = direction;
			};
			
			item=items[idx];

			if (!doresize) doresize = true; // Allow the resizing of the images
			$('.pp_contract').removeClass('pp_contract').addClass('pp_expand');

			_hideContent(open);
		};


		/**
		* Change gallery page in the prettyPhoto modal box
		* @param direction {String} Direction of the paging, previous or next.
		*/
		function changeGalleryPage(direction) {
			if (direction == 'next') {
				currentGalleryPage++;

				if (currentGalleryPage > totalPage) {
					currentGalleryPage = 0;
				};
			} else if (direction == 'previous') {
				currentGalleryPage--;

				if (currentGalleryPage < 0) {
					currentGalleryPage = totalPage;
				};
			} else {
				currentGalleryPage = direction;
			};

			// Slide the pages, if we're on the last page, find out how many items we need to slide. To make sure we don't have an empty space.
			itemsToSlide = (currentGalleryPage == totalPage) ? items.length - ((totalPage) * itemsPerPage) : itemsPerPage;

			holder.find('.pp_gallery li').each(function(i) {
				$(this).animate({
					'left': (i * itemWidth) - ((itemsToSlide * itemWidth) * currentGalleryPage)
				});
			});
		};


		/**
		* Start the slideshow...
		*/
		function startSlideshow() {
			if (typeof pp_slideshow == 'undefined') {
				holder.find('.pp_play').unbind('click').removeClass('pp_play').addClass('pp_pause').click(function() {
					stopSlideshow();
					return false;
				});
				pp_slideshow = setInterval(startSlideshow, settings.slideshow);
			} else {
				changePage('next');
			};
		}


		/**
		* Stop the slideshow...
		*/
		function stopSlideshow() {
			holder.find('.pp_pause').unbind('click').removeClass('pp_pause').addClass('pp_play').click(function() {
				startSlideshow();
				return false;
			});
			clearInterval(pp_slideshow);
			pp_slideshow = undefined;
		}


		/**
		* Closes the prettyPhoto modal box.
		*/
		function close() {

			clearInterval(pp_slideshow);

			holder.stop().find('object,embed').css('visibility', 'hidden');
			
			$('div.pp_pic_holder,div.ppt,.pp_fade').fadeOut(settings.animation_speed, function() { this.remove(); });

			overlay.fadeOut(settings.animation_speed, function() {
				
				if ($.isIE(6)) $('select').css('visibility', 'visible'); // To fix the bug with IE select boxes

				if (settings.hideflash) $('object,embed').css('visibility', 'visible'); // Show the flash
				
				this.remove(); // No more need for the prettyPhoto markup
				
				$.unbind(global_events);
				
				settings.callback();

				doresize = true;

				delete settings;
			});
		};

		function navShow(val){
			
			var nav=holder.find('.pp_hoverContainer');
			if(val===false){
				nav.hide();
				return;
			}
			nav.show(_getFileType(item)=="image"/*&&items.length>1*/);
		}

		function _showContent() {
			
			//trace('SHOW CONTENT');
			
			$('.pp_loaderIcon').hide();
			
			title.fadeTo(settings.animation_speed, 1);

			// Calculate the opened top position of the pic holder
			projectedTop = scroll_pos['scrollTop'] + ((windowHeight / 2) - (correctSizes['containerHeight'] / 2));
			if (projectedTop < 0) projectedTop = 0;

			// Resize the content holder
			holder.find('.pp_content').animate({ 'height': correctSizes['contentHeight'] }, settings.animation_speed);

			// Resize picture the holder
			
			holder.animate({
				'top': projectedTop,
				'left': (windowWidth / 2) - (correctSizes['containerWidth'] / 2),
				'width': correctSizes['containerWidth']
			}, settings.animation_speed, function() {
				
				holder.find('.pp_hoverContainer,#fullResImage').height(correctSizes['height']).width(correctSizes['width']);

				holder.find('.pp_fade').fadeIn(settings.animation_speed); // Fade the new content

				navShow();

				if (correctSizes['resized']) $('a.pp_expand,a.pp_contract').fadeIn(settings.animation_speed); // Fade the resizing link if the image is resized

				if (settings.autoplay_slideshow && !pp_slideshow) startSlideshow();

				// sometimes the img will make the entire page bigger (add to scroll) to if we'll not redo the overlay the overlay will be shorter than the page
				_center_overlay();
				_resize_overlay();
				
				settings.changepicturecallback(callback_cookie); // Callback!
			});
			
			_insert_gallery();
		};

		/**
		* Hide the content...DUH!
		*/
		function _hideContent(callback) {
			
			// Fade out the current picture
			holder.find('#pp_full_res object,#pp_full_res embed').css('visibility', 'hidden');
			
			//navShow(false);
			//debugger;
			holder.find('.pp_fade').fadeOut(settings.animation_speed, function() {
				$('.pp_loaderIcon').show();
				callback();
			});
		};

		/**
		* Resize the item dimensions if it's bigger than the viewport
		* @param width {integer} Width of the item to be opened
		* @param height {integer} Height of the item to be opened
		* @return An array containin the "fitted" dimensions
		*/
		function _fitToViewport(width, height) {
			resized = false;

			if (settings.fit_default_dim && _getFileType(item) == 'image') {

				var widget_ratio = settings.default_width / settings.default_height;
				var ratio = width / height;

				if (widget_ratio > ratio) {
					imageHeight = settings.default_height;
					imageWidth = imageHeight * ratio;
				}
				else {
					imageWidth = settings.default_width;
					imageHeight = imageWidth / ratio;
				}

				_getDimensions(imageWidth, imageHeight);

			}
			else {

				_getDimensions(width, height);
				// Define them in case there's no resize needed
				imageWidth = width, imageHeight = height;

			}

			if (((pp_containerWidth > windowWidth) || (pp_containerHeight > windowHeight)) && doresize && settings.allow_resize && !percentBased) {
				resized = true, fitting = false;

				while (!fitting) {
					if ((pp_containerWidth > windowWidth)) {
						imageWidth = (windowWidth - 200);
						imageHeight = (height / width) * imageWidth;
					} else if ((pp_containerHeight > windowHeight)) {
						imageHeight = (windowHeight - 200);
						imageWidth = (width / height) * imageHeight;
					} else {
						fitting = true;
					};

					pp_containerHeight = imageHeight, pp_containerWidth = imageWidth;
				};

				_getDimensions(imageWidth, imageHeight);
			};

			return {
				width: Math.floor(imageWidth),
				height: Math.floor(imageHeight),
				containerHeight: Math.floor(pp_containerHeight),
				containerWidth: Math.floor(pp_containerWidth) + 40, // 40 behind the side padding
				contentHeight: Math.floor(pp_contentHeight),
				contentWidth: Math.floor(pp_contentWidth),
				resized: resized
			};
		};

		/**
		* Get the containers dimensions according to the item size
		* @param width {integer} Width of the item to be opened
		* @param height {integer} Height of the item to be opened
		*/
		function _getDimensions(width, height) {
			width = parseFloat(width);
			height = parseFloat(height);

			// Get the details height, to do so, I need to clone it since it's invisible
			$pp_details = holder.find('.pp_details');
			$pp_details.width(width);
			//debugger;
			detailsHeight = parseFloat($pp_details.css('marginTop')) + parseFloat($pp_details.css('marginBottom'));
			
			$pp_details = $pp_details.clone().appendTo(document.body).css({
				'position': 'absolute',
				'top': -10000
			});
			detailsHeight += $pp_details.height();
			detailsHeight = (detailsHeight <= 34) ? 36 : detailsHeight; // Min-height for the details
			if ($.isIE(7)) detailsHeight += 8;
			$pp_details.remove();

			// Get the container size, to resize the holder to the right dimensions
			pp_contentHeight = height + detailsHeight;
			pp_contentWidth = width;
			pp_containerHeight = pp_contentHeight + title.height() + holder.find('.pp_top').height() + holder.find('.pp_bottom').height();
			pp_containerWidth = width;
		}

		function _getFileType(item) {
			var itemSrc=item.image;
			if (itemSrc.match(/youtube\.com\/watch/i)) {
				return 'youtube';
			} else if (itemSrc.match(/vimeo\.com/i)) {
				return 'vimeo';
			} else if (itemSrc.indexOf('.mov') != -1) {
				return 'quicktime';
			} else if (itemSrc.indexOf('.swf') != -1) {
				return 'flash';
			} else if (itemSrc.indexOf('iframe') != -1) {
				return 'iframe';
			} else if (itemSrc.indexOf('custom') != -1) {
				return 'custom';
			} else if (itemSrc.indexOf('#cp_') != -1) {
				return 'inline';
			} else {
				return 'image';
			};
		};

		function _center_overlay() {
			
			if (doresize && typeof holder != 'undefined') {
				trace('center');			
				holder.show();
				if(holder.find('.pp_fade').isHidden()){
					$('.pp_loaderIcon').show();
				}
				
				scroll_pos = _get_scroll();
				
				titleHeight = 0/*title.height()*/, contentHeight = holder.height(), contentwidth = holder.width();

				projectedTop = (windowHeight / 2) + scroll_pos['scrollTop'] - (contentHeight / 2);
				
				var lr={
					'top': projectedTop,
					'left': (windowWidth / 2) + scroll_pos['scrollLeft'] - (contentwidth / 2)
				};
				//trace(contentwidth+' x '+contentHeight);
				//trace(arguments.callee.caller.name.length?arguments.callee.caller.name:arguments.callee.caller.toString());
				//console.dir(lr);
				holder.css(lr);
			};
		};

		function _get_scroll() {
			if (self.pageYOffset) {
				return { scrollTop: self.pageYOffset, scrollLeft: self.pageXOffset };
			} else if (document.documentElement && document.documentElement.scrollTop) { // Explorer 6 Strict
				return { scrollTop: document.documentElement.scrollTop, scrollLeft: document.documentElement.scrollLeft };
			} else if (document.body) {// all other Explorers
				return { scrollTop: document.body.scrollTop, scrollLeft: document.body.scrollLeft };
			};
		};

		function _resize_overlay() {
			//windowHeight = $(window).height(), windowWidth = $(window).width();
			//if (typeof overlay != "undefined") overlay.height($(document).height());
		};

		function _insert_gallery() {
			if (isSet && settings.overlay_gallery && _getFileType(item) == "image") {
				itemWidth = 52 + 5; // 52 beign the thumb width, 5 being the right margin.
				navWidth = (settings.theme == "facebook") ? 58 : 38; // Define the arrow width depending on the theme

				itemsPerPage = Math.floor((correctSizes['containerWidth'] - 100 - navWidth) / itemWidth);
				itemsPerPage = (itemsPerPage < items.length) ? itemsPerPage : items.length;
				totalPage = Math.ceil(items.length / itemsPerPage) - 1;

				// Hide the nav in the case there's no need for links
				if (totalPage == 0) {
					navWidth = 0; // No nav means no width!
					holder.find('.pp_gallery .pp_arrow_next,.pp_gallery .pp_arrow_previous').hide();
				} else {
					holder.find('.pp_gallery .pp_arrow_next,.pp_gallery .pp_arrow_previous').show();
				};

				galleryWidth = itemsPerPage * itemWidth + navWidth;

				// Set the proper width to the gallery items
				holder.find('.pp_gallery')
					.width(galleryWidth)
					.css('margin-left', -(galleryWidth / 2));

				holder
					.find('.pp_gallery ul')
					.width(itemsPerPage * itemWidth)
					.find('li.selected')
					.removeClass('selected');

				goToPage = (Math.floor(idx / itemsPerPage) <= totalPage) ? Math.floor(idx / itemsPerPage) : totalPage;


				if (itemsPerPage) {
					holder.find('.pp_gallery').hide().show().removeClass('disabled');
				} else {
					holder.find('.pp_gallery').hide().addClass('disabled');
				}

				changeGalleryPage(goToPage);

				holder
					.find('.pp_gallery ul li:eq(' + idx + ')')
					.addClass('selected');
			} else {
				holder.find('.pp_content').unbind('mouseenter mouseleave');
				holder.find('.pp_gallery').hide();
			}
		}

		function _buildOverlay() {
			
			$(document.body).append(settings.markup); // Inject the markup

			//debugger;
			holder=$('.pp_pic_holder'),title=$('.ppt'),overlay=$('div.pp_overlay'); // Set my global selectors
			
			// Inject the inline gallery!
			if (isSet && settings.overlay_gallery) {
				currentGalleryPage = 0;
				toInject = "";
				for (var i = 0; i < items.length; i++) {
					var regex = new RegExp("(.*?)\.(jpg|jpeg|png|gif)$");
					var results = regex.exec(items[i]);
					if (!results) {
						classname = 'default';
					} else {
						classname = '';
					}
					toInject += "<li class='" + classname + "'><a href='#'><img src='" + items[i] + "' width='50' alt='' /></a></li>";
				};

				toInject = settings.gallery_markup.replace(/{gallery}/g, toInject);

				holder.find('#pp_full_res').after(toInject);

				holder.find('.pp_gallery .pp_arrow_next').click(function() {
					changeGalleryPage('next');
					stopSlideshow();
					return false;
				});

				holder.find('.pp_gallery .pp_arrow_previous').click(function() {
					changeGalleryPage('previous');
					stopSlideshow();
					return false;
				});

				holder.find('.pp_content').hover(
					function() {
						holder.find('.pp_gallery:not(.disabled)').fadeIn();
					},
					function() {
						holder.find('.pp_gallery:not(.disabled)').fadeOut();
					});

				itemWidth = 52 + 5; // 52 beign the thumb width, 5 being the right margin.
				holder.find('.pp_gallery ul li').each(function(i) {
					$(this).css({
						'position': 'absolute',
						'left': i * itemWidth
					});

					$(this).find('a').unbind('click').click(function() {
						changePage(i);
						stopSlideshow();
						return false;
					});
				});
			};


			// Inject the play/pause if it's a slideshow
			if (settings.slideshow) {
				holder.find('.pp_nav').prepend('<a href="#" class="pp_play">Play</a>')
				holder.find('.pp_nav .pp_play').click(function() {
					startSlideshow();
					return false;
				});
			}
			
			holder.attr('class', 'pp_pic_holder ' + settings.theme); // Set the proper theme
			

			overlay.click(function(){
				if(!settings.modal) close();
			});
			
			$('a.pp_close').bind('click', function() { close(); return false; });

			$('a.pp_expand').bind('click', function(e) {
				// Expand the image
				if ($(this).hasClass('pp_expand')) {
					$(this).removeClass('pp_expand').addClass('pp_contract');
					doresize = false;
				} else {
					$(this).removeClass('pp_contract').addClass('pp_expand');
					doresize = true;
				};

				_hideContent(open);

				return false;
			});

			holder.find('.pp_previous, .pp_nav .pp_arrow_previous').bind('click', function() {
				changePage('previous');
				stopSlideshow();
				return false;
			});

			holder.find('.pp_next, .pp_nav .pp_arrow_next').bind('click', function() {
				changePage('next');
				stopSlideshow();
				return false;
			});

			_center_overlay(); // Center it
		};
		
		//$elem.unbind('click').click(initialize); // Return the $ object for chaining. The unbind method is used to avoid click conflict when the plugin is called more than once
	};

	function parse_params(url){
		var os={};
		var ps=url.match(/\?(.+)$/)[1].split('&');
		for(var i=0;i<ps.length;i++){
			var vs=ps[i].split('=');
			os[vs[0]]=decodeURIComponent(vs[1]);
		}
		return os;
	}

	function grab_param(name, url) {
		name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
		var regexS = "[\\?&]" + name + "=([^&#]*)";
		var regex = new RegExp(regexS);
		var results = regex.exec(url);
		return (results == null) ? "" : results[1];
	}

})();