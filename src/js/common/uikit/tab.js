require("underscore");
require("jquery");

var utils =			require("@/common/utils");
var tpl =			require("./template/tabTpl.html");
var eventListener = require("@/app/tools/eventListener");
var $ = require("jquery");
require("underscore");

function Tab(opt){
	var headItemTmp;
	var bodyItemTmp;
	var me = this;
	opt = opt || {};
	this.bodies = {};

	this.$el = $(_.template(tpl)());
	opt.className && this.$el.addClass(opt.className);
	opt.$pa.append(this.$el);

	this.head = this.$el.find(".head");
	var headWidth = this.head.width();
	var tabList = opt.tabList;
	var liWith = headWidth;

	if(_.isArray(tabList) && tabList.length){
		liWith = parseInt(headWidth / tabList.length) - 1;
	}
	else{
		throw new Error("Tab: opt.tabList expected a Array");
	}

	tabList.forEach(function(item){
		headItemTmp = $("<li sign=" + item.sign + " style=width:" + liWith + "px >" + item.text + "</li>");
		me.head.append(headItemTmp);

		utils.on(headItemTmp, "click", function(e){
			me.onItemClick(e);
		});

		bodyItemTmp = $("<div class='hide' sign=" + item.sign + ">");
		me.bodies[item.sign] = bodyItemTmp;
		me.$el.append(bodyItemTmp);
	});
	this.$all = this.$el.find("> ul > li");
	return this;

}
Tab.prototype.onItemClick = function(e){
	var targ = $(e.currentTarget);
	if(!targ.hasClass("selected")){
		this.selectItem(targ);
	}
};
Tab.prototype.selectItem = function(targ, silent){
	var sign = targ.attr("sign");
	this.clearSelected();
	targ.addClass("selected");
	!silent && eventListener.trigger("ui.tab.click", sign);
	this.selected = sign;
};

Tab.prototype.setSelect = function(sign, silent){
	var me = this;
	$.each(this.$all, function(k, v){
		v = $(v);
		if(v.attr("sign") == sign){
			me.selectItem(v, silent);
		}
	});
};

Tab.prototype.getSelect = function(){
	return this.selected;
};
Tab.prototype.clearSelected = function(){
	this.$all.removeClass("selected");
};


module.exports = Tab;
