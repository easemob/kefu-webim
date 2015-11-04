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
    .pipe(jshint())
    .pipe(jshint.reporter('/usr/sk/easemob/report'));
});


//compress
gulp.task('uglify', function() {
    gulp.src([
        'static/js/lib/jquery-1.11.1.js',
        'static/js/lib/strophe.js',
        'static/js/lib/easemob.im-2.0.js',
        'static/js/lib/jquery.autogrow.js',
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
});


//mock
gulp.task('server', function() {
    gulp.src('../')
    .pipe(server({
        livereload: true,
        directoryListing: {
            enable:true,
            path: '.'
        }
        , port: 8000
        , middleware: function(req, res, next) {
            var urlObj = req._parsedUrl,
                method = req.method;

            switch (urlObj.pathname) {
                case '/v1/webimplugin/visitors/password':
                    var data = '7WX9EYTHR3';
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(data));
                    break;
                case '/v1/webimplugin/visitors/msgHistory':
                    var data = [];
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(data));
                    break;
                case '/v1/webimplugin/visitors/webim-visitor-MX9RKPXTR3/ChatGroupId':
                    var data = '190970';
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(data));
                    break;
                case '/v1/webimplugin/targetChannels':
                    var data = [{"tenantName":"环信dev","orgName":"sipsoft","appName":"sandbox","imServiceNumber":"190970"}];
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(data));
                    break;
                case '/v1/webimplugin/timeOffDuty':
                    var data = false;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(data));
                    break;
                case '/v1/webimplugin/theme/options':
                    var data = {"optionId":"5e094765-3485-4e77-86f8-50c7197d1bbb","tenantId":1920,"optionName":"webimPluginThemeName","optionValue":"丛林物语","createDateTime":"2015-09-01 12:14:56","lastUpdateDateTime":"2015-10-12 07:50:30"};
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(data));
                    break;
                case '/v1/webimplugin/notice/options':
                    var data = {"optionId":"502dbccf-ec74-4979-b431-cad046ddf53e","tenantId":1920,"optionName":"webimPluginNotice","optionValue":"www.zhuyouyou.com","createDateTime":"2015-09-01 12:14:56","lastUpdateDateTime":"2015-09-08 12:57:23"};
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(data));
                    break;
                case '/v1/webimplugin/visitors':
                    var data = {"id":0,"userId":"webim-visitor-MX9RKPXTR3","userPassword":"7WX9EYTHR3"};
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(data));
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
