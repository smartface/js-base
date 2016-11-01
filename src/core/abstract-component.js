const SMFx = require("../infrastructure/smfx");
const Proxy = require("./proxy");

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
  const state = initialState || {};
  
  var self = this;

  const stateChanged = (_state) => {
    // state = _state;
    this.stateChangedHandlder(this.getState());
  };
  
  this._viewProxy = new Proxy(view);
  
  this._dispatchEvent = (event) => {
    return (eventObj) => {
      if(typeof streams[event] === "function"){
        this[event](eventObj);
      }
    };
  };
  
  this._changeState = function(update){
    Object.assign(state, update);
    stateChanged.call(this, this.getState());
  }.bind(this);

  const streams = {};
  
  /**
   * Event subcriptions
   * 
   * @returns {Observable}
   *
   */
  this.getEventStream = function(){
    const callbacks = streamContainer(view);
    const events = streamContainer(this);
    
    return (eventName) => {
      if(typeof streams[eventName] === "undefined"){
        streams[eventName] = eventName.indexOf("on") == 0 ? 
          callbacks(eventName).map((e) => {
            e = e || {};
            e.state = state;
            e.type = eventName;
            return e;
          })
          :
          events(eventName).map((e) => {
            e = e || {};
            e.type = eventName;
            e.state = state;
            return e;
          });
      }

      return streams[eventName];
    };
  }.call(this);
  
  this.dispose = function(){
    Object.keys(streams).forEach(function(key){
      delete streams[key];
    });
  };
  
  this.addChild = addChild(view);
  this._view    = view;

  this.getName = function () {
    return name;
  };
  
  this.getState = function(){
    return Object.assign({}, state);
  }
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