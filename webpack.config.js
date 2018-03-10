const getWebpackTasks = require("./webpack.def");
const fs = require("fs");
var colors = require("colors/safe");

// 直接自动生成 cfg
function buildingAtTravisEnv(){
	const cfgTemplate = require("./server/cfgTemplate");
	try{
		fs.statSync("./server/cfg.js");
	}
	catch(e){
		fs.writeFileSync("./server/cfg.js", cfgTemplate({
			tenantId: "49",
			robotId: "b79f650a-6b35-4048-a971-ef73b5b0007d"
		}));
	}
	console.log(colors.cyan("BUILDING...\n"));
	return getWebpackTasks(require("./server/cfg"));
}

// 做提示生成 cfg
function buildingAtLocalEnv(){
	const cfgValidator = require("./server/cfgValidator");
	return () => {
		return new Promise((resolve, reject) => {
			cfgValidator.then(() => {
				console.log(colors.cyan("\nBUILDING...\n"));
				resolve(getWebpackTasks(require("./server/cfg")));
			});
		});
	};
}

// 两种 exports 方式
module.exports = process.env.TRAVIS
	? buildingAtTravisEnv()
	: buildingAtLocalEnv();
