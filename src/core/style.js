const Proxy = require("./proxy.js");

/**
 *
 * @param proxy {Proxy}
 * @returns {Function}
 * @constructor
 */
const Styleable = function (style) {
  return function (component) {
    Proxy.assign(Proxy(component), style, false);
  }
};

module.exports = Styleable;