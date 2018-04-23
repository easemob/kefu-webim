var classUtils = require("@/common/kit/classUtils");

module.exports = classUtils.createView({
	init: function(dom){
		this.displayDom = dom;
		this.timerHandler = null;
		this.count = 0;
	},
	start: function(){
		var me = this;

		// 若已存在则清除
		if(this.timerHandler) this.stop();

		setTimeout(_trigger, 0);
		this.timerHandler = setInterval(_trigger, 1000);

		function _trigger(){
			var escapedTime = me.count++;
			me.displayDom.innerHTML = moment(escapedTime * 1000).format("mm:ss");
		}
	},
	stop: function(){
		this.timerHandler = clearInterval(this.timerHandler);
		this.count = 0;
	},
});
