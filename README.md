Access Windows Azure Cache Service from Node.js
====

The *azurecache* module allows you to use the Windows Azure Cache Service to store session state in Express applications. It also allows direct access to Windows Azure Cache Service from other Node.js applications. 

The *azurecache* module uses [Edge.js](http://tjanczuk.github.io/edge) and as such it currently only works on Windows. It is a great fit for storing session state of Express applications hosted in Windows Azure Web Sites. It is also a good choice for any other type of Node.js application hosted in Windows Azure that requires caching. 

### Express session state

First create your Windows Azure Cache Service instance following insturctions at [Scott Guthrie's blog](http://weblogs.asp.net/scottgu/archive/2013/09/03/windows-azure-new-distributed-dedicated-high-performance-cache-service-more-cool-improvements.aspx). You will end up with an *endpoint URL* of your cache service (e.g. *tjanczuk.cache.windows.net*) and an *access key* (a long Base64 encoded string). 

Then install the *azurecache* and *express* modules:

```
npm install azurecache
npm install express
```

Next author your Express application that uses the *azurecache* module to store Express session state in the Windows Azure Cache Service:

```javascript
var express = require('express')
    , AzureCacheStore = require('azurecache')(express);

var app = express();

app.use(express.cookieParser());
app.use(express.session({ store: new AzureCacheStore(), secret: 'abc!123' }));

app.get('/inc', function (req, res) {
    req.session.counter = (req.session.counter + 1) || 1;
    res.send(200, 'Increased sum: ' + req.session.counter);
});

app.get('/get', function (req, res) {
    res.send(200, 'Current sum: ' + req.session.counter);
});

app.listen(process.env.PORT || 3000);
```

Lastly set some environment variables and start your server:

```
set AZURE_CACHE_IDENTIFIER=&lt;your_azure_cache_endpoint_url&gt;
set AZURE_CACHE_TOKEN=&lt;your_azure_cache_access_key&gt;
node server.js
```

Every time you visit *http://localhost:3000/inc* in the browser you will receive an ever increasing counter value. When you visit *http://localhost:3000/get* you will receive the current counter value. The value of the counter is stored as part of the Express session state in the Windows Azure Cache Service with a default TTL of one day. 

### Customize Express session state

You can specify the credentials to the Windows Azure Cache Service either in code or via environment variables:

```javascript
var azureCacheOptions = {
    identifier: '&lt;your_endpoint_url&gt;', // or set the AZURE_CACHE_IDENTIFIER environment variable
    token: '&lt;your_access_key&gt;', // or set the AZURE_CACHE_TOKEN environment variable
    ttl: 3600 // optional TTL in seconds (default 1 day); you can also set the AZURE_CACHE_TTL environment variable
};

// ...

app.use(express.session({ store: new AzureCacheStore(azureCacheOptions), secret: 'abc!123' }));
```

### Use Windows Azure Cache Service directly

You can access Windows Azure Cache Service directly too:

```javascript
var azurecache = require('azurecache')

var cache = azurecache.create({
    identifier: '&lt;your_endpoint_url&gt;', // or set the AZURE_CACHE_IDENTIFIER environment variable
    token: '&lt;your_access_key&gt;', // or set the AZURE_CACHE_TOKEN environment variable
    ttl: 3600 // optional TTL in seconds (default 1 day); you can also set the AZURE_CACHE_TTL environment variable
});

cache.put('test1', { first: 'Tomasz', last: 'Janczuk' }, function (error) {
    if (error) throw error;
    cache.get('test1', function (error, data) {
        if (error) throw error;
        console.log('Data from cache:', data);
    });
});
```

### How

The *azurecache* module uses [Edge.js](http://tjanczuk.github.io/edge) to access the .NET client of the Windows Azure Cache Service that ships as a NuGet package. 

### More

I do take contributions. Feedback welcome (file an issue). Enjoy!


