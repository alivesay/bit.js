/*global BitApp, BitEntity, bit */

'use strict';

function deferredStart(f) {
    if (document.readyState !== 'complete') {
        setTimeout(function () { deferredStart(f); }, 10);
    } else {
        f();
    }
}

/* video tests */

var video = document.createElement('video');
video.id = 'webcam';
var video_canvas = document.createElement('canvas');
video_canvas.id = 'webcam_canvas';
var video_streaming = false;

navigator.getUserMedia = navigator.getUserMedia ||
                         navigator.webkitGetUserMedia ||
                         navigator.mozGetUserMedia ||
                         navigator.msGetUserMedia ||
                         navigator.oGetUserMedia;

if (navigator.getUserMedia) {
    navigator.getUserMedia({video: true},
        function (stream) {
            video.src = window.URL.createObjectURL(stream);
            video.play();
            video_streaming = true;
        },
        function (e) {
            console.log("Y YOU NO WORK?");
        });
}


var testApp = {},
    spriteImage = document.createElement('img');

spriteImage.src = "ship.png";




deferredStart(function () {
    var TestEntity = BitSpriteEntity.extend({
        tick: function (app, canvas, screen) {
            if (this.x < 0 || this.x >= screen.width - this.buffer.width) { this.velocity.x = -this.velocity.x; }
            if (this.y < 0 || this.y >= screen.height - this.buffer.height) { this.velocity.y = -this.velocity.y; }
            this.x += this.velocity.x;
            this.y += this.velocity.y;
        }
    });

    var testApp = BitApp.create('testApp');

    var entity, spriteCount;

    var canvas = BitCanvas.create(document.body, 320, 240, 3);

    var sprite = BitBuffer.create(spriteImage.width, spriteImage.height);

    sprite.canvasCtx.drawImage(spriteImage, 0, 0);
    sprite.imgData = sprite.canvasCtx.getImageData(0, 0, spriteImage.width, spriteImage.height);
    sprite.data = new Uint32Array(sprite.imgData.data.buffer);

    for (spriteCount = 0; spriteCount < 10; spriteCount++) {
        entity = TestEntity.create(sprite);

        entity.x = Math.max(0, Math.floor(Math.random() * (320 - 96)));
        entity.y = Math.max(0, Math.floor(Math.random() * (240 - 96)));
        entity.velocity.x = Math.floor(Math.random() * 3) + 1;
        entity.velocity.y = Math.floor(Math.random() * 3) + 1;
        canvas.screens[0].addEntity(entity);
    }

    testApp.addCanvas(canvas);
    testApp.start();
});


testApp.init = function () {


    this.backgroundColor = bit.getColor(0, 0, 0);
    this.webcamSprite = null;
    this.waveState = 1;
    this.waveDir = 1;
};


testApp.postProcess = function () {
    this.scanlines();
    this.waves();
};

testApp.grid = function (size, color) {
    var $bit = bit,
        x = $bit.width - size - 1,
        y = $bit.height - 1;

    while (x >= 0) {
        $bit.drawLine(x, 0, x, y, color);
        x -= size;
    }
    x = $bit.width - 1;
    y -= size;
    while (y >= 0) {
        $bit.drawLine(0, y, x, y, color);
        y -= size;
    }
}

testApp.waves = function () {
    var $bit = bit,
        $buffer = $bit.data,
        $lut = $bit.dataLUT,
        x = $bit.width,
        y = $bit.height,
        xShift,
        xMod,
        xInverse;


    while (y--) {
        xShift = ((Math.sin(y * 0.09) * 10 * Math.sin(Date.now() / 6000 * 10 + 1)) + (Math.sin(y * 0.09 + 5) * 10 * Math.sin(Date.now() / 6000 * 10 + 2.8))) | 0;

        while (x--) {

            if (xShift > 0) {
                xMod = x - xShift;
                $buffer[$lut[x][y]] = (xMod >= 0) ? $buffer[$lut[xMod][y]] : 0xff000000;
            } else if (xShift < 0) {
                xInverse = $bit.width - x - 1;
                xMod = xInverse - xShift;
                $buffer[$lut[xInverse][y]] = (xMod < $bit.width) ? $buffer[$lut[xMod][y]] : 0xff000000;
            }
        }
        x = $bit.width;
    }

};

