
     ____                       _    __                      _       
    / ___| _ __ ___   __ _ _ __| |_ / _| __ _  ___ ___      (_) ___  
    \___ \| '_ ` _ \ / _` | '__| __| |_ / _` |/ __/ _ \     | |/ _ \ 
     ___) | | | | | | (_| | |  | |_|  _| (_| | (_|  __/  _  | | (_) |
    |____/|_| |_| |_|\__,_|_|   \__|_|  \__,_|\___\___| (_) |_|\___/ 
    -----------------------------------------------------------------

# Smartface Javascript SDK Core
For development on smartface cloud ide, please use instructions of [https://github.com/smartface/smartface-core-workspace](https://github.com/smartface/smartface-core-workspace)

### What is the Core
Our core sdk for Component Oriented Application development.

### UIComponent Flow
1. Create components inherit from /component/UIComponent via /core/extend.
2. Pass Parameters to UIComponent constructor
3. Define public methods into the /core/extend
4. Add component to page or container components

#### For example : 
```js
const extend = require("js-base/core/extend");
const UIComponent = require("js-base/component/ui-component");

const CheckBoxButton = extend(UIComponent)(
    // Component constructor
	function(_super, text){
		_super(this, 
			{
				width: 150,
				height: 30,
				borderWidth: 1
			},
			"checkbox",
			{
				checked: false
			}
		);
		
		this.checkedRect = new SMF.UI.Rectangle({
			fillColor: "#000000",
			width: 15,
			height: 15,
			left: 7.5,
			top: 7.5,
			alpha: 0
		});
		
		this.checkedAreaRect = new SMF.UI.Rectangle({
			fillColor: "#ffffff",
			width: 30,
			top: 0,
			left: 0,
		  borderWidth: "1px",
      borderColor: "#305E75",
			height: 30
		});
		
		this.label = new SMF.UI.Label({
			text: text,
			top: 0,
			left: 40,
			height: 30
		});
		
		this.label.font.size = 26;
		
		this.add(this.label);
		this.add(this.checkedAreaRect);
		this.add(this.checkedRect);
		
		var changeState = this._changeState.bind(this);
		
		this.getEventStream("onTouch")
			.subscribe(function(e){
				changeState(({checked: !e.state.checked}));
			})
	},
	// Component public methods
	function(_proto){
    _proto.stateChangedHandlder = function(state){
			this.checkedRect.alpha = state.checked? 1:0;
		};
		_proto.changeButton = function(){
		};
	}
);
	
module.exports = CheckBoxButton;

```

### Working with Pages




## Support & Documentation & Useful Links
Guides: https://www.smartface.io/guides
API Docs: https://docs.smartface.io
Smartface Cloud Dashboard: https://cloud.smartface.io 
Smartface On-Device Emulator Download: https://smf.to/app
