var utils = require("../../../common/utils");

 var CreateSelect = function(opt){
	opt = opt || {};
	this.selectClassName = opt.selectClassName || "";
	this.popuplistClassName = opt.popuplistClassName || "";
	this.containerDom = opt.container;
	this.list = opt.list;
	if(!_.isArray(this.list) || _.isEmpty(this.list) || !this.containerDom) return;

	this.selectDom = utils.createElementFromHTML("<div class=\"em-select " + this.selectClassName + "\"><label class=\"em-select-desc\"></label><span class=\"icon-arrow-up-down em-select-icon\"></span></div>");

	this.containerDom.appendChild(this.selectDom);

	this.popuplist = _createList(this);
	document.body.appendChild(this.popuplist);

	_bindEvents(this);
	// 默认选中第一个
	this.selectValue = this.list[0].sign;
	this.selectDom.querySelector(".em-select-desc").innerText = this.list[0].desc;
};
CreateSelect.prototype.updateList = function(list){
	this.list = list;
	utils.removeDom(this.popuplist);
	this.popuplist = _createList(this);
	document.body.appendChild(this.popuplist);
	// 更新列表之后 默认选中第一个
	this.selectValue = this.list[0].sign;
	this.selectDom.querySelector(".em-select-desc").innerText = this.list[0].desc;
};
function _bindEvents(thisObj){
	// 选中itm-select
	utils.live("li.itm-select", "click", function(){
		thisObj.selectValue = this.getAttribute("data-sign");
		thisObj.selectDom.querySelector(".em-select-desc").innerText = this.innerText;
	}, thisObj.popuplist);

	// 点击下拉框头部 展示下拉框
	utils.on(thisObj.selectDom, "click", function(){
		utils.removeClass(thisObj.popuplist, "hide");
		_setOffset(thisObj);
	});

	// 点击别处及选项时隐藏列表
	utils.on(document, "click", function(ev){
		var e = window.event || ev;
		var target = e.srcElement || e.target;
		// if (utils.isMobile) return;
		if(!utils.hasClass(target, "em-select") && !utils.hasClass(target.parentNode, "em-select")){
			utils.addClass(thisObj.popuplist, "hide");
		}
	});
}

function _setOffset(thisObj){
	var	containerOffset = _getOffset(thisObj.containerDom);
	thisObj.popuplist.style.top = containerOffset.top + 1 + "px";
	thisObj.popuplist.style.left =  containerOffset.left + 1 + "px";
	thisObj.popuplist.style.width = containerOffset.width + "px";
}

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

function _createList(opt){
	var options = "<ul class=\"em-popuplist hide " + opt.popuplistClassName + "\">";
	options += (_.map(opt.list, function(item){
		return "<li class=\"itm-select\" data-sign=\"" + item.sign + "\">" + item.desc + "</li>";
	})).join("");
	options += "</ul>";
	return utils.createElementFromHTML(options);
}

module.exports = CreateSelect;
