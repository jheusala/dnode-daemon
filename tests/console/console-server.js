
/* */

var dnode = require('dnode');
var d = dnode({
	transform : function (s, cb) {
		cb(s.replace(/[aeiou]{2,}/, 'oo').toUpperCase())
	}
});
process.stdin.resume();
process.stdin.pipe(d).pipe(process.stdout);

/* EOF */
