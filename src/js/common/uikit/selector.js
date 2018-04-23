var domUtils =		require("@/common/kit/domUtils");
var classUtils =	require("@/common/kit/classUtils");
var PopupList =		require("./popupList");
var tpl =			require("./template/selectorTpl.html");

function _getOffset(dom){
	var offsetT = 0;
	var offsetL = 0;
	var obj = dom;
	while(obj !== document.body && obj !== null){
		offsetL += obj.offsetLeft;
		offsetT += obj.offsetTop;
		obj = obj.offsetParent;
	}
	return {
		width: dom.clientWidth,
		height: dom.clientHeight,
		left: offsetL,
		top: offsetT
	};
}

// tpl
// evt
module.exports = classUtils.createView({

	containerDom: null,
	popuplist: null,

	events: {
		"click ":	"showList",
	},

	init: function(opt){
		opt = opt || {};
		this.containerDom = opt.container;
		if(!this.containerDom) throw new Error("Invalid containerDom.");

		this.$el = domUtils.createElementFromHTML(_.template(tpl, {
			selectClassName: opt.selectClassName || ""
		}));
		this.containerDom.appendChild(this.$el);
		this.updateList(opt);
	},

	updateList: function(opt){
		var selectIdx = opt.selected || 0;
		this.popuplist && this.popuplist.remove();
		this.popuplist = new PopupList({
			popuplistClassName: opt.popuplistClassName || "",
			list: opt.list,
			reportSelect: this.onSelect.bind(this)
		});
		this.popupList.setSelectedByIndex(selectIdx);
	},

	onSelect: function(selected){
		this.$el.querySelector(".em-select-desc").innerText = selected.desc;
	},

	getSelectedValue: function(){
		return this.popupList.getSelected();
	},

	showList: function(){
		var	containerOffset = _getOffset(this.containerDom);
		this.popupList.show({
			top: containerOffset.top + 1 + "px",
			left: containerOffset.left + 1 + "px",
			width: containerOffset.width + "px"
		});
	},

});
