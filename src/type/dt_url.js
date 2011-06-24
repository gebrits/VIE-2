// File:   person.js
// Author: <a href="mailto:sebastian.germesin@dfki.de">Sebastian Germesin</a>
//

new VIE2.Type (
    'URL',  //the id of the mapping 
    'Text',
    [
        {'id'       : 'value',
         'datatype' : 'xsd:anyURI'
         }
    ],
    { //the used namespaces, these can be given here, or placed directly into the HTML document's xmlns attribute.
        'xsd'    : 'http://www.w3.org/2001/XMLSchema#'
    }
);
