/**
 * @fileOverview VIE^2
 * @author <a href="mailto:sebastian.germesin@dfki.de">Sebastian Germesin</a>
 */

//VIE&sup2; is the semantic enrichment layer on top of VIE.
//Its acronym stands for <b>V</b>ienna <b>I</b>KS <b>E</b>ditable <b>E</b>ntities.

//With the help of VIE&sup2;, you can bring entites in your
//content (aka. semantic lifting) and furthermore interact
//with this knowledge in a MVC manner - using Backbone JS models
//and collections. It is important to say that VIE&sup2; helps you to
//automatically annotate data but also let's you enable users
//to change/add/remove entities and their properties at the users
//wish.
//VIE&sup2; has two main principles: 

//*  Connectors:
//   Connecting VIE&sup2; with **backend** services, that
//   can either analyse and enrich the content sent to them (e.g., using
//   Apache Stanbol or Zemanta), can act as knowledge databases (e.g., DBPedia)
//   or as serializer (e.g., RDFa).
//*  Mappings:
//   In a mapping, a web developer can specify a mapping from ontological entities
//   to backbone JS models. The developer can easily add types of entities and
//   also default attributes that are automatically filled with the help of the 
//   available connectors.

(function($, undefined) {

//VIE&sup2; is implmented as a [jQuery UI widget](http://semantic-interaction.org/blog/2011/03/01/jquery-ui-widget-factory/). 
    $.widget('VIE2.vie2', {
    	
    	// default options
    	options: {
    		entities : []
    	},
    	
    	//<strong>_create()</strong>: The private method **_create():** is called implicitly when
    	//calling .vie2(); on any jQuery object.
    	_create: function () {
    		var that = this;
    		
    		//automatically scans for xmlns attributes in the **html** element
    		//and adds them to the global VIE2.namespaces object
    		jQuery.each(jQuery('html').xmlns(), function (k, v) {
    			VIE2.namespaces[k] = v.toString();
    			VIE2.globalCache.prefix(k, v);
    		});
            
            //automatically scans for xmlns attributes in the **given** element
    		//and adds them to the global VIE2.namespaces object
            try {
                jQuery.each(this.element.xmlns(), function(k, v){
                    VIE2.namespaces[k] = v.toString();
                    VIE2.globalCache.prefix(k, v);
                });
            } catch (e) {
                    //needs to be ignored when called on $(document);
                if (this.element.get(0) !== document) {
                    VIE2.log("warn", "VIE2.core#create()", "Could not retrieve namespaces from element: '" + e + "'!");
                }
            }
    	},
    	
    	//<strong>analyze(callback,[options])</strong>: The analyze() method sends the element to all connectors and lets
    	//them analyze the content. The connectors' methods are asynchronously called and once all connectors
    	//returned the found enrichments in the form of **jQuery.rdf objects**, the *callback* method is
    	//executed (in the scope of the callback function, *this* refers to the given element).<br />
    	//The returned enrichments are written into the global Cache of VIE&sup2; (VIE2.globalCache).<br />
    	//Furthermore, each found subject in the returned knowledge is checked whether there is a mapping to 
    	//backbone JS available and if so, the entity is added to the corresponding backbone collection(s).
        //*options* can contain a 'connectors' field. If so, only these connectors will be used
        //for the analysis. If not specified, all connectors are used.
    	analyze: function (callback, options) {
    		var that = this;
    		//analyze() does not actually need a callback method, but it is usually good to use it 
    		if (callback === undefined) {
    			VIE2.log("warn", "VIE2.core#analyze()", "No callback method specified!");
    		}
    		
    		VIE2.log("info", "VIE2.core#analyze()", "Started.");
    		    		
    		//as the connectors work asynchronously, we need a queue to listen if all connectors are finished.
    		var connectorQueue = [];
    		jQuery.each(VIE2.connectors, function () {
    			//fill queue of connectors with 'id's to have an overview of running connectors.
    			//this supports the asynchronous calls.
                if (options && options.connectors) {
                    if (options.connectors.indexOf(this.id) !== -1) {
                        connectorQueue.push(this.id);
                    }
                } else {
                    connectorQueue.push(this.id);
                }
    		});
    		
    		//iterate over all connectors
    		jQuery.each(VIE2.connectors, function () {
    			//the connector's success callback method
    			var successCallback = function (elem) {
    				return function (rdf) {
    					VIE2.log("info", "VIE2.core#analyze()", "Received RDF annotation from connector '" + this.id + "'!");
    					
    					//we add all namespaces to the rdfQuery object. 
    					//Attention: this might override namespaces that were added by the connector!
    					//but needed to keep consistency through VIE&sup2;.
    				    jQuery.each(VIE2.namespaces, function(k, v) {
    			            rdf.prefix(k, v);
    		            });

    					rdf.databank.triples().each(function () {
    						//add all triples to the global cache!
    						VIE2.globalCache.add(this);
    					});
    					
    					//register all subjects as backbone model
    					jQuery.each(rdf.databank.subjectIndex, function (subject, v) {
    						
                            var subjStr = subject.toString();
                            if (that.options.entities.indexOf(subjStr) === -1) {
                                that.options.entities.push(subjStr);
                            }
                            
                            VIE2.registerModel({
                                id: subjStr
                            });
                        });
    					VIE2.Util.removeElement(connectorQueue, this.id);
    					//everytime we receive annotations from each connector, we remove the connector's id from the
    					//queue and check whether the queue is empty.
    					if (connectorQueue.length === 0) {
    						//if the queue is empty, all connectors have successfully returned and we can execute the
    						//callback function.
    						VIE2.log("info", "VIE2.core#analyze()", "Finished! Global Cache holds now " + VIE2.globalCache.databank.triples().length + " triples!");
    						VIE2.log("info", "VIE2.core#analyze()", "Finished! Local element holds now "  + that.options.entities.length + " entities!");
    						//provide a status field in the callback object: status = {'ok', 'error'};
    						if (callback) {
    							callback.call(elem, 'ok');
    						}
    					}
    					//TODO: in a future release, we might want to add a timeout to be called if a connector takes too long
    				};
    			} (that.element);
                
                //the connector's error callback method
                var errorCallback = function (reason) {
                    VIE2.log("error", "VIE2.core#analyze()", "Connector " + this.id + ") returned with the following error: '" + reason + "'!");
                    VIE2.Util.removeElement(connectorQueue, this.id);
                };
    			
                //check if we may need to filter for the connector
                if (options && options.connectors) {
                    if (options.connectors.indexOf(this.id) !== -1) {
            			//start analysis with the connector.
         				VIE2.log("info", "VIE2.core#analyze()", "Starting analysis with connector: '" + this.id + "'!");
                        this.analyze(that.element, {
                            success: successCallback,
                            error: errorCallback
                        });
                    }
                    else {
                        VIE2.log("info", "VIE2.core#analyze()", "Will not use connector " + this.id + " as it is filtered!");
                    }
                } else {
        			//start analysis with the connector.
     				VIE2.log("info", "VIE2.core#analyze()", "Starting analysis with connector: '" + this.id + "'!");
                    this.analyze(that.element, {
                        success: successCallback,
                        error: errorCallback
                    });
                }
    		});
    	},
                
        //<strong>uris()</strong>: Returns a list of all uris, that are within the scope of the current element!
        uris: function () {
            return this.options.entities;
        },
    	    	
    	//<strong>copy(tar)</strong>: Copies all local knowledge to the target element(s).
    	//Basically calls: <pre>
		//$(tar).vie2().vie2('option', 'entities', this.options.entities);
    	//</pre>
    	copy: function (tar) {
    		//copy all knowledge from src to target
    		var that = this;
    		if (!tar) {
    			VIE2.log("warn", "VIE2.core#copy()", "Invoked 'copy()' without target element!");
    			return;
    		}
			VIE2.log("info", "VIE2.core#copy()", "Start.");
			VIE2.log("info", "VIE2.core#copy()", "Found " + this.options.entities.length + " entities for source.");
			
			$(tar).vie2().vie2('option', 'entities', this.options.entities);
			VIE2.log("info", "VIE2.core#copy()", "Finished.");
			VIE2.log("info", "VIE2.core#copy()", "Target element has now " + $(tar).vie2('option', 'entities') + " entities.");
			return this;
    	},
    	
    	//<strong>clear()</strong>: Clears the local entities.
    	clear: function () {
    		this.options.entities = {};
    		return this;
    	}
    	
    });
}(jQuery));

