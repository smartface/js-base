const extend = require("../core/extend");
const AbstractPage = require("../core/abstract-page");

/**
 * Page Abstraction Class
 * 
 * @version 1.1.0
 * @class
 */
const Page = extend(AbstractPage)(
	//Page Constructor
	function(_super, params){
		const view = new SMF.UI.Page(params);
		_super(this, view);
	},
	//Page Public Methods
	function(_proto){
		_proto.show = function(){
			this._view.show.apply(this._view, arguments);
		};
		_proto.setRouteParams = function(){
			throw new Error("[Page "+this.get("name")+"] setRouteParams params must be overrode.");
		}
	});

module.exports = Page;