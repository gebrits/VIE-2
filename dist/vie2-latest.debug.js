/**
 * @fileOverview VIE^2
 * @author <a href="mailto:sebastian.germesin@dfki.de">Sebastian Germesin</a>
 */

// A connector has two main functionalities:

// 1. analyze: Analysis of the given object
// 2. query: Querying for properties
Connector = function(id, options) {
	
	if (id === undefined) {
		throw "The connector constructor needs an 'id'!";
	}
	
	if (typeof id !== 'string') {
		throw "The connector constructor needs an 'id' of type 'string'!";
	}
	
	this.id = id;
	this._options = (options)? options : {};
	
	jQuery.VIE2.registerConnector(this);
};

//setter and getter for options
Connector.prototype.options = function(values) {
	if (values) {
		//extend options
		jQuery.extend(true, this._options, values);
	} else {
		//get options
		return this._options;
	}
};

Connector.prototype.analyze = function (object, namespaces, callback) {
	jQuery.VIE2.log("info", "VIE2.Connector(" + this.id + ")#analyze()", "Not overwritten!");
	callback(jQuery.rdf());
};

Connector.prototype.query = function (uri, properties, namespaces, callback) {
	jQuery.VIE2.log("info", "VIE2.Connector(" + this.id + ")#query()", "Not overwritten!");
	callback({});
};

Connector.prototype.annotate = function (elem, triple, namespaces, callback) {
	jQuery.VIE2.log("info", "VIE2.Connector(" + this.id + ")#annotate()", "Not overwritten!");
	callback({});
};

Connector.prototype.remove = function (elem, triple, namespaces, callback) {
	jQuery.VIE2.log("info", "VIE2.Connector(" + this.id + ")#remove()", "Not overwritten!");
	callback({});
};
/**
 * @fileOverview VIE^2
 * @author <a href="mailto:sebastian.germesin@dfki.de">Sebastian Germesin</a>
 */

// A <code>Mapping</code> provides functionality to map context knowledge
// to Backbone models

Mapping = function(id, types, defaultProps) {
	if (id === undefined) {
		throw "The mapping constructor needs an 'id'!";
	}
	if (typeof id !== 'string') {
		throw "The mapping constructor needs an 'id' of type 'string'!";
	}
	if (types === undefined) {
		throw "The mapping constructor needs 'types'!";
	}
	
	this.id = id;
	this.types = types;
	this.defaultProps = (defaultProps)? defaultProps : [];
	
	//automatically registers the mapping in VIE^2.
	jQuery.VIE2.registerMapping(this);
};/**
 * @fileOverview VIE^2
 * @author <a href="mailto:sebastian.germesin@dfki.de">Sebastian Germesin</a>
 */

//VIE^2 is the semantic enrichment layer on top of VIE.
//Its acronym stands for <b>V</b>ienna <b>I</b>KS <b>E</b>ntities <b>E</b>ditable.

//With the help of VIE^2, you can bring entites in your
//content (aka. semantic lifting) and furthermore interact
//with this knowledge in a MVC manner - using Backbone JS models
//and collections.
//VIE^2 has two main principles: 

//*  Connectors:
//   Connecting VIE^2 with <strong>backend</strong> services, that
//   can either analyse and enrich the content sent to them (e.g., using
//   Apache Stanbol or Zemanta), can act as knowledge databases (e.g., DBPedia)
//   or as serializer (e.g., RDFa).
//*  Mappings:
//   In a mapping, a web developer can specify a mapping from ontological entities
//   to backbone JS models. The developer can easily add types of enties and
//   also default attributes that are automatically filled with the help of the 
//   available connectors.

