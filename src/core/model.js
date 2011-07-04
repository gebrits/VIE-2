// File:   model.js
// Author: <a href="mailto:sebastian.germesin@dfki.de">Sebastian Germesin</a>
//

//<strong>VIE2.Entity</strong>: The parent backbone entity class for all other entites.
//Inherits from VIE.RDFEntity.
VIE2.Entity = VIE.RDFEntity.extend({
    
    initialize: function (attrs, opts) {
        //if the type has changed, we need to search through the
        //types if the model needs to be inserted.
        this.bind('change:a', this.searchCollections);
        
        if (!opts) { opts = {};}
        
        if (!opts.backend) {
            for (var attr in attrs) {
                var val = attrs[attr];
                if (attr !== 'id') {
                    var valArr;
                    if (!jQuery.isArray(val)) {
                        valArr = [ val ];
                    } else {
                        valArr = val;
                    }
                    for (var i = 0; i < valArr.length; i++) {
                        var triple = jQuery.rdf.triple(this.id, attr, valArr[i], {
                            namespaces: VIE2.namespaces.toObj()
                        });
                        VIE2.globalCache.add(triple);
                    }
                }
            }
        }
        //in any case, we query all connectors for the types of the entity.
        VIE2.lookup(this.get('id'), ['a', 'sameAs'], function (m) {
            return function () {
                m.trigger('change:a');
            };
        }(this));
    },
    
    searchCollections: function () {
        var self = this;
        var types = VIE2.getFromCache(this, this.get('id'), 'a');

        jQuery.each(VIE2.types, function (i, type) {
            var belongsHere = false;
            
            for (var x = 0; x < types.length; x++) {
                var curie = types.at(x).get('value');
                if (!VIE2.Util.isCurie(curie)) {
                    curie = jQuery.createCurie(curie.replace(/^</, '').replace(/>$/, ''), {
                        namespaces: VIE2.namespaces.toObj(),
                        charcase: 'lower'
                    }).toString();
                }
                if (type['a'].indexOf(curie) !== -1) {
                    belongsHere = true;
                    break;
                }
            }
            //entity needs to be registered with this mapping
            if (belongsHere) {
                //adding model instance to collection
                if (!type['collection'].get(self.id)) {
                    type['collection'].add(self, {backend: true});
                    VIE2.log("info", "VIE2.Entity.searchCollections()", "Added entity '" + self.get('id') + "' to collection of type '" + i + "'!");
                    
                    VIE2.log("info", "VIE2.Entity.searchCollections()", "Querying for default properties for entity '" + self.get('id') + "': [" + type['mapping'].defaults.join(", ") + "]!");
                    VIE2.lookup(self.get('id'), type['mapping'].defaults, function(defProps, model){
                        return function(){
                            VIE2.log("info", "VIE2.Entity.searchCollections()", "Finished querying for default properties for entity '" + model.get('id') + "': [" + defProps.join(", ") + "]!");
                            //trigger change when finished
                            for (var y = 0; y < defProps.length; y++) {
                                model.trigger('change:' + defProps[y]);
                            }
                            model.change();
                        };
                    }(type['mapping'].defaults, self));
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
    }
});

VIE2.createEntity = function (type, attrs, opts) {
    if (!type) {
    	type = VIE2.getType("Thing");	
	} 
	if (!attrs) {
        attrs = {};
    }
    if (!opts) {
        opts = {};
    }
    if (!('id' in attrs)) {
    	attrs.id = $.rdf.blank('[]').toString();
    }
    //setting the type of the entity
    attrs.a = type.id;
    
    //create the model
    var model = new VIE2.Entity(attrs, opts);
    
    //automatically adds model to global VIE2.entities bucket
    VIE2.entities.add(model, opts);
    
    return model;
};

VIE2.Object = Backbone.Model.extend({
    
    initialize: function (attrs, opts) {
        if (!opts) { opts = {};}
        
        this.isLiteral = (opts.isLiteral)? opts.isLiteral : false;
    },
    
    set: function (attrs, opts) {
        if (!opts) { opts = {};}
        if (!attrs) return this;
        
        var oldValue = this.attributes['value'];
        var newValue = attrs['value'];
        
        if (oldValue !== undefined && oldValue !== newValue) {
            if (this.collection) {
            	//remove old triple, add new triple!
            	VIE2.removeFromCache(this.collection.uri, 
            						 this.collection.property, 
    								 oldValue);
            	
            	var triple = jQuery.rdf.triple(
	                this.collection.uri, 
	                this.collection.property, 
	                this.tojQueryRdf(newValue), 
                {namespaces: VIE2.namespaces.toObj()});
	            VIE2.globalCache.add(triple);
            
                this.collection.parent.change();
            }   
        }
        return Backbone.Model.prototype.set.call(this, attrs, opts);
    },
    
    tojQueryRdf: function (val) {
        if (this.isLiteral) {
            return this._tojQueryRdfLit(val);
        } else {
            return this._tojQueryRdfRes(val);
        }
    },
    
    _tojQueryRdfLit: function (val) {
        var lang = (this.get('lang')) ? this.get('lang') : undefined;
        var datatype = (this.get('datatype')) ? this.get('datatype') : undefined;
        
        if (lang !== undefined && datatype !== undefined) {
            datatype = undefined;
        }
        
        var val = (val)? val : this.get('value');
        
        var lit =  jQuery.rdf.literal(
            val, {
                namespaces: VIE2.namespaces.toObj(),
                datatype: datatype,
                lang: lang
        });
        return lit;
    },
    
    _tojQueryRdfRes: function (val) {
        return jQuery.rdf.resource(
            (val)? val : this.get('value'), {
                namespaces: VIE2.namespaces.toObj()
        });
    },
    
    tojQueryRdfTriple: function () {
        var triple = jQuery.rdf.triple(this.collection.uri + " " + this.collection.property + " " + this.tojQueryRdf().toString(), {
                namespaces: VIE2.namespaces.toObj()
        });
        
        return triple;
    },
    
    //for convenience
    value: function () {
        return this.get('value');
    },
    //for convenience
    datatype: function () {
        return this.get('datatype');
    },
    //for convenience
    lang: function () {
        return this.get('lang');
    },
    
    isResource: function () {
    	return this.get('isResource');
    },
    
    isLiteral: function () {
    	return this.get('isLiteral');
    },
});

VIE2.createLiteral = function (value, opts) {
    if (!opts) { opts = {};}
    return new VIE2.Object({
        'value': value,
        isResource: false,
        lang: opts.lang,
        datatype: opts.datatype,
    }, jQuery.extend(opts, {isLiteral: true}));
};

VIE2.createResource = function (value, opts) {
     if (!opts) { opts = {};}
     return new VIE2.Object({
        'value': (value.indexOf('<') === 0 || value.indexOf('_:') === 0)? value : '<' + value + '>',
        isLiteral: false,
        isResource: true
    }, jQuery.extend(opts, {isLiteral: false}));
};
