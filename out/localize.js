"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const i18n = require("vscode-i18n");
exports.locale = i18n.locale;
exports.localize = i18n.Localize(path.join(__dirname, '../i18n'));
//# sourceMappingURL=localize.js.map