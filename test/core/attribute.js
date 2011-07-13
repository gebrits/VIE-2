module("VIE2 - Attribute");

test("VIE2.Attribute initialization", 14, function() {
    
    ok(VIE2.Attribute);
    ok(typeof VIE2.Attribute === 'function');

    var newType2 = new VIE2.Type('TestTypeAttr2', undefined, [
    {
        id: 'name',
        datatype: 'string'
    }], {});
    var newType3 = new VIE2.Type('TestTypeAttr3', undefined, [
    {
        id: 'name',
        datatype: 'TestTypeAttr2'
    }], {});
    
    ok(newType2);
    ok(newType3);
    
    ok(newType2.getAttr('name'));
    equal(newType2.getAttr('name').id, '<' + VIE2.baseNamespace + 'name' + '>');
    equal(newType2.getAttr('name').sid, 'name');
    equal(newType2.getAttr('name').type.id, newType2.id);
    equal(newType2.getAttr('name').datatype, 'string');
    
    ok(newType3.getAttr('name'));
    equal(newType3.getAttr('name').id, '<' + VIE2.baseNamespace + 'name' + '>');
    equal(newType3.getAttr('name').sid, 'name');
    equal(newType3.getAttr('name').type.id, newType3.id);
    equal(newType3.getAttr('name').datatype, newType2);
    
        
    VIE2.unregisterType('TestTypeAttr2');
    VIE2.unregisterType('TestTypeAttr3');
});