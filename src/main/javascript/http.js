/*
 * Copyright 2004-2013 ICEsoft Technologies Canada Corp.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the
 * License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an "AS
 * IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

ice.lib.query = ice.module(function(exportAs) {
    eval(ice.importFrom('ice.lib.functional'));
    eval(ice.importFrom('ice.lib.oo'));
    eval(ice.importFrom('ice.lib.collection'));

    var asURIEncodedString = operator();
    var serializeOn = operator();

    function Parameter(name, value) {
        return objectWithAncestors(function(method) {
            method(asURIEncodedString, function(self) {
                return encodeURIComponent(name) + '=' + encodeURIComponent(value);
            });

            method(serializeOn, function(self, query) {
                addParameter(query, self);
            });
        }, Cell(name, value));
    }

    var addParameter = operator();
    var addNameValue = operator();
    var queryParameters = operator();
    var addQuery = operator();
    var appendToURI = operator();

    function Query() {
        var parameters = [];
        return object(function(method) {
            method(queryParameters, function(self) {
                return parameters;
            });

            method(addParameter, function(self, parameter) {
                append(parameters, parameter);
                return self;
            });

            method(addNameValue, function(self, name, value) {
                append(parameters, Parameter(name, value));
                return self;
            });

            method(addQuery, function(self, appended) {
                serializeOn(appended, self);
                return self;
            });

            method(serializeOn, function(self, query) {
                each(parameters, curry(addParameter, query));
            });

            method(asURIEncodedString, function(self) {
                return join(collect(parameters, asURIEncodedString), '&');
            });

            method(appendToURI, function(self, uri) {
                if (not(isEmpty(parameters))) {
                    return uri + (contains(uri, '?') ? '&' : '?') + asURIEncodedString(self);
                } else {
                    return uri;
                }
            });

            method(asString, function(self) {
                return inject(parameters, '', function(tally, p) {
                    return tally + '|' + key(p) + '=' + value(p) + '|\n';
                });
            });
        });
    }

    exportAs('asURIEncodedString', asURIEncodedString);
    exportAs('serializeOn', serializeOn);
    exportAs('Parameter', Parameter);
    exportAs('Query', Query);
    exportAs('addParameter', addParameter);
    exportAs('addNameValue', addNameValue);
    exportAs('queryParameters', queryParameters);
    exportAs('addQuery', addQuery);
    exportAs('appendToURI', appendToURI);
});

ice.lib.http = ice.module(function(exportAs) {
    eval(ice.importFrom('ice.lib.functional'));
    eval(ice.importFrom('ice.lib.oo'));
    eval(ice.importFrom('ice.lib.collection'));
    eval(ice.importFrom('ice.lib.query'));

    var getSynchronously = operator();
    var getAsynchronously = operator();
    var postSynchronously = operator();
    var postAsynchronously = operator();
    var Client = exportAs('Client', function(autoclose) {
        var newNativeRequest;
        if (window.XMLHttpRequest) {
            newNativeRequest = function() {
                return new XMLHttpRequest();
            };
        } else if (window.ActiveXObject) {
            newNativeRequest = function() {
                return new window.ActiveXObject('Microsoft.XMLHTTP');
            };
        } else {
            throw 'cannot create XMLHttpRequest';
        }

        function withNewQuery(setup) {
            var query = Query();
            setup(query);
            return query;
        }

        var autoClose = autoclose ? close : noop;

        return object(function(method) {
            method(getAsynchronously, function(self, uri, setupQuery, setupRequest, onResponse) {
                var nativeRequestResponse = newNativeRequest();
                var request = RequestProxy(nativeRequestResponse);
                var response = ResponseProxy(nativeRequestResponse);
                nativeRequestResponse.open('GET', appendToURI(withNewQuery(setupQuery), uri), true);
                setupRequest(request);
                nativeRequestResponse.onreadystatechange = function() {
                    if (nativeRequestResponse.readyState == 4) {
                        onResponse(response, request);
                        autoClose(request);
                    }
                };
                nativeRequestResponse.send('');
                return request;
            });

            method(getSynchronously, function(self, uri, setupQuery, setupRequest, onResponse) {
                var nativeRequestResponse = newNativeRequest();
                var request = RequestProxy(nativeRequestResponse);
                var response = ResponseProxy(nativeRequestResponse);
                nativeRequestResponse.open('GET', appendToURI(withNewQuery(setupQuery), uri), false);
                setupRequest(request);
                nativeRequestResponse.send('');
                onResponse(response, request);
                autoClose(request);
            });

            method(postAsynchronously, function(self, uri, setupQuery, setupRequest, onResponse) {
                var nativeRequestResponse = newNativeRequest();
                var request = RequestProxy(nativeRequestResponse);
                var response = ResponseProxy(nativeRequestResponse);
                nativeRequestResponse.open('POST', uri, true);
                setupRequest(request);
                nativeRequestResponse.onreadystatechange = function() {
                    if (nativeRequestResponse.readyState == 4) {
                        onResponse(response, request);
                        autoClose(request);
                    }
                };
                nativeRequestResponse.send(asURIEncodedString(withNewQuery(setupQuery)));
                return request;
            });

            method(postSynchronously, function(self, uri, setupQuery, setupRequest, onResponse) {
                var nativeRequestResponse = newNativeRequest();
                var request = RequestProxy(nativeRequestResponse);
                var response = ResponseProxy(nativeRequestResponse);
                nativeRequestResponse.open('POST', uri, false);
                setupRequest(request);
                nativeRequestResponse.send(asURIEncodedString(withNewQuery(setupQuery)));
                onResponse(response, request);
                autoClose(request);
            });
        });
    });

    var close = operator();
    var abort = operator();
    var setHeader = operator();
    var onResponse = operator();

    function RequestProxy(nativeRequestResponse) {
        return object(function(method) {
            method(setHeader, function(self, name, value) {
                nativeRequestResponse.setRequestHeader(name, value);
            });

            method(close, function(self) {
                nativeRequestResponse.onreadystatechange = noop;
            });

            method(abort, function(self) {
                nativeRequestResponse.onreadystatechange = noop;
                nativeRequestResponse.abort();
                method(abort, noop);
            });
        });
    }

    var statusCode = operator();
    var statusText = operator();
    var getHeader = operator();
    var getAllHeaders = operator();
    var hasHeader = operator();
    var contentAsText = operator();
    var contentAsDOM = operator();

    function ResponseProxy(nativeRequestResponse) {
        return object(function(method) {
            method(statusCode, function() {
                try {
                    return nativeRequestResponse.status;
                } catch (e) {
                    return 0;
                }
            });

            method(statusText, function(self) {
                try {
                    return nativeRequestResponse.statusText;
                } catch (e) {
                    return '';
                }
            });

            method(hasHeader, function(self, name) {
                try {
                    var header = nativeRequestResponse.getResponseHeader(name);
                    return header && header != '';
                } catch (e) {
                    return false;
                }
            });

            method(getHeader, function(self, name) {
                try {
                    return nativeRequestResponse.getResponseHeader(name);
                } catch (e) {
                    return null;
                }
            });

            method(getAllHeaders, function(self, name) {
                try {
                    return collect(reject(split(nativeRequestResponse.getAllResponseHeaders(), '\n'), isEmpty), function(pair) {
                        var nameValue = split(pair, ': ')
                        return Cell(nameValue[0], nameValue[1]);
                    });
                } catch (e) {
                    return [];
                }
            });

            method(contentAsText, function(self) {
                try {
                    return nativeRequestResponse.responseText;
                } catch (e) {
                    return '';
                }
            });

            method(contentAsDOM, function(self) {
                try {
                    return nativeRequestResponse.responseXML;
                } catch (e) {
                    var txt = '<error>' + e + '</error>';
                    var doc;
                    if (window.DOMParser) {
                        var parser = new DOMParser();
                        doc = parser.parseFromString(txt,"text/xml");
                    } else {
                        doc = new ActiveXObject("Microsoft.XMLDOM");
                        doc.async = false;
                        doc.loadXML(txt);
                    }

                    return doc;
                }
            });

            method(asString, function(self) {
                return inject(getAllHeaders(self), 'HTTP Response\n', function(result, header) {
                    return result + key(header) + ': ' + value(header) + '\n';
                }) + contentAsText(self);
            });
        });
    }

    function OK(response) {
        return statusCode(response) == 200;
    }

    function NotFound(response) {
        return statusCode(response) == 404;
    }

    function ServerInternalError(response) {
        var code = statusCode(response);
        return code >= 500 && code < 600;
    }

    function FormPost(request) {
        setHeader(request, 'Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    }

    exportAs('getSynchronously', getSynchronously);
    exportAs('getAsynchronously', getAsynchronously);
    exportAs('postSynchronously', postSynchronously);
    exportAs('postAsynchronously', postAsynchronously);
    exportAs('close', close);
    exportAs('abort', abort);
    exportAs('setHeader', setHeader);
    exportAs('onResponse', onResponse);
    exportAs('statusCode', statusCode);
    exportAs('statusText', statusText);
    exportAs('getHeader', getHeader);
    exportAs('getAllHeaders', getAllHeaders);
    exportAs('hasHeader', hasHeader);
    exportAs('contentAsText', contentAsText);
    exportAs('contentAsDOM', contentAsDOM);
    exportAs('OK', OK);
    exportAs('NotFound', NotFound);
    exportAs('ServerInternalError', ServerInternalError);
    exportAs('FormPost', FormPost);
});

