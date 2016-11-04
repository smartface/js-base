const component = require("./component").component;
const nameCounter = 0;
const AbstractComponent = require("../core/abstract-component");

/**
 * UI Component Abstraction
 * UI Component has SMF.UI.Container as defualt
 * UI Component are styleable
 * 
 * @version 1.2.0
 * @class
 */
const IUComponent = component(
  // Component Constructor
  function(_super, params, name, initialState){
    name = name || "component"+(++nameCounter);
    var view = new SMF.UI.Container(params);
    var _elements = {};
    var _classNames;
    var _styler;
    
    _elements[name] = view;
    
    _super(this, view, name, initialState);
    
    const renderStyles = function(){
      if(_styler){
        _styler(_classNames)(this.updateStyles.bind(this));
      }
    }.bind(this);
    
    this.add = function(child, id){
      if(id) {
        _elements[id] = child;
      }
      
      AbstractComponent.prototype.add.call(this, child);
      renderStyles();
    };
    
		this.updateStyles = function(className, key, value){
			if(_elements.hasOwnProperty(className)){
				_elements[className][key] = value;
			}
		};
		
    this.setStyler = function(styler){
      _styler = styler;
      _styler(this.getClassName())(this.updateStyles.bind(this));
      renderStyles();
    };
    
    this.setClassName = function(classNames){
      _classNames = classNames;
      _elements[classNames] = view;
      renderStyles();
    };
    
    this.getClassName = function(){
      return _classNames;
    };
  },
  function(_proto){
  });
  
module.exports = IUComponent;