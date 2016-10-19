const NullProperty = require("./null-property");

/**
 * Component Proxy Implementation
 *
 * @version 1.0.0
 * @param component {*}
 * @returns {{hasProp: hasProp, get: get, set: set}}
 * @constructor
 */
const Proxy = function(component){
  return {
    hasProp: function(prop){
      return !(this.get(prop) instanceof NullProperty);
    },
    get: function(prop){
      if(component.hasOwnProperty(prop)){
        return component[prop];
      }

      return new NullProperty();
    },
    set: function(prop, value){
      if(component.hasOwnProperty(prop)){
        return component[prop] = value;
      }

      return new NullProperty();
    }
  }
};

/**
 *
 * @param proxy {Proxy}
 * @param data {object}
 * @returns {Function}
 */
Proxy.assign = function(component, data, isRequired=true) {
  const proxy = Proxy(component);

  data = Object.assign({}, data);
  Object
    .keys(data)
    .forEach(function(key) {
      if(proxy.hasProp(key)) {
        proxy.set(key,  data[key]);
      } else if(isRequired === true){
        throw new Error("Option ["+key+"] is not found");
      }
    });
};

module.exports = Proxy;