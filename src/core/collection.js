// File:   collection.js
// Author: <a href="mailto:sebastian.germesin@dfki.de">Sebastian Germesin</a>
//

if (this.VIE2 === undefined) {
	/*
	 * The VIE2 global namespace object. If VIE2 is already defined, the
	 * existing VIE2 object will not be overwritten so that defined
	 * namespaces are preserved.
	 */
	this.VIE2 = {};
}

var VIE2 = this.VIE2;

//just for convenience, should be removed in a later revision
VIE2.EntityManager = VIE.EntityManager; // for typo issues ;)
VIE2.EntityManager.initializeCollection();

//<strong>VIE2.EntityCollection</strong>: TODO: document me
VIE2.EntityCollection = VIE.RDFEntityCollection.extend({
    
    //overwrite the internal _add method
    _add: function (model, opts) {
        if (!opts) { opts = {};}
        
        if (this.get(model)) {
            //TODO: verify this code!
            return model;
        }
        
        if (!model.isEntity) {
            //TODO: verify this code!
        	return model;
        }
        
        return VIE.RDFEntityCollection.prototype._add.call(this, model, opts);
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
    //TODO
});

//<strong>VIE2.entities</strong>: Is a global Backbone JS Collection
//which stores all models of all known entities.
VIE2.entities = new VIE2.EntityCollection();







