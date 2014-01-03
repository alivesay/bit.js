/*jslint bitwise: true, browser: true, continue: true, nomen: true, plusplus: true, node: true */
/*global BitEventHandler, BitObject, BitUtil */
/*global goog */

'use strict';

goog.provide('bit.core.BitEventNotifier');
goog.require('bit.core.BitEventHandler');
goog.require('bit.core.BitObject');
goog.require('bit.core.BitUtil');

var BitEventNotifier = BitObject.extend('BitEventNotifier', {
    _handlers: [],

    addHandler: function (handler, qualifiedEventName) {
        var eventHandlers = this._handlers[qualifiedEventName] = this._handlers[event.qualifiedName] || [];

        if (BitUtil.arrayIndexOf(eventHandlers, qualifiedEventName) === -1) {
            eventHandlers.push(handler);
        }
    },

    handleEvent: function (event) {
        var eventHandlers = this._handlers[event.qualifiedName],
            i = eventHandlers ? eventHandlers.length : 0,
            handler;

        while (i--) {
            handler = eventHandlers[i];
            if (handler.handleEvent(event)) {
                BitUtil.arrayRemove(eventHandlers, event.qualifiedName);
            }
        }
    }
}, null, [BitEventHandler]);