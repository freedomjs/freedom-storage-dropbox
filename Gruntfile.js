/**
 * Gruntfile for freedom.js
 *
 * Here are the common tasks used:
 * build
 *  - Lint and compile freedom.js
 *  - (default Grunt task) 
 *  - This must be run before ANY karma task (because of connect:default)
 *  - Unit tests only run on PhantomJS
 * demo
 *  - Build freedom.js, and start a web server for seeing demos at
 *    http://localhost:8000/demo
 * test
 *  - Build freedom.js, and run all unit tests on 
 *    Chrome, Firefox, and PhantomJS
 * debug
 *  - Same as test, except keeps the browsers open 
 *    and reruns tests on watched file changes.
 *  - Used to debug unit tests
 **/

module.exports = function (grunt) {
  /**
   * GRUNT CONFIG
   **/
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
      src: {
        files: { src: ['src/**/*.js'] },
        options: {
          jshintrc: true
        }
      },
      demo: ['demo/**/*.js', '!demo/**/third-party/**'],
      options: {
        '-W069': true
      }
    },
    clean: ['freedom.js', 'freedom.js.map', 'freedom.min.js', 'freedom.min.js.map'],
    connect: {
      default: {
        options: {
          port: 8000,
          keepalive: false
        }
      },
      demo: {
        options: {
          port: 8000,
          keepalive: true,
          base: ["./"],
          open: "http://localhost:8000/demo/"
        }
      }
    },
    gitinfo: {}
  });

  // Load tasks.
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  
  // Default tasks.
  grunt.registerTask('build', [
    'jshint',
    'connect:default'
  ]);
  grunt.registerTask('test', [
    'build',
    'karma:single'
  ]);
  grunt.registerTask('debug', [
    'build',
    'karma:watch'
  ]);
  grunt.registerTask('demo', [
    'connect:demo',
  ]);

  grunt.registerTask('default', ['build']);
};

