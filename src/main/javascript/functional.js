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

ice.lib.functional = ice.module(function(exportAs) {
    function apply(fun, arguments) {
        return fun.apply(fun, arguments);
    }

    function withArguments() {
        var args = arguments;
        return function(fun) {
            apply(fun, args);
        };
    }

    function curry() {
        var args = arguments;
        return function() {
            var curriedArguments = [];
            var fun = args[0];
            for (var i = 1; i < args.length; i++) curriedArguments.push(args[i]);
            for (var j = 0; j < arguments.length; j++) curriedArguments.push(arguments[j]);
            return apply(fun, curriedArguments);
        };
    }

    function $witch(tests, defaultRun) {
        return function(val) {
            var args = arguments;
            var conditions = [];
            var runs = [];
            tests(function(condition, run) {
                conditions.push(condition);
                runs.push(run);
            });
            var size = conditions.length;
            for (var i = 0; i < size; i++) {
                if (apply(conditions[i], args)) {
                    return apply(runs[i], args);
                }
            }
            if (defaultRun) apply(defaultRun, args);
        };
    }

    function identity(arg) {
        return arg;
    }

    function negate(b) {
        return !b;
    }

    function greater(a, b) {
        return a > b;
    }

    function less(a, b) {
        return a < b;
    }

    function not(a) {
        return !a;
    }

    function multiply(a, b) {
        return a * b;
    }

    function plus(a, b) {
        return a + b;
    }

    function max(a, b) {
        return a > b ? a : b;
    }

    function increment(value, step) {
        return value + (step ? step : 1);
    }

    function decrement(value, step) {
        return value - (step ? step : 1);
    }

    function any() {
        return true;
    }

    function none() {
        return false;
    }

    function noop() {
    }

    exportAs('apply', apply);
    exportAs('withArguments', withArguments);
    exportAs('curry', curry);
    exportAs('$witch', $witch);
    exportAs('identity', identity);
    exportAs('negate', negate);
    exportAs('greater', greater);
    exportAs('less', less);
    exportAs('not', not);
    exportAs('multiply', multiply);
    exportAs('plus', plus);
    exportAs('max', max);
    exportAs('increment', increment);
    exportAs('decrement', decrement);
    exportAs('any', any);
    exportAs('none', none);
    exportAs('noop', noop);
});