//The global <strong>VIE2 object</strong>. If VIE2 is already defined, the
//existing VIE2 object will not be overwritten so that the
//defined object is preserved.
if (typeof VIE2 == 'undefined' || !VIE2) {
    VIE2 = {};
}

//<strong>VIE2.namespaces</strong>: This map contains all namespaces known to VIE2.
//There are currently *no* default namespaces, though
//we might want to change this in a future release.
//Namespaces can be overridden directly using VIE2.namespaces[x] = y but
//are parsed from the &lt;html> tag's xmlns: attribute anyway during initialization.
VIE2.namespaces = {};

//<strong>VIE2.globalCache</strong>: The variable **globalCache** stores all knowledge in
//triples that were retrieved and annotated so far in one *rdfQuery object*. Though it is
//available via VIE2.globalCache, it is highly discouraged to access it directly.
VIE2.globalCache = jQuery.rdf({namespaces: VIE2.namespaces});

//<strong>VIE2.clearCache()</strong>: Static method to clear the global Cache.
VIE2.clearCache = function () {
	VIE2.globalCache = jQuery.rdf({namespaces: VIE2.namespaces});
};

//<strong>VIE2.getFromGlobalCache(uri, prop)</strong>: Retrive properties from the given *uri* directly from the
//element's Cache. Does *not* retrieve information from the global Cache. 
VIE2.getFromGlobalCache = function (uri, prop) {
	//get data from local storage!
	var ret = [];
	
	VIE2.globalCache
	.where(jQuery.rdf.pattern(uri, prop, '?object', {namespaces: VIE2.namespaces}))
	.each(function () {
        if (this.object.type) {
            if (this.object.type === 'literal') {
		        ret.push(this.object.toString());
            } else if (this.object.type === 'uri' || this.object.type === 'bnode') {
		        if (VIE.EntityManager.getBySubject(this.object.toString()) !== undefined) {
                    ret.push(VIE.EntityManager.getBySubject(this.object.toString()));
                }
                else {
                    ret.push(this.object.toString());
                }
            }
        }
	});
	
	return ret;
};

