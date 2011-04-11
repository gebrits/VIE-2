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

//<strong>VIE2.Collection</strong>: TODO: document me
VIE2.Collection = VIE.RDFEntityCollection.extend({
	
	add: function (models, opts) {
		//TODO: overwrite me??
		VIE.RDFEntityCollection.prototype.add.call(this, models, opts);
	},
	
	remove: function (models, opts) {
		//TODO: overwrite me??
		VIE.RDFEntityCollection.prototype.remove.call(this, models, opts);
	}
});