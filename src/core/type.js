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
    
    if (VIE2.getType(id)) {
    	// singleton!
    	return VIE2.getType(id);
    }
   
    this.id = (VIE2.baseNamespace)? '<' + VIE2.baseNamespace + id + '>' : id;
    this.sid = id;
    
    this._parent = parent;
    
	this._children = [];
    
    //add given namespaces to VIE&sup2;'s namespaces
    this.namespaces = (namespaces)? namespaces : {};
    jQuery.each(this.namespaces, function (k, v) {
        VIE2.namespaces.add(k, v);
    });
    
    // allocate attributes
    this._attrs = attrs;
        
    this.listAttrs = function () {
        var attrs = [];
        for (var a = 0; a < this._attrs.length; a++) {
	    	var aId = this._attrs[a].id;
	    	var dt = (VIE2.getType(this._attrs[a].datatype))? VIE2.getType(this._attrs[a].datatype) : this._attrs[a].datatype;
	    	attrs.push(new VIE2.Attribute(this, aId, dt, this.namespaces));
	    }
    
        if (this.getParent()) {
            var parentAttrs = this.getParent().listAttrs();
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
    
    this.getAttr = function (aId) {
    	var attrs = this.listAttrs();
    	for (var a = 0; a < attrs.length; a++) {
			if (attrs[a].id === aId || attrs[a].sid === aId) {
				return attrs[a];
			}
	    }
    	return undefined;
    };
       
    this.getParent = function () {
        //in case the parent was not resolved during init
        if (typeof this._parent === 'string') {
            this._parent = VIE2.getType(this._parent);
        }
        return this._parent;
    };
    
    if (this.getParent()) {
    	this.getParent()._children.push(this);
    };
    
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

	this.getHierarchyObject = function () {
		var obj = {id : this.id, children: []};
		for (var c = 0; c < this._children.length; c++) {
			obj.children.push(this._children[c].getHierarchyObject());
		}
		return obj;
	}
    
    //automatically registers the mapping in VIE^2.
    VIE2.registerType(this);
    
    return this;
};