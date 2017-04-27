(function (window) {
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
	var parseLink = WebIM.utils.parseLink;
	var parseEmoji = WebIM.utils.parseEmoji;
	//用来储存图片信息的file对象 
	window.imgFileList = new easemobim.dict();

	function _encode(str) {
		if (!str || str.length === 0) {
			return '';
		}
		var s = '';
		s = str.replace(/&amp;/g, "&");
		// 避免影响表情解析
		s = s.replace(/<(?=[^o][^)])/g, "&lt;");
		s = s.replace(/>/g, "&gt;");
		//s = s.replace(/\'/g, "&#39;");
		s = s.replace(/\"/g, "&quot;");
		return s;
	}

	function _decode(str) {
		if (!str || str.length === 0) {
			return '';
		}
		var s = '';
		s = str.replace(/&amp;/g, "&");
		s = s.replace(/&#39;/g, "'");
		s = s.replace(/&lt;/g, "<");
		return s;
	}

	function genMsgContent(msg) {
		var type = msg.type;
		var value = msg.value;
		var html = '';
		switch (type) {
		case 'txt':
			// fake:  todo: remove this
			value = _encode(_decode(value));
			html = '<pre>' + parseLink(parseEmoji(value)) + '</pre>';
			break;
		case 'img':
			if (value) {
				// todo: remove a
				if(value.data){
					imgFileList.set(value.url, value.data);
				}
				html = '<a href="javascript:;"><img class="em-widget-imgview" src="'
					+ value.url + '"/></a>';
			}
			else {
				html = '<i class="icon-broken-pic"></i>';
			}
			break;
		case 'list':
			html = "<p>" + parseLink(_encode(value)) + "</p>" + msg.listDom;
			break;
		case 'file':
			// 历史会话中 filesize = 0
			// 访客端发文件消息 filesize = undefined
			// 需要过滤这两种情况，暂时只显示坐席发过来的文件大小
			if (value) {
				html = '<i class="icon-attachment container-icon-attachment"></i>'
					+ '<span class="file-info">'
					+ '<p class="filename">' + msg.filename + '</p>'
					+ '<p class="filesize">' + easemobim.utils.filesizeFormat(value.filesize) + '</p>'
					+ '</span>'
					+ "<a target='_blank' href='" + value.url + "' class='icon-download container-icon-download' title='"
					+ msg.filename + "'></a>";
			}
			else {
				html = '<i class="icon-broken-pic"></i>';
			}
			break;
		default:
			break;
		}

		return html;
	}

	function genDomFromMsg(msg, isReceived) {
		var id = msg.id;
		var type = msg.type;
		var html = '';
		var stack = [];
		var dom = document.createElement('div');
		var direction = isReceived ? 'left' : 'right';

		// 设置消息气泡显示在左侧还是右侧
		// .em-widget-right, .em-widget-left used here
		dom.className = 'em-widget-' + direction;

		// 给消息追加id，用于失败重发消息或撤回消息
		if (id) {
			dom.id = id;
		}

		// wrapper开始
		html += '<div class="em-widget-msg-wrapper">';

		// 设置消息气泡的突起位置
		// .icon-corner-right, .icon-corner-left used here
		html += '<i class="icon-corner-' + direction + '"></i>';

		// 发出的消息增加状态显示
		if (!isReceived && id) {
			html += '<div id="' + id
				+ '_failed" data-type="txt" class="em-widget-msg-status hide">'
				+ '<span>发送失败</span><i class="icon-circle"><i class="icon-exclamation"></i></i></div>'
				+ '<div id="' + id
				+ '_loading" class="em-widget-msg-loading">' + LOADING + '</div>';
		}


		// todo: simplify the class name em-widget-msg
		// container 开始
		// .em-widget-msg-* used here
		html += '<div class="em-widget-msg-container em-widget-msg-' + type + '">';
		// 消息内容
		html += genMsgContent(msg);

		// container 结束
		stack.push('</div>');

		// wrapper结尾
		stack.push('</div>');

		// 追加标签
		html += _.reduceRight(stack, function (a, b) { return a + b; }, '');
		dom.innerHTML = html;
		return dom;
	}

	// 按钮列表消息，机器人回复，满意度调查
	WebIM.message.list = function (id) {
		this.id = id;
		this.type = 'list';
		this.brief = '';
		this.body = {};
	};
	WebIM.message.list.prototype.set = function (opt) {
		this.value = opt.value;
		this.listDom = opt.list;
	};

	easemobim.genDomFromMsg = genDomFromMsg;
}(window));
