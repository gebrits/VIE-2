/**
 * VIE^2 is the semantic enrichment layer on top of VIE. 
 * Through it you can query and find related content 
 * for your editables. VIE^2 can talk to services like 
 * Apache Stanbol and OpenCalais to find related 
 * information for your content.
 */

/**
 * @fileOverview VIE^2
 * @author <a href="mailto:sebastian.germesin@dfki.de">Sebastian Germesin</a>
 */

(function($, undefined) {

	/**
	 * You can call .vie2() on every jQuery object.
	 */
    $.widget('VIE2.vie2', {
    	
    	// default options
    	options: {
    		/**
    		 * namespaces to be used!
    		 */
    		namespaces: {},
    		//////////// EVENTS /////////////
    		/**
    		 * ready: called as soon as the object is ready (after _create)
    		 */
    		ready: jQuery.noop,
    		/**
    		 * contextchanged: TODO:
    		 */
    		contextchanged: jQuery.noop
    	},

    	/**
		 * TODO:
		 */
		_context: {},
		
		/**
		 *  TODO:
		 */
		_matches: [],
		
		/**
		 *  TODO:
		 */
		_oldMatches: [],
    	
    	_create: function() {
			jQuery.VIE2.log("info", "VIE2.core", "Start " + this.element);
			this._trigger("ready", this, {});
			jQuery.VIE2.log("info", "VIE2.core", "End " + this.element);
		},
    	
    	/**
		 * options
		 */
		analyze: function (callback, options) {
			jQuery.VIE2.log("info", "VIE2.core", "Start analyze!");
			var that = this;
			var queue = [];
			
			jQuery.each(jQuery.VIE2.connectors, function () {
				queue.push(this.id);
 				jQuery.VIE2.log("info", "VIE2.core", "Starting analysis with connector: '" + this.id + "'!");
				var c = function (vie, conn) {
					return function (rdf) {
						jQuery.each(vie.options.namespaces, function(k, v) {
							rdf.prefix(k, v);
						});
						vie._context[conn.id] = rdf;
						jQuery.VIE2.log("info", "VIE2.core", "Received RDF annotation from connector '" + conn.id + "'!");
						removeElement(queue, conn.id);
						if (queue.length === 0) {
							jQuery.VIE2.log("info", "VIE2.core", "Finished task: 'analyze'!");
							that._trigger("contextchanged", null, {});
							callback.call(that.element);
						}	
					};
				}(that, this);
				
				this.analyze(that.element, that.options.namespaces, c);
				
			});
		},
		
		filter: function (filterId) {
			if (filterId === undefined) {
				jQuery.VIE2.log("warn", "VIE2.core", "Invoked 'filter' with undefined argument!");
				return [];
			} else if (typeof filterId === 'string') {
				var that = this;
				this._oldMatches = this._matches;
				this._matches = [];
				var foundMapping = false;
				var matches = [];
				$.each (jQuery.VIE2.mappings, function () {
					if (this.id === filterId) {
						foundMapping = true;
						jQuery.VIE2.log("info", "VIE2.core", "Invoking mapping '" + this.id + "'!");
						matches = this.filter(that, that._context, that._oldMatches);
						that._matches = matches;
					}
				});
				if (!foundMapping) {
					jQuery.VIE2.log("warn", "VIE2.core", "filer(): Found no mapping with name '" + filterId + "'!");
					return [];
				} else {
					return matches;
				}
			} else {
				jQuery.VIE2.log("warn", "VIE2.core", "Invoked 'filter' with wrong argument: '" + filterId + "'!");
				return [];
			}
		},
		
		query: function (uri, props) {
			var ret = {};
			if (uri === undefined) {
				jQuery.VIE2.log("warn", "VIE2.core", "Invoked 'query' with undefined argument!");
			}
			if (uri instanceof jQuery.rdf.resource &&
					uri.type === 'uri') {
				var that = this;

				jQuery.each(props, function () {
					ret[this] = [];
				});

				jQuery.each(jQuery.VIE2.connectors, function () {
					var retTmp = this.query(uri, props);
					if (retTmp) {
						jQuery.extend(ret, retTmp);
					}

				});
			}
			return ret;
		},
		
		matches: function () {
			return this._matches;
		},
		
		undo: function () {
			this._matches = this._oldMatches;
			this._oldMatches = [];
			return this;
		},
		
		clear: function () {
			this._matches = [];
			this._oldMatches = [];
			return this;
		}
		
	});
}(jQuery));

jQuery.VIE2.log = function (level, component, message) {
	switch (level) {
	case "info":
		console.info(component + ' ' + message);
		break;
	case "warn":
		console.warn(component + ' ' + message);
		break;
	case "error":
		console.error(component + ' ' + message);
		break;
	}
}

jQuery.VIE2.connectors = [];

jQuery.VIE2.registerConnector = function (connector) {
	//first check if there is already 
	//a connector with 'connector.id' registered
	var register = true;
	jQuery.each(jQuery.VIE2.connectors, function () {
		if (this.id === connector.id) {
			register = false;
			return;
		}
	});
	if (register) {
		jQuery.VIE2.connectors.push(connector);
		jQuery.VIE2.log("info", "VIE2.core", "Registered connector '" + connector.id + "'");
	} else {
		jQuery.VIE2.log("warn", "VIE2.core", "Did not register connector, as there is" +
				"already a connector with the same id registered.");
	}
}

jQuery.VIE2.unregisterConnector = function (connector) {
	jQuery.each(jQuery.VIE2.connectors, function () {
		//TODO: untested code!
		if (this.id === connector.id) {
			jQuery.VIE2.connectors.splice(index, 1);
			jQuery.VIE2.log("info", "VIE2.core", "De-registered connector '" + connector.id + "'");
			return;
		}
	});
}

jQuery.VIE2.mappings = [];

jQuery.VIE2.registerMapping = function (mapping) {
	//first check if there is already 
	//a mapping with 'mapping.id' registered
	var register = true;
	jQuery.each(jQuery.VIE2.mappings, function () {
		if (this.id === mapping.id) {
			register = false;
			return;
		}
	});
	if (register) {
		jQuery.VIE2.mappings.push(mapping);
		jQuery.VIE2.log("info", "VIE2.core", "Registered mapping '" + mapping.id + "'");
	} else {
		jQuery.VIE2.log("warn", "VIE2.core", "Did not register mapping, as there is" +
				"already a mapping with the same id registered.");
	}
}

jQuery.VIE2.unregisterMapping = function (mapping) {
	jQuery.each(jQuery.VIE2.mappings, function (index) {
		//TODO: untested code!
		if (this.id === mapping.id) {
			jQuery.VIE2.mappings.splice(index, 1);
			jQuery.VIE2.log("info", "VIE2.core", "De-registered mapping '" + mapping.id + "'");
			return;
		}
	});
}