/* */

var remote_node = require('../src/index.js');

remote_node.connect({'remote_cmd':'node','remote_args':['./backend.js']}, function (remote, d) {
	remote.transform('beep', function (s) {
		console.log('"beep" transformed to "' + s + '"');
		remote.counter(function (count) {
			console.log('counter is ' + count);
			d.end();
		});
	});
});

/* EOF */
