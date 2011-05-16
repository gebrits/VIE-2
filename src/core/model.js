// File:   model.js
// Author: <a href="mailto:sebastian.germesin@dfki.de">Sebastian Germesin</a>
//

//<strong>VIE2.Entity</strong>: The parent backbone entity class for all other entites.
//Inherits from VIE.RDFEntity.
VIE2.Entity = VIE.RDFEntity.extend({
    
    initialize: function (attrs, opts) {
        //if the type has changed, we need to search through the
        //mappings if the model needs to be inserted.
        this.bind('change:a', this.searchCollections);  
        
        if (!opts) { opts = {};}
        
        if (!opts.backend) {
            for (var attr in attrs) {
                var val = attrs[attr];
                if (attr !== 'id') {
                    if (jQuery.isArray(val)) {
                        for (var i = 0; i < val.length; i++) {
                            var triple = jQuery.rdf.triple(this.id, attr, val[i], {
                                namespaces: VIE2.namespaces
                            });
                            VIE2.globalCache.add(triple);
                        }
                    }
                    else {
                        var triple = jQuery.rdf.triple(this.id, attr, val, {
                            namespaces: VIE2.namespaces
                        });
                        VIE2.globalCache.add(triple);
                    }
                }
            }
        }
    },
    
    searchCollections: function () {
        var self = this;
        var types = VIE2.getFromCache(this, this.get('id'), 'a');
        
        jQuery.each(VIE2.mappings, function (i, mapping) {
            var belongsHere = false;
            
            for (var x = 0; x < types.length; x++) {
                var curie = types.at(x).get('value');
                if (!VIE2.Util.isCurie(curie)) {
                    curie = jQuery.createCurie(curie.replace(/^</, '').replace(/>$/, ''), {
                        namespaces: VIE2.namespaces,
                        charcase: 'lower'
                    }).toString();
                }
                if (mapping['a'].indexOf(curie) !== -1) {
                    belongsHere = true;
                    break;
                }
            }
            //entity needs to be registered with this mapping
            if (belongsHere) {
                //adding model instance to collection
                if (!mapping['collection'].get(self.id)) {
                    mapping['collection'].add(self, {backend: true});
                    VIE2.log("info", "VIE2.Entity.searchCollections()", "Added entity '" + self.get('id') + "' to collection of type '" + i + "'!");
                    
                    VIE2.log("info", "VIE2.Entity.searchCollections()", "Querying for default properties for entity '" + self.get('id') + "': [" + mapping['mapping'].defaults.join(", ") + "]!");
                    VIE2.lookup(self.get('id'), mapping['mapping'].defaults, function(defProps, model){
                        return function(){
                            VIE2.log("info", "VIE2.Entity.searchCollections()", "Finished querying for default properties for entity '" + model.get('id') + "': [" + defProps.join(", ") + "]!");
                            //trigger change when finished
                            for (var y = 0; y < defProps.length; y++) {
                                model.trigger('change:' + defProps[y]);
                            }
                            model.change();
                        };
                    }(mapping['mapping'].defaults, self));
                }
            }
        });
    },

    //overwritten to directly access the global Cache
    get: function (attr) {
        if (attr === 'id') {
            return VIE.RDFEntity.prototype.get.call(this, attr);
        }
        return VIE2.getFromCache(this, this.get('id'), attr);
    },
    
    save: function (attrs, options) {
        if (!options) { options = {};}
        if (attrs && !this.set(attrs, options)) return false;
            var model = this;
            var success = function(resp) {
                if (!model.set(model.parse(resp), options)) return false;
                if (options.success) options.success(model, resp);
            };
        var error = $.noop;
        var method = this.isNew() ? 'create' : 'update';
        this.sync(method, this, success, error, options);
        return this;
    },
    
    destroy: function (opts) {
        if (!opts) { opts = {};}
        
        var model = VIE.EntityManager.getBySubject(this.get('id'));
        if (model) {
            VIE2.entities.remove(model);
        }
        else {
            VIE2.removeFromCache(model.get('id'), '?x', '?y');
            
            var success = function(resp){
                if (options.success) 
                    options.success(model, resp);
            };
            var error = $.noop;
            (this.sync || Backbone.sync)('delete', this, success, error);
        }
        return this;
    },
    
    sync: function (method, model, success, error, options) {
        VIE2.log("info", "VIE2.Backbone#sync(" + model.get('id') + ")", "Start syncing!");
        
        var rdfTmp = jQuery.rdf({namespaces: VIE2.namespaces});
        
        VIE2.globalCache
        .where(model.get('id') + ' ?p ?o')
        .each(function (i, bindings, trs) {
            for (var j = 0; j < trs.length; j++) {
                rdfTmp.add(trs[j]);
            }
        });
        
        if (options.rules || options.props) {
            rdfTmp.reason(options.rules);
            //TODO: filter!
        }
        VIE2.log("info", "VIE2.Backbone#sync(" + model.get('id') + ")", "Found " + triples.length + " triples for serialization!");
            
        jQuery.each(VIE2.connectors, function (id, connector) {
            VIE2.log("info", "VIE2.Backbone#sync(" + model.get('id') + ")", "Using connector: '" + id + "'");
            connector.serialize(triples, options);
        });
        
        //VIE.RDFEntity.prototype.sync.call(this, method, model, success, error);
        VIE2.log("info", "VIE2.Backbone#sync(" + model.get('id') + ")", "End syncing!");
    }
});

