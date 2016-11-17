;(function () {
	var EMPTYFN = function () {};

	var _createStandardXHR = function () {
		try {
			return new window.XMLHttpRequest();
		} catch( e ) {
			return false;
		}
	};
	
	var _createActiveXHR = function () {
		try {
			return new window.ActiveXObject( "Microsoft.XMLHTTP" );
		} catch( e ) {
			return false;
		}
	};

	var emajax = function ( options ) {
		var dataType = options.dataType || 'text';
		var suc = options.success || EMPTYFN;
		var error = options.error || EMPTYFN;
		var xhr = _createStandardXHR () || _createActiveXHR();
		xhr.onreadystatechange = function () {
			if( xhr.readyState === 4 ){
				var status = xhr.status || 0;
				if ( status === 200 ) {
					if ( dataType === 'text' ) {
						suc(xhr.responseText, xhr);
						return;
					}
					if ( dataType === 'json' ) {
						try {
							var json = JSON.parse(xhr.responseText);
							suc(json,xhr);
						} catch ( e ) {}
						return;
					}
					suc(xhr.response || xhr.responseText,xhr);
					return;
				} else {
					if ( dataType=='json'){
						try{
							var json = JSON.parse(xhr.responseText);
							error(json, xhr, '服务器返回错误信息');
						} catch ( e ) {
							error(xhr.responseText,xhr, '服务器返回错误信息');
						}
						return;
					}
					error(xhr.responseText, xhr, '服务器返回错误信息');
					return;
				}
			}
			if( xhr.readyState === 0 ) {
				error(xhr.responseText, xhr, '服务器异常');
			}
		};

		var type = options.type || 'GET',
			data = options.data || {},
			tempData = '';

		if ( type.toLowerCase() === 'get' ) {
			for ( var o in data ) {
				if ( data.hasOwnProperty(o) ) {
					tempData += o + '=' + data[o] + '&';
				}
			}
			tempData = tempData ? tempData.slice(0, -1) : tempData;
			options.url += (options.url.indexOf('?') > 0 ? '&' : '?') + (tempData ? tempData + '&' : tempData) + '_v=' + new Date().getTime();
			data = null;
		} else {
			data._v = new Date().getTime();
			data = JSON.stringify(data);
		}
		xhr.open(type, options.url);
		if ( xhr.setRequestHeader ) {

			var headers = options.headers || {};

			headers['Content-Type'] = headers['Content-Type'] || 'application/json';

			for ( var key in headers ) {
				if ( headers.hasOwnProperty(key) ) {
					xhr.setRequestHeader(key, headers[key]);
				}
			}
		}
		xhr.send(data);
		return xhr;
	};
	window.easemobim = window.easemobim || {};
	window.easemobim.emajax = emajax;
}());
