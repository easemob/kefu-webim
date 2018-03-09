module.exports = function(promptResult){
	return `module.exports = {
	appcfg: {
		tenantId: "${promptResult.tenantId}",
		robotId: "${promptResult.robotId}",
		ajaxProxyDomain: "sandbox.robot.easemob.com",
	},
	servercfg: {
		port: 8010,
		proxyto: "sandbox.robot.easemob.com",
		secure: false,
	},
};`;
};
