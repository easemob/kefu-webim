module.exports = function(iframeSettings){
	var container = $("<div class=\"faq-iframe hide\"><iframe style=\"border:0;width:100%;height:100%;\"/></div>");
	this.$el = container;
	container.removeClass("hide");
	var iframe = container.find("iframe");
	iframe[0].src = iframeSettings.url;
};
