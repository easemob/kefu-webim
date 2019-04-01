var domUtils =		require("@/common/domUtils");
var classUtils =	require("@/common/classUtils");
var Dialog =		require("@/common/uikit/dialog");
var tips =			require("@/common/uikit/tips");
var uikit = require("../uikit");

// var profile =		require("@/app/tools/profile");
var apiHelper =		require("../apis");
var tpl =			require("./template/tagsTpl.html");

var TagSelector = classUtils.createView({

	dialog: null,
	msgId: "",
	hasTags: false,
	events: {
		"click li": "onTagClick"
	},

	init: function(){
		var me = this;


		// 拿到 taglist
		// apiHelper.getSatisfactionCommentTags(robotAgentId)
		// .then(function(dat){
		// 	me.hasTags = dat && dat.length;
		// 	me.$el.innerHTML = _.template(tpl)({ tags: dat });
		// 	me.createDialog();
		// });
	},

	createDialog: function(){
		this.dialog = new Dialog({
			contentDom: this.$el,
			className: "tag-selector"	// 把 dialog 做小
		})
		.addButton({
			confirmText: "提交",
			confirm: _.bind(this.onConfirm, this)
		});
	},

	onTagClick: function(e){
		var targetDom = e.target;
		domUtils.toggleClass(targetDom, "selected");
		e.stopPropagation();
	},

	show: function(dat, robotAgentId, satisfactionCommentKey){
		this.$el.innerHTML = _.template(tpl)({ tags: dat });
		this.createDialog();

		this.hasTags = dat && dat.length;
		this.robotAgentId = robotAgentId;
		this.satisfactionCommentKey = satisfactionCommentKey;
		// this.msgId = msgId;
		// this.multiTurnDialogueId = multiTurnDialogueId;
		if(this.hasTags){
			this.dialog.show();
		}
		else{
			tips.tip("需要管理员先设置问题标签");
		}
	},

	hide: function(){
		this.dialog.hide();
	},

	onConfirm: function(){
		var me = this;
		var selected = [];
		_.each(this.$el.querySelectorAll("li"), function(tagDom){
			if(domUtils.hasClass(tagDom, "selected")){
				selected.push(tagDom.innerText);
			}
		});
		// if(selected.length){
		// profile.getProp("sessionId").then(function(ssid){
		apiHelper.confirmSatisfaction(me.robotAgentId, me.satisfactionCommentKey, selected.join(","))
		.then(function(){
			uikit.tip("谢谢");
		}, function(err){
			if(err.errorCode === "KEFU_ROBOT_INTEGRATION_0207"){
				uikit.tip("已评价");
			}
		});

		me.hide();
		// });
		// 	return true;
		// }
		// tips.tip("未解决您的问题的原因是？");
		return false;
	},

});

module.exports = TagSelector;
