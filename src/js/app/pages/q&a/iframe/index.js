module.exports = function(iframeSettings){
	var container = $("<div class=\"faq-iframe hide\"><iframe style=\"border:0;width:100%;height:100%;\"/></div>");
	container.removeClass("hide");
	var iframe = container.find("iframe");
	
	// APIs
	this.$el = container;
	this.show = function(){
		if(!iframe[0].src){
			iframe[0].src = iframeSettings.url;
		}
	};
};
