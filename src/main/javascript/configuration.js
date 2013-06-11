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

ice.lib.configuration = ice.module(function(exportAs) {
    eval(ice.importFrom('ice.lib.oo'));
    eval(ice.importFrom('ice.lib.string'));
    eval(ice.importFrom('ice.lib.collection'));

    var attributeAsString = operator();
    var attributeAsBoolean = operator();
    var attributeAsNumber = operator();
    var valueAsStrings = operator();
    var valueAsBooleans = operator();
    var valueAsNumbers = operator();
    var childConfiguration = operator();

    function XMLDynamicConfiguration(lookupElement) {
        function asBoolean(s) {
            return 'true' == toLowerCase(s);
        }

        function lookupAttribute(name) {
            var a = lookupElement().getAttribute(name);
            if (a) {
                return a;
            } else {
                throw 'unknown attribute: ' + name;
            }
        }

        function lookupValues(name) {
            return collect(asArray(lookupElement().getElementsByTagName(name)), function(e) {
                var valueNode = e.firstChild;
                return valueNode ? valueNode.nodeValue : '';
            });
        }

        return object(function(method) {
            method(attributeAsString, function(self, name, defaultValue) {
                try {
                    return lookupAttribute(name);
                } catch (e) {
                    if (isString(defaultValue)) {
                        return defaultValue;
                    } else {
                        throw e;
                    }
                }
            });

            method(attributeAsNumber, function(self, name, defaultValue) {
                try {
                    return Number(lookupAttribute(name));
                } catch (e) {
                    if (isNumber(defaultValue)) {
                        return defaultValue;
                    } else {
                        throw e;
                    }
                }
            });

            method(attributeAsBoolean, function(self, name, defaultValue) {
                try {
                    return asBoolean(lookupAttribute(name));
                } catch (e) {
                    if (isBoolean(defaultValue)) {
                        return defaultValue;
                    } else {
                        throw e;
                    }
                }
            });

            method(childConfiguration, function(self, name) {
                var elements = lookupElement().getElementsByTagName(name);
                if (isEmpty(elements)) {
                    throw 'unknown configuration: ' + name;
                } else {
                    return XMLDynamicConfiguration(function() {
                        return lookupElement().getElementsByTagName(name)[0];
                    });
                }
            });

            method(valueAsStrings, function(self, name, defaultValues) {
                var values = lookupValues(name);
                return isEmpty(values) && defaultValues ? defaultValues : values;
            });

            method(valueAsNumbers, function(self, name, defaultValues) {
                var values = lookupValues(name);
                return isEmpty(values) && defaultValues ? defaultValues : collect(values, Number);
            });

            method(valueAsBooleans, function(self, name, defaultValues) {
                var values = lookupValues(name);
                return isEmpty(values) && defaultValues ? defaultValues : collect(values, asBoolean);
            });
        });
    }

    exportAs('attributeAsString', attributeAsString);
    exportAs('attributeAsBoolean', attributeAsBoolean);
    exportAs('attributeAsNumber', attributeAsNumber);
    exportAs('valueAsStrings', valueAsStrings);
    exportAs('valueAsBooleans', valueAsBooleans);
    exportAs('valueAsNumbers', valueAsNumbers);
    exportAs('childConfiguration', childConfiguration);
    exportAs('XMLDynamicConfiguration', XMLDynamicConfiguration);
});
