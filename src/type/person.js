// File:   person.js
// Author: <a href="mailto:sebastian.germesin@dfki.de">Sebastian Germesin</a>
//

new VIE2.Type(
    'Person',  //the id of the mapping 
    'Thing', // the super type
    [ // attributes
        {'id'       : 'address',
         'datatype' : 'PostalAddress'
         },
        {'id'       : 'affiliation',
         'datatype' : 'Organization'
         },
        {'id'       : 'alumniOf',
         'datatype' : 'EducationalOrganization'
         },
        {'id'       : 'awards',
         'datatype' : 'xsd:string'
         },
        {'id'       : 'birthDate',
         'datatype' : 'xsd:date'
         },
        {'id'       : 'children',
         'datatype' : 'Person'
         },
        {'id'       : 'colleagues',
         'datatype' : 'Person'
         },
        {'id'       : 'contactPoints',
         'datatype' : 'ContactPoint'
         },
        {'id'       : 'deathDate',
         'datatype' : 'xsd:date'
         },
        {'id'       : 'email',
         'datatype' : 'xsd:string'
         },
        {'id'       : 'faxNumber',
         'datatype' : 'xsd:string'
         },
        {'id'       : 'follows',
         'datatype' : 'Person'
         },
        {'id'       : 'gender',
         'datatype' : 'xsd:string'
         },
        {'id'       : 'homeLocation',
         'datatype' : 'Place'
         },
        {'id'       : 'interactionCount',
         'datatype' : 'xsd:string'
         },
        {'id'       : 'jobTitle',
         'datatype' : 'xsd:string'
         },
        {'id'       : 'knows',
         'datatype' : 'Person'
         },
        {'id'       : 'interactionCount',
         'datatype' : 'xsd:string'
         },
        {'id'       : 'memberOf',
         'datatype' : ':Organization'
         },
        {'id'       : 'nationality',
         'datatype' : 'Country'
         },
        {'id'       : 'parents',
         'datatype' : 'Person'
         },
        {'id'       : 'performerIn',
         'datatype' : 'Event'
         },
        {'id'       : 'relatedTo',
         'datatype' : 'Person'
         },
        {'id'       : 'siblings',
         'datatype' : 'Person'
         },
        {'id'       : 'spouse',
         'datatype' : 'Person'
         },
        {'id'       : 'telephone',
         'datatype' : 'xsd:string'
         },
        {'id'       : 'workLocation',
         'datatype' : 'Place'
         },
        {'id': 'worksFor',
         'datatype': 'Organization'
        }
    ],
    { //the used namespaces, these can be given here, or placed directly into the HTML document's xmlns attribute.
        'schema' : 'http://schema.org/',
        'xsd'    : 'http://www.w3.org/2001/XMLSchema#',
        'owl'    : 'http://www.w3.org/2002/07/owl#'
    }
);