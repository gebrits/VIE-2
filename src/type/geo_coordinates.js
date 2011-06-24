// File:   person.js
// Author: <a href="mailto:sebastian.germesin@dfki.de">Sebastian Germesin</a>
//

new VIE2.Type(
    'GeoCoordinates',  //the id of the mapping 
    'StructuredValue', // the super type
    [ // attributes
        {'id'       : 'elevation',
         'datatype' : 'Float'
         },
         {'id'       : 'latitude',
         'datatype' : 'Float'
         },
         {'id'       : 'longitude',
         'datatype' : 'Float'
         },
    ],
    { //the used namespaces, these can be given here, or placed directly into the HTML document's xmlns attribute.
    }
);