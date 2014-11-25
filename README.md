#Repository
Javascript repository for registering and requiring frontend assets

##Basic usage
```javascript

app.register('fastsearch', 'js/fastsearch.min.js', '$.fastsearch');

app.require('fastsearch', function(){
	$('input').fastsearch();
});

```

##Advanced usage
```javascript

app.repository.config({
	resources: {
		'Backbone': {
			resources: 'vendor/backbone.js'
		},
		'fastsearch': {
			resources: ['css/fastsearch.css','vendor/fastsearch/dist/fastsearch.min.js'],
			namespace: '$.fastsearch',
			onResolve: function(){ $.extend($.fastsearch.defaults, app.pluginDefaults.fastsearch); }
		},
		'myModule': {
			resources: ['css/myModule.css', 'js/myModule.js'],
			namespace: 'app.modules.myModule',
			dependencies: 'Backbone',
			onResolve: function(){ $.extend(app.modules.myModule.defaults, app.defaults.myModule) }
			provides: function() { return new app.defaults.myModule(); }
		}
	},
	baseUrl: '/static/',
	resolveFileByNamespace: function(namespace){ // automatically resolve requiring of something like app.components.slider

		var namespaceParts = namespace.split('.');
		if (namespaceParts[0] !== 'app') { return false; }
		return 'js/' + namespaceParts.slice(1).join('/') + '.js';

	},
	loadSufix: '121' // for cache busting
});

app.register('searchController', {
	resources: ['css/searchController.css', 'js/searchController.js'],
	namespace: 'app.controllers.search',
	dependencies: 'myModule',
	onResolve: function(){ app.controllers.search.someBootstrapMethod(); },
	provides: function(){ return new app.controllers.search(); }
});

app.require('fastsearch myModule searchController', function(fastsearch, myModuleInstance, searchController){
	$('input').fastsearch();
	myModuleInstance.doWork();
	searchController.init();
});

```
##Description
Repository is a simple and small library for managing (registering and requiring) frontend assets based on Jquery.

While repository API may remind you of Require.js - it is not a replacement for it since it does things a bit differently.
You can register any module (a plugin or some other non AMD module) in repository that can be resolved in some namespace.

When you register module you can provide a `namespace` parameter should you choose to register it with key different from namespace. If module namespace does not exist resources you provided while registering are loaded asynchronously on first require.

When registering module with `onResolve` callback - that callback will be executed on first require of said module. This may be useful to define or alter some plugin defaults (and this works whether plugin code is loaded asynchronously or is already in it's namespace).

Any dependencies that you list for module will be resolved recursively.

While registering module you can provide `provides` callback that sets `require` callback parameter for given module.

You can achieve a form of auto loading by providing "resolveFileByNamespace" callback that is able to resolve module file path from namespace.

##Dependencies

Repository requires Jquery and resource loader to be present. (Simpleloader, Yepnope, Modernizr.load or something with yepnopish api will suffice).
You can set load engine like so `app.repository.loadEngine = window.yepnope;`

##Installation

After including library file it is recommend to alias and bring library (that is initialy in $.wk.repo namespace) to your desired namespace.
 ```javascript
 app.repository = $.wk.repo;
 app.register = app.repository.register;
 app.require = app.repository.require;
```