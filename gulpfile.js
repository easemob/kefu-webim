/*
    gulp config
*/

var gulp = require('gulp'),
    minifycss = require('gulp-minify-css'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    server = require('gulp-webserver'),
    clean = require('gulp-clean');


var mockData = require('./mock.json');


//clean
gulp.task('clean', function() {
    return gulp.src([
            'static/css/im.min.css',
            'static/js/emkf.min.js',
            'static/js/easemob.utils.js',
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
    gulp.src([
        'static/js/src/jquery-1.11.1.js',
        'static/js/src/strophe.js',
        'static/js/src/easemob.im-2.0.js',
        'static/js/src/jquery.autogrow.js',
        'static/js/src/easemob.utils.js',
        'static/js/src/const.js',
        'static/js/src/api.js',
        'static/js/src/init.js',
        'static/js/src/im.js'
    ])
    .pipe(concat('emkf.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest('static/js/'));

    gulp.src('static/js/src/easemob.js')
    .pipe(uglify())
    .pipe(gulp.dest('.'));

    gulp.src('static/js/src/easemob.utils.js')
    .pipe(uglify())
    .pipe(gulp.dest('static/js/'));

    gulp.src([
        'static/js/src/strophe.js',
        'static/js/src/easemob.im-2.0.js',
        'static/js/swfupload/swfupload.min.js',
        'static/js/src/transfer.js',
    ])
    .pipe(concat('em-open.js'))
    .pipe(uglify())
    .pipe(gulp.dest('static/js/'));

    gulp.src([
        'static/js/src/ajax.js',
        'static/js/src/transfer.js',
        'static/js/src/test.js',
    ])
    .pipe(concat('em-transfer.js'))
    .pipe(uglify())
    .pipe(gulp.dest('static/js/'));
});


//mock
gulp.task('server', function() {
    gulp.src('../')
    .pipe(server({
        livereload: true,
        directoryListing: {
            enable: true,
            path: '.'
        }
        , port: 8000
        , middleware: function(req, res, next) {
            var urlObj = req._parsedUrl,
                method = req.method;

            switch (urlObj.pathname) {
                case '/v1/webimplugin/visitors/password':
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(mockData.password));
                    break;
                case '/v1/webimplugin/visitors/msgHistory':
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(mockData.history));
                    break;
                case '/v1/webimplugin/visitors/webim-visitor-MX9RKPXTR3/ChatGroupId':
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(mockData.groupId));
                    break;
                case '/v1/webimplugin/targetChannels':
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(mockData.channels));
                    break;
                case '/v1/webimplugin/timeOffDuty':
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(mockData.duty));
                    break;
                case '/v1/webimplugin/theme/options':
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(mockData.options.theme));
                    break;
                case '/v1/webimplugin/notice/options':
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(mockData.options.notice));
                    break;
                case '/v1/webimplugin/visitors':
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(mockData.visitor));
                    break;
                default:
                    break;
            }
            next();
        }
    }));
});


//build default
gulp.task('build', ['clean'],  function() {
    gulp.start('cssmin', 'uglify');
});
