# node-lube
Simple dependency injector for node using Promises. Lifecycle of resolved components are handled by client via nesting promises or you can use a *lifecycleContainer*
parameter to hold references to already resolved components.
lube supports simple dependency checking between components, i.e. you can specify which components are required and *check* will fail
with they are not me.

## Installation
```
npm install lube --save
```

## Test
```
npm test
```

## Usage
### Registering
To register a component:

```javascript
var component = require('./mycomponent');
var container = require('lube')();

container
    .use(component())   //add component to the container
    .check();           //check that all dependencies have been met
```

We can even register multiple components at once:

```javascript
var component_a = require('./mycomponent'),
    component_b = require('./my-other-component');
    
var container = require('lube')();

container
    .use([component_a(),component_b()])   //add components to the container
    .check();           //check that all dependencies have been met
```

If we want to register component with the same name as already registered:

```javascript
var component_a = require('./mycomponent'),
    component_same_name_as_a = require('./my-other-component-with-same-name');
    
var container = require('lube')();

container
    .use(component_a())
    .use(component_same_name_as_a())    //this will throw
    .use(component_same_name_as_a(), true)    //this will replace component_a 
    .check();           //check that all dependencies have been met
```
### Resolving
To resolve singe component:

```javascript
container.component('name')
    .then(function(resolvedComponent){
       //Profit! 
    });
```

To resolve all components matching regex:

```javascript
//imagine we registered components route/a, route/b, system/x
container.allComponents(/^route\/.*/)
    .then(function(resolvedComponents){
       //resolvedComponents cotains route/a, route/b components but doesn't contain system/x
    });
```

### Component definition
The box-standard component looks like this:
 
```javascript
module.exports = function () {
    //returns component definition
    return {
        
        //req is an array of required components names
        req: [],
        
        //name of this component
        provides: 'config',
        
        //context (this) when calling providePromise
        //container if it's undefined 
        context: undefined,
        
        //methood that returns promise that resolves component
		providePromise: function(container)
        {
            //this is container as well
            
			return Promise.resolve({});  //returns promise that resolves the component
		}
    }
}
```

## API
For complete API documentation see [lube.js](lube.js).

## Release History

* 0.1.0 Initial release
* 0.2.0 Some more renaming from first attempt
* 0.3.0 Lifecycle support