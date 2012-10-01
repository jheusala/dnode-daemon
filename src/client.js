/* */

var dnode = require('dnode');

var mod = module.exports = {};

mod.connect = function(config, app) {
	var config = config || {};
	var remote_server_script = config.remote_server_script || 'server.js';
	
	var d = dnode();
	d.on('remote', app);
	
	var spawn = require('child_process').spawn,
	    child = spawn('ssh', [config.hostname, remote_server_script]);
	child.on('error', function(err) {
		console.log('Error: ' + err);
	});
	child.stdout.pipe(d).pipe(child.stdin);

};

/* EOF */
