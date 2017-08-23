var utils = require("../../common/utils");
var uikit = require("./uikit");
var profile = require("./tools/profile");
var apiHelper = require("./apiHelper");
var Selector = require("./uikit/selector");

var isSending = false;

var dom = utils.createElementFromHTML([
	'<div class="wrapper">',
	'<h3>请填写以下内容以方便我们及时联系您</h3>',
	'<input type="text" class="order-num" placeholder="请填写12位运单号">',
	'<input type="text" class="contact" placeholder="姓名">',
	'<div class="order-category"></div>',
	'<input type="text" class="phone" placeholder="电话">',
	'<textarea spellcheck="false" placeholder="请输入留言"></textarea>',
	'</div>',
].join(''));
var orderNum = dom.querySelector('.order-num');
var content = dom.querySelector('textarea');
var contact = dom.querySelector('.contact');
var phone = dom.querySelector('.phone');
var orderCategory = dom.querySelector(".order-category");
var orderCategorySelector;

// todo: lazy load dialog
var dialog = uikit.createDialog({
	contentDom: dom,
	className: 'work-order'
}).addButton({
	confirmText: '留言',
	confirm: function () {
		if (isSending) {
				uikit.tip('提交中...');
			}
			else if (!/^\d{12}$/.test(orderNum.value)) {
				uikit.tip('运单号为12位数字');
			}
			else if (!phone.value || phone.value.length > 24) {
				uikit.tip('电话输入不正确');
			}
			else if (content.value.length > 250) {
				uikit.tip('内容长度小于250字');
			}
		else {
			isSending = true;
			setTimeout(function () { isSending = false; }, 10000);
			_createWorkOrder();
		}
		// 阻止对话框关闭
		return false;
	}
});
var cancelBtn = dialog.el.querySelector('.cancel-btn');
function _createWorkOrder() {
	apiHelper.createWorkOrder({
		billCode: orderNum.value,
		createMan: contact.value,
		createIdent: orderCategorySelector.getSelectedValue(),
		createPhone: phone.value,
		channel: '环信-网页',
		wrContent: content.value
	}).then(function(){
		isSending = false;
		uikit.showSuccess('留言发送成功');
		_clearInput();
	}, function (err){
		isSending = false;
		uikit.tip('留言失败，请稍后重试');
		console.error(err);
	});

}

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

function _clearInput(){
	contact.value = '';
	phone.value = '';
	content.value = '';
	orderCategorySelector.setSelectedByIndex(0);
}

function _writePreDate(preData){
	content.value = preData.content || '';
	contact.value = preData.name || '';
	phone.value = preData.phone || '';
}

module.exports = function(opt) {
	opt = opt || {};
	_createCategories();
	opt.preData && _writePreDate(opt.preData);
	opt.hideCloseBtn && utils.addClass(cancelBtn, 'hide');
	dialog.show();
};
