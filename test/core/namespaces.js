module("Core - Namespaces");

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