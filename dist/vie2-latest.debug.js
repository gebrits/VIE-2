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

Connector.prototype.analyze = function (object, callback) {
	jQuery.VIE2.log("info", "VIE2.Connector(" + this.id + ")", "Not implemented: analyze();");
	callback(jQuery.rdf());
};

Connector.prototype.query = function (uri, properties, namespaces, callback) {
	jQuery.VIE2.log("info", "VIE2.Connector(" + this.id + ")", "Not implemented: query();");
	callback({});
};
/**
 * @fileOverview VIE^2
 * @author <a href="mailto:sebastian.germesin@dfki.de">Sebastian Germesin</a>
 */

// A <code>Mapping</code> provides functionality to map context knowledge
// to Javascript objects. This can either be accomplished by using the default
// functionality of the <code>filter</code> method, or by overwriting this.<br />
// In general, the mapping function should never be called directly but only
// through the core. 

// <code>Constructor(id, [options]):</code> The constructor needs an id of type <code>string</code>.
// Exceptions are thrown if either no 'id' is given or the id is not of type string.
// Options are optional and may be passed after the id to the constructor.
Mapping = function(id, options) {
	if (id === undefined) {
		throw "The mapping constructor needs an 'id'!";
	}
	
	if (typeof id !== 'string') {
		throw "The mapping constructor needs an 'id' of type 'string'!";
	}
	
	this.id = id;
	this._options = (options)? options : {};
	
	//automatically registers the mapping in VIE^2.
	jQuery.VIE2.registerMapping(this);
};

//setter and getter for options
Mapping.prototype.options = function(values) {
	if (values) {
		//extend options
		jQuery.extend(true, this._options, values);
	} else {
		//get options
		return this._options;
	}
};

