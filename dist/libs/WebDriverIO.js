"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

class WebDriverIO {
  click(...args) {
    return this.browser.click(...args);
  }

  getAttribute(...args) {
    return this.browser.getAttribute(...args);
  }

  isVisible(...args) {
    return this.browser.isVisible(...args);
  }

  execute(...args) {
    return this.browser.execute(...args);
  }

  getText(...args) {
    return this.browser.getText(...args);
  }

  isExisting(...args) {
    return this.browser.isExisting(...args);
  }

  $(...args) {
    return this.browser.$(...args);
  }

  $$(...args) {
    return this.browser.$$(...args);
  }

}

exports.default = WebDriverIO;