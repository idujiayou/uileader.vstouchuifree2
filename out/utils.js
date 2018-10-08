"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const vscode = require("vscode");
const fs = require("fs");
const mineType = require("mime-types");
var STORAGE_PATH = path.join(__dirname, '../.storage');
function getUri(file) {
    if (process.platform === 'win32') {
        return vscode.Uri.parse(`file:///${file}`);
    }
    else {
        return vscode.Uri.file(file);
    }
}
function fileToBase64(path) {
    var data = fs.readFileSync(path);
    var dataStr;
    dataStr = new Buffer(data).toString('base64');
    return 'data:' + mineType.lookup(path) + ';base64,' + dataStr;
}
function getStorage(key) {
    var str;
    try {
        str = fs.readFileSync(STORAGE_PATH, {
            encoding: 'utf-8'
        });
    }
    catch (error) {
        str = '';
    }
    var data;
    try {
        data = JSON.parse(str);
    }
    catch (error) {
        data = {};
    }
    if (key) {
        return data[key];
    }
    return data;
}
function setStorage(key, val) {
    var data = getStorage(null);
    data[key] = val;
    var str = JSON.stringify(data);
    fs.writeFileSync(STORAGE_PATH, str, {
        encoding: 'utf-8'
    });
}
exports.default = {
    getUri,
    fileToBase64,
    getStorage,
    setStorage
};
//# sourceMappingURL=utils.js.map