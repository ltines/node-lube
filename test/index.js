'use strict';
var should = require('chai').should(),
	expect = require('chai').expect,
	lube = require('../lube.js');
	
describe('lube', function(){
	describe('use', function(){
		it('should ignore null plugin', function(){
			var instance = lube();
			instance.use(null);
		});
		
		it('should ignore undefined plugin', function(){
			var instance = lube();
			instance.use(undefined);
		});
		
		it('should return instance of the same container', function(){
			var instance = lube();
			var returnedInstance = instance.use(null);
			returnedInstance.should.be.equal(instance);
		});
		
		it('should\'t register same component twice', function(){
			var p1 = {
				req: [],
				provides: 'test',
				providePromise: function(container){
					return Promise.resolve({});
				}
			};
			
			var instance = lube().use(p1);
			//bind return method with filled in args 
			instance.use.bind(instance, p1).should.throw();
        });
        
        it('should replace component registration if replace is true', function () {
            var p1 = {
				req: [],
				provides: 'test',
				providePromise: function(container){
					return Promise.resolve({});
				}
			};
			
			var instance = lube().use(p1);
			//bind return method with filled in args 
			instance.use.bind(instance, p1, true).should.not.throw();
        });
		
		it('should satisfy requirements with subsequent use', function(){
			var p1 = {
				req: ['test 2'],
				provides: 'test',
				providePromise: function(container){
					return Promise.resolve({});
				}
			};
			
			var p2 = {
				req: [],
				provides: 'test 2',
				providePromise: function(container){
					return Promise.resolve({});
				}
			};
			
			var instance = lube().use(p1);
			instance.check.bind(instance).should.throw();
			instance.use(p2);
			instance.check.bind(instance).should.not.throw();
		});
		
		it('already registered components should satify requirements', function(){
			var p1 = {
				req: ['test 2'],
				provides: 'test',
				providePromise: function(container){
					return Promise.resolve({});
				}
			};
			
			var p2 = {
				req: [],
				provides: 'test 2',
				providePromise: function(container){
					return Promise.resolve({});
				}
			};
			
			var instance = lube().use(p2).use(p1);
			instance.check.bind(instance).should.not.throw();
		});

		
		
	});
	describe('check', function(){
		it('should return the same container instance', function(){
			var instance = lube();
			var returnedInstance = instance.check();
			returnedInstance.should.be.equal(instance);
		});
		
		it('should throw on unsatisfied requirements', function(){
			var p1 = {
				req: ['test 2'],
				provides: 'test',
				providePromise: function(container){
					return Promise.resolve({});
				}
			};
			
			var p2 = {
				req: [],
				provides: 'test 3',
				providePromise: function(container){
					return Promise.resolve({});
				}
			};
			
			var instance = lube().use(p1).use(p2);
			instance.check.should.throw();
		});
	})	
	describe('getting component', function(){
		it('should throw on nonregistered component', function(){
			var x = 0;
			var p1 = {
				req: [],
				provides: 'test',
				providePromise: function(container){
					return Promise.resolve({});
				}
			};
			var instance = lube().use(p1);
			instance.check();
			instance.component.bind(instance, 'test 2').should.throw();
		});

		it('should return correct promise', function(done){
			var x = 0;
			var p1 = {
				req: [],
				provides: 'test',
				providePromise: function(container){
					return new Promise(function(resolve, reject){
						x++;
						resolve(x);
					});
				}
			};
			
			var instance = lube().use(p1);
			instance.check();
			instance.component('test')
			.then(function(a){
				x.should.equal(1);
				x.should.equal(a);
				done();
			})
			.catch(function(reason){
				done();
			});
			
		});
		
		it('multiple calls always resolve new promise', function(done){
			var x = 0;
			var p1 = {
				req: [],
				provides: 'test',
				providePromise: function(container){
					return new Promise(function(resolve, reject){
						x++;
						resolve(x);
					});
				}
			};
			var instance = lube().use(p1);
			instance.check();
			instance.component('test')
			.then(function(b){
				return instance.component('test');
			})
			.then(function(a){
				x.should.equal(2);
				x.should.equal(a);
				done();
			});
        });
        
        it('should use context if provided', function (done) {
            var ctx = {};
            var p1 = {
                req: [],
                provides: 'test',
                context: ctx,
                providePromise: function (container) {
                    this.should.equal(ctx); //context should be ctx
                    return Promise.resolve({});
                }
            };

            var instance = lube().use(p1);
            instance.check();
            instance.component('test')
                .then(function () {
                    done();
                });

        });
	});
	
	describe('getting multiple components', function(){
		it('should return only components specified by regex', function(done){
			var p1 = {
				req: [],
				provides: 'a/test',
				providePromise: function(container){
					return Promise.resolve('test');
				}
			};
			var p2 = {
				req: [],
				provides: 'a/test 2',
				providePromise: function(container){
					return Promise.resolve('test 2');
				}
			};
			
			var p3 = {
				req: [],
				provides: 'c/test 2',
				providePromise: function(container){
					return Promise.resolve('test 3');
				}
			};
			
			var instance = lube().use(p1).use(p2).use(p3);
			instance.check();
			
			instance.allComponents(/a\/.*/)
			.then(function(components){
				components.should.be.instanceof(Array);
				components.should.have.length(2);
				if(components[0] == 'test')
					components[1].should.equal('test 2');
				else
				{
					components[0].should.equal('test 2');	
					components[1].should.equal('test');
				}
				done();
			});
		});
		
		it('should return promise with array of components', function(done){
			var p1 = {
				req: [],
				provides: 'a/test',
				providePromise: function(container){
					return Promise.resolve('test');
				}
			};
			var p2 = {
				req: [],
				provides: 'a/test 2',
				providePromise: function(container){
					return Promise.resolve('test 2');
				}
			};
			
			var instance = lube().use(p1).use(p2);
			instance.check();
			
			instance.allComponents(/a\/.*/)
			.then(function(components){
				components.should.be.instanceof(Array);
				components.should.have.length(2);
				if(components[0] == 'test')
					components[1].should.equal('test 2');
				else
				{
					components[0].should.equal('test 2');	
					components[1].should.equal('test');
				}
				done();
			});
			
		})	
	})
});
	