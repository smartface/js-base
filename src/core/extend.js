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

// return concrete class composer
const extend = function (_super) {
  return function (f, addMethods) {
    var proto = f.prototype;
    f.prototype = Object.create(_super.prototype);
    if(addMethods)
      addMethods(f.prototype);
    return f.bind(null, _super);
  };
};

module.exports = extend;