/* */

var dnode = require('dnode');

var d = dnode();
d.on('remote', function (remote) {
    remote.transform('beep', function (s) {
        console.log('"beep" transformed to "' + s + '"');
	    remote.counter(function (count) {
	        console.log('counter is ' + count);
	        d.end();
	    });
    });
});


var spawn = require('child_process').spawn,
    child = spawn('node', ['server.js']);
console.log('Spawned child pid: ' + child.pid);
child.on('error', function(err) {
	console.log('Error: ' + err);
});
child.stdout.pipe(d).pipe(child.stdin);

/* EOF */
