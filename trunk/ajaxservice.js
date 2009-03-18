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
var AjaxService = function(url, iMethod, iSync){	
	AjaxService.superclass.call(this, null);
	
	var params = {}, requestHeader = {}, queue = [];
	var method = "";
	var self = this, transactionFlag = false, timeoutDuration = false, timeout = false, synchronous = iSync;
	var stateArr = ['uninitialized', 'loading', 'loaded', 'interactive', 'complete'];
	this.registerEvents( ["success", "failure", "exception", "timeout"].concat(stateArr));
	this.setMethod = function(meth){
		method = meth;
		if(method.toUpperCase() == "POST")
			this.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	};
	this.setParams = function(prm){
		params = prm;
	};
	this.setTimeout = function(num){
		timeoutDuration = num; 
	};
	this.setSynchronous = function(bool){
		synchronous = bool;
	};
	this.getTimeout = function(){
		return timeoutDuration;
	};
	this.setRequestHeader = function(name, value){
		requestHeader[name] = value;
	};
	this.send = function(prm){
		if(synchronous && transactionFlag)
			queueRequest(url, prm || params, method);
		else
			request(url, prm || params, method);
	}
	function queueRequest(iUrl, iPrm, iMethod){
		queue.push({ url : iUrl, params : iPrm, method : iMethod});
	}
	function serializeQueryString(obj){
		var arr = [];
		
		if(typeof obj == "string")
			return obj;			
		for(var i in obj)
			arr.push(encodeURIComponent(i) + "=" + encodeURIComponent(obj[i]));
		return arr.join("&");
	}
	function isSuccess(status){
		return (status >= 200 && status < 300);
	}
	function request(iUrl, prm, iMethod){
		transactionFlag = true;
		var xhr = getXHR();		
		xhr.onreadystatechange = handleStateChange.bind(self, xhr);
		xhr.open(iMethod, iUrl, true);
		setRequestHeaders(xhr);		
		xhr.send(serializeQueryString(prm));
		if(timeoutDuration)
			startTimeout(xhr);
	}
	function startTimeout(xhr){
		xhr.timeout = setTimeout(handleTimeout.bind(this, xhr), timeoutDuration);
	}
	function setRequestHeaders(myXhr){
		for(var i in requestHeader)
			myXhr.setRequestHeader(i, requestHeader[i]);	
	}
	function handleStateChange(xhr){
		var state = stateArr[xhr.readyState];
		try{
			if(state == "complete"){
				clearTimeout(xhr.timeout);
				transactionFlag = false;					
			}			
			this.dispatchEvent(state, xhr);
			if(state == "complete" && isSuccess(xhr.status))
				this.dispatchEvent("success", xhr);
			else if(state == "complete" && !isSuccess(xhr.status))
				this.dispatchEvent("failure", xhr);			
			if(state == "complete" && synchronous && queue.length > 0){
				var tmp = queue.shift();
				request(tmp.url, tmp.params, tmp.method);			
			}
		}
		catch(e){
			this.dispatchEvent("exception", xhr, e);
		}
	}
	function handleTimeout(xhr){
		try{
			xhr.abort();
			this.dispatchEvent("timeout", xhr);
			}
		catch(e){
			xhr.exception = e;
			this.dispatchEvent("exception", xhr);
		}
	};
	
	
	var getXHR = function(){
		try{
			return new XMLHttpRequest();
		}
		catch(e){
			try{
				return new ActiveXObject('Msxml2.XMLHTTP')
			}
			catch(e2){
				return new ActiveXObject('Microsoft.XMLHTTP')
			}
		}
	}
	this.setMethod(iMethod || "POST");
	this.getRawXHR = getXHR;
	
};
Class.extend(AjaxService, EventDispatcher);