//<strong>VIE2.addProperty(uri, prop, values)</strong>: TODO
VIE2.addProperty = function (uri, prop, values) {
    
    if (uri === undefined) {
    	VIE2.log("warn", "VIE2.addProperty()", "No URI specified, returning without action!");
    	return;
    }
    if (prop === undefined) {
    	VIE2.log("warn", "VIE2.addProperty()", "No property specified, returning without action!");
    	return;
    }
    if (values === undefined) {
    	VIE2.log("warn", "VIE2.addProperty()", "No values specified, returning without action!");
    	return;
    }

    if (typeof values === 'string') {
        return VIE2.addProperty(uri, prop, [ values ]);
    }
    
    for (var i = 0; i < values.length; i++) {
        var object;
        if (VIE2.Util.isLiteral(values[i])) {
            object = jQuery.rdf.literal(values[i], {namespaces: VIE2.namespaces});
            if (!object.datatype) {
                //if no specific datatype is given, we assume *xsd:string*
                if (!object.lang) {
                    //if no language is given, we assume *english*
                    object.lang = "en";
                }
            }
        } else if (VIE2.Util.isBlank(values[i])) {
            object = jQuery.rdf.blank(values[i], {namespaces: VIE2.namespaces});
        } else {
            object = jQuery.rdf.resource(values[i], {namespaces: VIE2.namespaces});
        }
        var triple = jQuery.rdf.triple(uri, prop, object, {
            namespaces: VIE2.namespaces
        });
        VIE2.log("info", "VIE2.addProperty()", "Adding new triple: '" + triple + "'.");
        VIE2.globalCache.add(triple);
    }
    VIE2.log("info", "VIE2.addProperty()", "Global Cache holds now " + VIE2.globalCache.databank.triples().length + " triples!");
};

//<strong>VIE2.changeProperty(uri, prop, oldValue, newValue)</strong>: TODO
VIE2.changeProperty = function (uri, prop, oldValue, newValue) {
    if (uri === undefined) {
    	VIE2.log("warn", "VIE2.removeProperty()", "No URI specified, returning without action!");
    	return;
    }
    
    if (prop === undefined) {
    	VIE2.log("warn", "VIE2.removeProperty()", "No property specified, returning without action!");
    	return;
    }
    
    if (oldValue === undefined) {
    	VIE2.log("warn", "VIE2.removeProperty()", "No oldValue specified, returning without action!");
    	return;
    }
    
    if (newValue === undefined) {
    	VIE2.log("warn", "VIE2.removeProperty()", "No newValue specified, returning without action!");
    	return;
    }
    
    VIE2.removeProperty(uri, prop, oldValue);
    VIE2.addProperty(uri, prop, newValue);
    
};

