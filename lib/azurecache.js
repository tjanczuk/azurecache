var edge = require('edge');

var createDataCache = edge.func({
    references: [ 
        __dirname + '\\..\\bin\\Microsoft.WindowsAzure.Caching.2.1.0.0\\lib\\net40-full\\Microsoft.ApplicationServer.Caching.Client.dll',
        __dirname + '\\..\\bin\\Microsoft.WindowsAzure.Caching.2.1.0.0\\lib\\net40-full\\Microsoft.ApplicationServer.Caching.Core.dll' 
    ],
    source: function () {/*
        using Microsoft.ApplicationServer.Caching;

        async (dynamic options) => {
            var config = new DataCacheFactoryConfiguration() {
                AutoDiscoverProperty = new DataCacheAutoDiscoverProperty(true, (string)options.identifier),
                SecurityProperties = new DataCacheSecurity((string)options.token, false)
            };
            var factory = new DataCacheFactory(config);
            var client = factory.GetDefaultCache();

            return new {
                put = (Func<object,Task<object>>)(async (dynamic input) => {
                    await Task.Run(() => {
                        client.Put((string)input.key, (string)input.value, TimeSpan.FromSeconds((double)input.ttl));
                    });
                    return null;
                }),
                get = (Func<object,Task<object>>)(async (dynamic input) => {
                    return await Task.Run<object>(async () => {
                        return (string)client.Get((string)input.key);
                    });
                }),
                remove = (Func<object,Task<object>>)(async (dynamic input) => {
                    return await Task.Run<bool>(async () => {
                        return (bool)client.Remove((string)input.key);
                    });
                })
            };
        }
    */}
});

var oneDay = 24 * 3600; // Default TTL in seconds

var create = function (options) {
    options = options || {};
    options.identifier = options.identifier || process.env.AZURE_CACHE_IDENTIFIER;
    if (typeof options.identifier !== 'string')
        throw new Error('The options.identifier must be a string.');
    options.token = options.token || process.env.AZURE_CACHE_TOKEN;
    if (typeof options.token !== 'string')
        throw new Error('The options.token must be a string.');

    var dataCache = createDataCache(options, true);

    return {
        put: function (key, value, ttl, callback) {
            if (isNaN(ttl)) {
                callback = ttl;
                ttl = +process.env.AZURE_CACHE_TTL_SECONDS || oneDay;
            }

            dataCache.put({ key: key, value: JSON.stringify(value), ttl: ttl }, callback);
        },
        get: function (key, callback) {
            dataCache.get({ key: key }, function (error, data) {
                if (typeof callback === 'function') {
                    if (error) {
                        callback(error);
                    }
                    else if (typeof data !== 'string') {
                        callback(null, data);
                    }
                    else {
                        try {
                            data = JSON.parse(data);
                        }
                        catch (e) {
                            error = e;
                        }

                        callback(error, data);
                    }
                }
            });
        },
        remove: function (key, callback) {
            dataCache.remove({ key: key }, callback);
        },        
    }
};

module.exports = function (connect) {

    function AzureCacheStore(options) {
        this._cache = create(options);
        if (options && !isNaN(options.ttl)) {
            this.ttl = options.ttl;
        }
    };

    AzureCacheStore.prototype.__proto__ = connect.session.Store.prototype;

    AzureCacheStore.prototype.get = function (sid, callback) {
        this._cache.get(sid, callback);
    };

    AzureCacheStore.prototype.set = function (sid, session, callback) {
        var ttl = this.ttl;
        if (typeof session.cookie.maxAge === 'number') {
            ttl = session.cookie.maxAge / 1000;
        }

        if (typeof ttl === 'number') {
            this._cache.put(sid, session, ttl, callback);
        }
        else {
            this._cache.put(sid, session, callback);
        }
    };

    AzureCacheStore.prototype.destroy = function (sid, callback) {
        this._cache.remove(sid, callback);
    };    

    return AzureCacheStore;
};

module.exports.create = create;
