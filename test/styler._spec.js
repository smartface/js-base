/**
 * Created by smartface on 10/18/16.
 */

const Styler       = require("./../src/core/styler");

describe("Styler", function() {
  var component = {prop:"-", top: 0, left: 0};
  var styler = Styler({
    top: 10,
    left: 20
  });

  beforeEach(function() {
  });

  it("should assign styles to component", function() {
    styler(component);
    expect(component.top).toBe(10);
    expect(component.left).toBe(20)
  });

  it("should throw an error", function() {
    delete component.top;

    expect(component.hasOwnProperty("top")).toBe(false);
    expect(styler.bind(null, component)).toThrowError("Option [top] is not found");
  });
});