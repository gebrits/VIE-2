/**
 * @fileOverview VIE^2
 * @author <a href="mailto:sebastian.germesin@dfki.de">Sebastian Germesin</a>
 */

new Mapping('place', {
	mapping :  {
		'a' : {
			'a' : ['dbonto:Place']
		},
		
		'name' : ['rdfs:label', 'foaf:name'],
		'url' : 'foaf:page',
		'depiction' : 'foaf:depiction',
		'long' : '<http://www.w3.org/2003/01/geo/wgs84_pos#long>',
		'lat' : 'geo:lat'
	}
});