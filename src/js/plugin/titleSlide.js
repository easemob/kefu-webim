var newTitle = __("prompt.new_message_title_notice");
var titleST = 0;
var originTitle = document.title;
var tempArr = (originTitle + newTitle).split("");
var word;

module.exports = {
	stop: function(){
		clearInterval(titleST);
		titleST = 0;
		document.title = originTitle;
	},
	start: function(){
		if(titleST){
			return;
		}
		titleST = setInterval(function(){
			word = tempArr.shift();
			document.title = word + Array.prototype.join.call(tempArr, "");
			tempArr.push(word);
		}, 360);
	}
};
