/**
 * Created by smartface on 10/19/16.
 */

// return concrete class composer
const extend = function (_super) {
  return function (f) {
    f.prototype = Object.create(_super.prototype);
    return (f.bind(null, _super));
  };
};

module.exports = extend;