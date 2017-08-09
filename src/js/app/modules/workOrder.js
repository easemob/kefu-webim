(function (utils, Selector) {
	easemobim.workOrder = function (chat) {

		var isSending = false;

		// 仅初始化一次
		if (dom) return;

		var dom = document.querySelector('.em-work-order');
		var orderNum = dom.querySelector('.order-num');
		var content = dom.querySelector('textarea');
		var contact = dom.querySelector('.contact');
		var phone = dom.querySelector('.phone');
		var confirmBtn = dom.querySelector('.btn-ok');
		var cancelBtn = dom.querySelector('.btn-cancel');
		var success = dom.querySelector('.em-widget-success-prompt');
		var orderCategory = dom.querySelector(".order-category");
		var orderCategorySelector;
		utils.on(cancelBtn, utils.click, function () {
			utils.addClass(dom, 'hide');
		});

		utils.on(confirmBtn, utils.click, function () {
			if (isSending) {
				chat.errorPrompt('提交中...');
			}
			else if (!/^\d{12}$/.test(orderNum.value)) {
				chat.errorPrompt('运单号为12位数字');
			}
			else if (!phone.value || phone.value.length > 24) {
				chat.errorPrompt('电话输入不正确');
			}
			else if (content.value.length > 500) {
				chat.errorPrompt('内容长度小于500字');
			}
			else {
				isSending = true;
				setTimeout(function () { isSending = false; }, 10000);
				easemobim.api('createWorkOrder', {
					billCode: orderNum.value,
					createMan: contact.value,
					createIdent: orderCategorySelector.getSelectedValue(),
					createPhone: phone.value,
					channel: '环信-网页',
					wrContent: content.value
				}, function (msg) {
					isSending = false;
					if (msg && msg.data && msg.data.entity && msg.data.entity.status === "true") {
						utils.removeClass(success, 'hide');

						setTimeout(function () {
							utils.addClass(success, 'hide');
						}, 1500);

						contact.value = '';
						phone.value = '';
						content.value = '';
						orderCategorySelector.setSelectedByIndex(0);
					}
					else {
						chat.errorPrompt('提交失败，请稍后重试');
					}
				});

			}
		});
		var _createCategories = _.once(function(){
			orderCategorySelector = new Selector({
				list: [
					{sign:"收件人",desc:"收件人"},
					{sign:"发件人",desc:"发件人"},
					{sign:"其他",desc:"其他"}
				],
				container: orderCategory
			});
		});
		return {
			show: function (isHideCancelBtn) {
				_createCategories();
				utils.toggleClass(cancelBtn, 'hide', !!isHideCancelBtn);
				utils.removeClass(dom, 'hide');
			}
		};
	};
}(easemobim.utils, easemobim.selector));
