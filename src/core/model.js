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
VIE2.Entity = VIE.RDFEntity.extend({
    
    set: function (attrs, opts) {
        if (!attrs) {attrs = {};}
        if (!opts) {opts = {};}
        
        if (opts.backend) {
            //only allocate the model
            //everything has already been loaded
            //into the internal triple cache!
            if ('id' in attrs) {
                this.id = attrs['id'];
            }
            return;
        } else {
        //TODO: VIE2.addToCache
        var uri = this.getSubject();
        
        this._changing = true;
        var now = this.attributes, escaped = this._escapedAttributes;
        
        if (!options.silent && this.validate && !this._performValidation(attrs, options)) 
            return false;
        if ('id' in attrs) {
            //TODO!
            this.id = attrs[this.idAttribute];
        }
        var alreadyChanging = this._changing;
        
        
        for (var attr in attrs) {
            var val = attrs[attr];
            if (!_.isEqual(now[attr], val)) {
                now[attr] = val;
                delete escaped[attr];
                this._changed = true;
                if (!options.silent) this.trigger('change:' + attr, this, val, options);
            }
        }
        
        if (!alreadyChanging && !options.silent && this._changed) this.change(options);
        this._changing = false;
        
        return this;
        }
    },
    
    get: function () {
      //TODO!  
    },

    isEntity: function () {
        return true;
    }
});

VIE2.createEntity = function (type, attrs, opts) {
    if (!type) {
    	type = VIE2.getType("Thing");	
	} else if (typeof type === 'string') {
		type = VIE2.getType(type);
	}
	if (!attrs) {
        attrs = {};
    }
    if (!opts) {
        opts = {};
    }
    if (!('id' in attrs)) {
    	attrs.id = jQuery.rdf.blank('[]').toString();
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
