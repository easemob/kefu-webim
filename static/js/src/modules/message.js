//文本消息
WebIM.message.txt.prototype.get = function ( isReceive ) {
	if ( !this.value ) {
		return '';
	}

	this.value = easemobim.utils.decode(this.value);
	
	return [
		!isReceive ? "<div id='" + this.id + "' class='em-widget-right'>" : "<div class='em-widget-left'>",
			"<div class='em-widget-msg-wrapper'>",
				"<i class='" + (!isReceive ? "icon-corner-right" : "icon-corner-left") + "'></i>",
				this.id ? "<div id='" + this.id + "_failed' data-type='txt' class='em-widget-msg-status hide'><span>发送失败</span><i class='icon-circle'><i class='icon-exclamation'></i></i></div>" : "",
				this.id ? "<div id='" + this.id + "_loading' class='em-widget-msg-loading'>" + easemobim.LOADING + "</div>" : "",
				"<div class='em-widget-msg-container'>",
					"<pre>" + WebIM.utils.parseLink(this.emotion ? this.value : WebIM.utils.parseEmoji(this.value)) + "</pre>",
				"</div>",
			"</div>",
		"</div>"
	].join('');
};

//图片消息
WebIM.message.img.prototype.get = function ( isReceive ) {
	return [
		!isReceive ? "<div id='" + this.id + "' class='em-widget-right'>" : "<div class='em-widget-left'>",
			"<div class='em-widget-msg-wrapper'>",
				"<i class='" + (!isReceive ? "icon-corner-right" : "icon-corner-left") + "'></i>",
				this.id ? "<div id='" + this.id + "_failed' class='em-widget-msg-status hide'><span>发送失败</span><i class='icon-circle'><i class='icon-exclamation'></i></i></div>" : "",
				this.id ? "<div id='" + this.id + "_loading' class='em-widget-msg-loading'>" + easemobim.LOADING + "</div>" : "",
				"<div class='em-widget-msg-container'>",
					this.value === null ? "<i class='icon-broken-pic'></i>" : "<a href='javascript:;'><img class='em-widget-imgview' src='" + this.value.url + "'/></a>",
				"</div>",
			"</div>",
		"</div>"
	].join('');
};
//按钮列表消息，机器人回复，满意度调查
WebIM.message.list = function ( id ) {
	this.id = id;
	this.type = 'list';
	this.brief = '';
	this.body = {};
};
WebIM.message.list.prototype.get = function ( isReceive ) {
	if ( !this.value ) {
		return '';
	}
	return [
		"<div class='em-widget-left'>",
			"<div class='em-widget-msg-wrapper'>",
				"<i class='" + (!isReceive ? "icon-corner-right" : "icon-corner-left") + "'></i>",
				"<div class='em-widget-msg-container em-widget-msg-menu'>",
					"<p>" + WebIM.utils.parseLink(WebIM.utils.parseEmoji(easemobim.utils.encode(this.value))) + "</p>",
					this.listDom,
				"</div>",
				"<div id='" + this.id + "_failed' class='em-widget-msg-status hide'><span>发送失败</span><i class='icon-circle'><i class='icon-exclamation'></i></i></div>",
			"</div>",
		"</div>"
	].join('');
};
WebIM.message.list.prototype.set = function ( opt ) {
	this.value = opt.value;
	this.listDom = opt.list;
};
//文件消息

WebIM.message.file.prototype.get = function ( isReceive ) {
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
				"<i class='" + (!isReceive ? "icon-corner-right" : "icon-corner-left") + "'></i>",
				this.id
				? "<div id='" + this.id + "_failed' class='em-widget-msg-status hide'>"
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
};

