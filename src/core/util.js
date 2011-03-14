/**
 * @fileOverview VIE^2
 * @author <a href="mailto:sebastian.germesin@dfki.de">Sebastian Germesin</a>
 */

/**
 * Removes an element from an array.
 * The original array will be changed, using
 * array.splice().
 */
function removeElement (haystack, needle) {
	if (jQuery.isArray(haystack)) {
		jQuery.each(haystack, function (index) {
			if (haystack[index] === needle) {
				haystack.splice(index, 1);
			}
		});
	}
}