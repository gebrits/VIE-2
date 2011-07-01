// File:   type.js
// Author: <a href="mailto:sebastian.germesin@dfki.de">Sebastian Germesin</a>
//

// A <code>Type</code> is a format to map ontological entity types into the VIE&sup2; world
// - and hence, Backbone.js models.

VIE2.Type = function(id, parent, attrs, namespaces) {
    if (id === undefined) {
        throw "The type constructor needs an 'id'!";
    }
    if (typeof id !== 'string') {
        throw "The type constructor needs an 'id' of type 'string'!";
    }
    if (parent !== undefined && typeof parent !== 'string') {
        throw "The type constructor needs a 'parent' of type 'string', e.g., 'Thing'!";
    }
    if (attrs === undefined) {
        throw "The type constructor needs 'attributes'!";
    }
    
    this._expandId = function (id) {
        return '<' + VIE2.baseNamespace + id + '>';
    }
    
    this.id = this._expandId(id);
    this.sid = id;
    
    this._parent = parent;
    
    this._attrs = (attrs)? attrs : [];
        
    this.getAttrs = function () {
        var attrs = this._attrs;
        if (this.getParent()) {
            var parentAttrs = this.getParent().getAttrs();
            for (var i = 0; i < parentAttrs.length; i++) {
                var contains = false;
                for (var j = 0; j < this._attrs.length; j++) {
                    if (this._attrs[j].id === parentAttrs[i].id) {
                        contains = true;
                    }
                }
                if (!contains) {
                    attrs.push(parentAttrs[i]);
                }
            }
        }
        return attrs;
    };
    
    this.namespaces = (namespaces)? namespaces : {};
        
    //add given namespaces to VIE&sup2;'s namespaces
    jQuery.each(this.namespaces, function (k, v) {
        VIE2.namespaces.add(k, v);
    });
    
    this.getParent = function () {
        //in case the parent was not resolved during init
        if (typeof this._parent === 'string') {
            this._parent = VIE2.getType(this._parent);
        }
        return this._parent;
    },
    
    this.isTypeOf = function (type) {
        var searchFor = type;
        if (typeof type === 'string') {
            searchFor = VIE2.getType(type);
        }
        
        if (this.id === searchFor.id) {
            return true;
        }
        if (this.getParent() !== undefined) {
            return this.getParent().isTypeOf(searchFor);
        }
        return false;
    };
    
    this.toResource = function () {
        return VIE2.createResource(this.id);
    }
    
    //automatically registers the mapping in VIE^2.
    VIE2.registerType(this);
};