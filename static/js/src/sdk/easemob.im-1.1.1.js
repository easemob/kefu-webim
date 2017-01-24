/**************************************************************************
***							 Easemob WebIm Js SDK					***
***							 v1.1.1								  ***
**************************************************************************/
/**
 * Module1: Utility
 * Module2: EmMessage
 * Module3: Message
 */

;(function ( window, undefined ) {

	var Easemob = Easemob || {};
	Easemob.im = Easemob.im || {};
	Easemob.im.version = "1.1.1";

	var https = location.protocol === 'https:';

	window.URL = window.URL || window.webkitURL || window.mozURL || window.msURL;

	/**
	 * Module1: Utility
	 */
	var Utils = (function () {
		
		var _createStandardXHR = function () {
			try {
				return new window.XMLHttpRequest();
			} catch ( e ) {
				return false;
			}
		};
		
		var _createActiveXHR = function () {
			try {
				return new window.ActiveXObject( "Microsoft.XMLHTTP" );
			} catch ( e ) {
				return false;
			}
		};

		var _xmlrequest = function ( crossDomain ) {
			crossDomain = crossDomain || true;
			var temp = _createStandardXHR () || _createActiveXHR();

			if ( "withCredentials" in temp ) {
				return temp;
			}
			if ( !crossDomain ) {
				return temp;
			}
			if ( typeof window.XDomainRequest === 'undefined' ) {
				return temp;
			}
			var xhr = new XDomainRequest();
			xhr.readyState = 0;
			xhr.status = 100;
			xhr.onreadystatechange = EMPTYFN;
			xhr.onload = function () {
				xhr.readyState = 4;
				xhr.status = 200;

				var xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
				xmlDoc.async = "false";
				xmlDoc.loadXML(xhr.responseText);
				xhr.responseXML = xmlDoc;
				xhr.response = xhr.responseText;
				xhr.onreadystatechange();
			};
			xhr.ontimeout = xhr.onerror = function () {
				xhr.readyState = 4;
				xhr.status = 500;
				xhr.onreadystatechange();
			};
			return xhr;
		};

		var _hasFlash = (function () {
			if ( 'ActiveXObject' in window ) {
				try {
					return new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
				} catch ( ex ) {
					return 0;
				}
			} else {
				if ( navigator.plugins && navigator.plugins.length > 0 ) {
					return navigator.plugins["Shockwave Flash"];
				}
			}
			return 0;
		}());

		var _tmpUtilXHR  = _xmlrequest(),
			_hasFormData = typeof FormData !== 'undefined',
			_hasBlob = typeof Blob !== 'undefined',
			_isCanSetRequestHeader = _tmpUtilXHR.setRequestHeader || false,
			_hasOverrideMimeType = _tmpUtilXHR.overrideMimeType || false,
			_isCanUploadFileAsync = _isCanSetRequestHeader && _hasFormData,
			_isCanUploadFile = _isCanUploadFileAsync || _hasFlash,
			_isCanDownLoadFile = _isCanSetRequestHeader && (_hasBlob || _hasOverrideMimeType);

		return {
			hasFormData: _hasFormData

			, hasBlob: _hasBlob

			, isCanSetRequestHeader: _isCanSetRequestHeader

			, hasOverrideMimeType: _hasOverrideMimeType

			, isCanUploadFileAsync: _isCanUploadFileAsync

			, isCanUploadFile: _isCanUploadFile

			, isCanDownLoadFile: _isCanDownLoadFile

			, isSupportWss: (function () {
				var notSupportList = [
					//1:qq broswser X5 core
					/MQQBrowser[\/]5([.]\d+)?\sTBS/

					//2:etc.
					//...
				];

				if ( !window.WebSocket ) {
					return false;
				}

				var ua = window.navigator.userAgent;
				for ( var i = 0, l = notSupportList.length; i < l; i++ ) {
					if ( notSupportList[i].test(ua) ) {
						return false;
					}
				}
				return true; 
			}())

			, stringify: function ( json ) {
				if ( typeof JSON !== 'undefined' && JSON.stringify ) {
					return JSON.stringify(json);
				} else {
					var s = '',
						arr = [];

					var iterate = function ( json ) {
						var isArr = false;

						if ( Object.prototype.toString.call(json) === '[object Array]' ) {
							arr.push(']', '[');
							isArr = true;
						} else if ( Object.prototype.toString.call(json) === '[object Object]' ) {
							arr.push('}', '{');
						}

						for ( var o in json ) {
							if ( Object.prototype.toString.call(json[o]) === '[object Null]' ) {
								json[o] = 'null';
							} else if ( Object.prototype.toString.call(json[o]) === '[object Undefined]' ) {
								json[o] = 'undefined';
							}

							if ( json[o] && typeof json[o] === 'object' ) {
								s += ',' + (isArr ? '' : '"' + o + '":' + (isArr ? '"' : '')) + iterate(json[o]) + '';
							} else {
								s += ',"' + (isArr ? '' : o + '":"') + json[o] + '"';
							}
						}
				
						if ( s != '' ) {
							s = s.slice(1);
						}

						return arr.pop() + s + arr.pop();
					}
					return iterate(json);
				}
			}

			, registerUser: function ( options ) {
				var orgName = options.orgName || '';
				var appName = options.appName || '';
				var appKey = options.appKey || '';

				if ( !orgName && !appName && appKey ) {
					var devInfos = appKey.split('#');
					if ( devInfos.length === 2 ) {
						orgName = devInfos[0];
						appName = devInfos[1];
					}
				}
				if ( !orgName && !appName ) {
					options.error({
						type: EASEMOB_IM_RESISTERUSER_ERROR
						, msg: '没有指定开发者信息'
					});
					return;
				}

				var https = options.https || https;
				var apiUrl = options.apiUrl || (https ? 'https' : 'http') + '://a1.easemob.com';
				var restUrl = apiUrl + '/' + orgName + '/' + appName + '/users';

				var userjson = {
					username: options.username
					, password: options.password
					, nickname: options.nickname || ''
				};

				var userinfo = Utils.stringify(userjson);
				var options = {
					url: restUrl
					, dataType: 'json'
					, data: userinfo
					, success: options.success || EMPTYFN
					, error: options.error || EMPTYFN
				};
				return Utils.ajax(options);
			}

			, login2UserGrid: function ( options ) {
				options = options || {};

				var appKey = options.appKey || '';
				var devInfos = appKey.split('#');
				if ( devInfos.length !== 2 ) {
					error({
						type: EASEMOB_IM_CONNCTION_OPEN_USERGRID_ERROR
						, msg: '请指定正确的开发者信息(appKey)'
					});
					return false;
				}

				var orgName = devInfos[0];
				var appName = devInfos[1];
				if ( !orgName ) {
					error({
						type: EASEMOB_IM_CONNCTION_OPEN_USERGRID_ERROR
						, msg: '请指定正确的开发者信息(appKey)'
					});
					return false;
				}
				if ( !appName ) {
					error({
						type: EASEMOB_IM_CONNCTION_OPEN_USERGRID_ERROR
						, msg: '请指定正确的开发者信息(appKey)'
					});
					return false;
				}

				var https = https || options.https;
				var suc = options.success || EMPTYFN;
				var error = options.error || EMPTYFN;
				var user = options.user || '';
				var pwd = options.pwd || '';

				var apiUrl = options.apiUrl || (https ? 'https' : 'http') + '://a1.easemob.com';

				var loginJson = {
					grant_type: 'password'
					, username: user
					, password: pwd
				};
				var loginfo = Utils.stringify(loginJson);

				var options = {
					url: apiUrl + "/" + orgName + "/" + appName + "/token"
					, dataType: 'json'
					, data: loginfo
					, success: suc || EMPTYFN
					, error: error || EMPTYFN
				};
				return Utils.ajax(options);
			}
			, getFileUrl: function ( fileInputId ) {
				var uri = {
					url: ''
					, filename: ''
					, filetype: ''
					, data: ''
				};

				var fileObj = document.getElementById(fileInputId);

				if ( !Utils.isCanUploadFileAsync || !fileObj ) {
					return uri;
				}

				if ( window.URL.createObjectURL ) {
					var fileItems = fileObj.files;
					if (fileItems.length > 0) {
						var u = fileItems.item(0);
						uri.data = u;
						uri.url = window.URL.createObjectURL(u);
						uri.filename = u.name || '';
					}
				} else { // IE
					var u = document.getElementById(fileInputId).value;
					uri.url = u;
					var pos1 = u.lastIndexOf('/');
					var pos2 = u.lastIndexOf('\\');
					var pos = Math.max(pos1, pos2)
					if (pos < 0)
						uri.filename = u;
					else
						uri.filename = u.substring(pos + 1);
				}
				var index = uri.filename.lastIndexOf(".");
				if ( index != -1 ) {
					uri.filetype = uri.filename.substring(index+1).toLowerCase();
				}
				return uri;
			}

			, getFileSizeFn: function ( fileInputId ) {
				var file = document.getElementById(fileInputId)
				var fileSize = 0;
				if ( file ) {
					if ( file.files ) {
						if ( file.files.length > 0 ) {
							fileSize = file.files[0].size;
						}
					} else if ( file.select && 'ActiveXObject' in window ) {
						file.select();
						var fileobject = new ActiveXObject ("Scripting.FileSystemObject");
						var file = fileobject.GetFile (file.value);
						fileSize = file.Size;
					}
				}
				return fileSize;
			}

			, hasFlash: _hasFlash

			, trim: function ( str ) {

				str = typeof str === 'string' ? str : '';

				return str.trim
					? str.trim()
					: str.replace(/^\s|\s$/g, '');
			}

			, parseEmotions: function ( msg ) {
				if ( typeof Easemob.im.EMOTIONS === 'undefined' || typeof Easemob.im.EMOTIONS.map === 'undefined' ) {
					return msg;
				} else {
					var emotion = Easemob.im.EMOTIONS,
						reg = null;

					for ( var face in emotion.map ) {
						if ( emotion.map.hasOwnProperty(face) ) {
							while ( msg.indexOf(face) > -1 ) {
								msg = msg.replace(face, '<img class="em-emotion" src="' + emotion.path + emotion.map[face] + '" alt="表情">');
							}
						}
					}
					return msg;
				}
			}

			, parseLink: function ( msg ) {
				var reg = /(https?\:\/\/|www\.)([a-zA-Z0-9-]+(\.[a-zA-Z0-9]+)+)(\:[0-9]{2,4})?\/?((\.[:_0-9a-zA-Z-]+)|[:_0-9a-zA-Z-]*\/?)*\??[:_#@*&%0-9a-zA-Z-/=]*/gm;

				msg = msg.replace(reg, function ( v ) {

					var prefix = /^https?/gm.test(v);

					return "<a href='" 
						+ (prefix ? v : '//' + v)
						+ "' target='_blank'>" 
						+ v
						+ "</a>";

				});

				return msg;
			}

			, parseJSON: function ( data ) {

				if ( window.JSON && window.JSON.parse ) {
					return window.JSON.parse(data + "");
				}

				var requireNonComma,
					depth = null,
					str = Utils.trim(data + "");

				return str && !Utils.trim(
					str.replace(/(,)|(\[|{)|(}|])|"(?:[^"\\\r\n]|\\["\\\/bfnrt]|\\u[\da-fA-F]{4})*"\s*:?|true|false|null|-?(?!0\d)\d+(?:\.\d+|)(?:[eE][+-]?\d+|)/g
					, function ( token, comma, open, close ) {

						if ( requireNonComma && comma ) {
							depth = 0;
						}

						if ( depth === 0 ) {
							return token;
						}

						requireNonComma = open || comma;
						depth += !close - !open;
						return "";
					})
				)
				? (Function("return " + str))()
				: (Function("Invalid JSON: " + data))();
			}
			
			, parseUploadResponse: function ( response ) {
				return response.indexOf('callback') > -1 ? //lte ie9
					response.slice(9, -1) : response;
			}
			
			, parseDownloadResponse: function ( response ) {
				return ((response && response.type && response.type === 'application/json') 
					|| 0 > Object.prototype.toString.call(response).indexOf('Blob')) ? 
						this.url+'?token=' : window.URL.createObjectURL(response);
			}
			, uploadFile: function ( options ) {
				options = options || {};
				options.onFileUploadProgress = options.onFileUploadProgress || EMPTYFN;
				options.onFileUploadComplete = options.onFileUploadComplete || EMPTYFN;
				options.onFileUploadError = options.onFileUploadError || EMPTYFN;
				options.onFileUploadCanceled = options.onFileUploadCanceled || EMPTYFN;
				var acc = options.accessToken || this.context.accessToken;
				if (!acc) {
					options.onFileUploadError({
						type: EASEMOB_IM_UPLOADFILE_NO_LOGIN
						, msg: '用户未登录到usergrid服务器,无法使用文件上传功能'
						, id: options.id
					});
					return;
				}

				orgName = options.orgName || this.context.orgName || '';
				appName = options.appName || this.context.appName || '';
				appKey = options.appKey || this.context.appKey || '';
				if(!orgName && !appName && appKey){
					var devInfos = appKey.split('#');
					if(devInfos.length==2){
						orgName = devInfos[0];
						appName = devInfos[1];
					}
				}
				if ( !orgName && !appName ) {
					options.onFileUploadError({
						type: EASEMOB_IM_UPLOADFILE_ERROR
						, msg: '没有指定开发者信息'
						, id: options.id
					});
					return;
				}

				var apiUrl = options.apiUrl || 'http://a1.easemob.com';
				var uploadUrl = apiUrl + '/' + orgName + '/' + appName + '/chatfiles';

				if ( !Utils.isCanUploadFileAsync ) {
					if ( Utils.hasFlash && typeof options.flashUpload === 'function' ) {
						options.flashUpload && options.flashUpload(uploadUrl, options); 
					} else {
						this.onError({
							type : EASEMOB_IM_UPLOADFILE_BROWSER_ERROR
							, msg : '当前浏览器不支持异步上传！'
						});
					}
					return;
				}

				var fileSize = options.file.data ? options.file.data.size : undefined;
				if ( fileSize > EASEMOB_IM_FILESIZE_LIMIT ) {
					options.onFileUploadError({
						type: EASEMOB_IM_UPLOADFILE_ERROR
						, msg: '上传文件超过服务器大小限制（10M）'
						, id: options.id
					});
					return ;
				} else if ( fileSize <= 0 ) {
					options.onFileUploadError({
						type: EASEMOB_IM_UPLOADFILE_ERROR
						, msg: '上传文件大小为0'
						, id: options.id
					});
					return ;
				}

				var xhr = Utils.xmlrequest();
				var onError = function ( e ) {
					options.onFileUploadError({
						type: EASEMOB_IM_UPLOADFILE_ERROR
						, msg: '上传文件失败'
						, id: options.id
						, xhr: xhr
					});
				}
				if ( xhr.upload ) {
					xhr.upload.addEventListener("progress",options.onFileUploadProgress, false);
				}
				if ( xhr.addEventListener ) {
					xhr.addEventListener("abort", options.onFileUploadCanceled, false);
					xhr.addEventListener("load", function ( e ) {
						try {
							var json = Utils.parseJSON(xhr.responseText);
							options.onFileUploadComplete(json);
						} catch ( e ) {
							options.onFileUploadError({
								type: EASEMOB_IM_UPLOADFILE_ERROR
								, msg: '上传文件失败,服务端返回值值不正确'
								, data: xhr.responseText
								, id: options.id
								, xhr: xhr
							});
						}
					}, false);
					xhr.addEventListener("error", onError, false);
				} else if ( xhr.onreadystatechange ) {
					xhr.onreadystatechange = function () {
						if ( xhr.readyState === 4 ) {
							if ( ajax.status === 200 ) {
								try {
									var json = Utils.parseJSON(xhr.responseText);
									options.onFileUploadComplete(json);
								} catch ( e ) {
									options.onFileUploadError({
										type: EASEMOB_IM_UPLOADFILE_ERROR
										, msg: '上传文件失败,服务端返回值不正确'
										, data: xhr.responseText
										, id: options.id
										, xhr: xhr
									});
								}
							} else {
								options.onFileUploadError({
									type: EASEMOB_IM_UPLOADFILE_ERROR
									, msg: '上传文件失败,服务端返回异常'
									, data: xhr.responseText
									, id: options.id
									, xhr: xhr
								});
							}
						} else {
							xhr.abort();
							options.onFileUploadCanceled();
						}
					}
				}

				xhr.open("POST", uploadUrl);

				xhr.setRequestHeader('restrict-access', 'true');
				xhr.setRequestHeader('Accept', '*/*');//android qq browser has some problem at this attr
				xhr.setRequestHeader('Authorization', 'Bearer ' + acc);

				var formData = new FormData();
				formData.append("file", options.file.data);
				xhr.send(formData);
			}

			, downloadFn: function ( options ) {
				options.onFileDownloadComplete = options.onFileDownloadComplete || EMPTYFN;
				options.onFileDownloadError = options.onFileDownloadError || EMPTYFN;
				
				var accessToken = options.accessToken || '';
				if ( !accessToken ) {
					options.onFileDownloadError({
						type: EASEMOB_IM_DOWNLOADFILE_NO_LOGIN
						, msg: '用户未登录到usergrid服务器,无法使用文件下载功能'
						, id: options.id
					});
					return;
				}

				var onError = function ( e ) {
					options.onFileDownloadError({
						type: EASEMOB_IM_DOWNLOADFILE_ERROR
						, msg: '下载文件失败'
						, id: options.id
						, xhr: xhr
					});
				}
				if ( !Utils.isCanDownLoadFile ) {
					options.onFileDownloadComplete();
					return;
				}
				var xhr = Utils.xmlrequest();
				if ( "addEventListener" in xhr ) {
					xhr.addEventListener("load", function ( e ) {
						options.onFileDownloadComplete(xhr.response,xhr);
					}, false);
					xhr.addEventListener("error", onError, false);
				} else if ( "onreadystatechange" in xhr ) {
					xhr.onreadystatechange = function () {
						if ( xhr.readyState === 4 ) {
							if ( ajax.status === 200 ) {
								options.onFileDownloadComplete(xhr.response,xhr);
							} else {
								options.onFileDownloadError({
									type: EASEMOB_IM_DOWNLOADFILE_ERROR
									, msg: '下载文件失败,服务端返回异常'
									, id: options.id
									, xhr: xhr
								});
							}
						} else {
							xhr.abort();
							options.onFileDownloadError({
								type: EASEMOB_IM_DOWNLOADFILE_ERROR
								, msg: '错误的下载状态,退出下载'
								, id: options.id
								, xhr: xhr
							});
						}
					}
				}

				var method = options.method || 'GET';
				var resType = options.responseType || 'blob';
				var mimeType = options.mimeType || "text/plain; charset=x-user-defined";
				xhr.open(method, options.url);
				if ( typeof Blob !== 'undefined' ) {
					xhr.responseType = resType;
				} else {
					xhr.overrideMimeType(mimeType);
				}

				var innerHeaer = {
					'X-Requested-With': 'XMLHttpRequest'
					, 'Accept': 'application/octet-stream'
					, 'share-secret': options.secret
					, 'Authorization': 'Bearer ' + accessToken
				};
				var headers = options.headers || {};
				for ( var key in headers ) {
					innerHeaer[key] = headers[key];
				}
				for ( var key in innerHeaer ) {
					if ( innerHeaer[key] ) {
						xhr.setRequestHeader(key, innerHeaer[key]);
					}
				}
				xhr.send(null);
			}

			, parseTextMessage: function ( message, faces ) {
				if ( typeof message !== 'string' ) {
					conn.onError({
						type: EASEMOB_IM_MESSAGE_REC_TEXT_ERROR
						, msg: '不合法的消息内容格式，请检查发送消息内容！'
					});
					return;
				}
				if ( Object.prototype.toString.call(faces) !== '[object Object]' ) {
					return {
						isemotion: false
						, body: [
							{
								type: "txt"
								, data: message
							}
						]
					};
				}

				var receiveMsg = message;
				var emessage = [];
				var expr = /\[[^[\]]{2,3}\]/mg;
				var emotions = receiveMsg.match(expr);

				if ( !emotions || emotions.length < 1 ){
					return {
						isemotion: false
						, body: [
							{
								type: "txt"
								, data: message
							}
						]
					};
				}
				var isemotion = false;
				for ( var i = 0; i < emotions.length; i++ ) {
					var tmsg = receiveMsg.substring(0, receiveMsg.indexOf(emotions[i])),
						existEmotion = Easemob.im.EMOTIONS.map[emotions[i]];

					if ( tmsg ) {
						emessage.push({
							type: "txt"
							, data: tmsg
						});
					}
					if ( !existEmotion ) {
						emessage.push({
							type: "txt"
							, data: emotions[i]
						});
						continue;
					}
					var emotion = Easemob.im.EMOTIONS.map ? Easemob.im.EMOTIONS.path + existEmotion : null;

					if ( emotion ) {
						isemotion = true;
						emessage.push({
							type: 'emotion'
							, data: emotion
						});
					} else {
						emessage.push({
							type: 'txt'
							, data: emotions[i]
						});
					}
					var restMsgIndex = receiveMsg.indexOf(emotions[i]) + emotions[i].length;
					receiveMsg = receiveMsg.substring(restMsgIndex);
				}
				if ( receiveMsg ) {
					emessage.push({
						type: 'txt'
						, data: receiveMsg
					});
				}
				if ( isemotion ) {
					return {
						isemotion: isemotion
						, body: emessage
					};
				}
				return {
					isemotion: false
					, body: [
						{
							type: "txt"
							, data: message
						}
					]
				};
			}

			, xmlrequest: _xmlrequest

			, ajax: function ( options ) {
				var dataType = options.dataType || 'text';
				var suc = options.success || EMPTYFN;
				var error = options.error || EMPTYFN;
				var xhr = Utils.xmlrequest();

				xhr.onreadystatechange = function () {
					if ( xhr.readyState === 4 ) {
						var status = xhr.status || 0;
						if ( status === 200 ) {
							if ( dataType === 'text' ) {
								suc(xhr.responseText,xhr);
								return;
							}
							if ( dataType === 'json' ) {
								try {
									var json = Utils.parseJSON(xhr.responseText);
									suc(json,xhr);
								} catch ( e ) {
									error(xhr.responseText,xhr,"错误的数据,无法转换为json");
								}
								return;
							}
							if ( dataType === 'xml' ) {
								if ( xhr.responseXML && xhr.responseXML.documentElement ) {
									suc(xhr.responseXML.documentElement,xhr);
								} else {
									error(xhr.responseText,xhr,"浏览器不支持ajax返回xml对象");
								}
								return;
							}
							suc(xhr.response || xhr.responseText,xhr);
							return;
						} else {
							if ( dataType === 'json' ) {
								try {
									var json = Utils.parseJSON(xhr.responseText);
									error(json,xhr,"服务器返回错误信息");
								} catch ( e ) {
									error(xhr.responseText,xhr,"服务器返回错误信息");
								}
								return;
							}
							if ( dataType === 'xml' ) {
								if ( xhr.responseXML && xhr.responseXML.documentElement ) {
									error(xhr.responseXML.documentElement,xhr,"服务器返回错误信息");
								} else {
									error(xhr.responseText,xhr,"服务器返回错误信息");
								}
								return;
							}
							error(xhr.responseText,xhr,"服务器返回错误信息");
							return;
						}
					}
					if ( xhr.readyState === 0 ) {
						error(xhr.responseText,xhr,"服务器异常");
					}
				};

				if ( options.responseType ) {
					if ( xhr.responseType ) {
						xhr.responseType = options.responseType;
					} else {
						error('', xhr, "当前浏览器不支持设置响应类型");
						return null;
					}
				}
				if ( options.mimeType ) {
					if ( Utils.hasOverrideMimeType ) {
						xhr.overrideMimeType(options.mimeType);
					} else {
						error('', xhr, "当前浏览器不支持设置mimeType");
						return null;
					}
				}

				var type = options.type || "POST",
					data = options.data || null,
					tempData = '';

				if ( type.toLowerCase() === 'get' && data ) {
					for ( var o in data ) {
						if ( data.hasOwnProperty(o) ) {
							tempData += o + '=' + data[o] + '&';
						}
					}
					tempData = tempData ? tempData.slice(0, -1) : tempData;
					options.url += (options.url.indexOf('?') > 0 ? '&' : '?') + (tempData ? tempData + '&' : tempData) + '_v=' + new Date().getTime();
					data = null, tempData = null;
				}
				xhr.open(type, options.url);

				if ( Utils.isCanSetRequestHeader ) {
					var headers = options.headers || {};
					for ( var key in headers ) {
						if ( headers.hasOwnProperty(key) ) {
							xhr.setRequestHeader(key, headers[key]);
						}
					}
				}

				xhr.send(data);
				return xhr;
			}
		};
	}());



	/**
	 * Module2: EmMessage: Various types of messages
	 */
	var EmMessage = function ( type, id ) {
		if ( !this instanceof EmMessage ) {
			return new EmMessage(type);
		}

		this._msg = {};

		if ( typeof EmMessage[type] === 'function' ) {
			EmMessage[type].prototype.setGroup = this.setGroup;
			this._msg = new EmMessage[type](id);
		}
		return this._msg;
	}
	EmMessage.prototype.setGroup = function ( group ) {
		this.body.group = group;
	}



	/**
	 *  Module3: Message
	 */
	var _msgHash = {};
	var Message = function ( message ) {

		if( !this instanceof Message ) {
			return new Message(message, conn);
		}
		
		this.msg = message;
	}

	Message.prototype.send = function ( conn ) {
		var me = this;

		var _send = function ( message ) {

			message.ext = message.ext || {};
			message.ext.weichat = message.ext.weichat || {};
			message.ext.weichat.originType = message.ext.weichat.originType || 'webim';

			var json = {
				from: conn.context.userId || ''
				, to: message.to
				, bodies: [message.body]
				, ext: message.ext || {}
			};

			var jsonstr = Utils.stringify(json);
			var dom = $msg({
				type: message.group || 'chat'
				, to: message.toJid
				, id: message.id
				, xmlns: "jabber:client"
			}).c("body").t(jsonstr);

			if ( message.roomType ) {
				dom.up().c("roomtype", { xmlns: "easemob:x:roomtype", type: "chatroom" });
			}

			setTimeout(function () {
				if ( _msgHash[message.id] ) {
					_msgHash[message.id].msg.fail instanceof Function 
					&& _msgHash[message.id].msg.fail(message.id);
				}
			}, 60000);
			conn.sendCommand(dom.tree(), message.id);
		}


		if ( me.msg.file ) {
			if ( me.msg.body && me.msg.body.url ) {//only send msg
				_send(me.msg);
				return;
			}
			var _tmpComplete = me.msg.onFileUploadComplete;
			var _complete = function ( data ) {

				if ( data.entities[0]['file-metadata'] ) {
					var file_len = data.entities[0]['file-metadata']['content-length'];
					me.msg.file_length = file_len;
					me.msg.filetype = data.entities[0]['file-metadata']['content-type'];
					if ( file_len > 204800 ) {
						me.msg.thumbnail = true;
					}
				}
				
				me.msg.body = {
					type: me.msg.type || 'file'
					, url: data.uri + '/' + data.entities[0]['uuid']
					, secret: data.entities[0]['share-secret']
					, filename: me.msg.file.filename || me.msg.filename
					, size: {
						width: me.msg.width || 0
						, height: me.msg.height || 0
					}
					, length: me.msg.file_length || 0
					, file_length: me.msg.file_length || 0
					, filetype: me.msg.filetype
				}

				_send(me.msg);
				_tmpComplete instanceof Function && _tmpComplete(data, me.msg.id);
			};

			me.msg.onFileUploadComplete = _complete;
			Utils.uploadFile.call(conn, me.msg);
		} else {
			me.msg.body = {
				type: me.msg.type === 'chat' ? 'txt' : me.msg.type
				, msg: me.msg.msg 
			};
			if ( me.msg.type === 'cmd' ) {
				me.msg.body.action = me.msg.action;
			} else if ( me.msg.type === 'loc' ) {
				me.msg.body.addr = me.msg.addr;
				me.msg.body.lat = me.msg.lat;
				me.msg.body.lng = me.msg.lng;
			}

			_send(me.msg);
		}
	}


	/*
	 * CONST	 
	*/
	var EMPTYFN = function() {};

	tempIndex = 0;
	EASEMOB_IM_CONNCTION_USER_NOT_ASSIGN_ERROR = tempIndex++;
	EASEMOB_IM_CONNCTION_OPEN_ERROR = tempIndex++;
	EASEMOB_IM_CONNCTION_AUTH_ERROR = tempIndex++;
	EASEMOB_IM_CONNCTION_OPEN_USERGRID_ERROR = tempIndex++;
	EASEMOB_IM_CONNCTION_ATTACH_ERROR = tempIndex++;
	EASEMOB_IM_CONNCTION_ATTACH_USERGRID_ERROR = tempIndex++;
	EASEMOB_IM_CONNCTION_REOPEN_ERROR = tempIndex++;
	EASEMOB_IM_CONNCTION_SERVER_CLOSE_ERROR = tempIndex++;
	EASEMOB_IM_CONNCTION_SERVER_ERROR = tempIndex++;
	EASEMOB_IM_CONNCTION_IQ_ERROR = tempIndex++;
	EASEMOB_IM_CONNCTION_PING_ERROR = tempIndex++;
	EASEMOB_IM_CONNCTION_NOTIFYVERSION_ERROR = tempIndex++;
	EASEMOB_IM_CONNCTION_GETROSTER_ERROR = tempIndex++;
	EASEMOB_IM_CONNCTION_CROSSDOMAIN_ERROR = tempIndex++;
	EASEMOB_IM_CONNCTION_LISTENING_OUTOF_MAXRETRIES = tempIndex++;
	EASEMOB_IM_CONNCTION_RECEIVEMSG_CONTENTERROR = tempIndex++;
	EASEMOB_IM_CONNCTION_JOINROOM_ERROR = tempIndex++;
	EASEMOB_IM_CONNCTION_GETROOM_ERROR = tempIndex++;
	EASEMOB_IM_CONNCTION_GETROOMINFO_ERROR = tempIndex++;
	EASEMOB_IM_CONNCTION_GETROOMMEMBER_ERROR = tempIndex++;
	EASEMOB_IM_CONNCTION_GETROOMOCCUPANTS_ERROR = tempIndex++;
	
	EASEMOB_IM_UPLOADFILE_BROWSER_ERROR = tempIndex++;
	EASEMOB_IM_UPLOADFILE_ERROR = tempIndex++;
	EASEMOB_IM_UPLOADFILE_NO_LOGIN = tempIndex++;
	EASEMOB_IM_UPLOADFILE_NO_FILE = tempIndex++;
	EASEMOB_IM_DOWNLOADFILE_ERROR = tempIndex++;
	EASEMOB_IM_DOWNLOADFILE_NO_LOGIN = tempIndex++;
	EASEMOB_IM_DOWNLOADFILE_BROWSER_ERROR = tempIndex++;

	EASEMOB_IM_RESISTERUSER_ERROR = tempIndex++;

	EASEMOB_IM_LOAD_CHATROOM_ERROR = tempIndex++;
	EASEMOB_IM_JOIN_CHATROOM_ERROR = tempIndex++;
	EASEMOB_IM_QUIT_CHATROOM_ERROR = tempIndex++;

	tempIndex = 0;
	EASEMOB_IM_MESSAGE_REC_TEXT = tempIndex++;
	EASEMOB_IM_MESSAGE_REC_TEXT_ERROR = tempIndex++;
	EASEMOB_IM_MESSAGE_REC_EMOTION = tempIndex++;
	EASEMOB_IM_MESSAGE_REC_PHOTO = tempIndex++;
	EASEMOB_IM_MESSAGE_REC_AUDIO = tempIndex++;
	EASEMOB_IM_MESSAGE_REC_AUDIO_FILE = tempIndex++;
	EASEMOB_IM_MESSAGE_REC_VEDIO = tempIndex++;
	EASEMOB_IM_MESSAGE_REC_VEDIO_FILE = tempIndex++;
	EASEMOB_IM_MESSAGE_REC_FILE = tempIndex++;

	EASEMOB_IM_MESSAGE_SED_TEXT = tempIndex++;
	EASEMOB_IM_MESSAGE_SED_EMOTION = tempIndex++;
	EASEMOB_IM_MESSAGE_SED_PHOTO = tempIndex++;
	EASEMOB_IM_MESSAGE_SED_AUDIO = tempIndex++;
	EASEMOB_IM_MESSAGE_SED_AUDIO_FILE = tempIndex++;
	EASEMOB_IM_MESSAGE_SED_VEDIO = tempIndex++;
	EASEMOB_IM_MESSAGE_SED_VEDIO_FILE = tempIndex++;
	EASEMOB_IM_MESSAGE_SED_FILE = tempIndex++;
	EASEMOB_IM_FILESIZE_LIMIT = 10485760;


	tempIndex = 0;
	var STATUS_INIT = tempIndex++;
	var STATUS_DOLOGIN_USERGRID = tempIndex++;
	var STATUS_DOLOGIN_IM = tempIndex++;
	var STATUS_OPENED = tempIndex++;
	var STATUS_CLOSING = tempIndex++;
	var STATUS_CLOSED = tempIndex++;

	delete tempIndex;



	Easemob.im.EmMessage = EmMessage;
	Easemob.im.Helper = Easemob.im.Utils = Utils;
	window.Easemob = Easemob;

}(window, undefined));
