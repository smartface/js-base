const component = require("./component").component;

const nameCounter = 0;

const IUComponent = component(
  // Component Constructor
  function(_super, params, name, initialState){
    name = name || "component"+(++nameCounter);
    var view = new SMF.UI.Container(params);
    
    _super(this, view, name, initialState);
  },
  function(_proto){
    
  });
  
module.exports = IUComponent;