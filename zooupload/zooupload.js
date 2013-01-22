(function(){
	
	var _AJAX='//www.zooeffect.com/runtime/';
	_HOST = '//www.zooeffect.com';
	var useFlash = uploaderType();
	var changes = false;        
	var cssArray = new Array();
	var startUpload = true;
	var internetExp = false;
	var uploadsArray = new Array();
	cssArray.push('wizard_upload.css');
	cssArray.push('http://harutyunyandeveloper.github.com/davit.github.com/zooupload/zooupload.css');
	cssArray.push(_HOST+'/design/js/swfupload/default.css');
	
	for (var i=0;i<cssArray.length;i++){
		loadjscssfile(cssArray[i],'css');
	};
	
	loadScript(
		_HOST+'/design/js/jquery-1.2.6.pack.js',
		_HOST+'/design/js/common.js?ts=323232',
		_HOST+'/design/js/swfupload/swfupload.js',
		_HOST+'/design/js/swfupload/swfupload.queue.js',
		_HOST+'/design/js/swfupload/fileprogress.js',
		_HOST+'/design/js/swfupload/handlers.js',
		_HOST+'/design/js/jquery-1.4.2.min.js',
		_HOST+'/design/js/jquery-ui-1.8.6.custom.min.js',		
		function(){
			init()
		});
		
	var go ={};

	function init(){
		
		var _zel = _zel || [];
		_zel.push(zeo);
		
		go = new GalleryObject(_zel[0]);
		zeGalleryArray[_zel[0]["_object"]] = go;
		
		function GalleryObject(params)
		{
			// array of 
			if (typeof zeGalleryArray == "undefined")
				zeGalleryArray = new Array();

			var self=this;
			this.loaderParams = params;
			this.fid=params['_gid'];
			
			var wrapper = document.getElementById(this.loaderParams['_object']);
			
			this.initUpload = function ()
			{
				trace("GalleryObject - " + this.loaderParams["_object"] + " - " + this.loaderParams["_gid"]);
				if(!useFlash){
					upload = new DragAndDropUpload($(document)[0],this.loaderParams["_upload_url"]);
				}else{
					if (typeof(upload1)=='undefined'){
						upload1 = new SWFUpload({
						// Backend Settings
						upload_url: this.loaderParams["_upload_url"],
			//				post_params: {"PHPSESSID" : "o72evcuhua36n896a9ls7oa9e5"},

						// File Upload Settings
						//file_size_limit : "102400",	// in kb
						file_types : "*.*",
						file_types_description : "All Files",
						file_upload_limit : "50",
						file_queue_limit : "0",

						// Event Handler Settings (all my handlers are in the Handler.js file)
						file_dialog_start_handler : fileDialogStart,
						file_queued_handler : fileQueued,
						file_queue_error_handler : fileQueueError,
						file_dialog_complete_handler : fileDialogComplete,
						upload_start_handler : uploadStart,
						upload_progress_handler : function uploadProgress(file, bytesLoaded, bytesTotal) {
													changes=true;
													$("#cancelAll").addClass('active');
													try {
														var percent = Math.ceil((bytesLoaded / bytesTotal) * 100);

														var progress = new FileProgress(file, this.customSettings.progressTarget);
														progress.setProgress(percent);
														progress.setStatus("Uploading...");
													} catch (ex) {
														this.debug(ex);
													}
												},
						upload_error_handler : uploadError,
						upload_success_handler : function uploadSuccess(file, serverData) {
													changes=false;
													go.update();
													try {
														var progress = new FileProgress(file, this.customSettings.progressTarget);
														progress.setComplete();
														progress.setStatus("Complete.");
														progress.toggleCancel(false);

													} catch (ex) {
														this.debug(ex);
													}
												},
						upload_complete_handler : function (file) {
													changes=false;
														try {
															/*  I want the next upload to continue automatically so I'll call startUpload here */

															if (this.getStats().files_queued === 0) {
																document.getElementById(this.customSettings.cancelButtonId).disabled = true;
															} else {	
																this.startUpload();
															}
														} catch (ex) {
															this.debug(ex);
														}

													},
						queue_complete_handler : function(){
							$("#cancelAll").removeClass('active');
							changes = false;
						},							
						// Button Settings
						button_image_url : _HOST+"/design/images/upload.png",
						//button_image_url : _HOST+"/design/js/swfupload/XPButtonUploadText_61x22.png",
						button_placeholder_id : "spanButtonPlaceholder1",
						button_text: '<span class="theFont">Upload</span>',
						button_text_style: ".theFont { color: #666666; font-size: 13; font-family:Arial,sans-serif; margin-left:15px;}",
						button_width: 60,
						button_height: 19,
						button_cursor: SWFUpload.CURSOR.HAND,
						// Flash Settings
						flash_url : _HOST+"/design/js/swfupload/swfupload.swf",
						

						custom_settings : {
							progressTarget : "uploadProgress",//"fsUploadProgress1",
							cancelButtonId : "btnCancel1"
						},
						
						// Debug Settings
						debug: false
						});
						
						jQuery('#btnCancel1').click(function(){
							changes = false;
							cancelQueue(upload1);
						})
					}
				} 
			};
						
			this.setToolbar = function(){
				var htm='';
				//htm+='<div id="container" class="container">';
				//htm+='	<div class="content-container clearfix">';
				//<a class="editor-btn" id="_addmoreitems" href="javascript:void(0)" style="display:none">Upload</a>';
				if(useFlash){
					htm+='			<div class="editor-btn flashBtn" >';
					htm+='				<span id="spanButtonPlaceholder1"></span>';
					htm+='				<input id="btnCancel1" type="button" value="Cancel Uploads" disabled="disabled" style="margin-left: 2px; height: 22px; font-size: 8pt; display:none" />';
					htm+='			</div>';
				}else{
					htm+='		<div class="editor-btn fileSelect">';
					htm+='		<span>Upload</span>';
					htm+='			<input class="selectFile" name="selectFile" type="file" multiple="multiple" title="Click this button to open a dialog box" />';
					htm+='		</div>';
					
				}
				htm+='		<a href="javascript:void(0)" id="cancelAll">Cancel Upload</a>';
				htm+='		<a class="editor-btn" id="_detailedview" href="javascript:void(0)" style="display:none">Detailed View</a>';
				htm+='		<a class="editor-btn" id="_gridview" href="javascript:void(0)" style="display:none">Grid View</a>';
				htm+='		<a class="editor-btn" id="_changethumbsize" href="javascript:void(0)" style="display:none">Toggle Size</a>';
				htm+='		<div class="clear"></div>';
				htm+='		<div id="uploadProgress"></div>';
				htm+='		<div id="gridItems" class="items-grid">';
				htm+='		</div>';
				//htm+='	</div>';
				//htm+='</div>';
				$(wrapper).html(htm);
				$(".fileSelect").mousemove(function(e){
					varL = 5; varR = 10;
					offL = $(this).offset().left;
					offT = $(this).offset().top;
					width= $(this).find("input").width();
					$(this).find("input").css({
						left:e.pageX-offL-width+varL,
						top:e.pageY-offT-varR
					});
					$('#upload_tool_tip').show();
				});
				$(".fileSelect").mouseout(function(e){
					$('#upload_tool_tip').hide();
				});
				$('#cancelAll').bind('click', function(){
					cancelAllUploads();
				});				
				$('#_addmoreitems').click(function(){
					toggelupload();
				})
				$('#_detailedview').click(function(){
					$('.item-data').css('display', 'block');
				})
				$('#_gridview').click(function(){
					$('.item-data').css('display', 'none');
				})
				$("#_changethumbsize").click(function(){
					$('#gridItems').toggleClass('smallThumb');
				})
				
			};
			
			this.setGrid = function(curent){
				var htm='';
				htm+='<div class="item-block" id="id_'+curent.id+'">';
				htm+='	<div class="item-thumb">';
				htm+='		<a style="background-image:url(\''+curent['thumbnail_url']+'\');background-size:cover;" href="javascript:void(0)" ></a>';
				htm+='	</div>  ';
				htm+='	<div class="item-data">';
				htm+='		<table cellpadding="0" cellspacing="0" >';
				htm+='			<tr>';
				htm+='				<th scope="row">Title:</th>';
				htm+='				<td>';
				htm+='					<input id="__caption'+curent['id']+'" name="_ctl0:ContentPlaceHolder1:_pics:_ctl1:_description" rows="4" style="width:300px;" type="text" value="'+curent['title']+'" class="preventDragDrop"/>';
				htm+='				</td>';
				htm+='			</tr>';
				htm+='				<th scope="row">description:</th>';
				htm+='				<td>';
				htm+='					<textarea id="__description'+curent['id']+'" name="_ctl0:ContentPlaceHolder1:_pics:_ctl1:_description" rows="4"  style="width:300px;" class="preventDragDrop">'+curent['description']+'</textarea>';
				htm+='				</td>';
				htm+='			</tr>';
				htm+='		</table>';
				htm+='	</div>';
				htm+='	<div class="void clear"></div> ';
				htm+='	<div id="delete-btn'+curent['id']+'" class="preventDragDrop"><a href="javascript:void(0)" >Delete item</a></div>';
				htm+='</div>';
				
				$('#gridItems').append(htm);
				var deleteId='#delete-btn'+curent['id'];
				var descId='#__description'+curent['id'];
				var captionId = '#__caption'+curent['id'];
				$(deleteId).click(function(){
							if(confirm('Are you sure to delete this item?'))
							query('items_edit_test.aspx',{
									cmd:'deleteitem',
									rid:curent['id']
									},function(){
										getElement("id_"+curent['id']).style.visibility = "hidden";
										self.update();
										return;
									})
						});
				$(descId+","+captionId).blur(function(e){
						var desc = $(descId).val();
						var capt = 	$(captionId).val();
							var params={
									cmd:'update',
									rid:curent['id'],
									description:desc,
									caption: capt,
								};
							query('items_edit_test.aspx',params,function(){
											/*if(r.error){
												alert(r.error);
												return;
											}
											if(callback) callback();
											*/
										});
							})
			}
			
			function _trace(msg){
				return trace('GO [ '+self.loaderParams._object+' ] : '+msg);
			}
			
			_trace('loading');
			
			this.setToolbar();
			
			this.getMediaJSON = function(par)
			{
				var jsonlink = _AJAX + "json.aspx";
				if (this.loaderParams["_feedurl"])
					jsonlink = this.loaderParams["_feedurl"];
				jsonlink += "?callback=zeOnMediaJSON";
				jsonlink += "&wid=" + this.loaderParams["_object"];
				jsonlink += "&fid="+this.fid;
				jsonlink += "&thumb="+par.thumb;
				jsonlink += "&content="+par.content;
				jsonlink += "&rnd="+Math.random();

				if (par.details)
					jsonlink += "&details=" + par.details;
				
				if (this.loaderParams["_feedparams"])
					jsonlink += this.loaderParams["_feedparams"];

				loadjscssfile(jsonlink, "js");
			}
			
			zeOnMediaJSON = function(wid,json)
			{
				trace('loading...');
				if (json.errorcode)
				{
					this.setGalleryHTML("<b>" + json.errormessage + "</b>");
					_trace("json error - " + json.errormessage);
					return;
				}
				onMediaJSON(json);
			}
							
			onMediaJSON=function(json){
				_trace("onMediaJSON, ready: 0");		

				var items = json;
				_trace("starting...");
				
				if ($('.item-data').css('display') == 'block'){
					$('#gridItems').html('');
					for(var i=0; i<items.items.length; i++){
						go.setGrid(items.items[i]);
					};
					$('.item-data').css('display', 'block') ;
				}else{
					$('#gridItems').html('');
					for(var i=0; i<items.items.length; i++){
						go.setGrid(items.items[i]);
					};
				}
				if (items.items.length==0){
					getElement('fragment-1').style.display = 'block'; $('.editor-btn').css({'display':'none'})
				}else{
					 $('.editor-btn').css({'display':'inline-block'})
				}
				jQuery('.items-grid .preventDragDrop').bind('touchstart touchmove touchend touchcancel',function(){
					event.stopPropagation();
				
				});
				jQuery('.items-grid').bind('scroll',function(){
					event.stopPropagation();				
				});
				jQuery('.items-grid').sortable({ stop: updateOrder }).each(function(i,el){
                        $(el).bind('touchstart touchmove touchend touchcancel',function(){ 
							handleTouch(event);
						});
                });
			
				self.initUpload();
	
			};
						
			this.getMediaJSON({
					thumb: 'medium',
					content: 'large',
			});
			this.update=function(){
				self.getMediaJSON({
					thumb: 'medium',
					content: 'large'
				});
			}
			
		}
		
		window.onbeforeunload = function()
		{
            if (changes)
            {
                var message = "Are you sure you want to navigate away from this page?\n\nYou are still uploading files, please wait for it to finish.\n\nPress OK to continue or Cancel to stay on the current page.";
                //if (confirm(message)) return true;
				return message;
                //else return false;
            }
        }
		
	}
	
	function updateOrder() {
		var order = $('.items-grid').sortable('serialize');
		order = order.replace(/id\[\]=/g, "").replace(/&/g, ",");
		query('items_edit_test.aspx',{
					cmd:'reorder',
					list:order
				},function(r){
					
					//console.dir(r);
				});
	}
		
	function toggelupload()
	{	
		var fragmentName = 'fragment-2';
		if(useFlash) fragmentName = 'fragment-1';
		
		getElement(fragmentName).style.display = (getElement(fragmentName).style.display == 'block' ? 'none' : 'block');
			
	}
	function cancelAllUploads(){
				if(!changes) return false;
				if(typeof upload1 != "undefined"){
					cancelQueue(upload1);
				}else{
					if(uploadsArray.length >0){
						uploadsArray[0].xhr.abort();
						var count = uploadsArray.length;
						for(i=1; i < count; i++){
							xmlhttp = uploadsArray[i].xhr;
							xmlhttp.send();
							if(internetExp){			
								xmlhttp.onreadystatechange = function(){
									this.abort();
								} 
							}else{
								xmlhttp.abort();
							}		
						}
					}
				}
				startUpload = true;	
				uploadsArray = new Array();
				changes = false;
				$("#cancelAll").removeClass('active');
			}
	
	function query(op,params,callback){
		if(typeof params=='function'){
			callback=params;
			params={};
		}
		params.fid = go.loaderParams["_gid"];
		params.logged_user_cred = go.loaderParams["_user_cred"];
		//+'?fid='+go.loaderParams._gid+'&logged_user_cred='+args.logged_user_cred
		$.ajax({
			url:_AJAX + op,
			data:params,
			success:function(r){
				callback(jQuery.parseJSON(r));
			}
		});
	}
	
	function loadjscssfile (filename, filetype, where, onloadfunc)
	{
		var fileref;
		trace('loading '+filename+'...');
		
		if (filetype=="js"){ //if filename is a external JavaScript file
			fileref=document.createElement("script");
			fileref.setAttribute("type","text/javascript");
			var fp=filename;
			if(navigator.appVersion.match(/MSIE (8|7)/)){
				fp+=(fp.match(/\?/)?'&':'?')+Math.random();
			}
			fileref.setAttribute("src",fp);
			
			if (typeof onloadfunc!="undefined")
			{
				if (fileref.addEventListener)
				{
					fileref.addEventListener( "load", onloadfunc, false );
					fileref.addEventListener( "error", function() { alert("js load error: "+filename); }, false );
				}
				else if (fileref.attachEvent)
				{
					//load event doesnt fired in IE8-
					if(navigator.appVersion.match(/MSIE 8/)!=null||navigator.appVersion.match(/MSIE 7/)!=null){
						fileref.attachEvent('onreadystatechange',function(){
							if(fileref.readyState=='loaded'){
								onloadfunc();
							}
						});	
					}else{
						fileref.attachEvent( "onload", onloadfunc);
					}
					fileref.attachEvent( "onerror", function() { alert("js load error: "+filename); } );
				}
			}
		}
		else if (filetype=="css"){ //if filename is an external CSS file
			fileref=document.createElement("link");
			fileref.setAttribute("rel", "stylesheet");
			fileref.setAttribute("type", "text/css");
			fileref.setAttribute("href", filename);
		}
		if (typeof fileref!="undefined"){
			if (where=="head"){
				//document.getElementsByTagName("head")[0].appendChild(fileref);
				jQuery('head')[0].appendChild(fileref);	
			}
			else{
				//document.getElementsByTagName("body")[0].appendChild(fileref);
				jQuery('body')[0].appendChild(fileref);
			}
		}
	}

	function trace(msg)
	{
		if(!window.console) return;
		try{
			if(typeof msg=='object'){
				console.dir(msg);
			}else{
				console.log(msg);
			}
		}catch(e){
			
		}
	}
		
	function loadScript()
	{
		var self=this;
		var scripts=[];
		var callback=null;
		for(var i=0;i<arguments.length;i++){
			var v=arguments[i];
			switch(typeof v){
				case 'string':
					scripts.push(v);
					break;
				case 'function':
					callback=v;
					break;
			}
			if(v instanceof Array){
				for(var n=0;n<v.length;n++){
					scripts.push(v[n]);
				}
			}
		}
		
		if(scripts.length==0){
			if(callback) callback();
			return;
		}
		
		var script=scripts.shift();    	    	
		
		loadjscssfile(script,'js','body',function(){
			trace("LOADED: "+script);
			loadScript(scripts,callback);	
		});
		
		return true;
	}
	
window.DragAndDropUpload = function(uploadDiv,uploadUrl) {
				// drag-and drop area
				this.uploadDiv = uploadDiv;
				this.uploadUrl = uploadUrl;
				this.files = [];
				this.init();
			};
DragAndDropUpload.prototype = {
				init: function() {
					var that = this;
					this.uploadDiv.ondragover = function(e) {
						e.stopPropagation();
						e.preventDefault();						
						return false;
					};
					this.uploadDiv.ondragleave = function(e) {
						e.stopPropagation();
						e.preventDefault();						
					};
					this.uploadDiv.ondrop = function(e) {
						e.preventDefault();
						document.getElementById('uploadProgress').style.dispaly='block';
						for (var i = 0; i < e.dataTransfer.files.length; i++) {
							that.uploadFile(e.dataTransfer.files[i]);
						}						
						if(startUpload){
							if( typeof uploadsArray[0] != 'undefined'){
								uploadsArray[0].xhr.send(uploadsArray[0].file);
								startUpload = false;
							}else{
								startUpload = true;											
								uploadsArray.shift();
							}
						}	
					};
					$(".selectFile").change( function(e){
						 var fileInput = this;
							if ('files' in fileInput) {
								//if(fileInput.files[0].name == '' && fileInput.files.length ==1)  return false;
										for (var i = 0; i < fileInput.files.length; i++) {
											that.uploadFile(fileInput.files[i]);
										}
								if(startUpload){
									if( typeof uploadsArray[0] != 'undefined'){
										uploadsArray[0].xhr.send(uploadsArray[0].file);
										startUpload = false;
									}else{
										startUpload = true;											
										uploadsArray.shift();
									}	
								}
								$("#btnCancel").attr('disabled',false);
							}
						$(".selectFile").val('');
					});
				},
				uploadFile: function(file) {
					var uploadUrl = this.uploadUrl;
					var uploadInfo = { file: file, uploadState: 'Pending', percentComplete: 0, index: this.files.length };
					var xhr = new XMLHttpRequest();
					var eventSource = xhr.upload || xhr;
					
					xhr.addEventListener("load", this.onUploadComplete(uploadInfo));
					xhr.addEventListener("error", this.onUploadError(uploadInfo));
					xhr.addEventListener("abort", this.onUploadAbort(uploadInfo));
					
					// changing Url  for preventing ajax call caching( Android , IOS 6)
					var ts = Date.now(), rquery = /\?/, rts = /([?&])_=[^&]*/,
					ret = uploadUrl.replace( rts, "$1_=" + ts );
					uploadUrl = ret + ( ( ret === uploadUrl ) ? ( rquery.test( uploadUrl ) ? "&" : "?" ) + "_=" + ts : "" );
					
					xhr.open('POST', encodeURI(uploadUrl), true);	
					eventSource.onprogress = this.onUploadProgress(uploadInfo);
					xhr.setRequestHeader("Content-Type", "multipart/form-data");
					xhr.setRequestHeader('X-FILE-NAME', file.name);										
					uploadInfo.xhr = xhr;					
					uploadsArray.push(uploadInfo);
					this.files.push(uploadInfo);
					this.updateProgress(uploadInfo);
				},
				onUploadProgress: function(uploadInfo) {	
					var that = this;
					changes=true;
					$("#cancelAll").addClass('active');
					return function(e) {
						//uploadInfo.percentComplete =  Math.round(e.loaded / e.total * 100) == 0 ? 1: Math.round(e.loaded / e.total * 99);
						var position = e.position || e.loaded;
						var total = e.totalSize || e.total;
						uploadInfo.percentComplete = (position / total)*99;
						uploadInfo.uploadState = 'Uploading';
						if( Math.round(uploadInfo.percentComplete) == 0 ){
							that.updateProgress(uploadInfo, true);
						}else{
							that.updateProgress(uploadInfo);
						}
					};
				},
				onUploadComplete: function(uploadInfo){
					var that = this;
					return function(e) {
						var id = uploadInfo.xhr.responseText.match(/id \d[0-9]*/);
						uploadsArray.shift();
						go.update();
						if(uploadsArray.length > 0){
							uploadsArray[0].xhr.send(uploadsArray[0].file);
						}else if( uploadsArray.length ==  0){
							that.onQueueComplete();
						}
						uploadInfo.uploadState = 'Complete';
						that.updateProgress(uploadInfo);
					};
				},
				onUploadError: function(uploadInfo) {
					var that = this;
					return function(e) {
						if(uploadInfo.index == uploadsArray[0].index){
							firstElement = true;							
						}else{
							firstElement = false;
						}						
						uploadsArray = $.grep(uploadsArray, function(e){ return e.index != uploadInfo.index; });
						if(uploadsArray.length > 0 && firstElement ){
							uploadsArray[0].xhr.send(uploadsArray[0].file);
						}else if( uploadsArray.length ==  0){
							that.onQueueComplete();
						}
						uploadInfo.uploadState = 'Error';
						that.updateProgress(uploadInfo);
					};
				},
				onUploadAbort: function(uploadInfo) {
					var that = this;
					return function(e) {
						uploadInfo.uploadState = 'Aborted';
						that.updateProgress(uploadInfo);
					};
				},
				updateProgress: function(uploadInfo,onePercent) {
					if (!uploadInfo.progress) {
						var progress = new FileProgress({
							name: uploadInfo.file.name,
							size: uploadInfo.file.size,
							index: uploadInfo.index,
							id: 'html5upload_' + uploadInfo.index.toString()
						}, 'uploadProgress');
						uploadInfo.progress = progress;
						var cancel = progress.fileProgressElement.childNodes[0];
						if (cancel) {
							cancel.onclick = this.cancelUpload(uploadInfo);
						}
					}
					if(typeof onePercent != 'undefined'){
						uploadInfo.progress.setProgress(uploadInfo.percentComplete,true);
					}else{
						uploadInfo.progress.setProgress(uploadInfo.percentComplete);
					}
					uploadInfo.progress.setStatus(this.StatusMessages[uploadInfo.uploadState]);
					uploadInfo.progress.toggleCancel(uploadInfo.uploadState.match(/Pending|Uploading/));
					if (uploadInfo.uploadState === 'Complete') {
						uploadInfo.progress.setComplete();
					} else if (uploadInfo.uploadState.match(/Error/)){
						uploadInfo.progress.setError();
					}else if (uploadInfo.uploadState.match(/Aborted/)) {
						uploadInfo.progress.setCancelled();
					}
				},
				cancelUpload: function(uploadInfo) {
					var that = this;
					return function(e) {
						e.preventDefault();
						if(uploadInfo.index == uploadsArray[0].index){
							uploadsArray = $.grep(uploadsArray, function(e){ return e.index != uploadInfo.index; });
							uploadInfo.xhr.abort();
							if(uploadsArray.length > 0){
								uploadsArray[0].xhr.send(uploadsArray[0].file);	
							}else if( uploadsArray.length ==  0){
								that.onQueueComplete();
							}								
						}else{
							uploadsArray = $.grep(uploadsArray, function(e){ return e.index != uploadInfo.index; });
							uploadInfo.uploadState = 'Aborted';
							that.updateProgress(uploadInfo);						
						}
					};
				},
				StatusMessages: {
					Pending: 'Pending...',
					Uploading: 'Uploading...',
					Complete: 'Complete',
					Aborted: 'Cancelled',
					Error: 'Error'
				},
				onQueueComplete: function(){
					startUpload = true;
					changes = false;
					$("#cancelAll").removeClass('active');
				}
			}
			
	function uploaderType(){
		if(getInternetExplorerVersion() <= 9 && getInternetExplorerVersion() != -1) return true;
		return false;
	}			
	function getInternetExplorerVersion(){
	  var rv = -1; // Return value assumes failure.
	  if (navigator.appName == 'Microsoft Internet Explorer'){
		var ua = navigator.userAgent;
		var re  = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
		if (re.exec(ua) != null)
			rv = parseFloat( RegExp.$1 );
			internetExp = true;  
	  }
	  return rv;
	}
})();

//attach touch event for droid and ios
function handleTouch(event){
                        var touches = event.changedTouches,
                        first = touches[0],
						type = '';
                        switch(event.type)
                        {
                                case 'touchstart':
                                        type = 'mousedown';
                                        break;
                                        
                                case 'touchmove':
                                        type = 'mousemove';
                                        break;        
                                        
                                case 'touchend':
                                        type = 'mouseup';
                                        break;
                                        
                                default:
                                        return;
                        }
                        
                        var simulatedEvent = document.createEvent('MouseEvent');
                        simulatedEvent.initMouseEvent(type, true, true, window, 1, first.screenX, first.screenY, first.clientX, first.clientY, false, false, false, false, 0/*left*/, null);
                                                                                                                                 
                        first.target.dispatchEvent(simulatedEvent);
                        
                        event.preventDefault();
}