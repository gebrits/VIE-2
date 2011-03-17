/**
 * @fileOverview VIE^2
 * @author <a href="mailto:sebastian.germesin@dfki.de">Sebastian Germesin</a>
 */

var mappingPerson = new Mapping('person');

mappingPerson.connectorMappers = {};

mappingPerson.filter = function (vie2, context, matches) {
	var persons = [];
	$.each(context, function (connectorId, rdf) {
		var mapper = mappingPerson.connectorMappers[connectorId];
		if (mapper) {
			//check for duplicates (URI)
			var entities = mapper(rdf, matches);
			jQuery.each(entities, function () {
				var contains = false;
				var entity = this;
				jQuery.each(persons, function () {
					if (this['@'] === entity['@']) {
						contains = true;
						return false; //break!
					}
				});
				if (!contains) {
					persons.push(this);
				}
			});
		}
	});

	return persons;
};

mappingPerson.connectorMappers['stanbol'] = function (rdf, matches) {
    var ret = [];
    
    rdf
    .where('?subject a <http://dbpedia.org/ontology/Person>')
    .where('?subject fise:hasTextAnnotation ?textannot')
    .where('?subject fise:hasEntityAnnotation ?entityannot')
    .where('?entityannot fise:confidence ?confidence')
    .where('?textannot fise:start ?start')
    .where('?textannot fise:end ?end')
    .where('?textannot fise:selected-text ?selected-text')
    .where('?textannot fise:selection-context ?selection-context')
    .each (function () {
    	
    	//TODO!
	});
    
	return ret;	
};

mappingPerson.connectorMappers['rdfa'] = function (rdf, matches) {
    var ret = [];
   	
    rdf
    .where('?entity a foaf:Person')
    .each (function () {
    	
    	var entity = this.entity.toString();
    	
    	var r = new JSONLDEntity(
    			rdf.databank.namespaces, 
    			entity, 
    			'foaf:Person'
    		);
    	
		ret.push(r);
	});
	return ret;	
};
