const SMFConsole = require('../core/log');
const NullProperty = require("../core/null-property");

/** @type {SMF.UI.iOS.NavigationBar | SMF.UI.Page.actionBar}*/
const assignKeys = function(source, options, ignoreKey, hasKeyThenReload) {
  return function(key) {
    // alert(options[key]);
    if(key != ignoreKey) {
      if(key != hasKeyThenReload && source.hasProp(key)) {
        source.set(key,  options[key]);
      } else if(key == hasKeyThenReload) {
        Object.keys(options[key]).forEach(assignKeys(source, options[key], "ios", "android"));
      } else {
        throw new Error("Option ["+key+"] is not found");
      }
    }
  };
};

/**
 * Android Actionbar Proxy
 *
 * @oaram {SMF.UI.iOS.NagigationBar} navigationBar
 * @oaram {AbstractPage} page
 * @ignore
 */
const AndroidProxy = function(actionBar){
  return {
    hasProp: function(prop){
      return !(this.get(prop) instanceof NullProperty);
    }
    ,get: function(prop){
      if(actionBar.hasOwnProperty(prop)){
        return actionBar[prop];
      }

      return new NullProperty();
    }
    ,set: function(prop, value){
      if(actionBar.hasOwnProperty(prop)){
        return actionBar[prop] = value;
      } 

      return new NullProperty();
    }
  }
};

/**
 * iOS NavigationBar & NavigationItemBar
 *
 * @oaram {SMF.UI.iOS.NagigationBar} navigationBar
 * @oaram {AbstractPage} page
 * @ignore
 */
const iOSProxy = function(navigationBar, page){
  return {
    hasProp: function(prop){
      return navigationBar.hasOwnProperty(prop) 
        || (page.navigationItem && page.navigationItem.hasOwnProperty(prop));
    },
    get: function(prop){
      if(navigationBar.hasOwnProperty(prop)){
        return navigationBar[prop];
      } else if(page.navigationItem && page.navigationItem.hasOwnProperty(prop)){
        return page.navigationItem[prop];
      }

      return new NullProperty();
    },
    set: function(prop, value){
      if(navigationBar.hasOwnProperty(prop)){
        return navigationBar[prop] = value;
      } else if(page.navigationItem && page.navigationItem.hasOwnProperty(prop)){
        return page.navigationItem[prop] = value;
      }

      return new NullProperty();
    }
  }
}

const runOnAndroid = function(page, options) {
  var actionBarProxy = new AndroidProxy(page.actionBar);
  return {
    unload: function(){
      this.reset();
      page = null;
      options = null;
      actionBarProxy = null;
    }
    , reset: function(){
      Object
        .keys(HeaderBar.options)
        .forEach(
          assignKeys(actionBarProxy, HeaderBar.options, "ios", "android"));
    }
    , reload: function(){
      Object
        .keys(options)
        .forEach(assignKeys(actionBarProxy, options, "ios", "android"));
    }
    , update: function(newOptions){
      newOptions = Object.assign({}, newOptions);
      Object
        .keys(options)
        .forEach(assignKeys(actionBarProxy, options, "ios", "android"));
      options = Object.assign(options, newOptions);
    }
  };
};

const runOniOS = function(page, options) {
  var navigationProxy = new iOSProxy(SMF.UI.iOS.NavigationBar, page);
  return {
    unload: function(){
      this.reset();
      page = null;
      options = null;
    }
    , reset: function(){
      Object
        .keys(HeaderBar.options)
        .forEach(
          assignKeys(navigationProxy, HeaderBar.options, "android", "ios"));
    }
    , reload: function(){
      Object
        .keys(options)
        .forEach(assignKeys(navigationProxy, options, "android", "ios"));
    }
    , update: function(newOptions){
      newOptions = Object.assign({}, newOptions);
      Object
        .keys(options)
        .forEach(assignKeys(navigationProxy, options, "android", "ios"));
      options = Object.assign(options, newOptions);
    }
  };
};

const HeaderBar = function(page, options) {
  options = Object.assign({}, options);
  
  if (Device.deviceOS === "Android") {
    return runOnAndroid(page, options);
  } else {
    return runOniOS(page, options);
  }
};

HeaderBar.options = {
    visible: false
  , overlay: false
  , backgroundImage: null
  , backgroundColor: "#000000"
  , titleView: {}
  , enabled: true
  , ios: {
      rightBarButtonItems: []
    , leftBarButtonItems: []
    , translucent: false
  }
  , homeButton: null
  , android: {
      hideOnContentScroll: false
    , icon: null
    , onHomeIconItemSelected: null
    , displayShowHomeEnabled: false
    , alpha: 1
    , menuItems: []
  }
};

module.exports = HeaderBar;