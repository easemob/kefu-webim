var colors = require("colors/safe");

function extract_keyword(DEFAULT_BRANCH, BRANCH_NAME, COMMIT_MSG){
	let default_branch_family_reg = new RegExp("^" + DEFAULT_BRANCH + "(_[a-z]+[0-9a-z]*)*$");
	let tag_split_reg = /^v\d+\.\d+\.\d+(\.([a-z0-9]+(_[a-z]+[a-z0-9]*)*))?\.(final|snapshot)$/;

	console.log("BRANCH_NAME", colors.cyan(BRANCH_NAME));
	console.log("COMMIT_MSG", colors.cyan(COMMIT_MSG));

	if(!BRANCH_NAME){
		console.log(colors.red("[ERROR] 请在 /release_branch 文件中填写分支名"));
		return false;
	}
	if(!default_branch_family_reg.test(BRANCH_NAME)){
		console.log(colors.red("[ERROR] " + DEFAULT_BRANCH + " 分支必须"));
		return false;
	}
	let tagPostFix = COMMIT_MSG.replace(tag_split_reg, function(match, $1, $2){
		return $2 || "";
	});
	let branchPostFix = BRANCH_NAME.replace(default_branch_family_reg, function(match, $1){
		if($1){
			return $1.slice(1);
		}
		return "";
	});
	return {
		tagPostFix: tagPostFix,
		branchPostFix: branchPostFix
	};
}


module.exports = {
	extract_keyword: extract_keyword
};
