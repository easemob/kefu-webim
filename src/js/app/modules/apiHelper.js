var utils = require('../../common/utils');
var _const = require('../../common/const');
var emajax = require('../../common/ajax');
var Transfer = require('../../common/transfer');

var DEFAULT_ASK_API_SERVER = '114.55.149.174:20018';
var DEFAULT_ROBOT_DEMO_USER_ID = 'test';
var API_PATH = '/v1/robotapi/kefu-robotapi/tenants/xinhua/askApi';
var userId;
var apiURL;

function sendTextMessage(question){
	return _askApi({
		userId: userId,
		questionType: 'TEXT',
		question: question,
	});
}

function sendMenuClick(menuId){
	return _askApi({
		userId: userId,
		questionType: 'MENU_CLICK',
		question: menuId,
	});
}

function _askApi(jsonData){
	return new Promise(function(resolve, reject){
		emajax({
			url: apiURL,
			useXDomainRequestInIE: true,
			dataType: 'json',
			data: jsonData,
			type: 'POST',
			success: function(resp){
				if (resp){
					resolve(resp);
				}
				else {
					reject(new Error('unexpect reponses data.'));
				}
			},
			error: function(err){
				reject(err);
			},
		});
	});
}

module.exports = {
	sendTextMessage: sendTextMessage,
	sendMenuClick: sendMenuClick,
	init: function(cfg){
		var apiServer = cfg.askApiServer || DEFAULT_ASK_API_SERVER;

		userId = cfg.robotDemoUserId || DEFAULT_ROBOT_DEMO_USER_ID;
		apiURL = location.protocol + '//' + apiServer + API_PATH;
	},
};
