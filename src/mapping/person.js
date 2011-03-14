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

    //type == http://fise.iks-project.eu/ontology/TextAnnotation
    // => fise:start
    // => fise:end
    // => fise:selected-text
    // => fise:selection-context
    //type == http://fise.iks-project.eu/ontology/EntityAnnotation
    // => fise:entity-reference
    // => entity-label
    // => fise:entity-type
    //type == http://fise.iks-project.eu/ontology/Enhancement	
    // => fise:confidence <float>
    // => dc:type
    rdf
    .where('?subject a <http://fise.iks-project.eu/ontology/EntityAnnotation>')
    .where('?subject fise:entity-type <http://dbpedia.org/ontology/Person>')
    .where('?subject fise:confidence ?confidence')
    .where('?subject fise:entity-reference ?entity')
    .where('?subject dc:relation ?relation')
    .where('?relation a <http://fise.iks-project.eu/ontology/TextAnnotation>')
    .where('?relation fise:start ?start')
    .where('?relation fise:end ?end')
    .each (function () {
    	
    	var entity = this.entity.toString();
    	var start = (this.start)? this.start.value : undefined;
    	var end = (this.end)? this.end.value : undefined;
    	var confidence = (this.confidence)? this.confidence.value : undefined;
    	
    	var r = new JSONLDEntity(
    			rdf.databank.namespaces, 
    			entity, 
    			'<http://dbpedia.org/ontology/Person>',
    			{
    				'<http://fise.iks-project.eu/ontology/confidence>' : confidence,
    				'<http://fise.iks-project.eu/ontology/start>' : start,
    				'<http://fise.iks-project.eu/ontology/end>' : end
    			}
    		);
    	
		ret.push(r);
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
