"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const textfile = require("textfile");
const path = require("path");
const utils_1 = require("../utils");
function view(serverUrl = '', title = '', isNew = false, indexPath_ = '') {
    var viewColumn = vscode.ViewColumn.One;
    if (isNew) {
        let editor = vscode.window.activeTextEditor;
        if (vscode.window.activeTextEditor) {
            viewColumn = +editor.viewColumn;
        }
        viewColumn = Math.min(viewColumn + 1, vscode.ViewColumn.Three);
    }
    var indexPath = path.join(__dirname, indexPath_ || '../../index.html');
    const contentPath = path.join(path.dirname(indexPath), 'content.html');
    textfile.read(indexPath, 'string', str => {
        str = str.replace('<%title%>', title);
        str = str.replace('<%src%>', serverUrl);
        var font = str.match(/(url\(')(res\/iconfont.ttf)('\);)/);
        if (font && font.length === 4) {
            font = font[2];
            font = path.join(path.dirname(indexPath), font);
            var base64 = utils_1.default.fileToBase64(font);
            str = str.replace(/(url\(')(res\/iconfont.ttf)('\);)/, `$1${base64}$3`);
        }
        textfile.write(contentPath, str, 'string', () => {
            textfile.read(contentPath, 'string', str => {
                const previewUri = utils_1.default.getUri(path.join(__dirname, path.join(path.dirname(indexPath_ || '../../index.html'), 'content.html')));
                vscode.commands.executeCommand('vscode.previewHtml', previewUri, viewColumn, title);
            });
        });
    });
}
exports.default = { view };
//# sourceMappingURL=index.js.map