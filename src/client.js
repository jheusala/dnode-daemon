/* */

/* for node-lint */
/*global Buffer: false, clearInterval: false, clearTimeout: false, console: false, global: false, module: false, process: false, querystring: false, require: false, setInterval: false, setTimeout: false, util: false, __filename: false, __dirname: false */

var dnode = require('dnode');

var mod = module.exports = {};

mod.connect = function(config, app) {
	config = config || {};
	var target = config.target,
	    remote_client_cmd = config.remote_cmd || 'ssh',
	    remote_server_cmd = config.remote_server_cmd || 'server',
	    remote_client_args = config.remote_args || [target, remote_server_cmd],
	    d = dnode(),
	    spawn, child;

	d.on('remote', app);
	spawn = require('child_process').spawn;
	child = spawn(remote_client_cmd, remote_client_args);
	child.on('error', function(err) {
		console.log('Error: ' + err);
	});
	child.stdout.pipe(d).pipe(child.stdin);

};

/* EOF */
