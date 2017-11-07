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

