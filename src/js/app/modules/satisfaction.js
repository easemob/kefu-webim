/**
 * 满意度调查
 */
app.satisfaction = (function(utils, uikit, channel,apiHelper){
	var preventTimestamp = '1970-01-01 00:00:00';
	var dom = utils.createElementFromHTML([
		'<div>',
		'<h3>请对我的服务做出评价</h3>',
		'<ul></ul>',
		'<div class="tag-container"></div>',
		'<textarea spellcheck="false" placeholder="请输入留言"></textarea>',
		'</div>'
	].join(''));
	var starsUl = dom.querySelector('ul');
	var starList = starsUl.querySelectorAll('li');
	var msg = dom.querySelector('textarea');
	var tagContainer = dom.querySelector(".tag-container");
	var dialog = uikit.createDialog({
		contentDom: dom,
		className: 'satisfaction'
	}).addButton({
		confirmText: '提交',
		confirm: function () {
			var level = starsUl.querySelectorAll('li.sel').length;
			var selectedTagNodeList = tagContainer.querySelectorAll('.selected');
			var tagNodeListLength = tagContainer.querySelectorAll('.tag').length;
			var star;
			var tagArr = [];

			if (level === 0) {
				uikit.tip('请先选择星级');
				// 防止对话框关闭
				return true;
			}

			if( tagNodeListLength > 0 && selectedTagNodeList.length === 0){
				uikit.tip('请先选择标签');
				// 防止对话框关闭
				return true;
			}

			star = level;

			tagArr = _.map(selectedTagNodeList, function (elem){
				return {
					id: elem.getAttribute('data-label-id'),
					name: elem.innerText
				};
			}) || [];

			_sendSatisfaction(level, msg.value, session, invite, star, tagArr);

			_clear();
			uikit.showSuccess('提交成功');
		}
	});
	var session;
	var invite;

	utils.on(starsUl, 'click', function (e) {
		var ev = e || window.event;
		var target = ev.target || ev.srcElement;
		var selIndex = +target.getAttribute('data-idx') || 0;
		var evaluateId = target.getAttribute("data-evaluate-id");
		if(selIndex!=0){
			_.each(starList, function (elem, i) {
				utils.toggleClass(elem, 'sel', i < selIndex);
			});
			createLabel(evaluateId);
		}
	});

	utils.live('span.tag', 'click', function(e){
		utils.toggleClass(this, 'selected');
	}, tagContainer);

	function _clear(){
		msg.blur();
		msg.value = '';
		// clear stars
		utils.removeClass(starList, 'sel');
		//clear label
		tagContainer.innerHTML='';
	}

	function _sendSatisfaction(level, content, session, invite, star, tagArr) {
		channel.sendText('', {ext: {
			weichat: {
				ctrlType: 'enquiry',
				ctrlArgs: {
					inviteId: invite || '',
					serviceSessionId: session || '',
					detail: content,
					summary: level,
					evaluationDegreeId: star,
					appraiseTags: tagArr,
				}
			}
		}});
	}



	function setSatisfaction(){

		apiHelper.getEvaluationDegrees().then(function (entities){
			var timestamp = utils.getDataByPath(entities, '0.createDateTime');

			if(!timestamp || timestamp > preventTimestamp){
				timestamp && (preventTimestamp = timestamp);
				entities.sort(function(a,b){
					return a.level-b.level;
				})

				starsUl.innerHTML = _.map(entities, function (elem, i){
					var idx = i + 1;
					var name = elem.name;
					var id = elem.id;

					return '<li data-idx="' + idx +'" title="' + name + '" data-evaluate-id="' + id + '">H</li>';
				}).join('') || '';
				starList = starsUl.querySelectorAll("li");
			}
		});		
	}
	function createLabel(evaluateId){
		if(evaluateId){
			apiHelper.getAppraiseTags(evaluateId).then(function (entities){
				tagContainer.innerHTML = _.map(entities, function (elem, i){
					var name = elem.name;
					var id = elem.id;
					return '<span data-label-id = "' + id + '" class="tag">' + name + '</span>';
				}).join('') || '';
				utils.removeClass(tagContainer,"hide");
			});
		}
	}

	return {
		show: function(currentInviteId, currentServiceSessionId){
			session = currentServiceSessionId || null;
			invite = currentInviteId || null;
			setSatisfaction();
			dialog.show();
		}
	};
}(easemobim.utils, app.uikit, app.channel, app.apiHelper));
