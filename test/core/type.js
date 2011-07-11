module("VIE2 - Type");

test("VIE2.Type initialization", 8, function() {

    var t1 = VIE2.getType('TestType1');
    equal(t1, undefined);
    
    var newType1 = new VIE2.Type('TestType1', undefined, [], {});
    var newType1Singleton = new VIE2.Type('TestType1', undefined, [], {});
    var newType1Getted = new VIE2.Type('TestType1', undefined, [], {});
    var newType2 = new VIE2.Type('TestType2', undefined, [], {});
    
    var t1 = VIE2.getType('TestType1');
    
    ok(t1);
    
    equal(newType1, t1);
    
    equal(newType1, newType1Singleton);
    equal(newType1, newType1Getted);
    
    notEqual(newType1, newType2);
    
    equal(newType1.id, '<' + VIE2.baseNamespace + 'TestType1>');
    equal(newType1.sid, 'TestType1');
    
});

test("VIE2.unregisterType()", 2, function () {
    
    var newType1 = new VIE2.Type('TestType1', undefined, [], {});
    var t1 = VIE2.getType('TestType1');
    
    ok(t1);
    
    VIE2.unregisterType('TestType1');
    var t2 = VIE2.getType('TestType1');
    
    equal(t2, undefined);
        
});

test("VIE2.Type.listAttrs()", 2, function () {
    
    var newType1 = new VIE2.Type('TestTypeAttr1', undefined, [
        {'id'       : 'test',
         'datatype' : 'string'
         }], {});
         
     var newType1 = new VIE2.Type('TestTypeAttr2', undefined, [
        {'id'       : 'test',
         'datatype' : 'string'
         },
         {'id'       : 'test2',
         'datatype' : 'string'
         }], {});
         
    var t1 = VIE2.getType('TestTypeAttr1');
    var t2 = VIE2.getType('TestTypeAttr2');
    
    equal(t1.listAttrs().length, 1);
    equal(t2.listAttrs().length, 2);
    
    VIE2.unregisterType('TestTypeAttr1');
    VIE2.unregisterType('TestTypeAttr2');
        
});

test("VIE2.Type.getAttr()", 2, function () {
    
    var newType1 = new VIE2.Type('TestTypeAttr1', undefined, [
        {'id'       : 'test',
         'datatype' : 'string'
         },
         {'id'       : 'test2',
         'datatype' : 'string'
         }], {});
         
    var t1 = VIE2.getType('TestTypeAttr1');
    
    ok(t1.getAttr('test'));
    equal(t1.getAttr('foo'), undefined);
    
    VIE2.unregisterType('TestTypeAttr1');
        
});

test("VIE2.getType()", 5, function () {
    
    var newType1 = new VIE2.Type('TestType1', undefined, [], {});
    
    var t1 = VIE2.getType('TestType1');
    var t2 = VIE2.getType('test:TestType1');
    var t3 = VIE2.getType('<' + VIE2.baseNamespace + 'TestType1>');
    var t4 = VIE2.getType(VIE2.baseNamespace + 'TestType1');
    
    ok(t1);
    
    equal(t1, t2);
    equal(t2, t3);
    equal(t3, t4);
    
    ok(VIE2['TestType1' + 's']);

});


test("VIE2.Type.getParent()", 2, function () {
    
    var newType1 = new VIE2.Type('TestTypeAttr1', undefined, [
        {'id'       : 'test',
         'datatype' : 'string'
         }], {});
         
     var newType2 = new VIE2.Type('TestTypeAttr2', 'TestTypeAttr1', [
        {'id'       : 'test',
         'datatype' : 'string'
         },
         {'id'       : 'test2',
         'datatype' : 'string'
         }], {});
         
    equal(newType1.getParent(), undefined);
    equal(newType2.getParent().id, newType1.id);
    
    VIE2.unregisterType('TestTypeAttr1');
    VIE2.unregisterType('TestTypeAttr2');
        
});

test("VIE2.Type.listChildren()", 2, function () {
    
    var newType1 = new VIE2.Type('TestTypeAttr1', undefined, [
        {'id'       : 'test',
         'datatype' : 'string'
         }], {});
         
     var newType2 = new VIE2.Type('TestTypeAttr2', 'TestTypeAttr1', [
        {'id'       : 'test',
         'datatype' : 'string'
         },
         {'id'       : 'test2',
         'datatype' : 'string'
         }], {});
         
    equal(newType1.listChildren().length, 1);
    equal(newType2.listChildren().length, 0);
    
    VIE2.unregisterType('TestTypeAttr1');
    VIE2.unregisterType('TestTypeAttr2');
        
});

test("VIE2.Type.isTypeOf()", 7, function () {
    
    var newType1 = new VIE2.Type('TestTypeAttr1', undefined, [
        {'id'       : 'test',
         'datatype' : 'string'
         }], {});
         
     var newType2 = new VIE2.Type('TestTypeAttr2', 'TestTypeAttr1', [
        {'id'       : 'test',
         'datatype' : 'string'
         },
         {'id'       : 'test2',
         'datatype' : 'string'
         }], {});
         
    equal(newType1.isTypeOf('TestTypeAttr1'), true);
    equal(newType1.isTypeOf('TestTypeAttr2'), false);
    
    equal(newType1.isTypeOf(undefined), false);
    
    equal(newType1.isTypeOf(newType1), true);
    equal(newType1.isTypeOf(newType2), false);
    
    equal(newType2.isTypeOf(newType2), true);
    equal(newType2.isTypeOf(newType1), true);

    
    VIE2.unregisterType('TestTypeAttr1');
    VIE2.unregisterType('TestTypeAttr2');
        
});

test("VIE2.Type.toHierarchyObject()", 7, function () {
    
    var newType1 = new VIE2.Type('TestTypeAttr1', undefined, [
        {'id'       : 'test',
         'datatype' : 'string'
         }], {});
         
     var newType2 = new VIE2.Type('TestTypeAttr2', 'TestTypeAttr1', [
        {'id'       : 'test',
         'datatype' : 'string'
         },
         {'id'       : 'test2',
         'datatype' : 'string'
         }], {});
    
    var t1Hierarchy = newType1.toHierarchyObject();
    var t2Hierarchy = newType2.toHierarchyObject();
         
    ok(t1Hierarchy instanceof Object);
    ok(typeof t1Hierarchy === 'object');
    
    equal(t1Hierarchy.id, newType1.id);
    equal(t1Hierarchy.children.length, newType1.listChildren().length);
    equal(t1Hierarchy.children[0].id, newType2.id);
    
    equal(t2Hierarchy.id, newType2.id);
    equal(t2Hierarchy.children.length, 0);
    
    VIE2.unregisterType('TestTypeAttr1');
    VIE2.unregisterType('TestTypeAttr2');
        
});
