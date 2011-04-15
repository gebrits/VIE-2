// File:   util.js
// Author: <a href="mailto:sebastian.germesin@dfki.de">Sebastian Germesin</a>
//

VIE2.Util = {};

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

// <strong>VIE2.Util.isCurie(str)</strong>: Checks whether the given string is a curie.<br>
// <code>return boolean</code> 
VIE2.Util.isCurie = function (str) {
    return !str.substring(0, 1).match(/^<$/) && !(str.substring(0, 7).match(/^http:\/\/$/));
}

// <strong>VIE2.Util.isLiteral(str)</strong>: Checks whether the given string is a literal.<br>
// <code>return boolean</code> 
VIE2.Util.isLiteral = function (str) {
    try {
        jQuery.rdf.resource(str, {namespaces: VIE2.namespaces});
        return false;
    } catch (e) {
        try {
            jQuery.rdf.blank(str, {namespaces: VIE2.namespaces});
            return false;
        } catch (f) {
            try {
                jQuery.rdf.literal(str, {namespaces: VIE2.namespaces});
                return true;
            } catch (g) {
                return false;
            }
        }
    }
};

// <strong>VIE2.Util.isLiteral(str)</strong>: Checks whether the given string is a blank.<br>
// <code>return boolean</code> 
VIE2.Util.isBlank = function (str) {
    try {
        jQuery.rdf.resource(str, {namespaces: VIE2.namespaces});
        return false;
    } catch (h) {
        try {
            jQuery.rdf.blank(str, {namespaces: VIE2.namespaces});
            return true;
        } catch (i) {
            return false;
        }
    }
};
