var request = require("request");
var githubProxy = {
	base_url: "https://api.github.com/",

	
	/**
	*	This is a function for proxy all call to github	
	*	@param callback : This is a callback function you want the result back in
	*	@param urlPath : Tha github API specific path (not included by base_url)
	*	@param params : optional extra querystrings (if mor include the & )
	*/
	proxyCall: function(access_token, callback, urlPath, params) {
  		
		
	 	var url = this.base_url + urlPath +"?access_token="+access_token;
		if(params && params.length > 0) {
			url += +"&" +params;
		} 
	 	//console.log("Calling url: " +url);  
  	 	var options = {
  	    	url: url,
  	      	headers: {'User-Agent': 'thajo@lnu.se, githubHandler v.0.1' }
		};
     	
		function internCallback(error, response, body) {
			//console.log("Called internCallback");
     		if (!error && response.statusCode == 200) {
     	          callback(JSON.parse(body), null);
     		}
   		  	else {
   			  callback(null, 
   				  JSON.parse("{'error': 'There was an error in the call'}, {'status':" +response.statusCode +"}"));
   		  	}
     	  	
   		}
		request(options, internCallback);	
  	}
};
module.exports = githubProxy;