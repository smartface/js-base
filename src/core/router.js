var Router = {};

Router.__routes = [];

/**
 * Routing history cache object
 */
const RouteHistory = function() {
  var head = 0;
  var cache = [];

  return {
    getHistoryByPath: function(path){
      var page;

      cache.some(function(history){
        if(history.path == path){
          page = history.instance;
          return true;
        }
      });
      
      return page;
    },
    push: function(path, params) {
      cache.push({
        path: path,
        params: params
      });
      head++;
    },
    clearAfter: function() {
      if (head != 0) {
        cache = cache.slice(0, head);
      }
    },
    next: function() {
      if (cache.length >= head) {
        head++;
      }
      return this;
    },
    prev: function() {
      if (head > 0) {
        head--;
      }

      return this;
    },
    clear: function() {
      cache = [];

      return this;
    },
    current: function() {
      return cache[head];
    }
  }
};

Router.__history = RouteHistory();

/**
 * Adds a new route
 *
 * @param path
 * @param pageClass
 * @param transitionParams
 */
Router.add = function(path, pageClass, transitionParams) {
  this.__routes[path] = {klass: pageClass, transitionParams: transitionParams};
};

/**
 * Creates and shows a page by specified with path and injects params to constructure.
 *
 * @param path
 * @param params
 */
Router.go = function(path, params) {
  var route = this.__routes[path];
  params = Object.assign({}, params);
  
  if(route.klass){
    var page;
    if(!(page = this.__history.getHistoryByPath(path)) ) {
      page = new route.klass(params);
      const instance = page;
      
      this
        .__history
        .push({
          path
          , params
          , instance
        });
    }
    
    page.setRouteParams(params);
    page.show.apply(page, route.transitionParams());
    // (SMF.UI.MotionEase.DECELERATING, SMF.UI.TransitionEffect.RIGHTTOLEFT, SMF.UI.TransitionEffectType.REVEAL,false,false)
    // .apply(page, route.transitionParams());
  } else {
    throw new Error("[ Router ] Page cannot be found on path : "+path);
  }
};

/**
 * Pushes new route to history
 *
 * @param path
 * @param params
 */
Router.pushHistory = function(path, params) {
  this.__history.push({path:path, params:params});
  this.__history.clearAfter();
}

/**
 * Shows next page in routing history
 */
Router.next = function() {
  var history = this
    .__history
    .next()
    .current();
    
  if (history) {
    this.go.call(this, history.current());
  }
}

/**
 * Shows previous page in routing history
 */
Router.back = function() {
  var history = this
    .__history
    .prev()
    .current();
    
  if (history) {
    this.go.call(this, history.current());
  }
}

/**
 * clears routing history
 */
Router.clearHistory = function() {
  this.__history = [];
}

module.exports = Router;