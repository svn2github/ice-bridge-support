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

ice.lib.window = ice.module(function(exportAs) {
    eval(ice.importFrom('ice.lib.functional'));
    eval(ice.importFrom('ice.lib.collection'));

    function registerListener(eventType, obj, listener) {
        if (obj.addEventListener) {
            obj.addEventListener(eventType, listener, false);
            return function() {
                obj.removeEventListener(eventType, listener, false);
            }
        } else {
            var type = 'on' + eventType;
            obj.attachEvent(type, listener);
            return function() {
                obj.detachEvent(type, listener);
            }
        }
    }

    var onLoad = curry(registerListener, 'load');
    var onUnload = curry(registerListener, 'unload');
    var onBeforeUnload = curry(registerListener, 'beforeunload');
    var onResize = curry(registerListener, 'resize');
    var onKeyPress = curry(registerListener, 'keypress');
    var onKeyUp = curry(registerListener, 'keyup');

    window.width = function() {
        return window.innerWidth ? window.innerWidth : (document.documentElement && document.documentElement.clientWidth) ? document.documentElement.clientWidth : document.body.clientWidth;
    };

    window.height = function() {
        return window.innerHeight ? window.innerHeight : (document.documentElement && document.documentElement.clientHeight) ? document.documentElement.clientHeight : document.body.clientHeight;
    };

    exportAs('registerListener', registerListener);
    exportAs('onLoad', onLoad);
    exportAs('onUnload', onUnload);
    exportAs('onBeforeUnload', onBeforeUnload);
    exportAs('onResize', onResize);
    exportAs('onKeyPress', onKeyPress);
    exportAs('onKeyUp', onKeyUp);
});
