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
    _proto.stateChangedHandler = function(state){};  
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

  it("should be extended from AbstractComponent", function () {
    /** @type {AbstractPage} */
    const _page = extend(AbstractPage)(constructor, addMethods);
    const view = {onTouch:function(){}};
    const page = new _page(view);
    
    expect(typeof page._view.onTouch === 'function').toBe(true);
    expect(page instanceof AbstractComponent).toBe(true);
    expect(page instanceof AbstractPage).toBe(true);
  });
  
  it("should be able to inject view to super class", function () {
    /** @type {AbstractPage} */
    const _page = extend(AbstractPage)(function(_super, view){
      console.log("this", this, view);
      _super(this, view);
    }, addMethods);
    const view = {onTouch:function(){}};
    const page = new _page(view);
    
    expect(page._view === view).toBe(true);
  });  
});