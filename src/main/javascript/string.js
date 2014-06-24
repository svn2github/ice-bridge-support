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

ice.lib.string = ice.module(function(exportAs) {
    function indexOf(s, substring) {
        var index = s.indexOf(substring);
        if (index >= 0) {
            return index;
        } else {
            throw '"' + s + '" does not contain "' + substring + '"';
        }
    }

    function lastIndexOf(s, substring) {
        var index = s.lastIndexOf(substring);
        if (index >= 0) {
            return index;
        } else {
            throw 'string "' + s + '" does not contain "' + substring + '"';
        }
    }

    function startsWith(s, pattern) {
        return s.indexOf(pattern) == 0;
    }

    function endsWith(s, pattern) {
        var position = s.lastIndexOf(pattern);
        return position > -1 && (position == s.length - pattern.length);
    }

    function containsSubstring(s, substring) {
        return s.indexOf(substring) >= 0;
    }

    function blank(s) {
        return /^\s*$/.test(s);
    }

    function split(s, separator) {
        return s.length == 0 ? [] : s.split(separator);
    }

    function replace(s, regex, replace) {
        return s.replace(regex, replace);
    }

    function toLowerCase(s) {
        return s.toLowerCase();
    }

    function toUpperCase(s) {
        return s.toUpperCase();
    }

    function substring(s, from, to) {
        return s.substring(from, to);
    }

    function trim(s) {
        s = s.replace(/^\s+/, '');
        for (var i = s.length - 1; i >= 0; i--) {
            if (/\S/.test(s.charAt(i))) {
                s = s.substring(0, i + 1);
                break;
            }
        }

        return s;
    }

    var asNumber = Number;

    function asBoolean(s) {
        return 'true' == s || 'any' == s;
    }

    function asRegexp(s) {
        return new RegExp(s);
    }

    exportAs('indexOf', indexOf);
    exportAs('lastIndexOf', lastIndexOf);
    exportAs('startsWith', startsWith);
    exportAs('endsWith', endsWith);
    exportAs('containsSubstring', containsSubstring);
    exportAs('blank', blank);
    exportAs('split', split);
    exportAs('replace', replace);
    exportAs('toLowerCase', toLowerCase);
    exportAs('toUpperCase', toUpperCase);
    exportAs('substring', substring);
    exportAs('trim', trim);
    exportAs('asNumber', asNumber);
    exportAs('asBoolean', asBoolean);
    exportAs('asRegexp', asRegexp);
});