VIE2.createEntity = function (attrs, opts) {
    if (!('id' in attrs)) {
    	attrs.id = $.rdf.blank('[]').toString();
    }
    var model = new VIE2.Entity(attrs, opts);
    VIE2.entities.add(model, opts);
    return model;
};

VIE2.Object = Backbone.Model.extend({
    
    initialize: function (attrs, opts) {
        if (!opts) { opts = {};}
        
        this.isLiteral = opts.isLiteral;
    },
    
    set: function (attrs, opts) {
        if (!opts) { opts = {};}
        if (!attrs) return this;
        
        var oldValue = this.attributes['value'];
        var newValue = attrs['value'];
        
        if (oldValue !== undefined && oldValue !== newValue) {
            if (this.collection) {
                //TODO: Dear future me! This is a hack, please change that!
                //user driven change
                //add the new
                var inst = VIE2.createLiteral(newValue, {
                    lang: this.attributes['lang'],
                    datatype: this.attributes['datatype']
                });
                this.collection.add(inst);
                this.collection.parent.change();
                //remove the old one
                this.collection.remove(this);
            }   
        }
        return Backbone.Model.prototype.set.call(this, attrs, opts);
    },
    
    tojQueryRdf: function () {
        if (this.isLiteral) {
            return this._tojQueryRdfLit();
        } else {
            return this._tojQueryRdfRes();
        }
    },
    
    _tojQueryRdfLit: function () {
        var lang = (this.get('lang')) ? this.get('lang') : undefined;
        var datatype = (this.get('datatype')) ? this.get('datatype') : undefined;
        
        if (lang !== undefined && datatype !== undefined) {
            datatype = undefined;
        }
        return jQuery.rdf.literal(
            this.get('value'), {
                namespaces: VIE2.namespaces,
                datatype: datatype,
                lang: lang
        });
    },
    
    _tojQueryRdfRes: function () {
        return jQuery.rdf.resource(
            this.get('value'), {
                namespaces: VIE2.namespaces
        });
    }
});

VIE2.createLiteral = function (value, opts) {
    if (!opts) { opts = {};}
    return new VIE2.Object({
        value: value,
        isResource: false,
        lang: opts.lang,
        datatype: opts.datatype,
    }, jQuery.extend(opts, {isLiteral: true}));
};

VIE2.createResource = function (value, opts) {
     if (!opts) { opts = {};}
     return new VIE2.Object({
        value: value,
        isLiteral: false,
        isResource: true
    }, jQuery.extend(opts, {isLiteral: false}));
};