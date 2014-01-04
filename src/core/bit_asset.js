/*jslint bitwise: true, browser: true, continue: true, nomen: true, plusplus: true, node: true */
/*global BitEnum, BitObject */
/*global goog */

'use strict';

goog.provide('bit.core.BitOAssetType');
goog.provide('bit.core.BitOAsset');
goog.require('bit.core.BitObject');
goog.require('bit.core.BitEnum');

var BitAssetType = BitEnum.create([
    'Unknown',
    'Script',
    'Sprite',
    'TileMap'
]);


var BitAsset = BitObject.extend({
    type: null
});