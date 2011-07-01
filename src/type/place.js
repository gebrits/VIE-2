// File:   person.js
// Author: <a href="mailto:sebastian.germesin@dfki.de">Sebastian Germesin</a>
//

new VIE2.Type(
    'Place',  //the id of the mapping 
    'Thing', // the super type
    [ // attributes
        {'id'       : 'address',
         'datatype' : 'PostalAddress'
         },
        {'id'       : 'aggregateRating',
         'datatype' : 'AggregateRating' //TODO!
         },
        {'id'       : 'containedIn',
         'datatype' : 'Place'
         },
        {'id'       : 'events',
         'datatype' : 'Event' //TODO!
         },
        {'id'       : 'faxNumber',
         'datatype' : 'Text'
         },
        {'id'       : 'geo',
         'datatype' : 'GeoCoordinates'
         },
        {'id'       : 'interactionCount',
         'datatype' : 'Text'
         },
        {'id'       : 'maps',
         'datatype' : 'URL'
         },
        {'id'       : 'photos',
         'datatype' : 'Photograph'
         },
        {'id'       : 'reviews',
         'datatype' : 'Review' //TODO!
         },
        {'id'       : 'telephone',
         'datatype' : 'Text'
         }
    ],
    { //the used namespaces, these can be given here, or placed directly into the HTML document's xmlns attribute.
        'schema' : 'http://schema.org/',
        'owl'    : 'http://www.w3.org/2002/07/owl#'
    }
);