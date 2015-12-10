var UtilsModule = (function(module){

	module.matrix = function(numrows, numcols, initial){
	   var arr = [];
	   for (var i = 0; i < numrows; ++i){
	      var columns = [];
	      for (var j = 0; j < numcols; ++j){
	         columns[j] = initial;
	      }
	      arr[i] = columns;
	    }
	    return arr;
	}

	/* Drag&Drop / File loading / parsing */

	getAsText = function(readFile) {	        
		var reader = new FileReader(); 	        
		reader.readAsText(readFile, "UTF-8");	  
		reader.onload = loaded;
	}

	loaded = function(evt) {  
	  	var fileString = evt.target.result;
		module.EventBus.publish('dataLoaded', fileString);
	}	

	module.handleFileSelect = function(evt) {
		evt.stopPropagation();
		evt.preventDefault();

		var files = evt.dataTransfer.files;
		var file = files[0];
		if(file){
			module.EventBus.publish('newInput', file.name);
			getAsText(file);
		}
	}

	module.handleDragOver = function(evt) {
		evt.stopPropagation();
		evt.preventDefault();
		evt.dataTransfer.dropEffect = 'copy';
	}

	/* EventBus pub/sub */
	module.EventBus = {
	  topics: {},

	  subscribe: function(topic, listener) {
	    // create the topic if not yet created
	    if(!this.topics[topic]) this.topics[topic] = [];

	    // add the listener
	    this.topics[topic].push(listener);
	  },

	  publish: function(topic, data) {
	    // return if the topic doesn't exist, or there are no listeners
	    if(!this.topics[topic] || this.topics[topic].length < 1) return;

	    // send the event to all listeners
	    this.topics[topic].forEach(function(listener) {
	      listener(data || {});
	    });
	  }
	};

	return module;
})(UtilsModule || {});