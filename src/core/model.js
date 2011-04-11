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
    
    addAValue: function (prop, value, opts) {
        VIE2.addProperty(this.getSubject(), prop, value);
        if (!opts || !opts.silent) {
            this.trigger("change:" + prop);
            this.change();
        }
    },
    
    changeAValue: function (prop, from, to, opts) {
        VIE2.changeProperty(this.getSubject(), prop, from, to);
         if (!opts || !opts.silent) {
            this.trigger("change:" + prop);
            this.change();
        }
    },
    
    removeAValue: function (prop, value, opts) {
        VIE2.removeProperty(this.getSubject(), prop, value);
         if (!opts || !opts.silent) {
            this.trigger("change:" + prop);
            this.change();
        }
    },
    
    //overwritten to directly access the global Cache
    get: function (attr) {
        if (attr === 'id') {
    		return VIE.RDFEntity.prototype.get.call(this, attr);
        }
        return VIE2.getFromGlobalCache(this.getSubject(), attr);
    },
    
    //extending 'set()' to allow updating the Cache through backbone model.
    set: function (attrs, opts) {
        if ('id' in attrs) {
            this.id = attrs.id;
        }
        //remove all triples and add new ones
        var that = this;
        jQuery.each(attrs, function(k, v) {
            if (k !== 'id' && k !== 'a') {
                VIE2.removeProperty(that.getSubject(), k);
                if (!jQuery.isArray(v)) {
                    v = [v];
                }
                VIE2.addProperty(that.getSubject(), k, v);
                that.trigger('change:' + k);
            }
            else {
                var obj = {};
                obj[k] = v;
                VIE.RDFEntity.prototype.set.call(that, obj, opts);
            }
        });
        this.change();
    },
    
    unset: function (attribute, opts) {
        VIE2.removeProperty(this.getSubject(), attribute, '?x');
        if (!opts.silent) {
            this.trigger('change:' + attribute);
            this.change();
        }
    },
        
    destroy: function (opts) {
    	//TODO: overwrite me??
        //remove entity from Cache!
    	VIE.RDFEntity.prototype.destroy.call(this, opts);
    },
    
    clear: function (opts) {
        var that = this;
    	jQuery.each(this.attributes, function (k) {
            if (k !== 'a' && k !== 'id') {
                that.unset(k);
            }
        });
    },
    
    fetch: function (options) {
        //TODO: overwrite me??
        VIE.RDFEntity.prototype.fetch.call(options);
    },
    
    save: function (attrs, opts) {
        //TODO overwrite me??
        VIE.RDFEntity.prototype.save.call(attrs, opts);
    },
    
    validate: function (attrs) {
        //TODO overwrite me??
        VIE.RDFEntity.prototype.validate.call(attrs);
    }

});

//just for convenience, will be removed in a later revision
VIE.EntityManager.initializeCollection();
