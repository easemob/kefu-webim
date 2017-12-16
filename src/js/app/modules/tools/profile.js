var Dict = require("./Dict");

var profile = {
	channelId: null,
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
	deepStreamChannelEnable: false,
	visitorInfo: {},
	options: {
		imRestServer: "",
		imXmppServer: "",
	},
};

module.exports = profile;
