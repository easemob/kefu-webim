[环信移动客服](http://kefu.easemob.com)WEB访客插件集成说明
==============================


v43.0.0更新
----------
1.支持平台级租户（多租户集成）<br>
2.增加会话状态事件的支持<br>
3.增加用户系统的绑定<br>
4.增加收消息回调<br>
5.增加自动连接的配置<br>
6.增加系统欢迎语和机器人欢迎语功能<br>
7.增加显示企业logo功能<br>
8.bug fix



## 引用及配置示例
* 详见`demo.html`
* 所有参数及其含义见`config.js`, 其中包含设置访客信息
* 需要在本地搭建一个服务器环境，使用IP或者域名方式访问, 并且要安装node、gulp等工具,具体可见gulpfile.js 和 packkage.json


##### 直接引用环信客服线上easemob.js

* 将参数写在easemob.js后面, 当前仅支持5个参数hide、sat、resources、tenantId、emgroup(技能组名称)
```javascript
<script src='//kefu.easemob.com/webim/easemob.js?tenantId=XXX'></script>
```

* 也可全局添加配置参数
```javascript
<script>
window.easemobim = window.easemobim || {};
easemobim.config = {
	tenantId: 'XXX',
	appKey: 'orgName#appName'
	buttonText: '联系客服',
	domain: '//kefu.easemob.com',
	...
};
</script>
<script src='//kefu.easemob.com/webim/easemob.js'></script>
```

##### 放到自己的服务器上引用

**有几项是必填：**
```javascript
<script>
window.easemobim = window.easemobim || {};
easemobim.config = {
	tenantId: 'XXX',
	domain: '',		//环信移动客服域,			domain: '//kefu.easemob.com', 
	path: '',		//im.html的服务器路径,		path: '//XXX/webim'
	staticPath: ''	//访客插件static的路径,		staticPath: '//XXX/static'
};
</script>
<script src='//XXX/easemob.js'></script>
```

##### H5方式集成
```html
直接指定url即可://kefu.easemob.com/webim/im.html?tenantId=XXX&emgroup=(如需指定技能组，这里填写技能组名称)
```

##### 技能组绑定
* 绑定自己的用户
需要在环信客服管理员操作面板使用相同`appkey`创建多个关联，并使用关联绑定技能组功能。
* 随机访客
只需添加`emgroup`参数，并将技能组名称赋值给`emgroup`即可



## 集成用户 & 传访客信息

参考环信服务器端用户体系集成: [用户体系集成](http://docs.easemob.com/doku.php?id=start:100serverintegration:20users)
获取环信后台`userid`和`password`写入`easemobIM.config.user`完成集成指定用户
```javascript
<script>
window.easemobim = window.easemobim || {};
easemobim.config = {
	appKey: 'orgName#appName',
	to: '手机App绑定的IM号,'
	user: {
		username: '',
		password: '',
		token: ''
	},
	visitor: {
		trueName: '黎小冷',
		qq: '567**34',
		phone: '188****8888',
		companyName: '环信',
		userNickname: '我是黎小冷',
		description: '描述信息',
		email: '123456@**.com'
	}
};
</script>
<script src='//XXX/easemob.js'></script>
```



## 发送自定义消息

```javascript
easemobim.sendExt({/*收消息回调*/});//仅支持PC

例如：
easemobim.sendExt({
	custom: {
		custom: 'custom'
		...
	}
});
```



## 自定义调用按钮

将`easemobim.bind(config/*config支持的参数可见config.js*/)`方法绑定到A标签即可，例如自定义一个按钮
```html
<a onclick='easemobim.bind({
	tenantId: "XXX",
	to: "XXX",
	dialogWidth: "600px",
	buttonText: "快联系我"
	...
})'>自定义按钮</a>
```

其中加入了收消息回调可用于处理未读消息的UI
```javascript
<script>
window.easemobim = window.easemobim || {};
easemobim.config = {
	onmessage: function ( msg ) { }//收消息回调
};
</script>
```
