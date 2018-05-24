module.exports = function (grunt) {
  require("load-grunt-tasks")(grunt);

  var scriptsSrc = "app/scripts/";
  var libSrc = "app/lib/";
  var destination = "build/obf/";
  var packageLibDest = destination + "lib/";
  var scriptsDest = destination + "scripts/";

  grunt.registerTask("default", [
    "clean:all",
    "package"
  ]);

  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),
    package: {
      options: {
        libSrc: libSrc,
        libDest: packageLibDest,
        modules: [
          "yfiles/lang",
          "yfiles/layout-hierarchic",
          "yfiles/layout-organic",
          "yfiles/view-editor",
          "yfiles/view-layout-bridge"
        ],
        files: [{
          expand: true,
          cwd: scriptsSrc,
          src: ["**/*.js", "!**/license.js"],
          dest: scriptsDest
        }
       ],
        obfuscate: true,
        optimize: true
      },
      build: {
        // This empty target is required for technical reasons. Don't remove it.
      }
    },
    clean: {
      // Without the 'force' option, this task cannot delete files outside this file's subtree
      options: {force: true},
      // Remove all created files in the destination directories.
      all: [destination]
    }
  });
};
