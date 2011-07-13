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
        throw new Error(["Can't add the same model to a set twice", attrs['id']]);
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
            
            //do the whole magic from the parent class
            VIE.RDFEntity.prototype.set.call(this, attrs, opts);
            
            if (!opts.backend) {
                //add triple to global VIE2 cache via VIE2.addToCache
                var uri = this.get('id');
                
                //add type of entity first!
                VIE2.addToCache(uri, 'a', attrs['a']);
                            
                for (var attr in attrs) {
                    if (attr !== 'id' && attr !== 'a') {
                        var val = attrs[attr];
                        var attrUri = this.get('a').getAttr(attr).id;
                        VIE2.addToCache(uri, attrUri, VIE2.Util.js2turtle(val));
                        
                        if (!opts.silent) 
                            this.trigger('change:' + attr, this, val, opts);
                    }
                }
            }
            return this;
        },
        
        get: function (attr) {
            if (attr === 'id') {
                return VIE.RDFEntity.prototype.get.call(this, attr);
            } else {
                //overwrite completely with VIE2.getPropFromCache();
                var uri = this.get('id');
                var ret = VIE2.getPropFromCache(this, uri, attr);
                return ret;
            }
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


VIE2.Object = Backbone.Model.extend({
    
    isEntity: function () {
        return false;
    }
});

VIE2.createLiteral = function (value, opts) {
    if (!opts) { opts = {};}
    
    return new VIE2.Object({
        value      : value,
        isLiteral  : true,
        isResource : false,
        lang: opts.lang,
        datatype: opts.datatype,
    }, jQuery.extend(opts, {isLiteral: true}));
};

VIE2.createResource = function (value, opts) {
     if (!opts) { opts = {};}

     var val = (value.indexOf('<') === 0 || value.indexOf('_:') === 0)? value : '<' + value + '>';
     
     var ent = VIE2.EntityManager.getBySubject(val);
     if (ent) {
         return ent;
     }
     else {
         return new VIE2.Object({
             value     : val,
             isLiteral : false,
             isResource: true
         }, jQuery.extend(opts, {
             isLiteral: false
         }));
     }
};
