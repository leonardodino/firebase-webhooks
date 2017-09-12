var Firebase = require('firebase')
var firebase = require('../../firebase')

module.exports = {
	replace: true,
	template: require('./login.html'),
	methods: {
		login: function (event) {
			event.preventDefault()
			var provider = new Firebase.auth.GithubAuthProvider();

			firebase.auth().signInWithPopup(provider)
				.then(function (auth) {
					firebase.database().ref('users').child(auth.user.uid).update({
						updated_at: Firebase.database.ServerValue.TIMESTAMP,
					})
				})
				.catch(function (err) {
					if (err) {
						console.log('Login failed:', err)
						alert('Login failed.\n\n' + err.message)
					}
				})
		}
	}
}
