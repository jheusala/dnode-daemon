
/* */

init = require('init');

init.simple({
    pidfile : 'unixsock-server.pid',
    logfile : 'unixsock-server.log',
    command : process.argv[3],
    run     : function () {
		var dnode = require('dnode');
		var net = require('net');
		var m_counter = 0;
		var server = net.createServer(function (c) {
		    var d = dnode({
		        transform : function (s, cb) {
		            cb(s.replace(/[aeiou]{2,}/, 'oo').toUpperCase())
		        },
				counter: function(cb) {
					cb(m_counter++);
				}
		    });
		    c.pipe(d).pipe(c);
		});
		server.listen('unixsock-server.sock');
    }
})

/* EOF */
