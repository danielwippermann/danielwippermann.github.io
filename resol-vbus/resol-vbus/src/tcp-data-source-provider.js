/*! resol-vbus | Copyright (c) 2013-present, Daniel Wippermann | MIT license */

const dgram = require('dgram');
const http = require('http');


const TcpDataSource = require('./tcp-data-source');
const { promisify, applyDefaultOptions } = require('./utils');

const DataSourceProvider = require('./data-source-provider');



const ipv4Re = /^\d+\.\d+\.\d+\.\d+$/;

function parseIpV4Address(string) {
    if (!ipv4Re.test(string)) {
        throw new Error('Invalid IPv4 input');
    }
    return string.split('.').map(s => +s);
}

function formatIpV4Address(parts) {
    return parts.map(p => p.toString()).join('.');
}

function calculateIpV4BroadcastAddress(address, netmask) {
    const addressParts = parseIpV4Address(address);
    const netmaskParts = parseIpV4Address(netmask);
    const bcastParts = [ 0, 0, 0, 0, ];
    for (let i = 0; i < 4; i++) {
        bcastParts [i] = addressParts [i] | (netmaskParts [i] ^ 255);
    }
    const broadcastAddress = formatIpV4Address(bcastParts);
    return broadcastAddress;
}

class TcpDataSourceProvider extends DataSourceProvider {

    /**
     * Creates a new TcpDataSourceProvider instance.
     *
     * @constructs
     * @augments DataSourceProvider
     */
    constructor(options) {
        super(options);

        applyDefaultOptions(this, options, /** @lends TcpDataSourceProvider.prototype */ {

            broadcastAddress: '255.255.255.255',

            broadcastPort: 7053,

        });
    }

    async discoverDataSources() {
        const options = {
            broadcastAddress: this.broadcastAddress,
            broadcastPort: this.broadcastPort,
        };

        const results = await TcpDataSourceProvider.discoverDevices(options);

        return results.map((result) => {
            const options = {
                ...result,
                host: result.__address__
            };

            return this.createDataSource(options);
        });
    }

    createDataSource(options) {
        options = {
            ...options,
            provider: this.id,
            id: options.__address__,
            name: options.name || options.__address__,
            host: options.__address__,
        };

        return new TcpDataSource(options);
    }

    /**
     * Discovers devices on the local network.
     *
     * @param {object} options Optional options object
     * @param {string} options.family Either `IPv4` or `IPv6`. Defaults to 'IPv4'.
     * @param {string} options.broadcastAddress IP address to broadcast to. Defaults to calculated address for IPv4 and "ff02::1" for IPv6.
     * @param {string} options.localAddress Local IP address to broadcast from. Optional for IPv4, required for IPv6.
     * @param {string} options.netmask Local IPv4 netmask. Optional for IPv4, ignored for IPv6.
     * @param {string} options.broadcastInterface Local interface name to broadcast from. Ignored for IPv4, required for IPv6.
     * @param {number} options.broadcastPort Port number to broadcast to. Defaults to 7053.
     * @param {number} options.tries Number of broadcasts to send. Defaults to 3.
     * @param {number} options.timeout Time between broadcast tries. Defaults to 500.
     * @param {function} options.fetchCallback Callback to fetch information about the device.
     * @returns {Promise} A Promise that resolves to an array of device information objects.
     */
    static async discoverDevices(options) {
        let promises;
        if (options && (options.family === 'IPv6')) {
            promises = await TcpDataSourceProvider.sendBroadcastIPv6(options);
        } else {
            promises = await TcpDataSourceProvider.sendBroadcast(options);
        }

        const result = [];
        for (const promise of promises) {
            try {
                const info = await promise;
                result.push(info);
            } catch (err) {
                // nop
            }
        }

        return result;
    }

