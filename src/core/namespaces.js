if (this.VIE2 === undefined) {
	/*
	 * The VIE2 global namespace object. If VIE2 is already defined, the
	 * existing VIE2 object will not be overwritten so that defined
	 * namespaces are preserved.
	 */
	this.VIE2 = {};
}

var VIE2 = this.VIE2;

VIE2.Namespaces = function(namespaces) {
    
    this.namespaces = (namespaces)? namespaces : {};
    
    this.add = function (k, v) {
        //check if we overwrite existing mappings
        if (this.containsKey(k) && v !== this.namespaces[k]) { 
            throw "ERROR: Trying to register namespace prefix mapping (" + k + "," + v + ")!" +
                  "There is already a mapping existing: '(" + k + "," + this.get(k) + ")'!";
        } else {
            jQuery.each(this.namespaces, function (k1,v1) {
                if (v1 === v && k1 !== k) {
                    throw "ERROR: Trying to register namespace prefix mapping (" + k + "," + v + ")!" +
                          "There is already a mapping existing: '(" + k1 + "," + v + ")'!";
                }
            });
        }
        this.namespaces[k] = v;
        VIE2.globalCache.prefix(k, v);
    };
    
    this.get = function (k, v) {
        return this.namespaces[k];
    };
    
    this.containsKey = function (k) {
        return (k in this.namespaces);
    };
    
    this.containsValue = function (v) {
        jQuery.each(this.namespaces, function (k1,v1) {
            if (v1 === v) {
                return true;
            }
        });
        return false;
    };

	this.update = function (k, v) {
        this.namespaces[k] = v;
        VIE2.globalCache.prefix(k, v);
    };
    
    this.remove = function (k, v) {
        delete this.namespaces[k];
        delete VIE2.globalCache.databank.namespaces[k];
    };
    
    this.toObj = function () {
        return VIE2.Util.clone(this.namespaces);
    }
};