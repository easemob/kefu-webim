(function (utils) {
	easemobim.querySkillgroup = function (chat,config) {

		var isQuerying = false;
		// 仅初始化一次
		if (dom) return;
		var dom = document.querySelector('.em-order-num-wrapper');
		var content = dom.querySelector('.num-input');
		var numBtn = dom.querySelector('.btn-num');
		var cancelBtn = dom.querySelector('.btn-no-num');
		var success = dom.querySelector('.em-widget-success-prompt');
		var billCodeNum;

		utils.on(cancelBtn, utils.click, function () {
			utils.addClass(dom, 'hide');
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
				getWebsiteIds (getSkillgroup);

			}
		});
		function getWebsiteIds (cb) {
			easemobim.api('getWebsiteIds', {
					"billCode" :content.value
				}, function (msg) {
					var res = msg.data.entity;
					if(!res || !res.result) {
						isQuerying = false;
						utils.addClass(dom, 'hide');
						chat.channel.sendText(billCodeNum, false, {
							ext:{
								// "imageName": "mallImage3.png",
								//custom代表自定义消息，无需修改
								"type": "custom",
								"msgtype": {
									"track": {
										// "title": "我正在看：",
										"price": billCodeNum,
										"desc": "运单号",
										"img_url": "//" + location.host + "/webim/static/img/look_num.png",
										"item_url": "http://www.zto.com/GuestService/BillNew?txtbill=" + billCodeNum
									}
								}
							}
						});
					}else {
						cb(res.result);
					}
				});
		};
		function getSkillgroup(msg) {
			easemobim.api('getSkillgroupByWebsiteId', {
				argType: 'websiteId',
				ids: msg.mainSite+','+msg.spareSite,
				tenantId : config.tenantId
			}, function (msg) {
				isQuerying = false;
				var res = msg.data.entities;
				var extBody = { 
						ext: {
							"type": "custom",
							"msgtype": {
								"track": {
									"price": billCodeNum,
									"desc": "运单号",
									"img_url": "//" + location.host +"/webim/static/img/zto_logo.png",
									"item_url": "http://www.zto.com/GuestService/BillNew?txtbill=" + billCodeNum
								}
							},
							weichat: {
								queueId: res[0],
								reserve_queue: res[1]
							}
						}
					};
				var extArr = [billCodeNum,false,extBody];
				if(chat.readyHandled){
					chat.channel.sendText.apply(chat,extArr);
				}else{
					chat.cachedSetSkillgroup = extArr;
				}
				utils.addClass(dom, 'hide');
			});
		}
		return {
			hide: function () {
				utils.addClass(dom, 'hide');
			},
			show: function () {
				utils.removeClass(dom, 'hide');
			}
		};
	};
}(easemobim.utils));
