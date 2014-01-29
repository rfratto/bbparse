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

// This is meant to be a client-side library but I'm using nodejs for testing;
// define window as the global object in the case of it not being defined. 
if (window == undefined) var window = global;

////// 
// the following functions are used by BBParse.lex 
// to test characters 
////// 
var isSym = function(character, not) {
	if ((character >= 'a' && character <= 'z') ||
			(character >= 'A' && character <= 'Z')) return false; 
	if (not && character == not) return false; 
	return true; 
}

var isLetter = function(character) {
	if ((character >= 'a' && character <= 'z') ||
			(character >= 'A' && character <= 'Z')) return true; 
	return false; 	
}

var isAlphaNumeric = function(character) {
	if (isLetter(character) || (character >= '0' && character <= '9')) 
		return true; 
	return false; 
}

var isWhitespace = function(character) {
	if (character == " " || character == "\n" || character == "\r" || character == "\t" ) return true; 
	return false;
}

window.BBParse = {
	//////
	// BBParse.lex 
	// 		returns an array of lexeme objects, with properties for type and body
	//		type may be one of the following: starttag, endtag, text 
	//////
	lex: function(text) {
		var ret = [] 

		var idx = 0
		while (idx < text.length) {
			stack = ""
			attrs = []

			if (text[idx] == '[') {
				idx++; 
				
				if (text[idx] == '/') { 					
					idx++

					while (isAlphaNumeric(text[idx])) stack += text[idx++] 
					if (text[idx++] == "]") ret.push({ type: "closetag", body: stack.trim() })
					else ret.push({ type: "text", body: "[/" + stack })
				} else {
					if (text[idx] == ']') {
						idx++

						while (text[idx] != "[" && text[idx] != undefined) 
							stack += text[idx++]

						ret.push({type: "text", body: "[]" + stack })

						continue;
					}

					while (isAlphaNumeric(text[idx]))
						stack += text[idx++]

					if (text.substr(idx, 2) == '="') {
						idx += 2
						value = ""
						while (text[idx] != '"') value += text[idx++]
						if (text[idx++] == '"') attrs.push({name: null, value: value}) 
						else {
							idx--
							stack = "[" + stack + "=\"" + value 

							while (text[idx] != "[" && text[idx] != undefined) 
								stack += text[idx++]

							ret.push({type: "text", body: stack })
							continue;

						}
					}

					var stack_tmp = "" 
					var handleAttributes = function() {
						if (text[idx] == " ") {
							idx++;
							var name = ""
							var value = ""

							while (isAlphaNumeric(text[idx])) name += text[idx++]
							stack_tmp += " " +  name
							if (text[idx] != "=") return "error"
							stack_tmp += "="
							idx++
							if (text[idx] != '"') return "error"
							idx++
							while (text[idx] && text[idx] != '"') value += text[idx++]
							stack_tmp += '"' + value 
							if (text[idx] != '"') return "error"
							stack_tmp += '"'
							idx++

							attrs.push({name: name, value: value})
							return handleAttributes();
						} else return null; 
					}

					var v = handleAttributes(); 
					if (v == "error") { 
						stack += stack_tmp

						while (text[idx] != "[" && text[idx] != undefined) 
							stack += text[idx++]

						ret.push({ type: "text", body: "[" + stack })
					} else {
						if (text[idx++] == ']') ret.push({ type: "opentag", body: stack.trim(), attrs: attrs })
						else {
							idx--

							while (text[idx] != "[" && text[idx] != undefined) 
								stack += text[idx++]

							ret.push({ type: "text", body: "[" + stack })
						}
					}
				}
			} else {
				while (text[idx] != "[" && text[idx] != undefined) 
					stack += text[idx++]

				ret.push({ type: "text", body: stack })
			}
		}

		return ret;
	}, 
	
	//////
	// BBParse.parse 
	// 		returns an object with all of the members 
	//		refer to README.md for how this object is structured
	//////
	parse: function(text) {
		var lexemes = this.lex(text)
		if (lexemes.length == 0) return {}; 

		var idx = 0; 

		var tagStack = []

		var _parse = function(e) {
			var ret = {}
			if (lexemes[idx] == undefined) return ret; 

			if (lexemes[idx].type == 'opentag') {
				ret.body = lexemes[idx++].body;
				if (lexemes[idx-1].attrs.length) {
					var copy = lexemes[idx-1].attrs 
					ret.attrs = {}
					for (var i in copy) 
						ret.attrs[copy[i].name || "self"] = copy[i].value
				}
				tagStack.push(ret.body);
				ret.child = _parse();
				tagStack.pop(ret.body);

				if (lexemes[idx] && lexemes[idx].body == ret.body && lexemes[idx].type == 'closetag') {
					idx++;
					ret.next = [_parse()];
				} else {
					if (ret.child.child) {
						ret.body = "[" + ret.body + "]"
						ret.next = [ret.child, _parse()];
					} else {
						ret.body = "[" + ret.body + "]" + ret.child.body 
						ret.next = [_parse()];
					}
					delete ret.child 
				}
			} else if (lexemes[idx].type == 'text') {
				ret.body = lexemes[idx++].body; 

				// if there is no matching start tag 
				if (lexemes[idx] && lexemes[idx].type == 'closetag' && tagStack.length == 0) 
					ret.body = ret.body + "[/" + lexemes[idx].body + "]"
				ret.next = [_parse()];
			} 

			return ret;
		} 

		return _parse(); 
	}
}