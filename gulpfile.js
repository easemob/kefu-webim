/*

	以下文件老版本会引用到，不能在服务器上彻底删除，但如果需要的话可以在当前代码分支中删除

	/static/js/em-open.js
	/static/js/em-transfer.js
	/transfer.html
	/static/img/file_download.png
todo: delete file_download.png
*/

var debug = false;
const TEMPLATE_DATA = {
	WEBIM_PLUGIN_VERSION: '47.9.008'
};

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
const prettify = require('gulp-jsbeautifier');

const BEAUTIFIER_OPT = {
	indent_with_tabs: true,
	eol: '\n',
	end_with_newline: true,
	indent_level: 0,
	preserve_newlines: true,
	max_preserve_newlines: 4,
	space_in_paren: false,
	space_in_empty_paren: false,
	jslint_happy: true,
	space_after_anon_function: false,
	brace_style: 'end-expand,preserve-inline',
	break_chained_methods: false,
	keep_array_indentation: true,
	unescape_strings: false,
	wrap_line_length: 120,
	e4x: false,
	comma_first: false,
	operator_position: 'preserve-newline',
	css: {
		selector_separator_newline: true,
	},
};

// prettify source code
gulp.task('prettify', function() {
	[
		{src: 'src/scss/*.scss', dest: 'src/scss'},
		{src: 'src/html/*.html', dest: 'src/html'},
		{src: 'src/js/common/*.js', dest: 'src/js/common'},
		{src: 'src/js/plugin/*.js', dest: 'src/js/plugin'},
		{src: 'src/js/app/modules/*.js', dest: 'src/js/app/modules'},
	].forEach(item => gulp.src(item.src)
		.pipe(prettify(BEAUTIFIER_OPT))
		.pipe(gulp.dest(item.dest))
	);
});

//clean
gulp.task('clean', function() {
	gulp.src([
			'static/css/im.css',
			'static/js/main.js',
			'im.html',
			'easemob.js'
		], {
			read: false
		})
		.pipe(clean({
			force: true
		}));
});

//minifyHtml
gulp.task('minifyHtml', function() {
	gulp.src('src/html/im.html')
		.pipe(minifyHtml())
		.pipe(template(TEMPLATE_DATA))
		.pipe(gulp.dest('.'));
	gulp.src('src/html/transfer.html')
		.pipe(minifyHtml())
		.pipe(template(TEMPLATE_DATA))
		.pipe(gulp.dest('.'));
});

//postcss
gulp.task('cssmin', function() {
	gulp.src([
			'src/scss/global.scss',
			'src/scss/icon.scss',
			'src/scss/header.scss',
			'src/scss/body.scss',
			'src/scss/chat.scss',
			'src/scss/send.scss',
			'src/scss/theme.scss',
			'src/scss/ui.scss',
			'src/scss/mobile.scss',
		])
		.pipe(concat('im.css'))
		.pipe(template(TEMPLATE_DATA))
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
			'src/js/common/*.js',
			'src/js/plugin/*.js',
			'src/js/app/modules/*.js',
		])
		.pipe(jshint({
			"laxcomma": true,
			"laxbreak": true,
			"expr": true
		}))
		.pipe(jshint.reporter());
});


//compress
gulp.task('combineJs', function() {
	var main = gulp.src([
			'src/js/app/lib/modernizr.js',
			'src/js/app/sdk/adapter.js',
			'src/js/app/sdk/webim.config.js',
			'src/js/app/sdk/websdk-1.4.6.js',
			'src/js/app/sdk/webrtc-1.4.4.js',
			'src/js/common/polyfill.js',
			'src/js/common/utils.js',
			'src/js/common/const.js',
			'src/js/common/ajax.js',
			'src/js/common/transfer.js',
			'src/js/app/modules/site.js',
			'src/js/app/modules/message.js',
			'src/js/app/modules/paste.js',
			'src/js/app/modules/leaveMessage.js',
			'src/js/app/modules/satisfaction.js',
			'src/js/app/modules/imgView.js',
			'src/js/app/modules/wechat.js',
			'src/js/app/modules/channel.js',
			'src/js/app/modules/ui.js',
			'src/js/app/modules/videoChat.js',
			'src/js/app/modules/chat.js',
			'src/js/app/modules/apiTransfer.js',
			'src/js/app/modules/apiHelper.js',
			'src/js/app/modules/eventCollector.js',
			'src/js/app/modules/init.js'
		])
		.pipe(concat('main.js'));
	debug || main.pipe(uglify());
	main.pipe(template(TEMPLATE_DATA))
		.pipe(gulp.dest('static/js/'));

	var ejs = gulp.src([
			'src/js/common/polyfill.js',
			'src/js/common/utils.js',
			'src/js/common/const.js',
			'src/js/common/transfer.js',
			'src/js/plugin/notify.js',
			'src/js/plugin/titleSlide.js',
			'src/js/plugin/iframe.js',
			'src/js/plugin/userAPI.js',
			'src/js/plugin/pcImgview.js',
		])
		.pipe(concat('easemob.js'));
	debug || ejs.pipe(uglify());
	ejs.pipe(template(TEMPLATE_DATA))
		.pipe(gulp.dest('.'));

	var transfer = gulp.src([
			'src/js/common/ajax.js',
			'src/js/common/transfer.js',
			'src/js/common/api.js',
		])
		.pipe(concat('em-transfer.js'));
	debug || transfer.pipe(uglify());
	transfer.pipe(gulp.dest('static/js/'));
});


//build default debug = false
gulp.task('build', ['clean'], function() {
	gulp.start('cssmin', 'combineJs', 'minifyHtml');
});

gulp.task('dev', function() {
	debug = true;
	gulp.start('build');
})

gulp.task('watch', function() {
	gulp.start('dev');
	gulp.watch(['src/js/plugin/*.js', 'src/js/common/*.js', 'src/js/app/modules/*.js'], ['combineJs']);
	gulp.watch(['src/scss/*.scss'], ['cssmin']);
	gulp.watch(['src/html/im.html'], ['minifyHtml']);
});