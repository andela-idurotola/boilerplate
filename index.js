global._ = require('lodash');
global.t = require('moment');

var cookieParser = require('cookie-parser'),
  Firebase = require("firebase"),
  env = process.env.NODE_ENV || 'development',
  // config = require('./config/config')[env],
  routes = require('./server/routes'),
  // routes = require('./server/routes.js');
  path = require('path'),
  express = require('express'),
  bodyParser = require('body-parser'),
  app = express();

  var rootRefUrl = 'my firebase rootRef';
  app.use(cookieParser());



  // things to do on each request
  app.use(function (req, res, next) {
    // log each request in development environment
    if(env !== 'production') console.log(t().format('HH:MM'), req.method, req.url, req.socket.bytesRead); 
    // tell the client what firebase to use
    res.cookie('rootRef', rootRefUrl);

    next();
  });

  // static files
  console.log('---------',__dirname);
  app.use(express.static(path.join(__dirname, 'public')));  
  // Standard error handling
  app.use(function(err, req, res, next){
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });
  
  // to support JSON-encoded bodies
  app.use(bodyParser.json());
  
  // to support URL-encoded bodies
  app.use(bodyParser.urlencoded({
    extended: true
  }));
 var data = 'Iyanu-Tomiwa';
  routes(app, data);  
  // app.get('/', routes.partials);

  var server = app.listen(process.env.PORT || 5000, function() {
    console.log('Listening on port %d', server.address().port);
  });

module.exports = app;


