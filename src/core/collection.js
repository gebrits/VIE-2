/**
 * @fileOverview VIE^2
 * @author <a href="mailto:sebastian.germesin@dfki.de">Sebastian Germesin</a>
 */

//The global <strong>VIE2 object</strong>. If VIE2 is already defined, the
//existing VIE2 object will not be overwritten so that the
//defined object is preserved.
if (typeof VIE2 == 'undefined' || !VIE2) {
    VIE2 = {};
}

//just for convenience, should be removed in a later revision
VIE.EntityManager.initializeCollection();

//<strong>VIE2.EntityCollection</strong>: TODO: document me
VIE2.EntityCollection = VIE.RDFEntityCollection.extend({
    
    //overwrite the internal _add method
    _add: function (model, opts) {
        opts || (opts = {});
        VIE.RDFEntityCollection.prototype._add.call(this, model, opts);
        
        //if the annotation does *not* come from the analyze() method
        //it comes from the user and hence,
        //we need to add the subject to the internal triple store.
        if (!opts.backend) {
            var triple = jQuery.rdf.triple(
                model.get('id'), 
                'a', 
                'owl:Thing', 
                {namespaces: VIE2.namespaces}
            );
            VIE2.globalCache.add(triple);    
        }
        //in any case, we query all connectors for the types of the entity.
        VIE2.lookup(model.get('id'), ['a'], function (m) {
        	return function () {
        	    m.trigger('change:a');
            };
        }(model));
	},
    
    _remove: function (model, opts) {
        //when removing the model from this collection, that means
        //that we remove all corresponding data from the cache as well.
        var pattern = jQuery.rdf.pattern(model.get('id'), '?x', '?y', {namespaces: VIE2.namespaces});
        VIE2.globalCache
        .remove(pattern);
        
        //TODO: also remove from all other collections!
        
        VIE.RDFEntityCollection.prototype._remove.call(this, models, opts);
    }
});

VIE2.entities = new VIE2.EntityCollection();

//<strong>VIE2.ObjectCollection</strong>: TODO: document me
VIE2.ObjectCollection = Backbone.Collection.extend({
        
    _add: function (model, opts) {
        opts || (opts = {});
        Backbone.Collection.prototype._add.call(this, model, opts);
        
        if (!opts.backend) {
            var triple = jQuery.rdf.triple(
                this.uri, 
                this.property, 
                model.tojQueryRdf(), 
                {namespaces: VIE2.namespaces}
            );
            VIE2.globalCache.add(triple);  
        }
    },
    
     _remove: function(model, opts){
         //TODO!
     }     
});