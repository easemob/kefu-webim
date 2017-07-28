var Dict = require("./Dict");

var profile = {
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
	commandMessageToBeSendList: [],
	tenantAvatar: null,
	defaultAvatar: null,
	currentOfficialAccount: {},
	systemOfficialAccount: {}
};

module.exports = profile;
