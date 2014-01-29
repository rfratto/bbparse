/*
The MIT License (MIT)

Copyright (c) 2014 Robert Fratto

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/
require('../bbparse.js')
var chai = require('chai')
chai.should(); 
var expect = chai.expect;

describe('Parser', function() {
	describe("should return an appropriate object for", function() {
		it('a basic string with no BBCode', function() {
			var check = BBParse.parse('hey whoa')
			expect(check).to.be.an('object')
			expect(check.body).to.exist
			expect(check.body).to.equal('hey whoa')
		})

		it('a basic string with basic BBCode', function() {
			var check = BBParse.parse('[code] hey whoa [/code]')
			expect(check.body).to.exist
			expect(check.body).to.equal('code')
			expect(check.child).to.exist 
			expect(check.child.body).to.equal(' hey whoa ')
		})

		it('a basic string following basic BBCode', function() {
			var check = BBParse.parse('[code] hey whoa [/code] test')
			expect(check.next[0].body).to.equal(' test')
		})

		it('a basic string with nested BBCode', function() {
			var check = BBParse.parse('[code][code] hey whoa [/code][/code] test')			
			expect(check.body).to.equal('code')
			expect(check.child.body).to.equal('code')
			expect(check.child.child.body).to.equal(' hey whoa ');
			expect(check.next[0].body).to.equal(' test')
		})

		it('a basic string with multiple nested BBCode', function() {
			var check = BBParse.parse('[code][a]hey[/a][b]whoa[/b][/code]test')			
		})

		it('a broken BBCode', function() {
			var check = BBParse.parse('[code] nice')
			expect(check.body).to.equal('[code] nice')
		})

		it('a broken BBCode endtag', function() {
			var check = BBParse.parse('nice [/code]')
			expect(check.body).to.equal('nice [/code]')
		})

		it('a broken parent BBCode with a functional child BBCode', function() {
			var check = BBParse.parse('[code="6"][a]nice[/a]')
			expect(check.body).to.equal('[code]')
			expect(check.next[0].body).to.equal('a')
			expect(check.next[0].child.body).to.equal('nice')
		})

		it('a functional parent BBCode with a broken child BBCode', function() {
			var check = BBParse.parse('[code][a]nice[/code]')
			expect(check.body).to.equal('code')
			expect(check.child.body).to.equal('[a]nice')
		})

		it('advanced nested BBCode', function() {
			var check = BBParse.parse('[TAGA][TAGB]A[/TAGB]B[/TAGA] C [TAGC]D[/TAGC]')
			expect(check.child.next[0].body).to.equal("B")
		})

	});
});