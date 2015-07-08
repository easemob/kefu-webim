/*
 * version: 0.0.1
 * 3 parts: add relative js; call sdk; basic function
 */

;(function(window, undefined){
   
	var JSDOMAIN = 'http://webim.easemob.com';
	
	//temp
	var easemobConfig = {
		sdkconfig: {
			clientId:	'jxdyfjinxiang',
			appkey:     'jxdyf#jinxiang',
			to:         'duo1baitest4321ah123z1'
		}
	};
	
	//is mobile
	(function(){
		window.isMobile = /mobile/i.test(navigator.userAgent);
	}());

	//set viewport and bind click on kefu-header if in mobile
	isMobile && (function(){
		var meta = document.createElement('meta'),
			hasViewport = false;
		for(var i=0,n=document.head.childNodes,l=n.length;i<l;i++) {
			if(n[i].nodeName.toLowerCase() == 'meta'
				&& n[i].getAttribute('name')
				&& n[i].getAttribute('name').toLowerCase() == 'viewport') {
				hasViewport=true;
				break;
			}
		}
		if(!hasViewport) {
			meta.setAttribute('name', 'viewport');
			meta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no, minimal-ui');
			document.head.appendChild(meta);
		}
		var css = document.createElement('link');
		css.rel = 'stylesheet';
		css.href = 'im_m.css';
		document.head.appendChild(css);   
	}());
	
	
	/*
	 * add denpendent
	 */
	(function() {

		// dependent js
		var dependent = [
			'easemob.im-1.0.5.js',
			'strophe-custom-2.0.0.js',
			'json2.js',
			'bootstrap.js',
			'jquery-1.11.1.js'
		];

		var scripts = document.script || [], srcs = '', depend = '';

		for(var i=scripts.length; i>0; i--) {
			srcs += scripts[i-1].getAttribute('src') + '@';
		}
			
		for(i=dependent.length; i>0; i--) {
			if(0 > srcs.indexOf(dependent[i-1])) {
				depend += '<script id="'+(i==1?'easemobimjs':'')+'" src="' + JSDOMAIN + '/' + dependent[i-1] + '" defer></script>'; 
			}
		}
		document.write(depend);
		scripts = null;
	}());

	
	/*
	 * call sdk
	 */
	var im = {
		init: function(){
			this.sdkInit();
			this.getDom();
			
			this.fillFace();
			this.scrollBottom();

			//for parent to call
			var that = this;
			window.minFaceWrapper = (function(){
				return function(){
					that.minFaceWrapper();
				}
			}());

			//if open in new window , hide them;
			if(window.top === window) {
				this.body.find('.e-add').hide();
				this.body.find('.e-min').hide();   
			}

			//set kefu name
			this.title.html("金象大药房");

			//audio
			this.audioAlert();

			this.bindEvents();
		},

		sdkInit: function(){
			var me = this;
			me.conn = new Easemob.im.Connection();
			me.impromise = me.conn.init({
				https: false,
				onOpened: function(){
					me.conn.setPresence();
				},
				onTextMessage: function(message){
					me.receiveMsg(message, 'txt');
				},
				onEmotionMessage: function(message){
					me.receiveMsg(message, 'face');
				},
				onPictureMessage: function(message){
					me.receiveMsg(message, 'img');
				},
				onError: function(e){
					switch(e.type){
						// 1: offline
						case 1:
							me.open();
							me.sendFailed();
							break;
					}
					console.log(e);
				}
			});
			me.open();
		},

		open: function(){
			this.conn.open({
				user : easemobConfig.sdkconfig.user,
				pwd : easemobConfig.sdkconfig.password,
				appKey : easemobConfig.sdkconfig.appkey
				//accessToken : easemobConfig.sdkconfig.accesstoken
			});
		},

		getDom: function(){
			this.body = EM.find('.easemobWebimKefu-body');
			this.audio = this.body.find('audio').get(0);
			this.textarea = this.body.find('textarea');
			this.sendbtn = this.body.find('#e-send');
			this.facewrapper = this.body.find('.easemobWebimKefu-face-wrapper');
			this.facebtn = this.body.find('.easemobWebimKefu-face');
			this.uploadbtn = this.body.find('.e-upload');
			this.realfile = this.body.find('#e-realfile');
			this.chatwrapper = this.body.find('.easemobWebimKefu-chat');
			this.title = this.body.find('.easemobWebimKefu-title-name');
		},

		// fill faces in face-wrapper
		fillFace: function(){
			var faceStr = '';
			$.each(this.face_map, function(k, v){
				faceStr += '<img class="e-face" src="faces/'+v+'.png" data-value="'+k+'" />'
			});
			this.facewrapper.html(faceStr);
			faceStr = null;
		},

		audioAlert: function(){
			var me = this,
				el = this.body.find('.e-vol');
			if(window.HTMLAudioElement && this.audio) {
				me.audioAlert = function(){
					!el.hasClass('e-silence') && !isMobile &&  me.audio.play();
				}
			} else {
				return function(){};
			}
		},

		face_map: {
			'[):]': 'ee_1',
			'[:D]': 'ee_2',
			'[;)]': 'ee_3',
			'[:-o]': 'ee_4',
			'[:p]': 'ee_5',
			'[(H)]': 'ee_6',
			'[:@]': 'ee_7',
			'[:s]': 'ee_8',
			'[:$]': 'ee_9',
			'[:(]': 'ee_10',
			'[:\'(]': 'ee_11',
			'[:|]': 'ee_12',
			'[(a)]': 'ee_13',
			'[8o|]': 'ee_14',
			'[8-|]': 'ee_15',
			'[+o(]': 'ee_16',
			'[<o)]': 'ee_17',
			'[|-)]': 'ee_18',
			'[*-)]': 'ee_19',
			'[:-#]': 'ee_20',
			'[:-*]': 'ee_21',
			'[^o)]': 'ee_22',
			'[8-)]': 'ee_23',
			'[(|)]': 'ee_24',
			'[(u)]': 'ee_25',
			'[(S)]': 'ee_26',
			'[(*)]': 'ee_27',
			'[(#)]': 'ee_28',
			'[(R)]': 'ee_29',
			'[({)]': 'ee_30',
			'[(})]': 'ee_31',
			'[(k)]': 'ee_32',
			'[(F)]': 'ee_33',
			'[(W)]': 'ee_34',
			'[(D)]': 'ee_35'
		},

		getface: function(img){
			$.each(this.face_map, function(k, v){
				if(img == v){
					return k;
				}
			});
			return '[):]';
		},

		face: function(msg){
			var me = this;
			if($.isArray(msg)){
				msg = '[' + msg[0] + ']';
			}
			else if(/\[.*\]/.test(msg)){
				$.each(me.face_map, function(k, v){
					while(msg.indexOf(k) >= 0){
						msg = msg.replace(k, '<img class=\"chat-face-all\" src=\"faces/' + me.face_map[k] + '.png\">');
					}
				});
			}
			return msg;
		},

		minFaceWrapper: function(){
			var me = this;
			!me.facewrapper.hasClass('e-slideDown') && me.facewrapper.addClass('e-slideDown');
		},

		bindEvents: function(){
			var me = this;

			//slide up and down face wrapper
			me.facebtn.on('click', function(){
				me.facewrapper.toggleClass('e-slideDown');
			});

			//face click event
			me.facewrapper.delegate('img', 'click', function(){
				me.textarea.val(me.textarea.val()+$(this).data('value'));
			});

			//hide face wrapper
			$(document).on('click', function(ev){
				var e = window.event || ev;
				if(!$(e.srcElement || e.target).hasClass('e-face')) {
					me.minFaceWrapper();
				}
			});

			this.textarea.on("keydown", function(evt){
				if(evt.ctrlKey && evt.keyCode == 13){
					me.sendTextMsg();
					return false;
				}
			});

			//upload click event
			//me.uploadbtn.on('click', function(){
			//   me.realfile.get(0).click(); 
			//});

			// upload img limit
			me.realfile.on('change', function(){
				// override sdk's function, because webim's bug, wait for skd update, then del it
				Easemob.im.Helper.getFileUrl = function(fileInputId){
					var uri = {
						url: '',
						filename: '',
						filetype: ''
					};
					var wu = window.URL || window.webkitURL;
					if(wu && wu.createObjectURL){
						var fileItems = document.getElementById(fileInputId).files;
						if (fileItems.length > 0) {
							var u = fileItems.item(0);
							uri.url = wu.createObjectURL(u);
							uri.filename = u.name || '';
						}
					}
					// IE
					else{
						var u = document.getElementById(fileInputId).value;
						uri.url = u;
						var pos1 = u.lastIndexOf('/');
						var pos2 = u.lastIndexOf('\\');
						var pos = Math.max(pos1, pos2)
						if(pos < 0){
							uri.filename = u;
						}
						else{
							uri.filename = u.substring(pos + 1);
						}
					}
					var index = uri.filename.lastIndexOf(".");
					if(index != -1){
						uri.filetype = uri.filename.substring(index+1).toLowerCase();
					}
					return uri;
				}
				var fileObj = Easemob.im.Helper.getFileUrl('e-realfile');
				me.sendImgMsg(fileObj);
			});

			// sendbtn click
			me.sendbtn.on('click', function(){
				me.sendTextMsg.call(me);
			});

			// bind return event if mobile
			isMobile && me.body.find('.easemobWebimKefu-return').on('click', function(){
				history.go(-1);
			});
		},

		scrollBottom: function(){
			var ocw = this.chatwrapper.get(0);
			this.scrollBottom = function(){ 
				setTimeout(function(){
					ocw.scrollTop = ocw.scrollHeight - ocw.offsetHeight + 10000;
				}, 100);
			}
		},

		notSupport: function(str){
			str = str || "您的浏览器不支持发送图片";
			this.chatwrapper.append("<label class='e-failed'>" + str + "</label>");
			this.scrollBottom();
		},

		sendImgMsg: function(file){
			var me = this;
			if(!file){
				return;
			}
			var temp = $("\
				<div class='easemobWebimKefu-visit'>\
					<p class='e-message'><a href='"+file.url+"' target='_blank'><img src='"+file.url+"'/></a></p>\
					<span class='e-angle'></span>\
					<label class='e-date'>12月30日 04:04</label>\
				</div>");
			
			// real send
			var opt = {
				fileInputId:	'e-realfile',
				to:				easemobConfig.sdkconfig.to,
				ext:			easemobConfig.sdkconfig.ext,
				onFileUploadError : function(error) {
					//处理图片上传失败
					me.notSupport();
				},
				onFileUploadComplete: function(data){
					// 处理图片上传成功，如本地消息显示
					me.chatwrapper.append(temp);
					me.scrollBottom();
				}
			};
			me.conn.sendPicture(opt);
		},

		sendFailed: function(){
			this.chatwrapper.append("<label class='e-failed'>消息发送失败,请重新发送</label>");
			this.scrollBottom();
		},

		encode: function(str){
			var s = "";
			if (str.length == 0) return "";
			s = str.replace(/&/g, "&amp;");
			//s = s.replace(/</g, "&lt;");
			s = s.replace(/>/g, "&gt;");
			//s = s.replace(/\'/g, "&#39;");
			s = s.replace(/\"/g, "&quot;");
			s = s.replace(/\n/g, "<br>");
			return s;
		},

		sendTextMsg: function(){
			var me = this;
			if(!me.textarea.val()) return false;
			
			var txt = me.textarea.val();
			
			//local append
			me.chatwrapper.append("\
				<div class='easemobWebimKefu-visit'>\
					<pre class='e-message'>"+me.face(me.encode(txt))+"</pre>\
					<span class='e-angle'></span>\
					<label class='e-date'>12月30日 04:04</label>\
				</div>");
			me.textarea.val('');
			me.scrollBottom();
			
			//real send
			me.conn.sendTextMessage({
				to:		easemobConfig.sdkconfig.to,
				msg:	txt,
				ext:	easemobConfig.sdkconfig.ext
			});

			// reset
			me.textarea.get(0).focus();
		},

		receiveMsg: function(msg, type){
			var me = this;
			var value = '';

			me.audioAlert();
			switch(type){
				case 'txt':
					value = msg.data;
					break;
				case 'face':
					$.each(msg.data, function(k, v){
						value += '<img class="chat-face-all" src="'+v.data+'">';   
					});
					break;
				case 'img':
					value = '<a href="'+msg.url+'" blank="_blank"><img src="'+(msg.thumb || msg.url)+'"></a>';   
					break;
				default: break;
			}

			me.chatwrapper.append("\
				<div class='easemobWebimKefu-agent'>\
					<p class='e-name'>金象大药房:</p>\
					<p style='display:none;' class='e-name'>"+msg.from+":</p>\
					<p class='e-message'>"+value+"</p>\
					<span class='e-angle'></span>\
					<label class='e-date'>12月30日 04:04</label>\
				</div>");
			me.scrollBottom();
		}

	};


	/*
	 * self function
	 */
	var bind = function bind(){

		var body = EM.find('.easemobWebimKefu-body');

		body.find('.e-min').on('click', function(){
			window.parent.minIframe();
		});
		body.find('.e-vol').on('click', function(){
			$(this).toggleClass('e-silence');
		});
		body.find('.e-add').on('click', function(){
			window.parent.openDialog();
		});
	}


	/*
	 * Main
	 */
	var EM = null;
	document.getElementById('easemobimjs').onload = function(){
		this.onreadystatechange = null;   
		EM = $('#easemobWebimKefu');

// 			$.get(ROOT_URL + "/webim/initChat", {
// 				// 加密
// 				clientId:	searchPart.clientId,
// 				code:		searchPart.code,
// 				appkey:		searchPart.appkey,
// 				memberIm:	searchPart.memberIm,
// 				tenantIm:	searchPart.tenantIm
// 			})
		var PRE_INFO_URL_ROOT = "http://172.16.1.164:8585";

		// 创建用户
		var vinfoDefer = $.Deferred(function(){
			$.get(PRE_INFO_URL_ROOT + "/webim/initChat", {
				clientId:	easemobConfig.sdkconfig.clientId,
				appkey:		easemobConfig.sdkconfig.appkey,
				tenantIm:	easemobConfig.sdkconfig.to,
				memberIm:	new Date().getTime() + "" + (Math.random()*1E6>>0)
			})
			.done(function(info){
				vinfoDefer.resolve(info);
			})
			.fail(function(){
				vinfoDefer.reject();
			});
		});

		// 获取地域
		var ipinfoDefer = $.Deferred(function(){
			$.get(PRE_INFO_URL_ROOT + "/webim/requestInfo", {
				clientId:	easemobConfig.sdkconfig.clientId,
				appkey:		easemobConfig.sdkconfig.appkey,
				tenantIm:	easemobConfig.sdkconfig.to,
				memberIm:	new Date().getTime() + "" + (Math.random()*1E6>>0)
			})
			.done(function(info){
				ipinfoDefer.resolve(info);
			})
			.fail(function(){
				ipinfoDefer.reject();
			});
		});

		$.when(
			vinfoDefer,
			ipinfoDefer
		)
		.done(function(vinfo, ipinfo){
			easemobConfig.sdkconfig.user = vinfo.user;
			easemobConfig.sdkconfig.password = vinfo.password;
			easemobConfig.sdkconfig.ext = {
				weichat:{
					webTechChannelInfo:{
						ip:				ipinfo.ip
					},
					visitor:{
						userNickname:	ipinfo.city + ipinfo.isp + "用户"
					}
				}
			};

			im.init();
			bind();
		})
		.fail(function(){

		});

	};
	
}(window, undefined));




