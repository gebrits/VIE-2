// File:   collection.js
// Author: <a href="mailto:sebastian.germesin@dfki.de">Sebastian Germesin</a>
//

//just for convenience, should be removed in a later revision
VIE.EntityManager.initializeCollection();

//<strong>VIE2.EntityCollection</strong>: TODO: document me
VIE2.EntityCollection = VIE.RDFEntityCollection.extend({
    
    //overwrite the internal _add method
    _add: function (model, opts) {
        if (!opts) { opts = {};}
        
        if (this.get(model.get('id'))) {
            return;
        }
        
        VIE.RDFEntityCollection.prototype._add.call(this, model, opts);
        
        //if the annotation does *not* come from the analyze() method
        //it comes from the user and hence,
        //we need to add the subject to the internal triple store.
        if (!opts.backend) {
            var triple = jQuery.rdf.triple(
                model.get('id'), 
                'a', 
                VIE2.getType('Thing').id, 
                {namespaces: VIE2.namespaces.toObj()}
            );
            VIE2.globalCache.add(triple);    
        }
    },
    
    _remove: function (model, opts) {
        if (!opts) { opts = {};}
        if (model) {
            //when removing the model from this collection, that means
            //that we remove all corresponding data from the cache as well.
            if (VIE2.entities === this) {
                VIE2.removeFromCache(model.get('id'));
                delete VIE2.globalCache.databank.subjectIndex[model.get('id')]; //HACK: rdfQuery does not remove an entity from its internal DB when no other triples are present
                //also remove from all other collections!
                jQuery.each(VIE2.mappings, function(k, v){
                    v.collection.remove(model);
                });
                
                VIE.EntityManager.entities.remove(model, opts);
                model.destroy();
            }
            VIE.RDFEntityCollection.prototype._remove.call(this, model, opts);
        }
    }
});

VIE2.entities = new VIE2.EntityCollection();

//<strong>VIE2.ObjectCollection</strong>: TODO: document me
VIE2.ObjectCollection = Backbone.Collection.extend({
        
    _add: function (model, opts) {
        //TODO: propagate event to parent model
        if (!opts) { opts = {};}
        
        //adding a back-reference to the model
        model.collection = this;
        Backbone.Collection.prototype._add.call(this, model, opts);
        
        if (!opts.backend) {
            var triple = jQuery.rdf.triple(
                this.uri, 
                this.property, 
                model.tojQueryRdf(), 
                {namespaces: VIE2.namespaces.toObj()}
            );
            VIE2.globalCache.add(triple);
            if (this.parent) {
                this.parent.change();
            }
        }
    },
    
     _remove: function (model, opts) {
         if (model) {
             //remove corresponding triples
            VIE2.removeFromCache(this.uri, this.property, model.tojQueryRdf());
            
            Backbone.Collection.prototype._remove.call(this, model, opts);
             
            //update parent entity
            this.parent.change();
        }
     },
     
     getByValue: function (value, opts) {
         if (!opts) { opts = {}; }
         
         var found;
         $.each(this.models, function (i, model) {
             if (model.get('value') === value) {
                 if (opts.lang) {
                     if (opts.lang === model.get('lang')) {
                         found = model;
                         return false;
                     }
                 } else if (opts.datatype) {
                     if (opts.datatype === model.get('datatype')) {
                         found = model;
                         return false;
                     }
                 } else {
                     found = model;
                     return false;
                 }
             }
         });
         
         return found;
     }
});






