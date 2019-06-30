/*
	客户访问网站 "visitTime" 秒后弹出邀请窗
	客户拒绝邀请后，间隔 "intervalTime" 秒再次弹出邀请窗, 不填则拒绝后不再邀请
	同一页面单日最大邀请次数 "maxInvitation"
*/

var utils = require("@/common/utils");
var eventListener = require("@/app/tools/eventListener");
var _const = require("@/common/const");
var moment = require("moment");
var cr = require("@/common/crypto");

module.exports = function(info){
	var timer;
	var dayTimer;
	var endDaySecond;
	var inviteBox = document.createElement("div");
	var secret = "AUTOINVITATION"; // 加密解密密钥
	var encryptMaxInvitation;
	inviteBox.className = "easemob-invite-box";
	inviteBox.innerHTML = "<div class=\"invite-logo\">" +
						"<img class=\"invite-img\" src=\"" + info.style.icon + "\"/></div>" +
					"<span class=\"invite-cancel\">×</span>" +
					"<div class=\"invite-text\"><span>" +
						info.style.guide +
					"</span></div>" +
					"<div class=\"ui-cmp-icontxtbtn blue button invite-accept\">" +
						info.style.button;
	"</div>";
	document.body.appendChild(inviteBox);
	setLocalStorage("visitTime", info.rule.visitTime);
	encryptMaxInvitation = setLocalStorage("maxInvitation", info.rule.maxInvitation);
	startTimer(info.rule.visitTime);
	startDayTimer();

	utils.live(".invite-cancel", "click", onCancelClick, inviteBox);
	utils.live(".invite-accept", "click", onAcceptClick, inviteBox);

	function onCancelClick(){
		var maxInvitation = getLocalStorage(encryptMaxInvitation);
		hide();
		if(maxInvitation > 1){
			setLocalStorage("maxInvitation", maxInvitation - 1);
			// intervalTime 不填则拒绝后不再邀请
			info.rule.intervalTime && startTimer(info.rule.intervalTime);
		}
		else{
			clearTimer();
		}
	}

	function startTimer(second){
		timer = setTimeout(function(){
			show();
			clearTimeout(timer);
		}, second * 1000);
	}

	function clearTimer(){
		clearTimeout(timer);
	}

	// 开启单日最大邀请次数的计时
	function startDayTimer(){
		// moment().endOf('day') 当前日期的 23:59:59
		endDaySecond = moment().endOf("day") - moment();
		dayTimer = setTimeout(function(){
			clearTimeout(dayTimer);
			// 一天结束后重新将“单日最大邀请次数” 设置到 localStorage
			setLocalStorage("maxInvitation", info.rule.maxInvitation);
			startTimer(info.rule.visitTime);
			startDayTimer();
		}, endDaySecond);
	}

	function cleartDayTimer(){
		clearTimeout(dayTimer);
	}

	function onAcceptClick(){
		// 点击接受就清除单日最大邀请次数的计时
		cleartDayTimer();
		eventListener.trigger(_const.SYSTEM_EVENT.ACCEPT_INVITATION);
		hide();
	}

	function setLocalStorage(key, val){
		var encryptionKey = cr.encrypt(key, secret);
		var encryptionVal = cr.encrypt(val, secret);
		window.localStorage && localStorage.setItem(encryptionKey, encryptionVal);
		return encryptionKey;
	}

	function getLocalStorage(encrypVal){
		var decryptVal = localStorage.getItem(encrypVal)
			? cr.decrypt(localStorage.getItem(encrypVal), secret)
			: "";
		return decryptVal;
	}

	function show(){
		inviteBox.style.display = "block";
	}

	function hide(){
		inviteBox.style.display = "none";
	}
};
