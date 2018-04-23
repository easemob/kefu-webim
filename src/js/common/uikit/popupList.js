var classUtils =	require("@/common/kit/classUtils");
var domUtils =		require("@/common/kit/domUtils");
var utils =			require("@/common/kit/utils");
var tpl =			require("./template/popupListTpl.html");
var itemTpl =		require("./template/popupListItemTpl.html");

module.exports = classUtils.createView({

	selected: null,
	list: null,
	reportSelect: null,

	events: {
		"click li.itm-select": "onSelect",
	},

	init: function(opt){
		this.list = opt.list || [];
		this.reportSelect = opt.reportSelect || utils.noop;
		this.$el = domUtils.createElementFromHTML(_.template(tpl)({
			popuplistClassName: opt.popuplistClassName || ""
		}));
		this.$el.innerHTML = (_.map(this.list || [], function(item){
			return _.template(itemTpl)({
				sign: item.sign,
				desc: item.desc,
			});
		})).join("");

		// 点击别处及选项时隐藏列表
		this.watchDom(document, "click", this.onHide);

		document.body.appendChild(this.$el);
	},

	onSelect: function(e){
		var sign = e.target.getAttribute("data-sign");
		this.selected = _.find(this.list, function(itm){
			return itm.sign == sign;
		});
		this.selected && this.reportSelect(this.selected);
		this.hide();
	},

	onHide: function(e){
		var target = e.target;
		// if (utils.isMobile) return;
		if(!this.$el.contains(target)){
			this.hide();
		}
	},

	removing: function(){
		this.unWatchDom(document, "click", this.onHide);
	},

	// APIs
	setSelectedByIndex: function(index){
		if(_.isEmpty(this.list)) return;
		index = index || 0;
		this.selected = this.list[index];
		this.selected && this.reportSelect(this.selected);
	},

	getSelected: function(){
		var selected = this.selected || {};
		return selected.desc || "";
	},

	show: function(opt){
		this.$el.style.top = opt.top;
		this.$el.style.left = opt.left;
		this.$el.style.width = opt.width;
		domUtils.removeClass(this.$el, "hide");
	},

	hide: function(){
		domUtils.addClass(this.$el, "hide");
	},

});
