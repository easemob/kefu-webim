// 视频邀请确认对话框
easemobim.ui = {};
easemobim.ui.videoConfirmDialog = easemobim.utils.isSupportWebRTC && (function(){
	var dialog = document.querySelector('div.em-dialog-video-confirm');
	var buttonPanel = dialog.querySelector('div.button-panel');
	var btnConfirm = dialog.querySelector('.btn-confirm');
	var btnCancel = dialog.querySelector('.btn-cancel');
	var confirmCallback = null;
	var cancelCallback = null;

	buttonPanel.addEventListener('click', function(evt){
		var className = evt.target.className;

		if (~className.indexOf('btn-cancel')) {
			'function' === typeof cancelCallback && cancelCallback();
		}
		else if (~className.indexOf('btn-confirm')) {
			'function' === typeof confirmCallback && confirmCallback();
		}
		else {
			return;
		}
		confirmCallback = null;
		cancelCallback = null;
		_hide();
	}, false);

	function _show(){
		dialog.classList.remove('hide');
	}
	function _hide(){
		dialog.classList.add('hide');
	}
	function _init(confirm, cancel){
		confirmCallback = confirm;
		cancelCallback = cancel;
		_show();
	}
	return {
		show: _show,
		hide: _hide,
		init: _init
	}
}());