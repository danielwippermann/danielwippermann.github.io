/*! resol-vbus | Copyright (c) 2013-2018, Daniel Wippermann | MIT license */
'use strict';



const utils = {

    /**
     * @see http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
     */
    generateGUID() {
        const s4 = function() {
            return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        };

        const guid = [
            s4(),
            s4(),
            '-',
            s4(),
            '-',
            s4(),
            '-',
            s4(),
            '-',
            s4(),
            s4(),
            s4(),
        ].join('');

        return guid;
    },

    roundNumber(value, exp) {
        if ((value === undefined) || (exp === undefined) || (+exp === 0)) {
            return value;
        }

        value = +value;
        exp = +exp;

        if (Number.isNaN(value) || (exp % 1 !== 0)) {
            return NaN;
        }

        let valueParts = value.toString().split('e');
        let baseExp = valueParts [1] ? +valueParts [1] : 0;

        value = Math.round(+(valueParts [0] + 'e' + (baseExp - exp)));

        valueParts = value.toString().split('e');
        baseExp = valueParts [1] ? +valueParts [1] : 0;

        value = +(valueParts [0] + 'e' + (baseExp + exp));

        return value;
    },

    deepFreezeObjectTree(root) {
        const freezingObjects = [];

        const deepFreezeObject = function(obj) {
            if (Object.isFrozen(obj)) {
                return obj;
            }

            if (freezingObjects.indexOf(obj) >= 0) {
                throw new Error('Circular reference while deep freezing');
            }

            freezingObjects.push(obj);

            const keys = Object.getOwnPropertyNames(obj);
            keys.forEach((key) => {
                const value = obj [key];

                if ((typeof value === 'object') && (value !== null)) {
                    deepFreezeObject(value);
                }
            });

            freezingObjects.pop();

            return Object.freeze(obj);
        };

        return deepFreezeObject(root);
    },

    promisify(fn) {
        return new Promise((resolve, reject) => {
            fn((err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    },

    isPromise(obj) {
        return ((obj != null) && (typeof obj === 'object') && (typeof obj.then === 'function'));
    },

};



module.exports = utils;
