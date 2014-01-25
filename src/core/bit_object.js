/*jslint bitwise: true, browser: true, continue: true, nomen: true, plusplus: true, node: true */
/*global bit, bit_global, bit_namespace, bit_object_pool, BitObject, BitObjectPool, BitObjectPoolMemberMixin, bit_noop, BitUtil */
/*global goog */

'use strict';

goog.provide('bit.core.BitObject');
goog.provide('bit.core.BitObjectPoolManager');
goog.provide('bit.core.BitObjectPool');
goog.provide('bit.core.BitObjectPoolMemberMixin');
goog.require('bit.core.bit_namespace');
goog.require('bit.core.BitUtil');
goog.require('bit.core.bit_noop');

bit.core.BitObject = {
    _mixins: null,
    _classNamespace: 'bit.core',
    _className: 'BitObject',
    _instanceUUID: null,
    _superClass: null,
    _validPropertyValueTypes: ['function', 'string', 'number', 'boolean'],
    _uuidHexChars: '0123456789abcdef',
    _uuidPattern: 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx',

    _construct: bit_noop,

    _constructSuper: function (superClass, args) {
        return this._super(superClass, '_construct', args);
    },

    _super: function (superClass, method, args) {
        return superClass[method].apply(this, args);
    },

    _isValidPropertyType: function (property) {
        return property === null ||
               property === undefined ||
               BitUtil.arrayContains(BitObject._validPropertyValueTypes, typeof property);
    },

    _isValidMixin: function (mixin) {
        return mixin._superClass.className === 'BitObject' && mixin._construct === bit_noop;
    },

    /**
     * Generates an RFC4122-compliant v4 UUID.
     * @returns {string}
     */
    generateUUID: function () {
        var timestamp = Date.now(), uuid = '', i = 36, c;

        while (i--) {
            c = this._uuidPattern.charAt(i);
            if (c === 'x') {
                uuid = this._uuidHexChars.charAt(timestamp + Math.random() * 0xFF & 15) + uuid;
            } else if (c === '-' || c === '4') {
                uuid = c + uuid;
            } else {
                uuid = this._uuidHexChars.charAt((Math.random() * 4 + 8 | 0)) + uuid;
            }

            timestamp >>= 2;
        }

        return uuid;
    },

    create: function () {
        var object;

        if (BitObjectPool.isPoolableObject(this)) {
            return bit_object_pool.alloc(this, arguments);
        }

        object = Object.create(this);
        object._instanceUUID = this.generateUUID();
        this._construct.apply(object, arguments);

        return object;
    },

    extend: function (name, props, descriptors, mixins, addGlobal) {
        var newObject = Object.create(this), propName, propNames, namespaces, i, j;
        descriptors = descriptors || {};
        addGlobal = addGlobal || true;

        namespaces = name.split('.');
        newObject._className = namespaces.pop();
        if (namespaces.length > 0) {
            bit_namespace(bit_global, namespaces.join('.'));
            namespaces.reduce(function (obj, i) { return obj[i]; }, bit_global);
        }
        this._classNamespace = namespaces.join('.');

        if (addGlobal) { bit_global[newObject._className] = newObject; }

        if (props) {
            propNames = Object.getOwnPropertyNames(props);
            i = propNames.length;
            while (i--) {
                propName = propNames[i];
                if (!descriptors.hasOwnProperty(propName)) {
                    if (!BitObject._isValidPropertyType(props[propName])) {
                        throw new Error('BitObject.extend: Invalid field type for property [' + propName + ']');
                    }
                    newObject[propName] = props[propName];
                }
            }
        }
        if (mixins) {
            newObject._mixins = [];
            i = mixins.length;
            while (i--) {
                if (!BitObject._isValidMixin(mixins[i])) {
                    throw new Error('BitObject.extend: Bad mixin [' + mixins[i]._className + '] on [' + newObject._className + ']');
                }

                newObject._mixins.push(mixins[i]);
                if (mixins[i]._mixins) {
                    j = mixins[i]._mixins.length;
                    while (j--) {
                        if (!BitUtil.arrayContains(newObject._mixins, mixins[i]._mixins[j])) {
                            newObject._mixins.push(mixins[i]._mixins[j]);
                        }
                    }
                }
                propNames = Object.getOwnPropertyNames(mixins[i]);
                j = propNames.length;
                while (j--) {
                    propName = propNames[j];
                    if (!newObject.hasOwnProperty(propName) && mixins[i][propName] !== undefined) {
                        newObject[propName] = mixins[i][propName];
                    }
                }
            }
        }
        if (this._mixins) {
            i = this._mixins.length;
            while (i--) {
                if (!BitUtil.arrayContains(newObject._mixins, this._mixins[i])) {
                    newObject._mixins.push(this._mixins[i]);
                }
            }
        }
        Object.defineProperties(newObject, descriptors);

        newObject._superClass = this;

        return newObject;
    },

    toString: function () {
        return '[ object ' + this._className + ' ' + this._instanceUUID + ' ]';
    },

    pureVirtualFunction: function (name) {
        return function (name) { throw new Error(this._className + '.' + name + ': Missing implementation'); };
    },

    hasOwnProperties: function (props) {
        var self = this;
        return props.reduce(function (a, b) {
            return a && self.hasOwnProperty(b);
        }, true);
    },

    hasAllPropertiesOf: function (object) {
        return this.hasOwnProperties(Object.getOwnPropertyNames(object));
    }
};

// TODO: do these really need to be enumerable?
(function (self) {
    Object.defineProperties(self, {
        'classNamespace': { get: function () { return this._classNamespace; }, enumerable: true },
        'className': { get:  function () { return this._className; }, enumerable: true },
        'instanceUUID': { get: function () { return this._instanceUUID; }, enumerable: true },
        'superClass': { get: function () { return this._superClass; }, enumerable: true }
    });
    self._instanceUUID = bit.core.BitObject.generateUUID();
}(bit.core.BitObject));

var BitObject = bit.core.BitObject;

BitObject.extend('bit.core.BitObjectPoolMemberMixin', {
    release: BitObject.pureVirtualFunction('release')
});

BitObject.extend('bit.core.BitObjectPool', {
    _classPools: null,

    _construct: function () {
        this._classPools = {};
    },

    alloc: function (object, args) {
        var obj, className;

        className = object.className;

        if (this._classPools[className] === undefined) {
            this._classPools[className] = [];
        }

        if (this._classPools[className].length > 0) {
            obj = this._pools[className].pop();
            if (args === undefined) {
                obj._construct();
            } else {
                obj._construct.apply(obj, args);
            }
            return obj;
        }

        return ((args === undefined) ? object.create() : object.create.apply(object, args));
    },

    free: function (object) {
        object.release();
        this._pools[object.className].push(object);
    },

    collect: function () {
        this._pools = {};
    },

    isPoolableObject: function (object) {
        return BitObject.isPrototypeOf(object) && object.hasAllPropertiesOf(BitObjectPoolMemberMixin);
    }
});

var bit_object_pool = BitObjectPool.create();