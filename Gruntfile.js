module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    concat: {
      // Concatenate CSS files
      main: {
        src: [
          'public/src/css/reset.css',
          'public/src/css/prism.css',
          'public/src/css/components/client/*.css'
        ],
        dest: 'public/main.css'
      },
      admin: {
        src: [
          'public/src/css/reset.css',
          'public/src/css/prism.css',
          'public/src/css/components/admin/*.css'
        ],
        dest: 'public/admin.css'
      }
    },
    // Minify CSS files
    cssmin: {
      main: {
        src: 'public/main.css',
        dest: 'public/main.min.css'
      },
      admin: {
        src: 'public/admin.css',
        dest: 'public/admin.min.css'
      }
    },
    // Clean output directories
    clean: {
      distCss: {
        options: { force: true },
        src: ['public/*.css']
      }
    },
    // Watch for changes in CSS files
    watch: {
      css: {
        files: ['public/src/css/**/*.css'],
        tasks: [
          'clean:distCss', // Changed task name
          'concat:main',
          'concat:admin',
          'cssmin'
        ],
        options: {
          interrupt: true
        }
      }
    }
  });

  // Load Grunt plugins
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-clean');

  // Register the default task
  grunt.registerTask('default', ['watch']);
};
