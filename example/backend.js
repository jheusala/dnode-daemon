/* Test backend */

var m_counter = 0;

var remoted = require('../src/index.js');
remoted.createServer({}, {
    transform : function (s, cb) {
		cb(s.replace(/[aeiou]{2,}/, 'oo').toUpperCase())
    },
	counter: function(cb) {
		cb(m_counter++);
	}
});

/* EOF */
