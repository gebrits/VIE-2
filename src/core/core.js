// File:   core.js
// Author: <a href="mailto:sebastian.germesin@dfki.de">Sebastian Germesin</a>
//

//The global <strong>VIE2 object</strong>. If VIE2 is already defined, the
//existing VIE2 object will not be overwritten so that the
//defined object is preserved.
if (this.VIE2 === undefined) {
	this.VIE2 = {};
}
var VIE2 = this.VIE2;

//<strong>VIE2.basename</strong>: The basis namespace of the VIE2 schema.
VIE2.baseNamespace = 'http://schema.org/';

//<strong>VIE2.namespaces</strong>: This object contains all namespaces known to VIE2.
//There are currently *one* default namespace:
// xsd -> http://www.w3.org/2001/XMLSchema#
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
    try {
        var triple = jQuery.rdf.triple(uri + ' ' + prop + ' ' + val, {
            namespaces: VIE2.namespaces.toObj()
        });
    } catch (e) {
        throw new Error("VIE2.addToCache() - Cannot create triple from these parameters: (" + uri + "," + prop + "," + val + ")! Results in: " + e);
    }
    VIE2.log("info", "VIE2.addToCache()", "Global Cache now (before) holds " + VIE2.globalCache.databank.triples().length + " triples!");
    VIE2.log("info", "VIE2.addToCache()", "Adding triple (" + triple.toString() + ") to cache!");
    VIE2.globalCache.add(triple);
    VIE2.log("info", "VIE2.addToCache()", "Global Cache now (after) holds " + VIE2.globalCache.databank.triples().length + " triples!");
};

//<strong>VIE2.removeFromCache</strong>: TODO: document me
VIE2.removeFromCache = function (uri, prop, val) {
    try {
        var pattern = jQuery.rdf.triple(uri + ' ' + ((prop)? prop : '?x') + ' ' + ((val)? val : '?y'), 
            {namespaces: VIE2.namespaces.toObj()
        });
    } catch (e) {
        throw new Error("VIE2.removeFromCache() - Cannot create pattern from these parameters: (" + uri + ", " + prop + ", " + val + ")! Results in: " + e);
        return;
    }
    VIE2.log("info", "VIE2.removeFromCache()", "Global Cache now (before) holds " + VIE2.globalCache.databank.triples().length + " triples!");
    VIE2.log("info", "VIE2.removeFromCache()", "Removing triples that match: '" + pattern.toString() + "'!");
    VIE2.globalCache.remove(pattern);
    VIE2.log("info", "VIE2.removeFromCache()", "Global Cache now (after) holds " + VIE2.globalCache.databank.triples().length + " triples!");
};

//<strong>VIE2.clear()</strong>: Static method to clear VIE2.
VIE2.clear = function () {
    VIE2.globalCache = jQuery.rdf({namespaces: VIE2.namespaces.toObj()});
    VIE2.entities.reset();
};

//<strong>VIE2.getPropFromCache(uri, prop)</strong>: Retrieve properties from the given
// *uri* directly from the global Cache. 
VIE2.getPropFromCache = function (prop) {
    var uri = this.get('id');
    
    //handle type of entity special!
    if (prop === 'a') {
        var types = VIE2.globalCache
        .where(jQuery.rdf.pattern(uri, prop, '?type', {namespaces: VIE2.namespaces.toObj()}));
        if (types.size() > 0) {
            //only return the first valid type!
            for (var t = 0; t < types.size(); t++) {
                var ret =  VIE2.getType(types.get(t).type.value.toString());
                if (ret) {
                    VIE2.log('info', "VIE2.getPropFromCache(" + uri + " " + prop + ")", ret);
                    return ret;
                }
            }
            return null;
        } else {
            return null;
        }
    }
    
    var ret = [];
    
    VIE2.globalCache
    .where(jQuery.rdf.pattern(uri, prop, '?object', {namespaces: VIE2.namespaces.toObj()}))
    .each(function () {
        if (this.object.type) {
            if (this.object.type === 'literal') {
                var inst = this.object.representation ? this.object.representation : this.object;
                inst = this.object.value ? this.object.value : inst;
                ret.push(inst);
            } else if (this.object.type === 'uri' || this.object.type === 'bnode') {
            	var entity = VIE2.EntityManager.getBySubject(this.object.toString());
            	if (entity) {
                    ret.push(entity);
                }
                else {
                    var res =this.object.value.toString();
                    ret.push(res);
                }
            }
        }
    });
    VIE2.log('info', "VIE2.getPropFromCache(" + uri + " " + prop + ")", ret);
    return ret;
};

