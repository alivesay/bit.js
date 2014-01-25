/*jslint bitwise: true, browser: true, continue: true, nomen: true, plusplus: true, node: true */
/*global bit, BitEnum, BitObject */
/*global goog */

'use strict';

goog.provide('bit.core.BitAssetType');
goog.provide('bit.core.BitAsset');
goog.require('bit.core.bit_namespace');
goog.require('bit.core.BitObject');
goog.require('bit.core.BitEnum');

bit.core.BitAssetType = BitEnum.create([
    'UNKNOWN',
    'SCRIPT',
    'SPRITE',
    'TILEMAP'
]);

var BitAssetType = bit.core.BitAssetType;

BitObject.extend('bit.core.BitAsset', {
    type: null
});