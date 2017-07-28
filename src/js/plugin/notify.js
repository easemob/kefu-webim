var titleSlide = require("./titleSlide");
var st = 0;

module.exports = function(img, title, content){
	if(st !== 0){
		return;
	}
	st = setTimeout(function(){
		st = 0;
	}, 3000);
	if(window.Notification){
		if(Notification.permission === "granted"){
			var notification = new Notification(
				title || "", {
					icon: img || "",
					body: content || ""
				}
			);
			notification.onclick = function(){
				if(typeof window.focus === "function"){
					window.focus();
				}
				this.close();
				titleSlide.stop();
			};
			setTimeout(function(){
				notification.close();
			}, 3000);
		}
		else{
			Notification.requestPermission();
		}
	}
};
