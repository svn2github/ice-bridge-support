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

ice.lib.cookie = ice.module(function(exportAs) {
    eval(ice.importFrom('ice.lib.oo'));
    eval(ice.importFrom('ice.lib.string'));
    eval(ice.importFrom('ice.lib.collection'));

    function lookupCookieValue(name) {
        var tupleString = detect(split(asString(document.cookie), '; '), function(tuple) {
            return startsWith(tuple, name);
        }, function() {
            throw 'Cannot find value for cookie: ' + name;
        });

        return decodeURIComponent(contains(tupleString, '=') ? split(tupleString, '=')[1] : '');
    }

    function lookupCookie(name, failThunk) {
        try {
            return Cookie(name, lookupCookieValue(name));
        } catch (e) {
            if (failThunk) {
                return failThunk();
            } else {
                throw e;
            }
        }
    }

    function existsCookie(name) {
        var exists = true;
        lookupCookie(name, function() {
            exists = false;
        });
        return exists;
    }

    var update = operator();
    var remove = operator();

    function Cookie(name, val, path) {
        val = val || '';
        path = path || '/';
        document.cookie = name + '=' + encodeURIComponent(val) + '; path=' + path;

        return object(function(method) {
            method(value, function(self) {
                return lookupCookieValue(name);
            });

            method(update, function(self, val) {
                document.cookie = name + '=' + encodeURIComponent(val) + '; path=' + path;
                return self;
            });

            method(remove, function(self) {
                var date = new Date();
                date.setTime(date.getTime() - 24 * 60 * 60 * 1000);
                document.cookie = name + '=; expires=' + date.toGMTString() + '; path=' + path;
            });

            method(asString, function(self) {
                return 'Cookie[' + name + ', ' + value(self) + ', ' + path + ']';
            });
        });
    }

    exportAs('lookupCookieValue', lookupCookieValue);
    exportAs('lookupCookie', lookupCookie);
    exportAs('existsCookie', existsCookie);
    exportAs('update', update);
    exportAs('remove', remove);
    exportAs('Cookie', Cookie);
});
