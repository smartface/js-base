const Proxy = require("./proxy.js");
const _exports = {};
const cache = {};

const getClassValue = function(styleDef) {
  return function(className) {
    if(typeof styleDef[className] === "undefined") {
      return styleDef[className];
    } else {
      throw new Error(`Specified className ${className} is not found.`);
    }
  };
};


const findClassNames = (function() {
  const classesRegExp = /\.([a-zA-Z\W0-9][^\.]*)/g;
  const cache = {};
  return function(selector) {
    if(cache.hasOwnProperty(selector)){
      return cache[selector];
    }
    var classes = selector.replace(/[ ]+/g, " ")
      .split(" ")
      .map(function(items){
        return items.match(classesRegExp);
      });
    
    if (!classes) {
      return '';
    }

    cache[selector] = classes;

    return classes;
  };
})();

_exports.findClassNames = findClassNames;

const assignStyles = function(style, classNames, fn) {
  classNames.map(function(className) {
    if(Array.isArray(className)) {
      return assignStyles(style, className, fn);
    } else if(typeof style[className] === "object" && classNames) {
      Object.keys(style[className])
        .map(function(key) {
          if(key.charAt(0) !== "." && key.charAt(0) !== "&") {
            fn(className, key, style[className][key]);
          } else if(key.charAt(0) === "&") {
            classNames.push(key);
          }
        });
      return assignStyles(style[className], classNames.slice(1), fn);
    }
  });
};


/**
 * Styling Wrapper Curry Funtion
 * Returns style scoped function
 * 
 * @params {object} style Styles Object
 */ 
_exports.styler = function(style) {
  return function(classNames) {
    if(!cache.hasOwnProperty(classNames)){
      cache[classNames] = [];
    }
    return function(classNamesArr, fn){
      if(cache.hasOwnProperty(classNames).length > 0){
        cache[classNames].map(function(item){
          fn(item[0], item[1], item[2]);
        })
      } else {
        // setTimeout(function () {
          assignStyles(style, classNamesArr, function(className, key, value){
            cache[classNames].push([className, key, value]);
            fn(className, key, value);
          });
        // }, 0)
      }
    }.bind(null, findClassNames(classNames));
  };
};

module.exports = _exports;