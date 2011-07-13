module("Core - Model");

test("VIE2 Model API", 9, function () {
   ok(VIE2);
   ok(VIE2.Entity);
   ok(typeof VIE2.Entity === 'function');
   ok(VIE2.Object);
   ok(typeof VIE2.Object === 'function');
   ok(VIE2.createLiteral);
   ok(typeof VIE2.createLiteral === 'function');
   ok(VIE2.createResource);
   ok(typeof VIE2.createResource === 'function');

});


test("VIE2 Model Manually create entity without attributes", 21, function () {
   //create anonymous entity with no given type 
    
   var entity = new VIE2.Entity();
   
   ok(entity);
   ok(entity.isEntity);
   ok(entity.get('id').indexOf('_:b') === 0); //should be a blank id
   ok(entity.get('a'));
   equal(entity.get('a').id, VIE2.getType('Thing').id);
   
   //create anonymous entity with given type
   var entity2 = VIE2.Entity({
       a: 'Place'
   });
   
   ok(entity2);
   ok(entity2.isEntity);
   ok(entity2.get('id').indexOf('_:b') === 0); //should be a blank id
   ok(entity2.get('a'));
   equal(entity2.get('a').id, VIE2.getType('Place').id);
   
   //create anonymous entity with given type
   var entity3 = VIE2.Entity({
       a: ['Person']
   });
   
   ok(entity3);
   ok(entity3.isEntity);
   notEqual(entity2.id, entity3.id);
   ok(entity3.get('a'));
   equal(entity3.get('a').id, VIE2.getType('Person').id);
   
   //create anonymous entity with given type
   var entity4 = VIE2.Entity({
       id: '<http://test.org/AwesomeId>',
       a: ['Person']
   });
   
   ok(entity4);
   ok(entity4.isEntity);
   equal(entity4.get('id'), '<http://test.org/AwesomeId>');
   equal(entity4.id, 'http://test.org/AwesomeId');
   ok(entity4.get('a'));
   equal(entity4.get('a').id, VIE2.getType('Person').id);
});

test("VIE2 Model Manually create entity with attributes", 8, function () {
   //create anonymous entity with no given type 
   
   var newPersonType = new VIE2.Type('PersonWithAge', 'Person', [
        {'id'       : 'age',
         'datatype' : 'Integer'
         }], {});
    
   var entity = new VIE2.Entity({
       a: 'PersonWithAge',
       name : 'John Doe',
       age: 23,
       description : 'This is a test'
   });
   
   ok(entity);
   ok(entity.isEntity);
   ok(entity.get('a'));
   equal(entity.get('a').id, VIE2.getType('PersonWithAge').id);

   var entity2 = new VIE2.Entity({
       a : 'Person', 
       name : ['John Doe', 'John Doeish'],
       description : 'This is a test'
   });
   
   ok(entity2);
   ok(entity2.isEntity);
   ok(entity2.get('a'));
   equal(entity2.get('a').id, VIE2.getType('Person').id);
   
   VIE2.unregisterType('PersonWithAge');
});