(function($, undefined) {

//VIE^2 is implmented as a [jQuery UI widget](http://semantic-interaction.org/blog/2011/03/01/jquery-ui-widget-factory/). 
    $.widget('VIE2.vie2', {
    	
    	// default options
    	options: {
    		//<strong>namespaces</strong>: There are currently *no* default namespaces, though
    		//we might want to change this in a future release.
    		//Namespaces can either be overridden directly using .vie2('option', 'namespaces', {}); but
    		//are parsed from the &lt;html> tag anyway during initialization (see _create(); method).
    		namespaces: {},
    		
    		//<strong>globalContext</strong>: The variable **globalContext** stores all knowledge in
    		//triples that were retrieved and annotated so far in one *rdfQuery object*. Though it is
    		//available via .vie2('option', 'globalContext'), it is highly discouraged to access it directly.
    		globalContext : jQuery.rdf(),
    		
    		//<strong>localContext</strong>: The variable **localContext** stores element-specific triples
    		//that were retrieved so far for the corresponding element. The keys are generated *ids* for each
    		//element whereas the values have two fields: **rdf** *rdfQuery object*, containing the triples and
    		//**elem** having the reference to the element.
    		localContext: {}
    	},
    	
    	//<strong>_create()</strong>: The private method **_create():** is called implicitly when
    	//calling .vie2(); on any jQuery object. Though it is possible to have multiple VIE^2 instances,
    	//there is one global VIE^2 instance: **VIE2** that is initialized after the page has finished loading:
    	//VIE2 = $(document).vie2();
    	_create: function () {
    		var that = this;
    		//init the globalContext
    		this.options.globalContext = jQuery.rdf();
    		
    		//automatically scans for xmlns attributes in the html element
    		//and adds them to the local this.options.namespaces object
    		jQuery.each(jQuery('html').xmlns(), function (k, v) {
    			that.options.namespaces[k] = v.toString();
    		});
    		
    		//scan for connector-specific namespaces
    		jQuery.each(jQuery.VIE2.connectors, function () {
    			if (this.options()['namespaces']) {
    				jQuery.each(this.options()['namespaces'], function(k, v) {
    					that.options.namespaces[k] = v;
    				});
    			}
    		});
    		
    		//add all namespaces to the triple store cache in this.options.globalContext
    		this._initNamespaces(that.options.globalContext);
    	},
    	
    	//<strong>_setOption()</strong>: Overwriting the jQuery UI widget factory method.
    	_setOption: function (key, value) {
    		if (key === 'namespaces') {
    			//extends needs to be used as the default implementation
    			//would overwrite the namespaces
    			jQuery.extend (true, this.options.namespaces, value);
    			jQuery.each(this.options.namespaces, function(k, v) {
    				this.options.globalContext.prefix(k, v);
    			});
    		} else {
    			//super._setOption()...
    			jQuery.Widget.prototype._setOption.apply(this, [key, value]);
    		}
    	},
    	
    	//<strong>_initNamespaces()</strong>: Convenience method to add the namespaces to
    	//*jQuery.rdf* objects.
    	_initNamespaces: function (rdf) {
    		jQuery.each(this.options.namespaces, function(k, v) {
    			rdf.prefix(k, v);
    		});
    	},
    	
    	//<strong>analyze()</strong>: The analyze() method sends the element to all connectors and lets
    	//them analyze the content. The connectors' methods are asynchronous calls and once all connectors
    	//returned the found enrichments in the form of *jQuery.rdf* objects, the **callback** method is
    	//executed (in the scope of the callback function, *this* refers to *elem*).<br />
    	//The returned enrichments are written into the element's local context (this.options.localContext)
    	//and also to the global context (this.options.globalContext).<br />
    	//Furthemore, each found subject in the returned knowledge is checked if there is a mapping to 
    	//backbone JS available and if so, the entity is added to the corresponding backbone collection(s).
    	analyze: function (elem, callback) {
    		var that = this;
    		//analyze() needs to be called on a DOM element.
    		if (elem === undefined) {
    			jQuery.VIE2.log("warn", "VIE2.core#analyze()", "No element specified, returning without action!");
    			callback.call(elem);
    			return;
    		}
    		//analyze() does not actually need a callback method, but it is usually good to use it 
    		if (callback === undefined) {
    			jQuery.VIE2.log("warn", "VIE2.core#analyze()", "No callback method specified!");
    		}
    		//if the element is not known yet to VIE^2, we generate an own id and add it using
    		//*jQuery.data*.
    		if (!elem.data('vie2-id')) {
    			jQuery.VIE2.log("warn", "VIE2.core#analyze()", "No element id specified, generate one dynamically and add it!");
    			var tempId = PseudoGuid.GetNew();
    			jQuery.VIE2.log("warn", "VIE2.core#analyze()", "Generated id: '" + tempId + "'!");
    			elem.data('vie2-id', tempId);
    		}
    		jQuery.VIE2.log("info", "VIE2.core#analyze()", "Start.");
    		
    		//init element's local context if not known
    		if (!this.options.localContext[elem.data('vie2-id')]) {
	    		this.options.localContext[elem.data('vie2-id')] = {
	    				rdf: jQuery.rdf(),
	    				elem: elem
	    		};
    		}
    		that._initNamespaces(that.options.localContext[elem.data('vie2-id')]['rdf']);
    		
    		//as the connectors work asynchronously, we need a queue to listen if all connectors are finished.
    		var connectorQueue = [];
    		jQuery.each(jQuery.VIE2.connectors, function () {
    			//fill queue of connectors with 'id's to have an overview of running connectors.
    			//this supports the asynchronous calls.
    			connectorQueue.push(this.id);
    		});
    		
    		jQuery.each(jQuery.VIE2.connectors, function () {
    			var connectorCallback = function (vie2, conn, elem) {
    				return function (rdf) {
    					jQuery.VIE2.log("info", "VIE2.core#analyze()", "Received RDF annotation from connector '" + conn.id + "'!");
    					console.log(rdf);
    					
    					//we add all namespaces to the rdfQuery object. 
    					//Attention: this might override namespaces that were added by the connector!
    					//but keeps consistency through the VIE^2.
    					that._initNamespaces(rdf);
    					
    					rdf.databank.triples().each(function () {
    						//add all triples to the global cache!
    						vie2.options.globalContext.add(this);
    						//fill element-specific context
    						that.options.localContext[elem.data('vie2-id')]['rdf'].add(this);
    					});
    					
    					//add all subjects to the corresponding backbone collection(s)
    					jQuery.each(rdf.databank.subjectIndex, function (subject, v) {
    						var types = [];
    						
    						//an entity of id 'subject' can only be added once to a backbone JS collection
    						//hence, we need to collect all types of that entity first in an array.
    						rdf
    						.where(subject + ' a ?type')
    						.each(function () {
    							var curie = jQuery.createCurie(this.type.value, {namespaces : that.options.namespaces});
    							types.push(curie);
    						});
    						jQuery.VIE2.addBBEntity({id : subject, a : types});
    					});
    					
    					removeElement(connectorQueue, conn.id);
    					//everytime we receive annotations from each connector, we remove the connector's id from the
    					//queue and check whether the queue is empty.
    					if (connectorQueue.length === 0) {
    						//if the queue is empty, all connectors have successfully returned and we can execute the
    						//callback function.
    						jQuery.VIE2.log("info", "VIE2.core#analyze()", "Finished! Cache holds now " + that.options.globalContext.databank.triples().length + " triples!");
    						//provide a status field in the callback object: status = {'ok', 'error'};
    						if (callback) {
    							callback.call(elem, 'ok');
    						}
    					}
    				};
    			}(that, this, elem);
    			
    			//start analysis with the connector.
 				jQuery.VIE2.log("info", "VIE2.core#analyze()", "Starting analysis with connector: '" + this.id + "'!");
    			this.analyze(elem, that.options.namespaces, connectorCallback);
    		});
    	},
    	
    	//<strong>annotate(triples, elem)</strong>: Supports the (manual) annotation of the element <strong>elem</strong>
    	// with the (semantic) data, stored in <strong>triple</strong>.
    	//<strong>triple</strong> needs to be a <i>String</i> or an array of <i>String</i>.
    	annotate: function (triples, elem) {
    		var that = this;
    		
    		if (elem !== undefined && !elem.data('vie2-id')) {
    			jQuery.VIE2.log("warn", "VIE2.core#annotate()", "No element id specified, generate one dynamically and add it!");
    			var tempId = PseudoGuid.GetNew();
    			jQuery.VIE2.log("warn", "VIE2.core#annotate()", "Generated id: '" + tempId + "'!");
    			elem.data('vie2-id', tempId);
    		}
    		if (triples === undefined) {
    			jQuery.VIE2.log("warn", "VIE2.core#annotate()", "No triple specified, returning without action!");
    			return this;
    		}
    		
    		//allocate temporary rdfQuery object
    		var rdf = jQuery.rdf({namespaces : that.options.namespaces});
    		
    		if (!jQuery.isArray(triples)) {
    			return this.annotate([triples], elem);
    		}
    		else {
    			jQuery.each(triples, function (i, t) {
    				var triple = triples[i];
    				if (typeof triple === 'string') {
    					triple = jQuery.rdf.triple(triple, {namespaces: that.options.namespaces});
    				} else {
    					//TODO?
    				}
    				rdf.add(triple);					
    			});
    		}
    		jQuery.VIE2.log("info", "VIE2.core#annotate()", "Start.");
    		
    		//(1) put it into that.options.globalContext
    		rdf.databank.triples().each(function () {
    			that.options.globalContext.add(this);
    		});

    		//(2) put it into that.options.localContext
    		if (elem !== undefined) {
    			if (!that.options.localContext[elem.data('vie2-id')]) {
    				that.options.localContext[elem.data('vie2-id')] = {
    						rdf: rdf,
    						elem: elem
    				};
    			}
    			else {
    				rdf.databank.triples().each(function () {
    					that.options.localContext[elem.data('vie2-id')]['rdf'].add(this);
    				});
    			}
    		}
    		
    		//(3) look for backbone model(s) and update their attributes.
    		jQuery.each(rdf.databank.subjectIndex, function (subject, v) {
    			var triples = this;
    			jQuery.each(triples, function (i) {
    				var triple = triples[i];
    				jQuery.each(jQuery.VIE2.Backbone, function (k, v) {
    					var ent = this['collection'].get(subject.toString());

    					if (ent) {
    						//only update the backbone entity if the property is a
    						//default property!
    						var curie = jQuery.createCurie(triple.property.value, {namespaces: that.options.namespaces});
    						if (ent.defaults[curie]) {
    							ent.change();
    							jQuery.VIE2.log("info", "VIE2.core#annotate()", "Added value to entity '" + ent.id + "' '" + curie + "' '" + triple.object.toString() + "'!");
    						}
    					}
    				});
    			});
    		});
    		
    		// (4) register new entity/ies as backbone model(s)
    		//this needs to be done *after* the properties have been loaded into
    		//the cache, as 'addBBEntity() already performs a query for the entities'
    		//properties.
    		jQuery.each(rdf.databank.subjectIndex, function (subject, v) {
    			var types = [];
    			
    			//an entity of id 'id' can only be added once to a backbone JS collection
    			//hence, we need to collect all types of that entity first in an array.
    			rdf
    			.where(subject + ' a ?type')
    			.each(function () {
    				var curie = jQuery.createCurie(this.type.value, {namespaces : that.options.namespaces});
    				types.push(curie);
    			});
    			
    			jQuery.VIE2.addBBEntity({id : subject, a : types});
    		});

    		jQuery.VIE2.log("info", "VIE2.core#annotate()", "End.");
    		jQuery.VIE2.log("info", "VIE2.core#annotate()", "Global cache holds now " + that.options.globalContext.databank.triples().length + " triples!");
    		if (elem !== undefined) {
    			jQuery.VIE2.log("info", "VIE2.core#annotate()", "Local cache of element '" + elem.data('vie2-id') + "' holds now " + that.options.localContext[elem.data('vie2-id')]['rdf'].databank.triples().length + " triples!");
    		}
    		return this;
    	},
    	
    	//<strong>query</strong>: The query function supports querying for properties. The uri needs
    	//to be of type <code>jQuery.rdf</code> object or a simple string and the property is either an array of strings
    	//or a simple string. The function iterates over all connectors that have <code>query()</code>
    	//implemented and collects data in an object.
    	//The callback retrieves an object with the properties as keys and an array of results as their corresponding values.
    	//The <i>options</i> is an object that supports the following keys:
    	//options.cache : {'nocache', 'cacheonly'} -> nocache: do not use the cache but query for data online
    	// -> cacheonly: query offline only
    	query: function (uri, props, callback, options) {
    		var ret = {};
    		jQuery.VIE2.log("info", "VIE2.core#query()", "Start!");

    		if (uri === undefined || props === undefined) {
    			jQuery.VIE2.log("warn", "VIE2.core#query()", "Invoked 'query()' with undefined argument(s)!");
    			callback(ret);
    			return;
    		} else if (!jQuery.isArray(props)) {
    			this.query(uri, [props], callback, options);
    			return;
    		}
    		
    		if (typeof uri === 'string' && jQuery.isArray(props)) {
    			var that = this;
    			//initialize the returning object
    			for (var i=0; i < props.length; i++) {
    				ret[props[i]] = [];
    			}
    			//look up for properties in options.globalContext
    			//first check if we should ignore the cache!
    			if (!options || (options && !options.cache === 'nocache')) {
    				for (var i=0; i < props.length; i++) {
    					that.options.globalContext
    					.where(jQuery.rdf.pattern(uri, props[i], '?object', {namespaces: that.options.namespaces}))
    					.each(function () {
    						ret[props[i]].push(this.object);
    					});
    				}
    			}
    			
    			//finish here if said so!
    			if (options && options.cache === 'cacheonly') {
    				callback(ret);
    				return;
    			}
    			
    			var connectorQueue = [];
    			jQuery.each(jQuery.VIE2.connectors, function () {
    				//fill queue of connectors with 'id's to have an overview of running connectors.
    				//this supports the asynchronous calls.
    				connectorQueue.push(this.id);
    			});
    			
    			//look up for properties in the connectors that
    			//implement/overwrite the query() method
    			jQuery.each(jQuery.VIE2.connectors, function () {
    				jQuery.VIE2.log("info", "VIE2.core#query()", "Start with connector '" + this.id + "' for uri '" + uri + "'!");
    				var c = function (vie, conn, uri, namespaces, ret, callback) {
    					return function (data) {
    						jQuery.VIE2.log("info", "VIE2.core#query()", "Received query information from connector '" + conn.id + "' for uri '" + uri + "'!");
    						jQuery.extend(true, ret, data);
    						
    						removeElement(connectorQueue, conn.id);
    						if (connectorQueue.length === 0) {
    							//if the queue is empty, all connectors have successfully returned and we can call the
    							//callback function.
    							
    							//adding new information to cache!
    							jQuery.each(ret, function (k, v) {
    								for (var i = 0; i < v.length; i++) {
    									that.options.globalContext.add(jQuery.rdf.triple(uri, k, v[i], {namespaces: namespaces}));
    								}
    							});
    							jQuery.VIE2.log("info", "VIE2.core#query()", "Finished task: 'query()' for uri '" + uri + "'! Cache holds now " + that.options.globalContext.databank.tripleStore.length + " triples!");
    							callback.call(ret);
    						}
    					};
    				}(that, this, uri, that.options.namespaces, ret, callback);
    				this.query(uri, props, that.options.namespaces, c);
    			});
    		} else {
    			callback(ret);
    		}
    	},
    	
    	get: function (uri, prop) {
    		//get data from global storage!
    		var ret = [];
    		var that = this;
    		that.options.globalContext
    		.where(jQuery.rdf.pattern(uri, prop, '?object', {namespaces: that.options.namespaces}))
    		.each(function () {
    			ret.push(this.object);
    		});
    		
    		return ret;
    	},
    	
    	//<strong>clear</strong>: Clears the local context and the cache.
    	clear: function () {
    		this.options._localConext = {};
    		this.options.globalContext = jQuery.rdf();
    		return this;
    	}
    	
    });
}(jQuery));

