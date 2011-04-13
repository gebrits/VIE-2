/**
 * @fileOverview VIE&sup2;
 * @author <a href="mailto:sebastian.germesin@dfki.de">Sebastian Germesin</a>
 */

//The global <strong>VIE&sup2; object</strong>. If VIE&sup2; is already defined, the
//existing VIE&sup2; object will not be overwritten so that the
//defined object is preserved.
if (typeof VIE2 == 'undefined' || !VIE2) {
    VIE2 = {};
}

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
                    if ($.isArray(val)) {
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
        var types = VIE2.getFromCache(this.get('id'), 'a');
        
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
        return VIE2.getFromCache(this.get('id'), attr);
    }
});

VIE2.Literal = Backbone.Model.extend({
    set: function (attrs, opts) {
        //TODO: overwrite me!
        return Backbone.Model.prototype.set.call(this, attrs, opts);
    },
    
    tojQueryRdf: function () {
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
    }
});

VIE2.Resource = Backbone.Model.extend({
    
    set: function (attrs, opts) {
        //TODO: overwrite me!
        return Backbone.Model.prototype.set.call(this, attrs, opts);
    },
    
    tojQueryRdf: function () {
        return jQuery.rdf.resource(
            this.get('value'), {
                namespaces: VIE2.namespaces
            });
    }
});