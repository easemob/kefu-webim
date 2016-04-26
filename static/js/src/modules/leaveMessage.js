/**
 * 留言
 */
;(function () {
	easemobim.leaveMessage = function ( chat ) {

		var leaveMessage = this.leaveMessage,
			utils = this.utils,
			imChat = easemobim.imChat;

		if ( leaveMessage.dom ) {
			return false;
		}

		leaveMessage.dom = document.createElement('div');
		leaveMessage.dom.id = 'easemobWidgetOffline';
		utils.addClass(leaveMessage.dom, 'easemobWidget-offline em-hide');
		utils.html(leaveMessage.dom, "\
			<h3>请留下您的联系方式，以方便客服再次联系您</h3>\
			<input type='text' placeholder='请输入手机/邮箱/QQ号'/>\
			<p>留言内容</p>\
			<textarea spellcheck='false' placeholder='请输入留言'></textarea>\
			<button class='bg-color'>留言</button>\
			<div class='easemobWidget-success-prompt em-hide'><i>A</i><p>留言发送成功</p></div>\
		");
		imChat.appendChild(leaveMessage.dom);

		var msg = leaveMessage.dom.getElementsByTagName('textarea')[0],
			contact = leaveMessage.dom.getElementsByTagName('input')[0],
			leaveMessageBtn = leaveMessage.dom.getElementsByTagName('button')[0],
			success = leaveMessage.dom.getElementsByTagName('div')[0];

		utils.on(leaveMessageBtn, utils.click, function () {
			if ( !contact.value && !msg.value ) {
				chat.errorPrompt('联系方式和留言不能为空');
			} else if ( !contact.value ) {
				chat.errorPrompt('联系方式不能为空');
			} else if ( !msg.value ) {
				chat.errorPrompt('留言不能为空');
			} else if ( !/^\d{5,11}$/g.test(contact.value) 
				&& !/^[a-zA-Z0-9-_]+@([a-zA-Z0-9-]+[.])+[a-zA-Z]+$/g.test(contact.value) ) {
				chat.errorPrompt('请输入正确的手机号码/邮箱/QQ号');
			} else {
				chat.sendTextMsg('手机号码/邮箱/QQ号：' + contact.value + '   留言：' + msg.value);
				utils.removeClass(success, 'em-hide');
				setTimeout(function(){
					utils.addClass(success, 'em-hide');
				}, 1500);
				contact.value = '';
				msg.value = '';
			}
		});
	};
}());
