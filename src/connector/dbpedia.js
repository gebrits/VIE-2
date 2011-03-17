/**
 * @fileOverview VIE^2
 * @author <a href="mailto:sebastian.germesin@dfki.de">Sebastian Germesin</a>
 */


new Connector('dbpedia');

jQuery.VIE2.getConnector('dbpedia').query = function (uri, props, namespaces, callback) {
	if (uri instanceof jQuery.rdf.resource &&
			uri.type === 'uri') {
		this.query(uri.toString().replace(/^</, '').replace(/>$/, ''), props, namespaces, callback);
		return;
	}
	if (!jQuery.isArray(props)) {
		return this.query(uri, [props], namespaces, callback);
		return;
	}
	if (!uri.match(/^http\:\/\/dbpedia.org\/.*/)) {
		jQuery.VIE2.log ("warn", "VIE2.Connector('" + this.id + "')", "Query does not support the given URI!");
		callback({});
		return;
	}
	
	//initialize the returning object
	var ret = {};
	
	var url = uri.replace('resource', 'data') + ".jrdf";
	var c = function (data) {

		if (data && data.status === 200) {
			try {
				var json = jQuery.parseJSON(data.responseText);
				if (json) {
					var rdfc = jQuery.rdf().load(json);
					jQuery.each(namespaces, function(k, v) {
						rdfc.prefix(k, v);
					});
					
					for (var i=0; i < props.length; i++) {
						var prop = props[i];
						ret[prop] = [];
						
						rdfc
						.where(jQuery.rdf.pattern('<' + uri + '>', prop, '?object', { namespaces: namespaces}))
						.each(function () {
							ret[prop].push(this.object);
						});
					}
				}
			} catch (e) {
				jQuery.VIE2.log ("warn", "VIE2.Connector('dbpedia')", "Could not query for uri '" + uri + "' because of the following parsing error: '" + e.message + "'!");
			}
		}
		callback(ret);
	};
	
	this.queryDBPedia(url, c);
};

jQuery.VIE2.getConnector('dbpedia').queryDBPedia = function (url, callback) {
	var proxy = this.options().proxy_url;
	
	if (proxy) {
		jQuery.ajax({
			async: true,
			complete : callback,
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
			complete : callback,
			type: "GET",
			'url': url
		});
	}
};