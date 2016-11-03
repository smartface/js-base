/**
 * Created by smartface on 10/18/16.
 */

const findClassNames = require("./../src/core/styler").findClassNames;
const styler = require("./../src/core/styler").styler;

describe("Styler", function() {
  var component = {prop:"-", top: 0, left: 0};
  var style1 = {
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
  };

  var style2 = {
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
  };

  beforeEach(function() {
  });

  it("should parse className from formatted string", function() {
    expect(findClassNames(".button.red .layout.left")).toEqual([['.button', '.red' ], [ '.layout', '.left' ]]);
    expect(findClassNames(".button .red   .layout.left")).toEqual([['.button'], ['.red' ], [ '.layout', '.left' ]]);
  });
  
  it("should pass styles to callback", function() {
    var component = {
      width: 0,
      height: 0,
      color: "",
    }
    
    var component2 = {
      width: 0,
      height: 0,
      color: "",
      font: {
        size: "12"
      }
    }
    
    var style = {
      ".button": {
        width: 100,
        height: 200,
        ".red":{
          color: "red",
        }
      },
      ".text-":{
        font: {
          size: "16"
        },
        ".blue":{
          color: "blue"
        }
      }
    };
    
    const styling = styler(style);
    
    styling(".button.red")(function(key, value) {
      component[key] = value;
    });
    
    styling(".button .text-.blue")(function(key, value){
      component2[key] = value;
    });
    
    expect(component).toEqual( {
      width: 100,
      height: 200,
      color: "red"
    });
    
    expect(component2).toEqual( {
      width: 100,
      height: 200,
      color: "blue",
      font: {
        size: "16"
      }
    });
  });
});