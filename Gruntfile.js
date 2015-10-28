/*
 * grunt-lib-contrib
 * http://gruntjs.com/
 *
 * Copyright (c) 2012 Tyler Kellen, contributors
 * Licensed under the MIT license.
 */

module.exports = function(grunt) {
    'use strict';

    // Project configuration.
    grunt.initConfig({
        mock: {
            options: {
                route: {
                    '/v1/webimplugin/targetChannels': {
                        'get': {
                            delay: 500,
                            // 这里定义的 cookie 将与全局 cookie 进行合并，返回合并后的 cookie
                            /*cookie: {
                                id: 123,
                                username: 'bubkoo',
                                options:{
                                    maxAge: 1000 * 60 * 60
                                }
                            },*/
                            data: [
                                {"tenantName":"环信dev","orgName":"sipsoft","appName":"sandbox","imServiceNumber":"190970"}
                            ]
                        },
                    },
                    '/v1/webimplugin/timeOffDuty': {
                        'get': {
                            delay: 500,
                            data: true
                        },
                    },
                    '/v1/webimplugin/theme/options': {
                        'get': {
                            delay: 500,
                            data: [
                                {"optionId":"5e094765-3485-4e77-86f8-50c7197d1bbb","tenantId":1920,"optionName":"webimPluginThemeName","optionValue":"丛林物语","createDateTime":"2015-09-01 12:14:56","lastUpdateDateTime":"2015-10-12 07:50:30"}
                            ]
                        },
                    },
                    '/v1/webimplugin/notice/options': {
                        'get': {
                            delay: 500,
                            data: [
                                {"optionId":"502dbccf-ec74-4979-b431-cad046ddf53e","tenantId":1920,"optionName":"webimPluginNotice","optionValue":"www.zhuyouyou.com","createDateTime":"2015-09-01 12:14:56","lastUpdateDateTime":"2015-09-08 12:57:23"}
                            ]
                        },
                    },
                    '/v1/webimplugin/visitors': {
                        'post': {
                            delay: 500,
                            data: {"id":0,"userId":"webim-visitor-MX9RKPXTR3","userPassword":"7WX9EYTHR3"}
                        },
                    },
                }
            },
            't.com/webim/mock': {
                
            }
        },
        jshint: {
            options: {
                multistr: true,
                laxbreak: true,
                laxcomma: true,
                curly: true,
                eqeqeq: true,
                newcap: true,
                noarg: true,
                sub: true,
                undef: true,
                boss: true,
                node: true
            },
            globals: {
                exports: true
            }
            , all: ['static/js/src/*.js']
        },       
        uglify: {
            options: {
                mangle: false
            },
            my_target: {
                files: {
                    'easemob.js':[
                        'static/js/src/easemob.js'
                    ],
                    'static/js/easemob.utils.js':[
                        'static/js/src/easemob.utils.js'
                    ],
                    'static/js/emkf.min.js':[
                        'static/js/lib/jquery-1.11.1.js',
                        'static/js/lib/strophe.js',
                        'static/js/lib/easemob.im-2.0.js',
                        'static/js/src/easemob.utils.js',
                        'static/js/lib/jquery.autogrow.js',
                        'static/js/src/const.js',
                        'static/js/src/api.js',
                        'static/js/src/init.js',
                        'static/js/src/im.js'
                    ]
                }
            }
        },
        cssmin: {
            minify: {
                // expand: true,
                // src: ['*.css', '!*.min.css', '!*-min.css'],
                // //dest: '../../static/old/css/',
                // ext: '-min.css'
            },
            combine: {
                files: {
                    'static/css/im.min.css': [
                        'static/css/src/im.css'
                    ],
                }
            }
        },
        concat: {
            basic_and_extras: {
                files: {
                    
                }
            }
        }

    });

    //grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-restful-mock');
    grunt.registerTask('build', ['uglify', 'cssmin']);
};
