/**
 * @fileOverview VIE^2
 * @author <a href="mailto:sebastian.germesin@dfki.de">Sebastian Germesin</a>
 */

new Mapping('person', {
	mapping :  {
		'a' : {
			'a' : ['foaf:Person', 'dbonto:Person']
		},
		
		'name' : ['rdfs:label', 'foaf:name'],
		'url' : 'foaf:page',
		'depiction' : 'foaf:depiction',
		'long' : 'geo:long>',
		'lat' : 'geo:lat'
	}
});