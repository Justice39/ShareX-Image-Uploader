"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hgetall = exports.hmset = void 0;
const redis_1 = __importDefault(require("redis"));
const constants_1 = require("./constants");
const client = redis_1.default.createClient({
    url: constants_1.redisClient.url,
    port: constants_1.redisClient.port,
    password: constants_1.redisClient.password
});
function hmset(key, value) {
    return new Promise((res, rej) => client.hmset(key, value, (err, val) => {
        if (err)
            rej(err);
        else
            res(val);
    }));
}
exports.hmset = hmset;
function hgetall(key) {
    return new Promise((res, rej) => client.hgetall(key, (err, val) => {
        if (err)
            rej(err);
        else
            res(val);
    }));
}
exports.hgetall = hgetall;
