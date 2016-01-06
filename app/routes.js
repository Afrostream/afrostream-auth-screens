'use strict';

module.exports = function (app) {
  // REST
  app.use('/api/v1/screens', require('./api/v1/screens'));

  // All other routes should have a 404 (not found) message
  app.route('/*')
    .get(function (req, res) {
      res.status(404).send('Not found');
    });
};