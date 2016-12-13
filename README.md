
     ____                       _    __                      _       
    / ___| _ __ ___   __ _ _ __| |_ / _| __ _  ___ ___      (_) ___  
    \___ \| '_ ` _ \ / _` | '__| __| |_ / _` |/ __/ _ \     | |/ _ \ 
     ___) | | | | | | (_| | |  | |_|  _| (_| | (_|  __/  _  | | (_) |
    |____/|_| |_| |_|\__,_|_|   \__|_|  \__,_|\___\___| (_) |_|\___/ 
    -----------------------------------------------------------------

# Smartface Javascript SDK Core
For development on smartface cloud ide, please use instructions of [https://github.com/smartface/smartface-core-workspace](https://github.com/smartface/smartface-core-workspace)

### What is the SDK Core
Our core sdk for Component Oriented Application development.

![Class Diagram](/diagram.png "Class Diagram")

### Core Api
#### Creating UIComponents

**/js-base/core/extend** inheritance container is to use creating components, pages or custom.

#### Usage
Pass **/js-base/component/uicomponent** as super class parameter for the first call then "extend" returns inherintance container for the new components. So that you can create an instance of new components which are inherited from UIComponent. UIComponent creates instance of [SMF.UI.Container](http://docs.smartface.io/?topic=html/AllMembers_T_SMF_UI_NavigationBar.htm#!/api/SMF.UI.Container) and adds child component to.

```js
const extend = require("/js-base/core/extend");
const UIComponent = require("/js-base/component/uicomponent");

// First call
const newCompContainer = extend(
  UIComponent
);
```


Then you can create new component instance via component container. First parameter is the constructor of the new component. Super class constructor is injected to component constructor by extend. 

You must pass component scope to super class constructor first and Second parameter public methods is the [SMF.UI.Container](http://docs.smartface.io/?topic=html/AllMembers_T_SMF_UI_NavigationBar.htm#!/api/SMF.UI.Container) properties. Third is the unique name of component is not required. And last parameter is the initialState of concrete component. State is to save behaviours of components and when state is changed then component must be changed.

```js 
const concreteComp = newComponentContainer(
/**
 * concreteComp constructor
 * 
 * @param _superConstructor Super class constructor
 * @param customParam Custom param of the component
 */
function(_superConstructor, customParam){
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
	// Second parameter public methods
	...
	
)
```

Second parameter public methods of call is to define public methods to concrete component.

```js
	...
	), 
	// Second parameter public methods
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
	
/**
 * concreteComp Component constructor would be CheckBox or an another concrete component.
 * and you can creare instace of concreteComp like below
 * 
 * var comp = new concreteComp("this is the custom param's value");
 */
