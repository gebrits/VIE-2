VIE&sup2; - Vienna IKS Editable Entities
====================

In one sentence: "VIE&sup2; keeps your JS world and your semantic world in sync".

In a couple of sentences: 

VIE&sup2; is a Javascript framework/library that offers an abstraction of 
semantic entities and their relations using [Backbone JS](http://documentcloud.github.com/backbone/).
VIE&sup2; addresses web developer who want to bring semantics into their webpage
without caring too much about triples/triplestores and so on. On top of VIE&sup2;
we gathered a bunch of UI widgets in a [library](http://github.com/neogermi/VIEWidgets) that help
to simplyfing embedding VIE&sup2;s power into a webpage more directly. 
 
VIE&sup2; offers an API to:
 * create entities with properties
 * link entities
 * serialize entities (either into the HTML using RDFa or to a server)
 * use semantic lifting services (e.g., Zemanta, OpenCalais, Apache Stanbol, ...)
 * query databases to fill 

The default "ontology" that VIE&sup2; is delivered with, is [Schema.org](http://schema.org), which
can be easily switched or extended. 

The following picture makes it a bit clearer what the architecture of VIE&sup2; is:

![VIE&sup2; ](vie-2.png)

## Documentation

### Building

VIE&sup2; is written in Javascript and hence, does not actually need to be built. However,
we wrote an [ant](http://ant.apache.org/) script to combine the source files into one single
file and to optionally minimize that:

    ant

### Initialization

VIE&sup2; depends on several Javascript libraries, namely: 
 * [jQuery](http://jquery.com)
 * [jQuery UI](http://jqueryui.com)
 * [rdfQuery](http://code.google.com/p/rdfquery/)
 * [backbone JS](http://documentcloud.github.com/backbone/)
 * [underscore JS](http://documentcloud.github.com/underscore/)
 * [VIE](https://github.com/bergie/VIE). 

So we have to load them first:

    <!-- 3rd-party libs -->
    <script type="text/javascript" src=".../jquery.min.js"></script>
    <script type="text/javascript" src=".../jquery-ui.min.js"></script>
    <script type="text/javascript" src=".../jquery.rdfquery.min.js"></script>
    <script type="text/javascript" src=".../underscore.js"></script>
    <script type="text/javascript" src=".../backbone.js"></script>
    <script type="text/javascript" src=".../vie.js"></script>
   
The core library of VIE&sup2; can be loaded like this: 
   
    <!-- VIE^2 -->
    <script type="text/javascript" src="../dist/vie2-latest.js"></script>

That's it...

### Automatic annotation of data

Each HTML element can be analyzed with the help of VIE&sup2; and it's registered _connectors_.
Each connector that implements the _analyze()_ method is automatically queried using the following
command:

    var elem = $('#test').vie2();
    elem.vie2('analyze', callback, options);
   
Dependent on the implementation of the connector, the element is analyzed and the returned
RDF triples are mapped into backbone JS models.

### Manual annotation

One big plus of VIE&sup2; is that it allows an easy API to manually create/manipulate/delete
entites and their properties. This is done via the backbone JS model API.

#### Creating an entity

Adding a new entity of, e.g., a person with the name 'Mr. Unknown', can be achieved like shown below.
All properties (including the _id_) need to follow the [Turtule notation](http://www.w3.org/TeamSubmission/turtle/#subject).
If no _id_ is provided, a blank one (e.g., \_:b17c) is created. 

    VIE2.createEntity(<type>, <properties>);

    var model = VIE2.createEntity('Person', 
	   {
           id  : '<http://demo.de/TestPerson>'
           name: '"Mr. Unknown"'
       }
    );

#### Removing an entity

VIE&sup2; has several backbone JS collections that store the models. It has
the overall bucket collection _VIE2.entities_ that stores **all** models (entities).

    VIE2.entities.remove(VIE.EntityManager.getBySubject(subject));
   
#### Add a value to an entities' property

You can create a _literal_ using VIE2.createLiteral(<value>, <options>).

    var prop = 'name';
    var model = VIE.EntityManager.getBySubject(subject);
    var inst = VIE2.createLiteral(newName, {lang: 'en'});
    model.get(prop).add(inst);
   
#### Update a value of an entities' property

    var from = '"Mr. Unknown"';
    var to   = '"Dr. Well-Known"';
    
    var prop = 'name';
    var model = VIE.EntityManager.getBySubject(subject);
    var oldLiteralModel = model.get(prop).getByValue(from);
    oldLiteralModel.set({
       value: to
    });
   
#### Remove a value from an entities' property

    var val = '"Mr. Unknown"';

    var prop = 'name';
    var model = VIE.EntityManager.getBySubject(subject);
    var names = model.get(prop);
    var name = values.getByValue(val);
    names.remove(name);

### Serialization

    var model = VIE.EntityManager.getBySubject(subject);
    var name = model.get('name').at(0);

    VIE2.serialize(model, { //note: if we pass the entity-model, the serializer only adds 'id' & 'a'
         elem: elem,
         connectors: ['rdfa'] // using the RDFa connector
    });
    VIE2.serialize(name, { //note: passing the object-model starts the serialization of the literal
         elem: $('.name', elem),
         connectors: ['rdfa'] // using the RDFa connector
    });



### Using a proxy

As the VIE&sup2; library needs to query other systems and services, you might encounter
the well-known Cross-domain policy problem.

VIE&sup2; provides some proxy implementations that hopefully give you a first start to circumvent
this issue. Here is an example of the usage of the PHP proxy for the dbPedia connector:

    VIE2.connectors['dbpedia'].options({
       "proxy_url" : "../utils/proxy/proxy.php"
    });


###################


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

### Customizing



   
In addition, we can install several __connectors__ that are able to access backend services
which offer functionalities for semantic lifting, querying for information and serialization.
   
    <!-- Connector plug-ins -->
    <script type="text/javascript" src="../src/connector/stanbol.js"></script>
    <script type="text/javascript" src="../src/connector/dbpedia.js"></script>
    <script type="text/javascript" src="../src/connector/rdfa.js"></script>

   
   

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
