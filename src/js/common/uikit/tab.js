var utils = require("@/common/utils");
var tpl = require("./template/tabTpl.html");
var eventListener = require("@/app/tools/eventListener");

function Tab(opt){
	opt = opt || {};
	this.inst = {};
	this.bodies = {};
	this.tabs = [];
	this.instCount = 0;
	this.$el = $(_.template(tpl)());
	opt.className && this.$el.addClass(opt.className);
	this.$head = this.$el.find(".head");
}
Tab.prototype.addTab = function(tabInfo){
	if(!_.reduce(tabInfo.ins, function(result, cur){ return result && cur; }, true)){
		throw new Error("不允许空实例");
	};
	var liWith;
	var $headItemTmp = $("<li sign=\"" + tabInfo.sign + "\">" + tabInfo.text + "</li>");
	var $bodyItemTmp = $("<div class='hide' sign=" + tabInfo.sign + ">");
	// frame append
	this.$head.append($headItemTmp);
	this.$el.append($bodyItemTmp);
	// update
	this.tabs.push(tabInfo);
	this.bodies[tabInfo.sign] = $bodyItemTmp;
	this.inst[tabInfo.sign] = tabInfo.ins;		// arr
	this.$allContent = this.$el.find("> div");
	this.$all = this.$el.find("> ul > li");
	// 超过一个 tab 才显示头
	this.instCount += 1;
	if(this.instCount >= 2){
		this.$el.removeClass("headless");
	}
	// 平均分配 li 的宽度
	liWith = (100 / (this.instCount)) + "%";
	_.each(this.$all, function(item){
		item.style = "width:" + liWith;
	});
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
	this.$all.removeClass("selected");
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
	this.clearSelected();
	$tab.addClass("selected");
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
	$.each(this.$all, function(k, v){
		var $v = $(v);
		if($v.attr("sign") == sign){
			me.selectTab($v, silent);
		}
	});
};

module.exports = Tab;
