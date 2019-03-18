var utils = require("@/common/utils");
var tpl = require("./template/popupListTpl.html");

module.exports = function(opt){
	var items = opt.items;
	var reportClick = opt.reportClick || utils.noop;

	var dom = utils.createElementFromHTML(_.template(tpl)({
		items: items
	}));
	document.body.appendChild(dom);
	utils.on(window, "resize", function(){
		hide();
	});
	utils.on(document, "click", function(e){
		var target = e.srcElement || e.target;
		if(!dom.contains(target)){
			hide();
		}
	});

	// 菜单点击
	utils.live("li", "click", function(e){
		var menuId;
		var target = e.srcElement || e.target;
		if(utils.hasClass(target.parentNode, "popup-item")){
			target = target.parentNode;
		}
		menuId = target.getAttribute("menuId");
		// 上报点击项
		reportClick(items[menuId], menuId);
		hide();
	}, dom);

	function show(pos){
		utils.removeClass(dom, "hide");
		dom.style.left = pos.left + "px";
		dom.style.top = pos.top + "px";
		pos.width && (dom.style.width = pos.width + "px");
	}

	function hide(){
		utils.addClass(dom, "hide");
	}

	return {
		show: show,
		hide: hide,
	};
};
