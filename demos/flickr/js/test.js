
(function($, undefined) {

    $.widget('X.example', {
    	
    	// default options
    	options: {
        	_bla: []
    	},
    	
    	_create: function () {
    		console.log("CREATE!");
    	},
    	
    	_init: function() {
    		console.log("INIT!");
    	},
    	
    	germi: function () {
    		console.log(this.options._bla.length);
    		console.log($(':X-example'));
    		this.options._bla.push("adwda");
    		console.log(this.options._bla.length);
    		console.log(this.options._bla);
    	}
    	
    	
		
	});
}(jQuery));