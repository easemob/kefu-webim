
const colors = require("colors/safe");
const prompt = require("prompt");
const promptPropsSchema = {
	properties: {
		confirm_info: {
			description: "确认? - (Enter/NO)",
			// required: true,
			// pattern: /^[0-9]{1,6}$/,
			// message: "'tenantId' 必须是数字",
			ask: function(){
				// 可以在此建立条件，是否询问输入，有些值可能会在别的输入中一并处理了
				return true;
			}
		},
	}
};
prompt.message = colors.cyan("\nRelease Confirm");

module.exports = function(){
	return new Promise(function(resolve, reject){
		prompt.start();
		prompt.get(
			promptPropsSchema,
			function(err, res){
				if(res.confirm_info && res.confirm_info.toLowerCase() === "no"){
					reject();
				}
				else if(err){
					reject();
				}
				else{
					resolve();
				}
			}
		);
	});
};
