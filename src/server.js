const express = require("express");
const redis = require("redis");

const app = express();
const redisClient = redis.createClient(); //create redis client 127.0.0.1 6379 default hostname and port

module.exports = { app, redisClient };
