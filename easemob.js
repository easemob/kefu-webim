window.URL=window.URL||window.webkitURL||window.mozURL||window.msURL,Array.prototype.indexOf||(Array.prototype.indexOf=function(e){var t=this.length,i=Number(arguments[1])||0;for(i=0>i?Math.ceil(i):Math.floor(i),0>i&&(i+=t);t>i;i++)if(i in this&&this[i]===e)return i;return-1}),String.prototype.trim||(String.prototype.trim=function(){return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,"")}),Array.prototype.forEach||(Array.prototype.forEach=function(e,t){var i,o;if(null===this)throw new TypeError("this is null or not defined");var n=Object(this),s=n.length>>>0;if("function"!=typeof e)throw new TypeError(e+" is not a function");for(arguments.length>1&&(i=t),o=0;s>o;){var a;o in n&&(a=n[o],e.call(i,a,o,n)),o++}}),function(e){"use strict";e.console||(e.console={});for(var t,i,o=e.console,n=function(){},s=["memory"],a="assert,clear,count,debug,dir,dirxml,error,exception,group,groupCollapsed,groupEnd,info,log,markTimeline,profile,profiles,profileEnd,show,table,time,timeEnd,timeline,timelineEnd,timeStamp,trace,warn".split(",");t=s.pop();)o[t]||(o[t]={});for(;i=a.pop();)o[i]||(o[i]=n)}("undefined"==typeof window?this:window),function(){function e(e){var t=Object.prototype.toString.call(e);return"object"==typeof e&&/^\[object (HTMLCollection|NodeList|Object)\]$/.test(t)&&"number"==typeof e.length&&(0===e.length||"object"==typeof e[0]&&e[0].nodeType>0)}function t(e,t){o(e,t)||(e.className+=" "+t)}function i(e,t){o(e,t)&&(e.className=(" "+e.className+" ").replace(new RegExp(" "+t+" ","g")," ").trim())}function o(e,t){return!!~(" "+e.className+" ").indexOf(" "+t+" ")}function n(t,i){if("function"==typeof i){var o,n,s,a=e(t)?t:[t],r=[];for(o=2,n=arguments.length;n>o;++o)r.push(arguments[o]);for(o=0,n=a.length;n>o;++o)(s=a[o])&&i.apply(null,[s].concat(r))}}function s(e,t,i,o){e.addEventListener?e.addEventListener(t,i,o):e.attachEvent&&(e["_"+t]=function(){i.apply(e,arguments)},e.attachEvent("on"+t,e["_"+t]))}function a(e,t,i){var o="_"+t,n="on"+t;e.removeEventListener&&i?e.removeEventListener(t,i):e.detachEvent&&(e.detachEvent(n,e[o]),delete e[o])}function r(e,t){if(e){var i,o,n=document.createElement("div"),s=document.createDocumentFragment();for(n.innerHTML=t,i=n.childNodes,o=i[0];i.length>0;)s.appendChild(i[0]);return e.appendChild(s),o}}window.easemobim=window.easemobim||{};var c=/mobile/i.test(navigator.userAgent),d=/Trident\/4\.0/.test(navigator.userAgent);easemobim.utils={isTop:window.top===window.self,isNodeList:e,isAndroid:/android/i.test(navigator.useragent),isIOS:/(iPad|iPhone|iPod)/i.test(navigator.userAgent),isMobile:c,click:c&&"ontouchstart"in window?"touchstart":"click",isBrowserMinimized:function(){return"hidden"===document.visibilityState||document.hidden},appendHTMLTo:r,appendHTMLToBody:function(e){return r(document.body,e)},createElementFromHTML:function(e){var t=document.createElement("div");return t.innerHTML=e,t.childNodes[0]},addCssRules:function(e){var t=document.createElement("style");return d?(t.setAttribute("type","text/css"),t.styleSheet.cssText=e,void document.querySelector("head").appendChild(t)):(t.styleSheet?t.styleSheet.cssText=e:t.appendChild(document.createTextNode(e)),void document.head.appendChild(t))},getBrief:function(e,t){return"string"!=typeof e?"":e.length>t?e.slice(0,t)+"...":e},formatDate:function(e,t){var i=e?new Date(e):new Date,o=t||"M月d日 hh:mm",n={"M+":i.getMonth()+1,"d+":i.getDate(),"h+":i.getHours(),"m+":i.getMinutes(),"s+":i.getSeconds()};/(y+)/.test(o)&&(o=o.replace(RegExp.$1,(i.getFullYear()+"").substr(4-RegExp.$1.length)));for(var s in n)new RegExp("("+s+")").test(o)&&(o=o.replace(RegExp.$1,1===RegExp.$1.length?n[s]:("00"+n[s]).substr((""+n[s]).length)));return o},filesizeFormat:function(e){var t,i,o=["B","KB","MB","GB","TB","PB","EB","ZB"];return e>0?(t=Math.floor(Math.log(e)/Math.log(1024)),i=(e/Math.pow(1024,t)).toFixed(2)+" "+o[t]):i=0===e?"0 B":"",i},uuid:function(){for(var e=[],t="0123456789abcdef",i=0;36>i;i++)e[i]=t.substr(Math.floor(16*Math.random()),1);return e[14]="4",e[19]=t.substr(3&e[19]|8,1),e[8]=e[13]=e[18]=e[23]="-",e.join("")},convertFalse:function(e){return e="undefined"==typeof e?"":e,"false"===e?!1:e},removeDom:function(e){e&&(e.remove?e.remove():e.parentNode&&e.parentNode.removeChild(e))},live:function(e,t,i,o){var n=this,s=o||document;n.on(s,t,function(t){var o,n,a,r=t||window.event,c=r.target||r.srcElement,d=c.parentNode,l=s.querySelectorAll(e);for(o=0,n=l.length;n>o;++o)a=l[o],a===c?i.call(c,r):a===d&&i.call(d,r)})},on:function(e,t,i,o){t.split(" ").forEach(function(t){t&&n(e,s,t,i,o)})},off:function(e,t,i){t.split(" ").forEach(function(t){t&&n(e,a,t,i)})},one:function(e,t,i,o){if(e&&t){var n=function(){i.apply(this,arguments),a(e,t,n)};s(e,t,n,o)}},trigger:function(e,t){if(document.createEvent){var i=document.createEvent("HTMLEvents");i.initEvent(t,!0,!1),e.dispatchEvent(i)}else e.fireEvent("on"+t)},extend:function(e,t){for(var i in t)if(t.hasOwnProperty(i)){var o=t[i],n=Object.prototype.toString.call(o);void 0===o?e[i]=o:"[object Array]"===n?(e[i]=[],this.extend(e[i],o)):"[object Object]"===n?(e[i]={},this.extend(e[i],o)):e[i]=o}return e},addClass:function(e,i){return n(e,t,i),e},removeClass:function(e,t){return n(e,i,t),e},hasClass:function(e,t){return e?o(e,t):!1},toggleClass:function(e,n,s){if(e&&n){var a="undefined"==typeof s?!o(e,n):s;a?t(e,n):i(e,n)}},getDataByPath:function(e,t){function i(){var e=o.shift();return"string"!=typeof e?n:"object"==typeof n&&null!==n?(n=n[e],i()):void 0}var o=t.split("."),n=e;return i()},query:function(e){var t=new RegExp("[?&]"+e+"=([^&]*)(?=&|$)"),i=t.exec(location.search);return i?i[1]:""},setStore:function(e,t){try{localStorage.setItem(e,t)}catch(i){}},getStore:function(e){try{return localStorage.getItem(e)}catch(t){}},clearStore:function(e){try{localStorage.removeItem(e)}catch(t){}},clearAllStore:function(){try{localStorage.clear()}catch(e){}},set:function(e,t,i){var o=new Date,n=o.getTime()+24*(i||30)*3600*1e3;o.setTime(n),document.cookie=encodeURIComponent(e)+"="+encodeURIComponent(t)+";path=/;expires="+o.toGMTString()},get:function(e){var t=document.cookie.match("(^|;) ?"+encodeURIComponent(e)+"=([^;]*)(;|$)");return t?decodeURIComponent(t[2]):""},getAvatarsFullPath:function(e,t){if(e){e=e.replace(/^(https?:)?\/\/?/,"");var i=~e.indexOf("img-cn"),o=~e.indexOf("ossimages");return i&&!o?t+"/ossimages/"+e:"//"+e}},copy:function(e){return this.extend({},e)}}}(),easemobim._const=function(){return{loadingSvg:['<div class="em-widget-loading">','<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 70 70">','<circle opacity=".3" fill="none" stroke="#000" stroke-width="4" stroke-miterlimit="10" cx="35" cy="35" r="11"/>','<path fill="none" stroke="#E5E5E5" stroke-width="4" stroke-linecap="round" stroke-miterlimit="10" d="M24 35c0-6.1 4.9-11 11-11 2.8 0 5.3 1 7.3 2.8"/>',"</svg>","</div>"].join(""),agentStatusText:{Idle:"(离线)",Online:"(空闲)",Busy:"(忙碌)",Leave:"(离开)",Hidden:"(隐身)",Offline:"(离线)",Logout:"(离线)",Other:""},eventMessageText:{NOTE:"当前暂无客服在线，请您留下联系方式，稍后我们将主动联系您"},SYSTEM_EVENT_MSG_TEXT:{ServiceSessionCreatedEvent:"会话创建成功",ServiceSessionClosedEvent:"会话已结束",ServiceSessionTransferedEvent:"会话已被转接至其他客服",ServiceSessionTransferedToAgentQueueEvent:"会话转接中，请稍候",ServiceSessionOpenedEvent:"会话已被客服接起"},SYSTEM_EVENT:{SESSION_CREATED:"ServiceSessionCreatedEvent",SESSION_OPENED:"ServiceSessionOpenedEvent",SESSION_CLOSED:"ServiceSessionClosedEvent",SESSION_TRANSFERED:"ServiceSessionTransferedEvent",SESSION_TRANSFERING:"ServiceSessionTransferedToAgentQueueEvent",SESSION_RESTORED:"session.restored",SESSION_NOT_CREATED:"session.not.created",AGENT_INFO_UPDATE:"agent.info.update",OFFICIAL_ACCOUNT_SWITCHED:"official.account.switched",NEW_OFFICIAL_ACCOUNT_FOUND:"new.official.account.found",SYSTEM_OFFICIAL_ACCOUNT_UPDATED:"system.official.account.updated",OFFICIAL_ACCOUNT_LIST_GOT:"official.account.list.got",MARKETING_MESSAGE_RECEIVED:"marketing.message.received",SATISFACTION_EVALUATION_MESSAGE_RECEIVED:"satisfaction.evaluation.message.received",CHAT_WINDOW_OPENED:"chat.window.opened",CHAT_WINDOW_CLOSED:"chat.window.closed",MESSAGE_SENT:"message.sent",MESSAGE_APPENDED:"message.appended",block:null},themeMap:{"天空之城":"theme-1","丛林物语":"theme-2","红瓦洋房":"theme-3","鲜美橙汁":"theme-4","青草田间":"theme-5","湖光山色":"theme-6","冷峻山峰":"theme-7","月色池塘":"theme-8","天籁湖光":"theme-9","商务风格":"theme-10"},IM:{WEBIM_CONNCTION_OPEN_ERROR:1,WEBIM_CONNCTION_AUTH_ERROR:2,WEBIM_CONNCTION_AJAX_ERROR:17,WEBIM_CONNCTION_CALLBACK_INNER_ERROR:31},EVENTS:{NOTIFY:"notify",RECOVERY:"recoveryTitle",SHOW:"showChat",CLOSE:"closeChat",CACHEUSER:"setUser",DRAGREADY:"dragReady",DRAGEND:"dragEnd",SLIDE:"titleSlide",ONMESSAGE:"onMessage",ONSESSIONCLOSED:"onSessionClosed",EXT:"ext",TEXTMSG:"textmsg",ONREADY:"onready",ON_OFFDUTY:"onOffDuty",SET_ITEM:"setItem",UPDATE_URL:"updateURL",REQUIRE_URL:"requireURL",INIT_CONFIG:"initConfig",SHOW_IMG:"showIMG",RESIZE_IFRAME:"resizeIframe"},GRAY_LIST_KEYS:["audioVideo","msgPredictEnable","waitListNumberEnable","agentInputStateEnable"],ERROR_MSG:{VISITOR_DOES_NOT_EXIST:"visitor does not exist.",SESSION_DOES_NOT_EXIST:"session does not exist.",block:null},SESSION_STATE:{WAIT:"Wait",PROCESSING:"Processing",TERMINAL:"Terminal",ABORT:"Abort",RESOLVED:"Resolved",PREPARE:"Prepare"},AGENT_ROLE:{AGENT:1,ROBOT:6},UPLOAD_FILESIZE_LIMIT:10485760,FIRST_CHANNEL_MESSAGE_TIMEOUT:1e4,FIRST_CHANNEL_IMG_MESSAGE_TIMEOUT:15e3,SECOND_MESSAGE_CHANNEL_MAX_RETRY_COUNT:1,FIRST_CHANNEL_CONNECTION_TIMEOUT:2e4,HEART_BEAT_INTERVAL:6e4,SECOND_CHANNEL_MESSAGE_RECEIVE_INTERVAL:6e4,MESSAGE_PREDICT_MAX_LENGTH:100,MAX_TEXT_MESSAGE_LENGTH:1500,GET_HISTORY_MESSAGE_COUNT_EACH_TIME:10,AGENT_INPUT_STATE_INTERVAL:1e3,MESSAGE_TIME_SPAN_INTERVAL:6e4,for_block_only:null}}(),window.easemobim=window.easemobim||{},window.easemobIM=window.easemobIM||{},easemobIM.Transfer=easemobim.Transfer=function(){"use strict";var e=function(){var e=!0;try{window.postMessage({toString:function(){e=!1}},"*")}catch(t){}return e}(),t=function(e,t,i){var o,n,s,a=!1,r=e.data;if("object"==typeof r)o=r;else if("string"==typeof r){try{o=JSON.parse(r)}catch(c){}if("object"!=typeof o)return}if(i&&i.length)for(n=0,s=i.length;s>n;n++)o.key===i[n]&&(a=!0,"function"==typeof t&&t(o));else"function"==typeof t&&t(o);if(!a&&i)for(n=0,s=i.length;s>n;n++)if("data"===i[n]){"function"==typeof t&&t(o);break}},i=function(e,t,o){return this instanceof i?(this.key=t,this.iframe=document.getElementById(e),this.origin=location.protocol+"//"+location.host,void(this.useObject=o)):new i(e)};return i.prototype.send=function(t,i){return t.origin=this.origin,t.key=this.key,this.to?t.to=this.to:i&&(t.to=i),e&&(this.useObject||t.useObject)||(t=JSON.stringify(t)),this.iframe?this.iframe.contentWindow.postMessage(t,"*"):window.parent.postMessage(t,"*"),this},i.prototype.listen=function(e,i){var o=this;return window.addEventListener?window.addEventListener("message",function(n){t.call(o,n,e,i)},!1):window.attachEvent&&window.attachEvent("onmessage",function(n){t.call(o,n,e,i)}),this},i}(),easemobim.notify=function(){var e=0;return function(t,i,o){if(0===e&&(e=setTimeout(function(){e=0},3e3),window.Notification))if("granted"===Notification.permission){var n=new Notification(i||"",{icon:t||"",body:o||""});n.onclick=function(){"function"==typeof window.focus&&window.focus(),this.close(),"object"==typeof easemobim.titleSlide&&easemobim.titleSlide.stop()},setTimeout(function(){n.close()},3e3)}else Notification.requestPermission()}}(),easemobim.titleSlide=function(){var e,t="新消息提醒",i=0,o=document.title,n=(o+t).split("");return{stop:function(){clearInterval(i),i=0,document.title=o},start:function(){i||(i=setInterval(function(){e=n.shift(),document.title=e+Array.prototype.join.call(n,""),n.push(e)},360))}}}(),easemobim.pcImgView=function(e){var t=e.appendHTMLToBody(['<div class="easemobim-pc-img-view">','<div class="shadow"></div>',"<img>","</div>"].join("")),i=t.querySelector("img");return e.on(t,"click",function(){t.style.display="none"},!1),function(e){var o,n=e.imgFile;o=n?window.URL.createObjectURL(n):e.imgSrc,i.src=o,t.style.display="block"}}(easemobim.utils),easemobim.loading=function(e,t){var i=t.appendHTMLToBody(['<div class="easemobim-prompt-wrapper">','<div class="loading">',e.loadingSvg,"</div>","</div>"].join(""));return{show:function(){i.style.display="block"},hide:function(){i.style.display="none"}}}(easemobim._const,easemobim.utils),function(e,t,i){"use strict";function o(e){var t=this,i=window.event||e,o=document.documentElement.clientWidth,s=document.documentElement.clientHeight,a=o-i.clientX-t.rect.width+c.x,d=s-i.clientY-t.rect.height+c.y;i.clientX-c.x<=0?a=o-t.rect.width:i.clientX+t.rect.width-c.x>=o&&(a=0),i.clientY-c.y<=0?d=s-t.rect.height:i.clientY+t.rect.height-c.y>=s&&(d=0),t.shadow.style.left="auto",t.shadow.style.top="auto",t.shadow.style.right=a+"px",t.shadow.style.bottom=d+"px",t.position={x:a,y:d},clearTimeout(r),r=setTimeout(function(){n.call(t)},500)}function n(){var t=this,i=t.iframe,o=t.shadow;e.off(document,"mousemove",t.moveEv),i.style.left="auto",i.style.top="auto",i.style.right=t.position.x+"px",i.style.bottom=t.position.y+"px",i.style.display="block",o.style.left="auto",o.style.top="auto",o.style.right=t.position.x+"px",o.style.bottom=t.position.y+"px",o.style.display="none"}function s(){var t=this;e.on(window,"resize",function(){if(t.rect&&t.rect.width){var e=document.documentElement.clientWidth,i=document.documentElement.clientHeight,o=Number(t.iframe.style.right.slice(0,-2)),n=Number(t.iframe.style.bottom.slice(0,-2));e<t.rect.width?(t.iframe.style.left="auto",t.iframe.style.right=0,t.shadow.style.left="auto",t.shadow.style.right=0):e-o<t.rect.width?(t.iframe.style.right=e-t.rect.width+"px",t.iframe.style.left=0,t.shadow.style.right=e-t.rect.width+"px",t.shadow.style.left=0):(t.iframe.style.left="auto",t.shadow.style.left="auto"),i<t.rect.height?(t.iframe.style.top="auto",t.iframe.style.bottom=0):i-n<t.rect.height?(t.iframe.style.bottom=i-t.rect.height+"px",t.iframe.style.top=0):t.iframe.style.top="auto"}})}function a(){var a=this;a.config.dragenable&&!e.isMobile&&(s.call(a),e.on(a.shadow,"mouseup",function(){n.call(a)})),a.message=new easemobim.Transfer(a.iframe.id,"easemob",!0),a.iframe.style.display="block",a.onsessionclosedSt=0,a.onreadySt=0,a.config.parentId=a.iframe.id,a.callbackApi={onready:a.config.onready||d,onmessage:a.config.onmessage||d,onsessionclosed:a.config.onsessionclosed||d},delete a.config.onready,delete a.config.onmessage,delete a.config.onsessionclosed,a.message.send({event:t.EVENTS.INIT_CONFIG,data:a.config}).listen(function(s){if(s.to===a.iframe.id)switch(s.event){case t.EVENTS.ONREADY:clearTimeout(a.onreadySt),i.hide(),a.onreadySt=setTimeout(function(){a.callbackApi.onready()},500);break;case t.EVENTS.ON_OFFDUTY:i.hide();break;case t.EVENTS.SHOW:a.open();break;case t.EVENTS.CLOSE:a.close();break;case t.EVENTS.NOTIFY:easemobim.notify(s.data.avatar,s.data.title,s.data.brief);break;case t.EVENTS.SLIDE:easemobim.titleSlide.start();break;case t.EVENTS.RECOVERY:easemobim.titleSlide.stop();break;case t.EVENTS.ONMESSAGE:a.callbackApi.onmessage(s.data);break;case t.EVENTS.ONSESSIONCLOSED:clearTimeout(a.onsessionclosedSt),a.onsessionclosedSt=setTimeout(function(){a.callbackApi.onsessionclosed()},500);break;case t.EVENTS.CACHEUSER:s.data.username&&e.set((a.config.to||"")+a.config.tenantId+(a.config.emgroup||""),s.data.username);break;case t.EVENTS.DRAGREADY:c.x=isNaN(Number(s.data.x))?0:Number(s.data.x),c.y=isNaN(Number(s.data.y))?0:Number(s.data.y),a.shadow.style.display="block",a.iframe.style.display="none",a.moveEv||(a.moveEv=function(e){o.call(a,e)}),e.on(document,"mousemove",a.moveEv);break;case t.EVENTS.DRAGEND:n.call(a);break;case t.EVENTS.SET_ITEM:e.setStore(s.data.key,s.data.value);break;case t.EVENTS.REQUIRE_URL:a.message.send({event:t.EVENTS.UPDATE_URL,data:location.href});break;case t.EVENTS.SHOW_IMG:easemobim.pcImgView(s.data);break;case t.EVENTS.RESET_IFRAME:a.resetIframe(s.data)}},["main"]),a.ready instanceof Function&&a.ready()}var r=0,c={x:0,y:0},d=function(){},l=function(t){var i=this;return this instanceof l?(this.iframe=document.createElement("iframe"),this.iframe.id="easemob-iframe-"+(new Date).getTime(),this.iframe.className="easemobim-panel",this.iframe.style.cssText="width: 0;height: 0;border: none; position: fixed;",this.shadow=document.createElement("div"),this.config=e.copy(t),this.show=!1,document.body.appendChild(this.iframe),document.body.appendChild(this.shadow),e.on(this.iframe,"load",function(){a.call(i)}),l.iframe=this,this):new l(t)};l.prototype.set=function(t,i){return this.config=e.copy(t||this.config),this.config.user.username||(this.config.isUsernameFromCookie=!0,this.config.user.username=e.get((this.config.to||"")+this.config.tenantId+(this.config.emgroup||""))),this.config.guestId=e.getStore("guestId"),this.position={x:this.config.dialogPosition.x.slice(0,-2),y:this.config.dialogPosition.y.slice(0,-2)},this.rect={width:+this.config.dialogWidth.slice(0,-2),height:+this.config.dialogHeight.slice(0,-2)},this.iframe.frameBorder=0,this.iframe.allowTransparency="true",this.iframe.style.cssText=["z-index:16777269","overflow:hidden","position:fixed","bottom:10px","right:-5px","border:none","width:"+this.config.dialogWidth,"height:0","display:none","transition:all .01s"].join(";"),this.shadow.style.cssText=["display:none","cursor:move","z-index:16777270","position:fixed","bottom:"+this.config.dialogPosition.y,"right:"+this.config.dialogPosition.x,"border:none","width:"+this.config.dialogWidth,"height:"+this.config.dialogHeight,"border-radius:4px","box-shadow: 0 4px 8px rgba(0,0,0,.2)","border-radius: 4px","background-size: 100% 100%","background: url("+location.protocol+this.config.staticPath+"/img/drag.png) no-repeat"].join(";"),this.config.hide||e.isMobile?(this.iframe.style.height="0",this.iframe.style.width="0"):(this.iframe.style.height="37px",this.iframe.style.width="104px"),this.iframe.src=location.protocol+t.path+"/im.html",this.ready=i,this},l.prototype.resetIframe=function(t){this.config.dialogWidth=t.dialogWidth,this.config.dialogHeight=t.dialogHeight,this.config.dialogPosition=t.dialogPosition,this.show&&!e.isMobile&&(this.iframe.style.width=this.config.dialogWidth,this.iframe.style.height=this.config.dialogHeight,this.iframe.style.right=this.config.dialogPosition.x,this.iframe.style.bottom=this.config.dialogPosition.y)},l.prototype.open=function(){var i=this.iframe;if(!this.show)return this.show=!0,e.isMobile&&(e.addClass(document.body,"easemobim-mobile-body"),e.addClass(document.documentElement,"easemobim-mobile-html")),e.isMobile?(i.style.width="100%",i.style.height="100%",i.style.left="0",i.style.top="0",i.style.right="auto",i.style.bottom="auto",i.style.borderRadius="0",i.style.cssText+="box-shadow: none;"):(i.style.width=this.config.dialogWidth,i.style.height=this.config.dialogHeight,i.style.right=this.position.x+"px",i.style.bottom=this.position.y+"px",i.style.cssText+="box-shadow: 0 4px 8px rgba(0,0,0,.2);border-radius: 4px;border: 1px solid #ccc\\9;"),i.style.visibility="visible",this.message&&this.message.send({event:t.EVENTS.SHOW}),this},l.prototype.close=function(){var i=this.iframe;if(this.show!==!1)return this.show=!1,e.isMobile&&(e.removeClass(document.body,"easemobim-mobile-body"),e.removeClass(document.documentElement,"easemobim-mobile-html")),clearTimeout(r),this.config.hide||e.isMobile?(i.style.visibility="hidden",i.style.width="1px",i.style.height="1px"):(i.style.boxShadow="none",i.style.borderRadius="4px;",i.style.left="auto",i.style.top="auto",i.style.right="-5px",i.style.bottom="10px",i.style.border="none",i.style.height="37px",i.style.width="104px"),this.message&&this.message.send({event:t.EVENTS.CLOSE}),this},l.prototype.send=function(e){this.message.send({event:t.EVENTS.EXT,data:e})},l.prototype.sendText=function(e){this.message.send({event:t.EVENTS.TEXTMSG,data:e})},easemobim.Iframe=l}(easemobim.utils,easemobim._const,easemobim.loading),function(e,t){"use strict";function i(){d=n.copy(c),n.extend(d,easemobim.config),m=n.copy(d);var e=""!==n.convertFalse(m.hide)?m.hide:l.json.hide,t=""!==n.convertFalse(m.resources)?m.resources:l.json.resources,i=""!==n.convertFalse(m.satisfaction)?m.satisfaction:l.json.sat;m.tenantId=m.tenantId||l.json.tenantId,m.configId=m.configId||l.json.configId,m.hide=n.convertFalse(e),m.resources=n.convertFalse(t),m.satisfaction=n.convertFalse(i),m.domain=m.domain||l.domain,m.path=m.path||l.domain+"/webim",m.staticPath=m.staticPath||l.domain+"/webim/static"}function o(){for(var e,t={},i=document.scripts,o=0,n=i.length;n>o;o++)if(~i[o].src.indexOf("easemob.js")){e=i[o].src;break}if(!e)return{json:t,domain:""};for(var s,a=e.indexOf("?"),r=~e.indexOf("//")?e.indexOf("//"):0,c=e.slice(r,e.indexOf("/",r+2)),d=e.slice(a+1).split("&"),l=0,m=d.length;m>l;l++)s=d[l].split("="),t[s[0]]=s.length>1?decodeURIComponent(s[1]):"";return{json:t,domain:c}}var n=easemobim.utils,s=easemobim.loading,a=".easemobim-mobile-html{position:static!important;width:100%!important;height:100%!important;padding:0!important;margin:0!important}.easemobim-mobile-body{position:fixed!important;top:0!important;right:0!important;bottom:0!important;left:0!important;width:100%!important;height:100%!important;overflow:hidden!important;padding:0!important;margin:0!important}.easemobim-mobile-body>*{display:none!important}.easemobim-mobile-body>.easemobim-panel{display:block!important}.easemobim-prompt-wrapper{display:none;z-index:16777271;position:fixed;width:30px;height:30px;padding:10px;top:0;bottom:0;margin:auto;left:0;right:0;color:#fff;background-color:#000;text-align:center;border-radius:4px;-webkit-transition:all .5s;transition:all .5s;opacity:.7}.easemobim-prompt-wrapper>.loading{position:relative;width:30px;height:30px;display:inline-block;overflow:hidden;margin:0;padding:0;-webkit-animation:easemobim-loading-frame 1s linear infinite;animation:easemobim-loading-frame 1s linear infinite}@-webkit-keyframes easemobim-loading-frame{0%{-webkit-transform:rotate(0);transform:rotate(0)}to{-webkit-transform:rotate(1turn);transform:rotate(1turn)}}@keyframes easemobim-loading-frame{0%{-webkit-transform:rotate(0);transform:rotate(0)}to{-webkit-transform:rotate(1turn);transform:rotate(1turn)}}.easemobim-pc-img-view{display:none;position:fixed;top:0;left:0;width:100%;height:100%;z-index:16777270}.easemobim-pc-img-view>.shadow{position:fixed;top:0;left:0;width:100%;height:100%;background-color:#000;background-color:rgba(0,0,0,.7);filter:progid:DXImageTransform.Microsoft.Alpha(Opacity=70)}.easemobim-pc-img-view>img{max-width:100%;max-height:100%;position:absolute;margin:auto;top:0;right:0;bottom:0;left:0}";n.addCssRules(a),easemobim.config=easemobim.config||{},easemobim.version="pre_47.10.37",easemobim.tenants={};var r,c={tenantId:"",to:"",agentName:"",appKey:"",domain:"",path:"",ticket:!0,staticPath:"",buttonText:"联系客服",dialogWidth:"360px",dialogHeight:"550px",dragenable:!0,minimum:!0,soundReminder:!0,dialogPosition:{x:"10px",y:"10px"},user:{username:"",password:"",token:""}},d=n.copy(c),l=o(),m={};if(i(),easemobim.config.grUserId=n.get("gr_user_id"),e.easemobIM=function(e){easemobim.bind({emgroup:e})},e.easemobIMS=function(e,t){easemobim.bind({tenantId:e,emgroup:t})},easemobim.bind=function(e){e=e||{},e.emgroup=e.emgroup||easemobim.config.emgroup||"";var t=e.tenantId+e.emgroup;for(var o in easemobim.tenants)easemobim.tenants.hasOwnProperty(o)&&easemobim.tenants[o].close();if(r=easemobim.tenants[t])r.open();else{if(s.show(),i(),n.extend(m,e),!m.tenantId)return void console.error("未指定tenantId!");r=easemobim.Iframe(m),easemobim.tenants[t]=r,r.set(m,r.open)}},easemobim.sendExt=function(e){r?r.send({ext:e}):console.error("The chat window is not initialized.")},easemobim.sendText=function(e){r?r.sendText(e):console.error("The chat window is not initialized.")},(!m.hide||m.autoConnect||m.eventCollector)&&(m.tenantId||m.configId)&&!n.isMobile){var f=d.tenantId+(d.emgroup||"");r=easemobim.tenants[f]||easemobim.Iframe(m),easemobim.tenants[f]=r,r.set(m,r.close),easemobim.config.eventCollector=!1}"object"==typeof module&&"object"==typeof module.exports?module.exports=easemobim:"function"==typeof define&&define.amd&&define("easemob-kefu-webim-plugin",[],function(){return easemobim})}(window,void 0);