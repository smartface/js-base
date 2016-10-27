const Router = require("../src/core/router");

describe("Proxy", function() {
  var Page1 = function(){
    this.show = function(){
    };
    
    this.setRouteParams = function(){}
  }
  
  var Page2 = function(){
    this.show = function(){
    };
    
    this.setRouteParams = function(){}
  }

  
  beforeEach(function() {
      Router.add("page1", Page1, function(){});
      Router.add("page2", Page2, function(){});
      Router.add("page3", new Page1(function(){}), function(){});
  });

  it("should be able to add new route of Page", function() {
    var page1 = Router.go("page1");
    expect(page1 instanceof Page1).toEqual(true);
  });

  it("should return same Page instance", function() {
    var page1 = Router.go("page1");
    expect(page1 === Router.go("page1")).toEqual(true);
  });
});