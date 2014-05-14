var crypto = require('crypto');
var tokenHandler = {
	
	cache : [],

	get: function(client_request) {
		// we get the client request so we can check it
		// this should check for a client_token and return the real access_token
		// it should be fetched from memory - run redis?

		// check the header for the client key - X-Auth is a custom header
		var client_access_token = client_request.headers["X-Auth"];

		// ok check if its OK

		for(var item in cache) {
			if(item.client_access_token === client_access_token) {
				return item.access_token;
			}
		}
		return false;
		// error, 403, cant find, 403, expire
	},
	
	
	/**
	This is used for creating a new token  we dont wanna spread the
	real API-key
	*/
	set: function(access_token) {
		// this get the access_token from the outside and 
		// and hash it in a smart way
		// save the access_token:hashed_token
		// return the hashed_token

		// dont need crypting really
		var h = crypto.createHash('md5').update(access_token);
		
		// add it to the cache # TODO - update to redis or other caching stuff
		var o = {};
		o.client_access_token = h;
		o.access_token = access_token;
		cache.push(o);

		// return the hashed token to the client
		return h;
  			
  	}
};
module.exports = tokenHandler;