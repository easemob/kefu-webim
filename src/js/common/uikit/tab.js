var utils = require("@/common/utils");
var tpl = require("./template/tabTpl.html");
var eventListener = require("@/app/tools/eventListener");
var commonConfig = require("@/common/config");
var _const = require("@/common/const");

function Tab(opt){
	opt = opt || {};
	this.inst = {};
	this.bodies = {};
	this.tabs = [];
	this.$el = $(_.template(tpl)());
	opt.className && this.$el.addClass(opt.className);
	this.$head = this.$el.find(".head");
}
Tab.prototype.addTab = function(tabInfo){
	if(!_.reduce(tabInfo.ins, function(result, cur){ return result && cur; }, true)){
		throw new Error("不允许空实例");
	};
	var liWidth;
	var $headItemTmp = $("<li title=\"" + tabInfo.text + "\"  sign=\"" + tabInfo.sign + "\"><span>" + tabInfo.text + "</span></li>");
	var $bodyItemTmp = $("<div class='hide' sign=" + tabInfo.sign + ">");
	// frame append
	this.$head.append($headItemTmp);
	this.$el.append($bodyItemTmp);
	// update
	this.tabs.push(tabInfo);
	this.bodies[tabInfo.sign] = $bodyItemTmp;
	this.inst[tabInfo.sign] = tabInfo.ins;		// arr
	this.$allContent = this.$el.find("> div");
	this.$allTab = this.$el.find("> ul > li");
	// 超过一个 tab 才显示头
	if(this.tabs.length >= 2){
		this.$el.removeClass("headless");
	}
	// 平均分配 li 的宽度
	// liWidth = (100 / (this.tabs.length)) + "%";
	// _.each(this.$allTab, function(tab){
	// 	tab.style = "width:" + liWidth;
	// });
	// [API] this.$el
	_.each(tabInfo.ins, function(ins){
		$bodyItemTmp.append(ins.$el);
	});
	// evt
	var me = this;
	utils.on($headItemTmp, "click", function(e){
		me.onTabClick(e);
	});
};
Tab.prototype.onTabClick = function(e){
	var $tab = $(e.currentTarget);
	if(!$tab.hasClass("selected")){
		this.selectTab($tab);
	}
};
Tab.prototype.clearSelected = function(){
	this.$allTab.removeClass("selected");
	this.$allTab.find("span").removeClass("border-color fg-color");
	if($(".theme_custom").length){
		this.$allTab.find("span").css("cssText","border-color:none; color:none");
	}
	this.$allContent.addClass("hide");
};
Tab.prototype.selectFirstTab = function(silent){
	var firstTab = this.tabs[0];
	if(firstTab){
		this.setSelect(firstTab.sign, silent);
		return true;
	}
	return false;
};
Tab.prototype.selectTab = function($tab, silent){
	var sign = $tab.attr("sign");
	if($(".theme_custom").length){
		var fgColor = $(".theme_custom .selected .border-color").css("color");
		this.fgColor = fgColor;
	}
	this.clearSelected();
	$tab.addClass("selected");
	$(".ui-cmp-tab>ul>li").removeClass("fg-color");
	$tab.addClass("fg-color");
	// $tab.find("li")["context"].addClass("border-color");
	var elActive = $tab.find("li")["context"];
	if(elActive){
		$(elActive).addClass("border-color");
	}
	$(".ui-cmp-tab>ul>li").css("cssText","color:#000 !important;" );
	if(this.fgColor){
		$tab.find("li").css("cssText","border-top-color: " + this.fgColor + " !important ; color: " + this.fgColor + " !important");
	}
	else{
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
		$tab.css("cssText","border-top-color: " + color + " !important; fg-color: " + color + " !important; color:" + color+ " !important;" );
	}
	
	this.bodies[sign].removeClass("hide");
	// [API] this.show()
	_.each(this.inst[sign], function(ins){
		ins.show();
	});
	if(!silent){
		eventListener.trigger("ui.tab.click", sign);
	}
};
Tab.prototype.setSelect = function(sign, silent){
	var me = this;
	$.each(this.$allTab, function(k, v){
		var $v = $(v);
		if($v.attr("sign") == sign){
			me.selectTab($v, silent);
		}
	});
};

module.exports = Tab;
