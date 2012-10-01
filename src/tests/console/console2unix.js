
/* */

var net = require('net');
var c = net.connect('unixsock-server.sock');
c.on('error', function(e) {
	if (e.code == 'ECONNREFUSED') {
		// Start unix socket service
	} else {
		console.log('Unknown: ' + e);
	}
});
process.stdin.resume();
process.stdin.pipe(c).pipe(process.stdout);

/* EOF */
