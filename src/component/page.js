const extend = require("../core/extend");
const AbstractPage = require("../core/abstract-page");

const Page = extend(AbstractPage)(
	//Page Constructor
	function(_super, params){
		var view = new SMF.UI.Page(params);
		_super(this, view);
	},
	//Page Public Methods
	function(_proto){
		_proto.show = function(){
			this._view.show();
		};
	});

function page1_onShow() {
	alert("Hello World");
};

module.exports = Page;