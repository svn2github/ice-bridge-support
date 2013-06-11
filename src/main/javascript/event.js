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

ice.lib.event = ice.module(function(exportAs) {
    eval(ice.importFrom('ice.lib.functional'));
    eval(ice.importFrom('ice.lib.oo'));
    eval(ice.importFrom('ice.lib.collection'));
    eval(ice.importFrom('ice.lib.query'));
    eval(ice.importFrom('ice.lib.element'));

    var cancel = operator();
    var cancelBubbling = operator();
    var cancelDefaultAction = operator();
    var isKeyEvent = operator();
    var isMouseEvent = operator();
    var capturedBy = operator();
    var triggeredBy = operator();
    var serializeEventOn = operator();
    var type = operator();

    var yes = any;
    var no = none;

    function isIEEvent(event) {
        return event.srcElement;
    }

    function Event(event, capturingElement) {
        return object(function (method) {
            method(cancel, function (self) {
                cancelBubbling(self);
                cancelDefaultAction(self);
            });

            method(isKeyEvent, no);

            method(isMouseEvent, no);

            method(type, function (self) {
                return event.type;
            });

            method(triggeredBy, function (self) {
                return capturingElement;
            });


            method(capturedBy, function (self) {
                return capturingElement;
            });

            method(serializeEventOn, function (self, query) {
                serializeElementOn(capturingElement, query);
                addNameValue(query, 'ice.event.target', identifier(triggeredBy(self)));
                addNameValue(query, 'ice.event.captured', identifier(capturedBy(self)));
                addNameValue(query, 'ice.event.type', 'on' + type(self));
            });

            method(serializeOn, curry(serializeEventOn));
        });
    }

    function IEEvent(event, capturingElement) {
        return objectWithAncestors(function (method) {
            method(triggeredBy, function (self) {
                return event.srcElement ? event.srcElement : null;
            });

            method(cancelBubbling, function (self) {
                event.cancelBubble = true;
            });

            method(cancelDefaultAction, function (self) {
                event.returnValue = false;
            });

            method(asString, function (self) {
                return 'IEEvent[' + type(self) + ']';
            });
        }, Event(event, capturingElement));
    }

    function NetscapeEvent(event, capturingElement) {
        return objectWithAncestors(function (method) {
            method(triggeredBy, function (self) {
                return event.target ? event.target : null;
            });

            method(cancelBubbling, function (self) {
                try {
                    event.stopPropagation();
                } catch (e) {
                    //invoking stopPropagation method on a cloned event throws error
                }
            });

            method(cancelDefaultAction, function (self) {
                try {
                    event.preventDefault();
                } catch (e) {
                    //invoking preventDefault method on a cloned event throws error
                }
            });

            method(asString, function (self) {
                return 'NetscapeEvent[' + type(self) + ']';
            });
        }, Event(event, capturingElement));
    }

    var isAltPressed = operator();
    var isCtrlPressed = operator();
    var isShiftPressed = operator();
    var isMetaPressed = operator();
    var serializeKeyOrMouseEventOn = operator();
    function KeyOrMouseEvent(event) {
        return object(function (method) {
            method(isAltPressed, function (self) {
                return event.altKey;
            });

            method(isCtrlPressed, function (self) {
                return event.ctrlKey;
            });

            method(isShiftPressed, function (self) {
                return event.shiftKey;
            });

            method(isMetaPressed, function (self) {
                return event.metaKey;
            });

            method(serializeKeyOrMouseEventOn, function (self, query) {
                addNameValue(query, 'ice.event.alt', isAltPressed(self));
                addNameValue(query, 'ice.event.ctrl', isCtrlPressed(self));
                addNameValue(query, 'ice.event.shift', isShiftPressed(self));
                addNameValue(query, 'ice.event.meta', isMetaPressed(self));
            });
        });
    }

    var isLeftButton = operator();
    var isRightButton = operator();
    var positionX = operator();
    var positionY = operator();
    var serializeMouseEventOn = operator();
    function MouseEvent(event) {
        return objectWithAncestors(function (method) {
            method(isMouseEvent, yes);

            method(serializeMouseEventOn, function (self, query) {
                serializeKeyOrMouseEventOn(self, query);
                addNameValue(query, 'ice.event.x', positionX(self));
                addNameValue(query, 'ice.event.y', positionY(self));
                addNameValue(query, 'ice.event.left', isLeftButton(self));
                addNameValue(query, 'ice.event.right', isRightButton(self));
            });

        }, KeyOrMouseEvent(event));
    }

    function MouseEventTrait(method) {
        method(serializeOn, function (self, query) {
            serializeEventOn(self, query);
            serializeMouseEventOn(self, query);
        });
    }

    function IEMouseEvent(event, capturingElement) {
        return objectWithAncestors(function (method) {
            MouseEventTrait(method);

            method(positionX, function (self) {
                return event.clientX + (document.documentElement.scrollLeft || document.body.scrollLeft);
            });

            method(positionY, function (self) {
                return event.clientY + (document.documentElement.scrollTop || document.body.scrollTop);
            });

            method(isLeftButton, function (self) {
                return event.button == 1;
            });

            method(isRightButton, function (self) {
                return event.button == 2;
            });

            method(asString, function (self) {
                return 'IEMouseEvent[' + type(self) + ']';
            });
        }, MouseEvent(event), IEEvent(event, capturingElement));
    }

    function NetscapeMouseEvent(event, capturingElement) {
        return objectWithAncestors(function (method) {
            MouseEventTrait(method);

            method(positionX, function (self) {
                return event.pageX;
            });

            method(positionY, function (self) {
                return event.pageY;
            });

            method(isLeftButton, function (self) {
                return event.which == 1;
            });

            method(isRightButton, function (self) {
                return event.which == 2;
            });

            method(asString, function (self) {
                return 'NetscapeMouseEvent[' + type(self) + ']';
            });

        }, MouseEvent(event), NetscapeEvent(event, capturingElement));
    }

    var keyCharacter = operator();
    var keyCode = operator();
    var serializeKeyEventOn = operator();
    function KeyEvent(event) {
        return objectWithAncestors(function (method) {
            method(isKeyEvent, yes);

            method(keyCharacter, function (self) {
                return String.fromCharCode(keyCode(self));
            });

            method(serializeKeyEventOn, function (self, query) {
                serializeKeyOrMouseEventOn(self, query);
                addNameValue(query, 'ice.event.keycode', keyCode(self));
            });
        }, KeyOrMouseEvent(event));
    }

    function KeyEventTrait(method) {
        method(serializeOn, function (self, query) {
            serializeEventOn(self, query);
            serializeKeyEventOn(self, query);
        });
    }

    function IEKeyEvent(event, capturingElement) {
        return objectWithAncestors(function (method) {
            KeyEventTrait(method);

            method(keyCode, function (self) {
                return event.keyCode;
            });

            method(asString, function (self) {
                return 'IEKeyEvent[' + type(self) + ']';
            });
        }, KeyEvent(event), IEEvent(event, capturingElement));
    }

    function NetscapeKeyEvent(event, capturingElement) {
        return objectWithAncestors(function (method) {
            KeyEventTrait(method);

            method(keyCode, function (self) {
                return event.which == 0 ? event.keyCode : event.which;
            });

            method(asString, function (self) {
                return 'NetscapeKeyEvent[' + type(self) + ']';
            });
        }, KeyEvent(event), NetscapeEvent(event, capturingElement));
    }

    function isEnterKey(event) {
        return keyCode(event) == 13;
    }

    function isEscKey(event) {
        return keyCode(event) == 27;
    }

    function UnknownEvent(capturingElement) {
        return objectWithAncestors(function (method) {
            method(cancelBubbling, noop);

            method(cancelDefaultAction, noop);

            method(type, function (self) {
                return 'unknown';
            });

            method(asString, function (self) {
                return 'UnkownEvent[]';
            });

        }, Event(null, capturingElement));
    }

    var MouseListenerNames = [ 'onclick', 'ondblclick', 'onmousedown', 'onmousemove', 'onmouseout', 'onmouseover', 'onmouseup' ];
    var KeyListenerNames = [ 'onkeydown', 'onkeypress', 'onkeyup', 'onhelp' ];

    function $event(e, element) {
        var capturedEvent = e || window.event;
        if (capturedEvent && capturedEvent.type) {
            var eventType = 'on' + capturedEvent.type;
            if (contains(KeyListenerNames, eventType)) {
                return isIEEvent(capturedEvent) ? IEKeyEvent(capturedEvent, element) : NetscapeKeyEvent(capturedEvent, element);
            } else if (contains(MouseListenerNames, eventType)) {
                return isIEEvent(capturedEvent) ? IEMouseEvent(capturedEvent, element) : NetscapeMouseEvent(capturedEvent, element);
            } else {
                return isIEEvent(capturedEvent) ? IEEvent(capturedEvent, element) : NetscapeEvent(capturedEvent, element);
            }
        } else {
            return UnknownEvent(element);
        }
    }

    exportAs('cancel', cancel);
    exportAs('cancelBubbling', cancelBubbling);
    exportAs('cancelDefaultAction', cancelDefaultAction);
    exportAs('isKeyEvent', isKeyEvent);
    exportAs('isMouseEvent', isMouseEvent);
    exportAs('capturedBy', capturedBy);
    exportAs('triggeredBy', triggeredBy);
    exportAs('serializeEventOn', serializeEventOn);
    exportAs('type', type);
    exportAs('isAltPressed', isAltPressed);
    exportAs('isCtrlPressed', isCtrlPressed);
    exportAs('isShiftPressed', isShiftPressed);
    exportAs('isMetaPressed', isMetaPressed);
    exportAs('isLeftButton', isLeftButton);
    exportAs('isRightButton', isRightButton);
    exportAs('positionX', positionX);
    exportAs('positionY', positionY);
    exportAs('keyCharacter', keyCharacter);
    exportAs('keyCode', keyCode);
    exportAs('isEnterKey', isEnterKey);
    exportAs('isEscKey', isEscKey);
    exportAs('$event', $event);
});
