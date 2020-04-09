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

	this.head = this.$el.find(".head");
	var tabList = opt.tabList;
	var liWith = "100%";

	if(_.isArray(tabList) && tabList.length){
		liWith = (100 / tabList.length) + "%";
	}
	else{
		throw new Error("Tab: opt.tabList expected a Array");
	}

	tabList.forEach(function(item){
		headItemTmp = $("<li sign=\"" + item.sign + "\" style=\"width:" + liWith + "\">" + item.text + "</li>");
		me.head.append(headItemTmp);

		utils.on(headItemTmp, "click", function(e){
			me.onItemClick(e);
		});

		bodyItemTmp = $("<div class='hide' sign=" + item.sign + ">");
		me.bodies[item.sign] = bodyItemTmp;
		me.$el.append(bodyItemTmp);
	});
	this.$all = this.$el.find("> ul > li");
	this.$allContent = this.$el.find("> div");
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
	$.each(this.$allContent, function(k, v){
		v = $(v);
		if(v.attr("sign") == sign){
			v.removeClass("hide");
		}
	});
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
	this.$allContent.addClass("hide");
};


module.exports = Tab;
