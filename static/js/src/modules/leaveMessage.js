/**
 * 留言
 */
;(function () {
	easemobim.leaveMessage = function ( chat, tenantId ) {

		var leaveMessage = this.leaveMessage,
			utils = this.utils,
			imChat = easemobim.imChat;

		if ( leaveMessage.dom ) {
			return false;
		}

		leaveMessage.domBg = document.createElement('div');
		leaveMessage.dom = document.createElement('div');
		leaveMessage.domBg.id = 'easemobWidgetOffline';
		utils.addClass(leaveMessage.domBg, 'easemobWidget-offline-bg em-hide');
		utils.addClass(leaveMessage.dom, 'easemobWidget-offline');
		utils.html(leaveMessage.dom, "\
			<h3>请填写以下内容以方便我们及时联系您</h3>\
			<input type='text' placeholder='姓名'/>\
			<input type='text' placeholder='电话'/>\
			<input type='text' placeholder='邮箱'/>\
			<textarea spellcheck='false' placeholder='请输入留言'></textarea>\
			<button class='easemobWidget-offline-cancel'>取消</button>\
			<button class='easemobWidget-offline-ok bg-color'>留言</button>\
			<div class='easemobWidget-success-prompt em-hide'><i>A</i><p>留言发送成功</p></div>\
		");
		leaveMessage.domBg.appendChild(leaveMessage.dom);
		imChat.appendChild(leaveMessage.domBg);

		var msg = leaveMessage.dom.getElementsByTagName('textarea')[0],
			contact = leaveMessage.dom.getElementsByTagName('input')[0],
			phone = leaveMessage.dom.getElementsByTagName('input')[1],
			mail = leaveMessage.dom.getElementsByTagName('input')[2],
			leaveMessageBtn = leaveMessage.dom.getElementsByTagName('button')[1],
			cancelBtn = leaveMessage.dom.getElementsByTagName('button')[0],
			success = leaveMessage.dom.getElementsByTagName('div')[0];

        //close
		utils.on(cancelBtn, utils.click, function () {
            utils.addClass(leaveMessage.domBg, 'em-hide');               
        });

        //create ticket
		utils.on(leaveMessageBtn, utils.click, function () {
			if ( !project ) {
				chat.errorPrompt('留言失败，Err01');
			} else if ( !contact.value ) {
				chat.errorPrompt('姓名不能为空');
			} else if ( !phone.value ) {
				chat.errorPrompt('电话不能为空');
			} else if ( !mail.value ) {
				chat.errorPrompt('邮箱不能为空');
			} else if ( !msg.value ) {
				chat.errorPrompt('留言内容不能为空');
			} else {
                easemobim.api('createTicket', {
                    tenantId: tenantId,
                    headers: { Authorization: 'Bearer ' + actoken },
                    projectId: project,
                    subject: '',
                    content: msg.value,
                    status_id: '',
                    priority_id: '',
                    category_id: '',
                    creator: { 
                        name: contact.value,
                        avatar: '',
                        email: mail.value,
                        phone: phone.value,
                        qq: '',
                        company: '',
                        description: ''
                    },
                    attachments:null
                }, function ( msg ) {
                    if ( msg.data && msg.data.entities && msg.data.entities.length > 0 ) {
                        project = msg.data.entities[0].id;
                    }
                });
				utils.removeClass(success, 'em-hide');
				setTimeout(function(){
					utils.addClass(success, 'em-hide');
				}, 1500);
				contact.value = '';
				phone.value = '';
				mail.value = '';
				msg.value = '';
			}
		});

        var project = null,
            actoken = null;

        return {
            auth: function ( token ) {
                actoken = token;
                if ( !project ) {
                    easemobim.api('getProject', {
                        tenantId: tenantId,
                        'easemob-appkey': 'sksk%23sk',
                        'easemob-username': 'webim-visitor-ER2YXMHY3VVJGXHVRMJH',
                        headers: { Authorization: 'Easemob IM ' + actoken }
                    }, function ( msg ) {
                        if ( msg.data && msg.data.entities && msg.data.entities.length > 0 ) {
                            project = msg.data.entities[0].id;
                        }
                    });
                }
            },
            show: function ( offDuty ) {
                offDuty && utils.addClass(cancelBtn, 'em-hide');               
                utils.removeClass(leaveMessage.domBg, 'em-hide');               
            }
        };
	};
}());
