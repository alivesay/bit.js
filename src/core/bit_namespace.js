/*jslint bitwise: true, browser: true, continue: true, nomen: true, plusplus: true, node: true */
/*global bit */
/*global goog */

'use strict';

goog.provide('bit.core.bit_namespace');

var bit_global = this;

var bit_namespace = function (parent, namespace) {
    var ids = namespace.split('.'),
        newNamespace = ids.shift();

    if (parent[newNamespace] === undefined) {
        parent[newNamespace] = {};
    }

    return ids.length > 0 ? bit_namespace(parent[newNamespace], ids.join('.')) : null;
};

bit_namespace(this, 'bit.core');

bit.core.bit_namespace = bit_namespace;