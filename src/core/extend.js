/**
 * Extend is the inheritance tool to create components, pages etc.
 * 
 * @verison 1.0.0
 * @params {function} _super Super class constructor which is interited by concrete class
 */
const extend = function (_super) {
  return function (f, addMethods) {
    var __super = _super;
    
    if(_super.__map__){
      _super.__map__(function(fn){
        // if _super is bounded function, extract original function
        __super = fn;
        f.prototype = Object.create(fn.prototype);
      });
    } else {
      __super = _super;
      f.prototype = Object.create(_super.prototype);
    }
    
    // If exists user public methods helper
    if(addMethods) {
      // add methods to current class
      addMethods(f.prototype);
    }

    // original super class constructor
    const __origfn__ = function(_super){
      return function (_scope){
        //converts arguments array
        var args = Array.prototype.slice.call(arguments, 1);
        if(_scope == global){
          throw new Error("invalid scope: Global.");
        }
        
        // creates super constructor chain for nested inheritance
        if(_super.__origfn__){
          args = [_super.__origfn__].concat(args);
        }
        
        // call super constructor with concrete scope
        __super.apply(_scope, args);
        return __super;
      };
    };
    
    // bounded child class definition
    return (function(bounded){
      bounded.__map__ = function(fn){
        fn(f);
      };
      
      bounded.__origfn__ = __origfn__(_super);
      return bounded;
    })(f.bind(null, __origfn__(_super)));
  };
};

module.exports = extend;