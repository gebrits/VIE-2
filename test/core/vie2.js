module("Core");

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