const concreteComp = ComponentContainer(
	/**
	 * concreteComp constructor
	 * 
	 * @param _superConstructor Super class constructor
	 * @param customParam Custom param of the component
	 */
	function(_superConstructor, customParam){
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
	// Second parameter public methods
	function(_public){
		_public.addtoCount = function(num){
			// inherited from UIComponent
			this._changeState({
				count: (this.state.count+num)
			})
		}	
	)
```

State can only be changed via this._changeState() which is inherited method of UIComponent.

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
	/**
	 * concreteComp constructor
	 * 
	 * @param _superConstructor Super class constructor
	 * @param customParam Custom param of the component
	 */
	function(_superConstructor, customParam){
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
	// Second parameter public methods
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

And you can subscribe any event of SMF.UI.Container of the component, internal or externally. Injects event object to subscription callback and pass event object that contains event's type and current component state.
##### SMF.UI.Container event callbacks
Callbacks are different from component's events. Callbacks are always start with "on" prefix. Callbacks are only used with SMF View Components like SMF.UI.Label, SMF.UI.Container and others. "on" prefix reserved usage of callbacks and you musn't use for component events.
- onControlAdd
Fired when a child control (for each control) is added (Fired after added) ...
- onControlRemoved
Fired when a child control (for each control) is removed (Fired after remove) ...
- onHide
- onShow
- onTouch
- onTouchEnded

```js
	...
	/**
	 * concreteComp constructor
	 * 
	 * @param _superConstructor Super class constructor
	 * @param customParam Custom param of the component
	 */
	function(_superConstructor, customParam){
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

You can also dispatch custom events. Conventionally events are ending with "Event" keyword and initially assigns empty function.
```js
	...
	// Second parameter public methods
	function(_public){
		_public.countChangedEvent = function(){}
		_public.addtoCount = function(num){
			...
			// dispatches event stream
			this.countChangedEvent();
			...
		}
	}
	...
```

#### Another example : 
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
   	 _proto.stateChangedHandler = function(state){
			this.checkedRect.alpha = state.checked? 1:0;
		};
		_proto.changeButton = function(){
		};
	}
);
	
module.exports = CheckBoxButton;

```

### Component StyleSheet
UIComponents are styleable components. 

### js-base/core/styler
**styler(style)(className)(updateCallBack(className, key, value))**
Creates styling container.
```js
var style = {
	...
}
var styling = styler(style);

...
```
### Creating Style Object
You can create objects using '.' for className and '&' for component instances.
```js
var warnColor = "#0c77ff";

var style = {
  ".checkbox": {
    width : "150dp",
    height: "30dp",
    ".warn": {
      "&container":{
        borderColor: normalColor,
      },
      "&label": {
        font:{
          size: "28dp"
        }
      },
      "&checkedRect":{
        fillColor: normalColor
      },
      "&checkedAreaRect":{
        borderColor:  normalColor
      }
    }
  }
};

var styling = styler(style);

```
***Usage of Styler***
```js
const CheckBoxButton = extend(UIComponent)(
	function(_super, text){
		_super(
			// for initializing super component as this scope
			this, 
			// Component container properties
			{
				...
			},
			// component style id
			"&container",
			// initial state of component
			{
				...
			}
		);
		
	...	
	
		this.checkedRect = new SMF.UI.Rectangle({
			fillColor: "#000000",
			width: "15dp",
			height: "15dp",
			left: "7.5dp",
			top: "7.5dp",
			alpha: 0,
			name: "checkedRect"
		});
		
		this.checkedAreaRect = new SMF.UI.Rectangle({
			fillColor: "#ffffff",
			width: "30dp",
			top: 0,
			left: 0,
			borderWidth: "1dp",
     			borderColor: "#305E75",
			height: "30dp",
			name: "checkedAreaRect"
		});
		
		this.label = new SMF.UI.Label({
			text: text,
			top: 0,
			left: "40dp",
			height: "30dp",
			name: "label",
			// if this propery is true then onTouch event of parent Container of this Label cannot be captured.
			touchEnabled: false
		});
		
		this.label.font.size = "26dp";
		
		this.add(this.label, "&label");
		this.add(this.checkedAreaRect, "&checkedAreaRect");
		this.add(this.checkedRect, "&checkedRect");
	...
);

/** {UIComponent} */
var btn = new CheckBoxButton("Touch me!");
btn.setClassName(".checkbox.warn");
btn.setStyler(styling);

```

### js-base/core/styler
**styler(style)(className)(updateCallBack(className, key, value))**

### js-base/component/UIComponent Style Api
- **setStyler(styler)**
Assigns js-base/core/styler container to UIComponent instance.
- **setClassNames(className)**
Assigns styling classNames to UIComponent

### Working with Pages
Pages are root view containers.

#### Creating a Page
Creating a page using (SMF.UI.Page)[http://docs.smartface.io/#!/api/SMF.UI.Page] Control like below
 ```js
 var homePage = new SMF.UI.Page({
 	// page properties
 });
 
 ```
 After that you can call page to show on screen 
 ```js
 homePage.show();
 ```

Creating a page using js-base/extend below
```js
//home-page.js
const Page = require('js-base/compnent/page');
const extend = require('js-base/core/extend');

const HomePageClass = extend(Page)(
	// homePage Constructor
	function(superPageConstructor, customPageParam){
		superPageConstructor(
			// initalizes super class for this page scope
			this,
			// Page properties
			{},
			// name of the page
			"name-of-page",
			// initial state of the page
			{
				loading: false
			}
		)
	},
	// public methods of the page
	function(publicMethods){
		// overrides abstract method of the abstract page
		// This method is used by Router to inject routing data like userId, productId etc.
		publicMethods.setRouteParams = function(param){
		}
	}
	);
	
const homePage = new HomePageClass(
	// this is the customPageParam
	{
		title: "User Home Page"
	});
	
	// then call to show page object on screen
	homePage.show();
```

#### Using Page Router
Router manages application routes like other frameworks for example angularjs, react-router etc.

First, we register pages of application.
```js

Router.add(
	// Routing name
	"product-home", 
	// Page Class
	HomePageClass
);

// to call page anywhere of application, we can call like below
Router.go(
	"product-home",
	productId
);

```



## Support & Documentation & Useful Links
Guides: https://www.smartface.io/guides
API Docs: https://docs.smartface.io
Smartface Cloud Dashboard: https://cloud.smartface.io 
Smartface On-Device Emulator Download: https://smf.to/app
