;(function($, window){

	"use strict";

	$.wk = $.wk || {};

	var registry = {},
		baseUrl = "",
		loadEngine = $.wk.load || window.yepnope || (window.Modernizr && window.Modernizr.load );

	function requireResource(key){

		if (registry[key].deferred.state() === 'resolved') { return; }

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
			registry[key].deferred.resolve();

			return;
		}

		var resourcesList = registry[key].resources;

		repo.load({
			load: $.isArray(resourcesList) ? resourcesList.slice(0) : resourcesList,
			complete: function(){

				if (registry[key].deferred.state() !== 'resolved') {
					registry[key].onResolve && registry[key].onResolve();
				}

				registry[key].deferred.resolve();

			},
			fail: function(){

				registry[key].deferred.reject();

			}
		});
	}

	function registerResource(key, params){

		var namespace = params.namespace ? params.namespace :  params.resolver ? params.resolver : key;

		params.resolver = function(returnNamespace){
			return repo.exists(namespace, returnNamespace);
		};

		registry[key] = params;
		registry[key].deferred = $.Deferred();

		if (registry[key].resolver()) {
			registry[key].scriptCached = true;
		}

	}

	var repo = {

		require: function(key, doneCallback, context){

			var deferreds = [],
				requireDeferred = $.Deferred(),
				keys = $.isArray(key) ? key : key.split(" ");

			$.each(keys, function(i,resource){

				if (registry[resource]){
					deferreds.push(registry[resource].deferred);
					requireResource(resource);
				}
				else {
					requireDeferred.reject();
				}

			});

			if (doneCallback) {

				$.when(requireDeferred).done(function(){

					var params = [];
					for (var i = 0; i < (deferreds.length || 1); i++) {
						params.push( typeof registry[keys[i]].provides === 'function' ? registry[keys[i]].provides() : registry[keys[i]].resolver(true));
					}

					context ? doneCallback.apply(context, params): doneCallback.apply(window,params);

				});

			}

			$.when.apply(window,deferreds).done(function(){
				requireDeferred.resolve();
			}).fail(function(){
				requireDeferred.reject();
			});

			return requireDeferred;

		},

		register: function(key, resources, resolver, params){

			var resourceParams = {};

			if ($.isPlainObject(resources)){
				resourceParams = resources;
			} else {
				resourceParams = $.extend({'resources': resources, 'resolver': resolver}, params);
			}

			registerResource(key,resourceParams);

			return repo;

		},

		config: function(config){

			$.each(config.resources, function(key,params){
				registerResource(key, params);
			});

			config.baseUrl && repo.setBaseUrl(config.baseUrl);
			config.loadEngine && repo.setLoadEngine(config.loadEngine);
			config.loadSufix && repo.setLoadSufix(config.loadSufix);
			typeof config.lesserBrowserFlag !== 'undefined' && repo.setLesserBrowserFlag(config.lesserBrowserFlag);

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

			if ( repo.load.lesserBrowserFlag ) { setTimeout(function(){ loadEngine(params); }, 20); }
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

		setLoadSufix: function(sufix){

			repo.load.sufix = sufix;
			return repo;
		},

		setLesserBrowserFlag: function(flag){

			repo.load.lesserBrowserFlag = flag;
			return repo;

		},

		exists: function(namespace, returnNamespace){

			var pieces = namespace.split('.'),
				current = window;

			for(var i in pieces){
				current = current[pieces[i]];
				if(typeof current === 'undefined') { return false; }
			}

			return returnNamespace ? current : true;
		},

		isScriptCached: function(key){

			return !!registry[key].scriptCached;

		}

	};

	$.wk.repo = repo;

	repo.load.sufix = '';
	repo.load.lesserBrowserFlag = false;

})(window.jQuery || window.Zepto, window);