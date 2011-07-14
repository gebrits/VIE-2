// File:   model.js
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

//<strong>VIE2.Entity</strong>: The parent backbone entity class for all other entites.
//Inherits from VIE.RDFEntity.
VIE2.Entity = function (attrs, opts) {
    
    if (!attrs) {attrs = {};}
    if (!opts) {opts = {};}
    
    //check if model already exists, if so, throw Error
    if (attrs['id'] && VIE2.entities.get(attrs['id'])) {
        throw new Error("Sorry, model already existing! Please use VIE2.entities.get(" + attrs['id'] + ")");
    }
    
    //generate blank id if none was given
    if (!('id' in attrs)) {
    	attrs['id'] = jQuery.rdf.blank('[]').toString();
    }
    
    //set type Thing if none was given
    //OR convert given type
    if (!('a' in attrs)) {
    	attrs['a'] = VIE2.getType("Thing").id;
	} else {
        // in the current implementation, we only allow *one* type per entity
		attrs['a'] = VIE2.getType(jQuery.isArray(attrs['a'])? attrs['a'][0] : attrs['a']).id;
	}
    
    var Model = VIE.RDFEntity.extend({
        
        set: function (attrs, opts) {
            if (!attrs) {attrs = {};}
            if (!opts) {opts = {};}
            
            //inherit the whole magic from the parent class
            VIE.RDFEntity.prototype.set.call(this, attrs, opts);
            
            if (!opts.backend) {
                //add triple to global VIE2 cache via VIE2.addToCache
                
                //add type of entity first!
                if ('a' in attrs) {
                    this._setH('a', this.get('a'), attrs['a'], opts);
                }
                            
                for (var attr in attrs) {
                    if (attr !== 'id' && attr !== 'a') {
                        var oldVals = this.get(attr);
                        var newVals = attrs[attr];               
                        
                        this._setH(attr, oldVals, newVals, opts);
                    }
                }
            }
            return this;
        },
        
        _setH: function (attr, oldVals, newVals, opts) {
            var uri = this.get('id');
            var attrUri = attr === 'a' ? 'a' : this.get('a').getAttr(attr).id;

            if (oldVals === null) {
                oldVals = [];
            }
            if (!jQuery.isArray(oldVals)) {
                oldVals = [ oldVals ];
            }
            if (!jQuery.isArray(newVals)) {
                newVals = [ newVals ];
            }
            
            //TODO: validate including typechecking!
            
            //sort both!
            var oldValsC = oldVals.slice(0).sort(VIE2.Util.sort);
            var newValsC = newVals.slice(0).sort(VIE2.Util.sort);
            
            var i = 0, j = 0;
            while (i < oldValsC.length && j < newValsC.length) {
                var o = oldValsC[i];
                var n = newValsC[j];
                
                if (o instanceof VIE2.Type) {
                    n = VIE2.getType(n);
                }
                
                if (o === n) {
                    //ignore
                    i++;
                    j++;
                } else if (o < n) {
                    //remove old o
                    VIE2.removeFromCache(uri, attrUri, VIE2.Util.js2turtle(o));
                    i++;
                } else {
                    //add new n
                    VIE2.addToCache(uri, attrUri, VIE2.Util.js2turtle(n));
                    j++;
                }
            }
            
            for (; i < oldValsC.length; i++) {
                //remove what's left
                VIE2.removeFromCache(uri, attrUri, VIE2.Util.js2turtle(oldValsC[i]));
            }
            
            for (; j < newValsC.length; j++) {
                //insert what's left
                VIE2.addToCache(uri, attrUri, VIE2.Util.js2turtle(newValsC[j]));
            }
        },
        
        get: function (attr) {
            if (attr === 'id') {
                return VIE.RDFEntity.prototype.get.call(this, attr);
            } else if (attr === 'a') {
                return VIE2.getPropFromCache.call(this, attr);
            } else {
                //overwrite completely with VIE2.getPropFromCache();
                var attrUri = this.get('a').getAttr(attr).id;
                var ret = VIE2.getPropFromCache.call(this, attrUri);
                
                return ret;
            }
        },
        
        unset: function (attr, opts) {
            if (!attr || attr === 'id') return this;
            if (!opts) {opts = {};}
            
            VIE.RDFEntity.prototype.unset.call(this, attr, opts);
            
            if (attr !== 'id') {
                this._setH(attr, this.get(attr), [], opts);
            }
            return this;
        },
        
        destroy: function (opts) {
            //TODO
            VIE.RDFEntity.prototype.destroy.call(this, opts);
            VIE2.entities.remove(this, opts);
        },
    
        //for convenience
        isEntity: true
    });
    
    var model = new Model(attrs, jQuery.extend(opts, {
        collection: VIE2.entities
    }));
            
    //automatically adds model to global VIE2.entities bucket
    VIE2.entities.add(model, opts);
    
    return model;
};