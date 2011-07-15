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
    	attrs['a'] = VIE2.getType("Thing");
	} else {
        // in the current implementation, we only allow *one* type per entity
		attrs['a'] = VIE2.getType(jQuery.isArray(attrs['a'])? attrs['a'][0] : attrs['a']);
	}
    
    var methodMap = {
        'create': 'POST',
        'update': 'PUT',
        'delete': 'DELETE',
        'read'  : 'GET'
    };
    
    var Model = VIE.RDFEntity.extend({
        
        /*validate: function(attrs) {
            //TODO
            return true;
        },*/
       
       
        
        sync: function (method, model, opts) {
            if (!opts) {opts = {};}
            
            //sync with local triplestore (VIE2.globalCache)!
            var type = methodMap[method];
            
            var attributes = [];
            
            if (opts.filter) {
                if (!jQuery.isArray(opts.filter)) {
                    opts.filter = [opts.filter];
                }
                attributes = opts.filter;
            }
            else {
                for (var attr in model.attributes) {
                    if (attributes.indexOf(attr) === -1) 
                        attributes.push(attr);
                }
            }
            
            console.log(method, "<<<", attributes);

            for (var a = 0; a < attributes.length; a++) {
                var attr = attributes[a];
                
                if (attr === 'id') {
                    //TODO!
                    continue;
                }
                try {
                    var attrUri = (attr === 'a')? attr : this['a'].getAttr(attr).id;
                } catch (e) {
                    console.log("germi", e);
                }
                var oldVals = VIE2.getPropFromCache.call(this, attrUri); //TODO: does not work properly!
                var newVals = model.attributes[attr];
                
                switch (type) {
                    case 'DELETE':
                        console.log("REMOVE FROM TRIPLESTORE!");
                        this._syncHelper(attrUri, oldVals, [], opts);
                        break;
                    case 'PUT':
                    case 'POST':
                        console.log("WRITE INTO TRIPLESTORE!");
                        this._syncHelper(attrUri, oldVals, newVals, opts);
                        break;
                    default:
                        console.log("READ FROM TRIPLESTORE!");
                        //overwrite completely with VIE2.getPropFromCache();
                        var ret = VIE2.getPropFromCache.call(this, attrUri);
                        console.log("from cache:", ret);
                        this.attributes[attr] = ret;
                    
                        break;
                }
            }
        },
        
        _syncHelper: function (attrUri, oldVals, newVals, opts) {
            var uri = this.get('id');

            if (oldVals === undefined || oldVals === null) {
                oldVals = [];
            }
            if (!jQuery.isArray(oldVals)) {
                oldVals = [ oldVals ];
            }
            if (newVals === undefined || newVals === null) {
                newVals = [];
            }
            if (!jQuery.isArray(newVals)) {
                newVals = [ newVals ];
            }
            
            //TODO: validate including typechecking!
            console.log(attrUri);
            console.log("ooo", oldVals);
            console.log("nnn", newVals);
            
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
        
        get: function (attr, opts) {
            if (!opts) {opts = {};}
            if (attr !== 'id' && !opts.sync && !opts.clear) {
                this.sync.call(this, 'read', this, jQuery.extend(opts, {filter: attr}));
            }
            var ret = VIE.RDFEntity.prototype.get.call(this, attr);
            
            if (ret && !jQuery.isArray(ret) && attr !== 'id' && attr != 'a') {
                return [ ret ];
            }
            if (!ret || (jQuery.isArray(ret) && ret.length === 0) || ret === null) {
                //return undefined if nothing is there.
                return undefined;
            }
            return ret;
        },
                
        set: function (attrs, opts) {
            if (!attrs) {attrs = {};}
            if (!opts) {opts = {};}
            
            for (var attr in attrs) {
                if (attr !== 'a' && attr !== 'id' && attrs[attr] === []) {
                    this.unset(attr, opts);
                    delete attrs[attr];
                }
            }
            
            //inherit the whole magic from the parent class
            var ret = VIE.RDFEntity.prototype.set.call(this, attrs, opts);
            if ('a' in attrs) this.a = attrs['a'];
            
            this.sync.call(this, true ? 'create' : 'update', this, opts);
            
            return ret;
        },
        
        unset: function (attr, opts) {
            if (!opts) {opts = {};}
            
            //preserve these two special attributes!
            if (attr === 'id' || attr === 'a') {
                return this;
            }
            
            //inherit the whole magic from the parent class
            var ret = VIE.RDFEntity.prototype.unset.call(this, attr, jQuery.extend(opts, {filter: attr}));
            
            if (!opts.clear) {
                this.sync.call(this, 'delete', this, jQuery.extend(opts, {filter: attr}));
            }
            return ret;
        },
        
        clear : function(opts) {
            var attributes = [];
            
            for (var attr in model.attributes) {
                if (attributes.indexOf(attr) === -1) 
                    attributes.push(attr);
            }
                
            var ret = VIE.RDFEntity.prototype.clear.call(this, jQuery.extend(opts, {clear: true}));
            
            this.sync.call(this, 'delete', this, jQuery.extend(opts, {filter: attributes}));
            
            return ret;
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