'use strict';

var router = require('express').Router();

var uuid = require('node-uuid');

router.get('/current', function (req, res, next) {
  res.json({authorized: true, uuid: uuid.v1() });
});

module.exports = router;
