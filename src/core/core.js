/**
 * @fileOverview VIE^2
 * @author <a href="mailto:sebastian.germesin@dfki.de">Sebastian Germesin</a>
 */

//VIE^2 is the semantic enrichment layer on top of VIE. 
//Through it you can query and find related content 
//for your editables. VIE^2 can talk to services like 
//Apache Stanbol and OpenCalais to find related 
//information for your content.
(function($, undefined) {

//VIE^2 is implmented as a [jQuery UI widget](http://semantic-interaction.org/blog/2011/03/01/jquery-ui-widget-factory/). 
    $.widget('VIE2.vie2', {
    	
    	// default options
    	options: {
    		//<strong>namespaces</strong>: There are currently some default namespaces given, which
    		//can be overwritten and/or extended using the .vie2('option', ...) method.
    		namespaces: {
				'vie2' : 'http://vie2/property/'
			},
	    	
	    	//<strong>_globalContext</strong>: The private _globalContext object stores all triples that
	    	//were retrieved so far. The values are <pre>rdfQuery objects</pre>.
	    	_globalContext : jQuery.rdf(),
	    	
	    	_localContext: {}
    	},
    	
    	_create: function () {
    		var that = this;
    		this.options._globalContext = jQuery.rdf();
    		
    		//automatically scans for xmlns attributes in the html element
    		//and adds them to the local this.options.namespaces object
    		jQuery.each(jQuery('html').xmlns(), function (k, v) {
    			that.options.namespaces[k] = v.toString();
    		});
    		
    		//add all namespaces to the local cache at this.options._globalContext
    		jQuery.each(this.options.namespaces, function(k, v) {
    			that.options._globalContext.prefix(k, v);
			});
    	},
    	
    	//extends needs to be used as the default implementation would overwrite the namespaces
    	_setOption: function (key, value) {
    		if (key === 'namespaces') {
    			jQuery.extend (true, this.options.namespaces, value);
    			jQuery.each(this.options.namespaces, function(k, v) {
    				this.options._globalContext.prefix(k, v);
				});
    		} else {
    			jQuery.Widget.prototype._setOption.apply(this, [key, value]);
    		}
    	},
    	
    	//<strong>analyze()</strong>: The <code><pre>analyze(elem, callback)</pre></code> function is used to
    	//analyze the given element <strong>elem</strong> with all connectors and - once finished - executes
    	//<strong>callback(elem)</strong>.
		analyze: function (elem, callback) {
			if (elem === undefined) {
				jQuery.VIE2.log("warn", "VIE2.core#analyze()", "No element specified, returning without action!");
				callback.call(elem);
				return;
			}
			if (callback === undefined) {
				jQuery.VIE2.log("warn", "VIE2.core#analyze()", "No callback specified, returning without action!");
				callback.call(elem);
				return;
			}
			if (!elem.attr('id')) {
				jQuery.VIE2.log("warn", "VIE2.core#analyze()", "No element id specified, generate one dynamically and add it!");
				var tempId = PseudoGuid.GetNew();
				jQuery.VIE2.log("warn", "VIE2.core#analyze()", "Generated id: '" + tempId + "'!");
				elem.attr('id', tempId);
			}
			jQuery.VIE2.log("info", "VIE2.core#analyze()", "Start.");
			
			//init element context
			this.options._localContext[elem.attr('id')] = jQuery.rdf();
			
			var that = this;
			
			//as the conectors work asynchronously, we need a queue to listen if all connectors are finished.
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
						
						//we add all namespaces to the rdfQuery object. 
						//Attention: this might override namespaces that were added by the connector!
						//but keeps consistency through the VIE^2.
						jQuery.each(vie2.options.namespaces, function(k, v) {
							rdf.prefix(k, v);
							vie2.options._globalContext.prefix(k, v);
						});
						
						rdf.databank.triples().each(function () {
							//add all triples to the global cache!
							vie2.options._globalContext.add(this);
							//fill element-specific context
							that.options._localContext[elem.attr('id')].add(this);
						});
						
						//add all subjects to the entities backbone collection
						jQuery.each(rdf.databank.subjectIndex, function (subject, v) {
							var types = [];
							
							//an entity of id 'id' can only be added once to a backbone JS collection
							//hence, we need to collect all types of that entity first in an array.
							rdf
							.where(subject + ' a ?type')
							.each(function () {
								types.push(this.type);
							});
							
							jQuery.VIE2.addBBEntity({id : subject, a : types});
						});
						
						removeElement(connectorQueue, conn.id);
						//everytime we receive annotations from each connector, we remove the connector's id from the
						//queue and check whether the queue is empty.
						if (connectorQueue.length === 0) {
							//if the queue is empty, all connectors have successfully returned and we can execute the
							//callback function.
							jQuery.VIE2.log("info", "VIE2.core#analyze()", "Finished! Cache holds now " + that.options._globalContext.databank.triples().length + " triples!");
							callback.call(elem);
						}
					};
				}(that, this, elem);
				
				//start analysis with the connector.
 				jQuery.VIE2.log("info", "VIE2.core#analyze()", "Starting analysis with connector: '" + this.id + "'!");
				this.analyze(elem, connectorCallback);
			});
		},
		
		//<strong>annotate(elem, triples)</strong>: Supports the (manual) annotation of the element <strong>elem</strong>
		// with the (semantic) data, stored in <strong>triple</strong>.
		//<strong>triple</strong> can be a <i>String</i>, an array of <i>String</i>, an <i>rdfQuery.triple</i> or
		// an array of <i>rdfQuery.triple</i>.
		//This function forwards the triple and element to all connector's <strong>annotate</strong> method and
		//keeps the corresponding backbone JS models and all context in sync.
		annotate: function (elem, triples) {
			if (elem !== undefined && !elem.attr('id')) {
				jQuery.VIE2.log("warn", "VIE2.core#annotate()", "No element id specified, generate one dynamically and add it!");
				var tempId = PseudoGuid.GetNew();
				jQuery.VIE2.log("warn", "VIE2.core#annotate()", "Generated id: '" + tempId + "'!");
				elem.attr('id', tempId);
			}
			if (triples === undefined) {
				jQuery.VIE2.log("warn", "VIE2.core#annotate()", "No triple specified, returning without action!");
				return this;
			}
			if (!jQuery.isArray(triples)) {
				return this.annotate(elem, [triples]);
			}
			
			jQuery.VIE2.log("info", "VIE2.core#annotate()", "Start.");
			
			var that = this;
			
			jQuery.each(triples, function (i, t) {
				var triple = triples[i];

				if (typeof triple === 'string') {
					triple = jQuery.rdf.triple(triple, {namespaces: that.options.namespaces});
				}
				
				//(1) put it into this.options._globalContext
				that.options._globalContext.add(triple);
				
				//(2) put it into this.options._localContext
				if (elem !== undefined) {
					if (!that.options._localContext[elem.attr('id')]) {
						that.options._localContext[elem.attr('id')] = jQuery.rdf();
					}
					that.options._localContext[elem.attr('id')].add(triple);
				}
				
				//(3) iterate over all connectors to serialize the new annotation
				jQuery.each(jQuery.VIE2.connectors, function () {
					
					var connectorCallback = function (vie2, conn, elem, triple) {
						return function () {
							//TODO
						};
					}(that, this, elem, triple);
	
					this.annotate(elem, triple, that.options.namespaces, connectorCallback);
				});
				
				//(4) look for backbone model(s) and update them as well.				
				jQuery.each(jQuery.VIE2.Backbone, function (k, v) {
					var e = this;
					var ent = e['collection'].get(triple.subject.toString());
					if (ent) {
						//TODO: test if key actually belongs to BB Model! -> be careful of curies!
						//TODO: at best convert to curie!
						var key = triple.property.toString();
						ent.set({key : triple.object});
						jQuery.VIE2.log("info", "VIE2.core#annotate()", "Added value to entity '" + ent.id + "' '" + key + "' '" + triple.object.toString() + "'!");
					}
				});
				jQuery.VIE2.log("info", "VIE2.core#annotate()", "End. Cache holds now " + that.options._globalContext.databank.tripleStore.length + " triples!");
			});
			return this;
		},
		
		
		//<strong>filter</strong>: Offers an easy-to-use syntax to query for URIs of entities
		//with special types, e.g.:
		//<code><pre>var persons = that.vie2('filter', {
        //    'a' : ['dbonto:Person', 'foaf:Person]
        //});</pre></code>
		//<i>types</i> needs to be an object that maps properties ot values.
		//if it is a 'string' or an array of strings, it is mapped to:
		//{'a' : types}.
		filter: function (types) {
			if (types === undefined) {
				jQuery.VIE2.log("warn", "VIE2.core", "Invoked 'filter()' with undefined argument!");
				return [];
			}
			if (typeof types === 'string' || jQuery.isArray(types)) {
				return this.filter({'a' : types});
			}

			var that = this;
			var matches = [];
			
			jQuery.each(types, function (k, v) {
				//convert to array if not already an array
				v = (jQuery.isArray(v))? v : [v];

				jQuery.each(v, function (index) {
					var type = v[index];
					that.options._globalContext
					.where('?subject ' + k + ' ' + type)
					.each (function () {
						matches.push(this.subject);
					});
				});
			});
			
			return matches;
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
				jQuery.VIE2.log("warn", "VIE2.core", "Invoked 'query()' with undefined argument(s)!");
				callback(ret);
				return;
			} else if (typeof props === 'string') {
				this.query(uri, [props], callback, options);
				return;
			}
			if ((uri instanceof jQuery.rdf.blank || (uri instanceof jQuery.rdf.resource &&
					uri.type === 'uri') || typeof uri === 'string') && jQuery.isArray(props)) {
				var that = this;
				//initialize the returning object
				for (var i=0; i < props.length; i++) {
					ret[props[i]] = [];
				}
				//look up for properties in options._globalContext
				//first check if we should ignore the cache!
				if (!options || (options && !options.cache === 'nocache')) {
					for (var i=0; i < props.length; i++) {
						that.options._globalContext
						.where(jQuery.rdf.pattern(uri, props[i], '?object', { namespaces: that.options.namespaces}))
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
					jQuery.VIE2.log("info", "VIE2.core", "Start 'query()' with connector '" + this.id + "' for uri '" + uri + "'!");
					var c = function (vie, conn, uri, namespaces, ret, callback) {
						return function (data) {
							jQuery.VIE2.log("info", "VIE2.core", "Received query information from connector '" + conn.id + "' for uri '" + uri + "'!");
							jQuery.extend(true, ret, data);
							
							removeElement(connectorQueue, conn.id);
							if (connectorQueue.length === 0) {
								//if the queue is empty, all connectors have successfully returned and we can call the
								//callback function.
								
								//adding new information to cache!
								jQuery.each(ret, function (k, v) {
									for (var i = 0; i < v.length; i++) {
										that.options._globalContext.add(jQuery.rdf.triple(uri, k, v[i], {namespaces: namespaces}));
									}
								});
								jQuery.VIE2.log("info", "VIE2.core", "Finished task: 'query()' for uri '" + uri + "'! Cache holds now " + that.options._globalContext.databank.tripleStore.length + " triples!");
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
		
		// returns BackboneJS collections
		mapto: function (mappingId, callback) {
			if (jQuery.VIE2.mappings[mappingId]) {
				jQuery.VIE2.log("info", "VIE2.core", "Start 'mapto()' with mapping '" + mappingId + "'!");
				jQuery.VIE2.mappings[mappingId].mapto(this, callback);
			} else {
				jQuery.VIE2.log("warn", "VIE2.core", "Could not find mapping with id '" + mappingId + "'!");
			}
		},
		
		
		//<strong>clear</strong>: Clears the local context and the cache.
		clear: function () {
			this.options._localConext = {};
			this.options._globalContext = jQuery.rdf();
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
jQuery.VIE2.Entity = Backbone.Model.extend({
	get: function (attr) {
		//forward to query();
		return VIE2.vie2('query', this.id, attr);
	}
});

jQuery.VIE2.addBBEntity = function (entity) {
	jQuery.each(jQuery.VIE2.Backbone, function (i, e) {
		jQuery.each(e['a'], function () {
			if (jQuery.inArray(this, entity["a"])) {
				belongsHere = true;
				return false;
			}
		});
		if (belongsHere) {
			e['collection'].add(entity);
			jQuery.VIE2.log("info", "VIE2.core", "Added entity '" + entity["id"] + "' to collection of type '" + i + "'!");
			//TODO: fill with properties -> query();
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
		jQuery.VIE2.log("info", "VIE2.core", "Registered connector '" + connector.id + "'");
	} else {
		jQuery.VIE2.log("warn", "VIE2.core", "Did not register connector, as there is" +
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
		jQuery.VIE2.log("info", "VIE2.core", "Registered mapping '" + mapping.id + "'");
		jQuery.VIE2.mappings[mapping.id, mapping];
		
		//backboneJS mapping		
		var props = {};
		jQuery.each(mapping.defaultProps, function (i) {
			props[mapping.defaultProps[i]] = undefined;
		});
		var model = jQuery.VIE2.Entity.extend(props);
		var Collection = Backbone.Collection.extend({model: model});
		
		jQuery.VIE2.Backbone[mapping.id] = {
				"a" : (jQuery.isArray(mapping.types))? mapping.types : [mapping.types], 
				"model" : model,
				"collection" : new Collection()
		};
		
		jQuery.VIE2.log("info", "VIE2.core", "Registered mapping '" + mapping.id + "' finished!");
	} else {
		jQuery.VIE2.log("warn", "VIE2.core", "Did not register mapping, as there is" +
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
});