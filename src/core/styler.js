const Proxy = require("./proxy.js");

/**
 *
 *
 * @param style {object}
 * @returns {Function}
 * @constructor
 */
const Styler = function (style) {
  this._style = style;
};

Styler.prototype.map = function (f) {
  return Styler.of(f(this._style));
};

Styler.of = function(style) {
  return new Styler(style);
};

module.exports = Styler;