app.sessionList = (function(utils, uikit, profile){
	var EMPTY_FUNCTION = function(){};
	var dialog;
	var listDom;
	var itemOnClickCallback;
	var collection;

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
		itemOnClickCallback = opt.callback || EMPTY_FUNCTION;
		collection = opt.collection || [];

		dialog = _createDialog();
		listDom = dialog.el.querySelector('ul');
		_render(collection);
		utils.on(listDom.querySelectorAll('li'), 'click', _cb);
	}

	function _cb(){
		var id = this.getAttribute('data-id');
		itemOnClickCallback(id);
		_hide();
	}

	function _removing(){
		utils.off(listDom.querySelectorAll('li'), 'click', _cb);
	}

	function _render(serviceList){
		listDom.innerHTML = _.map(serviceList, _renderItem).join('');
	}

	function _appendItem(item){
		var itemDom = utils.createElementFromHTML(_renderItem(item));
		listDom.appendChild(itemDom);
		utils.on(itemDom, click, _cb);
	}

	function _renderItem(item){
		var name = item.name;
		var id = item.official_account_id;
		var avatar = item.img || profile.tenantAvatar || profile.defaultAvatar;

		return [
			'<li data-id="' + id + '">',
			'<img src="' + avatar + '">',
			'<span class="name">' + name + '</span>',
			'</li>'
		].join('');
	}

	return {
		appendItem: _appendItem,
		show: function(){
			_show();
			return this;
		},
		init: function(opt){
			_init(opt);
			return this;
		}
	};
}(easemobim.utils, app.uikit, app.profile));
