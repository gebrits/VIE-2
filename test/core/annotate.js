module("Core - Manual annotations");

test ("Manually add an entity wo. id", 7, function () {
    var entity = 
        VIE2.createEntity({
            a: 'foaf:Person',
            'foaf:name': "\"Mr. Unknown\""
    });
    
    ok(entity);
    
    ok(entity.get('a').size() === 2);
    equal(entity.get('a').at(0).value(), "<http://xmlns.com/foaf/0.1/Person>");
    equal(entity.get('a').at(1).value(), "<http://www.w3.org/2002/07/owl#Thing>");
    
    equal(entity.get('foaf:name').size(), 1);
    
    equal(entity.get('foaf:name').at(0).value(), "Mr. Unknown");
    equal(entity.get('foaf:name').at(0).get('value'), entity.get('foaf:name').at(0).value());
});

test ("Manually add an entity w. given blank-id", 6, function () {
    var entity = 
        VIE2.createEntity({
            id: "_:b01",
            a: 'foaf:Person',
            'foaf:name': "\"Mr. Unknown\""
    });
    
    ok(entity);
    
    equal(VIE.EntityManager.getBySubject("_:b01"), entity);
    
    equal(entity.get('id'), '_:b01');
    
    equal(entity.get('foaf:name').size(), 1);
    
    equal(entity.get('foaf:name').at(0).value(), "Mr. Unknown");
    equal(entity.get('foaf:name').at(0).get('value'), entity.get('foaf:name').at(0).value());
});

test ("Manually add an entity w. given id", 6, function () {
    if (!VIE2.namespaces.containsKey("test")) {
        VIE2.namespaces.add("test", "http://this.is.a/test#");
    }
    if (!VIE2.namespaces.containsKey("foaf")) {
        VIE2.namespaces.add("foaf", "http://xmlns.com/foaf/0.1/");
    }
    
    var entity = 
        VIE2.createEntity({
            id: "<http://this.is.a/test#TestPerson01>",
            a: 'foaf:Person',
            'foaf:name': "\"Mr. Unknown\""
    });
    
    ok(entity);
    
    equal(VIE.EntityManager.getBySubject('<http://this.is.a/test#TestPerson01>'), entity);
    
    equal(entity.get('id'), '<http://this.is.a/test#TestPerson01>');
    
    equal(entity.get('foaf:name').size(), 1);
    
    equal(entity.get('foaf:name').at(0).value(), "Mr. Unknown");
    equal(entity.get('foaf:name').at(0).get('value'), entity.get('foaf:name').at(0).value());
});