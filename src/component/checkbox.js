const component = require("../component/component").component;

/**
 *
 * @param _super
 * @param param
 */
const constructor = function (_super, view, params) {
  _super.apply(
    this,
    view,
    {checked: false}
  );
};

const CheckBox = component(constructor);

CheckBox.prototype.toggle = function () {
  const state = this._changeState();
  this._changeState({checked: !state.checked});
};

CheckBox.prototype.subscribe = function (f) {
  return f();
};
