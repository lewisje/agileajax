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
	this.registerRequest = function(xhr){
		var url = this.getRawURL();
		var base = this.getURL(url);
		if(xhr.parameters.toString().length > 0)
			this.setURL(base + "#" + xhr.parameters);
	
	}	
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
	}
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
	AjaxHistoryGecko.superclass.apply(this, arguments);
	var self = this;
	var registration = false;
	
	this.setURL = function(myURL){
		//window.location = myURL;
	}
	this.submitForm = function(){
		this.getForm().submit();
	};
	this.getRawURL = function(){
		return  this.getIFrame().contentWindow.location.href.toString();
	};
	var superRegisterRequest = this.registerRequest.bind(this);
	
	this.registerRequest = function(xhr){		
		superRegisterRequest(xhr);
		var params = stringToHash(xhr.parameters);
		flushElements();
		generateElements(params);
		registration = true;
		this.submitForm();
	};
	
	this.handleFrameLoad = function(){
		console.log("Inside frameload snake %o", this);
		if(registration)
			return registration = false;
		var frame = this.getIFrame();
		var url = frame.contentWindow.location.href.toString();
		var params = this.getParams(url);
		if(params != "")
			this.dispatchEvent("change", params);
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