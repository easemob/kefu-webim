var domUtils =		require("@/common/domUtils");
var classUtils =	require("@/common/classUtils");
var tpl =			require("./template/tipsTpl.html");

// prompt 不会消失
// tip 2 秒后自动消失
var Tips = classUtils.createView({

	hideTimer: 0,

	init: function(){
		this.hideTimer = 0;
		this.$el = domUtils.createElementFromHTML(tpl);
		this.promptTextSpanDom = this.$el.querySelector("span");
	},

	prompt: function(msg){
		this.promptTextSpanDom.innerText = msg;
		domUtils.removeClass(this.$el, "hide");
	},

	hidePrompt: function(){
		domUtils.addClass(this.$el, "hide");
	},

	tip: function(msg){
		this.prompt(msg);
		clearTimeout(this.hideTimer);
		this.hideTimer = setTimeout(_.bind(this.hidePrompt, this), 2000);
	},
});

var tips = new Tips();
document.body.appendChild(tips.$el);
module.exports = tips;
