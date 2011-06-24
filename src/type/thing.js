// File:   person.js
// Author: <a href="mailto:sebastian.germesin@dfki.de">Sebastian Germesin</a>
//

new VIE2.Type (
    'Thing',  //the id of the mapping 
    undefined,
    [
        {'id'       : 'description',
         'datatype' : 'xsd:string'
         },
        {'id'       : 'image',
         'datatype' : 'xsd:anyURI'
         },
        {'id'       : 'name',
         'datatype' : 'xsd:string'
         },
        {'id'       : 'url',
         'datatype' : 'xsd:anyURI'
         }
    ],
    { //the used namespaces, these can be given here, or placed directly into the HTML document's xmlns attribute.
        'schema' : 'http://schema.org/',
        'xsd'    : 'http://www.w3.org/2001/XMLSchema#',
        'owl'    : 'http://www.w3.org/2002/07/owl#'
    }
);
