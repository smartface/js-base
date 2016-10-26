/**
 * Created by smartface on 10/19/16.
 */
// const _concrete = function () {
//   f.call(this);
//   _super.apply(this, arguments);
// };
//
// _concrete.prototype = Object.create(f.prototype);
// f.prototype = Object.create(_super.prototype);
//
// return _concrete;

    // if(typeof _super._map === "function"){
    //   _super._map(function(self, parent){
    //     f.prototype = Object.create(self.prototype);
    //   });
    // } else {
    //   f.prototype = Object.create(_super.prototype);
    // }
    
    // const bounded = f.bind(null, _super);
    // bounded._map = function(cb){
    //   return cb(f, _super);
    // }
    // return bounded;


// return concrete class composer
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
    
    if(addMethods) {
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
        
        // call super constructure, with concrete scope
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