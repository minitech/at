'use strict';

var tap = require('tap');
var at = require('./');

function render(template, data) {
	return at.compile(template)(data);
}

tap.test('at', function (t) {
	t.equal(render('@!("test")'), 'test', 'Unescaped interpolation should work at the beginning of a line');
	t.equal(at.compile('test @(5, 6) @!(7, 8)')(), 'test 6 8', 'The comma operator should be evaluated correctly');
	t.end();
});
