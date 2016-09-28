/* globals */

XMLHttpRequest.profiling = {
    enabled: false,
    loggingMethods: {
        log: logWithConsole,
        alert: logWithAlert
    },
    logMethod: logWithAlert,
    options: {
        requestHeaders: true,
        requestBody: true,
        responseBody: false,
        responseHeaders: false,
        method: true,
        digestLog: false,
        url: true
    }
};

function logWithConsole(data) {
    var digest = {};

}

function logWithAlert(data) {
    logRequest.call(this, data, function(request) {
        var digest = {};
        if (!XMLHttpRequest.profiling.options.digestLog) {
            if (Object.keys(request).length > 0) {
                alert({
                    title: "Request",
                    message: JSON.stringify(request, null, "\t")
                });
            }
            prepResponse(digest, function(response) {
                if (Object.keys(response).length > 0) {
                    alert({
                        title: "Response",
                        message: JSON.stringify(response, null, "\t")
                    });
                }
            });
        }
        else {
            if (Object.keys(request).length > 0) {
                digest.request = request;
            }
            prepResponse(digest, function(digest) {
                if (Object.keys(digest.response).length === 0) {
                    delete digest.response;
                }
                if (Object.keys(digest).length > 0) {
                    alert({
                        title: "Digest XHR",
                        message: JSON.stringify(digest, null, "\t")
                    });

                }

            });
        }
    });

}

function prepResponse(digest, callback) {
    var originalOnloadend = null;
    if (XMLHttpRequest.profiling.options.responseBody ||
        XMLHttpRequest.profiling.options.responseHeaders
    ) {
        originalOnloadend = this.onloadend;
        this.onloadend = onloadend;
    }

    function onloadend() {
        var response = {};
        if (XMLHttpRequest.profiling.options.responseBody) {
            response.body = this.responseText;
        }
        if (XMLHttpRequest.profiling.options.responseHeaders) {
            response.headers = this.getAllResponseHeaders.split("\r\n");
        }
        if (XMLHttpRequest.profiling.options.digestLog) {
            digest.response = response;
            callback(digest);
        }
        else {
            callback(response);
        }
        originalOnloadend.apply(this, arguments);
    }
}

function logRequest(data, callback) {
    var request = {};
    if (XMLHttpRequest.profiling.options.requestBody) {
        if (typeof data === "string") {
            request.body = data;
        }
        else {
            request.body = JSON.stringify(data, null, "\t");
        }
    }
    if (XMLHttpRequest.profiling.options.requestHeaders) {
        request.headers = this.webClient.requestHeaders;
    }
    if (XMLHttpRequest.profiling.options.method) {
        request.method = this.webClient.httpMethod;
    }
    if (XMLHttpRequest.profiling.options.url) {
        request.url = this.webClient.URL;
    }
    callback(request);
}

module.exports = function () {
    if (XMLHttpRequest.prototype.send.name !== "sendWithProfiling") {
        var originalSend = XMLHttpRequest.prototype.send;
        XMLHttpRequest.prototype.send = function sendWithProfiling(data) {
            if (XMLHttpRequest.profiling.enabled) {
                XMLHttpRequest.profiling.logMethod.apply(this, arguments);
            }
            originalSend.apply(this, arguments);
        };
    }
};