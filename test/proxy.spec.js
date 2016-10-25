/**
 * Created by smartface on 10/17/16.
 */

const Proxy        = require("./../src/core/proxy");
const NullProperty = require("./../src/core/null-property");

describe("Proxy", function() {
  var component = {prop:"-"};
  var wrapper = {};

  beforeEach(function() {
    wrapper = Proxy(component);
  });

  it("should return wrapping object", function() {
    expect(wrapper.hasOwnProperty("hasProp")).toEqual(true);
    expect(wrapper.hasOwnProperty("get")).toEqual(true);
    expect(wrapper.hasOwnProperty("set")).toEqual(true);
  });

  it("wrapper should set object prop", function() {
    wrapper.set("prop", "setted");
    expect(component.prop).toEqual("setted");
  });

  it("should be able to be get object prop value", function() {
    wrapper.set("prop", "setted");
    expect(wrapper.get("prop")).toEqual("setted");
  });

  it("should return NullProperty when props cannot be found", function() {
    expect(wrapper.set("prop2", "setted") instanceof NullProperty).toEqual(true);
  });

  it("should return true if component has prop", function() {
    expect(wrapper.hasProp("prop")).toEqual(true);
  });

  it("should return false if component don't has prop", function() {
    expect(wrapper.hasProp("prop2")).toEqual(false);
  });
  
  describe("Proxy.assign", function () {
    var val;
    beforeEach(function() {
      component = {};
      component.prop2 = "prop2";
      component.prop3 = "prop3";
      val = {prop2: "set prop2", prop3: "set prop3"};
    });

    it("should assign given object to component", function() {
      Proxy.assign(component, val);
      expect(component.prop2).toEqual(val.prop2);
      expect(component.prop3).toEqual(val.prop3);
    });

    it("should throw an error if given object is required.", function() {
      expect(Proxy.assign.bind(null, component, {prop4: "prop3"}, true)).toThrowError("Option [prop4] is not found");
    });
  })
});