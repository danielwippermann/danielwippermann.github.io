/*! resol-vbus | Copyright (c) 2013-present, Daniel Wippermann | MIT license */

const crypto = require('crypto');
const { EventEmitter } = require('events');



const {
    applyDefaultOptions,
    hasOwnProperty,
} = require('./utils');



const idHashes = new Map();



class HeaderSet extends EventEmitter {

    /**
     * Creates a new header set instance and optionally initializes its members with the given values.
     *
     * @constructs
     * @augments EventEmitter
     * @param {object} options Initialization values for this instance's members
     * @param {Date} options.timestamp {@link HeaderSet#timestamp}
     * @param {Header[]} options.headers Array of Headers to add to this instance
     */
    constructor(options) {
        super();

        this.headerList = [];

        applyDefaultOptions(this, options, /** @lends HeaderSet.prototype */ {

            /**
            * Timestamp of the youngest Header instance added to this set.
            * @type {Date}
            */
            timestamp: null,

        });

        if (!this.timestamp) {
            this.timestamp = new Date();
        }

        if (hasOwnProperty(options, 'headers')) {
            this.addHeaders(options.headers);
        }
    }

    _findIndex(header) {
        return this.headerList.findIndex((refHeader) => {
            return (refHeader.compareTo(header) === 0);
        });
    }

    /**
     * Returns `true` if a Header of the same kind is already added to the HeaderSet.
     *
     * @param {Header} header The Header instance to check for.
     * @returns {boolean} `true` if a Header of the same kind is already in the HeaderSet, `false` otherwise.
     */
    containsHeader(header) {
        const index = this._findIndex(header);

        return (index >= 0);
    }

    /**
     * Adds a Header instance to this set, replacing a previously added Header of same kind.
     *
     * @param {Header} header The Header instance to add to this set.
     */
    addHeader(header) {
        const index = this._findIndex(header);
        if (index >= 0) {
            this.headerList [index] = header;
        } else {
            this.headerList.push(header);
        }

        if (this.timestamp.getTime() < header.timestamp.getTime()) {
            this.timestamp = header.timestamp;
        }

        /**
         * This event is fired whenever a Header instance is added to this set.
         *
         * @event HeaderSet#addHeader
         * @type {Header}
         */
        this.emit('addHeader', header);
    }

    /**
     * Adds a list of Header instances to this set, replacing previously added Headers of same kind.
     *
     * @param {Header[]} headers The list of Header instances to add.
     */
    addHeaders(headers) {
        for (const header of headers) {
            this.addHeader(header);
        }
    }

    _removeHeader(header) {
        const index = this._findIndex(header);
        if (index >= 0) {
            /**
             * This event is fired whenever a Header is removed from this set.
             *
             * @event HeaderSet#removeHeader
             * @type {Header}
             */
            this.emit('removeHeader', this.headerList [index]);

            this.headerList.splice(index, 1);
        }
    }

    _removeHeaders(headers) {
        for (const header of headers) {
            this._removeHeader(header);
        }
    }

    /**
     * Removes all Header instances from this set.
     */
    removeAllHeaders() {
        this._removeHeaders(this.headerList.slice(0));
    }

    /**
     * Removes all Header instances from this set which are older than the given timestamp.
     *
     * @param {number|Date} timestamp Timestamp to compare Header instances against.
     */
    removeHeadersOlderThan(timestamp) {
        let time;
        if (typeof timestamp === 'number') {
            time = timestamp;
        } else {
            time = timestamp.getTime();
        }

        const headers = [];
        for (const header of this.headerList) {
            if (header.timestamp.getTime() < time) {
                headers.push(header);
            }
        }

        this._removeHeaders(headers);
    }

    /**
     * Returns the count of Header instances currently stored in this set.
     *
     * @returns {number} Number of Header instances in this set.
     */
    getHeaderCount() {
        return this.headerList.length;
    }

    /**
     * Returns an unsorted list of Header instances stored in this set.
     *
     * @returns {Header[]} List of headers stored in this set.
     */
    getHeaders() {
        return this.headerList.slice(0);
    }

    /**
     * Returns a sorted list of Header instances stored in this set.
     *
     * @returns {Header[]} List of headers stored in this set.
     */
    getSortedHeaders() {
        const sortedHeaders = this.headerList.slice(0).sort((left, right) => {
            return left.compareTo(right);
        });

        return sortedHeaders;
    }

    getSortedHeaderSet() {
        const headerSet = new HeaderSet({
            headers: this.getSortedHeaders(),
        });

        headerSet.timestamp = this.timestamp;

        return headerSet;
    }

    /**
     * Returns an ID composed of the IDs of all headers stored in this set.
     *
     * @returns {string} ID of this HeaderSet.
     */
    getId() {
        const sortedHeaders = this.getSortedHeaders();

        const sortedIds = sortedHeaders.map((header) => {
            return header.getId();
        });

        const id = sortedIds.join(',');

        return id;
    }

    /**
     * Returns an ID hash for this HeaderSet instance.
     *
     * @returns {string} ID hash for this HeaderSet
     */
    getIdHash() {
        const id = this.getId();

        if (!idHashes.has(id)) {
            const shasum = crypto.createHash('sha256');

            shasum.update(id);

            idHashes.set(id, shasum.digest('hex'));
        }

        return idHashes.get(id);
    }

}


Object.assign(HeaderSet.prototype, /** @lends HeaderSet.prototype */ {

    /**
     * Timestamp of the youngest Header instance added to this set.
     * @type {Date}
     */
    timestamp: null,

    /**
     * Array of Header instances in this set.
     * @type {Header[]}
     */
    headerList: null,

});



module.exports = HeaderSet;
