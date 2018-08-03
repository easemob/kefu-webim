var utils = require("../../../common/utils");
var apiHelper = require("../apiHelper");
var channel = require("../channel");
var guess_template = require("raw-loader!./guessInfo.html");


function loadHtml(){
    var htmlStr = _.template(guess_template)();
    var dom = utils.createElementFromHTML(htmlStr);

    var editorView = document.querySelector(".em-widget-send-wrapper");

    var doms = {
        guessTips: editorView.querySelector(".guess-tips"),
		guessArea: editorView.querySelector(".guess-area"),
		closeBtn: editorView.querySelector(".close-btn"),
		guessBtn: editorView.querySelectorAll(".guess-area li"),
		guessList: editorView.querySelector(".guess-list"),
        loading: editorView.querySelector(".loading"),
        
        textInput: editorView.querySelector(".em-widget-textarea"),
        chatWrapper: document.querySelector(".chat-wrapper"),

        editorView: editorView,
    };
    return {
        dom: dom,
        doms: doms
    }
}

function _addEvents(){
	var doms = loadHtml().doms;
	var oldValue = "";
	var newValue = "";

    // 点击猜你想说按钮上屏
	utils.live("li", "click",function(e){
		var curText = this.innerText;
		channel.sendText(curText);
		doms.textInput.value = "";
		utils.trigger(doms.textInput, "change");
		// 恢复默认样式
		doms.guessArea.style.display = "none";
		doms.chatWrapper.style.bottom = 140 + "px";
		doms.editorView.style.height = 140 + "px";
	    doms.guessList.innerHTML = "";
    }, doms.guessList);


    // 点击猜你想说关闭按钮 恢复样式
	utils.on(doms.closeBtn, "click", function(){
		doms.guessArea.style.display = "none";
		doms.chatWrapper.style.bottom = 140 + "px";
		doms.editorView.style.height = 140 + "px";
		doms.guessTips.innerText = "猜你想问";
		doms.loading.style.display = "block";
		doms.guessList.innerHTML = "";
    });
    

    // 文本框检索猜你想说内容
	utils.on(doms.textInput, "keyup", function(){
		doms.guessArea.style.display = "block";
		doms.chatWrapper.style.bottom = 160 + "px";
		doms.editorView.style.height = 160 + "px";

		var value = this.value;
		newValue = value;

		// 根据当前文本框输入内容是否发生变化 发起请求
		if(value && oldValue !== newValue){
				apiHelper.getGuessList(value).then(function(res){
					if(res && res.data && res.data.entities){
						doms.guessTips.innerText = "猜你想问";
						doms.loading.style.display = "none";
						// 创建模板
						createTemplate(res.data.entities);
						// 设置聊天框内容样式
						doms.chatWrapper.style.bottom = 300 + "px";
						doms.editorView.style.height = 300 + "px";
					}else{
						setTimeout(function(){
							// 检索不到值时恢复 默认样式
							doms.guessArea.style.display = "none";
							// doms.guessTips.innerText = "";
							// doms.loading.style.display = "block";
							doms.guessList.innerHTML = "";
							doms.chatWrapper.style.bottom = 140 + "px";
							doms.editorView.style.height = 140 + "px";
						}, 1000);
						console.log("请求了");
					}
				});
			oldValue = newValue;
		}
		// 当值不变时 不触发搜索状态
		else if(oldValue == newValue){
			doms.guessArea.style.display = "none";
			doms.chatWrapper.style.bottom = 140 + "px";
			doms.editorView.style.height = 140 + "px";
		}
		else if(!value){
			// 文本框内容清空时 重置样式
			doms.guessArea.style.display = "none";
			doms.chatWrapper.style.bottom = 140 + "px";
			doms.editorView.style.height = 140 + "px";
			oldValue = "";
		}
	});

}

// 根据`猜你想问`接口返回拼接模板
function createTemplate(data){
	var doms = loadHtml().doms;
    var html="";
    for(var i=0; i<data.length; i++){
        html+="<li>" + data[i] + "</li>";
        doms.guessList.innerHTML = html;
    }
}

// 重置样式
function resetStyle(){
    var doms = loadHtml().doms;
    doms.guessArea.style.display = "none";
	doms.chatWrapper.style.bottom = 140 + "px";
	doms.editorView.style.height = 140 + "px";
	doms.guessList.innerHTML = "";
	doms.guessTips.innerText = "猜你想问";
	doms.loading.style.display = "block";
}

module.exports = {
    loadHtml: loadHtml,
    addEvents: _addEvents,
    resetStyle: resetStyle
}
