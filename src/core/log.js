// File:   log.js
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

VIE2.logLevels = ["info", "warn", "error"];

//<strong>VIE2.log(level, component, message)</strong>: Static convenience method for logging.
VIE2.log = function (level, component, message) {
    if (VIE2.logLevels.indexOf(level) > -1) {
        switch (level) {
            case "info":
                console.info([component, message]);
                break;
            case "warn":
                console.warn([component, message]);
                break;
            case "error":
                console.error([component, message]);
                break;
        }
    }
};
