/* globals */
'use strict';
if (typeof Object.assign !== 'function') {
	(require && require('babel-polyfill/dist/polyfill.js')) || include('libs/Smartface/polyfills.js');
}

var formUrlEncoded;

if (typeof formUrlEncoded !== 'function') {
	if (require)
		formUrlEncoded = require('js-base/utils/formUrlEncoded');
	else
		include('libs/Smartface/formUrlEncoded.js');
}
var SMFAjax = {};

SMFAjax.defaultSetup = Object.freeze({
	accepts: '', //depends on DataType
	async: true,
	beforeSend: function() {
		return true;
	},
	cache: true, //false for dataType 'script' and 'jsonp', It works by appending "_={timestamp}" to the GET parameters
	//A function to be called when the request finishes (after success and error callbacks are executed).
	complete: function(jqXHR, textStatus) {
		//textStatus is one of "success", "notmodified", "nocontent", "error", "timeout", "abort", or "parsererror"
	},
	contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
	crossDomain: true,
	data: {},
	dataFilter: function(data, dataType) {
		return data;
	},
	dataType: 'text', //xml, script, html
	//"jsonp": Loads in a JSON block using JSONP. Adds an extra "?callback=?" to the end of your URL to specify the callback. Disables caching by appending a query string parameter, "_=[TIMESTAMP]", to the URL unless the cache option is set to true.
	error: function(jqXHR, textStatus, errorThrown) {
		//textStatus: null, "timeout", "error", "abort", and "parsererror"

	},
	global: false, //disabled here
	headers: {
		'X-Requested-With': 'XMLHttpRequest'
	},
	ifModified: false,
	isLocal: false,
	jsonp: '',
	jsonpCallback: function() {},
	method: 'GET',
	mimeType: '',
	password: '',
	processData: true, //By default, data passed in to the data option as an object (technically, anything other than a string) will be processed and transformed into a query string, fitting to the default content-type "application/x-www-form-urlencoded". If you want to send a DOMDocument, or other non-processed data, set this option to false.
	scriptCharset: '',
	statusCode: {},
	success: function(data, textStatus, jqXHR) {

	},
	timeout: -1,
	traditional: false, //use the traditional style of param serialization.
	url: '',
	username: '',
	xhr: function() {
		return XMLHttpRequest;
	},
	xhrFields: {} //?
});

SMFAjax.setup = {};

SMFAjax.ajax = function(url, settings) {
	if (typeof url !== 'string') {
		settings = url;
	}
	settings = Object.assign({}, SMFAjax.defaultSetup, SMFAjax.setup, settings);
	var params = {
		URL: settings.url,
		requestHeaders: SMFAjax.createHeaders(settings),
		httpMethod: settings.method.toUpperCase(),
		onerror: settings.error,
		onSyndicationSuccess: function(e) {
			var data = this.response || this.responseText;
			if (data instanceof Blob) {
				data = atob(data.toBase64String());
			}
			if (settings.processData) {
				if (settings.dataType === 'json') {
					try {
						data = JSON.parse(data);
					}
					catch (e) {
						return settings.error();
					}
				}
				else if (settings.dataType === 'xml') {
					try {
						data = (new DOMParser()).parseFromString(data);
					}
					catch (e) {
						return settings.error();
					}
				}
				else {}
			}
			settings.success.call(this, data);
		},
		ignoreSSLErrors: true
	};

	settings = Object.assign({}, SMFAjax.defaultSetup, SMFAjax.setup, settings);


	var isContentJson = settings.contentType.match(/json/i);

	if (settings.method === 'POST' || settings.method === 'PUT') {
		if (isContentJson) {
			params.requestBody = JSON.stringify(settings.data);
		}
		else {
			params.requestBody = formUrlEncoded(settings.data);
		}
	}
	else if (settings.method === 'GET') {
		var queryString = formUrlEncoded(settings.data);
		if (queryString) params.URL += '?' + queryString;
	}


	var xhr = new XMLHttpRequest(),
		h, hName, hValue;
	for (var i in params.requestHeaders) {
		h = params.requestHeaders[i].split(":");
		hName = h[0].trim();
		hValue = h[1].trim();
		xhr.setRequestHeader(hName, hValue);
	}
	xhr.onload = params.onSyndicationSuccess;
	xhr.onerror = params.onerror;
	xhr.ignoreSSLErrors = !!params.ignoreSSLErrors;
	xhr.open(params.httpMethod, params.URL, true);
	xhr.send(params.requestBody);
};

