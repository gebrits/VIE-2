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
Mapping = function(id, types, defaultProps) {
	if (id === undefined) {
		throw "The mapping constructor needs an 'id'!";
	}
	if (typeof id !== 'string') {
		throw "The mapping constructor needs an 'id' of type 'string'!";
	}
	if (types === undefined) {
		throw "The mapping constructor needs 'types'!";
	}
	
	this.id = id;
	this.types = types;
	this.defaultProps = (defaultProps)? defaultProps : [];
	
	//automatically registers the mapping in VIE^2.
	jQuery.VIE2.registerMapping(this);
};