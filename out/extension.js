'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const browse_1 = require("./browse");
const path = require("path");
const fs = require("fs");
const opn = require("opn");
const create = require("touchui-create");
const localize_1 = require("./localize");
var touchuiPack = require('touchui-pack');
var copy = require('copy');
function activate(context) {
    var output = vscode.window.createOutputChannel('TouchUI');
    output.show(true);
    var __console = {
        log: global.console.log,
        warn: global.console.warn,
        error: global.console.error
    };
    function __output(type, ...others) {
        var log = `[${type}]`;
        var __str = '';
        others.forEach(str => {
            if (typeof str === 'object') {
                try {
                    __str = JSON.stringify(str);
                }
                catch (error) {
                    __str = String(str);
                }
            }
            else {
                __str = str;
            }
        });
        if (__str.replace(/\s/g, '').length === 0) {
            return;
        }
        log += __str;
        log = log.replace(/\u001b\[\d+m/g, '');
        __console[type](...others);
        output.appendLine(log);
    }
    global.console.log = function (...others) {
        __output('log', ...others);
    };
    global.console.warn = function (...others) {
        __output('warn', ...others);
    };
    global.console.error = function (...others) {
        __output('error', ...others);
    };
    var sourcePath = vscode.workspace.rootPath;
    var buildPath;
    var serverUrl;
    var workspaceConfig = vscode.workspace.getConfiguration();
    var touchuiEnable = workspaceConfig.get('touchui.enable');
    var inited;
    if (touchuiEnable) {
        touchuiPack.init(sourcePath);
        inited = true;
    }
    workspaceConfig.update('touchui.deving', false, false);
    workspaceConfig.update('touchui.builded', false, false);
    function init() {
        var filesAssociations = workspaceConfig.get('files.associations');
        filesAssociations['*.ui'] = 'vue';
        var extensions = workspaceConfig.get('vetur.extensions');
        if (Array.isArray(extensions)) {
            extensions.push('.ui');
            extensions = [...new Set(extensions)];
        }
        try {
            workspaceConfig.update('touchui.enable', true, false);
            workspaceConfig.update('files.associations', filesAssociations, false);
            workspaceConfig.update('vetur.extensions', extensions, false);
            console.log(localize_1.localize('init.success'));
        }
        catch (error) {
            vscode.window.showErrorMessage(`${localize_1.localize('init.error')}: ${error}`);
        }
        if (!inited) {
            touchuiPack.init(sourcePath);
            inited = true;
        }
    }
    function createDemo() {
        create.demo(sourcePath, error => {
            if (error) {
                vscode.window.showErrorMessage(`${localize_1.localize('createDemo.error')}: ${error}`);
            }
            else {
                init();
            }
        });
    }
    function createPage(e) {
        vscode.window.showInputBox({
            ignoreFocusOut: true,
            placeHolder: localize_1.localize('createPage.pageName.placeHolder'),
            prompt: localize_1.localize('createPage.pageName.prompt'),
        }).then(pageName => {
            if (pageName) {
                vscode.window.showInputBox({
                    ignoreFocusOut: true,
                    placeHolder: localize_1.localize('createPage.title.placeHolder'),
                    prompt: localize_1.localize('createPage.title.prompt'),
                }).then(title => {
                    var fileName;
                    if (e && e.fsPath) {
                        fileName = e.fsPath;
                    }
                    else if (vscode.window.activeTextEditor && vscode.window.activeTextEditor.document) {
                        fileName = vscode.window.activeTextEditor.document.fileName;
                    }
                    else {
                        vscode.window.showErrorMessage(localize_1.localize('createPage.error.path'));
                        return;
                    }
                    fs.stat(fileName, (err, stats) => {
                        if (!err) {
                            if (stats.isFile()) {
                                fileName = path.dirname(fileName);
                            }
                            create.page(sourcePath, fileName, pageName, title, (err, files) => {
                                if (err) {
                                    err.message = err.message || 'error';
                                    vscode.window.showErrorMessage(err.message);
                                }
                                else {
                                    vscode.workspace.openTextDocument(files.ui).then(val => {
                                        vscode.window.showTextDocument(val);
                                    });
                                    console.log(localize_1.localize('createPage.success'));
                                }
                            }, false);
                        }
                    });
                });
            }
            else {
                vscode.window.showErrorMessage(localize_1.localize('createPage.cancel'));
            }
        });
    }
    function runVscode() {
        var config = [
            'http://www.uileader.com',
            localize_1.localize('runVscode.title'),
            'true',
            '../../preview/index.html'
        ];
        if (!touchuiPack.dev.running) {
            workspaceConfig.update('touchui.deving', true, false);
            console.log(localize_1.localize('touchuiPack.dev.running'));
            touchuiPack.dev.start(url => {
                config[0] = serverUrl = url;
                browse_1.default.view(...config);
            });
        }
        else {
            config[0] = serverUrl;
            browse_1.default.view(...config);
        }
    }
    var devStatusBarMessage;
    function runBrowser() {
        if (!touchuiPack.dev.running) {
            devStatusBarMessage = vscode.window.setStatusBarMessage(localize_1.localize('devStatusBarMessage'));
            workspaceConfig.update('touchui.deving', true, false);
            console.log(localize_1.localize('touchuiPack.dev.running'));
            touchuiPack.dev.start(url => {
                serverUrl = url;
                opn(serverUrl);
            });
        }
        else {
            opn(serverUrl);
        }
    }
    function stopService() {
        if (devStatusBarMessage) {
            devStatusBarMessage.dispose();
        }
        if (touchuiPack.dev.running) {
            touchuiPack.dev.stop();
            workspaceConfig.update('touchui.deving', false, false);
            console.log(localize_1.localize('stopService.success'));
        }
        else {
            console.log(localize_1.localize('stopService.error'));
        }
    }
    var building;
    function exportWeb() {
        if (!building) {
            building = true;
            workspaceConfig.update('touchui.builded', false, false);
            console.log(localize_1.localize('touchuiPack.dev.running'));
            vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: localize_1.localize('startBuild.title'),
                cancellable: true
            }, (progress, token) => {
                token.onCancellationRequested(() => {
                    if (building) {
                        touchuiPack.build.stop();
                        building = false;
                        console.log(localize_1.localize('startBuild.cancel'));
                    }
                });
                return new Promise((resolve, reject) => {
                    touchuiPack.build.start(url => {
                        if (building) {
                            building = false;
                            buildPath = url;
                            workspaceConfig.update('touchui.builded', true, false);
                            console.log(localize_1.localize('startBuild.success'));
                            vscode.window.showInformationMessage(localize_1.localize('startBuild.success'));
                            resolve();
                        }
                        else {
                            reject();
                        }
                    });
                });
            })
                .then(() => {
                vscode.window.showOpenDialog({
                    canSelectFiles: false,
                    canSelectFolders: true,
                    canSelectMany: false,
                    openLabel: localize_1.localize('export.openLabel')
                }).then(val => {
                    if (!val) {
                        return;
                    }
                    var exportPath = val[0].fsPath;
                    copy(path.join(buildPath, '**/*'), exportPath, function (err, files) {
                        if (err) {
                            vscode.window.showErrorMessage(localize_1.localize('export.error'));
                        }
                        else {
                            vscode.window.showInformationMessage(localize_1.localize('export.success'));
                        }
                    });
                });
            });
        }
        else {
            console.log(localize_1.localize('startBuild.building'));
        }
    }
    let _init = vscode.commands.registerCommand('touchui.init', init);
    let _createDemo = vscode.commands.registerCommand('touchui.createDemo', createDemo);
    let _createPage = vscode.commands.registerCommand('touchui.createPage', createPage);
    let _runBrowser = vscode.commands.registerCommand('touchui.runBrowser', runBrowser);
    let _stopService = vscode.commands.registerCommand('touchui.stopService', stopService);
    let _runVscode = vscode.commands.registerCommand('touchui.runVscode', runVscode);
    let _exportWeb = vscode.commands.registerCommand('touchui.exportWeb', exportWeb);
    context.subscriptions.push(_init, _createDemo, _createPage, _runBrowser, _stopService, _runVscode, _exportWeb);
}
exports.activate = activate;
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map