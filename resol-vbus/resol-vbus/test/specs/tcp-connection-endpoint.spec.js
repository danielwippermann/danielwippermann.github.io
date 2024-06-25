/*! resol-vbus | Copyright (c) 2013-present, Daniel Wippermann | MIT license */

const { EventEmitter } = require('events');
const net = require('net');


const {
    TcpConnection,
    TcpConnectionEndpoint,
} = require('./resol-vbus');


const {
    expect,
    expectOwnPropertyNamesToEqual,
    expectPromise,
    itShouldBeAClass,
} = require('./test-utils');



describe('TcpConnectionEndpoint', () => {

    itShouldBeAClass(TcpConnectionEndpoint, EventEmitter, {
        port: 7053,
        channels: null,
        server: null,
        constructor: Function,
        start: Function,
        stop: Function,
        _onConnection: Function,
    }, {

    });

    describe('#constructor', () => {

        it('should have reasonable defaults', () => {
            const ep = new TcpConnectionEndpoint();

            expectOwnPropertyNamesToEqual(ep, [
                'port',
                'verifyViaTag',
                'password',
                'verifyPassword',
                'channels',
                'verifyChannel',
                'verifyDataMode',
            ], [
                // base class related
                '_events',
                '_eventsCount',
                '_maxListeners',
            ]);

            expect(ep.port).toBe(7053);
            expect(ep.verifyViaTag).toBe(null);
            expect(ep.password).toBe(null);
            expect(ep.verifyPassword).toBe(null);
            expect(ep.channels).toEqual([ 'VBus' ]);
            expect(ep.verifyChannel).toBe(null);
            expect(ep.verifyDataMode).toBe(null);
        });

        it('should copy selected options', () => {
            const verifyViaTag = () => {};
            const verifyPassword = () => {};
            const verifyChannel = () => {};
            const verifyDataMode = () => {};

            const options = {
                port: 12345,
                verifyViaTag,
                password: 'vbus',
                verifyPassword,
                channels: [ 'VBus 1', 'VBus 2' ],
                verifyChannel,
                verifyDataMode,
                junk: 'DO NOT COPY ME',
            };

            const ep = new TcpConnectionEndpoint(options);

            expect(ep.port).toBe(options.port);
            expect(ep.verifyViaTag).toBe(verifyViaTag);
            expect(ep.password).toBe(options.password);
            expect(ep.verifyPassword).toBe(verifyPassword);
            expect(ep.channels).toBe(options.channels);
            expect(ep.verifyChannel).toBe(verifyChannel);
            expect(ep.verifyDataMode).toBe(verifyDataMode);
            expect(ep.junk).toBe(undefined);
        });

    });

    describe('#start', () => {

        it('should work correctly', async () => {
            const ep = new TcpConnectionEndpoint({
                port: 7053,
            });

            try {
                await expectPromise(ep.start());

                expect(ep.server).toBeTruthy();
                expect(ep.port).toBeGreaterThan(0);
            } finally {
                ep.stop();
            }
        });

        it('should work correctly with randomly selected port', async () => {
            const ep = new TcpConnectionEndpoint({
                port: 0,
            });

            try {
                await expectPromise(ep.start());

                expect(ep.server).toBeTruthy();
                expect(ep.port).toBeGreaterThan(0);
            } finally {
                ep.stop();
            }
        });

        it('should fail correctly if port is in use', async () => {
            const ep1 = new TcpConnectionEndpoint({
                port: 0,
            });

            try {
                await expectPromise(ep1.start());

                const ep2 = new TcpConnectionEndpoint({
                    port: ep1.port,
                });

                try {
                    await expect(async () => {
                        await ep2.start();
                    }).rejects.toThrow('EADDRINUSE');
                } finally {
                    ep2.stop();
                }
            } finally {
                ep1.stop();
            }
        });

    });

    describe('#stop', () => {

        it('should work correctly', async () => {
            const ep = new TcpConnectionEndpoint({
                port: 0,
            });

            try {
                await expectPromise(ep.start());

                expect(ep.server).toBeTruthy();
                expect(ep.port).toBeGreaterThan(0);
            } finally {
                ep.stop();
            }

            ep.stop();
        });

    });

    describe('integration tests', () => {

        async function runTestableEndpointAndSocket(fn) {
            let ep, socket;
            try {
                ep = new TcpConnectionEndpoint({
                    port: 0,
                });

                await ep.start();

                socket = await new Promise(resolve => {
                    const socket = net.createConnection(ep.port, '127.0.0.1', () => {
                        resolve(socket);
                    });
                });

                async function read() {
                    return await new Promise(resolve => {
                        socket.once('data', chunk => {
                            resolve(chunk);
                        });
                    });
                }

                await fn({ ep, socket, read });
            } finally {
                if (socket) {
                    socket.destroy();
                }

                if (ep) {
                    ep.stop();
                }
            }
        }

        async function runTestableEndpointAndConnection(fn) {
            let ep, conn;
            try {
                ep = new TcpConnectionEndpoint({
                    port: 0,
                });

                await ep.start();

                conn = new TcpConnection({
                    host: '127.0.0.1',
                    port: ep.port,
                });

                await fn({ ep, conn });
            } finally {
                if (conn) {
                    conn.disconnect();
                }

                if (ep) {
                    ep.stop();
                }
            }
        }

        it('should work correctly', async () => {
            await runTestableEndpointAndConnection(async ({ ep, conn }) => {
                ep.channels = [ null, 'VBus 1', 'VBus 2' ];

                conn.viaTag = 'via';

                conn.channelListCallback = async function(channels) {
                    return channels [0];
                };

                conn.channel = 1;

                await conn.connect();
            });
        });

        it('should work correctly with fragmented commands', async () => {
            await runTestableEndpointAndSocket(async ({ ep, socket, read }) => {
                const endPromise = new Promise(resolve => {
                    socket.once('end', () => {
                        resolve();
                    });
                });

                const buffer1 = await read();

                expect(buffer1.toString()).toBe('+HELLO: This is TcpConnectionEndpoint, at your service!\r\n');

                socket.write('PASS');

                // await new Promise(resolve => process.nextTick(resolve));
                await new Promise(resolve => setTimeout(resolve, 0));

                socket.write(' pass\r\n');

                const buffer2 = await read();

                expect(buffer2.toString()).toBe('+OK\r\n');

                socket.write('UNKNOWN\r\n');

                const buffer3 = await read();

                expect(buffer3.toString()).toBe('-ERROR: "Error: Unknown command"\r\n');

                socket.write('QUIT\r\n');

                await endPromise;
            });
        });

        it('should work correctly after DATA command', async () => {
            await runTestableEndpointAndSocket(async ({ ep, socket, read }) => {
                const endPromise = new Promise(resolve => {
                    socket.once('end', () => {
                        resolve();
                    });
                });

                const buffer1 = await read();

                expect(buffer1.toString()).toBe('+HELLO: This is TcpConnectionEndpoint, at your service!\r\n');

                socket.write('DATA\r\n');

                const buffer2 = await read();

                expect(buffer2.toString()).toBe('+OK\r\n');

                socket.write('....');

                socket.end();

                await endPromise;
            });
        });

        it('should work correctly with a resolving viaTag verifier', async () => {
            await runTestableEndpointAndSocket(async ({ ep, socket, read }) => {
                const endPromise = new Promise(resolve => {
                    socket.once('end', () => {
                        resolve();
                    });
                });

                ep.verifyViaTag = async function(viaTag) {
                    expect(this).toBe(ep);
                    expect(viaTag).toBe('expectedViaTag');
                };

                const buffer1 = await read();

                expect(buffer1.toString()).toBe('+HELLO: This is TcpConnectionEndpoint, at your service!\r\n');

                socket.write('CONNECT expectedViaTag\r\n');

                const buffer2 = await read();

                expect(buffer2.toString()).toBe('+OK\r\n');

                socket.end();

                await endPromise;
            });
        });

        it('should work correctly with a rejecting viaTag verifier', async () => {
            await runTestableEndpointAndSocket(async ({ ep, socket, read }) => {
                const onConnectionAttemptFailed = jest.fn();

                ep.on('connectionAttemptFailed', onConnectionAttemptFailed);

                const endPromise = new Promise(resolve => {
                    socket.once('end', () => {
                        resolve();
                    });
                });

                ep.verifyViaTag = async function(viaTag) {
                    throw new Error(`Unknown viaTag: ${viaTag}`);
                };

                const buffer1 = await read();

                expect(buffer1.toString()).toBe('+HELLO: This is TcpConnectionEndpoint, at your service!\r\n');

                socket.write('CONNECT unknownViaTag\r\n');

                const buffer2 = await read();

                expect(buffer2.toString()).toBe('-ERROR: "Error: Unknown viaTag: unknownViaTag"\r\n');

                socket.end();

                expect(onConnectionAttemptFailed.mock.calls).toHaveLength(1);
                expect(onConnectionAttemptFailed.mock.calls [0]).toHaveLength(1);

                const ev1 = onConnectionAttemptFailed.mock.calls [0] [0];

                expectOwnPropertyNamesToEqual(ev1, [
                    'ip',
                    'port',
                    'family',
                    'error',
                ]);
                expect(typeof ev1.ip).toBe('string');
                expect(typeof ev1.port).toBe('number');
                expect(ev1.family).toBe('IPv6');
                expect(ev1.error.message).toBe('Unknown viaTag: unknownViaTag');

                await endPromise;
            });
        });

        it('should work correctly for matching passwords', async () => {
            let ep, conn;
            try {
                ep = new TcpConnectionEndpoint({
                    port: 0,
                    password: 's3cr3t',
                });

                await ep.start();

                conn = new TcpConnection({
                    host: '127.0.0.1',
                    port: ep.port,
                    password: 's3cr3t',
                });

                await conn.connect();
            } finally {
                if (conn) {
                    conn.disconnect();
                }

                if (ep) {
                    ep.stop();
                }
            }
        });

        it('should work correctly for mismatching passwords', async () => {
            let ep, conn;
            try {
                ep = new TcpConnectionEndpoint({
                    port: 0,
                    password: 's3cr3t',
                });

                await ep.start();

                conn = new TcpConnection({
                    host: '127.0.0.1',
                    port: ep.port,
                    password: 'h8xx0r',
                });

                await expect(() => conn.connect()).rejects.toThrow('Remote side responded with "-ERROR: \\"Error: Password mismatch\\""');
            } finally {
                if (conn) {
                    conn.disconnect();
                }

                if (ep) {
                    ep.stop();
                }
            }
        });

        it('should work correctly with a resolving password verifier', async () => {
            await runTestableEndpointAndSocket(async ({ ep, socket, read }) => {
                const endPromise = new Promise(resolve => {
                    socket.once('end', () => {
                        resolve();
                    });
                });

                ep.verifyPassword = async function(password) {
                    expect(this).toBe(ep);
                    expect(password).toBe('expectedPassword');
                };

                const buffer1 = await read();

                expect(buffer1.toString()).toBe('+HELLO: This is TcpConnectionEndpoint, at your service!\r\n');

                socket.write('PASS expectedPassword\r\n');

                const buffer2 = await read();

                expect(buffer2.toString()).toBe('+OK\r\n');

                socket.end();

                await endPromise;
            });
        });

        it('should work correctly with a rejecting password verifier', async () => {
            await runTestableEndpointAndSocket(async ({ ep, socket, read }) => {
                const endPromise = new Promise(resolve => {
                    socket.once('end', () => {
                        resolve();
                    });
                });

                ep.verifyPassword = async function(viaTag) {
                    throw new Error('Password mismatch');
                };

                const buffer1 = await read();

                expect(buffer1.toString()).toBe('+HELLO: This is TcpConnectionEndpoint, at your service!\r\n');

                socket.write('PASS wrongPassword\r\n');

                const buffer2 = await read();

                expect(buffer2.toString()).toBe('-ERROR: "Error: Password mismatch"\r\n');

                socket.end();

                await endPromise;
            });
        });

        it('should work correctly for matching channels', async () => {
            let ep, conn;
            try {
                ep = new TcpConnectionEndpoint({
                    port: 0,
                    channels: [ null, 'VBus 1', 'VBus 2' ],
                });

                await ep.start();

                conn = new TcpConnection({
                    host: '127.0.0.1',
                    port: ep.port,
                    channel: 2,
                });

                await conn.connect();
            } finally {
                if (conn) {
                    conn.disconnect();
                }

                if (ep) {
                    ep.stop();
                }
            }
        });

        it('should work correctly for mismatching channels', async () => {
            let ep, conn;
            try {
                ep = new TcpConnectionEndpoint({
                    port: 0,
                    channels: [ null, 'VBus 1', 'VBus 2' ],
                });

                await ep.start();

                conn = new TcpConnection({
                    host: '127.0.0.1',
                    port: ep.port,
                    channel: 3,
                });

                await expect(() => conn.connect()).rejects.toThrow('Remote side responded with "-ERROR: \\"Error: Channel not available\\""');
            } finally {
                if (conn) {
                    conn.disconnect();
                }

                if (ep) {
                    ep.stop();
                }
            }
        });

        it('should work correctly with a resolving channel verifier', async () => {
            await runTestableEndpointAndSocket(async ({ ep, socket, read }) => {
                const endPromise = new Promise(resolve => {
                    socket.once('end', () => {
                        resolve();
                    });
                });

                ep.channels = [ null, null, null, 'Channel 3' ];

                ep.verifyChannel = async function(indexString, index, channel) {
                    expect(this).toBe(ep);
                    expect(indexString).toBe('3');
                    expect(index).toBe(3);
                    expect(channel).toBe('Channel 3');
                };

                const buffer1 = await read();

                expect(buffer1.toString()).toBe('+HELLO: This is TcpConnectionEndpoint, at your service!\r\n');

                socket.write('CHANNEL 3\r\n');

                const buffer2 = await read();

                expect(buffer2.toString()).toBe('+OK\r\n');

                socket.end();

                await endPromise;
            });
        });

        it('should work correctly with a rejecting channel verifier', async () => {
            await runTestableEndpointAndSocket(async ({ ep, socket, read }) => {
                const endPromise = new Promise(resolve => {
                    socket.once('end', () => {
                        resolve();
                    });
                });

                ep.channels = [ null, null, null, 'Channel 3' ];

                ep.verifyChannel = async function(indexString, index, channel) {
                    throw new Error(`Unknown channel: ${indexString} ${index} ${channel}`);
                };

                const buffer1 = await read();

                expect(buffer1.toString()).toBe('+HELLO: This is TcpConnectionEndpoint, at your service!\r\n');

                socket.write('CHANNEL 3\r\n');

                const buffer2 = await read();

                expect(buffer2.toString()).toBe('-ERROR: "Error: Unknown channel: 3 3 Channel 3"\r\n');

                socket.end();

                await endPromise;
            });
        });

        it('should work correctly with a resolving data mode verifier', async () => {
            await runTestableEndpointAndSocket(async ({ ep, socket, read }) => {
                const endPromise = new Promise(resolve => {
                    socket.once('end', () => {
                        resolve();
                    });
                });

                ep.channels = [ null, null, null, 'Channel 3' ];

                ep.verifyDataMode = async function(connectionInfo) {
                    expect(this).toBe(ep);
                    expect(connectionInfo.viaTag).toBe('viaTag');
                    expect(connectionInfo.password).toBe('password');
                    expect(connectionInfo.channel).toBe('3');
                };

                const buffer1 = await read();

                expect(buffer1.toString()).toBe('+HELLO: This is TcpConnectionEndpoint, at your service!\r\n');

                socket.write('CONNECT viaTag\r\n');

                const buffer2 = await read();

                expect(buffer2.toString()).toBe('+OK\r\n');

                socket.write('PASS password\r\n');

                const buffer3 = await read();

                expect(buffer3.toString()).toBe('+OK\r\n');

                socket.write('CHANNEL 3\r\n');

                const buffer4 = await read();

                expect(buffer4.toString()).toBe('+OK\r\n');

                socket.write('DATA\r\n');

                const buffer5 = await read();

                expect(buffer5.toString()).toBe('+OK\r\n');

                socket.end();

                await endPromise;
            });
        });

        it('should work correctly with a rejecting data mode verifier', async () => {
            await runTestableEndpointAndSocket(async ({ ep, socket, read }) => {
                const endPromise = new Promise(resolve => {
                    socket.once('end', () => {
                        resolve();
                    });
                });

                ep.verifyDataMode = async function() {
                    throw new Error('Data mode not allowed');
                };

                const buffer1 = await read();

                expect(buffer1.toString()).toBe('+HELLO: This is TcpConnectionEndpoint, at your service!\r\n');

                socket.write('DATA\r\n');

                const buffer2 = await read();

                expect(buffer2.toString()).toBe('-ERROR: "Error: Data mode not allowed"\r\n');

                socket.end();

                await endPromise;
            });
        });

    });

});
