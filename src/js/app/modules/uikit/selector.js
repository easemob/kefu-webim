(function (utils) {

	var Selector = function(opt){
		opt = opt || {};
		this.selectClassName = opt.selectClassName || "";
		this.popuplistClassName = opt.popuplistClassName || "";
		this.containerDom = opt.container;
		this.list = opt.list || [];
		if(!this.containerDom) throw new Error("Invalid containerDom.");

		this.selectDom = utils.createElementFromHTML("<div class=\"em-select " + this.selectClassName + "\"><label class=\"em-select-desc\"></label><span class=\"icon-arrow-up-down em-select-icon\"></span></div>");

		this.containerDom.appendChild(this.selectDom);

		this.popuplist = this._createList();
		document.body.appendChild(this.popuplist);

		this._bindEvents();
		!_.isEmpty(this.list) && this.setSelectedByIndex(opt.selected);
	};
	Selector.prototype.updateList = function(opt){

		this.list = opt.list || [];
		this.unbindEvents();
		utils.removeDom(this.popuplist);
		this.popuplist = this._createList();
		!_.isEmpty(this.list) && this.setSelectedByIndex(opt.selected);
		document.body.appendChild(this.popuplist);
		this._bindEvents();
	};
	Selector.prototype.getSelectedValue = function(){
		return this.selected || "";
	};
	Selector.prototype.setSelectedByIndex = function(index){
		index = index || 0;
		this.selected = this.list[index].sign;
		this.selectDom.querySelector(".em-select-desc").innerText = this.list[index].desc;
	};
	Selector.prototype._bindEvents = function(){
		var me = this;
		// 选中itm-select
		utils.live("li.itm-select", "click", this.select = function(){
			me.selected = this.getAttribute("data-sign");
			me.selectDom.querySelector(".em-select-desc").innerText = this.innerText;
		}, me.popuplist);

		// 点击下拉框头部 展示下拉框
		utils.on(me.selectDom, "click", this.showList = function(){
			utils.removeClass(me.popuplist, "hide");
			me._setOffset();
		});

		// 点击别处及选项时隐藏列表
		utils.on(document, "click", this.hideList = function(ev){
			var e = window.event || ev;
			var target = e.srcElement || e.target;
			// if (utils.isMobile) return;
			if(!utils.hasClass(target, "em-select") && !utils.hasClass(target.parentNode, "em-select")){
				utils.addClass(me.popuplist, "hide");
			}
		});
	};

	Selector.prototype._setOffset = function(){
		var	containerOffset = _getOffset(this.containerDom);
		this.popuplist.style.top = containerOffset.top - 1 + "px";
		this.popuplist.style.left =  containerOffset.left  + "px";
		this.popuplist.style.width = containerOffset.width + "px";
		
	};

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

	Selector.prototype._createList = function(){
		var options = "<ul class=\"em-popuplist hide " + this.popuplistClassName + "\">";
		options += (_.map(this.list, function(item){
			return "<li class=\"itm-select\" data-sign=\"" + item.sign + "\">" + item.desc + "</li>";
		})).join("");
		options += "</ul>";
		return utils.createElementFromHTML(options);
	};
	Selector.prototype.unbindEvents = function(){
		
		// 解绑点击下拉框头部 展示下拉框
		utils.off(this.selectDom, "click", this.showList);

		// 解绑点击别处及选项时隐藏列表
		utils.off(document, "click", this.hideList);
	};

	easemobim.selector = Selector;
}(easemobim.utils));
