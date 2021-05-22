/*! resol-vbus | Copyright (c) 2013-2018, Daniel Wippermann | MIT license */
'use strict';



const {
    Connection,
    TcpConnection,
    TcpConnectionEndpoint,
} = require('./resol-vbus');


const jestExpect = global.expect;
const expect = require('./expect');
const _ = require('./lodash');
const {
    expectPromiseToReject,
    itShouldWorkCorrectlyAfterMigratingToClass,
} = require('./test-utils');



const testConnection = async function(callback) {
    const endpoint = new TcpConnectionEndpoint({
        port: 0,
    });

    const infos = [];

    const onConnection = function(info) {
        infos.push(info);
    };

    endpoint.on('connection', onConnection);

    let onEpiConnection;

    const createEndpointInfoPromise = function() {
        return new Promise((resolve) => {
            if (onEpiConnection) {
                endpoint.removeListener('connection', onEpiConnection);
            }

            onEpiConnection = function(info) {
                onEpiConnection = null;

                resolve(info);
            };

            endpoint.once('connection', onEpiConnection);
        });
    };

    const connection = new TcpConnection({
        host: '127.0.0.1',
    });

    try {
        await endpoint.start();

        connection.port = endpoint.port;

        expect(connection.connectionState).to.equal(TcpConnection.STATE_DISCONNECTED);

        return await callback(connection, endpoint, createEndpointInfoPromise);
    } finally {
        connection.disconnect();
        endpoint.stop();

        _.forEach(infos, (info) => {
            info.socket.end();
        });

        if (onEpiConnection) {
            endpoint.removeListener('connection', onEpiConnection);
        }

        endpoint.removeListener('connection', onConnection);
    }
};