    /**
     * Send device discovery broadcasts using IPv6.
     *
     * @param {object} options Optional options object.
     * @param {string} options.broadcastAddress IP address to broadcast to. Defaults to "ff02::1".
     * @param {string} options.localAddress Local IPv6 address to broadcast from. Required.
     * @param {string} options.broadcastInterface Local interface name to broadcast from. Required.
     * @param {number} options.broadcastPort Port number to broadcast to. Defaults to 7053.
     * @param {number} options.tries Number of broadcasts to send. Defaults to 3.
     * @param {number} options.timeout Time between broadcast tries. Defaults to 500.
     * @param {function} options.fetchCallback Callback to fetch information about the device.
     * @returns { Promise } A Promise that resolves to an array of Promises resolving to the fetched device information.
     */
    static async sendBroadcastIPv6(options) {
        options = applyDefaultOptions({}, options, {
            broadcastAddress: 'ff02::1',
            localAddress: null,
            broadcastInterface: null,
            broadcastPort: 7053,
            tries: 3,
            timeout: 500,
            fetchCallback: undefined,
        });

        if (options.fetchCallback === undefined) {
            options.fetchCallback = function(address) {
                return TcpDataSourceProvider.fetchDeviceInformation({
                    hostname: address,
                    localAddress: `${options.localAddress}%${options.broadcastInterface}`,
                    family: 6,
                });
            };
        }

        const bcastAddress = options.broadcastAddress;
        const bcastPort = options.broadcastPort;

        const queryString = '---RESOL-BROADCAST-QUERY---';
        const replyString = '---RESOL-BROADCAST-REPLY---';

        const socket = dgram.createSocket('udp6');

        socket.on('error', (err) => {
            socket.close();

            console.log(err);
        });

        const addressList = [];

        socket.on('message', (msg, rinfo) => {
            if ((rinfo.family === 'IPv6') && (rinfo.port === bcastPort) && (msg.length >= replyString.length)) {
                const msgString = msg.slice(0, replyString.length).toString();
                if (msgString === replyString) {
                    const { address } = rinfo;
                    if (addressList.indexOf(address) < 0) {
                        addressList.push(address);
                    }
                }
            }
        });

        await promisify(cb => socket.bind(0, cb));

        socket.setMulticastInterface('::%' + options.broadcastInterface);
        socket.setBroadcast(true);

        for (let tries = 0; tries < options.tries; tries++) {
            const queryBuffer = Buffer.from(queryString);
            socket.send(queryBuffer, 0, queryBuffer.length, bcastPort, bcastAddress);

            await promisify(cb => setTimeout(cb, options.timeout));
        }

        socket.close();

        const result = addressList.map(async (address) => {
            return options.fetchCallback(address);
        });

        return result;
    }

