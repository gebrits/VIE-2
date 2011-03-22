$(function() {
	//Set up VIE^2
	$.VIE2.getConnector('dbpedia').options({
        "proxy_url" : "../../utils/proxy/proxy.php"
    });
	
	//Set up Flickr API...
	FLICKR_BASE = "http://api.flickr.com/services/rest/";
	FLICKR_API_KEY = "ffd6f2fc41249feeddd8e62a531dc83e";
	JSONP_TAIL = "&extras=url_o&format=json&jsoncallback=?";
	
	//Make RDFa elements drag'n'droppable
    $('[about]')
    .hover(function () {$(this).css('cursor', 'move');}, function () {$(this).css('cursor', 'auto');})
    .draggable({cursor: 'move', opacity: 0.35, revert: true, helper: 'original'});
    
    //Initialize Widgets
    $('.widget').droppable({
        accept: '[about]', 
        hoverClass: 'drophover', 
        drop: function (event) {
        	$('#results').empty();
            $(event.srcElement)
            .vie2().vie2('analyze', function () {
                var that = $(this);
                var mapping = getMappingType (that);
		        that.vie2('mapto', mapping, function () {
                    var entities = this;
                    $.each(entities, function (i, entity) {
                    	if (entity.a === 'place' && entity.lat[0] && entity.long[0]) {
		                    //search Flickr for lat/long coordinates
                    		findPhotosByLatLong(entity.lat[0].value, entity.long[0].value, flickrCallback);
	                    } else if (entity.a === 'organization') {
	                    	if (entity.flickr[0]) {
	                    		debugger;
	                    	}
	                    } else {
	                    	debugger;
	                    }
                    });
                });
            });
        }
  });
});
    
function flickrCallback (data) {
	if (data.stat === 'ok') {
	    $('#result').show();
		$.each(data.photos.photo, function (ip, photo) {
			if (ip > 20) { //only show first 20 photos!
				return false;
			}
			
			var imgT = $('<img src="http://farm' + 
					photo.farm + '.static.flickr.com/' + 
					photo.server + '/' + 
					photo.id + '_' + 
					photo.secret + '_t.jpg" />');
			
			var imgZ = 'http://farm' + 
					photo.farm + '.static.flickr.com/' + 
					photo.server + '/' + 
					photo.id + '_' + 
					photo.secret + '_z.jpg';
			
			var anchor = $('<a href="' + imgZ + '"></a>').append(imgT).lightBox();
			
			$('#results').append(anchor);
		});
	}
}

function findPhotosByUserName (name, callback) {

	var url = FLICKR_BASE + "?method=flickr.places.findByLatLon" + "&api_key=" + FLICKR_API_KEY;
	url += "&lat=" + lat + "&lon=" + long;
	url += JSONP_TAIL;

	$.getJSON(url, function (data) {
		if (data.stat === 'ok') {
			if (data.places.total > 0) {
				var acc = data.places.accuracy;

				//only take the first one!
				/*var place = {
                 lat : data.places.place[0].latitude,
                 lon : data.places.place[0].longitude,
                 name : data.places.place[0].name,
                 place_id : data.places.place[0].place_id,
                 woeid : data.places.place[0].woeid
                 }*/
				var ts = Math.round((new Date()).getTime() / 1000);
				var minUploadDate = ts - 604800; // last week
				var url2 = FLICKR_BASE + "?method=flickr.photos.search" + "&api_key=" + FLICKR_API_KEY;
				url2 += "&place_id=" + data.places.place[0].place_id + "&min_date_upload=" + minUploadDate;
				url2 += JSONP_TAIL;

				$.getJSON(url2, callback);
			}
			else {
				console.error("FOUND NO PLACES!");
			}
		}
	});
};

function findPhotosByLatLong (lat, long, callback) {

	var url = FLICKR_BASE + "?method=flickr.places.findByLatLon" + "&api_key=" + FLICKR_API_KEY;
	url += "&lat=" + lat + "&lon=" + long;
	url += JSONP_TAIL;

	$.getJSON(url, function (data) {
		if (data.stat === 'ok') {
			if (data.places.total > 0) {
				var acc = data.places.accuracy;

				//only take the first one!
				/*var place = {
                 lat : data.places.place[0].latitude,
                 lon : data.places.place[0].longitude,
                 name : data.places.place[0].name,
                 place_id : data.places.place[0].place_id,
                 woeid : data.places.place[0].woeid
                 }*/
				var ts = Math.round((new Date()).getTime() / 1000);
				var minUploadDate = ts - 604800; // last week
				var url2 = FLICKR_BASE + "?method=flickr.photos.search" + "&api_key=" + FLICKR_API_KEY;
				url2 += "&place_id=" + data.places.place[0].place_id + "&min_date_upload=" + minUploadDate;
				url2 += JSONP_TAIL;

				$.getJSON(url2, callback);
			}
			else {
				console.error("FOUND NO PLACES!");
			}
		}
	});
};

function getMappingType (elem) {
	var uris = $(elem).vie2('filter', ['foaf:Person', 'dbonto:Person']);
	if (uris.length) {
		return "person";
	}
	var uris = $(elem).vie2('filter', '<http://dbpedia.org/class/yago/Roadsters>');
	if (uris.length) {
		return "car";
	}
	var uris = $(elem).vie2('filter', 'dbonto:Place');
	if (uris.length) {
		return "place";
	}
	var uris = $(elem).vie2('filter', 'google:Organization');
	if (uris.length) {
		return "organization";
	}
	return "";
}