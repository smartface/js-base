
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

### Core Api
#### Creating UIComponents

**/js-base/core/extend** inheritance container is to use creating components, pages or custom.

#### Usage
Pass as a parameter super class of component using /js-base/component/uicomponent for first call and returns inherintance container for the new components. Then you can create an instance of new component. UIComponent is creates instance of [SMF.UI.Container](http://docs.smartface.io/?topic=html/AllMembers_T_SMF_UI_NavigationBar.htm#!/api/SMF.UI.Container) and adds child component to.

```js
const extend = require("/js-base/core/extend");
const UIComponent = require("/js-base/component/uicomponent");

// First call
const newCompContainer = extend(
  UIComponent
);
```


Then you can create new component instance that use component container. First parameter is the constructor of the new component. Super class constructor is injected to component constructor by extend. Then you must pass component scope to super class constructor first and second parameter is the [SMF.UI.Container](http://docs.smartface.io/?topic=html/AllMembers_T_SMF_UI_NavigationBar.htm#!/api/SMF.UI.Container) properties. Third is the unique name of component is not required. And last parameter is the initialState of concrete component. State saves behaviours of components and when state is changed then component must be changed.

```js 
const concreteComp = newComponentContainer(
// Component constructor
function(_superConstructor){
	_superConstructor(
		/// pass component scope to super
		this,
		// pass SMF.UI.Container properties
		{
			width: 150,
			height: 30,
			borderWidth: 1
		},
		// pass name of component
		"name-of-compnent",
		// pass initial state of component
		{
			isClosed: false,
			count: 0
		}
	), 
	// Second parameter
	...
	
)
```

Second parameter of call is to define public methods to concrete component.

```js
	...
	), 
	// Second parameter
	function(_public){
		_public.addtoCount = function(num){
			this._changeState({
				count: (this.state.count+num)
			})
		}
	}


```

As conventionally, component's state cannot be changed externally and uses props to modify externally components instead of states. Prop(ertie)s are exposed attributes of components. Props may be an event listener callback or color of a button component. But state is the snapshot of the component behaviour like isClicked, clickCount etc. 

```js
	
const concreteComp = newComponentContainer(
// Component constructor
	function(_superConstructor){
		_superConstructor(
			// pass component scope to super
			this,
			// pass SMF.UI.Container properties
			{
				width: 150,
				height: 30,
				borderWidth: 1
			},
			// pass name of component
			"name-of-compnent",
			// pass initial state of component
			{
				isClosed: false,
				count: 0
			}
		)
	}, 
	// Second parameter
	function(_public){
		_public.addtoCount = function(num){
			// inherited from UIComponent
			this._changeState({
				count: (this.state.count+num)
			})
		}	
	)
```

State can only be changed via inherited this._changeState() method of component. 

```js
	...
		this._changeState({
			count: (this.state.count+num)
		})
	...

```

And when state is changed by any interaction then triggered **stateChangedHandler** lifecycle event callback.

```js
	...
	// Component constructor
	function(_superConstructor){
		...
		
		this.label = new SMF.UI.Label({
			text: text,
			top: 0,
			left: 40,
			height: 30
		});
		this.label.font.size = 26;
		this.add(this.label);
	},
	// Second parameter
	function(_public){
		_public.addtoCount = function(num){
			// inherited from UIComponent
			this._changeState({
				count: (this.state.count+num)
			})
		}
		// overrides lifecycle event callback
		_public.stateChangedHandler = function(state){
			// state is changed then update label
			this.label.text = "Count is "+this.state.count;
		}
	}
	
	...

```

And you can subscribe any event of SMF.UI.Container of component internal or externally.
onControlAdd( e )
Fired when a child control (for each control) is added (Fired after added) ...
onControlRemoved( e )
Fired when a child control (for each control) is removed (Fired after remove) ...
onHide( e )
onShow( e )
onTouch( e )
onTouchEnded( e )

```js
	...
	// Component constructor
	function(_superConstructor){
		...
		
		// Subscription to onTouch callback of SMF.UI.Container of the component
		// 
		this.getEventStream("onTouch")
			.subscribe(function(e){
				this._changeState(({checked: !e.state.checked}));
			}.bind(this))
	},
	...
	
	// or externally
	
	var comp = new concreteComp("custom param");
	comp.getEventStream("onTouch")
		.subscribe(function(e){
			// do something
		});
		
	comp.getEventStream("onTouchEnded")
		.subscribe(function(e){
			// do something
		})		
		
	// or
	const listener = function(e){
		if(e.type == "onTouch"){
			// do something
		} else if(e.type == "onTouchEnded"){
			// do another
		}
	}
	
	comp.getEventStream("onTouch")
		.subscribe(listener);
		
	comp.getEventStream("onTouchEnded")
		.subscribe(listener);
		

```


#### For example : 
```js
const extend = require("js-base/core/extend");
const UIComponent = require("js-base/component/ui-component");

const CheckBoxButton = extend(UIComponent)(
    // Component constructor
	function(_super, text){
		// Initializes UIComponent constructor
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
