var utils = require('../../common/utils');
var uikit = require('./uikit');
var apiHelper = require('./apiHelper');
var channel = require('./channel');

var dom = utils.createElementFromHTML([
	'<div>',
	'<h3>请对我的服务做出评价</h3>',
	'<ul></ul>',
	'<div class="tag-container"></div>',
	'<textarea spellcheck="false" placeholder="请输入留言"></textarea>',
	'</div>'
].join(''));
var starsUl = dom.querySelector('ul');
var starList;
var commentDom = dom.querySelector('textarea');
var tagContainer = dom.querySelector(".tag-container");
var dialog = uikit.createDialog({
	contentDom: dom,
	className: 'satisfaction'
}).addButton({
	confirmText: '提交',
	confirm: function () {
		var selectedTagNodeList = tagContainer.querySelectorAll('.selected');
		var tagNodeList = tagContainer.querySelectorAll('.tag');
		var content = commentDom.value;
		var appraiseTags = _.map(selectedTagNodeList, function (elem){
			return {
				id: elem.getAttribute('data-label-id'),
				name: elem.innerText
			};
		});

		// 必须选择星级
		if (!score) {
			uikit.tip('请先选择星级');
			// 防止对话框关闭
			return false;
		}
		// 若有标签则至少选择一个
		else if (tagNodeList.length > 0 && selectedTagNodeList.length === 0){
			uikit.tip('请先选择标签');
			// 防止对话框关闭
			return false;
		}
		else {
			_sendSatisfaction(score, content, session, invite, appraiseTags);
			uikit.showSuccess('提交成功');
			_clear();
		}
	}
});

var session;
var invite;
var score;

utils.live('li', 'click', function(e){
	var evaluateId = this.getAttribute("data-evaluate-id");
	var level = +this.getAttribute('data-level');

	score = this.getAttribute('data-score');

	level && _.each(starList, function (elem, i) {
		utils.toggleClass(elem, 'sel', i < level);
	});

	evaluateId && _createLabel(evaluateId);
}, starsUl);

utils.live('span.tag', 'click', function(e){
	utils.toggleClass(this, 'selected');
}, tagContainer);

function _clear(){
	commentDom.blur();
	commentDom.value = '';
	score = null;
	// clear stars
	utils.removeClass(starList, 'sel');
	//clear label
	tagContainer.innerHTML='';
}

function _sendSatisfaction(score, content, session, invite, appraiseTags) {
	channel.sendText('', {ext: {
		weichat: {
			ctrlType: 'enquiry',
			ctrlArgs: {
				inviteId: invite || '',
				serviceSessionId: session || '',
				detail: content,
				summary: score,
				appraiseTags: appraiseTags,
			}
		}
	}});
}

function _setSatisfaction(){
	apiHelper.getEvaluationDegrees().then(function (entities){
		starsUl.innerHTML = _.chain(entities)
		.sortBy('level')
		.map(function (elem, index){
			// stat level 1-based
			var level = index + 1;
			var name = elem.name;
			var id = elem.id;
			var score = elem.score;

			return '<li data-level="' + level
				+ '" title="' + name
				+ '" data-evaluate-id="' + id
				+ '" data-score="' + score
				+ '">H</li>';
		})
		.value()
		.join('');

		starList = starsUl.querySelectorAll("li");
	});
}

function _createLabel(evaluateId){
	apiHelper.getAppraiseTags(evaluateId).then(function (entities){
		tagContainer.innerHTML = _.map(entities, function (elem){
			var name = elem.name;
			var id = elem.id;

			return '<span data-label-id = "' + id + '" class="tag">' + name + '</span>';
		}).join('');
		utils.removeClass(tagContainer, "hide");
	});
}

module.exports = {
	show: function(currentInviteId, currentServiceSessionId){
		session = currentServiceSessionId;
		invite = currentInviteId;
		_setSatisfaction();
		dialog.show();
	}
};
