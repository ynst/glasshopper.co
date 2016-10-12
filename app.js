'use strict';

var path = require('path');
var express = require('express');
var session = require('express-session');
var MemcachedStore = require('connect-memcached')(session);
var passport = require('passport');
var config = require('./config');

var app = express();

var bodyParser = require('body-parser');

var jsonParser = bodyParser.json({ type: 'application/*+json'});

app.disable('etag');
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.set('trust proxy', true);

// [START session]
// Configure the session and session storage.
var sessionConfig = {
  resave: false,
  saveUninitialized: false,
  secret: config.get('SECRET'),
  signed: true
};

// In production use the App Engine Memcache instance to store session data,
// otherwise fallback to the default MemoryStore in development.
if (config.get('NODE_ENV') === 'production') {
  sessionConfig.store = new MemcachedStore({
    //hosts: [config.get('MEMCACHE_URL')]
    hosts: ['memcache:11211']
  });
}

app.use(session(sessionConfig));

app.use(bodyParser.urlencoded({extended: true}));
// [END session]
require('./lib/passport')(passport); // pass passport for configuration

// Passport is used instead of OAuth2
app.use(passport.initialize());
app.use(passport.session());
// app.use(require('./lib/oauth2').router);

app.use('/images', express.static('./images'));
app.use('/scripts', express.static('./scripts'));
app.use('/favicon.ico', express.static('./images/favicon.ico'));
app.use('/university-domains-list', express.static('./university-domains-list'));
app.use('/fonts', express.static('./fonts'));
app.use('/css', express.static('./css'));

app.locals.basedir = path.join(__dirname, '/');

// routes are in server/crud.js
app.use('/', require('./server/crud'));

app.get('/_ah/health', function(req, res) {
  res.send('OK')
});

// Basic 404 handler
app.use(function (req, res) {
  res.status(404).send('Not found')
});

// Error handler
app.use(function (err, req, res, next) {
  /* jshint unused:false */
  console.error(err);
  // If our routes specified a specific response, then send that. Otherwise,
  // send a generic message so as not to leak anything.
  res.status(500).send(err.response || 'Something broke!');
});

if (module === require.main) {
  // Start the server
  var server = app.listen(config.get('PORT'), function () {
    var port = server.address().port;
    console.log('App listening on port %s', port);
  });
}

module.exports = app;
