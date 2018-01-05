# 环信移动客服网页插件

## 集成网页插件

请参考[集成文档](http://docs.easemob.com/cs/300visitoraccess/web-widget)

## 本地运行

1. 安装nodejs
具体请参考 [nodejs.org](https://nodejs.org/)

2. 在终端执行以下命令
	- 修改 npm 的 source（默认 source 安装速度可能不理想）

		>	npm config set registry https://registry.npm.taobao.org
	- 下载代码

		>	git clone https://github.com/easemob/kefu-webim.git
	- 进入代码目录

		>	cd kefu-webim
	- 进入`server`子目录

		>	cd server
	- 安装webserver依赖（此命令在kefu-webim/server目录下执行，下同）

		>	npm install
	- 运行webserver，让代码在本地跑起来

		>	npm run server
	- 此时可以用浏览器打开 `http://localhost:8008/webim/demo.html`

## 定制开发（`目前标准版已支持所有功能，绝大多数情形无需定制开发`）

- 在上述步骤的基础上还要执行下面的命令，推荐使用OSX 或 Linux，Window下安装依赖可能会有问题
	- 安装开发依赖（此命令在kefu-webim目录下执行，下同）

		>	npm install
	- 构建代码 (用于生产环境)

		>	npm run build
	- 构建并启动watch (用于开发)

		>	npm run dev

## 其他命令可以查看帮助

	cd kefu-webim
	node server/app -h
	>>>  Usage: app [options]
	Options:
	-h, --help         output usage information
	-V, --version      output the version number
	-p, --port <n>     listen port, default 8080
	-t, --target [domain]    backend domain name, default: sandbox.kefu.easemob.com

## 项目文件描述

- `LICENSE` 许可协议
- `README.md` README文件
- `demo.html` 测试页面
- `demos` 示例代码
- `easemob.js` 编译输出文件
- `en-US` 英文版编译输出目录
- `im.html` 编译输出文件
- `im_cached.html` 编译输出文件
- `package.json` npm配置文件
- `postcss.config.js` postcss配置文件
- `server` dev-server
- `src` 源代码目录
- `static` 静态文件
- `transfer.html` 编译输出文件
- `webpack.config.js` webpack配置文件

## src目录结构

- `src/js` js代码
- `src/js/app` 聊天窗口
- `src/js/app/sdk` 底层sdk
- `src/js/app/lib` 底层库
- `src/js/app/modules` 主体代码
- `src/js/app/modules/tools` 工具类
- `src/js/app/modules/chat` 附加功能
- `src/js/app/modules/uikit` ui组件
- `src/js/plugin` 宿主页面js代码
- `src/js/transfer` 用于跨域的iframe页面
- `src/js/common` 共用js代码
- `src/scss` 样式文件
- `src/template` 模板文件
- `src/html` html文件
- `src/plugin-scss` 宿主页面样式
- `src/font` icon-font
- `src/i18n` 多语言文案

## `src/js/app/modules` 文件说明

- `apiHelper.js` API接口层
- `channel.js` 消息通道
- `chat.js` 聊天窗口
- `eventCollector.js` 访客回呼功能
- `imgview.js` 图片查看
- `init.js` 初始化
- `leaveMessage.js` 留言页面
- `paste.js` 粘贴上传功能
- `satisfaction.js` 满意度评价页面
- `uikit.js` ui组件
- `videoChat.js` 视频通话功能
- `wechat.js` 微信授权登录功能呢