//<strong>$.VIE2.log</strong>: Static convenience method for logging.
jQuery.VIE2.log = function (level, component, message) {
    switch (level) {
    case "info":
    	console.info(component + ' ' + message);
    	break;
    case "warn":
    	console.warn(component + ' ' + message);
    	break;
    case "error":
    	console.error(component + ' ' + message);
    	break;
    }
}

// Backbone JS Models / Collections
jQuery.VIE2.Backbone = {};
jQuery.VIE2.Entity = VIE.RDFEntity.extend({
    
    lookup: function (props) {
    	if (!jQuery.isArray(props)) {
    		this.lookup([props]);
    	} else {
    		//query connectors for properties
    		VIE2.vie2('query', this.id, props, function (entity) {
    			return function () {
    				jQuery.each(props, function (i) {
    					entity.trigger('change:' + props[i]);
    				});
    			};
    		}(this));
    	}
    },

    //TODO: overwrite 'unset();'
    //TODO: overwrite 'clear();'
    
    get: function (attr) {
    	return VIE2.vie2('get', this.id, attr);
    },
    
    set: function (attrs, opts) {
    	//forward VIE2.annotate(this.id, attrs);!
    	Backbone.Model.prototype.set.call(this, attrs, opts);
    	var triples = [];
    	var that = this;
    	jQuery.each(attrs, function (k, v) {
    		var triple = that.id + ' ' + k + ' ' + v;
    		triples.push(triple);
    	});
    	VIE2.vie2('annotate', triples);
    }

});

