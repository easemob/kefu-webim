/*
    gulp config
*/

var debug = false;
var version = '43.9';

var gulp = require('gulp');
var minifycss = require('gulp-minify-css');
var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var clean = require('gulp-clean');
var minifyHtml = require("gulp-minify-html");
var template = require('gulp-template');

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
    .pipe(template({ v: version }))
    .pipe(gulp.dest('.'));
});


//cssmin
gulp.task('cssmin', function() {
    gulp.src('static/css/src/im.css')
    .pipe(minifycss({compatibility: 'ie8'}))
    .pipe(template({ v: version }))
    .pipe(gulp.dest('static/css/'));
});


//watch
gulp.task('watch', function() {
    debug = true;
    gulp.watch(['static/js/src/*.js', 'static/js/src/*/*.js'], ['combineJs']);
    gulp.watch(['static/css/src/im.css'], ['cssmin']);
});


//jshint
gulp.task('lint', function() {
    gulp.src('static/js/src/*.js')
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
        'static/js/src/sdk/easemob.im-1.1.1.js',
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
        'static/js/src/modules/chat.js',
        'static/js/src/init.js'
    ])
    .pipe(concat('main.js'));
    debug || main.pipe(uglify());
    main.pipe(template({ v: version }))
    .pipe(gulp.dest('static/js/'));

    var ejs = gulp.src([
        'static/js/src/modules/utils.js',
        'static/js/src/modules/transfer.js',
        'static/js/src/modules/eventsEnum.js',
        'static/js/src/modules/notify.js',
        'static/js/src/modules/titleSlide.js',
        'static/js/src/modules/iframe.js',
        'static/js/src/easemob.js',
    ])
    .pipe(concat('easemob.js'));
    debug || ejs.pipe(uglify());
    ejs.pipe(template({ v: version }))
    .pipe(gulp.dest('.'));

    var open = gulp.src([
        'static/js/src/sdk/strophe.js',
        'static/js/src/sdk/easemob.im-1.0.8.js',
        'static/js/swfupload/swfupload.min.js',
        'static/js/src/modules/transfer.js',
    ])
    .pipe(concat('em-open.js'));
    debug || open.pipe(uglify());
    open.pipe(gulp.dest('static/js/'));

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

gulp.task('debug', function(){
    debug = true;
    gulp.start('build');
})