const stateContainer = function (initialState, onChange) {
  var state = Object.assign({}, initialState);

  return function(update){
    if(update){
      Object.assign(state, update);
    }
    return Object.assign({}, state);
  };
};

module.exports = stateContainer;