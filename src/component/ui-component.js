const component = require("./component").component;
const nameCounter = 0;
const AbstractComponent = require("../core/abstract-component");

/**
 * UI Component Abstraction
 * UI Component has SMF.UI.Container as defualt
 * UI Component is styleable
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
    var _className;
    var _styler;
    
    _elements[name] = view;
    
    /**
     * Class AbstractComponent Constructor
     */
    _super(this, view, name, initialState);
    
    /**
     * Invalidates styling
     */
    const renderStyles = function() {
      if(_styler){
        _styler(_className)(this.updateStyles.bind(this));
      }
    }.bind(this);
    
    /**
     * Overrides add method
     * 
     * @params {UIComponent|SMF.UI.Component} child
     * @params {string} id Component styling id
     */
    this.add = function(child, id){
      if(id) {
        _elements[id] = child;
      }
      
      AbstractComponent.prototype.add.call(this, child);
      renderStyles();
    };
    
    /**
     * updates style values
     * 
     * @params {string} classNames
     */
		this.updateStyles = function(className, key, value){
			if(_elements.hasOwnProperty(className)){
				_elements[className][key] = value;
			}
		};
		
    /**
     * sets styler
     * 
     * @params {string} classNames
     */
    this.setStyler = function(styler){
      _styler = styler;
      _styler(this.getClassName())(this.updateStyles.bind(this));
      renderStyles();
    };
    
    /**
     * sets component className
     * 
     * @params {string} classNames
     */
    this.setClassName = function(className){
      _className = className;
      _elements[className] = view;
      renderStyles();
    };
    
    /**
     * Returns component className
     * 
     * @returns {string}
     */
    this.getClassName = function(){
      return _className;
    };
  },
  function(_proto){
  });
  
module.exports = IUComponent;