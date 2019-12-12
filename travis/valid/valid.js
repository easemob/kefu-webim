var fs = require("fs");
var colors = require("colors/safe");
var BRANCH_NAME = process.env.BRANCH_NAME;
var TAG_INFO = process.env.TAG_INFO;
var DEFAULT_BRANCH = "dev";
let default_branch_family_reg = new RegExp("^" + DEFAULT_BRANCH + "(_[a-z]+[0-9a-z]*)*$");

console.log("BRANCH_NAME", colors.cyan(BRANCH_NAME));
console.log("TAG_INFO", colors.cyan(TAG_INFO.replace(/\n/g, " / ")));

let tagArr = TAG_INFO.trim().split("\n");
let tag;
if(tagArr.length > 1){
	console.log(colors.red("tag 太多"));
	process.exit(1);
}
else if(tagArr.length == 1){
	tag = tagArr[tagArr.length - 1];
	// if(tagArr.length == 2){
	// 	// 双 tag 时，最后一次必须是 final
	// 	if(!/\.final$/.test(tag)){
	// 		console.log(colors.red("必须是 final tag"));
	// 		process.exit(1);
	// 	}
	// 	// tag 互异
	// 	if(!/\.snapshot$/.test(tagArr[0])){
	// 		console.log(colors.red("冲突的 final tag"));
	// 		process.exit(1);
	// 	}
	// }
}
else{
	console.log(colors.red("没有 tag"));
	process.exit(1);
}



if(!BRANCH_NAME){
	console.log(colors.red("[ERROR] 请在根目录创建 release_branch 文件，在内填写分支名"));
	process.exit(1);
}
if(!default_branch_family_reg.test(BRANCH_NAME)){
	console.log(colors.red("[ERROR] " + DEFAULT_BRANCH + " 分支必须"));
	process.exit(1);
}
// 获取 tag 中间名
let tagPostFix = tag.replace(/^v[0-9]+\.[0-9]+\.[0-9]+(\.([a-z0-9]+(_[a-z]+[a-z0-9]*)*))?\.(final|snapshot)$/, function(match, $1, $2){
	return $2;
});
let branchPostFix = BRANCH_NAME.replace(default_branch_family_reg, function(match, $1){
	if($1){
		return $1.slice(1);
	}
	return "";
});
console.log("tagPostFix", colors.cyan(tagPostFix));
console.log("branchPostFix", colors.cyan(branchPostFix));
if(tagPostFix != branchPostFix){
	console.log(colors.red("[ERROR] 后缀不匹配"));
	process.exit(1);
}

console.log(colors.cyan("tag...ok"));
console.log(colors.cyan("[is a tag] start packing"));
fs.writeFile("release_tag", tag, "utf8", function(error){
	if(error){
		console.log(colors.red("[ERROR] 写入 tag 失败"));
		process.exit(1);
	}
});
