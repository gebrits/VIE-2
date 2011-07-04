// File:   person.js
// Author: <a href="mailto:sebastian.germesin@dfki.de">Sebastian Germesin</a>
//

new VIE2.Type(
    'PostalAddress',  //the id of the mapping 
    'ContactPoint', // the super type
    [ // attributes
        {'id'       : 'addressCountry',
         'datatype' : 'Country'
         },
         {'id'       : 'addressLocality',
         'datatype' : 'Text'
         },
         {'id'       : 'addressRegion',
         'datatype' : 'Text'
         },
         {'id'       : 'postOfficeBoxNumber',
         'datatype' : 'Text'
         },
         {'id'       : 'postalCode',
         'datatype' : 'Text'
         },
         {'id'       : 'streetAddress',
         'datatype' : 'Text'
         }
    ],
    { //the used namespaces, these can be given here, or placed directly into the HTML document's xmlns attribute.
    }
);