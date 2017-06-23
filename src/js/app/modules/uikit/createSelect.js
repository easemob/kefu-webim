app.createSelect= (function(_const, utils, Dict, uikit, profile){
	var containerDom;
	var selectDom;
	var popuplist;
	var selectClassName;
	var popuplistClassName;
	var list;

	return function (opt) {
		opt = opt || {};
		selectClassName = opt.selectClassName || '';
		popuplistClassName = opt.popuplistClassName || '';
		containerDom = opt.container;
		list = opt.list
		if (!_.isArray(list) || _.isEmpty(list) || !containerDom) return;

		var newSelectDom = utils.createElementFromHTML('<div class="em-select ' + selectClassName +'"><label class="em-select-desc"></label><span class="icon-arrange em-select-icon"></span></div>');

		if (selectDom){
			containerDom.replaceChild(newSelectDom, selectDom);
		}
		else {
			containerDom.appendChild(newSelectDom);
		}
		selectDom = newSelectDom

		var newPopuplist = _render(opt);

		if (popuplist){
			document.body.replaceChild(newPopuplist, popuplist);
		}
		else {
			document.body.appendChild(newPopuplist);
		}
		popuplist = newPopuplist;

		_setOffset();

		_bindEvents ();
		// 默认选中第一个
		containerDom.selectValue = list[0].sign;
		selectDom.querySelector('.em-select-desc').innerText = list[0].desc;
	};

	function _bindEvents(){
		// 选中itm-select
		utils.live('li.itm-select', utils.click, _selectItem, popuplist);

		// 点击下拉框头部 展示下拉框
		utils.on(selectDom, 'click', _show);

		// 点击别处时隐藏列表
		utils.on(document, 'click', function (ev) {
			var e = window.event || ev;
			var target = e.srcElement || e.target;
			// if (utils.isMobile) return;
			if (!utils.hasClass(target, 'em-select') && !utils.hasClass(target.parentNode, 'em-select')) {
				_hide()
			}
		});
	}

	function _setOffset() {
		var	containerOffset = _getOffset(containerDom);
		popuplist.style.top = containerOffset.top + 1 + 'px';
		popuplist.style.left =  containerOffset.left + 1 + 'px';
		popuplist.style.width = containerOffset.width + 'px';
	}

	function _getOffset(dom) {
		return {
			width: dom.clientWidth,
			height: dom.clientHeight,
			left: _getLeft(dom),
			top: _getTop(dom)
		}
	}

	function _getTop(e){
	   var offset=e.offsetTop;
	   if(e.offsetParent!=null){
	     offset += _getTop(e.offsetParent);
	   }
	   return offset;
	}

	function _getLeft(e){
	   var offset=e.offsetLeft;
	   if(e.offsetParent!=null){
	      offset += _getLeft(e.offsetParent);
	   }
	   return offset;
	}

	function _render() {
		var options = '<ul class="em-popuplist hide ' + popuplistClassName + '">';
		options += (_.map(list, function(item){
			return '<li class="itm-select" data-sign="' + item.sign + '">' + item.desc + '</li>';
		})).join('');
		options += '</ul>';
		return utils.createElementFromHTML(options);
	}

	function _show () {
		utils.removeClass(popuplist, 'hide');
	}

	function _hide () {
		utils.addClass(popuplist, 'hide');
	}

	function _selectItem (e) {
		containerDom.selectValue = this.getAttribute('data-sign');
		selectDom.querySelector('.em-select-desc').innerText = this.innerText;
	}


}(easemobim._const, easemobim.utils, app.Dict, app.uikit, app.profile));
