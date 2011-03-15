/**
 * @fileOverview VIE^2
 * @author <a href="mailto:sebastian.germesin@dfki.de">Sebastian Germesin</a>
 */

// A connector has two main functionalities:

// 1. analyze: Analysis of the given object
// 2. query: Querying for properties
Connector = function(id, options) {

	this.id = id;
	this.options = options;
	
	$.VIE2.registerConnector(this);
};

Connector.prototype.init = function() {};

Connector.prototype.analyze = function (object, namespaces, callback) {
	$.VIE2.log("info", "VIE^2.Connector(" + this.id + ")", "Not implemented: analyze();");
};

Connector.prototype.query = function (uri, properties) {
	$.VIE2.log("info", "VIE^2.Connector(" + this.id + ")", "Not implemented: query();");
};
