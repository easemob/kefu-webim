# 环信移动客服网页插件

## 集成网页插件

请参考[集成文档](http://docs.easemob.com/cs/300visitoraccess/20webplugin)

## 定制开发（大多数时候不需要）

1. 安装nodejs
具体请参考 [nodejs.org](https://nodejs.org/)

2. 在终端执行以下命令，全局安装命令一般需要使用root权限运行
	- 安装cnpm (此步骤仅为了加速相关依赖包的安装速度)

		>	$ npm install -g cnpm --registry=https://registry.npm.taobao.org
	- 安装全局gulp，用于在命令行调用，可参考[gulpjs.com](http://gulpjs.com/)

		>	$ cnpm install gulp-cli -g
	- 下载代码

		>	$ git clone https://github.com/easemob/kefu-webim.git
	- 进入代码目录

		>	$ cd kefu-webim
	- 安装依赖

		>	$ cnpm install
	- 构建并压缩js (用于生产环境)

		>	$ gulp build
	- 仅构建 (用于调试)

		>	$ gulp dev
	- 安装webserver依赖

		>	$ cd server
		   $ cnpm install
	- 运行webserver，让代码在本地跑起来

		>	$ node app -t kefu.easemob.com -p 8080
	- 此时可以用浏览器打开 `http://localhost:8080/webim/demo.html`

## 其他命令可以查看帮助

	$ cd kefu-webim
	$ node server/app -h
	>>>  Usage: app [options]
	Options:
	-h, --help         output usage information
	-V, --version      output the version number
	-p, --port <n>     listen port, default 8080
	-t, --target [domain]    backend domain name, default: sandbox.kefu.easemob.com
	-s, --ssl            use ssl for http

