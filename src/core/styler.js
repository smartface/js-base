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

/*
    {
      ".button": {
      top: '10dp',
      left: '20dp',
      font: {
        size: "20dp"
      },
      ".red": {
        fillColor: "#ff0c0c"
      }
    }
  }
*/

/*const flatMap = function(style){
  return Object.keys(style)
    .reduce(function(acc, curr){
      var styleObj = {};
      styleObj.children = [];
      
      if(curr.trim(" ").indexOf(".") == 0) {
        styleObj.children.push(Object.assign({}, style[curr]));
      } else {
        styleObj[curr] = style[curr];
      }
      
      if(typeof style[curr] === "object") {
        styleObj = flatMap(style[curr]);
      }

      acc.push(styleObj);
      
      return acc;
    }, []);
}
*/


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

/*
_exports.parseStyle = function(style){
  const styles = flatMap(style);
  console.log("parseStyle", styles);
  
  return styles;
};
*/

const assignValue = function(style){
  
}

const assignStyles = function(style, classNames, fn){
  classNames.map(function(className){
    if(Array.isArray(className)) {
      return assignStyles(style, className, fn);
    } else if(typeof style[className] === "object"){
      Object.keys(style[className])
        .map(function(key){
          if(key.indexOf(".") === -1){
            // console.log(key);
            fn(key, style[className][key]);
          }
        });
      return assignStyles(style[className], classNames.slice(1), fn);
    }
    
  });
};

_exports.styler = function(style) {
  return function(classNames) {
    return function(classNames, fn){
      // classNames.map(function(className){
      assignStyles(style, classNames, fn);
      // })
    }.bind(null, findClassNames(classNames));
  };
};

const StyleSheet = function(style) {
  this._styleValues = getClassValue(style);
};

StyleSheet.prototype.filter = function(f) {
  this.map(f);
};

StyleSheet.prototype.map = function(f) {
  return new StyleSheet(f(function(className) {
    return this._styleValues(className);
  }));
};


module.exports = _exports;