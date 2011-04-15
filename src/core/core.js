// File:   core.js
// Author: <a href="mailto:sebastian.germesin@dfki.de">Sebastian Germesin</a>
//

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
            } catch (ex) {
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
            if (!options) { options = {};}
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
                if (options.connectors) {
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
                            
                            if (!VIE.EntityManager.getBySubject(subjStr)) {
                                VIE2.log("info", "VIE2.core#analyze()", "Register new entity (" + subjStr + ")!");
                                
                                VIE2.createEntity({
                                  id : subjStr
                                }, {backend: true});
                            } else {
                                VIE.EntityManager.getBySubject(subjStr).change();
                            }
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
                                callback.call(elem);
                            }
                        }
                    };
                } (that.element);
                
                //the connector's error callback method
                var errorCallback = function (reason) {
                    VIE2.log("error", "VIE2.core#analyze()", "Connector (" + this.id + ") returned with the following error: '" + reason + "'!");
                    VIE2.Util.removeElement(connectorQueue, this.id);
                };
                
                //check if we may need to filter for the connector
                if (options.connectors) {
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
            
            jQuery(tar).vie2().vie2('option', 'entities', this.options.entities);
            VIE2.log("info", "VIE2.core#copy()", "Finished.");
            VIE2.log("info", "VIE2.core#copy()", "Target element has now " + jQuery(tar).vie2('option', 'entities') + " entities.");
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

//<strong>VIE2.getFromCache(uri, prop)</strong>: Retrive properties from the given
// *uri* directly from the global Cache. 
VIE2.getFromCache = function (parent, uri, prop) {
    //initialize collection
    var Collection = VIE2.ObjectCollection.extend({
        uri      : uri,
        property : prop,
        parent: parent
    });
    
    var ret = new Collection();
    
    VIE2.globalCache
    .where(jQuery.rdf.pattern(uri, prop, '?object', {namespaces: VIE2.namespaces}))
    .each(function () {
        if (this.object.type) {
            if (this.object.type === 'literal') {
                var inst = VIE2.createLiteral(this.object.value, {lang: this.object.lang, datatype: this.object.datatype, backend:true, silent:true});
                ret.add(inst, {backend:true, silent:true});
            } else if (this.object.type === 'uri' || this.object.type === 'bnode') {
                if (VIE.EntityManager.getBySubject(this.object.toString()) !== undefined) {
                    ret.add(VIE.EntityManager.getBySubject(this.object.toString()), {backend:true, silent:true});
                }
                else {
                    var inst = VIE2.createResource(this.object.value.toString(), {backend:true, silent:true});
                    ret.add(inst, {backend:true, silent:true});
                }
            }
        }
    });
    
    return ret;
};

VIE2.removeFromCache = function (uri, prop, val) {
    var pattern = jQuery.rdf.pattern(
    uri, 
    (prop)? prop : '?x',
    (val)? val : '?y', 
    {namespaces: VIE2.namespaces});
    VIE2.log("info", "VIE2.removeFromCache()", "Removing triples that match: '" + pattern.toString() + "'!");
    VIE2.log("info", "VIE2.removeFromCache()", "Global Cache now holds " + VIE2.globalCache.databank.triples().length + " triples!");
    VIE2.globalCache
    .where(pattern)
    .remove(pattern);
    VIE2.log("info", "VIE2.removeFromCache()", "Global Cache now holds " + VIE2.globalCache.databank.triples().length + " triples!");
};

//<strong>VIE2.lookup(uri, props, callback)</strong>: The query function supports querying for properties. The uri needs
//to be of type <code>jQuery.rdf</code> object or a simple string and the property is either an array of strings
//or a simple string. The function iterates over all connectors that have <code>query()</code>
//implemented and collects data in an object.
//The callback retrieves an object with the properties as keys and an array of results as their corresponding values.
VIE2.lookup = function (uri, props, callback) {
    VIE2.log("info", "VIE2.lookup()", "Start ('" + uri + "', '" + props + "')!");

    if (uri === undefined || typeof uri !== 'string' || props === undefined) {
        VIE2.log("warn", "VIE2.lookup()", "Invoked 'lookup()' with wrong/undefined argument(s)!");
        if (callback) {
            callback.call(uri, ret);
        }
        return;
    }
    
    if (!jQuery.isArray(props)) {
        VIE2.lookup(uri, [ props ], callback);
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
                    if (callback) {
                        callback.call(uri, ret);
                    }
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

//<strong>VIE2.registerMapping(mapping)</strong>: Static method to register a mapping (is automatically called 
//during construction of mapping class. This allocates an object in *VIE2.mappings[mapping.id]*.
VIE2.registerMapping = function (mapping) {
    //first check if there is already 
    //a mapping with 'mapping.id' registered    
    if (!VIE2.mappings[mapping.id]) {
                
        var Collection = VIE2.EntityCollection.extend({model: VIE2.Entity});
        
        VIE2.mappings[mapping.id] = {
            "a" : (jQuery.isArray(mapping.types))? mapping.types : [mapping.types],
            "collection" : new Collection(),
            "mapping" : mapping
        };
        
        VIE2.log("info", "VIE2.registerMapping()", "  Registered mapping '" + mapping.id + "'!");
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
