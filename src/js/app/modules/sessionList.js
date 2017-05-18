app.sessionList = (function(utils, uikit){
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
		_show();
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
		listDom.innerHTML = _.map(serviceList, function(item){
			var name = item.name;
			var id = item.official_account_id;
			var avatar = item.img;

			return [
				'<li data-id="' + id + '">',
				'<img src="' + avatar + '">',
				'<span class="name">' + name + '</span>',
				'</li>'
			].join('');
		}).join('');
	}

	return {
		show: _show,
		toggle: _toggle,
		init: _init
	};
}(easemobim.utils, easemobim.uikit));
