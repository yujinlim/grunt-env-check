/*
 * grunt-env
 * https://github.com/yujinlim/grunt-env-check
 *
 * Copyright (c) 2015 yujinlim
 * Licensed under the MIT license.
 */

'use strict';
var keys = require('lodash.keys');
var pick = require('lodash.pick');
var inquirer = require("inquirer");

module.exports = function(grunt) {
  var questions = [];
  var GruntEnv = function() {
    this.envs = [];
  };

  // parse environments
  // get needed environment
  GruntEnv.prototype.parse = function(args) {
    if (args instanceof Array) {
      this.envs = args;
    } else {
      var selectedEnvs = pick(args, function(value) {
        return value === true;
      });
      this.envs = keys(selectedEnvs);
    }
  };

  GruntEnv.prototype.run = function(options) {
    this.envs.forEach(function(env) {
      grunt.log.writeln('processing ' + env);

      if (!options.ask && !process.env[env]) {
        grunt.fail.warn('Environment variable not found', 3);
      } else if (options.ask && !process.env[env]) {
        questions.push({
          name: env,
          message: 'Please insert environment variable for ' + env
        });
      }
    });
  };

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks
  grunt.registerMultiTask('env', 'Automate Grunt Environment checking on system', function() {
    var options = this.options();
    var gruntEnv = new GruntEnv();

    grunt.verbose.writeln('options', options);

    gruntEnv.parse(this.data.environments);

    gruntEnv.run(options);

    if (questions.length > 0) {
      var done = this.async();

      inquirer.prompt(questions, function(envs) {
        if (envs) {
          for (var env in envs) {
            process.env[env] = envs[env];
          }
        }
        done();
      });
    }
  });
};