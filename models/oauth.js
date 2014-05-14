/** 
* This module is used for handling config for a OAuth-session to Github
*/


var githubOAuth = {
	
	getClientID: function() {
		return GITHUB_CLIENT_ID;
	},
	getClientSecret: function() {
		return GITHUB_CLIENT_SECRET;
	},
	getCallback: function() {
		return GITHUB_CALLBACK;
	}
};
module.exports = githubOAuth;