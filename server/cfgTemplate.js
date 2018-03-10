module.exports = function(promptResult){
	return `module.exports = {
	appcfg: {
		tenantId: "${promptResult.tenantId}",
		configId: "${promptResult.configId}",
		ajaxProxyDomain: "sandbox.robot.easemob.com",
	},
	servercfg: {
		port: 8010,
		proxyto: "sandbox.robot.easemob.com",
		secure: false,
	},
};`;
};
