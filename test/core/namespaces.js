module("Core - Namespaces");

test ("Parsing of Document namespaces", 1, function () {
    var reference = {
      "owl": "http://www.w3.org/2002/07/owl#",
      "": "http://www.w3.org/1999/xhtml",
      "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
      "foaf": "http://xmlns.com/foaf/0.1/",
      "dbonto": "http://dbpedia.org/ontology/",
      "oc": "http://s.opencalais.com/1/type/em/e/",
      "ocpred": "http://s.opencalais.com/1/pred/",
      "rdfcal": "http://www.w3.org/2002/12/cal#"
    };
    deepEqual(VIE2.namespaces, reference, "Parsing the document's namespaces.");
});

test ("Manually adding namespaces", 2, function () {
    VIE2.namespaces["test"] = "http://this.is.a/test#";
    var reference = {
      "owl": "http://www.w3.org/2002/07/owl#",
      "": "http://www.w3.org/1999/xhtml",
      "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
      "foaf": "http://xmlns.com/foaf/0.1/",
      "dbonto": "http://dbpedia.org/ontology/",
      "oc": "http://s.opencalais.com/1/type/em/e/",
      "ocpred": "http://s.opencalais.com/1/pred/",
      "rdfcal": "http://www.w3.org/2002/12/cal#",
      "test": "http://this.is.a/test#"
    };
    deepEqual(VIE2.namespaces, reference, "Manually adding namespaces.");
    strictEqual(VIE2.namespaces["test"], "http://this.is.a/test#", "Manually adding namespaces.");
});

test ("Manually adding duplicate", 2, function () {
    VIE2.namespaces["test"] = "http://this.is.a/test#";
    var reference = {
      "owl": "http://www.w3.org/2002/07/owl#",
      "": "http://www.w3.org/1999/xhtml",
      "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
      "foaf": "http://xmlns.com/foaf/0.1/",
      "dbonto": "http://dbpedia.org/ontology/",
      "oc": "http://s.opencalais.com/1/type/em/e/",
      "ocpred": "http://s.opencalais.com/1/pred/",
      "rdfcal": "http://www.w3.org/2002/12/cal#",
      "test": "http://this.is.a/test#"
    };
    deepEqual(VIE2.namespaces, reference, "Manually adding namespaces.");
    strictEqual(VIE2.namespaces["test"], "http://this.is.a/test#", "Manually adding namespaces.");
});

test ("Manually removing namespaces", 2, function () {
    delete VIE2.namespaces["test"];
    var reference = {
      "owl": "http://www.w3.org/2002/07/owl#",
      "": "http://www.w3.org/1999/xhtml",
      "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
      "foaf": "http://xmlns.com/foaf/0.1/",
      "dbonto": "http://dbpedia.org/ontology/",
      "oc": "http://s.opencalais.com/1/type/em/e/",
      "ocpred": "http://s.opencalais.com/1/pred/",
      "rdfcal": "http://www.w3.org/2002/12/cal#"
    };
    deepEqual(VIE2.namespaces, reference, "Manually removing namespaces.");
    strictEqual(VIE2.namespaces['test'], undefined, "Manually removing namespaces.");
});