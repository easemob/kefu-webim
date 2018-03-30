module.exports = function(promptResult){
	return `module.exports = {
	appcfg: {
		tenantId: "${promptResult.tenantId}",
		configId: "${promptResult.configId}",
		// demo.html
		dev: {
			// transfer.html 所在域名，这是代理跨域 ajax 请求的 iframe & 代码
			ajaxProxyDomain: "sandbox.robot.easemob.com",
			staticDomain: "sandbox.robot.easemob.com",	// 静态资源与宿主页面同域
			// staticDomain: "your_dev_domain.com",		// 静态资源与宿主页面不同域
		},
		// demo_online.html
		online: {
			ajaxProxyDomain: "kefu.robot.easemob.com",
			staticDomain: "kefu.robot.easemob.com",
			// staticDomain: "your_online_domain.com",
		},
	},
	servercfg: {
		// 本地服务 localhost 的端口号
		port: 8010,
		// 后台请求发送到：
		proxyto: "sandbox.robot.easemob.com",
		// https 模式
		secure: false,
	},
};`;
};
