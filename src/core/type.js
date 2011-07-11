// File:   type.js
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

// A <code>Type</code> is a format to map ontological entity types into the VIE&sup2; world
// - and hence, Backbone.js models.

VIE2.Type = function(id, parent, attrs, namespaces) {
    if (id === undefined || typeof id !== 'string') {
        throw "The type constructor needs an 'id' of type string! E.g., 'Person'";
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
   
    this.id = '<' + VIE2.baseNamespace + id + '>';
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
        
    this.listAttrs = function (targetType) {
        var attrs = [];
        for (var a = 0; a < this._attrs.length; a++) {
	    	var aId = this._attrs[a].id;
	    	var dt = (VIE2.getType(this._attrs[a].datatype))? VIE2.getType(this._attrs[a].datatype) : this._attrs[a].datatype;
	    	if (!targetType || VIE2.getType(targetType).id === dt.id) {
	    		attrs.push(new VIE2.Attribute(this, aId, dt, this.namespaces));
	    	}
	    }
    
        if (this.getParent()) {
            var parentAttrs = this.getParent().listAttrs(targetType);
            for (var i = 0; i < parentAttrs.length; i++) {
                var contains = false;
                for (var j = 0; j < attrs.length; j++) {
                    if (attrs[j].id === parentAttrs[i].id) {
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
    
    if (this.getParent() !== undefined) {
    	this.getParent()._children.push(this);
    };
    
    this.listChildren = function () {
        return this._children;
    };
    
    this.isTypeOf = function (type) {
        var searchFor = type;
        if (typeof type === 'string') {
            searchFor = VIE2.getType(type);
        }
        
        if (searchFor && this.id === searchFor.id) {
            return true;
        }
        if (this.getParent() !== undefined) {
            return this.getParent().isTypeOf(searchFor);
        }
        return false;
    };

	this.toHierarchyObject = function () {
		var obj = {id : this.id, children: []};
		for (var c = 0; c < this._children.length; c++) {
			obj.children.push(this._children[c].toHierarchyObject());
		}
		return obj;
	};
    
    //automatically registers the mapping in VIE^2.
    VIE2.registerType(this);
    
    return this;
};

//<strong>VIE2.types</strong>: Contains for all registered types (type.id is the key), the
//following items:<br/>
//* VIE2.types[id].type -> the type object itself
//* VIE2[type.id + 's'] -> the Backbone.js collection, with all entities of that type
VIE2.types = {};

//<strong>VIE2.registerType(type)</strong>: Static method to register a type (is automatically called 
//during construction of type class. This allocates an object in *VIE2.types[type.id]*.
VIE2.registerType = function (type) {
    //first check if there is already 
    //a type with 'type.id' registered
    if (!VIE2.types[type.id]) {
                
        VIE2.types[type.id] = type;
        
        var Collection = VIE2.EntityCollection.extend({model: VIE2.Object});
        
        //Person -> VIE2.Persons
        VIE2[type.sid + "s"] = new Collection();
        
        //trigger filling of collections!
        VIE2.entities.each(function () {
            this.searchCollections();
        })
    } else {
        VIE2.log("warn", "VIE2.registerType()", "Did not register type, as there is" +
                "already a type with the same id registered.");
    }
};

VIE2.getType = function (typeId) {
    
    if (typeId.indexOf('<') === 0) {
        return VIE2.types[typeId];
    }
    else if (typeId.indexOf(VIE2.baseNamespace) === 0) {
        return VIE2.getType('<' + typeId + '>');
    }
    else if (typeId.indexOf(':') > 0) {
        return VIE2.getType(typeId.substring(typeId.indexOf(':')+1));
    }
    else {
        return VIE2.getType('<' + VIE2.baseNamespace + typeId + '>');
    }
    return undefined;
}

//<strong>VIE2.unregisterType(typeId)</strong>: Unregistering of types. 
// There is currently no usecase for that, but it wasn't that hard to implement ;)
VIE2.unregisterType = function (typeId) {
    var t = VIE2.getType(typeId);
    
    delete VIE2.types[t.id];
    delete VIE2[t.sid + "s"];
};