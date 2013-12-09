/*global BitApp, bit */

(function (global) {
    'use strict';

    function deferredStart(f) {
        if (document.readyState !== 'complete') {
            setTimeout(function () { deferredStart(f); }, 10);
        } else {
            f();
        }
    }


    var Test = new BitApp(),
        spriteImage = document.createElement('img'),
        sprites = [],
        spriteCount;

    spriteImage.src = "ship.png";

    for (spriteCount = 0; spriteCount < 60; spriteCount++) {
        sprites.push({
            sx: Math.max(0, Math.floor(Math.random() * (320 - 96))),
            sy: Math.max(0, Math.floor(Math.random() * (240 - 96))),
            dx: Math.floor(Math.random() * 4) + 1,
            dy: Math.floor(Math.random() * 4)
        });
    }

    deferredStart(function () {
        bit.init(document.body, Test, 320, 240, 2);
        bit.run();
    });


    Test.init = function () {
        bit.showFPS = true;

        this.sprite = {};
        this.sprite.canvas = document.createElement('canvas');
        this.sprite.ctx = this.sprite.canvas.getContext('2d');
        this.sprite.ctx.drawImage(spriteImage, 0, 0);
        this.sprite.width = spriteImage.width;
        this.sprite.height = spriteImage.height;
        this.sprite.imgData = this.sprite.ctx.getImageData(0, 0, spriteImage.width, spriteImage.height);
    };


    Test.postProcess = function () {
        var scanlineLum = 0.6, r1, g1, b1, x, y;

        for (x = 0; x < bit.width; x++) {
            for (y = 0; y < bit.height; y += 2) {
                r1 = bit.framebuffer[bit.offsetLUT[x][y]] * scanlineLum;
                g1 = bit.framebuffer[bit.offsetLUT[x][y] + 1] * scanlineLum;
                b1 = bit.framebuffer[bit.offsetLUT[x][y] + 2] * scanlineLum;

                bit.framebuffer[bit.offsetLUT[x][y]] = r1 | r1;
                bit.framebuffer[bit.offsetLUT[x][y] + 1] = g1 | g1;
                bit.framebuffer[bit.offsetLUT[x][y] + 2] = b1 | b1;
            }
        }
    };

    Test.tick = function () {
        sprites.forEach(function (e) {

            if (e.sx < 0 || e.sx > bit.width - this.sprite.width) { e.dx = -e.dx; }
            if (e.sy < 0 || e.sy > bit.height - this.sprite.height) { e.dy = -e.dy; }

            e.sx += e.dx;
            e.sy += e.dy;
        }, this);
    };

    Test.render = function () {
        var i, x, y, l;

        for (i = 0; i < bit.width * bit.height; i++) {
            x = Math.floor(Math.random() * bit.width);
            y = Math.floor(Math.random() * bit.height);

            l = Math.floor(Math.random() * 255);
            bit.putPixel(x, y, l, l, l, 255);
        }

        sprites.forEach(function (e) {
            bit.blit(this.sprite, e.sx, e.sy);
        }, this);
    };

    Test.overlay = function () {
        var text = 'CHAN 003';
        bit.backBufferCtx.font = "13px Verdana";
        bit.backBufferCtx.strokeStyle = 'rgba(0,150,0,0.6)';
        bit.backBufferCtx.lineWidth = 2;
        bit.backBufferCtx.strokeText(text, 245, 18);
        bit.backBufferCtx.fillStyle = 'rgba(0,255,0,0.8)';
        bit.backBufferCtx.fillText(text, 245, 18);

        bit.backBufferCtx.fillStyle = 'rgba(30,30,30,0.5)';

        bit.backBufferCtx.fillRect(10, 200, 300, 30);


        bit.backBufferCtx.font = "13px Verdana";
        bit.backBufferCtx.strokeStyle = "black";
        bit.backBufferCtx.lineWidth = 3;
        bit.backBufferCtx.strokeText(bit.fps().toFixed(3), 11, 21);
        bit.backBufferCtx.fillStyle = "white";
        bit.backBufferCtx.fillText(bit.fps().toFixed(3), 11, 21);
    };


}(this));