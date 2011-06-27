// File:   stanbol.js
// Author: <a href="mailto:sebastian.germesin@dfki.de">Sebastian Germesin</a>
//

// Ontology structure:
//type == http://fise.iks-project.eu/ontology/TextAnnotation
// => fise:start
// => fise:end
// => fise:selected-text
// => fise:selection-context
//type == http://fise.iks-project.eu/ontology/EntityAnnotation
// => fise:entity-reference
// => entity-label
// => fise:entity-type
//type == http://fise.iks-project.eu/ontology/Enhancement    
// => fise:confidence <float>
// => dc:type


// The stanbol connector needs to be initialized like this:
//VIE2.getConnector('stanbol').options({
//    "proxy_url" : "../utils/proxy/proxy.php",
//    "enhancer_url" : "http://stanbol.iksfordrupal.net:9000/engines/",
//    "entityhub_url" : "http://stanbol.iksfordrupal.net:9000/entityhub/"
//});

new VIE2.Connector('stanbol', {
    namespaces: {
        semdesk : "http://www.semanticdesktop.org/ontologies/2007/03/22/nfo#",
        owl : "http://www.w3.org/2002/07/owl#",
        gml : "http://www.opengis.net/gml/_",
        geonames : "http://www.geonames.org/ontology#",
        fise : "http://fise.iks-project.eu/ontology/",
        rick: "http://www.iks-project.eu/ontology/rick/model/"
    },
    //rules to add backwards-relations to the triples
    //this makes querying for entities a lot easier!
    rules: {
        'prefix' :  {
            'fise': 'http://fise.iks-project.eu/ontology/',
            'dc'  : 'http://purl.org/dc/terms/'
        },
        'rules':  [
            {'left' : [
                '?subject a <http://fise.iks-project.eu/ontology/EntityAnnotation>',
                '?subject fise:entity-type ?type',
                '?subject fise:confidence ?confidence',
                '?subject fise:entity-reference ?entity',
                '?subject dc:relation ?relation',
                '?relation a <http://fise.iks-project.eu/ontology/TextAnnotation>',
                '?relation fise:selected-text ?selected-text',
                '?relation fise:selection-context ?selection-context',
                '?relation fise:start ?start',
                '?relation fise:end ?end'
            ],
             'right' : [
                 '?entity a ?type',
                 '?entity fise:hasTextAnnotation ?relation',
                 '?entity fise:hasEntityAnnotation ?subject'
             ]
             }
        ]
    }
});

VIE2.connectors['stanbol'].analyze = function (object, options) {
    var rdf = jQuery.rdf();
    
    if (object === undefined) {
        VIE2.log ("warn", "VIE2.Connector('" + this.id + "')", "Given object is undefined!");
        if (options && options.error) {
            options.error("Given object is undefined!");
        }
    } else if (typeof object === 'object') {
        var self = this; 
        //stanbol cannot deal with embedded HTML, so we remove that.
        //--> hack!
        var text = self.extractText(object);
        //the AJAX callback function
        var callback = function (rdfc) {
            //adding all new found triples to the main rdfQuery object
            rdfc.databank.triples().each(function () {
                rdf.add(this);
            });

            if (self._options.rules) {
                VIE2.log("info", "VIE2.Connector(" + self.id + ")", "Start reasoning '" + (rdf.databank.triples().length) + "'");
                var rules = jQuery.rdf.ruleset();
                for (var prefix in self._options.rules.prefix) {
                    rules.prefix(prefix, self._options.rules.prefix[prefix]);
                }
                for (var i = 0; i < self._options.rules.rules.length; i++) {
                    rules.add(self._options.rules.rules[i]['left'], self._options.rules.rules[i]['right']);
                }
                rdf.reason(rules);
                VIE2.log("info", "VIE2.Connector(" + self.id + ")", "End   reasoning '" + (rdf.databank.triples().length) + "'");
            }
            if (options && options.success) {
                options.success.call(self, rdf);
            } else {
                VIE2.log("warn", "VIE2.Connector(" + self.id + ")", "No success callback given. How do you think this should gonna work?'");
            }
        };
        this.enhance(text, callback);
    } else {
        VIE2.log("error", "VIE2.Connector(" + this.id + ")", "Expected element of type 'object', found: '" + (typeof object) + "'");
        if (options && options.error) {
            options.error.call(this, "Expected element of type 'object', found: '" + (typeof object) + "'");
        }
    }
};

VIE2.connectors['stanbol'].extractText = function (obj) {
    if (obj.get(0) && 
            obj.get(0).tagName && 
            (obj.get(0).tagName == 'TEXTAREA' ||
            obj.get(0).tagName == 'INPUT' && obj.attr('type', 'text'))) {
        return obj.get(0).val();
    }
    else {
        return obj
            .text()    //get the text of element
            .replace(/\s+/g, ' ') //collapse multiple whitespaces
            .replace(/\0\b\n\r\f\t/g, '').trim(); // remove non-letter symbols
    }
};

VIE2.connectors['stanbol'].enhance = function (text, callback) {
    if (text.length === 0) {
        VIE2.log("warn", "VIE2.Connector(" + this.id + ")", "Empty text.");
        callback(jQuery.rdf());
    }
    else {
        var that = this;
        var c = function(data) {
            if (data && data.status === 200) {
                try {
                    var obj = $.parseJSON(data.responseText);
                    var rdf = jQuery.rdf().load(obj, {});
                    callback(rdf);
                } 
                catch (e) {
                    VIE2.log("error", "VIE2.Connector(" + that.id + ")", e);
                    VIE2.log("error", "VIE2.Connector(" + that.id + ")", data);
                    callback(jQuery.rdf());
                }
            }
        };
        this.queryEnhancer(text, c);
    }
};

VIE2.connectors['stanbol'].queryEnhancer = function (text, callback) {

    var proxy = this._options.proxy_url;
    var enhancer_url = this._options.enhancer_url;
    
    if (!this._options.enhancer_url) {
        VIE2.log("warn", "VIE2.connectors(" + this.id + ")", "No URL found for enhancer hub!");
        throw "VIE2.connector.stanbol.enhancer_url is empty";
        return;
    }

    if (proxy) {
        jQuery.ajax({
            async: true,
            complete: callback,
            type: "POST",
            url: proxy,
            data: {
                proxy_url: enhancer_url, 
                content: text,
                verb: "POST",
                format: "application/rdf+json"
            }
        });
    } else {
        jQuery.ajax({
            async: true,
            complete: callback,
            type: "POST",
            url: enhancer_url,
            data: text,
            dataType: "application/rdf+json"
        });
    }
};