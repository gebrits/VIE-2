VIE&sup2; - Vienna IKS Editable Entities
====================

VIE&sup2; is the semantic enrichment layer on top of [VIE](https://github.com/bergie/VIE) and
enables web developers to support an interactive usage of semantic information.

## Main functionality

VIE&sup2; is written in Javascript and can be embedded into any HTML page. It is targeted to be
used by web developers who want to support interactive usage of semantic knowledge. Thereby, 
VIE&sup2; offers the _automatic_ as well as _manual_ annotation of entities and their properties.

## Example

### Initialization

VIE&sup2; depends on several Javascript libraries, namely: [jQuery](http://jquery.com), [jQuery UI](http://jqueryui.com), [rdfQuery](http://code.google.com/p/rdfquery/), [backbone JS](http://documentcloud.github.com/backbone/), [underscore JS](http://documentcloud.github.com/underscore/) and [VIE](https://github.com/bergie/VIE). 

    &lt;!-- 3rd-party libs -->
    &lt;script type="text/javascript" src=".../jquery-1.4.4.min.js">&lt;/script>
    &lt;script type="text/javascript" src=".../jquery-ui-1.8.11.custom.min.js">&lt;/script>
    &lt;script type="text/javascript" src=".../jquery.rdfquery.rules.js">&lt;/script>
    &lt;script type="text/javascript" src=".../underscore.js">&lt;/script>
    &lt;script type="text/javascript" src=".../backbone.js">&lt;/script>
    &lt;script type="text/javascript" src=".../vie.js">&lt;/script>
   
The core library of VIE&sup2; can be loaded like this: 
   
    &lt;!-- VIE^2 -->
    &lt;script type="text/javascript" src="../dist/vie2-latest.js">&lt;/script>
   
In addition, we can install several __connectors__ that are able to access backend services
which offer functionalities for semantic lifting, querying for information and serialization.
   
    &lt;!-- Connector plug-ins -->
    &lt;script type="text/javascript" src="../src/connector/stanbol.js">&lt;/script>
    &lt;script type="text/javascript" src="../src/connector/dbpedia.js">&lt;/script>
    &lt;script type="text/javascript" src="../src/connector/rdfa.js">&lt;/script>
   
For each __mapping__ that is loaded, a special type of backbone collection is registered
and automatically filled with information if a matching entity is found.
   
    &lt;!-- Mapping plug-ins -->
    &lt;script type="text/javascript" src="../src/mapping/person.js">&lt;/script>
    &lt;script type="text/javascript" src="../src/mapping/task.js">&lt;/script>
   
   
### Analysis of data

Each HTML element can be analyzed with the help of VIE&sup2; and it's registered _connectors_.
Each connector that implements the _analyze()_ method is automatically queried using the following
command:

   var elem = $('#test');
   elem.vie2().vie2('analyze', callback);
   
Dependent on the implementation of the connector, the element is analyzed and for each registered
mapping that matches the types of the found entities, a backbone JS model is registered and
filled with default properties that are specified in the corresponding mapping.


### Manual annotation

Manual annotation of entities (following the CRUD scheme) is available through the backbone JS
model API.

#### Adding an entity

Adding a new entity of, e.g., a person with the name 'Mr. Unknown', can be achieved like shown.
An _id_ needs to follow the [Turtule notation](http://www.w3.org/TeamSubmission/turtle/#subject)
and if no _id_ is provided, a blank one is initiated by default. 

   var model = VIE2.createEntity({
      id: '&lt;http://demo.de/TestPerson>',
      a: 'foaf:Person',
      'foaf:name': "\"Mr. Unknown\""
   });
   
Each entity that is instantiated, VIE&sup2; will traverse all registered connectors and call
_VIE2.Connector.query()_ if they can provide information about type-specific properties,
that are defined in a _mapping_'s default properties array (i.e., for a person this is defined
as ['rdfs:label', 'foaf:name', 'foaf:page', 'foaf:depiction']). 

#### Removing an entity

   VIE2.entities.remove(VIE.EntityManager.getBySubject(subject));
   
#### Add a value to an entities' property

   var prop = 'foaf:name';
   var model = VIE.EntityManager.getBySubject(subject);
   var inst = VIE2.createLiteral(newName);
   model.get(prop).add(inst);
   
#### Update a value of an entities' property

   var prop = 'foaf:name';
   var model = VIE.EntityManager.getBySubject(subject);
   var oldValueModel = model.get(prop).getByValue(from);
   oldValueModel.set({
      value: to
   });
   
#### Remove a value from an entities' property

   var prop = 'foaf:name';
   var model = VIE.EntityManager.getBySubject(subject);
   var values = model.get(prop);
   var value = values.getByValue(name);
   values.remove(value);

### Developing your own connector

Developing an own connector is fairly easy. If you instatiate a connector, it will automatically
be registered within VIE&sup2;. You might want to add connector-specific namespaces to the 
connector that are automatically registered as well.

   new VIE2.Connector('dbpedia', {
      namespaces: {
          owl : "http://www.w3.org/2002/07/owl#",
          yago: "http://dbpedia.org/class/yago/"
      }
   });
   
A connector has two main functionalities:

* The query for properties:

   VIE2.Connector.query = function (uri, properties, callback);
   
   Overwriting this function should return an object using the _callback_ method,
   where the keys are the properties that we want to retrieve information whereas the corresponding
   value is an array of one of the following types: _jQuery.rdf.resource_, jQuery.rdf.blank_, _jQuery.rdf.literal_ 
   
* The semantic lifting of an HTML element's content:

   VIE2.Connector.analyze = function (object, options);
   
   Overwriting this function should return an _jQuery.rdf_ object. This object
   needs to be passed via the callback in _options.success_.   

### Providing a mapping

A _mapping_ provides a mapping from the ontological instances of entities to backbone models and
collections. For each registered mapping, a backbone collection is allocated and can be accessed
through the __VIE2.mappings__ object. 

   new VIE2.Mapping (
      'person',  //the id of the mapping 
      ['foaf:Person', 'opencalais:Person'],  //a list of all types that fall into this category
      ['rdfs:label', 'foaf:name', 'foaf:depiction'], //a list of default properties
      {// optional options
          namespaces: { //the used namespaces, these can be given here, or placed directly into the HTML document's xmlns attribute.
              'rdfs'   : 'http://www.w3.org/2000/01/rdf-schema#',
              'foaf'   : 'http://xmlns.com/foaf/0.1/',
              'opencalais' : 'http://s.opencalais.com/1/type/em/e/'
          }
      }
   );

### Using a proxy

As the VIE&sup2; library needs to query other systems and services, you might encounter
the well-known Cross-domain policy problem.

VIE&sup2; provides some proxy implementations that hopefully give you a first start to circumvent
this issue. Here is an example of the usage of the PHP proxy for the dbPedia connector:

   VIE2.connectors['dbpedia'].options({
      "proxy_url" : "../utils/proxy/proxy.php"
   });
