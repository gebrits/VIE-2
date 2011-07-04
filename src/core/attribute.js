// File:   attribute.js
// Author: <a href="mailto:sebastian.germesin@dfki.de">Sebastian Germesin</a>
//

// An <code>Attribute</code> is a format to map ontological entity attributes into the 
// VIE&sup2; world - and hence, Backbone.js models.

VIE2.Attribute = function(type, id, datatype, namespaces) {
    if (type && typeof type === 'string') {
		type = VIE2.getType(type);
	}
	if (type === undefined) {
        throw "The attribute constructor needs a 'type'!";
	}
	if (id === undefined) {
        throw "The attribute constructor needs an 'id'!";
    }
    if (typeof id !== 'string') {
        throw "The attribute constructor needs an 'id' of type 'string'!";
    }
    if (!datatype) {
        throw "The attribute constructor needs a 'datatype' of type 'string', e.g., 'Thing'!";
    }
   
    this.id = (VIE2.baseNamespace)? '<' + VIE2.baseNamespace + id + '>' : id;
    this.sid = id;
    this.type = type;
    
    this.datatype = datatype;
    
    //add given namespaces to VIE&sup2;'s namespaces
    this.namespaces = (namespaces)? namespaces : {};
    
    this.validateEntityType = function (type) {
    	return type.id === this.id;
    };
};