//<code>filter(vie2, context, matches)</code><br />
//<i>returns</i> <strong>array of objects</strong>
Mapping.prototype.mapto = function (vie2, callback) {
	if (this.options().mapping) {
		var that = this;
		var map = this.options().mapping;

		var ret = [];
		var uris = vie2.filter(this.options()['a']);
		
		var queue = [];

		//fill queue first
		jQuery.each(uris, function (i) {
			var uri = uris[i];
			
			jQuery.each(map, function (k, v) {
				var props = (jQuery.isArray(v))? v : [v];
				jQuery.each(props, function (j) {
					var prop = props[j];
					
					var id = uri + "||" + prop;
					queue.push(id);
				});
			});
		});
		
		jQuery.each(uris, function (i) {
			var uri = uris[i];
			var sso = {
				'a' : that.id,
				jsonld : {
					'#' : vie2.options.namespaces,
					'@' : uri.toString(),
					'a' : [] //TODO: FILL!
				}
			};
			ret.push(sso);
			jQuery.each(map, function (k, v) {
				sso[k] = [];
				var props = (jQuery.isArray(v))? v : [v];
				jQuery.each(props, function (j) {
					var prop = props[j];
					sso.jsonld[prop] = [];
					var id = uri + "||" + prop;
					vie2.query(uri, prop, function (x, s, k, p) {
						return function () {
							var vals = this[p];
		
							jQuery.merge(s[k], vals);
							jQuery.merge(s.jsonld[p], vals);
							
							removeElement(queue, x);
							if (queue.length === 0) {
								callback.call(ret);
							}
						}
					}(id, sso, k, prop));
				});
			});
			
		});
	 } else {
	    	callback({});
	 }
};/**
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
				'dbpedia' : 'http://dbpedia.org/resource/',
				'dbprop' : 'http://dbpedia.org/property/',
				'dbonto' : 'http://dbpedia.org/ontology/',
				'rdf' : 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
				'rdfs' : 'http://www.w3.org/2000/01/rdf-schema#',
				'iks' : 'http://www.iks-project.eu/#',
				'fise' : 'http://fise.iks-project.eu/ontology/',
				'foaf' : 'http://xmlns.com/foaf/0.1/',
				'dc' : 'http://purl.org/dc/terms/',
				'geo' : 'http://www.w3.org/2003/01/geo/wgs84_pos#',
				'google' : 'http://rdf.data-vocabulary.org/#'
			},
			//<strong>_context</strong>: The private _context object stores for each connector
	    	//the returned result. The values are <pre>rdfQuery objects</pre>.
	    	_context: {},
	    	
	    	//<strong>_cache</strong>: The private _cache object stores all triples that
	    	//were retrieved so far. The values are <pre>rdfQuery objects</pre>.
	    	_cache : jQuery.rdf(),
			
			//<strong>_matches</strong>: The private _matches array stores the matches of the last 'filter' call.
			_matches: [],

			//<strong>_oldMatches</strong>: The private _oldMatches array stores the matches of the 'filter' call before
			//the last one.
			_oldMatches: []
    	},
    	
    	_create: function () {
    		var that = this;
    		this.options._cache = jQuery.rdf();
    		jQuery.each(this.options.namespaces, function(k, v) {
    			that.options._cache.prefix(k, v);
			});
    	},
    	
    	//extends needs to be used as the default implementation would overwrite the namespaces
    	_setOption: function (key, value) {
    		if (key === 'namespaces') {
    			jQuery.extend (true, this.options.namespaces, value);
    			jQuery.each(this.options.namespaces, function(k, v) {
    				this.options._cache.prefix(k, v);
				});
    		} else {
    			jQuery.Widget.prototype._setOption.apply(this, [key, value]);
    		}
    	},
    	
    	//<strong>analyze</strong>: The <code><pre>analyze(callback)</pre></code> function is one of the three
		//main functions of this library. Analyze iterates over all registered connectors and
		//let them analyze and enrich with semantic entities. 
		analyze: function (callback) {
			jQuery.VIE2.log("info", "VIE2.core", "Start: analyze()!");
			
			var that = this;
			var connectorQueue = [];
			jQuery.each(jQuery.VIE2.connectors, function () {
				//fill queue of connectors with 'id's to have an overview of running connectors.
				//this supports the asynchronous calls.
				connectorQueue.push(this.id);
			});
			
			jQuery.each(jQuery.VIE2.connectors, function () {
				var c = function (vie, conn) {
					return function (rdf) {
						//we add all namespaces to the rdfQuery object. 
						//Attention: this might override namespaces that were added by the connector!
						jQuery.each(vie.options.namespaces, function(k, v) {
							rdf.prefix(k, v);
							vie.options._cache.prefix(k, v);
						});
						
						//add all triples to the local cache!
						rdf.databank.triples().each(function () {
							vie.options._cache.add(this);
						});
						
						//add all subjects to the entities backbone collection
						jQuery.each(rdf.databank.subjectIndex, function (subject, v) {
							var types = [];
							
							rdf
							.where(subject + ' a ?type')
							.each(function () {
								types.push(this.type);
							});
							jQuery.VIE2.addEntity({id : subject, a : types});
						});
						
						vie.options._context[conn.id] = rdf;
						jQuery.VIE2.log("info", "VIE2.core", "Received RDF annotation from connector '" + conn.id + "'!");
						
						removeElement(connectorQueue, conn.id);
						//everytime we receive annotations from each connector, we remove the connector's id from the
						//queue and check whether the queue is empty.
						if (connectorQueue.length === 0) {
							//if the queue is empty, all connectors have successfully returned and we can call the
							//callback function.
							jQuery.VIE2.log("info", "VIE2.core", "Finished task: 'analyze()'! Cache holds now " + that.options._cache.databank.tripleStore.length + " triples!");
							callback.call(that.element);
						}
					};
				}(that, this);
				//start analysis with the connector.
 				jQuery.VIE2.log("info", "VIE2.core", "Starting analysis with connector: '" + this.id + "'!");
				this.analyze(that.element, c);
			});
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
			} else if (typeof types === 'string' || jQuery.isArray(types)) {
				return this.filter({'a' : types});
			} else {
				var that = this;
				that.options._oldMatches = that.options._matches;
				that.options._matches = [];
				
				jQuery.each(types, function (k, v) {
					//convert to array if not already an array
					v = (jQuery.isArray(v))? v : [v];

					jQuery.each(v, function (index) {
						var type = v[index];
						that.options._cache
						.where('?subject ' + k + ' ' + type)
						.each (function () {
							that.options._matches.push(this.subject);
						});
					});
				});
				
				return that.options._matches;				
			}
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
				//look up for properties in options._cache
				//first check if we should ignore the cache!
				if (!options || (options && !options.cache === 'nocache')) {
					for (var i=0; i < props.length; i++) {
						that.options._cache
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
										that.options._cache.add(jQuery.rdf.triple(uri, k, v[i], {namespaces: namespaces}));
									}
								});
								jQuery.VIE2.log("info", "VIE2.core", "Finished task: 'query()' for uri '" + uri + "'! Cache holds now " + that.options._cache.databank.tripleStore.length + " triples!");
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
			if (jQuery.VIE2.getMapping(mappingId)) {
				jQuery.VIE2.log("info", "VIE2.core", "Start 'mapto()' with mapping '" + mappingId + "'!");
				jQuery.VIE2.getMapping(mappingId).mapto(this, callback);
			} else {
				jQuery.VIE2.log("warn", "VIE2.core", "Could not find mapping with id '" + mappingId + "'!");
			}
		},		
		
		//<strong>matches</strong>: A convenience method to access the matches from the last <pre>filter()</pre call.
		matches: function () {
			return this.options._matches;
		},
		
		//<strong>context</strong>: A convenience method to access the private object <pre>options._context</pre>.
		context: function (connId) {
			if (this.options._context[connId]) {
				return this.options._context[connId];
			}
		},
		
		//<strong>undo</strong>: Reverts the last <pre>filter()</pre> call.
		undo: function () {
			this.options._matches = this.options._oldMatches;
			this.options._oldMatches = [];
			return this;
		},
		
		//<strong>clear</strong>: Clears the local context, the matches and oldMatches.
		clear: function () {
			this.options._matches = [];
			this.options._oldMatches = [];
			this.options._context = {};
			this.options._cache = jQuery.rdf();
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
jQuery.VIE2.Entity = Backbone.Model.extend({});

jQuery.VIE2.addEntity = function (entity) {
	jQuery.each(jQuery.VIE2.Backbone, function (i, e) {
		var belongsHere = false;
		jQuery.each(e['a'], function () {
			jQuery.each(this['a'], function (k, v) {
				if (jQuery.inArray(v, entity["a"])) {
					belongsHere = true;
					return false;
				}
			});
			if (belongsHere) {
				return false;
			}
		});
		if (belongsHere) {
			e['collection'].add(entity);
			jQuery.VIE2.log("info", "VIE2.core", "Added entity '" + entity["id"] + "' to collection of type '" + i + "'!");
			//TODO: fill with properties -> query();
			return false;
		}
	});
};


//<strong>$.VIE2.connectors</strong>: Static array of all registered connectors.
jQuery.VIE2.connectors = [];

//<strong>$.VIE2.registerConnector</strong>: Static method to register a connector (is automatically called 
//during construction of connector class.
jQuery.VIE2.registerConnector = function (connector) {
	//first check if there is already 
	//a connector with 'connector.id' registered
	var register = true;
	jQuery.each(jQuery.VIE2.connectors, function () {
		if (this.id === connector.id) {
			register = false;
			return false;
		}
	});
	if (register) {
		jQuery.VIE2.connectors.push(connector);
		jQuery.VIE2.log("info", "VIE2.core", "Registered connector '" + connector.id + "'");
	} else {
		jQuery.VIE2.log("warn", "VIE2.core", "Did not register connector, as there is" +
				"already a connector with the same id registered.");
	}
};

//<strong>$.VIE2.getConnector</strong>: Static method to get a connector.
jQuery.VIE2.getConnector = function (connectorId) {
	//first check if there is already 
	//a connector with 'connector.id' registered
	var connector = null;
	jQuery.each(jQuery.VIE2.connectors, function () {
		if (this.id === connectorId) {
			connector = this;
			return false;
		}
	});
	return connector;
};

//<strong>$.VIE2.unregisterConnector</strong>: Unregistering of connectors. There is currently
//no usecase for that, but it wasn't that hard to implement it ;)
jQuery.VIE2.unregisterConnector = function (connectorId) {
	var connector = null;
	jQuery.each(jQuery.VIE2.connectors, function () {
		if (this.id === connectorId) {
			jQuery.VIE2.connectors.splice(index, 1);
			jQuery.VIE2.log("info", "VIE2.core", "De-registered connector '" + connector.id + "'");
			connector = this;
			return false;
		}
	});
	return connector;
};

//<strong>$.VIE2.mappings</strong>: Static array of all registered mappings.
jQuery.VIE2.mappings = [];

//<strong>$.VIE2.registerMapping</strong>: Static method to register a mapping (is automatically called 
//during construction of mapping class.
jQuery.VIE2.registerMapping = function (mapping) {
	//first check if there is already 
	//a mapping with 'mapping.id' registered
	var register = true;
	jQuery.each(jQuery.VIE2.mappings, function () {
		if (this.id === mapping.id) {
			register = false;
			return;
		}
	});
	if (register) {
		jQuery.VIE2.log("info", "VIE2.core", "Registered mapping '" + mapping.id + "'");
		jQuery.VIE2.mappings.push(mapping);
		
		//backboneJS mapping
		var properties = {};
		jQuery.each(mapping._options.mapping, function (k, v) {
			properties[k] = [];
		});
		var model = jQuery.VIE2.Entity.extend(properties);
		var Collection = Backbone.Collection.extend({model: model});
		var collection = new Collection();
		
		jQuery.VIE2.Backbone[mapping.id] = {
				"a" : (jQuery.isArray(mapping._options["a"]))? mapping._options["a"] : [mapping._options["a"]], 
				"model" : model,
				"collection" : collection
		};
		
		jQuery.VIE2.log("info", "VIE2.core", "Registered mapping '" + mapping.id + "' finished!");
	} else {
		jQuery.VIE2.log("warn", "VIE2.core", "Did not register mapping, as there is" +
				"already a mapping with the same id registered.");
	}
};

//<strong>$.VIE2.getMapping</strong>: Static method to get a mapping.
jQuery.VIE2.getMapping = function (mappingId) {
	//first check if there is already 
	//a mapping with 'mapping.id' registered
	var mapping = null;
	jQuery.each(jQuery.VIE2.mappings, function () {
		if (this.id === mappingId) {
			mapping = this;
			return false;
		}
	});
	return mapping;
};

//<strong>$.VIE2.unregisterMapping</strong>: Unregistering of mappings. There is currently
//no usecase for that, but it wasn't that hard to implement it ;)
jQuery.VIE2.unregisterMapping = function (mappingId) {
	var mapping = null;
	jQuery.each(jQuery.VIE2.mappings, function (index) {
		if (this.id === mappingId) {
			jQuery.VIE2.mappings.splice(index, 1);
			jQuery.VIE2.log("info", "VIE2.core", "De-registered mapping '" + mapping.id + "'");
			mapping = this;
			return;
		}
	});
	return mapping;
};/**
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
}