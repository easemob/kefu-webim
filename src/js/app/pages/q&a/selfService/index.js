var apiHelper = require("@/app/pages/main/apiHelper");
var commonConfig = require("@/common/config");
var _const = require("@/common/const");
var tpl = require("./indexTpl.html");
var SELFSERVICE_PATH = _const.SELFSERVICE_PATH;

module.exports = function(){
	var container = document.querySelector(".em-self-wrapper .self-service-list");
	var configId = commonConfig.getConfig().configId;
	container.innerHTML = "";

	apiHelper.getSelfServiceList(configId)
	.then(function(data){
		_.each(data, function(item){
			if(item.iconType == "system"){
				item.icon = SELFSERVICE_PATH + item.icon;
			}
		});
		container.innerHTML = _.template(tpl)({
			selfService: data
		});
	});


};
