//文本消息
Easemob.im.EmMessage.txt = function ( id ) {
	this.id = id;
	this.type = 'txt';
	this.brief = '';
	this.body = {};
};
Easemob.im.EmMessage.txt.prototype.get = function ( isReceive ) {
	if ( !this.value ) {
		return '';
	}

	this.value = this.emotion ? this.value : easemobim.utils.decode(this.value);
	
	return [
		!isReceive ? "<div id='" + this.id + "' class='em-widget-right'>" : "<div class='em-widget-left'>",
			"<div class='em-widget-msg-wrapper'>",
				"<i class='" + (!isReceive ? "icon-corner-right" : "icon-corner-left") + "'></i>",
				this.id ? "<div id='" + this.id + "_failed' data-type='txt' class='em-widget-msg-status em-hide'><span>发送失败</span><i class='icon-circle'><i class='icon-exclamation'></i></i></div>" : "",
				this.id ? "<div id='" + this.id + "_loading' class='em-widget-msg-loading'>" + easemobim.LOADING + "</div>" : "",
				"<div class='em-widget-msg-container'>",
					"<pre>" + Easemob.im.Utils.parseLink(this.emotion ? this.value : Easemob.im.Utils.parseEmotions(this.value)) + "</pre>",
				"</div>",
			"</div>",
		"</div>"
	].join('');
};
Easemob.im.EmMessage.txt.prototype.set = function ( opt ) {
	this.value = opt.value;
	this.emotion = opt.emotion;
	if ( this.value ) {
		this.brief = (opt.brief || this.value).replace(/\n/mg, '');
		this.brief = (this.brief.length > 15 ? this.brief.slice(0, 15) + '...' : this.brief);
	}
	this.body = {
		id: this.id
		, to: opt.to
		, msg: this.value 
		, type : this.type
		, ext: opt.ext || {}
		, success: opt.success
		, fail: opt.fail
	};
};

//cmd消息
Easemob.im.EmMessage.cmd = function ( id ) {
	this.id = id;
	this.type = 'cmd';
	this.body = {};
};
Easemob.im.EmMessage.cmd.prototype.set = function ( opt ) {
	this.value = '';

	this.body = {
		to: opt.to
		, action: opt.action
		, msg: this.value 
		, type : this.type 
		, ext: opt.ext || {}
	};
};

