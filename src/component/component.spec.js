const component = require("./component").mockComponent;
const AbstractComponent = require("./component").MockAbstractComponent;

describe("component wrapper", function() {
  var comp;

  var constructor = function (_super, param1, param2) {
    _super.apply(this);
  };

  beforeEach(function() {
    comp = component(constructor);
  });

  it("should return constructor extends from AbstractComponent", function() {
    const inst = new comp();
    expect(inst instanceof AbstractComponent).toBe(true);
  });

  it("should be injected super constructor", function() {
    var constructor = function (_super) {
      expect(_super === AbstractComponent).toBe(true);
    };

    comp = component(constructor);
    const inst = new comp();
  });

  it("should be passed some parametres", function() {
    var constructor = function (_super, param1) {
      expect(param1).toBe("param1");
    };

    comp = component(constructor);
    const inst = new comp("param1");
  });

  it("should be able to be added new methods", function() {
    constructor.prototype.method1 = function () {
    };

    const inst = new comp("param1", "param2");
    expect(typeof inst.method1 === 'function').toBe(true);
  });
});