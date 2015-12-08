'use strict';

var unsatisfiedRequirement = {

};

function insertRequires(instance, requireArray) {
    for (var i = 0; i < requireArray.length; i++) {
        if (!instance._components[requireArray[i]]) {
            instance._components[requireArray[i]] = unsatisfiedRequirement;
        }
    }
}

function insertProvides(instance, name, promise, context, replace) {
    if (!replace && (
        instance._components[name] &&
        instance._components[name] !== unsatisfiedRequirement
        )
    )
        throw new Error('Plugin that provides ' + name + ' is already registered.');
    instance._components[name] = { context: context, promise: promise };
}

function useOne(instance, plugin, replace) {
    if (!plugin)
        return;
    insertRequires(instance, plugin.req);
    insertProvides(
        instance,
        plugin.provides,
        plugin.providePromise,
        plugin.context,
        replace
    );
}

/**
 * Simple container to provide a DI. All components are returned as promises.
 * Lifecycle of components are handled by client application by nesting promises.
**/
module.exports = function (){
	return {
        _components: {},
        /**
         * Registeres a component to inject. If there is a component with the same name
         * already registered and replaceIfExists is false, throws. 
         * @param {Object|Object[]} component - Definition of a component(s)
         * @param {boolean} replaceIfExists - Specifies whether a component with the same name should be replaced with this one.
         * @returns {Object} Container 
         **/ 
        use: function use (component, replaceIfExists) {
			if(component instanceof Array)
			{
				for(var i = 0; i < component.length; i++ )
				{
					useOne(this, component[i], replaceIfExists);
				}
			}
			else
			{
				useOne(this, component, replaceIfExists);
			}
			
			return this;
		},
		/**
         * Check whether all compontents have satisfied dependecies.
         * @returns {Object} Container
         **/
		check: function check ()
		{
			//make sure no _plugin is unsatisfied requirement
			for(var name in this._components){
				if(this._components[name] === unsatisfiedRequirement)
				{
					throw new Error(name + ' hasn\'t been satisfied');
				}
			}
			
			return this;
		},
        /**
         * Returns all components with name matching the regular expression
         * @param {Regex} nameRegex - regular expression to filter components
         * @return {Promise[]} All matching components. If none of the components matches returns promise of an empty array. 
         **/ 
		allComponents: function allComponents (nameRegex){
			var promises = [];
			for(var name in this._components)
			{
				if(name.match(nameRegex))
				{
					promises.push(this.component(name));
				}
			}
			
			return Promise.all(promises);
        },
        /**
         * Returns first component that matches the name
         * @param {string} name - Component name to match
         * @return {Promise} Matched component or throws
         **/
		component: function component (name)	//promise for registered component
        {
			if(!this._components[name])
				throw new Error('Cant provide ' + name);
			var component = this._components[name];
			
            return component.promise.call(component.context || this, this);
		}
	};
};