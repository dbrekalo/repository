;(function($, window){

	"use strict";

	$.wk = $.wk || {};

	var registry = {},
		baseUrl = "",
		loadEngine = $.wk.load || window.yepnope || (window.Modernizr && window.Modernizr.load );

	function requireResource(key){

		if (!registry[key]) { throw 'There is no "'+ key +'" service registered'; }

		if (registry[key].resolvedDeferred.state() === 'resolved') { return; }

		if (registry[key].dependencies) {

			repo.require(registry[key].dependencies, function(){
				tryResolveOrLoad(key);
			});

			return;

		}

		tryResolveOrLoad(key);

	}

	function tryResolveOrLoad(key) {

		if (registry[key].resolver()) {

			registry[key].onResolve && registry[key].onResolve();
			registry[key].resolvedDeferred.resolve();

			return;
		}

		var resourcesList = registry[key].resources;

		repo.load({
			load: $.isArray(resourcesList) ? resourcesList.slice(0) : resourcesList,
			complete: function(){

				if (registry[key].resolvedDeferred.state() !== 'resolved') {
					registry[key].onResolve && registry[key].onResolve();
				}

				registry[key].resolvedDeferred.resolve();

			}
		});
	}

	var repo = {

		require: function(key, callback, context){

			var deferreds = [],
				keys = $.isArray(key) ? key : key.split(" ");

			$.each(keys, function(i,resource){

				deferreds.push(registry[resource].resolvedDeferred);
				requireResource(resource);

			});

			$.when.apply(window,deferreds).done(function(){

				var params = [];
				for (var i = 0; i < (arguments.length || 1); i++) {
					params.push( typeof registry[keys[i]].provides === 'function' ? registry[keys[i]].provides() : registry[keys[i]].resolver() );
				}
				context ? callback.apply(context, params): callback.apply(window,params);

			});

			return repo;

		},

		register: function(key, resources, resolver, params){

			var resourceParams = {};

			if ($.isPlainObject(resources)){
				resourceParams = resources;
			} else {
				resourceParams = $.extend({'resources': resources, 'resolver': resolver}, params);
			}

			if (typeof resourceParams.resolver === 'string'){
				var namespace = resourceParams.resolver;
				resourceParams.resolver = function(){ return repo.exists(namespace); };
			}

			registry[key] = resourceParams;
			registry[key].resolvedDeferred = $.Deferred();

			return repo;

		},

		load: function(params){

			var sufix = repo.load.sufix;
			var param_names = ['load', 'nope', 'yep'];

			$.each(param_names, function(i, item){

				if( params[item] ){
					if ( $.isArray(params[item]) ) { $.each(params[item], function(i){ params[item][i] = baseUrl + params[item][i] + sufix; }); }
					else { params[item] = baseUrl + params[item] + sufix; }
				}

			});

			if (!loadEngine) { throw 'There is no loader engine available (Yepnope or Modernizr.load or Simpleloader)'; }

			if ( repo.load.lesserBrowserCondition ) { setTimeout(function(){ loadEngine(params); }, 20); }
			else { loadEngine(params); }


		},

		setBaseUrl:function( path ){

			baseUrl = path;
			return repo;

		},

		setLoadEngine: function(engine){

			loadEngine = engine;
			return repo;

		},

		exists: function(namespace){

			var pieces = namespace.split('.'),
				current = window;

			for(var i in pieces){ if(!(current = current[pieces[i]])) { return false; }	}

			return true;
		}

	};

	$.wk.repo = repo;

	repo.load.sufix = '?v=' + new Date().getTime();
	repo.load.lesserBrowserCondition = false;

})(window.jQuery || window.Zepto, window);