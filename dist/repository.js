;(function($, window){

	var registry = {},
		baseUrl = "";

	function requireResource(key, resourceDeferred){

		if (!registry[key]) { throw 'There is no "'+ key +'" service registered'; }

		if (registry[key].resolved) { resourceDeferred.resolve(); return; }

		if (registry[key].resolver()) {
			if (registry[key].onResolve) { registry[key].onResolve(); }
			resourceDeferred.resolve();
			return;
		}

		repo.load({
			load: registry[key].resources,
			complete: function(){

				registry[key].resolved = true;
				if (registry[key].onResolve) { registry[key].onResolve(); }
				resourceDeferred.resolve();

			}
		});

	}

	var repo = {

		require: function(key, callback, context){

			var deferreds = [],
				keys = [];

			if ( key.indexOf(" ") != -1 ){ keys = key.split(" "); }
			else { keys.push(key); }

			$.each(keys, function(i,resource){

				var deferred = $.Deferred();
				deferreds.push(deferred);
				requireResource(resource, deferred);

			});

			$.when.apply(null,deferreds).done(function(){

				var params = [];
				for (var i = 0; i < (arguments.length || 1); i++) {
					params.push( typeof registry[keys[i]].provides === 'function' ? registry[keys[i]].provides() : registry[keys[i]].resolver() );
				}
				context ? callback.apply(context, params): callback.apply(null,params);

			});

			return repo;

		},

		register: function(key, resources, resolver, params){

			var resourceParams = {};

			if (typeof resources === 'object'){
				resourceParams = resources;
			} else {
				resourceParams = $.extend({'resources': resources, 'resolver': resolver}, params);
			}

			if (typeof resourceParams.resolver === 'string'){
				var namespace = resourceParams.resolver;
				resourceParams.resolver = function(){ return repo.exists(namespace); };
			}

			registry[key] = resourceParams;
			registry[key].resolved =  resourceParams.resolver() ? true : false;

			if (registry[key].resolved && resourceParams.onResolve){ resourceParams.onResolve(); }

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

			if (!repo.load.engine) { throw 'There is no loader engine available (Yepnope or Modernizr.load or $.wk.load)'; }

			if ( repo.load.lesserBrowserCondition ) { setTimeout(function(){ repo.load.engine.call(window,params); }, 20); }
			else { repo.load.engine.call(window,params); }

		},

		setBaseUrl:function( path ){

			baseUrl = path;
			return repo;

		},

		exists: function(namespace){

			var tokens = namespace.split('.');
			return tokens.reduce(function(prev, curr) {
				return (typeof prev === "undefined") ? prev : prev[curr];
			}, window);

		}

	};

	$.wk = $.wk || {};
	$.wk.repo = repo;

	repo.load.sufix = '?v=' + new Date().getTime();
	repo.load.lesserBrowserCondition = false;
	repo.load.engine = $.wk.load || window.yepnope || (window.Modernizr && window.Modernizr.load );

})(window.jQuery || window.Zepto, window);