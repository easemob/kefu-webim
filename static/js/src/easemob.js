/*
 * 环信移动客服WEB访客端插件接入js
 */

;(function ( window, undefined ) {
    'use strict';
    window.easemobim = window.easemobim || {};
    easemobim.version = '<%= v %>';

	var CONF = {
		tenantId: '',
		to: '',
		agentName: '',
		appKey: '',
		domain: '',
		path: '',
        ticket: true,
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
	}, config = easemobim.utils.copy(CONF);


	//get parameters from easemob.js
    var baseConfig = easemobim.utils.getConfig('easemob.js', true),
		_config = {};


	//init _config & concat config and global easemobim.config
	var reset = function () {
		config = easemobim.utils.copy(CONF);
		easemobim.utils.extend(config, easemobim.config);
		_config = easemobim.utils.copy(config);

		var hide = easemobim.utils.convertFalse(_config.hide) !== '' ? _config.hide : baseConfig.json.hide,
			resources = easemobim.utils.convertFalse(_config.resources) !== '' ? _config.resources :  baseConfig.json.resources,
			sat = easemobim.utils.convertFalse(_config.satisfaction) !== '' ? _config.satisfaction :  baseConfig.json.sat;

		_config.tenantId = _config.tenantId || baseConfig.json.tenantId;
		_config.hide = easemobim.utils.convertFalse(hide);
		_config.resources = easemobim.utils.convertFalse(resources);
		_config.satisfaction = easemobim.utils.convertFalse(sat);
		_config.domain = _config.domain || baseConfig.domain;
		_config.path = _config.path || (baseConfig.domain + '/webim');
		_config.staticPath = _config.staticPath || (baseConfig.domain + '/webim/static');
	};

	reset();
	var iframe = easemobim.Iframe(_config, true);


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

		reset();
		easemobim.utils.extend(_config, config);

		if ( !_config.tenantId ) { return; }

        _config.emgroup = _config.emgroup || '';

		iframe.set(_config, easemobim.utils.isMobile ? null : iframe.open);

		if ( easemobim.utils.isMobile ) {

            //store ext
            if ( _config.extMsg ) {
                easemobim.utils.setStore(_config.tenantId + _config.emgroup + 'ext', JSON.stringify(_config.extMsg));
            }

            //store visitor info 
            if ( _config.visitor ) {
                easemobim.utils.setStore(_config.tenantId + _config.emgroup + 'visitor', JSON.stringify(_config.visitor));
            }


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


	//init title slide function
	easemobim.titleSlide(_config);
	//init browser notify function
	easemobim.notify();


	//open api1: send custom extend message
	easemobim.sendExt = function ( ext ) {
		iframe.send({
			ext: ext
		});
	};

	//open api2: send text message
	/*
	 * @param: {object} 消息体
	 * {
	 *		data: "text msg",
	 *		ext: {}
	 * }
	 */
	easemobim.sendText = function ( msg ) {
		iframe.sendText(msg);
	};

	//auto load
	if ( (!_config.hide || _config.autoConnect) && _config.tenantId ) {
		iframe.set(_config, iframe.close);
	}

}(window, undefined));