jQuery.VIE2.addBBEntity = function (entity) {
    jQuery.each(jQuery.VIE2.Backbone, function (i, e) {
    	var belongsHere = false;
    	jQuery.each(e['a'], function () {
    		var ans = jQuery.inArray(this.toString(), entity["a"]);
    		if (jQuery.inArray(this.toString(), entity["a"]) >= 0) {
    			belongsHere = true;
    			return false;
    		}
    	});
    	if (belongsHere) {
    		var tmpModel = e['collection'].model;
    		var bbModel = new tmpModel(entity);
    		e['collection'].add(bbModel);
    		jQuery.VIE2.log("info", "VIE2.core#addBBEntity()", "Added entity '" + entity["id"] + "' to collection of type '" + i + "'!");
    		var mapping = jQuery.VIE2.mappings[i];
    		//query for default properties to make them available in the offline storage
    		VIE2.vie2('query', bbModel.id, mapping.defaultProps, function (bbModel) {
    			return function () {
    				bbModel.change();
    			};
    		}(bbModel));
    	}
    });
};


//<strong>$.VIE2.connectors</strong>: Static array of all registered connectors.
jQuery.VIE2.connectors = {};

//<strong>$.VIE2.registerConnector</strong>: Static method to register a connector (is automatically called 
//during construction of connector class.
jQuery.VIE2.registerConnector = function (connector) {
    //first check if there is already 
    //a connector with 'connector.id' registered
    if (!jQuery.VIE2.connectors[connector.id]) {
    	jQuery.VIE2.connectors[connector.id] = connector;
    	jQuery.VIE2.log("info", "VIE2.core#registerConnector()", "Registered connector '" + connector.id + "'");
    	
    } else {
    	jQuery.VIE2.log("warn", "VIE2.core#registerConnector()", "Did not register connector, as there is" +
    			"already a connector with the same id registered.");
    }
};

