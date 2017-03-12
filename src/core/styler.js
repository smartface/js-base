const Proxy = require("./proxy.js");
const AbstractComponent = require("./abstract-component");

const _exports = {};
const cache = {};

const getClassValue = function(styleDef) {
  return function(className) {
    if (typeof styleDef[className] === "undefined") {
      return styleDef[className];
    } else {
      throw new Error("Specified className ${className} is not found.");
    }
  };
};

const findClassNames = (function() {
  const classesRegExp = /\.([a-zA-Z\W0-9][^\.]*)/g;
  const cache = {};
  return function(selector) {
    if (cache.hasOwnProperty(selector)) {
      return cache[selector];
    }
    const classes = selector.replace(/[ ]+/g, " ")
      .split(" ")
      .map(function(items) {
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
  classNames = classNames.slice();
  const className = classNames.shift();
  
  if (Array.isArray(className)) {
    assignStyles(style, className, fn);
  } else if (typeof style[className] === "object" && classNames) {
    Object.keys(style[className])
      .map(function(key) {
        if (key.charAt(0) !== "." && key.charAt(0) !== "&") {
          fn(className, key, style[className][key]);
        } else if (key.charAt(0) === "&") {
          classNames.push(key);
        }
      });

    assignStyles( style[className], classNames, fn);
  }
};

_exports.assignStyles = assignStyles;

/**
 * Styling Wrapper
 * Returns style scoped function
 * 
 * @params {object} style Styles Object
 */
const styler = function(style) {
  if(typeof style !== 'undefined') {
    cache.__style__ = style;
  } 

  return function(classNames) {
    const classNamesArr = findClassNames(classNames);
    return function(fn) {
      classNamesArr.forEach(function(classNames) {
        const classesStr = classNames.join("");

        if (cache.hasOwnProperty(classesStr) && cache[classesStr].length > 0) {
          cache[classesStr].map(function(item) {
            fn(item[0], item[1], item[2]);
          });
        } else {
          assignStyles(
            cache.__style__, 
            classNames,
            function(className, key, value) {
              cacheStyle(classesStr, className, key, value);
              fn(className, key, value);
            });
        }
      });
    };
  };
};

function cacheStyle(classes, className, key, value) {
  if (!cache.hasOwnProperty(classes)) {
    cache[classes] = [];
  }

  cache[classes].push([className, key, value]);
}

_exports.styler = styler;

const resetStylerCache = function() {
  cache = {};
};

_exports.resetStylerCache = resetStylerCache;

/**
 * Component styling wrapper
 * 
 * Example:
 * ```js
 *  ...
 * 
 *  var componentStyle = componentStyler(style)(className);
 *  var comps = [comp1, comp2];
 *  comps.map(componentStyle);
 * or
 *  componentStyle(component);
 * 
 * ...
 * ```
 * @params {object} style Styles object
 * 
 */
_exports.componentStyler = function(style) {
  var styler = _exports.styler(style);
  
  return function(className) {
    return function(component, componentName) {
      styler(className)(function(styleName, key, value) {
        function setKey(component, key, value){
          if(typeof value === 'object'){
            Object.assign(component[key], value);
          } else {
            component[key] = value;
          }
        }
        
        if(((componentName && componentName == styleName) || (className && styleName)) && component.hasOwnProperty(key)) {
          if (component instanceof AbstractComponent && componentName == styleName && component.hasProp(key)) {
            component.set(key, value);
          } else {
            setKey(component, key, value);
          }
        } else {
          if(typeof component === "object") {
            setKey(component, key, value);
          }
          
          console.log("[Warning][ComponentName :"+component.name+", StyleName: "+styleName+"] style cannot be assigned.");
        }
      });
    };
  };
};

module.exports = _exports;
