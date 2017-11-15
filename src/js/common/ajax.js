var EMPTYFN = function(){};
var _createStandardXHR = function(){
	try{
		return new window.XMLHttpRequest();
	}
	catch(e){
		return false;
	}
};
var _createActiveXHR = function(){
	try{
		return new window.ActiveXObject("Microsoft.XMLHTTP");
	}
	catch(e){
		return false;
	}
};

module.exports = function(options){
	var dataType = options.dataType || "text";
	var suc = options.success || EMPTYFN;
	var error = options.error || EMPTYFN;
	var useXDomainRequestInIE = options.useXDomainRequestInIE;
	var xhr = _createStandardXHR() || _createActiveXHR();
	var type = options.type || "GET";
	var data = options.data || {};
	var tempData = "";
	var headers = options.headers || {};
	var isFileUpload = options.isFileUpload;
	var disableTimeStampInGet = options.disableTimeStampInGet;
	var key;
	var fileForm;
	var o;

	if(useXDomainRequestInIE && window.XDomainRequest){
		xhr = new XDomainRequest();
		xhr.onload = function(){
			var parsedJSON = {};
			try{
				parsedJSON = JSON.parse(xhr.responseText);
			}
			catch(e){}
			suc(parsedJSON, xhr);
		};
		xhr.ontimeout = function(){
			error(xhr.responseText, xhr, "XDomainRequest timeout.");
		};
		xhr.onerror = function(){
			error(xhr.responseText, xhr, "XDomainRequest error.");
		};
		xhr.open("POST", options.url);
		xhr.send(JSON.stringify(data));
		return xhr;
	}

	xhr.onreadystatechange = _onReadyStateChange;
	if(type.toLowerCase() === "get"){
		for(o in data){
			if(Object.prototype.hasOwnProperty.call(data, o)){
				tempData += o + "=" + data[o] + "&";
			}
		}
		// todo: use Array.prototype.join
		tempData = tempData ? tempData.slice(0, -1) : tempData;
		options.url += (options.url.indexOf("?") > 0 ? "&" : "?")
			+ (tempData ? tempData + "&" : tempData)
			// 在需要读取缓存资源时不加时间戳
			+ (disableTimeStampInGet ? "" : "_v=" + new Date().getTime());
	}
	else if(isFileUpload){
		fileForm = new FormData();
		fileForm.append("file", data.file);

		xhr.open("POST", options.url);
		xhr.setRequestHeader("Authorization", data.auth);
		xhr.send(fileForm);
		return xhr;
	}
	else{
		data = JSON.stringify(data);
	}
	xhr.open(type, options.url);
	if(xhr.setRequestHeader){
		headers["Content-Type"] = headers["Content-Type"] || "application/json";

		for(key in headers){
			if(Object.prototype.hasOwnProperty.call(headers, key)){
				xhr.setRequestHeader(key, headers[key]);
			}
		}
	}

	xhr.send(data);
	return xhr;

	function _onReadyStateChange(){
		var json;

		if(xhr.readyState === 4){
			if(xhr.status === 200){
				if(dataType === "text"){
					suc(xhr.responseText, xhr);
					return;
				}
				if(dataType === "json"){
					try{
						json = JSON.parse(xhr.responseText);
						suc(json, xhr);
					}
					catch(e){}
					return;
				}
				suc(xhr.response || xhr.responseText, xhr);
				return;
			}

			if(dataType == "json"){
				try{
					json = JSON.parse(xhr.responseText);
					error(json, xhr, "error response.");
				}
				catch(e){
					error(xhr.responseText, xhr, "JSON parse error.");
				}
				return;
			}
			error(xhr.responseText, xhr, "error response.");
		}
		else if(xhr.readyState === 0){
			error(xhr.responseText, xhr, "unexpected server error.");
		}
	}
};
