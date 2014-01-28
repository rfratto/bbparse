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

describe('Lexer', function() {
	describe("should return an appropriate array", function() {
		it('for a basic string with no BBCode', function() {
			var check = BBParse.lex('hey whoa')
			expect(check).to.be.an('array')
			expect(check[0]).to.exist
			expect(check[0].body).to.equal('hey whoa')
		});

		it('for a basic string with BBCode', function() {
			var check = BBParse.lex('[code] hey whoa [/code] ok')
			expect(check).to.be.an('array')
			expect(check[0].body).to.equal('code')
			expect(check[0].type).to.equal('opentag')
			expect(check[1].type).to.equal('text')
			expect(check[1].body).to.equal(' hey whoa ')
			expect(check[2].type).to.equal('closetag')
			expect(check[2].body).to.equal('code')
		});

		it('for a basic string with fake BBCode', function() {
			var check = BBParse.lex("hey [what's going on");
			expect(check[0].body).to.equal('hey '); 
			expect(check[1].body).to.equal("[what's going on")
		})

		it('for a basic string with invalid BBCode', function() {
			var check = BBParse.lex("hey [what'!s] going on");
			expect(check[1].type).to.equal('text')
		})

		it('for a basic string with empty BBCode', function() {
			var check = BBParse.lex("hey [] what's going on")
			expect(check[1].body).to.equal("[] what's going on")
		})

		it('for a broken BBCode with attributes', function() {
			var check = BBParse.lex('[TAGA value="5 A[/TAGA]')
			expect(check[0].body).to.equal('[TAGA value="5 A')
		})
	})
});