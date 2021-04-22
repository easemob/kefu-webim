var _const = require("@/common/const");
var utils = require("@/common/utils");
var profile = require("@/app/tools/profile");
var eventListener = require("@/app/tools/eventListener");
var apiHelper = require("../apis");
var channel = require("../channel");
var commonConfig = require("@/common/config");
var uikit = require("../uikit");


var toKefuBtn;

module.exports = function(data,isShowSatis){
	// $(".em-widget-send-wrapper-top").addClass("hide")
	// 获取按钮数量渲染按钮
	var H5ButtonBox = document.querySelector(".toolbar-mobile>.swiper-wrapper");
	// 获取原来容器中button的数量
	var oldBtnEl = document.querySelector(".toolbar-mobile>.swiper-wrapper>.swiper-slide");
	var oldBtnNum = $(oldBtnEl).children(".hide").length;//隐藏的按钮
	if(isShowSatis){
		oldBtnNum -= 1;
	}


	// 默认有6个按钮，计算出默认有几个按钮显示然后补全。一页要显示8个按钮。 
	
	var oldBtn =  data.slice(0,oldBtnNum+2);
	var newBtn = data.slice(oldBtnNum+2,data.length);


	var newData = [];
	for(var i = 0;i<newBtn.length;i+=8){
        newData.push(newBtn.slice(i,i+8))
	}
	for(var j=0;j<oldBtn.length;j++){
		// var url = oldBtn[j].icon.split("Tenant")[1]
		var url = oldBtn[j].icon;
		// url = "//" + window.location.host + "/Tenant" + url
		// url = window.location.host + "/Tenant" + url
		var el = utils.createElementFromHTML("<div class=\"\"><div class=\"btn-container\"> <img content=\""+ oldBtn[j].content+"\" type=\""+ oldBtn[j].operateType+"\" src=\""+ url +"\" /> </div><span>"+ oldBtn[j].name +"</span></div>");
		oldBtnEl.append(el)
	}
	var slideBox,slidContent;
	newData.forEach(function(item, index){
		slideBox = utils.createElementFromHTML("<div class=\"swiper-slide\"></div>");
		for(var i=0;i<item.length;i++){
		
			slidContent = utils.createElementFromHTML("<div class=\"\"><div class=\"btn-container\"> <img content=\""+ item[i].content+"\" type=\""+ item[i].operateType+"\" src=\""+ item[i].icon +"\" /> </div><span>"+ item[i].name +"</span></div>");
			slideBox.append(slidContent)
		}
		H5ButtonBox.append(slideBox)
	})

	// 获取主题色
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
	var hoverColor = $("body."+ themeClassName +" .border-color").css("borderColor")
	var mySwiperH5 = new Swiper('.toolbar-mobile',{
		pagination:{
			el:'.swiper-pagination',
			clickable:true,
		},//这样写小圆点就有了
		resistanceRatio : 0,
		observer: true,//修改swiper自己或子元素时，自动初始化swiper
		observeParents: true,//修改swiper的父元素时，自动初始化swiper
		on: {
			slideChange: function(swiper){
				var el = document.querySelector(".swiper-pagination-bullet-active")
				if(color){
					$(el).css("backgroundColor",color)
				}
				else{
					$(el).css("backgroundColor",hoverColor)
				}
			},
		}
	})

	// H5按钮
	// 输入框上方的按钮
	utils.on($(".toolbar-mobile .swiper-slide>div"), "click", function(e){
		var content = $(e.target).attr("content")
		var type = $(e.target).attr("type");
		// var	sendBtn = document.querySelector(".em-widget-send-wrapper .em-widget-send");
		// var textInput = document.querySelector(".em-widget-send-wrapper .em-widget-textarea");
		var satisfaction = document.querySelector(".em-widget-send-wrapper .toolbar-mobile .em-widget-satisfaction");

		var sendImgBtn = document.querySelector(".em-widget-send-wrapper .toolbar-mobile .em-widget-img");
		var sendVideoBtn = document.querySelector(".em-widget-send-wrapper .toolbar-mobile .em-widget-video");
		var popWindow = document.querySelector(".chat-pop-em-model");
		var iframe = document.getElementById("chat-pop")
	
		switch(type){
		case "linkH5":
			window.open(content)
			break;
		case "popWindow":
			$(popWindow).removeClass("hide");
			$(iframe).attr("src",content)
			break;
		case "photo":
			utils.trigger(sendImgBtn, "click");
			break;
		case "video":
			utils.trigger(sendVideoBtn, "click");
			break;
		case "evaluateH5":
			utils.trigger(satisfaction, "click");
			break;
		default:
			break;
		}
	});
	utils.on(document.querySelector(".chat-pop .icon-close"), "click", function(e){
		var popWindow = document.querySelector(".chat-pop-em-model");
		$(popWindow).addClass("hide");
	})

};


