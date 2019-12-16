var fs = require("fs");
var colors = require("colors/safe");
var utils = require("./utils");
var BRANCH_NAME = process.env.BRANCH_NAME;
var COMMIT_MESSAGE = process.env.COMMIT_MESSAGE.trim();

var DEFAULT_BRANCH = "dev";
var keyword = utils.extract_keyword(DEFAULT_BRANCH, BRANCH_NAME, COMMIT_MESSAGE);
if(!keyword){
	process.exit(1);
}
// 获取 tag 中间名
let tagPostFix = keyword.tagPostFix;
let branchPostFix = keyword.branchPostFix;
console.log("tagPostFix", colors.cyan(tagPostFix));
console.log("branchPostFix", colors.cyan(branchPostFix));
if(tagPostFix != branchPostFix){
	console.log(colors.red("[ERROR] tag/branch 命名后缀不匹配"));
	process.exit(1);
}

console.log(colors.cyan("tag...ok"));
console.log(colors.cyan("[is a tag] start packing"));
try{
	fs.writeFileSync("release_tag", COMMIT_MESSAGE, {
		encoding: "utf8",
		flag: "w"
	});
}
catch(error){
	process.exit(1);
}
