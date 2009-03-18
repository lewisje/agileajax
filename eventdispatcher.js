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
var EventDispatcher = Class.create({
	initialize : function(){
		var listenerChain = {};
		var eventRoster = [];
		
		this.registerEvent = function(name){
			eventRoster.push(name);
			listenerChain[name] = [];
		};
		this.registerEvents = function(arr){
			for(var i = 0, len= arr.length; i < len; i++)
				this.registerEvent(arr[i]);
		};
		this.getEventRoster = function(){
			return eventRoster;
		};
		this.getListenerChain = function(){
			return listenerChain;
		};
		this.addEventListener = function(type, listener){
			if(!listenerChain[type])					
				listenerChain[type] = [listener];
			else
				listenerChain[type].push(listener);	
		};
		this.hasEventListener = function(type){
			return (typeof listenerChain[type] != "undefined" && listenerChain[type].length > 0);
		};
		this.removeEventListener = function(type, listener){
			if(!this.hasEventListener(type))
				return false;	
			for(var i = 0, l = listenerChain[type].length; i < l; i++)
				if(listenerChain[type][i] === listener)
					listenerChain[type].splice(i, 1);		
		};
		this.dispatchEvent = function(type, arg){
			for(var i = 0, l = listenerChain[type].length; i < l; i++)
				listenerChain[type][i](arg);	
		};
		this.once = function(type, listener){
			var _listener = function(arg){
				listener(arg);
				this.removeEventListener(type, _listener);
			}.bind(this)
			this.addEventListener(type, _listener);	
		};
		this.on = this.addEventListener, this.un = this.removeEventListener, this.fire = this.dispatchEvent;
	
	}
});