var firebase = require('firebase')
var request = require('superagent')
var admin = require('firebase-admin')
var { URL } = require('url')

const {FIREBASE_SERVICE_ACCOUNT_JSON, FIREBASE_URL} = process.env

if(!FIREBASE_SERVICE_ACCOUNT_JSON || !FIREBASE_URL){
	console.error('wrong env')
	process.exit(1)
}
var parsed = JSON.parse(FIREBASE_SERVICE_ACCOUNT_JSON)
var serviceAccount = Object.assign({}, parsed, {private_key: parsed.private_key.replace(/\\n/g, '\n')})


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: FIREBASE_URL,
})

var db = admin.database()
db.ref('/').once('value', () => bindUsers(db.ref('hooks')), err => {throw err})

var hooks = {}

function bindUsers (ref) {
	ref.on('child_added', function (snapshot) {
		console.log('Got user', snapshot.key)
		bindHooks(snapshot.ref)
	}, function (err) {
		console.error(err)
	})
}

function bindHooks (ref) {
	ref.on('child_added', function (snapshot) {
		console.log('Got hook', snapshot.val())
		bindHook(snapshot)
	}, function (err) {
		console.error(err)
	})

	ref.on('child_removed', function (snapshot) {
		console.log('Hook removed', snapshot.val())
		unbindHook(snapshot)
	}, function (err) {
		console.error(err)
	})
}

function unbindHook (hook) {
	var id = hook.ref.toString()
	var unhook = hooks[id]
	if (!unhook) return console.log('no unhook for:', id)

	console.log('unbinding:', id)
	unhook()
}

function bindHook (hook) {
	var id = hook.ref.toString()
	var opts = hook.val()

	function update (lastResponse) {
		hook.ref.update({
			updated_at: admin.database.ServerValue.TIMESTAMP,
			last_response: lastResponse,
			has_error: !!lastResponse.error
		}, function (err) {
			if (err) return console.error('Could not update hook with last response')
		})
	}

	try {
		var url = new URL(opts.ref)
		var app = null

		try{
			app = firebase.initializeApp({databaseURL: url.origin}, url.origin)
		}catch(err){
			console.log('Could not create app', err)
		}
		app = app || firebase.app(url.origin)
		var ref = app.database().ref(url.pathname)
	}
	catch (err) {
		console.error('Could not create ref:', opts.ref, err)
		update({
			message: 'Could not create Firebase reference from provided URL.',
			error: err.message
		})
		return
	}

	function bind () {
		if (hooks[id]) return console.log('already bound:', id)

		console.log('binding:', id)
		var handler = ref.on(opts.event, function (snapshot, prev) {
			var payload = {
				event: {
					ref: opts.ref,
					type: opts.event
				},
				ref: snapshot.ref.toString(),
				key: snapshot.key,
				previous: prev,
				value: snapshot.exportVal()
			}

			console.log('sending...', opts.url, payload)

			request
				.post(opts.url)
				.send(payload)
				.end(function (err, res) {
					if (err) {
						console.error('Could not POST payload:', opts.url, err)
						update({
							message: 'Could not POST payload to provided URL.',
							error: err.message
						})
						return
					}

					console.log('POSTed payload:', res.status, opts.url)

					if (res.error) {
						update({
							message: 'Payload URL returned a 4xx or 5xx response.',
							error: res.error.message,
							status: res.status
						})
						return
					}

					update({
						message: 'Success!',
						status: res.status
					})
				})
		})

		hooks[id] = function () {
			ref.off(opts.event, handler)
		}
		console.log(hooks)
	}

	bind()
}
