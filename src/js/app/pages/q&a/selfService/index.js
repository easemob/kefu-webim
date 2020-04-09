var apis = require("../apis");
var _const = require("@/common/const");
var container_tpl = require("./indexTpl.html");
var item_tpl = require("./itemTpl.html");
var SELFSERVICE_PATH = _const.SELFSERVICE_PATH;

module.exports = function(){
	var container = $(_.template(container_tpl)());

	apis.getSelfServiceList()
	.then(function(data){
		_.each(data, function(item){
			if(item.iconType == "system"){
				item.icon = SELFSERVICE_PATH + item.icon;
			}
		});
		container.removeClass("hide");
		container.append(_.template(item_tpl)({
			selfService: data
		}));
	});

	// APIs
	this.$el = container;
	this.show = function(){
		
	};
};
