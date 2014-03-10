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

app.register('fastsearch', 'js/fastsearch.min.js', '$.fastsearch', {
	onResolve: function(){ $.extend($.fastsearch.defaults, app.defaults.fastsearch) }
});

app.register('myModule', ['css/myModule.css', 'js/myModule.js'], 'app.modules.myModule', {
	onResolve: function(){ $.extend(app.modules.myModule.defaults, app.defaults.myModule) },
	provides: function(){ return new app.modules.myModule(); }
});

app.require('fastsearch myModule', function(fastsearch, moduleInstance){
	moduleInstance.doWork();
	$('input').fastsearch();
});

```

##Alternate syntax
```javascript
app.register('myModule', {
	resources: ['css/myModule.css', 'js/myModule.js'],
	resolver: function(){ return typeof app.modules.myModule != 'undefined'; },
	onResolve: function(){ $.extend(app.modules.myModule.defaults, app.defaults.myModule) },
	provides: function(){ return new app.modules.myModule();}
});
```
##Description
Repository is a simple and small library for managing (registering and requiring) frontend assets based on Jquery.

While repository API may remind you of Require.js - it is not a replacement for it since it does things a bit differently.
You can register any module (a plugin or some other non AMD module) in repository that can be resolved in some namespace.

Whenever you register module you provide a `resolver` parameter. The parameter can be a string or function - it is a callback
that checks if given module already exists in defined namespace. If module does not exist resources you provided while registering are loaded asynchronously on first require.

When registering module with `onResolve` callback - that callback will be executed on first require of said module. This may be useful to define or alter some plugin defaults (and this works whether plugin code is loaded asynchronously or is already in it's namespace).

Additionally - while registering module you can provide `provides` callback that sets `require` callback parameter for given module.

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