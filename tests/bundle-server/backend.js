/* Test backend */

var m_counter = 0;

module.exports = {
    transform : function (s, cb) {
		cb(s.replace(/[aeiou]{2,}/, 'oo').toUpperCase())
    },
	counter: function(cb) {
		cb(m_counter++);
	}
};

/* EOF */
