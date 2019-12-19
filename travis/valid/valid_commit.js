// travis 执行的，验证当前 commit 的逻辑
var colors = require("colors/safe");
var utils = require("./utils");

var DEFAULT_BRANCH = require("./config").DEFAULT_BRANCH;
var BRANCH_NAME = process.env.BRANCH_NAME;
var CUR_COMMIT_MSG = process.env.CUR_COMMIT_MSG.trim();

var keyword = utils.extract_keyword(DEFAULT_BRANCH, BRANCH_NAME, CUR_COMMIT_MSG);
if(!keyword){
	process.exit(1);
}
// 获取 tag 中间名
let tagPostFix = keyword.tagPostFix;
let branchPostFix = keyword.branchPostFix;
console.log("tagPostFix", colors.cyan(tagPostFix));
console.log("branchPostFix", colors.cyan(branchPostFix));
if(tagPostFix != branchPostFix){
	console.log(colors.red("[ERROR] commit_msg 与 branch 后缀不匹配"));
	console.log(colors.red(CUR_COMMIT_MSG));
	process.exit(1);
}
console.log(colors.cyan("tag...ok"));
