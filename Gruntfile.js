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
                    'static/css/base.min.css': [
                        'static/css/src/base.css'
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
    grunt.registerTask('build', ['uglify', 'cssmin']);
};
