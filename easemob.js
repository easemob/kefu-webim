window.URL=window.URL||window.webkitURL||window.mozURL||window.msURL,Array.prototype.indexOf||(Array.prototype.indexOf=function(e){var t=this.length,o=Number(arguments[1])||0;for(o=0>o?Math.ceil(o):Math.floor(o),0>o&&(o+=t);t>o;o++)if(o in this&&this[o]===e)return o;return-1}),String.prototype.trim||(String.prototype.trim=function(){return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,"")}),Array.prototype.forEach||(Array.prototype.forEach=function(e,t){var o,i;if(null===this)throw new TypeError("this is null or not defined");var n=Object(this),s=n.length>>>0;if("function"!=typeof e)throw new TypeError(e+" is not a function");for(arguments.length>1&&(o=t),i=0;s>i;){var a;i in n&&(a=n[i],e.call(o,a,i,n)),i++}}),function(e){"use strict";e.console||(e.console={});for(var t,o,i=e.console,n=function(){},s=["memory"],a="assert,clear,count,debug,dir,dirxml,error,exception,group,groupCollapsed,groupEnd,info,log,markTimeline,profile,profiles,profileEnd,show,table,time,timeEnd,timeline,timelineEnd,timeStamp,trace,warn".split(",");t=s.pop();)i[t]||(i[t]={});for(;o=a.pop();)i[o]||(i[o]=n)}("undefined"==typeof window?this:window),function(){function e(e){var t=Object.prototype.toString.call(e);return"object"==typeof e&&/^\[object (HTMLCollection|NodeList|Object)\]$/.test(t)&&"number"==typeof e.length&&(0===e.length||"object"==typeof e[0]&&e[0].nodeType>0)}function t(e,t){i(e,t)||(e.className+=" "+t)}function o(e,t){i(e,t)&&(e.className=(" "+e.className+" ").replace(new RegExp(" "+t+" ","g")," ").trim())}function i(e,t){return!!~(" "+e.className+" ").indexOf(" "+t+" ")}function n(t,o){if("function"==typeof o){var i,n,s,a=e(t)?t:[t],r=[];for(i=2,n=arguments.length;n>i;++i)r.push(arguments[i]);for(i=0,n=a.length;n>i;++i)(s=a[i])&&o.apply(null,[s].concat(r))}}function s(e,t,o,i){e.addEventListener?e.addEventListener(t,o,i):e.attachEvent&&(e["_"+t]=function(){o.apply(e,arguments)},e.attachEvent("on"+t,e["_"+t]))}function a(e,t,o){var i="_"+t,n="on"+t;e.removeEventListener&&o?e.removeEventListener(t,o):e.detachEvent&&(e.detachEvent(n,e[i]),delete e[i])}function r(e,t){if(e){var o,i,n=document.createElement("div"),s=document.createDocumentFragment();for(n.innerHTML=t,o=n.childNodes,i=o[0];o.length>0;)s.appendChild(o[0]);return e.appendChild(s),i}}window.easemobim=window.easemobim||{};var c=/mobile/i.test(navigator.userAgent),d=/Trident\/4\.0/.test(navigator.userAgent);easemobim.utils={isTop:window.top===window.self,isNodeList:e,isAndroid:/android/i.test(navigator.userAgent),isQQBrowser:/MQQBrowser/i.test(navigator.userAgent),isIOS:/(iPad|iPhone|iPod)/i.test(navigator.userAgent),isMobile:c,click:c&&"ontouchstart"in window?"touchstart":"click",isBrowserMinimized:function(){return"hidden"===document.visibilityState||document.hidden},appendHTMLTo:r,appendHTMLToBody:function(e){return r(document.body,e)},createElementFromHTML:function(e){var t=document.createElement("div");return t.innerHTML=e,t.childNodes[0]},addCssRules:function(e){var t=document.createElement("style");return d?(t.setAttribute("type","text/css"),t.styleSheet.cssText=e,void document.querySelector("head").appendChild(t)):(t.styleSheet?t.styleSheet.cssText=e:t.appendChild(document.createTextNode(e)),void document.head.appendChild(t))},getBrief:function(e,t){return"string"!=typeof e?"":e.length>t?e.slice(0,t)+"...":e},formatDate:function(e,t){var o=e?new Date(e):new Date,i=t||"M月d日 hh:mm",n={"M+":o.getMonth()+1,"d+":o.getDate(),"h+":o.getHours(),"m+":o.getMinutes(),"s+":o.getSeconds()};/(y+)/.test(i)&&(i=i.replace(RegExp.$1,(o.getFullYear()+"").substr(4-RegExp.$1.length)));for(var s in n)new RegExp("("+s+")").test(i)&&(i=i.replace(RegExp.$1,1===RegExp.$1.length?n[s]:("00"+n[s]).substr((""+n[s]).length)));return i},filesizeFormat:function(e){var t,o,i=["B","KB","MB","GB","TB","PB","EB","ZB"];return e>0?(t=Math.floor(Math.log(e)/Math.log(1024)),o=(e/Math.pow(1024,t)).toFixed(2)+" "+i[t]):o=0===e?"0 B":"",o},uuid:function(){for(var e=[],t="0123456789abcdef",o=0;36>o;o++)e[o]=t.substr(Math.floor(16*Math.random()),1);return e[14]="4",e[19]=t.substr(3&e[19]|8,1),e[8]=e[13]=e[18]=e[23]="-",e.join("")},convertFalse:function(e){return e="undefined"==typeof e?"":e,"false"===e?!1:e},removeDom:function(e){e&&(e.remove?e.remove():e.parentNode&&e.parentNode.removeChild(e))},live:function(e,t,o,i){var n=this,s=i||document;n.on(s,t,function(t){var i,n,a,r=t||window.event,c=r.target||r.srcElement,d=c.parentNode,m=s.querySelectorAll(e);for(i=0,n=m.length;n>i;++i)a=m[i],a===c?o.call(c,r):a===d&&o.call(d,r)})},on:function(e,t,o,i){t.split(" ").forEach(function(t){t&&n(e,s,t,o,i)})},off:function(e,t,o){t.split(" ").forEach(function(t){t&&n(e,a,t,o)})},one:function(e,t,o,i){if(e&&t){var n=function(){o.apply(this,arguments),a(e,t,n)};s(e,t,n,i)}},trigger:function(e,t){if(document.createEvent){var o=document.createEvent("HTMLEvents");o.initEvent(t,!0,!1),e.dispatchEvent(o)}else e.fireEvent("on"+t)},extend:function(e,t){for(var o in t)if(t.hasOwnProperty(o)){var i=t[o],n=Object.prototype.toString.call(i);void 0===i?e[o]=i:"[object Array]"===n?(e[o]=[],this.extend(e[o],i)):"[object Object]"===n?(e[o]={},this.extend(e[o],i)):e[o]=i}return e},addClass:function(e,o){return n(e,t,o),e},removeClass:function(e,t){return n(e,o,t),e},hasClass:function(e,t){return e?i(e,t):!1},toggleClass:function(e,n,s){if(e&&n){var a="undefined"==typeof s?!i(e,n):s;a?t(e,n):o(e,n)}},getDataByPath:function(e,t){function o(){var e=i.shift();return"string"!=typeof e?n:"object"==typeof n&&null!==n?(n=n[e],o()):void 0}var i=t.split("."),n=e;return o()},query:function(e){var t=new RegExp("[?&]"+e+"=([^&]*)(?=&|$)"),o=t.exec(location.search);return o?o[1]:""},setStore:function(e,t){try{localStorage.setItem(e,t)}catch(o){}},getStore:function(e){try{return localStorage.getItem(e)}catch(t){}},clearStore:function(e){try{localStorage.removeItem(e)}catch(t){}},clearAllStore:function(){try{localStorage.clear()}catch(e){}},set:function(e,t,o){var i=new Date,n=i.getTime()+24*(o||30)*3600*1e3;i.setTime(n),document.cookie=encodeURIComponent(e)+"="+encodeURIComponent(t)+";path=/;expires="+i.toGMTString()},get:function(e){var t=document.cookie.match("(^|;) ?"+encodeURIComponent(e)+"=([^;]*)(;|$)");return t?decodeURIComponent(t[2]):""},getAvatarsFullPath:function(e,t){if(e){e=e.replace(/^(https?:)?\/\/?/,"");var o=~e.indexOf("img-cn"),i=~e.indexOf("ossimages");return o&&!i?t+"/ossimages/"+e:"//"+e}},copy:function(e){return this.extend({},e)}}}(),easemobim._const=function(){return{loadingSvg:['<div class="em-widget-loading">','<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 70 70">','<circle opacity=".3" fill="none" stroke="#000" stroke-width="4" stroke-miterlimit="10" cx="35" cy="35" r="11"/>','<path fill="none" stroke="#E5E5E5" stroke-width="4" stroke-linecap="round" stroke-miterlimit="10" d="M24 35c0-6.1 4.9-11 11-11 2.8 0 5.3 1 7.3 2.8"/>',"</svg>","</div>"].join(""),agentStatusText:{Idle:"(离线)",Online:"(空闲)",Busy:"(忙碌)",Leave:"(离开)",Hidden:"(隐身)",Offline:"(离线)",Logout:"(离线)",Other:""},eventMessageText:{NOTE:"当前暂无客服在线，请您留下联系方式，稍后我们将主动联系您"},SYSTEM_EVENT_MSG_TEXT:{ServiceSessionCreatedEvent:"会话创建成功",ServiceSessionClosedEvent:"会话已结束",ServiceSessionTransferedEvent:"会话已被转接至其他客服",ServiceSessionTransferedToAgentQueueEvent:"会话转接中，请稍候",ServiceSessionOpenedEvent:"会话已被客服接起"},SYSTEM_EVENT:{SESSION_CREATED:"ServiceSessionCreatedEvent",SESSION_OPENED:"ServiceSessionOpenedEvent",SESSION_CLOSED:"ServiceSessionClosedEvent",SESSION_TRANSFERED:"ServiceSessionTransferedEvent",SESSION_TRANSFERING:"ServiceSessionTransferedToAgentQueueEvent",SESSION_RESTORED:"session.restored",SESSION_NOT_CREATED:"session.not.created",AGENT_INFO_UPDATE:"agent.info.update",OFFICIAL_ACCOUNT_SWITCHED:"official.account.switched",NEW_OFFICIAL_ACCOUNT_FOUND:"new.official.account.found",SYSTEM_OFFICIAL_ACCOUNT_UPDATED:"system.official.account.updated",OFFICIAL_ACCOUNT_LIST_GOT:"official.account.list.got",MARKETING_MESSAGE_RECEIVED:"marketing.message.received",SATISFACTION_EVALUATION_MESSAGE_RECEIVED:"satisfaction.evaluation.message.received",CHAT_WINDOW_OPENED:"chat.window.opened",CHAT_WINDOW_CLOSED:"chat.window.closed",MESSAGE_SENT:"message.sent",MESSAGE_APPENDED:"message.appended",block:null},themeMap:{"天空之城":"theme-1","丛林物语":"theme-2","红瓦洋房":"theme-3","鲜美橙汁":"theme-4","青草田间":"theme-5","湖光山色":"theme-6","冷峻山峰":"theme-7","月色池塘":"theme-8","天籁湖光":"theme-9","商务风格":"theme-10"},IM:{WEBIM_CONNCTION_OPEN_ERROR:1,WEBIM_CONNCTION_AUTH_ERROR:2,WEBIM_CONNCTION_AJAX_ERROR:17,WEBIM_CONNCTION_CALLBACK_INNER_ERROR:31},EVENTS:{NOTIFY:"notify",RECOVERY:"recoveryTitle",SHOW:"showChat",CLOSE:"closeChat",CACHEUSER:"setUser",DRAGREADY:"dragReady",DRAGEND:"dragEnd",SLIDE:"titleSlide",ONMESSAGE:"onMessage",ONSESSIONCLOSED:"onSessionClosed",EXT:"ext",TEXTMSG:"textmsg",ONREADY:"onready",ON_OFFDUTY:"onOffDuty",SET_ITEM:"setItem",UPDATE_URL:"updateURL",REQUIRE_URL:"requireURL",INIT_CONFIG:"initConfig",SHOW_IMG:"showIMG",RESIZE_IFRAME:"resizeIframe",ADD_PROMPT:"add.prompt",REMOVE_PROMPT:"remove.prompt",block:null},GRAY_LIST_KEYS:["audioVideo","msgPredictEnable","waitListNumberEnable","agentInputStateEnable"],ERROR_MSG:{VISITOR_DOES_NOT_EXIST:"visitor does not exist.",SESSION_DOES_NOT_EXIST:"session does not exist.",block:null},SESSION_STATE:{WAIT:"Wait",PROCESSING:"Processing",TERMINAL:"Terminal",ABORT:"Abort",RESOLVED:"Resolved",PREPARE:"Prepare"},AGENT_ROLE:{AGENT:1,ROBOT:6},UPLOAD_FILESIZE_LIMIT:10485760,FIRST_CHANNEL_MESSAGE_TIMEOUT:1e4,FIRST_CHANNEL_IMG_MESSAGE_TIMEOUT:15e3,SECOND_MESSAGE_CHANNEL_MAX_RETRY_COUNT:1,FIRST_CHANNEL_CONNECTION_TIMEOUT:2e4,HEART_BEAT_INTERVAL:6e4,SECOND_CHANNEL_MESSAGE_RECEIVE_INTERVAL:6e4,MESSAGE_PREDICT_MAX_LENGTH:100,MAX_TEXT_MESSAGE_LENGTH:1500,GET_HISTORY_MESSAGE_COUNT_EACH_TIME:10,AGENT_INPUT_STATE_INTERVAL:1e3,MESSAGE_TIME_SPAN_INTERVAL:6e4,for_block_only:null}}(),window.easemobim=window.easemobim||{},window.easemobIM=window.easemobIM||{},easemobIM.Transfer=easemobim.Transfer=function(){"use strict";var e=function(){var e=!0;try{window.postMessage({toString:function(){e=!1}},"*")}catch(t){}return e}(),t=function(e,t,o){var i,n,s,a=!1,r=e.data;if("object"==typeof r)i=r;else if("string"==typeof r){try{i=JSON.parse(r)}catch(c){}if("object"!=typeof i)return}if(o&&o.length)for(n=0,s=o.length;s>n;n++)i.key===o[n]&&(a=!0,"function"==typeof t&&t(i));else"function"==typeof t&&t(i);if(!a&&o)for(n=0,s=o.length;s>n;n++)if("data"===o[n]){"function"==typeof t&&t(i);break}},o=function(e,t,i){return this instanceof o?(this.key=t,this.iframe=document.getElementById(e),this.origin=location.protocol+"//"+location.host,void(this.useObject=i)):new o(e)};return o.prototype.send=function(t,o){return t.origin=this.origin,t.key=this.key,this.to?t.to=this.to:o&&(t.to=o),e&&(this.useObject||t.useObject)||(t=JSON.stringify(t)),this.iframe?this.iframe.contentWindow.postMessage(t,"*"):window.parent.postMessage(t,"*"),this},o.prototype.listen=function(e,o){var i=this;return window.addEventListener?window.addEventListener("message",function(n){t.call(i,n,e,o)},!1):window.attachEvent&&window.attachEvent("onmessage",function(n){t.call(i,n,e,o)}),this},o}(),easemobim.notify=function(){var e=0;return function(t,o,i){if(0===e&&(e=setTimeout(function(){e=0},3e3),window.Notification))if("granted"===Notification.permission){var n=new Notification(o||"",{icon:t||"",body:i||""});n.onclick=function(){"function"==typeof window.focus&&window.focus(),this.close(),"object"==typeof easemobim.titleSlide&&easemobim.titleSlide.stop()},setTimeout(function(){n.close()},3e3)}else Notification.requestPermission()}}(),easemobim.titleSlide=function(){var e,t="新消息提醒",o=0,i=document.title,n=(i+t).split("");return{stop:function(){clearInterval(o),o=0,document.title=i},start:function(){o||(o=setInterval(function(){e=n.shift(),document.title=e+Array.prototype.join.call(n,""),n.push(e)},360))}}}(),easemobim.pcImgView=function(e){var t=e.appendHTMLToBody(['<div class="easemobim-pc-img-view">','<div class="shadow"></div>',"<img>","</div>"].join("")),o=t.querySelector("img");return e.on(t,"click",function(){t.style.display="none"},!1),function(e){var i,n=e.imgFile;i=n?window.URL.createObjectURL(n):e.imgSrc,o.src=i,t.style.display="block"}}(easemobim.utils),easemobim.loading=function(e,t){var o=t.appendHTMLToBody(['<div class="easemobim-prompt-wrapper">','<div class="loading">',e.loadingSvg,"</div>","</div>"].join(""));return{show:function(){o.style.display="block"},hide:function(){o.style.display="none"}}}(easemobim._const,easemobim.utils),easemobim.Iframe=function(e,t,o){"use strict";function i(e,t){var o=window.event||t,i=document.documentElement.clientWidth,s=document.documentElement.clientHeight,a=i-o.clientX-e.rect.width+c.x,d=s-o.clientY-e.rect.height+c.y;o.clientX-c.x<=0?a=i-e.rect.width:o.clientX+e.rect.width-c.x>=i&&(a=0),o.clientY-c.y<=0?d=s-e.rect.height:o.clientY+e.rect.height-c.y>=s&&(d=0),e.shadow.style.left="auto",e.shadow.style.top="auto",e.shadow.style.right=a+"px",e.shadow.style.bottom=d+"px",e.position={x:a,y:d},clearTimeout(r),r=setTimeout(function(){n.call(e)},500)}function n(){var t=this,o=t.iframe,i=t.shadow;e.off(document,"mousemove",t._onMouseMove),o.style.left="auto",o.style.top="auto",o.style.right=t.position.x+"px",o.style.bottom=t.position.y+"px",i.style.left="auto",i.style.top="auto",i.style.right=t.position.x+"px",i.style.bottom=t.position.y+"px",e.removeClass(i,"easemobim-dragging"),e.removeClass(o,"easemobim-dragging")}function s(t){e.on(window,"resize",function(){if(t.rect&&t.rect.width){var e=document.documentElement.clientWidth,o=document.documentElement.clientHeight,i=+t.iframe.style.right.slice(0,-2),n=+t.iframe.style.bottom.slice(0,-2);e<t.rect.width?(t.iframe.style.left="auto",t.iframe.style.right=0,t.shadow.style.left="auto",t.shadow.style.right=0):e-i<t.rect.width?(t.iframe.style.right=e-t.rect.width+"px",t.iframe.style.left=0,t.shadow.style.right=e-t.rect.width+"px",t.shadow.style.left=0):(t.iframe.style.left="auto",t.shadow.style.left="auto"),o<t.rect.height?(t.iframe.style.top="auto",t.iframe.style.bottom=0):o-n<t.rect.height?(t.iframe.style.bottom=o-t.rect.height+"px",t.iframe.style.top=0):t.iframe.style.top="auto"}})}function a(){var i=this;i.config.dragenable&&!e.isMobile&&s(i),i.message=new easemobim.Transfer(i.iframe.id,"easemob",!0),i.onsessionclosedSt=0,i.onreadySt=0,i.config.parentId=i.iframe.id,i.callbackApi={onready:i.config.onready||d,onmessage:i.config.onmessage||d,onsessionclosed:i.config.onsessionclosed||d},delete i.config.onready,delete i.config.onmessage,delete i.config.onsessionclosed,i.message.send({event:t.EVENTS.INIT_CONFIG,data:i.config}).listen(function(s){if(s.to===i.iframe.id){var a=s.event,r=s.data;switch(a){case t.EVENTS.ONREADY:clearTimeout(i.onreadySt),o.hide(),i.onreadySt=setTimeout(function(){i.callbackApi.onready()},500);break;case t.EVENTS.ON_OFFDUTY:o.hide();break;case t.EVENTS.SHOW:i.open();break;case t.EVENTS.CLOSE:i.close();break;case t.EVENTS.NOTIFY:easemobim.notify(r.avatar,r.title,r.brief);break;case t.EVENTS.SLIDE:easemobim.titleSlide.start();break;case t.EVENTS.RECOVERY:easemobim.titleSlide.stop();break;case t.EVENTS.ONMESSAGE:i.callbackApi.onmessage(r);break;case t.EVENTS.ONSESSIONCLOSED:clearTimeout(i.onsessionclosedSt),i.onsessionclosedSt=setTimeout(function(){i.callbackApi.onsessionclosed()},500);break;case t.EVENTS.CACHEUSER:r.username&&e.set((i.config.to||"")+i.config.tenantId+(i.config.emgroup||""),r.username);break;case t.EVENTS.DRAGREADY:c.x=+r.x||0,c.y=+r.y||0,e.addClass(i.iframe,"easemobim-dragging"),e.addClass(i.shadow,"easemobim-dragging"),e.on(document,"mousemove",i._onMouseMove);break;case t.EVENTS.DRAGEND:n.call(i);break;case t.EVENTS.SET_ITEM:e.setStore(s.data.key,s.data.value);break;case t.EVENTS.REQUIRE_URL:i.message.send({event:t.EVENTS.UPDATE_URL,data:location.href});break;case t.EVENTS.SHOW_IMG:easemobim.pcImgView(r);break;case t.EVENTS.RESET_IFRAME:i.config.dialogWidth=r.dialogWidth,i.config.dialogHeight=r.dialogHeight,i.config.dialogPosition=r.dialogPosition,i._updatePosition();break;case t.EVENTS.ADD_PROMPT:e.addClass(i.iframe,"easemobim-has-prompt");break;case t.EVENTS.REMOVE_PROMPT:e.removeClass(i.iframe,"easemobim-has-prompt")}}},["main"]),"function"==typeof i.ready&&i.ready()}var r=0,c={x:0,y:0},d=function(){},m=function(t){if(!(this instanceof m))return new m(t);var o,s=this,r="easemob-iframe-"+e.uuid(),c="easemobim-chat-panel easemobim-hide easemobim-minimized",d=document.createElement("iframe");return e.isMobile&&(c+=" easemobim-mobile"),d.frameBorder=0,d.allowTransparency="true",d.id=r,d.className=c,document.body.appendChild(d),e.on(d,"load",function(){a.call(s)}),e.isMobile||(o=document.createElement("div"),o.className="easemobim-iframe-shadow",document.body.appendChild(o),e.on(o,"mouseup",function(){n.call(s)})),s.config=e.copy(t),s.iframe=d,s.shadow=o,s.show=!1,s._onMouseMove=function(e){i(s,e)},m.iframe=s,s};return m.prototype.set=function(t,o){var i=location.protocol+this.config.staticPath+"/img/drag.png";return this.config=e.copy(t||this.config),this.config.user.username||(this.config.isUsernameFromCookie=!0,this.config.user.username=e.get((this.config.to||"")+this.config.tenantId+(this.config.emgroup||""))),this.config.guestId=e.getStore("guestId"),this.position={x:this.config.dialogPosition.x.slice(0,-2),y:this.config.dialogPosition.y.slice(0,-2)},this.rect={width:+this.config.dialogWidth.slice(0,-2),height:+this.config.dialogHeight.slice(0,-2)},this._updatePosition(),e.toggleClass(this.iframe,"easemobim-hide",this.config.hide),this.iframe.src=location.protocol+t.path+"/im.html",this.shadow&&(this.shadow.style.backgroundImage="url("+i+")"),this.ready=o,this},m.prototype._updatePosition=function(){var e=this.iframe,t=this.shadow,o=this.config;e.style.width=o.dialogWidth,e.style.height=o.dialogHeight,e.style.right=o.dialogPosition.x,e.style.bottom=o.dialogPosition.y,t&&(t.style.width=o.dialogWidth,t.style.height=o.dialogHeight,t.style.right=o.dialogPosition.x,t.style.bottom=o.dialogPosition.y)},m.prototype.open=function(){this.iframe;if(!this.show)return this.show=!0,e.isMobile&&(e.addClass(document.body,"easemobim-mobile-body"),e.addClass(document.documentElement,"easemobim-mobile-html")),e.removeClass(this.iframe,"easemobim-minimized"),e.removeClass(this.iframe,"easemobim-hide"),this.message&&this.message.send({event:t.EVENTS.SHOW}),this},m.prototype.close=function(){return this.show!==!1?(this.show=!1,clearTimeout(r),e.isMobile&&(e.removeClass(document.body,"easemobim-mobile-body"),e.removeClass(document.documentElement,"easemobim-mobile-html")),e.addClass(this.iframe,"easemobim-minimized"),e.toggleClass(this.iframe,"easemobim-hide",this.config.hide),this.message&&this.message.send({event:t.EVENTS.CLOSE}),this):void 0},m.prototype.send=function(e){this.message.send({event:t.EVENTS.EXT,data:e})},m.prototype.sendText=function(e){this.message.send({event:t.EVENTS.TEXTMSG,data:e})},m}(easemobim.utils,easemobim._const,easemobim.loading),function(e,t){"use strict";function o(){d=n.copy(c),n.extend(d,easemobim.config),l=n.copy(d);var e=""!==n.convertFalse(l.hide)?l.hide:m.json.hide,t=""!==n.convertFalse(l.resources)?l.resources:m.json.resources,o=""!==n.convertFalse(l.satisfaction)?l.satisfaction:m.json.sat;l.tenantId=l.tenantId||m.json.tenantId,l.configId=l.configId||m.json.configId,l.hide=n.convertFalse(e),l.resources=n.convertFalse(t),l.satisfaction=n.convertFalse(o),l.domain=l.domain||m.domain,l.path=l.path||m.domain+"/webim",l.staticPath=l.staticPath||m.domain+"/webim/static"}function i(){for(var e,t={},o=document.scripts,i=0,n=o.length;n>i;i++)if(~o[i].src.indexOf("easemob.js")){e=o[i].src;break}if(!e)return{json:t,domain:""};for(var s,a=e.indexOf("?"),r=~e.indexOf("//")?e.indexOf("//"):0,c=e.slice(r,e.indexOf("/",r+2)),d=e.slice(a+1).split("&"),m=0,l=d.length;l>m;m++)s=d[m].split("="),t[s[0]]=s.length>1?decodeURIComponent(s[1]):"";return{json:t,domain:c}}var n=easemobim.utils,s=easemobim.loading,a=".easemobim-mobile-html{position:static!important;width:100%!important;height:100%!important;padding:0!important;margin:0!important}.easemobim-mobile-body{position:fixed!important;top:0!important;right:0!important;bottom:0!important;left:0!important;width:100%!important;height:100%!important;overflow:hidden!important;padding:0!important;margin:0!important}.easemobim-mobile-body>*{display:none!important}.easemobim-mobile-body>.easemobim-chat-panel{display:block!important}.easemobim-chat-panel{z-index:16777269;overflow:hidden;position:fixed;bottom:10px;right:-5px;border:none;width:0;height:0;-webkit-transition:all .01s;transition:all .01s;box-shadow:0 4px 8px rgba(0,0,0,.2);border-radius:4px}.easemobim-chat-panel.easemobim-minimized{left:auto;top:auto;right:-5px;bottom:10px;border:none;box-shadow:none;height:37px!important;width:104px!important}.easemobim-chat-panel.easemobim-minimized.easemobim-has-prompt{width:360px!important;height:270px!important}.easemobim-chat-panel.easemobim-mobile{width:100%!important;height:100%!important;left:0!important;top:0!important;right:auto!important;bottom:auto!important;border-radius:0;box-shadow:none}.easemobim-chat-panel.easemobim-mobile.easemobim-minimized{height:0!important;width:0!important}.easemobim-chat-panel.easemobim-hide{visibility:hidden;width:1px!important;height:1px!important;border:none}.easemobim-chat-panel.easemobim-dragging{display:none}.easemobim-iframe-shadow{left:auto;top:auto;display:none;cursor:move;z-index:16777270;position:fixed;border:none;box-shadow:0 4px 8px rgba(0,0,0,.2);border-radius:4px;background-size:100% 100%;background-repeat:no-repeat}.easemobim-iframe-shadow.easemobim-dragging{display:block}.easemobim-prompt-wrapper{display:none;z-index:16777271;position:fixed;width:30px;height:30px;padding:10px;top:0;bottom:0;margin:auto;left:0;right:0;color:#fff;background-color:#000;text-align:center;border-radius:4px;-webkit-transition:all .5s;transition:all .5s;opacity:.7}.easemobim-prompt-wrapper>.loading{position:relative;width:30px;height:30px;display:inline-block;overflow:hidden;margin:0;padding:0;-webkit-animation:easemobim-loading-frame 1s linear infinite;animation:easemobim-loading-frame 1s linear infinite}@-webkit-keyframes easemobim-loading-frame{0%{-webkit-transform:rotate(0);transform:rotate(0)}to{-webkit-transform:rotate(1turn);transform:rotate(1turn)}}@keyframes easemobim-loading-frame{0%{-webkit-transform:rotate(0);transform:rotate(0)}to{-webkit-transform:rotate(1turn);transform:rotate(1turn)}}.easemobim-pc-img-view{display:none;position:fixed;top:0;left:0;width:100%;height:100%;z-index:16777270}.easemobim-pc-img-view>.shadow{position:fixed;top:0;left:0;width:100%;height:100%;background-color:#000;background-color:rgba(0,0,0,.7);filter:progid:DXImageTransform.Microsoft.Alpha(Opacity=70)}.easemobim-pc-img-view>img{max-width:100%;max-height:100%;position:absolute;margin:auto;top:0;right:0;bottom:0;left:0}";n.addCssRules(a),easemobim.config=easemobim.config||{},easemobim.version="47.13.2",easemobim.tenants={};var r,c={tenantId:"",to:"",agentName:"",appKey:"",domain:"",path:"",ticket:!0,staticPath:"",buttonText:"联系客服",dialogWidth:"360px",dialogHeight:"550px",dragenable:!0,minimum:!0,soundReminder:!0,dialogPosition:{x:"10px",y:"10px"},user:{username:"",password:"",token:""}},d=n.copy(c),m=i(),l={};if(o(),easemobim.config.grUserId=n.get("gr_user_id"),e.easemobIM=function(e){easemobim.bind({emgroup:e})},e.easemobIMS=function(e,t){easemobim.bind({tenantId:e,emgroup:t})},easemobim.bind=function(e){e=e||{},e.emgroup=e.emgroup||easemobim.config.emgroup||"";var t=e.tenantId+e.emgroup;for(var i in easemobim.tenants)easemobim.tenants.hasOwnProperty(i)&&easemobim.tenants[i].close();if(r=easemobim.tenants[t])r.open();else{if(s.show(),o(),n.extend(l,e),!l.tenantId)return void console.error("未指定tenantId!");r=easemobim.Iframe(l),easemobim.tenants[t]=r,r.set(l,r.open)}},easemobim.sendExt=function(e){r?r.send({ext:e}):console.error("The chat window is not initialized.")},easemobim.sendText=function(e){r?r.sendText(e):console.error("The chat window is not initialized.")},(!l.hide||l.autoConnect||l.eventCollector)&&(l.tenantId||l.configId)&&!n.isMobile){var u=d.tenantId+(d.emgroup||"");r=easemobim.tenants[u]||easemobim.Iframe(l),easemobim.tenants[u]=r,r.set(l,r.close),easemobim.config.eventCollector=!1}"object"==typeof module&&"object"==typeof module.exports?module.exports=easemobim:"function"==typeof define&&define.amd&&define("easemob-kefu-webim-plugin",[],function(){return easemobim})}(window,void 0);