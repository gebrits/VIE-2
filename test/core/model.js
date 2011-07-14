module("Core - Model");

test("VIE2 Model API", 3, function () {
   ok(VIE2);
   ok(VIE2.Entity);
   ok(typeof VIE2.Entity === 'function');
   
   VIE2.clear();
});


test("VIE2 Model Manually create entity without attributes", 25, function () {
   //create anonymous entity with no given type 
    
   var entity = new VIE2.Entity();
   
   
   ok(entity);
   ok(entity.isEntity);
   ok(entity.get('id').match(/^_:.+$/)); //should be a blank id
   ok(entity.get('a'));
   equal(entity.get('a').id, VIE2.getType('Thing').id);
    
   //create anonymous entity with given type
   var entity2 = VIE2.Entity({
       a: 'Place'
   });
   
   ok(entity2);
   ok(entity2.isEntity);
   ok(entity2.get('id').match(/^_:.+$/)); //should be a blank id
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
   
   //create anonymous entity with given type
   var entity5 = VIE2.Entity({
       a: VIE2.getType('Person')
   });
   
   ok(entity5);
   ok(entity5.isEntity);
   ok(entity5.get('a'));
   equal(entity5.get('a').id, VIE2.getType('Person').id);
   
   VIE2.clear();
});

test("VIE2 Model Manually create entity with attributes", 8, function () {
   //create anonymous entity with no given type 

   var newPersonType = new VIE2.Type('PersonWithAge', 'Person', [
        {id       : 'age',
         datatype : 'Integer'
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
       a: 'PersonWithAge',
       name : 'John Doe',
       age: 23,
       description : 'This is a test'
   });
   var entity3 = new VIE2.Entity({
       a: 'PersonWithAge',
       name : 'John Doe',
       age: 23,
       description : 'This is a test'
   });

   var entity4 = new VIE2.Entity({
       a : 'Person', 
       name : ['John Doe', 'John Doeish'],
       description : 'This is a test',
       knows: [entity.get('id'), entity2.get('id'), entity3.get('id')]
   });
   
   ok(entity4);
   ok(entity4.isEntity);
   ok(entity4.get('a'));
   equal(entity4.get('a').id, VIE2.getType('Person').id);
   
  
   VIE2.unregisterType('PersonWithAge');
   
   VIE2.clear();
});


test("VIE2 Model Change attributes", 9, function () {
    
    var newPersonType = new VIE2.Type('PersonWithAge', 'Person', [
        {id       : 'age',
         datatype : 'Integer'
         }], {});
         
   var entity = new VIE2.Entity({
       a: 'PersonWithAge',
       name : 'John Doe',
       age: 23,
       description : 'This is a test'
   });
   
   ok(entity);
   equal(entity.get('name')[0], 'John Doe');
   equal(entity.get('age')[0], 23);
   
   entity.set({
      name: 'Johnny The Doe',
      age: 24,
      description : ['This is a test', 'This is another test']
   });

   ok(entity);
   equal(entity.get('name')[0], 'Johnny The Doe');
   equal(entity.get('age')[0], 24);
   equal(entity.get('description').length, 2);
   equal(entity.get('description')[0], 'This is a test');
   equal(entity.get('description')[1], 'This is another test');
  
   VIE2.unregisterType('PersonWithAge');
   
   VIE2.clear();      
});



test("VIE2 Model unset attributes", 8, function () {
    
   var newPersonType = new VIE2.Type('PersonWithAge', 'Person', [
        {id       : 'age',
         datatype : 'Integer'
         }], {}
   );
         
   var entity = new VIE2.Entity({
       a: 'PersonWithAge',
       name : 'John Doe',
       age: 23,
       description : 'This is a test'
   });
   
   ok(entity);
   equal(entity.get('name')[0], 'John Doe');
   equal(entity.get('age')[0], 23);
   
   entity.unset('name');
   
   entity.set({age : []}); //should be the same as entity.unset('age');

   ok(entity);
   equal(entity.get('name').length, 0);
   equal(entity.get('age').length, 0);
   equal(entity.get('description').length, 1);
   equal(entity.get('description')[0], 'This is a test');
  
   VIE2.unregisterType('PersonWithAge');
   
   VIE2.clear();      
});


test("VIE2 Model clear model", 10, function () {
    
   var newPersonType = new VIE2.Type('PersonWithAge', 'Person', [
        {id       : 'age',
         datatype : 'Integer'
         }], {}
   );
         
   var entity = new VIE2.Entity({
       a: 'PersonWithAge',
       name : 'John Doe',
       age: 23,
       description : 'This is a test'
   });
   
   ok(entity);
   var id = entity.get('id');
   equal(entity.get('name')[0], 'John Doe');
   equal(entity.get('age')[0], 23);
   equal(entity.get('description').length, 1);
   equal(entity.get('description')[0], 'This is a test');

   entity.clear();
   
   ok(entity);
   equal(entity.get('id'), id);
   equal(entity.get('name').length, 0);
   equal(entity.get('age').length, 0);
   equal(entity.get('description').length, 0);
  
   VIE2.unregisterType('PersonWithAge');
   
   VIE2.clear();      
});


test("VIE2 Model destroy model", 10, function () {
    
   var newPersonType = new VIE2.Type('PersonWithAge', 'Person', [
        {id       : 'age',
         datatype : 'Integer'
         }], {}
   );
         
   var entity = new VIE2.Entity({
       a: 'PersonWithAge',
       name : 'John Doe',
       age: 23,
       description : 'This is a test'
   });
   
   ok(entity);
   var id = entity.get('id');
   ok(VIE2.entities.get(id));
   equal(entity.get('name')[0], 'John Doe');
   equal(entity.get('age')[0], 23);
   equal(entity.get('description').length, 1);
   equal(entity.get('description')[0], 'This is a test');

   entity.destroy();
   
   ok(entity);
   ok(VIE2.entities.get(id) == undefined);

   VIE2.unregisterType('PersonWithAge');
   
   VIE2.clear();      
});