//<strong>$.VIE2.unregisterConnector</strong>: Unregistering of connectors. There is currently
//no usecase for that, but it wasn't that hard to implement it ;)
jQuery.VIE2.unregisterConnector = function (connectorId) {
    jQuery.VIE2.connectors[connector.id] = undefined;
};

//<strong>$.VIE2.mappings</strong>: Static object of all registered mappings.
jQuery.VIE2.mappings = {};

//<strong>$.VIE2.registerMapping</strong>: Static method to register a mapping (is automatically called 
//during construction of mapping class.
jQuery.VIE2.registerMapping = function (mapping) {
    //first check if there is already 
    //a mapping with 'mapping.id' registered	
    if (!jQuery.VIE2.mappings[mapping.id]) {
    	jQuery.VIE2.log("info", "VIE2.core#registerMapping()", "Registered mapping '" + mapping.id + "'");
    	jQuery.VIE2.mappings[mapping.id] = mapping;
    	
    	//backboneJS mapping		
    	var props = {};
    	jQuery.each(mapping.defaultProps, function (i) {
    		props[mapping.defaultProps[i]] = [];
    	});
    	var Model = jQuery.VIE2.Entity.extend({defaults: props});
    	var Collection = VIE.RDFEntityCollection.extend({model: Model});
    	
    	jQuery.VIE2.Backbone[mapping.id] = {
    			"a" : (jQuery.isArray(mapping.types))? mapping.types : [mapping.types],
    			"collection" : new Collection()
    	};
    	
    	jQuery.VIE2.log("info", "VIE2.core#registerMapping()", "Registered mapping '" + mapping.id + "' finished!");
    } else {
    	jQuery.VIE2.log("warn", "VIE2.core#registerMapping()", "Did not register mapping, as there is" +
    			"already a mapping with the same id registered.");
    }
};

