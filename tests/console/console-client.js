/* */

var dnode = require('dnode');

var d = dnode();
d.on('remote', function (remote) {
    remote.transform('beep', function (s) {
        console.log('beep => ' + s);
        d.end();
    });
});


var spawn = require('child_process').spawn,
    child  = spawn('node', ['src/console-server.js']);
console.log('Spawned child pid: ' + child.pid);
child.stdout.pipe(d).pipe(child.stdin);

/* EOF */
