const component = require("../component/component");

const CheckBox = component(function (_super, params) {
  _super.apply(this,
    {},
    {
      checked: false
    }
  );
});

CheckBox.prototype.toggle = function () {
  const state = this._changeState();

  this._changeState({
    checked: !state.checked
  });
};

CheckBox.prototype.changeStateHandlder = function (state) {

};