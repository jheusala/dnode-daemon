/* */

var homedir = process.env.HOME || '.';
var rcdir = homedir + '/.server';

var config = {
	sockfile: rcdir + '/backend.sock',
	pidfile: rcdir + '/backend.pid',
	logfile: rcdir + '/backend.log'
};

var backend_logic = require('./backend.js');

var fs = require('fs');
var server = undefined;

function do_cleanup() {
	fs.exists(config.sockfile, function(exists) {
		if(!exists) return;
		fs.unlink(config.sockfile, function(err) {
			if(err) process.stderr.write('Failed to unlink ' + config.sockfile +': ' + err + "\n");
		});
	});
}

var init = require('init');
function do_start(cb) {

	if(!fs.existsSync(rcdir)) {
		fs.mkdirSync(rcdir);
	}

	init.start({
	    pidfile : config.pidfile,
	    logfile : config.logfile,
	    run     : function () {
			var dnode = require('dnode');
			var net = require('net');
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
		service.on('close', function() {
			init.stop(config.pidfile, cb);
		});
		service.close();
	} else {
		init.stop(config.pidfile, cb);
		do_cleanup();
	}
}

/* */

function do_connect(cb) {
	var net = require('net');
	var c = net.connect(config.sockfile);
	c.on('error', function(e) {
		if( (e.code == 'ECONNREFUSED') || (e.code == 'ENOENT') ) {
			process.stderr.write('Failed to connect, trying to restart service...\n');

			var spawn = require('child_process').spawn,
			    child = spawn(process.argv[0], [process.argv[1], 'start']);
			child.on('error', function(err) {
				process.stderr.write('Error: ' + err + "\n");
			});
			child.on('exit', function(code) {
				if(code !== 0) {
					cb('Failed to start service');
				} else {
					process.stderr.write('Service restarted.\n');
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
			process.stderr.write('Failed to start service: ' + err + "\n");
		} else if(wasRunning) {
			process.stderr.write('Service was running already.\n');
		} else {
			process.stderr.write('Started service.\n');
		}
	});
} else if(process.argv[2] === 'status') {
	init.status(config.pidfile, function(results) {
		process.stderr.write(JSON.stringify(results) + "\n");
	});
} else if(process.argv[2] === 'stop') {
	do_stop(function(stopped) {
		if(!stopped) {
			process.stderr.write('Failed to stop service!\n');
		} else {
			process.stderr.write('Service stopped.\n');
		}
	});
} else {
	var stderr = process.stderr,
	    stdout = process.stdout,
	    stdin = process.stdin;
	do_connect(function(err, c) {
		if(err) {
			stderr.write('Error: ' + err + "\n");
		} else {
			stdin.resume();
			stdin.pipe(c).pipe(stdout);
		}
	});
}

/* EOF */
