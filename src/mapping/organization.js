/**
 * @fileOverview VIE^2
 * @author <a href="mailto:sebastian.germesin@dfki.de">Sebastian Germesin</a>
 */

new Mapping('organization', {
	'a' : {
		'a' : ['google:Organization']
	},
	mapping :  {
		'name' : ['rdfs:label', 'foaf:name'],
		'url' : 'foaf:page',
		'depiction' : 'foaf:depiction',
		'flickr' : 'google:flickr'
	}
});