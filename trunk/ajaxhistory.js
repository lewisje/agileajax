var AjaxHistoryBase = function(service, dom){
	AjaxHistoryBase.superclass.call(this, null);
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
Class.extend(AjaxHistoryBase, EventDispatcher);
var AjaxHistory = function(){
	AjaxHistory.superclass.apply(this, arguments);
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
Class.extend(AjaxHistory, AjaxHistoryBase);
