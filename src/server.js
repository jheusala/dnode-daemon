/* */

/* for node-lint */
/*global Buffer: false, clearInterval: false, clearTimeout: false, console: false, global: false, module: false, process: false, querystring: false, require: false, setInterval: false, setTimeout: false, util: false, __filename: false, __dirname: false */

var net = require('net'),
    dnode = require('dnode'),
    init = require('init'),
    fs = require('fs'),
    mod = module.exports = {},
	stderr = process.stderr,
	stdout = process.stdout,
	stdin = process.stdin;

function init_config(config) {
	if(!config.homedir) {
		config.homedir = process.env.HOME || '.';
	}
	if(!config.appname) {
		config.appname = 'remoted';
	}
	if(!config.rcdir) {
		config.rcdir = config.homedir + '/.' + config.appname;
	}
	if(!config.sockfile) {
		config.sockfile = config.rcdir + '/backend.sock';
	}
	if(!config.pidfile) {
		config.pidfile = config.rcdir + '/backend.pid';
	}
	if(!config.logfile) {
		config.logfile = config.rcdir + '/backend.log';
	}
	return config;
}

mod.createServer = function(config, backend_logic) {
	backend_logic = backend_logic || {};
	config = init_config(config);
	
	var server;
	
	function do_cleanup() {
		fs.exists(config.sockfile, function(exists) {
			if(!exists) { return; }
			fs.unlink(config.sockfile, function(err) {
				if(err) {
					process.stderr.write('Failed to unlink ' + config.sockfile +': ' + err + "\n");
				}
			});
		});
	}
	
	function do_start(cb) {
	
		if(!fs.existsSync(config.rcdir)) {
			fs.mkdirSync(config.rcdir);
		}
	
		init.start({
		    pidfile : config.pidfile,
		    logfile : config.logfile,
		    run     : function () {
				server = net.createServer(function (c) {
				    var d = dnode(backend_logic);
				    c.pipe(d).pipe(c);
				});
				server.listen(config.sockfile);
				server.on('error', function(err) {
					process.stderr.write('Error: ' + err + "̛\n");
				});
				server.on('close', function() {
					do_cleanup();
				});
		    },
			success: function(pid, wasRunning) {
				cb(undefined, pid, wasRunning);
			},
			failure: function(error) {
				cb(error);
			}
		});
	}
	
	function do_stop(cb) {
		if(server) {
			server.on('close', function() {
				init.stop(config.pidfile, cb);
			});
			server.close();
		} else {
			init.stop(config.pidfile, cb);
			do_cleanup();
		}
	}

	/* */
	
	function do_connect(cb) {
		var c = net.connect(config.sockfile);

		c.on('error', function(e) {
			if( (e.code === 'ECONNREFUSED') || (e.code === 'ENOENT') || (e.code === 'EADDRINUSE') ) {
				stderr.write('Failed to connect, trying to restart service...\n');
				
				var spawn = require('child_process').spawn,
				    child = spawn(process.argv[0], [process.argv[1], 'start']);
				child.on('error', function(err) {
					stderr.write('Error: ' + err + "\n");
				});
				child.on('exit', function(code) {
					if(code !== 0) {
						cb('Failed to start service');
					} else {
						stderr.write('Service restarted.\n');
						setTimeout(function() {
							do_connect(cb);
						}, 250);
					}
				});
			} else {
				cb(e, c);
			}
		});
		c.on('connect', function() {
			cb(undefined, c);
		});
	}

	if(process.argv[2] === 'start') {
		do_start(function(err, pid, wasRunning) {
			if(err) {
				stderr.write('Failed to start service: ' + err + "\n");
			} else if(wasRunning) {
				stderr.write('Service was running already.\n');
			} else {
				stderr.write('Started service.\n');
			}
		});
	} else if(process.argv[2] === 'restart') {
		do_stop(function(stopped) {
			if(!stopped) {
				stderr.write('Failed to stop service!\n');
			//} else {
			//	stderr.write('Service stopped.\n');
			}
			do_start(function(err, pid, wasRunning) {
				if(err) {
					stderr.write('Failed to start service: ' + err + "\n");
				} else if(wasRunning) {
					stderr.write('Service was running already.\n');
				} else {
					stderr.write('Restarted service.\n');
				}
			});
		});
	} else if(process.argv[2] === 'status') {
		init.status(config.pidfile, function(results) {
			stderr.write(JSON.stringify(results) + "\n");
		});
	} else if(process.argv[2] === 'stop') {
		do_stop(function(stopped) {
			if(!stopped) {
				stderr.write('Failed to stop service!\n');
			} else {
				stderr.write('Service stopped.\n');
			}
		});
	} else {
		do_connect(function(err, c) {
			if(err) {
				stderr.write('Error: ' + err + "\n");
			} else {
				stdin.resume();
				stdin.pipe(c).pipe(stdout);
			}
		});
	}
};

/* EOF */
