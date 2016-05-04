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
		domain: '',
		path: '',
		staticPath: '',
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
    var baseConfig = easemobim.utils.getConfig('easemob.js', true);


	var init = function () {
		easemobim.config = easemobim.utils.copy(config);

		var hide = easemobim.utils.convertFalse(easemobim.config.hide) !== '' ? easemobim.config.hide : baseConfig.json.hide,
			resources = easemobim.utils.convertFalse(easemobim.config.resources) !== '' ? easemobim.config.resources :  baseConfig.json.resources,
			sat = easemobim.utils.convertFalse(easemobim.config.satisfaction) !== '' ? easemobim.config.satisfaction :  baseConfig.json.sat;

		easemobim.config.tenantId = easemobim.config.tenantId || baseConfig.json.tenantId;
		easemobim.config.hide = easemobim.utils.convertFalse(hide);
		easemobim.config.resources = easemobim.utils.convertFalse(resources);
		easemobim.config.satisfaction = easemobim.utils.convertFalse(sat);
		easemobim.config.domain = easemobim.config.domain || baseConfig.domain;
		easemobim.config.path = easemobim.config.path || (baseConfig.domain + '/webim');
		easemobim.config.staticPath = easemobim.config.staticPath || (baseConfig.domain + '/webim/static');
	};

	init();
	var iframe = easemobim.Iframe(easemobim.config, true);


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

		iframe.set(easemobim.config, easemobim.utils.isMobile ? null : iframe.open);

		if ( easemobim.utils.isMobile ) {
			var a = window.event.srcElement || window.event.target,
				counter = 5;

			while( a && a.nodeName !== 'A' && counter-- ) {
				a = a.parentNode;
			}

			if ( !a || a.nodeName !== 'A' ) {
				return;
			}

			a.setAttribute('href', iframe.url);
			a.setAttribute('target', '_blank');

		}
	};


	easemobim.titleSlide(easemobim.config);
	easemobim.notify();

	easemobim.sendExt = function ( ext ) {
		iframe.send({
			ext: ext
		});
	};

	//
	if ( (!easemobim.config.hide || easemobim.config.autoConnect) && easemobim.config.tenantId ) {
		iframe.set(easemobim.config, iframe.close);
	}

}(window, undefined));
