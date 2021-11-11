var Dict = require("./Dict");

var profile = {
	imToken: null,
	imRestDown: false,
	ctaEnable: false,
	systemAgentAvatar: null,
	isChatWindowOpen: null,
	isAgentNicknameEnable: null,
	currentBrowsingURL: null,
	isInOfficeHours: false,
	// 用来缓存图片的file对象，用于全屏查看图片
	imgFileList: new Dict(),
	hasHumanAgentOnline: false,
	hasRobotAgentOnline: false,
	officialAccountList: [],
	tenantAvatar: null,
	defaultAvatar: null,
	currentOfficialAccount: {},
	systemOfficialAccount: {},
	isNoLink:null,
	// systemOfficialAccount 相关方法
	shouldMsgActivated: function(curSSID){
		if(typeof curSSID !== "string"){
			return true;
		}
		var isCurSSOpen = this.systemOfficialAccount.isSessionOpen;
		var isSameSSID = this.systemOfficialAccount.sessionId === curSSID;
		return isCurSSOpen && isSameSSID;
	},
};

module.exports = profile;
