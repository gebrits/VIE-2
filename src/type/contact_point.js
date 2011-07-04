// File:   person.js
// Author: <a href="mailto:sebastian.germesin@dfki.de">Sebastian Germesin</a>
//

new VIE2.Type(
    'ContactPoint',  //the id of the mapping 
    'StructuredValue', // the super type
    [ // attributes
        {'id'       : 'contactType',
         'datatype' : 'Country'
         },
         {'id'       : 'email',
         'datatype' : 'Text'
         },
         {'id'       : 'faxNumber',
         'datatype' : 'Text'
         },
         {'id'       : 'telephone',
         'datatype' : 'Text'
         }
    ],
    { //the used namespaces, these can be given here, or placed directly into the HTML document's xmlns attribute.
    }
);