    /**
     * Send device discovery broadcasts using IPv4.
     *
     * @param {object} options Optional options object.
     * @param {string} options.broadcastAddress IP address to broadcast to. Defaults to calculated address or "255.255.255.255" if no "netmask" was provided.
     * @param {string} options.localAddress Local IP address to broadcast from. Used in conjunction with "netmask" to calculate a "broadcastAddress" if none was provided explicitly.
     * @param {string} options.netmask Local IP netmask. Used in conjunction with "localAddress" to calculate a "broadcastAddress" if none was provided explicitly.
     * @param {number} options.broadcastPort Port number to broadcast to. Defaults to 7053.
     * @param {number} options.tries Number of broadcasts to send. Defaults to 3.
     * @param {number} options.timeout Time between broadcast tries. Defaults to 500.
     * @param {function} options.fetchCallback Callback to fetch information about the device.
     * @returns { Promise } A Promise that resolves to an array of Promises resolving to the fetched device information.
     */
    static async sendBroadcast(options) {
        options = applyDefaultOptions({}, options, {
            broadcastAddress: null,
            localAddress: null,
            netmask: null,
            broadcastPort: 7053,
            tries: 3,
            timeout: 500,
            fetchCallback: undefined,
        });

        if (options.fetchCallback === undefined) {
            options.fetchCallback = function(address) {
                return TcpDataSourceProvider.fetchDeviceInformation({
                    hostname: address,
                    family: 4,
                });
            };
        }

        if (options.broadcastAddress) {
            // nop, already set
        } else if (options.localAddress && options.netmask) {
            options.broadcastAddress = calculateIpV4BroadcastAddress(options.localAddress, options.netmask);
        } else {
            options.broadcastAddress = '255.255.255.255';
        }

        const bcastAddress = options.broadcastAddress;
        const bcastPort = options.broadcastPort;

        const queryString = '---RESOL-BROADCAST-QUERY---';
        const replyString = '---RESOL-BROADCAST-REPLY---';

        const socket = dgram.createSocket('udp4');

        socket.on('error', (err) => {
            socket.close();

            console.log(err);
        });

        const addressList = [];

        socket.on('message', (msg, rinfo) => {
            if ((rinfo.family === 'IPv4') && (rinfo.port === 7053) && (msg.length >= replyString.length)) {
                const msgString = msg.slice(0, replyString.length).toString();
                if (msgString === replyString) {
                    const { address } = rinfo;
                    if (addressList.indexOf(address) < 0) {
                        addressList.push(address);
                    }
                }
            }
        });

        await promisify(cb => socket.bind(0, cb));

        socket.setBroadcast(true);

        for (let tries = 0; tries < options.tries; tries++) {
            const queryBuffer = Buffer.from(queryString);
            socket.send(queryBuffer, 0, queryBuffer.length, bcastPort, bcastAddress);

            await promisify(cb => setTimeout(cb, options.timeout));
        }

        socket.close();

        const result = addressList.map(async (address) => {
            return options.fetchCallback(address);
        });

        return result;
    }

    /**
     * Fetch device information using the `/cgi-bin/get_resol_device_information` web API.
     *
     * @param {string | object} addressOrOptions Either the IPv4 address as a string or an object for `http.get(options)`.
     * @returns {Promise} A Promise that resolves to the parsed device information.
     */
    static async fetchDeviceInformation(addressOrOptions, port) {
        if (port === undefined) {
            try {
                return await TcpDataSourceProvider.fetchDeviceInformation(addressOrOptions, 80);
            } catch (err) {
                return await TcpDataSourceProvider.fetchDeviceInformation(addressOrOptions, 3000);
            }
        } else {
            let options;
            if (typeof addressOrOptions === 'string') {
                options = {
                    hostname: addressOrOptions,
                };
            } else {
                options = addressOrOptions;
            }

            options = {
                port,
                path: '/cgi-bin/get_resol_device_information',
                ...options,
            };

            return new Promise((resolve, reject) => {
                const req = http.get(options, (res) => {
                    if (res.statusCode === 200) {
                        let buffer = Buffer.alloc(0);

                        res.on('data', (chunk) => {
                            buffer = Buffer.concat([ buffer, chunk ]);
                        });

                        res.on('end', () => {
                            const bodyString = buffer.toString();
                            const info = TcpDataSourceProvider.parseDeviceInformation(bodyString);
                            info.__address__ = options.hostname;
                            resolve(info);
                        });

                        res.on('error', (err) => {
                            reject(err);
                        });
                    } else {
                        reject(new Error('HTTP request returned status ' + res.statusCode));
                    }
                });

                req.on('error', (err) => {
                    reject(err);
                });

                req.setTimeout(10000, () => {
                    reject(new Error('HTTP request timed out'));
                });
            });
        }
    }

    static parseDeviceInformation(string) {
        const result = {};

        const re = /([\w]+)[\s]*=[\s]*"([^"\r\n]*)"/g;

        let md;
        while ((md = re.exec(string)) !== null) {
            result [md [1]] = md [2];
        }

        return result;
    }

}


Object.assign(TcpDataSourceProvider.prototype, /** @lends TcpDataSourceProvider.prototype */ {

    id: 'tcp-data-source-provider',

    name: 'TCP VBus Data Source Provider',

    description: 'Data source provider for TCP connected VBus devices',

    broadcastAddress: '255.255.255.255',

    broadcastPort: 7053,

});



module.exports = TcpDataSourceProvider;
