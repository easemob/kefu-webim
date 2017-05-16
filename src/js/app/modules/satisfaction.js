/**
 * 满意度调查
 */
app.satisfaction = (function(utils, uikit, channel,apiHelper){
	var time = 0;
	var dom = utils.createElementFromHTML([
		'<div>',
		'<h3>请对我的服务做出评价</h3>',
		'<ul></ul>',
		'<div class="evaluate-label"></div>',
		'<textarea spellcheck="false" placeholder="请输入留言"></textarea>',
		'</div>'
	].join(''));
	var starsUl = dom.querySelector('ul');
	var starList = starsUl.querySelectorAll('li');
	var msg = dom.querySelector('textarea');
	var label = dom.querySelector(".evaluate-label");
	var dialog = uikit.createDialog({
		contentDom: dom,
		className: 'satisfaction'
	}).addButton({
		confirmText: '提交',
		confirm: function () {
			var level = starsUl.querySelectorAll('li.sel').length;
			var tag = label.querySelectorAll('.label-selected');
			var star;
			var tagArr = [];

			if (level === 0) {
				uikit.tip('请先选择星级');
				// 防止对话框关闭
				return true;
			}

			if(label.children.length > 0 && tag.length === 0){
				uikit.tip('请先选择标签');
				// 防止对话框关闭
				return true;
			}

			star = level+1;

		    tag.forEach(function(e){
		    	var json = {
		    		id:e.getAttribute('data-laberid'),
		    		name:e.innerText
		    	}

		    	tagArr.push(json);
		    });

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
		var selIndex = +target.getAttribute('idx') || 0;
		var evaluateId = target.getAttribute("data-evaluateId");
		if(selIndex!=0){
			_.each(starList, function (elem, i) {
				utils.toggleClass(elem, 'sel', i < selIndex);
			});
			createLabel(evaluateId);
		}
	});

	utils.on(label, 'click', function(e){
		var ev = e || window.event;
		var target = ev.srcElement || ev.target;
		if(target.nodeName ==='SPAN'){
			if(target.className != 'label-selected'){
				target.className = "label-selected";
			}else{
				target.className = "";
			}
		}
		return false;
	});

	function _clear(){
		msg.blur();
		msg.value = '';
		// clear stars
		utils.removeClass(starList, 'sel');
		//clear label
		label.innerHTML='';
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

		apiHelper.getStatisticsnNumber().then(function (resq){
			var data = resq.entities;
			if(time == 0 || data[0].createDateTime > time){
				time = data[0].createDateTime;
				starsUl.innerHTML = "";
				var str = "";
				data.sort(function(a,b){
					return a.level-b.level;
				})
				for(var i=0;i<data.length;i++){
					str+="<li idx='"+(i+1)+"' title='"+data[i].name+"' data-evaluateId='"+data[i].id+"'>H</li>"
				}
				starsUl.innerHTML = str;
				starList = starsUl.querySelectorAll("li");
			}
		});

		
		
	}
	function createLabel(evaluateId){
		if(evaluateId != null){
			apiHelper.getStatisticsnLabelNumber(evaluateId).then(function (resq){
				var msg = resq.entities;
				if(msg.length>0){
					var str = '';
					label.innerHTML = '';
					for(var i=0;i<msg.length;i++){
						str += '<span data-laberId = "'+msg[i].id+'">'+msg[i].name+'</span>';
					}
					label.innerHTML = str;
					label.className = 'evaluate-label';
					utils.removeClass(label,"hide");
				}
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