//<strong>VIE2.removeProperty(uri, prop, value)</strong>: Removes TODO
//all properties of the given uri from the global Cache.
VIE2.removeProperty = function (uri, prop, value) {
    
    if (uri === undefined) {
    	VIE2.log("warn", "VIE2.removeProperty()", "No URI specified, returning without action!");
    	return;
    }
    
    if (prop === undefined) {
    	VIE2.log("warn", "VIE2.removeProperty()", "No property specified, returning without action!");
    	return;
    }
    
     if (value === undefined) {
    	VIE2.log("warn", "VIE2.removeProperty()", "No value specified, returning without action!");
    	return;
    }
    
    VIE2.log("info", "VIE2.removeProperty()", "Global Cache holds now " + VIE2.globalCache.databank.triples().length + " triples!");
    var object;
    if (VIE2.Util.isLiteral(value)) {
        object = jQuery.rdf.literal(value, {namespaces: VIE2.namespaces});
        if (!object.datatype) {
            //if no specific datatype is given, we assume *xsd:string*
            if (!object.lang) {
                //if no language is given, we assume *english*
                object.lang = "en";
            }
        }
    } else if (VIE2.Util.isBlank(value)) {
        object = jQuery.rdf.blank(value, {namespaces: VIE2.namespaces});
    } else {
        object = jQuery.rdf.resource(value, {namespaces: VIE2.namespaces});
    }
    var pattern = jQuery.rdf.pattern(uri, prop, object, {namespaces: VIE2.namespaces});
    VIE2.log("info", "VIE2.removeProperty()", "Removing all triples that match: '" + pattern + "'");
    VIE2.globalCache.where(pattern).remove(pattern);
    VIE2.log("info", "VIE2.removeProperty()", "Global Cache holds now " + VIE2.globalCache.databank.triples().length + " triples!");
};

//<strong>VIE2.lookup(uri, props, callback)</strong>: The query function supports querying for properties. The uri needs
//to be of type <code>jQuery.rdf</code> object or a simple string and the property is either an array of strings
//or a simple string. The function iterates over all connectors that have <code>query()</code>
//implemented and collects data in an object.
//The callback retrieves an object with the properties as keys and an array of results as their corresponding values.
VIE2.lookup = function (uri, props, callback) {
	VIE2.log("info", "VIE2.lookup()", "Start!");

	if (uri === undefined || typeof uri !== 'string' || props === undefined) {
		VIE2.log("warn", "VIE2.lookup()", "Invoked 'query()' with wrong/undefined argument(s)!");
		callback.call(uri, ret);
		return;
	}
    
    if (!jQuery.isArray(props)) {
		VIE2.lookup(uri, [ props ], callback, options);
		return;
	}
    
    //initialize the returning object
	var ret = {};
	for (var i=0; i < props.length; i++) {
		ret[props[i]] = [];
	}
        		
	var connectorQueue = [];
	jQuery.each(VIE2.connectors, function () {
		//fill queue of connectors with 'id's to have an overview of running connectors.
		//this supports the asynchronous calls.
		connectorQueue.push(this.id);
	});
	
	//look up for properties in the connectors that
	//implement/overwrite the query() method
	jQuery.each(VIE2.connectors, function () {
		VIE2.log("info", "VIE2.lookup()", "Start with connector '" + this.id + "' for uri '" + uri + "'!");
		var c = function (uri, ret, callback) {
			return function (data) {
				VIE2.log("info", "VIE2.lookup()", "Received query information from connector '" + this.id + "' for uri '" + uri + "'!");
                jQuery.each(data, function (k, v) {
                    for (var i = 0; i < v.length; i++) {
                        var triple = jQuery.rdf.triple(uri, k, v[i], {namespaces: VIE2.namespaces});
                        VIE2.globalCache.add(triple);
                    }
                });
				VIE2.Util.removeElement(connectorQueue, this.id);
				if (connectorQueue.length === 0) {
					//if the queue is empty, all connectors have successfully returned and we can call the
					//callback function.
                    jQuery.each(ret, function (k) {
                        VIE2.globalCache
                        .where(uri + ' ' + k + ' ?x')
                        .each(function () {
                            var valStr = this.x.toString();
                            if (ret[k].indexOf(valStr) === -1) {
                                ret[k].push(valStr);
                            }
                        });
                    });
					VIE2.log("info", "VIE2.lookup()", "Finished task: 'query()' for uri '" + uri + "'!");
					VIE2.log("info", "VIE2.lookup()", "Global Cache now holds " + VIE2.globalCache.databank.triples().length + " triples!");
				    callback.call(uri, ret);
                }
			};
		}(uri, ret, callback);
		this.query(uri, props, c);
	});
};


