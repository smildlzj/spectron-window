"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _path = _interopRequireDefault(require("path"));

var _url = _interopRequireDefault(require("url"));

var _WebDriverIO = _interopRequireDefault(require("./libs/WebDriverIO"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function noop() {}

async function refreshWindowHandle() {
  const self = this;
  const app = self.app;
  const browser = app.client;
  var refreshWHer = self._context.refreshWHer;

  if (refreshWHer) {
    return refreshWHer.then(refreshWindowHandle.bind(self));
  }

  const rootPath = _path.default.join(_path.default.dirname('file://' + app.path), 'resources/app');

  const handleMap = {};
  return self._context.refreshWHer = browser.windowHandles().then(function (handles) {
    return new Promise(async resolve => {
      self.id = null;

      for (let i = handles.value.length - 1; i >= 0; i--) {
        let ret = await browser.window(handles.value[i]).then(() => {
          return true;
        }, () => {
          return false;
        });

        if (!ret) {
          continue;
        }

        let webUrl = _path.default.relative(rootPath, (await browser.getUrl()));

        let u = _url.default.parse(webUrl).path;

        handleMap[handles.value[i]] = u;

        if (u.indexOf(self.path) != -1) {
          self.id = handles.value[i];
        }
      }

      self._context.refreshWHer = null; // reset current open window

      app._preWindow = null;
      app._handleMap = handleMap;
      resolve(handleMap);
    }, () => {
      self._context.refreshWHer = null;
    });
  });
}

function wrapElectronApi() {
  const self = this;
  const app = self.app;
  var apis = {};

  for (let k in app.electron) {
    apis[k] = new Proxy(app.electron[k], {
      get(target, name) {
        return async function () {
          let args = Array.prototype.slice.call(arguments); // console.log('call', k, name, args)

          let ret = await self.focus();

          if (!ret) {
            return noop();
          }

          var method = app.electron[k];
          return method[name].apply(method, args);
        };
      }

    }); // console.log('mock', k)
  }

  return apis;
}

class BaseWin extends _WebDriverIO.default {
  constructor(_app, _parent) {
    super();
    this.app = _app;
    this.parent = _parent;
    this._context = {};
    this.electron = wrapElectronApi.bind(this)();
    refreshWindowHandle.bind(this)();
  }

  get browser() {
    var self = this;
    return new Proxy(self.app.client, {
      get(target, name) {
        // proxy all webdriver method, focus first
        return async (...args) => {
          await self.focus();
          let fn = target[name];

          if (!fn) {
            throw new Error(`function ${name} not found.`);
          }

          return fn.bind(target)(...args);
        };
      }

    });
  }

  async focus() {
    const app = this.app;
    const handleMap = app._handleMap;
    this.id = null;

    for (let k in handleMap) {
      if (handleMap[k].indexOf(this.path) != -1) {
        this.id = k;
        break;
      }
    }

    if (!this.id) {
      await refreshWindowHandle.bind(this)();
    }

    if (!this.id) {
      console.warn('cant focus ' + this.path);
      return Promise.resolve(null);
    }

    if (this.id == app._preWindow) {
      return Promise.resolve(this.id);
    }

    return this.app.client.window(this.id).then(() => {
      app._preWindow = this.id; // console.log('set focus', this.path, this.id)

      return this.id;
    }, () => {
      return refreshWindowHandle.bind(this)().then(this.focus.bind(this));
    });
  }

  async isExist() {
    return refreshWindowHandle.bind(this)().then(() => {
      return !!this.id;
    });
  }

}

exports.default = BaseWin;