module("Core - Model");

test("VIE2 Model API", 11, function () {
   ok(VIE2);
   ok(VIE2.Entity);
   ok(typeof VIE2.Entity === 'function');
   ok(VIE2.createEntity);
   ok(typeof VIE2.createEntity === 'function');
   ok(VIE2.Object);
   ok(typeof VIE2.Object === 'function');
   ok(VIE2.createLiteral);
   ok(typeof VIE2.createLiteral === 'function');
   ok(VIE2.createResource);
   ok(typeof VIE2.createResource === 'function');

});


test("VIE2 Model Manually create entity", 12, function () {
   //create anonymous entity with no given type 
    
   var entity = VIE2.createEntity();
   
   ok(entity);
   ok(entity.isEntity());
   ok(entity.get('id').indexOf('_:b') === 0); //should be a blank id
   equal(entity.get('a').length, 1);
   //TODO: equal(entity.get('a').at(0).value(), 'Thing');
   
   //create anonymous entity with given type 
   var entity2 = VIE2.createEntity('Place');
   
   ok(entity2);
   ok(entity2.isEntity());
   ok(entity2.get('id').indexOf('_:b') === 0); //should be a blank id
   equal(entity2.get('a').length, 1);
   //TODO: equal(entity.get('a').at(0).value(), 'Place');
   
   //create entity with no given type 
   var entity3 = VIE2.createEntity(undefined, {id: '<http://test.org/SomeID>'});
   
   ok(entity3);
   ok(entity3.isEntity());
   equal(entity3.get('id'), '<http://test.org/SomeID>');
   equal(entity3.get('a').length, 1);
   //TODO: equal(entity.get('a').at(0).value(), 'Place');
});
