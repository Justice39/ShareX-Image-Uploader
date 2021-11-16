"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTime = exports.timeConvert = exports.getRandomStr = exports.redisClient = exports.port = exports.password = exports.fileFormat = void 0;
const config_json_1 = __importDefault(require("../config.json"));
const config = config_json_1.default;
exports.fileFormat = /\.(gif|jpg|jpeg|tiff|png)$/i;
exports.password = config.uploadKey || "upload_key";
exports.port = config.port || 1337;
exports.redisClient = config.redis;
function getRandomStr(characters, length) {
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
exports.getRandomStr = getRandomStr;
function timeConvert(time) {
    time = time.toString().match(/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];
    if (time.length > 1) {
        time = time.slice(1);
        time[5] = +time[0] < 12 ? 'AM' : 'PM';
        time[0] = +time[0] % 12 || 12;
    }
    return time.join('');
}
exports.timeConvert = timeConvert;
function getTime() {
    const d = new Date(Date.now());
    const month = d.getMonth() + 1 < 10 ? `0${d.getMonth() + 1}` : d.getMonth() + 1;
    const day = d.getDate() < 10 ? `0${d.getDate()}` : d.getDate();
    let date = `${month}/${day}/${d.getFullYear()}`;
    date += ` - ${timeConvert(`${d.getUTCHours()}:${d.getMinutes()}`)}`;
    return date;
}
exports.getTime = getTime;
