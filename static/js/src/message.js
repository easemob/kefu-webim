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
	return [
		!isReceive ? "<div id='" + this.id + "' class='easemobWidget-right'>" : "<div class='easemobWidget-left'>",
			"<div class='easemobWidget-msg-wrapper'>",
				"<i class='easemobWidget-corner'></i>",
				this.id ? "<div id='" + this.id + "_failed' class='easemobWidget-msg-status hide'><span>发送失败</span><i></i></div>" : "",
				this.id ? "<div id='" + this.id + "_loading' class='easemobWidget-msg-loading'>" + EasemobWidget.LOADING + "</div>" : "",
				"<div class='easemobWidget-msg-container'>",
					"<p>" + Easemob.im.Utils.parseLink(Easemob.im.Utils.parseEmotions(EasemobWidget.utils.encode(this.value))) + "</p>",
				"</div>",
			"</div>",
		"</div>"
	].join('');
};
Easemob.im.EmMessage.txt.prototype.set = function ( opt ) {
	this.value = opt.value;
	if ( this.value ) {
		this.brief = this.value.replace(/\n/mg, '');
		this.brief = (this.brief.length > 15 ? this.brief.slice(0, 15) + '...' : this.brief);
	}
	this.body = {
		id: this.id
		, to: opt.to
		, msg: this.value 
		, type : 'chat'
		, ext: opt.ext || {}
		, success: opt.success
		, fail: opt.fail
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
		!isReceive ? "<div id='" + this.id + "' class='easemobWidget-right'>" : "<div class='easemobWidget-left'>",
			"<div class='easemobWidget-msg-wrapper'>",
				"<i class='easemobWidget-corner'></i>",
				this.id ? "<div id='" + this.id + "_failed' class='easemobWidget-msg-status hide'><span>发送失败</span><i></i></div>" : "",
				this.id ? "<div id='" + this.id + "_loading' class='easemobWidget-msg-loading'>" + EasemobWidget.LOADING + "</div>" : "",
				"<div class='easemobWidget-msg-container'>",
					this.value === null ? "<a class='easemobWidget-noline' href='javascript:;'><i class='easemobWidget-unimage'>I</i></a>" : "<img class='easemobWidget-img' src='" + this.value.url + "'/>",
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
		, apiUrl: (location.protocol == 'https:' ? 'https:' : 'http:') + '//a1.easemob.com'
		, to: opt.to
		, type : 'img'
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
		"<div class='easemobWidget-left'>",
			"<div class='easemobWidget-msg-wrapper'>",
				"<i class='easemobWidget-corner'></i>",
				"<div class='easemobWidget-msg-container'>",
					"<p>" + Easemob.im.Utils.parseLink(Easemob.im.Utils.parseEmotions(EasemobWidget.utils.encode(this.value))) + "</p>",
				"</div>",
				"<div id='" + this.id + "_failed' class='easemobWidget-msg-status hide'><span>发送失败</span><i></i></div>",
			"</div>",
			this.listDom,
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