testApp.scanlines = function () {
    var $bit = bit,
        $buffer = $bit.data,
        $lut = $bit.dataLUT,
        x = $bit.width,
        y = $bit.height,
        color,
        scanlineAmount = 0.8;

    while (x--) {
        while (y--) {
            if (y & 1) {
                color = $buffer[$lut[x][y]];
                $buffer[$lut[x][y]] = (color >> 24) << 24 |
                                      (((color >> 16) & 0xFF) * scanlineAmount) << 16 |
                                      (((color >> 8) & 0xFF) * scanlineAmount) << 8 |
                                      ((color & 0xFF) * scanlineAmount) | 0;
            }
        }
        y = $bit.height;
    }
};

testApp.tick2 = function () {
    var $entities = this.scenes['test'].entities,
        i,
        $bit = bit,
        $sprite = this.webcamSprite,
        $e;

    if (this.webcamSprite === null)  return;

    for (i = 0; i < $entities.length; i++) {
        $e = $entities[i];
        if ($e.x < 0 || $e.x >= $bit.width - $sprite.width) { $e.xVelocity = -$e.xVelocity; }
        if ($e.y < 0 || $e.y >= $bit.height - $sprite.height) { $e.yVelocity = -$e.yVelocity; }
    }

};

testApp.render2 = function () {
    var $bit = bit,
        $buffer = $bit.data,
        $lut = $bit.dataLUT,
        //$sprite = this.sprite,
        $entities = this.scenes['test'].entities,
        x = $bit.width,
        y = $bit.height,
        l, i;

        //$bit.clear(this.backgroundColor);



    while (x--) {
        while (y--) {
            l = (Math.random() * 255) | 0;
            $buffer[$lut[x][y]] = 255 << $bit.ASHIFT | l << $bit.GSHIFT | l << $bit.BSHIFT | l << $bit.RSHIFT;
        }
        y = $bit.height;
    }

    this.grid(8, 0xff6030b0);

    /*
        i = $entities.length;
        while (i--) {
            $bit.blit($sprite, $entities[i].x, $entities[i].y);
        }
    */
   // this.entityManager.render();

    $bit.fillRect(10, 140, 300, 90, $bit.getColor(138, 43, 226, 128));

    /* video test */
    if (this.webcamSprite === null && video.videoWidth > 0) {
        this.webcamSprite = {};
        this.webcamSprite.canvas = video_canvas;
        this.webcamSprite.ctx = this.webcamSprite.canvas.getContext('2d');
        this.webcamSprite.imageSmoothingEnabled = true;
        this.webcamSprite.webkitImageSmoothingEnabled = true;
        this.webcamSprite.mozImageSmoothingEnabled = true;
        this.webcamSprite.width = (video.videoWidth / 12) | 0;
        this.webcamSprite.height = (video.videoHeight / 12) | 0;
    }

    if (video_streaming && this.webcamSprite !== null) {

        this.webcamSprite.ctx.clearRect(0, 0, this.webcamSprite.width, this.webcamSprite.height);
        this.webcamSprite.ctx.drawImage(video, 0, 0, this.webcamSprite.width, this.webcamSprite.height);
        this.webcamSprite.imgData = this.webcamSprite.ctx.getImageData(0, 0, this.webcamSprite.width, this.webcamSprite.height);
        this.webcamSprite.data = new Uint32Array(this.webcamSprite.imgData.data.buffer);

        i = $entities.length;
        while (i--) {
            $bit.blitNoAlpha(this.webcamSprite, $entities[i].x, $entities[i].y);
        }
    }

    $bit.fillRect(10, 30, 300, 90, $bit.getColor(0, 0, 0, 128));

};

testApp.overlay = function () {
    var text = 'TV OUT',
        $bit = bit,
        $bbCtx = $bit.backBufferCtx,
        fps = $bit.fps();

    $bbCtx.font = "13px Verdana";
    $bbCtx.strokeStyle = 'rgba(0,150,0,0.5)';
    $bbCtx.lineWidth = 2;
    $bbCtx.strokeText(text, 260, 18);
    $bbCtx.strokeText(fps, 11, 18);
    $bbCtx.fillStyle = 'rgba(0,255,0,0.8)';
    $bbCtx.fillText(text, 260, 18);
    $bbCtx.fillText(fps, 11, 18);

    $bbCtx.fillStyle = 'rgba(30,30,30,0.5)';
};