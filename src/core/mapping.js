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
	
	this.options = options;
	
	//automatically registers the mapping in VIE^2.
	$.VIE2.registerMapping(this);
};

//<code>filter(vie2, context, matches)</code><br />
//<i>returns</i> <strong>array of objects</strong>
Mapping.prototype.filter = function (vie2, context, matches) {
	//In the default functionality of this method, we can simply pass
	//the option.mapping object to the constructor that is automatically parsed and
	//used by the <code>filter</code> function. Let's have a look
	//at the <i>place</i> mapper:
//	    <code><pre>new Mapping('place', {
//	        mapping :  {
//	            'type' : {
//	                'rdfa' : {
//	                    'type' : 'rdf:type', 
//	                    'value' : 'dbonto:PopulatedPlace'
//	                }
//	            },
//	            'name' : {
//	               'rdfa' : ['rdfs:label', 'foaf:name']
//	            },
//	            'long' : {
//	                'rdfa' : '<http:// www.w3.org/2003/01/geo/wgs84_pos#long>'
//	            },
//	            'lat' : {
//	                'rdfa' : 'geo:lat'
//	            }
//	       }
//	    });</pre></code>
	//We can see that the <code>mapping</code> option is a key value hashmap which needs
	//a pre-given syntax. It is connector-specific in it's mapping and in the example,
	// <code>'rdfa'</code> is the id of the RDFa connector.
	//Filtering for entity types is specified in the <code>'type'</code> key which needs
	//for each connector a <code>'type'</code> and <code>'value'</code> key, where
	//<code>'value'</code> can also be an array of strings. In the example, we only search
	//for elements that are of type <code>PopulatedPlace</code> from the dbPedia ontology.
	//Notice: As long as VIE^2 was initialized with proper namespace mappings, these mappings
	//can be used through the whole framework consistently.
	//In the example, the <code>context</code> is scanned for all places and for each found
	//entity, a new Javascript object is allocated with the keys <code>name, long, lat</code>.
	//As we can see, the mapping also either applies to strings or arrays of strings. 
	//Full URIs need to be enclosed by the <code>&lt;</code> and <code>&gt;</code> symbols.
	var entities = [];
	var that = this;
	
	jQuery.each(context, function (connId, rdf) {
		if (that.options.mapping.type[connId]) {
			/*TODO: if (typeof that.options.mapping.type[connId] === 'array')*/
			rdf
			.where('?subject' + ' ' +
					that.options.mapping.type[connId].type + ' ' + 
					that.options.mapping.type[connId].value)
			.each(function () {
				var entity = {};
				var subject = this.subject;
				var triples = rdf.databank.subjectIndex[subject];
				jQuery.each(that.options.mapping, function (key, val) {
					if (key !== 'type') {
						if (key === '*') {
							/*TODO: key === '*' */
						} else {
							entity[key] = [];
							var property = val[connId];
							if (property) {
								if (typeof property === 'string') {
									property = [property];
								}	
								if (jQuery.isArray(property)) {
									jQuery.each(property, function (i, v) {
										var prop = jQuery.rdf.resource(v, { namespaces: rdf.databank.namespaces });
										jQuery.each(triples, function () {
											if (this.property === prop) {
												entity[key].push(this.object);
											}
										});
										/*TODO: gather this to reduce numer of calls*/
										if (entity[key].length === 0) {
											//As a speciality: The default filter method checks for all keys
											//if there are no values found and if so, automatically queries
											//VIE^2 for them to fill the gaps.
											var queryResult = vie2.query(subject, [prop]);
											if (queryResult[prop]) {
												jQuery.extend(entity[key], queryResult[prop]);
											}
										}
									});
								}
							}
						}
					}
				});
				entities.push(entity);
			});
		}
	});
	
	return entities;
};