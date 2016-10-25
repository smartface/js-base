const component = require("../component/component").component;

/**
 *
 * @param _super
 * @param param
 */
const constructor = function (_super, view) {
  _super.call(
    this,
    view,
    {
      checked: false
    }
  );
};

const CheckBox = component(constructor);

CheckBox.prototype.toggle = function () {
  const state = this._changeState();
  this._changeState({checked: !state.checked});
};

CheckBox.prototype.changeStateHandlder = function (state) {
  alert("state"+state);
  // return f();
};