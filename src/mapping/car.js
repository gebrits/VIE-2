/**
 * @fileOverview VIE^2
 * @author <a href="mailto:sebastian.germesin@dfki.de">Sebastian Germesin</a>
 */

new Mapping('car', {
	mapping :  {
		'a' : {
			'a' : ['<http://dbpedia.org/class/yago/Roadsters>']
		},
		
		'name' : ['dbprop:aka', 'dbprop:name', 'rdfs:label'],
		'depiction' : ['dbonto:thumbnail', 'foaf:depiction']
	}
});