/* */

var config = {
	sockfile: 'run/backend.sock',
	pidfile: 'run/backend.pid',
	logfile: 'run/backend.log'
};

var backend_logic = {
    transform : function (s, cb) {
		cb(s.replace(/[aeiou]{2,}/, 'oo').toUpperCase())
    },
	counter: function(cb) {
		cb(m_counter++);
	}
};

var init = require('init');
var fs = require('fs');
var server = undefined;

function do_cleanup() {
	fs.exists(config.sockfile, function(exists) {
		if(!exists) return;
		fs.unlink(config.sockfile, function(err) {
			if(err) console.error('Failed to unlink ' + config.sockfile +': ' + err);
		});
	});
}

function do_start(cb) {
	init.start({
	    pidfile : config.pidfile,
	    logfile : config.logfile,
	    run     : function () {
			var dnode = require('dnode');
			var net = require('net');
			var m_counter = 0;
			server = net.createServer(function (c) {
			    var d = dnode(backend_logic);
			    c.pipe(d).pipe(c);
			});
			server.listen(config.sockfile);
			server.on('error', function(err) {
				console.error('Error: ' + err);
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
			console.error('Failed to connect, trying to restart service...');
			do_start(function(err, pid) {
				if(err) {
					cb('Failed to start service: ' + err);
				} else {
					console.error('Restarted service');
					do_connect(cb);
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
			console.error('Failed to start service: ' + err);
		} else if(wasRunning) {
			console.log('Service was running already.');
		} else {
			console.log('Started service.');
		}
	});
} else if(process.argv[2] === 'status') {
	init.status(config.pidfile, function(results) {
		console.log(JSON.stringify(results));
	});
} else if(process.argv[2] === 'stop') {
	do_stop(function(stopped) {
		if(!stopped) {
			console.error('Failed to stop service!');
		} else {
			console.log('Service stopped.');
		}
	});
} else {
	do_connect(function(err, c) {
		if(err) {
			console.error('Error: ' + err);
		} else {
			process.stdin.resume();
			process.stdin.pipe(c).pipe(process.stdout);
		}
	});
}

/* EOF */
