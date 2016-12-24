/*
 * 环信移动客服WEB访客端插件接入js
 */

;(function ( window, undefined ) {
	'use strict';
	var utils = easemobim.utils;
	easemobim.config = easemobim.config || {};
	easemobim.version = '<%=WEBIM_PLUGIN_VERSION%>';
	easemobim.tenants = {};

	var DEFAULT_CONFIG = {
		tenantId: '',
		to: '',
		agentName: '',
		appKey: '',
		domain: '',
		path: '',
		ticket: true,
		staticPath: '',
		buttonText: '联系客服',
		dialogWidth: '360px',
		dialogHeight: '550px',
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
	var config = utils.copy(DEFAULT_CONFIG);


	//get parameters from easemob.js
	var baseConfig = utils.getConfig();
	var _config = {};

	var iframe;

	//init title slide function
	easemobim.titleSlide();
	//init browser notify function
	easemobim.notify();

	reset();

	// growing io user id
	// 由于存在cookie跨域问题，所以从配置传过去
	easemobim.config.grUserId = utils.get('gr_user_id');


	//init _config & concat config and global easemobim.config
	function reset() {
		config = utils.copy(DEFAULT_CONFIG);
		utils.extend(config, easemobim.config);
		_config = utils.copy(config);

		var hide = utils.convertFalse(_config.hide) !== '' ? _config.hide : baseConfig.json.hide,
			resources = utils.convertFalse(_config.resources) !== '' ? _config.resources :  baseConfig.json.resources,
			sat = utils.convertFalse(_config.satisfaction) !== '' ? _config.satisfaction :  baseConfig.json.sat;

		_config.tenantId = _config.tenantId || baseConfig.json.tenantId;
		_config.hide = utils.convertFalse(hide);
		_config.resources = utils.convertFalse(resources);
		_config.satisfaction = utils.convertFalse(sat);
		_config.domain = _config.domain || baseConfig.domain;
		_config.path = _config.path || (baseConfig.domain + '/webim');
		_config.staticPath = _config.staticPath || (baseConfig.domain + '/webim/static');
	}

	/*
	 * @param: {String} 技能组名称，选填
	 * 兼容旧版接口，建议使用easemobim.bind方法
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
		// 防止空参数调用异常
		config = config || {};
		config.emgroup = config.emgroup || easemobim.config.emgroup || '';

		var cacheKeyName = config.tenantId + config.emgroup;

		for ( var i in easemobim.tenants ) {
			if ( easemobim.tenants.hasOwnProperty(i) ) {
				easemobim.tenants[i].close();
			}
		}

		iframe = easemobim.tenants[cacheKeyName];

		if ( iframe ) {
			iframe.open();
		} else {
			reset();
			utils.extend(_config, config);

			if (!_config.tenantId) {
				console.warn('未指定tenantId!');
				return;
			}

			iframe = easemobim.Iframe(_config);
			easemobim.tenants[cacheKeyName] = iframe;
			iframe.set(_config, utils.isMobile ? null : iframe.open);
		}


		if ( utils.isMobile ) {

			//store ext
			if ( _config.extMsg ) {
				utils.setStore(_config.tenantId + _config.emgroup + 'ext', JSON.stringify(_config.extMsg));
			}

			//store visitor info 
			if ( _config.visitor ) {
				utils.setStore(_config.tenantId + _config.emgroup + 'visitor', JSON.stringify(_config.visitor));
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
		iframe && iframe.sendText(msg);
	};

	//auto load
	if(
		(!_config.hide || _config.autoConnect || _config.eventCollector)
		&& _config.tenantId
	){
		var cacheKeyName = config.tenantId + (config.emgroup || '');

		iframe = easemobim.tenants[cacheKeyName] || easemobim.Iframe(_config);
		easemobim.tenants[cacheKeyName] = iframe;
		iframe.set(_config, iframe.close);
		// 访客上报用后失效
		easemobim.config.eventCollector = false;
	}

	//support cmd & amd
	if ( typeof module === 'object' && typeof module.exports === 'object' ) {
		 module.exports = easemobim;
	 } else if ( typeof define === 'function' && (define.amd || define.cmd) ) {
		 define([], function () {
			 return easemobim;
		 });
	 }
}(window, undefined));
