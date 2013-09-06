// Before running this sample, set AZURE_CACHE_IDENTIFIER and AZURE_CACHE_TOKEN environment variables
// using information from the Windows Azure management portal, e.g.
// set AZURE_CACHE_IDENTIFIER=tjanczuk.cache.windows.net
// set AZURE_CACHE_TOKEN=YWNzOmh0dHBzOi8vdGphbmN6dWs5MjU1LWNhY2hlLmFjY2Vzc2NvbnRyb2wud2luZG93cy5uZXQvL1dSQVB2MC45LyZvd25lciAzcHJsSTRueUJLajk1cnJoZkNOKnZNRVZaUktISjB5L1BwL3MvTnNpZXZRPSZodHRwOi8vdGphbmN6dWsuY2FjaGUud2luZG93cy5uZXQv

var express = require('express')
	, AzureCacheStore = require('../lib/azurecache')(express);

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
