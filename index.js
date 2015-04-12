'use strict';

var amp = /&/g;
var gt = /</g;
var lt = />/g;
var quot = /"/g;

function escapeHTML(text) {
	return ('' + text).replace(amp, '&amp;')
	                  .replace(gt, '&gt;')
	                  .replace(lt, '&lt;')
	                  .replace(quot, '&quot;');
}

var START_OF_LINE = 0;
var IN_LINE = 1;
var FULL_LINE_CODE = 2;
var MAYBE_INLINE_CODE = 3;
var MAYBE_UNESCAPED_INLINE_CODE = 4;
var INLINE_CODE = 5;

exports.compile = function compile(template) {
	// The infinite state machine!
	var state = START_OF_LINE;
	var text = '';
	var code = 'var __output = "";\n\n';

	for (var i = 0; i < template.length; i++) {
		var c = template.charAt(i);

		switch (state) {
			case START_OF_LINE:
				if (c === '@') {
					var next = template.charAt(i + 1);

					if (next === '(' || next === '!') {
						state = MAYBE_INLINE_CODE;
					} else {
						state = FULL_LINE_CODE;

						if (text) {
							code += '__output += ' + JSON.stringify(text) + ';\n';
							text = '';
						}
					}
				} else if (c === ' ' || c === '\t') {
					text += c;
				} else {
					state = IN_LINE;
					i--;
				}

				break;
			case IN_LINE:
				if (c === '@') {
					state = MAYBE_INLINE_CODE;
				} else {
					if (c === '\n') {
						state = START_OF_LINE;
					}

					text += c;
				}

				break;
			case FULL_LINE_CODE:
				if (c === '\n') {
					state = START_OF_LINE;
				}

				code += c;

				break;
			case MAYBE_INLINE_CODE:
				if (c === '(') {
					state = INLINE_CODE;

					if (text) {
						code += '__output += ' + JSON.stringify(text) + ' + __escape(';
						text = '';
					} else {
						code += '__output += __escape('; // Please don’t interpolate expressions with unparenthesized comma operators.
					}
				} else if (c === '!') {
					state = MAYBE_UNESCAPED_INLINE_CODE;
				} else {
					state = IN_LINE;
					text += '@';
					i--;
				}

				break;
			case MAYBE_UNESCAPED_INLINE_CODE:
				if (c === '(') {
					state = INLINE_CODE;

					if (text) {
						code += '__output += ' + JSON.stringify(text) + ' + (';
						text = '';
					} else {
						code += '__output += (';
					}
				} else {
					state = IN_LINE;
					text += '@!';
					i--;
				}

				break;
			case INLINE_CODE:
				if (c === '(') {
					state++;
					code += '(';
				} else if (c === ')') {
					state = IN_LINE;
					code += ');\n';
				} else {
					code += c;
				}

				break;
			default:
				if (state <= INLINE_CODE) {
					throw new Error('Unexpected state ' + state);
				}

				if (c === '(') {
					state++;
				} else if (c === ')') {
					state--;
				}

				code += c;
		}
	}

	if (text) {
		code += '__output += ' + JSON.stringify(text) + ';';
	}

	return new Function('__escape', 'data', code + '\nreturn __output;').bind(null, escapeHTML);
};
