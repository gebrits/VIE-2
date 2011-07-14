module("Core");


test("VIE2 API", 25, function () {
    ok(VIE2);
    
	ok(VIE2.baseNamespace);
	ok(typeof VIE2.baseNamespace === 'string');
	ok(VIE2.namespaces);
	ok(VIE2.namespaces instanceof VIE2.Namespaces);
    
	ok(VIE2.globalCache);
	ok(VIE2.globalCache instanceof jQuery.rdf);
	ok(VIE2.addToCache);
	ok(typeof VIE2.addToCache === 'function');
	ok(VIE2.removeFromCache);
	ok(typeof VIE2.removeFromCache === 'function');
	ok(VIE2.getPropFromCache);
	ok(typeof VIE2.getPropFromCache === 'function');
    
	ok(VIE2.clear);
	ok(typeof VIE2.clear === 'function');
    
	ok(VIE2.analyze);
	ok(typeof VIE2.analyze === 'function');
	ok(VIE2.lookup);
	ok(typeof VIE2.lookup === 'function');
	ok(VIE2.serialize);
	ok(typeof VIE2.serialize === 'function');
    
	ok(VIE2.howMuchDoIKnow);
	ok(typeof VIE2.howMuchDoIKnow === 'function');
	ok(VIE2.all);
	ok(typeof VIE2.all === 'function');
   
});