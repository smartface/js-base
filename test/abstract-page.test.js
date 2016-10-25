/**
 * Created by smartface on 10/21/16.
 */

const component = require("./../src/component/component").component;
// const AbstractComponent = require("./../src/component/component").MockAbstractComponent;
const AbstractComponent = require("./../src/core/abstract-component");
const AbstractPage = require("./../src/core/abstract-page");
const extend = require("./../src/core/extend");

describe("AbstractPage", function() {

  var constructor ;

  function addMethods(_proto) {
    
    _proto.click = function () {
      if(this.onEvent){
        this.onEvent("click");
      }

      return "click";
    };
  };

  beforeEach(function () {
    constructor = function (_super, view) {
      _super(this, 
      view
      , {
        onEnter: ""
      });
    };
  });

  it("should be extended", function () {
    /** @type {AbstractPage} */
    const _page = extend(AbstractPage)(constructor, addMethods);
    const page = new _page({onTouch:function(){}});
    
    expect(page instanceof AbstractComponent).toBe(true);
    expect(page instanceof AbstractPage).toBe(true);
  });
});