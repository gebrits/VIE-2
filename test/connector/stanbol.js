module("Connector - Apache Stanbol");

test("VIE2 Connector API", 16, function () {
   ok(VIE2);
   ok(VIE2.Connector);
   ok(typeof VIE2.Connector === 'function');
   ok(VIE2.connectors);
   ok(typeof VIE2.connectors === 'object');
   ok(VIE2.getConnector);
   ok(typeof VIE2.getConnector === 'function');
   ok(VIE2.registerConnector);
   ok(typeof VIE2.registerConnector === 'function');
   ok(VIE2.unregisterConnector);
   ok(typeof VIE2.unregisterConnector === 'function');
   
   
   equal(VIE2.connectors['stanbol'], undefined);
   equal(VIE2.getConnector('stanbol'), undefined);
   
   //load the connector!
   $('head').append($("<script type='text/javascript' src='../utils/stanbol_base_uri.js'></script>"));
   $('head').append($('<script type="text/javascript" src="../src/connector/stanbol.js"></script>'));
   
   ok(VIE2.connectors['stanbol']);
   ok(VIE2.getConnector('stanbol'));
   ok(VIE2.getConnector('stanbol') instanceof VIE2.Connector);
   VIE2.clear();
});


test("VIE2 Connector (Stanbol) - Analyze", 3, function () {
    stop();
    
    var elem = $('<p>This is a small test, where Steve Jobs and Barack Obama sing a song.</p>');
    
    var callback = function () {
        equal(VIE2.globalCache.databank.size(), 64);
        equal($(this).get(0), elem.get(0));
        ok(VIE2.all('Person').length >= 1 && VIE2.all('Person').length <= 2);
        start();
    };
    
    
    //start analysis
	VIE2.analyze(elem, callback, { connectors: ['stanbol'] });
});
