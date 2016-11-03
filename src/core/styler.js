const Proxy = require("./proxy.js");
const _exports = {};

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

  return (selector) => {
    var classes = selector.replace(/[ ]+/g, " ")
      .split(" ")
      .map(function(items){
        return items.match(classesRegExp);
      });
    
    if (!classes) {
      return '';
    }

    return classes;
  };
})();

_exports.findClassNames = findClassNames;

const assignStyles = function(style, classNames, fn){
  classNames.map(function(className){
    if(Array.isArray(className)) {
      return assignStyles(style, className, fn);
    } else if(typeof style[className] === "object" && classNames){
      Object.keys(style[className])
        .map(function(key){
          if(key.indexOf(".") === -1){
            fn(className, key, style[className][key]);
          }
        });
      return assignStyles(style[className], classNames.slice(1), fn);
    }
  });
};

_exports.styler = function(style) {
  return function(classNames) {
    return function(classNames, fn){
      assignStyles(style, classNames, fn);
    }.bind(null, findClassNames(classNames));
  };
};

module.exports = _exports;