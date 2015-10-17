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
        
        uglify: {
            options: {
                mangle: false
            },
            my_target: {
                files: {
                    'easemob.js':[
                        'js/src/easemob.js'
                    ],
                    'easemob.utils.js':[
                        'js/src/easemob.utils.js'
                    ],
                    'js/emkf.min.js':[
                        'js/src/jquery-1.11.1.js',
                        'js/src/strophe.js',
                        'js/src/easemob.im-2.0.js',
                        'js/src/easemob.utils.js',
                        'js/src/jquery.autogrow.js',
                        'js/src/const.js',
                        'js/src/api.js',
                        'js/src/getinfo.js',
                        'js/src/im.js'
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
                    'theme/base.min.css': [
                        'theme/base.css'
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
    grunt.registerTask('default', ['uglify']);
};
