"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_fileupload_1 = __importDefault(require("express-fileupload"));
const stream_1 = __importDefault(require("stream"));
const path_1 = __importDefault(require("path"));
const constants_1 = require("./util/constants");
const fs_1 = __importDefault(require("fs"));
const redis_1 = require("./util/redis");
const imagesPath = "\\images\\";
const app = express_1.default();
const folder = path_1.default.dirname(require.main.filename);
app.use(express_1.default.static(__dirname + '/ima1ges'));
app.use(express_fileupload_1.default());
app.post('/sharex/upload/', (req, res) => {
    if (!req.headers.password || req.headers.password !== constants_1.password)
        return res.status(401).send('You must provide valid password');
    const fileName = req.files.image.name;
    if (!req.files.image || !constants_1.fileFormat.test(fileName))
        return res.status(403).send('Invalid image/gif type');
    let string = "image_";
    string += constants_1.getRandomStr("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789", 10);
    const [, type] = constants_1.fileFormat.exec(fileName);
    const viewID = constants_1.getRandomStr("1234567890qwertyuopasdfghjklzxcvbnm", 10);
    const encrypted = req.connection.encrypted ? "https://" : "http://";
    try {
        const fullPath = folder + imagesPath + string + (type === 'gif' ? '.gif' : '.png');
        fs_1.default.writeFileSync(folder + imagesPath + string + (type === 'gif' ? '.gif' : '.png'), req.files.image.data);
        const date = constants_1.getTime();
        const randomColor = '#' + (Math.random() * 0xFFFFFF).toString(16).padStart(6, '0');
        redis_1.hmset(`images:${viewID}`, { ID: viewID, fileName: string + (type === 'gif' ? '.gif' : '.png'), path: fullPath, uploadTime: date, fullURL: `${encrypted}${req.headers.host}/images/${string}.${type}`, viewURL: `${encrypted}${req.headers.host}/?img=${viewID}`, host: `${encrypted}${req.headers.host}`, color: randomColor });
        res.writeHead(200, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ URL: `${encrypted}${req.headers.host}/?img=${viewID}`, host: `${encrypted}${req.headers.host}`,fullURL: `${encrypted}${req.headers.host}/images/${string}.${type}`}));
    }
    catch (err) {
        return res.status(500).send('Something went wrong.');
    }
});
app.get('/', async (req, res, next) => {
    const imgKey = req.query["img"];
    if (imgKey) {
        const data = await redis_1.hgetall("images:" + imgKey);
        if (!data)
            return res.send(`<h1>test</h1>`);
        const embed = `<html> <head> <meta charset="UTF-8"> <meta name="viewport" content="width=device-width"> <meta property="og:url" content="${data.host}/"> <meta property="og:title" content="Uploaded at: ${data.uploadTime}" /> <meta property="og:image" content="${data.fullURL}" /> <meta name="theme-color" content="${data.color}"> <meta name="twitter:card" content="summary_large_image"> </head> </html>`;
        res.send(`${embed}\n<h1>test</h1>`);
    }
    else
        res.send("<h1>test</h1>");
});
app.get("/images/:image", async (req, res, next) => {
    if (!req.params.image)
        return res.status(404).send('Invalid params');
    const fileName = req.params.image;
    const type = constants_1.fileFormat.exec(fileName);
    if (type == null || type.length == 0) {
        res.status(404).send(`Invalid type`);
    }
    else {
        const replaced = fileName.replace(".png", "").replace(".gif", "");
        const fullDir = folder + imagesPath + replaced + (type[1] === 'gif' ? '.gif' : '.png');
        const findImg = fs_1.default.existsSync(fullDir);
        if (!findImg)
            return res.status(404).send("Image not founded");
        res.set({ 'Content-Type': 'image/png' });
        fs_1.default.readFile(fullDir, file => {
            const r = fs_1.default.createReadStream(fullDir);
            const ps = new stream_1.default.PassThrough();
            stream_1.default.pipeline(r, ps, err => {
                if (err) {
                    console.log(err);
                    return res.sendStatus(400);
                }
            });
            ps.pipe(res);
        });
    }
});
try {
    app.listen(constants_1.port);
    console.log("App listening port: " + constants_1.port);
}
catch (err) {
    console.log(err);
}
