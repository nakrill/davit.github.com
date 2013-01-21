if (typeof zeSkins.imagelist == "undefined")
{
	zeSkins.imagelist = function() {

		function _trace(msg) {
			trace("SKIN: " + msg);
		}

		this.go = null; // go = GalleryObject
		this.isready = 0;

		this.arg_groups = {
			basic: { name: "Basic", desc: "Basic settings for the gallery" },
			itemaction: { name: "Item Action", desc: "Customize what happen when user click on an item." },
			lightbox: { name: "Lightbox", desc: "Customize the lightbox feature" }
		};

		this.arg_map = {
			folder_name: { group: "basic", type: "text", name: "Gallery Name", desc: "Set your gallery name" },
			widget: { group: "basic", type: "size", name: "Size", desc: "Set the size of your gallery" },
			thumb: { group: 'basic', type: 'size', name: 'Thumb Size', desc: 'Size of the thumbnail' },
			thumb_aspect: { group: "basic", name: "Thumb Aspect Ratio", type: "list:maintain,full_size,override_css", desc: "" },

			video_thumb: { group: "basic", name: "Video Thumb", type: "list", values: { no: "Poster", thumb_no_audio: "Play video", thumb_with_audio: "Play video and audio" }, desc: "Select what thumbnail to show for video items." },

			css_main: { group: "basic", type: "css", name: "Main CSS", desc: "Customize the CSS of your gallery" },
			add_text: { group: "basic", type: "list", values: { none: "none", title: "title", description: "description", "title and description": "title and description" }, name: "Add Text", desc: "" },
			tooltip: { group: "basic", type: "list", values: { none: "none", title: "title", description: "description", "title and description": "title and description" }, name: "Tooltip", desc: "A tooltip is the small boxed text message that pops up when a mouse cursor hovers over an item. <br><br>Use this parameter to set the content of the tooltip." },
			per_page: { group: "basic", type: "text",name: "Thumbs per page", desc: "Set thumbs count to show per page, if it set 0 will be showing all items" },	
			show_pagination: { group: "basic", type: "bool",name: "Show/hide Pagination", desc: "Hide or show pagination in your skin" },	
			
			lightbox: { group: "lightbox", type: "size", name: "Lightbox Size", desc: "Size of the lightbox window" },
			lightbox_theme: { group: "lightbox", name: "Lightbox Theme", type: "list", values: { light_rounded: "Light Rounded", dark_rounded: "Dark Rounded", light_square: "Light Square", dark_square: "Dark Square", facebook: "Facebook" }, desc: "Select a theme for the lightbox" },
			lightbox_text: { group: "lightbox", type: "list", values: { none: "none", title: "title", description: "description", "title and description": "title and description" }, name: "Lightbox Text", desc: "Customize the text below the item" },

			item_click: { group: 'itemaction', type: 'list', values: { lightbox: 'Show items in lightbox', related_url: 'Open item\'s related link', fixed_url: 'Open default URL', none: 'Do nothing' }, name: 'On item click', desc: "An action to be executed on item click.<br><b>Lightbox</b> - Open the item in a lightbox window<br><b>Related links</b> - Click on the item will redirect the user to a URL defined by the 'Text & reorder' menu.<br><b>Fix URL</b> - Click on an item will open a fix URL.<br><b>None</b> - Do nothing on click." },
			fixed_url: { group: 'itemaction', type: 'text', name: 'Default URL', desc: "The fixed link to be opened if the corresponding action is choosen on the item click." },
			open_in_new_window: { group: 'itemaction', type: 'bool', name: 'Open in new window', desc: 'Open the related or fixed link in a new window.' }

		};

		this.arg_defaults = {
			thumb_w: 100,
			thumb_h: 75,
			lightbox_w: 600,
			lightbox_h: 450,
			lightbox_theme: "light_rounded",
			thumb_aspect: "maintain",
			tooltip: "title and description",
			lightbox_text: "title and description",
			img_thumb: "img/imagelist.gif",
			add_text: "none",
			item_click: "lightbox",
			video_thumb: "no",
			per_page: "0"
		};

		this.init = function(go) {

			var self = this;
			this.go = go;
			this.arg_groups = this.go.merge_json(this.arg_groups, this.go.arg_misc_group);
			this.arg_map = this.go.merge_json(this.arg_map, this.go.arg_misc);
			this.go.loadArgs();

			this.go.loadSkinCSS("lightbox/prettyPhoto.css");
			//this.addskinCSS("http://harutyunyandeveloper.github.com/davit.github.com/stylesheets/prettyPhoto.css");
			var jss = ["flowplayer/flowplayer-3.1.4.min.js", "lightbox/zequery.js", "lightbox/jquery.prettyPhoto.js"];
			this.go.loadSkinJSSequence(jss, function() {
				zeQuery.noConflict();
				self.isready++;
				if (self.isready == 2)
					self.start();
					self.attachPaginationEvents();
			}); 
			this.loadItems();
		}
		this.addskinCSS = function(url){
			var fileref=document.createElement("link")
			fileref.setAttribute("rel", "stylesheet")
			fileref.setAttribute("type", "text/css")
			fileref.setAttribute("href", url);
			document.getElementsByTagName("head")[0].appendChild(fileref)
		}
		this.attachPaginationEvents = function(){
			var that = this;
			var id = that.go.loaderParams["_object"];
			var string = "#pagination_"+id;
			zeQuery(string+" li a").live('click',function(){
				var page = zeQuery(this).attr('data-rel');
				that.start(parseInt(page-1)*that.go.args.per_page);
			});				
		}
		this.loadItems = function() {
			var load_thumb = this.go.namedSize(this.go.args.thumb_w, this.go.args.thumb_h);
			var load_content = this.go.namedSize(this.go.args.lightbox_w, this.go.args.lightbox_h);

			if (this.go.isIOS() || this.go.isAndroid())
				load_content = "original,v:mp4_hd,a:mp3,p:" + load_content;
			else
				load_content = "original,v:flv_lowhd,a:mp3,p:" + load_content;

			this.go.getMediaJSON({
				thumb: load_thumb,
				content: load_content,
				details: "all"
			});
		};

		this.onEditPanelChange = function(what) {
			var hardrefresh = false;
			var hard_args = 'thumb_w thumb_h items'.split(' ');

			for (var i = 0; i < hard_args.length; i++) {
				if (what.indexOf(hard_args[i]) >= 0) {
					hardrefresh = true;
					break;
				}
			}

			if (hardrefresh) {
				this.isready = 1;
				this.loadItems();
			}
			else {
				this.start();
			}
		};

		this.onMediaJSON = function(json) {

			_trace("onMediaJSON, ready: " + this.isready);

			this.go.MediaJSON = json;

			this.isready++;
			if (this.isready == 2)
				this.start();

		};

		this.start = function(startFrom) {
			_trace("starting...");
			
			var id = this.go.loaderParams["_object"];
			var items = this.go.MediaJSON;

			var thumbStyle = "width:" + this.go.args.thumb_w + "px;height:" + this.go.args.thumb_h + "px;";
			var divItemStyle = thumbStyle;
			var htm = "";

			var width = this.go.args.widget_w;
			if (width) {
				if (Number(width) == width) width += 'px';
				width = "width:" + width + ";";
			} else {
				height = '';
			}

			var height = this.go.args.widget_h;
			if (height) {
				if (Number(height) == height) height += 'px';
				height = "height:" + height + ";";
			} else {
				height = '';
			}

			htm += this.go.getCSSCode("main");

			htm += '<ul class="ze_imagelist" style="' + width + height + '" id="slideshow' + id + '">';

			var widget_ratio = this.go.args.thumb_w / this.go.args.thumb_h;
			
			var items_count;
			if(this.go.args.per_page == '0'){
				items_count = items.items.length;
			}else{
				items_count  = parseInt(this.go.args.per_page);
			}	
			if(typeof startFrom == 'undefined') {
				startFrom = 0;
			}
			for (var i = 0; i < items.items.length; i++) {
				if(typeof items.items[i] == 'undefined') break;
				var imgstyle = thumbStyle;
				var item = items.items[i];

				if (this.go.args.thumb_aspect == "maintain") {
					var ratio = eval(items.items[i]['aspect_ratio']);

					if (typeof ratio == "undefined")
						ratio = 1.33;

					if (widget_ratio > ratio)
						imgstyle = "height:" + this.go.args.thumb_h + "px;";
					else
						imgstyle = "width:" + this.go.args.thumb_w + "px;";
				}
				else if (this.go.args.thumb_aspect == "full_size")
					imgstyle = thumbStyle
				else if (this.go.args.thumb_aspect == "override_css")
					imgstyle = "";

				var type = "unknown";
				if (items.items[i]['content_type'].indexOf('video/') > -1)
					type = "video";
				else if (items.items[i]['content_type'].indexOf('audio/') > -1)
					type = "audio";
				else if (items.items[i]['content_type'].indexOf('image/') > -1)
					type = "image";

				htm += "<li class='ze_thumb ze_type_" + type + " ze_item_number_" + (i + 1) + "'>";

				var title = " ";
				if (this.go.args.tooltip == "title and description")
					title = item.title + "&#10;" + item.description;
				else if (this.go.args.tooltip == "title")
					title = items.items[i]['title'];
				else if (this.go.args.tooltip == "description")
					title = items.items[i]['description'];

				title = title.replace(/<br>/g, "\r\n").replace(/<br \/>/g, "\r\n");

				var lightbox_text = "";
				if (this.go.args.lightbox_text == "title and description")
					lightbox_text = item.title + "<br />" + item.description;
				else if (this.go.args.lightbox_text == "title")
					lightbox_text = items.items[i]['title'];
				else if (this.go.args.lightbox_text == "description")
					lightbox_text = items.items[i]['description'];

				lightbox_text = lightbox_text.replace(/'/g, "");

				var related_url = items.items[i]['related_link_url'];
				if (related_url == undefined || related_url == "")
					related_url = this.go.args.fixed_url;

				var link = (this.go.args.item_click == "related_url") ? related_url : items.items[i]['content_url'];
				if (type == "video")
					link = (this.go.args.item_click == "related_url") ? related_url : "#?custom=true&width=600&height=450&callback_cookie=" + id + "," + i;
				else if (type == "audio")
					link = (this.go.args.item_click == "related_url") ? related_url : "#?custom=true&width=600&height=300&callback_cookie=" + id + "," + i;
				else if (type == "unknown")
					link = (this.go.args.item_click == "related_url") ? related_url : "#?custom=true&width=600&height=30&callback_cookie=" + id + "," + i;

				var add_text = "";
				if (this.go.args.add_text == "title and description")
					add_text = item.title + "&#10;" + item.description;
				else if (this.go.args.add_text == "title")
					add_text = items.items[i]['title'];
				else if (this.go.args.add_text == "description")
					add_text = items.items[i]['description'];
				var show_style = '';
				if(i<startFrom || i >= startFrom+items_count){
					show_style = 'display:none';
				}
				htm += "<a class='ze_box' rel='prettyPhoto[" + id + "]' href='" + link + "' title='" + lightbox_text + "' style='" + thumbStyle + show_style+"' >";
				htm += "	<div class='ze_overlay'></div>";
				htm += "	<div id='" + id + "_" + i + "_thumbsplash' class='ze_item' style='" + divItemStyle + "'>";
				htm += "		<img class='ze_postar' style='" + imgstyle + "' src='" + items.items[i]["thumbnail_url"] + "' title='" + title + "' />";
				htm += "	</div>";
				htm += "	<div class='ze_title'>" + add_text + "</div>";
				htm += "</a></li>";
			}
			htm += "</ul>";
			if(items.items.length > items_count && this.go.args.show_pagination){
				htm += this.createPagination(items_count);
			}
			
			this.go.setGalleryHTML(htm);
			
			var thethis = this;
			var isScrolledIntoView = function(elem) {
				var docViewTop = zeQuery(window).scrollTop();
				var docViewBottom = docViewTop + zeQuery(window).height();

				var elemTop = zeQuery(elem).offset().top;
				var elemBottom = elemTop + zeQuery(elem).height();

				// partially visible
				return !((elemTop < docViewTop && elemBottom < docViewTop) || (elemBottom > docViewBottom && elemTop > docViewBottom));

				// completely visible
				//return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
			}

			if (this.go.args.video_thumb != "no") {
				for (var item_id = 0; item_id < items.items.length; item_id++) {
					if (items.items[item_id]['content_type'].indexOf('video/') > -1) {
						zeQuery("#" + id + "_" + item_id + "_thumbsplash").addClass("ze_video_thumb");
						zeQuery("#" + id + "_" + item_id + "_thumbsplash").bind("load-video", function() {
							var tmp_item_id = zeQuery(this).attr('id').replace(id + "_", "").replace("_thumbsplash", "");
							thethis.loadandplaythumbvideo(id + "_" + tmp_item_id + "_thumbsplash", items.items[tmp_item_id]['content_url'], thethis.go.args.thumb_w, thethis.go.args.thumb_h)
						});

						zeQuery("#" + id + "_" + item_id + "_thumbsplash").bind("unload-video", function() {
							zeQuery(this).html(zeQuery(this).find(".restore").html());
						});

						//this.loadandplaythumbvideo(id + "_" + item_id + "_thumbsplash", items.items[item_id]['content_url'], this.go.args.thumb_w, this.go.args.thumb_h);
					}
				}
			}

			var showhide_videothumbs = function() {
				zeQuery(".ze_video_thumb").each(function(idx, ele) {
					var is_visible = isScrolledIntoView(ele);
					if (is_visible && zeQuery(this).find(".restore").length == 0)
						zeQuery(ele).trigger("load-video");
					else if (!is_visible && zeQuery(this).find(".restore").length > 0)
						zeQuery(ele).trigger("unload-video");
				});
			}

			zeQuery(document).ready(function() {
				zeQuery(window).scroll(showhide_videothumbs);
				zeQuery(window).resize(showhide_videothumbs);
				showhide_videothumbs();
			});

			var pretty_photo = {
				animation_speed: 'fast', /* fast/slow/normal */
				slideshow: false, /* false OR interval time in ms */
				autoplay_slideshow: false, /* true/false */
				opacity: 0.80, /* Value between 0 and 1 */
				show_title: true, /* true/false */
				allow_resize: false, /* Resize the photos bigger than viewport. true/false */
				fit_default_dim: true, /* by Cincopa fit img to the default_width x default_height. true/false */
				default_width: this.go.args.lightbox_w,
				default_height: this.go.args.lightbox_h,
				counter_separator_label: '/', /* The separator for the gallery counter 1 "of" 2 */
				theme: this.go.args.lightbox_theme, /* light_rounded / dark_rounded / light_square / dark_square / facebook */
				hideflash: false, /* Hides all the flash object on a page, set to TRUE if flash appears over prettyPhoto */
				wmode: 'opaque', /* Set the flash wmode attribute */
				autoplay: true, /* Automatically start videos: True/False */
				modal: false, /* If set to true, only the close button will close the window */
				overlay_gallery: false, /* If set to true, a gallery will overlay the fullscreen image on mouse over */
				keyboard_shortcuts: true, /* Set to false if you open forms inside prettyPhoto */
				changepicturecallback: function(cookie) {

					if (typeof cookie != "undefined" && cookie != "") {

						if (items.items[cookie.split(',')[1]]['content_type'].indexOf('video/') > -1) {
							if (thethis.go.isFlash(9))
								thethis.loadandplayvideo("ze_canvas_" + id, items.items[cookie.split(',')[1]]['content_url']);
							else if (thethis.go.isIOS()) {

								var cont_url = items.items[cookie.split(',')[1]]['content_url'];
								//					        cont_url = cont_url.replace(".flv?", ".mp4?").replace("&amp;p=y", "") + "&amp;t=y";
								var htm = "<embed href='" + cont_url + "&range=yes' width='600' height='450' type='video/x-m4v' target='myself' scale='1'></embed>";
								getElement("ze_canvas_" + id).innerHTML = htm;

							}
							else {

								var cont_url = items.items[cookie.split(',')[1]]['content_url'];
								//					        cont_url = cont_url.replace(".flv?", ".mp4?").replace("&amp;p=y", "") + "&amp;t=y";

								window.open(cont_url, "_blank");
							}

						}
						else if (items.items[cookie.split(',')[1]]['content_type'].indexOf('audio/') > -1) {
							if (thethis.go.isFlash(9))
								thethis.loadandplayaudio("ze_canvas_" + id, items.items[cookie.split(',')[1]]['content_url']);
							else if (thethis.go.isIOS()) {
								var cont_url = items.items[cookie.split(',')[1]]['content_url'];
								var htm = "<embed href='" + cont_url + "&range=yes' width='600' height='450' type='video/x-m4v' target='myself' scale='1'></embed>";
								getElement("ze_canvas_" + id).innerHTML = htm;
							}
							else {
								var cont_url = items.items[cookie.split(',')[1]]['content_url'];
								cont_url = cont_url.replace(".flv?", ".mp4?").replace("&amp;p=y", "") + "&amp;t=y";

								window.open(cont_url, "_blank");
							}
						}
						else if (items.items[cookie.split(',')[1]]['content_type'].indexOf('unknown') > -1) {
							var cont_url = items.items[cookie.split(',')[1]]['content_url'] + "&m=y"; // Content-disposition : attachment
							var ze = getElement("ze_canvas_" + id);
							ze.innerHTML = "Click to <a style='width:600px;height:100px;' href='" + cont_url + "' style='ze_type_unknown_download_link' target=_blank>download</a> the file.";
						}
					}


				}, /* Called everytime an item is shown/changed */
				callback: function() { }, /* Called when prettyPhoto is closed */
				markup: __pretty_markup,
				gallery_markup: __pretty_gallery_markup,
				image_markup: '<img id="fullResImage" src="" />',
				flash_markup: '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" width="{width}" height="{height}"><param name="wmode" value="{wmode}" /><param name="allowfullscreen" value="true" /><param name="allowscriptaccess" value="always" /><param name="movie" value="{path}" /><embed src="{path}" type="application/x-shockwave-flash" allowfullscreen="true" allowscriptaccess="always" width="{width}" height="{height}" wmode="{wmode}"></embed></object>',
				quicktime_markup: '<object classid="clsid:02BF25D5-8C17-4B23-BC80-D3488ABDDC6B" codebase="http://www.apple.com/qtactivex/qtplugin.cab" height="{height}" width="{width}"><param name="src" value="{path}"><param name="autoplay" value="{autoplay}"><param name="type" value="video/quicktime"><embed src="{path}" height="{height}" width="{width}" autoplay="{autoplay}" type="video/quicktime" pluginspage="http://www.apple.com/quicktime/download/"></embed></object>',
				iframe_markup: '<iframe src ="{path}" width="{width}" height="{height}" frameborder="no"></iframe>',
				inline_markup: '<div class="pp_inline clearfix">{content}</div>',
				custom_markup: '<div id="ze_canvas_' + id + '" style="width:{width}px; height:{height}px"></div>'
			};

			if (this.go.args.item_click == "lightbox")
				zeQuery("a[rel^='prettyPhoto[" + id + "]']").prettyPhoto(pretty_photo);
			else if (this.go.args.item_click == "none")
				zeQuery("a[rel^='prettyPhoto[" + id + "]']").attr("href", "javascript:void(0)").css({ cursor: 'default' });
			else if (this.go.args.item_click == "fixed_url")
				zeQuery("a[rel^='prettyPhoto[" + id + "]']").attr("href", this.go.args.fixed_url).attr("target", this.go.args.open_in_new_window ? "_blank" : "_self");
			else if (this.go.args.item_click == "related_url")
				zeQuery("a[rel^='prettyPhoto[" + id + "]']").attr("target", this.go.args.open_in_new_window ? "_blank" : "_self");

		};
		this.createPagination = function(count){
			var that = this;
			var all_count  = this.go.MediaJSON.items.length;
			var page_count = Math.ceil(all_count / count);
			var id = this.go.loaderParams["_object"];
			var html = "<ul class='pagination' id='pagination_"+id+"'>";
			for(i=1;i<=page_count;i++){
				html +="<li><a href='javascript:void(0)' data-rel='"+i+"'>"+i+"</a></li>";
			}
			html += "</ul>";
			
			
			return html;
			
		}
		this.loadandplaythumbvideo = function(objID, content_url, playerWidth, playerHeight) {

			if (!this.go.isFlash(9))
				return;

			var obj = getElement(objID);

			var skin_url = this.go.skinPath + "flowplayer3.2.7/";

			var playlist_arr = [];

			content_url = content_url.replace(/&amp;/g, '&');
			if (content_url.indexOf('?') != -1)
				content_url += '&fakelastparam=ffffff';

			playlist_arr[0] = {
				url: escapeQueryString(content_url),
				autoPlay: true
			};

			playlist_arr[0].provider = "pseudostreaming";

			obj.style.width = playerWidth + "px";
			obj.style.height = playerHeight + "px";

			var htm = '<a href="#" id="' + objID + '_innersplash" style="width:100%;height:100%;"></a>';
			htm += '<div style="position:relative;top:-' + playerHeight + 'px;width:' + playerWidth + 'px;height:' + playerHeight + 'px"></div>';
			htm += '<div class="restore" style="">' + obj.innerHTML + '</div>';
			obj.innerHTML = htm;

			var playername = "flowplayer.commercial-3.2.7.swf";
			var fp = $f(objID + "_innersplash", { src: skin_url + playername}, {
				clip: {
					autoBuffering: false,
					scaling: "scale", // scale. fit
					onBufferEmpty: function(clip) {
						this.seek(Math.floor(this.getTime()));
					},
					onFinish: function() { //onFinish, onLastSecond
						this.play(0);
					}
				},
				canvas: {
					backgroundGradient: 'none'
				},
				playlist: playlist_arr,
				plugins: {
					controls: null,
					pseudostreaming: {
						url: skin_url + 'flowplayer.pseudostreaming-3.2.7.swf',
						queryString: escapeQueryString('&start=${start}')
					},
					audio: {
						url: skin_url + 'flowplayer.audio-3.2.2.swf'
					}
				},
				onLoad: function() {
					var video_thumb = self.go.args.video_thumb;
					if (video_thumb == "thumb_no_audio")
						this.setVolume(0);
					else if (video_thumb == "thumb_with_audio")
						this.setVolume(100);
				}
			});

			fp.play();
		};

		this.loadandplayvideo = function(objID, content_url) {
			var obj = getElement(objID);

			var skin_url = this.go.skinPath + "flowplayer3.2.7/";

			var controlsObj = { url: skin_url + 'flowplayer.controls-3.2.5.swf',
				playlist: true,
				autoHide: false,
				hideDelay: 400
			};


			var playerWidth = 600;
			var playerHeight = 450;

			var htm = '<div class="ze_videoplaylist">';

			// player
			htm += '<div class="ze_pl_player" style="width:' + playerWidth + 'px;height:'
				+ playerHeight + 'px;"><a href="#" id="' + objID + '_splash"></a></div>';

			var playlist_arr = [];

			content_url = content_url.replace(/&amp;/g, '&');
			if (content_url.indexOf('?') != -1)
				content_url += '&fakelastparam=ffffff';

			playlist_arr[0] = {
				url: escapeQueryString(content_url),
				autoPlay: true
			};

			playlist_arr[0].provider = "pseudostreaming";

			// end playlist
			htm += '</div>';

			// end skin
			htm += '</div><p style="clear:both;"></p>';

			obj.style.width = "600px";
			obj.style.height = "450px";
			obj.innerHTML = htm;

			var playername = "flowplayer.commercial-3.2.7.swf";
			if (navigator.appVersion.match(/Android/)) {
				playername = "flowplayer-3.2.7.swf";
				controlsObj.autoHide = false;
			}

			var fp = $f(objID + "_splash", { src: skin_url + playername, cachebusting: navigator.appVersion.match(/MSIE/) != null }, {
				clip: {
					autoBuffering: false,
					scaling: "fit",
					onBufferEmpty: function(clip) {
						this.seek(Math.floor(this.getTime()));
					}
				},
				canvas: {
					backgroundGradient: 'none'
				},
				playlist: playlist_arr,
				plugins: {
					controls: controlsObj,
					pseudostreaming: {
						url: skin_url + 'flowplayer.pseudostreaming-3.2.7.swf',
						queryString: escapeQueryString('&start=${start}')
					},
					audio: {
						url: skin_url + 'flowplayer.audio-3.2.2.swf'
					}
				},
				onLoad: function() {
					this.setVolume(100);
				}
			});

			fp.play();
		};

		this.loadandplayaudio = function(objID, url) {
			var obj = getElement(objID);

			var skin_url = this.go.skinPath + "flowplayer/";

			//        if (url.indexOf(".m4a?o=0&") > -1)
			//	        url = url.replace(".m4a?o=0&", ".m4a.mp3?o=6&").replace("&t=y", "").replace("&p=y", "")+"&t=y";
			//        else if (url.indexOf(".wav?o=0&") > -1)
			//	        url = url.replace(".wav?o=0&", ".wav.mp3?o=6&").replace("&t=y", "").replace("&p=y", "")+"&t=y";

			url = escapeQueryString(url + "&ext=mp3");

			var htm = '<embed id=_flvobj src="' + skin_url + 'mp3player.swf" width="600" height="300" bgcolor="#C0C0C0" type="application/x-shockwave-flash" pluginspage="http://www.macromedia.com/go/getflashplayer" flashvars="file=' + url + '&showeq=true&showdigits=true&autostart=true&showfsbutton=false&fullscreenpage=http://www.ifunpix.com/fullscreen.html&linktarget=_Blank&repeat=false&lightcolor=0x9999FF&backcolor=0x888888&frontcolor=0x000000&enablejs=true&displayheight=120&thumbsinplaylist=false&height=250&width=300" />';

			obj.style.width = "600px";
			obj.style.height = "300px";
			obj.innerHTML = htm;
		};
	}
}

function escapeQueryString(str) {
	return str.replace(/&amp;/gi, '%26').replace(/\?/gi, '%3F').replace(/&/gi, '%26').replace(/=/gi, '%3D');
}
var __pretty_markup= '<div class="pp_pic_holder"> '+
					        '<div class="ppt">&nbsp;</div> '+
					        '<div class="pp_top"> '+
						        '<div class="pp_left"></div> '+
						        '<div class="pp_middle"></div> '+
						        '<div class="pp_right"></div> '+
					        '</div> '+
					       ' <div class="pp_content_container"> '+
						     '   <div class="pp_left"> '+
						      ' <div class="pp_right"> '+
							   '     <div class="pp_content"> '+
								'        <div class="pp_loaderIcon"></div> '+
								 '       <div class="pp_fade"> '+
								'	        <a href="#" class="pp_expand" title="Expand the image">Expand</a> '+
								'	        <div class="pp_hoverContainer"> '+
								'		        <a class="pp_next" href="#">next</a> '+
								'        <a class="pp_previous" href="#">previous</a> '+
								'	        </div> '+
								'	        <div id="pp_full_res"></div> '+
								'	        <div class="pp_details clearfix"> '+
								'		        <p class="pp_description"></p> '+
								'		        <a class="pp_close" href="#">Close</a> '+
								'		        <div class="pp_nav"> '+
								'			        <a href="#" class="pp_arrow_previous">Previous</a> '+
								'			        <p class="currentTextHolder">0/0</p> '+
								'			        <a href="#" class="pp_arrow_next">Next</a> '+
								'		        </div> '+
								'	        </div> '+
								 '       </div> '+
'							        </div> '+
'						        </div> '+
'						        </div> '+
'					        </div> '+
'					        <div class="pp_bottom"> '+
'						        <div class="pp_left"></div> '+
'						        <div class="pp_middle"></div> '+
'						        <div class="pp_right"></div> '+
'					        </div> '+
'				        </div> '+
'				        <div class="pp_overlay"></div>';
var __pretty_gallery_markup='<div class="pp_gallery"> '+
'							        <a href="#" class="pp_arrow_previous">Previous</a> '+
'							        <ul> '+
'								        {gallery} '+
'							        </ul> '+
'							        <a href="#" class="pp_arrow_next">Next</a> '+
'						        </div>';
/*
var __pretty_markup= '<div class="pp_pic_holder"> \
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
				        <div class="pp_overlay"></div>';
var __pretty_gallery_markup='<div class="pp_gallery"> \
							        <a href="#" class="pp_arrow_previous">Previous</a> \
							        <ul> \
								        {gallery} \
							        </ul> \
							        <a href="#" class="pp_arrow_next">Next</a> \
						        </div>';
*/						        
