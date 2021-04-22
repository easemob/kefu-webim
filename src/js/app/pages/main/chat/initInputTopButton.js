var _const = require("@/common/const");
var utils = require("@/common/utils");
var profile = require("@/app/tools/profile");
var eventListener = require("@/app/tools/eventListener");
// var apiHelper = require("../apis");
var channel = require("../channel");
var commonConfig = require("@/common/config");

var toKefuBtn;

module.exports = function(data){
	$(".em-widget-send-wrapper-top").removeClass("hide")
		// 自定义主题色
		var color = "";
		var themeClassName;
		var config = commonConfig.getConfig();
		var themeName = config.ui.themeName;
		if(themeName && themeName.indexOf("theme_custom") > -1){
			var arr = themeName.split("theme_custom");
			color = arr[1];
			themeClassName = "theme_custom";
		}
		else{
			themeClassName = _const.themeMap[config.themeName];
		}

	toKefuBtn = document.querySelector(".em-widget-to-kefu-input-button");

	// 获取开关状态判断是否展示按钮
	// TODO 未处理开关状态

	// 获取按钮数量渲染按钮
	var topButtonBox = document.querySelector(".em-widget-send-wrapper-top>.swiper-container>.swiper-wrapper");
	// 获取总宽度
	var width =  document.querySelector(".em-widget-send-wrapper-top>.swiper-container>.swiper-wrapper").offsetWidth;
	var newData2 = [];
	var newW = width;
	var num = 0;
	// 计算每个轮播图能放下多少个按钮
	for(var i = 0;i<data.length;i++){
		// 一个汉字13px
		var btnWidth = data[i].name.length * 13 + 30;
		width = width - btnWidth;
		if(width - btnWidth<0){
			width = newW;
			newData2.push(data.slice(num,i));
			num = i;
			i = i-1;
		}
		if((data.length - 1) === i){
			newData2.push(data.slice(num,i+1));
		}
	}
	// newData2.forEach(function(item, index){
	// 	slideBox = utils.createElementFromHTML("<div class=\"swiper-slide\"></div>");
	// 	for(var i=0;i<item.length;i++){
	// 		slidContent = utils.createElementFromHTML("<div content=\""+ item[i].content +"\" type=\""+ item[i].operateType +"\" title=\""+ item[i].name +"\" id=\"" + item[i].id+ "\" class=\"input-top-btn  "+themeClassName+"\">"+ item[i].name +"</div>");
	// 		slideBox.append(slidContent)
	// 	}
	// 	topButtonBox.append(slideBox)
	// })
	for(var i=0;i<data.length;i++){
		var el = utils.createElementFromHTML("<div class=\"swiper-slide\"  content=\""+ data[i].content +"\" type=\""+ data[i].operateType +"\" title=\""+ data[i].name +"\" id=\"" + data[i].id+ "\" class=\"input-top-btn  "+themeClassName+"\">"+ data[i].name +" </div>");
		// mySwiper.appendSlide(el);
		topButtonBox.append(el)
	}



	// $(".em-widget-send-wrapper-top>.swiper-wrapper .input-top-btn").hover(function(){
	$(".em-widget-send-wrapper-top>.swiper-container>.swiper-wrapper .swiper-slide").hover(function(){
		var hoverColor = $("body."+ themeClassName +" .border-color").css("borderColor")
		if($(this).hasClass("em-widget-exit-video")){
			return false
		}
		if(color){
			$(this).css("color",color)
			$(this).css("borderColor",color)
		}
		else{
			$(this).css("color",hoverColor)
			$(this).css("borderColor",hoverColor)
		}

	},function(){
		if($(this).hasClass("em-widget-exit-video")){
			return false
		}
		$(this).css("color","#566477")
		$(this).css("borderColor","#E6E6E6")
	})

	eventListener.add(_const.SYSTEM_EVENT.SESSION_OPENED, _displayOrHideTransferToKefuBtn);
	eventListener.add(_const.SYSTEM_EVENT.SESSION_TRANSFERING, _displayOrHideTransferToKefuBtn);
	eventListener.add(_const.SYSTEM_EVENT.SESSION_TRANSFERED, _displayOrHideTransferToKefuBtn);
	eventListener.add(_const.SYSTEM_EVENT.SESSION_RESTORED, _displayOrHideTransferToKefuBtn);
	eventListener.add(_const.SYSTEM_EVENT.SESSION_NOT_CREATED, _displayOrHideTransferToKefuBtn);
	eventListener.add(_const.SYSTEM_EVENT.OFFICIAL_ACCOUNT_SWITCHED, _displayOrHideTransferToKefuBtn);
	
	eventListener.add("video.conform", _conformVideo);
	eventListener.add("video.cancel", _cancelVideo);


	if(utils.isMobile) {
		var next = document.querySelector(".swiper-button-next");
		var prev = document.querySelector(".swiper-button-prev");
		$(next).addClass("hide");
		$(prev).addClass("hide");
		var mySwiper = new Swiper('.em-widget-send-wrapper-top>.swiper-container',{
			slidesPerView: "auto",
			spaceBetween: 10,
			freeMode: true,
		})
	}
	else{
		var mySwiper = new Swiper('.em-widget-send-wrapper-top>.swiper-container',{
			navigation: {
				nextEl: '.swiper-button-next',
				prevEl: '.swiper-button-prev',
			},
			slidesPerView: "auto",
			spaceBetween: 10,
			freeMode: true,
			mousewheel: true,
		})
	}
	// <div class=\"swiper-slide\"></div>
	// utils.createElementFromHTML("<div content=\""+ item[i].content +"\" type=\""+ item[i].operateType +"\" title=\""+ item[i].name +"\" id=\"" + item[i].id+ "\" class=\"input-top-btn  "+themeClassName+"\">"+ item[i].name +"</div>");

	// for(var i=0;i<data.length;i++){
	// 	var el = utils.createElementFromHTML("<div class=\"swiper-slide\"  content=\""+ data[i].content +"\" type=\""+ data[i].operateType +"\" title=\""+ data[i].name +"\" id=\"" + data[i].id+ "\" class=\"input-top-btn  "+themeClassName+"\">"+ data[i].name +" </div>");
	// 	mySwiper.appendSlide(el);
	// }

	// mySwiper.appendSlide('<div class="swiper-slide">Slide ' + (++appendNumber) + '</div>');


	// 输入框上方的按钮
	// utils.on(document.getElementsByClassName("input-top-btn"), "click", function(e){
	utils.on(document.getElementsByClassName("swiper-slide"), "click", function(e){
		var content = $(e.target).attr("content")
		var type = $(e.target).attr("type");
		var	sendBtn = document.querySelector(".em-widget-send-wrapper .em-widget-send");
		var textInput = document.querySelector(".em-widget-send-wrapper .em-widget-textarea");
		if(utils.isMobile) {
			var satisfaction = document.querySelector(".em-widget-send-wrapper .toolbar-mobile .em-widget-satisfaction");
		}
		else{
			var satisfaction = document.querySelector(".em-widget-send-wrapper .toolbar-pc .em-widget-satisfaction");
		}
		switch(type){
		case "link":
			window.open(content)
			break;
		case "message":
			textInput.value = content;
			$(sendBtn).removeClass("disabled");
			utils.trigger(sendBtn, "click");
			break;
		case "transfer":
			channel.sendTransferToKf();
			break;
		case "evaluate":
			utils.trigger(satisfaction, "click");
			break;
		default:
			break;
		}

	});
	// 确定视频通话
	function _conformVideo(){
		var videoBtn =  document.querySelector(".swiper-wrapper>.em-widget-exit-video");
		$(videoBtn).removeClass("hide");
		mySwiper.update();
	}
	// 取消视频通话
	function _cancelVideo(){
		var videoBtn =  document.querySelector(".swiper-wrapper>.em-widget-exit-video");
		$(videoBtn).addClass("hide");
		mySwiper.update();
	}

	function _displayOrHideTransferToKefuBtn(officialAccount){
		// 忽略非当前服务号的事件
		if(profile.currentOfficialAccount !== officialAccount) return;
	
		var state = officialAccount.sessionState;
		var agentType = officialAccount.agentType;
		var type = officialAccount.type;
		var isRobotAgent = agentType === _const.AGENT_ROLE.ROBOT;
	
		if(type === "CUSTOM"){
			// 营销号一律不显示转人工按钮
			utils.addClass(toKefuBtn, "hide");
			mySwiper.update();
		}
		else if(state === _const.SESSION_STATE.PROCESSING){
			utils.toggleClass(toKefuBtn, "hide", !isRobotAgent);
			mySwiper.update();
		}
		else if(state === _const.SESSION_STATE.WAIT){
			// 待接入状态 隐藏按钮
			utils.addClass(toKefuBtn, "hide");
			mySwiper.update();
		}
		else{
			if(!officialAccount.isSessionOpen) return
			apiHelper.getRobertIsOpen().then(function(isRobotEnable){
				utils.toggleClass(toKefuBtn, "hide", !isRobotEnable);
			});
			mySwiper.update();
		}
		if(utils.isMobile){
			if(utils.hasClass(toKefuBtn, "hide")){
				textareaBtn.style.maxWidth = "calc(100% - 45px)";
			}
			else{
				textareaBtn.style.maxWidth = "calc(100% - 90px)";
			}
			mySwiper.update();
		}
	}
	// $(topButtonBox).addClass(themeClassName);
	// topButtonBox.addClass(themeClassName)

};


