// File:   connector.js
// Author: <a href="mailto:sebastian.germesin@dfki.de">Sebastian Germesin</a>
//

//The Connector class.
//So far, a connector has two main functionalities:
//1. analyze: Applies semantic lifting of the passed object
//2. query: Queries for properties of the given entity uri

//A connector needs an **id** of type string and an optional
//options object. The only option that is used in VIE&sup2; so far
//is options['namespaces'], which adds connector-specific 
//namespaces to VIE&sup2;. However, you may add other options,
//specific for this connector here.
//After registration, they can be changed with:
//<pre>
//   VIE2.connectors['<id>'].options({...});
//</pre>

if (this.VIE2 === undefined) {
	/*
	 * The VIE2 global namespace object. If VIE2 is already defined, the
	 * existing VIE2 object will not be overwritten so that defined
	 * namespaces are preserved.
	 */
	this.VIE2 = {};
}

var VIE2 = this.VIE2;

VIE2.Connector = function(id, options) {
    //A connector needs an id of type string.    
    if (id === undefined || typeof id !== 'string') {
        throw "The connector constructor needs an 'id' of type 'string'!";
    }
    
    this.id = id;
    this._options = (options)? options : {};
    
    if (this._options.namespaces) {
        jQuery.each(this._options.namespaces, function (k, v) {
            VIE2.namespaces.add(k, v);
        });
    }
    //registers the connector within VIE&sup2;. Also adds the given namespaces
    //to the global cache in VIE&sup2;.
    VIE2.registerConnector(this);
};

//setter and getter for options
VIE2.Connector.prototype.options = function(values) {
    if (typeof values === 'string') {
        //return the values
        return this._options[values];
    }
    else if (typeof values === 'object') {
        //extend options
        jQuery.extend(true, this._options, values);
    } else {
        //get options
        return this._options;
    }
};

//TODO: document me
VIE2.Connector.prototype.analyze = function (object, options) {
    //VIE2.log("info", "VIE2.Connector(" + this.id + ")#analyze()", "Not overwritten!");
    if (options && options.success) {
        options.success.call(this, jQuery.rdf());
    }
};

//TODO: document me
VIE2.Connector.prototype.query = function (uri, properties, callback) {
    //VIE2.log("info", "VIE2.Connector(" + this.id + ")#query()", "Not overwritten!");
    callback.call(this, {});
};

VIE2.Connector.prototype.serialize = function (rdf, options) {
    //VIE2.log("info", "VIE2.Connector(" + this.id + ")#serialize()", "Not overwritten!");
    if (options && options.success) {
        options.success.call(this, {});
    }
};

//<strong>VIE2.connectors</strong>: Static object of all registered connectors.
VIE2.connectors = {};

//<strong>VIE2.getConnector(connectorId)</strong>: TODO: document me
VIE2.getConnector = function (connectorId) {
    return VIE2.connectors[connectorId];
};

//<strong>VIE2.registerConnector(connector)</strong>: Static method to register a connector (is automatically called 
//during construction of connector class. If set, inserts connector-specific namespaces to the known Caches.
VIE2.registerConnector = function (connector) {
    //first check if there is already 
    //a connector with 'connector.id' registered
    if (!VIE2.connectors[connector.id]) {
        VIE2.connectors[connector.id] = connector;        
    } else {
        VIE2.log("warn", "VIE2.registerConnector()", "Did not register connector, as there is" +
                "already a connector with the same id registered.");
    }
};

//<strong>VIE2.unregisterConnector(connectorId)</strong>: Unregistering of connectors. There is currently
//no usecase for that, but it wasn't that hard to implement ;)
VIE2.unregisterConnector = function (connectorId) {
    VIE2.connectors[connector.id] = undefined;
};
