/**
 * Created by smartface on 10/18/16.
 */

const parseStyle = require("./../src/core/styler").parseStyle;

describe("Styler", function() {
  var component = {prop:"-", top: 0, left: 0};
  var style = {
    // "@mixin": {
    //   calculateFontSize: ()=>{
    //     return "24dp";
    //   }
    // },
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

  it("should be able to assign style object", function() {
    // var styler = Styler.of(style);
    // var res = styler.map(function(f){
    //   console.log(f);
    //   return f(".button .button--red");
    // });
    
    var styles = parseStyle(style);
    
    expect(styles).toBe(true);
  });

});