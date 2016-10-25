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

function bind(context) {
    var self = this;
    return function() {
        self.apply(context, arguments);
    }
}

// return concrete class composer
const extend = function (_super) {
  return function (f, addMethods) {
    f.prototype = _super.prototype;
    
    if(addMethods){
      addMethods(f.prototype);
    }
    
    const bound = f.bind(null, _super)
    bound.prototype = f.prototype;
    return bound;
  };
};

module.exports = extend;