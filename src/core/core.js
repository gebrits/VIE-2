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
            $.each(jQuery('html').xmlns(), function (k, v) {
                var vStr = v.toString();
                if (!VIE2.namespaces.containsKey(k) && !VIE2.namespaces.containsValue(vStr)) {
                    VIE2.namespaces.add(k, vStr);
                }
            });
            
            //automatically scans for xmlns attributes in the **given** element
            //and adds them to the global VIE2.namespaces object
            try {
                $.each(this.element.xmlns(), function(k, v) {
                    var vStr = v.toString();
                    if (!VIE2.namespaces.containsKey(k) && !VIE2.namespaces.containsValue(vStr)) {
                        VIE2.namespaces.add(k, vStr);
                    }
                });
            } catch (ex) {
                //needs to be ignored when called on $(document);
                if (this.element.get(0) !== document) {
                    VIE2.log("warn", "VIE2.core#create()", "Could not retrieve namespaces from element: '" + e + "'!");
                }
            }
            
            return this;
        },
        
        //<strong>analyze(callback,[options])</strong>: The analyze() method sends the element to all connectors and lets
        //them analyze the content. The connectors' methods are asynchronously called and once all connectors
        //returned the found enrichments in the form of **$.rdf objects**, the *callback* method is
        //executed (in the scope of the callback function, *this* refers to the given element).<br />
        //The returned enrichments are written into the global Cache of VIE&sup2; (VIE2.globalCache).<br />
        //Furthermore, each found subject in the returned knowledge is checked whether there is a type-mapping to 
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
            $.each(VIE2.connectors, function () {
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
            $.each(VIE2.connectors, function () {
                //the connector's success callback method
                var successCallback = function (elem) {
                    return function (rdf) {
                        VIE2.log("info", "VIE2.core#analyze()", "Received RDF annotation from connector '" + this.id + "'!");
                        
                        //we add all namespaces to the rdfQuery object. 
                        //Attention: this might override namespaces that were added by the connector!
                        //but needed to keep consistency through VIE&sup2;.
                        $.each(VIE2.namespaces.toObj(), function(k, v) {
                            rdf.prefix(k, v);
                        });

                        rdf.databank.triples().each(function () {
                            //add all triples to the global cache!
                            VIE2.globalCache.add(this);
                        });
                        
                        //register all subjects as backbone model
                        $.each(rdf.databank.subjectIndex, function (subject, v) {
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
                                //inform client(s) that new data is possibly available
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
        
        //<strong>addUri()</strong>: Manually adds a URI (string) to the list of entities within the scope of the current element!
        addUri: function (uri) {
            this.options.entities.push(uri);
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
if (typeof VIE2 === 'undefined' || !VIE2) {
    VIE2 = {};
}

//<strong>VIE2.basename</strong>: The basis namespace of the VIE2 schema.
VIE2.baseNamespace = 'http://schema.org/';

//<strong>VIE2.namespaces</strong>: This object contains all namespaces known to VIE2.
//There are currently *one* default namespace:
// iks -> http://www.iks-ontology.net/
// owl -> http://www.w3.org/2002/07/owl#
//Namespaces can be overridden directly using VIE2.namespaces.update(k, v) but
//are parsed from the &lt;html> tag's xmlns: attribute anyway during initialization.
VIE2.namespaces = new VIE2.Namespaces({
    'owl' : 'http://www.w3.org/2002/07/owl#',
    'xsd' : 'http://www.w3.org/2001/XMLSchema#'
});

//<strong>VIE2.globalCache</strong>: The variable **globalCache** stores all knowledge in
//triples that were retrieved and annotated so far in one *rdfQuery object*. Though it is
//available via VIE2.globalCache, it is highly discouraged to access it directly.
VIE2.globalCache = jQuery.rdf({namespaces: VIE2.namespaces.toObj()});

VIE2.addToCache = function (uri, prop, val) {
    var triple = jQuery.rdf.triple(uri, prop, val, {namespaces: VIE2.namespaces.toObj()});
    VIE2.log("info", "VIE2.addToCache()", "Adding triple to cache!");
    VIE2.log("info", "VIE2.addToCache()", "Global Cache now holds " + VIE2.globalCache.databank.triples().length + " triples!");
    VIE2.globalCache.add(triple);
    VIE2.log("info", "VIE2.addToCache()", "Global Cache now holds " + VIE2.globalCache.databank.triples().length + " triples!");
};

//<strong>VIE2.getFromCache(uri, prop)</strong>: Retrieve properties from the given
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
    .where(jQuery.rdf.pattern(uri, prop, '?object', {namespaces: VIE2.namespaces.toObj()}))
    .each(function () {
        if (this.object.type) {
            if (this.object.type === 'literal') {
                var inst = VIE2.createLiteral(this.object.representation ? this.object.representation : (/*'"' + */this.object.value/* + '"'*/), {lang: this.object.lang, datatype: this.object.datatype, backend:true, silent:true});
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
        {namespaces: VIE2.namespaces.toObj()});
    VIE2.log("info", "VIE2.removeFromCache()", "Removing triples that match: '" + pattern.toString() + "'!");
    VIE2.log("info", "VIE2.removeFromCache()", "Global Cache now holds " + VIE2.globalCache.databank.triples().length + " triples!");
    VIE2.globalCache
        .where(pattern)
        .remove(pattern);
    VIE2.log("info", "VIE2.removeFromCache()", "Global Cache now holds " + VIE2.globalCache.databank.triples().length + " triples!");
};

//<strong>VIE2.clearCache()</strong>: Static method to clear the global Cache.
VIE2.clearCache = function () {
    VIE2.globalCache = jQuery.rdf({namespaces: VIE2.namespaces.toObj()});
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
        var c = function (uri, ret, callback) {
            return function (data) {
                try {
                    VIE2.log("info", "VIE2.lookup()", "Received query information from connector '" + this.id + "' for uri '" + uri + "'!");
                    jQuery.each(data, function (k, v) {
                        for (var i = 0; i < v.length; i++) {
                            var triple = jQuery.rdf.triple(uri, k, v[i], {namespaces: VIE2.namespaces.toObj()});
                            VIE2.globalCache.add(triple);
                        }
                    });
                    VIE2.Util.removeElement(connectorQueue, this.id);
                    if (connectorQueue.length === 0) {
                        //if the queue is empty, all connectors have successfully returned and we can call the
                        //callback function.
                        jQuery.each(ret, function(k){
                            VIE2.globalCache.where(uri + ' ' + k + ' ?x').each(function(){
                                var valStr = this.x.toString();
                                if (ret[k].indexOf(valStr) === -1) {
                                    ret[k].push(valStr);
                                }
                            });
                        });
                        VIE2.log("info", "VIE2.lookup()", "Global Cache now holds " + VIE2.globalCache.databank.triples().length + " triples!");
                        if (callback) {
                            callback.call(uri, ret);
                        }
                    }
                } catch (e) {
                }
            };
        }(uri, ret, callback);
        this.query(uri, props, c);
    });
};

//<strong>VIE2.serialize</strong>: TODO document me
VIE2.serialize = function (model, options) {
    
    if (!options) 
        options = {};
    
    VIE2.log("info", "VIE2.Backbone#serialize(" + model.get('id') + ")", "Start serialization!");
    
    var connectorQueue = [];
    jQuery.each(VIE2.connectors, function(){
        //fill queue of connectors with 'id's to have an overview of running connectors.
        //this supports the asynchronous calls.
        if (options.connectors) {
            if (options.connectors.indexOf(this.id) !== -1) {
                connectorQueue.push(this.id);
            }
        }
        else {
            connectorQueue.push(this.id);
        }
    });
    
    //iterate over all connectors
    jQuery.each(VIE2.connectors, function(){
        //the connector's success callback method
        var successCallback = function(){
            VIE2.log("info", "VIE2.serialize(" + model.get('id') + ")", "Successfully serialized the annotation!");
            VIE2.Util.removeElement(connectorQueue, this.id);
        };
        
        var errorCallback = function(reason) {
            VIE2.log("error", "VIE2.serialize(" + model.get('id') + ")", "");
            VIE2.Util.removeElement(connectorQueue, this.id);
        };
        
        //check if we may need to filter for the connector
        if (options.connectors) {
            if (options.connectors.indexOf(this.id) !== -1) {
                //start analysis with the connector.
                VIE2.log("info", "VIE2.serialize(" + model.get('id') + ")", "Starting serialization with connector: '" + this.id + "'!");
                if (model instanceof VIE2.Entity) {
                    var triple = model.get('a').at(0).tojQueryRdfTriple(); //TODO!
                } else {
                    var triple = model.tojQueryRdfTriple(); //TODO!
                }
                
                this.serialize(triple, jQuery.extend(options, {
                    success: successCallback,
                    error: errorCallback
                }));
            }
            else {
                VIE2.log("info", "VIE2.serialize(" + model.get('id') + ")", "Will not use connector " + this.id + " as it is filtered!");
            }
        }
        else {
            //start analysis with the connector.
            VIE2.log("info", "VIE2.serialize(" + model.get('id') + ")", "Starting serialization with connector: '" + this.id + "'!");
            //TODO: toTriple(this);
            this.serialize(this, jQuery.extend(options, {
                success: successCallback,
                error: errorCallback
            }));
        }
    });
};

//<strong>VIE2.types</strong>: Contains for all registered types (type.id is the key), the
//following items:<br/>
//* VIE2.types[id].type -> the type object itself
//* VIE2.types[id].collection -> the Backbone.js collection, that has the type registered. 
VIE2.types = {};

//<strong>VIE2.registerType(type)</strong>: Static method to register a type (is automatically called 
//during construction of type class. This allocates an object in *VIE2.types[type.id]*.
VIE2.registerType = function (type) {
    //first check if there is already 
    //a type with 'type.id' registered    
    if (!VIE2.types[type.id]) {
                
        var Collection = VIE2.EntityCollection.extend({model: VIE2.Entity});
        
        VIE2.types[type.id] = type;
        
        //Person -> VIE2.Persons
        VIE2[type.id + "s"] = new Collection();
        
        //trigger filling of collections!
        for (var i = 0; i < VIE2.entities.length; i++) {
            VIE2.entities.at(i).searchCollections();
        }
    } else {
        VIE2.log("warn", "VIE2.registerType()", "Did not register type, as there is" +
                "already a type with the same id registered.");
    }
};

VIE2.getType = function (typeId) {
    
    if (typeId.indexOf('<') === 0) {
        return VIE2.types[typeId];
    }
    else if (typeId.indexOf(VIE2.baseNamespace) === 0) {
        return VIE2.getType('<' + typeId + '>');
    }
    else {
        return VIE2.getType('<' + VIE2.baseNamespace + typeId + '>');
    }
    return undefined;
}

//<strong>VIE2.unregisterType(typeId)</strong>: Unregistering of types. 
// There is currently no usecase for that, but it wasn't that hard to implement ;)
VIE2.unregisterType = function (typeId) {
    delete VIE2.types[typeId];
    delete VIE2[typeId + "s"];
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
                console.info([component, message]);
                break;
            case "warn":
                console.warn([component, message]);
                break;
            case "error":
                console.error([component, message]);
                break;
        }
    }
};
