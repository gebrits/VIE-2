/**
 * @fileOverview VIE^2
 * @author <a href="mailto:sebastian.germesin@dfki.de">Sebastian Germesin</a>
 */

//The global <strong>VIE2 object</strong>. If VIE2 is already defined, the
//existing VIE2 object will not be overwritten so that the
//defined object is preserved.
if (typeof VIE2 == 'undefined' || !VIE2) {
    VIE2 = {};
}


// A <code>Mapping</code> provides functionality to map cache knowledge
// to Backbone models

VIE2.Mapping = function(id, types, defaults, options) {
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
    
    this.options = (options)? options : {};
    
    //add given namespaces to VIE&sup2;'s namespaces
    if (this.options.namespaces) {
        jQuery.each(this.options.namespaces, function (k, v) {
           VIE2.namespaces[k] = v;
           VIE2.globalCache.prefix(k, v);
        });
    }
    
    //normalization to CURIEs (where needed)
    this.types = [];
    for (var i = 0; i < types.length; i++) {
        var type = types[i];
        if (!VIE2.Util.isCurie(type)) {
            type = jQuery.createCurie(type.replace(/^</, '').replace(/>$/, ''), {namespaces : VIE2.namespaces, charcase: 'lower'}).toString();
        }
        this.types.push(type);
    }

    //normalization to CURIEs (where needed)
	this.defaults = [];
	for (var i = 0; i < defaults.length; i++) {
        var d = defaults[i];
        if (!VIE2.Util.isCurie(d)) {
            d = jQuery.createCurie(d.replace(/^</, '').replace(/>$/, ''), {namespaces : VIE2.namespaces, charcase: 'lower'}).toString();
        }
        this.defaults.push(d);
    }
    
	//automatically registers the mapping in VIE^2.
	VIE2.registerMapping(this);
};