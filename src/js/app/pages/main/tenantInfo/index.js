var apiHelper = require("@/app/pages/main/apiHelper");
var PopupList = require("@/app/pages/main/uikit/popupList");
var utils = require("@/common/utils");
var channel = require("@/app/pages/main/channel");
var tpl = require("./template/indexTpl.html");

module.exports = function(){
	// 二级菜单实例
	var menuInsArr = [];
	var menuArr = [];
	var container = document.querySelector(".em-widget-tip");
	container.innerHTML = "";
	utils.addClass(container, "new");

	apiHelper.getNotice()
	.then(function(notice){
		if(!notice.enabled) return;
		menuArr = notice.content;
		container.innerHTML = _.template(tpl)({
			menu: menuArr
		});
		createMenu();
		utils.live(".tip-btn", "click", onMenuClick, container);
	});

	// 菜单点击
	function onMenuClick(e){
		var menuId;
		var menuDat;
		var target = e.srcElement || e.target;
		var targetBounding;
		if(utils.hasClass(target.parentNode, "tip-btn")){
			target = target.parentNode;
		}
		menuId = target.getAttribute("menuId");
		menuDat = menuArr[menuId];

		targetBounding = target.getBoundingClientRect();
		handleMenuClick(menuDat, menuId, {
			top: targetBounding.top + 48,
			left: targetBounding.left + (target.clientWidth * 0.1),
			width: target.clientWidth * 0.8,
		});
		// ie8
		// 使得 popupList 可以自动关闭
		e.stopPropagation();
		return false;
	}

	function handleMenuClick(menuDat, menuId, pos){
		// 有子菜单
		if(menuDat.sub_button){
			popupList(menuId, pos || {
				left: 0,
				top: 0,
				width: 0,
			});
		}
		// 无子菜单
		else{
			hideAllSubMenu();
			fireMsg(menuDat);
		}
	}

	function fireMsg(dat){
		switch(dat.type){
		// 发送 article
		case "media_id":
			fireArticle(dat);
			break;
		// 发送 url
		case "view":
			fireUrl(dat);
			break;
		// 发送 text
		case "txt":
			fireText(dat);
			break;
		default:
			break;
		}
	}

	function fireArticle(menuDat){
		apiHelper.getArticleJson({
			media_id: menuDat.media_id
		}).then(function(articles){
			articles = _.map(articles, function(article){
				return {
					title: article.title,
					digest: article.digest,
					description: article.digest,
					url: "/v1/webimplugin/tenants/" + article.tenantId + "/robot/article/html/" + article.articleId,
					// url: "/v1/Tenants/" + article.tenantId + "/robot/article/html/" + article.articleId,
					thumbUrl: "/v1/Tenant/" + article.tenantId + "/MediaFiles/" + article.thumb_media_id,
					picurl: "/v1/Tenant/" + article.tenantId + "/MediaFiles/" + article.thumb_media_id,
					prop: article.prop,
					sendCustomer: menuDat.send_by_customer
				};
			});
			// 根据send_by_customer值判断是否在客服上上屏
			// send_by_customer 为true 客服模式下的会话 不上屏，只在当前demo中上屏
			if(menuDat.send_by_customer){
				channel.handleMessage(
					{
						ext: {
							msgtype: {
								articles: articles,
							}
						},
					},
					{
						type: "article",
						noPrompt: true
					}
				);
			}
			else{
				channel.sendText("", {
					ext: {
						msgtype: {
							articles: articles,
						}
					},
				});
			}
		});
	}

	function fireText(menuDat){

	}

	function fireUrl(menuDat){

	}

	// 每个 btn 创建一个菜单
	function createMenu(){
		_.each(menuArr, function(menuDat, menuId){
			menuInsArr[menuId] = new PopupList({
				items: menuDat.sub_button,
				reportClick: handleMenuClick,
			});
		});
	}

	// 弹出菜单
	function popupList(menuId, pos){
		hideAllSubMenu();
		menuInsArr[menuId].show(pos);
	}

	function hideAllSubMenu(){
		_.each(menuInsArr, function(menuIns){
			menuIns.hide();
		});
	}

	return {
		show: function(){
			container.style.display = "block";
		},
		hide: function(){
			container.style.display = "none";
		}
	};
};
