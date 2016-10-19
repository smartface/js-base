const Proxy = require("./proxy");

const stateContainer = function (state, onChange) {
  state = Object.assign({}, state);

  return function changeState(update){
    if(update){
      state = Object.assign(state, update);
      onChange(Object.assign({}, state));
    }

    return Object.assign({}, state);
  }
};

const AbstractComponent = function(_view, initialState){
  this._viewProxy = new Proxy(_view);
  this._changeState = stateContainer(initialState, this.changeStateHandlder);
};

AbstractComponent.prototype._changeState = function () {};

AbstractComponent.prototype.changeStateHandlder = function(state) {
  throw new Error("Abstract changeStateHandler method must overriden");
};

AbstractComponent.prototype.add = function(child) {
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

AbstractComponent.prototype.set = function (prop, value) {
  return this._viewProxy.set(prop, value);
};

AbstractComponent.prototype.get = function (prop) {
  return this._viewProxy.get(prop);
};

module.exports = AbstractComponent;