//<strong>VIE2.analyze(elem, callback, [options])</strong>: TODO: document me!
VIE2.analyze = function (elem, callback, options) {
    
    var that = this;
    
    if (!options) { options = {};}
    
    //automatically scans for xmlns attributes in the **given** element
    //and adds them to the global VIE2.namespaces object
    try {
        jQuery.each(jQuery(elem).xmlns(), function(k, v) {
            var vStr = v.toString();
            if (!VIE2.namespaces.containsKey(k) && !VIE2.namespaces.containsValue(vStr)) {
                VIE2.namespaces.add(k, vStr);
            }
        });
    } catch (ex) {
        //needs to be ignored when called on $(document);
        if (jQuery(elem).get(0) !== document) {
            VIE2.log("warn", "VIE2.core#create()", "Could not retrieve namespaces from element: '" + e + "'!");
        }
    }
    
    //analyze() does not actually need a callback method, but it is usually good to use it 
    if (callback === undefined) {
        VIE2.log("warn", "VIE2.core#analyze()", "No callback method specified!");
    }
    
    VIE2.log("info", "VIE2.core#analyze()", "Started.");
                
    jQuery(elem).each(function () {
        var element = $(this);
        element.data('uri', []); //initialize URIs, associated with this element
        
        //as the connectors work asynchronously, we need a queue to listen if all connectors are finished.
        var connectorQueue = [];
        for (var connId in VIE2.connectors) {
            //fill queue of connectors with 'id's to have an overview of running connectors.
            //this supports the asynchronous calls.
            if (options.connectors) {
                if (options.connectors.indexOf(connId) !== -1) {
                    connectorQueue.push(connId);
                }
            } else {
                connectorQueue.push(connId);
            }
        }
        
        //iterate over all connectors
        for (var connId in VIE2.connectors) {
            var connector = VIE2.connectors[connId];
            
            //the connector's success callback method
            var successCallback = function (elem, callback) {
                return function (rdf) {
                    VIE2.log("info", "VIE2.core#analyze()", "Received RDF annotation from connector '" + this.id + "'!");
                    
                    //we add all namespaces to the rdfQuery object. 
                    //Attention: this might override namespaces that were added by the connector!
                    //but needed to keep consistency through VIE&sup2;.
                    jQuery.each(VIE2.namespaces.toObj(), function(k, v) {
                        rdf.prefix(k, v);
                    });
    
                    rdf.databank.triples().each(function () {
                        //add all triples to the global cache!
                        VIE2.globalCache.add(this);
                    });
                    
                    
                    //register all subjects as backbone model
                    jQuery.each(rdf.databank.subjectIndex, function (subject, v) {
                        var subjStr = subject.toString();
                        
                        var uris = elem.data('uri');
                        if (uris.indexOf(subjStr) === -1) {
                            uris.push(subjStr);
                            elem.data('uri', uris);
                        }
                        
                        if (!VIE2.EntityManager.getBySubject(subjStr)) {
                            VIE2.log("info", "VIE2.core#analyze()", "Register new entity (" + subjStr + ")!");
                            
                            //allocate new entity and load data from global cache into the model via fetch()
                            var entity = new VIE2.Entity({
                              id : subjStr
                            });
                            entity.fetch();
                        } else {
                            //inform client(s) that new data is possibly available
                            var entity = VIE2.EntityManager.getBySubject(subjStr);
                            entity.fetch();
                            entity.change();
                        }
                    });
                    
                    VIE2.Util.removeElement(connectorQueue, this.id);
                    //everytime we receive annotations from each connector, we remove the connector's id from the
                    //queue and check whether the queue is empty.
                    if (connectorQueue.length === 0) {
                        //if the queue is empty, all connectors have successfully returned and we can execute the
                        //callback function.
                        VIE2.log("info", "VIE2.analyze()", "Finished! Global Cache holds now " + VIE2.globalCache.databank.size() + " triples!");
                        VIE2.log("info", "VIE2.analyze()", "Finished! Local element holds now "  + elem.data('uri').length + " entities!");
                        //provide a status field in the callback object: status = {'ok', 'error'};
                        if (callback) {
                            callback.call(elem);
                        }
                    }
                };
            } (element, callback);
            
            //the connector's error callback method
            var errorCallback = function (reason) {
                VIE2.log("error", "VIE2.analyze()", "Connector (" + connId + ") returned with the following error: '" + reason + "'!");
                VIE2.Util.removeElement(connectorQueue, connId);
            };
            
            //check if we may need to filter for the connector
            if (options.connectors) {
                if (options.connectors.indexOf(connId) !== -1) {
                    //start analysis with the connector.
                    VIE2.log("info", "VIE2.analyze()", "Starting analysis with connector: '" + connId + "'!");
                    connector.analyze(element, {
                        success: successCallback,
                        error: errorCallback
                    });
                }
                else {
                    VIE2.log("info", "VIE2.analyze()", "Will not use connector " + connId + " as it is filtered!");
                }
            } else {
                //start analysis with the connector.
                VIE2.log("info", "VIE2.analyze()", "Starting analysis with connector: '" + connId + "'!");
                connector.analyze(element, {
                    success: successCallback,
                    error: errorCallback
                });
            }
        }
    });
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
    jQuery.each(VIE2.connectors, function() {
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

VIE2.howMuchDoIKnow = function () {
    return "You have " + VIE2.globalCache.databank.size() + " triples stored in the local cache!";
}

VIE2.whatDoIKnow = function () {
    for (var i = 0; i < VIE2.globalCache.databank.triples().length; i++) {
        console.log(VIE2.globalCache.databank.triples()[i].toString());
    }
}

VIE2.all = function (typeId) {
    //TODO!
    var type = VIE2.getType(typeId);
    
    return VIE2.entities.select(function (e) {
        return e.a.isTypeOf(type);
    });
};