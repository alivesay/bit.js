/*jslint bitwise: true, browser: true, continue: true, nomen: true, plusplus: true, node: true */
/*global bit, bit_global, bit_namespace, bit_object_pool, BitInterface, BitObject, BitObjectPool, bit_noop, BitUtil,
         IPoolable */
/*global goog */

'use strict';

goog.provide('bit.core.BitObject');
goog.provide('bit.core.BitInterface');
goog.provide('bit.core.BitObjectPoolManager');
goog.provide('bit.core.BitObjectPool');
goog.provide('bit.core.BitObjectPool.IBitObjectPoolPoolable');
goog.require('bit.core.bit_namespace');
goog.require('bit.core.BitUtil');
goog.require('bit.core.bit_noop');

bit.core.BitObject = {
    _className: 'BitObject',
    _instanceUUID: null,
    _superClass: null,
    _attributes: null,
    _interfaces: null,
    _mixins: null,
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

    // TODO: move this out of BitObject
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

    _buildClassNamespace: function (namespaces, object) {
        if (namespaces.length > 0) {
            bit_namespace(bit_global, namespaces.join('.'));
        }
    },

    _addMixin: function (mixin) {
        this._mixins = this._mixins || Object.create(null);

        if (!BitInterface.isPrototypeOf(mixin) && !this._isValidMixin(mixin)) {
            throw new Error('BitObject.extend: Bad mixin [' + mixin.className + '] on [' + this._className + ']');
        }

        this._mixins[mixin.className] = mixin;

        Object.getOwnPropertyNames(mixin).forEach(function (e, i, a) {
            if (!this.hasOwnProperty(e) && mixin[e] !== e) {
                this[e] = mixin[e];
            }
        }, this);
    },

    mixin: function (mixins) {
        mixins.forEach(function (e, i, a) {
            this._addMixin(e);
        }, this);

        return this;
    },

    extend: function (name, props, addGlobal) {
        // TODO: refactor
        var newObject = Object.create(this),
            ns;

        addGlobal = addGlobal || true;

        if (props) {
            Object.keys(props).forEach(function (e, i, a) {
                if (!this._isValidPropertyType(props[e])) {
                    // TODO: can I support non-primitive types here?
                    throw new Error('BitObject.extend: Invalid field type for property [' + e + ']');
                }
                newObject[e] = props[e];
            }, this);
        }

        newObject._mixins = this._mixins ? BitUtil.objectShallowCopy(this._mixins) : null;
        newObject._attributes = this._attributes ? BitUtil.objectShallowCopy(this._attributes) : null;
        newObject._interfaces = this._interfaces ? BitUtil.objectShallowCopy(this._interfaces) : null;
        newObject._superClass = this;

        ns = name.split('.');
        newObject._className = ns.pop();
        if (ns.length > 0) {
            bit_namespace(bit_global, ns.join('.'))[newObject._className] = newObject;
        }

        if (addGlobal) {
            bit_global[newObject._className] = newObject;
        }

        return newObject;
    },

    _addInterface: function (iobject) {
        this._interfaces = this._interfaces || Object.create(null);

        if (!this.hasInterfaceOf(iobject)) {
            throw new Error('BitObject.addInterface: Class does not fully implement interface ' + iobject.className);
        }

        this._interfaces[iobject.className] = iobject;

        return this;
    },

    fullfills: function (iobjects) {
        iobjects.forEach(function (e, i, a) {
            this._addInterface(e);
        }, this);

        return this;
    },

    hasInterfaceOf: function (iobject) {
        return Object.keys(iobject).every(function (e, i, a) {
            return this.hasOwnProperty(e);
        }, this);
    },

    addAttributes: function (attributes) {
        this._attributes = this._attributes || Object.create(null);

        Object.keys(attributes).forEach(function (e, i, a) {
            if (attributes[e].hasOwnProperty('meta')) {
                this._attributes[e] = attributes[e].meta;
                delete attributes[e].meta;
            } else {
                this._attributes[e] = Object.create(null);
            }
        }, this);

        Object.defineProperties(this, attributes);

        return this;
    },

    toString: function () {
        return '[ object ' + this._className + ' ' + this._instanceUUID + ' ]';
    },

    pureVirtualFunction: function (name) {
        return function (name) { throw new Error(this._className + '.' + name + ': Missing implementation'); };
    },

    hasOwnProperties: function (props) {
        // TODO: should this use Object.keys() instead?
        var self = this;
        return props.every(function (e, i, a) {
            return self.hasOwnProperty(e);
        }, true);
    },

    hasAllPropertiesOf: function (object) {
        return this.hasOwnProperties(Object.getOwnPropertyNames(object));
    }
};

(function (self) {
    Object.defineProperties(self, {
        'className': { get:  function () { return this._className; } },
        'instanceUUID': { get: function () { return this._instanceUUID; } },
        'superClass': { get: function () { return this._superClass; } },
        'attributes': { get: function () { return this._attributes; } },
        'interfaces': { get: function () { return this._interfaces; } },
        'mixins': { get: function () { return this._mixins; } }

    });
    self._instanceUUID = bit.core.BitObject.generateUUID();
}(bit.core.BitObject));

var BitObject = bit.core.BitObject;

BitObject.extend('bit.core.BitInterface', {
    _construct: function () {
        throw new Error('BitInterface: Attempted to instantiate interface object ' + this.className);
    },

    extend: function (name, iprops, addGlobal) {
        var tempObject = Object.create(this),
            newObject,
            ns;

        // TODO: and maybe mixins and interfaces should be stored in dict (duplicates)?
        // TODO: what if i extend a BitInterface?

        addGlobal = addGlobal || true;

        ns = name.split('.');
        tempObject._className = ns.pop();
        tempObject._superClass = this;
        tempObject._mixins = this._mixins ? BitUtil.objectShallowCopy(this._mixins) : null;

        newObject = Object.create(tempObject);

        Object.keys(iprops).forEach(function (e, i, a) {
            newObject[e] = iprops[e];
        });

        if (ns.length > 0) {
            bit_namespace(bit_global, ns.join('.'))[newObject._className] = newObject;
        }

        if (addGlobal) {
            bit_global[newObject._className] = newObject;
        }

        return newObject;
    },

    _addMixin: function (mixin) {
        this._mixins = this._mixins || BitObject.create(null);

        if (!BitInterface.isPrototypeOf(mixin) && !this._isValidMixin(mixin)) {
            throw new Error('BitObject.extend: Bad mixin [' + mixin.className + '] on [' + this._className + ']');
        }

        this._mixins[mixin.className] = mixin;

        Object.getOwnPropertyNames(mixin).forEach(function (e, i, a) {
            if (!this.hasOwnProperty(e) && mixin[e] !== e) {
                this[e] = mixin[e];
            }
        }, this);
    },

    mixin: function (mixins) {
        mixins.forEach(function (e, i, a) {
            this._addMixin(e);
        }, this);

        return this;
    }
});

BitObject.extend('bit.core.BitObjectPool', {
    _classPools: null,

    _construct: function () {
        this._classPools = Object.create(null);
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
        this._pools = Object.create(null);
    },

    isPoolableObject: function (object) {
        return BitObject.isPrototypeOf(object) && object.hasInterfaceOf(bit.core.IBitPoolable);
    }
});

BitInterface.extend('bit.core.IBitPoolable', {
    release: 'function'
});
