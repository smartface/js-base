/**
 * Created by smartface on 10/21/16.
 */

const component = require("./../src/component/component").component;
// const AbstractComponent = require("./../src/component/component").MockAbstractComponent;
const AbstractComponent = require("./../src/core/abstract-component");

//
// concrete.prototype = Object.create(AbstractComponent);

// concrete.prototype.onEvent = "";
// concrete.prototype.click = function () {
//   if(this.onEvent){
//     this.onEvent("click")
//   }
//   return "click";
// };
// addMethods(concrete.prototype)
// const c = new concrete(function () {});
// console.log(c.click());
// c.click();

describe("AbstractComponent", function() {

  var concrete;

  function addMethods(_proto) {
    _proto.click = function () {
      if(this.onEvent){
        this.onEvent("click")
      }

      return "click";
    };
    
    _proto.stateChangedHandler = function(state){};  
  };

  beforeEach(function () {
    concrete = function (_super) {
      _super(this, {
        onEnter: "",
        onEvent: ""
      });
    };
  });

  it("should implement super method", function () {
    /** @type {AbstractComponent} */
    var comp = component(concrete, addMethods);
    comp = new comp({});
    expect(comp.hasOwnProperty("getEventStream")).toBe(true);
    expect(comp instanceof AbstractComponent).toBe(true);
  });

  it("should be able to call concrete method", function () {
    /** @type {AbstractComponent} */
    var comp = component(concrete, addMethods);
    comp = new comp({});

    // expect(comp.hasOwnProperty("onEnter")).toBe(true);
    expect(typeof comp.click === "function").toBe(true);
  });

  it("should be able to externally subscribe to component's view callbacks", function () {
    /** @type {AbstractComponent} */
    var comp = component(concrete, addMethods);
    comp = new comp();

    comp
      .getEventStream("onEvent")
      .subscribe(function (e) {
        expect(e.type == 'onEvent').toBe(true);
      });
      
      comp.get("onEvent")();
  });
  
  it("should be able to externally subscribe to custom component events", function (done) {
    /** @type {AbstractComponent} */
    var comp = component(function(_super) {
      _super(this, {
        onEnter: ""
      });
      
      setTimeout(() => {
        this.event();
      }, 500);
    }, function(_proto) {
      _proto.event = null;
    });
    
    comp = new comp();
    comp.getEventStream("event").subscribe((e) => {
      expect(e.type === "event").toBe(true);
      done();
    });
  });
});