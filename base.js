/*  Prototype JavaScript Code, snippets taken for the purpose of slimming the code base.
 *  (c) 2005-2008 Sam Stephenson
 *
 *  Prototype is freely distributable under the terms of an MIT-style license.
 *  For details, see the Prototype web site: http://www.prototypejs.org/
 *
 *--------------------------------------------------------------------------*/

if(!window["Prototype"]){


	Object.extend = function(destination, source) {
	  for (var property in source)
		destination[property] = source[property];
	  return destination;
	};
	var $A = Array.from = function(iterable) {
	  if (!iterable) return [];
	  if (iterable.toArray) {
		return iterable.toArray();
	  } else {
		var results = [];
		for (var i = 0, length = iterable.length; i < length; i++)
		  results.push(iterable[i]);
		return results;
	  }
	}
	
	Function.prototype.bind = function(){
		var __method = this, args = $A(arguments), object = args.shift();
		return function() {
		  return __method.apply(object, args.concat($A(arguments)));
		}
	};
	
	var Class = {};
	
	var Event = {
	observe: function(element, eventName, handler) {
	      try{
	        element.addEventListener(eventName, handler, false);
	      } catch(e){
	    	element.attachEvent("on" + eventName, handler);
	      }

	      return element;
	    }
	};
	
}

Class.extend = function(sub, superClass){
	Object.extend(sub.prototype, superClass.prototype);	
	sub.superclass = superClass;
	return sub;
};