'use strict';

var through = require('through2');

var RcLoader = require('rcloader');
var jshint = require('jshint').JSHINT;
var jshintcli = require('jshint/src/cli');

var path = require('path');
var fs = require('fs');
var _ = require('lodash');

module.exports = function (options) {

  var rcLoader = new RcLoader('.jshintrc', options, {
    loader: function (path) {
      var cfg = jshintcli.loadConfig(path);
      delete cfg.dirname;
      return cfg;
    }
  });

	var result = {
	  stats: {
	    'suites': 0,
	    'tests': 0,
	    'passes': 0,
	    'pending': 0,
	    'failures': 0,
	    'duration': 0
	  }
	};
	result.stats.start = result.stats.start || new global.Date();
	result.stats.end = result.stats.end || new global.Date();
	result.failures = [];
	result.passes = [];
	result.skipped = [];

	return through.obj(function (file, enc, cb) {
		var now = new global.Date();

		if (file.isNull()) {
			cb(null, file);
			return;
		}

    if (!file.isBuffer()) {
      return cb(null, file);
    }

    rcLoader.for(file.path, function (err, cfg) {
    	result.stats.suites = result.stats.suites + 1;
	    result.stats.tests = result.stats.tests + 1;
	    result.stats.end = now;
	    result.stats.duration = result.stats.end - result.stats.start;

      if (err) {
      	return cb(err);
      }

      var globals = {};
      if (cfg.globals) {
        globals = cfg.globals;
        delete cfg.globals;
      }

      var out = file.jshint || (file.jshint = {});
      var str = _.isString(out.extracted) ? out.extracted : file.contents.toString('utf8');

      out.success = jshint(str, cfg, globals);

      if (!out.success) {
      	var reply = [];
      	
	    	out.results = jshint.errors.map(
	    		function (err) {
				    if (err) {
							var error = [
								(reply.length + 1) + '. ',
								'line ' + err.line + ', ',
								'char ' + err.character + ': ',
								err.code + '(' + err.reason + ')'
							];

							reply.push(error.join(''));
				    }
			  	}
			  );

	      result.stats.failures = result.stats.failures + 1;
				result.failures.push({
					'title': 'JSHint ' + path.basename(file.path),
					'fullTitle': file.path,
					'duration': 0,
					'error': reply.join('\n') + ''
				});
      } else {
				result.stats.passes = result.stats.passes + 1;
      	result.passes.push({
					'title': 'JSHint ' + path.basename(file.path),
					'fullTitle': file.path,
					'duration': 0,
      	});
      }
      
      return cb(null, file);
    });
	}, function (cb) {
		fs.writeFileSync(
			options.filename,
			JSON.stringify(result, null, 2),
			'utf-8'
		);

		cb();
	});
};
