'use strict';

process.env.NO_ASSERT = true; // enforce.

module.exports = {
  allowOrigin: '*',
  redisUrl: process.env.REDIS_URL
};