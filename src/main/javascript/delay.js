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

ice.lib.delay = ice.module(function(exportAs) {
    eval(ice.importFrom('ice.lib.oo'));

    var run = operator();
    var runOnce = operator();
    var stop = operator();

    function Delay(f, milliseconds) {
        return object(function(method) {
            var id = null;
            var canceled = false;

            method(run, function(self, times) {
                //avoid starting a new process
                if (id || canceled) return;

                var call = times ? function() {
                    try {
                        f();
                    } finally {
                        if (--times < 1) stop(self);
                    }
                } : f;

                id = setInterval(call, milliseconds);

                return self;
            });

            method(runOnce, function(self) {
                return run(self, 1);
            });

            method(stop, function(self) {
                //stop only an active process
                if (id) {
                    clearInterval(id);
                    id = null;
                    //cancel execution completely if run* was not called
                } else {
                    canceled = true;
                }
            });
        });
    }

    exportAs('run', run);
    exportAs('runOnce', runOnce);
    exportAs('stop', stop);
    exportAs('Delay', Delay);
});