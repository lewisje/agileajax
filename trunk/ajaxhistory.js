var AjaxHistory = function(service, dom){
	AjaxHistory.superclass.call(this, null);
	var self = this;
	var form = false, iframe = false;
	var urlSplitRegex = /(#|\?)/;
	
	this.getParams = function(str){
		var arr = str.split(urlSplitRegex);
		if(arr.length == 1)
			return "";
		return arr.pop();
	}
	this.getURL = function(str){
		var arr = str.split(urlSplitRegex);
		return arr.shift();
	}
	this.getRawURL = function(){
		return window.location.href.toString();
	}
	this.getWindowParams = function(){
		return this.getParams(this.getRawURL());
	};
	this.getBaseURL = function(){
		return this.getURL(this.getRawURL());
	};
	this.initialize = function(service, historyDOM, supress){
		this.service = service;
		
		if(historyDOM)
			this.processHistoryDOM(historyDOM);
			
		if(!supress)
			this.primeBookmark();
				
	}
	this.primeBookmark = function(){
		setTimeout(function(){
			var params = self.getWindowParams();
			self.fire("bookmark", params);		
		}, 100);
	}
	this.processHistoryDOM = function(dom){
		iframe = dom.getElementsByTagName("iframe").item(0);
		form = dom.getElementsByTagName("form").item(0);
		console.log("Processed and found history frame %o", iframe);
	}
	this.getIFrame = function(){
		return iframe;
	};
	this.getForm = function(){
		return form;
	};
	this.updateURL = function(parameters){
		var base = this.getBaseURL();
		var url = base + "#" + parameters;
		
		if(parameters.toString().length > 0)
			this.setURL(base + "#" + parameters);
	
		return url;
	}
	this.registerRequest = function(xhr){
		this.updateURL(xhr.parameters);	
	};
	function handleServiceRequest(xhr){
		self.registerRequest(xhr);
	}
	
	this.initialize(service, dom);
	
}
Class.extend(AjaxHistory, EventDispatcher);
var AjaxHistoryGecko = function(){
	AjaxHistoryGecko.superclass.apply(this, arguments);
	var timer = false;
	var interval = 100;
	var url = this.getBaseURL();
	var self = this;
	var superRegisterRequestHandle = this.registerRequest.bind(this);
	this.enable = function(){
		startTimer();
		this.service.addEventListener("complete", superRegisterRequestHandle);
	};
	this.disable = function(){
		stopTimer();
		this.service.removeEventListener("complete", superRegisterRequestHandle);
	}	
	this.setURL = function(myURL){
		window.location = myURL;
		url = myURL;
	}
	function startTimer(){
		timer = setInterval(handleTimer, interval);	
	}
	function stopTimer(){
		clearInterval(timer);
	}
	function handleTimer(){
		var myURL = self.getRawURL();
		
		if(url != myURL){
			var params = self.getWindowParams();
			self.dispatchEvent("change", params);
		}
		url = myURL;
	}	
};
Class.extend(AjaxHistoryGecko, AjaxHistory);
var AjaxHistorySnake = function(service, dom){
	AjaxHistorySnake.superclass.apply(this, arguments);
	var self = this;
	var registration = false, serviceFlag = false;
	var requestStack = [];
	this.submitForm = function(){
		this.getForm().submit();
	};
	this.setURL = function(myURL){
		console.log("setting url to " + myURL);
		window.location = myURL;
	};
	/*
	this.getRawURL = function(){
		return this.getIFrame().contentWindow.location.href.toString();
	};
	*/
	var superRegisterRequest = this.registerRequest.bind(this);

	this.registerRequest = function(xhr){
		if(serviceFlag){
			serviceFlag = false;
			return serviceFlag;
		}
		superRegisterRequest(xhr);
		var params = stringToHash(xhr.parameters);
		flushElements();
		generateElements(params);
		registration = true;
		requestStack.push(xhr);
		this.submitForm();
		
	};
	
	this.handleFrameLoad = function(){
		
		if(registration){// if it is simply registering an event, which also causes the frame to load, take no action
			//otherwise the behavior would become recursive.  The service takes the action of sending a request, the history object listens to the complete request event
			//and then takes appropriate action.  Once the user begins to use the history traversal controls then the frame will load as well
			//thus allowing the history module to hijack this event and dispatch the appropriate event, which the service
			//is listening to to re-send the request.
			registration = false;
			return registration;
		}	
		setTimeout(function(){
			var frame = this.getIFrame();
			var url = frame.contentWindow.location.href.toString();
			console.log("IFRAME URL = " + url);
			var params = this.getParams(url);
			this.updateURL(params);
			if(params != ""){
				serviceFlag = true;
				this.dispatchEvent("change", params);
			}
			
			
			}.bind(this), 100);
		
	};

	var eventHandleRegisterRequest = this.registerRequest.bind(this);
	var frameLoadHandle = this.handleFrameLoad.bind(this);
	
	this.enable = function(){
		this.service.addEventListener("complete", eventHandleRegisterRequest);
		Event.observe(this.getIFrame(), "load", frameLoadHandle);
	};
	this.disable = function(){
		this.service.removeEventListener("complete", eventHandleRegisterRequest);
		Event.stopObserving(this.getIFrame(), "load", frameLoadHandle);
	}
	function flushElements(){
		var form = self.getForm();
		var elements = form.elements;
		for(var i = 0, len = elements.length; i < len; i++)
			elements[i].parentNode.removeChild(elements[i]);
	}
	function generateElements(obj){
		for(var key in obj){
			var ele = document.createElement("input");
			ele.type = "hidden";
			ele.name = key;
			ele.value = obj[key];
			self.getForm().appendChild(ele);
		}
	}
	function stringToHash(string){
		var pairs = string.split("&");
		var hash = {};
		for(var i = 0, len = pairs.length; i < len; i++){
			var pair = pairs[i];
			pair = pair.split("=");
			var key = pair.shift();
			var value = pair.shift();
			hash[key] = value;
		}
		return hash;
	}	
}
Class.extend(AjaxHistorySnake, AjaxHistory);