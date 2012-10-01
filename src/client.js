/* */

var dnode = require('dnode');

var mod = module.exports = {};

mod.connect = function(config, app) {
	var config = config || {};
	var target = config.target;
	var remote_client_cmd = config.remote_cmd || 'ssh';
	var remote_server_cmd = config.remote_server_cmd || 'server';
	var remote_client_args = config.remote_args || [target, remote_server_cmd];
	
	var d = dnode();
	d.on('remote', app);
	
	var spawn = require('child_process').spawn,
	    child = spawn(remote_client_cmd, remote_client_args);
	child.on('error', function(err) {
		console.log('Error: ' + err);
	});
	child.stdout.pipe(d).pipe(child.stdin);

};

/* EOF */
