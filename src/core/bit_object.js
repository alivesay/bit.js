/*jslint bitwise: true, browser: true, continue: true, nomen: true, plusplus: true, node: true */
/*global bit, bit_global, bit_namespace, BitObject, BitObjectPoolManager, BitObjectPoolMemberMixin, bit_noop, BitUtil */
/*global goog */

'use strict';

goog.provide('bit.core.BitObject');
goog.provide('bit.core.BitObjectPoolMemberMixin');
goog.require('bit.core.bit_namespace');
goog.require('bit.core.BitUtil');
goog.require('bit.core.bit_noop');

bit.core.BitObject = {
    mixins: null,
    classNamespace: 'bit.core',
    className: 'BitObject',
    instanceUUID: null,

    _superClass: null,
    _validPropertyTypes: ['function', 'string', 'number', 'boolean'],

    /**
     * Generates an RFC4122-compliant v4 UUID.
     * @returns {string}
     */
    generateUUID: function () {
        var timestamp = Date.now(), uuid = '', i = 36, c,
            hexChars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'],
            uuidPattern = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';

        while (i--) {
            c = uuidPattern.charAt(i);
            if (c === 'x') {
                uuid = hexChars[(timestamp + Math.random() * 0xFF & 15)] + uuid;
            } else if (c === '-' || c === '4') {
                uuid = c + uuid;
            } else {
                uuid = hexChars[(Math.random() * 4 + 8 | 0)] + uuid;
            }

            timestamp >>= 2;
        }

        return uuid;
    },

    create: function () {
        var object;

        if (BitObjectPoolManager.isPoolableObject(this)) {
            object = BitObjectPoolManager.create?;
        } else {
            object = Object.create(this);
            object.instanceUUID = this.generateUUID();
            this._construct.apply(object, arguments);
        }

        return object;
    },

    extend: function (name, props, descriptors, mixins, addGlobal) {
        var newObject = Object.create(this), propName, propNames, namespaces, i, j;
        descriptors = descriptors || {};
        addGlobal = addGlobal || true;

        namespaces = name.split('.');
        newObject.className = namespaces.pop();
        if (namespaces.length > 0) {
            bit_namespace(bit_global, namespaces.join('.'));
            namespaces.reduce(function (obj, i) { return obj[i]; }, bit_global);
        }
        this.classNamespace = namespaces.join('.');

        if (addGlobal) { bit_global[newObject.className] = newObject; }

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
            newObject.mixins = [];
            i = mixins.length;
            while (i--) {
                if (!BitObject._isValidMixin(mixins[i])) {
                    throw new Error('BitObject.extend: Bad mixin [' + mixins[i].className + '] on [' + newObject.className + ']');
                }

                newObject.mixins.push(mixins[i]);
                if (mixins[i].mixins) {
                    j = mixins[i].mixins.length;
                    while (j--) {
                        if (!BitUtil.arrayContains(newObject.mixins, mixins[i].mixins[j])) {
                            newObject.mixins.push(mixins[i].mixins[j]);
                        }
                    }
                }
                propNames = Object.getOwnPropertyNames(mixins[i]);
                j = propNames.length;
                while (j--) {
                    propName = propNames[j];
                    if (!newObject.hasOwnProperty(propName) && mixins[i][propName] !== null && mixins[i][propName] !== undefined) {
                        newObject[propName] = mixins[i][propName];
                    }
                }
            }
        }
        if (this.mixins) {
            i = this.mixins.length;
            while (i--) {
                if (!BitUtil.arrayContains(newObject.mixins, this.mixins[i])) {
                    newObject.mixins.push(this.mixins[i]);
                }
            }
        }
        Object.defineProperties(newObject, descriptors);

        newObject._superClass = this;

        return newObject;
    },

    toString: function () {
        return '[ object ' + this.className + ' ' + this.instanceUUID + ' ]';
    },

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
               BitUtil.arrayContains(BitObject._validPropertyTypes, typeof property);
    },

    _isValidMixin: function (mixin) {
        return mixin._superClass.className === 'BitObject' && mixin._construct === bit_noop;
    },

    pureVirtualFunction: function (name) {
        return function (name) { throw new Error(this.className + '.' + name + ': Missing implementation'); };
    },

    hasOwnProperties: function (props) {
        var self = this;
        return props.reduce(function (a, b) {
            return a && self.hasOwnProperty(b);
        }, true);
    },

    hasAllPropertiesOf: function (object) {
        return this.hasOwnProperties(BitObject.getOwnPropertyNames(object));
    }
};

bit.core.BitObject.instanceUUID = bit.core.BitObject.generateUUID();
var BitObject = bit.core.BitObject;

BitObject.extend('bit.core.BitObjectPoolMemberMixin', {
    poolGetInitialSize: BitObject.pureVirtualFunction('poolGetInitialSize'),
    poolCreate: BitObject.pureVirtualFunction('poolCreate')
});

BitObject.extend('bit.core.BitObjectPool', {

});

BitObject.extend('bit.core.BitObjectPoolManager', {
    _pools: null,

    _construct: function () {
        this.pools = [];
    },

    allocate: function (object, args) {

    },

    free: function (object) {
        // should objects stay in pool, or be popped out for use? pushed in to free?...
        // what happens when pool is empty?
    },

    removeObjectFromPool: function (object) {
        delete this.pools[object.className][object.instanceUUID];
    },

    createPool: function (classObject, args) {
        var pool, i;

        if (this.pools[classObject.className] !== undefined) {
            throw new Error('BitObjectPoolManager.createPool: Pool already exists for ' + classObject.className);
        }

        pool = this.pools[classObject.className] = [];
        i = pool.length = classObject.poolGetInitialSize();
        while (i--) {
            pool[i] = (args === undefined) ? classObject.create() : classObject.apply(classObject, args);
        }
    },

    isPoolableObject: function (classObject) {
        return BitObject.isPrototypeOf(classObject) && classObject.hasAllPropertiesOf(BitObjectPoolMemberMixin);
    }
});