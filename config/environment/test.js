'use strict';

var debugSql = ((process.env.NODE_DEBUG||'').indexOf('sql') !== -1);

module.exports = {
  allowOrigin: '*',
  redisUrl: undefined // default configuration (local redis server)
};