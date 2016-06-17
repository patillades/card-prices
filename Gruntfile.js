module.exports = function(grunt) {
  grunt.initConfig({
    // Task configuration.
    jshint: {
      files: {
        src: ['app.js', 'lib/**/*.js']
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');

  grunt.registerTask('default', ['jshint']);
};
