const SMFx = require("../infrastructure/smfx");

const Proxy = require("./proxy");
const stateContainer = require("../core/component-state");

const streamContainer = function (target) {
  return function (eventName) {
    try{
      return SMFx.fromCallback(target, eventName);
    } catch (e) {
      throw e;
    }
  };
};

const addChild = function(component){
  return function(f){
    f(component);
  };
};

function AbstractComponent(view, name, initialState) {
  if(!view){
    throw new Error("Component View must not be undefined or null");
  }
  
  name = name || "";
  this.state = initialState || {};
  
  var self = this;

  function stateChanged(state){
    this.state = state;
    this.stateChangedHandlder(state);
  }
  
  this.viewProxy     = new Proxy(view);
  
  this._changeState   = function(container, state){
    stateChanged.call(this, container(state));
  }.bind(this, stateContainer(initialState))
  
  this.getEventStream = function(streamComposer){
    return function(eventName){
      return streamComposer(eventName).map(function(e){
        e.state = self.state;
        return e;
      }).shareReplay(1);
    }
  }(streamContainer(view));
  
  this.addChild       = addChild(view);
  this._view          = view;

  this.getName = function () {
    return name;
  };
};

AbstractComponent.Events = {
  TOUCH: "onTouch"
};

AbstractComponent.prototype.add = function(child) {
  this.addChild(function(parent){
    try {
      if (child instanceof AbstractComponent) {
        parent.add(child._view);
      } else {
        parent.add(child);
      }
    } catch(e) {
      e.message = "[AbstractComponent.add]"+e.message;
      throw e;
    }
  });
};

AbstractComponent.prototype.stateChangedHandlder = function (state) {
  throw new Error("stateChangedHandlder must be overrode.");
};

AbstractComponent.prototype.set = function (prop, value) {
  return this._viewProxy.set(prop, value);
};

AbstractComponent.prototype.get = function (prop) {
  return this._viewProxy.get(prop);
};

module.exports = AbstractComponent;