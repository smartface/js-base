const NullProperty = require("./null-property");

/**
 * Component Proxy Implementation
 *
 * @version 1.0.0
 * @param component {*}
 * @returns {{hasProp: hasProp, get: get, set: set}}
 * @constructor
 */
const Proxy = function(component) {
  return {
    hasProp: function(prop) {
      return component.hasOwnProperty(prop);
    },
    hasMethod: function(prop) {
      return (typeof component[prop] === "function");
    },
    has: function(prop) {
      return this.hasProp(prop) || this.hasMethod(prop);
    },
    get: function(prop) {
      if (this.hasProp(prop)) {
        return component[prop];
      }
      else if (this.hasMethod(prop)) {
        return component[prop].call(component, Array.prototype.slice.call(arguments, 1));
      }

      return new NullProperty();
    },
    set: function(prop, value) {
      if (this.hasProp(prop)) {
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
Proxy.assign = function(component, data, isRequired) {
  const proxy = Proxy(component);
  isRequired = !!isRequired;

  data = Object.assign({}, data);
  Object
    .keys(data)
    .forEach(function(key) {
      if (proxy.hasProp(key)) {
        proxy.set(key, data[key]);
      } else if (isRequired === true) {
        throw new Error("Option [" + key + "] is not found");
      }
    });
};

module.exports = Proxy;
