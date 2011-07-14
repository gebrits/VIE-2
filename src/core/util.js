// File:   util.js
// Author: <a href="mailto:sebastian.germesin@dfki.de">Sebastian Germesin</a>
//

if (this.VIE2 === undefined) {
	/*
	 * The VIE2 global namespace object. If VIE2 is already defined, the
	 * existing VIE2 object will not be overwritten so that defined
	 * namespaces are preserved.
	 */
	this.VIE2 = {};
}

var VIE2 = this.VIE2;

VIE2.Util = {};


VIE2.Util.sort = function (a, b) {
    
    if (a instanceof VIE2.Type) {
        a = a.id;
        b = b.id;
    }
    
    if (a === b) return 0;
    if (a < b)  return -1;
    return 1;    
}

// <strong>VIE2.Util.(haystack, needle)</strong>: Removes the *needle* from the *haystack* array.<br>
// <code>return void</code> 
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

VIE2.Util.js2turtle = function (lit) {
    if (lit instanceof VIE2.Type) {
        return lit.id;
    }
    if (VIE2.Util.isResource(lit)) {
        return lit;
    }
    if (typeof lit === 'string' && !lit.match(/^".*"$/)) {
        return '"' + lit + '"';
    }
    return lit;
};

// <strong>VIE2.Util.isCurie(str)</strong>: Checks whether the given string is a curie.<br>
// <code>return boolean</code> 
VIE2.Util.isCurie = function (str) {
    return !str.substring(0, 1).match(/^<$/) && !(str.substring(0, 7).match(/^http:\/\/$/));
}

// <strong>VIE2.Util.isResource(str)</strong>: Checks whether the given string is a resource.<br>
// <code>return boolean</code> 
VIE2.Util.isResource = function (str) {
    try {
        jQuery.rdf.resource(str, {namespaces: VIE2.namespaces.toObj()});
        return false;
    } catch (h) {
        try {
            jQuery.rdf.blank(str, {namespaces: VIE2.namespaces.toObj()});
            return true;
        } catch (i) {
            return false;
        }
    }
};


VIE2.Util.clone = function(src) {
    var newObj = {};
    
    for (k in src) {
        newObj[k] = src[k];
    }
    
    return newObj;
}
