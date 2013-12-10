/*global BitApp, bit */

'use strict';

function deferredStart(f) {
    if (document.readyState !== 'complete') {
        setTimeout(function () { deferredStart(f); }, 10);
    } else {
        f();
    }
}


var test = new BitApp(),
    spriteImage = document.createElement('img'),
    sprites = [],
    spriteCount;

spriteImage.src = "ship.png";

deferredStart(function () {
    for (spriteCount = 0; spriteCount < 100; spriteCount++) {
        sprites.push({
            sx: Math.max(0, Math.floor(Math.random() * (320 - 96))),
            sy: Math.max(0, Math.floor(Math.random() * (240 - 96))),
            dx: Math.floor(Math.random() * 4) + 1,
            dy: Math.floor(Math.random() * 4),
            width: spriteImage.width,
            height: spriteImage.height
        });
    }

    bit.init(document.body, test, 320, 240, 2);
    bit.run();
});


test.init = function () {
    this.sprite = {};
    this.sprite.canvas = document.createElement('canvas');
    this.sprite.ctx = this.sprite.canvas.getContext('2d');
    this.sprite.ctx.drawImage(spriteImage, 0, 0);
    this.sprite.width = spriteImage.width;
    this.sprite.height = spriteImage.height;
    this.sprite.imgData = this.sprite.ctx.getImageData(0, 0, spriteImage.width, spriteImage.height);
};


test.postProcess = function () {
    var x, y,
        $bit = bit,
        $fb = $bit.framebuffer,
        $lut = $bit.offsetLUT;

    for (x = 0; x < $bit.width; x++) {
        for (y = 0; y < $bit.height; y += 2) {
            $fb[$lut[x][y]] = ($fb[$lut[x][y]] >> 1) | 0;
            $fb[$lut[x][y] + 1] = ($fb[$lut[x][y] + 1] >> 1) | 0;
            $fb[$lut[x][y] + 2] = ($fb[$lut[x][y] + 2] >> 1) | 0;
        }
    }
};

test.tick = function () {
    var i = sprites.length - 1,
        $bit = bit,
        $s;

    do {
        $s = sprites[i];
        if ($s.sx < 0 || $s.sx > $bit.width - $s.width) { $s.dx = -$s.dx; }
        if ($s.sy < 0 || $s.sy > $bit.height - $s.height) { $s.dy = -$s.dy; }

        $s.sx += $s.dx;
        $s.sy += $s.dy;
    } while (i--);
};

test.render = function () {
    var i, x, y, l, s,
        $bit = bit,
        $sprite = this.sprite;

    for (x = 0; x < $bit.width; x++) {
        for (y = 0; y < $bit.height; y++) {
            l = (Math.random() * 255) | 0;
            $bit.putPixel(x, y, l, l, l, 255);
        }
    }

    i = sprites.length - 1;
    do {
        s = sprites[i];
        $bit.blit($sprite, s.sx, s.sy);
    } while (i--);
};

test.overlay = function () {
    var text = 'TV OUT',
        $bit = bit,
        $bbCtx = $bit.backBufferCtx,
        fps = $bit.fps() | 0;

    $bbCtx.font = "13px Verdana";
    $bbCtx.strokeStyle = 'rgba(0,150,0,0.5)';
    $bbCtx.lineWidth = 2;
    $bbCtx.strokeText(text, 260, 18);
    $bbCtx.strokeText(fps, 11, 18);
    $bbCtx.fillStyle = 'rgba(0,255,0,0.8)';
    $bbCtx.fillText(text, 260, 18);
    $bbCtx.fillText(fps, 11, 18);

    $bbCtx.fillStyle = 'rgba(30,30,30,0.5)';
    $bbCtx.fillRect(10, 200, 300, 30);
};