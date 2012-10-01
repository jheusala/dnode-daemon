/* */

var dnode = require('dnode');

var d = dnode();
d.on('remote', function (remote) {
    remote.transform('beep', function (s) {
        console.log('beep => ' + s);
        d.end();
    });
});

var net = require('net');
var c = net.connect('unix.sock');
c.pipe(d).pipe(c);

/* EOF */
