module("Core - Namespaces");

test("VIE2 namespace", 12, function () {
   ok(VIE2);
   ok(VIE2.baseNamespace);
   ok(VIE2.namespaces);
   
   ok(VIE2.globalCache);
   ok(typeof VIE2.addToCache === 'function');
   ok(typeof VIE2.getPropFromCache === 'function');
   ok(typeof VIE2.removeFromCache === 'function');
   
   ok(typeof VIE2.analyze === 'function');
   ok(typeof VIE2.lookup === 'function');
   ok(typeof VIE2.serialize === 'function');
   
   equal(VIE2.namespaces.get('owl'), 'http://www.w3.org/2002/07/owl#');
   equal(VIE2.namespaces.get('xsd'), 'http://www.w3.org/2001/XMLSchema#');
});


test ("Manually adding namespaces", 2, function () {
    var reference = jQuery.extend(VIE2.namespaces.toObj(), {'test' : 'http://this.is.a/test#'});
    
    VIE2.namespaces.add("test","http://this.is.a/test#");
    
    deepEqual(VIE2.namespaces.toObj(), reference, "Manually adding namespaces.");
    strictEqual(VIE2.namespaces.get("test"), "http://this.is.a/test#", "Manually adding namespaces.");
});

test ("Manually adding duplicate", 2, function () {
    var reference = jQuery.extend(VIE2.namespaces.toObj(), {'test' : 'http://this.is.a/test#'});
    VIE2.namespaces.add("test", "http://this.is.a/test#");
    deepEqual(VIE2.namespaces.toObj(), reference, "Manually adding namespaces.");
    strictEqual(VIE2.namespaces.get("test"), "http://this.is.a/test#", "Manually adding namespaces.");
});

test ("Manually adding wrong duplicate (key)", 1, function () {
    raises(function () {
        VIE2.namespaces.add("test1", "http://this.is.a/test#");
    });
    
});

test ("Manually adding wrong duplicate (value)", 1, function () {
    raises(function () {
        VIE2.namespaces.add("test", "http://this.is.another/test#");
    });
});

test ("Manually removing namespaces", 2, function () {
    var reference = VIE2.namespaces.toObj();
    delete reference["test"];
     
    VIE2.namespaces.remove("test");
   
    deepEqual(VIE2.namespaces.toObj(), reference, "Manually removing namespaces.");
    strictEqual(VIE2.namespaces['test'], undefined, "Manually removing namespaces.");
});