//<strong>VIE2.mappings</strong>: Contains for all registered mappings (mapping.id is the key), the
//following items:<br/>
//* VIE2.mappings[id].a -> an array of strings (curies) of the corresponding type.
//* VIE2.mappings[id].mapping -> the mapping itself
//* VIE2.mappings[id].collection -> the backbone JS collection, that has the Model registered. 
VIE2.mappings = {};

//<strong>VIE2.registerModel(entity)</strong>: Add a backbone model to the corresponding collection(s).
VIE2.registerModel = function (entity, callback) {
    VIE2.log("info", "VIE2.registerModel()", "Start (" + entity.id + ")!");
    
    var model = VIE.EntityManager.getBySubject(entity["id"]);
    //check whether we already have this entity registered
    if (model !== undefined) {
        VIE2.log("info", "VIE2.registerModel()", "Entity " + entity["id"] + " already registered, no need to add it.");
        VIE2.log("info", "VIE2.registerModel()", "But we better check if there is a collection where we have to add it to.");
        jQuery.each(VIE2.mappings, function (i, e) {
        	var belongsHere = false;
        	jQuery.each(e['a'], function () {
        		if (jQuery.inArray(this.toString(), entity["a"]) !== -1) {
        			belongsHere = true;
        			return false;
        		}
        	});
            //if model belongs to this collection and is not already added => add it
        	if (belongsHere && e['collection'].indexOf(model) === -1) {
                e['collection'].add(model);
            }
        });
        if (callback) {
            callback.call(model);
        }
    } else {
        //let's first ask all connectors if they know more types of this entity!    
        var queryCallback = function (ret) {
            var types = [];
            if (ret['a']) {
                for (var i = 0; i < ret['a'].length; i++) {
                    if (!VIE2.Util.isCurie(ret['a'][i])) {
                        var curie = jQuery.createCurie(ret['a'][i].replace(/^</, '').replace(/>$/, ''), {
                            namespaces: VIE2.namespaces,
                            charcase: 'lower'
                        }).toString();
                        types.push(curie);
                    }
                    else {
                        types.push(ret['a'][i]);
                    }
                }
            }
            
            //merge with possibly given types in (entity['a'])
            if (entity['a']) {
                if (jQuery.isArray(entity['a'])) {
                    for (var i = 0; i < entity['a'].length; i++) {
                        if (!VIE2.Util.isCurie(entity['a'][i])) {
                            var curie = jQuery.createCurie(entity['a'][i].replace(/^</, '').replace(/>$/, ''), {
                                namespaces: VIE2.namespaces,
                                charcase: 'lower'
                            }).toString();
                            types.push(curie);
                        }
                        else {
                            types.push(entity['a'][i]);
                        }
                    }
                } else if (typeof entity['a'] === 'string'){
                    if (!VIE2.Util.isCurie(entity['a'])) {
                        var curie = jQuery.createCurie(entity['a'].replace(/^</, '').replace(/>$/, ''), {
                            namespaces: VIE2.namespaces,
                            charcase: 'lower'
                        }).toString();
                        types.push(curie);
                    }
                    else {
                        types.push(entity['a']);
                    }
                }
            }
            
            VIE2.log("info", "VIE2.registerModel()", "Entity " + entity["id"] + " of type(s) [" + types.join(", ") + "] needs to be registered as a backbone model.");
    		var modelInstance = new VIE2.Entity(entity);
            var uri = modelInstance.getSubject();
            
            jQuery.each(VIE2.mappings, function (i, mapping) {
            	var belongsHere = false;
                for (var x = 0; x < types.length; x++) {
            		if (mapping['a'].indexOf(types[x]) !== -1) {
            			belongsHere = true;
                        break;
            		}
                }
                //entity needs to be registered with this mapping
            	if (belongsHere) {
                    VIE2.log("info", "VIE2.registerModel()", "Registered a backbone model for '" + uri + "'.");
            		var Model = mapping['collection'].model;

                    jQuery.each(entity, function (k, v) {
                        if (k !== "id") {
                            VIE2.addProperty(uri, k, v);
                        }
                    });
                    //registering the model within VIE
                    VIE.EntityManager.registerModel(modelInstance);
            		//adding model instance to collection
            		mapping['collection'].add(modelInstance);
                    
            		VIE2.log("info", "VIE2.registerModel()", "Added entity '" + uri + "' to collection of type '" + i + "'!");
            		var mapping = mapping['mapping'];
                    
            		//query for default properties to make them available in the offline storage
            		VIE2.log("info", "VIE2.registerModel()", "Querying for default properties for entity '" + entity["id"] + "': [" + mapping.defaults.join(", ") + "]!");
                    VIE2.lookup(modelInstance.getSubject(), mapping.defaults, function (defProps, modelInstance) {
            			return function () {
            	    		VIE2.log("info", "VIE2.registerModel()", "Finished querying for default properties for entity '" + modelInstance.getSubject() + "': [" + defProps.join(", ") + "]!");
                            //trigger change when finished
                            for (var y = 0; y < defProps.length; y++) {
                                modelInstance.trigger('change:' + defProps[y]);
                            }
            				modelInstance.change();
            			};
            		} (mapping.defaults, modelInstance));
            	} else {
                    VIE2.log("info", "VIE2.registerModel()", "Entity '" + entity.id + "' does not belong to collection of type " + i + "!");
                }
            });
            if (callback) {
                callback.call(modelInstance);
            }
        }
        VIE2.lookup(entity.id, ['a'], queryCallback);
    }
};

