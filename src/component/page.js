const Page1 = extend(AbstractPage)(
	//Page Constructor
	function(_super){
		var view = new SMF.UI.Page({
		 	//use ctrl + space to show autocomplete within curly brackets in constructors
			name: "page1",
			fillColor: "#EEEEEE",
			onShow: page1_onShow
		});
		
		var btn = new SMF.UI.TextButton({
			name: "btn",
			text: "Click me!",
			left: "15%",
			top: "70%",
			width: "70%",
			height: "10%"
		});
	
		view.add(btn);

		_super(this, view);
		
	},
	//Page Public Methods
	function(_proto){
		// _proto.show = function(){
		// 	alert(this._view)
		// };
		_proto.show = function(){
			this._view.show();
		};
		_proto.setRouteParams = function(){};
	});
	


function page1_onShow() {
	alert("Hello World");
};

module.exports = Page1;