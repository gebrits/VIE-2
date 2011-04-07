module("Core - Namespaces");

test ("Parsing of Document namespaces (length)", function () {
    var sum = 0;
    $.each($.VIE2.namespaces, function(){sum++});
    strictEqual(16, sum, "Parsing the document's namespaces.");
});

test ("Parsing of Document namespaces (object)", 1, function () {
    var reference = {
        "" : "http://www.w3.org/1999/xhtml",
        dbonto: "http://dbpedia.org/ontology/",
        dbpedia: "http://dbpedia.org/resource/",
        dbprop: "http://dbpedia.org/property/",
        dc: "http://purl.org/dc/terms/",
        demo: "http://this.demo.eu/",
        fise: "http://fise.iks-project.eu/ontology/",
        foaf: "http://xmlns.com/foaf/0.1/",
        geo: "http://www.w3.org/2003/01/geo/wgs84_pos#",
        google: "http://rdf.data-vocabulary.org/#",
        iks: "http://www.iks-project.eu/#",
        rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
        rdfcal: "http://www.w3.org/2002/12/cal#",
        rdfs: "http://www.w3.org/2000/01/rdf-schema#",
        xsd: "http://www.w3.org/2001/XMLSchema#",
        yago: "http://dbpedia.org/class/yago/"
    };
    deepEqual(reference, $.VIE2.namespaces, "Parsing the document's namespaces.");
});

test ("Manually adding namespaces (length)", function () {
    $.VIE2.namespaces["test"] = "http://this.is.a/test#";
    var sum = 0;
    $.each($.VIE2.namespaces, function(){sum++});
    strictEqual(17, sum, "Manually adding namespaces.");
});

test ("Manually adding namespaces (object)", 2, function () {
    $.VIE2.namespaces["test"] = "http://this.is.a/test#";
    var reference = {
        "" : "http://www.w3.org/1999/xhtml",
        dbonto: "http://dbpedia.org/ontology/",
        dbpedia: "http://dbpedia.org/resource/",
        dbprop: "http://dbpedia.org/property/",
        dc: "http://purl.org/dc/terms/",
        demo: "http://this.demo.eu/",
        fise: "http://fise.iks-project.eu/ontology/",
        foaf: "http://xmlns.com/foaf/0.1/",
        geo: "http://www.w3.org/2003/01/geo/wgs84_pos#",
        google: "http://rdf.data-vocabulary.org/#",
        iks: "http://www.iks-project.eu/#",
        rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
        rdfcal: "http://www.w3.org/2002/12/cal#",
        rdfs: "http://www.w3.org/2000/01/rdf-schema#",
        test: "http://this.is.a/test#",
        xsd: "http://www.w3.org/2001/XMLSchema#",
        yago: "http://dbpedia.org/class/yago/"
    };
    deepEqual(reference, $.VIE2.namespaces, "Manually adding namespaces.");
    strictEqual("http://this.is.a/test#", $.VIE2.namespaces["test"], "Manually adding namespaces.");
});