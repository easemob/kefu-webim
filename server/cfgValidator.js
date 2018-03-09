const path = require("path");
const fs = require("fs");

// 自动生成配置
const template = require("./cfgTemplate");
const prompt = require("prompt");
var promptResult;
var promptPropsSchema = {
	properties: {
		tenantId: {
			description: "Enter you tenantId:",
			pattern: /^[0-9]{1,6}$/,
			message: "'tenantId' 必须是数字",
			required: true,
			ask: function(){
				// only ask if was true
				return true;
			}
		},
		robotId: {
			description: "Enter you robotId:",
			pattern: /^[0-9a-z-]{36}$/,
			message: "'robotId' 举例：b79f650a-6b35-4048-a971-ef73b5b0007d",
			required: true
		}
	}
};
prompt.message = "RobotWebim";
const promise = new Promise(function(resolve){
	const CFG_PATH = path.join(__dirname, "./cfg.js");
	try{
		fs.statSync(CFG_PATH);
	}
	catch(e){
		console.log("");
		prompt.start();
		prompt.get(
			promptPropsSchema,
			function(err, res){
				promptResult = res;
				const CFG_CONTENT = template(promptResult);
				fs.writeFileSync(CFG_PATH, CFG_CONTENT);
				resolve();
			}
		);
		// 以免执行函数末的 resolve
		return;
	}
	resolve();
});

module.exports = promise;
