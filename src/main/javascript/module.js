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

ice.module = function module(definitions) {
    var context = {};

    function defineVariable(name, variable) {
        if (context[name]) {
            throw 'variable "' + name + '" already defined';
        }
        context[name] = variable;
        return variable;
    }

    definitions(defineVariable);
    return context;
};

ice.importFrom = function importFrom(moduleName) {
    var context = window;
    var atoms = moduleName.split('.');
    for (var i = 0, size = atoms.length; i < size; i++) {
        context = context[atoms[i]];
    }
    var code = [];
    for (var p in context) {
        if (context.hasOwnProperty(p)) {
            code.push('var ' + p + '=' + moduleName + '["' + p + '"]');
        }
    }
    return code.join(';')
};

ice.evaluate = eval;