app.sessionList = (function(utils, uikit, profile){
	var EMPTY_FUNCTION = function(){};
	var dialog;
	var listDom;
	var itemOnClickCallback;

	function _createDialog(){
		return uikit.createDialog({
			className: 'session-list',
			contentDom:  '<ul></ul>'
		});
	}

	function _show(){
		dialog.show();
	}

	function _hide(){
		dialog.hide();
	}

	function _toggle(){
		dialog.toggle();
	}

	function _init(opt){
		itemOnClickCallback = opt.onItemClick || EMPTY_FUNCTION;

		dialog = _createDialog();
		listDom = dialog.el.querySelector('ul');
	}

	function _cb(){
		var id = this.getAttribute('data-id');
		itemOnClickCallback(id);
		_hide();
	}

	function _appendItem(item){
		// 系统服务号的id强制设置为 'SYSTEM'
		// 因为系统服务号id初始化时为null，后续会更新
		var id = item.type === 'SYSTEM' ? 'SYSTEM' :item.official_account_id;
		var itemDom = _renderItem(item);
		listDom.appendChild(itemDom);
		utils.on(itemDom, 'click', _cb);
	}

	function _renderItem(item){
		var name = item.name;
		var id = item.official_account_id;
		var avatar = item.img || profile.tenantAvatar || profile.defaultAvatar;
		return utils.createElementFromHTML([
			'<li data-id="' + id + '">',
			'<img src="' + avatar + '">',
			'<span class="name">' + name + '</span>',
			'</li>'
		].join(''));
	}

	return {
		appendItem: _appendItem,
		show: _show,
		init: _init
	};
}(easemobim.utils, app.uikit, app.profile));
