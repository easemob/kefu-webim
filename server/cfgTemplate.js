module.exports = function(promptResult){
	return `module.exports = {
	appcfg: {
		tenantId: "${promptResult.tenantId}",
		configId: "${promptResult.configId}",
		ajaxProxyDomain: "sandbox.kefu.easemob.com",
	},
	servercfg: {
		port: 8010,
		proxyto: "sandbox.kefu.easemob.com",
		secure: false,
	},
};`;
};
