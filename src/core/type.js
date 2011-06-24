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
    
    this.id = id;
    this.parent = parent;
    
    this.attrs = (attrs)? attrs : [];
    
    if (this.parent !== undefined) {
        //import attributes from parent!
        this.attrs = this.attrs.concat(VIE2.types[this.parent]['type'].attrs);
    }
    
    this.namespaces = (namespaces)? namespaces : {};
        
    //add given namespaces to VIE&sup2;'s namespaces
    jQuery.each(this.namespaces, function (k, v) {
        VIE2.namespaces.add(k, v);
    });
    
    //automatically registers the mapping in VIE^2.
    VIE2.registerType(this);
};