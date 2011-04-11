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

if (typeof VIE2.Util == 'undefined' || !VIE2.Util) {
    VIE2.Util = {};
}

// <code>removeElement(haystack, needle)</code><br />
// <i>returns</i> <strong>void</strong>
VIE2.Util.removeElement = function (haystack, needle) {
	//First we check if haystack is indeed an array.
	if (jQuery.isArray(haystack)) {
		//iterate over the array and check for equality.
		jQuery.each(haystack, function (index) {
			if (haystack[index] === needle) {
				//remove the one element and
				haystack.splice(index, 1);
				//break the iteration.
				return false;
			}
		});
	}
};

VIE2.Util.PseudoGuid = new (function() {
    this.empty = "VIE2-00000000-0000-0000-0000-000000000000";
    this.GetNew = function() {
        var fC = function() {
                return (((1 + Math.random()) * 0x10000)|0).toString(16).substring(1).toUpperCase();
        }
        return ("VIE2-" + fC() + fC() + "-" + fC() + "-" + fC() + "-" + fC() + "-" + fC() + fC() + fC());
    };
})();

VIE2.Util.isCurie = function (str) {
    return !str.substring(0, 1).match(/^<$/) && !(str.substring(0, 7).match(/^http:\/\/$/));
}

VIE2.Util.isLiteral = function (str) {
    try {
        $.rdf.resource(str, {namespaces: VIE2.namespaces});
        return false;
    } catch (e) {
        try {
            $.rdf.blank(str, {namespaces: VIE2.namespaces});
            return false;
        } catch (f) {
            try {
                $.rdf.literal(str, {namespaces: VIE2.namespaces});
                return true;
            } catch (g) {
                return false;
            }
        }
    }
};

VIE2.Util.isBlank = function (str) {
    try {
        $.rdf.resource(str, {namespaces: VIE2.namespaces});
        return false;
    } catch (e) {
        try {
            $.rdf.blank(str, {namespaces: VIE2.namespaces});
            return true;
        } catch (f) {
            return false;
        }
    }
};
