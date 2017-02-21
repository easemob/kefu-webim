(function(){
	var LOADING = Modernizr.inlinesvg ? [
		'<div class="em-widget-loading">',
		'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 70 70">',
		'<circle opacity=".3" fill="none" stroke="#000" stroke-width="4" stroke-miterlimit="10" cx="35" cy="35" r="11"/>',
		'<path fill="none" stroke="#E5E5E5" stroke-width="4" stroke-linecap="round" stroke-miterlimit="10" d="M24 35c0-6.1 4.9-11 11-11 2.8 0 5.3 1 7.3 2.8"/>',
		'<image width="20" style="margin-top:10px"/>',
		'</svg>',
		'</div>'
	].join('')
	: '<img src="//kefu.easemob.com/webim/static/img/loading.gif" width="20" style="margin-top:10px;"/>';

// 文本消息
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
				this.id ? "<div id='" + this.id + "_loading' class='em-widget-msg-loading'>" + LOADING + "</div>" : "",
				"<div class='em-widget-msg-container'>",
					"<pre>" + WebIM.utils.parseLink(WebIM.utils.parseEmoji(this.value)) + "</pre>",
					// 这个 emotion 属性看起来没有用，2017-02-21
					// "<pre>" + WebIM.utils.parseLink(this.emotion ? this.value : WebIM.utils.parseEmoji(this.value)) + "</pre>",
				"</div>",
			"</div>",
		"</div>"
	].join('');
};

// 图片消息
WebIM.message.img.prototype.get = function ( isReceive ) {
	return [
		!isReceive ? "<div id='" + this.id + "' class='em-widget-right'>" : "<div class='em-widget-left'>",
			"<div class='em-widget-msg-wrapper'>",
				"<i class='" + (!isReceive ? "icon-corner-right" : "icon-corner-left") + "'></i>",
				this.id ? "<div id='" + this.id + "_failed' class='em-widget-msg-status hide'><span>发送失败</span><i class='icon-circle'><i class='icon-exclamation'></i></i></div>" : "",
				this.id ? "<div id='" + this.id + "_loading' class='em-widget-msg-loading'>" + LOADING + "</div>" : "",
				"<div class='em-widget-msg-container'>",
					this.value === null ? "<i class='icon-broken-pic'></i>" : "<a href='javascript:;'><img class='em-widget-imgview' src='" + this.value.url + "'/></a>",
				"</div>",
			"</div>",
		"</div>"
	].join('');
};

// 按钮列表消息，机器人回复，满意度调查
WebIM.message.list = function ( id ) {
	this.id = id;
	this.type = 'list';
	this.brief = '';
	this.body = {};
};
WebIM.message.list.prototype.get = function() {
	if (!this.value) return '';

	return [
		"<div class='em-widget-left'>",
			"<div class='em-widget-msg-wrapper'>",
				"<i class='icon-corner-left'></i>",
				"<div class='em-widget-msg-container em-widget-msg-menu'>",
					"<p>" + WebIM.utils.parseLink(WebIM.utils.parseEmoji(easemobim.utils.encode(this.value))) + "</p>",
					this.listDom,
				"</div>",
			"</div>",
		"</div>"
	].join('');
};
WebIM.message.list.prototype.set = function ( opt ) {
	this.value = opt.value;
	this.listDom = opt.list;
};

// 文件消息
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
				+ "<div id='" + this.id + "_loading' class='em-widget-msg-loading'>" + LOADING + "</div>"
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

}());

