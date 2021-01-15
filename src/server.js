const express = require("express");
const redis = require("async-redis");

const app = express();
const redisClient = redis.createClient({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: 6379,
}); //create redis client 127.0.0.1 6379 default hostname and port

module.exports = { app, redisClient };
