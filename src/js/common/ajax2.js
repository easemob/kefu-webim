module.exports = ajax2;

function EMPTYFN(){}

function _createStandardXHR(){
	try{
		return new window.XMLHttpRequest();
	}
	catch(e){
		return false;
	}
}

function _createActiveXHR(){
	try{
		return new window.ActiveXObject("Microsoft.XMLHTTP");
	}
	catch(e){
		return false;
	}
}

function _genUrlParams(params, options){
	var opt = options || {};
	var disableTimeStamp = opt.disableTimeStamp;
	// var disableParamsEncoding = opt.disableParamsEncoding;
	var tmpArray = [];
	var key;

	for(key in params){
		if(Object.prototype.hasOwnProperty.call(params, key)){
			tmpArray.push(encodeURIComponent(key) + "=" + encodeURIComponent(params[key]));
		}
	}

	!disableTimeStamp && tmpArray.push("_v=" + new Date().getTime());

	return tmpArray.join("&");
}

function ajax2(options, success, fail){
	var opt = options || {};
	var url = opt.url || "";
	var resolve = success || EMPTYFN;
	var reject = fail || EMPTYFN;
	var useXDomainRequestInIE = opt.useXDomainRequestInIE || false;
	var disableTimeStampInGet = opt.disableTimeStampInGet || false;
	var method = options.method || "GET";
	var body = options.body || "";
	var headers = options.headers || null;
	var params = options.params || null;
	var xhr = _createStandardXHR() || _createActiveXHR();
	var key;
	var fileForm;
	var paramsString;

	if(useXDomainRequestInIE && window.XDomainRequest){
		xhr = new XDomainRequest();
		xhr.onload = function(){
			resolve(xhr.responseText, xhr);
		};
		xhr.ontimeout = function(){
			reject(xhr.responseText, xhr, "XDomainRequest timeout.");
		};
		xhr.onerror = function(){
			reject(xhr.responseText, xhr, "XDomainRequest reject.");
		};
		xhr.open(method, options.url);
		xhr.send(JSON.stringify(body));
		return xhr;
	}

	xhr.onreadystatechange = function(){
		if(xhr.readyState === 4){
			if(xhr.status === 200){
				resolve(xhr.responseText, xhr);
			}
			else{
				reject(xhr.responseText, xhr, "reject response.");
			}
		}
		else if(xhr.readyState === 0){
			reject(xhr.responseText, xhr, "unexpected server reject.");
		}
	};

	if(params){
		paramsString = _genUrlParams(params, {
			disableTimeStamp: method !== "GET" || disableTimeStampInGet
		});
		url += (!!~url.indexOf("?") ? "&" : "?") + paramsString;
	}

	xhr.open(method, url);
	// set headers
	if(headers && xhr.setRequestHeader){
		for(key in headers){
			if(Object.prototype.hasOwnProperty.call(headers, key)){
				xhr.setRequestHeader(key, headers[key]);
			}
		}
	}

	if(method === "GET" || method === "HEAD"){
		xhr.send(null);
		return xhr;
	}
	else if(window.File && body instanceof File){
		// 由于 FormData 是不可序列化的对象，所以这里只传递 File
		fileForm = new FormData();
		fileForm.append("file", body);

		xhr.send(fileForm);
		return xhr;
	}

	if(body !== null && body !== undefined && (typeof body !== "string")){
		body = JSON.stringify(body);
	}
	xhr.send(body);
	return xhr;
}
