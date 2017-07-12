var utils = require('../../common/utils');
var _const = require('../../common/const');
var emajax = require('../../common/ajax');
var Transfer = require('../../common/transfer');

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
		userId = cfg.robotDemoUserId;
		apiURL = location.protocol + '//' + cfg.askApiServer + cfg.askApiPath;
	},
};
