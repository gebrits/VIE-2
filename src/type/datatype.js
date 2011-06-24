// File:   person.js
// Author: <a href="mailto:sebastian.germesin@dfki.de">Sebastian Germesin</a>
//

new VIE2.Type (
    'DataType',  //the id of the mapping 
    undefined,
    [
        {'id'       : 'value',
         'datatype' : 'xsd:anyType'
         }
    ],
    { //the used namespaces, these can be given here, or placed directly into the HTML document's xmlns attribute.
        'xsd'    : 'http://www.w3.org/2001/XMLSchema#'
    }
);
