const component         = require("./../src/component/component").component;
const AbstractComponent = require("./../src/core/abstract-component");

describe("component wrapper", function() {
  var comp;

  var constructor = function (_super, param1, param2) {
    var view = {};
    _super(this, view);
    this.stateChangedHandler = function(state){};
  };

  beforeEach(function() {
    comp = component(constructor, function(_proto) {
      _proto.stateChangedHandler = function(state){};  
    });

  });

  it("should return constructor extends from AbstractComponent", function() {
    const inst = new comp("param1", "param2");
    expect(inst instanceof AbstractComponent).toBe(true);
  });

  it("should be injected from super constructor", function() {
    var constructor = function (_super) {
      _super = _super(this, {});
      expect(_super == AbstractComponent).toBe(true);
      
    };

    comp = component(constructor, function(_proto) {
      _proto.stateChangedHandler = function(state){};  
    });
    
    const inst = new comp({});
  });

  it("should be passed some parametres", function() {
    var constructor = function (_super, param1) {
      expect(param1).toBe("param1");
    };

    comp = component(constructor, function(_proto) {
      _proto.stateChangedHandler = function(state){};  
    });

    const inst = new comp("param1");
  });

  it("should be able to be added new methods", function() {
    function method1() {
    };

    comp = component(constructor,
      function (_proto) {
        console.log("proto", _proto);
        _proto.method1 = method1;
        _proto.stateChangedHandler = function(state){};
      });

    const inst = new comp("param1", "param2");

    expect(inst.method1 == method1).toBe(true);
  });
});