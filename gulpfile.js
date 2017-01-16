/*

	以下文件老版本会引用到，不能在服务器上彻底删除，但如果需要的话可以在当前代码分支中删除

	/static/js/em-open.js
	/static/js/em-transfer.js
	/transfer.html
	/static/img/file_download.png

*/

var debug = false;
const VERSION = '43.12.018';

const gulp = require('gulp');
const postcss = require('gulp-postcss');
const sass = require('gulp-sass');
const cssnano = require('cssnano');
const autoprefixer = require('autoprefixer');
const minifycss = require('gulp-minify-css');
const jshint = require('gulp-jshint');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const clean = require('gulp-clean');
const minifyHtml = require("gulp-minify-html");
const template = require('gulp-template');

//clean
gulp.task('clean', function() {
	gulp.src([
			'static/css/im.css',
			'static/js/main.js',
			'im.html',
			'easemob.js'
		], {
			read: false
		}
	)
	.pipe(clean({force: true}));
});


//minifyHtml
gulp.task('minifyHtml', function () {
	gulp.src('static/tpl/im.html')
	.pipe(minifyHtml())
	.pipe(template({ WEBIM_PLUGIN_VERSION: VERSION }))
	.pipe(gulp.dest('.'));
});

//postcss
gulp.task('cssmin', function() {
	gulp.src([
		'static/css/src/global.scss',
		'static/css/src/icon.scss',
		'static/css/src/header.scss',
		'static/css/src/body.scss',
		'static/css/src/chat.scss',
		'static/css/src/send.scss',
		'static/css/src/theme.scss',
		'static/css/src/ui.scss',
		'static/css/src/mobile.scss',
	])
	.pipe(concat('im.css'))
	.pipe(template({ WEBIM_PLUGIN_VERSION: VERSION }))
	.pipe(sass())
	.pipe(postcss([
		autoprefixer({
			browsers: ['ie >= 8', 'ff >= 10', 'Chrome >= 15', 'iOS >= 7', 'Android >= 4.4.4']
		}),
		cssnano({
			discardComments: {
				removeAll: true,
			},
			mergeRules: false,
			zindex: false,
			reduceIdents: false,
		}),
	]))
	.pipe(gulp.dest('static/css/'));
});



//jshint
gulp.task('lint', function() {
	gulp.src([
		'static/js/src/*.js',
		'static/js/src/modules/*.js',
	])
	.pipe(jshint({
		"laxcomma" : true,
		"laxbreak" : true,
		"expr" : true
	}))
	.pipe(jshint.reporter());
});


//compress
gulp.task('combineJs', function() {
	var main = gulp.src([
		'static/js/src/sdk/strophe.js',
		// 'static/js/src/sdk/strophe-1.2.8.js',
		'static/js/src/sdk/adapter.js',
		'static/js/src/sdk/webim.config.js',
		'static/js/src/sdk/websdk-1.4.6.js',
		'static/js/src/sdk/easemob.im-1.1.1.js',
		'static/js/src/sdk/webrtc-1.4.4.js',
		'static/js/src/modules/polyfill.js',
		'static/js/src/modules/utils.js',
		'static/js/src/modules/const.js',
		'static/js/src/modules/ajax.js',
		'static/js/src/modules/transfer.js',
		'static/js/src/modules/api.js',
		'static/js/src/modules/eventsEnum.js',
		'static/js/src/modules/autogrow.js',
		'static/js/src/modules/message.js',
		'static/js/src/modules/paste.js',
		'static/js/src/modules/leaveMessage.js',
		'static/js/src/modules/satisfaction.js',
		'static/js/src/modules/imgView.js',
		'static/js/src/modules/uploadShim.js',
		'static/js/src/modules/wechat.js',
		'static/js/src/modules/site.js',
		'static/js/src/modules/channel.js',
		'static/js/src/modules/ui.js',
		'static/js/src/modules/videoChat.js',
		'static/js/src/modules/chat.js',
		'static/js/src/modules/eventCollector.js',
		'static/js/src/init.js'
	])
	.pipe(concat('main.js'));
	debug || main.pipe(uglify());
	main.pipe(template({ WEBIM_PLUGIN_VERSION: VERSION }))
	.pipe(gulp.dest('static/js/'));

	var ejs = gulp.src([
		'static/js/src/modules/utils.js',
		'static/js/src/modules/transfer.js',
		'static/js/src/modules/eventsEnum.js',
		'static/js/src/modules/notify.js',
		'static/js/src/modules/titleSlide.js',
		'static/js/src/modules/iframe.js',
		'static/js/src/userAPI.js',
	])
	.pipe(concat('easemob.js'));
	debug || ejs.pipe(uglify());
	ejs.pipe(template({ WEBIM_PLUGIN_VERSION: VERSION }))
	.pipe(gulp.dest('.'));

	var transfer = gulp.src([
		'static/js/src/modules/ajax.js',
		'static/js/src/modules/transfer.js',
		'static/js/src/modules/api.js',
	])
	.pipe(concat('em-transfer.js'));
	debug || transfer.pipe(uglify());
	transfer.pipe(gulp.dest('static/js/'));
});


//build default debug = false
gulp.task('build', ['clean'],  function() {
	gulp.start('cssmin', 'combineJs', 'minifyHtml');
});

gulp.task('dev', function(){
	debug = true;
	gulp.start('build');
})

gulp.task('watch', function() {
	gulp.start('dev');
	gulp.watch(['static/js/src/*.js', 'static/js/src/*/*.js'], ['combineJs']);
	gulp.watch(['static/css/src/*.scss'], ['cssmin']);
	gulp.watch(['static/tpl/im.html'], ['minifyHtml']);
});
