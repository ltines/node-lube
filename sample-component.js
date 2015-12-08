'use strict';

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
			return Promise.resolve({});
		}
    }
}