/*
 * Copyright 2011 Sebastian Germesin, DFKI GmbH
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

/**
 * @fileOverview Aviate JS
 * @author <a href="mailto:sebastian.germesin@dfki.de">Sebastian Germesin</a>
 * @copyright (c) 2011 DFKI GmbH
 * @license Apache License, Version 2.0 (LICENSE.txt)
 */


var dbpediaConnector = new Connector('dbpedia', {
	"proxy_url" : "../../utils/proxy/proxy.php"
});

dbpediaConnector.query = function (uri, props) {
	var ret = {};
	var proxy = this.options.proxy_url;
	
	if (!uri.value._string.match(/^http\:\/\/dbpedia.org\/.*/)) {
		jQuery.Aviate.log ("warn", "Aviate.Connector('" + this.id + "')", "Query does not support the given URI!");
	}
	var url = uri.value._string.replace('resource', 'data') + ".jrdf";
	
	var callback = function (data) {
		debugger;
		if (data.status === 200) {
			var json = jQuery.parseJSON(data.responseText);
			var rdfc = jQuery.rdf().load(json);
			
			var rdf_small = rdfc.about(uri);
			
			for (var j = 0; j < props.length; j++) {
				var prop = props[j];
				ret[prop] = [];
				for (var i = 0; i < rdf_small.length; i++) {
					var p = rdf_small[i].property;
					var val = rdf_small[i].value;
					if (p === prop) {
						ret[prop].push(val);
					}
				}
			}
		}
		//TODO: this returns at the wrong position!!
		return ret;
	};
	
	if (proxy) {
		jQuery.ajax({
			async: true,
			success : callback,
			type: "POST",
			url: proxy,
			data: {
    			proxy_url: url, 
    			content: "",
    			verb: "GET"
			}
		});
	} else {
		data = jQuery.ajax({
			async: true,
			success : callback,
			type: "GET",
			'url': url
		});
	}
};