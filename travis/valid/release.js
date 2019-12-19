var fs = require("fs");
var params = require("commander");
var colors = require("colors/safe");
var child_process = require("child_process");
var utils = require("./utils");
var config = require("./config");
var confirm = require("./confirm");

var DEFAULT_BRANCH = config.DEFAULT_BRANCH;
var BRANCH_NAME = process.env.BRANCH_NAME;
var RECENTLY_COMMIT_MESSAGES = process.env.RECENTLY_COMMIT_MESSAGES.trim();
var tag_split_reg = /^(v\d+)\.(\d+)\.(\d+)(\.([a-z0-9]+(_[a-z]+[a-z0-9]*)*))?\.(final|snapshot)$/;
var quit_process = () => process.exit(1);

params
.option("-m, --middle", "middle version")
.option("-s, --spec <version>", "spec version")
.parse(process.argv);

console.log("params.middle =", params.middle ? colors.cyan(params.middle) : colors.red("undefined"));
console.log("params.spec =", params.spec ? colors.cyan(params.spec) : colors.red("undefined"));

console.log("");
if(params.spec){
	console.log(colors.green("是 [指定版本] ?"));
	let spec_version = params.spec.trim();
	getLastReleaseTag({ last_release_check: false });
	match_check(spec_version);
	let keyword = utils.extract_keyword(DEFAULT_BRANCH, BRANCH_NAME, spec_version);
	if(!keyword){
		process.exit(1);
	}
	if(keyword.tagPostFix != keyword.branchPostFix){
		console.log(colors.red("[ERROR] tag/branch 命名后缀不匹配"));
		process.exit(1);
	}
	console.log("new TAG", colors.cyan(spec_version));
	confirm().then(
		() => release(spec_version),
		quit_process
	);
}
// 查询上一个版本，验证指定的版本号，中部 +1，尾部清零
else if(params.middle){
	console.log(colors.green("是 [大版发布] ?"));
	let lastReleaseVer = getLastReleaseTag({ last_release_check: true });
	// v47.0.003.test_5.final
	// $1 = v47
	// $2 = 0
	// $3 = 003
	// $4 = .test_s5
	// $5 = test_s5
	// $6 = _s5
	// $7 = final
	let newReleaseVer = lastReleaseVer.replace(tag_split_reg, function(match, $1, $2, $3, $4, $5, $6, $7){
		// 不能走 match.replace($1)，v1.1.1 这类情况会替换错位
		return $1 + "." + ($2 * 1 + 1) + ".0" + ($4 || "") + "." + $7;
	});
	console.log("new TAG", colors.cyan(newReleaseVer));
	confirm().then(
		() => release(newReleaseVer),
		quit_process
	);
}
// 查询上一个版本，验证指定的版本号，尾部 +1
else{
	console.log(colors.green("是 [日常发布] ?"));
	let lastReleaseVer = getLastReleaseTag({ last_release_check: true });
	// 版本号尾部 + 1
	let newReleaseVer = lastReleaseVer.replace(tag_split_reg, function(match, $1, $2, $3, $4, $5, $6, $7){
		return $1 + "." + $2 + "." + ($3 * 1 + 1) + ($4 || "") + "." + $7;
	});
	console.log("new TAG", colors.cyan(newReleaseVer));
	confirm().then(
		() => release(newReleaseVer),
		quit_process
	);
}

function getLastReleaseTag(opt = {}){
	let commitArr = RECENTLY_COMMIT_MESSAGES.split("\n");
	let lastReleaseVer = commitArr.find(function(commitMsg){
		return tag_split_reg.test(commitMsg);
	});
	console.log("LAST RELEASE", lastReleaseVer ? colors.cyan(lastReleaseVer) : colors.red("undefined"));
	console.log("BRANCH_NAME", colors.cyan(BRANCH_NAME));
	// 验证
	if(opt.last_release_check){
		if(lastReleaseVer){
			match_check(lastReleaseVer);
		}
		else{
			console.log(colors.red("没有找到上一个发布的版本号"));
			process.exit(1);
		}
	}
	return lastReleaseVer;
}

function match_check(check_version){
	let keyword = utils.extract_keyword(DEFAULT_BRANCH, BRANCH_NAME, check_version);
	if(!keyword){
		process.exit(1);
	}
	if(keyword.tagPostFix != keyword.branchPostFix){
		console.log(colors.red("[ERROR] last_commit_ver / branch 命名后缀不匹配"));
		process.exit(1);
	}
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
