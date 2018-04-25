var utils =			require("@/common/kit/utils");
var domUtils =		require("@/common/kit/domUtils");
var classUtils =	require("@/common/kit/classUtils");
var tpl =			require("./template/dialogTpl.html");

module.exports = classUtils.createView({

	events: {
		"click .cancel-btn": "hide",
		"click .confirm-btn": "confirm",
	},

	init: function(opt){
		var contentDom;
		var className;

		opt = opt || {};
		className = opt.className;
		contentDom = opt.contentDom || "";

		this.$el = domUtils.createElementFromHTML(_.template(tpl)({
			cancelText: __("common.cancel")
		}));
		this.footer = this.$el.querySelector(".footer");
		this.cancelBtn = this.footer.querySelector(".cancel-btn");
		this.confirmBtn = this.footer.querySelector(".confirm-btn");

		className && domUtils.addClass(this.$el, className);
		if(typeof contentDom === "string"){
			contentDom = domUtils.createElementFromHTML(contentDom);
		}
		contentDom && this.$el.insertBefore(contentDom, this.footer);
		document.body.appendChild(this.$el);
	},

	show: function(){
		domUtils.removeClass(this.$el, "hide");
		return this;
	},

	hide: function(){
		domUtils.addClass(this.$el, "hide");
		return this;
	},

	confirm: function(){
		this.hide();
		return this;
	},

	toggle: function(){
		utils.toggle(this.$el, "hide");
		return this;
	},

	addButton: function(opt){
		opt = opt || {};
		domUtils.removeClass(this.footer, "hide");
		this.confirmBtn.innerText = opt.confirmText || __("common.confirm");
		opt.hideCancel && domUtils.addClass(this.cancelBtn, "hide");

		var _hide = this.hide;
		var _confirm = this.confirm;

		// 重新监听前（原函数被覆盖前）前要先注销，否则覆盖完就对应不上，不能去除监听。
		this.undelegateEvents();

		this.hide = function(){
			(opt.cancel || utils.noop)();
			return _hide.apply(this);
		};
		this.confirm = function(){
			var result = (opt.confirm || utils.noop)();
			(result !== false) && _confirm.apply(this);
			return this;
		};

		// 覆盖 events 的回调后，重新监听。
		this.delegateEvents();
		return this;
	},

});
