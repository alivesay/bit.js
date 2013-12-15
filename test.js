/*global BitApp, bit */

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
            console.log("Y YOU KNOW WORK?");
        });
}


var testApp = new BitApp(),
    spriteImage = document.createElement('img');

//spriteImage.src = "ship.png";

deferredStart(function () {
    var entity, spriteCount;

    for (spriteCount = 0; spriteCount < 100; spriteCount++) {
        entity = new BitEntity();
        entity.x = Math.max(0, Math.floor(Math.random() * (320 - 96)));
        entity.y = Math.max(0, Math.floor(Math.random() * (240 - 96)));
        entity.w = spriteImage.width;
        entity.h = spriteImage.height;
        entity.xSpeed = Math.floor(Math.random() * 2) + 1;
        entity.ySpeed = Math.floor(Math.random() * 2);

        testApp.entityManager.addEntity(entity);
    }

    bit.init(document.body, testApp, 320, 240, 3);
    bit.start();
});


testApp.init = function () {
    /*
    this.sprite = {};
    this.sprite.canvas = document.createElement('canvas');
    this.sprite.ctx = this.sprite.canvas.getContext('2d');
    this.sprite.ctx.drawImage(spriteImage, 0, 0);
    this.sprite.width = spriteImage.width;
    this.sprite.height = spriteImage.height;
    this.sprite.imgData = this.sprite.ctx.getImageData(0, 0, spriteImage.width, spriteImage.height);
    this.sprite.buffer = new Uint32Array(this.sprite.imgData.data.buffer);
    */

    this.webcamSprite = null;
};


testApp.postProcess = function () {
    var $bit = bit,
        $buffer = $bit.buffer,
        $lut = $bit.offsetLUT,
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

testApp.tick = function () {
    var $entities = this.entityManager.entities,
        i,
        $bit = bit,
        $s;

    for (i = 0; i < $entities.length; i++) {
        $s = $entities[i];
        if ($s.x < 0 || $s.x > $bit.width - $s.w) { $s.xSpeed = -$s.xSpeed; }
        if ($s.y < 0 || $s.y > $bit.height - $s.h) { $s.ySpeed = -$s.ySpeed; }
    }

    this.entityManager.tick();
};

testApp.render = function () {
    var $bit = bit,
        $buffer = $bit.buffer,
        $lut = $bit.offsetLUT,
        //$sprite = this.sprite,
        $entities = this.entityManager.entities,
        x = $bit.width,
        y = $bit.height,
        l, i;

    while (x--) {
        while (y--) {
            l = (Math.random() * 255) | 0;
            $buffer[$lut[x][y]] = 255 << 24 | l << 16 | l << 8 | l;
        }
        y = $bit.height;
    }
/*
    i = $entities.length;
    while (i--) {
        $bit.blit($sprite, $entities[i].x, $entities[i].y);
    }
*/
   // this.entityManager.render();

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
        this.webcamSprite.buffer = new Uint32Array(this.webcamSprite.imgData.data.buffer);

        i = $entities.length;
        while (i--) {
            $bit.blitNoAlpha(this.webcamSprite, $entities[i].x, $entities[i].y);
        }
    }
};

testApp.overlay = function () {
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