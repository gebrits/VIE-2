/**
 * @fileOverview VIE^2
 * @author <a href="mailto:sebastian.germesin@dfki.de">Sebastian Germesin</a>
 */

new Mapping('person', {
	'a' : {
		'a' : ['foaf:Person', 'dbonto:Person']
	},
	mapping : {
		'vie2:name' : ['rdfs:label', 'foaf:name'],
		'vie2:url' : 'foaf:page',
		'vie2:depiction' : 'foaf:depiction'
	}
});
