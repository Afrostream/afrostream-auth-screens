'use strict';

var compression = require('compression');

var config = rootRequire('/config');

/**
 * setting up express app middlewares
 * @param app
 */
module.exports = function (app) {
  // first middleware : are we overloaded ?
  if (process.env.NODE_ENV !== 'test') {
    app.use(rootRequire('/lib/middleware-toobusy')());
  }

  // req.error error handler
  app.use(rootRequire('/lib/middleware-error')());

  //
  app.use(compression());

  //
  app.use(rootRequire('/lib/middleware-allowcrossdomain')({allowOrigin: config.allowOrigin}));
  app.use(rootRequire('/lib/middleware-jsoncontenttype')());

  // default error handlers
  app.use(function (err, req, res, next) {
    console.error('default error handler', err);
    res.error(err);
  });
};