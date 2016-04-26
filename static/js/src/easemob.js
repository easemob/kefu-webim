/*
 * 两种接入方式：
 * 1.<script src='//kefu.easemob.com/webim/easemob.js?tenantId=10954&hide=false&sat=true'></script>线上引用的方式支持参数较少，请参考环信官网文档；
 * 2.<script src='//本地路径/easemob.js'></script>;详细配置参考demo.html
 */


;(function ( window, undefined ) {
    'use strict';

	var config = {
		tenantId: '',
		to: '',
		appKey: '',
		domain: '//kefu.easemob.com',
		path: '//kefu.easemob.com/webim/im.html',
		staticPath: '//kefu.easemob.com/webim/static',
		buttonText: '联系客服',
		dialogWidth: '400px',
		dialogHeight: '500px',
		dragenable: true,
		minimum: true,
		soundReminder: true,
		dialogPosition: { x: '10px', y: '10px' },
		user: {
			username: '',
			password: '',
			token: ''
		}
	};


	//save global config
	easemobim.utils.extend(config, easemobim.config);


	//get parameters from easemob script
    var baseConfig = easemobim.utils.getConfig('easemob.js', true),
		iframe = easemobim.Iframe(easemobim.config, true);


	var init = function () {
		easemobim.config = easemobim.utils.copy(config);

		easemobim.config.tenantId = easemobim.config.tenantId || baseConfig.json.tenantId;
		easemobim.config.hide = easemobim.utils.convertFalse(easemobim.config.hide) !== '' ? easemobim.config.hide :  baseConfig.json.hide;
		easemobim.config.resources = easemobim.utils.convertFalse(easemobim.config.resources) !== '' ? easemobim.config.resources :  baseConfig.json.resources;
		easemobim.config.satisfaction = easemobim.utils.convertFalse(easemobim.config.satisfaction) !== '' ? easemobim.config.satisfaction :  baseConfig.json.sat;
	};
	



	/*
	 * @param: {String} 技能组名称，选填
	 * 为兼容老版，建议使用easemobim.bind方法
	 */
	window.easemobIM = function ( group ) {
		easemobim.bind({ emgroup: group });
	};
	window.easemobIMS = function ( tenantId, group ) {
		easemobim.bind({ tenantId: tenantId, emgroup: group });
	};


	/*
	 * @param: {Object} config
	 */
	easemobim.bind = function ( config ) {
		init();
		easemobim.utils.extend(easemobim.config, config);
		easemobim.config.emgroup = config.emgroup;

		if ( !easemobim.config.tenantId ) { return; }

		iframe.set(easemobim.config, iframe.open);
	};

	easemobim.titleSlide(easemobim.config);
	easemobim.notify();

	if ( !easemobim.config.hide && easemobim.config.tenantId ) {
		iframe.set(easemobim.config, iframe.close);
	}

}(window, undefined));
