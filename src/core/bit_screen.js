/*jslint bitwise: true, browser: true, continue: true, nomen: true, plusplus: true, node: true */
/*global BitBuffer, BitEntityManager, BitObject, BitRectangle */
/*global goog */

'use strict';

goog.provide('bit.core.BitScreen');
goog.require('bit.core.BitBuffer');
goog.require('bit.core.BitEntityManager');
goog.require('bit.core.BitObject');
goog.require('bit.core.BitRectangle');

var BitScreen = BitObject.extend({

    _construct: function (width, height) {
        this._constructMixin(BitRectangle, [0, 0, width, height]);
        this._constructMixin(BitEntityManager);
        this._constructMixin(BitBuffer);
    },

    tick: function (app, canvas) {
        var i = this.entities ? this.entities.length : 0;
        while (i--) {
            this.entities[i].tick(app, canvas, this);
        }
    },

    render: function (app, canvas) {
        var i = 0;// = this.entities ? this.entities.length : 0;
        while (i !== this.entities.length) {
            this.entities[i].render(app, canvas, this);
            i++;
        }
        this._canvasCtxImageData.data.set(this._buf8);
        this.canvasCtx.putImageData(this._canvasCtxImageData, 0, 0);
    }
}, null, [BitRectangle, BitEntityManager, BitBuffer]);