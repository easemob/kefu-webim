var _const = require('../../../common/const');
var profile = require('../tools/profile');
var eventListener = require('../tools/eventListener');
var apiHelper = require('../apiHelper');
var channel = require('../channel');
var utils = require('../../../common/utils');
var uikit = require('../uikit');
var chat = require('../chat');

var dom = utils.createElementFromHTML([
		'<div class="em-order-num-wrapper">',
		'<div class="order-num-main">',
		'<h3>请填写运单号</h3>',
		'<input class="num-input" type="text" name="" placeholder="请输入12位运单号">',
		'<img src="static/img/look_num.png">',
		'<span>为了提供更优质的服务，请准确填写您的运单号</span>',
		'<div class="btn-list">',
		'<button class="btn-no-num">无运单号查询</button>',
		'<button class="btn-num disabled">查询</button>',
		'</div>	',
		'</div>',
		'</div>'
		].join(''));;
var content = dom.querySelector('.num-input');
var numBtn = dom.querySelector('.btn-num');
var cancelBtn = dom.querySelector('.btn-no-num');
var dialog = uikit.createDialog({
	contentDom: dom,
	className: 'query-skillgroup'
});
var isQuerying;
var billCodeNum;
var siteCodeNum;
var config;

module.exports = function(opt){
	opt = opt || {};
	opt.isHide ? dialog.hide() : dialog.show();
	config = profile.config;
	// 当租户tenantId不为27801时，永远不进入运单填写页面 
	if(config.tenantId !== "27801"){
		dialog.hide();
	}
	_bindEvents();
	eventListener.add(_const.SYSTEM_EVENT.SESSION_RESTORED, _displayOrHideQuerySkillgroup);
	eventListener.add(_const.SYSTEM_EVENT.SESSION_NOT_CREATED, _displayOrHideQuerySkillgroup);
	
};
function _displayOrHideQuerySkillgroup(officialAccount) {
	// 当租户tenantId不为27801时，永远不进入运单填写页面 
	if (config.tenantId !== "27801"  || officialAccount !== profile.systemOfficialAccount || officialAccount.isSessionOpen) {
		dialog.hide();
	}
	else if(config.billCode || config.siteCode){
		_setSkillgroupByUrl();
		dialog.hide();
	}
	else{
		dialog.show();;
	};
}
function _bindEvents() {
	utils.on(cancelBtn, utils.click, function () {
		dialog.hide();
	});
	utils.on(content, 'input change keyup', function () {
		billCodeNum = content.value.trim();
		if(/^\d{12}$/.test(billCodeNum)){
			utils.removeClass(numBtn, 'disabled');
		} else{
			utils.addClass(numBtn, 'disabled');
		}
	});
	utils.on(numBtn, utils.click, function () {
		if (utils.hasClass(numBtn,'disabled') || isQuerying) {
			return;
		}
		else {
			isQuerying = true;
			setTimeout(function () { isQuerying = false; }, 10000);
			getWebsiteIds ();

		}
	});
}
function getWebsiteIds () {
	apiHelper.getWebsiteIdsByBillCode(billCodeNum).then(function (websiteIds) {
		if(!websiteIds) {
			// 取不回来网点 直接发送扩展消息 取回来网点id 调用getSkillgroup查询技能组
			isQuerying = false;
			dialog.hide();
			var extBody = { 
				ext: {
					"type": "custom",
					"msgtype": {
						"track": {
							// "title": "我正在看：",
							"price": billCodeNum,
							"desc": "运单号",
							"img_url": "//" + location.host +"/webim/static/img/zto_logo.jpg",
							"item_url": "http://www.zto.com/GuestService/BillNew?txtbill=" + billCodeNum
						}
					}
				}
			};
			var extArr = [billCodeNum,extBody];
			if(profile.isMessageChannelReady){
				channel.sendText.apply(chat,extArr);
			}else{
				profile.cachedSetSkillgroup = extArr;
			}
		}else {
			getSkillgroup(websiteIds);
		}
	})
};

function getSkillgroup(websiteIds) {
	apiHelper.getSkillgroupByWebsiteId(websiteIds).then(function (res) {
		isQuerying = false;
		var extBody = { 
			ext: {
				weichat: {
					queueId: res[0],
					reserve_queue: res[1]
				}
			}
		};
		if(billCodeNum){
			extBody.ext.type = "custom";
			extBody.ext.msgtype = {
				"track": {
					"price": billCodeNum,
					"desc": "运单号",
					"img_url": "//" + location.host +"/webim/static/img/zto_logo.jpg",
					"item_url": "http://www.zto.com/GuestService/BillNew?txtbill=" + billCodeNum
				}
			};
		}
		var extArr = [billCodeNum,extBody];
		if(profile.isMessageChannelReady){
			channel.sendText.apply(chat,extArr);
		}else{
			profile.cachedSetSkillgroup = extArr;
		}
		dialog.hide();
	})
}

function getWebsiteIdsBySiteCode() {
	apiHelper.getWebsiteIdsBySiteCode(siteCodeNum).then(function (websiteIds) {
		if(!websiteIds) {
			// 取不回来网点 不做任何处理
			dialog.hide();
		}else {
			getSkillgroup(websiteIds);
		}
	})
}

function _setSkillgroupByUrl() {
	if (config.billCode){
		billCodeNum = config.billCode;
		getWebsiteIds();
	}
	else{
		siteCodeNum = config.siteCode;
		getWebsiteIdsBySiteCode();
	}
}
