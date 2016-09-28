const AbstractComponent = function(){
};

AbstractComponent.prototype.add = function(child) {
  // SMFConsole.dir(child);
  try {
    if (child instanceof AbstractComponent) {
      this._view.add(child._view);
    } else {
      this._view.add(child);
    }
  } catch(e) {
    e.message = "[AbstractComponent.add]"+e.message;
    throw e;
  }
};

AbstractComponent.prototype.getWidth = function () {
  return this._view.width;
};

AbstractComponent.prototype.setWidth = function (value) {
  this._view.width.width = value;
};

AbstractComponent.prototype.getHeight = function () {
  return this._view.height;
};

AbstractComponent.prototype.setHeight = function (value) {
  this._view.width.height = value;
};

module.exports = AbstractComponent;