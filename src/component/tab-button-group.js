const Component  = require("../component.js");
const Rx         = require("rx");
// const SMFConsole = require("../log.js");

// Compose 
const tabButtonTouchHandlerComposer = function(change$){
  // current state
  var _current;
  // Compose
  return function(name, changeContent){
    // Tab button onTouchHandler
    return function(e){
      change$
        .onNext({
            target: this
          , current: _current
          , name: name
        });
      
      if(_current){
        _current.touchEnabled = true;
      }
      
      this.touchEnabled = false;
      _current = this;
      
      changeContent();
    };
  };
};

// creates add content method
const addContentComposer = function(parentAdd, params){
  // create tab content container
  const container = new SMF.UI.Container(params);
  
  // parent page/container add method
  parentAdd(container);
  
  // add child content to content container
  return function(child){
    container.add(child);
    
    return function(){
      container.remove(child);
    };
  };
};

// compose change content handler
const changeContentComposer = function(addContent){
  var rm;
  
  // remove current and add new content to tab content container
  return function(content){
    if(typeof content === "undefined") {
      throw new Error("Content must not null or undefined");
    }
      
    return function(){
      if(rm) {
        rm();
      }

      rm = addContent(content._view);
      content.show();
    };
  };
};

// composes to add tab button
const tabButtonAddComposer = function(parentAdd, params){
  const container = new SMF.UI.Container(params); 
  parentAdd(container);

  return function(button){
    container.add(button);
  }
};

// TabButtonGroup Class
const TabButtonGroup = function(params, tabButtonsContainerProps, contentContainerProps){
  params.layoutType = SMF.UI.LayoutType.FLOW;
  //calls super constructor
  Component.apply(this, [params]);
  
  // creates change handler stream
  this._change$            = new Rx.Subject();
  this._buttonTouchHandler = tabButtonTouchHandlerComposer(this._change$);
  
  // compose method is to add new tab-button
  this._tabButtonAdd = 
    tabButtonAddComposer(
        Component.prototype.add.bind(this)
      // tab-button container props
      , tabButtonsContainerProps
      );
    
  // compose method is to change tab content
  this._changeContent = 
    changeContentComposer(
      addContentComposer(
          // binds super add method
          Component.prototype.add.bind(this)
          // content container props
        , contentContainerProps
        )
    );
};

TabButtonGroup.prototype.changeTab = function(index){
};

// Extends from Component Class
TabButtonGroup.prototype = Object.create(Component.prototype);

// Overrides super add method
TabButtonGroup.prototype.add = function(button, content, name, isSelected){
  const onTouch = this
    ._buttonTouchHandler(
          name
        , this._changeContent(content)
      );
  
  button.onTouch = onTouch;
  
  this._tabButtonAdd(button);
  
  if(isSelected) {
    onTouch.call(button);
  }
};

// returns change handler stream
TabButtonGroup.prototype.changeHandler = function(){
  // triggers stream When user presses button is not selected
  return this
    ._change$
    .distinctUntilChanged()
    .shareReplay(1);
};

module.exports = TabButtonGroup;
