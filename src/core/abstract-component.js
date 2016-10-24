const SMFx = require("../infrastructure/smfx");

const Proxy = require("./proxy");
const stateContainer = require("../core/abstract-component-state");

const streamContainer = function (target) {
  return function (event) {
    try{
      return SMFx.fromCallback(target.get(event));
    } catch (e) {
      throw e;
    }
  }
};

const AbstractComponent = function(view, name, initialState) {
  if(!view){
    throw new Error("Component View must not be undefined");
  }

  this._viewProxy     = new Proxy(view);
  this._changeState   = stateContainer(initialState, this.changeStateHandlder);
  this.getEventStream = streamContainer(this);

  this.getName = function () {
    return name;
  }
};

AbstractComponent.Events = {
  TOUCH: "onTouch"
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