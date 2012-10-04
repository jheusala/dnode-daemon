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
    child  = spawn('node', ['src/console2unix.js']);
console.log('Spawned child pid: ' + child.pid);
child.stdout.pipe(d).pipe(child.stdin);

/* EOF */
