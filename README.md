# bit.js
An experimental JavaScript game engine...with Blast Processing!


A fun winter project where I make yet another attempt at a game engine and get detoured down a rabbit hole in the form of a custom JS class system.

### BitObject
[BitObject](https://github.com/alivesay/bit.js/blob/master/src/core/bit_object.js) attempts to provide an object class supporting:
* multiple inheritance
* mixins
* extensions
* interfaces
* introspection
* object pooling


```javascript
BitInterface.extend('bit.core.IBitDimensions', {
    width: 'number',
    height: 'number'
});

BitObject.extend('bit.core.MBitDimensions', {
    width: 0,
    height: 0
});

BitObject.extend('bit.core.BitDimensions', {
    _construct: function (width, height) {
        this.width = width || this.width;
        this.height = height || this.height;
    }
}).mixin([
    MBitDimensions
]).fullfills([
    IBitDimensions
]);

BitInterface.extend('bit.core.IBitRectangle', {
    intersects: 'function',
    contains: 'function'
}).mixin([
    IBitDimensions,
    IBitVector2D
]);

BitObject.extend('bit.core.MBitRectangle', {
    intersects: function (rect) {
        return !(this.x > rect.x + rect.width || this.x + this.width < rect.x ||
                 this.y > rect.y + rect.height || this.y + this.height < rect.y);
    },

    contains: function (x, y) {
        return x < this.x && x <= this.x + this.width && y >= this.y && y <= this.y + this.width;
    }
}).mixin([
    MBitVector2D,
    MBitDimensions
]);

BitObject.extend('bit.core.BitRectangle', {
    _construct: function (x, y, width, height) {
        this.x = x || this.x;
        this.y = y || this.y;
        this.width = width || this.width;
        this.height = height || this.height;
    }
}).mixin([
    MBitRectangle
]).fullfills([
    IBitRectangle
]);
```