describe('TcpConnection', () => {

    describe('constructor', () => {

        it('should be a constructor function', () => {
            expect(TcpConnection).to.be.a('function');
        });

        it('should have reasonable defaults', () => {
            const connection = new TcpConnection();

            expect(connection.host).to.equal(null);
            expect(connection.port).to.equal(7053);
            expect(connection.viaTag).to.equal(null);
            expect(connection.password).to.equal(null);
            expect(connection.channelListCallback).to.equal(null);
            expect(connection.channel).to.equal(0);
            expect(connection.rawVBusDataOnly).to.equal(false);
        });

        it('should copy selected options', () => {
            const options = {
                host: 'HOST',
                port: 12345,
                viaTag: 'VIATAG',
                password: 'PASSWORD',
                channelListCallback: async () => '9',
                channel: '9',
                rawVBusDataOnly: true,
                junk: 'JUNK',
            };

            const connection = new TcpConnection(options);

            expect(connection.host).to.equal(options.host);
            expect(connection.port).to.equal(options.port);
            expect(connection.viaTag).to.equal(options.viaTag);
            expect(connection.password).to.equal(options.password);
            expect(connection.channelListCallback).to.equal(options.channelListCallback);
            expect(connection.channel).to.equal(options.channel);
            expect(connection.rawVBusDataOnly).to.equal(options.rawVBusDataOnly);
            expect(connection.junk).to.equal(undefined);
        });

    });

    describe('#connect', () => {

        it('should be a method', () => {
            expect(TcpConnection.prototype).to.have.a.property('connect').that.is.a('function');
        });

        it('should work correctly if disconnected', () => {
            return testConnection(async (connection, endpoint, createEndpointInfoPromise) => {
                const onConnectionState = sinon.spy();

                const options = {
                    viaTag: 'VIATAG',
                    password: 'PASSWORD',
                    channel: 9,
                };

                _.extend(connection, options);

                connection.on('connectionState', onConnectionState);

                const epiPromise = createEndpointInfoPromise();

                try {
                    await connection.connect();

                    const epi = await epiPromise;

                    expect(connection.connectionState).to.equal(TcpConnection.STATE_CONNECTED);
                    expect(onConnectionState.callCount).to.equal(2);
                    expect(onConnectionState.firstCall.args [0]).to.equal(TcpConnection.STATE_CONNECTING);
                    expect(onConnectionState.secondCall.args [0]).to.equal(TcpConnection.STATE_CONNECTED);

                    expect(epi.viaTag).to.equal(options.viaTag);
                    expect(epi.password).to.equal(options.password);
                    expect(epi.channel).to.equal('9');
                } finally {
                    connection.removeListener('connectionState', onConnectionState);
                }
            });
        });

        it('should work correctly with sync channelListCallback and string response', () => {
            return testConnection(async (connection, endpoint, createEndpointInfoPromise) => {
                const onConnectionState = sinon.spy();

                const options = {
                    viaTag: 'VIATAG',
                    password: 'PASSWORD',
                    channelListCallback: sinon.spy((channels, done) => {
                        done(null, '9:Test');
                    }),
                };

                _.extend(connection, options);

                connection.on('connectionState', onConnectionState);

                const epiPromise = createEndpointInfoPromise();

                try {
                    await connection.connect();

                    const epi = await epiPromise;

                    expect(connection.connectionState).to.equal(TcpConnection.STATE_CONNECTED);
                    expect(onConnectionState.callCount).to.equal(2);
                    expect(onConnectionState.firstCall.args [0]).to.equal(TcpConnection.STATE_CONNECTING);
                    expect(onConnectionState.secondCall.args [0]).to.equal(TcpConnection.STATE_CONNECTED);

                    expect(epi.viaTag).to.equal(options.viaTag);
                    expect(epi.password).to.equal(options.password);
                    expect(epi.channel).to.equal('9');

                    expect(connection.channelListCallback.callCount).to.equal(1);
                } finally {
                    connection.removeListener('connectionState', onConnectionState);
                }
            });
        });

        it('should work correctly with sync, but delayed channelListCallback', () => {
            return testConnection(async (connection, endpoint, createEndpointInfoPromise) => {
                const onConnectionState = sinon.spy();

                const options = {
                    viaTag: 'VIATAG',
                    password: 'PASSWORD',
                    channelListCallback: sinon.spy((channels, done) => {
                        process.nextTick(() => {
                            done(null, '9:Test');
                        });
                    }),
                };

                _.extend(connection, options);

                connection.on('connectionState', onConnectionState);

                const epiPromise = createEndpointInfoPromise();

                try {
                    await connection.connect();

                    const epi = await epiPromise;

                    expect(connection.connectionState).to.equal(TcpConnection.STATE_CONNECTED);
                    expect(onConnectionState.callCount).to.equal(2);
                    expect(onConnectionState.firstCall.args [0]).to.equal(TcpConnection.STATE_CONNECTING);
                    expect(onConnectionState.secondCall.args [0]).to.equal(TcpConnection.STATE_CONNECTED);

                    expect(epi.viaTag).to.equal(options.viaTag);
                    expect(epi.password).to.equal(options.password);
                    expect(epi.channel).to.equal('9');

                    expect(connection.channelListCallback.callCount).to.equal(1);
                } finally {
                    connection.removeListener('connectionState', onConnectionState);
                }
            });
        });

        it('should work correctly with async channelListCallback and number response', () => {
            return testConnection(async (connection, endpoint, createEndpointInfoPromise) => {
                const onConnectionState = sinon.spy();

                const options = {
                    viaTag: 'VIATAG',
                    password: 'PASSWORD',
                    channelListCallback: sinon.spy(async (channels) => {
                        return 9;
                    }),
                };

                _.extend(connection, options);

                connection.on('connectionState', onConnectionState);

                const epiPromise = createEndpointInfoPromise();

                try {
                    await connection.connect();

                    const epi = await epiPromise;

                    expect(connection.connectionState).to.equal(TcpConnection.STATE_CONNECTED);
                    expect(onConnectionState.callCount).to.equal(2);
                    expect(onConnectionState.firstCall.args [0]).to.equal(TcpConnection.STATE_CONNECTING);
                    expect(onConnectionState.secondCall.args [0]).to.equal(TcpConnection.STATE_CONNECTED);

                    expect(epi.viaTag).to.equal(options.viaTag);
                    expect(epi.password).to.equal(options.password);
                    expect(epi.channel).to.equal('9');

                    expect(connection.channelListCallback.callCount).to.equal(1);
                } finally {
                    connection.removeListener('connectionState', onConnectionState);
                }
            });
        });

        it('should work correctly with async channelListCallback and object response', () => {
            return testConnection(async (connection, endpoint, createEndpointInfoPromise) => {
                const onConnectionState = sinon.spy();

                const options = {
                    viaTag: 'VIATAG',
                    password: 'PASSWORD',
                    channelListCallback: sinon.spy(async (channels) => {
                        return { channel: 0, someOtherOptionsThatWillBeIgnored: true };
                    }),
                };

                _.extend(connection, options);

                connection.on('connectionState', onConnectionState);

                const epiPromise = createEndpointInfoPromise();

                try {
                    await connection.connect();

                    const epi = await epiPromise;

                    expect(connection.connectionState).to.equal(TcpConnection.STATE_CONNECTED);
                    expect(onConnectionState.callCount).to.equal(2);
                    expect(onConnectionState.firstCall.args [0]).to.equal(TcpConnection.STATE_CONNECTING);
                    expect(onConnectionState.secondCall.args [0]).to.equal(TcpConnection.STATE_CONNECTED);

                    expect(epi.viaTag).to.equal(options.viaTag);
                    expect(epi.password).to.equal(options.password);
                    expect(epi.channel).to.equal(undefined);

                    expect(connection.channelListCallback.callCount).to.equal(1);
                } finally {
                    connection.removeListener('connectionState', onConnectionState);
                }
            });
        });

        it('should work correctly with async channelListCallback and error response', () => {
            return testConnection(async (connection, endpoint, createEndpointInfoPromise) => {
                const onConnectionState = sinon.spy();

                const options = {
                    viaTag: 'VIATAG',
                    password: 'PASSWORD',
                    channelListCallback: sinon.spy(async (channels) => {
                        throw new Error('No suitable channel found');
                    }),
                };

                _.extend(connection, options);

                connection.on('connectionState', onConnectionState);

                try {
                    await connection.connect().then(() => {
                        jestExpect(() => {}).toThrow();
                    }, err => {
                        jestExpect(err.message).toBe('No suitable channel found');
                    });

                    expect(connection.connectionState).to.equal(TcpConnection.STATE_DISCONNECTED);
                    expect(onConnectionState.callCount).to.equal(2);
                    expect(onConnectionState.firstCall.args [0]).to.equal(TcpConnection.STATE_CONNECTING);
                    expect(onConnectionState.secondCall.args [0]).to.equal(TcpConnection.STATE_DISCONNECTED);

                    expect(connection.channelListCallback.callCount).to.equal(1);
                } finally {
                    connection.removeListener('connectionState', onConnectionState);
                }
            });
        });

        it('should throw if not disconnected', () => {
            return testConnection(async (connection, endpoint) => {
                await connection.connect();

                await expectPromiseToReject(connection.connect());
            });
        });

    });

    describe('#disconnect', () => {

        it('should be a method', () => {
            expect(TcpConnection.prototype).to.have.a.property('disconnect').that.is.a('function');
        });

        it('should work correctly if disconnected', () => {
            return testConnection((connection) => {
                connection.disconnect();

                expect(connection.connectionState).to.equal(TcpConnection.STATE_DISCONNECTED);
            });
        });

        it('should work correctly if connected', () => {
            return testConnection(async (connection) => {
                const onConnectionState = sinon.spy();

                connection.on('connectionState', onConnectionState);

                try {
                    await connection.connect();

                    await connection.disconnect();
                } finally {
                    connection.removeListener('connectionState', onConnectionState);
                }
            });
        });

    });

    describe('Automatic reconnection', () => {

        it('should reconnect when connected', () => {
            return testConnection(async (connection, endpoint, createEndpointInfoPromise) => {
                const onConnectionState = sinon.spy();

                connection.on('connectionState', onConnectionState);

                let epiPromise = createEndpointInfoPromise();

                try {
                    await connection.connect();

                    const epi = await epiPromise;

                    expect(onConnectionState.callCount).to.equal(2);
                    expect(onConnectionState.firstCall.args [0]).to.equal(TcpConnection.STATE_CONNECTING);
                    expect(onConnectionState.secondCall.args [0]).to.equal(TcpConnection.STATE_CONNECTED);

                    epiPromise = createEndpointInfoPromise();

                    epi.socket.end();

                    await epiPromise;

                    expect(onConnectionState.callCount).to.equal(4);
                    expect(onConnectionState.getCall(2).args [0]).to.equal(TcpConnection.STATE_INTERRUPTED);
                    expect(onConnectionState.getCall(3).args [0]).to.equal(TcpConnection.STATE_RECONNECTING);

                    await connection.disconnect();
                } finally {
                    connection.removeListener('connectionState', onConnectionState);
                }
            });

        });

    });

    itShouldWorkCorrectlyAfterMigratingToClass(TcpConnection, Connection, {
        host: null,
        port: null,
        viaTag: null,
        password: null,
        channelListCallback: null,
        channel: 0,
        rawVBusDataOnly: false,
        tlsOptions: null,
        reconnectTimeout: 0,
        reconnectTimeoutIncr: 10000,
        reconnectTimeoutMax: 60000,
        constructor: Function,
        connect: Function,
        disconnect: Function,
        _connect: Function,
    }, {

    });

});
