/**
 * @fileOverview VIE^2
 * @author <a href="mailto:sebastian.germesin@dfki.de">Sebastian Germesin</a>
 */

new Mapping('organization', {
	mapping :  {
		'a' : {
			'a' : ['google:Organization']
		},
		
		'name' : ['rdfs:label', 'foaf:name'],
		'url' : 'foaf:page',
		'depiction' : 'foaf:depiction',
		'flickr' : 'google:flickr'
	}
});