//<strong>$.VIE2.unregisterMapping</strong>: Unregistering of mappings. There is currently
//no usecase for that, but it wasn't that hard to implement it ;)
jQuery.VIE2.unregisterMapping = function (mappingId) {
    jQuery.VIE2.mappings[mappingId] = undefined;
};

//init
$(window).load(function () {
    VIE2 = $(document).vie2();
    jQuery.VIE2.log("info", "VIE2.core", "VIE2 is fully instantiated and ready!");
});/**
 * @fileOverview VIE^2
 * @author <a href="mailto:sebastian.germesin@dfki.de">Sebastian Germesin</a>
 */

// <code>removeElement(haystack, needle)</code><br />
// <i>returns</i> <strong>void</strong>
function removeElement (haystack, needle) {
	//First we check if haystack is indeed an array.
	if (jQuery.isArray(haystack)) {
		//iterate over the array and check for equality.
		jQuery.each(haystack, function (index) {
			if (haystack[index] === needle) {
				//remove the one element and
				haystack.splice(index, 1);
				//break the iteration.
				return false;
			}
		});
	}
};

var PseudoGuid = new (function() {
    this.empty = "VIE2-00000000-0000-0000-0000-000000000000";
    this.GetNew = function() {
        var fC = function() {
                return (((1 + Math.random()) * 0x10000)|0).toString(16).substring(1).toUpperCase();
        }
        return ("VIE2-" + fC() + fC() + "-" + fC() + "-" + fC() + "-" + fC() + "-" + fC() + fC() + fC());
    };
})();