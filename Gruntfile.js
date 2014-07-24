/**
 * Gruntfile for freedom-storage-dropbox
 *
 * Here are the common tasks used:
 * build
 *  - Lint and compile
 *  - (default Grunt task) 
 *  - This must be run before ANY karma task (because of connect:default)
 * demo
 *  - start a web server for seeing demos at
 *    http://localhost:8000/demo
 * test
 *  - Build, and run all unit tests on 
 *    Chrome, Firefox, and PhantomJS
 * debug
 *  - Same as test, except keeps the browsers open 
 *    and reruns tests on watched file changes.
 *  - Used to debug unit tests
 **/

var fileInfo = require('freedom');
var freedomPrefix = require.resolve('freedom').substr(0,
  require.resolve('freedom').lastIndexOf('freedom') + 8);
var addPrefix = function(file) {
  if (file.indexOf('!') !== 0 && file.indexOf('/') !== 0) {
    return freedomPrefix + file;
  }
  return file
}
var FILES = {
  src: [
    'src/**/*.js'
  ],
  demo: [
    'demo/**/*.js'
  ],
  specHelper: [
    'config.js',
    'spec/helper/**/*.js'
  ],
  spec: [
    'spec/**/*.spec.js'
  ]
};

FILES.karma = fileInfo.unGlob([].concat(
  fileInfo.FILES.srcCore,
  fileInfo.FILES.srcPlatform,
  fileInfo.FILES.srcJasmineHelper,
  fileInfo.FILES.srcProviderIntegration
).map(addPrefix));
FILES.karma.include = FILES.karma.include.concat(
  FILES.specHelper, 
  FILES.spec
);
console.log(FILES);

module.exports = function (grunt) {
  /**
   * GRUNT CONFIG
   **/
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    karma: {
      options: { configFile: 'karma.conf.js' },
      single: { singleRun: true, autoWatch: false },
      watch: { singleRun: false, autoWatch: true },
      phantom: {
        browsers: ['PhantomJS'],
        singleRun: true,
        autoWatch: false
      },
    },
    jshint: {
      src: {
        files: { src: FILES.src },
        options: { jshintrc: true }
      },
      demo: FILES.demo,
      options: { '-W069': true }
    },
    clean: [],
    connect: {
      default: {
        options: {
          port: 8000,
          keepalive: false,
          base: ["./", "./node_modules/freedom/"]
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
  grunt.loadNpmTasks('grunt-karma');
  
  // Default tasks.
  grunt.registerTask('build', [
    'jshint',
    'connect:default'
  ]);
  grunt.registerTask('test', [
    'build',
    'karma:phantom'
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

module.exports.FILES = FILES;
