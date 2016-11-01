const extend = require("../core/extend");
const AbstractPage = require("../core/abstract-page");

const Page = extend(AbstractPage)(
	//Page Constructor
	function(_super, params){
		_super(this, view);
	},
	//Page Public Methods
	function(_proto){
		_proto.show = function(){
			this._view.show.apply(this._view, arguments);
		};
	});

function page1_onShow() {
	alert("Hello World");
};

module.exports = Page;