//图片消息
Easemob.im.EmMessage.img = function ( id ) {
	this.id = id;
	this.type = 'img';
	this.brief = '图片';
	this.body = {};
}
Easemob.im.EmMessage.img.prototype.get = function ( isReceive ) {
	return [
		!isReceive ? "<div id='" + this.id + "' class='em-widget-right'>" : "<div class='em-widget-left'>",
			"<div class='em-widget-msg-wrapper'>",
				"<i class='" + (!isReceive ? "icon-corner-right" : "icon-corner-left") + "'></i>",,
				this.id ? "<div id='" + this.id + "_failed' class='em-widget-msg-status em-hide'><span>发送失败</span><i class='icon-circle'><i class='icon-exclamation'></i></i></div>" : "",
				this.id ? "<div id='" + this.id + "_loading' class='em-widget-msg-loading'>" + easemobim.LOADING + "</div>" : "",
				"<div class='em-widget-msg-container'>",
					this.value === null ? "<i class='icon-broken-pic'></i>" : "<a href='javascript:;'><img class='em-widget-imgview' src='" + this.value.url + "'/></a>",,
				"</div>",
			"</div>",
		"</div>"
	].join('');
}
Easemob.im.EmMessage.img.prototype.set = function ( opt ) {
	this.value = opt.file;
				
	this.body = {
		id: this.id 
		, file: this.value 
		, apiUrl: opt.apiUrl
		, accessToken: opt.accessToken
		, to: opt.to
		, type : this.type
		, onFileUploadError : opt.uploadError
		, onFileUploadComplete: opt.uploadComplete
		, success: opt.success
		, fail: opt.fail
		, flashUpload: opt.flashUpload
	};
}
//按钮列表消息，机器人回复，满意度调查
Easemob.im.EmMessage.list = function ( id ) {
	this.id = id;
	this.type = 'list';
	this.brief = '';
	this.body = {};
};
Easemob.im.EmMessage.list.prototype.get = function ( isReceive ) {
	if ( !this.value ) {
		return '';
	}
	return [
		"<div class='em-widget-left'>",
			"<div class='em-widget-msg-wrapper'>",
				"<i class='" + (!isReceive ? "icon-corner-right" : "icon-corner-left") + "'></i>",,
				"<div class='em-widget-msg-container em-widget-msg-menu'>",
					"<p>" + Easemob.im.Utils.parseLink(Easemob.im.Utils.parseEmotions(easemobim.utils.encode(this.value))) + "</p>",
					this.listDom,
				"</div>",
				"<div id='" + this.id + "_failed' class='em-widget-msg-status em-hide'><span>发送失败</span><i class='icon-circle'><i class='icon-exclamation'></i></i></div>",
			"</div>",
		"</div>"
	].join('');
};
Easemob.im.EmMessage.list.prototype.set = function ( opt ) {
	this.value = opt.value;
	if ( this.value ) {
		this.brief = this.value.replace(/\n/mg, '');
		this.brief = (this.brief.length > 15 ? this.brief.slice(0, 15) + '...' : this.brief);
	}
	this.listDom = opt.list;
};
//文件消息
Easemob.im.EmMessage.file = function ( id ) {
	this.id = id;
	this.type = 'file';
	this.brief = '文件';
	this.body = {};
}
Easemob.im.EmMessage.file.prototype.get = function ( isReceive ) {
	var filename = this.filename;
	var filesize;
	// 历史会话中 filesize = 0
	// 访客端发文件消息 filesize = undefined
	// 需要过滤这两种情况，暂时只显示坐席发过来的文件大小
	if(this.value.filesize > 0){
		filesize = easemobim.utils.filesizeFormat(this.value.filesize);
	}else{
		filesize = '';
	}
	var url = this.value.url;
	return [
		!isReceive ? "<div id='" + this.id + "' class='em-widget-right'>" : "<div class='em-widget-left'>",
			"<div class='em-widget-msg-wrapper em-widget-msg-file'>",
				"<i class='" + (!isReceive ? "icon-corner-right" : "icon-corner-left") + "'></i>",,
				this.id
				? "<div id='" + this.id + "_failed' class='em-widget-msg-status em-hide'>"
				+ "<span>发送失败</span><i class='icon-circle'><i class='icon-exclamation'></i></i></div>"
				+ "<div id='" + this.id + "_loading' class='em-widget-msg-loading'>" + easemobim.LOADING + "</div>"
				: "",
				"<div class='em-widget-msg-container'>",
					this.value === null
					? "<i class='icon-broken-pic'></i>"
					: '<i class="icon-attachment container-icon-attachment"></i>'
					+ '<span class="file-info">'
						+ '<p class="filename ">' + filename + '</p>'
						+ '<p class="filesize">' + filesize + '</p>'
					+ '</span>'
					+ "<a target='_blank' href='" + url + "' class='icon-download container-icon-download' title='"
					+ filename + "'></a>",
				"</div>",
			"</div>",
		"</div>"
	].join('');
}
Easemob.im.EmMessage.file.prototype.set = function ( opt ) {
	this.value = opt.file;
	this.filename = opt.filename || this.value.filename || '文件';

	this.body = {
		id: this.id 
		, file: this.value
		, filename: this.filename
		, apiUrl: opt.apiUrl
		, to: opt.to
		, type: this.type
		, onFileUploadError : opt.uploadError
		, onFileUploadComplete: opt.uploadComplete
		, success: opt.success
		, fail: opt.fail
		, flashUpload: opt.flashUpload
	};
}
