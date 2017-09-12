var firebase = require('firebase')

var config = {
	apiKey: "AIzaSyCFlJrgkRzseETnVyQVvXSAics01ZBFs_4",
	authDomain: "webhooks-kunst-cloud.firebaseapp.com",
	databaseURL: "https://webhooks-kunst-cloud.firebaseio.com",
	projectId: "webhooks-kunst-cloud",
	storageBucket: "webhooks-kunst-cloud.appspot.com",
	messagingSenderId: "548647044065",
}

module.exports = firebase.initializeApp(config)
