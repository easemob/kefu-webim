var fs = require("fs");
const params = require("commander");
var colors = require("colors/safe");
var child_process = require("child_process");
var utils = require("./utils");
var DEFAULT_BRANCH = "dev";
var BRANCH_NAME = process.env.BRANCH_NAME;
var COMMIT_MESSAGE = process.env.COMMIT_MESSAGE.trim();
var tag_split_reg = /^v\d+\.(\d+)\.(\d+)(\.([a-z0-9]+(_[a-z]+[a-z0-9]*)*))?\.(final|snapshot)$/;

params
.option("-m, --middle", "middle version")
.option("-s, --spec <version>", "spec version")
.parse(process.argv);
console.log("middle version =", params.middle);
console.log("spec version =", params.spec);


if(params.spec){
	console.log(colors.red("spec mode"));
	specMode(params.spec.trim());
}
else if(params.middle){
	console.log(colors.red("midd mode"));
	middleMode();
}
else{
	console.log(colors.red("tail mode"));
	tailMode();
}



// 验证指定的版本号
function specMode(tag_info){
	let keyword = utils.extract_keyword(DEFAULT_BRANCH, BRANCH_NAME, tag_info);
	if(!keyword){
		process.exit(1);
	}
	if(keyword.tagPostFix != keyword.branchPostFix){
		console.log(colors.red("[ERROR] tag/branch 命名后缀不匹配"));
		process.exit(1);
	}
	console.log(colors.cyan("tag...ok"));
	release(tag_info);
}

// 查询上一个版本，验证指定的版本号，中部 +1，尾部清零
function middleMode(){
	// 查询上一个版本
	let lastReleaseTag = getLastReleaseTag();
	let newReleaseTag = lastReleaseTag.replace(tag_split_reg, function(match, $1, $2){
		return match.replace($1, $1 * 1 + 1).replace($2, "0");
	});
	console.log("new TAG", colors.cyan(newReleaseTag));
	release(newReleaseTag);
}

// 查询上一个版本，验证指定的版本号，尾部 +1
function tailMode(){
	// 查询上一个版本
	let lastReleaseTag = getLastReleaseTag();
	// 版本号尾部 + 1
	let newReleaseTag = lastReleaseTag.replace(tag_split_reg, function(match, $1, $2){
		return match.replace($2, $2 * 1 + 1);
	});
	console.log("new TAG", colors.cyan(newReleaseTag));
	release(newReleaseTag);
}

function getLastReleaseTag(){
	let commitArr = COMMIT_MESSAGE.split("\n");
	let lastReleaseTag = commitArr.find(function(commitMsg){
		return tag_split_reg.test(commitMsg);
	});
	if(!lastReleaseTag){
		console.log(colors.red("没有找到上一个发布的版本号"));
		process.exit(1);
	}
	console.log("LAST RELEASE", colors.cyan(lastReleaseTag));
	// 验证
	let keyword = utils.extract_keyword(DEFAULT_BRANCH, BRANCH_NAME, lastReleaseTag);
	if(!keyword){
		process.exit(1);
	}
	if(keyword.tagPostFix != keyword.branchPostFix){
		console.log(colors.red("[ERROR] tag/branch 命名后缀不匹配"));
		process.exit(1);
	}
	return lastReleaseTag;
}

function release(tag){
	console.log(colors.cyan("tag...ok"));
	console.log(colors.green("执行中，请稍后"));
	try{
		fs.writeFileSync("./release_tag", tag, {
			encoding: "utf8",
			flag: "w"
		});
		child_process.execSync(`git add ./release_tag`);
		child_process.execSync(`git commit -m ${tag} ./release_tag`);
		child_process.execSync(`git push`);
	}
	catch(error){
	}
}
