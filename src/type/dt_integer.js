// File:   person.js
// Author: <a href="mailto:sebastian.germesin@dfki.de">Sebastian Germesin</a>
//

new VIE2.Type (
    'Integer',  //the id of the mapping 
    'Number',
    [
        {'id'       : 'value',
         'datatype' : 'xsd:decimal'
         }
    ],
    { //the used namespaces, these can be given here, or placed directly into the HTML document's xmlns attribute.
        'xsd'    : 'http://www.w3.org/2001/XMLSchema#'
    }
);
