const AbstractComponent = require("./abstract-component.js");
const extend = require("./extend")
/**
 * Page Abstraction Class
 *
 * @version 1.2.0
 * @params _super Super class contructor
 * @params view Component view control
 * @constructor
 */
function AbstractPage(_super, view) {
  _super(this, view);
  this._view = view;
  // if(typeof alert !== "undefined")
};

module.exports = extend(AbstractComponent)(
  AbstractPage, 
  function(_proto){
  }
);
