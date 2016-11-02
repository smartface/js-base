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

var styles = [
  {
    className: [".name1", ".name2"],
  }
  ]
  
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

const flatMap = function(style){
  return Object.keys(style)
    .reduce(function(acc, curr){
      var styleObj = {className:""};
      
      if(curr.trim(" ").indexOf(".") == 0) {
        styleObj = flatMap(style[curr]);
        styleObj.className = curr+styleObj.className;
      } else {
        styleObj.className = curr;
      }
      
      console.log(styleObj);
      acc.push(styleObj);
      
      return acc
    }, []);
}

_exports.parseStyle = function(style){
  console.log("parseStyle");
  return flatMap(style);
};

_exports.assignStyles = function(component, styleSheet){
  styleSheet
  .filter(function(style){
    return component.getClassName == style.className;
  })
  .map(function(style){
    
  });
}

const StyleSheet = function(style) {
  this._styleValues = getClassValue(style);
};

StyleSheet.prototype.filter = function(f) {
  this.map(f);
  return new S
}

StyleSheet.prototype.map = function(f) {
  return new StyleSheet(f(function(className){
    return this._styleValues(className);
  }));
};

/**
 * Style Container for components
 * 
 * @param style {object}
 * @returns {Function}
 * @constructor
 */
const Styler = function (style) {
  this._style = new StyleSheet(style);
};

Styler.prototype.map = function (f) {
  return Styler.of(
    f(function(className){
      this._style.map(function(getClassValue){
          getClassValue(className);
      });
    })
  );
};

Styler.of = function(style) {
  return new Styler(style);
};

module.exports = _exports;