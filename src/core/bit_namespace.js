/*jslint bitwise: true, browser: true, continue: true, nomen: true, plusplus: true, node: true */
/*global bit */
/*global goog */

'use strict';

goog.provide('bit.core.bit_namespace');

var bit_global = window;

var bit_namespace = function (parent, namespace) {
    namespace.split('.').forEach(function (e, i, a) {
        if (parent[e] === undefined) {
            parent[e] = {};
        }
        parent = parent[e];
    });

    return parent;
};

bit_namespace(bit_global, 'bit.core');

bit.core.bit_namespace = bit_namespace;