SMFAjax.createHeaders = function(settings) {
	var contentType = 'application/x-www-form-urlencoded; charset=UTF-8',
		accept = contentType;
	if (settings.contentType === 'json') {
		contentType = 'application/json; charset=UTF-8';
	}
	if (settings.dataType === 'json') {
		accept = 'application/json; charset=UTF-8';
	}

	var keys = Object.keys(settings.headers);
	var contentTypeMatched = -1;
	var acceptMatched = -1;
	var contentTypeRgx = /content\-type/i;
	var acceptRgx = /accept/i;
	var index = 0;
	var headers = keys.map(function(key) {
		contentTypeRgx.lastIndex = 0;
		var matchedCT = settings.headers[key].match(contentTypeRgx);
		if (matchedCT) {
			contentTypeMatched = index;
		}
		var matchedAccept = settings.headers[key].match(acceptRgx);
		if (matchedAccept) {
			acceptMatched = index;
		}
		index++;
		return key + ': ' + settings.headers[key];
	});
	//Only add Content-Type if it does not exist
	var nonBodyMethods = ["GET", "HEAD"];
	if (contentTypeMatched === -1 && nonBodyMethods.indexOf(settings.method) === -1) {
		headers.push('Content-Type: ' + contentType);
	}
	if (acceptMatched === -1 && settings.dataType) {
		headers.push('Accept: ' + accept);
	}
	return headers;
};

SMFAjax.get = function(url, data, success, dataType) {
	var obj = SMFAjax.processShorthandArguments(url, data, success, dataType);
	obj.method = 'GET';
	SMFAjax.ajax(obj);
};

SMFAjax.getJSON = function(url, data, success) {
	SMFAjax.get(url, data, success, 'json');
};

SMFAjax.post = function(url, data, success, dataType, contentType) {
	var obj = SMFAjax.processShorthandArguments(url, data, success, dataType, contentType);
	obj.method = 'POST';
	SMFAjax.ajax(obj);
};

SMFAjax.postJSON = function(url, data, success) {
	SMFAjax.post(url, data, success, 'json');
};

SMFAjax.postJSONViaJSON = function(url, data, success) {
	SMFAjax.post(url, data, success, 'json', 'json');
};

SMFAjax.postViaJSON = function(url, data, success) {
	SMFAjax.post(url, data, success, null, 'json');
};

SMFAjax.put = function(url, data, success, dataType, contentType) {
	var obj = SMFAjax.processShorthandArguments(url, data, success, dataType, contentType);
	obj.method = 'PUT';
	SMFAjax.ajax(obj);
};

SMFAjax.putJSON = function(url, data, success) {
	SMFAjax.put(url, data, success, 'json');
};

SMFAjax.putJSONViaJSON = function(url, data, success) {
	SMFAjax.put(url, data, success, 'json', 'json');
};

SMFAjax.putViaJSON = function(url, data, success) {
	SMFAjax.put(url, data, success, null, 'json');
};

SMFAjax.processShorthandArguments = function(url, data, success, dataType, contentType) {
	var obj = {};
	if (typeof url === 'object') {
		return url;
	}
	if (typeof url !== 'string') {
		return null;
	}
	obj.url = url;
	if (typeof data === 'function') {
		contentType = dataType;
		dataType = success;
		success = data;
		data = null;
	}
	else if (typeof data === "object") {
		obj.data = Object.assign({}, data);
		if (obj.data.headers) {
			obj.headers = data.headers;
			delete obj.data.headers;
		}
	}
	else if (data) {
		obj.data = data;
	}
	if (success) {
		obj.success = success;
	}
	if (dataType) {
		obj.dataType = dataType;
	}
	if (contentType) {
		obj.contentType = contentType;
	}

	return obj;
};

module.exports = SMFAjax;
