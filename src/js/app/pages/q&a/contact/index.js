var btn_tpl = require("./btnTpl.html");
var _const = require("@/common/const");
var eventListener = require("@/app/tools/eventListener");

module.exports = function(){
	var container = $(_.template(btn_tpl)({
		consult_agent: __("common.consult_agent")
	}));
	container.removeClass("hide");
	container.on("click", function(e){
		eventListener.trigger(_const.SYSTEM_EVENT.CONSULT_AGENT);
		e.stopPropagation();
		return false;
	});

	// APIs
	this.$el = container;
	this.show = function(){
	};
};
