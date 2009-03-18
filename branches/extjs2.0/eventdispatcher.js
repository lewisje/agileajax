/**

Copyright (c) 2009 Matthew E. Foster

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

var EventDispatcher = function(){
	
	EventDispatcher.superclass.constructor.apply(this, arguments);
	
	this.addEventListener = this.on;
	this.removeEventListener = this.un;
	this.dispatchEvent = this.fireEvent;
	this.registerEvents = this.addEvents;
	
	this.once = function(name, listener, scope, cfg){
		var self = this;
		var _listener = function(arg){
			listener(arg);
			self.removeListener(name, _listener, scope);
		};
		this.on(name, _listener, scope, cfg);
	};
};
Ext.extend(EventDispatcher, Ext.util.Observable);