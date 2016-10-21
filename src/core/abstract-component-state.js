const stateContainer = function (initialState, onChange) {
  var state = Object.assign({}, initialState);

  return function(update){
    if(update){
      Object.assign(state, update);
    }

    return function (f) {
      f(Object.assign({}, state));
    }
  }
};

const AbstractComponentState = function (initialState) {
  const state = stateContainer(initialState);

  this.map = function (f) {
    state(f);
  };
};

AbstractComponentState.prototype.changeStateHandlder = function(state) {
  throw new Error("Abstract changeStateHandler method must overriden");
};

module.exports = AbstractComponentState;