app.initSessionList = (function (
	_const, utils, profile, eventListener, apiHelper, createSessionList,
	createMessageView, promptCtaDialog
){
	var sessionListBtn;
	var redDotDom;
	var sessionListView;

	return function(){
		var topBar = document.querySelector('.em-widget-header');
		sessionListBtn = topBar.querySelector('.session-list-btn');
		redDotDom = sessionListBtn.querySelector('.notice');

		eventListener.add(_const.SYSTEM_EVENT.MESSAGE_SENT, function (){
			var officialAccount = profile.currentOfficialAccount;
			if (!officialAccount) return;
			_reportReplied(officialAccount);
		});
		eventListener.add(_const.SYSTEM_EVENT.MARKETING_MESSAGE_RECEIVED, _onMarketingMessageReceived);
		eventListener.add(_const.SYSTEM_EVENT.NEW_OFFICIAL_ACCOUNT_FOUND, _newOfficialAccountFound);

		eventListener.add(_const.SYSTEM_EVENT.OFFICIAL_ACCOUNT_SWITCHED, function (officialAccount){
			_attemptToGetMarketingTaskInfo(officialAccount);
			_reportOpened(officialAccount);
			_clearUnreadCount(officialAccount);
		});

		eventListener.add(_const.SYSTEM_EVENT.CHAT_WINDOW_OPENED, function (){
			var officialAccount = profile.currentOfficialAccount;
			if (_.isEmpty(officialAccount)) return;
			_reportOpened(officialAccount);
			_clearUnreadCount(officialAccount);
		});

		eventListener.add(_const.SYSTEM_EVENT.SYSTEM_OFFICIAL_ACCOUNT_UPDATED, function (){
			sessionListView.updateItem(profile.systemOfficialAccount, 'default');
		});

		eventListener.add(_const.SYSTEM_EVENT.OFFICIAL_ACCOUNT_LIST_GOT, function (){
			if (profile.ctaEnable){
				sessionListView.show();
				profile.currentOfficialAccount = null;
			}
			else {
				profile.currentOfficialAccount = profile.systemOfficialAccount;
			}
		});

		eventListener.add(_const.SYSTEM_EVENT.MESSAGE_APPENDED, function (officialAccount, officialAccountId, msg){
			if (officialAccount === profile.currentOfficialAccount) return;

			var msgBrief = msg.brief;
			var formattedTimestamp = utils.formatDate(_.now());

			officialAccount.unreadMessageIdList.add(msg.id);
			sessionListView.updateLatestMessage(officialAccountId, msgBrief, formattedTimestamp);
			sessionListView.updateUnreadCount(officialAccountId, officialAccount.unreadMessageIdList.getLength());
			_updateSessionListRedDotStatus();
		});
	};

	function _updateSessionListRedDotStatus(){
		var sumOfUnreadMessageCount =_.chain(profile.officialAccountList)
			// 取得每个服务号的未读消息数
			.map(function (officialAccount){
				return officialAccount.unreadMessageIdList.getLength();
			})
			// 求和
			.reduce(function (a, b){
				return a + b;
			})
			// 退出链式调用，并返回结果
			.value();

		var ifDisplayRedDot = !!sumOfUnreadMessageCount;

		utils.toggleClass(redDotDom, 'hide', !ifDisplayRedDot);
	}

	function _clearUnreadCount(officialAccount){
		var officialAccountId = officialAccount.official_account_id;
		officialAccount.unreadMessageIdList.removeAll();
		sessionListView.updateUnreadCount(officialAccountId, null);
		_updateSessionListRedDotStatus();
	}

	function _attemptToGetMarketingTaskInfo(officialAccount){
		if (officialAccount.type === 'SYSTEM' || officialAccount.hasGotMarketingInfo) return;

		var officialAccountId = officialAccount.official_account_id;
		officialAccount.hasGotMarketingInfo = true;
		apiHelper.getLatestMarketingTask(officialAccountId).then(function (entity){
			officialAccount.bindSkillGroupName = utils.getDataByPath(entity, 'schedule_info.skillgroup_name');
			officialAccount.bindAgentUsername = utils.getDataByPath(entity, 'schedule_info.agent_username');
		});
	}

	function _reportReplied(officialAccount){
		_.each(officialAccount.unrepliedMarketingTaskIdList.getAll(), function(marketingTaskId){
			officialAccount.unrepliedMarketingTaskIdList.remove(marketingTaskId);
			apiHelper.reportMarketingTaskReplied(marketingTaskId);
		});
	}

	function _reportOpened(officialAccount){
		_.each(officialAccount.unopenedMarketingTaskIdList.getAll(), function(marketingTaskId){
			officialAccount.unopenedMarketingTaskIdList.remove(marketingTaskId);
			apiHelper.reportMarketingTaskOpened(marketingTaskId);
		});
	}

	function _onMarketingMessageReceived(msg, marketingTaskId, officialAccount){
		var avatar = officialAccount.img;
		var officialAccountId = officialAccount.official_account_id;
		var content = msg.data;
		var title = '';
		var isCurrentOfficialAccount = officialAccount === profile.currentOfficialAccount;
		var scheduleInfo = utils.getDataByPath(msg, 'ext.weichat.marketing.schecule_info') || {};
		officialAccount.bindSkillGroupName = scheduleInfo.skillgroup_name;
		officialAccount.bindAgentUsername = scheduleInfo.agent_username;
		officialAccount.hasGotMarketingInfo = true;

		!isCurrentOfficialAccount
			&& !sessionListView.isShowed()
			&& app.promptCtaDialog({
				title: title,
				replyCallback: _switchToOfficialAccount,
				content: content,
				avatar: avatar,
				callbackMessage: officialAccountId
			});

		if (profile.isChatWindowOpen){
			apiHelper.reportMarketingTaskOpened(marketingTaskId);
		}
		else {
			officialAccount.unopenedMarketingTaskIdList.add(marketingTaskId);
		}

		officialAccount.unrepliedMarketingTaskIdList.add(marketingTaskId);
		apiHelper.reportMarketingTaskDelivered(marketingTaskId);
	}

	function _switchToOfficialAccount(id){
		var targerOfficialAccountProfile = _.findWhere(profile.officialAccountList, {official_account_id: id});

		_.each(profile.officialAccountList, function(item){
			item.messageView.hide();
		});

		targerOfficialAccountProfile.messageView.show();
		profile.currentOfficialAccount = targerOfficialAccountProfile;

		eventListener.excuteCallbacks(
			_const.SYSTEM_EVENT.OFFICIAL_ACCOUNT_SWITCHED,
			[targerOfficialAccountProfile]
		);
	}

	function _newOfficialAccountFound(officialAccount){
		var type = officialAccount.type;

		officialAccount.messageView = createMessageView({
			officialAccount: officialAccount
		});

		if (!sessionListView){
			sessionListView = createSessionList({
				itemOnClickCallback: _switchToOfficialAccount
			});
			utils.on(sessionListBtn, 'click', function (){
				sessionListView.show();
				profile.currentOfficialAccount = null;
			});
		}
		sessionListView.appendItem(officialAccount);

		// 有服务号消息时显示sessionList
		if (type === 'CUSTOM'){
			utils.removeClass(sessionListBtn, 'hide');
		}
	}
}(
	easemobim._const,
	easemobim.utils,
	app.profile,
	app.eventListener,
	app.apiHelper,
	app.createSessionList,
	app.createMessageView,
	app.promptCtaDialog
));
