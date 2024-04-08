"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  NcwSdk: true,
  FireblocksNCWFactory: true
};
Object.defineProperty(exports, "FireblocksNCWFactory", {
  enumerable: true,
  get: function () {
    return _FireblocksNCWFactory.FireblocksNCWFactory;
  }
});
exports.NcwSdk = void 0;
var _interfaces = require("./interfaces");
Object.keys(_interfaces).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _interfaces[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _interfaces[key];
    }
  });
});
var _types = require("./types");
Object.keys(_types).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _types[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _types[key];
    }
  });
});
var _FireblocksNCWFactory = require("./FireblocksNCWFactory");
const NcwSdk = exports.NcwSdk = require('./NativeNcwSdk').default;
//# sourceMappingURL=index.js.map