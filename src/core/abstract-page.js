const AbstractComponent = require("./abstract-component.js");

/**
 * Page Abstraction Class
 *
 * @version 1.0.0
 * @param params Page Control Params
 * @constructor
 */
var AbstractPage = function(params) {
  AbstractComponent.call(this);
  this._view = new SMF.UI.Page(params);
};

PageBase.prototype = Object.create(AbstractComponent.prototype);

PageBase.prototype.getBackgroundImage = function() {
  return this._view.backgroundImage;
};

PageBase.prototype.setBackgroundImage = function(url) {
  return this._view.backgroundImage = url;
};

PageBase.prototype.getControls = function() {
  return this._view.controls;
};

PageBase.prototype.getEnabled = function() {
  return this._view.enabled;
};

PageBase.prototype.setEnabled = function(f) {
  this._view.enabled = f;
};

PageBase.prototype.setRouteParams = function(){
};

PageBase.prototype.show = function(
    motionEase
  , transitionEffect
  , transitionEffectType
  , fade
  , reset
  , duration
  ) {
  
  // converts function arguments to array
  var args = Array
    .prototype
    .slice
    .call(arguments);
    
  this
    ._view
    .show
    .apply(this._view, args);
};

PageBase.prototype.setFillColor = function(color) {};

PageBase.prototype.setGestures = function() {};

module.exports = PageBase;