var Firebase = require('firebase')
var firebase = require('../../firebase')

var events = require('./firebase-events')

function hooksRef () {
	var auth = firebase.auth().currentUser
	return firebase.database().ref('hooks').child(auth.uid)
}

module.exports = {
	replace: true,
	template: require('./dashboard.html'),
	components: {
		hook: require('../../components/hook')
	},
	data: function () {
		return {
			hooks: null,
			events: events,
			// init form fields
			ref: null,
			token: null,
			event: events[0],
			url: null
		}
	},
	methods: {
		add: function (event) {
			// TODO: test input on live `new Firebase()` call to validate
			event.preventDefault()

			hooksRef().push({
				ref: this.ref,
				token: this.token && this.token !== '' ? this.token : null,
				event: this.event,
				url: this.url,
				created_at: Firebase.database.ServerValue.TIMESTAMP,
			}, function (err) {
				if (err) console.error('Could not add hook:', err)
			})

			this.ref = null
			this.token = null
			this.url = null
		},
		logout: function (event) {
			event.preventDefault()
			console.log('logging out')
			firebase.auth().signOut()
		}
	},
	created: function () {
		var self = this
		firebase.auth().onAuthStateChanged(function (authData) {
			self.hooks = null
			if (!authData) return

			console.log('fetching hooks')

			hooksRef().on('value', function (snapshot) {
				console.log('got hooks', snapshot.val())
				var hooks = []

				snapshot.forEach(function (hook){
					var val = hook.val()
					// add full reference path to hook data
					val.id = hook.ref.toString()
					hooks.push(val)
				})

				self.hooks = hooks
			}, function (err) {
				console.error('Could not get hooks:', err)
			})
		})
	}
}
