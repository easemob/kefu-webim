app.createSessionList = (function(_const, utils, Dict, uikit, profile, eventListener){
	var EMPTY_FUNCTION = function(){};
	var dialog;
	var listDom;
	var itemHashTable = new Dict();

	return function (opt){
		dialog = uikit.createDialog({
			className: 'session-list',
			contentDom:  '<ul></ul>'
		});
		listDom = dialog.el.querySelector('ul');

		utils.live('li.session-item', 'click', function (){
			var id = this.getAttribute('data-id');
			_itemOnClickCallback(id);
			dialog.hide();
		}, listDom);

		return {
			appendItem: _appendItem,
			updateItem: _updateItem,
			updateLatestMessage: _updateLatestMessage,
			updateUnreadCount: _updateUnreadCount,
			show: dialog.show,
		};
	};

	function _updateLatestMessage(item, textMessage){
		var itemId = item.official_account_id;
		var itemDom = itemHashTable.get(itemId);
		var latestMessageDom = itemDom.querySelector('.latest-message');

		latestMessageDom.innerText = textMessage;
	}

	function _updateUnreadCount(item, unreadCount){
		var itemId = item.official_account_id;
		var itemDom = itemHashTable.get(itemId);
		var unreadCountDom = itemDom.querySelector('.unread-count');

		if (!unreadCount){
			utils.addClass(unreadCountDom, 'hide');
		}
		else {
			unreadCountDom.innerText = unreadCount;
			utils.removeClass(unreadCountDom, 'hide');
		}
	}

	function _itemOnClickCallback(id){
		var targerOfficialAccountProfile = _.findWhere(profile.officialAccountList, {official_account_id: id});

		_.each(profile.officialAccountList, function(item){
			item.messageView.hide();
		});

		targerOfficialAccountProfile.messageView.show();
		profile.currentOfficialAccount = targerOfficialAccountProfile;

		eventListener.excuteCallbacks(
			_const.SYSTEM_EVENT.SWITCH_OFFICIAL_ACCOUNT,
			[targerOfficialAccountProfile]
		);
		// todo: to confirm this session info
		// _getLastSession(profile.currentOfficialAccount.official_account_id);
	}

	function _updateItem(item, oldId){
		var newId = item.official_account_id;
		var newItemDom = _renderItem(item);
		var oldItemDom = itemHashTable.get(oldId);

		listDom.replaceChild(newItemDom, oldItemDom);
		itemHashTable.set(newId, newItemDom);
		itemHashTable.remove(oldId);
	}

	function _appendItem(item){
		var id = item.official_account_id;
		var itemDom = _renderItem(item);
		listDom.appendChild(itemDom);
		itemHashTable.set(id, itemDom);
	}

	function _renderItem(item){
		var name = item.name;
		var id = item.official_account_id;
		var avatar = item.img || profile.defaultAvatar;
		return utils.createElementFromHTML([
			'<li class="session-item" data-id="' + id + '">',
				'<img src="' + avatar + '">',
				'<span class="name">' + name + '</span>',
				'<span class="latest-message"></span>',
				'<span class="latest-message"></span>',
				'<span class="unread-count icon-circle"></span>',
			'</li>'
		].join(''));
	}
}(easemobim._const, easemobim.utils, app.Dict, app.uikit, app.profile, app.eventListener));
