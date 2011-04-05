function removeElement(a,b){if(jQuery.isArray(a)){jQuery.each(a,function(c){if(a[c]===b){a.splice(c,1);return false}})}}var PseudoGuid=new (function(){this.empty="VIE2-00000000-0000-0000-0000-000000000000";this.GetNew=function(){var a=function(){return(((1+Math.random())*65536)|0).toString(16).substring(1).toUpperCase()};return("VIE2-"+a()+a()+"-"+a()+"-"+a()+"-"+a()+"-"+a()+a()+a())}})();Connector=function(b,a){if(b===undefined){throw"The connector constructor needs an 'id'!"}if(typeof b!=="string"){throw"The connector constructor needs an 'id' of type 'string'!"}this.id=b;this._options=(a)?a:{};jQuery.VIE2.registerConnector(this)};Connector.prototype.options=function(a){if(a){jQuery.extend(true,this._options,a)}else{return this._options}};Connector.prototype.analyze=function(a,b,c){jQuery.VIE2.log("info","VIE2.Connector("+this.id+")#analyze()","Not overwritten!");c(jQuery.rdf())};Connector.prototype.query=function(b,a,c,d){jQuery.VIE2.log("info","VIE2.Connector("+this.id+")#query()","Not overwritten!");d({})};Connector.prototype.annotate=function(a,c,b,d){jQuery.VIE2.log("info","VIE2.Connector("+this.id+")#annotate()","Not overwritten!");d({})};Connector.prototype.remove=function(a,c,b,d){jQuery.VIE2.log("info","VIE2.Connector("+this.id+")#remove()","Not overwritten!");d({})};Mapping=function(c,a,b){if(c===undefined){throw"The mapping constructor needs an 'id'!"}if(typeof c!=="string"){throw"The mapping constructor needs an 'id' of type 'string'!"}if(a===undefined){throw"The mapping constructor needs 'types'!"}this.id=c;this.types=a;this.defaultProps=(b)?b:[];jQuery.VIE2.registerMapping(this)};(function(a,b){a.widget("VIE2.vie2",{options:{localEntities:[]},_create:function(){var d=this;jQuery.each(jQuery("html").xmlns(),function(f,e){jQuery.VIE2.namespaces[f]=e.toString()});jQuery.each(jQuery.VIE2.connectors,function(){if(this.options()["namespaces"]){jQuery.each(this.options()["namespaces"],function(f,e){jQuery.VIE2.namespaces[f]=e})}});jQuery.each(jQuery.VIE2.namespaces,function(f,e){jQuery.VIE2.globalContext.prefix(f,e)});if(!d.element.data("vie2-id")){var c=PseudoGuid.GetNew();jQuery.VIE2.log("info","VIE2.core#create()","Generated id: '"+c+"'!");d.element.data("vie2-id",c)}},analyze:function(e){var d=this;if(e===b){jQuery.VIE2.log("warn","VIE2.core#analyze()","No callback method specified!")}jQuery.VIE2.log("info","VIE2.core#analyze()","Start.");var c=[];jQuery.each(jQuery.VIE2.connectors,function(){c.push(this.id)});jQuery.each(jQuery.VIE2.connectors,function(){var f=function(h,g){return function(i){jQuery.VIE2.log("info","VIE2.core#analyze()","Received RDF annotation from connector '"+h.id+"'!");jQuery.each(jQuery.VIE2.namespaces,function(l,j){i.prefix(l,j)});i.databank.triples().each(function(){jQuery.VIE2.globalContext.add(this)});jQuery.each(i.databank.subjectIndex,function(m,k){var l=[];i.where(m+" a ?type").each(function(){var n=jQuery.createCurie(this.type.value,{namespaces:jQuery.VIE2.namespaces});l.push(n)});var j=m.toString();if(d.options.localEntities.indexOf(j)===-1){d.options.localEntities.push(j)}jQuery.VIE2.registerBackboneModel({id:m,a:l})});removeElement(c,h.id);if(c.length===0){jQuery.VIE2.log("info","VIE2.core#analyze()","Finished! Global context holds now "+jQuery.VIE2.globalContext.databank.triples().length+" triples!");jQuery.VIE2.log("info","VIE2.core#analyze()","Finished! Local context holds now "+d.options.localEntities.length+" entities!");if(e){e.call(g,"ok")}}}}(this,d.element);jQuery.VIE2.log("info","VIE2.core#analyze()","Starting analysis with connector: '"+this.id+"'!");this.analyze(d.element,d.options.namespaces,f)})},uris:function(){return this.options.localEntities},copy:function(c){var d=this;if(!c){jQuery.VIE2.log("warn","VIE2.core#copy()","Invoked 'copy()' without target element!");return}jQuery.VIE2.log("info","VIE2.core#copy()","Start.");jQuery.VIE2.log("info","VIE2.core#copy()","Found "+this.options.localEntities.length+" entities for source ("+this.element.data("vie2-id")+").");a(c).vie2().vie2("option","localEntities",this.options.localEntities);jQuery.VIE2.log("info","VIE2.core#copy()","Finished.");jQuery.VIE2.log("info","VIE2.core#copy()","Target element has now "+a(c).vie2("option","localEntities")+" entities.");return this},clear:function(){this.options.localConext={};return this}})}(jQuery));jQuery.VIE2.namespaces={};jQuery.VIE2.globalContext=jQuery.rdf({namespaces:jQuery.VIE2.namespaces});jQuery.VIE2.getFromGlobalContext=function(b,c){var a=[];jQuery.VIE2.globalContext.where(jQuery.rdf.pattern(b,c,"?object",{namespaces:jQuery.VIE2.namespaces})).each(function(){if(this.object.type){if(this.object.type==="literal"){a.push(this.object.value.toString())}else{if(this.object.type==="uri"||this.object.type==="bnode"){if(VIE.EntityManager.getBySubject(this.object.toString())!==undefined){a.push(VIE.EntityManager.getBySubject(this.object.toString()))}else{a.push(this.object.toString())}}}}});return a};jQuery.VIE2.removeFromGlobalContext=function(a,b){if(a===undefined){jQuery.VIE2.log("warn","$.VIE2.core#remove()","No URI specified, returning without action!");return}if(b===undefined){jQuery.VIE2.log("warn","$.VIE2.core#remove()","No property specified, returning without action!");return}jQuery.VIE2.log("info","$.VIE2.core#remove()","Removing all triples that match: '"+a+" "+b+" ?x'");jQuery.VIE2.globalContext.remove(jQuery.rdf.pattern(a,b,"?x",{namespaces:jQuery.VIE2.namespaces}));jQuery.VIE2.log("info","$.VIE2.core#remove()","Global context holds now "+jQuery.VIE2.globalContext.databank.triples().length+" triples!")};jQuery.VIE2.addToGlobalContext=function(b,c,a){if(b===undefined){jQuery.VIE2.log("warn","$.VIE2.core#addToGlobalContext()","No URI specified, returning without action!");return}if(c===undefined){jQuery.VIE2.log("warn","$.VIE2.core#addToGlobalContext()","No property specified, returning without action!");return}if(a===undefined){jQuery.VIE2.log("warn","$.VIE2.core#addToGlobalContext()","No values specified, returning without action!");return}if(!jQuery.isArray(a)){jQuery.VIE2.addToGlobalContext(b,c,[a])}jQuery.each(a,function(e,d){var f=jQuery.rdf.triple(b,c,d,{namespaces:jQuery.VIE2.namespaces});jQuery.VIE2.log("info","$.VIE2.core#addToGlobalContext()","Adding new triple: '"+f+"'.");jQuery.VIE2.globalContext.add(f)});jQuery.VIE2.log("info","$.VIE2.core#addToGlobalContext()","Global context holds now "+jQuery.VIE2.globalContext.databank.triples().length+" triples!")};jQuery.VIE2.query=function(g,e,h,b,f){var a={};jQuery.VIE2.log("info","$.VIE2.query()","Start!");if(g===undefined||e===undefined){jQuery.VIE2.log("warn","$.VIE2.query()","Invoked 'query()' with undefined argument(s)!");h(a);return}else{if(!jQuery.isArray(e)){jQuery.VIE2.query(g,[e],h,b);return}}if(typeof g==="string"&&jQuery.isArray(e)){for(var c=0;c<e.length;c++){a[e[c]]=[]}if(!b||(b&&!b.cache==="nocache")){for(var c=0;c<e.length;c++){jQuery.VIE2.globalContext.where(jQuery.rdf.pattern(g,e[c],"?object",{namespaces:jQuery.VIE2.namespaces})).each(function(){a[e[c]].push(this.object)})}}if(b&&b.cache==="cacheonly"){h(a);return}var d=[];jQuery.each(jQuery.VIE2.connectors,function(){d.push(this.id)});jQuery.each(jQuery.VIE2.connectors,function(){jQuery.VIE2.log("info","$.VIE2.query()","Start with connector '"+this.id+"' for uri '"+g+"'!");var i=function(m,l,j,n,k){return function(o){jQuery.VIE2.log("info","$.VIE2.query()","Received query information from connector '"+m.id+"' for uri '"+l+"'!");jQuery.extend(true,j,o);removeElement(d,m.id);if(d.length===0){jQuery.each(j,function(q,p){for(var r=0;r<p.length;r++){jQuery.VIE2.globalContext.add(jQuery.rdf.triple(l,q,p[r],{namespaces:jQuery.VIE2.namespaces}))}});jQuery.VIE2.log("info","$.VIE2.query()","Finished task: 'query()' for uri '"+l+"'!");jQuery.VIE2.log("info","$.VIE2.query()","Global context now holds "+jQuery.VIE2.globalContext.databank.triples().length+" triples!");if(k){jQuery.VIE2.log("info","$.VIE2.query()","Local cache of element '"+k.data("vie2-id")+"' holds now "+k.vie2("option","localContext").databank.triples().length+" triples!")}console.log(j);n.call(j)}}}(this,g,a,h,f);this.query(g,e,jQuery.VIE2.namespaces,i)})}else{h(a)}};jQuery.VIE2.clearContext=function(){jQuery.VIE2.globalContext=jQuery.rdf({namespaces:jQuery.VIE2.namespaces})};VIE.EntityManager.initializeCollection();jQuery.VIE2.Backbone={};jQuery.VIE2.Collection=VIE.RDFEntityCollection.extend({add:function(b,a){VIE.RDFEntityCollection.prototype.add.call(this,b,a)},remove:function(b,a){VIE.RDFEntityCollection.prototype.remove.call(this,b,a)}});jQuery.VIE2.Entity=VIE.RDFEntity.extend({lookup:function(a){if(!jQuery.isArray(a)){this.lookup([a])}else{jQuery.VIE2.query(this.id,a,function(b){return function(){jQuery.each(a,function(c){b.trigger("change:"+a[c]);b.change()})}}(this))}},get:function(a){if(a==="id"){return VIE.RDFEntity.prototype.get.call(this,a)}return jQuery.VIE2.getFromGlobalContext(this.getSubject(),a)},set:function(a,c){if("id" in a){this.id=a.id}var b=this;jQuery.each(a,function(e,d){if(e!=="id"&&e!=="a"){jQuery.VIE2.removeFromGlobalContext(b.getSubject(),e);if(!jQuery.isArray(d)){d=[d]}jQuery.VIE2.addToGlobalContext(b.getSubject(),e,d);b.trigger("change:"+e)}else{var f={};f[e]=d;VIE.RDFEntity.prototype.set.call(b,f,c)}});this.change()},unset:function(b,a){jQuery.VIE2.removeFromGlobalContext(this.getSubject(),b);this.trigger("change:"+b);this.change()},destroy:function(a){VIE.RDFEntity.prototype.destroy.call(this,a)},clear:function(b){var a=this;jQuery.each(this.attributes,function(c){if(c!=="a"&&c!=="id"){a.unset(c)}})},fetch:function(a){VIE.RDFEntity.prototype.fetch.call(a)},save:function(a,b){VIE.RDFEntity.prototype.save.call(a,b)},validate:function(a){VIE.RDFEntity.prototype.validate.call(a)}});jQuery.VIE2.registerBackboneModel=function(a){$.VIE2.log("info","$.VIE2.registerBackboneModel()","Start!");if(VIE.EntityManager.getBySubject(a.id)!==undefined){$.VIE2.log("info","$.VIE2.registerBackboneModel()","Entity "+a.id+" already registered, no need to add it.");return}jQuery.each(jQuery.VIE2.Backbone,function(d,h){var f=false;jQuery.each(h.a,function(){if(jQuery.inArray(this.toString(),a.a)!==-1){f=true;return false}});if(f){var j=h.collection.model;var c=new j(a,{collection:h.collection});console.log("GGGGGGGGG3"+a.id);var g=c.getSubject();$.VIE2.log("info","$.VIE2.registerBackboneModel()","Registering a backbone model for '"+g+"'.");jQuery.each(a,function(i,e){if(i!=="id"){jQuery.VIE2.addToGlobalContext(g,i,e)}});VIE.EntityManager.registerModel(c);h.collection.add(c);jQuery.VIE2.log("info","VIE2.core#registerBackboneModel()","Added entity '"+g+"' to collection of type '"+d+"'!");var b=h.mapping;jQuery.VIE2.log("info","VIE2.core#registerBackboneModel()","Querying for default properties for entity '"+a.id+"': ["+b.defaultProps.join(", ")+"]!");jQuery.VIE2.query(c.getSubject(),b.defaultProps,function(k,i,e){return function(){jQuery.VIE2.log("info","VIE2.core#registerBackboneModel()","Finished querying for default properties for entity '"+k+"': ["+i.join(", ")+"]!");e.change()}}(c.getSubject(),b.defaultProps,c))}})};jQuery.VIE2.registerMapping=function(a){if(!jQuery.VIE2.Backbone[a.id]){jQuery.VIE2.log("info","VIE2.core#registerMapping()","Registered mapping '"+a.id+"'");var c={};jQuery.each(a.defaultProps,function(e){c[a.defaultProps[e]]=[]});var d=jQuery.VIE2.Entity.extend({defaults:c});var b=jQuery.VIE2.Collection.extend({model:d});jQuery.VIE2.Backbone[a.id]={a:(jQuery.isArray(a.types))?a.types:[a.types],collection:new b(),mapping:a};jQuery.VIE2.log("info","VIE2.core#registerMapping()","Registered mapping '"+a.id+"' finished!")}else{jQuery.VIE2.log("warn","VIE2.core#registerMapping()","Did not register mapping, as there isalready a mapping with the same id registered.")}};jQuery.VIE2.unregisterMapping=function(a){jQuery.VIE2.Backbone[a]=undefined};jQuery.VIE2.connectors={};jQuery.VIE2.registerConnector=function(a){if(!jQuery.VIE2.connectors[a.id]){jQuery.VIE2.connectors[a.id]=a;if(a._options.namespaces){jQuery.each(a._options.namespaces,function(c,b){jQuery.VIE2.globalContext.prefix(c,b)});$(".VIE2-vie2").vie2("option","namespaces",a._options.namespaces)}jQuery.VIE2.log("info","VIE2.core#registerConnector()","Registered connector '"+a.id+"'")}else{jQuery.VIE2.log("warn","VIE2.core#registerConnector()","Did not register connector, as there isalready a connector with the same id registered.")}};jQuery.VIE2.unregisterConnector=function(a){jQuery.VIE2.connectors[connector.id]=undefined};jQuery.VIE2.log=function(c,a,b){switch(c){case"info":console.info(a+" "+b);break;case"warn":console.warn(a+" "+b);break;case"error":console.error(a+" "+b);break}};jQuery(document).vie2();