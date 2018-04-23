var profile =	require("@/common/cfg/profile");
var utils =		require("@/common/kit/utils");
var domUtils =	require("@/common/kit/domUtils");
var Dict =		require("@/common/kit/dict");
var uikit =		require("@/common/uikit/dialog");

var EMPTY_FUNCTION = function(){};
var dialog;
var listDom;
var itemHashTable = new Dict();
var itemOnClickCallback;

module.exports = function(options){
	var opt = options || {};
	itemOnClickCallback = opt.itemOnClickCallback || EMPTY_FUNCTION;

	dialog = uikit.createDialog({
		className: "session-list",
		contentDom:  "<ul></ul>"
	});
	listDom = dialog.el.querySelector("ul");

	utils.live("li.session-item", "click", function(){
		var id = this.getAttribute("data-id");
		itemOnClickCallback(id);
		dialog.hide();
	}, listDom);

	return {
		appendItem: _appendItem,
		updateItem: _updateItem,
		updateLatestMessage: _updateLatestMessage,
		updateUnreadCount: _updateUnreadCount,
		show: dialog.show
	};
};

function _updateLatestMessage(itemId, textMessage, timestamp){
	var itemDom = itemHashTable.get(itemId);
	var latestMessageDom = itemDom.querySelector(".latest-message");
	var latestTimestamp = itemDom.querySelector(".latest-timestamp");

	latestTimestamp.innerText = timestamp;
	latestMessageDom.innerText = textMessage;

	listDom.insertBefore(itemDom, listDom.firstChild);
}

function _updateUnreadCount(itemId, unreadCount){
	var itemDom = itemHashTable.get(itemId);
	var unreadCountDom = itemDom.querySelector(".unread-count");

	if(!unreadCount || typeof unreadCount !== "number"){
		domUtils.addClass(unreadCountDom, "hide");
	}
	else if(unreadCount > 99){
		unreadCountDom.innerText = "...";
		domUtils.removeClass(unreadCountDom, "hide");
	}
	else{
		unreadCountDom.innerText = unreadCount;
		domUtils.removeClass(unreadCountDom, "hide");
	}
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
	// 这个会 block 我们的 dev 服务器
	/0/.test(item.img) && (item.img = "");
	var avatar = item.img || profile.defaultAvatar;
	return domUtils.createElementFromHTML([
		"<li class=\"session-item\" data-id=\"" + id + "\">",
		"<img class=\"avatar\" src=\"" + avatar + "\">",
		"<span class=\"name\">" + name + "</span>",
		"<span class=\"latest-message\"></span>",
		"<span class=\"latest-timestamp\"></span>",
		"<span class=\"unread-count hide\"></span>",
		"</li>"
	].join(""));
}
