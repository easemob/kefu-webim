/*
    gulp config
*/

var debug = false;

var gulp = require('gulp'),
    minifycss = require('gulp-minify-css'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    server = require('gulp-webserver'),
    clean = require('gulp-clean');



//clean
gulp.task('clean', function() {
    return gulp.src([
            'static/css/im.css',
            'static/js/main.js',
            'easemob.js'
        ], {
            read: false
        }
    )
    .pipe(clean({force: true}));
});


//cssmin
gulp.task('cssmin', function() {
    return gulp.src('static/css/src/im.css')
    .pipe(minifycss({compatibility: 'ie8'}))
    .pipe(gulp.dest('static/css/'));
});


//watch
gulp.task('watch', function() {
	gulp.watch(['static/js/src/*.js', 'static/js/src/*/*.js'], ['uglify']);
	gulp.watch(['static/css/src/*.js'], ['cssmin']);
});


//jshint
gulp.task('lint', function() {
    return gulp.src('static/js/src/*.js')
    .pipe(jshint({
        "laxcomma" : true,
        "laxbreak" : true,
        "expr" : true
    }))
    .pipe(jshint.reporter());
});


//compress
gulp.task('uglify', function() {
    var main = gulp.src([
        'static/js/src/sdk/strophe.js',
        'static/js/src/sdk/easemob.im-1.1.0.js',
        'static/js/src/modules/utils.js',
        'static/js/src/modules/ajax.js',
        'static/js/src/modules/common.js',
        'static/js/src/modules/transfer.js',
        'static/js/src/modules/api.js',
        'static/js/src/modules/const.js',
        'static/js/src/modules/eventsEnum.js',
        'static/js/src/modules/autogrow.js',
        'static/js/src/modules/init.js',
        'static/js/src/modules/message.js',
        'static/js/src/modules/paste.js',
        'static/js/src/modules/leaveMessage.js',
        'static/js/src/modules/satisfaction.js',
		'static/js/src/modules/imgView.js',
		'static/js/src/modules/uploadShim.js',
        'static/js/src/modules/chat.js',
        'static/js/src/main.js'
    ])
    .pipe(concat('main.js'));
    debug || main.pipe(uglify());
    main.pipe(gulp.dest('static/js/'));

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
    ejs.pipe(gulp.dest('.'));

    var open = gulp.src([
        'static/js/src/strophe.js',
        'static/js/src/easemob.im-1.0.8.js',
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


//build default
gulp.task('build', ['clean'],  function() {
    gulp.start('cssmin', 'uglify');
});
