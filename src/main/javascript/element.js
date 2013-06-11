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

ice.lib.element = ice.module(function(exportAs) {
    eval(ice.importFrom('ice.lib.string'));
    eval(ice.importFrom('ice.lib.collection'));
    eval(ice.importFrom('ice.lib.query'));

    function identifier(element) {
        return element ? element.id : null;
    }

    function tag(element) {
        return toLowerCase(element.nodeName);
    }

    function property(element, name) {
        return element[name];
    }

    function parents(element) {
        return Stream(function(cellConstructor) {
            function parentStream(e) {
                if (e == null || e == document) return null;
                return function() {
                    return cellConstructor(e, parentStream(e.parentNode));
                };
            }

            return parentStream(element.parentNode);
        });
    }

    function enclosingForm(element) {
        return element.form || detect(parents(element), function(e) {
            return tag(e) == 'form';
        }, function() {
            throw 'cannot find enclosing form';
        });
    }

    function enclosingBridge(element) {
        return property(detect(parents(element), function(e) {
            return property(e, 'bridge') != null;
        }, function() {
            throw 'cannot find enclosing bridge';
        }), 'bridge');
    }

    function serializeElementOn(element, query) {
        var tagName = tag(element);
        switch (tagName) {
            case 'a':
                var name = element.name || element.id;
                if (name) addNameValue(query, name, name);
                break;
            case 'input':
                switch (element.type) {
                    case 'image':
                    case 'submit':
                    case 'button':
                        addNameValue(query, element.name, element.value);
                        break;
                }
                break;
            case 'button':
                if (element.type == 'submit') addNameValue(query, element.name, element.value);
                break;
            default:
            //do not serialize other elements
        }
    }

    function $elementWithID(id) {
        return document.getElementById(id);
    }

    exportAs('identifier', identifier);
    exportAs('tag', tag);
    exportAs('property', property);
    exportAs('parents', parents);
    exportAs('enclosingForm', enclosingForm);
    exportAs('enclosingBridge', enclosingBridge);
    exportAs('serializeElementOn', serializeElementOn);
    exportAs('$elementWithID', $elementWithID);
});
