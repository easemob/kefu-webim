/**
 * 为不支持异步上传的浏览器提供上传接口
*/
easemobim.uploadShim = function ( config, chat ) {
	var me = this,
		utils = easemobim.utils;

	me.flashUpload = function ( url, options ) {
		me.swfupload.setUploadURL(url);
		me.swfupload.startUpload();
		me.swfupload.uploadOptions = options;
	};

	me.uploadShim = function ( fileInputId ) {
		if ( !WebIM.utils.isCanUploadFile ) {
			return;
		}

		var pageTitle = document.title;
		var uploadBtn = document.getElementById(fileInputId);
		if ( typeof SWFUpload === 'undefined' || uploadBtn.length < 1 ) {
			return;
		}

		return new SWFUpload({ 
			file_post_name: 'file'
			, flash_url: location.protocol + config.staticPath + '/js/swfupload/swfupload.swf'
			, button_placeholder_id: fileInputId
			, button_width: 120
			, button_height: 30
			, button_cursor: SWFUpload.CURSOR.HAND
			, button_window_mode: SWFUpload.WINDOW_MODE.TRANSPARENT
			, file_size_limit: 10485760
			, file_upload_limit: 0
			, file_queued_error_handler: function () {}
			, file_dialog_start_handler: function () {}
			, file_dialog_complete_handler: function () {}
			, file_queued_handler: function ( file ) {
				if ( this.getStats().files_queued > 1 ) {
					this.cancelUpload();
				}
				if ( 10485760 < file.size ) {
					chat.errorPrompt('请上传大小不超过10M的文件');
					this.cancelUpload();
				} else if (/\.(png|jpg|jpeg|gif)$/i.test(file.type)) {
					chat.sendImgMsg({name: file.name, data: file});
				} else {
					chat.errorPrompt('不支持此类型' + file.type);
					this.cancelUpload();
				}
			}
			, upload_error_handler: function ( file, code ) {
				if (
					code != SWFUpload.UPLOAD_ERROR.FILE_CANCELLED
					&& code != SWFUpload.UPLOAD_ERROR.UPLOAD_LIMIT_EXCEEDED 
					&& code != SWFUpload.UPLOAD_ERROR.FILE_VALIDATION_FAILED
				){
					var msg = new WebIM.message('img');
					msg.set({file: null});
					chat.appendMsg(config.user.username, config.toUser, msg);
					chat.appendDate(new Date().getTime(), config.toUser);
				}
			}
			, upload_success_handler: function ( file, response ) {
				var msg;
				if ( !file || !response ) {
					msg = new WebIM.message('img');
					msg.set({file: null});
					chat.appendMsg(config.user.username, config.toUser, msg);
					chat.appendDate(new Date().getTime(), config.toUser);
					return;
				}
				try {
					var res = WebIM.utils.parseUploadResponse(response);
					res = JSON.parse(res);
					if (file && !file.url && res.entities && res.entities.length > 0 ) {
						file.url = res.uri + '/' + res.entities[0].uuid;
					}
					msg = new WebIM.message('img');
					msg.set({file: file});
					chat.appendDate(new Date().getTime(), config.toUser);
					chat.appendMsg(config.user.username, config.toUser, msg);
					chat.scrollBottom(1000);
					this.uploadOptions.onFileUploadComplete(res);
				} catch ( e ) {
					chat.errorPrompt('上传图片发生错误');
				}
			}
		});
	};

	//不支持异步upload的浏览器使用flash插件搞定
	if ( !WebIM.utils.isCanUploadFileAsync && WebIM.utils.hasFlash ) {
		me.swfupload = me.uploadShim('em-widget-img-input');
	}
};
