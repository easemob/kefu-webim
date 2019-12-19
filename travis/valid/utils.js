var colors = require("colors/safe");

function extract_keyword(releaseBranchPrefix, branchName, commitMsg){
	// releaseBranchPrefix		发布分支的统一前缀
	// branchName				当前分支名
	// commitMsg				任一 commit msg 内容
	let default_branch_family_reg = new RegExp("^" + releaseBranchPrefix + "(_[a-z]+[0-9a-z]*)*$");
	let tag_split_reg = /^v\d+\.\d+\.\d+(\.([a-z0-9]+(_[a-z]+[a-z0-9]*)*))?\.(final|snapshot)$/;

	if(!branchName){
		console.log(colors.red("[ERROR] 请在 /release_branch 文件中填写分支名\n"));
		return false;
	}
	if(!default_branch_family_reg.test(branchName)){
		console.log(colors.red("[ERROR] 请检查分支名 " + branchName + " !\n"));
		return false;
	}
	let tagPostFix = commitMsg.replace(tag_split_reg, function(match, $1, $2){
		return $2 || "";
	});
	let branchPostFix = branchName.replace(default_branch_family_reg, function(match, $1){
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
