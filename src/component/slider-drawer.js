const SliderDrawerComp = function(params){
  this._view = new SMF.UI.SliderDrawer(params);
  this._isShowed = false;
};

SliderDrawerComp.prototype.show = function(){
  this._view.show();
  this._isShowed = true;
};

SliderDrawerComp.prototype.hide = function(){
  this._view.hide();
  this._isShowed = false;
};

SliderDrawerComp.prototype.toggle = function(){
  this._isShowed ? this.hide() : this.show();
};

module.exports = SliderDrawerComp;