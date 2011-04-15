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
VIE2.Connector = function(id, options) {
    //A connector needs an id of type string.    
    if (id === undefined || typeof id !== 'string') {
        throw "The connector constructor needs an 'id' of type 'string'!";
    }
    
    this.id = id;
    this._options = (options)? options : {};
    
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
    VIE2.log("info", "VIE2.Connector(" + this.id + ")#analyze()", "Not overwritten!");
    if (options && options.success) {
        options.success.call(this, jQuery.rdf());
    }
};

//TODO: document me
VIE2.Connector.prototype.query = function (uri, properties, callback) {
    VIE2.log("info", "VIE2.Connector(" + this.id + ")#query()", "Not overwritten!");
    callback.call(this, {});
};