//<strong>VIE2.registerMapping(mapping)</strong>: Static method to register a mapping (is automatically called 
//during construction of mapping class. This allocates an object in *VIE2.mappings[mapping.id]*.
VIE2.registerMapping = function (mapping) {
    //first check if there is already 
    //a mapping with 'mapping.id' registered	
    if (!VIE2.mappings[mapping.id]) {
    	VIE2.log("info", "VIE2.registerMapping()", "Registered mapping '" + mapping.id + "'");
                
    	var Collection = VIE2.Collection.extend({model: VIE2.Entity});
    	
    	VIE2.mappings[mapping.id] = {
			"a" : (jQuery.isArray(mapping.types))? mapping.types : [mapping.types],
			"collection" : new Collection(),
			"mapping" : mapping
    	};
    	
    	VIE2.log("info", "VIE2.registerMapping()", "Registered mapping '" + mapping.id + "' finished!");
    } else {
    	VIE2.log("warn", "VIE2.registerMapping()", "Did not register mapping, as there is" +
    			"already a mapping with the same id registered.");
    }
};

//<strong>VIE2.unregisterMapping(mappingId)</strong>: Unregistering of mappings. There is currently
//no usecase for that, but it wasn't that hard to implement ;)
VIE2.unregisterMapping = function (mappingId) {
	VIE2.mappings[mappingId] = undefined;
};

//<strong>VIE2.connectors</strong>: Static object of all registered connectors.
VIE2.connectors = {};

//<strong>VIE2.registerConnector(connector)</strong>: Static method to register a connector (is automatically called 
//during construction of connector class. If set, inserts connector-specific namespaces to the known Caches.
VIE2.registerConnector = function (connector) {
    //first check if there is already 
    //a connector with 'connector.id' registered
    if (!VIE2.connectors[connector.id]) {
    	VIE2.connectors[connector.id] = connector;
        
    	if (connector.options('namespaces')) {
    		jQuery.each(connector.options('namespaces'), function(k, v) {
                VIE2.namespaces[k] = v;
    			VIE2.globalCache.prefix(k, v);
    			//also add to all known VIE&sup2; elements' Cache!
    		});
    	}
    	VIE2.log("info", "VIE2.registerConnector()", "Registered connector '" + connector.id + "'");
    	
    } else {
    	VIE2.log("warn", "VIE2.registerConnector()", "Did not register connector, as there is" +
    			"already a connector with the same id registered.");
    }
};

//<strong>VIE2.unregisterConnector(connectorId)</strong>: Unregistering of connectors. There is currently
//no usecase for that, but it wasn't that hard to implement ;)
VIE2.unregisterConnector = function (connectorId) {
    VIE2.connectors[connector.id] = undefined;
};

VIE2.logLevels = ["info", "warn", "error"];

//<strong>VIE2.log(level, component, message)</strong>: Static convenience method for logging.
VIE2.log = function (level, component, message) {
    if (VIE2.logLevels.indexOf(level) > -1) {
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
};

//calling this once for convenience
jQuery(document).vie2();