/**
 * @fileOverview VIE^2
 * @author <a href="mailto:sebastian.germesin@dfki.de">Sebastian Germesin</a>
 */

// A <code>Mapping</code> provides functionality to map context knowledge
// to Javascript objects. This can either be accomplished by using the default
// functionality of the <code>filter</code> method, or by overwriting this.<br />
// In general, the mapping function should never be called directly but only
// through the core. 

// <code>Constructor(id, [options]):</code> The constructor needs an id of type <code>string</code>.
// Exceptions are thrown if either no 'id' is given or the id is not of type string.
// Options are optional and may be passed after the id to the constructor.
Mapping = function(id, options) {
	if (id === undefined) {
		throw "The mapping constructor needs an 'id'!";
	}
	
	if (typeof id !== 'string') {
		throw "The mapping constructor needs an 'id' of type 'string'!";
	}
	
	this.id = id;
	this._options = (options)? options : {};
	
	//automatically registers the mapping in VIE^2.
	jQuery.VIE2.registerMapping(this);
};

//setter and getter for options
Mapping.prototype.options = function(values) {
	if (values) {
		//extend options
		jQuery.extend(true, this._options, values);
	} else {
		//get options
		return this._options;
	}
};

//<code>filter(vie2, context, matches)</code><br />
//<i>returns</i> <strong>array of objects</strong>
Mapping.prototype.mapto = function (vie2, callback) {
	if (this.options().mapping) {
		var that = this;
		var map = this.options().mapping;

		var ret = [];
		var uris = vie2.filter(this.options()['a']);
		
		var queue = [];

		//fill queue first
		jQuery.each(uris, function (i) {
			var uri = uris[i];
			
			jQuery.each(map, function (k, v) {
				var props = (jQuery.isArray(v))? v : [v];
				jQuery.each(props, function (j) {
					var prop = props[j];
					
					var id = uri + "||" + prop;
					queue.push(id);
				});
			});
		});
		
		jQuery.each(uris, function (i) {
			var uri = uris[i];
			var sso = {
				'a' : that.id,
				jsonld : {
					'#' : vie2.options.namespaces,
					'@' : uri.toString(),
					'a' : [] //TODO: FILL!
				}
			};
			ret.push(sso);
			jQuery.each(map, function (k, v) {
				sso[k] = [];
				var props = (jQuery.isArray(v))? v : [v];
				jQuery.each(props, function (j) {
					var prop = props[j];
					sso.jsonld[prop] = [];
					var id = uri + "||" + prop;
					vie2.query(uri, prop, function (x, s, k, p) {
						return function () {
							var vals = this[p];
		
							jQuery.merge(s[k], vals);
							jQuery.merge(s.jsonld[p], vals);
							
							removeElement(queue, x);
							if (queue.length === 0) {
								callback.call(ret);
							}
						}
					}(id, sso, k, prop));
				});
			});
			
		});
	 } else {
	    	callback({});
	 }
};