Connector=function(b,a){if(b===undefined){throw"The connector constructor needs an 'id'!"}if(typeof b!=="string"){throw"The connector constructor needs an 'id' of type 'string'!"}this.id=b;this._options=(a)?a:{};jQuery.VIE2.registerConnector(this)};Connector.prototype.options=function(a){if(a){jQuery.extend(true,this._options,a)}else{return this._options}};Connector.prototype.analyze=function(a,b){jQuery.VIE2.log("info","VIE2.Connector("+this.id+")","Not implemented: analyze();");b(jQuery.rdf())};Connector.prototype.query=function(b,a,c,d){jQuery.VIE2.log("info","VIE2.Connector("+this.id+")","Not implemented: query();");d({})};Mapping=function(b,a){if(b===undefined){throw"The mapping constructor needs an 'id'!"}if(typeof b!=="string"){throw"The mapping constructor needs an 'id' of type 'string'!"}this.id=b;this._options=(a)?a:{};jQuery.VIE2.registerMapping(this)};Mapping.prototype.options=function(a){if(a){jQuery.extend(true,this._options,a)}else{return this._options}};Mapping.prototype.mapto=function(d,f){if(this.options().mapping){var e=this.options().mapping;var c=[];var b=d.filter(e.a);var a=[];jQuery.each(b,function(g){var h=b[g];jQuery.each(e,function(j,i){if(j!=="a"){var l=(jQuery.isArray(i))?i:[i];jQuery.each(l,function(k){var n=l[k];var m=h+"||"+n;a.push(m)})}})});jQuery.each(b,function(g){var h=b[g];var j={jsonld:{"#":d.options.namespaces,"@":h.toString(),a:[]}};c.push(j);jQuery.each(e,function(l,i){if(l!=="a"){j[l]=[];var m=(jQuery.isArray(i))?i:[i];jQuery.each(m,function(k){var o=m[k];j.jsonld[o]=[];var n=h+"||"+o;d.query(h,o,function(q,t,r,u){return function(){var p=this[u];jQuery.merge(t[r],p);jQuery.merge(t.jsonld[u],p);removeElement(a,q);if(a.length===0){f.call(c)}}}(n,j,l,o))})}})})}else{f({})}};(function(a,b){a.widget("VIE2.vie2",{options:{namespaces:{dbpedia:"http://dbpedia.org/resource/",dbprop:"http://dbpedia.org/property/",dbonto:"http://dbpedia.org/ontology/",rdf:"http://www.w3.org/1999/02/22-rdf-syntax-ns#",rdfs:"http://www.w3.org/2000/01/rdf-schema#",iks:"http://www.iks-project.eu/#",fise:"http://fise.iks-project.eu/ontology/",foaf:"http://xmlns.com/foaf/0.1/",dc:"http://purl.org/dc/terms/",geo:"http://www.w3.org/2003/01/geo/wgs84_pos#"},contextchanged:jQuery.noop},_create:function(){var c=this;jQuery.each(this.options.namespaces,function(e,d){c._cache.prefix(e,d)})},_setOption:function(c,d){if(c==="namespaces"){jQuery.extend(true,this.options.namespaces,d);jQuery.each(this.options.namespaces,function(f,e){this._cache.prefix(f,e)})}else{jQuery.Widget.prototype._setOption.apply(this,[c,d])}},_context:{},_cache:jQuery.rdf(),_matches:[],_oldMatches:[],analyze:function(e){jQuery.VIE2.log("info","VIE2.core","Start: analyze()!");var d=this;var c=[];jQuery.each(jQuery.VIE2.connectors,function(){c.push(this.id)});jQuery.each(jQuery.VIE2.connectors,function(){var f=function(h,g){return function(i){jQuery.each(h.options.namespaces,function(l,j){i.prefix(l,j);h._cache.prefix(l,j)});i.databank.triples().each(function(){h._cache.add(this)});h._context[g.id]=i;jQuery.VIE2.log("info","VIE2.core","Received RDF annotation from connector '"+g.id+"'!");removeElement(c,g.id);if(c.length===0){jQuery.VIE2.log("info","VIE2.core","Finished task: 'analyze()'! Cache holds now "+d._cache.databank.tripleStore.length+" triples!");d._trigger("contextchanged",null,{});e.call(d.element)}}}(d,this);jQuery.VIE2.log("info","VIE2.core","Starting analysis with connector: '"+this.id+"'!");this.analyze(d.element,f)})},filter:function(c){if(c===b){jQuery.VIE2.log("warn","VIE2.core","Invoked 'filter()' with undefined argument!")}else{if(typeof c==="string"||jQuery.isArray(c)){return this.filter({a:c})}else{var d=this;d._oldMatches=d._matches;d._matches=[];jQuery.each(c,function(f,e){e=(jQuery.isArray(e))?e:[e];jQuery.each(e,function(g){var h=e[g];d._cache.where("?subject "+f+" "+h).each(function(){d._matches.push(this.subject)})})});return d._matches}}},query:function(j,g,k,d){var c={};if(j===b||g===b){jQuery.VIE2.log("warn","VIE2.core","Invoked 'query()' with undefined argument(s)!");k(c);return}else{if(typeof g==="string"){this.query(j,[g],k,d);return}}if((j instanceof jQuery.rdf.blank||(j instanceof jQuery.rdf.resource&&j.type==="uri")||typeof j==="string")&&jQuery.isArray(g)){var h=this;for(var e=0;e<g.length;e++){c[g[e]]=[]}if(!d||(d&&!d.cache==="nocache")){for(var e=0;e<g.length;e++){h._cache.where(jQuery.rdf.pattern(j,g[e],"?object",{namespaces:h.options.namespaces})).each(function(){c[g[e]].push(this.object)})}}if(d&&d.cache==="cacheonly"){k(c);return}var f=[];jQuery.each(jQuery.VIE2.connectors,function(){f.push(this.id)});jQuery.each(jQuery.VIE2.connectors,function(){jQuery.VIE2.log("info","VIE2.core","Start 'query()' with connector '"+this.id+"' for uri '"+j+"'!");var i=function(q,n,m,o,l,p){return function(r){jQuery.VIE2.log("info","VIE2.core","Received query information from connector '"+n.id+"' for uri '"+m+"'!");jQuery.extend(true,l,r);removeElement(f,n.id);if(f.length===0){jQuery.each(l,function(t,s){for(var u=0;u<s.length;u++){h._cache.add(jQuery.rdf.triple(m,t,s[u],{namespaces:o}))}});jQuery.VIE2.log("info","VIE2.core","Finished task: 'query()' for uri '"+m+"'! Cache holds now "+h._cache.databank.tripleStore.length+" triples!");p.call(l)}}}(h,this,j,h.options.namespaces,c,k);this.query(j,g,h.options.namespaces,i)})}else{k(c)}},mapto:function(c,d){if(jQuery.VIE2.getMapping(c)){jQuery.VIE2.getMapping(c).mapto(this,d)}},matches:function(){return this._matches},context:function(c){if(this._context[c]){return this._context[c]}},undo:function(){this._matches=this._oldMatches;this._oldMatches=[];return this},clear:function(){this._matches=[];this._oldMatches=[];this._context={};this._cache=jQuery.rdf();return this}})}(jQuery));jQuery.VIE2.log=function(c,a,b){switch(c){case"info":console.info(a+" "+b);break;case"warn":console.warn(a+" "+b);break;case"error":console.error(a+" "+b);break}};jQuery.VIE2.connectors=[];jQuery.VIE2.registerConnector=function(a){var b=true;jQuery.each(jQuery.VIE2.connectors,function(){if(this.id===a.id){b=false;return false}});if(b){jQuery.VIE2.connectors.push(a);jQuery.VIE2.log("info","VIE2.core","Registered connector '"+a.id+"'")}else{jQuery.VIE2.log("warn","VIE2.core","Did not register connector, as there isalready a connector with the same id registered.")}};jQuery.VIE2.getConnector=function(b){var a=null;jQuery.each(jQuery.VIE2.connectors,function(){if(this.id===b){a=this;return false}});return a};jQuery.VIE2.unregisterConnector=function(b){var a=null;jQuery.each(jQuery.VIE2.connectors,function(){if(this.id===b){jQuery.VIE2.connectors.splice(index,1);jQuery.VIE2.log("info","VIE2.core","De-registered connector '"+a.id+"'");a=this;return false}});return a};jQuery.VIE2.mappings=[];jQuery.VIE2.registerMapping=function(a){var b=true;jQuery.each(jQuery.VIE2.mappings,function(){if(this.id===a.id){b=false;return}});if(b){jQuery.VIE2.mappings.push(a);jQuery.VIE2.log("info","VIE2.core","Registered mapping '"+a.id+"'")}else{jQuery.VIE2.log("warn","VIE2.core","Did not register mapping, as there isalready a mapping with the same id registered.")}};jQuery.VIE2.getMapping=function(b){var a=null;jQuery.each(jQuery.VIE2.mappings,function(){if(this.id===b){a=this;return false}});return a};jQuery.VIE2.unregisterMapping=function(b){var a=null;jQuery.each(jQuery.VIE2.mappings,function(c){if(this.id===b){jQuery.VIE2.mappings.splice(c,1);jQuery.VIE2.log("info","VIE2.core","De-registered mapping '"+a.id+"'");a=this;return}});return a};function removeElement(a,b){if(jQuery.isArray(a)){jQuery.each(a,function(c){if(a[c]===b){a.splice(c,1);return false}})}};