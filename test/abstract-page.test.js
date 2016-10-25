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
    
    // _proto.click = function () {
    //   if(this.onEvent){
    //     this.onEvent("click");
    //   }

    //   return "click";
    // };
  };

  beforeEach(function () {
    constructor = function (_super) {
      _super.call(this, {
        onEnter: ""
      });
    };
  });

  it("should be extended", function () {
    /** @type {AbstractComponent} */
    const page = extend(AbstractPage)(constructor, addMethods);
    page = new page();
    expect(page instanceof AbstractPage).toBe(true);
  });
});