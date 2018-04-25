var domUtils =		require("@/common/kit/domUtils");
var classUtils =	require("@/common/kit/classUtils");
var Dialog =		require("@/common/uikit/dialog");
var tpl =			require("./template/congretsContentTpl.html");

var Congrets = classUtils.createView({

	congratsHideTimer: 0,

	init: function(){
		this.congratsHideTimer = 0;
		this.$el = domUtils.createElementFromHTML(tpl);
		this.dialog = new Dialog({
			contentDom: this.$el,
			className: "mini em-success-prompt"
		});
	},

	show: function(msg){
		this.$el.querySelector("p").innerText = msg;
		this.dialog.show();
		clearTimeout(this.congratsHideTimer);
		this.congratsHideTimer = setTimeout(_.bind(this.hide, this), 2000);
	},

	hide: function(){
		this.dialog.hide();
	},

});

module.exports = new Congrets();
