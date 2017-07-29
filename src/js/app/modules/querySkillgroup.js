(function (utils) {
	easemobim.querySkillgroup = function (chat,config) {

		var isQuerying = false;
		// 仅初始化一次
		if (dom) return;
		var dom = document.querySelector('.em-order-num-wrapper');
		var content = dom.querySelector('input');
		var numBtn = dom.querySelector('.btn-num');
		var noNumBtn = dom.querySelector('.btn-no-num');
		var success = dom.querySelector('.em-widget-success-prompt');

		utils.on(noNumBtn, utils.click, function () {
			utils.addClass(dom, 'hide');
		});
		utils.on(content, 'input change', function () {
			if(content.value.length === 12){
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
					if(!res) {
						isQuerying = false;
						utils.addClass(dom, 'hide');
						return;
					}else {
						cb(res);
					}
				});
		};
		function getSkillgroup(msg) {
			easemobim.api('getSkillgroupByWebsiteId', {
				ids: msg.mainSite+','+msg.spareSite,
				tenantId : config.tenantId
			}, function (msg) {
				isQuerying = false;
				var res = msg.data.entities;
				if(chat.readyHandled){
					chat.channel.sendText('',false ,{
						ext: {
							weichat: {
								queueId: res[0],
								reserve_queue: res[1],
							}
						}
					});
				}else{
					chat.cachedSetSkillgroup = {
						queueId: res[0],	
						reserve_queue: res[1],
					}
				}

				utils.addClass(dom, 'hide')
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
