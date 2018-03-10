// 	TRAVIS=true npm run build			only nocfg
// 	npm run build						nocfg
// 	npm run build
// 	npm run server						nocfg
// 	npm run server
// 	npm run dev							nocfg
// 	npm run dev

const getWebpackTasks = require("./webpack.def");
const fs = require("fs");
var colors = require("colors/safe");

// 找到 warning 的 loader
process.env.WARN_TRACING && (process.traceDeprecation = true);

// 直接自动生成 cfg
function buildingAtTravisEnv(){
	const cfgTemplate = require("./server/cfgTemplate");
	try{
		fs.statSync("./server/cfg.js");
	}
	catch(e){
		// cfg 的修改有三个文件
		// ./webpack.cfg.js
		// ./server/cfgTemplate.js
		// ./server/cfgValidator.js
		fs.writeFileSync("./server/cfg.js", cfgTemplate({
			tenantId: "49",
			configId: "2722cf2a-8ca0-4236-8142-0551589b7adf"
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
