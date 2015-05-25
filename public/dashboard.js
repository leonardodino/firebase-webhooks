(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = '<div v-component="{{ view }}"></div>\n';
},{}],2:[function(require,module,exports){
var firebase = require('./firebase')

module.exports = {
	template: require('./app.html'),
	components: {
		login: require('./views/login'),
		dashboard: require('./views/dashboard')
	},
	data: {
		view: null
	},
	created: function () {
		firebase.onAuth(function (authData) {
			this.view = authData ? 'dashboard' : 'login'
		}, this)
	}
}

},{"./app.html":1,"./firebase":3,"./views/dashboard":6,"./views/login":7}],3:[function(require,module,exports){
var Firebase = require('firebase')

module.exports = new Firebase('https://webhooks.firebaseio.com')

},{"firebase":9}],4:[function(require,module,exports){
module.exports = '<div class="container">\n	<div class="panel panel-default">\n		<div class="panel-heading">\n			<h3 class="panel-title">Add a webhook</h3>\n		</div>\n		<div class="panel-body">\n			<form v-on="submit: add($event)" class="form-inline">\n				<samp>new Firebase("</samp>\n				<input v-model="ref" type="text" class="form-control input-sm" placeholder="https://example.firebaseio.com/" required>\n				<samp>").auth("</samp>\n				<input v-model="token" type="text" class="form-control input-sm" placeholder="token or secret">\n				<samp>").on("</samp>\n				<select v-model="event" options="events" class="form-control input-sm" required></select>\n				<samp>")</samp>\n				<span class="glyphicon glyphicon-chevron-right"></span>\n				<input v-model="url" type="text" class="form-control input-sm" placeholder="https://example.com/hooks/firebase" required>\n				<button type="submit" class="btn btn-sm btn-primary">Save</button>\n			</form>\n		</div>\n	</div>\n\n	<div v-repeat="hook: hooks" class="panel panel-default">\n		<div class="panel-body">\n			<button v-on="click: remove($event, hook.id)" type="button" class="close">&times;</button>\n\n			<span v-if="!hook.last_call" class="text-muted glyphicon glyphicon-time"></span>\n			<span v-if="hook.last_status >= 200 && hook.last_status <= 299" class="text-success glyphicon glyphicon-ok-sign"></span>\n			<span v-if="hook.last_status < 200 || hook.last_status > 299" class="text-danger glyphicon glyphicon-exclamation-sign"></span>\n\n			<samp>new Firebase("{{ hook.ref }}").on("{{ hook.event }}")</samp>\n			<span class="glyphicon glyphicon-chevron-right"></span>\n			<samp>{{ hook.url }}</samp>\n		</div>\n	</div>\n</div>\n';
},{}],5:[function(require,module,exports){
module.exports = [
	'value',
	'child_added',
	'child_changed',
	'child_removed',
	'child_moved'
]

},{}],6:[function(require,module,exports){
var Firebase = require('firebase')
var firebase = require('../../firebase')

var events = require('./firebase-events')

function hooksRef () {
	var auth = firebase.getAuth()
	return firebase.child('hooks').child(auth.uid)
}

module.exports = {
	template: require('./dashboard.html'),
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
				created_at: Firebase.ServerValue.TIMESTAMP
			}, function (err) {
				if (err) console.error('Could not add hook:', err)
			})

			this.ref = null
			this.token = null
			this.url = null
		},
		remove: function (event, ref) {
			event.preventDefault()

			new Firebase(ref).remove(function (err) {
				if (err) console.error('Could not remove hook:', err)
			})
		}
	},
	created: function () {
		var auth = firebase.getAuth()

		hooksRef().on('value', function (snapshot) {
			var hooks = []

			snapshot.forEach(function (hook) {
				var val = hook.val()

				hooks.push({
					id: hook.ref().toString(),
					ref: val.ref,
					event: val.event,
					url: val.url,
					last_call: val.called_at,
					last_status: val.response_status
				})
			})

			this.hooks = hooks
		}, function (err) {
			console.error('Could not get hooks:', err)
		}, this)
	}
}

},{"../../firebase":3,"./dashboard.html":4,"./firebase-events":5,"firebase":9}],7:[function(require,module,exports){
var firebase = require('../../firebase')

// TODO: store logins

module.exports = {
	template: require('./login.html'),
	methods: {
		login: function (event) {
			event.preventDefault()

			firebase.authWithOAuthPopup('github', function (err, authData) {
				if (err) {
					console.log('Login failed:', err)
					alert('Login failed.\n\n' + err.message)
				}
			})
		}
	}
}

},{"../../firebase":3,"./login.html":8}],8:[function(require,module,exports){
module.exports = '<div class="container">\n	<div class="row">\n		<div class="col-md-6 col-md-offset-3">\n			<div class="jumbotron text-center">\n				<h1>Webhooks for Firebase</h1>\n				<br>\n				<p>\n					<button v-on="click: login($event)" type="button" class="btn btn-lg btn-primary">\n						Log in with GitHub\n					</button>\n				</p>\n			</div>\n		</div>\n	</div>\n</div>\n';
},{}],9:[function(require,module,exports){
/*! @license Firebase v2.2.5
    License: https://www.firebase.com/terms/terms-of-service.html */
(function() {var h,aa=this;function n(a){return void 0!==a}function ba(){}function ca(a){a.ub=function(){return a.tf?a.tf:a.tf=new a}}
function da(a){var b=typeof a;if("object"==b)if(a){if(a instanceof Array)return"array";if(a instanceof Object)return b;var c=Object.prototype.toString.call(a);if("[object Window]"==c)return"object";if("[object Array]"==c||"number"==typeof a.length&&"undefined"!=typeof a.splice&&"undefined"!=typeof a.propertyIsEnumerable&&!a.propertyIsEnumerable("splice"))return"array";if("[object Function]"==c||"undefined"!=typeof a.call&&"undefined"!=typeof a.propertyIsEnumerable&&!a.propertyIsEnumerable("call"))return"function"}else return"null";
else if("function"==b&&"undefined"==typeof a.call)return"object";return b}function ea(a){return"array"==da(a)}function fa(a){var b=da(a);return"array"==b||"object"==b&&"number"==typeof a.length}function p(a){return"string"==typeof a}function ga(a){return"number"==typeof a}function ha(a){return"function"==da(a)}function ia(a){var b=typeof a;return"object"==b&&null!=a||"function"==b}function ja(a,b,c){return a.call.apply(a.bind,arguments)}
function ka(a,b,c){if(!a)throw Error();if(2<arguments.length){var d=Array.prototype.slice.call(arguments,2);return function(){var c=Array.prototype.slice.call(arguments);Array.prototype.unshift.apply(c,d);return a.apply(b,c)}}return function(){return a.apply(b,arguments)}}function q(a,b,c){q=Function.prototype.bind&&-1!=Function.prototype.bind.toString().indexOf("native code")?ja:ka;return q.apply(null,arguments)}var la=Date.now||function(){return+new Date};
function ma(a,b){function c(){}c.prototype=b.prototype;a.Zg=b.prototype;a.prototype=new c;a.prototype.constructor=a;a.Vg=function(a,c,f){for(var g=Array(arguments.length-2),k=2;k<arguments.length;k++)g[k-2]=arguments[k];return b.prototype[c].apply(a,g)}};function r(a,b){for(var c in a)b.call(void 0,a[c],c,a)}function na(a,b){var c={},d;for(d in a)c[d]=b.call(void 0,a[d],d,a);return c}function oa(a,b){for(var c in a)if(!b.call(void 0,a[c],c,a))return!1;return!0}function pa(a){var b=0,c;for(c in a)b++;return b}function qa(a){for(var b in a)return b}function ra(a){var b=[],c=0,d;for(d in a)b[c++]=a[d];return b}function sa(a){var b=[],c=0,d;for(d in a)b[c++]=d;return b}function ta(a,b){for(var c in a)if(a[c]==b)return!0;return!1}
function ua(a,b,c){for(var d in a)if(b.call(c,a[d],d,a))return d}function va(a,b){var c=ua(a,b,void 0);return c&&a[c]}function wa(a){for(var b in a)return!1;return!0}function xa(a){var b={},c;for(c in a)b[c]=a[c];return b}var ya="constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");
function za(a,b){for(var c,d,e=1;e<arguments.length;e++){d=arguments[e];for(c in d)a[c]=d[c];for(var f=0;f<ya.length;f++)c=ya[f],Object.prototype.hasOwnProperty.call(d,c)&&(a[c]=d[c])}};function Aa(a){a=String(a);if(/^\s*$/.test(a)?0:/^[\],:{}\s\u2028\u2029]*$/.test(a.replace(/\\["\\\/bfnrtu]/g,"@").replace(/"[^"\\\n\r\u2028\u2029\x00-\x08\x0a-\x1f]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,"]").replace(/(?:^|:|,)(?:[\s\u2028\u2029]*\[)+/g,"")))try{return eval("("+a+")")}catch(b){}throw Error("Invalid JSON string: "+a);}function Ba(){this.Pd=void 0}
function Ca(a,b,c){switch(typeof b){case "string":Da(b,c);break;case "number":c.push(isFinite(b)&&!isNaN(b)?b:"null");break;case "boolean":c.push(b);break;case "undefined":c.push("null");break;case "object":if(null==b){c.push("null");break}if(ea(b)){var d=b.length;c.push("[");for(var e="",f=0;f<d;f++)c.push(e),e=b[f],Ca(a,a.Pd?a.Pd.call(b,String(f),e):e,c),e=",";c.push("]");break}c.push("{");d="";for(f in b)Object.prototype.hasOwnProperty.call(b,f)&&(e=b[f],"function"!=typeof e&&(c.push(d),Da(f,c),
c.push(":"),Ca(a,a.Pd?a.Pd.call(b,f,e):e,c),d=","));c.push("}");break;case "function":break;default:throw Error("Unknown type: "+typeof b);}}var Ea={'"':'\\"',"\\":"\\\\","/":"\\/","\b":"\\b","\f":"\\f","\n":"\\n","\r":"\\r","\t":"\\t","\x0B":"\\u000b"},Fa=/\uffff/.test("\uffff")?/[\\\"\x00-\x1f\x7f-\uffff]/g:/[\\\"\x00-\x1f\x7f-\xff]/g;
function Da(a,b){b.push('"',a.replace(Fa,function(a){if(a in Ea)return Ea[a];var b=a.charCodeAt(0),e="\\u";16>b?e+="000":256>b?e+="00":4096>b&&(e+="0");return Ea[a]=e+b.toString(16)}),'"')};function Ga(){return Math.floor(2147483648*Math.random()).toString(36)+Math.abs(Math.floor(2147483648*Math.random())^la()).toString(36)};var Ha;a:{var Ia=aa.navigator;if(Ia){var Ja=Ia.userAgent;if(Ja){Ha=Ja;break a}}Ha=""};function Ka(){this.Wa=-1};function La(){this.Wa=-1;this.Wa=64;this.R=[];this.le=[];this.Tf=[];this.Id=[];this.Id[0]=128;for(var a=1;a<this.Wa;++a)this.Id[a]=0;this.be=this.$b=0;this.reset()}ma(La,Ka);La.prototype.reset=function(){this.R[0]=1732584193;this.R[1]=4023233417;this.R[2]=2562383102;this.R[3]=271733878;this.R[4]=3285377520;this.be=this.$b=0};
function Ma(a,b,c){c||(c=0);var d=a.Tf;if(p(b))for(var e=0;16>e;e++)d[e]=b.charCodeAt(c)<<24|b.charCodeAt(c+1)<<16|b.charCodeAt(c+2)<<8|b.charCodeAt(c+3),c+=4;else for(e=0;16>e;e++)d[e]=b[c]<<24|b[c+1]<<16|b[c+2]<<8|b[c+3],c+=4;for(e=16;80>e;e++){var f=d[e-3]^d[e-8]^d[e-14]^d[e-16];d[e]=(f<<1|f>>>31)&4294967295}b=a.R[0];c=a.R[1];for(var g=a.R[2],k=a.R[3],l=a.R[4],m,e=0;80>e;e++)40>e?20>e?(f=k^c&(g^k),m=1518500249):(f=c^g^k,m=1859775393):60>e?(f=c&g|k&(c|g),m=2400959708):(f=c^g^k,m=3395469782),f=(b<<
5|b>>>27)+f+l+m+d[e]&4294967295,l=k,k=g,g=(c<<30|c>>>2)&4294967295,c=b,b=f;a.R[0]=a.R[0]+b&4294967295;a.R[1]=a.R[1]+c&4294967295;a.R[2]=a.R[2]+g&4294967295;a.R[3]=a.R[3]+k&4294967295;a.R[4]=a.R[4]+l&4294967295}
La.prototype.update=function(a,b){if(null!=a){n(b)||(b=a.length);for(var c=b-this.Wa,d=0,e=this.le,f=this.$b;d<b;){if(0==f)for(;d<=c;)Ma(this,a,d),d+=this.Wa;if(p(a))for(;d<b;){if(e[f]=a.charCodeAt(d),++f,++d,f==this.Wa){Ma(this,e);f=0;break}}else for(;d<b;)if(e[f]=a[d],++f,++d,f==this.Wa){Ma(this,e);f=0;break}}this.$b=f;this.be+=b}};var t=Array.prototype,Na=t.indexOf?function(a,b,c){return t.indexOf.call(a,b,c)}:function(a,b,c){c=null==c?0:0>c?Math.max(0,a.length+c):c;if(p(a))return p(b)&&1==b.length?a.indexOf(b,c):-1;for(;c<a.length;c++)if(c in a&&a[c]===b)return c;return-1},Oa=t.forEach?function(a,b,c){t.forEach.call(a,b,c)}:function(a,b,c){for(var d=a.length,e=p(a)?a.split(""):a,f=0;f<d;f++)f in e&&b.call(c,e[f],f,a)},Pa=t.filter?function(a,b,c){return t.filter.call(a,b,c)}:function(a,b,c){for(var d=a.length,e=[],f=0,g=p(a)?
a.split(""):a,k=0;k<d;k++)if(k in g){var l=g[k];b.call(c,l,k,a)&&(e[f++]=l)}return e},Qa=t.map?function(a,b,c){return t.map.call(a,b,c)}:function(a,b,c){for(var d=a.length,e=Array(d),f=p(a)?a.split(""):a,g=0;g<d;g++)g in f&&(e[g]=b.call(c,f[g],g,a));return e},Ra=t.reduce?function(a,b,c,d){for(var e=[],f=1,g=arguments.length;f<g;f++)e.push(arguments[f]);d&&(e[0]=q(b,d));return t.reduce.apply(a,e)}:function(a,b,c,d){var e=c;Oa(a,function(c,g){e=b.call(d,e,c,g,a)});return e},Sa=t.every?function(a,b,
c){return t.every.call(a,b,c)}:function(a,b,c){for(var d=a.length,e=p(a)?a.split(""):a,f=0;f<d;f++)if(f in e&&!b.call(c,e[f],f,a))return!1;return!0};function Ta(a,b){var c=Ua(a,b,void 0);return 0>c?null:p(a)?a.charAt(c):a[c]}function Ua(a,b,c){for(var d=a.length,e=p(a)?a.split(""):a,f=0;f<d;f++)if(f in e&&b.call(c,e[f],f,a))return f;return-1}function Va(a,b){var c=Na(a,b);0<=c&&t.splice.call(a,c,1)}function Wa(a,b,c){return 2>=arguments.length?t.slice.call(a,b):t.slice.call(a,b,c)}
function Xa(a,b){a.sort(b||Ya)}function Ya(a,b){return a>b?1:a<b?-1:0};var Za=-1!=Ha.indexOf("Opera")||-1!=Ha.indexOf("OPR"),$a=-1!=Ha.indexOf("Trident")||-1!=Ha.indexOf("MSIE"),ab=-1!=Ha.indexOf("Gecko")&&-1==Ha.toLowerCase().indexOf("webkit")&&!(-1!=Ha.indexOf("Trident")||-1!=Ha.indexOf("MSIE")),bb=-1!=Ha.toLowerCase().indexOf("webkit");
(function(){var a="",b;if(Za&&aa.opera)return a=aa.opera.version,ha(a)?a():a;ab?b=/rv\:([^\);]+)(\)|;)/:$a?b=/\b(?:MSIE|rv)[: ]([^\);]+)(\)|;)/:bb&&(b=/WebKit\/(\S+)/);b&&(a=(a=b.exec(Ha))?a[1]:"");return $a&&(b=(b=aa.document)?b.documentMode:void 0,b>parseFloat(a))?String(b):a})();var cb=null,db=null,eb=null;function fb(a,b){if(!fa(a))throw Error("encodeByteArray takes an array as a parameter");gb();for(var c=b?db:cb,d=[],e=0;e<a.length;e+=3){var f=a[e],g=e+1<a.length,k=g?a[e+1]:0,l=e+2<a.length,m=l?a[e+2]:0,v=f>>2,f=(f&3)<<4|k>>4,k=(k&15)<<2|m>>6,m=m&63;l||(m=64,g||(k=64));d.push(c[v],c[f],c[k],c[m])}return d.join("")}
function gb(){if(!cb){cb={};db={};eb={};for(var a=0;65>a;a++)cb[a]="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".charAt(a),db[a]="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_.".charAt(a),eb[db[a]]=a,62<=a&&(eb["ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".charAt(a)]=a)}};function u(a,b){return Object.prototype.hasOwnProperty.call(a,b)}function w(a,b){if(Object.prototype.hasOwnProperty.call(a,b))return a[b]}function hb(a,b){for(var c in a)Object.prototype.hasOwnProperty.call(a,c)&&b(c,a[c])}function ib(a){var b={};hb(a,function(a,d){b[a]=d});return b};function jb(a){var b=[];hb(a,function(a,d){ea(d)?Oa(d,function(d){b.push(encodeURIComponent(a)+"="+encodeURIComponent(d))}):b.push(encodeURIComponent(a)+"="+encodeURIComponent(d))});return b.length?"&"+b.join("&"):""}function kb(a){var b={};a=a.replace(/^\?/,"").split("&");Oa(a,function(a){a&&(a=a.split("="),b[a[0]]=a[1])});return b};function x(a,b,c,d){var e;d<b?e="at least "+b:d>c&&(e=0===c?"none":"no more than "+c);if(e)throw Error(a+" failed: Was called with "+d+(1===d?" argument.":" arguments.")+" Expects "+e+".");}function z(a,b,c){var d="";switch(b){case 1:d=c?"first":"First";break;case 2:d=c?"second":"Second";break;case 3:d=c?"third":"Third";break;case 4:d=c?"fourth":"Fourth";break;default:throw Error("errorPrefix called with argumentNumber > 4.  Need to update it?");}return a=a+" failed: "+(d+" argument ")}
function A(a,b,c,d){if((!d||n(c))&&!ha(c))throw Error(z(a,b,d)+"must be a valid function.");}function lb(a,b,c){if(n(c)&&(!ia(c)||null===c))throw Error(z(a,b,!0)+"must be a valid context object.");};function mb(a){return"undefined"!==typeof JSON&&n(JSON.parse)?JSON.parse(a):Aa(a)}function B(a){if("undefined"!==typeof JSON&&n(JSON.stringify))a=JSON.stringify(a);else{var b=[];Ca(new Ba,a,b);a=b.join("")}return a};function nb(){this.Sd=C}nb.prototype.j=function(a){return this.Sd.oa(a)};nb.prototype.toString=function(){return this.Sd.toString()};function ob(){}ob.prototype.pf=function(){return null};ob.prototype.xe=function(){return null};var pb=new ob;function qb(a,b,c){this.Qf=a;this.Ka=b;this.Hd=c}qb.prototype.pf=function(a){var b=this.Ka.D;if(rb(b,a))return b.j().M(a);b=null!=this.Hd?new sb(this.Hd,!0,!1):this.Ka.u();return this.Qf.Xa(a,b)};qb.prototype.xe=function(a,b,c){var d=null!=this.Hd?this.Hd:tb(this.Ka);a=this.Qf.me(d,b,1,c,a);return 0===a.length?null:a[0]};function ub(){this.tb=[]}function vb(a,b){for(var c=null,d=0;d<b.length;d++){var e=b[d],f=e.Yb();null===c||f.Z(c.Yb())||(a.tb.push(c),c=null);null===c&&(c=new wb(f));c.add(e)}c&&a.tb.push(c)}function xb(a,b,c){vb(a,c);yb(a,function(a){return a.Z(b)})}function zb(a,b,c){vb(a,c);yb(a,function(a){return a.contains(b)||b.contains(a)})}
function yb(a,b){for(var c=!0,d=0;d<a.tb.length;d++){var e=a.tb[d];if(e)if(e=e.Yb(),b(e)){for(var e=a.tb[d],f=0;f<e.sd.length;f++){var g=e.sd[f];if(null!==g){e.sd[f]=null;var k=g.Ub();Ab&&Bb("event: "+g.toString());Cb(k)}}a.tb[d]=null}else c=!1}c&&(a.tb=[])}function wb(a){this.qa=a;this.sd=[]}wb.prototype.add=function(a){this.sd.push(a)};wb.prototype.Yb=function(){return this.qa};function D(a,b,c,d){this.type=a;this.Ja=b;this.Ya=c;this.Je=d;this.Nd=void 0}function Db(a){return new D(Eb,a)}var Eb="value";function Fb(a,b,c,d){this.te=b;this.Wd=c;this.Nd=d;this.rd=a}Fb.prototype.Yb=function(){var a=this.Wd.lc();return"value"===this.rd?a.path:a.parent().path};Fb.prototype.ye=function(){return this.rd};Fb.prototype.Ub=function(){return this.te.Ub(this)};Fb.prototype.toString=function(){return this.Yb().toString()+":"+this.rd+":"+B(this.Wd.lf())};function Gb(a,b,c){this.te=a;this.error=b;this.path=c}Gb.prototype.Yb=function(){return this.path};Gb.prototype.ye=function(){return"cancel"};
Gb.prototype.Ub=function(){return this.te.Ub(this)};Gb.prototype.toString=function(){return this.path.toString()+":cancel"};function sb(a,b,c){this.B=a;this.$=b;this.Tb=c}function Hb(a){return a.$}function rb(a,b){return a.$&&!a.Tb||a.B.Ha(b)}sb.prototype.j=function(){return this.B};function Ib(a){this.dg=a;this.Ad=null}Ib.prototype.get=function(){var a=this.dg.get(),b=xa(a);if(this.Ad)for(var c in this.Ad)b[c]-=this.Ad[c];this.Ad=a;return b};function Jb(a,b){this.Mf={};this.Yd=new Ib(a);this.ca=b;var c=1E4+2E4*Math.random();setTimeout(q(this.Hf,this),Math.floor(c))}Jb.prototype.Hf=function(){var a=this.Yd.get(),b={},c=!1,d;for(d in a)0<a[d]&&u(this.Mf,d)&&(b[d]=a[d],c=!0);c&&this.ca.Te(b);setTimeout(q(this.Hf,this),Math.floor(6E5*Math.random()))};function Kb(){this.Dc={}}function Lb(a,b,c){n(c)||(c=1);u(a.Dc,b)||(a.Dc[b]=0);a.Dc[b]+=c}Kb.prototype.get=function(){return xa(this.Dc)};var Mb={},Nb={};function Ob(a){a=a.toString();Mb[a]||(Mb[a]=new Kb);return Mb[a]}function Pb(a,b){var c=a.toString();Nb[c]||(Nb[c]=b());return Nb[c]};function E(a,b){this.name=a;this.S=b}function Qb(a,b){return new E(a,b)};function Rb(a,b){return Sb(a.name,b.name)}function Tb(a,b){return Sb(a,b)};function Ub(a,b,c){this.type=Vb;this.source=a;this.path=b;this.Ia=c}Ub.prototype.Wc=function(a){return this.path.e()?new Ub(this.source,F,this.Ia.M(a)):new Ub(this.source,G(this.path),this.Ia)};Ub.prototype.toString=function(){return"Operation("+this.path+": "+this.source.toString()+" overwrite: "+this.Ia.toString()+")"};function Wb(a,b){this.type=Xb;this.source=Yb;this.path=a;this.Ve=b}Wb.prototype.Wc=function(){return this.path.e()?this:new Wb(G(this.path),this.Ve)};Wb.prototype.toString=function(){return"Operation("+this.path+": "+this.source.toString()+" ack write revert="+this.Ve+")"};function Zb(a,b){this.type=$b;this.source=a;this.path=b}Zb.prototype.Wc=function(){return this.path.e()?new Zb(this.source,F):new Zb(this.source,G(this.path))};Zb.prototype.toString=function(){return"Operation("+this.path+": "+this.source.toString()+" listen_complete)"};function ac(a,b){this.La=a;this.xa=b?b:bc}h=ac.prototype;h.Na=function(a,b){return new ac(this.La,this.xa.Na(a,b,this.La).X(null,null,!1,null,null))};h.remove=function(a){return new ac(this.La,this.xa.remove(a,this.La).X(null,null,!1,null,null))};h.get=function(a){for(var b,c=this.xa;!c.e();){b=this.La(a,c.key);if(0===b)return c.value;0>b?c=c.left:0<b&&(c=c.right)}return null};
function cc(a,b){for(var c,d=a.xa,e=null;!d.e();){c=a.La(b,d.key);if(0===c){if(d.left.e())return e?e.key:null;for(d=d.left;!d.right.e();)d=d.right;return d.key}0>c?d=d.left:0<c&&(e=d,d=d.right)}throw Error("Attempted to find predecessor key for a nonexistent key.  What gives?");}h.e=function(){return this.xa.e()};h.count=function(){return this.xa.count()};h.Rc=function(){return this.xa.Rc()};h.ec=function(){return this.xa.ec()};h.ha=function(a){return this.xa.ha(a)};
h.Wb=function(a){return new dc(this.xa,null,this.La,!1,a)};h.Xb=function(a,b){return new dc(this.xa,a,this.La,!1,b)};h.Zb=function(a,b){return new dc(this.xa,a,this.La,!0,b)};h.rf=function(a){return new dc(this.xa,null,this.La,!0,a)};function dc(a,b,c,d,e){this.Rd=e||null;this.Ee=d;this.Pa=[];for(e=1;!a.e();)if(e=b?c(a.key,b):1,d&&(e*=-1),0>e)a=this.Ee?a.left:a.right;else if(0===e){this.Pa.push(a);break}else this.Pa.push(a),a=this.Ee?a.right:a.left}
function H(a){if(0===a.Pa.length)return null;var b=a.Pa.pop(),c;c=a.Rd?a.Rd(b.key,b.value):{key:b.key,value:b.value};if(a.Ee)for(b=b.left;!b.e();)a.Pa.push(b),b=b.right;else for(b=b.right;!b.e();)a.Pa.push(b),b=b.left;return c}function ec(a){if(0===a.Pa.length)return null;var b;b=a.Pa;b=b[b.length-1];return a.Rd?a.Rd(b.key,b.value):{key:b.key,value:b.value}}function fc(a,b,c,d,e){this.key=a;this.value=b;this.color=null!=c?c:!0;this.left=null!=d?d:bc;this.right=null!=e?e:bc}h=fc.prototype;
h.X=function(a,b,c,d,e){return new fc(null!=a?a:this.key,null!=b?b:this.value,null!=c?c:this.color,null!=d?d:this.left,null!=e?e:this.right)};h.count=function(){return this.left.count()+1+this.right.count()};h.e=function(){return!1};h.ha=function(a){return this.left.ha(a)||a(this.key,this.value)||this.right.ha(a)};function gc(a){return a.left.e()?a:gc(a.left)}h.Rc=function(){return gc(this).key};h.ec=function(){return this.right.e()?this.key:this.right.ec()};
h.Na=function(a,b,c){var d,e;e=this;d=c(a,e.key);e=0>d?e.X(null,null,null,e.left.Na(a,b,c),null):0===d?e.X(null,b,null,null,null):e.X(null,null,null,null,e.right.Na(a,b,c));return hc(e)};function ic(a){if(a.left.e())return bc;a.left.fa()||a.left.left.fa()||(a=jc(a));a=a.X(null,null,null,ic(a.left),null);return hc(a)}
h.remove=function(a,b){var c,d;c=this;if(0>b(a,c.key))c.left.e()||c.left.fa()||c.left.left.fa()||(c=jc(c)),c=c.X(null,null,null,c.left.remove(a,b),null);else{c.left.fa()&&(c=kc(c));c.right.e()||c.right.fa()||c.right.left.fa()||(c=lc(c),c.left.left.fa()&&(c=kc(c),c=lc(c)));if(0===b(a,c.key)){if(c.right.e())return bc;d=gc(c.right);c=c.X(d.key,d.value,null,null,ic(c.right))}c=c.X(null,null,null,null,c.right.remove(a,b))}return hc(c)};h.fa=function(){return this.color};
function hc(a){a.right.fa()&&!a.left.fa()&&(a=mc(a));a.left.fa()&&a.left.left.fa()&&(a=kc(a));a.left.fa()&&a.right.fa()&&(a=lc(a));return a}function jc(a){a=lc(a);a.right.left.fa()&&(a=a.X(null,null,null,null,kc(a.right)),a=mc(a),a=lc(a));return a}function mc(a){return a.right.X(null,null,a.color,a.X(null,null,!0,null,a.right.left),null)}function kc(a){return a.left.X(null,null,a.color,null,a.X(null,null,!0,a.left.right,null))}
function lc(a){return a.X(null,null,!a.color,a.left.X(null,null,!a.left.color,null,null),a.right.X(null,null,!a.right.color,null,null))}function nc(){}h=nc.prototype;h.X=function(){return this};h.Na=function(a,b){return new fc(a,b,null)};h.remove=function(){return this};h.count=function(){return 0};h.e=function(){return!0};h.ha=function(){return!1};h.Rc=function(){return null};h.ec=function(){return null};h.fa=function(){return!1};var bc=new nc;function oc(a,b){return a&&"object"===typeof a?(J(".sv"in a,"Unexpected leaf node or priority contents"),b[a[".sv"]]):a}function pc(a,b){var c=new qc;rc(a,new K(""),function(a,e){c.mc(a,sc(e,b))});return c}function sc(a,b){var c=a.A().K(),c=oc(c,b),d;if(a.N()){var e=oc(a.Ba(),b);return e!==a.Ba()||c!==a.A().K()?new tc(e,L(c)):a}d=a;c!==a.A().K()&&(d=d.da(new tc(c)));a.U(M,function(a,c){var e=sc(c,b);e!==c&&(d=d.Q(a,e))});return d};function K(a,b){if(1==arguments.length){this.n=a.split("/");for(var c=0,d=0;d<this.n.length;d++)0<this.n[d].length&&(this.n[c]=this.n[d],c++);this.n.length=c;this.Y=0}else this.n=a,this.Y=b}function N(a,b){var c=O(a);if(null===c)return b;if(c===O(b))return N(G(a),G(b));throw Error("INTERNAL ERROR: innerPath ("+b+") is not within outerPath ("+a+")");}function O(a){return a.Y>=a.n.length?null:a.n[a.Y]}function uc(a){return a.n.length-a.Y}
function G(a){var b=a.Y;b<a.n.length&&b++;return new K(a.n,b)}function vc(a){return a.Y<a.n.length?a.n[a.n.length-1]:null}h=K.prototype;h.toString=function(){for(var a="",b=this.Y;b<this.n.length;b++)""!==this.n[b]&&(a+="/"+this.n[b]);return a||"/"};h.slice=function(a){return this.n.slice(this.Y+(a||0))};h.parent=function(){if(this.Y>=this.n.length)return null;for(var a=[],b=this.Y;b<this.n.length-1;b++)a.push(this.n[b]);return new K(a,0)};
h.w=function(a){for(var b=[],c=this.Y;c<this.n.length;c++)b.push(this.n[c]);if(a instanceof K)for(c=a.Y;c<a.n.length;c++)b.push(a.n[c]);else for(a=a.split("/"),c=0;c<a.length;c++)0<a[c].length&&b.push(a[c]);return new K(b,0)};h.e=function(){return this.Y>=this.n.length};h.Z=function(a){if(uc(this)!==uc(a))return!1;for(var b=this.Y,c=a.Y;b<=this.n.length;b++,c++)if(this.n[b]!==a.n[c])return!1;return!0};
h.contains=function(a){var b=this.Y,c=a.Y;if(uc(this)>uc(a))return!1;for(;b<this.n.length;){if(this.n[b]!==a.n[c])return!1;++b;++c}return!0};var F=new K("");function wc(a,b){this.Qa=a.slice();this.Ea=Math.max(1,this.Qa.length);this.kf=b;for(var c=0;c<this.Qa.length;c++)this.Ea+=xc(this.Qa[c]);yc(this)}wc.prototype.push=function(a){0<this.Qa.length&&(this.Ea+=1);this.Qa.push(a);this.Ea+=xc(a);yc(this)};wc.prototype.pop=function(){var a=this.Qa.pop();this.Ea-=xc(a);0<this.Qa.length&&--this.Ea};
function yc(a){if(768<a.Ea)throw Error(a.kf+"has a key path longer than 768 bytes ("+a.Ea+").");if(32<a.Qa.length)throw Error(a.kf+"path specified exceeds the maximum depth that can be written (32) or object contains a cycle "+zc(a));}function zc(a){return 0==a.Qa.length?"":"in property '"+a.Qa.join(".")+"'"};function Ac(){this.wc={}}Ac.prototype.set=function(a,b){null==b?delete this.wc[a]:this.wc[a]=b};Ac.prototype.get=function(a){return u(this.wc,a)?this.wc[a]:null};Ac.prototype.remove=function(a){delete this.wc[a]};Ac.prototype.uf=!0;function Bc(a){this.Ec=a;this.Md="firebase:"}h=Bc.prototype;h.set=function(a,b){null==b?this.Ec.removeItem(this.Md+a):this.Ec.setItem(this.Md+a,B(b))};h.get=function(a){a=this.Ec.getItem(this.Md+a);return null==a?null:mb(a)};h.remove=function(a){this.Ec.removeItem(this.Md+a)};h.uf=!1;h.toString=function(){return this.Ec.toString()};function Cc(a){try{if("undefined"!==typeof window&&"undefined"!==typeof window[a]){var b=window[a];b.setItem("firebase:sentinel","cache");b.removeItem("firebase:sentinel");return new Bc(b)}}catch(c){}return new Ac}var Dc=Cc("localStorage"),P=Cc("sessionStorage");function Ec(a,b,c,d,e){this.host=a.toLowerCase();this.domain=this.host.substr(this.host.indexOf(".")+1);this.lb=b;this.Cb=c;this.Tg=d;this.Ld=e||"";this.Oa=Dc.get("host:"+a)||this.host}function Fc(a,b){b!==a.Oa&&(a.Oa=b,"s-"===a.Oa.substr(0,2)&&Dc.set("host:"+a.host,a.Oa))}Ec.prototype.toString=function(){var a=(this.lb?"https://":"http://")+this.host;this.Ld&&(a+="<"+this.Ld+">");return a};var Gc=function(){var a=1;return function(){return a++}}();function J(a,b){if(!a)throw Hc(b);}function Hc(a){return Error("Firebase (2.2.5) INTERNAL ASSERT FAILED: "+a)}
function Ic(a){try{var b;if("undefined"!==typeof atob)b=atob(a);else{gb();for(var c=eb,d=[],e=0;e<a.length;){var f=c[a.charAt(e++)],g=e<a.length?c[a.charAt(e)]:0;++e;var k=e<a.length?c[a.charAt(e)]:64;++e;var l=e<a.length?c[a.charAt(e)]:64;++e;if(null==f||null==g||null==k||null==l)throw Error();d.push(f<<2|g>>4);64!=k&&(d.push(g<<4&240|k>>2),64!=l&&d.push(k<<6&192|l))}if(8192>d.length)b=String.fromCharCode.apply(null,d);else{a="";for(c=0;c<d.length;c+=8192)a+=String.fromCharCode.apply(null,Wa(d,c,
c+8192));b=a}}return b}catch(m){Bb("base64Decode failed: ",m)}return null}function Jc(a){var b=Kc(a);a=new La;a.update(b);var b=[],c=8*a.be;56>a.$b?a.update(a.Id,56-a.$b):a.update(a.Id,a.Wa-(a.$b-56));for(var d=a.Wa-1;56<=d;d--)a.le[d]=c&255,c/=256;Ma(a,a.le);for(d=c=0;5>d;d++)for(var e=24;0<=e;e-=8)b[c]=a.R[d]>>e&255,++c;return fb(b)}
function Lc(a){for(var b="",c=0;c<arguments.length;c++)b=fa(arguments[c])?b+Lc.apply(null,arguments[c]):"object"===typeof arguments[c]?b+B(arguments[c]):b+arguments[c],b+=" ";return b}var Ab=null,Mc=!0;function Bb(a){!0===Mc&&(Mc=!1,null===Ab&&!0===P.get("logging_enabled")&&Nc(!0));if(Ab){var b=Lc.apply(null,arguments);Ab(b)}}function Oc(a){return function(){Bb(a,arguments)}}
function Pc(a){if("undefined"!==typeof console){var b="FIREBASE INTERNAL ERROR: "+Lc.apply(null,arguments);"undefined"!==typeof console.error?console.error(b):console.log(b)}}function Qc(a){var b=Lc.apply(null,arguments);throw Error("FIREBASE FATAL ERROR: "+b);}function Q(a){if("undefined"!==typeof console){var b="FIREBASE WARNING: "+Lc.apply(null,arguments);"undefined"!==typeof console.warn?console.warn(b):console.log(b)}}
function Rc(a){var b="",c="",d="",e="",f=!0,g="https",k=443;if(p(a)){var l=a.indexOf("//");0<=l&&(g=a.substring(0,l-1),a=a.substring(l+2));l=a.indexOf("/");-1===l&&(l=a.length);b=a.substring(0,l);e="";a=a.substring(l).split("/");for(l=0;l<a.length;l++)if(0<a[l].length){var m=a[l];try{m=decodeURIComponent(m.replace(/\+/g," "))}catch(v){}e+="/"+m}a=b.split(".");3===a.length?(c=a[1],d=a[0].toLowerCase()):2===a.length&&(c=a[0]);l=b.indexOf(":");0<=l&&(f="https"===g||"wss"===g,k=b.substring(l+1),isFinite(k)&&
(k=String(k)),k=p(k)?/^\s*-?0x/i.test(k)?parseInt(k,16):parseInt(k,10):NaN)}return{host:b,port:k,domain:c,Qg:d,lb:f,scheme:g,Zc:e}}function Sc(a){return ga(a)&&(a!=a||a==Number.POSITIVE_INFINITY||a==Number.NEGATIVE_INFINITY)}
function Tc(a){if("complete"===document.readyState)a();else{var b=!1,c=function(){document.body?b||(b=!0,a()):setTimeout(c,Math.floor(10))};document.addEventListener?(document.addEventListener("DOMContentLoaded",c,!1),window.addEventListener("load",c,!1)):document.attachEvent&&(document.attachEvent("onreadystatechange",function(){"complete"===document.readyState&&c()}),window.attachEvent("onload",c))}}
function Sb(a,b){if(a===b)return 0;if("[MIN_NAME]"===a||"[MAX_NAME]"===b)return-1;if("[MIN_NAME]"===b||"[MAX_NAME]"===a)return 1;var c=Uc(a),d=Uc(b);return null!==c?null!==d?0==c-d?a.length-b.length:c-d:-1:null!==d?1:a<b?-1:1}function Vc(a,b){if(b&&a in b)return b[a];throw Error("Missing required key ("+a+") in object: "+B(b));}
function Wc(a){if("object"!==typeof a||null===a)return B(a);var b=[],c;for(c in a)b.push(c);b.sort();c="{";for(var d=0;d<b.length;d++)0!==d&&(c+=","),c+=B(b[d]),c+=":",c+=Wc(a[b[d]]);return c+"}"}function Xc(a,b){if(a.length<=b)return[a];for(var c=[],d=0;d<a.length;d+=b)d+b>a?c.push(a.substring(d,a.length)):c.push(a.substring(d,d+b));return c}function Yc(a,b){if(ea(a))for(var c=0;c<a.length;++c)b(c,a[c]);else r(a,b)}
function Zc(a){J(!Sc(a),"Invalid JSON number");var b,c,d,e;0===a?(d=c=0,b=-Infinity===1/a?1:0):(b=0>a,a=Math.abs(a),a>=Math.pow(2,-1022)?(d=Math.min(Math.floor(Math.log(a)/Math.LN2),1023),c=d+1023,d=Math.round(a*Math.pow(2,52-d)-Math.pow(2,52))):(c=0,d=Math.round(a/Math.pow(2,-1074))));e=[];for(a=52;a;--a)e.push(d%2?1:0),d=Math.floor(d/2);for(a=11;a;--a)e.push(c%2?1:0),c=Math.floor(c/2);e.push(b?1:0);e.reverse();b=e.join("");c="";for(a=0;64>a;a+=8)d=parseInt(b.substr(a,8),2).toString(16),1===d.length&&
(d="0"+d),c+=d;return c.toLowerCase()}var $c=/^-?\d{1,10}$/;function Uc(a){return $c.test(a)&&(a=Number(a),-2147483648<=a&&2147483647>=a)?a:null}function Cb(a){try{a()}catch(b){setTimeout(function(){Q("Exception was thrown by user callback.",b.stack||"");throw b;},Math.floor(0))}}function R(a,b){if(ha(a)){var c=Array.prototype.slice.call(arguments,1).slice();Cb(function(){a.apply(null,c)})}};function Kc(a){for(var b=[],c=0,d=0;d<a.length;d++){var e=a.charCodeAt(d);55296<=e&&56319>=e&&(e-=55296,d++,J(d<a.length,"Surrogate pair missing trail surrogate."),e=65536+(e<<10)+(a.charCodeAt(d)-56320));128>e?b[c++]=e:(2048>e?b[c++]=e>>6|192:(65536>e?b[c++]=e>>12|224:(b[c++]=e>>18|240,b[c++]=e>>12&63|128),b[c++]=e>>6&63|128),b[c++]=e&63|128)}return b}function xc(a){for(var b=0,c=0;c<a.length;c++){var d=a.charCodeAt(c);128>d?b++:2048>d?b+=2:55296<=d&&56319>=d?(b+=4,c++):b+=3}return b};function ad(a){var b={},c={},d={},e="";try{var f=a.split("."),b=mb(Ic(f[0])||""),c=mb(Ic(f[1])||""),e=f[2],d=c.d||{};delete c.d}catch(g){}return{Wg:b,Ac:c,data:d,Ng:e}}function bd(a){a=ad(a).Ac;return"object"===typeof a&&a.hasOwnProperty("iat")?w(a,"iat"):null}function cd(a){a=ad(a);var b=a.Ac;return!!a.Ng&&!!b&&"object"===typeof b&&b.hasOwnProperty("iat")};function dd(a){this.V=a;this.g=a.o.g}function ed(a,b,c,d){var e=[],f=[];Oa(b,function(b){"child_changed"===b.type&&a.g.xd(b.Je,b.Ja)&&f.push(new D("child_moved",b.Ja,b.Ya))});fd(a,e,"child_removed",b,d,c);fd(a,e,"child_added",b,d,c);fd(a,e,"child_moved",f,d,c);fd(a,e,"child_changed",b,d,c);fd(a,e,Eb,b,d,c);return e}function fd(a,b,c,d,e,f){d=Pa(d,function(a){return a.type===c});Xa(d,q(a.eg,a));Oa(d,function(c){var d=gd(a,c,f);Oa(e,function(e){e.Jf(c.type)&&b.push(e.createEvent(d,a.V))})})}
function gd(a,b,c){"value"!==b.type&&"child_removed"!==b.type&&(b.Nd=c.qf(b.Ya,b.Ja,a.g));return b}dd.prototype.eg=function(a,b){if(null==a.Ya||null==b.Ya)throw Hc("Should only compare child_ events.");return this.g.compare(new E(a.Ya,a.Ja),new E(b.Ya,b.Ja))};function hd(){this.eb={}}
function id(a,b){var c=b.type,d=b.Ya;J("child_added"==c||"child_changed"==c||"child_removed"==c,"Only child changes supported for tracking");J(".priority"!==d,"Only non-priority child changes can be tracked.");var e=w(a.eb,d);if(e){var f=e.type;if("child_added"==c&&"child_removed"==f)a.eb[d]=new D("child_changed",b.Ja,d,e.Ja);else if("child_removed"==c&&"child_added"==f)delete a.eb[d];else if("child_removed"==c&&"child_changed"==f)a.eb[d]=new D("child_removed",e.Je,d);else if("child_changed"==c&&
"child_added"==f)a.eb[d]=new D("child_added",b.Ja,d);else if("child_changed"==c&&"child_changed"==f)a.eb[d]=new D("child_changed",b.Ja,d,e.Je);else throw Hc("Illegal combination of changes: "+b+" occurred after "+e);}else a.eb[d]=b};function jd(a,b,c){this.Pb=a;this.qb=b;this.sb=c||null}h=jd.prototype;h.Jf=function(a){return"value"===a};h.createEvent=function(a,b){var c=b.o.g;return new Fb("value",this,new S(a.Ja,b.lc(),c))};h.Ub=function(a){var b=this.sb;if("cancel"===a.ye()){J(this.qb,"Raising a cancel event on a listener with no cancel callback");var c=this.qb;return function(){c.call(b,a.error)}}var d=this.Pb;return function(){d.call(b,a.Wd)}};h.ff=function(a,b){return this.qb?new Gb(this,a,b):null};
h.matches=function(a){return a instanceof jd?a.Pb&&this.Pb?a.Pb===this.Pb&&a.sb===this.sb:!0:!1};h.sf=function(){return null!==this.Pb};function kd(a,b,c){this.ga=a;this.qb=b;this.sb=c}h=kd.prototype;h.Jf=function(a){a="children_added"===a?"child_added":a;return("children_removed"===a?"child_removed":a)in this.ga};h.ff=function(a,b){return this.qb?new Gb(this,a,b):null};
h.createEvent=function(a,b){J(null!=a.Ya,"Child events should have a childName.");var c=b.lc().w(a.Ya);return new Fb(a.type,this,new S(a.Ja,c,b.o.g),a.Nd)};h.Ub=function(a){var b=this.sb;if("cancel"===a.ye()){J(this.qb,"Raising a cancel event on a listener with no cancel callback");var c=this.qb;return function(){c.call(b,a.error)}}var d=this.ga[a.rd];return function(){d.call(b,a.Wd,a.Nd)}};
h.matches=function(a){if(a instanceof kd){if(!this.ga||!a.ga)return!0;if(this.sb===a.sb){var b=pa(a.ga);if(b===pa(this.ga)){if(1===b){var b=qa(a.ga),c=qa(this.ga);return c===b&&(!a.ga[b]||!this.ga[c]||a.ga[b]===this.ga[c])}return oa(this.ga,function(b,c){return a.ga[c]===b})}}}return!1};h.sf=function(){return null!==this.ga};function ld(a){this.g=a}h=ld.prototype;h.G=function(a,b,c,d,e){J(a.Ic(this.g),"A node must be indexed if only a child is updated");d=a.M(b);if(d.Z(c))return a;null!=e&&(c.e()?a.Ha(b)?id(e,new D("child_removed",d,b)):J(a.N(),"A child remove without an old child only makes sense on a leaf node"):d.e()?id(e,new D("child_added",c,b)):id(e,new D("child_changed",c,b,d)));return a.N()&&c.e()?a:a.Q(b,c).mb(this.g)};
h.ta=function(a,b,c){null!=c&&(a.N()||a.U(M,function(a,e){b.Ha(a)||id(c,new D("child_removed",e,a))}),b.N()||b.U(M,function(b,e){if(a.Ha(b)){var f=a.M(b);f.Z(e)||id(c,new D("child_changed",e,b,f))}else id(c,new D("child_added",e,b))}));return b.mb(this.g)};h.da=function(a,b){return a.e()?C:a.da(b)};h.Ga=function(){return!1};h.Vb=function(){return this};function md(a){this.Ae=new ld(a.g);this.g=a.g;var b;a.la?(b=nd(a),b=a.g.Oc(od(a),b)):b=a.g.Sc();this.dd=b;a.na?(b=pd(a),a=a.g.Oc(qd(a),b)):a=a.g.Pc();this.Fc=a}h=md.prototype;h.matches=function(a){return 0>=this.g.compare(this.dd,a)&&0>=this.g.compare(a,this.Fc)};h.G=function(a,b,c,d,e){this.matches(new E(b,c))||(c=C);return this.Ae.G(a,b,c,d,e)};h.ta=function(a,b,c){b.N()&&(b=C);var d=b.mb(this.g),d=d.da(C),e=this;b.U(M,function(a,b){e.matches(new E(a,b))||(d=d.Q(a,C))});return this.Ae.ta(a,d,c)};
h.da=function(a){return a};h.Ga=function(){return!0};h.Vb=function(){return this.Ae};function rd(a){this.ra=new md(a);this.g=a.g;J(a.ia,"Only valid if limit has been set");this.ja=a.ja;this.Jb=!sd(a)}h=rd.prototype;h.G=function(a,b,c,d,e){this.ra.matches(new E(b,c))||(c=C);return a.M(b).Z(c)?a:a.Db()<this.ja?this.ra.Vb().G(a,b,c,d,e):td(this,a,b,c,d,e)};
h.ta=function(a,b,c){var d;if(b.N()||b.e())d=C.mb(this.g);else if(2*this.ja<b.Db()&&b.Ic(this.g)){d=C.mb(this.g);b=this.Jb?b.Zb(this.ra.Fc,this.g):b.Xb(this.ra.dd,this.g);for(var e=0;0<b.Pa.length&&e<this.ja;){var f=H(b),g;if(g=this.Jb?0>=this.g.compare(this.ra.dd,f):0>=this.g.compare(f,this.ra.Fc))d=d.Q(f.name,f.S),e++;else break}}else{d=b.mb(this.g);d=d.da(C);var k,l,m;if(this.Jb){b=d.rf(this.g);k=this.ra.Fc;l=this.ra.dd;var v=ud(this.g);m=function(a,b){return v(b,a)}}else b=d.Wb(this.g),k=this.ra.dd,
l=this.ra.Fc,m=ud(this.g);for(var e=0,y=!1;0<b.Pa.length;)f=H(b),!y&&0>=m(k,f)&&(y=!0),(g=y&&e<this.ja&&0>=m(f,l))?e++:d=d.Q(f.name,C)}return this.ra.Vb().ta(a,d,c)};h.da=function(a){return a};h.Ga=function(){return!0};h.Vb=function(){return this.ra.Vb()};
function td(a,b,c,d,e,f){var g;if(a.Jb){var k=ud(a.g);g=function(a,b){return k(b,a)}}else g=ud(a.g);J(b.Db()==a.ja,"");var l=new E(c,d),m=a.Jb?wd(b,a.g):xd(b,a.g),v=a.ra.matches(l);if(b.Ha(c)){var y=b.M(c),m=e.xe(a.g,m,a.Jb);null!=m&&m.name==c&&(m=e.xe(a.g,m,a.Jb));e=null==m?1:g(m,l);if(v&&!d.e()&&0<=e)return null!=f&&id(f,new D("child_changed",d,c,y)),b.Q(c,d);null!=f&&id(f,new D("child_removed",y,c));b=b.Q(c,C);return null!=m&&a.ra.matches(m)?(null!=f&&id(f,new D("child_added",m.S,m.name)),b.Q(m.name,
m.S)):b}return d.e()?b:v&&0<=g(m,l)?(null!=f&&(id(f,new D("child_removed",m.S,m.name)),id(f,new D("child_added",d,c))),b.Q(c,d).Q(m.name,C)):b};function yd(a,b){this.he=a;this.cg=b}function zd(a){this.I=a}
zd.prototype.bb=function(a,b,c,d){var e=new hd,f;if(b.type===Vb)b.source.ve?c=Ad(this,a,b.path,b.Ia,c,d,e):(J(b.source.of,"Unknown source."),f=b.source.af,c=Bd(this,a,b.path,b.Ia,c,d,f,e));else if(b.type===Cd)b.source.ve?c=Dd(this,a,b.path,b.children,c,d,e):(J(b.source.of,"Unknown source."),f=b.source.af,c=Ed(this,a,b.path,b.children,c,d,f,e));else if(b.type===Xb)if(b.Ve)if(f=b.path,null!=c.sc(f))c=a;else{b=new qb(c,a,d);d=a.D.j();if(f.e()||".priority"===O(f))Hb(a.u())?b=c.ua(tb(a)):(b=a.u().j(),
J(b instanceof T,"serverChildren would be complete if leaf node"),b=c.xc(b)),b=this.I.ta(d,b,e);else{f=O(f);var g=c.Xa(f,a.u());null==g&&rb(a.u(),f)&&(g=d.M(f));b=null!=g?this.I.G(d,f,g,b,e):a.D.j().Ha(f)?this.I.G(d,f,C,b,e):d;b.e()&&Hb(a.u())&&(d=c.ua(tb(a)),d.N()&&(b=this.I.ta(b,d,e)))}d=Hb(a.u())||null!=c.sc(F);c=Fd(a,b,d,this.I.Ga())}else c=Gd(this,a,b.path,c,d,e);else if(b.type===$b)d=b.path,b=a.u(),f=b.j(),g=b.$||d.e(),c=Hd(this,new Id(a.D,new sb(f,g,b.Tb)),d,c,pb,e);else throw Hc("Unknown operation type: "+
b.type);e=ra(e.eb);d=c;b=d.D;b.$&&(f=b.j().N()||b.j().e(),g=Jd(a),(0<e.length||!a.D.$||f&&!b.j().Z(g)||!b.j().A().Z(g.A()))&&e.push(Db(Jd(d))));return new yd(c,e)};
function Hd(a,b,c,d,e,f){var g=b.D;if(null!=d.sc(c))return b;var k;if(c.e())J(Hb(b.u()),"If change path is empty, we must have complete server data"),b.u().Tb?(e=tb(b),d=d.xc(e instanceof T?e:C)):d=d.ua(tb(b)),f=a.I.ta(b.D.j(),d,f);else{var l=O(c);if(".priority"==l)J(1==uc(c),"Can't have a priority with additional path components"),f=g.j(),k=b.u().j(),d=d.hd(c,f,k),f=null!=d?a.I.da(f,d):g.j();else{var m=G(c);rb(g,l)?(k=b.u().j(),d=d.hd(c,g.j(),k),d=null!=d?g.j().M(l).G(m,d):g.j().M(l)):d=d.Xa(l,b.u());
f=null!=d?a.I.G(g.j(),l,d,e,f):g.j()}}return Fd(b,f,g.$||c.e(),a.I.Ga())}function Bd(a,b,c,d,e,f,g,k){var l=b.u();g=g?a.I:a.I.Vb();if(c.e())d=g.ta(l.j(),d,null);else if(g.Ga()&&!l.Tb)d=l.j().G(c,d),d=g.ta(l.j(),d,null);else{var m=O(c);if((c.e()?!l.$||l.Tb:!rb(l,O(c)))&&1<uc(c))return b;d=l.j().M(m).G(G(c),d);d=".priority"==m?g.da(l.j(),d):g.G(l.j(),m,d,pb,null)}l=l.$||c.e();b=new Id(b.D,new sb(d,l,g.Ga()));return Hd(a,b,c,e,new qb(e,b,f),k)}
function Ad(a,b,c,d,e,f,g){var k=b.D;e=new qb(e,b,f);if(c.e())g=a.I.ta(b.D.j(),d,g),a=Fd(b,g,!0,a.I.Ga());else if(f=O(c),".priority"===f)g=a.I.da(b.D.j(),d),a=Fd(b,g,k.$,k.Tb);else{var l=G(c);c=k.j().M(f);if(!l.e()){var m=e.pf(f);d=null!=m?".priority"===vc(l)&&m.oa(l.parent()).e()?m:m.G(l,d):C}c.Z(d)?a=b:(g=a.I.G(k.j(),f,d,e,g),a=Fd(b,g,k.$,a.I.Ga()))}return a}
function Dd(a,b,c,d,e,f,g){var k=b;Kd(d,function(d,m){var v=c.w(d);rb(b.D,O(v))&&(k=Ad(a,k,v,m,e,f,g))});Kd(d,function(d,m){var v=c.w(d);rb(b.D,O(v))||(k=Ad(a,k,v,m,e,f,g))});return k}function Ld(a,b){Kd(b,function(b,d){a=a.G(b,d)});return a}
function Ed(a,b,c,d,e,f,g,k){if(b.u().j().e()&&!Hb(b.u()))return b;var l=b;c=c.e()?d:Md(Nd,c,d);var m=b.u().j();c.children.ha(function(c,d){if(m.Ha(c)){var I=b.u().j().M(c),I=Ld(I,d);l=Bd(a,l,new K(c),I,e,f,g,k)}});c.children.ha(function(c,d){var I=!Hb(b.u())&&null==d.value;m.Ha(c)||I||(I=b.u().j().M(c),I=Ld(I,d),l=Bd(a,l,new K(c),I,e,f,g,k))});return l}
function Gd(a,b,c,d,e,f){if(null!=d.sc(c))return b;var g=new qb(d,b,e),k=e=b.D.j();if(Hb(b.u())){if(c.e())e=d.ua(tb(b)),k=a.I.ta(b.D.j(),e,f);else if(".priority"===O(c)){var l=d.Xa(O(c),b.u());null==l||e.e()||e.A().Z(l)||(k=a.I.da(e,l))}else l=O(c),e=d.Xa(l,b.u()),null!=e&&(k=a.I.G(b.D.j(),l,e,g,f));e=!0}else if(b.D.$||c.e())k=e,e=b.D.j(),e.N()||e.U(M,function(c){var e=d.Xa(c,b.u());null!=e&&(k=a.I.G(k,c,e,g,f))}),e=b.D.$;else{l=O(c);if(1==uc(c)||rb(b.D,l))c=d.Xa(l,b.u()),null!=c&&(k=a.I.G(e,l,c,
g,f));e=!1}return Fd(b,k,e,a.I.Ga())};function Od(){}var Pd={};function ud(a){return q(a.compare,a)}Od.prototype.xd=function(a,b){return 0!==this.compare(new E("[MIN_NAME]",a),new E("[MIN_NAME]",b))};Od.prototype.Sc=function(){return Qd};function Rd(a){this.bc=a}ma(Rd,Od);h=Rd.prototype;h.Hc=function(a){return!a.M(this.bc).e()};h.compare=function(a,b){var c=a.S.M(this.bc),d=b.S.M(this.bc),c=c.Cc(d);return 0===c?Sb(a.name,b.name):c};h.Oc=function(a,b){var c=L(a),c=C.Q(this.bc,c);return new E(b,c)};
h.Pc=function(){var a=C.Q(this.bc,Sd);return new E("[MAX_NAME]",a)};h.toString=function(){return this.bc};function Td(){}ma(Td,Od);h=Td.prototype;h.compare=function(a,b){var c=a.S.A(),d=b.S.A(),c=c.Cc(d);return 0===c?Sb(a.name,b.name):c};h.Hc=function(a){return!a.A().e()};h.xd=function(a,b){return!a.A().Z(b.A())};h.Sc=function(){return Qd};h.Pc=function(){return new E("[MAX_NAME]",new tc("[PRIORITY-POST]",Sd))};h.Oc=function(a,b){var c=L(a);return new E(b,new tc("[PRIORITY-POST]",c))};
h.toString=function(){return".priority"};var M=new Td;function Ud(){}ma(Ud,Od);h=Ud.prototype;h.compare=function(a,b){return Sb(a.name,b.name)};h.Hc=function(){throw Hc("KeyIndex.isDefinedOn not expected to be called.");};h.xd=function(){return!1};h.Sc=function(){return Qd};h.Pc=function(){return new E("[MAX_NAME]",C)};h.Oc=function(a){J(p(a),"KeyIndex indexValue must always be a string.");return new E(a,C)};h.toString=function(){return".key"};var Vd=new Ud;function Wd(){}ma(Wd,Od);h=Wd.prototype;
h.compare=function(a,b){var c=a.S.Cc(b.S);return 0===c?Sb(a.name,b.name):c};h.Hc=function(){return!0};h.xd=function(a,b){return!a.Z(b)};h.Sc=function(){return Qd};h.Pc=function(){return Xd};h.Oc=function(a,b){var c=L(a);return new E(b,c)};h.toString=function(){return".value"};var Yd=new Wd;function Zd(){this.Rb=this.na=this.Lb=this.la=this.ia=!1;this.ja=0;this.Nb="";this.dc=null;this.xb="";this.ac=null;this.vb="";this.g=M}var $d=new Zd;function sd(a){return""===a.Nb?a.la:"l"===a.Nb}function od(a){J(a.la,"Only valid if start has been set");return a.dc}function nd(a){J(a.la,"Only valid if start has been set");return a.Lb?a.xb:"[MIN_NAME]"}function qd(a){J(a.na,"Only valid if end has been set");return a.ac}
function pd(a){J(a.na,"Only valid if end has been set");return a.Rb?a.vb:"[MAX_NAME]"}function ae(a){var b=new Zd;b.ia=a.ia;b.ja=a.ja;b.la=a.la;b.dc=a.dc;b.Lb=a.Lb;b.xb=a.xb;b.na=a.na;b.ac=a.ac;b.Rb=a.Rb;b.vb=a.vb;b.g=a.g;return b}h=Zd.prototype;h.Ge=function(a){var b=ae(this);b.ia=!0;b.ja=a;b.Nb="";return b};h.He=function(a){var b=ae(this);b.ia=!0;b.ja=a;b.Nb="l";return b};h.Ie=function(a){var b=ae(this);b.ia=!0;b.ja=a;b.Nb="r";return b};
h.Xd=function(a,b){var c=ae(this);c.la=!0;n(a)||(a=null);c.dc=a;null!=b?(c.Lb=!0,c.xb=b):(c.Lb=!1,c.xb="");return c};h.qd=function(a,b){var c=ae(this);c.na=!0;n(a)||(a=null);c.ac=a;n(b)?(c.Rb=!0,c.vb=b):(c.Yg=!1,c.vb="");return c};function be(a,b){var c=ae(a);c.g=b;return c}function ce(a){var b={};a.la&&(b.sp=a.dc,a.Lb&&(b.sn=a.xb));a.na&&(b.ep=a.ac,a.Rb&&(b.en=a.vb));if(a.ia){b.l=a.ja;var c=a.Nb;""===c&&(c=sd(a)?"l":"r");b.vf=c}a.g!==M&&(b.i=a.g.toString());return b}
function de(a){return!(a.la||a.na||a.ia)}function ee(a){var b={};if(de(a)&&a.g==M)return b;var c;a.g===M?c="$priority":a.g===Yd?c="$value":a.g===Vd?c="$key":(J(a.g instanceof Rd,"Unrecognized index type!"),c=a.g.toString());b.orderBy=B(c);a.la&&(b.startAt=B(a.dc),a.Lb&&(b.startAt+=","+B(a.xb)));a.na&&(b.endAt=B(a.ac),a.Rb&&(b.endAt+=","+B(a.vb)));a.ia&&(sd(a)?b.limitToFirst=a.ja:b.limitToLast=a.ja);return b}h.toString=function(){return B(ce(this))};function fe(a,b){this.yd=a;this.cc=b}fe.prototype.get=function(a){var b=w(this.yd,a);if(!b)throw Error("No index defined for "+a);return b===Pd?null:b};function ge(a,b,c){var d=na(a.yd,function(d,f){var g=w(a.cc,f);J(g,"Missing index implementation for "+f);if(d===Pd){if(g.Hc(b.S)){for(var k=[],l=c.Wb(Qb),m=H(l);m;)m.name!=b.name&&k.push(m),m=H(l);k.push(b);return he(k,ud(g))}return Pd}g=c.get(b.name);k=d;g&&(k=k.remove(new E(b.name,g)));return k.Na(b,b.S)});return new fe(d,a.cc)}
function ie(a,b,c){var d=na(a.yd,function(a){if(a===Pd)return a;var d=c.get(b.name);return d?a.remove(new E(b.name,d)):a});return new fe(d,a.cc)}var je=new fe({".priority":Pd},{".priority":M});function tc(a,b){this.C=a;J(n(this.C)&&null!==this.C,"LeafNode shouldn't be created with null/undefined value.");this.ba=b||C;ke(this.ba);this.Bb=null}h=tc.prototype;h.N=function(){return!0};h.A=function(){return this.ba};h.da=function(a){return new tc(this.C,a)};h.M=function(a){return".priority"===a?this.ba:C};h.oa=function(a){return a.e()?this:".priority"===O(a)?this.ba:C};h.Ha=function(){return!1};h.qf=function(){return null};
h.Q=function(a,b){return".priority"===a?this.da(b):b.e()&&".priority"!==a?this:C.Q(a,b).da(this.ba)};h.G=function(a,b){var c=O(a);if(null===c)return b;if(b.e()&&".priority"!==c)return this;J(".priority"!==c||1===uc(a),".priority must be the last token in a path");return this.Q(c,C.G(G(a),b))};h.e=function(){return!1};h.Db=function(){return 0};h.K=function(a){return a&&!this.A().e()?{".value":this.Ba(),".priority":this.A().K()}:this.Ba()};
h.hash=function(){if(null===this.Bb){var a="";this.ba.e()||(a+="priority:"+le(this.ba.K())+":");var b=typeof this.C,a=a+(b+":"),a="number"===b?a+Zc(this.C):a+this.C;this.Bb=Jc(a)}return this.Bb};h.Ba=function(){return this.C};h.Cc=function(a){if(a===C)return 1;if(a instanceof T)return-1;J(a.N(),"Unknown node type");var b=typeof a.C,c=typeof this.C,d=Na(me,b),e=Na(me,c);J(0<=d,"Unknown leaf type: "+b);J(0<=e,"Unknown leaf type: "+c);return d===e?"object"===c?0:this.C<a.C?-1:this.C===a.C?0:1:e-d};
var me=["object","boolean","number","string"];tc.prototype.mb=function(){return this};tc.prototype.Ic=function(){return!0};tc.prototype.Z=function(a){return a===this?!0:a.N()?this.C===a.C&&this.ba.Z(a.ba):!1};tc.prototype.toString=function(){return B(this.K(!0))};function T(a,b,c){this.m=a;(this.ba=b)&&ke(this.ba);a.e()&&J(!this.ba||this.ba.e(),"An empty node cannot have a priority");this.wb=c;this.Bb=null}h=T.prototype;h.N=function(){return!1};h.A=function(){return this.ba||C};h.da=function(a){return this.m.e()?this:new T(this.m,a,this.wb)};h.M=function(a){if(".priority"===a)return this.A();a=this.m.get(a);return null===a?C:a};h.oa=function(a){var b=O(a);return null===b?this:this.M(b).oa(G(a))};h.Ha=function(a){return null!==this.m.get(a)};
h.Q=function(a,b){J(b,"We should always be passing snapshot nodes");if(".priority"===a)return this.da(b);var c=new E(a,b),d,e;b.e()?(d=this.m.remove(a),c=ie(this.wb,c,this.m)):(d=this.m.Na(a,b),c=ge(this.wb,c,this.m));e=d.e()?C:this.ba;return new T(d,e,c)};h.G=function(a,b){var c=O(a);if(null===c)return b;J(".priority"!==O(a)||1===uc(a),".priority must be the last token in a path");var d=this.M(c).G(G(a),b);return this.Q(c,d)};h.e=function(){return this.m.e()};h.Db=function(){return this.m.count()};
var ne=/^(0|[1-9]\d*)$/;h=T.prototype;h.K=function(a){if(this.e())return null;var b={},c=0,d=0,e=!0;this.U(M,function(f,g){b[f]=g.K(a);c++;e&&ne.test(f)?d=Math.max(d,Number(f)):e=!1});if(!a&&e&&d<2*c){var f=[],g;for(g in b)f[g]=b[g];return f}a&&!this.A().e()&&(b[".priority"]=this.A().K());return b};h.hash=function(){if(null===this.Bb){var a="";this.A().e()||(a+="priority:"+le(this.A().K())+":");this.U(M,function(b,c){var d=c.hash();""!==d&&(a+=":"+b+":"+d)});this.Bb=""===a?"":Jc(a)}return this.Bb};
h.qf=function(a,b,c){return(c=oe(this,c))?(a=cc(c,new E(a,b)))?a.name:null:cc(this.m,a)};function wd(a,b){var c;c=(c=oe(a,b))?(c=c.Rc())&&c.name:a.m.Rc();return c?new E(c,a.m.get(c)):null}function xd(a,b){var c;c=(c=oe(a,b))?(c=c.ec())&&c.name:a.m.ec();return c?new E(c,a.m.get(c)):null}h.U=function(a,b){var c=oe(this,a);return c?c.ha(function(a){return b(a.name,a.S)}):this.m.ha(b)};h.Wb=function(a){return this.Xb(a.Sc(),a)};
h.Xb=function(a,b){var c=oe(this,b);if(c)return c.Xb(a,function(a){return a});for(var c=this.m.Xb(a.name,Qb),d=ec(c);null!=d&&0>b.compare(d,a);)H(c),d=ec(c);return c};h.rf=function(a){return this.Zb(a.Pc(),a)};h.Zb=function(a,b){var c=oe(this,b);if(c)return c.Zb(a,function(a){return a});for(var c=this.m.Zb(a.name,Qb),d=ec(c);null!=d&&0<b.compare(d,a);)H(c),d=ec(c);return c};h.Cc=function(a){return this.e()?a.e()?0:-1:a.N()||a.e()?1:a===Sd?-1:0};
h.mb=function(a){if(a===Vd||ta(this.wb.cc,a.toString()))return this;var b=this.wb,c=this.m;J(a!==Vd,"KeyIndex always exists and isn't meant to be added to the IndexMap.");for(var d=[],e=!1,c=c.Wb(Qb),f=H(c);f;)e=e||a.Hc(f.S),d.push(f),f=H(c);d=e?he(d,ud(a)):Pd;e=a.toString();c=xa(b.cc);c[e]=a;a=xa(b.yd);a[e]=d;return new T(this.m,this.ba,new fe(a,c))};h.Ic=function(a){return a===Vd||ta(this.wb.cc,a.toString())};
h.Z=function(a){if(a===this)return!0;if(a.N())return!1;if(this.A().Z(a.A())&&this.m.count()===a.m.count()){var b=this.Wb(M);a=a.Wb(M);for(var c=H(b),d=H(a);c&&d;){if(c.name!==d.name||!c.S.Z(d.S))return!1;c=H(b);d=H(a)}return null===c&&null===d}return!1};function oe(a,b){return b===Vd?null:a.wb.get(b.toString())}h.toString=function(){return B(this.K(!0))};function L(a,b){if(null===a)return C;var c=null;"object"===typeof a&&".priority"in a?c=a[".priority"]:"undefined"!==typeof b&&(c=b);J(null===c||"string"===typeof c||"number"===typeof c||"object"===typeof c&&".sv"in c,"Invalid priority type found: "+typeof c);"object"===typeof a&&".value"in a&&null!==a[".value"]&&(a=a[".value"]);if("object"!==typeof a||".sv"in a)return new tc(a,L(c));if(a instanceof Array){var d=C,e=a;r(e,function(a,b){if(u(e,b)&&"."!==b.substring(0,1)){var c=L(a);if(c.N()||!c.e())d=
d.Q(b,c)}});return d.da(L(c))}var f=[],g=!1,k=a;hb(k,function(a){if("string"!==typeof a||"."!==a.substring(0,1)){var b=L(k[a]);b.e()||(g=g||!b.A().e(),f.push(new E(a,b)))}});if(0==f.length)return C;var l=he(f,Rb,function(a){return a.name},Tb);if(g){var m=he(f,ud(M));return new T(l,L(c),new fe({".priority":m},{".priority":M}))}return new T(l,L(c),je)}var pe=Math.log(2);
function qe(a){this.count=parseInt(Math.log(a+1)/pe,10);this.hf=this.count-1;this.bg=a+1&parseInt(Array(this.count+1).join("1"),2)}function re(a){var b=!(a.bg&1<<a.hf);a.hf--;return b}
function he(a,b,c,d){function e(b,d){var f=d-b;if(0==f)return null;if(1==f){var m=a[b],v=c?c(m):m;return new fc(v,m.S,!1,null,null)}var m=parseInt(f/2,10)+b,f=e(b,m),y=e(m+1,d),m=a[m],v=c?c(m):m;return new fc(v,m.S,!1,f,y)}a.sort(b);var f=function(b){function d(b,g){var k=v-b,y=v;v-=b;var y=e(k+1,y),k=a[k],I=c?c(k):k,y=new fc(I,k.S,g,null,y);f?f.left=y:m=y;f=y}for(var f=null,m=null,v=a.length,y=0;y<b.count;++y){var I=re(b),vd=Math.pow(2,b.count-(y+1));I?d(vd,!1):(d(vd,!1),d(vd,!0))}return m}(new qe(a.length));
return null!==f?new ac(d||b,f):new ac(d||b)}function le(a){return"number"===typeof a?"number:"+Zc(a):"string:"+a}function ke(a){if(a.N()){var b=a.K();J("string"===typeof b||"number"===typeof b||"object"===typeof b&&u(b,".sv"),"Priority must be a string or number.")}else J(a===Sd||a.e(),"priority of unexpected type.");J(a===Sd||a.A().e(),"Priority nodes can't have a priority of their own.")}var C=new T(new ac(Tb),null,je);function se(){T.call(this,new ac(Tb),C,je)}ma(se,T);h=se.prototype;
h.Cc=function(a){return a===this?0:1};h.Z=function(a){return a===this};h.A=function(){return this};h.M=function(){return C};h.e=function(){return!1};var Sd=new se,Qd=new E("[MIN_NAME]",C),Xd=new E("[MAX_NAME]",Sd);function Id(a,b){this.D=a;this.Ud=b}function Fd(a,b,c,d){return new Id(new sb(b,c,d),a.Ud)}function Jd(a){return a.D.$?a.D.j():null}Id.prototype.u=function(){return this.Ud};function tb(a){return a.Ud.$?a.Ud.j():null};function te(a,b){this.V=a;var c=a.o,d=new ld(c.g),c=de(c)?new ld(c.g):c.ia?new rd(c):new md(c);this.Gf=new zd(c);var e=b.u(),f=b.D,g=d.ta(C,e.j(),null),k=c.ta(C,f.j(),null);this.Ka=new Id(new sb(k,f.$,c.Ga()),new sb(g,e.$,d.Ga()));this.Za=[];this.ig=new dd(a)}function ue(a){return a.V}h=te.prototype;h.u=function(){return this.Ka.u().j()};h.hb=function(a){var b=tb(this.Ka);return b&&(de(this.V.o)||!a.e()&&!b.M(O(a)).e())?b.oa(a):null};h.e=function(){return 0===this.Za.length};h.Ob=function(a){this.Za.push(a)};
h.kb=function(a,b){var c=[];if(b){J(null==a,"A cancel should cancel all event registrations.");var d=this.V.path;Oa(this.Za,function(a){(a=a.ff(b,d))&&c.push(a)})}if(a){for(var e=[],f=0;f<this.Za.length;++f){var g=this.Za[f];if(!g.matches(a))e.push(g);else if(a.sf()){e=e.concat(this.Za.slice(f+1));break}}this.Za=e}else this.Za=[];return c};
h.bb=function(a,b,c){a.type===Cd&&null!==a.source.Ib&&(J(tb(this.Ka),"We should always have a full cache before handling merges"),J(Jd(this.Ka),"Missing event cache, even though we have a server cache"));var d=this.Ka;a=this.Gf.bb(d,a,b,c);b=this.Gf;c=a.he;J(c.D.j().Ic(b.I.g),"Event snap not indexed");J(c.u().j().Ic(b.I.g),"Server snap not indexed");J(Hb(a.he.u())||!Hb(d.u()),"Once a server snap is complete, it should never go back");this.Ka=a.he;return ve(this,a.cg,a.he.D.j(),null)};
function we(a,b){var c=a.Ka.D,d=[];c.j().N()||c.j().U(M,function(a,b){d.push(new D("child_added",b,a))});c.$&&d.push(Db(c.j()));return ve(a,d,c.j(),b)}function ve(a,b,c,d){return ed(a.ig,b,c,d?[d]:a.Za)};function xe(a,b,c){this.type=Cd;this.source=a;this.path=b;this.children=c}xe.prototype.Wc=function(a){if(this.path.e())return a=this.children.subtree(new K(a)),a.e()?null:a.value?new Ub(this.source,F,a.value):new xe(this.source,F,a);J(O(this.path)===a,"Can't get a merge for a child not on the path of the operation");return new xe(this.source,G(this.path),this.children)};xe.prototype.toString=function(){return"Operation("+this.path+": "+this.source.toString()+" merge: "+this.children.toString()+")"};var Vb=0,Cd=1,Xb=2,$b=3;function ye(a,b,c,d){this.ve=a;this.of=b;this.Ib=c;this.af=d;J(!d||b,"Tagged queries must be from server.")}var Yb=new ye(!0,!1,null,!1),ze=new ye(!1,!0,null,!1);ye.prototype.toString=function(){return this.ve?"user":this.af?"server(queryID="+this.Ib+")":"server"};function Ae(a,b){this.f=Oc("p:rest:");this.H=a;this.Gb=b;this.Fa=null;this.aa={}}function Be(a,b){if(n(b))return"tag$"+b;var c=a.o;J(de(c)&&c.g==M,"should have a tag if it's not a default query.");return a.path.toString()}h=Ae.prototype;
h.xf=function(a,b,c,d){var e=a.path.toString();this.f("Listen called for "+e+" "+a.wa());var f=Be(a,c),g={};this.aa[f]=g;a=ee(a.o);var k=this;Ce(this,e+".json",a,function(a,b){var v=b;404===a&&(a=v=null);null===a&&k.Gb(e,v,!1,c);w(k.aa,f)===g&&d(a?401==a?"permission_denied":"rest_error:"+a:"ok",null)})};h.Of=function(a,b){var c=Be(a,b);delete this.aa[c]};h.P=function(a,b){this.Fa=a;var c=ad(a),d=c.data,c=c.Ac&&c.Ac.exp;b&&b("ok",{auth:d,expires:c})};h.ee=function(a){this.Fa=null;a("ok",null)};
h.Le=function(){};h.Bf=function(){};h.Gd=function(){};h.put=function(){};h.yf=function(){};h.Te=function(){};
function Ce(a,b,c,d){c=c||{};c.format="export";a.Fa&&(c.auth=a.Fa);var e=(a.H.lb?"https://":"http://")+a.H.host+b+"?"+jb(c);a.f("Sending REST request for "+e);var f=new XMLHttpRequest;f.onreadystatechange=function(){if(d&&4===f.readyState){a.f("REST Response for "+e+" received. status:",f.status,"response:",f.responseText);var b=null;if(200<=f.status&&300>f.status){try{b=mb(f.responseText)}catch(c){Q("Failed to parse JSON response for "+e+": "+f.responseText)}d(null,b)}else 401!==f.status&&404!==
f.status&&Q("Got unsuccessful REST response for "+e+" Status: "+f.status),d(f.status);d=null}};f.open("GET",e,!0);f.send()};function De(a,b){this.value=a;this.children=b||Ee}var Ee=new ac(function(a,b){return a===b?0:a<b?-1:1});function Fe(a){var b=Nd;r(a,function(a,d){b=b.set(new K(d),a)});return b}h=De.prototype;h.e=function(){return null===this.value&&this.children.e()};function Ge(a,b,c){if(null!=a.value&&c(a.value))return{path:F,value:a.value};if(b.e())return null;var d=O(b);a=a.children.get(d);return null!==a?(b=Ge(a,G(b),c),null!=b?{path:(new K(d)).w(b.path),value:b.value}:null):null}
function He(a,b){return Ge(a,b,function(){return!0})}h.subtree=function(a){if(a.e())return this;var b=this.children.get(O(a));return null!==b?b.subtree(G(a)):Nd};h.set=function(a,b){if(a.e())return new De(b,this.children);var c=O(a),d=(this.children.get(c)||Nd).set(G(a),b),c=this.children.Na(c,d);return new De(this.value,c)};
h.remove=function(a){if(a.e())return this.children.e()?Nd:new De(null,this.children);var b=O(a),c=this.children.get(b);return c?(a=c.remove(G(a)),b=a.e()?this.children.remove(b):this.children.Na(b,a),null===this.value&&b.e()?Nd:new De(this.value,b)):this};h.get=function(a){if(a.e())return this.value;var b=this.children.get(O(a));return b?b.get(G(a)):null};
function Md(a,b,c){if(b.e())return c;var d=O(b);b=Md(a.children.get(d)||Nd,G(b),c);d=b.e()?a.children.remove(d):a.children.Na(d,b);return new De(a.value,d)}function Ie(a,b){return Je(a,F,b)}function Je(a,b,c){var d={};a.children.ha(function(a,f){d[a]=Je(f,b.w(a),c)});return c(b,a.value,d)}function Ke(a,b,c){return Le(a,b,F,c)}function Le(a,b,c,d){var e=a.value?d(c,a.value):!1;if(e)return e;if(b.e())return null;e=O(b);return(a=a.children.get(e))?Le(a,G(b),c.w(e),d):null}
function Me(a,b,c){var d=F;if(!b.e()){var e=!0;a.value&&(e=c(d,a.value));!0===e&&(e=O(b),(a=a.children.get(e))&&Ne(a,G(b),d.w(e),c))}}function Ne(a,b,c,d){if(b.e())return a;a.value&&d(c,a.value);var e=O(b);return(a=a.children.get(e))?Ne(a,G(b),c.w(e),d):Nd}function Kd(a,b){Oe(a,F,b)}function Oe(a,b,c){a.children.ha(function(a,e){Oe(e,b.w(a),c)});a.value&&c(b,a.value)}function Pe(a,b){a.children.ha(function(a,d){d.value&&b(a,d.value)})}var Nd=new De(null);
De.prototype.toString=function(){var a={};Kd(this,function(b,c){a[b.toString()]=c.toString()});return B(a)};function Qe(a){this.W=a}var Re=new Qe(new De(null));function Se(a,b,c){if(b.e())return new Qe(new De(c));var d=He(a.W,b);if(null!=d){var e=d.path,d=d.value;b=N(e,b);d=d.G(b,c);return new Qe(a.W.set(e,d))}a=Md(a.W,b,new De(c));return new Qe(a)}function Te(a,b,c){var d=a;hb(c,function(a,c){d=Se(d,b.w(a),c)});return d}Qe.prototype.Od=function(a){if(a.e())return Re;a=Md(this.W,a,Nd);return new Qe(a)};function Ue(a,b){var c=He(a.W,b);return null!=c?a.W.get(c.path).oa(N(c.path,b)):null}
function Ve(a){var b=[],c=a.W.value;null!=c?c.N()||c.U(M,function(a,c){b.push(new E(a,c))}):a.W.children.ha(function(a,c){null!=c.value&&b.push(new E(a,c.value))});return b}function We(a,b){if(b.e())return a;var c=Ue(a,b);return null!=c?new Qe(new De(c)):new Qe(a.W.subtree(b))}Qe.prototype.e=function(){return this.W.e()};Qe.prototype.apply=function(a){return Xe(F,this.W,a)};
function Xe(a,b,c){if(null!=b.value)return c.G(a,b.value);var d=null;b.children.ha(function(b,f){".priority"===b?(J(null!==f.value,"Priority writes must always be leaf nodes"),d=f.value):c=Xe(a.w(b),f,c)});c.oa(a).e()||null===d||(c=c.G(a.w(".priority"),d));return c};function Ye(){this.T=Re;this.za=[];this.Lc=-1}h=Ye.prototype;
h.Od=function(a){var b=Ua(this.za,function(b){return b.ie===a});J(0<=b,"removeWrite called with nonexistent writeId.");var c=this.za[b];this.za.splice(b,1);for(var d=c.visible,e=!1,f=this.za.length-1;d&&0<=f;){var g=this.za[f];g.visible&&(f>=b&&Ze(g,c.path)?d=!1:c.path.contains(g.path)&&(e=!0));f--}if(d){if(e)this.T=$e(this.za,af,F),this.Lc=0<this.za.length?this.za[this.za.length-1].ie:-1;else if(c.Ia)this.T=this.T.Od(c.path);else{var k=this;r(c.children,function(a,b){k.T=k.T.Od(c.path.w(b))})}return c.path}return null};
h.ua=function(a,b,c,d){if(c||d){var e=We(this.T,a);return!d&&e.e()?b:d||null!=b||null!=Ue(e,F)?(e=$e(this.za,function(b){return(b.visible||d)&&(!c||!(0<=Na(c,b.ie)))&&(b.path.contains(a)||a.contains(b.path))},a),b=b||C,e.apply(b)):null}e=Ue(this.T,a);if(null!=e)return e;e=We(this.T,a);return e.e()?b:null!=b||null!=Ue(e,F)?(b=b||C,e.apply(b)):null};
h.xc=function(a,b){var c=C,d=Ue(this.T,a);if(d)d.N()||d.U(M,function(a,b){c=c.Q(a,b)});else if(b){var e=We(this.T,a);b.U(M,function(a,b){var d=We(e,new K(a)).apply(b);c=c.Q(a,d)});Oa(Ve(e),function(a){c=c.Q(a.name,a.S)})}else e=We(this.T,a),Oa(Ve(e),function(a){c=c.Q(a.name,a.S)});return c};h.hd=function(a,b,c,d){J(c||d,"Either existingEventSnap or existingServerSnap must exist");a=a.w(b);if(null!=Ue(this.T,a))return null;a=We(this.T,a);return a.e()?d.oa(b):a.apply(d.oa(b))};
h.Xa=function(a,b,c){a=a.w(b);var d=Ue(this.T,a);return null!=d?d:rb(c,b)?We(this.T,a).apply(c.j().M(b)):null};h.sc=function(a){return Ue(this.T,a)};h.me=function(a,b,c,d,e,f){var g;a=We(this.T,a);g=Ue(a,F);if(null==g)if(null!=b)g=a.apply(b);else return[];g=g.mb(f);if(g.e()||g.N())return[];b=[];a=ud(f);e=e?g.Zb(c,f):g.Xb(c,f);for(f=H(e);f&&b.length<d;)0!==a(f,c)&&b.push(f),f=H(e);return b};
function Ze(a,b){return a.Ia?a.path.contains(b):!!ua(a.children,function(c,d){return a.path.w(d).contains(b)})}function af(a){return a.visible}
function $e(a,b,c){for(var d=Re,e=0;e<a.length;++e){var f=a[e];if(b(f)){var g=f.path;if(f.Ia)c.contains(g)?(g=N(c,g),d=Se(d,g,f.Ia)):g.contains(c)&&(g=N(g,c),d=Se(d,F,f.Ia.oa(g)));else if(f.children)if(c.contains(g))g=N(c,g),d=Te(d,g,f.children);else{if(g.contains(c))if(g=N(g,c),g.e())d=Te(d,F,f.children);else if(f=w(f.children,O(g)))f=f.oa(G(g)),d=Se(d,F,f)}else throw Hc("WriteRecord should have .snap or .children");}}return d}function bf(a,b){this.Mb=a;this.W=b}h=bf.prototype;
h.ua=function(a,b,c){return this.W.ua(this.Mb,a,b,c)};h.xc=function(a){return this.W.xc(this.Mb,a)};h.hd=function(a,b,c){return this.W.hd(this.Mb,a,b,c)};h.sc=function(a){return this.W.sc(this.Mb.w(a))};h.me=function(a,b,c,d,e){return this.W.me(this.Mb,a,b,c,d,e)};h.Xa=function(a,b){return this.W.Xa(this.Mb,a,b)};h.w=function(a){return new bf(this.Mb.w(a),this.W)};function cf(){this.ya={}}h=cf.prototype;h.e=function(){return wa(this.ya)};h.bb=function(a,b,c){var d=a.source.Ib;if(null!==d)return d=w(this.ya,d),J(null!=d,"SyncTree gave us an op for an invalid query."),d.bb(a,b,c);var e=[];r(this.ya,function(d){e=e.concat(d.bb(a,b,c))});return e};h.Ob=function(a,b,c,d,e){var f=a.wa(),g=w(this.ya,f);if(!g){var g=c.ua(e?d:null),k=!1;g?k=!0:(g=d instanceof T?c.xc(d):C,k=!1);g=new te(a,new Id(new sb(g,k,!1),new sb(d,e,!1)));this.ya[f]=g}g.Ob(b);return we(g,b)};
h.kb=function(a,b,c){var d=a.wa(),e=[],f=[],g=null!=df(this);if("default"===d){var k=this;r(this.ya,function(a,d){f=f.concat(a.kb(b,c));a.e()&&(delete k.ya[d],de(a.V.o)||e.push(a.V))})}else{var l=w(this.ya,d);l&&(f=f.concat(l.kb(b,c)),l.e()&&(delete this.ya[d],de(l.V.o)||e.push(l.V)))}g&&null==df(this)&&e.push(new U(a.k,a.path));return{Hg:e,jg:f}};function ef(a){return Pa(ra(a.ya),function(a){return!de(a.V.o)})}h.hb=function(a){var b=null;r(this.ya,function(c){b=b||c.hb(a)});return b};
function ff(a,b){if(de(b.o))return df(a);var c=b.wa();return w(a.ya,c)}function df(a){return va(a.ya,function(a){return de(a.V.o)})||null};function gf(a){this.sa=Nd;this.Hb=new Ye;this.$e={};this.kc={};this.Mc=a}function hf(a,b,c,d,e){var f=a.Hb,g=e;J(d>f.Lc,"Stacking an older write on top of newer ones");n(g)||(g=!0);f.za.push({path:b,Ia:c,ie:d,visible:g});g&&(f.T=Se(f.T,b,c));f.Lc=d;return e?jf(a,new Ub(Yb,b,c)):[]}function kf(a,b,c,d){var e=a.Hb;J(d>e.Lc,"Stacking an older merge on top of newer ones");e.za.push({path:b,children:c,ie:d,visible:!0});e.T=Te(e.T,b,c);e.Lc=d;c=Fe(c);return jf(a,new xe(Yb,b,c))}
function lf(a,b,c){c=c||!1;b=a.Hb.Od(b);return null==b?[]:jf(a,new Wb(b,c))}function mf(a,b,c){c=Fe(c);return jf(a,new xe(ze,b,c))}function nf(a,b,c,d){d=of(a,d);if(null!=d){var e=pf(d);d=e.path;e=e.Ib;b=N(d,b);c=new Ub(new ye(!1,!0,e,!0),b,c);return qf(a,d,c)}return[]}function rf(a,b,c,d){if(d=of(a,d)){var e=pf(d);d=e.path;e=e.Ib;b=N(d,b);c=Fe(c);c=new xe(new ye(!1,!0,e,!0),b,c);return qf(a,d,c)}return[]}
gf.prototype.Ob=function(a,b){var c=a.path,d=null,e=!1;Me(this.sa,c,function(a,b){var f=N(a,c);d=b.hb(f);e=e||null!=df(b);return!d});var f=this.sa.get(c);f?(e=e||null!=df(f),d=d||f.hb(F)):(f=new cf,this.sa=this.sa.set(c,f));var g;null!=d?g=!0:(g=!1,d=C,Pe(this.sa.subtree(c),function(a,b){var c=b.hb(F);c&&(d=d.Q(a,c))}));var k=null!=ff(f,a);if(!k&&!de(a.o)){var l=sf(a);J(!(l in this.kc),"View does not exist, but we have a tag");var m=tf++;this.kc[l]=m;this.$e["_"+m]=l}g=f.Ob(a,b,new bf(c,this.Hb),
d,g);k||e||(f=ff(f,a),g=g.concat(uf(this,a,f)));return g};
gf.prototype.kb=function(a,b,c){var d=a.path,e=this.sa.get(d),f=[];if(e&&("default"===a.wa()||null!=ff(e,a))){f=e.kb(a,b,c);e.e()&&(this.sa=this.sa.remove(d));e=f.Hg;f=f.jg;b=-1!==Ua(e,function(a){return de(a.o)});var g=Ke(this.sa,d,function(a,b){return null!=df(b)});if(b&&!g&&(d=this.sa.subtree(d),!d.e()))for(var d=vf(d),k=0;k<d.length;++k){var l=d[k],m=l.V,l=wf(this,l);this.Mc.Xe(m,xf(this,m),l.ud,l.J)}if(!g&&0<e.length&&!c)if(b)this.Mc.Zd(a,null);else{var v=this;Oa(e,function(a){a.wa();var b=v.kc[sf(a)];
v.Mc.Zd(a,b)})}yf(this,e)}return f};gf.prototype.ua=function(a,b){var c=this.Hb,d=Ke(this.sa,a,function(b,c){var d=N(b,a);if(d=c.hb(d))return d});return c.ua(a,d,b,!0)};function vf(a){return Ie(a,function(a,c,d){if(c&&null!=df(c))return[df(c)];var e=[];c&&(e=ef(c));r(d,function(a){e=e.concat(a)});return e})}function yf(a,b){for(var c=0;c<b.length;++c){var d=b[c];if(!de(d.o)){var d=sf(d),e=a.kc[d];delete a.kc[d];delete a.$e["_"+e]}}}
function uf(a,b,c){var d=b.path,e=xf(a,b);c=wf(a,c);b=a.Mc.Xe(b,e,c.ud,c.J);d=a.sa.subtree(d);if(e)J(null==df(d.value),"If we're adding a query, it shouldn't be shadowed");else for(e=Ie(d,function(a,b,c){if(!a.e()&&b&&null!=df(b))return[ue(df(b))];var d=[];b&&(d=d.concat(Qa(ef(b),function(a){return a.V})));r(c,function(a){d=d.concat(a)});return d}),d=0;d<e.length;++d)c=e[d],a.Mc.Zd(c,xf(a,c));return b}
function wf(a,b){var c=b.V,d=xf(a,c);return{ud:function(){return(b.u()||C).hash()},J:function(b){if("ok"===b){if(d){var f=c.path;if(b=of(a,d)){var g=pf(b);b=g.path;g=g.Ib;f=N(b,f);f=new Zb(new ye(!1,!0,g,!0),f);b=qf(a,b,f)}else b=[]}else b=jf(a,new Zb(ze,c.path));return b}f="Unknown Error";"too_big"===b?f="The data requested exceeds the maximum size that can be accessed with a single request.":"permission_denied"==b?f="Client doesn't have permission to access the desired data.":"unavailable"==b&&
(f="The service is unavailable");f=Error(b+": "+f);f.code=b.toUpperCase();return a.kb(c,null,f)}}}function sf(a){return a.path.toString()+"$"+a.wa()}function pf(a){var b=a.indexOf("$");J(-1!==b&&b<a.length-1,"Bad queryKey.");return{Ib:a.substr(b+1),path:new K(a.substr(0,b))}}function of(a,b){var c=a.$e,d="_"+b;return d in c?c[d]:void 0}function xf(a,b){var c=sf(b);return w(a.kc,c)}var tf=1;
function qf(a,b,c){var d=a.sa.get(b);J(d,"Missing sync point for query tag that we're tracking");return d.bb(c,new bf(b,a.Hb),null)}function jf(a,b){return zf(a,b,a.sa,null,new bf(F,a.Hb))}function zf(a,b,c,d,e){if(b.path.e())return Af(a,b,c,d,e);var f=c.get(F);null==d&&null!=f&&(d=f.hb(F));var g=[],k=O(b.path),l=b.Wc(k);if((c=c.children.get(k))&&l)var m=d?d.M(k):null,k=e.w(k),g=g.concat(zf(a,l,c,m,k));f&&(g=g.concat(f.bb(b,e,d)));return g}
function Af(a,b,c,d,e){var f=c.get(F);null==d&&null!=f&&(d=f.hb(F));var g=[];c.children.ha(function(c,f){var m=d?d.M(c):null,v=e.w(c),y=b.Wc(c);y&&(g=g.concat(Af(a,y,f,m,v)))});f&&(g=g.concat(f.bb(b,e,d)));return g};function Bf(){this.children={};this.kd=0;this.value=null}function Cf(a,b,c){this.Dd=a?a:"";this.Yc=b?b:null;this.B=c?c:new Bf}function Df(a,b){for(var c=b instanceof K?b:new K(b),d=a,e;null!==(e=O(c));)d=new Cf(e,d,w(d.B.children,e)||new Bf),c=G(c);return d}h=Cf.prototype;h.Ba=function(){return this.B.value};function Ef(a,b){J("undefined"!==typeof b,"Cannot set value to undefined");a.B.value=b;Ff(a)}h.clear=function(){this.B.value=null;this.B.children={};this.B.kd=0;Ff(this)};
h.td=function(){return 0<this.B.kd};h.e=function(){return null===this.Ba()&&!this.td()};h.U=function(a){var b=this;r(this.B.children,function(c,d){a(new Cf(d,b,c))})};function Gf(a,b,c,d){c&&!d&&b(a);a.U(function(a){Gf(a,b,!0,d)});c&&d&&b(a)}function Hf(a,b){for(var c=a.parent();null!==c&&!b(c);)c=c.parent()}h.path=function(){return new K(null===this.Yc?this.Dd:this.Yc.path()+"/"+this.Dd)};h.name=function(){return this.Dd};h.parent=function(){return this.Yc};
function Ff(a){if(null!==a.Yc){var b=a.Yc,c=a.Dd,d=a.e(),e=u(b.B.children,c);d&&e?(delete b.B.children[c],b.B.kd--,Ff(b)):d||e||(b.B.children[c]=a.B,b.B.kd++,Ff(b))}};function If(a){J(ea(a)&&0<a.length,"Requires a non-empty array");this.Uf=a;this.Nc={}}If.prototype.de=function(a,b){for(var c=this.Nc[a]||[],d=0;d<c.length;d++)c[d].yc.apply(c[d].Ma,Array.prototype.slice.call(arguments,1))};If.prototype.Eb=function(a,b,c){Jf(this,a);this.Nc[a]=this.Nc[a]||[];this.Nc[a].push({yc:b,Ma:c});(a=this.ze(a))&&b.apply(c,a)};If.prototype.gc=function(a,b,c){Jf(this,a);a=this.Nc[a]||[];for(var d=0;d<a.length;d++)if(a[d].yc===b&&(!c||c===a[d].Ma)){a.splice(d,1);break}};
function Jf(a,b){J(Ta(a.Uf,function(a){return a===b}),"Unknown event: "+b)};var Kf=function(){var a=0,b=[];return function(c){var d=c===a;a=c;for(var e=Array(8),f=7;0<=f;f--)e[f]="-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz".charAt(c%64),c=Math.floor(c/64);J(0===c,"Cannot push at time == 0");c=e.join("");if(d){for(f=11;0<=f&&63===b[f];f--)b[f]=0;b[f]++}else for(f=0;12>f;f++)b[f]=Math.floor(64*Math.random());for(f=0;12>f;f++)c+="-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz".charAt(b[f]);J(20===c.length,"nextPushId: Length should be 20.");
return c}}();function Lf(){If.call(this,["online"]);this.ic=!0;if("undefined"!==typeof window&&"undefined"!==typeof window.addEventListener){var a=this;window.addEventListener("online",function(){a.ic||(a.ic=!0,a.de("online",!0))},!1);window.addEventListener("offline",function(){a.ic&&(a.ic=!1,a.de("online",!1))},!1)}}ma(Lf,If);Lf.prototype.ze=function(a){J("online"===a,"Unknown event type: "+a);return[this.ic]};ca(Lf);function Mf(){If.call(this,["visible"]);var a,b;"undefined"!==typeof document&&"undefined"!==typeof document.addEventListener&&("undefined"!==typeof document.hidden?(b="visibilitychange",a="hidden"):"undefined"!==typeof document.mozHidden?(b="mozvisibilitychange",a="mozHidden"):"undefined"!==typeof document.msHidden?(b="msvisibilitychange",a="msHidden"):"undefined"!==typeof document.webkitHidden&&(b="webkitvisibilitychange",a="webkitHidden"));this.uc=!0;if(b){var c=this;document.addEventListener(b,
function(){var b=!document[a];b!==c.uc&&(c.uc=b,c.de("visible",b))},!1)}}ma(Mf,If);Mf.prototype.ze=function(a){J("visible"===a,"Unknown event type: "+a);return[this.uc]};ca(Mf);var Nf=/[\[\].#$\/\u0000-\u001F\u007F]/,Of=/[\[\].#$\u0000-\u001F\u007F]/;function Pf(a){return p(a)&&0!==a.length&&!Nf.test(a)}function Qf(a){return null===a||p(a)||ga(a)&&!Sc(a)||ia(a)&&u(a,".sv")}function Rf(a,b,c,d){d&&!n(b)||Sf(z(a,1,d),b,c)}
function Sf(a,b,c){c instanceof K&&(c=new wc(c,a));if(!n(b))throw Error(a+"contains undefined "+zc(c));if(ha(b))throw Error(a+"contains a function "+zc(c)+" with contents: "+b.toString());if(Sc(b))throw Error(a+"contains "+b.toString()+" "+zc(c));if(p(b)&&b.length>10485760/3&&10485760<xc(b))throw Error(a+"contains a string greater than 10485760 utf8 bytes "+zc(c)+" ('"+b.substring(0,50)+"...')");if(ia(b)){var d=!1,e=!1;hb(b,function(b,g){if(".value"===b)d=!0;else if(".priority"!==b&&".sv"!==b&&(e=
!0,!Pf(b)))throw Error(a+" contains an invalid key ("+b+") "+zc(c)+'.  Keys must be non-empty strings and can\'t contain ".", "#", "$", "/", "[", or "]"');c.push(b);Sf(a,g,c);c.pop()});if(d&&e)throw Error(a+' contains ".value" child '+zc(c)+" in addition to actual children.");}}
function Tf(a,b,c){if(!ia(b)||ea(b))throw Error(z(a,1,!1)+" must be an Object containing the children to replace.");if(u(b,".value"))throw Error(z(a,1,!1)+' must not contain ".value".  To overwrite with a leaf value, just use .set() instead.');Rf(a,b,c,!1)}
function Uf(a,b,c){if(Sc(c))throw Error(z(a,b,!1)+"is "+c.toString()+", but must be a valid Firebase priority (a string, finite number, server value, or null).");if(!Qf(c))throw Error(z(a,b,!1)+"must be a valid Firebase priority (a string, finite number, server value, or null).");}
function Vf(a,b,c){if(!c||n(b))switch(b){case "value":case "child_added":case "child_removed":case "child_changed":case "child_moved":break;default:throw Error(z(a,1,c)+'must be a valid event type: "value", "child_added", "child_removed", "child_changed", or "child_moved".');}}function Wf(a,b,c,d){if((!d||n(c))&&!Pf(c))throw Error(z(a,b,d)+'was an invalid key: "'+c+'".  Firebase keys must be non-empty strings and can\'t contain ".", "#", "$", "/", "[", or "]").');}
function Xf(a,b){if(!p(b)||0===b.length||Of.test(b))throw Error(z(a,1,!1)+'was an invalid path: "'+b+'". Paths must be non-empty strings and can\'t contain ".", "#", "$", "[", or "]"');}function Yf(a,b){if(".info"===O(b))throw Error(a+" failed: Can't modify data under /.info/");}function Zf(a,b){if(!p(b))throw Error(z(a,1,!1)+"must be a valid credential (a string).");}function $f(a,b,c){if(!p(c))throw Error(z(a,b,!1)+"must be a valid string.");}
function ag(a,b,c,d){if(!d||n(c))if(!ia(c)||null===c)throw Error(z(a,b,d)+"must be a valid object.");}function bg(a,b,c){if(!ia(b)||null===b||!u(b,c))throw Error(z(a,1,!1)+'must contain the key "'+c+'"');if(!p(w(b,c)))throw Error(z(a,1,!1)+'must contain the key "'+c+'" with type "string"');};function cg(){this.set={}}h=cg.prototype;h.add=function(a,b){this.set[a]=null!==b?b:!0};h.contains=function(a){return u(this.set,a)};h.get=function(a){return this.contains(a)?this.set[a]:void 0};h.remove=function(a){delete this.set[a]};h.clear=function(){this.set={}};h.e=function(){return wa(this.set)};h.count=function(){return pa(this.set)};function dg(a,b){r(a.set,function(a,d){b(d,a)})}h.keys=function(){var a=[];r(this.set,function(b,c){a.push(c)});return a};function qc(){this.m=this.C=null}qc.prototype.find=function(a){if(null!=this.C)return this.C.oa(a);if(a.e()||null==this.m)return null;var b=O(a);a=G(a);return this.m.contains(b)?this.m.get(b).find(a):null};qc.prototype.mc=function(a,b){if(a.e())this.C=b,this.m=null;else if(null!==this.C)this.C=this.C.G(a,b);else{null==this.m&&(this.m=new cg);var c=O(a);this.m.contains(c)||this.m.add(c,new qc);c=this.m.get(c);a=G(a);c.mc(a,b)}};
function eg(a,b){if(b.e())return a.C=null,a.m=null,!0;if(null!==a.C){if(a.C.N())return!1;var c=a.C;a.C=null;c.U(M,function(b,c){a.mc(new K(b),c)});return eg(a,b)}return null!==a.m?(c=O(b),b=G(b),a.m.contains(c)&&eg(a.m.get(c),b)&&a.m.remove(c),a.m.e()?(a.m=null,!0):!1):!0}function rc(a,b,c){null!==a.C?c(b,a.C):a.U(function(a,e){var f=new K(b.toString()+"/"+a);rc(e,f,c)})}qc.prototype.U=function(a){null!==this.m&&dg(this.m,function(b,c){a(b,c)})};var fg="auth.firebase.com";function gg(a,b,c){this.ld=a||{};this.ce=b||{};this.ab=c||{};this.ld.remember||(this.ld.remember="default")}var hg=["remember","redirectTo"];function ig(a){var b={},c={};hb(a||{},function(a,e){0<=Na(hg,a)?b[a]=e:c[a]=e});return new gg(b,{},c)};function jg(a,b){this.Pe=["session",a.Ld,a.Cb].join(":");this.$d=b}jg.prototype.set=function(a,b){if(!b)if(this.$d.length)b=this.$d[0];else throw Error("fb.login.SessionManager : No storage options available!");b.set(this.Pe,a)};jg.prototype.get=function(){var a=Qa(this.$d,q(this.ng,this)),a=Pa(a,function(a){return null!==a});Xa(a,function(a,c){return bd(c.token)-bd(a.token)});return 0<a.length?a.shift():null};jg.prototype.ng=function(a){try{var b=a.get(this.Pe);if(b&&b.token)return b}catch(c){}return null};
jg.prototype.clear=function(){var a=this;Oa(this.$d,function(b){b.remove(a.Pe)})};function kg(){return"undefined"!==typeof window&&!!(window.cordova||window.phonegap||window.PhoneGap)&&/ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(navigator.userAgent)}function lg(){return"undefined"!==typeof location&&/^file:\//.test(location.href)}
function mg(){if("undefined"===typeof navigator)return!1;var a=navigator.userAgent;if("Microsoft Internet Explorer"===navigator.appName){if((a=a.match(/MSIE ([0-9]{1,}[\.0-9]{0,})/))&&1<a.length)return 8<=parseFloat(a[1])}else if(-1<a.indexOf("Trident")&&(a=a.match(/rv:([0-9]{2,2}[\.0-9]{0,})/))&&1<a.length)return 8<=parseFloat(a[1]);return!1};function ng(){var a=window.opener.frames,b;for(b=a.length-1;0<=b;b--)try{if(a[b].location.protocol===window.location.protocol&&a[b].location.host===window.location.host&&"__winchan_relay_frame"===a[b].name)return a[b]}catch(c){}return null}function og(a,b,c){a.attachEvent?a.attachEvent("on"+b,c):a.addEventListener&&a.addEventListener(b,c,!1)}function pg(a,b,c){a.detachEvent?a.detachEvent("on"+b,c):a.removeEventListener&&a.removeEventListener(b,c,!1)}
function qg(a){/^https?:\/\//.test(a)||(a=window.location.href);var b=/^(https?:\/\/[\-_a-zA-Z\.0-9:]+)/.exec(a);return b?b[1]:a}function rg(a){var b="";try{a=a.replace("#","");var c=kb(a);c&&u(c,"__firebase_request_key")&&(b=w(c,"__firebase_request_key"))}catch(d){}return b}function sg(){var a=Rc(fg);return a.scheme+"://"+a.host+"/v2"}function tg(a){return sg()+"/"+a+"/auth/channel"};function ug(a){var b=this;this.zc=a;this.ae="*";mg()?this.Qc=this.wd=ng():(this.Qc=window.opener,this.wd=window);if(!b.Qc)throw"Unable to find relay frame";og(this.wd,"message",q(this.hc,this));og(this.wd,"message",q(this.Af,this));try{vg(this,{a:"ready"})}catch(c){og(this.Qc,"load",function(){vg(b,{a:"ready"})})}og(window,"unload",q(this.yg,this))}function vg(a,b){b=B(b);mg()?a.Qc.doPost(b,a.ae):a.Qc.postMessage(b,a.ae)}
ug.prototype.hc=function(a){var b=this,c;try{c=mb(a.data)}catch(d){}c&&"request"===c.a&&(pg(window,"message",this.hc),this.ae=a.origin,this.zc&&setTimeout(function(){b.zc(b.ae,c.d,function(a,c){b.ag=!c;b.zc=void 0;vg(b,{a:"response",d:a,forceKeepWindowOpen:c})})},0))};ug.prototype.yg=function(){try{pg(this.wd,"message",this.Af)}catch(a){}this.zc&&(vg(this,{a:"error",d:"unknown closed window"}),this.zc=void 0);try{window.close()}catch(b){}};ug.prototype.Af=function(a){if(this.ag&&"die"===a.data)try{window.close()}catch(b){}};function wg(a){this.oc=Ga()+Ga()+Ga();this.Df=a}wg.prototype.open=function(a,b){P.set("redirect_request_id",this.oc);P.set("redirect_request_id",this.oc);b.requestId=this.oc;b.redirectTo=b.redirectTo||window.location.href;a+=(/\?/.test(a)?"":"?")+jb(b);window.location=a};wg.isAvailable=function(){return!lg()&&!kg()};wg.prototype.Bc=function(){return"redirect"};var xg={NETWORK_ERROR:"Unable to contact the Firebase server.",SERVER_ERROR:"An unknown server error occurred.",TRANSPORT_UNAVAILABLE:"There are no login transports available for the requested method.",REQUEST_INTERRUPTED:"The browser redirected the page before the login request could complete.",USER_CANCELLED:"The user cancelled authentication."};function yg(a){var b=Error(w(xg,a),a);b.code=a;return b};function zg(a){if(!a.window_features||"undefined"!==typeof navigator&&(-1!==navigator.userAgent.indexOf("Fennec/")||-1!==navigator.userAgent.indexOf("Firefox/")&&-1!==navigator.userAgent.indexOf("Android")))a.window_features=void 0;a.window_name||(a.window_name="_blank");this.options=a}
zg.prototype.open=function(a,b,c){function d(a){g&&(document.body.removeChild(g),g=void 0);v&&(v=clearInterval(v));pg(window,"message",e);pg(window,"unload",d);if(m&&!a)try{m.close()}catch(b){k.postMessage("die",l)}m=k=void 0}function e(a){if(a.origin===l)try{var b=mb(a.data);"ready"===b.a?k.postMessage(y,l):"error"===b.a?(d(!1),c&&(c(b.d),c=null)):"response"===b.a&&(d(b.forceKeepWindowOpen),c&&(c(null,b.d),c=null))}catch(e){}}var f=mg(),g,k;if(!this.options.relay_url)return c(Error("invalid arguments: origin of url and relay_url must match"));
var l=qg(a);if(l!==qg(this.options.relay_url))c&&setTimeout(function(){c(Error("invalid arguments: origin of url and relay_url must match"))},0);else{f&&(g=document.createElement("iframe"),g.setAttribute("src",this.options.relay_url),g.style.display="none",g.setAttribute("name","__winchan_relay_frame"),document.body.appendChild(g),k=g.contentWindow);a+=(/\?/.test(a)?"":"?")+jb(b);var m=window.open(a,this.options.window_name,this.options.window_features);k||(k=m);var v=setInterval(function(){m&&m.closed&&
(d(!1),c&&(c(yg("USER_CANCELLED")),c=null))},500),y=B({a:"request",d:b});og(window,"unload",d);og(window,"message",e)}};
zg.isAvailable=function(){return"postMessage"in window&&!lg()&&!(kg()||"undefined"!==typeof navigator&&(navigator.userAgent.match(/Windows Phone/)||window.Windows&&/^ms-appx:/.test(location.href))||"undefined"!==typeof navigator&&"undefined"!==typeof window&&(navigator.userAgent.match(/(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i)||navigator.userAgent.match(/CriOS/)||navigator.userAgent.match(/Twitter for iPhone/)||navigator.userAgent.match(/FBAN\/FBIOS/)||window.navigator.standalone))&&!("undefined"!==
typeof navigator&&navigator.userAgent.match(/PhantomJS/))};zg.prototype.Bc=function(){return"popup"};function Ag(a){a.method||(a.method="GET");a.headers||(a.headers={});a.headers.content_type||(a.headers.content_type="application/json");a.headers.content_type=a.headers.content_type.toLowerCase();this.options=a}
Ag.prototype.open=function(a,b,c){function d(){c&&(c(yg("REQUEST_INTERRUPTED")),c=null)}var e=new XMLHttpRequest,f=this.options.method.toUpperCase(),g;og(window,"beforeunload",d);e.onreadystatechange=function(){if(c&&4===e.readyState){var a;if(200<=e.status&&300>e.status){try{a=mb(e.responseText)}catch(b){}c(null,a)}else 500<=e.status&&600>e.status?c(yg("SERVER_ERROR")):c(yg("NETWORK_ERROR"));c=null;pg(window,"beforeunload",d)}};if("GET"===f)a+=(/\?/.test(a)?"":"?")+jb(b),g=null;else{var k=this.options.headers.content_type;
"application/json"===k&&(g=B(b));"application/x-www-form-urlencoded"===k&&(g=jb(b))}e.open(f,a,!0);a={"X-Requested-With":"XMLHttpRequest",Accept:"application/json;text/plain"};za(a,this.options.headers);for(var l in a)e.setRequestHeader(l,a[l]);e.send(g)};Ag.isAvailable=function(){return!!window.XMLHttpRequest&&"string"===typeof(new XMLHttpRequest).responseType&&(!("undefined"!==typeof navigator&&(navigator.userAgent.match(/MSIE/)||navigator.userAgent.match(/Trident/)))||mg())};Ag.prototype.Bc=function(){return"json"};function Bg(a){this.oc=Ga()+Ga()+Ga();this.Df=a}
Bg.prototype.open=function(a,b,c){function d(){c&&(c(yg("USER_CANCELLED")),c=null)}var e=this,f=Rc(fg),g;b.requestId=this.oc;b.redirectTo=f.scheme+"://"+f.host+"/blank/page.html";a+=/\?/.test(a)?"":"?";a+=jb(b);(g=window.open(a,"_blank","location=no"))&&ha(g.addEventListener)?(g.addEventListener("loadstart",function(a){var b;if(b=a&&a.url)a:{try{var m=document.createElement("a");m.href=a.url;b=m.host===f.host&&"/blank/page.html"===m.pathname;break a}catch(v){}b=!1}b&&(a=rg(a.url),g.removeEventListener("exit",
d),g.close(),a=new gg(null,null,{requestId:e.oc,requestKey:a}),e.Df.requestWithCredential("/auth/session",a,c),c=null)}),g.addEventListener("exit",d)):c(yg("TRANSPORT_UNAVAILABLE"))};Bg.isAvailable=function(){return kg()};Bg.prototype.Bc=function(){return"redirect"};function Cg(a){a.callback_parameter||(a.callback_parameter="callback");this.options=a;window.__firebase_auth_jsonp=window.__firebase_auth_jsonp||{}}
Cg.prototype.open=function(a,b,c){function d(){c&&(c(yg("REQUEST_INTERRUPTED")),c=null)}function e(){setTimeout(function(){window.__firebase_auth_jsonp[f]=void 0;wa(window.__firebase_auth_jsonp)&&(window.__firebase_auth_jsonp=void 0);try{var a=document.getElementById(f);a&&a.parentNode.removeChild(a)}catch(b){}},1);pg(window,"beforeunload",d)}var f="fn"+(new Date).getTime()+Math.floor(99999*Math.random());b[this.options.callback_parameter]="__firebase_auth_jsonp."+f;a+=(/\?/.test(a)?"":"?")+jb(b);
og(window,"beforeunload",d);window.__firebase_auth_jsonp[f]=function(a){c&&(c(null,a),c=null);e()};Dg(f,a,c)};
function Dg(a,b,c){setTimeout(function(){try{var d=document.createElement("script");d.type="text/javascript";d.id=a;d.async=!0;d.src=b;d.onerror=function(){var b=document.getElementById(a);null!==b&&b.parentNode.removeChild(b);c&&c(yg("NETWORK_ERROR"))};var e=document.getElementsByTagName("head");(e&&0!=e.length?e[0]:document.documentElement).appendChild(d)}catch(f){c&&c(yg("NETWORK_ERROR"))}},0)}Cg.isAvailable=function(){return!0};Cg.prototype.Bc=function(){return"json"};function Eg(a,b,c,d){If.call(this,["auth_status"]);this.H=a;this.df=b;this.Sg=c;this.Ke=d;this.rc=new jg(a,[Dc,P]);this.nb=null;this.Re=!1;Fg(this)}ma(Eg,If);h=Eg.prototype;h.we=function(){return this.nb||null};function Fg(a){P.get("redirect_request_id")&&Gg(a);var b=a.rc.get();b&&b.token?(Hg(a,b),a.df(b.token,function(c,d){Ig(a,c,d,!1,b.token,b)},function(b,d){Jg(a,"resumeSession()",b,d)})):Hg(a,null)}
function Kg(a,b,c,d,e,f){"firebaseio-demo.com"===a.H.domain&&Q("Firebase authentication is not supported on demo Firebases (*.firebaseio-demo.com). To secure your Firebase, create a production Firebase at https://www.firebase.com.");a.df(b,function(f,k){Ig(a,f,k,!0,b,c,d||{},e)},function(b,c){Jg(a,"auth()",b,c,f)})}function Lg(a,b){a.rc.clear();Hg(a,null);a.Sg(function(a,d){if("ok"===a)R(b,null);else{var e=(a||"error").toUpperCase(),f=e;d&&(f+=": "+d);f=Error(f);f.code=e;R(b,f)}})}
function Ig(a,b,c,d,e,f,g,k){"ok"===b?(d&&(b=c.auth,f.auth=b,f.expires=c.expires,f.token=cd(e)?e:"",c=null,b&&u(b,"uid")?c=w(b,"uid"):u(f,"uid")&&(c=w(f,"uid")),f.uid=c,c="custom",b&&u(b,"provider")?c=w(b,"provider"):u(f,"provider")&&(c=w(f,"provider")),f.provider=c,a.rc.clear(),cd(e)&&(g=g||{},c=Dc,"sessionOnly"===g.remember&&(c=P),"none"!==g.remember&&a.rc.set(f,c)),Hg(a,f)),R(k,null,f)):(a.rc.clear(),Hg(a,null),f=a=(b||"error").toUpperCase(),c&&(f+=": "+c),f=Error(f),f.code=a,R(k,f))}
function Jg(a,b,c,d,e){Q(b+" was canceled: "+d);a.rc.clear();Hg(a,null);a=Error(d);a.code=c.toUpperCase();R(e,a)}function Mg(a,b,c,d,e){Ng(a);c=new gg(d||{},{},c||{});Og(a,[Ag,Cg],"/auth/"+b,c,e)}
function Pg(a,b,c,d){Ng(a);var e=[zg,Bg];c=ig(c);"anonymous"===b||"password"===b?setTimeout(function(){R(d,yg("TRANSPORT_UNAVAILABLE"))},0):(c.ce.window_features="menubar=yes,modal=yes,alwaysRaised=yeslocation=yes,resizable=yes,scrollbars=yes,status=yes,height=625,width=625,top="+("object"===typeof screen?.5*(screen.height-625):0)+",left="+("object"===typeof screen?.5*(screen.width-625):0),c.ce.relay_url=tg(a.H.Cb),c.ce.requestWithCredential=q(a.pc,a),Og(a,e,"/auth/"+b,c,d))}
function Gg(a){var b=P.get("redirect_request_id");if(b){var c=P.get("redirect_client_options");P.remove("redirect_request_id");P.remove("redirect_client_options");var d=[Ag,Cg],b={requestId:b,requestKey:rg(document.location.hash)},c=new gg(c,{},b);a.Re=!0;try{document.location.hash=document.location.hash.replace(/&__firebase_request_key=([a-zA-z0-9]*)/,"")}catch(e){}Og(a,d,"/auth/session",c,function(){this.Re=!1}.bind(a))}}
h.re=function(a,b){Ng(this);var c=ig(a);c.ab._method="POST";this.pc("/users",c,function(a,c){a?R(b,a):R(b,a,c)})};h.Se=function(a,b){var c=this;Ng(this);var d="/users/"+encodeURIComponent(a.email),e=ig(a);e.ab._method="DELETE";this.pc(d,e,function(a,d){!a&&d&&d.uid&&c.nb&&c.nb.uid&&c.nb.uid===d.uid&&Lg(c);R(b,a)})};h.oe=function(a,b){Ng(this);var c="/users/"+encodeURIComponent(a.email)+"/password",d=ig(a);d.ab._method="PUT";d.ab.password=a.newPassword;this.pc(c,d,function(a){R(b,a)})};
h.ne=function(a,b){Ng(this);var c="/users/"+encodeURIComponent(a.oldEmail)+"/email",d=ig(a);d.ab._method="PUT";d.ab.email=a.newEmail;d.ab.password=a.password;this.pc(c,d,function(a){R(b,a)})};h.Ue=function(a,b){Ng(this);var c="/users/"+encodeURIComponent(a.email)+"/password",d=ig(a);d.ab._method="POST";this.pc(c,d,function(a){R(b,a)})};h.pc=function(a,b,c){Qg(this,[Ag,Cg],a,b,c)};
function Og(a,b,c,d,e){Qg(a,b,c,d,function(b,c){!b&&c&&c.token&&c.uid?Kg(a,c.token,c,d.ld,function(a,b){a?R(e,a):R(e,null,b)}):R(e,b||yg("UNKNOWN_ERROR"))})}
function Qg(a,b,c,d,e){b=Pa(b,function(a){return"function"===typeof a.isAvailable&&a.isAvailable()});0===b.length?setTimeout(function(){R(e,yg("TRANSPORT_UNAVAILABLE"))},0):(b=new (b.shift())(d.ce),d=ib(d.ab),d.v="js-2.2.5",d.transport=b.Bc(),d.suppress_status_codes=!0,a=sg()+"/"+a.H.Cb+c,b.open(a,d,function(a,b){if(a)R(e,a);else if(b&&b.error){var c=Error(b.error.message);c.code=b.error.code;c.details=b.error.details;R(e,c)}else R(e,null,b)}))}
function Hg(a,b){var c=null!==a.nb||null!==b;a.nb=b;c&&a.de("auth_status",b);a.Ke(null!==b)}h.ze=function(a){J("auth_status"===a,'initial event must be of type "auth_status"');return this.Re?null:[this.nb]};function Ng(a){var b=a.H;if("firebaseio.com"!==b.domain&&"firebaseio-demo.com"!==b.domain&&"auth.firebase.com"===fg)throw Error("This custom Firebase server ('"+a.H.domain+"') does not support delegated login.");};function Rg(a){this.hc=a;this.Kd=[];this.Qb=0;this.pe=-1;this.Fb=null}function Sg(a,b,c){a.pe=b;a.Fb=c;a.pe<a.Qb&&(a.Fb(),a.Fb=null)}function Tg(a,b,c){for(a.Kd[b]=c;a.Kd[a.Qb];){var d=a.Kd[a.Qb];delete a.Kd[a.Qb];for(var e=0;e<d.length;++e)if(d[e]){var f=a;Cb(function(){f.hc(d[e])})}if(a.Qb===a.pe){a.Fb&&(clearTimeout(a.Fb),a.Fb(),a.Fb=null);break}a.Qb++}};function Ug(a,b,c){this.qe=a;this.f=Oc(a);this.ob=this.pb=0;this.Va=Ob(b);this.Vd=c;this.Gc=!1;this.gd=function(a){b.host!==b.Oa&&(a.ns=b.Cb);var c=[],f;for(f in a)a.hasOwnProperty(f)&&c.push(f+"="+a[f]);return(b.lb?"https://":"http://")+b.Oa+"/.lp?"+c.join("&")}}var Vg,Wg;
Ug.prototype.open=function(a,b){this.gf=0;this.ka=b;this.zf=new Rg(a);this.zb=!1;var c=this;this.rb=setTimeout(function(){c.f("Timed out trying to connect.");c.ib();c.rb=null},Math.floor(3E4));Tc(function(){if(!c.zb){c.Ta=new Xg(function(a,b,d,k,l){Yg(c,arguments);if(c.Ta)if(c.rb&&(clearTimeout(c.rb),c.rb=null),c.Gc=!0,"start"==a)c.id=b,c.Ff=d;else if("close"===a)b?(c.Ta.Td=!1,Sg(c.zf,b,function(){c.ib()})):c.ib();else throw Error("Unrecognized command received: "+a);},function(a,b){Yg(c,arguments);
Tg(c.zf,a,b)},function(){c.ib()},c.gd);var a={start:"t"};a.ser=Math.floor(1E8*Math.random());c.Ta.fe&&(a.cb=c.Ta.fe);a.v="5";c.Vd&&(a.s=c.Vd);"undefined"!==typeof location&&location.href&&-1!==location.href.indexOf("firebaseio.com")&&(a.r="f");a=c.gd(a);c.f("Connecting via long-poll to "+a);Zg(c.Ta,a,function(){})}})};
Ug.prototype.start=function(){var a=this.Ta,b=this.Ff;a.rg=this.id;a.sg=b;for(a.ke=!0;$g(a););a=this.id;b=this.Ff;this.fc=document.createElement("iframe");var c={dframe:"t"};c.id=a;c.pw=b;this.fc.src=this.gd(c);this.fc.style.display="none";document.body.appendChild(this.fc)};Ug.isAvailable=function(){return Vg||!Wg&&"undefined"!==typeof document&&!("object"===typeof window&&window.chrome&&window.chrome.extension&&!/^chrome/.test(window.location.href))&&!("object"===typeof Windows&&"object"===typeof Windows.Ug)};
h=Ug.prototype;h.Bd=function(){};h.cd=function(){this.zb=!0;this.Ta&&(this.Ta.close(),this.Ta=null);this.fc&&(document.body.removeChild(this.fc),this.fc=null);this.rb&&(clearTimeout(this.rb),this.rb=null)};h.ib=function(){this.zb||(this.f("Longpoll is closing itself"),this.cd(),this.ka&&(this.ka(this.Gc),this.ka=null))};h.close=function(){this.zb||(this.f("Longpoll is being closed."),this.cd())};
h.send=function(a){a=B(a);this.pb+=a.length;Lb(this.Va,"bytes_sent",a.length);a=Kc(a);a=fb(a,!0);a=Xc(a,1840);for(var b=0;b<a.length;b++){var c=this.Ta;c.$c.push({Jg:this.gf,Rg:a.length,jf:a[b]});c.ke&&$g(c);this.gf++}};function Yg(a,b){var c=B(b).length;a.ob+=c;Lb(a.Va,"bytes_received",c)}
function Xg(a,b,c,d){this.gd=d;this.jb=c;this.Oe=new cg;this.$c=[];this.se=Math.floor(1E8*Math.random());this.Td=!0;this.fe=Gc();window["pLPCommand"+this.fe]=a;window["pRTLPCB"+this.fe]=b;a=document.createElement("iframe");a.style.display="none";if(document.body){document.body.appendChild(a);try{a.contentWindow.document||Bb("No IE domain setting required")}catch(e){a.src="javascript:void((function(){document.open();document.domain='"+document.domain+"';document.close();})())"}}else throw"Document body has not initialized. Wait to initialize Firebase until after the document is ready.";
a.contentDocument?a.gb=a.contentDocument:a.contentWindow?a.gb=a.contentWindow.document:a.document&&(a.gb=a.document);this.Ca=a;a="";this.Ca.src&&"javascript:"===this.Ca.src.substr(0,11)&&(a='<script>document.domain="'+document.domain+'";\x3c/script>');a="<html><body>"+a+"</body></html>";try{this.Ca.gb.open(),this.Ca.gb.write(a),this.Ca.gb.close()}catch(f){Bb("frame writing exception"),f.stack&&Bb(f.stack),Bb(f)}}
Xg.prototype.close=function(){this.ke=!1;if(this.Ca){this.Ca.gb.body.innerHTML="";var a=this;setTimeout(function(){null!==a.Ca&&(document.body.removeChild(a.Ca),a.Ca=null)},Math.floor(0))}var b=this.jb;b&&(this.jb=null,b())};
function $g(a){if(a.ke&&a.Td&&a.Oe.count()<(0<a.$c.length?2:1)){a.se++;var b={};b.id=a.rg;b.pw=a.sg;b.ser=a.se;for(var b=a.gd(b),c="",d=0;0<a.$c.length;)if(1870>=a.$c[0].jf.length+30+c.length){var e=a.$c.shift(),c=c+"&seg"+d+"="+e.Jg+"&ts"+d+"="+e.Rg+"&d"+d+"="+e.jf;d++}else break;ah(a,b+c,a.se);return!0}return!1}function ah(a,b,c){function d(){a.Oe.remove(c);$g(a)}a.Oe.add(c,1);var e=setTimeout(d,Math.floor(25E3));Zg(a,b,function(){clearTimeout(e);d()})}
function Zg(a,b,c){setTimeout(function(){try{if(a.Td){var d=a.Ca.gb.createElement("script");d.type="text/javascript";d.async=!0;d.src=b;d.onload=d.onreadystatechange=function(){var a=d.readyState;a&&"loaded"!==a&&"complete"!==a||(d.onload=d.onreadystatechange=null,d.parentNode&&d.parentNode.removeChild(d),c())};d.onerror=function(){Bb("Long-poll script failed to load: "+b);a.Td=!1;a.close()};a.Ca.gb.body.appendChild(d)}}catch(e){}},Math.floor(1))};var bh=null;"undefined"!==typeof MozWebSocket?bh=MozWebSocket:"undefined"!==typeof WebSocket&&(bh=WebSocket);function ch(a,b,c){this.qe=a;this.f=Oc(this.qe);this.frames=this.Jc=null;this.ob=this.pb=this.bf=0;this.Va=Ob(b);this.fb=(b.lb?"wss://":"ws://")+b.Oa+"/.ws?v=5";"undefined"!==typeof location&&location.href&&-1!==location.href.indexOf("firebaseio.com")&&(this.fb+="&r=f");b.host!==b.Oa&&(this.fb=this.fb+"&ns="+b.Cb);c&&(this.fb=this.fb+"&s="+c)}var dh;
ch.prototype.open=function(a,b){this.jb=b;this.wg=a;this.f("Websocket connecting to "+this.fb);this.Gc=!1;Dc.set("previous_websocket_failure",!0);try{this.va=new bh(this.fb)}catch(c){this.f("Error instantiating WebSocket.");var d=c.message||c.data;d&&this.f(d);this.ib();return}var e=this;this.va.onopen=function(){e.f("Websocket connected.");e.Gc=!0};this.va.onclose=function(){e.f("Websocket connection was disconnected.");e.va=null;e.ib()};this.va.onmessage=function(a){if(null!==e.va)if(a=a.data,e.ob+=
a.length,Lb(e.Va,"bytes_received",a.length),eh(e),null!==e.frames)fh(e,a);else{a:{J(null===e.frames,"We already have a frame buffer");if(6>=a.length){var b=Number(a);if(!isNaN(b)){e.bf=b;e.frames=[];a=null;break a}}e.bf=1;e.frames=[]}null!==a&&fh(e,a)}};this.va.onerror=function(a){e.f("WebSocket error.  Closing connection.");(a=a.message||a.data)&&e.f(a);e.ib()}};ch.prototype.start=function(){};
ch.isAvailable=function(){var a=!1;if("undefined"!==typeof navigator&&navigator.userAgent){var b=navigator.userAgent.match(/Android ([0-9]{0,}\.[0-9]{0,})/);b&&1<b.length&&4.4>parseFloat(b[1])&&(a=!0)}return!a&&null!==bh&&!dh};ch.responsesRequiredToBeHealthy=2;ch.healthyTimeout=3E4;h=ch.prototype;h.Bd=function(){Dc.remove("previous_websocket_failure")};function fh(a,b){a.frames.push(b);if(a.frames.length==a.bf){var c=a.frames.join("");a.frames=null;c=mb(c);a.wg(c)}}
h.send=function(a){eh(this);a=B(a);this.pb+=a.length;Lb(this.Va,"bytes_sent",a.length);a=Xc(a,16384);1<a.length&&this.va.send(String(a.length));for(var b=0;b<a.length;b++)this.va.send(a[b])};h.cd=function(){this.zb=!0;this.Jc&&(clearInterval(this.Jc),this.Jc=null);this.va&&(this.va.close(),this.va=null)};h.ib=function(){this.zb||(this.f("WebSocket is closing itself"),this.cd(),this.jb&&(this.jb(this.Gc),this.jb=null))};h.close=function(){this.zb||(this.f("WebSocket is being closed"),this.cd())};
function eh(a){clearInterval(a.Jc);a.Jc=setInterval(function(){a.va&&a.va.send("0");eh(a)},Math.floor(45E3))};function gh(a){hh(this,a)}var ih=[Ug,ch];function hh(a,b){var c=ch&&ch.isAvailable(),d=c&&!(Dc.uf||!0===Dc.get("previous_websocket_failure"));b.Tg&&(c||Q("wss:// URL used, but browser isn't known to support websockets.  Trying anyway."),d=!0);if(d)a.ed=[ch];else{var e=a.ed=[];Yc(ih,function(a,b){b&&b.isAvailable()&&e.push(b)})}}function jh(a){if(0<a.ed.length)return a.ed[0];throw Error("No transports available");};function kh(a,b,c,d,e,f){this.id=a;this.f=Oc("c:"+this.id+":");this.hc=c;this.Vc=d;this.ka=e;this.Me=f;this.H=b;this.Jd=[];this.ef=0;this.Nf=new gh(b);this.Ua=0;this.f("Connection created");lh(this)}
function lh(a){var b=jh(a.Nf);a.L=new b("c:"+a.id+":"+a.ef++,a.H);a.Qe=b.responsesRequiredToBeHealthy||0;var c=mh(a,a.L),d=nh(a,a.L);a.fd=a.L;a.bd=a.L;a.F=null;a.Ab=!1;setTimeout(function(){a.L&&a.L.open(c,d)},Math.floor(0));b=b.healthyTimeout||0;0<b&&(a.vd=setTimeout(function(){a.vd=null;a.Ab||(a.L&&102400<a.L.ob?(a.f("Connection exceeded healthy timeout but has received "+a.L.ob+" bytes.  Marking connection healthy."),a.Ab=!0,a.L.Bd()):a.L&&10240<a.L.pb?a.f("Connection exceeded healthy timeout but has sent "+
a.L.pb+" bytes.  Leaving connection alive."):(a.f("Closing unhealthy connection after timeout."),a.close()))},Math.floor(b)))}function nh(a,b){return function(c){b===a.L?(a.L=null,c||0!==a.Ua?1===a.Ua&&a.f("Realtime connection lost."):(a.f("Realtime connection failed."),"s-"===a.H.Oa.substr(0,2)&&(Dc.remove("host:"+a.H.host),a.H.Oa=a.H.host)),a.close()):b===a.F?(a.f("Secondary connection lost."),c=a.F,a.F=null,a.fd!==c&&a.bd!==c||a.close()):a.f("closing an old connection")}}
function mh(a,b){return function(c){if(2!=a.Ua)if(b===a.bd){var d=Vc("t",c);c=Vc("d",c);if("c"==d){if(d=Vc("t",c),"d"in c)if(c=c.d,"h"===d){var d=c.ts,e=c.v,f=c.h;a.Vd=c.s;Fc(a.H,f);0==a.Ua&&(a.L.start(),oh(a,a.L,d),"5"!==e&&Q("Protocol version mismatch detected"),c=a.Nf,(c=1<c.ed.length?c.ed[1]:null)&&ph(a,c))}else if("n"===d){a.f("recvd end transmission on primary");a.bd=a.F;for(c=0;c<a.Jd.length;++c)a.Fd(a.Jd[c]);a.Jd=[];qh(a)}else"s"===d?(a.f("Connection shutdown command received. Shutting down..."),
a.Me&&(a.Me(c),a.Me=null),a.ka=null,a.close()):"r"===d?(a.f("Reset packet received.  New host: "+c),Fc(a.H,c),1===a.Ua?a.close():(rh(a),lh(a))):"e"===d?Pc("Server Error: "+c):"o"===d?(a.f("got pong on primary."),sh(a),th(a)):Pc("Unknown control packet command: "+d)}else"d"==d&&a.Fd(c)}else if(b===a.F)if(d=Vc("t",c),c=Vc("d",c),"c"==d)"t"in c&&(c=c.t,"a"===c?uh(a):"r"===c?(a.f("Got a reset on secondary, closing it"),a.F.close(),a.fd!==a.F&&a.bd!==a.F||a.close()):"o"===c&&(a.f("got pong on secondary."),
a.Lf--,uh(a)));else if("d"==d)a.Jd.push(c);else throw Error("Unknown protocol layer: "+d);else a.f("message on old connection")}}kh.prototype.Da=function(a){vh(this,{t:"d",d:a})};function qh(a){a.fd===a.F&&a.bd===a.F&&(a.f("cleaning up and promoting a connection: "+a.F.qe),a.L=a.F,a.F=null)}
function uh(a){0>=a.Lf?(a.f("Secondary connection is healthy."),a.Ab=!0,a.F.Bd(),a.F.start(),a.f("sending client ack on secondary"),a.F.send({t:"c",d:{t:"a",d:{}}}),a.f("Ending transmission on primary"),a.L.send({t:"c",d:{t:"n",d:{}}}),a.fd=a.F,qh(a)):(a.f("sending ping on secondary."),a.F.send({t:"c",d:{t:"p",d:{}}}))}kh.prototype.Fd=function(a){sh(this);this.hc(a)};function sh(a){a.Ab||(a.Qe--,0>=a.Qe&&(a.f("Primary connection is healthy."),a.Ab=!0,a.L.Bd()))}
function ph(a,b){a.F=new b("c:"+a.id+":"+a.ef++,a.H,a.Vd);a.Lf=b.responsesRequiredToBeHealthy||0;a.F.open(mh(a,a.F),nh(a,a.F));setTimeout(function(){a.F&&(a.f("Timed out trying to upgrade."),a.F.close())},Math.floor(6E4))}function oh(a,b,c){a.f("Realtime connection established.");a.L=b;a.Ua=1;a.Vc&&(a.Vc(c),a.Vc=null);0===a.Qe?(a.f("Primary connection is healthy."),a.Ab=!0):setTimeout(function(){th(a)},Math.floor(5E3))}
function th(a){a.Ab||1!==a.Ua||(a.f("sending ping on primary."),vh(a,{t:"c",d:{t:"p",d:{}}}))}function vh(a,b){if(1!==a.Ua)throw"Connection is not connected";a.fd.send(b)}kh.prototype.close=function(){2!==this.Ua&&(this.f("Closing realtime connection."),this.Ua=2,rh(this),this.ka&&(this.ka(),this.ka=null))};function rh(a){a.f("Shutting down all connections");a.L&&(a.L.close(),a.L=null);a.F&&(a.F.close(),a.F=null);a.vd&&(clearTimeout(a.vd),a.vd=null)};function wh(a,b,c,d){this.id=xh++;this.f=Oc("p:"+this.id+":");this.wf=this.De=!1;this.aa={};this.pa=[];this.Xc=0;this.Uc=[];this.ma=!1;this.$a=1E3;this.Cd=3E5;this.Gb=b;this.Tc=c;this.Ne=d;this.H=a;this.We=null;this.Qd={};this.Ig=0;this.mf=!0;this.Kc=this.Fe=null;yh(this,0);Mf.ub().Eb("visible",this.zg,this);-1===a.host.indexOf("fblocal")&&Lf.ub().Eb("online",this.xg,this)}var xh=0,zh=0;h=wh.prototype;
h.Da=function(a,b,c){var d=++this.Ig;a={r:d,a:a,b:b};this.f(B(a));J(this.ma,"sendRequest call when we're not connected not allowed.");this.Sa.Da(a);c&&(this.Qd[d]=c)};h.xf=function(a,b,c,d){var e=a.wa(),f=a.path.toString();this.f("Listen called for "+f+" "+e);this.aa[f]=this.aa[f]||{};J(!this.aa[f][e],"listen() called twice for same path/queryId.");a={J:d,ud:b,Fg:a,tag:c};this.aa[f][e]=a;this.ma&&Ah(this,a)};
function Ah(a,b){var c=b.Fg,d=c.path.toString(),e=c.wa();a.f("Listen on "+d+" for "+e);var f={p:d};b.tag&&(f.q=ce(c.o),f.t=b.tag);f.h=b.ud();a.Da("q",f,function(f){var k=f.d,l=f.s;if(k&&"object"===typeof k&&u(k,"w")){var m=w(k,"w");ea(m)&&0<=Na(m,"no_index")&&Q("Using an unspecified index. Consider adding "+('".indexOn": "'+c.o.g.toString()+'"')+" at "+c.path.toString()+" to your security rules for better performance")}(a.aa[d]&&a.aa[d][e])===b&&(a.f("listen response",f),"ok"!==l&&Bh(a,d,e),b.J&&
b.J(l,k))})}h.P=function(a,b,c){this.Fa={fg:a,nf:!1,yc:b,jd:c};this.f("Authenticating using credential: "+a);Ch(this);(b=40==a.length)||(a=ad(a).Ac,b="object"===typeof a&&!0===w(a,"admin"));b&&(this.f("Admin auth credential detected.  Reducing max reconnect time."),this.Cd=3E4)};h.ee=function(a){delete this.Fa;this.ma&&this.Da("unauth",{},function(b){a(b.s,b.d)})};
function Ch(a){var b=a.Fa;a.ma&&b&&a.Da("auth",{cred:b.fg},function(c){var d=c.s;c=c.d||"error";"ok"!==d&&a.Fa===b&&delete a.Fa;b.nf?"ok"!==d&&b.jd&&b.jd(d,c):(b.nf=!0,b.yc&&b.yc(d,c))})}h.Of=function(a,b){var c=a.path.toString(),d=a.wa();this.f("Unlisten called for "+c+" "+d);if(Bh(this,c,d)&&this.ma){var e=ce(a.o);this.f("Unlisten on "+c+" for "+d);c={p:c};b&&(c.q=e,c.t=b);this.Da("n",c)}};h.Le=function(a,b,c){this.ma?Dh(this,"o",a,b,c):this.Uc.push({Zc:a,action:"o",data:b,J:c})};
h.Bf=function(a,b,c){this.ma?Dh(this,"om",a,b,c):this.Uc.push({Zc:a,action:"om",data:b,J:c})};h.Gd=function(a,b){this.ma?Dh(this,"oc",a,null,b):this.Uc.push({Zc:a,action:"oc",data:null,J:b})};function Dh(a,b,c,d,e){c={p:c,d:d};a.f("onDisconnect "+b,c);a.Da(b,c,function(a){e&&setTimeout(function(){e(a.s,a.d)},Math.floor(0))})}h.put=function(a,b,c,d){Eh(this,"p",a,b,c,d)};h.yf=function(a,b,c,d){Eh(this,"m",a,b,c,d)};
function Eh(a,b,c,d,e,f){d={p:c,d:d};n(f)&&(d.h=f);a.pa.push({action:b,If:d,J:e});a.Xc++;b=a.pa.length-1;a.ma?Fh(a,b):a.f("Buffering put: "+c)}function Fh(a,b){var c=a.pa[b].action,d=a.pa[b].If,e=a.pa[b].J;a.pa[b].Gg=a.ma;a.Da(c,d,function(d){a.f(c+" response",d);delete a.pa[b];a.Xc--;0===a.Xc&&(a.pa=[]);e&&e(d.s,d.d)})}h.Te=function(a){this.ma&&(a={c:a},this.f("reportStats",a),this.Da("s",a,function(a){"ok"!==a.s&&this.f("reportStats","Error sending stats: "+a.d)}))};
h.Fd=function(a){if("r"in a){this.f("from server: "+B(a));var b=a.r,c=this.Qd[b];c&&(delete this.Qd[b],c(a.b))}else{if("error"in a)throw"A server-side error has occurred: "+a.error;"a"in a&&(b=a.a,c=a.b,this.f("handleServerMessage",b,c),"d"===b?this.Gb(c.p,c.d,!1,c.t):"m"===b?this.Gb(c.p,c.d,!0,c.t):"c"===b?Gh(this,c.p,c.q):"ac"===b?(a=c.s,b=c.d,c=this.Fa,delete this.Fa,c&&c.jd&&c.jd(a,b)):"sd"===b?this.We?this.We(c):"msg"in c&&"undefined"!==typeof console&&console.log("FIREBASE: "+c.msg.replace("\n",
"\nFIREBASE: ")):Pc("Unrecognized action received from server: "+B(b)+"\nAre you using the latest client?"))}};h.Vc=function(a){this.f("connection ready");this.ma=!0;this.Kc=(new Date).getTime();this.Ne({serverTimeOffset:a-(new Date).getTime()});this.mf&&(a={},a["sdk.js."+"2.2.5".replace(/\./g,"-")]=1,kg()&&(a["framework.cordova"]=1),this.Te(a));Hh(this);this.mf=!1;this.Tc(!0)};
function yh(a,b){J(!a.Sa,"Scheduling a connect when we're already connected/ing?");a.Sb&&clearTimeout(a.Sb);a.Sb=setTimeout(function(){a.Sb=null;Ih(a)},Math.floor(b))}h.zg=function(a){a&&!this.uc&&this.$a===this.Cd&&(this.f("Window became visible.  Reducing delay."),this.$a=1E3,this.Sa||yh(this,0));this.uc=a};h.xg=function(a){a?(this.f("Browser went online."),this.$a=1E3,this.Sa||yh(this,0)):(this.f("Browser went offline.  Killing connection."),this.Sa&&this.Sa.close())};
h.Cf=function(){this.f("data client disconnected");this.ma=!1;this.Sa=null;for(var a=0;a<this.pa.length;a++){var b=this.pa[a];b&&"h"in b.If&&b.Gg&&(b.J&&b.J("disconnect"),delete this.pa[a],this.Xc--)}0===this.Xc&&(this.pa=[]);this.Qd={};Jh(this)&&(this.uc?this.Kc&&(3E4<(new Date).getTime()-this.Kc&&(this.$a=1E3),this.Kc=null):(this.f("Window isn't visible.  Delaying reconnect."),this.$a=this.Cd,this.Fe=(new Date).getTime()),a=Math.max(0,this.$a-((new Date).getTime()-this.Fe)),a*=Math.random(),this.f("Trying to reconnect in "+
a+"ms"),yh(this,a),this.$a=Math.min(this.Cd,1.3*this.$a));this.Tc(!1)};function Ih(a){if(Jh(a)){a.f("Making a connection attempt");a.Fe=(new Date).getTime();a.Kc=null;var b=q(a.Fd,a),c=q(a.Vc,a),d=q(a.Cf,a),e=a.id+":"+zh++;a.Sa=new kh(e,a.H,b,c,d,function(b){Q(b+" ("+a.H.toString()+")");a.wf=!0})}}h.yb=function(){this.De=!0;this.Sa?this.Sa.close():(this.Sb&&(clearTimeout(this.Sb),this.Sb=null),this.ma&&this.Cf())};h.qc=function(){this.De=!1;this.$a=1E3;this.Sa||yh(this,0)};
function Gh(a,b,c){c=c?Qa(c,function(a){return Wc(a)}).join("$"):"default";(a=Bh(a,b,c))&&a.J&&a.J("permission_denied")}function Bh(a,b,c){b=(new K(b)).toString();var d;n(a.aa[b])?(d=a.aa[b][c],delete a.aa[b][c],0===pa(a.aa[b])&&delete a.aa[b]):d=void 0;return d}function Hh(a){Ch(a);r(a.aa,function(b){r(b,function(b){Ah(a,b)})});for(var b=0;b<a.pa.length;b++)a.pa[b]&&Fh(a,b);for(;a.Uc.length;)b=a.Uc.shift(),Dh(a,b.action,b.Zc,b.data,b.J)}function Jh(a){var b;b=Lf.ub().ic;return!a.wf&&!a.De&&b};var V={lg:function(){Vg=dh=!0}};V.forceLongPolling=V.lg;V.mg=function(){Wg=!0};V.forceWebSockets=V.mg;V.Mg=function(a,b){a.k.Ra.We=b};V.setSecurityDebugCallback=V.Mg;V.Ye=function(a,b){a.k.Ye(b)};V.stats=V.Ye;V.Ze=function(a,b){a.k.Ze(b)};V.statsIncrementCounter=V.Ze;V.pd=function(a){return a.k.pd};V.dataUpdateCount=V.pd;V.pg=function(a,b){a.k.Ce=b};V.interceptServerData=V.pg;V.vg=function(a){new ug(a)};V.onPopupOpen=V.vg;V.Kg=function(a){fg=a};V.setAuthenticationServer=V.Kg;function S(a,b,c){this.B=a;this.V=b;this.g=c}S.prototype.K=function(){x("Firebase.DataSnapshot.val",0,0,arguments.length);return this.B.K()};S.prototype.val=S.prototype.K;S.prototype.lf=function(){x("Firebase.DataSnapshot.exportVal",0,0,arguments.length);return this.B.K(!0)};S.prototype.exportVal=S.prototype.lf;S.prototype.kg=function(){x("Firebase.DataSnapshot.exists",0,0,arguments.length);return!this.B.e()};S.prototype.exists=S.prototype.kg;
S.prototype.w=function(a){x("Firebase.DataSnapshot.child",0,1,arguments.length);ga(a)&&(a=String(a));Xf("Firebase.DataSnapshot.child",a);var b=new K(a),c=this.V.w(b);return new S(this.B.oa(b),c,M)};S.prototype.child=S.prototype.w;S.prototype.Ha=function(a){x("Firebase.DataSnapshot.hasChild",1,1,arguments.length);Xf("Firebase.DataSnapshot.hasChild",a);var b=new K(a);return!this.B.oa(b).e()};S.prototype.hasChild=S.prototype.Ha;
S.prototype.A=function(){x("Firebase.DataSnapshot.getPriority",0,0,arguments.length);return this.B.A().K()};S.prototype.getPriority=S.prototype.A;S.prototype.forEach=function(a){x("Firebase.DataSnapshot.forEach",1,1,arguments.length);A("Firebase.DataSnapshot.forEach",1,a,!1);if(this.B.N())return!1;var b=this;return!!this.B.U(this.g,function(c,d){return a(new S(d,b.V.w(c),M))})};S.prototype.forEach=S.prototype.forEach;
S.prototype.td=function(){x("Firebase.DataSnapshot.hasChildren",0,0,arguments.length);return this.B.N()?!1:!this.B.e()};S.prototype.hasChildren=S.prototype.td;S.prototype.name=function(){Q("Firebase.DataSnapshot.name() being deprecated. Please use Firebase.DataSnapshot.key() instead.");x("Firebase.DataSnapshot.name",0,0,arguments.length);return this.key()};S.prototype.name=S.prototype.name;S.prototype.key=function(){x("Firebase.DataSnapshot.key",0,0,arguments.length);return this.V.key()};
S.prototype.key=S.prototype.key;S.prototype.Db=function(){x("Firebase.DataSnapshot.numChildren",0,0,arguments.length);return this.B.Db()};S.prototype.numChildren=S.prototype.Db;S.prototype.lc=function(){x("Firebase.DataSnapshot.ref",0,0,arguments.length);return this.V};S.prototype.ref=S.prototype.lc;function Kh(a,b){this.H=a;this.Va=Ob(a);this.ea=new ub;this.Ed=1;this.Ra=null;b||0<=("object"===typeof window&&window.navigator&&window.navigator.userAgent||"").search(/googlebot|google webmaster tools|bingbot|yahoo! slurp|baiduspider|yandexbot|duckduckbot/i)?(this.ca=new Ae(this.H,q(this.Gb,this)),setTimeout(q(this.Tc,this,!0),0)):this.ca=this.Ra=new wh(this.H,q(this.Gb,this),q(this.Tc,this),q(this.Ne,this));this.Pg=Pb(a,q(function(){return new Jb(this.Va,this.ca)},this));this.tc=new Cf;this.Be=
new nb;var c=this;this.zd=new gf({Xe:function(a,b,f,g){b=[];f=c.Be.j(a.path);f.e()||(b=jf(c.zd,new Ub(ze,a.path,f)),setTimeout(function(){g("ok")},0));return b},Zd:ba});Lh(this,"connected",!1);this.ka=new qc;this.P=new Eg(a,q(this.ca.P,this.ca),q(this.ca.ee,this.ca),q(this.Ke,this));this.pd=0;this.Ce=null;this.O=new gf({Xe:function(a,b,f,g){c.ca.xf(a,f,b,function(b,e){var f=g(b,e);zb(c.ea,a.path,f)});return[]},Zd:function(a,b){c.ca.Of(a,b)}})}h=Kh.prototype;
h.toString=function(){return(this.H.lb?"https://":"http://")+this.H.host};h.name=function(){return this.H.Cb};function Mh(a){a=a.Be.j(new K(".info/serverTimeOffset")).K()||0;return(new Date).getTime()+a}function Nh(a){a=a={timestamp:Mh(a)};a.timestamp=a.timestamp||(new Date).getTime();return a}
h.Gb=function(a,b,c,d){this.pd++;var e=new K(a);b=this.Ce?this.Ce(a,b):b;a=[];d?c?(b=na(b,function(a){return L(a)}),a=rf(this.O,e,b,d)):(b=L(b),a=nf(this.O,e,b,d)):c?(d=na(b,function(a){return L(a)}),a=mf(this.O,e,d)):(d=L(b),a=jf(this.O,new Ub(ze,e,d)));d=e;0<a.length&&(d=Oh(this,e));zb(this.ea,d,a)};h.Tc=function(a){Lh(this,"connected",a);!1===a&&Ph(this)};h.Ne=function(a){var b=this;Yc(a,function(a,d){Lh(b,d,a)})};h.Ke=function(a){Lh(this,"authenticated",a)};
function Lh(a,b,c){b=new K("/.info/"+b);c=L(c);var d=a.Be;d.Sd=d.Sd.G(b,c);c=jf(a.zd,new Ub(ze,b,c));zb(a.ea,b,c)}h.Kb=function(a,b,c,d){this.f("set",{path:a.toString(),value:b,Xg:c});var e=Nh(this);b=L(b,c);var e=sc(b,e),f=this.Ed++,e=hf(this.O,a,e,f,!0);vb(this.ea,e);var g=this;this.ca.put(a.toString(),b.K(!0),function(b,c){var e="ok"===b;e||Q("set at "+a+" failed: "+b);e=lf(g.O,f,!e);zb(g.ea,a,e);Qh(d,b,c)});e=Rh(this,a);Oh(this,e);zb(this.ea,e,[])};
h.update=function(a,b,c){this.f("update",{path:a.toString(),value:b});var d=!0,e=Nh(this),f={};r(b,function(a,b){d=!1;var c=L(a);f[b]=sc(c,e)});if(d)Bb("update() called with empty data.  Don't do anything."),Qh(c,"ok");else{var g=this.Ed++,k=kf(this.O,a,f,g);vb(this.ea,k);var l=this;this.ca.yf(a.toString(),b,function(b,d){var e="ok"===b;e||Q("update at "+a+" failed: "+b);var e=lf(l.O,g,!e),f=a;0<e.length&&(f=Oh(l,a));zb(l.ea,f,e);Qh(c,b,d)});b=Rh(this,a);Oh(this,b);zb(this.ea,a,[])}};
function Ph(a){a.f("onDisconnectEvents");var b=Nh(a),c=[];rc(pc(a.ka,b),F,function(b,e){c=c.concat(jf(a.O,new Ub(ze,b,e)));var f=Rh(a,b);Oh(a,f)});a.ka=new qc;zb(a.ea,F,c)}h.Gd=function(a,b){var c=this;this.ca.Gd(a.toString(),function(d,e){"ok"===d&&eg(c.ka,a);Qh(b,d,e)})};function Sh(a,b,c,d){var e=L(c);a.ca.Le(b.toString(),e.K(!0),function(c,g){"ok"===c&&a.ka.mc(b,e);Qh(d,c,g)})}function Th(a,b,c,d,e){var f=L(c,d);a.ca.Le(b.toString(),f.K(!0),function(c,d){"ok"===c&&a.ka.mc(b,f);Qh(e,c,d)})}
function Uh(a,b,c,d){var e=!0,f;for(f in c)e=!1;e?(Bb("onDisconnect().update() called with empty data.  Don't do anything."),Qh(d,"ok")):a.ca.Bf(b.toString(),c,function(e,f){if("ok"===e)for(var l in c){var m=L(c[l]);a.ka.mc(b.w(l),m)}Qh(d,e,f)})}function Vh(a,b,c){c=".info"===O(b.path)?a.zd.Ob(b,c):a.O.Ob(b,c);xb(a.ea,b.path,c)}h.yb=function(){this.Ra&&this.Ra.yb()};h.qc=function(){this.Ra&&this.Ra.qc()};
h.Ye=function(a){if("undefined"!==typeof console){a?(this.Yd||(this.Yd=new Ib(this.Va)),a=this.Yd.get()):a=this.Va.get();var b=Ra(sa(a),function(a,b){return Math.max(b.length,a)},0),c;for(c in a){for(var d=a[c],e=c.length;e<b+2;e++)c+=" ";console.log(c+d)}}};h.Ze=function(a){Lb(this.Va,a);this.Pg.Mf[a]=!0};h.f=function(a){var b="";this.Ra&&(b=this.Ra.id+":");Bb(b,arguments)};
function Qh(a,b,c){a&&Cb(function(){if("ok"==b)a(null);else{var d=(b||"error").toUpperCase(),e=d;c&&(e+=": "+c);e=Error(e);e.code=d;a(e)}})};function Wh(a,b,c,d,e){function f(){}a.f("transaction on "+b);var g=new U(a,b);g.Eb("value",f);c={path:b,update:c,J:d,status:null,Ef:Gc(),cf:e,Kf:0,ge:function(){g.gc("value",f)},je:null,Aa:null,md:null,nd:null,od:null};d=a.O.ua(b,void 0)||C;c.md=d;d=c.update(d.K());if(n(d)){Sf("transaction failed: Data returned ",d,c.path);c.status=1;e=Df(a.tc,b);var k=e.Ba()||[];k.push(c);Ef(e,k);"object"===typeof d&&null!==d&&u(d,".priority")?(k=w(d,".priority"),J(Qf(k),"Invalid priority returned by transaction. Priority must be a valid string, finite number, server value, or null.")):
k=(a.O.ua(b)||C).A().K();e=Nh(a);d=L(d,k);e=sc(d,e);c.nd=d;c.od=e;c.Aa=a.Ed++;c=hf(a.O,b,e,c.Aa,c.cf);zb(a.ea,b,c);Xh(a)}else c.ge(),c.nd=null,c.od=null,c.J&&(a=new S(c.md,new U(a,c.path),M),c.J(null,!1,a))}function Xh(a,b){var c=b||a.tc;b||Yh(a,c);if(null!==c.Ba()){var d=Zh(a,c);J(0<d.length,"Sending zero length transaction queue");Sa(d,function(a){return 1===a.status})&&$h(a,c.path(),d)}else c.td()&&c.U(function(b){Xh(a,b)})}
function $h(a,b,c){for(var d=Qa(c,function(a){return a.Aa}),e=a.O.ua(b,d)||C,d=e,e=e.hash(),f=0;f<c.length;f++){var g=c[f];J(1===g.status,"tryToSendTransactionQueue_: items in queue should all be run.");g.status=2;g.Kf++;var k=N(b,g.path),d=d.G(k,g.nd)}d=d.K(!0);a.ca.put(b.toString(),d,function(d){a.f("transaction put response",{path:b.toString(),status:d});var e=[];if("ok"===d){d=[];for(f=0;f<c.length;f++){c[f].status=3;e=e.concat(lf(a.O,c[f].Aa));if(c[f].J){var g=c[f].od,k=new U(a,c[f].path);d.push(q(c[f].J,
null,null,!0,new S(g,k,M)))}c[f].ge()}Yh(a,Df(a.tc,b));Xh(a);zb(a.ea,b,e);for(f=0;f<d.length;f++)Cb(d[f])}else{if("datastale"===d)for(f=0;f<c.length;f++)c[f].status=4===c[f].status?5:1;else for(Q("transaction at "+b.toString()+" failed: "+d),f=0;f<c.length;f++)c[f].status=5,c[f].je=d;Oh(a,b)}},e)}function Oh(a,b){var c=ai(a,b),d=c.path(),c=Zh(a,c);bi(a,c,d);return d}
function bi(a,b,c){if(0!==b.length){for(var d=[],e=[],f=Qa(b,function(a){return a.Aa}),g=0;g<b.length;g++){var k=b[g],l=N(c,k.path),m=!1,v;J(null!==l,"rerunTransactionsUnderNode_: relativePath should not be null.");if(5===k.status)m=!0,v=k.je,e=e.concat(lf(a.O,k.Aa,!0));else if(1===k.status)if(25<=k.Kf)m=!0,v="maxretry",e=e.concat(lf(a.O,k.Aa,!0));else{var y=a.O.ua(k.path,f)||C;k.md=y;var I=b[g].update(y.K());n(I)?(Sf("transaction failed: Data returned ",I,k.path),l=L(I),"object"===typeof I&&null!=
I&&u(I,".priority")||(l=l.da(y.A())),y=k.Aa,I=Nh(a),I=sc(l,I),k.nd=l,k.od=I,k.Aa=a.Ed++,Va(f,y),e=e.concat(hf(a.O,k.path,I,k.Aa,k.cf)),e=e.concat(lf(a.O,y,!0))):(m=!0,v="nodata",e=e.concat(lf(a.O,k.Aa,!0)))}zb(a.ea,c,e);e=[];m&&(b[g].status=3,setTimeout(b[g].ge,Math.floor(0)),b[g].J&&("nodata"===v?(k=new U(a,b[g].path),d.push(q(b[g].J,null,null,!1,new S(b[g].md,k,M)))):d.push(q(b[g].J,null,Error(v),!1,null))))}Yh(a,a.tc);for(g=0;g<d.length;g++)Cb(d[g]);Xh(a)}}
function ai(a,b){for(var c,d=a.tc;null!==(c=O(b))&&null===d.Ba();)d=Df(d,c),b=G(b);return d}function Zh(a,b){var c=[];ci(a,b,c);c.sort(function(a,b){return a.Ef-b.Ef});return c}function ci(a,b,c){var d=b.Ba();if(null!==d)for(var e=0;e<d.length;e++)c.push(d[e]);b.U(function(b){ci(a,b,c)})}function Yh(a,b){var c=b.Ba();if(c){for(var d=0,e=0;e<c.length;e++)3!==c[e].status&&(c[d]=c[e],d++);c.length=d;Ef(b,0<c.length?c:null)}b.U(function(b){Yh(a,b)})}
function Rh(a,b){var c=ai(a,b).path(),d=Df(a.tc,b);Hf(d,function(b){di(a,b)});di(a,d);Gf(d,function(b){di(a,b)});return c}
function di(a,b){var c=b.Ba();if(null!==c){for(var d=[],e=[],f=-1,g=0;g<c.length;g++)4!==c[g].status&&(2===c[g].status?(J(f===g-1,"All SENT items should be at beginning of queue."),f=g,c[g].status=4,c[g].je="set"):(J(1===c[g].status,"Unexpected transaction status in abort"),c[g].ge(),e=e.concat(lf(a.O,c[g].Aa,!0)),c[g].J&&d.push(q(c[g].J,null,Error("set"),!1,null))));-1===f?Ef(b,null):c.length=f+1;zb(a.ea,b.path(),e);for(g=0;g<d.length;g++)Cb(d[g])}};function W(){this.nc={};this.Pf=!1}ca(W);W.prototype.yb=function(){for(var a in this.nc)this.nc[a].yb()};W.prototype.interrupt=W.prototype.yb;W.prototype.qc=function(){for(var a in this.nc)this.nc[a].qc()};W.prototype.resume=W.prototype.qc;W.prototype.ue=function(){this.Pf=!0};function X(a,b){this.ad=a;this.qa=b}X.prototype.cancel=function(a){x("Firebase.onDisconnect().cancel",0,1,arguments.length);A("Firebase.onDisconnect().cancel",1,a,!0);this.ad.Gd(this.qa,a||null)};X.prototype.cancel=X.prototype.cancel;X.prototype.remove=function(a){x("Firebase.onDisconnect().remove",0,1,arguments.length);Yf("Firebase.onDisconnect().remove",this.qa);A("Firebase.onDisconnect().remove",1,a,!0);Sh(this.ad,this.qa,null,a)};X.prototype.remove=X.prototype.remove;
X.prototype.set=function(a,b){x("Firebase.onDisconnect().set",1,2,arguments.length);Yf("Firebase.onDisconnect().set",this.qa);Rf("Firebase.onDisconnect().set",a,this.qa,!1);A("Firebase.onDisconnect().set",2,b,!0);Sh(this.ad,this.qa,a,b)};X.prototype.set=X.prototype.set;
X.prototype.Kb=function(a,b,c){x("Firebase.onDisconnect().setWithPriority",2,3,arguments.length);Yf("Firebase.onDisconnect().setWithPriority",this.qa);Rf("Firebase.onDisconnect().setWithPriority",a,this.qa,!1);Uf("Firebase.onDisconnect().setWithPriority",2,b);A("Firebase.onDisconnect().setWithPriority",3,c,!0);Th(this.ad,this.qa,a,b,c)};X.prototype.setWithPriority=X.prototype.Kb;
X.prototype.update=function(a,b){x("Firebase.onDisconnect().update",1,2,arguments.length);Yf("Firebase.onDisconnect().update",this.qa);if(ea(a)){for(var c={},d=0;d<a.length;++d)c[""+d]=a[d];a=c;Q("Passing an Array to Firebase.onDisconnect().update() is deprecated. Use set() if you want to overwrite the existing data, or an Object with integer keys if you really do want to only update some of the children.")}Tf("Firebase.onDisconnect().update",a,this.qa);A("Firebase.onDisconnect().update",2,b,!0);
Uh(this.ad,this.qa,a,b)};X.prototype.update=X.prototype.update;function Y(a,b,c,d){this.k=a;this.path=b;this.o=c;this.jc=d}
function ei(a){var b=null,c=null;a.la&&(b=od(a));a.na&&(c=qd(a));if(a.g===Vd){if(a.la){if("[MIN_NAME]"!=nd(a))throw Error("Query: When ordering by key, you may only pass one argument to startAt(), endAt(), or equalTo().");if("string"!==typeof b)throw Error("Query: When ordering by key, the argument passed to startAt(), endAt(),or equalTo() must be a string.");}if(a.na){if("[MAX_NAME]"!=pd(a))throw Error("Query: When ordering by key, you may only pass one argument to startAt(), endAt(), or equalTo().");if("string"!==
typeof c)throw Error("Query: When ordering by key, the argument passed to startAt(), endAt(),or equalTo() must be a string.");}}else if(a.g===M){if(null!=b&&!Qf(b)||null!=c&&!Qf(c))throw Error("Query: When ordering by priority, the first argument passed to startAt(), endAt(), or equalTo() must be a valid priority value (null, a number, or a string).");}else if(J(a.g instanceof Rd||a.g===Yd,"unknown index type."),null!=b&&"object"===typeof b||null!=c&&"object"===typeof c)throw Error("Query: First argument passed to startAt(), endAt(), or equalTo() cannot be an object.");
}function fi(a){if(a.la&&a.na&&a.ia&&(!a.ia||""===a.Nb))throw Error("Query: Can't combine startAt(), endAt(), and limit(). Use limitToFirst() or limitToLast() instead.");}function gi(a,b){if(!0===a.jc)throw Error(b+": You can't combine multiple orderBy calls.");}Y.prototype.lc=function(){x("Query.ref",0,0,arguments.length);return new U(this.k,this.path)};Y.prototype.ref=Y.prototype.lc;
Y.prototype.Eb=function(a,b,c,d){x("Query.on",2,4,arguments.length);Vf("Query.on",a,!1);A("Query.on",2,b,!1);var e=hi("Query.on",c,d);if("value"===a)Vh(this.k,this,new jd(b,e.cancel||null,e.Ma||null));else{var f={};f[a]=b;Vh(this.k,this,new kd(f,e.cancel,e.Ma))}return b};Y.prototype.on=Y.prototype.Eb;
Y.prototype.gc=function(a,b,c){x("Query.off",0,3,arguments.length);Vf("Query.off",a,!0);A("Query.off",2,b,!0);lb("Query.off",3,c);var d=null,e=null;"value"===a?d=new jd(b||null,null,c||null):a&&(b&&(e={},e[a]=b),d=new kd(e,null,c||null));e=this.k;d=".info"===O(this.path)?e.zd.kb(this,d):e.O.kb(this,d);xb(e.ea,this.path,d)};Y.prototype.off=Y.prototype.gc;
Y.prototype.Ag=function(a,b){function c(g){f&&(f=!1,e.gc(a,c),b.call(d.Ma,g))}x("Query.once",2,4,arguments.length);Vf("Query.once",a,!1);A("Query.once",2,b,!1);var d=hi("Query.once",arguments[2],arguments[3]),e=this,f=!0;this.Eb(a,c,function(b){e.gc(a,c);d.cancel&&d.cancel.call(d.Ma,b)})};Y.prototype.once=Y.prototype.Ag;
Y.prototype.Ge=function(a){Q("Query.limit() being deprecated. Please use Query.limitToFirst() or Query.limitToLast() instead.");x("Query.limit",1,1,arguments.length);if(!ga(a)||Math.floor(a)!==a||0>=a)throw Error("Query.limit: First argument must be a positive integer.");if(this.o.ia)throw Error("Query.limit: Limit was already set (by another call to limit, limitToFirst, orlimitToLast.");var b=this.o.Ge(a);fi(b);return new Y(this.k,this.path,b,this.jc)};Y.prototype.limit=Y.prototype.Ge;
Y.prototype.He=function(a){x("Query.limitToFirst",1,1,arguments.length);if(!ga(a)||Math.floor(a)!==a||0>=a)throw Error("Query.limitToFirst: First argument must be a positive integer.");if(this.o.ia)throw Error("Query.limitToFirst: Limit was already set (by another call to limit, limitToFirst, or limitToLast).");return new Y(this.k,this.path,this.o.He(a),this.jc)};Y.prototype.limitToFirst=Y.prototype.He;
Y.prototype.Ie=function(a){x("Query.limitToLast",1,1,arguments.length);if(!ga(a)||Math.floor(a)!==a||0>=a)throw Error("Query.limitToLast: First argument must be a positive integer.");if(this.o.ia)throw Error("Query.limitToLast: Limit was already set (by another call to limit, limitToFirst, or limitToLast).");return new Y(this.k,this.path,this.o.Ie(a),this.jc)};Y.prototype.limitToLast=Y.prototype.Ie;
Y.prototype.Bg=function(a){x("Query.orderByChild",1,1,arguments.length);if("$key"===a)throw Error('Query.orderByChild: "$key" is invalid.  Use Query.orderByKey() instead.');if("$priority"===a)throw Error('Query.orderByChild: "$priority" is invalid.  Use Query.orderByPriority() instead.');if("$value"===a)throw Error('Query.orderByChild: "$value" is invalid.  Use Query.orderByValue() instead.');Wf("Query.orderByChild",1,a,!1);gi(this,"Query.orderByChild");var b=be(this.o,new Rd(a));ei(b);return new Y(this.k,
this.path,b,!0)};Y.prototype.orderByChild=Y.prototype.Bg;Y.prototype.Cg=function(){x("Query.orderByKey",0,0,arguments.length);gi(this,"Query.orderByKey");var a=be(this.o,Vd);ei(a);return new Y(this.k,this.path,a,!0)};Y.prototype.orderByKey=Y.prototype.Cg;Y.prototype.Dg=function(){x("Query.orderByPriority",0,0,arguments.length);gi(this,"Query.orderByPriority");var a=be(this.o,M);ei(a);return new Y(this.k,this.path,a,!0)};Y.prototype.orderByPriority=Y.prototype.Dg;
Y.prototype.Eg=function(){x("Query.orderByValue",0,0,arguments.length);gi(this,"Query.orderByValue");var a=be(this.o,Yd);ei(a);return new Y(this.k,this.path,a,!0)};Y.prototype.orderByValue=Y.prototype.Eg;
Y.prototype.Xd=function(a,b){x("Query.startAt",0,2,arguments.length);Rf("Query.startAt",a,this.path,!0);Wf("Query.startAt",2,b,!0);var c=this.o.Xd(a,b);fi(c);ei(c);if(this.o.la)throw Error("Query.startAt: Starting point was already set (by another call to startAt or equalTo).");n(a)||(b=a=null);return new Y(this.k,this.path,c,this.jc)};Y.prototype.startAt=Y.prototype.Xd;
Y.prototype.qd=function(a,b){x("Query.endAt",0,2,arguments.length);Rf("Query.endAt",a,this.path,!0);Wf("Query.endAt",2,b,!0);var c=this.o.qd(a,b);fi(c);ei(c);if(this.o.na)throw Error("Query.endAt: Ending point was already set (by another call to endAt or equalTo).");return new Y(this.k,this.path,c,this.jc)};Y.prototype.endAt=Y.prototype.qd;
Y.prototype.hg=function(a,b){x("Query.equalTo",1,2,arguments.length);Rf("Query.equalTo",a,this.path,!1);Wf("Query.equalTo",2,b,!0);if(this.o.la)throw Error("Query.equalTo: Starting point was already set (by another call to endAt or equalTo).");if(this.o.na)throw Error("Query.equalTo: Ending point was already set (by another call to endAt or equalTo).");return this.Xd(a,b).qd(a,b)};Y.prototype.equalTo=Y.prototype.hg;
Y.prototype.toString=function(){x("Query.toString",0,0,arguments.length);for(var a=this.path,b="",c=a.Y;c<a.n.length;c++)""!==a.n[c]&&(b+="/"+encodeURIComponent(String(a.n[c])));return this.k.toString()+(b||"/")};Y.prototype.toString=Y.prototype.toString;Y.prototype.wa=function(){var a=Wc(ce(this.o));return"{}"===a?"default":a};
function hi(a,b,c){var d={cancel:null,Ma:null};if(b&&c)d.cancel=b,A(a,3,d.cancel,!0),d.Ma=c,lb(a,4,d.Ma);else if(b)if("object"===typeof b&&null!==b)d.Ma=b;else if("function"===typeof b)d.cancel=b;else throw Error(z(a,3,!0)+" must either be a cancel callback or a context object.");return d};var Z={};Z.vc=wh;Z.DataConnection=Z.vc;wh.prototype.Og=function(a,b){this.Da("q",{p:a},b)};Z.vc.prototype.simpleListen=Z.vc.prototype.Og;wh.prototype.gg=function(a,b){this.Da("echo",{d:a},b)};Z.vc.prototype.echo=Z.vc.prototype.gg;wh.prototype.interrupt=wh.prototype.yb;Z.Sf=kh;Z.RealTimeConnection=Z.Sf;kh.prototype.sendRequest=kh.prototype.Da;kh.prototype.close=kh.prototype.close;
Z.og=function(a){var b=wh.prototype.put;wh.prototype.put=function(c,d,e,f){n(f)&&(f=a());b.call(this,c,d,e,f)};return function(){wh.prototype.put=b}};Z.hijackHash=Z.og;Z.Rf=Ec;Z.ConnectionTarget=Z.Rf;Z.wa=function(a){return a.wa()};Z.queryIdentifier=Z.wa;Z.qg=function(a){return a.k.Ra.aa};Z.listens=Z.qg;Z.ue=function(a){a.ue()};Z.forceRestClient=Z.ue;function U(a,b){var c,d,e;if(a instanceof Kh)c=a,d=b;else{x("new Firebase",1,2,arguments.length);d=Rc(arguments[0]);c=d.Qg;"firebase"===d.domain&&Qc(d.host+" is no longer supported. Please use <YOUR FIREBASE>.firebaseio.com instead");c||Qc("Cannot parse Firebase url. Please use https://<YOUR FIREBASE>.firebaseio.com");d.lb||"undefined"!==typeof window&&window.location&&window.location.protocol&&-1!==window.location.protocol.indexOf("https:")&&Q("Insecure Firebase access from a secure page. Please use https in calls to new Firebase().");
c=new Ec(d.host,d.lb,c,"ws"===d.scheme||"wss"===d.scheme);d=new K(d.Zc);e=d.toString();var f;!(f=!p(c.host)||0===c.host.length||!Pf(c.Cb))&&(f=0!==e.length)&&(e&&(e=e.replace(/^\/*\.info(\/|$)/,"/")),f=!(p(e)&&0!==e.length&&!Of.test(e)));if(f)throw Error(z("new Firebase",1,!1)+'must be a valid firebase URL and the path can\'t contain ".", "#", "$", "[", or "]".');if(b)if(b instanceof W)e=b;else if(p(b))e=W.ub(),c.Ld=b;else throw Error("Expected a valid Firebase.Context for second argument to new Firebase()");
else e=W.ub();f=c.toString();var g=w(e.nc,f);g||(g=new Kh(c,e.Pf),e.nc[f]=g);c=g}Y.call(this,c,d,$d,!1)}ma(U,Y);var ii=U,ji=["Firebase"],ki=aa;ji[0]in ki||!ki.execScript||ki.execScript("var "+ji[0]);for(var li;ji.length&&(li=ji.shift());)!ji.length&&n(ii)?ki[li]=ii:ki=ki[li]?ki[li]:ki[li]={};U.prototype.name=function(){Q("Firebase.name() being deprecated. Please use Firebase.key() instead.");x("Firebase.name",0,0,arguments.length);return this.key()};U.prototype.name=U.prototype.name;
U.prototype.key=function(){x("Firebase.key",0,0,arguments.length);return this.path.e()?null:vc(this.path)};U.prototype.key=U.prototype.key;U.prototype.w=function(a){x("Firebase.child",1,1,arguments.length);if(ga(a))a=String(a);else if(!(a instanceof K))if(null===O(this.path)){var b=a;b&&(b=b.replace(/^\/*\.info(\/|$)/,"/"));Xf("Firebase.child",b)}else Xf("Firebase.child",a);return new U(this.k,this.path.w(a))};U.prototype.child=U.prototype.w;
U.prototype.parent=function(){x("Firebase.parent",0,0,arguments.length);var a=this.path.parent();return null===a?null:new U(this.k,a)};U.prototype.parent=U.prototype.parent;U.prototype.root=function(){x("Firebase.ref",0,0,arguments.length);for(var a=this;null!==a.parent();)a=a.parent();return a};U.prototype.root=U.prototype.root;
U.prototype.set=function(a,b){x("Firebase.set",1,2,arguments.length);Yf("Firebase.set",this.path);Rf("Firebase.set",a,this.path,!1);A("Firebase.set",2,b,!0);this.k.Kb(this.path,a,null,b||null)};U.prototype.set=U.prototype.set;
U.prototype.update=function(a,b){x("Firebase.update",1,2,arguments.length);Yf("Firebase.update",this.path);if(ea(a)){for(var c={},d=0;d<a.length;++d)c[""+d]=a[d];a=c;Q("Passing an Array to Firebase.update() is deprecated. Use set() if you want to overwrite the existing data, or an Object with integer keys if you really do want to only update some of the children.")}Tf("Firebase.update",a,this.path);A("Firebase.update",2,b,!0);this.k.update(this.path,a,b||null)};U.prototype.update=U.prototype.update;
U.prototype.Kb=function(a,b,c){x("Firebase.setWithPriority",2,3,arguments.length);Yf("Firebase.setWithPriority",this.path);Rf("Firebase.setWithPriority",a,this.path,!1);Uf("Firebase.setWithPriority",2,b);A("Firebase.setWithPriority",3,c,!0);if(".length"===this.key()||".keys"===this.key())throw"Firebase.setWithPriority failed: "+this.key()+" is a read-only object.";this.k.Kb(this.path,a,b,c||null)};U.prototype.setWithPriority=U.prototype.Kb;
U.prototype.remove=function(a){x("Firebase.remove",0,1,arguments.length);Yf("Firebase.remove",this.path);A("Firebase.remove",1,a,!0);this.set(null,a)};U.prototype.remove=U.prototype.remove;
U.prototype.transaction=function(a,b,c){x("Firebase.transaction",1,3,arguments.length);Yf("Firebase.transaction",this.path);A("Firebase.transaction",1,a,!1);A("Firebase.transaction",2,b,!0);if(n(c)&&"boolean"!=typeof c)throw Error(z("Firebase.transaction",3,!0)+"must be a boolean.");if(".length"===this.key()||".keys"===this.key())throw"Firebase.transaction failed: "+this.key()+" is a read-only object.";"undefined"===typeof c&&(c=!0);Wh(this.k,this.path,a,b||null,c)};U.prototype.transaction=U.prototype.transaction;
U.prototype.Lg=function(a,b){x("Firebase.setPriority",1,2,arguments.length);Yf("Firebase.setPriority",this.path);Uf("Firebase.setPriority",1,a);A("Firebase.setPriority",2,b,!0);this.k.Kb(this.path.w(".priority"),a,null,b)};U.prototype.setPriority=U.prototype.Lg;
U.prototype.push=function(a,b){x("Firebase.push",0,2,arguments.length);Yf("Firebase.push",this.path);Rf("Firebase.push",a,this.path,!0);A("Firebase.push",2,b,!0);var c=Mh(this.k),c=Kf(c),c=this.w(c);"undefined"!==typeof a&&null!==a&&c.set(a,b);return c};U.prototype.push=U.prototype.push;U.prototype.jb=function(){Yf("Firebase.onDisconnect",this.path);return new X(this.k,this.path)};U.prototype.onDisconnect=U.prototype.jb;
U.prototype.P=function(a,b,c){Q("FirebaseRef.auth() being deprecated. Please use FirebaseRef.authWithCustomToken() instead.");x("Firebase.auth",1,3,arguments.length);Zf("Firebase.auth",a);A("Firebase.auth",2,b,!0);A("Firebase.auth",3,b,!0);Kg(this.k.P,a,{},{remember:"none"},b,c)};U.prototype.auth=U.prototype.P;U.prototype.ee=function(a){x("Firebase.unauth",0,1,arguments.length);A("Firebase.unauth",1,a,!0);Lg(this.k.P,a)};U.prototype.unauth=U.prototype.ee;
U.prototype.we=function(){x("Firebase.getAuth",0,0,arguments.length);return this.k.P.we()};U.prototype.getAuth=U.prototype.we;U.prototype.ug=function(a,b){x("Firebase.onAuth",1,2,arguments.length);A("Firebase.onAuth",1,a,!1);lb("Firebase.onAuth",2,b);this.k.P.Eb("auth_status",a,b)};U.prototype.onAuth=U.prototype.ug;U.prototype.tg=function(a,b){x("Firebase.offAuth",1,2,arguments.length);A("Firebase.offAuth",1,a,!1);lb("Firebase.offAuth",2,b);this.k.P.gc("auth_status",a,b)};U.prototype.offAuth=U.prototype.tg;
U.prototype.Wf=function(a,b,c){x("Firebase.authWithCustomToken",2,3,arguments.length);Zf("Firebase.authWithCustomToken",a);A("Firebase.authWithCustomToken",2,b,!1);ag("Firebase.authWithCustomToken",3,c,!0);Kg(this.k.P,a,{},c||{},b)};U.prototype.authWithCustomToken=U.prototype.Wf;U.prototype.Xf=function(a,b,c){x("Firebase.authWithOAuthPopup",2,3,arguments.length);$f("Firebase.authWithOAuthPopup",1,a);A("Firebase.authWithOAuthPopup",2,b,!1);ag("Firebase.authWithOAuthPopup",3,c,!0);Pg(this.k.P,a,c,b)};
U.prototype.authWithOAuthPopup=U.prototype.Xf;U.prototype.Yf=function(a,b,c){x("Firebase.authWithOAuthRedirect",2,3,arguments.length);$f("Firebase.authWithOAuthRedirect",1,a);A("Firebase.authWithOAuthRedirect",2,b,!1);ag("Firebase.authWithOAuthRedirect",3,c,!0);var d=this.k.P;Ng(d);var e=[wg],f=ig(c);"anonymous"===a||"firebase"===a?R(b,yg("TRANSPORT_UNAVAILABLE")):(P.set("redirect_client_options",f.ld),Og(d,e,"/auth/"+a,f,b))};U.prototype.authWithOAuthRedirect=U.prototype.Yf;
U.prototype.Zf=function(a,b,c,d){x("Firebase.authWithOAuthToken",3,4,arguments.length);$f("Firebase.authWithOAuthToken",1,a);A("Firebase.authWithOAuthToken",3,c,!1);ag("Firebase.authWithOAuthToken",4,d,!0);p(b)?($f("Firebase.authWithOAuthToken",2,b),Mg(this.k.P,a+"/token",{access_token:b},d,c)):(ag("Firebase.authWithOAuthToken",2,b,!1),Mg(this.k.P,a+"/token",b,d,c))};U.prototype.authWithOAuthToken=U.prototype.Zf;
U.prototype.Vf=function(a,b){x("Firebase.authAnonymously",1,2,arguments.length);A("Firebase.authAnonymously",1,a,!1);ag("Firebase.authAnonymously",2,b,!0);Mg(this.k.P,"anonymous",{},b,a)};U.prototype.authAnonymously=U.prototype.Vf;
U.prototype.$f=function(a,b,c){x("Firebase.authWithPassword",2,3,arguments.length);ag("Firebase.authWithPassword",1,a,!1);bg("Firebase.authWithPassword",a,"email");bg("Firebase.authWithPassword",a,"password");A("Firebase.authAnonymously",2,b,!1);ag("Firebase.authAnonymously",3,c,!0);Mg(this.k.P,"password",a,c,b)};U.prototype.authWithPassword=U.prototype.$f;
U.prototype.re=function(a,b){x("Firebase.createUser",2,2,arguments.length);ag("Firebase.createUser",1,a,!1);bg("Firebase.createUser",a,"email");bg("Firebase.createUser",a,"password");A("Firebase.createUser",2,b,!1);this.k.P.re(a,b)};U.prototype.createUser=U.prototype.re;U.prototype.Se=function(a,b){x("Firebase.removeUser",2,2,arguments.length);ag("Firebase.removeUser",1,a,!1);bg("Firebase.removeUser",a,"email");bg("Firebase.removeUser",a,"password");A("Firebase.removeUser",2,b,!1);this.k.P.Se(a,b)};
U.prototype.removeUser=U.prototype.Se;U.prototype.oe=function(a,b){x("Firebase.changePassword",2,2,arguments.length);ag("Firebase.changePassword",1,a,!1);bg("Firebase.changePassword",a,"email");bg("Firebase.changePassword",a,"oldPassword");bg("Firebase.changePassword",a,"newPassword");A("Firebase.changePassword",2,b,!1);this.k.P.oe(a,b)};U.prototype.changePassword=U.prototype.oe;
U.prototype.ne=function(a,b){x("Firebase.changeEmail",2,2,arguments.length);ag("Firebase.changeEmail",1,a,!1);bg("Firebase.changeEmail",a,"oldEmail");bg("Firebase.changeEmail",a,"newEmail");bg("Firebase.changeEmail",a,"password");A("Firebase.changeEmail",2,b,!1);this.k.P.ne(a,b)};U.prototype.changeEmail=U.prototype.ne;
U.prototype.Ue=function(a,b){x("Firebase.resetPassword",2,2,arguments.length);ag("Firebase.resetPassword",1,a,!1);bg("Firebase.resetPassword",a,"email");A("Firebase.resetPassword",2,b,!1);this.k.P.Ue(a,b)};U.prototype.resetPassword=U.prototype.Ue;U.goOffline=function(){x("Firebase.goOffline",0,0,arguments.length);W.ub().yb()};U.goOnline=function(){x("Firebase.goOnline",0,0,arguments.length);W.ub().qc()};
function Nc(a,b){J(!b||!0===a||!1===a,"Can't turn on custom loggers persistently.");!0===a?("undefined"!==typeof console&&("function"===typeof console.log?Ab=q(console.log,console):"object"===typeof console.log&&(Ab=function(a){console.log(a)})),b&&P.set("logging_enabled",!0)):a?Ab=a:(Ab=null,P.remove("logging_enabled"))}U.enableLogging=Nc;U.ServerValue={TIMESTAMP:{".sv":"timestamp"}};U.SDK_VERSION="2.2.5";U.INTERNAL=V;U.Context=W;U.TEST_ACCESS=Z;})();

module.exports = Firebase;

},{}],10:[function(require,module,exports){
var _ = require('../util')

/**
 * Create a child instance that prototypally inehrits
 * data on parent. To achieve that we create an intermediate
 * constructor with its prototype pointing to parent.
 *
 * @param {Object} opts
 * @param {Function} [BaseCtor]
 * @return {Vue}
 * @public
 */

exports.$addChild = function (opts, BaseCtor) {
  BaseCtor = BaseCtor || _.Vue
  opts = opts || {}
  var parent = this
  var ChildVue
  var inherit = opts.inherit !== undefined
    ? opts.inherit
    : BaseCtor.options.inherit
  if (inherit) {
    var ctors = parent._childCtors
    ChildVue = ctors[BaseCtor.cid]
    if (!ChildVue) {
      var optionName = BaseCtor.options.name
      var className = optionName
        ? _.classify(optionName)
        : 'VueComponent'
      ChildVue = new Function(
        'return function ' + className + ' (options) {' +
        'this.constructor = ' + className + ';' +
        'this._init(options) }'
      )()
      ChildVue.options = BaseCtor.options
      ChildVue.prototype = this
      ctors[BaseCtor.cid] = ChildVue
    }
  } else {
    ChildVue = BaseCtor
  }
  opts._parent = parent
  opts._root = parent.$root
  var child = new ChildVue(opts)
  return child
}
},{"../util":67}],11:[function(require,module,exports){
var _ = require('../util')
var Watcher = require('../watcher')
var Path = require('../parsers/path')
var textParser = require('../parsers/text')
var dirParser = require('../parsers/directive')
var expParser = require('../parsers/expression')
var filterRE = /[^|]\|[^|]/

/**
 * Get the value from an expression on this vm.
 *
 * @param {String} exp
 * @return {*}
 */

exports.$get = function (exp) {
  var res = expParser.parse(exp)
  if (res) {
    try {
      return res.get.call(this, this)
    } catch (e) {}
  }
}

/**
 * Set the value from an expression on this vm.
 * The expression must be a valid left-hand
 * expression in an assignment.
 *
 * @param {String} exp
 * @param {*} val
 */

exports.$set = function (exp, val) {
  var res = expParser.parse(exp, true)
  if (res && res.set) {
    res.set.call(this, this, val)
  }
}

/**
 * Add a property on the VM
 *
 * @param {String} key
 * @param {*} val
 */

exports.$add = function (key, val) {
  this._data.$add(key, val)
}

/**
 * Delete a property on the VM
 *
 * @param {String} key
 */

exports.$delete = function (key) {
  this._data.$delete(key)
}

/**
 * Watch an expression, trigger callback when its
 * value changes.
 *
 * @param {String} exp
 * @param {Function} cb
 * @param {Boolean} [deep]
 * @param {Boolean} [immediate]
 * @return {Function} - unwatchFn
 */

exports.$watch = function (exp, cb, deep, immediate) {
  var vm = this
  var key = deep ? exp + '**deep**' : exp
  var watcher = vm._userWatchers[key]
  var wrappedCb = function (val, oldVal) {
    cb.call(vm, val, oldVal)
  }
  if (!watcher) {
    watcher = vm._userWatchers[key] =
      new Watcher(vm, exp, wrappedCb, {
        deep: deep,
        user: true
      })
  } else {
    watcher.addCb(wrappedCb)
  }
  if (immediate) {
    wrappedCb(watcher.value)
  }
  return function unwatchFn () {
    watcher.removeCb(wrappedCb)
    if (!watcher.active) {
      vm._userWatchers[key] = null
    }
  }
}

/**
 * Evaluate a text directive, including filters.
 *
 * @param {String} text
 * @return {String}
 */

exports.$eval = function (text) {
  // check for filters.
  if (filterRE.test(text)) {
    var dir = dirParser.parse(text)[0]
    // the filter regex check might give false positive
    // for pipes inside strings, so it's possible that
    // we don't get any filters here
    return dir.filters
      ? _.applyFilters(
          this.$get(dir.expression),
          _.resolveFilters(this, dir.filters).read,
          this
        )
      : this.$get(dir.expression)
  } else {
    // no filter
    return this.$get(text)
  }
}

/**
 * Interpolate a piece of template text.
 *
 * @param {String} text
 * @return {String}
 */

exports.$interpolate = function (text) {
  var tokens = textParser.parse(text)
  var vm = this
  if (tokens) {
    return tokens.length === 1
      ? vm.$eval(tokens[0].value)
      : tokens.map(function (token) {
          return token.tag
            ? vm.$eval(token.value)
            : token.value
        }).join('')
  } else {
    return text
  }
}

/**
 * Log instance data as a plain JS object
 * so that it is easier to inspect in console.
 * This method assumes console is available.
 *
 * @param {String} [path]
 */

exports.$log = function (path) {
  var data = path
    ? Path.get(this._data, path)
    : this._data
  if (data) {
    data = JSON.parse(JSON.stringify(data))
  }
  console.log(data)
}
},{"../parsers/directive":55,"../parsers/expression":56,"../parsers/path":57,"../parsers/text":59,"../util":67,"../watcher":71}],12:[function(require,module,exports){
var _ = require('../util')
var transition = require('../transition')

/**
 * Append instance to target
 *
 * @param {Node} target
 * @param {Function} [cb]
 * @param {Boolean} [withTransition] - defaults to true
 */

exports.$appendTo = function (target, cb, withTransition) {
  return insert(
    this, target, cb, withTransition,
    append, transition.append
  )
}

/**
 * Prepend instance to target
 *
 * @param {Node} target
 * @param {Function} [cb]
 * @param {Boolean} [withTransition] - defaults to true
 */

exports.$prependTo = function (target, cb, withTransition) {
  target = query(target)
  if (target.hasChildNodes()) {
    this.$before(target.firstChild, cb, withTransition)
  } else {
    this.$appendTo(target, cb, withTransition)
  }
  return this
}

/**
 * Insert instance before target
 *
 * @param {Node} target
 * @param {Function} [cb]
 * @param {Boolean} [withTransition] - defaults to true
 */

exports.$before = function (target, cb, withTransition) {
  return insert(
    this, target, cb, withTransition,
    before, transition.before
  )
}

/**
 * Insert instance after target
 *
 * @param {Node} target
 * @param {Function} [cb]
 * @param {Boolean} [withTransition] - defaults to true
 */

exports.$after = function (target, cb, withTransition) {
  target = query(target)
  if (target.nextSibling) {
    this.$before(target.nextSibling, cb, withTransition)
  } else {
    this.$appendTo(target.parentNode, cb, withTransition)
  }
  return this
}

/**
 * Remove instance from DOM
 *
 * @param {Function} [cb]
 * @param {Boolean} [withTransition] - defaults to true
 */

exports.$remove = function (cb, withTransition) {
  var inDoc = this._isAttached && _.inDoc(this.$el)
  // if we are not in document, no need to check
  // for transitions
  if (!inDoc) withTransition = false
  var op
  var self = this
  var realCb = function () {
    if (inDoc) self._callHook('detached')
    if (cb) cb()
  }
  if (
    this._isBlock &&
    !this._blockFragment.hasChildNodes()
  ) {
    op = withTransition === false
      ? append
      : transition.removeThenAppend
    blockOp(this, this._blockFragment, op, realCb)
  } else {
    op = withTransition === false
      ? remove
      : transition.remove
    op(this.$el, this, realCb)
  }
  return this
}

/**
 * Shared DOM insertion function.
 *
 * @param {Vue} vm
 * @param {Element} target
 * @param {Function} [cb]
 * @param {Boolean} [withTransition]
 * @param {Function} op1 - op for non-transition insert
 * @param {Function} op2 - op for transition insert
 * @return vm
 */

function insert (vm, target, cb, withTransition, op1, op2) {
  target = query(target)
  var targetIsDetached = !_.inDoc(target)
  var op = withTransition === false || targetIsDetached
    ? op1
    : op2
  var shouldCallHook =
    !targetIsDetached &&
    !vm._isAttached &&
    !_.inDoc(vm.$el)
  if (vm._isBlock) {
    blockOp(vm, target, op, cb)
  } else {
    op(vm.$el, target, vm, cb)
  }
  if (shouldCallHook) {
    vm._callHook('attached')
  }
  return vm
}

/**
 * Execute a transition operation on a block instance,
 * iterating through all its block nodes.
 *
 * @param {Vue} vm
 * @param {Node} target
 * @param {Function} op
 * @param {Function} cb
 */

function blockOp (vm, target, op, cb) {
  var current = vm._blockStart
  var end = vm._blockEnd
  var next
  while (next !== end) {
    next = current.nextSibling
    op(current, target, vm)
    current = next
  }
  op(end, target, vm, cb)
}

/**
 * Check for selectors
 *
 * @param {String|Element} el
 */

function query (el) {
  return typeof el === 'string'
    ? document.querySelector(el)
    : el
}

/**
 * Append operation that takes a callback.
 *
 * @param {Node} el
 * @param {Node} target
 * @param {Vue} vm - unused
 * @param {Function} [cb]
 */

function append (el, target, vm, cb) {
  target.appendChild(el)
  if (cb) cb()
}

/**
 * InsertBefore operation that takes a callback.
 *
 * @param {Node} el
 * @param {Node} target
 * @param {Vue} vm - unused
 * @param {Function} [cb]
 */

function before (el, target, vm, cb) {
  _.before(el, target)
  if (cb) cb()
}

/**
 * Remove operation that takes a callback.
 *
 * @param {Node} el
 * @param {Vue} vm - unused
 * @param {Function} [cb]
 */

function remove (el, vm, cb) {
  _.remove(el)
  if (cb) cb()
}
},{"../transition":61,"../util":67}],13:[function(require,module,exports){
var _ = require('../util')

/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 */

exports.$on = function (event, fn) {
  (this._events[event] || (this._events[event] = []))
    .push(fn)
  modifyListenerCount(this, event, 1)
  return this
}

/**
 * Adds an `event` listener that will be invoked a single
 * time then automatically removed.
 *
 * @param {String} event
 * @param {Function} fn
 */

exports.$once = function (event, fn) {
  var self = this
  function on () {
    self.$off(event, on)
    fn.apply(this, arguments)
  }
  on.fn = fn
  this.$on(event, on)
  return this
}

/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 */

exports.$off = function (event, fn) {
  var cbs
  // all
  if (!arguments.length) {
    if (this.$parent) {
      for (event in this._events) {
        cbs = this._events[event]
        if (cbs) {
          modifyListenerCount(this, event, -cbs.length)
        }
      }
    }
    this._events = {}
    return this
  }
  // specific event
  cbs = this._events[event]
  if (!cbs) {
    return this
  }
  if (arguments.length === 1) {
    modifyListenerCount(this, event, -cbs.length)
    this._events[event] = null
    return this
  }
  // specific handler
  var cb
  var i = cbs.length
  while (i--) {
    cb = cbs[i]
    if (cb === fn || cb.fn === fn) {
      modifyListenerCount(this, event, -1)
      cbs.splice(i, 1)
      break
    }
  }
  return this
}

/**
 * Trigger an event on self.
 *
 * @param {String} event
 */

exports.$emit = function (event) {
  this._eventCancelled = false
  var cbs = this._events[event]
  if (cbs) {
    // avoid leaking arguments:
    // http://jsperf.com/closure-with-arguments
    var i = arguments.length - 1
    var args = new Array(i)
    while (i--) {
      args[i] = arguments[i + 1]
    }
    i = 0
    cbs = cbs.length > 1
      ? _.toArray(cbs)
      : cbs
    for (var l = cbs.length; i < l; i++) {
      if (cbs[i].apply(this, args) === false) {
        this._eventCancelled = true
      }
    }
  }
  return this
}

/**
 * Recursively broadcast an event to all children instances.
 *
 * @param {String} event
 * @param {...*} additional arguments
 */

exports.$broadcast = function (event) {
  // if no child has registered for this event,
  // then there's no need to broadcast.
  if (!this._eventsCount[event]) return
  var children = this._children
  for (var i = 0, l = children.length; i < l; i++) {
    var child = children[i]
    child.$emit.apply(child, arguments)
    if (!child._eventCancelled) {
      child.$broadcast.apply(child, arguments)
    }
  }
  return this
}

/**
 * Recursively propagate an event up the parent chain.
 *
 * @param {String} event
 * @param {...*} additional arguments
 */

exports.$dispatch = function () {
  var parent = this.$parent
  while (parent) {
    parent.$emit.apply(parent, arguments)
    parent = parent._eventCancelled
      ? null
      : parent.$parent
  }
  return this
}

/**
 * Modify the listener counts on all parents.
 * This bookkeeping allows $broadcast to return early when
 * no child has listened to a certain event.
 *
 * @param {Vue} vm
 * @param {String} event
 * @param {Number} count
 */

var hookRE = /^hook:/
function modifyListenerCount (vm, event, count) {
  var parent = vm.$parent
  // hooks do not get broadcasted so no need
  // to do bookkeeping for them
  if (!parent || !count || hookRE.test(event)) return
  while (parent) {
    parent._eventsCount[event] =
      (parent._eventsCount[event] || 0) + count
    parent = parent.$parent
  }
}
},{"../util":67}],14:[function(require,module,exports){
var _ = require('../util')
var mergeOptions = require('../util/merge-option')

/**
 * Expose useful internals
 */

exports.util = _
exports.nextTick = _.nextTick
exports.config = require('../config')

exports.compiler = {
  compile: require('../compiler/compile'),
  transclude: require('../compiler/transclude')
}

exports.parsers = {
  path: require('../parsers/path'),
  text: require('../parsers/text'),
  template: require('../parsers/template'),
  directive: require('../parsers/directive'),
  expression: require('../parsers/expression')
}

/**
 * Each instance constructor, including Vue, has a unique
 * cid. This enables us to create wrapped "child
 * constructors" for prototypal inheritance and cache them.
 */

exports.cid = 0
var cid = 1

/**
 * Class inehritance
 *
 * @param {Object} extendOptions
 */

exports.extend = function (extendOptions) {
  extendOptions = extendOptions || {}
  var Super = this
  var Sub = createClass(
    extendOptions.name ||
    Super.options.name ||
    'VueComponent'
  )
  Sub.prototype = Object.create(Super.prototype)
  Sub.prototype.constructor = Sub
  Sub.cid = cid++
  Sub.options = mergeOptions(
    Super.options,
    extendOptions
  )
  Sub['super'] = Super
  // allow further extension
  Sub.extend = Super.extend
  // create asset registers, so extended classes
  // can have their private assets too.
  createAssetRegisters(Sub)
  return Sub
}

/**
 * A function that returns a sub-class constructor with the
 * given name. This gives us much nicer output when
 * logging instances in the console.
 *
 * @param {String} name
 * @return {Function}
 */

function createClass (name) {
  return new Function(
    'return function ' + _.classify(name) +
    ' (options) { this._init(options) }'
  )()
}

/**
 * Plugin system
 *
 * @param {Object} plugin
 */

exports.use = function (plugin) {
  // additional parameters
  var args = _.toArray(arguments, 1)
  args.unshift(this)
  if (typeof plugin.install === 'function') {
    plugin.install.apply(plugin, args)
  } else {
    plugin.apply(null, args)
  }
  return this
}

/**
 * Define asset registration methods on a constructor.
 *
 * @param {Function} Constructor
 */

var assetTypes = [
  'directive',
  'filter',
  'partial',
  'transition'
]

function createAssetRegisters (Constructor) {

  /* Asset registration methods share the same signature:
   *
   * @param {String} id
   * @param {*} definition
   */

  assetTypes.forEach(function (type) {
    Constructor[type] = function (id, definition) {
      if (!definition) {
        return this.options[type + 's'][id]
      } else {
        this.options[type + 's'][id] = definition
      }
    }
  })

  /**
   * Component registration needs to automatically invoke
   * Vue.extend on object values.
   *
   * @param {String} id
   * @param {Object|Function} definition
   */

  Constructor.component = function (id, definition) {
    if (!definition) {
      return this.options.components[id]
    } else {
      if (_.isPlainObject(definition)) {
        definition.name = id
        definition = _.Vue.extend(definition)
      }
      this.options.components[id] = definition
    }
  }
}

createAssetRegisters(exports)
},{"../compiler/compile":18,"../compiler/transclude":19,"../config":20,"../parsers/directive":55,"../parsers/expression":56,"../parsers/path":57,"../parsers/template":58,"../parsers/text":59,"../util":67,"../util/merge-option":69}],15:[function(require,module,exports){
var _ = require('../util')
var compile = require('../compiler/compile')

/**
 * Set instance target element and kick off the compilation
 * process. The passed in `el` can be a selector string, an
 * existing Element, or a DocumentFragment (for block
 * instances).
 *
 * @param {Element|DocumentFragment|string} el
 * @public
 */

exports.$mount = function (el) {
  if (this._isCompiled) {
    _.warn('$mount() should be called only once.')
    return
  }
  if (!el) {
    el = document.createElement('div')
  } else if (typeof el === 'string') {
    var selector = el
    el = document.querySelector(el)
    if (!el) {
      _.warn('Cannot find element: ' + selector)
      return
    }
  }
  this._compile(el)
  this._isCompiled = true
  this._callHook('compiled')
  if (_.inDoc(this.$el)) {
    this._callHook('attached')
    this._initDOMHooks()
    ready.call(this)
  } else {
    this._initDOMHooks()
    this.$once('hook:attached', ready)
  }
  return this
}

/**
 * Mark an instance as ready.
 */

function ready () {
  this._isAttached = true
  this._isReady = true
  this._callHook('ready')
}

/**
 * Teardown the instance, simply delegate to the internal
 * _destroy.
 */

exports.$destroy = function (remove, deferCleanup) {
  this._destroy(remove, deferCleanup)
}

/**
 * Partially compile a piece of DOM and return a
 * decompile function.
 *
 * @param {Element|DocumentFragment} el
 * @return {Function}
 */

exports.$compile = function (el) {
  return compile(el, this.$options, true)(this, el)
}
},{"../compiler/compile":18,"../util":67}],16:[function(require,module,exports){
var _ = require('./util')
var MAX_UPDATE_COUNT = 10

// we have two separate queues: one for directive updates
// and one for user watcher registered via $watch().
// we want to guarantee directive updates to be called
// before user watchers so that when user watchers are
// triggered, the DOM would have already been in updated
// state.
var queue = []
var userQueue = []
var has = {}
var waiting = false
var flushing = false

/**
 * Reset the batcher's state.
 */

function reset () {
  queue = []
  userQueue = []
  has = {}
  waiting = false
  flushing = false
}

/**
 * Flush both queues and run the jobs.
 */

function flush () {
  flushing = true
  run(queue)
  run(userQueue)
  reset()
}

/**
 * Run the jobs in a single queue.
 *
 * @param {Array} queue
 */

function run (queue) {
  // do not cache length because more jobs might be pushed
  // as we run existing jobs
  for (var i = 0; i < queue.length; i++) {
    queue[i].run()
  }
}

/**
 * Push a job into the job queue.
 * Jobs with duplicate IDs will be skipped unless it's
 * pushed when the queue is being flushed.
 *
 * @param {Object} job
 *   properties:
 *   - {String|Number} id
 *   - {Function}      run
 */

exports.push = function (job) {
  var id = job.id
  if (!id || !has[id] || flushing) {
    if (!has[id]) {
      has[id] = 1
    } else {
      has[id]++
      // detect possible infinite update loops
      if (has[id] > MAX_UPDATE_COUNT) {
        _.warn(
          'You may have an infinite update loop for the ' +
          'watcher with expression: "' + job.expression + '".'
        )
        return
      }
    }
    // A user watcher callback could trigger another
    // directive update during the flushing; at that time
    // the directive queue would already have been run, so
    // we call that update immediately as it is pushed.
    if (flushing && !job.user) {
      job.run()
      return
    }
    ;(job.user ? userQueue : queue).push(job)
    if (!waiting) {
      waiting = true
      _.nextTick(flush)
    }
  }
}
},{"./util":67}],17:[function(require,module,exports){
/**
 * A doubly linked list-based Least Recently Used (LRU)
 * cache. Will keep most recently used items while
 * discarding least recently used items when its limit is
 * reached. This is a bare-bone version of
 * Rasmus Andersson's js-lru:
 *
 *   https://github.com/rsms/js-lru
 *
 * @param {Number} limit
 * @constructor
 */

function Cache (limit) {
  this.size = 0
  this.limit = limit
  this.head = this.tail = undefined
  this._keymap = {}
}

var p = Cache.prototype

/**
 * Put <value> into the cache associated with <key>.
 * Returns the entry which was removed to make room for
 * the new entry. Otherwise undefined is returned.
 * (i.e. if there was enough room already).
 *
 * @param {String} key
 * @param {*} value
 * @return {Entry|undefined}
 */

p.put = function (key, value) {
  var entry = {
    key:key,
    value:value
  }
  this._keymap[key] = entry
  if (this.tail) {
    this.tail.newer = entry
    entry.older = this.tail
  } else {
    this.head = entry
  }
  this.tail = entry
  if (this.size === this.limit) {
    return this.shift()
  } else {
    this.size++
  }
}

/**
 * Purge the least recently used (oldest) entry from the
 * cache. Returns the removed entry or undefined if the
 * cache was empty.
 */

p.shift = function () {
  var entry = this.head
  if (entry) {
    this.head = this.head.newer
    this.head.older = undefined
    entry.newer = entry.older = undefined
    this._keymap[entry.key] = undefined
  }
  return entry
}

/**
 * Get and register recent use of <key>. Returns the value
 * associated with <key> or undefined if not in cache.
 *
 * @param {String} key
 * @param {Boolean} returnEntry
 * @return {Entry|*}
 */

p.get = function (key, returnEntry) {
  var entry = this._keymap[key]
  if (entry === undefined) return
  if (entry === this.tail) {
    return returnEntry
      ? entry
      : entry.value
  }
  // HEAD--------------TAIL
  //   <.older   .newer>
  //  <--- add direction --
  //   A  B  C  <D>  E
  if (entry.newer) {
    if (entry === this.head) {
      this.head = entry.newer
    }
    entry.newer.older = entry.older // C <-- E.
  }
  if (entry.older) {
    entry.older.newer = entry.newer // C. --> E
  }
  entry.newer = undefined // D --x
  entry.older = this.tail // D. --> E
  if (this.tail) {
    this.tail.newer = entry // E. <-- D
  }
  this.tail = entry
  return returnEntry
    ? entry
    : entry.value
}

module.exports = Cache
},{}],18:[function(require,module,exports){
var _ = require('../util')
var config = require('../config')
var textParser = require('../parsers/text')
var dirParser = require('../parsers/directive')
var templateParser = require('../parsers/template')

module.exports = compile

/**
 * Compile a template and return a reusable composite link
 * function, which recursively contains more link functions
 * inside. This top level compile function should only be
 * called on instance root nodes.
 *
 * @param {Element|DocumentFragment} el
 * @param {Object} options
 * @param {Boolean} partial
 * @param {Boolean} transcluded
 * @return {Function}
 */

function compile (el, options, partial, transcluded) {
  var isBlock = el.nodeType === 11
  // link function for param attributes.
  var params = options.paramAttributes
  var paramsLinkFn = params && !partial && !transcluded && !isBlock
    ? compileParamAttributes(el, params, options)
    : null
  // link function for the node itself.
  // if this is a block instance, we return a link function
  // for the attributes found on the container, if any.
  // options._containerAttrs are collected during transclusion.
  var nodeLinkFn = isBlock
    ? compileBlockContainer(options._containerAttrs, params, options)
    : compileNode(el, options)
  // link function for the childNodes
  var childLinkFn =
    !(nodeLinkFn && nodeLinkFn.terminal) &&
    el.tagName !== 'SCRIPT' &&
    el.hasChildNodes()
      ? compileNodeList(el.childNodes, options)
      : null

  /**
   * A composite linker function to be called on a already
   * compiled piece of DOM, which instantiates all directive
   * instances.
   *
   * @param {Vue} vm
   * @param {Element|DocumentFragment} el
   * @return {Function|undefined}
   */

  function compositeLinkFn (vm, el) {
    var originalDirCount = vm._directives.length
    var parentOriginalDirCount =
      vm.$parent && vm.$parent._directives.length
    if (paramsLinkFn) {
      paramsLinkFn(vm, el)
    }
    // cache childNodes before linking parent, fix #657
    var childNodes = _.toArray(el.childNodes)
    // if this is a transcluded compile, linkers need to be
    // called in source scope, and the host needs to be
    // passed down.
    var source = transcluded ? vm.$parent : vm
    var host = transcluded ? vm : undefined
    // link
    if (nodeLinkFn) nodeLinkFn(source, el, host)
    if (childLinkFn) childLinkFn(source, childNodes, host)

    /**
     * If this is a partial compile, the linker function
     * returns an unlink function that tearsdown all
     * directives instances generated during the partial
     * linking.
     */

    if (partial && !transcluded) {
      var selfDirs = vm._directives.slice(originalDirCount)
      var parentDirs = vm.$parent &&
        vm.$parent._directives.slice(parentOriginalDirCount)

      var teardownDirs = function (vm, dirs) {
        var i = dirs.length
        while (i--) {
          dirs[i]._teardown()
        }
        i = vm._directives.indexOf(dirs[0])
        vm._directives.splice(i, dirs.length)
      }

      return function unlink () {
        teardownDirs(vm, selfDirs)
        if (parentDirs) {
          teardownDirs(vm.$parent, parentDirs)
        }
      }
    }
  }

  // transcluded linkFns are terminal, because it takes
  // over the entire sub-tree.
  if (transcluded) {
    compositeLinkFn.terminal = true
  }

  return compositeLinkFn
}

/**
 * Compile the attributes found on a "block container" -
 * i.e. the container node in the parent tempate of a block
 * instance. We are only concerned with v-with and
 * paramAttributes here.
 *
 * @param {Object} attrs - a map of attr name/value pairs
 * @param {Array} params - param attributes list
 * @param {Object} options
 * @return {Function}
 */

function compileBlockContainer (attrs, params, options) {
  if (!attrs) return null
  var paramsLinkFn = params
    ? compileParamAttributes(attrs, params, options)
    : null
  var withVal = attrs[config.prefix + 'with']
  var withLinkFn = null
  if (withVal) {
    var descriptor = dirParser.parse(withVal)[0]
    var def = options.directives['with']
    withLinkFn = function (vm, el) {
      vm._bindDir('with', el, descriptor, def)   
    }
  }
  return function blockContainerLinkFn (vm) {
    // explicitly passing null to the linkers
    // since v-with doesn't need a real element
    if (paramsLinkFn) paramsLinkFn(vm, null)
    if (withLinkFn) withLinkFn(vm, null)
  }
}

/**
 * Compile a node and return a nodeLinkFn based on the
 * node type.
 *
 * @param {Node} node
 * @param {Object} options
 * @return {Function|null}
 */

function compileNode (node, options) {
  var type = node.nodeType
  if (type === 1 && node.tagName !== 'SCRIPT') {
    return compileElement(node, options)
  } else if (type === 3 && config.interpolate && node.data.trim()) {
    return compileTextNode(node, options)
  } else {
    return null
  }
}

/**
 * Compile an element and return a nodeLinkFn.
 *
 * @param {Element} el
 * @param {Object} options
 * @return {Function|null}
 */

function compileElement (el, options) {
  if (checkTransclusion(el)) {
    // unwrap textNode
    if (el.hasAttribute('__vue__wrap')) {
      el = el.firstChild
    }
    return compile(el, options._parent.$options, true, true)
  }
  var linkFn, tag, component
  // check custom element component, but only on non-root
  if (!el.__vue__) {
    tag = el.tagName.toLowerCase()
    component =
      tag.indexOf('-') > 0 &&
      options.components[tag]
    if (component) {
      el.setAttribute(config.prefix + 'component', tag)
    }
  }
  if (component || el.hasAttributes()) {
    // check terminal direcitves
    linkFn = checkTerminalDirectives(el, options)
    // if not terminal, build normal link function
    if (!linkFn) {
      var dirs = collectDirectives(el, options)
      linkFn = dirs.length
        ? makeNodeLinkFn(dirs)
        : null
    }
  }
  // if the element is a textarea, we need to interpolate
  // its content on initial render.
  if (el.tagName === 'TEXTAREA') {
    var realLinkFn = linkFn
    linkFn = function (vm, el) {
      el.value = vm.$interpolate(el.value)
      if (realLinkFn) realLinkFn(vm, el)
    }
    linkFn.terminal = true
  }
  return linkFn
}

/**
 * Build a link function for all directives on a single node.
 *
 * @param {Array} directives
 * @return {Function} directivesLinkFn
 */

function makeNodeLinkFn (directives) {
  return function nodeLinkFn (vm, el, host) {
    // reverse apply because it's sorted low to high
    var i = directives.length
    var dir, j, k, target
    while (i--) {
      dir = directives[i]
      // a directive can be transcluded if it's written
      // on a component's container in its parent tempalte.
      target = dir.transcluded
        ? vm.$parent
        : vm
      if (dir._link) {
        // custom link fn
        dir._link(target, el)
      } else {
        k = dir.descriptors.length
        for (j = 0; j < k; j++) {
          target._bindDir(dir.name, el,
            dir.descriptors[j], dir.def, host)
        }
      }
    }
  }
}

/**
 * Compile a textNode and return a nodeLinkFn.
 *
 * @param {TextNode} node
 * @param {Object} options
 * @return {Function|null} textNodeLinkFn
 */

function compileTextNode (node, options) {
  var tokens = textParser.parse(node.data)
  if (!tokens) {
    return null
  }
  var frag = document.createDocumentFragment()
  var el, token
  for (var i = 0, l = tokens.length; i < l; i++) {
    token = tokens[i]
    el = token.tag
      ? processTextToken(token, options)
      : document.createTextNode(token.value)
    frag.appendChild(el)
  }
  return makeTextNodeLinkFn(tokens, frag, options)
}

/**
 * Process a single text token.
 *
 * @param {Object} token
 * @param {Object} options
 * @return {Node}
 */

function processTextToken (token, options) {
  var el
  if (token.oneTime) {
    el = document.createTextNode(token.value)
  } else {
    if (token.html) {
      el = document.createComment('v-html')
      setTokenType('html')
    } else if (token.partial) {
      el = document.createComment('v-partial')
      setTokenType('partial')
    } else {
      // IE will clean up empty textNodes during
      // frag.cloneNode(true), so we have to give it
      // something here...
      el = document.createTextNode(' ')
      setTokenType('text')
    }
  }
  function setTokenType (type) {
    token.type = type
    token.def = options.directives[type]
    token.descriptor = dirParser.parse(token.value)[0]
  }
  return el
}

/**
 * Build a function that processes a textNode.
 *
 * @param {Array<Object>} tokens
 * @param {DocumentFragment} frag
 */

function makeTextNodeLinkFn (tokens, frag) {
  return function textNodeLinkFn (vm, el) {
    var fragClone = frag.cloneNode(true)
    var childNodes = _.toArray(fragClone.childNodes)
    var token, value, node
    for (var i = 0, l = tokens.length; i < l; i++) {
      token = tokens[i]
      value = token.value
      if (token.tag) {
        node = childNodes[i]
        if (token.oneTime) {
          value = vm.$eval(value)
          if (token.html) {
            _.replace(node, templateParser.parse(value, true))
          } else {
            node.data = value
          }
        } else {
          vm._bindDir(token.type, node,
                      token.descriptor, token.def)
        }
      }
    }
    _.replace(el, fragClone)
  }
}

/**
 * Compile a node list and return a childLinkFn.
 *
 * @param {NodeList} nodeList
 * @param {Object} options
 * @return {Function|undefined}
 */

function compileNodeList (nodeList, options) {
  var linkFns = []
  var nodeLinkFn, childLinkFn, node
  for (var i = 0, l = nodeList.length; i < l; i++) {
    node = nodeList[i]
    nodeLinkFn = compileNode(node, options)
    childLinkFn =
      !(nodeLinkFn && nodeLinkFn.terminal) &&
      node.tagName !== 'SCRIPT' &&
      node.hasChildNodes()
        ? compileNodeList(node.childNodes, options)
        : null
    linkFns.push(nodeLinkFn, childLinkFn)
  }
  return linkFns.length
    ? makeChildLinkFn(linkFns)
    : null
}

/**
 * Make a child link function for a node's childNodes.
 *
 * @param {Array<Function>} linkFns
 * @return {Function} childLinkFn
 */

function makeChildLinkFn (linkFns) {
  return function childLinkFn (vm, nodes, host) {
    var node, nodeLinkFn, childrenLinkFn
    for (var i = 0, n = 0, l = linkFns.length; i < l; n++) {
      node = nodes[n]
      nodeLinkFn = linkFns[i++]
      childrenLinkFn = linkFns[i++]
      // cache childNodes before linking parent, fix #657
      var childNodes = _.toArray(node.childNodes)
      if (nodeLinkFn) {
        nodeLinkFn(vm, node, host)
      }
      if (childrenLinkFn) {
        childrenLinkFn(vm, childNodes, host)
      }
    }
  }
}

/**
 * Compile param attributes on a root element and return
 * a paramAttributes link function.
 *
 * @param {Element|Object} el
 * @param {Array} attrs
 * @param {Object} options
 * @return {Function} paramsLinkFn
 */

function compileParamAttributes (el, attrs, options) {
  var params = []
  var isEl = el.nodeType
  var i = attrs.length
  var name, value, param
  while (i--) {
    name = attrs[i]
    if (/[A-Z]/.test(name)) {
      _.warn(
        'You seem to be using camelCase for a paramAttribute, ' +
        'but HTML doesn\'t differentiate between upper and ' +
        'lower case. You should use hyphen-delimited ' +
        'attribute names. For more info see ' +
        'http://vuejs.org/api/options.html#paramAttributes'
      )
    }
    value = isEl ? el.getAttribute(name) : el[name]
    if (value !== null) {
      param = {
        name: name,
        value: value
      }
      var tokens = textParser.parse(value)
      if (tokens) {
        if (isEl) el.removeAttribute(name)
        if (tokens.length > 1) {
          _.warn(
            'Invalid param attribute binding: "' +
            name + '="' + value + '"' +
            '\nDon\'t mix binding tags with plain text ' +
            'in param attribute bindings.'
          )
          continue
        } else {
          param.dynamic = true
          param.value = tokens[0].value
        }
      }
      params.push(param)
    }
  }
  return makeParamsLinkFn(params, options)
}

/**
 * Build a function that applies param attributes to a vm.
 *
 * @param {Array} params
 * @param {Object} options
 * @return {Function} paramsLinkFn
 */

var dataAttrRE = /^data-/

function makeParamsLinkFn (params, options) {
  var def = options.directives['with']
  return function paramsLinkFn (vm, el) {
    var i = params.length
    var param, path
    while (i--) {
      param = params[i]
      // params could contain dashes, which will be
      // interpreted as minus calculations by the parser
      // so we need to wrap the path here
      path = _.camelize(param.name.replace(dataAttrRE, ''))
      if (param.dynamic) {
        // dynamic param attribtues are bound as v-with.
        // we can directly duck the descriptor here beacuse
        // param attributes cannot use expressions or
        // filters.
        vm._bindDir('with', el, {
          arg: path,
          expression: param.value
        }, def)
      } else {
        // just set once
        vm.$set(path, param.value)
      }
    }
  }
}

/**
 * Check an element for terminal directives in fixed order.
 * If it finds one, return a terminal link function.
 *
 * @param {Element} el
 * @param {Object} options
 * @return {Function} terminalLinkFn
 */

var terminalDirectives = [
  'repeat',
  'if',
  'component'
]

function skip () {}
skip.terminal = true

function checkTerminalDirectives (el, options) {
  if (_.attr(el, 'pre') !== null) {
    return skip
  }
  var value, dirName
  /* jshint boss: true */
  for (var i = 0; i < 3; i++) {
    dirName = terminalDirectives[i]
    if (value = _.attr(el, dirName)) {
      return makeTerminalNodeLinkFn(el, dirName, value, options)
    }
  }
}

/**
 * Build a node link function for a terminal directive.
 * A terminal link function terminates the current
 * compilation recursion and handles compilation of the
 * subtree in the directive.
 *
 * @param {Element} el
 * @param {String} dirName
 * @param {String} value
 * @param {Object} options
 * @return {Function} terminalLinkFn
 */

function makeTerminalNodeLinkFn (el, dirName, value, options) {
  var descriptor = dirParser.parse(value)[0]
  var def = options.directives[dirName]
  var fn = function terminalNodeLinkFn (vm, el, host) {
    vm._bindDir(dirName, el, descriptor, def, host)
  }
  fn.terminal = true
  return fn
}

/**
 * Collect the directives on an element.
 *
 * @param {Element} el
 * @param {Object} options
 * @return {Array}
 */

function collectDirectives (el, options) {
  var attrs = _.toArray(el.attributes)
  var i = attrs.length
  var dirs = []
  var attr, attrName, dir, dirName, dirDef, transcluded
  while (i--) {
    attr = attrs[i]
    attrName = attr.name
    transcluded =
      options._transcludedAttrs &&
      options._transcludedAttrs[attrName]
    if (attrName.indexOf(config.prefix) === 0) {
      dirName = attrName.slice(config.prefix.length)
      dirDef = options.directives[dirName]
      _.assertAsset(dirDef, 'directive', dirName)
      if (dirDef) {
        dirs.push({
          name: dirName,
          descriptors: dirParser.parse(attr.value),
          def: dirDef,
          transcluded: transcluded
        })
      }
    } else if (config.interpolate) {
      dir = collectAttrDirective(el, attrName, attr.value,
                                 options)
      if (dir) {
        dir.transcluded = transcluded
        dirs.push(dir)
      }
    }
  }
  // sort by priority, LOW to HIGH
  dirs.sort(directiveComparator)
  return dirs
}

/**
 * Check an attribute for potential dynamic bindings,
 * and return a directive object.
 *
 * @param {Element} el
 * @param {String} name
 * @param {String} value
 * @param {Object} options
 * @return {Object}
 */

function collectAttrDirective (el, name, value, options) {
  var tokens = textParser.parse(value)
  if (tokens) {
    var def = options.directives.attr
    var i = tokens.length
    var allOneTime = true
    while (i--) {
      var token = tokens[i]
      if (token.tag && !token.oneTime) {
        allOneTime = false
      }
    }
    return {
      def: def,
      _link: allOneTime
        ? function (vm, el) {
            el.setAttribute(name, vm.$interpolate(value))
          }
        : function (vm, el) {
            var value = textParser.tokensToExp(tokens, vm)
            var desc = dirParser.parse(name + ':' + value)[0]
            vm._bindDir('attr', el, desc, def)
          }
    }
  }
}

/**
 * Directive priority sort comparator
 *
 * @param {Object} a
 * @param {Object} b
 */

function directiveComparator (a, b) {
  a = a.def.priority || 0
  b = b.def.priority || 0
  return a > b ? 1 : -1
}

/**
 * Check whether an element is transcluded
 *
 * @param {Element} el
 * @return {Boolean}
 */

var transcludedFlagAttr = '__vue__transcluded'
function checkTransclusion (el) {
  if (el.nodeType === 1 && el.hasAttribute(transcludedFlagAttr)) {
    el.removeAttribute(transcludedFlagAttr)
    return true
  }
}
},{"../config":20,"../parsers/directive":55,"../parsers/template":58,"../parsers/text":59,"../util":67}],19:[function(require,module,exports){
var _ = require('../util')
var config = require('../config')
var templateParser = require('../parsers/template')
var transcludedFlagAttr = '__vue__transcluded'

/**
 * Process an element or a DocumentFragment based on a
 * instance option object. This allows us to transclude
 * a template node/fragment before the instance is created,
 * so the processed fragment can then be cloned and reused
 * in v-repeat.
 *
 * @param {Element} el
 * @param {Object} options
 * @return {Element|DocumentFragment}
 */

module.exports = function transclude (el, options) {
  if (options && options._asComponent) {
    // mutating the options object here assuming the same
    // object will be used for compile right after this
    options._transcludedAttrs = extractAttrs(el.attributes)
    // Mark content nodes and attrs so that the compiler
    // knows they should be compiled in parent scope.
    var i = el.childNodes.length
    while (i--) {
      var node = el.childNodes[i]
      if (node.nodeType === 1) {
        node.setAttribute(transcludedFlagAttr, '')
      } else if (node.nodeType === 3 && node.data.trim()) {
        // wrap transcluded textNodes in spans, because
        // raw textNodes can't be persisted through clones
        // by attaching attributes.
        var wrapper = document.createElement('span')
        wrapper.textContent = node.data
        wrapper.setAttribute('__vue__wrap', '')
        wrapper.setAttribute(transcludedFlagAttr, '')
        el.replaceChild(wrapper, node)
      }
    }
  }
  // for template tags, what we want is its content as
  // a documentFragment (for block instances)
  if (el.tagName === 'TEMPLATE') {
    el = templateParser.parse(el)
  }
  if (options && options.template) {
    el = transcludeTemplate(el, options)
  }
  if (el instanceof DocumentFragment) {
    _.prepend(document.createComment('v-start'), el)
    el.appendChild(document.createComment('v-end'))
  }
  return el
}

/**
 * Process the template option.
 * If the replace option is true this will swap the $el.
 *
 * @param {Element} el
 * @param {Object} options
 * @return {Element|DocumentFragment}
 */

function transcludeTemplate (el, options) {
  var template = options.template
  var frag = templateParser.parse(template, true)
  if (!frag) {
    _.warn('Invalid template option: ' + template)
  } else {
    var rawContent = options._content || _.extractContent(el)
    if (options.replace) {
      if (frag.childNodes.length > 1) {
        // this is a block instance which has no root node.
        // however, the container in the parent template
        // (which is replaced here) may contain v-with and
        // paramAttributes that still need to be compiled
        // for the child. we store all the container
        // attributes on the options object and pass it down
        // to the compiler.
        var containerAttrs = options._containerAttrs = {}
        var i = el.attributes.length
        while (i--) {
          var attr = el.attributes[i]
          containerAttrs[attr.name] = attr.value
        }
        transcludeContent(frag, rawContent)
        return frag
      } else {
        var replacer = frag.firstChild
        _.copyAttributes(el, replacer)
        transcludeContent(replacer, rawContent)
        return replacer
      }
    } else {
      el.appendChild(frag)
      transcludeContent(el, rawContent)
      return el
    }
  }
}

/**
 * Resolve <content> insertion points mimicking the behavior
 * of the Shadow DOM spec:
 *
 *   http://w3c.github.io/webcomponents/spec/shadow/#insertion-points
 *
 * @param {Element|DocumentFragment} el
 * @param {Element} raw
 */

function transcludeContent (el, raw) {
  var outlets = getOutlets(el)
  var i = outlets.length
  if (!i) return
  var outlet, select, selected, j, main

  function isDirectChild (node) {
    return node.parentNode === raw
  }

  // first pass, collect corresponding content
  // for each outlet.
  while (i--) {
    outlet = outlets[i]
    if (raw) {
      select = outlet.getAttribute('select')
      if (select) {  // select content
        selected = raw.querySelectorAll(select)
        if (selected.length) {
          // according to Shadow DOM spec, `select` can
          // only select direct children of the host node.
          // enforcing this also fixes #786.
          selected = [].filter.call(selected, isDirectChild)
        }
        outlet.content = selected.length
          ? selected
          : _.toArray(outlet.childNodes)
      } else { // default content
        main = outlet
      }
    } else { // fallback content
      outlet.content = _.toArray(outlet.childNodes)
    }
  }
  // second pass, actually insert the contents
  for (i = 0, j = outlets.length; i < j; i++) {
    outlet = outlets[i]
    if (outlet !== main) {
      insertContentAt(outlet, outlet.content)
    }
  }
  // finally insert the main content
  if (main) {
    insertContentAt(main, _.toArray(raw.childNodes))
  }
}

/**
 * Get <content> outlets from the element/list
 *
 * @param {Element|Array} el
 * @return {Array}
 */

var concat = [].concat
function getOutlets (el) {
  return _.isArray(el)
    ? concat.apply([], el.map(getOutlets))
    : el.querySelectorAll
      ? _.toArray(el.querySelectorAll('content'))
      : []
}

/**
 * Insert an array of nodes at outlet,
 * then remove the outlet.
 *
 * @param {Element} outlet
 * @param {Array} contents
 */

function insertContentAt (outlet, contents) {
  // not using util DOM methods here because
  // parentNode can be cached
  var parent = outlet.parentNode
  for (var i = 0, j = contents.length; i < j; i++) {
    parent.insertBefore(contents[i], outlet)
  }
  parent.removeChild(outlet)
}

/**
 * Helper to extract a component container's attribute names
 * into a map, and filtering out `v-with` in the process.
 * The resulting map will be used in compiler/compile to
 * determine whether an attribute is transcluded.
 *
 * @param {NameNodeMap} attrs
 */

function extractAttrs (attrs) {
  if (!attrs) return null
  var res = {}
  var vwith = config.prefix + 'with'
  var i = attrs.length
  while (i--) {
    var name = attrs[i].name
    if (name !== vwith) res[name] = true
  }
  return res
}
},{"../config":20,"../parsers/template":58,"../util":67}],20:[function(require,module,exports){
module.exports = {

  /**
   * The prefix to look for when parsing directives.
   *
   * @type {String}
   */

  prefix: 'v-',

  /**
   * Whether to print debug messages.
   * Also enables stack trace for warnings.
   *
   * @type {Boolean}
   */

  debug: false,

  /**
   * Whether to suppress warnings.
   *
   * @type {Boolean}
   */

  silent: false,

  /**
   * Whether allow observer to alter data objects'
   * __proto__.
   *
   * @type {Boolean}
   */

  proto: true,

  /**
   * Whether to parse mustache tags in templates.
   *
   * @type {Boolean}
   */

  interpolate: true,

  /**
   * Whether to use async rendering.
   */

  async: true,

  /**
   * Whether to warn against errors caught when evaluating
   * expressions.
   */

  warnExpressionErrors: true,

  /**
   * Internal flag to indicate the delimiters have been
   * changed.
   *
   * @type {Boolean}
   */

  _delimitersChanged: true

}

/**
 * Interpolation delimiters.
 * We need to mark the changed flag so that the text parser
 * knows it needs to recompile the regex.
 *
 * @type {Array<String>}
 */

var delimiters = ['{{', '}}']
Object.defineProperty(module.exports, 'delimiters', {
  get: function () {
    return delimiters
  },
  set: function (val) {
    delimiters = val
    this._delimitersChanged = true
  }
})
},{}],21:[function(require,module,exports){
var _ = require('./util')
var config = require('./config')
var Watcher = require('./watcher')
var textParser = require('./parsers/text')
var expParser = require('./parsers/expression')

/**
 * A directive links a DOM element with a piece of data,
 * which is the result of evaluating an expression.
 * It registers a watcher with the expression and calls
 * the DOM update function when a change is triggered.
 *
 * @param {String} name
 * @param {Node} el
 * @param {Vue} vm
 * @param {Object} descriptor
 *                 - {String} expression
 *                 - {String} [arg]
 *                 - {Array<Object>} [filters]
 * @param {Object} def - directive definition object
 * @param {Vue|undefined} host - transclusion host target
 * @constructor
 */

function Directive (name, el, vm, descriptor, def, host) {
  // public
  this.name = name
  this.el = el
  this.vm = vm
  // copy descriptor props
  this.raw = descriptor.raw
  this.expression = descriptor.expression
  this.arg = descriptor.arg
  this.filters = _.resolveFilters(vm, descriptor.filters)
  // private
  this._host = host
  this._locked = false
  this._bound = false
  // init
  this._bind(def)
}

var p = Directive.prototype

/**
 * Initialize the directive, mixin definition properties,
 * setup the watcher, call definition bind() and update()
 * if present.
 *
 * @param {Object} def
 */

p._bind = function (def) {
  if (this.name !== 'cloak' && this.el && this.el.removeAttribute) {
    this.el.removeAttribute(config.prefix + this.name)
  }
  if (typeof def === 'function') {
    this.update = def
  } else {
    _.extend(this, def)
  }
  this._watcherExp = this.expression
  this._checkDynamicLiteral()
  if (this.bind) {
    this.bind()
  }
  if (this._watcherExp &&
      (this.update || this.twoWay) &&
      (!this.isLiteral || this._isDynamicLiteral) &&
      !this._checkStatement()) {
    // wrapped updater for context
    var dir = this
    var update = this._update = this.update
      ? function (val, oldVal) {
          if (!dir._locked) {
            dir.update(val, oldVal)
          }
        }
      : function () {} // noop if no update is provided
    // use raw expression as identifier because filters
    // make them different watchers
    var watcher = this.vm._watchers[this.raw]
    // v-repeat always creates a new watcher because it has
    // a special filter that's bound to its directive
    // instance.
    if (!watcher || this.name === 'repeat') {
      watcher = this.vm._watchers[this.raw] = new Watcher(
        this.vm,
        this._watcherExp,
        update, // callback
        {
          filters: this.filters,
          twoWay: this.twoWay,
          deep: this.deep
        }
      )
    } else {
      watcher.addCb(update)
    }
    this._watcher = watcher
    if (this._initValue != null) {
      watcher.set(this._initValue)
    } else if (this.update) {
      this.update(watcher.value)
    }
  }
  this._bound = true
}

/**
 * check if this is a dynamic literal binding.
 *
 * e.g. v-component="{{currentView}}"
 */

p._checkDynamicLiteral = function () {
  var expression = this.expression
  if (expression && this.isLiteral) {
    var tokens = textParser.parse(expression)
    if (tokens) {
      var exp = textParser.tokensToExp(tokens)
      this.expression = this.vm.$get(exp)
      this._watcherExp = exp
      this._isDynamicLiteral = true
    }
  }
}

/**
 * Check if the directive is a function caller
 * and if the expression is a callable one. If both true,
 * we wrap up the expression and use it as the event
 * handler.
 *
 * e.g. v-on="click: a++"
 *
 * @return {Boolean}
 */

p._checkStatement = function () {
  var expression = this.expression
  if (
    expression && this.acceptStatement &&
    !expParser.pathTestRE.test(expression)
  ) {
    var fn = expParser.parse(expression).get
    var vm = this.vm
    var handler = function () {
      fn.call(vm, vm)
    }
    if (this.filters) {
      handler = _.applyFilters(
        handler,
        this.filters.read,
        vm
      )
    }
    this.update(handler)
    return true
  }
}

/**
 * Check for an attribute directive param, e.g. lazy
 *
 * @param {String} name
 * @return {String}
 */

p._checkParam = function (name) {
  var param = this.el.getAttribute(name)
  if (param !== null) {
    this.el.removeAttribute(name)
  }
  return param
}

/**
 * Teardown the watcher and call unbind.
 */

p._teardown = function () {
  if (this._bound) {
    if (this.unbind) {
      this.unbind()
    }
    var watcher = this._watcher
    if (watcher && watcher.active) {
      watcher.removeCb(this._update)
      if (!watcher.active) {
        this.vm._watchers[this.raw] = null
      }
    }
    this._bound = false
    this.vm = this.el = this._watcher = null
  }
}

/**
 * Set the corresponding value with the setter.
 * This should only be used in two-way directives
 * e.g. v-model.
 *
 * @param {*} value
 * @param {Boolean} lock - prevent wrtie triggering update.
 * @public
 */

p.set = function (value, lock) {
  if (this.twoWay) {
    if (lock) {
      this._locked = true
    }
    this._watcher.set(value)
    if (lock) {
      var self = this
      _.nextTick(function () {
        self._locked = false
      })
    }
  }
}

module.exports = Directive
},{"./config":20,"./parsers/expression":56,"./parsers/text":59,"./util":67,"./watcher":71}],22:[function(require,module,exports){
// xlink
var xlinkNS = 'http://www.w3.org/1999/xlink'
var xlinkRE = /^xlink:/

module.exports = {

  priority: 850,

  bind: function () {
    var name = this.arg
    this.update = xlinkRE.test(name)
      ? xlinkHandler
      : defaultHandler
  }

}

function defaultHandler (value) {
  if (value || value === 0) {
    this.el.setAttribute(this.arg, value)
  } else {
    this.el.removeAttribute(this.arg)
  }
}

function xlinkHandler (value) {
  if (value != null) {
    this.el.setAttributeNS(xlinkNS, this.arg, value)
  } else {
    this.el.removeAttributeNS(xlinkNS, 'href')
  }
}
},{}],23:[function(require,module,exports){
var _ = require('../util')
var addClass = _.addClass
var removeClass = _.removeClass

module.exports = function (value) {
  if (this.arg) {
    var method = value ? addClass : removeClass
    method(this.el, this.arg)
  } else {
    if (this.lastVal) {
      removeClass(this.el, this.lastVal)
    }
    if (value) {
      addClass(this.el, value)
      this.lastVal = value
    }
  }
}
},{"../util":67}],24:[function(require,module,exports){
var config = require('../config')

module.exports = {

  bind: function () {
    var el = this.el
    this.vm.$once('hook:compiled', function () {
      el.removeAttribute(config.prefix + 'cloak')
    })
  }

}
},{"../config":20}],25:[function(require,module,exports){
var _ = require('../util')
var templateParser = require('../parsers/template')

module.exports = {

  isLiteral: true,

  /**
   * Setup. Two possible usages:
   *
   * - static:
   *   v-component="comp"
   *
   * - dynamic:
   *   v-component="{{currentView}}"
   */

  bind: function () {
    if (!this.el.__vue__) {
      // create a ref anchor
      this.ref = document.createComment('v-component')
      _.replace(this.el, this.ref)
      // check keep-alive options.
      // If yes, instead of destroying the active vm when
      // hiding (v-if) or switching (dynamic literal) it,
      // we simply remove it from the DOM and save it in a
      // cache object, with its constructor id as the key.
      this.keepAlive = this._checkParam('keep-alive') != null
      // check ref
      this.refID = _.attr(this.el, 'ref')
      if (this.keepAlive) {
        this.cache = {}
      }
      // check inline-template
      if (this._checkParam('inline-template') !== null) {
        // extract inline template as a DocumentFragment
        this.template = _.extractContent(this.el, true)
      }
      // if static, build right now.
      if (!this._isDynamicLiteral) {
        this.resolveCtor(this.expression)
        var child = this.build()
        child.$before(this.ref)
        this.setCurrent(child)
      } else {
        // check dynamic component params
        this.readyEvent = this._checkParam('wait-for')
        this.transMode = this._checkParam('transition-mode')
      }
    } else {
      _.warn(
        'v-component="' + this.expression + '" cannot be ' +
        'used on an already mounted instance.'
      )
    }
  },

  /**
   * Resolve the component constructor to use when creating
   * the child vm.
   */

  resolveCtor: function (id) {
    this.ctorId = id
    this.Ctor = this.vm.$options.components[id]
    _.assertAsset(this.Ctor, 'component', id)
  },

  /**
   * Instantiate/insert a new child vm.
   * If keep alive and has cached instance, insert that
   * instance; otherwise build a new one and cache it.
   *
   * @return {Vue} - the created instance
   */

  build: function () {
    if (this.keepAlive) {
      var cached = this.cache[this.ctorId]
      if (cached) {
        return cached
      }
    }
    var vm = this.vm
    var el = templateParser.clone(this.el)
    if (this.Ctor) {
      var child = vm.$addChild({
        el: el,
        template: this.template,
        _asComponent: true,
        _host: this._host
      }, this.Ctor)
      if (this.keepAlive) {
        this.cache[this.ctorId] = child
      }
      return child
    }
  },

  /**
   * Teardown the current child, but defers cleanup so
   * that we can separate the destroy and removal steps.
   */

  unbuild: function () {
    var child = this.childVM
    if (!child || this.keepAlive) {
      return
    }
    // the sole purpose of `deferCleanup` is so that we can
    // "deactivate" the vm right now and perform DOM removal
    // later.
    child.$destroy(false, true)
  },

  /**
   * Remove current destroyed child and manually do
   * the cleanup after removal.
   *
   * @param {Function} cb
   */

  remove: function (child, cb) {
    var keepAlive = this.keepAlive
    if (child) {
      child.$remove(function () {
        if (!keepAlive) child._cleanup()
        if (cb) cb()
      })
    } else if (cb) {
      cb()
    }
  },

  /**
   * Update callback for the dynamic literal scenario,
   * e.g. v-component="{{view}}"
   */

  update: function (value) {
    if (!value) {
      // just destroy and remove current
      this.unbuild()
      this.remove(this.childVM)
      this.unsetCurrent()
    } else {
      this.resolveCtor(value)
      this.unbuild()
      var newComponent = this.build()
      var self = this
      if (this.readyEvent) {
        newComponent.$once(this.readyEvent, function () {
          self.swapTo(newComponent)
        })
      } else {
        this.swapTo(newComponent)
      }
    }
  },

  /**
   * Actually swap the components, depending on the
   * transition mode. Defaults to simultaneous.
   *
   * @param {Vue} target
   */

  swapTo: function (target) {
    var self = this
    var current = this.childVM
    this.unsetCurrent()
    this.setCurrent(target)
    switch (self.transMode) {
      case 'in-out':
        target.$before(self.ref, function () {
          self.remove(current)
        })
        break
      case 'out-in':
        self.remove(current, function () {
          target.$before(self.ref)
        })
        break
      default:
        self.remove(current)
        target.$before(self.ref)
    }
  },

  /**
   * Set childVM and parent ref
   */
  
  setCurrent: function (child) {
    this.childVM = child
    var refID = child._refID || this.refID
    if (refID) {
      this.vm.$[refID] = child
    }
  },

  /**
   * Unset childVM and parent ref
   */

  unsetCurrent: function () {
    var child = this.childVM
    this.childVM = null
    var refID = (child && child._refID) || this.refID
    if (refID) {
      this.vm.$[refID] = null
    }
  },

  /**
   * Unbind.
   */

  unbind: function () {
    this.unbuild()
    // destroy all keep-alive cached instances
    if (this.cache) {
      for (var key in this.cache) {
        this.cache[key].$destroy()
      }
      this.cache = null
    }
  }

}
},{"../parsers/template":58,"../util":67}],26:[function(require,module,exports){
module.exports = {

  isLiteral: true,

  bind: function () {
    this.vm.$$[this.expression] = this.el
  },

  unbind: function () {
    delete this.vm.$$[this.expression]
  }
  
}
},{}],27:[function(require,module,exports){
var _ = require('../util')

module.exports = {

  acceptStatement: true,

  bind: function () {
    var child = this.el.__vue__
    if (!child || this.vm !== child.$parent) {
      _.warn(
        '`v-events` should only be used on a child component ' +
        'from the parent template.'
      )
      return
    }
  },

  update: function (handler, oldHandler) {
    if (typeof handler !== 'function') {
      _.warn(
        'Directive "v-events:' + this.expression + '" ' +
        'expects a function value.'
      )
      return
    }
    var child = this.el.__vue__
    if (oldHandler) {
      child.$off(this.arg, oldHandler)
    }
    child.$on(this.arg, handler)
  }

  // when child is destroyed, all events are turned off,
  // so no need for unbind here.

}
},{"../util":67}],28:[function(require,module,exports){
var _ = require('../util')
var templateParser = require('../parsers/template')

module.exports = {

  bind: function () {
    // a comment node means this is a binding for
    // {{{ inline unescaped html }}}
    if (this.el.nodeType === 8) {
      // hold nodes
      this.nodes = []
    }
  },

  update: function (value) {
    value = _.toString(value)
    if (this.nodes) {
      this.swap(value)
    } else {
      this.el.innerHTML = value
    }
  },

  swap: function (value) {
    // remove old nodes
    var i = this.nodes.length
    while (i--) {
      _.remove(this.nodes[i])
    }
    // convert new value to a fragment
    // do not attempt to retrieve from id selector
    var frag = templateParser.parse(value, true, true)
    // save a reference to these nodes so we can remove later
    this.nodes = _.toArray(frag.childNodes)
    _.before(frag, this.el)
  }

}
},{"../parsers/template":58,"../util":67}],29:[function(require,module,exports){
var _ = require('../util')
var compile = require('../compiler/compile')
var templateParser = require('../parsers/template')
var transition = require('../transition')

module.exports = {

  bind: function () {
    var el = this.el
    if (!el.__vue__) {
      this.start = document.createComment('v-if-start')
      this.end = document.createComment('v-if-end')
      _.replace(el, this.end)
      _.before(this.start, this.end)
      if (el.tagName === 'TEMPLATE') {
        this.template = templateParser.parse(el, true)
      } else {
        this.template = document.createDocumentFragment()
        this.template.appendChild(templateParser.clone(el))
      }
      // compile the nested partial
      this.linker = compile(
        this.template,
        this.vm.$options,
        true
      )
    } else {
      this.invalid = true
      _.warn(
        'v-if="' + this.expression + '" cannot be ' +
        'used on an already mounted instance.'
      )
    }
  },

  update: function (value) {
    if (this.invalid) return
    if (value) {
      // avoid duplicate compiles, since update() can be
      // called with different truthy values
      if (!this.unlink) {
        var frag = templateParser.clone(this.template)
        this.compile(frag)
      }
    } else {
      this.teardown()
    }
  },

  // NOTE: this function is shared in v-partial
  compile: function (frag) {
    var vm = this.vm
    // the linker is not guaranteed to be present because
    // this function might get called by v-partial 
    this.unlink = this.linker
      ? this.linker(vm, frag)
      : vm.$compile(frag)
    transition.blockAppend(frag, this.end, vm)
    // call attached for all the child components created
    // during the compilation
    if (_.inDoc(vm.$el)) {
      var children = this.getContainedComponents()
      if (children) children.forEach(callAttach)
    }
  },

  // NOTE: this function is shared in v-partial
  teardown: function () {
    if (!this.unlink) return
    // collect children beforehand
    var children
    if (_.inDoc(this.vm.$el)) {
      children = this.getContainedComponents()
    }
    transition.blockRemove(this.start, this.end, this.vm)
    if (children) children.forEach(callDetach)
    this.unlink()
    this.unlink = null
  },

  // NOTE: this function is shared in v-partial
  getContainedComponents: function () {
    var vm = this.vm
    var start = this.start.nextSibling
    var end = this.end
    var selfCompoents =
      vm._children.length &&
      vm._children.filter(contains)
    var transComponents =
      vm._transCpnts &&
      vm._transCpnts.filter(contains)

    function contains (c) {
      var cur = start
      var next
      while (next !== end) {
        next = cur.nextSibling
        if (cur.contains(c.$el)) {
          return true
        }
        cur = next
      }
      return false
    }

    return selfCompoents
      ? transComponents
        ? selfCompoents.concat(transComponents)
        : selfCompoents
      : transComponents
  },

  // NOTE: this function is shared in v-partial
  unbind: function () {
    if (this.unlink) this.unlink()
  }

}

function callAttach (child) {
  if (!child._isAttached) {
    child._callHook('attached')
  }
}

function callDetach (child) {
  if (child._isAttached) {
    child._callHook('detached')
  }
}
},{"../compiler/compile":18,"../parsers/template":58,"../transition":61,"../util":67}],30:[function(require,module,exports){
// manipulation directives
exports.text       = require('./text')
exports.html       = require('./html')
exports.attr       = require('./attr')
exports.show       = require('./show')
exports['class']   = require('./class')
exports.el         = require('./el')
exports.ref        = require('./ref')
exports.cloak      = require('./cloak')
exports.style      = require('./style')
exports.partial    = require('./partial')
exports.transition = require('./transition')

// event listener directives
exports.on         = require('./on')
exports.model      = require('./model')

// child vm directives
exports.component  = require('./component')
exports.repeat     = require('./repeat')
exports['if']      = require('./if')

// child vm communication directives
exports['with']    = require('./with')
exports.events     = require('./events')
},{"./attr":22,"./class":23,"./cloak":24,"./component":25,"./el":26,"./events":27,"./html":28,"./if":29,"./model":33,"./on":36,"./partial":37,"./ref":38,"./repeat":39,"./show":40,"./style":41,"./text":42,"./transition":43,"./with":44}],31:[function(require,module,exports){
var _ = require('../../util')

module.exports = {

  bind: function () {
    var self = this
    var el = this.el
    this.listener = function () {
      self.set(el.checked, true)
    }
    _.on(el, 'change', this.listener)
    if (el.checked) {
      this._initValue = el.checked
    }
  },

  update: function (value) {
    this.el.checked = !!value
  },

  unbind: function () {
    _.off(this.el, 'change', this.listener)
  }

}
},{"../../util":67}],32:[function(require,module,exports){
var _ = require('../../util')

module.exports = {

  bind: function () {
    var self = this
    var el = this.el

    // check params
    // - lazy: update model on "change" instead of "input"
    var lazy = this._checkParam('lazy') != null
    // - number: cast value into number when updating model.
    var number = this._checkParam('number') != null
    // - debounce: debounce the input listener
    var debounce = parseInt(this._checkParam('debounce'), 10)

    // handle composition events.
    // http://blog.evanyou.me/2014/01/03/composition-event/
    var cpLocked = false
    this.cpLock = function () {
      cpLocked = true
    }
    this.cpUnlock = function () {
      cpLocked = false
      // in IE11 the "compositionend" event fires AFTER
      // the "input" event, so the input handler is blocked
      // at the end... have to call it here.
      set()
    }
    _.on(el,'compositionstart', this.cpLock)
    _.on(el,'compositionend', this.cpUnlock)

    // shared setter
    function set () {
      self.set(
        number ? _.toNumber(el.value) : el.value,
        true
      )
    }

    // if the directive has filters, we need to
    // record cursor position and restore it after updating
    // the input with the filtered value.
    // also force update for type="range" inputs to enable
    // "lock in range" (see #506)
    var hasReadFilter = this.filters && this.filters.read
    this.listener = hasReadFilter || el.type === 'range'
      ? function textInputListener () {
          if (cpLocked) return
          var charsOffset
          // some HTML5 input types throw error here
          try {
            // record how many chars from the end of input
            // the cursor was at
            charsOffset = el.value.length - el.selectionStart
          } catch (e) {}
          // Fix IE10/11 infinite update cycle
          // https://github.com/yyx990803/vue/issues/592
          /* istanbul ignore if */
          if (charsOffset < 0) {
            return
          }
          set()
          _.nextTick(function () {
            // force a value update, because in
            // certain cases the write filters output the
            // same result for different input values, and
            // the Observer set events won't be triggered.
            var newVal = self._watcher.value
            self.update(newVal)
            if (charsOffset != null) {
              var cursorPos =
                _.toString(newVal).length - charsOffset
              el.setSelectionRange(cursorPos, cursorPos)
            }
          })
        }
      : function textInputListener () {
          if (cpLocked) return
          set()
        }

    if (debounce) {
      this.listener = _.debounce(this.listener, debounce)
    }
    this.event = lazy ? 'change' : 'input'
    // Support jQuery events, since jQuery.trigger() doesn't
    // trigger native events in some cases and some plugins
    // rely on $.trigger()
    // 
    // We want to make sure if a listener is attached using
    // jQuery, it is also removed with jQuery, that's why
    // we do the check for each directive instance and
    // store that check result on itself. This also allows
    // easier test coverage control by unsetting the global
    // jQuery variable in tests.
    this.hasjQuery = typeof jQuery === 'function'
    if (this.hasjQuery) {
      jQuery(el).on(this.event, this.listener)
    } else {
      _.on(el, this.event, this.listener)
    }

    // IE9 doesn't fire input event on backspace/del/cut
    if (!lazy && _.isIE9) {
      this.onCut = function () {
        _.nextTick(self.listener)
      }
      this.onDel = function (e) {
        if (e.keyCode === 46 || e.keyCode === 8) {
          self.listener()
        }
      }
      _.on(el, 'cut', this.onCut)
      _.on(el, 'keyup', this.onDel)
    }

    // set initial value if present
    if (
      el.hasAttribute('value') ||
      (el.tagName === 'TEXTAREA' && el.value.trim())
    ) {
      this._initValue = number
        ? _.toNumber(el.value)
        : el.value
    }
  },

  update: function (value) {
    this.el.value = _.toString(value)
  },

  unbind: function () {
    var el = this.el
    if (this.hasjQuery) {
      jQuery(el).off(this.event, this.listener)
    } else {
      _.off(el, this.event, this.listener)
    }
    _.off(el,'compositionstart', this.cpLock)
    _.off(el,'compositionend', this.cpUnlock)
    if (this.onCut) {
      _.off(el,'cut', this.onCut)
      _.off(el,'keyup', this.onDel)
    }
  }

}
},{"../../util":67}],33:[function(require,module,exports){
var _ = require('../../util')

var handlers = {
  _default: require('./default'),
  radio: require('./radio'),
  select: require('./select'),
  checkbox: require('./checkbox')
}

module.exports = {

  priority: 800,
  twoWay: true,
  handlers: handlers,

  /**
   * Possible elements:
   *   <select>
   *   <textarea>
   *   <input type="*">
   *     - text
   *     - checkbox
   *     - radio
   *     - number
   *     - TODO: more types may be supplied as a plugin
   */

  bind: function () {
    // friendly warning...
    var filters = this.filters
    if (filters && filters.read && !filters.write) {
      _.warn(
        'It seems you are using a read-only filter with ' +
        'v-model. You might want to use a two-way filter ' +
        'to ensure correct behavior.'
      )
    }
    var el = this.el
    var tag = el.tagName
    var handler
    if (tag === 'INPUT') {
      handler = handlers[el.type] || handlers._default
    } else if (tag === 'SELECT') {
      handler = handlers.select
    } else if (tag === 'TEXTAREA') {
      handler = handlers._default
    } else {
      _.warn("v-model doesn't support element type: " + tag)
      return
    }
    handler.bind.call(this)
    this.update = handler.update
    this.unbind = handler.unbind
  }

}
},{"../../util":67,"./checkbox":31,"./default":32,"./radio":34,"./select":35}],34:[function(require,module,exports){
var _ = require('../../util')

module.exports = {

  bind: function () {
    var self = this
    var el = this.el
    this.listener = function () {
      self.set(el.value, true)
    }
    _.on(el, 'change', this.listener)
    if (el.checked) {
      this._initValue = el.value
    }
  },

  update: function (value) {
    /* jshint eqeqeq: false */
    this.el.checked = value == this.el.value
  },

  unbind: function () {
    _.off(this.el, 'change', this.listener)
  }

}
},{"../../util":67}],35:[function(require,module,exports){
var _ = require('../../util')
var Watcher = require('../../watcher')
var dirParser = require('../../parsers/directive')

module.exports = {

  bind: function () {
    var self = this
    var el = this.el
    // check options param
    var optionsParam = this._checkParam('options')
    if (optionsParam) {
      initOptions.call(this, optionsParam)
    }
    this.number = this._checkParam('number') != null
    this.multiple = el.hasAttribute('multiple')
    this.listener = function () {
      var value = self.multiple
        ? getMultiValue(el)
        : el.value
      value = self.number
        ? _.isArray(value)
          ? value.map(_.toNumber)
          : _.toNumber(value)
        : value
      self.set(value, true)
    }
    _.on(el, 'change', this.listener)
    checkInitialValue.call(this)
  },

  update: function (value) {
    /* jshint eqeqeq: false */
    var el = this.el
    el.selectedIndex = -1
    var multi = this.multiple && _.isArray(value)
    var options = el.options
    var i = options.length
    var option
    while (i--) {
      option = options[i]
      option.selected = multi
        ? indexOf(value, option.value) > -1
        : value == option.value
    }
  },

  unbind: function () {
    _.off(this.el, 'change', this.listener)
    if (this.optionWatcher) {
      this.optionWatcher.teardown()
    }
  }

}

/**
 * Initialize the option list from the param.
 *
 * @param {String} expression
 */

function initOptions (expression) {
  var self = this
  var descriptor = dirParser.parse(expression)[0]
  function optionUpdateWatcher (value) {
    if (_.isArray(value)) {
      self.el.innerHTML = ''
      buildOptions(self.el, value)
      if (self._watcher) {
        self.update(self._watcher.value)
      }
    } else {
      _.warn('Invalid options value for v-model: ' + value)
    }
  }
  this.optionWatcher = new Watcher(
    this.vm,
    descriptor.expression,
    optionUpdateWatcher,
    {
      deep: true,
      filters: _.resolveFilters(this.vm, descriptor.filters)
    }
  )
  // update with initial value
  optionUpdateWatcher(this.optionWatcher.value)
}

/**
 * Build up option elements. IE9 doesn't create options
 * when setting innerHTML on <select> elements, so we have
 * to use DOM API here.
 *
 * @param {Element} parent - a <select> or an <optgroup>
 * @param {Array} options
 */

function buildOptions (parent, options) {
  var op, el
  for (var i = 0, l = options.length; i < l; i++) {
    op = options[i]
    if (!op.options) {
      el = document.createElement('option')
      if (typeof op === 'string') {
        el.text = el.value = op
      } else {
        el.text = op.text
        el.value = op.value
      }
    } else {
      el = document.createElement('optgroup')
      el.label = op.label
      buildOptions(el, op.options)
    }
    parent.appendChild(el)
  }
}

/**
 * Check the initial value for selected options.
 */

function checkInitialValue () {
  var initValue
  var options = this.el.options
  for (var i = 0, l = options.length; i < l; i++) {
    if (options[i].hasAttribute('selected')) {
      if (this.multiple) {
        (initValue || (initValue = []))
          .push(options[i].value)
      } else {
        initValue = options[i].value
      }
    }
  }
  if (typeof initValue !== 'undefined') {
    this._initValue = this.number
      ? _.toNumber(initValue)
      : initValue
  }
}

/**
 * Helper to extract a value array for select[multiple]
 *
 * @param {SelectElement} el
 * @return {Array}
 */

function getMultiValue (el) {
  return Array.prototype.filter
    .call(el.options, filterSelected)
    .map(getOptionValue)
}

function filterSelected (op) {
  return op.selected
}

function getOptionValue (op) {
  return op.value || op.text
}

/**
 * Native Array.indexOf uses strict equal, but in this
 * case we need to match string/numbers with soft equal.
 *
 * @param {Array} arr
 * @param {*} val
 */

function indexOf (arr, val) {
  /* jshint eqeqeq: false */
  var i = arr.length
  while (i--) {
    if (arr[i] == val) return i
  }
  return -1
}
},{"../../parsers/directive":55,"../../util":67,"../../watcher":71}],36:[function(require,module,exports){
var _ = require('../util')

module.exports = {

  acceptStatement: true,
  priority: 700,

  bind: function () {
    // deal with iframes
    if (
      this.el.tagName === 'IFRAME' &&
      this.arg !== 'load'
    ) {
      var self = this
      this.iframeBind = function () {
        _.on(self.el.contentWindow, self.arg, self.handler)
      }
      _.on(this.el, 'load', this.iframeBind)
    }
  },

  update: function (handler) {
    if (typeof handler !== 'function') {
      _.warn(
        'Directive "v-on:' + this.expression + '" ' +
        'expects a function value.'
      )
      return
    }
    this.reset()
    var vm = this.vm
    this.handler = function (e) {
      e.targetVM = vm
      vm.$event = e
      var res = handler(e)
      vm.$event = null
      return res
    }
    if (this.iframeBind) {
      this.iframeBind()
    } else {
      _.on(this.el, this.arg, this.handler)
    }
  },

  reset: function () {
    var el = this.iframeBind
      ? this.el.contentWindow
      : this.el
    if (this.handler) {
      _.off(el, this.arg, this.handler)
    }
  },

  unbind: function () {
    this.reset()
    _.off(this.el, 'load', this.iframeBind)
  }
}
},{"../util":67}],37:[function(require,module,exports){
var _ = require('../util')
var templateParser = require('../parsers/template')
var vIf = require('./if')

module.exports = {

  isLiteral: true,

  // same logic reuse from v-if
  compile: vIf.compile,
  teardown: vIf.teardown,
  getContainedComponents: vIf.getContainedComponents,
  unbind: vIf.unbind,

  bind: function () {
    var el = this.el
    this.start = document.createComment('v-partial-start')
    this.end = document.createComment('v-partial-end')
    if (el.nodeType !== 8) {
      el.innerHTML = ''
    }
    if (el.tagName === 'TEMPLATE' || el.nodeType === 8) {
      _.replace(el, this.end)
    } else {
      el.appendChild(this.end)
    }
    _.before(this.start, this.end)
    if (!this._isDynamicLiteral) {
      this.insert(this.expression)
    }
  },

  update: function (id) {
    this.teardown()
    this.insert(id)
  },

  insert: function (id) {
    var partial = this.vm.$options.partials[id]
    _.assertAsset(partial, 'partial', id)
    if (partial) {
      var filters = this.filters && this.filters.read
      if (filters) {
        partial = _.applyFilters(partial, filters, this.vm)
      }
      this.compile(templateParser.parse(partial, true))
    }
  }

}
},{"../parsers/template":58,"../util":67,"./if":29}],38:[function(require,module,exports){
var _ = require('../util')

module.exports = {

  isLiteral: true,

  bind: function () {
    var vm = this.el.__vue__
    if (!vm) {
      _.warn(
        'v-ref should only be used on a component root element.'
      )
      return
    }
    // If we get here, it means this is a `v-ref` on a
    // child, because parent scope `v-ref` is stripped in
    // `v-component` already. So we just record our own ref
    // here - it will overwrite parent ref in `v-component`,
    // if any.
    vm._refID = this.expression
  }
  
}
},{"../util":67}],39:[function(require,module,exports){
var _ = require('../util')
var isObject = _.isObject
var isPlainObject = _.isPlainObject
var textParser = require('../parsers/text')
var expParser = require('../parsers/expression')
var templateParser = require('../parsers/template')
var compile = require('../compiler/compile')
var transclude = require('../compiler/transclude')
var mergeOptions = require('../util/merge-option')
var uid = 0

module.exports = {

  /**
   * Setup.
   */

  bind: function () {
    // uid as a cache identifier
    this.id = '__v_repeat_' + (++uid)
    // we need to insert the objToArray converter
    // as the first read filter, because it has to be invoked
    // before any user filters. (can't do it in `update`)
    if (!this.filters) {
      this.filters = {}
    }
    // add the object -> array convert filter
    var objectConverter = _.bind(objToArray, this)
    if (!this.filters.read) {
      this.filters.read = [objectConverter]
    } else {
      this.filters.read.unshift(objectConverter)
    }
    // setup ref node
    this.ref = document.createComment('v-repeat')
    _.replace(this.el, this.ref)
    // check if this is a block repeat
    this.template = this.el.tagName === 'TEMPLATE'
      ? templateParser.parse(this.el, true)
      : this.el
    // check other directives that need to be handled
    // at v-repeat level
    this.checkIf()
    this.checkRef()
    this.checkComponent()
    // check for trackby param
    this.idKey =
      this._checkParam('track-by') ||
      this._checkParam('trackby') // 0.11.0 compat
    this.cache = Object.create(null)
  },

  /**
   * Warn against v-if usage.
   */

  checkIf: function () {
    if (_.attr(this.el, 'if') !== null) {
      _.warn(
        'Don\'t use v-if with v-repeat. ' +
        'Use v-show or the "filterBy" filter instead.'
      )
    }
  },

  /**
   * Check if v-ref/ v-el is also present.
   */

  checkRef: function () {
    var refID = _.attr(this.el, 'ref')
    this.refID = refID
      ? this.vm.$interpolate(refID)
      : null
    var elId = _.attr(this.el, 'el')
    this.elId = elId
      ? this.vm.$interpolate(elId)
      : null
  },

  /**
   * Check the component constructor to use for repeated
   * instances. If static we resolve it now, otherwise it
   * needs to be resolved at build time with actual data.
   */

  checkComponent: function () {
    var id = _.attr(this.el, 'component')
    var options = this.vm.$options
    if (!id) {
      // default constructor
      this.Ctor = _.Vue
      // inline repeats should inherit
      this.inherit = true
      // important: transclude with no options, just
      // to ensure block start and block end
      this.template = transclude(this.template)
      this._linkFn = compile(this.template, options)
    } else {
      this.asComponent = true
      // check inline-template
      if (this._checkParam('inline-template') !== null) {
        // extract inline template as a DocumentFragment
        this.inlineTempalte = _.extractContent(this.el, true)
      }
      var tokens = textParser.parse(id)
      if (!tokens) { // static component
        var Ctor = this.Ctor = options.components[id]
        _.assertAsset(Ctor, 'component', id)
        var merged = mergeOptions(Ctor.options, {}, {
          $parent: this.vm
        })
        merged.template = this.inlineTempalte || merged.template
        merged._asComponent = true
        merged._parent = this.vm
        this.template = transclude(this.template, merged)
        // Important: mark the template as a root node so that
        // custom element components don't get compiled twice.
        // fixes #822
        this.template.__vue__ = true
        this._linkFn = compile(this.template, merged)
      } else {
        // to be resolved later
        var ctorExp = textParser.tokensToExp(tokens)
        this.ctorGetter = expParser.parse(ctorExp).get
      }
    }
  },

  /**
   * Update.
   * This is called whenever the Array mutates.
   *
   * @param {Array|Number|String} data
   */

  update: function (data) {
    data = data || []
    var type = typeof data
    if (type === 'number') {
      data = range(data)
    } else if (type === 'string') {
      data = _.toArray(data)
    }
    this.vms = this.diff(data, this.vms)
    // update v-ref
    if (this.refID) {
      this.vm.$[this.refID] = this.vms
    }
    if (this.elId) {
      this.vm.$$[this.elId] = this.vms.map(function (vm) {
        return vm.$el
      })
    }
  },

  /**
   * Diff, based on new data and old data, determine the
   * minimum amount of DOM manipulations needed to make the
   * DOM reflect the new data Array.
   *
   * The algorithm diffs the new data Array by storing a
   * hidden reference to an owner vm instance on previously
   * seen data. This allows us to achieve O(n) which is
   * better than a levenshtein distance based algorithm,
   * which is O(m * n).
   *
   * @param {Array} data
   * @param {Array} oldVms
   * @return {Array}
   */

  diff: function (data, oldVms) {
    var idKey = this.idKey
    var converted = this.converted
    var ref = this.ref
    var alias = this.arg
    var init = !oldVms
    var vms = new Array(data.length)
    var obj, raw, vm, i, l
    // First pass, go through the new Array and fill up
    // the new vms array. If a piece of data has a cached
    // instance for it, we reuse it. Otherwise build a new
    // instance.
    for (i = 0, l = data.length; i < l; i++) {
      obj = data[i]
      raw = converted ? obj.$value : obj
      vm = !init && this.getVm(raw)
      if (vm) { // reusable instance
        vm._reused = true
        vm.$index = i // update $index
        if (converted) {
          vm.$key = obj.$key // update $key
        }
        if (idKey) { // swap track by id data
          if (alias) {
            vm[alias] = raw
          } else {
            vm._setData(raw)
          }
        }
      } else { // new instance
        vm = this.build(obj, i, true)
        vm._new = true
        vm._reused = false
      }
      vms[i] = vm
      // insert if this is first run
      if (init) {
        vm.$before(ref)
      }
    }
    // if this is the first run, we're done.
    if (init) {
      return vms
    }
    // Second pass, go through the old vm instances and
    // destroy those who are not reused (and remove them
    // from cache)
    for (i = 0, l = oldVms.length; i < l; i++) {
      vm = oldVms[i]
      if (!vm._reused) {
        this.uncacheVm(vm)
        vm.$destroy(true)
      }
    }
    // final pass, move/insert new instances into the
    // right place. We're going in reverse here because
    // insertBefore relies on the next sibling to be
    // resolved.
    var targetNext, currentNext
    i = vms.length
    while (i--) {
      vm = vms[i]
      // this is the vm that we should be in front of
      targetNext = vms[i + 1]
      if (!targetNext) {
        // This is the last item. If it's reused then
        // everything else will eventually be in the right
        // place, so no need to touch it. Otherwise, insert
        // it.
        if (!vm._reused) {
          vm.$before(ref)
        }
      } else {
        var nextEl = targetNext.$el
        if (vm._reused) {
          // this is the vm we are actually in front of
          currentNext = findNextVm(vm, ref)
          // we only need to move if we are not in the right
          // place already.
          if (currentNext !== targetNext) {
            vm.$before(nextEl, null, false)
          }
        } else {
          // new instance, insert to existing next
          vm.$before(nextEl)
        }
      }
      vm._new = false
      vm._reused = false
    }
    return vms
  },

  /**
   * Build a new instance and cache it.
   *
   * @param {Object} data
   * @param {Number} index
   * @param {Boolean} needCache
   */

  build: function (data, index, needCache) {
    var meta = { $index: index }
    if (this.converted) {
      meta.$key = data.$key
    }
    var raw = this.converted ? data.$value : data
    var alias = this.arg
    if (alias) {
      data = {}
      data[alias] = raw
    } else if (!isPlainObject(raw)) {
      // non-object values
      data = {}
      meta.$value = raw
    } else {
      // default
      data = raw
    }
    // resolve constructor
    var Ctor = this.Ctor || this.resolveCtor(data, meta)
    var vm = this.vm.$addChild({
      el: templateParser.clone(this.template),
      _asComponent: this.asComponent,
      _host: this._host,
      _linkFn: this._linkFn,
      _meta: meta,
      data: data,
      inherit: this.inherit,
      template: this.inlineTempalte
    }, Ctor)
    // flag this instance as a repeat instance
    // so that we can skip it in vm._digest
    vm._repeat = true
    // cache instance
    if (needCache) {
      this.cacheVm(raw, vm)
    }
    // sync back changes for $value, particularly for
    // two-way bindings of primitive values
    var self = this
    vm.$watch('$value', function (val) {
      if (self.converted) {
        self.rawValue[vm.$key] = val
      } else {
        self.rawValue.$set(vm.$index, val)
      }
    })
    return vm
  },

  /**
   * Resolve a contructor to use for an instance.
   * The tricky part here is that there could be dynamic
   * components depending on instance data.
   *
   * @param {Object} data
   * @param {Object} meta
   * @return {Function}
   */

  resolveCtor: function (data, meta) {
    // create a temporary context object and copy data
    // and meta properties onto it.
    // use _.define to avoid accidentally overwriting scope
    // properties.
    var context = Object.create(this.vm)
    var key
    for (key in data) {
      _.define(context, key, data[key])
    }
    for (key in meta) {
      _.define(context, key, meta[key])
    }
    var id = this.ctorGetter.call(context, context)
    var Ctor = this.vm.$options.components[id]
    _.assertAsset(Ctor, 'component', id)
    return Ctor
  },

  /**
   * Unbind, teardown everything
   */

  unbind: function () {
    if (this.refID) {
      this.vm.$[this.refID] = null
    }
    if (this.vms) {
      var i = this.vms.length
      var vm
      while (i--) {
        vm = this.vms[i]
        this.uncacheVm(vm)
        vm.$destroy()
      }
    }
  },

  /**
   * Cache a vm instance based on its data.
   *
   * If the data is an object, we save the vm's reference on
   * the data object as a hidden property. Otherwise we
   * cache them in an object and for each primitive value
   * there is an array in case there are duplicates.
   *
   * @param {Object} data
   * @param {Vue} vm
   */

  cacheVm: function (data, vm) {
    var idKey = this.idKey
    var cache = this.cache
    var id
    if (idKey) {
      id = data[idKey]
      if (!cache[id]) {
        cache[id] = vm
      } else {
        _.warn('Duplicate track-by key in v-repeat: ' + id)
      }
    } else if (isObject(data)) {
      id = this.id
      if (data.hasOwnProperty(id)) {
        if (data[id] === null) {
          data[id] = vm
        } else {
          _.warn(
            'Duplicate objects are not supported in v-repeat ' +
            'when using components or transitions.'
          )
        }
      } else {
        _.define(data, this.id, vm)
      }
    } else {
      if (!cache[data]) {
        cache[data] = [vm]
      } else {
        cache[data].push(vm)
      }
    }
    vm._raw = data
  },

  /**
   * Try to get a cached instance from a piece of data.
   *
   * @param {Object} data
   * @return {Vue|undefined}
   */

  getVm: function (data) {
    if (this.idKey) {
      return this.cache[data[this.idKey]]
    } else if (isObject(data)) {
      return data[this.id]
    } else {
      var cached = this.cache[data]
      if (cached) {
        var i = 0
        var vm = cached[i]
        // since duplicated vm instances might be a reused
        // one OR a newly created one, we need to return the
        // first instance that is neither of these.
        while (vm && (vm._reused || vm._new)) {
          vm = cached[++i]
        }
        return vm
      }
    }
  },

  /**
   * Delete a cached vm instance.
   *
   * @param {Vue} vm
   */

  uncacheVm: function (vm) {
    var data = vm._raw
    if (this.idKey) {
      this.cache[data[this.idKey]] = null
    } else if (isObject(data)) {
      data[this.id] = null
      vm._raw = null
    } else {
      this.cache[data].pop()
    }
  }

}

/**
 * Helper to find the next element that is an instance
 * root node. This is necessary because a destroyed vm's
 * element could still be lingering in the DOM before its
 * leaving transition finishes, but its __vue__ reference
 * should have been removed so we can skip them.
 *
 * @param {Vue} vm
 * @param {CommentNode} ref
 * @return {Vue}
 */

function findNextVm (vm, ref) {
  var el = (vm._blockEnd || vm.$el).nextSibling
  while (!el.__vue__ && el !== ref) {
    el = el.nextSibling
  }
  return el.__vue__
}

/**
 * Attempt to convert non-Array objects to array.
 * This is the default filter installed to every v-repeat
 * directive.
 *
 * It will be called with **the directive** as `this`
 * context so that we can mark the repeat array as converted
 * from an object.
 *
 * @param {*} obj
 * @return {Array}
 * @private
 */

function objToArray (obj) {
  // regardless of type, store the un-filtered raw value.
  this.rawValue = obj
  if (!isPlainObject(obj)) {
    return obj
  }
  var keys = Object.keys(obj)
  var i = keys.length
  var res = new Array(i)
  var key
  while (i--) {
    key = keys[i]
    res[i] = {
      $key: key,
      $value: obj[key]
    }
  }
  // `this` points to the repeat directive instance
  this.converted = true
  return res
}

/**
 * Create a range array from given number.
 *
 * @param {Number} n
 * @return {Array}
 */

function range (n) {
  var i = -1
  var ret = new Array(n)
  while (++i < n) {
    ret[i] = i
  }
  return ret
}
},{"../compiler/compile":18,"../compiler/transclude":19,"../parsers/expression":56,"../parsers/template":58,"../parsers/text":59,"../util":67,"../util/merge-option":69}],40:[function(require,module,exports){
var transition = require('../transition')

module.exports = function (value) {
  var el = this.el
  transition.apply(el, value ? 1 : -1, function () {
    el.style.display = value ? '' : 'none'
  }, this.vm)
}
},{"../transition":61}],41:[function(require,module,exports){
var _ = require('../util')
var prefixes = ['-webkit-', '-moz-', '-ms-']
var camelPrefixes = ['Webkit', 'Moz', 'ms']
var importantRE = /!important;?$/
var camelRE = /([a-z])([A-Z])/g
var testEl = null
var propCache = {}

module.exports = {

  deep: true,

  update: function (value) {
    if (this.arg) {
      this.setProp(this.arg, value)
    } else {
      if (typeof value === 'object') {
        // cache object styles so that only changed props
        // are actually updated.
        if (!this.cache) this.cache = {}
        for (var prop in value) {
          this.setProp(prop, value[prop])
          /* jshint eqeqeq: false */
          if (value[prop] != this.cache[prop]) {
            this.cache[prop] = value[prop]
            this.setProp(prop, value[prop])
          }
        }
      } else {
        this.el.style.cssText = value
      }
    }
  },

  setProp: function (prop, value) {
    prop = normalize(prop)
    if (!prop) return // unsupported prop
    // cast possible numbers/booleans into strings
    if (value != null) value += ''
    if (value) {
      var isImportant = importantRE.test(value)
        ? 'important'
        : ''
      if (isImportant) {
        value = value.replace(importantRE, '').trim()
      }
      this.el.style.setProperty(prop, value, isImportant)
    } else {
      this.el.style.removeProperty(prop)
    }
  }

}

/**
 * Normalize a CSS property name.
 * - cache result
 * - auto prefix
 * - camelCase -> dash-case
 *
 * @param {String} prop
 * @return {String}
 */

function normalize (prop) {
  if (propCache[prop]) {
    return propCache[prop]
  }
  var res = prefix(prop)
  propCache[prop] = propCache[res] = res
  return res
}

/**
 * Auto detect the appropriate prefix for a CSS property.
 * https://gist.github.com/paulirish/523692
 *
 * @param {String} prop
 * @return {String}
 */

function prefix (prop) {
  prop = prop.replace(camelRE, '$1-$2').toLowerCase()
  var camel = _.camelize(prop)
  var upper = camel.charAt(0).toUpperCase() + camel.slice(1)
  if (!testEl) {
    testEl = document.createElement('div')
  }
  if (camel in testEl.style) {
    return prop
  }
  var i = prefixes.length
  var prefixed
  while (i--) {
    prefixed = camelPrefixes[i] + upper
    if (prefixed in testEl.style) {
      return prefixes[i] + prop
    }
  }
}
},{"../util":67}],42:[function(require,module,exports){
var _ = require('../util')

module.exports = {

  bind: function () {
    this.attr = this.el.nodeType === 3
      ? 'nodeValue'
      : 'textContent'
  },

  update: function (value) {
    this.el[this.attr] = _.toString(value)
  }
  
}
},{"../util":67}],43:[function(require,module,exports){
module.exports = {

  priority: 1000,
  isLiteral: true,

  bind: function () {
    if (!this._isDynamicLiteral) {
      this.update(this.expression)
    }
  },

  update: function (id) {
    var vm = this.el.__vue__ || this.vm
    this.el.__v_trans = {
      id: id,
      // resolve the custom transition functions now
      // so the transition module knows this is a
      // javascript transition without having to check
      // computed CSS.
      fns: vm.$options.transitions[id]
    }
  }

}
},{}],44:[function(require,module,exports){
var _ = require('../util')
var Watcher = require('../watcher')
var expParser = require('../parsers/expression')
var literalRE = /^(true|false|\s?('[^']*'|"[^"]")\s?)$/

module.exports = {

  priority: 900,

  bind: function () {

    var child = this.vm
    var parent = child.$parent
    var childKey = this.arg || '$data'
    var parentKey = this.expression

    if (this.el && this.el !== child.$el) {
      _.warn(
        'v-with can only be used on instance root elements.'
      )
    } else if (!parent) {
      _.warn(
        'v-with must be used on an instance with a parent.'
      )
    } else if (literalRE.test(parentKey)) {
      // no need to setup watchers for literal bindings
      if (!this.arg) {
        _.warn(
          'v-with cannot bind literal value as $data: ' +
          parentKey
        )
      } else {
        var value = expParser.parse(parentKey).get()
        child.$set(childKey, value)
      }
    } else {

      // simple lock to avoid circular updates.
      // without this it would stabilize too, but this makes
      // sure it doesn't cause other watchers to re-evaluate.
      var locked = false
      var lock = function () {
        locked = true
        _.nextTick(unlock)
      }
      var unlock = function () {
        locked = false
      }

      this.parentWatcher = new Watcher(
        parent,
        parentKey,
        function (val) {
          if (!locked) {
            lock()
            child.$set(childKey, val)
          }
        }
      )
      
      // set the child initial value first, before setting
      // up the child watcher to avoid triggering it
      // immediately.
      child.$set(childKey, this.parentWatcher.value)

      this.childWatcher = new Watcher(
        child,
        childKey,
        function (val) {
          if (!locked) {
            lock()
            parent.$set(parentKey, val)
          }
        }
      )
    }
  },

  unbind: function () {
    if (this.parentWatcher) {
      this.parentWatcher.teardown()
      this.childWatcher.teardown()
    }
  }

}
},{"../parsers/expression":56,"../util":67,"../watcher":71}],45:[function(require,module,exports){
var _ = require('../util')
var Path = require('../parsers/path')

/**
 * Filter filter for v-repeat
 *
 * @param {String} searchKey
 * @param {String} [delimiter]
 * @param {String} dataKey
 */

exports.filterBy = function (arr, searchKey, delimiter, dataKey) {
  // allow optional `in` delimiter
  // because why not
  if (delimiter && delimiter !== 'in') {
    dataKey = delimiter
  }
  // get the search string
  var search =
    _.stripQuotes(searchKey) ||
    this.$get(searchKey)
  if (!search) {
    return arr
  }
  search = ('' + search).toLowerCase()
  // get the optional dataKey
  dataKey =
    dataKey &&
    (_.stripQuotes(dataKey) || this.$get(dataKey))
  return arr.filter(function (item) {
    return dataKey
      ? contains(Path.get(item, dataKey), search)
      : contains(item, search)
  })
}

/**
 * Filter filter for v-repeat
 *
 * @param {String} sortKey
 * @param {String} reverseKey
 */

exports.orderBy = function (arr, sortKey, reverseKey) {
  var key =
    _.stripQuotes(sortKey) ||
    this.$get(sortKey)
  if (!key) {
    return arr
  }
  var order = 1
  if (reverseKey) {
    if (reverseKey === '-1') {
      order = -1
    } else if (reverseKey.charCodeAt(0) === 0x21) { // !
      reverseKey = reverseKey.slice(1)
      order = this.$get(reverseKey) ? 1 : -1
    } else {
      order = this.$get(reverseKey) ? -1 : 1
    }
  }
  // sort on a copy to avoid mutating original array
  return arr.slice().sort(function (a, b) {
    a = _.isObject(a) ? Path.get(a, key) : a
    b = _.isObject(b) ? Path.get(b, key) : b
    return a === b ? 0 : a > b ? order : -order
  })
}

/**
 * String contain helper
 *
 * @param {*} val
 * @param {String} search
 */

function contains (val, search) {
  if (_.isObject(val)) {
    for (var key in val) {
      if (contains(val[key], search)) {
        return true
      }
    }
  } else if (val != null) {
    return val.toString().toLowerCase().indexOf(search) > -1
  }
}
},{"../parsers/path":57,"../util":67}],46:[function(require,module,exports){
var _ = require('../util')

/**
 * Stringify value.
 *
 * @param {Number} indent
 */

exports.json = {
  read: function (value, indent) {
    return typeof value === 'string'
      ? value
      : JSON.stringify(value, null, Number(indent) || 2)
  },
  write: function (value) {
    try {
      return JSON.parse(value)
    } catch (e) {
      return value
    }
  }
}

/**
 * 'abc' => 'Abc'
 */

exports.capitalize = function (value) {
  if (!value && value !== 0) return ''
  value = value.toString()
  return value.charAt(0).toUpperCase() + value.slice(1)
}

/**
 * 'abc' => 'ABC'
 */

exports.uppercase = function (value) {
  return (value || value === 0)
    ? value.toString().toUpperCase()
    : ''
}

/**
 * 'AbC' => 'abc'
 */

exports.lowercase = function (value) {
  return (value || value === 0)
    ? value.toString().toLowerCase()
    : ''
}

/**
 * 12345 => $12,345.00
 *
 * @param {String} sign
 */

var digitsRE = /(\d{3})(?=\d)/g

exports.currency = function (value, sign) {
  value = parseFloat(value)
  if (!isFinite(value) || (!value && value !== 0)) return ''
  sign = sign || '$'
  var s = Math.floor(Math.abs(value)).toString(),
    i = s.length % 3,
    h = i > 0
      ? (s.slice(0, i) + (s.length > 3 ? ',' : ''))
      : '',
    v = Math.abs(parseInt((value * 100) % 100, 10)),
    f = '.' + (v < 10 ? ('0' + v) : v)
  return (value < 0 ? '-' : '') +
    sign + h + s.slice(i).replace(digitsRE, '$1,') + f
}

/**
 * 'item' => 'items'
 *
 * @params
 *  an array of strings corresponding to
 *  the single, double, triple ... forms of the word to
 *  be pluralized. When the number to be pluralized
 *  exceeds the length of the args, it will use the last
 *  entry in the array.
 *
 *  e.g. ['single', 'double', 'triple', 'multiple']
 */

exports.pluralize = function (value) {
  var args = _.toArray(arguments, 1)
  return args.length > 1
    ? (args[value % 10 - 1] || args[args.length - 1])
    : (args[0] + (value === 1 ? '' : 's'))
}

/**
 * A special filter that takes a handler function,
 * wraps it so it only gets triggered on specific
 * keypresses. v-on only.
 *
 * @param {String} key
 */

var keyCodes = {
  enter    : 13,
  tab      : 9,
  'delete' : 46,
  up       : 38,
  left     : 37,
  right    : 39,
  down     : 40,
  esc      : 27
}

exports.key = function (handler, key) {
  if (!handler) return
  var code = keyCodes[key]
  if (!code) {
    code = parseInt(key, 10)
  }
  return function (e) {
    if (e.keyCode === code) {
      return handler.call(this, e)
    }
  }
}

// expose keycode hash
exports.key.keyCodes = keyCodes

/**
 * Install special array filters
 */

_.extend(exports, require('./array-filters'))

},{"../util":67,"./array-filters":45}],47:[function(require,module,exports){
var _ = require('../util')
var Directive = require('../directive')
var compile = require('../compiler/compile')
var transclude = require('../compiler/transclude')

/**
 * Transclude, compile and link element.
 *
 * If a pre-compiled linker is available, that means the
 * passed in element will be pre-transcluded and compiled
 * as well - all we need to do is to call the linker.
 *
 * Otherwise we need to call transclude/compile/link here.
 *
 * @param {Element} el
 * @return {Element}
 */

exports._compile = function (el) {
  var options = this.$options
  if (options._linkFn) {
    // pre-transcluded with linker, just use it
    this._initElement(el)
    options._linkFn(this, el)
  } else {
    // transclude and init element
    // transclude can potentially replace original
    // so we need to keep reference
    var original = el
    el = transclude(el, options)
    this._initElement(el)
    // compile and link the rest
    compile(el, options)(this, el)
    // finally replace original
    if (options.replace) {
      _.replace(original, el)
    }
  }
  return el
}

/**
 * Initialize instance element. Called in the public
 * $mount() method.
 *
 * @param {Element} el
 */

exports._initElement = function (el) {
  if (el instanceof DocumentFragment) {
    this._isBlock = true
    this.$el = this._blockStart = el.firstChild
    this._blockEnd = el.lastChild
    this._blockFragment = el
  } else {
    this.$el = el
  }
  this.$el.__vue__ = this
  this._callHook('beforeCompile')
}

/**
 * Create and bind a directive to an element.
 *
 * @param {String} name - directive name
 * @param {Node} node   - target node
 * @param {Object} desc - parsed directive descriptor
 * @param {Object} def  - directive definition object
 * @param {Vue|undefined} host - transclusion host component
 */

exports._bindDir = function (name, node, desc, def, host) {
  this._directives.push(
    new Directive(name, node, this, desc, def, host)
  )
}

/**
 * Teardown an instance, unobserves the data, unbind all the
 * directives, turn off all the event listeners, etc.
 *
 * @param {Boolean} remove - whether to remove the DOM node.
 * @param {Boolean} deferCleanup - if true, defer cleanup to
 *                                 be called later
 */

exports._destroy = function (remove, deferCleanup) {
  if (this._isBeingDestroyed) {
    return
  }
  this._callHook('beforeDestroy')
  this._isBeingDestroyed = true
  var i
  // remove self from parent. only necessary
  // if parent is not being destroyed as well.
  var parent = this.$parent
  if (parent && !parent._isBeingDestroyed) {
    i = parent._children.indexOf(this)
    parent._children.splice(i, 1)
  }
  // same for transclusion host.
  var host = this._host
  if (host && !host._isBeingDestroyed) {
    i = host._transCpnts.indexOf(this)
    host._transCpnts.splice(i, 1)
  }
  // destroy all children.
  i = this._children.length
  while (i--) {
    this._children[i].$destroy()
  }
  // teardown all directives. this also tearsdown all
  // directive-owned watchers. intentionally check for
  // directives array length on every loop since directives
  // that manages partial compilation can splice ones out
  for (i = 0; i < this._directives.length; i++) {
    this._directives[i]._teardown()
  }
  // teardown all user watchers.
  var watcher
  for (i in this._userWatchers) {
    watcher = this._userWatchers[i]
    if (watcher) {
      watcher.teardown()
    }
  }
  // remove reference to self on $el
  if (this.$el) {
    this.$el.__vue__ = null
  }
  // remove DOM element
  var self = this
  if (remove && this.$el) {
    this.$remove(function () {
      self._cleanup()
    })
  } else if (!deferCleanup) {
    this._cleanup()
  }
}

/**
 * Clean up to ensure garbage collection.
 * This is called after the leave transition if there
 * is any.
 */

exports._cleanup = function () {
  // remove reference from data ob
  this._data.__ob__.removeVm(this)
  this._data =
  this._watchers =
  this._userWatchers =
  this._watcherList =
  this.$el =
  this.$parent =
  this.$root =
  this._children =
  this._transCpnts =
  this._directives = null
  // call the last hook...
  this._isDestroyed = true
  this._callHook('destroyed')
  // turn off all instance listeners.
  this.$off()
}
},{"../compiler/compile":18,"../compiler/transclude":19,"../directive":21,"../util":67}],48:[function(require,module,exports){
var _ = require('../util')
var inDoc = _.inDoc

/**
 * Setup the instance's option events & watchers.
 * If the value is a string, we pull it from the
 * instance's methods by name.
 */

exports._initEvents = function () {
  var options = this.$options
  registerCallbacks(this, '$on', options.events)
  registerCallbacks(this, '$watch', options.watch)
}

/**
 * Register callbacks for option events and watchers.
 *
 * @param {Vue} vm
 * @param {String} action
 * @param {Object} hash
 */

function registerCallbacks (vm, action, hash) {
  if (!hash) return
  var handlers, key, i, j
  for (key in hash) {
    handlers = hash[key]
    if (_.isArray(handlers)) {
      for (i = 0, j = handlers.length; i < j; i++) {
        register(vm, action, key, handlers[i])
      }
    } else {
      register(vm, action, key, handlers)
    }
  }
}

/**
 * Helper to register an event/watch callback.
 *
 * @param {Vue} vm
 * @param {String} action
 * @param {String} key
 * @param {*} handler
 */

function register (vm, action, key, handler) {
  var type = typeof handler
  if (type === 'function') {
    vm[action](key, handler)
  } else if (type === 'string') {
    var methods = vm.$options.methods
    var method = methods && methods[handler]
    if (method) {
      vm[action](key, method)
    } else {
      _.warn(
        'Unknown method: "' + handler + '" when ' +
        'registering callback for ' + action +
        ': "' + key + '".'
      )
    }
  }
}

/**
 * Setup recursive attached/detached calls
 */

exports._initDOMHooks = function () {
  this.$on('hook:attached', onAttached)
  this.$on('hook:detached', onDetached)
}

/**
 * Callback to recursively call attached hook on children
 */

function onAttached () {
  this._isAttached = true
  this._children.forEach(callAttach)
  if (this._transCpnts.length) {
    this._transCpnts.forEach(callAttach)
  }
}

/**
 * Iterator to call attached hook
 * 
 * @param {Vue} child
 */

function callAttach (child) {
  if (!child._isAttached && inDoc(child.$el)) {
    child._callHook('attached')
  }
}

/**
 * Callback to recursively call detached hook on children
 */

function onDetached () {
  this._isAttached = false
  this._children.forEach(callDetach)
  if (this._transCpnts.length) {
    this._transCpnts.forEach(callDetach)
  }
}

/**
 * Iterator to call detached hook
 * 
 * @param {Vue} child
 */

function callDetach (child) {
  if (child._isAttached && !inDoc(child.$el)) {
    child._callHook('detached')
  }
}

/**
 * Trigger all handlers for a hook
 *
 * @param {String} hook
 */

exports._callHook = function (hook) {
  var handlers = this.$options[hook]
  if (handlers) {
    for (var i = 0, j = handlers.length; i < j; i++) {
      handlers[i].call(this)
    }
  }
  this.$emit('hook:' + hook)
}
},{"../util":67}],49:[function(require,module,exports){
var mergeOptions = require('../util/merge-option')

/**
 * The main init sequence. This is called for every
 * instance, including ones that are created from extended
 * constructors.
 *
 * @param {Object} options - this options object should be
 *                           the result of merging class
 *                           options and the options passed
 *                           in to the constructor.
 */

exports._init = function (options) {

  options = options || {}

  this.$el           = null
  this.$parent       = options._parent
  this.$root         = options._root || this
  this.$             = {} // child vm references
  this.$$            = {} // element references
  this._watcherList  = [] // all watchers as an array
  this._watchers     = {} // internal watchers as a hash
  this._userWatchers = {} // user watchers as a hash
  this._directives   = [] // all directives

  // a flag to avoid this being observed
  this._isVue = true

  // events bookkeeping
  this._events         = {}    // registered callbacks
  this._eventsCount    = {}    // for $broadcast optimization
  this._eventCancelled = false // for event cancellation

  // block instance properties
  this._isBlock     = false
  this._blockStart  =          // @type {CommentNode}
  this._blockEnd    = null     // @type {CommentNode}

  // lifecycle state
  this._isCompiled  =
  this._isDestroyed =
  this._isReady     =
  this._isAttached  =
  this._isBeingDestroyed = false

  // children
  this._children = []
  this._childCtors = {}

  // transclusion unlink functions
  this._containerUnlinkFn =
  this._contentUnlinkFn = null

  // transcluded components that belong to the parent.
  // need to keep track of them so that we can call
  // attached/detached hooks on them.
  this._transCpnts = []
  this._host = options._host

  // push self into parent / transclusion host
  if (this.$parent) {
    this.$parent._children.push(this)
  }
  if (this._host) {
    this._host._transCpnts.push(this)
  }

  // props used in v-repeat diffing
  this._new = true
  this._reused = false

  // merge options.
  options = this.$options = mergeOptions(
    this.constructor.options,
    options,
    this
  )

  // set data after merge.
  this._data = options.data || {}

  // initialize data observation and scope inheritance.
  this._initScope()

  // setup event system and option events.
  this._initEvents()

  // call created hook
  this._callHook('created')

  // if `el` option is passed, start compilation.
  if (options.el) {
    this.$mount(options.el)
  }
}
},{"../util/merge-option":69}],50:[function(require,module,exports){
var _ = require('../util')
var Observer = require('../observer')
var Dep = require('../observer/dep')

/**
 * Setup the scope of an instance, which contains:
 * - observed data
 * - computed properties
 * - user methods
 * - meta properties
 */

exports._initScope = function () {
  this._initData()
  this._initComputed()
  this._initMethods()
  this._initMeta()
}

/**
 * Initialize the data. 
 */

exports._initData = function () {
  // proxy data on instance
  var data = this._data
  var keys = Object.keys(data)
  var i = keys.length
  var key
  while (i--) {
    key = keys[i]
    if (!_.isReserved(key)) {
      this._proxy(key)
    }
  }
  // observe data
  Observer.create(data).addVm(this)
}

/**
 * Swap the isntance's $data. Called in $data's setter.
 *
 * @param {Object} newData
 */

exports._setData = function (newData) {
  newData = newData || {}
  var oldData = this._data
  this._data = newData
  var keys, key, i
  // unproxy keys not present in new data
  keys = Object.keys(oldData)
  i = keys.length
  while (i--) {
    key = keys[i]
    if (!_.isReserved(key) && !(key in newData)) {
      this._unproxy(key)
    }
  }
  // proxy keys not already proxied,
  // and trigger change for changed values
  keys = Object.keys(newData)
  i = keys.length
  while (i--) {
    key = keys[i]
    if (!this.hasOwnProperty(key) && !_.isReserved(key)) {
      // new property
      this._proxy(key)
    }
  }
  oldData.__ob__.removeVm(this)
  Observer.create(newData).addVm(this)
  this._digest()
}

/**
 * Proxy a property, so that
 * vm.prop === vm._data.prop
 *
 * @param {String} key
 */

exports._proxy = function (key) {
  // need to store ref to self here
  // because these getter/setters might
  // be called by child instances!
  var self = this
  Object.defineProperty(self, key, {
    configurable: true,
    enumerable: true,
    get: function proxyGetter () {
      return self._data[key]
    },
    set: function proxySetter (val) {
      self._data[key] = val
    }
  })
}

/**
 * Unproxy a property.
 *
 * @param {String} key
 */

exports._unproxy = function (key) {
  delete this[key]
}

/**
 * Force update on every watcher in scope.
 */

exports._digest = function () {
  var i = this._watcherList.length
  while (i--) {
    this._watcherList[i].update()
  }
  var children = this._children
  i = children.length
  while (i--) {
    var child = children[i]
    if (child.$options.inherit) {
      child._digest()
    }
  }
}

/**
 * Setup computed properties. They are essentially
 * special getter/setters
 */

function noop () {}
exports._initComputed = function () {
  var computed = this.$options.computed
  if (computed) {
    for (var key in computed) {
      var userDef = computed[key]
      var def = {
        enumerable: true,
        configurable: true
      }
      if (typeof userDef === 'function') {
        def.get = _.bind(userDef, this)
        def.set = noop
      } else {
        def.get = userDef.get
          ? _.bind(userDef.get, this)
          : noop
        def.set = userDef.set
          ? _.bind(userDef.set, this)
          : noop
      }
      Object.defineProperty(this, key, def)
    }
  }
}

/**
 * Setup instance methods. Methods must be bound to the
 * instance since they might be called by children
 * inheriting them.
 */

exports._initMethods = function () {
  var methods = this.$options.methods
  if (methods) {
    for (var key in methods) {
      this[key] = _.bind(methods[key], this)
    }
  }
}

/**
 * Initialize meta information like $index, $key & $value.
 */

exports._initMeta = function () {
  var metas = this.$options._meta
  if (metas) {
    for (var key in metas) {
      this._defineMeta(key, metas[key])
    }
  }
}

/**
 * Define a meta property, e.g $index, $key, $value
 * which only exists on the vm instance but not in $data.
 *
 * @param {String} key
 * @param {*} value
 */

exports._defineMeta = function (key, value) {
  var dep = new Dep()
  Object.defineProperty(this, key, {
    enumerable: true,
    configurable: true,
    get: function metaGetter () {
      if (Observer.target) {
        Observer.target.addDep(dep)
      }
      return value
    },
    set: function metaSetter (val) {
      if (val !== value) {
        value = val
        dep.notify()
      }
    }
  })
}
},{"../observer":53,"../observer/dep":52,"../util":67}],51:[function(require,module,exports){
var _ = require('../util')
var arrayProto = Array.prototype
var arrayMethods = Object.create(arrayProto)

/**
 * Intercept mutating methods and emit events
 */

;[
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse'
]
.forEach(function (method) {
  // cache original method
  var original = arrayProto[method]
  _.define(arrayMethods, method, function mutator () {
    // avoid leaking arguments:
    // http://jsperf.com/closure-with-arguments
    var i = arguments.length
    var args = new Array(i)
    while (i--) {
      args[i] = arguments[i]
    }
    var result = original.apply(this, args)
    var ob = this.__ob__
    var inserted
    switch (method) {
      case 'push':
        inserted = args
        break
      case 'unshift':
        inserted = args
        break
      case 'splice':
        inserted = args.slice(2)
        break
    }
    if (inserted) ob.observeArray(inserted)
    // notify change
    ob.notify()
    return result
  })
})

/**
 * Swap the element at the given index with a new value
 * and emits corresponding event.
 *
 * @param {Number} index
 * @param {*} val
 * @return {*} - replaced element
 */

_.define(
  arrayProto,
  '$set',
  function $set (index, val) {
    if (index >= this.length) {
      this.length = index + 1
    }
    return this.splice(index, 1, val)[0]
  }
)

/**
 * Convenience method to remove the element at given index.
 *
 * @param {Number} index
 * @param {*} val
 */

_.define(
  arrayProto,
  '$remove',
  function $remove (index) {
    if (typeof index !== 'number') {
      index = this.indexOf(index)
    }
    if (index > -1) {
      return this.splice(index, 1)[0]
    }
  }
)

module.exports = arrayMethods
},{"../util":67}],52:[function(require,module,exports){
var uid = 0
var _ = require('../util')

/**
 * A dep is an observable that can have multiple
 * directives subscribing to it.
 *
 * @constructor
 */

function Dep () {
  this.id = ++uid
  this.subs = []
}

var p = Dep.prototype

/**
 * Add a directive subscriber.
 *
 * @param {Directive} sub
 */

p.addSub = function (sub) {
  this.subs.push(sub)
}

/**
 * Remove a directive subscriber.
 *
 * @param {Directive} sub
 */

p.removeSub = function (sub) {
  if (this.subs.length) {
    var i = this.subs.indexOf(sub)
    if (i > -1) this.subs.splice(i, 1)
  }
}

/**
 * Notify all subscribers of a new value.
 */

p.notify = function () {
  // stablize the subscriber list first
  var subs = _.toArray(this.subs)
  for (var i = 0, l = subs.length; i < l; i++) {
    subs[i].update()
  }
}

module.exports = Dep
},{"../util":67}],53:[function(require,module,exports){
var _ = require('../util')
var config = require('../config')
var Dep = require('./dep')
var arrayMethods = require('./array')
var arrayKeys = Object.getOwnPropertyNames(arrayMethods)
require('./object')

var uid = 0

/**
 * Type enums
 */

var ARRAY  = 0
var OBJECT = 1

/**
 * Augment an target Object or Array by intercepting
 * the prototype chain using __proto__
 *
 * @param {Object|Array} target
 * @param {Object} proto
 */

function protoAugment (target, src) {
  target.__proto__ = src
}

/**
 * Augment an target Object or Array by defining
 * hidden properties.
 *
 * @param {Object|Array} target
 * @param {Object} proto
 */

function copyAugment (target, src, keys) {
  var i = keys.length
  var key
  while (i--) {
    key = keys[i]
    _.define(target, key, src[key])
  }
}

/**
 * Observer class that are attached to each observed
 * object. Once attached, the observer converts target
 * object's property keys into getter/setters that
 * collect dependencies and dispatches updates.
 *
 * @param {Array|Object} value
 * @param {Number} type
 * @constructor
 */

function Observer (value, type) {
  this.id = ++uid
  this.value = value
  this.active = true
  this.deps = []
  _.define(value, '__ob__', this)
  if (type === ARRAY) {
    var augment = config.proto && _.hasProto
      ? protoAugment
      : copyAugment
    augment(value, arrayMethods, arrayKeys)
    this.observeArray(value)
  } else if (type === OBJECT) {
    this.walk(value)
  }
}

Observer.target = null

var p = Observer.prototype

/**
 * Attempt to create an observer instance for a value,
 * returns the new observer if successfully observed,
 * or the existing observer if the value already has one.
 *
 * @param {*} value
 * @return {Observer|undefined}
 * @static
 */

Observer.create = function (value) {
  if (
    value &&
    value.hasOwnProperty('__ob__') &&
    value.__ob__ instanceof Observer
  ) {
    return value.__ob__
  } else if (_.isArray(value)) {
    return new Observer(value, ARRAY)
  } else if (
    _.isPlainObject(value) &&
    !value._isVue // avoid Vue instance
  ) {
    return new Observer(value, OBJECT)
  }
}

/**
 * Walk through each property and convert them into
 * getter/setters. This method should only be called when
 * value type is Object. Properties prefixed with `$` or `_`
 * and accessor properties are ignored.
 *
 * @param {Object} obj
 */

p.walk = function (obj) {
  var keys = Object.keys(obj)
  var i = keys.length
  var key, prefix
  while (i--) {
    key = keys[i]
    prefix = key.charCodeAt(0)
    if (prefix !== 0x24 && prefix !== 0x5F) { // skip $ or _
      this.convert(key, obj[key])
    }
  }
}

/**
 * Try to carete an observer for a child value,
 * and if value is array, link dep to the array.
 *
 * @param {*} val
 * @return {Dep|undefined}
 */

p.observe = function (val) {
  return Observer.create(val)
}

/**
 * Observe a list of Array items.
 *
 * @param {Array} items
 */

p.observeArray = function (items) {
  var i = items.length
  while (i--) {
    this.observe(items[i])
  }
}

/**
 * Convert a property into getter/setter so we can emit
 * the events when the property is accessed/changed.
 *
 * @param {String} key
 * @param {*} val
 */

p.convert = function (key, val) {
  var ob = this
  var childOb = ob.observe(val)
  var dep = new Dep()
  if (childOb) {
    childOb.deps.push(dep)
  }
  Object.defineProperty(ob.value, key, {
    enumerable: true,
    configurable: true,
    get: function () {
      // Observer.target is a watcher whose getter is
      // currently being evaluated.
      if (ob.active && Observer.target) {
        Observer.target.addDep(dep)
      }
      return val
    },
    set: function (newVal) {
      if (newVal === val) return
      // remove dep from old value
      var oldChildOb = val && val.__ob__
      if (oldChildOb) {
        var oldDeps = oldChildOb.deps
        oldDeps.splice(oldDeps.indexOf(dep), 1)
      }
      val = newVal
      // add dep to new value
      var newChildOb = ob.observe(newVal)
      if (newChildOb) {
        newChildOb.deps.push(dep)
      }
      dep.notify()
    }
  })
}

/**
 * Notify change on all self deps on an observer.
 * This is called when a mutable value mutates. e.g.
 * when an Array's mutating methods are called, or an
 * Object's $add/$delete are called.
 */

p.notify = function () {
  var deps = this.deps
  for (var i = 0, l = deps.length; i < l; i++) {
    deps[i].notify()
  }
}

/**
 * Add an owner vm, so that when $add/$delete mutations
 * happen we can notify owner vms to proxy the keys and
 * digest the watchers. This is only called when the object
 * is observed as an instance's root $data.
 *
 * @param {Vue} vm
 */

p.addVm = function (vm) {
  (this.vms = this.vms || []).push(vm)
}

/**
 * Remove an owner vm. This is called when the object is
 * swapped out as an instance's $data object.
 *
 * @param {Vue} vm
 */

p.removeVm = function (vm) {
  this.vms.splice(this.vms.indexOf(vm), 1)
}

module.exports = Observer

},{"../config":20,"../util":67,"./array":51,"./dep":52,"./object":54}],54:[function(require,module,exports){
var _ = require('../util')
var objProto = Object.prototype

/**
 * Add a new property to an observed object
 * and emits corresponding event
 *
 * @param {String} key
 * @param {*} val
 * @public
 */

_.define(
  objProto,
  '$add',
  function $add (key, val) {
    if (this.hasOwnProperty(key)) return
    var ob = this.__ob__
    if (!ob || _.isReserved(key)) {
      this[key] = val
      return
    }
    ob.convert(key, val)
    if (ob.vms) {
      var i = ob.vms.length
      while (i--) {
        var vm = ob.vms[i]
        vm._proxy(key)
        vm._digest()
      }
    } else {
      ob.notify()
    }
  }
)

/**
 * Set a property on an observed object, calling add to
 * ensure the property is observed.
 *
 * @param {String} key
 * @param {*} val
 * @public
 */

_.define(
  objProto,
  '$set',
  function $set (key, val) {
    this.$add(key, val)
    this[key] = val
  }
)

/**
 * Deletes a property from an observed object
 * and emits corresponding event
 *
 * @param {String} key
 * @public
 */

_.define(
  objProto,
  '$delete',
  function $delete (key) {
    if (!this.hasOwnProperty(key)) return
    delete this[key]
    var ob = this.__ob__
    if (!ob || _.isReserved(key)) {
      return
    }
    if (ob.vms) {
      var i = ob.vms.length
      while (i--) {
        var vm = ob.vms[i]
        vm._unproxy(key)
        vm._digest()
      }
    } else {
      ob.notify()
    }
  }
)
},{"../util":67}],55:[function(require,module,exports){
var _ = require('../util')
var Cache = require('../cache')
var cache = new Cache(1000)
var argRE = /^[^\{\?]+$|^'[^']*'$|^"[^"]*"$/
var filterTokenRE = /[^\s'"]+|'[^']+'|"[^"]+"/g

/**
 * Parser state
 */

var str
var c, i, l
var inSingle
var inDouble
var curly
var square
var paren
var begin
var argIndex
var dirs
var dir
var lastFilterIndex
var arg

/**
 * Push a directive object into the result Array
 */

function pushDir () {
  dir.raw = str.slice(begin, i).trim()
  if (dir.expression === undefined) {
    dir.expression = str.slice(argIndex, i).trim()
  } else if (lastFilterIndex !== begin) {
    pushFilter()
  }
  if (i === 0 || dir.expression) {
    dirs.push(dir)
  }
}

/**
 * Push a filter to the current directive object
 */

function pushFilter () {
  var exp = str.slice(lastFilterIndex, i).trim()
  var filter
  if (exp) {
    filter = {}
    var tokens = exp.match(filterTokenRE)
    filter.name = tokens[0]
    filter.args = tokens.length > 1 ? tokens.slice(1) : null
  }
  if (filter) {
    (dir.filters = dir.filters || []).push(filter)
  }
  lastFilterIndex = i + 1
}

/**
 * Parse a directive string into an Array of AST-like
 * objects representing directives.
 *
 * Example:
 *
 * "click: a = a + 1 | uppercase" will yield:
 * {
 *   arg: 'click',
 *   expression: 'a = a + 1',
 *   filters: [
 *     { name: 'uppercase', args: null }
 *   ]
 * }
 *
 * @param {String} str
 * @return {Array<Object>}
 */

exports.parse = function (s) {

  var hit = cache.get(s)
  if (hit) {
    return hit
  }

  // reset parser state
  str = s
  inSingle = inDouble = false
  curly = square = paren = begin = argIndex = 0
  lastFilterIndex = 0
  dirs = []
  dir = {}
  arg = null

  for (i = 0, l = str.length; i < l; i++) {
    c = str.charCodeAt(i)
    if (inSingle) {
      // check single quote
      if (c === 0x27) inSingle = !inSingle
    } else if (inDouble) {
      // check double quote
      if (c === 0x22) inDouble = !inDouble
    } else if (
      c === 0x2C && // comma
      !paren && !curly && !square
    ) {
      // reached the end of a directive
      pushDir()
      // reset & skip the comma
      dir = {}
      begin = argIndex = lastFilterIndex = i + 1
    } else if (
      c === 0x3A && // colon
      !dir.expression &&
      !dir.arg
    ) {
      // argument
      arg = str.slice(begin, i).trim()
      // test for valid argument here
      // since we may have caught stuff like first half of
      // an object literal or a ternary expression.
      if (argRE.test(arg)) {
        argIndex = i + 1
        dir.arg = _.stripQuotes(arg) || arg
      }
    } else if (
      c === 0x7C && // pipe
      str.charCodeAt(i + 1) !== 0x7C &&
      str.charCodeAt(i - 1) !== 0x7C
    ) {
      if (dir.expression === undefined) {
        // first filter, end of expression
        lastFilterIndex = i + 1
        dir.expression = str.slice(argIndex, i).trim()
      } else {
        // already has filter
        pushFilter()
      }
    } else {
      switch (c) {
        case 0x22: inDouble = true; break // "
        case 0x27: inSingle = true; break // '
        case 0x28: paren++; break         // (
        case 0x29: paren--; break         // )
        case 0x5B: square++; break        // [
        case 0x5D: square--; break        // ]
        case 0x7B: curly++; break         // {
        case 0x7D: curly--; break         // }
      }
    }
  }

  if (i === 0 || begin !== i) {
    pushDir()
  }

  cache.put(s, dirs)
  return dirs
}
},{"../cache":17,"../util":67}],56:[function(require,module,exports){
var _ = require('../util')
var Path = require('./path')
var Cache = require('../cache')
var expressionCache = new Cache(1000)

var allowedKeywords =
  'Math,Date,this,true,false,null,undefined,Infinity,NaN,' +
  'isNaN,isFinite,decodeURI,decodeURIComponent,encodeURI,' +
  'encodeURIComponent,parseInt,parseFloat'
var allowedKeywordsRE =
  new RegExp('^(' + allowedKeywords.replace(/,/g, '\\b|') + '\\b)')

// keywords that don't make sense inside expressions
var improperKeywords =
  'break,case,class,catch,const,continue,debugger,default,' +
  'delete,do,else,export,extends,finally,for,function,if,' +
  'import,in,instanceof,let,return,super,switch,throw,try,' +
  'var,while,with,yield,enum,await,implements,package,' +
  'proctected,static,interface,private,public'
var improperKeywordsRE =
  new RegExp('^(' + improperKeywords.replace(/,/g, '\\b|') + '\\b)')

var wsRE = /\s/g
var newlineRE = /\n/g
var saveRE = /[\{,]\s*[\w\$_]+\s*:|('[^']*'|"[^"]*")|new |typeof |void /g
var restoreRE = /"(\d+)"/g
var pathTestRE = /^[A-Za-z_$][\w$]*(\.[A-Za-z_$][\w$]*|\['.*?'\]|\[".*?"\]|\[\d+\])*$/
var pathReplaceRE = /[^\w$\.]([A-Za-z_$][\w$]*(\.[A-Za-z_$][\w$]*|\['.*?'\]|\[".*?"\])*)/g
var booleanLiteralRE = /^(true|false)$/

/**
 * Save / Rewrite / Restore
 *
 * When rewriting paths found in an expression, it is
 * possible for the same letter sequences to be found in
 * strings and Object literal property keys. Therefore we
 * remove and store these parts in a temporary array, and
 * restore them after the path rewrite.
 */

var saved = []

/**
 * Save replacer
 *
 * The save regex can match two possible cases:
 * 1. An opening object literal
 * 2. A string
 * If matched as a plain string, we need to escape its
 * newlines, since the string needs to be preserved when
 * generating the function body.
 *
 * @param {String} str
 * @param {String} isString - str if matched as a string
 * @return {String} - placeholder with index
 */

function save (str, isString) {
  var i = saved.length
  saved[i] = isString
    ? str.replace(newlineRE, '\\n')
    : str
  return '"' + i + '"'
}

/**
 * Path rewrite replacer
 *
 * @param {String} raw
 * @return {String}
 */

function rewrite (raw) {
  var c = raw.charAt(0)
  var path = raw.slice(1)
  if (allowedKeywordsRE.test(path)) {
    return raw
  } else {
    path = path.indexOf('"') > -1
      ? path.replace(restoreRE, restore)
      : path
    return c + 'scope.' + path
  }
}

/**
 * Restore replacer
 *
 * @param {String} str
 * @param {String} i - matched save index
 * @return {String}
 */

function restore (str, i) {
  return saved[i]
}

/**
 * Rewrite an expression, prefixing all path accessors with
 * `scope.` and generate getter/setter functions.
 *
 * @param {String} exp
 * @param {Boolean} needSet
 * @return {Function}
 */

function compileExpFns (exp, needSet) {
  if (improperKeywordsRE.test(exp)) {
    _.warn(
      'Avoid using reserved keywords in expression: '
      + exp
    )
  }
  // reset state
  saved.length = 0
  // save strings and object literal keys
  var body = exp
    .replace(saveRE, save)
    .replace(wsRE, '')
  // rewrite all paths
  // pad 1 space here becaue the regex matches 1 extra char
  body = (' ' + body)
    .replace(pathReplaceRE, rewrite)
    .replace(restoreRE, restore)
  var getter = makeGetter(body)
  if (getter) {
    return {
      get: getter,
      body: body,
      set: needSet
        ? makeSetter(body)
        : null
    }
  }
}

/**
 * Compile getter setters for a simple path.
 *
 * @param {String} exp
 * @return {Function}
 */

function compilePathFns (exp) {
  var getter, path
  if (exp.indexOf('[') < 0) {
    // really simple path
    path = exp.split('.')
    getter = Path.compileGetter(path)
  } else {
    // do the real parsing
    path = Path.parse(exp)
    getter = path.get
  }
  return {
    get: getter,
    // always generate setter for simple paths
    set: function (obj, val) {
      Path.set(obj, path, val)
    }
  }
}

/**
 * Build a getter function. Requires eval.
 *
 * We isolate the try/catch so it doesn't affect the
 * optimization of the parse function when it is not called.
 *
 * @param {String} body
 * @return {Function|undefined}
 */

function makeGetter (body) {
  try {
    return new Function('scope', 'return ' + body + ';')
  } catch (e) {
    _.warn(
      'Invalid expression. ' +
      'Generated function body: ' + body
    )
  }
}

/**
 * Build a setter function.
 *
 * This is only needed in rare situations like "a[b]" where
 * a settable path requires dynamic evaluation.
 *
 * This setter function may throw error when called if the
 * expression body is not a valid left-hand expression in
 * assignment.
 *
 * @param {String} body
 * @return {Function|undefined}
 */

function makeSetter (body) {
  try {
    return new Function('scope', 'value', body + '=value;')
  } catch (e) {
    _.warn('Invalid setter function body: ' + body)
  }
}

/**
 * Check for setter existence on a cache hit.
 *
 * @param {Function} hit
 */

function checkSetter (hit) {
  if (!hit.set) {
    hit.set = makeSetter(hit.body)
  }
}

/**
 * Parse an expression into re-written getter/setters.
 *
 * @param {String} exp
 * @param {Boolean} needSet
 * @return {Function}
 */

exports.parse = function (exp, needSet) {
  exp = exp.trim()
  // try cache
  var hit = expressionCache.get(exp)
  if (hit) {
    if (needSet) {
      checkSetter(hit)
    }
    return hit
  }
  // we do a simple path check to optimize for them.
  // the check fails valid paths with unusal whitespaces,
  // but that's too rare and we don't care.
  // also skip boolean literals and paths that start with
  // global "Math"
  var res =
    pathTestRE.test(exp) &&
    // don't treat true/false as paths
    !booleanLiteralRE.test(exp) &&
    // Math constants e.g. Math.PI, Math.E etc.
    exp.slice(0, 5) !== 'Math.'
      ? compilePathFns(exp)
      : compileExpFns(exp, needSet)
  expressionCache.put(exp, res)
  return res
}

// Export the pathRegex for external use
exports.pathTestRE = pathTestRE
},{"../cache":17,"../util":67,"./path":57}],57:[function(require,module,exports){
var _ = require('../util')
var Cache = require('../cache')
var pathCache = new Cache(1000)
var identRE = /^[$_a-zA-Z]+[\w$]*$/

/**
 * Path-parsing algorithm scooped from Polymer/observe-js
 */

var pathStateMachine = {
  'beforePath': {
    'ws': ['beforePath'],
    'ident': ['inIdent', 'append'],
    '[': ['beforeElement'],
    'eof': ['afterPath']
  },

  'inPath': {
    'ws': ['inPath'],
    '.': ['beforeIdent'],
    '[': ['beforeElement'],
    'eof': ['afterPath']
  },

  'beforeIdent': {
    'ws': ['beforeIdent'],
    'ident': ['inIdent', 'append']
  },

  'inIdent': {
    'ident': ['inIdent', 'append'],
    '0': ['inIdent', 'append'],
    'number': ['inIdent', 'append'],
    'ws': ['inPath', 'push'],
    '.': ['beforeIdent', 'push'],
    '[': ['beforeElement', 'push'],
    'eof': ['afterPath', 'push']
  },

  'beforeElement': {
    'ws': ['beforeElement'],
    '0': ['afterZero', 'append'],
    'number': ['inIndex', 'append'],
    "'": ['inSingleQuote', 'append', ''],
    '"': ['inDoubleQuote', 'append', '']
  },

  'afterZero': {
    'ws': ['afterElement', 'push'],
    ']': ['inPath', 'push']
  },

  'inIndex': {
    '0': ['inIndex', 'append'],
    'number': ['inIndex', 'append'],
    'ws': ['afterElement'],
    ']': ['inPath', 'push']
  },

  'inSingleQuote': {
    "'": ['afterElement'],
    'eof': 'error',
    'else': ['inSingleQuote', 'append']
  },

  'inDoubleQuote': {
    '"': ['afterElement'],
    'eof': 'error',
    'else': ['inDoubleQuote', 'append']
  },

  'afterElement': {
    'ws': ['afterElement'],
    ']': ['inPath', 'push']
  }
}

function noop () {}

/**
 * Determine the type of a character in a keypath.
 *
 * @param {Char} char
 * @return {String} type
 */

function getPathCharType (char) {
  if (char === undefined) {
    return 'eof'
  }

  var code = char.charCodeAt(0)

  switch(code) {
    case 0x5B: // [
    case 0x5D: // ]
    case 0x2E: // .
    case 0x22: // "
    case 0x27: // '
    case 0x30: // 0
      return char

    case 0x5F: // _
    case 0x24: // $
      return 'ident'

    case 0x20: // Space
    case 0x09: // Tab
    case 0x0A: // Newline
    case 0x0D: // Return
    case 0xA0:  // No-break space
    case 0xFEFF:  // Byte Order Mark
    case 0x2028:  // Line Separator
    case 0x2029:  // Paragraph Separator
      return 'ws'
  }

  // a-z, A-Z
  if ((0x61 <= code && code <= 0x7A) ||
      (0x41 <= code && code <= 0x5A)) {
    return 'ident'
  }

  // 1-9
  if (0x31 <= code && code <= 0x39) {
    return 'number'
  }

  return 'else'
}

/**
 * Parse a string path into an array of segments
 * Todo implement cache
 *
 * @param {String} path
 * @return {Array|undefined}
 */

function parsePath (path) {
  var keys = []
  var index = -1
  var mode = 'beforePath'
  var c, newChar, key, type, transition, action, typeMap

  var actions = {
    push: function() {
      if (key === undefined) {
        return
      }
      keys.push(key)
      key = undefined
    },
    append: function() {
      if (key === undefined) {
        key = newChar
      } else {
        key += newChar
      }
    }
  }

  function maybeUnescapeQuote () {
    var nextChar = path[index + 1]
    if ((mode === 'inSingleQuote' && nextChar === "'") ||
        (mode === 'inDoubleQuote' && nextChar === '"')) {
      index++
      newChar = nextChar
      actions.append()
      return true
    }
  }

  while (mode) {
    index++
    c = path[index]

    if (c === '\\' && maybeUnescapeQuote()) {
      continue
    }

    type = getPathCharType(c)
    typeMap = pathStateMachine[mode]
    transition = typeMap[type] || typeMap['else'] || 'error'

    if (transition === 'error') {
      return // parse error
    }

    mode = transition[0]
    action = actions[transition[1]] || noop
    newChar = transition[2] === undefined
      ? c
      : transition[2]
    action()

    if (mode === 'afterPath') {
      return keys
    }
  }
}

/**
 * Format a accessor segment based on its type.
 *
 * @param {String} key
 * @return {Boolean}
 */

function formatAccessor(key) {
  if (identRE.test(key)) { // identifier
    return '.' + key
  } else if (+key === key >>> 0) { // bracket index
    return '[' + key + ']'
  } else { // bracket string
    return '["' + key.replace(/"/g, '\\"') + '"]'
  }
}

/**
 * Compiles a getter function with a fixed path.
 *
 * @param {Array} path
 * @return {Function}
 */

exports.compileGetter = function (path) {
  var body = 'return o' + path.map(formatAccessor).join('')
  return new Function('o', body)
}

/**
 * External parse that check for a cache hit first
 *
 * @param {String} path
 * @return {Array|undefined}
 */

exports.parse = function (path) {
  var hit = pathCache.get(path)
  if (!hit) {
    hit = parsePath(path)
    if (hit) {
      hit.get = exports.compileGetter(hit)
      pathCache.put(path, hit)
    }
  }
  return hit
}

/**
 * Get from an object from a path string
 *
 * @param {Object} obj
 * @param {String} path
 */

exports.get = function (obj, path) {
  path = exports.parse(path)
  if (path) {
    return path.get(obj)
  }
}

/**
 * Set on an object from a path
 *
 * @param {Object} obj
 * @param {String | Array} path
 * @param {*} val
 */

exports.set = function (obj, path, val) {
  if (typeof path === 'string') {
    path = exports.parse(path)
  }
  if (!path || !_.isObject(obj)) {
    return false
  }
  var last, key
  for (var i = 0, l = path.length - 1; i < l; i++) {
    last = obj
    key = path[i]
    obj = obj[key]
    if (!_.isObject(obj)) {
      obj = {}
      last.$add(key, obj)
    }
  }
  key = path[i]
  if (key in obj) {
    obj[key] = val
  } else {
    obj.$add(key, val)
  }
  return true
}
},{"../cache":17,"../util":67}],58:[function(require,module,exports){
var _ = require('../util')
var Cache = require('../cache')
var templateCache = new Cache(1000)
var idSelectorCache = new Cache(1000)

var map = {
  _default : [0, '', ''],
  legend   : [1, '<fieldset>', '</fieldset>'],
  tr       : [2, '<table><tbody>', '</tbody></table>'],
  col      : [
    2,
    '<table><tbody></tbody><colgroup>',
    '</colgroup></table>'
  ]
}

map.td =
map.th = [
  3,
  '<table><tbody><tr>',
  '</tr></tbody></table>'
]

map.option =
map.optgroup = [
  1,
  '<select multiple="multiple">',
  '</select>'
]

map.thead =
map.tbody =
map.colgroup =
map.caption =
map.tfoot = [1, '<table>', '</table>']

map.g =
map.defs =
map.symbol =
map.use =
map.image =
map.text =
map.circle =
map.ellipse =
map.line =
map.path =
map.polygon =
map.polyline =
map.rect = [
  1,
  '<svg ' +
    'xmlns="http://www.w3.org/2000/svg" ' +
    'xmlns:xlink="http://www.w3.org/1999/xlink" ' +
    'xmlns:ev="http://www.w3.org/2001/xml-events"' +
    'version="1.1">',
  '</svg>'
]

var tagRE = /<([\w:]+)/
var entityRE = /&\w+;/

/**
 * Convert a string template to a DocumentFragment.
 * Determines correct wrapping by tag types. Wrapping
 * strategy found in jQuery & component/domify.
 *
 * @param {String} templateString
 * @return {DocumentFragment}
 */

function stringToFragment (templateString) {
  // try a cache hit first
  var hit = templateCache.get(templateString)
  if (hit) {
    return hit
  }

  var frag = document.createDocumentFragment()
  var tagMatch = templateString.match(tagRE)
  var entityMatch = entityRE.test(templateString)

  if (!tagMatch && !entityMatch) {
    // text only, return a single text node.
    frag.appendChild(
      document.createTextNode(templateString)
    )
  } else {

    var tag    = tagMatch && tagMatch[1]
    var wrap   = map[tag] || map._default
    var depth  = wrap[0]
    var prefix = wrap[1]
    var suffix = wrap[2]
    var node   = document.createElement('div')

    node.innerHTML = prefix + templateString.trim() + suffix
    while (depth--) {
      node = node.lastChild
    }

    var child
    /* jshint boss:true */
    while (child = node.firstChild) {
      frag.appendChild(child)
    }
  }

  templateCache.put(templateString, frag)
  return frag
}

/**
 * Convert a template node to a DocumentFragment.
 *
 * @param {Node} node
 * @return {DocumentFragment}
 */

function nodeToFragment (node) {
  var tag = node.tagName
  // if its a template tag and the browser supports it,
  // its content is already a document fragment.
  if (
    tag === 'TEMPLATE' &&
    node.content instanceof DocumentFragment
  ) {
    return node.content
  }
  // script template
  if (tag === 'SCRIPT') {
    return stringToFragment(node.textContent)
  }
  // normal node, clone it to avoid mutating the original
  var clone = exports.clone(node)
  var frag = document.createDocumentFragment()
  var child
  /* jshint boss:true */
  while (child = clone.firstChild) {
    frag.appendChild(child)
  }
  return frag
}

// Test for the presence of the Safari template cloning bug
// https://bugs.webkit.org/show_bug.cgi?id=137755
var hasBrokenTemplate = _.inBrowser
  ? (function () {
      var a = document.createElement('div')
      a.innerHTML = '<template>1</template>'
      return !a.cloneNode(true).firstChild.innerHTML
    })()
  : false

// Test for IE10/11 textarea placeholder clone bug
var hasTextareaCloneBug = _.inBrowser
  ? (function () {
      var t = document.createElement('textarea')
      t.placeholder = 't'
      return t.cloneNode(true).value === 't'
    })()
  : false

/**
 * 1. Deal with Safari cloning nested <template> bug by
 *    manually cloning all template instances.
 * 2. Deal with IE10/11 textarea placeholder bug by setting
 *    the correct value after cloning.
 *
 * @param {Element|DocumentFragment} node
 * @return {Element|DocumentFragment}
 */

exports.clone = function (node) {
  var res = node.cloneNode(true)
  var i, original, cloned
  /* istanbul ignore if */
  if (hasBrokenTemplate) {
    original = node.querySelectorAll('template')
    if (original.length) {
      cloned = res.querySelectorAll('template')
      i = cloned.length
      while (i--) {
        cloned[i].parentNode.replaceChild(
          original[i].cloneNode(true),
          cloned[i]
        )
      }
    }
  }
  /* istanbul ignore if */
  if (hasTextareaCloneBug) {
    if (node.tagName === 'TEXTAREA') {
      res.value = node.value
    } else {
      original = node.querySelectorAll('textarea')
      if (original.length) {
        cloned = res.querySelectorAll('textarea')
        i = cloned.length
        while (i--) {
          cloned[i].value = original[i].value
        }
      }
    }
  }
  return res
}

/**
 * Process the template option and normalizes it into a
 * a DocumentFragment that can be used as a partial or a
 * instance template.
 *
 * @param {*} template
 *    Possible values include:
 *    - DocumentFragment object
 *    - Node object of type Template
 *    - id selector: '#some-template-id'
 *    - template string: '<div><span>{{msg}}</span></div>'
 * @param {Boolean} clone
 * @param {Boolean} noSelector
 * @return {DocumentFragment|undefined}
 */

exports.parse = function (template, clone, noSelector) {
  var node, frag

  // if the template is already a document fragment,
  // do nothing
  if (template instanceof DocumentFragment) {
    return clone
      ? template.cloneNode(true)
      : template
  }

  if (typeof template === 'string') {
    // id selector
    if (!noSelector && template.charAt(0) === '#') {
      // id selector can be cached too
      frag = idSelectorCache.get(template)
      if (!frag) {
        node = document.getElementById(template.slice(1))
        if (node) {
          frag = nodeToFragment(node)
          // save selector to cache
          idSelectorCache.put(template, frag)
        }
      }
    } else {
      // normal string template
      frag = stringToFragment(template)
    }
  } else if (template.nodeType) {
    // a direct node
    frag = nodeToFragment(template)
  }

  return frag && clone
    ? exports.clone(frag)
    : frag
}
},{"../cache":17,"../util":67}],59:[function(require,module,exports){
var Cache = require('../cache')
var config = require('../config')
var dirParser = require('./directive')
var regexEscapeRE = /[-.*+?^${}()|[\]\/\\]/g
var cache, tagRE, htmlRE, firstChar, lastChar

/**
 * Escape a string so it can be used in a RegExp
 * constructor.
 *
 * @param {String} str
 */

function escapeRegex (str) {
  return str.replace(regexEscapeRE, '\\$&')
}

/**
 * Compile the interpolation tag regex.
 *
 * @return {RegExp}
 */

function compileRegex () {
  config._delimitersChanged = false
  var open = config.delimiters[0]
  var close = config.delimiters[1]
  firstChar = open.charAt(0)
  lastChar = close.charAt(close.length - 1)
  var firstCharRE = escapeRegex(firstChar)
  var lastCharRE = escapeRegex(lastChar)
  var openRE = escapeRegex(open)
  var closeRE = escapeRegex(close)
  tagRE = new RegExp(
    firstCharRE + '?' + openRE +
    '(.+?)' +
    closeRE + lastCharRE + '?',
    'g'
  )
  htmlRE = new RegExp(
    '^' + firstCharRE + openRE +
    '.*' +
    closeRE + lastCharRE + '$'
  )
  // reset cache
  cache = new Cache(1000)
}

/**
 * Parse a template text string into an array of tokens.
 *
 * @param {String} text
 * @return {Array<Object> | null}
 *               - {String} type
 *               - {String} value
 *               - {Boolean} [html]
 *               - {Boolean} [oneTime]
 */

exports.parse = function (text) {
  if (config._delimitersChanged) {
    compileRegex()
  }
  var hit = cache.get(text)
  if (hit) {
    return hit
  }
  if (!tagRE.test(text)) {
    return null
  }
  var tokens = []
  var lastIndex = tagRE.lastIndex = 0
  var match, index, value, first, oneTime, partial
  /* jshint boss:true */
  while (match = tagRE.exec(text)) {
    index = match.index
    // push text token
    if (index > lastIndex) {
      tokens.push({
        value: text.slice(lastIndex, index)
      })
    }
    // tag token
    first = match[1].charCodeAt(0)
    oneTime = first === 0x2A // *
    partial = first === 0x3E // >
    value = (oneTime || partial)
      ? match[1].slice(1)
      : match[1]
    tokens.push({
      tag: true,
      value: value.trim(),
      html: htmlRE.test(match[0]),
      oneTime: oneTime,
      partial: partial
    })
    lastIndex = index + match[0].length
  }
  if (lastIndex < text.length) {
    tokens.push({
      value: text.slice(lastIndex)
    })
  }
  cache.put(text, tokens)
  return tokens
}

/**
 * Format a list of tokens into an expression.
 * e.g. tokens parsed from 'a {{b}} c' can be serialized
 * into one single expression as '"a " + b + " c"'.
 *
 * @param {Array} tokens
 * @param {Vue} [vm]
 * @return {String}
 */

exports.tokensToExp = function (tokens, vm) {
  return tokens.length > 1
    ? tokens.map(function (token) {
        return formatToken(token, vm)
      }).join('+')
    : formatToken(tokens[0], vm, true)
}

/**
 * Format a single token.
 *
 * @param {Object} token
 * @param {Vue} [vm]
 * @param {Boolean} single
 * @return {String}
 */

function formatToken (token, vm, single) {
  return token.tag
    ? vm && token.oneTime
      ? '"' + vm.$eval(token.value) + '"'
      : single
        ? token.value
        : inlineFilters(token.value)
    : '"' + token.value + '"'
}

/**
 * For an attribute with multiple interpolation tags,
 * e.g. attr="some-{{thing | filter}}", in order to combine
 * the whole thing into a single watchable expression, we
 * have to inline those filters. This function does exactly
 * that. This is a bit hacky but it avoids heavy changes
 * to directive parser and watcher mechanism.
 *
 * @param {String} exp
 * @return {String}
 */

var filterRE = /[^|]\|[^|]/
function inlineFilters (exp) {
  if (!filterRE.test(exp)) {
    return '(' + exp + ')'
  } else {
    var dir = dirParser.parse(exp)[0]
    if (!dir.filters) {
      return '(' + exp + ')'
    } else {
      exp = dir.expression
      for (var i = 0, l = dir.filters.length; i < l; i++) {
        var filter = dir.filters[i]
        var args = filter.args
          ? ',"' + filter.args.join('","') + '"'
          : ''
        filter = 'this.$options.filters["' + filter.name + '"]'
        exp = '(' + filter + '.read||' + filter + ')' +
          '.apply(this,[' + exp + args + '])'
      }
      return exp
    }
  }
}
},{"../cache":17,"../config":20,"./directive":55}],60:[function(require,module,exports){
var _ = require('../util')
var addClass = _.addClass
var removeClass = _.removeClass
var transDurationProp = _.transitionProp + 'Duration'
var animDurationProp = _.animationProp + 'Duration'

var queue = []
var queued = false

/**
 * Push a job into the transition queue, which is to be
 * executed on next frame.
 *
 * @param {Element} el    - target element
 * @param {Number} dir    - 1: enter, -1: leave
 * @param {Function} op   - the actual dom operation
 * @param {String} cls    - the className to remove when the
 *                          transition is done.
 * @param {Function} [cb] - user supplied callback.
 */

function push (el, dir, op, cls, cb) {
  queue.push({
    el  : el,
    dir : dir,
    cb  : cb,
    cls : cls,
    op  : op
  })
  if (!queued) {
    queued = true
    _.nextTick(flush)
  }
}

/**
 * Flush the queue, and do one forced reflow before
 * triggering transitions.
 */

function flush () {
  /* jshint unused: false */
  var f = document.documentElement.offsetHeight
  queue.forEach(run)
  queue = []
  queued = false
}

/**
 * Run a transition job.
 *
 * @param {Object} job
 */

function run (job) {

  var el = job.el
  var data = el.__v_trans
  var cls = job.cls
  var cb = job.cb
  var op = job.op
  var transitionType = getTransitionType(el, data, cls)

  if (job.dir > 0) { // ENTER
    if (transitionType === 1) {
      // trigger transition by removing enter class
      removeClass(el, cls)
      // only need to listen for transitionend if there's
      // a user callback
      if (cb) setupTransitionCb(_.transitionEndEvent)
    } else if (transitionType === 2) {
      // animations are triggered when class is added
      // so we just listen for animationend to remove it.
      setupTransitionCb(_.animationEndEvent, function () {
        removeClass(el, cls)
      })
    } else {
      // no transition applicable
      removeClass(el, cls)
      if (cb) cb()
    }
  } else { // LEAVE
    if (transitionType) {
      // leave transitions/animations are both triggered
      // by adding the class, just remove it on end event.
      var event = transitionType === 1
        ? _.transitionEndEvent
        : _.animationEndEvent
      setupTransitionCb(event, function () {
        op()
        removeClass(el, cls)
      })
    } else {
      op()
      removeClass(el, cls)
      if (cb) cb()
    }
  }

  /**
   * Set up a transition end callback, store the callback
   * on the element's __v_trans data object, so we can
   * clean it up if another transition is triggered before
   * the callback is fired.
   *
   * @param {String} event
   * @param {Function} [cleanupFn]
   */

  function setupTransitionCb (event, cleanupFn) {
    data.event = event
    var onEnd = data.callback = function transitionCb (e) {
      if (e.target === el) {
        _.off(el, event, onEnd)
        data.event = data.callback = null
        if (cleanupFn) cleanupFn()
        if (cb) cb()
      }
    }
    _.on(el, event, onEnd)
  }
}

/**
 * Get an element's transition type based on the
 * calculated styles
 *
 * @param {Element} el
 * @param {Object} data
 * @param {String} className
 * @return {Number}
 *         1 - transition
 *         2 - animation
 */

function getTransitionType (el, data, className) {
  var type = data.cache && data.cache[className]
  if (type) return type
  var inlineStyles = el.style
  var computedStyles = window.getComputedStyle(el)
  var transDuration =
    inlineStyles[transDurationProp] ||
    computedStyles[transDurationProp]
  if (transDuration && transDuration !== '0s') {
    type = 1
  } else {
    var animDuration =
      inlineStyles[animDurationProp] ||
      computedStyles[animDurationProp]
    if (animDuration && animDuration !== '0s') {
      type = 2
    }
  }
  if (type) {
    if (!data.cache) data.cache = {}
    data.cache[className] = type
  }
  return type
}

/**
 * Apply CSS transition to an element.
 *
 * @param {Element} el
 * @param {Number} direction - 1: enter, -1: leave
 * @param {Function} op - the actual DOM operation
 * @param {Object} data - target element's transition data
 */

module.exports = function (el, direction, op, data, cb) {
  var prefix = data.id || 'v'
  var enterClass = prefix + '-enter'
  var leaveClass = prefix + '-leave'
  // clean up potential previous unfinished transition
  if (data.callback) {
    _.off(el, data.event, data.callback)
    removeClass(el, enterClass)
    removeClass(el, leaveClass)
    data.event = data.callback = null
  }
  if (direction > 0) { // enter
    addClass(el, enterClass)
    op()
    push(el, direction, null, enterClass, cb)
  } else { // leave
    addClass(el, leaveClass)
    push(el, direction, op, leaveClass, cb)
  }
}
},{"../util":67}],61:[function(require,module,exports){
var _ = require('../util')
var applyCSSTransition = require('./css')
var applyJSTransition = require('./js')
var doc = typeof document === 'undefined' ? null : document

/**
 * Append with transition.
 *
 * @oaram {Element} el
 * @param {Element} target
 * @param {Vue} vm
 * @param {Function} [cb]
 */

exports.append = function (el, target, vm, cb) {
  apply(el, 1, function () {
    target.appendChild(el)
  }, vm, cb)
}

/**
 * InsertBefore with transition.
 *
 * @oaram {Element} el
 * @param {Element} target
 * @param {Vue} vm
 * @param {Function} [cb]
 */

exports.before = function (el, target, vm, cb) {
  apply(el, 1, function () {
    _.before(el, target)
  }, vm, cb)
}

/**
 * Remove with transition.
 *
 * @oaram {Element} el
 * @param {Vue} vm
 * @param {Function} [cb]
 */

exports.remove = function (el, vm, cb) {
  apply(el, -1, function () {
    _.remove(el)
  }, vm, cb)
}

/**
 * Remove by appending to another parent with transition.
 * This is only used in block operations.
 *
 * @oaram {Element} el
 * @param {Element} target
 * @param {Vue} vm
 * @param {Function} [cb]
 */

exports.removeThenAppend = function (el, target, vm, cb) {
  apply(el, -1, function () {
    target.appendChild(el)
  }, vm, cb)
}

/**
 * Append the childNodes of a fragment to target.
 *
 * @param {DocumentFragment} block
 * @param {Node} target
 * @param {Vue} vm
 */

exports.blockAppend = function (block, target, vm) {
  var nodes = _.toArray(block.childNodes)
  for (var i = 0, l = nodes.length; i < l; i++) {
    exports.before(nodes[i], target, vm)
  }
}

/**
 * Remove a block of nodes between two edge nodes.
 *
 * @param {Node} start
 * @param {Node} end
 * @param {Vue} vm
 */

exports.blockRemove = function (start, end, vm) {
  var node = start.nextSibling
  var next
  while (node !== end) {
    next = node.nextSibling
    exports.remove(node, vm)
    node = next
  }
}

/**
 * Apply transitions with an operation callback.
 *
 * @oaram {Element} el
 * @param {Number} direction
 *                  1: enter
 *                 -1: leave
 * @param {Function} op - the actual DOM operation
 * @param {Vue} vm
 * @param {Function} [cb]
 */

var apply = exports.apply = function (el, direction, op, vm, cb) {
  var transData = el.__v_trans
  if (
    !transData ||
    !vm._isCompiled ||
    // if the vm is being manipulated by a parent directive
    // during the parent's compilation phase, skip the
    // animation.
    (vm.$parent && !vm.$parent._isCompiled)
  ) {
    op()
    if (cb) cb()
    return
  }
  // determine the transition type on the element
  var jsTransition = transData.fns
  if (jsTransition) {
    // js
    applyJSTransition(
      el,
      direction,
      op,
      transData,
      jsTransition,
      vm,
      cb
    )
  } else if (
    _.transitionEndEvent &&
    // skip CSS transitions if page is not visible -
    // this solves the issue of transitionend events not
    // firing until the page is visible again.
    // pageVisibility API is supported in IE10+, same as
    // CSS transitions.
    !(doc && doc.hidden)
  ) {
    // css
    applyCSSTransition(
      el,
      direction,
      op,
      transData,
      cb
    )
  } else {
    // not applicable
    op()
    if (cb) cb()
  }
}
},{"../util":67,"./css":60,"./js":62}],62:[function(require,module,exports){
/**
 * Apply JavaScript enter/leave functions.
 *
 * @param {Element} el
 * @param {Number} direction - 1: enter, -1: leave
 * @param {Function} op - the actual DOM operation
 * @param {Object} data - target element's transition data
 * @param {Object} def - transition definition object
 * @param {Vue} vm - the owner vm of the element
 * @param {Function} [cb]
 */

module.exports = function (el, direction, op, data, def, vm, cb) {
  // if the element is the root of an instance,
  // use that instance as the transition function context
  vm = el.__vue__ || vm
  if (data.cancel) {
    data.cancel()
    data.cancel = null
  }
  if (direction > 0) { // enter
    if (def.beforeEnter) {
      def.beforeEnter.call(vm, el)
    }
    op()
    if (def.enter) {
      data.cancel = def.enter.call(vm, el, function () {
        data.cancel = null
        if (cb) cb()
      })
    } else if (cb) {
      cb()
    }
  } else { // leave
    if (def.leave) {
      data.cancel = def.leave.call(vm, el, function () {
        data.cancel = null
        op()
        if (cb) cb()
      })
    } else {
      op()
      if (cb) cb()
    }
  }
}
},{}],63:[function(require,module,exports){
var config = require('../config')

/**
 * Enable debug utilities. The enableDebug() function and
 * all _.log() & _.warn() calls will be dropped in the
 * minified production build.
 */

enableDebug()

function enableDebug () {

  var hasConsole = typeof console !== 'undefined'
  
  /**
   * Log a message.
   *
   * @param {String} msg
   */

  exports.log = function (msg) {
    if (hasConsole && config.debug) {
      console.log('[Vue info]: ' + msg)
    }
  }

  /**
   * We've got a problem here.
   *
   * @param {String} msg
   */

  exports.warn = function (msg) {
    if (hasConsole && (!config.silent || config.debug)) {
      console.warn('[Vue warn]: ' + msg)
      /* istanbul ignore if */
      if (config.debug) {
        /* jshint debug: true */
        debugger
      }
    }
  }

  /**
   * Assert asset exists
   */

  exports.assertAsset = function (val, type, id) {
    if (!val) {
      exports.warn('Failed to resolve ' + type + ': ' + id)
    }
  }
}
},{"../config":20}],64:[function(require,module,exports){
var config = require('../config')

/**
 * Check if a node is in the document.
 * Note: document.documentElement.contains should work here
 * but always returns false for comment nodes in phantomjs,
 * making unit tests difficult. This is fixed byy doing the
 * contains() check on the node's parentNode instead of
 * the node itself.
 *
 * @param {Node} node
 * @return {Boolean}
 */

var doc =
  typeof document !== 'undefined' &&
  document.documentElement

exports.inDoc = function (node) {
  var parent = node && node.parentNode
  return doc === node ||
    doc === parent ||
    !!(parent && parent.nodeType === 1 && (doc.contains(parent)))
}

/**
 * Extract an attribute from a node.
 *
 * @param {Node} node
 * @param {String} attr
 */

exports.attr = function (node, attr) {
  attr = config.prefix + attr
  var val = node.getAttribute(attr)
  if (val !== null) {
    node.removeAttribute(attr)
  }
  return val
}

/**
 * Insert el before target
 *
 * @param {Element} el
 * @param {Element} target
 */

exports.before = function (el, target) {
  target.parentNode.insertBefore(el, target)
}

/**
 * Insert el after target
 *
 * @param {Element} el
 * @param {Element} target
 */

exports.after = function (el, target) {
  if (target.nextSibling) {
    exports.before(el, target.nextSibling)
  } else {
    target.parentNode.appendChild(el)
  }
}

/**
 * Remove el from DOM
 *
 * @param {Element} el
 */

exports.remove = function (el) {
  el.parentNode.removeChild(el)
}

/**
 * Prepend el to target
 *
 * @param {Element} el
 * @param {Element} target
 */

exports.prepend = function (el, target) {
  if (target.firstChild) {
    exports.before(el, target.firstChild)
  } else {
    target.appendChild(el)
  }
}

/**
 * Replace target with el
 *
 * @param {Element} target
 * @param {Element} el
 */

exports.replace = function (target, el) {
  var parent = target.parentNode
  if (parent) {
    parent.replaceChild(el, target)
  }
}

/**
 * Copy attributes from one element to another.
 *
 * @param {Element} from
 * @param {Element} to
 */

exports.copyAttributes = function (from, to) {
  if (from.hasAttributes()) {
    var attrs = from.attributes
    for (var i = 0, l = attrs.length; i < l; i++) {
      var attr = attrs[i]
      to.setAttribute(attr.name, attr.value)
    }
  }
}

/**
 * Add event listener shorthand.
 *
 * @param {Element} el
 * @param {String} event
 * @param {Function} cb
 */

exports.on = function (el, event, cb) {
  el.addEventListener(event, cb)
}

/**
 * Remove event listener shorthand.
 *
 * @param {Element} el
 * @param {String} event
 * @param {Function} cb
 */

exports.off = function (el, event, cb) {
  el.removeEventListener(event, cb)
}

/**
 * Add class with compatibility for IE & SVG
 *
 * @param {Element} el
 * @param {Strong} cls
 */

exports.addClass = function (el, cls) {
  if (el.classList) {
    el.classList.add(cls)
  } else {
    var cur = ' ' + (el.getAttribute('class') || '') + ' '
    if (cur.indexOf(' ' + cls + ' ') < 0) {
      el.setAttribute('class', (cur + cls).trim())
    }
  }
}

/**
 * Remove class with compatibility for IE & SVG
 *
 * @param {Element} el
 * @param {Strong} cls
 */

exports.removeClass = function (el, cls) {
  if (el.classList) {
    el.classList.remove(cls)
  } else {
    var cur = ' ' + (el.getAttribute('class') || '') + ' '
    var tar = ' ' + cls + ' '
    while (cur.indexOf(tar) >= 0) {
      cur = cur.replace(tar, ' ')
    }
    el.setAttribute('class', cur.trim())
  }
}

/**
 * Extract raw content inside an element into a temporary
 * container div
 *
 * @param {Element} el
 * @param {Boolean} asFragment
 * @return {Element}
 */

exports.extractContent = function (el, asFragment) {
  var child
  var rawContent
  if (el.hasChildNodes()) {
    rawContent = asFragment
      ? document.createDocumentFragment()
      : document.createElement('div')
    /* jshint boss:true */
    while (child = el.firstChild) {
      rawContent.appendChild(child)
    }
  }
  return rawContent
}

},{"../config":20}],65:[function(require,module,exports){
/**
 * Can we use __proto__?
 *
 * @type {Boolean}
 */

exports.hasProto = '__proto__' in {}

/**
 * Indicates we have a window
 *
 * @type {Boolean}
 */

var toString = Object.prototype.toString
var inBrowser = exports.inBrowser =
  typeof window !== 'undefined' &&
  toString.call(window) !== '[object Object]'

/**
 * Defer a task to execute it asynchronously. Ideally this
 * should be executed as a microtask, so we leverage
 * MutationObserver if it's available, and fallback to
 * setTimeout(0).
 *
 * @param {Function} cb
 * @param {Object} ctx
 */

exports.nextTick = (function () {
  var callbacks = []
  var pending = false
  var timerFunc
  function handle () {
    pending = false
    var copies = callbacks.slice(0)
    callbacks = []
    for (var i = 0; i < copies.length; i++) {
      copies[i]()
    }
  }
  /* istanbul ignore if */
  if (typeof MutationObserver !== 'undefined') {
    var counter = 1
    var observer = new MutationObserver(handle)
    var textNode = document.createTextNode(counter)
    observer.observe(textNode, {
      characterData: true
    })
    timerFunc = function () {
      counter = (counter + 1) % 2
      textNode.data = counter
    }
  } else {
    timerFunc = setTimeout
  }
  return function (cb, ctx) {
    var func = ctx
      ? function () { cb.call(ctx) }
      : cb
    callbacks.push(func)
    if (pending) return
    pending = true
    timerFunc(handle, 0)
  }
})()

/**
 * Detect if we are in IE9...
 *
 * @type {Boolean}
 */

exports.isIE9 =
  inBrowser &&
  navigator.userAgent.indexOf('MSIE 9.0') > 0

/**
 * Sniff transition/animation events
 */

if (inBrowser && !exports.isIE9) {
  var isWebkitTrans =
    window.ontransitionend === undefined &&
    window.onwebkittransitionend !== undefined
  var isWebkitAnim =
    window.onanimationend === undefined &&
    window.onwebkitanimationend !== undefined
  exports.transitionProp = isWebkitTrans
    ? 'WebkitTransition'
    : 'transition'
  exports.transitionEndEvent = isWebkitTrans
    ? 'webkitTransitionEnd'
    : 'transitionend'
  exports.animationProp = isWebkitAnim
    ? 'WebkitAnimation'
    : 'animation'
  exports.animationEndEvent = isWebkitAnim
    ? 'webkitAnimationEnd'
    : 'animationend'
}
},{}],66:[function(require,module,exports){
var _ = require('./debug')

/**
 * Resolve read & write filters for a vm instance. The
 * filters descriptor Array comes from the directive parser.
 *
 * This is extracted into its own utility so it can
 * be used in multiple scenarios.
 *
 * @param {Vue} vm
 * @param {Array<Object>} filters
 * @param {Object} [target]
 * @return {Object}
 */

exports.resolveFilters = function (vm, filters, target) {
  if (!filters) {
    return
  }
  var res = target || {}
  // var registry = vm.$options.filters
  filters.forEach(function (f) {
    var def = vm.$options.filters[f.name]
    _.assertAsset(def, 'filter', f.name)
    if (!def) return
    var args = f.args
    var reader, writer
    if (typeof def === 'function') {
      reader = def
    } else {
      reader = def.read
      writer = def.write
    }
    if (reader) {
      if (!res.read) res.read = []
      res.read.push(function (value) {
        return args
          ? reader.apply(vm, [value].concat(args))
          : reader.call(vm, value)
      })
    }
    if (writer) {
      if (!res.write) res.write = []
      res.write.push(function (value, oldVal) {
        return args
          ? writer.apply(vm, [value, oldVal].concat(args))
          : writer.call(vm, value, oldVal)
      })
    }
  })
  return res
}

/**
 * Apply filters to a value
 *
 * @param {*} value
 * @param {Array} filters
 * @param {Vue} vm
 * @param {*} oldVal
 * @return {*}
 */

exports.applyFilters = function (value, filters, vm, oldVal) {
  if (!filters) {
    return value
  }
  for (var i = 0, l = filters.length; i < l; i++) {
    value = filters[i].call(vm, value, oldVal)
  }
  return value
}
},{"./debug":63}],67:[function(require,module,exports){
var lang   = require('./lang')
var extend = lang.extend

extend(exports, lang)
extend(exports, require('./env'))
extend(exports, require('./dom'))
extend(exports, require('./filter'))
extend(exports, require('./debug'))
},{"./debug":63,"./dom":64,"./env":65,"./filter":66,"./lang":68}],68:[function(require,module,exports){
/**
 * Check is a string starts with $ or _
 *
 * @param {String} str
 * @return {Boolean}
 */

exports.isReserved = function (str) {
  var c = (str + '').charCodeAt(0)
  return c === 0x24 || c === 0x5F
}

/**
 * Guard text output, make sure undefined outputs
 * empty string
 *
 * @param {*} value
 * @return {String}
 */

exports.toString = function (value) {
  return value == null
    ? ''
    : value.toString()
}

/**
 * Check and convert possible numeric numbers before
 * setting back to data
 *
 * @param {*} value
 * @return {*|Number}
 */

exports.toNumber = function (value) {
  return (
    isNaN(value) ||
    value === null ||
    typeof value === 'boolean'
  ) ? value
    : Number(value)
}

/**
 * Strip quotes from a string
 *
 * @param {String} str
 * @return {String | false}
 */

exports.stripQuotes = function (str) {
  var a = str.charCodeAt(0)
  var b = str.charCodeAt(str.length - 1)
  return a === b && (a === 0x22 || a === 0x27)
    ? str.slice(1, -1)
    : false
}

/**
 * Replace helper
 *
 * @param {String} _ - matched delimiter
 * @param {String} c - matched char
 * @return {String}
 */
function toUpper (_, c) {
  return c ? c.toUpperCase () : ''
}

/**
 * Camelize a hyphen-delmited string.
 *
 * @param {String} str
 * @return {String}
 */

var camelRE = /-(\w)/g
exports.camelize = function (str) {
  return str.replace(camelRE, toUpper)
}

/**
 * Converts hyphen/underscore/slash delimitered names into
 * camelized classNames.
 *
 * e.g. my-component => MyComponent
 *      some_else    => SomeElse
 *      some/comp    => SomeComp
 *
 * @param {String} str
 * @return {String}
 */

var classifyRE = /(?:^|[-_\/])(\w)/g
exports.classify = function (str) {
  return str.replace(classifyRE, toUpper)
}

/**
 * Simple bind, faster than native
 *
 * @param {Function} fn
 * @param {Object} ctx
 * @return {Function}
 */

exports.bind = function (fn, ctx) {
  return function () {
    return fn.apply(ctx, arguments)
  }
}

/**
 * Convert an Array-like object to a real Array.
 *
 * @param {Array-like} list
 * @param {Number} [start] - start index
 * @return {Array}
 */

exports.toArray = function (list, start) {
  start = start || 0
  var i = list.length - start
  var ret = new Array(i)
  while (i--) {
    ret[i] = list[i + start]
  }
  return ret
}

/**
 * Mix properties into target object.
 *
 * @param {Object} to
 * @param {Object} from
 */

exports.extend = function (to, from) {
  for (var key in from) {
    to[key] = from[key]
  }
  return to
}

/**
 * Quick object check - this is primarily used to tell
 * Objects from primitive values when we know the value
 * is a JSON-compliant type.
 *
 * @param {*} obj
 * @return {Boolean}
 */

exports.isObject = function (obj) {
  return obj && typeof obj === 'object'
}

/**
 * Strict object type check. Only returns true
 * for plain JavaScript objects.
 *
 * @param {*} obj
 * @return {Boolean}
 */

var toString = Object.prototype.toString
exports.isPlainObject = function (obj) {
  return toString.call(obj) === '[object Object]'
}

/**
 * Array type check.
 *
 * @param {*} obj
 * @return {Boolean}
 */

exports.isArray = function (obj) {
  return Array.isArray(obj)
}

/**
 * Define a non-enumerable property
 *
 * @param {Object} obj
 * @param {String} key
 * @param {*} val
 * @param {Boolean} [enumerable]
 */

exports.define = function (obj, key, val, enumerable) {
  Object.defineProperty(obj, key, {
    value        : val,
    enumerable   : !!enumerable,
    writable     : true,
    configurable : true
  })
}

/**
 * Debounce a function so it only gets called after the
 * input stops arriving after the given wait period.
 *
 * @param {Function} func
 * @param {Number} wait
 * @return {Function} - the debounced function
 */

exports.debounce = function(func, wait) {
  var timeout, args, context, timestamp, result
  var later = function() {
    var last = Date.now() - timestamp
    if (last < wait && last >= 0) {
      timeout = setTimeout(later, wait - last)
    } else {
      timeout = null
      result = func.apply(context, args)
      if (!timeout) context = args = null
    }
  }
  return function() {
    context = this
    args = arguments
    timestamp = Date.now()
    if (!timeout) {
      timeout = setTimeout(later, wait)
    }
    return result
  }
}
},{}],69:[function(require,module,exports){
var _ = require('./index')
var extend = _.extend

/**
 * Option overwriting strategies are functions that handle
 * how to merge a parent option value and a child option
 * value into the final value.
 *
 * All strategy functions follow the same signature:
 *
 * @param {*} parentVal
 * @param {*} childVal
 * @param {Vue} [vm]
 */

var strats = Object.create(null)

/**
 * Helper that recursively merges two data objects together.
 */

function mergeData (to, from) {
  var key, toVal, fromVal
  for (key in from) {
    toVal = to[key]
    fromVal = from[key]
    if (!to.hasOwnProperty(key)) {
      to.$add(key, fromVal)
    } else if (_.isObject(toVal) && _.isObject(fromVal)) {
      mergeData(toVal, fromVal)
    }
  }
  return to
}

/**
 * Data
 */

strats.data = function (parentVal, childVal, vm) {
  if (!vm) {
    // in a Vue.extend merge, both should be functions
    if (!childVal) {
      return parentVal
    }
    if (typeof childVal !== 'function') {
      _.warn(
        'The "data" option should be a function ' +
        'that returns a per-instance value in component ' +
        'definitions.'
      )
      return parentVal
    }
    if (!parentVal) {
      return childVal
    }
    // when parentVal & childVal are both present,
    // we need to return a function that returns the
    // merged result of both functions... no need to
    // check if parentVal is a function here because
    // it has to be a function to pass previous merges.
    return function mergedDataFn () {
      return mergeData(
        childVal.call(this),
        parentVal.call(this)
      )
    }
  } else {
    // instance merge, return raw object
    var instanceData = typeof childVal === 'function'
      ? childVal.call(vm)
      : childVal
    var defaultData = typeof parentVal === 'function'
      ? parentVal.call(vm)
      : undefined
    if (instanceData) {
      return mergeData(instanceData, defaultData)
    } else {
      return defaultData
    }
  }
}

/**
 * El
 */

strats.el = function (parentVal, childVal, vm) {
  if (!vm && childVal && typeof childVal !== 'function') {
    _.warn(
      'The "el" option should be a function ' +
      'that returns a per-instance value in component ' +
      'definitions.'
    )
    return
  }
  var ret = childVal || parentVal
  // invoke the element factory if this is instance merge
  return vm && typeof ret === 'function'
    ? ret.call(vm)
    : ret
}

/**
 * Hooks and param attributes are merged as arrays.
 */

strats.created =
strats.ready =
strats.attached =
strats.detached =
strats.beforeCompile =
strats.compiled =
strats.beforeDestroy =
strats.destroyed =
strats.paramAttributes = function (parentVal, childVal) {
  return childVal
    ? parentVal
      ? parentVal.concat(childVal)
      : _.isArray(childVal)
        ? childVal
        : [childVal]
    : parentVal
}

/**
 * Assets
 *
 * When a vm is present (instance creation), we need to do
 * a three-way merge between constructor options, instance
 * options and parent options.
 */

strats.directives =
strats.filters =
strats.partials =
strats.transitions =
strats.components = function (parentVal, childVal, vm, key) {
  var ret = Object.create(
    vm && vm.$parent
      ? vm.$parent.$options[key]
      : _.Vue.options[key]
  )
  if (parentVal) {
    var keys = Object.keys(parentVal)
    var i = keys.length
    var field
    while (i--) {
      field = keys[i]
      ret[field] = parentVal[field]
    }
  }
  if (childVal) extend(ret, childVal)
  return ret
}

/**
 * Events & Watchers.
 *
 * Events & watchers hashes should not overwrite one
 * another, so we merge them as arrays.
 */

strats.watch =
strats.events = function (parentVal, childVal) {
  if (!childVal) return parentVal
  if (!parentVal) return childVal
  var ret = {}
  extend(ret, parentVal)
  for (var key in childVal) {
    var parent = ret[key]
    var child = childVal[key]
    if (parent && !_.isArray(parent)) {
      parent = [parent]
    }
    ret[key] = parent
      ? parent.concat(child)
      : [child]
  }
  return ret
}

/**
 * Other object hashes.
 */

strats.methods =
strats.computed = function (parentVal, childVal) {
  if (!childVal) return parentVal
  if (!parentVal) return childVal
  var ret = Object.create(parentVal)
  extend(ret, childVal)
  return ret
}

/**
 * Default strategy.
 */

var defaultStrat = function (parentVal, childVal) {
  return childVal === undefined
    ? parentVal
    : childVal
}

/**
 * Make sure component options get converted to actual
 * constructors.
 *
 * @param {Object} components
 */

function guardComponents (components) {
  if (components) {
    var def
    for (var key in components) {
      def = components[key]
      if (_.isPlainObject(def)) {
        def.name = key
        components[key] = _.Vue.extend(def)
      }
    }
  }
}

/**
 * Merge two option objects into a new one.
 * Core utility used in both instantiation and inheritance.
 *
 * @param {Object} parent
 * @param {Object} child
 * @param {Vue} [vm] - if vm is present, indicates this is
 *                     an instantiation merge.
 */

module.exports = function mergeOptions (parent, child, vm) {
  guardComponents(child.components)
  var options = {}
  var key
  if (child.mixins) {
    for (var i = 0, l = child.mixins.length; i < l; i++) {
      parent = mergeOptions(parent, child.mixins[i], vm)
    }
  }
  for (key in parent) {
    merge(key)
  }
  for (key in child) {
    if (!(parent.hasOwnProperty(key))) {
      merge(key)
    }
  }
  function merge (key) {
    var strat = strats[key] || defaultStrat
    options[key] = strat(parent[key], child[key], vm, key)
  }
  return options
}
},{"./index":67}],70:[function(require,module,exports){
var _ = require('./util')
var extend = _.extend

/**
 * The exposed Vue constructor.
 *
 * API conventions:
 * - public API methods/properties are prefiexed with `$`
 * - internal methods/properties are prefixed with `_`
 * - non-prefixed properties are assumed to be proxied user
 *   data.
 *
 * @constructor
 * @param {Object} [options]
 * @public
 */

function Vue (options) {
  this._init(options)
}

/**
 * Mixin global API
 */

extend(Vue, require('./api/global'))

/**
 * Vue and every constructor that extends Vue has an
 * associated options object, which can be accessed during
 * compilation steps as `this.constructor.options`.
 *
 * These can be seen as the default options of every
 * Vue instance.
 */

Vue.options = {
  directives  : require('./directives'),
  filters     : require('./filters'),
  partials    : {},
  transitions : {},
  components  : {}
}

/**
 * Build up the prototype
 */

var p = Vue.prototype

/**
 * $data has a setter which does a bunch of
 * teardown/setup work
 */

Object.defineProperty(p, '$data', {
  get: function () {
    return this._data
  },
  set: function (newData) {
    this._setData(newData)
  }
})

/**
 * Mixin internal instance methods
 */

extend(p, require('./instance/init'))
extend(p, require('./instance/events'))
extend(p, require('./instance/scope'))
extend(p, require('./instance/compile'))

/**
 * Mixin public API methods
 */

extend(p, require('./api/data'))
extend(p, require('./api/dom'))
extend(p, require('./api/events'))
extend(p, require('./api/child'))
extend(p, require('./api/lifecycle'))

module.exports = _.Vue = Vue
},{"./api/child":10,"./api/data":11,"./api/dom":12,"./api/events":13,"./api/global":14,"./api/lifecycle":15,"./directives":30,"./filters":46,"./instance/compile":47,"./instance/events":48,"./instance/init":49,"./instance/scope":50,"./util":67}],71:[function(require,module,exports){
var _ = require('./util')
var config = require('./config')
var Observer = require('./observer')
var expParser = require('./parsers/expression')
var batcher = require('./batcher')
var uid = 0

/**
 * A watcher parses an expression, collects dependencies,
 * and fires callback when the expression value changes.
 * This is used for both the $watch() api and directives.
 *
 * @param {Vue} vm
 * @param {String} expression
 * @param {Function} cb
 * @param {Object} options
 *                 - {Array} filters
 *                 - {Boolean} twoWay
 *                 - {Boolean} deep
 *                 - {Boolean} user
 * @constructor
 */

function Watcher (vm, expression, cb, options) {
  this.vm = vm
  vm._watcherList.push(this)
  this.expression = expression
  this.cbs = [cb]
  this.id = ++uid // uid for batching
  this.active = true
  options = options || {}
  this.deep = !!options.deep
  this.user = !!options.user
  this.deps = Object.create(null)
  // setup filters if any.
  // We delegate directive filters here to the watcher
  // because they need to be included in the dependency
  // collection process.
  if (options.filters) {
    this.readFilters = options.filters.read
    this.writeFilters = options.filters.write
  }
  // parse expression for getter/setter
  var res = expParser.parse(expression, options.twoWay)
  this.getter = res.get
  this.setter = res.set
  this.value = this.get()
}

var p = Watcher.prototype

/**
 * Add a dependency to this directive.
 *
 * @param {Dep} dep
 */

p.addDep = function (dep) {
  var id = dep.id
  if (!this.newDeps[id]) {
    this.newDeps[id] = dep
    if (!this.deps[id]) {
      this.deps[id] = dep
      dep.addSub(this)
    }
  }
}

/**
 * Evaluate the getter, and re-collect dependencies.
 */

p.get = function () {
  this.beforeGet()
  var vm = this.vm
  var value
  try {
    value = this.getter.call(vm, vm)
  } catch (e) {
    if (config.warnExpressionErrors) {
      _.warn(
        'Error when evaluating expression "' +
        this.expression + '":\n   ' + e
      )
    }
  }
  // "touch" every property so they are all tracked as
  // dependencies for deep watching
  if (this.deep) {
    traverse(value)
  }
  value = _.applyFilters(value, this.readFilters, vm)
  this.afterGet()
  return value
}

/**
 * Set the corresponding value with the setter.
 *
 * @param {*} value
 */

p.set = function (value) {
  var vm = this.vm
  value = _.applyFilters(
    value, this.writeFilters, vm, this.value
  )
  try {
    this.setter.call(vm, vm, value)
  } catch (e) {
    if (config.warnExpressionErrors) {
      _.warn(
        'Error when evaluating setter "' +
        this.expression + '":\n   ' + e
      )
    }
  }
}

/**
 * Prepare for dependency collection.
 */

p.beforeGet = function () {
  Observer.target = this
  this.newDeps = {}
}

/**
 * Clean up for dependency collection.
 */

p.afterGet = function () {
  Observer.target = null
  for (var id in this.deps) {
    if (!this.newDeps[id]) {
      this.deps[id].removeSub(this)
    }
  }
  this.deps = this.newDeps
}

/**
 * Subscriber interface.
 * Will be called when a dependency changes.
 */

p.update = function () {
  if (!config.async || config.debug) {
    this.run()
  } else {
    batcher.push(this)
  }
}

/**
 * Batcher job interface.
 * Will be called by the batcher.
 */

p.run = function () {
  if (this.active) {
    var value = this.get()
    if (
      value !== this.value ||
      Array.isArray(value) ||
      this.deep
    ) {
      var oldValue = this.value
      this.value = value
      var cbs = this.cbs
      for (var i = 0, l = cbs.length; i < l; i++) {
        cbs[i](value, oldValue)
        // if a callback also removed other callbacks,
        // we need to adjust the loop accordingly.
        var removed = l - cbs.length
        if (removed) {
          i -= removed
          l -= removed
        }
      }
    }
  }
}

/**
 * Add a callback.
 *
 * @param {Function} cb
 */

p.addCb = function (cb) {
  this.cbs.push(cb)
}

/**
 * Remove a callback.
 *
 * @param {Function} cb
 */

p.removeCb = function (cb) {
  var cbs = this.cbs
  if (cbs.length > 1) {
    var i = cbs.indexOf(cb)
    if (i > -1) {
      cbs.splice(i, 1)
    }
  } else if (cb === cbs[0]) {
    this.teardown()
  }
}

/**
 * Remove self from all dependencies' subcriber list.
 */

p.teardown = function () {
  if (this.active) {
    // remove self from vm's watcher list
    // we can skip this if the vm if being destroyed
    // which can improve teardown performance.
    if (!this.vm._isBeingDestroyed) {
      var list = this.vm._watcherList
      var i = list.indexOf(this)
      if (i > -1) {
        list.splice(i, 1)
      }
    }
    for (var id in this.deps) {
      this.deps[id].removeSub(this)
    }
    this.active = false
    this.vm = this.cbs = this.value = null
  }
}


/**
 * Recrusively traverse an object to evoke all converted
 * getters, so that every nested property inside the object
 * is collected as a "deep" dependency.
 *
 * @param {Object} obj
 */

function traverse (obj) {
  var key, val, i
  for (key in obj) {
    val = obj[key]
    if (_.isArray(val)) {
      i = val.length
      while (i--) traverse(val[i])
    } else if (_.isObject(val)) {
      traverse(val)
    }
  }
}

module.exports = Watcher
},{"./batcher":16,"./config":20,"./observer":53,"./parsers/expression":56,"./util":67}],72:[function(require,module,exports){
var Vue = require('vue')

var app = new Vue(require('./app'))

app.$mount(document.body)

},{"./app":2,"vue":70}]},{},[72])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJkYXNoYm9hcmQvYXBwLmh0bWwiLCJkYXNoYm9hcmQvYXBwLmpzIiwiZGFzaGJvYXJkL2ZpcmViYXNlLmpzIiwiZGFzaGJvYXJkL3ZpZXdzL2Rhc2hib2FyZC9kYXNoYm9hcmQuaHRtbCIsImRhc2hib2FyZC92aWV3cy9kYXNoYm9hcmQvZmlyZWJhc2UtZXZlbnRzLmpzIiwiZGFzaGJvYXJkL3ZpZXdzL2Rhc2hib2FyZC9pbmRleC5qcyIsImRhc2hib2FyZC92aWV3cy9sb2dpbi9pbmRleC5qcyIsImRhc2hib2FyZC92aWV3cy9sb2dpbi9sb2dpbi5odG1sIiwibm9kZV9tb2R1bGVzL2ZpcmViYXNlL2xpYi9maXJlYmFzZS13ZWIuanMiLCJub2RlX21vZHVsZXMvdnVlL3NyYy9hcGkvY2hpbGQuanMiLCJub2RlX21vZHVsZXMvdnVlL3NyYy9hcGkvZGF0YS5qcyIsIm5vZGVfbW9kdWxlcy92dWUvc3JjL2FwaS9kb20uanMiLCJub2RlX21vZHVsZXMvdnVlL3NyYy9hcGkvZXZlbnRzLmpzIiwibm9kZV9tb2R1bGVzL3Z1ZS9zcmMvYXBpL2dsb2JhbC5qcyIsIm5vZGVfbW9kdWxlcy92dWUvc3JjL2FwaS9saWZlY3ljbGUuanMiLCJub2RlX21vZHVsZXMvdnVlL3NyYy9iYXRjaGVyLmpzIiwibm9kZV9tb2R1bGVzL3Z1ZS9zcmMvY2FjaGUuanMiLCJub2RlX21vZHVsZXMvdnVlL3NyYy9jb21waWxlci9jb21waWxlLmpzIiwibm9kZV9tb2R1bGVzL3Z1ZS9zcmMvY29tcGlsZXIvdHJhbnNjbHVkZS5qcyIsIm5vZGVfbW9kdWxlcy92dWUvc3JjL2NvbmZpZy5qcyIsIm5vZGVfbW9kdWxlcy92dWUvc3JjL2RpcmVjdGl2ZS5qcyIsIm5vZGVfbW9kdWxlcy92dWUvc3JjL2RpcmVjdGl2ZXMvYXR0ci5qcyIsIm5vZGVfbW9kdWxlcy92dWUvc3JjL2RpcmVjdGl2ZXMvY2xhc3MuanMiLCJub2RlX21vZHVsZXMvdnVlL3NyYy9kaXJlY3RpdmVzL2Nsb2FrLmpzIiwibm9kZV9tb2R1bGVzL3Z1ZS9zcmMvZGlyZWN0aXZlcy9jb21wb25lbnQuanMiLCJub2RlX21vZHVsZXMvdnVlL3NyYy9kaXJlY3RpdmVzL2VsLmpzIiwibm9kZV9tb2R1bGVzL3Z1ZS9zcmMvZGlyZWN0aXZlcy9ldmVudHMuanMiLCJub2RlX21vZHVsZXMvdnVlL3NyYy9kaXJlY3RpdmVzL2h0bWwuanMiLCJub2RlX21vZHVsZXMvdnVlL3NyYy9kaXJlY3RpdmVzL2lmLmpzIiwibm9kZV9tb2R1bGVzL3Z1ZS9zcmMvZGlyZWN0aXZlcy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy92dWUvc3JjL2RpcmVjdGl2ZXMvbW9kZWwvY2hlY2tib3guanMiLCJub2RlX21vZHVsZXMvdnVlL3NyYy9kaXJlY3RpdmVzL21vZGVsL2RlZmF1bHQuanMiLCJub2RlX21vZHVsZXMvdnVlL3NyYy9kaXJlY3RpdmVzL21vZGVsL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3Z1ZS9zcmMvZGlyZWN0aXZlcy9tb2RlbC9yYWRpby5qcyIsIm5vZGVfbW9kdWxlcy92dWUvc3JjL2RpcmVjdGl2ZXMvbW9kZWwvc2VsZWN0LmpzIiwibm9kZV9tb2R1bGVzL3Z1ZS9zcmMvZGlyZWN0aXZlcy9vbi5qcyIsIm5vZGVfbW9kdWxlcy92dWUvc3JjL2RpcmVjdGl2ZXMvcGFydGlhbC5qcyIsIm5vZGVfbW9kdWxlcy92dWUvc3JjL2RpcmVjdGl2ZXMvcmVmLmpzIiwibm9kZV9tb2R1bGVzL3Z1ZS9zcmMvZGlyZWN0aXZlcy9yZXBlYXQuanMiLCJub2RlX21vZHVsZXMvdnVlL3NyYy9kaXJlY3RpdmVzL3Nob3cuanMiLCJub2RlX21vZHVsZXMvdnVlL3NyYy9kaXJlY3RpdmVzL3N0eWxlLmpzIiwibm9kZV9tb2R1bGVzL3Z1ZS9zcmMvZGlyZWN0aXZlcy90ZXh0LmpzIiwibm9kZV9tb2R1bGVzL3Z1ZS9zcmMvZGlyZWN0aXZlcy90cmFuc2l0aW9uLmpzIiwibm9kZV9tb2R1bGVzL3Z1ZS9zcmMvZGlyZWN0aXZlcy93aXRoLmpzIiwibm9kZV9tb2R1bGVzL3Z1ZS9zcmMvZmlsdGVycy9hcnJheS1maWx0ZXJzLmpzIiwibm9kZV9tb2R1bGVzL3Z1ZS9zcmMvZmlsdGVycy9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy92dWUvc3JjL2luc3RhbmNlL2NvbXBpbGUuanMiLCJub2RlX21vZHVsZXMvdnVlL3NyYy9pbnN0YW5jZS9ldmVudHMuanMiLCJub2RlX21vZHVsZXMvdnVlL3NyYy9pbnN0YW5jZS9pbml0LmpzIiwibm9kZV9tb2R1bGVzL3Z1ZS9zcmMvaW5zdGFuY2Uvc2NvcGUuanMiLCJub2RlX21vZHVsZXMvdnVlL3NyYy9vYnNlcnZlci9hcnJheS5qcyIsIm5vZGVfbW9kdWxlcy92dWUvc3JjL29ic2VydmVyL2RlcC5qcyIsIm5vZGVfbW9kdWxlcy92dWUvc3JjL29ic2VydmVyL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3Z1ZS9zcmMvb2JzZXJ2ZXIvb2JqZWN0LmpzIiwibm9kZV9tb2R1bGVzL3Z1ZS9zcmMvcGFyc2Vycy9kaXJlY3RpdmUuanMiLCJub2RlX21vZHVsZXMvdnVlL3NyYy9wYXJzZXJzL2V4cHJlc3Npb24uanMiLCJub2RlX21vZHVsZXMvdnVlL3NyYy9wYXJzZXJzL3BhdGguanMiLCJub2RlX21vZHVsZXMvdnVlL3NyYy9wYXJzZXJzL3RlbXBsYXRlLmpzIiwibm9kZV9tb2R1bGVzL3Z1ZS9zcmMvcGFyc2Vycy90ZXh0LmpzIiwibm9kZV9tb2R1bGVzL3Z1ZS9zcmMvdHJhbnNpdGlvbi9jc3MuanMiLCJub2RlX21vZHVsZXMvdnVlL3NyYy90cmFuc2l0aW9uL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3Z1ZS9zcmMvdHJhbnNpdGlvbi9qcy5qcyIsIm5vZGVfbW9kdWxlcy92dWUvc3JjL3V0aWwvZGVidWcuanMiLCJub2RlX21vZHVsZXMvdnVlL3NyYy91dGlsL2RvbS5qcyIsIm5vZGVfbW9kdWxlcy92dWUvc3JjL3V0aWwvZW52LmpzIiwibm9kZV9tb2R1bGVzL3Z1ZS9zcmMvdXRpbC9maWx0ZXIuanMiLCJub2RlX21vZHVsZXMvdnVlL3NyYy91dGlsL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3Z1ZS9zcmMvdXRpbC9sYW5nLmpzIiwibm9kZV9tb2R1bGVzL3Z1ZS9zcmMvdXRpbC9tZXJnZS1vcHRpb24uanMiLCJub2RlX21vZHVsZXMvdnVlL3NyYy92dWUuanMiLCJub2RlX21vZHVsZXMvdnVlL3NyYy93YXRjaGVyLmpzIiwiZGFzaGJvYXJkL2luZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7O0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pCQTtBQUNBO0FBQ0E7QUFDQTs7QUNIQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4UUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsTkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9HQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzb0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9OQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNYQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25KQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4aEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNkQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcktBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6SUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM09BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOVBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4U0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuUUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaE5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDalFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuUUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIm1vZHVsZS5leHBvcnRzID0gJzxkaXYgdi1jb21wb25lbnQ9XCJ7eyB2aWV3IH19XCI+PC9kaXY+XFxuJzsiLCJ2YXIgZmlyZWJhc2UgPSByZXF1aXJlKCcuL2ZpcmViYXNlJylcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdHRlbXBsYXRlOiByZXF1aXJlKCcuL2FwcC5odG1sJyksXG5cdGNvbXBvbmVudHM6IHtcblx0XHRsb2dpbjogcmVxdWlyZSgnLi92aWV3cy9sb2dpbicpLFxuXHRcdGRhc2hib2FyZDogcmVxdWlyZSgnLi92aWV3cy9kYXNoYm9hcmQnKVxuXHR9LFxuXHRkYXRhOiB7XG5cdFx0dmlldzogbnVsbFxuXHR9LFxuXHRjcmVhdGVkOiBmdW5jdGlvbiAoKSB7XG5cdFx0ZmlyZWJhc2Uub25BdXRoKGZ1bmN0aW9uIChhdXRoRGF0YSkge1xuXHRcdFx0dGhpcy52aWV3ID0gYXV0aERhdGEgPyAnZGFzaGJvYXJkJyA6ICdsb2dpbidcblx0XHR9LCB0aGlzKVxuXHR9XG59XG4iLCJ2YXIgRmlyZWJhc2UgPSByZXF1aXJlKCdmaXJlYmFzZScpXG5cbm1vZHVsZS5leHBvcnRzID0gbmV3IEZpcmViYXNlKCdodHRwczovL3dlYmhvb2tzLmZpcmViYXNlaW8uY29tJylcbiIsIm1vZHVsZS5leHBvcnRzID0gJzxkaXYgY2xhc3M9XCJjb250YWluZXJcIj5cXG5cdDxkaXYgY2xhc3M9XCJwYW5lbCBwYW5lbC1kZWZhdWx0XCI+XFxuXHRcdDxkaXYgY2xhc3M9XCJwYW5lbC1oZWFkaW5nXCI+XFxuXHRcdFx0PGgzIGNsYXNzPVwicGFuZWwtdGl0bGVcIj5BZGQgYSB3ZWJob29rPC9oMz5cXG5cdFx0PC9kaXY+XFxuXHRcdDxkaXYgY2xhc3M9XCJwYW5lbC1ib2R5XCI+XFxuXHRcdFx0PGZvcm0gdi1vbj1cInN1Ym1pdDogYWRkKCRldmVudClcIiBjbGFzcz1cImZvcm0taW5saW5lXCI+XFxuXHRcdFx0XHQ8c2FtcD5uZXcgRmlyZWJhc2UoXCI8L3NhbXA+XFxuXHRcdFx0XHQ8aW5wdXQgdi1tb2RlbD1cInJlZlwiIHR5cGU9XCJ0ZXh0XCIgY2xhc3M9XCJmb3JtLWNvbnRyb2wgaW5wdXQtc21cIiBwbGFjZWhvbGRlcj1cImh0dHBzOi8vZXhhbXBsZS5maXJlYmFzZWlvLmNvbS9cIiByZXF1aXJlZD5cXG5cdFx0XHRcdDxzYW1wPlwiKS5hdXRoKFwiPC9zYW1wPlxcblx0XHRcdFx0PGlucHV0IHYtbW9kZWw9XCJ0b2tlblwiIHR5cGU9XCJ0ZXh0XCIgY2xhc3M9XCJmb3JtLWNvbnRyb2wgaW5wdXQtc21cIiBwbGFjZWhvbGRlcj1cInRva2VuIG9yIHNlY3JldFwiPlxcblx0XHRcdFx0PHNhbXA+XCIpLm9uKFwiPC9zYW1wPlxcblx0XHRcdFx0PHNlbGVjdCB2LW1vZGVsPVwiZXZlbnRcIiBvcHRpb25zPVwiZXZlbnRzXCIgY2xhc3M9XCJmb3JtLWNvbnRyb2wgaW5wdXQtc21cIiByZXF1aXJlZD48L3NlbGVjdD5cXG5cdFx0XHRcdDxzYW1wPlwiKTwvc2FtcD5cXG5cdFx0XHRcdDxzcGFuIGNsYXNzPVwiZ2x5cGhpY29uIGdseXBoaWNvbi1jaGV2cm9uLXJpZ2h0XCI+PC9zcGFuPlxcblx0XHRcdFx0PGlucHV0IHYtbW9kZWw9XCJ1cmxcIiB0eXBlPVwidGV4dFwiIGNsYXNzPVwiZm9ybS1jb250cm9sIGlucHV0LXNtXCIgcGxhY2Vob2xkZXI9XCJodHRwczovL2V4YW1wbGUuY29tL2hvb2tzL2ZpcmViYXNlXCIgcmVxdWlyZWQ+XFxuXHRcdFx0XHQ8YnV0dG9uIHR5cGU9XCJzdWJtaXRcIiBjbGFzcz1cImJ0biBidG4tc20gYnRuLXByaW1hcnlcIj5TYXZlPC9idXR0b24+XFxuXHRcdFx0PC9mb3JtPlxcblx0XHQ8L2Rpdj5cXG5cdDwvZGl2Plxcblxcblx0PGRpdiB2LXJlcGVhdD1cImhvb2s6IGhvb2tzXCIgY2xhc3M9XCJwYW5lbCBwYW5lbC1kZWZhdWx0XCI+XFxuXHRcdDxkaXYgY2xhc3M9XCJwYW5lbC1ib2R5XCI+XFxuXHRcdFx0PGJ1dHRvbiB2LW9uPVwiY2xpY2s6IHJlbW92ZSgkZXZlbnQsIGhvb2suaWQpXCIgdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiY2xvc2VcIj4mdGltZXM7PC9idXR0b24+XFxuXFxuXHRcdFx0PHNwYW4gdi1pZj1cIiFob29rLmxhc3RfY2FsbFwiIGNsYXNzPVwidGV4dC1tdXRlZCBnbHlwaGljb24gZ2x5cGhpY29uLXRpbWVcIj48L3NwYW4+XFxuXHRcdFx0PHNwYW4gdi1pZj1cImhvb2subGFzdF9zdGF0dXMgPj0gMjAwICYmIGhvb2subGFzdF9zdGF0dXMgPD0gMjk5XCIgY2xhc3M9XCJ0ZXh0LXN1Y2Nlc3MgZ2x5cGhpY29uIGdseXBoaWNvbi1vay1zaWduXCI+PC9zcGFuPlxcblx0XHRcdDxzcGFuIHYtaWY9XCJob29rLmxhc3Rfc3RhdHVzIDwgMjAwIHx8IGhvb2subGFzdF9zdGF0dXMgPiAyOTlcIiBjbGFzcz1cInRleHQtZGFuZ2VyIGdseXBoaWNvbiBnbHlwaGljb24tZXhjbGFtYXRpb24tc2lnblwiPjwvc3Bhbj5cXG5cXG5cdFx0XHQ8c2FtcD5uZXcgRmlyZWJhc2UoXCJ7eyBob29rLnJlZiB9fVwiKS5vbihcInt7IGhvb2suZXZlbnQgfX1cIik8L3NhbXA+XFxuXHRcdFx0PHNwYW4gY2xhc3M9XCJnbHlwaGljb24gZ2x5cGhpY29uLWNoZXZyb24tcmlnaHRcIj48L3NwYW4+XFxuXHRcdFx0PHNhbXA+e3sgaG9vay51cmwgfX08L3NhbXA+XFxuXHRcdDwvZGl2Plxcblx0PC9kaXY+XFxuPC9kaXY+XFxuJzsiLCJtb2R1bGUuZXhwb3J0cyA9IFtcblx0J3ZhbHVlJyxcblx0J2NoaWxkX2FkZGVkJyxcblx0J2NoaWxkX2NoYW5nZWQnLFxuXHQnY2hpbGRfcmVtb3ZlZCcsXG5cdCdjaGlsZF9tb3ZlZCdcbl1cbiIsInZhciBGaXJlYmFzZSA9IHJlcXVpcmUoJ2ZpcmViYXNlJylcbnZhciBmaXJlYmFzZSA9IHJlcXVpcmUoJy4uLy4uL2ZpcmViYXNlJylcblxudmFyIGV2ZW50cyA9IHJlcXVpcmUoJy4vZmlyZWJhc2UtZXZlbnRzJylcblxuZnVuY3Rpb24gaG9va3NSZWYgKCkge1xuXHR2YXIgYXV0aCA9IGZpcmViYXNlLmdldEF1dGgoKVxuXHRyZXR1cm4gZmlyZWJhc2UuY2hpbGQoJ2hvb2tzJykuY2hpbGQoYXV0aC51aWQpXG59XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXHR0ZW1wbGF0ZTogcmVxdWlyZSgnLi9kYXNoYm9hcmQuaHRtbCcpLFxuXHRkYXRhOiBmdW5jdGlvbiAoKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGhvb2tzOiBudWxsLFxuXHRcdFx0ZXZlbnRzOiBldmVudHMsXG5cdFx0XHQvLyBpbml0IGZvcm0gZmllbGRzXG5cdFx0XHRyZWY6IG51bGwsXG5cdFx0XHR0b2tlbjogbnVsbCxcblx0XHRcdGV2ZW50OiBldmVudHNbMF0sXG5cdFx0XHR1cmw6IG51bGxcblx0XHR9XG5cdH0sXG5cdG1ldGhvZHM6IHtcblx0XHRhZGQ6IGZ1bmN0aW9uIChldmVudCkge1xuXHRcdFx0Ly8gVE9ETzogdGVzdCBpbnB1dCBvbiBsaXZlIGBuZXcgRmlyZWJhc2UoKWAgY2FsbCB0byB2YWxpZGF0ZVxuXHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKVxuXG5cdFx0XHRob29rc1JlZigpLnB1c2goe1xuXHRcdFx0XHRyZWY6IHRoaXMucmVmLFxuXHRcdFx0XHR0b2tlbjogdGhpcy50b2tlbiAmJiB0aGlzLnRva2VuICE9PSAnJyA/IHRoaXMudG9rZW4gOiBudWxsLFxuXHRcdFx0XHRldmVudDogdGhpcy5ldmVudCxcblx0XHRcdFx0dXJsOiB0aGlzLnVybCxcblx0XHRcdFx0Y3JlYXRlZF9hdDogRmlyZWJhc2UuU2VydmVyVmFsdWUuVElNRVNUQU1QXG5cdFx0XHR9LCBmdW5jdGlvbiAoZXJyKSB7XG5cdFx0XHRcdGlmIChlcnIpIGNvbnNvbGUuZXJyb3IoJ0NvdWxkIG5vdCBhZGQgaG9vazonLCBlcnIpXG5cdFx0XHR9KVxuXG5cdFx0XHR0aGlzLnJlZiA9IG51bGxcblx0XHRcdHRoaXMudG9rZW4gPSBudWxsXG5cdFx0XHR0aGlzLnVybCA9IG51bGxcblx0XHR9LFxuXHRcdHJlbW92ZTogZnVuY3Rpb24gKGV2ZW50LCByZWYpIHtcblx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KClcblxuXHRcdFx0bmV3IEZpcmViYXNlKHJlZikucmVtb3ZlKGZ1bmN0aW9uIChlcnIpIHtcblx0XHRcdFx0aWYgKGVycikgY29uc29sZS5lcnJvcignQ291bGQgbm90IHJlbW92ZSBob29rOicsIGVycilcblx0XHRcdH0pXG5cdFx0fVxuXHR9LFxuXHRjcmVhdGVkOiBmdW5jdGlvbiAoKSB7XG5cdFx0dmFyIGF1dGggPSBmaXJlYmFzZS5nZXRBdXRoKClcblxuXHRcdGhvb2tzUmVmKCkub24oJ3ZhbHVlJywgZnVuY3Rpb24gKHNuYXBzaG90KSB7XG5cdFx0XHR2YXIgaG9va3MgPSBbXVxuXG5cdFx0XHRzbmFwc2hvdC5mb3JFYWNoKGZ1bmN0aW9uIChob29rKSB7XG5cdFx0XHRcdHZhciB2YWwgPSBob29rLnZhbCgpXG5cblx0XHRcdFx0aG9va3MucHVzaCh7XG5cdFx0XHRcdFx0aWQ6IGhvb2sucmVmKCkudG9TdHJpbmcoKSxcblx0XHRcdFx0XHRyZWY6IHZhbC5yZWYsXG5cdFx0XHRcdFx0ZXZlbnQ6IHZhbC5ldmVudCxcblx0XHRcdFx0XHR1cmw6IHZhbC51cmwsXG5cdFx0XHRcdFx0bGFzdF9jYWxsOiB2YWwuY2FsbGVkX2F0LFxuXHRcdFx0XHRcdGxhc3Rfc3RhdHVzOiB2YWwucmVzcG9uc2Vfc3RhdHVzXG5cdFx0XHRcdH0pXG5cdFx0XHR9KVxuXG5cdFx0XHR0aGlzLmhvb2tzID0gaG9va3Ncblx0XHR9LCBmdW5jdGlvbiAoZXJyKSB7XG5cdFx0XHRjb25zb2xlLmVycm9yKCdDb3VsZCBub3QgZ2V0IGhvb2tzOicsIGVycilcblx0XHR9LCB0aGlzKVxuXHR9XG59XG4iLCJ2YXIgZmlyZWJhc2UgPSByZXF1aXJlKCcuLi8uLi9maXJlYmFzZScpXG5cbi8vIFRPRE86IHN0b3JlIGxvZ2luc1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblx0dGVtcGxhdGU6IHJlcXVpcmUoJy4vbG9naW4uaHRtbCcpLFxuXHRtZXRob2RzOiB7XG5cdFx0bG9naW46IGZ1bmN0aW9uIChldmVudCkge1xuXHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKVxuXG5cdFx0XHRmaXJlYmFzZS5hdXRoV2l0aE9BdXRoUG9wdXAoJ2dpdGh1YicsIGZ1bmN0aW9uIChlcnIsIGF1dGhEYXRhKSB7XG5cdFx0XHRcdGlmIChlcnIpIHtcblx0XHRcdFx0XHRjb25zb2xlLmxvZygnTG9naW4gZmFpbGVkOicsIGVycilcblx0XHRcdFx0XHRhbGVydCgnTG9naW4gZmFpbGVkLlxcblxcbicgKyBlcnIubWVzc2FnZSlcblx0XHRcdFx0fVxuXHRcdFx0fSlcblx0XHR9XG5cdH1cbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gJzxkaXYgY2xhc3M9XCJjb250YWluZXJcIj5cXG5cdDxkaXYgY2xhc3M9XCJyb3dcIj5cXG5cdFx0PGRpdiBjbGFzcz1cImNvbC1tZC02IGNvbC1tZC1vZmZzZXQtM1wiPlxcblx0XHRcdDxkaXYgY2xhc3M9XCJqdW1ib3Ryb24gdGV4dC1jZW50ZXJcIj5cXG5cdFx0XHRcdDxoMT5XZWJob29rcyBmb3IgRmlyZWJhc2U8L2gxPlxcblx0XHRcdFx0PGJyPlxcblx0XHRcdFx0PHA+XFxuXHRcdFx0XHRcdDxidXR0b24gdi1vbj1cImNsaWNrOiBsb2dpbigkZXZlbnQpXCIgdHlwZT1cImJ1dHRvblwiIGNsYXNzPVwiYnRuIGJ0bi1sZyBidG4tcHJpbWFyeVwiPlxcblx0XHRcdFx0XHRcdExvZyBpbiB3aXRoIEdpdEh1Ylxcblx0XHRcdFx0XHQ8L2J1dHRvbj5cXG5cdFx0XHRcdDwvcD5cXG5cdFx0XHQ8L2Rpdj5cXG5cdFx0PC9kaXY+XFxuXHQ8L2Rpdj5cXG48L2Rpdj5cXG4nOyIsIi8qISBAbGljZW5zZSBGaXJlYmFzZSB2Mi4yLjVcbiAgICBMaWNlbnNlOiBodHRwczovL3d3dy5maXJlYmFzZS5jb20vdGVybXMvdGVybXMtb2Ytc2VydmljZS5odG1sICovXG4oZnVuY3Rpb24oKSB7dmFyIGgsYWE9dGhpcztmdW5jdGlvbiBuKGEpe3JldHVybiB2b2lkIDAhPT1hfWZ1bmN0aW9uIGJhKCl7fWZ1bmN0aW9uIGNhKGEpe2EudWI9ZnVuY3Rpb24oKXtyZXR1cm4gYS50Zj9hLnRmOmEudGY9bmV3IGF9fVxuZnVuY3Rpb24gZGEoYSl7dmFyIGI9dHlwZW9mIGE7aWYoXCJvYmplY3RcIj09YilpZihhKXtpZihhIGluc3RhbmNlb2YgQXJyYXkpcmV0dXJuXCJhcnJheVwiO2lmKGEgaW5zdGFuY2VvZiBPYmplY3QpcmV0dXJuIGI7dmFyIGM9T2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGEpO2lmKFwiW29iamVjdCBXaW5kb3ddXCI9PWMpcmV0dXJuXCJvYmplY3RcIjtpZihcIltvYmplY3QgQXJyYXldXCI9PWN8fFwibnVtYmVyXCI9PXR5cGVvZiBhLmxlbmd0aCYmXCJ1bmRlZmluZWRcIiE9dHlwZW9mIGEuc3BsaWNlJiZcInVuZGVmaW5lZFwiIT10eXBlb2YgYS5wcm9wZXJ0eUlzRW51bWVyYWJsZSYmIWEucHJvcGVydHlJc0VudW1lcmFibGUoXCJzcGxpY2VcIikpcmV0dXJuXCJhcnJheVwiO2lmKFwiW29iamVjdCBGdW5jdGlvbl1cIj09Y3x8XCJ1bmRlZmluZWRcIiE9dHlwZW9mIGEuY2FsbCYmXCJ1bmRlZmluZWRcIiE9dHlwZW9mIGEucHJvcGVydHlJc0VudW1lcmFibGUmJiFhLnByb3BlcnR5SXNFbnVtZXJhYmxlKFwiY2FsbFwiKSlyZXR1cm5cImZ1bmN0aW9uXCJ9ZWxzZSByZXR1cm5cIm51bGxcIjtcbmVsc2UgaWYoXCJmdW5jdGlvblwiPT1iJiZcInVuZGVmaW5lZFwiPT10eXBlb2YgYS5jYWxsKXJldHVyblwib2JqZWN0XCI7cmV0dXJuIGJ9ZnVuY3Rpb24gZWEoYSl7cmV0dXJuXCJhcnJheVwiPT1kYShhKX1mdW5jdGlvbiBmYShhKXt2YXIgYj1kYShhKTtyZXR1cm5cImFycmF5XCI9PWJ8fFwib2JqZWN0XCI9PWImJlwibnVtYmVyXCI9PXR5cGVvZiBhLmxlbmd0aH1mdW5jdGlvbiBwKGEpe3JldHVyblwic3RyaW5nXCI9PXR5cGVvZiBhfWZ1bmN0aW9uIGdhKGEpe3JldHVyblwibnVtYmVyXCI9PXR5cGVvZiBhfWZ1bmN0aW9uIGhhKGEpe3JldHVyblwiZnVuY3Rpb25cIj09ZGEoYSl9ZnVuY3Rpb24gaWEoYSl7dmFyIGI9dHlwZW9mIGE7cmV0dXJuXCJvYmplY3RcIj09YiYmbnVsbCE9YXx8XCJmdW5jdGlvblwiPT1ifWZ1bmN0aW9uIGphKGEsYixjKXtyZXR1cm4gYS5jYWxsLmFwcGx5KGEuYmluZCxhcmd1bWVudHMpfVxuZnVuY3Rpb24ga2EoYSxiLGMpe2lmKCFhKXRocm93IEVycm9yKCk7aWYoMjxhcmd1bWVudHMubGVuZ3RoKXt2YXIgZD1BcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsMik7cmV0dXJuIGZ1bmN0aW9uKCl7dmFyIGM9QXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtBcnJheS5wcm90b3R5cGUudW5zaGlmdC5hcHBseShjLGQpO3JldHVybiBhLmFwcGx5KGIsYyl9fXJldHVybiBmdW5jdGlvbigpe3JldHVybiBhLmFwcGx5KGIsYXJndW1lbnRzKX19ZnVuY3Rpb24gcShhLGIsYyl7cT1GdW5jdGlvbi5wcm90b3R5cGUuYmluZCYmLTEhPUZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kLnRvU3RyaW5nKCkuaW5kZXhPZihcIm5hdGl2ZSBjb2RlXCIpP2phOmthO3JldHVybiBxLmFwcGx5KG51bGwsYXJndW1lbnRzKX12YXIgbGE9RGF0ZS5ub3d8fGZ1bmN0aW9uKCl7cmV0dXJuK25ldyBEYXRlfTtcbmZ1bmN0aW9uIG1hKGEsYil7ZnVuY3Rpb24gYygpe31jLnByb3RvdHlwZT1iLnByb3RvdHlwZTthLlpnPWIucHJvdG90eXBlO2EucHJvdG90eXBlPW5ldyBjO2EucHJvdG90eXBlLmNvbnN0cnVjdG9yPWE7YS5WZz1mdW5jdGlvbihhLGMsZil7Zm9yKHZhciBnPUFycmF5KGFyZ3VtZW50cy5sZW5ndGgtMiksaz0yO2s8YXJndW1lbnRzLmxlbmd0aDtrKyspZ1trLTJdPWFyZ3VtZW50c1trXTtyZXR1cm4gYi5wcm90b3R5cGVbY10uYXBwbHkoYSxnKX19O2Z1bmN0aW9uIHIoYSxiKXtmb3IodmFyIGMgaW4gYSliLmNhbGwodm9pZCAwLGFbY10sYyxhKX1mdW5jdGlvbiBuYShhLGIpe3ZhciBjPXt9LGQ7Zm9yKGQgaW4gYSljW2RdPWIuY2FsbCh2b2lkIDAsYVtkXSxkLGEpO3JldHVybiBjfWZ1bmN0aW9uIG9hKGEsYil7Zm9yKHZhciBjIGluIGEpaWYoIWIuY2FsbCh2b2lkIDAsYVtjXSxjLGEpKXJldHVybiExO3JldHVybiEwfWZ1bmN0aW9uIHBhKGEpe3ZhciBiPTAsYztmb3IoYyBpbiBhKWIrKztyZXR1cm4gYn1mdW5jdGlvbiBxYShhKXtmb3IodmFyIGIgaW4gYSlyZXR1cm4gYn1mdW5jdGlvbiByYShhKXt2YXIgYj1bXSxjPTAsZDtmb3IoZCBpbiBhKWJbYysrXT1hW2RdO3JldHVybiBifWZ1bmN0aW9uIHNhKGEpe3ZhciBiPVtdLGM9MCxkO2ZvcihkIGluIGEpYltjKytdPWQ7cmV0dXJuIGJ9ZnVuY3Rpb24gdGEoYSxiKXtmb3IodmFyIGMgaW4gYSlpZihhW2NdPT1iKXJldHVybiEwO3JldHVybiExfVxuZnVuY3Rpb24gdWEoYSxiLGMpe2Zvcih2YXIgZCBpbiBhKWlmKGIuY2FsbChjLGFbZF0sZCxhKSlyZXR1cm4gZH1mdW5jdGlvbiB2YShhLGIpe3ZhciBjPXVhKGEsYix2b2lkIDApO3JldHVybiBjJiZhW2NdfWZ1bmN0aW9uIHdhKGEpe2Zvcih2YXIgYiBpbiBhKXJldHVybiExO3JldHVybiEwfWZ1bmN0aW9uIHhhKGEpe3ZhciBiPXt9LGM7Zm9yKGMgaW4gYSliW2NdPWFbY107cmV0dXJuIGJ9dmFyIHlhPVwiY29uc3RydWN0b3IgaGFzT3duUHJvcGVydHkgaXNQcm90b3R5cGVPZiBwcm9wZXJ0eUlzRW51bWVyYWJsZSB0b0xvY2FsZVN0cmluZyB0b1N0cmluZyB2YWx1ZU9mXCIuc3BsaXQoXCIgXCIpO1xuZnVuY3Rpb24gemEoYSxiKXtmb3IodmFyIGMsZCxlPTE7ZTxhcmd1bWVudHMubGVuZ3RoO2UrKyl7ZD1hcmd1bWVudHNbZV07Zm9yKGMgaW4gZClhW2NdPWRbY107Zm9yKHZhciBmPTA7Zjx5YS5sZW5ndGg7ZisrKWM9eWFbZl0sT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGQsYykmJihhW2NdPWRbY10pfX07ZnVuY3Rpb24gQWEoYSl7YT1TdHJpbmcoYSk7aWYoL15cXHMqJC8udGVzdChhKT8wOi9eW1xcXSw6e31cXHNcXHUyMDI4XFx1MjAyOV0qJC8udGVzdChhLnJlcGxhY2UoL1xcXFxbXCJcXFxcXFwvYmZucnR1XS9nLFwiQFwiKS5yZXBsYWNlKC9cIlteXCJcXFxcXFxuXFxyXFx1MjAyOFxcdTIwMjlcXHgwMC1cXHgwOFxceDBhLVxceDFmXSpcInx0cnVlfGZhbHNlfG51bGx8LT9cXGQrKD86XFwuXFxkKik/KD86W2VFXVsrXFwtXT9cXGQrKT8vZyxcIl1cIikucmVwbGFjZSgvKD86Xnw6fCwpKD86W1xcc1xcdTIwMjhcXHUyMDI5XSpcXFspKy9nLFwiXCIpKSl0cnl7cmV0dXJuIGV2YWwoXCIoXCIrYStcIilcIil9Y2F0Y2goYil7fXRocm93IEVycm9yKFwiSW52YWxpZCBKU09OIHN0cmluZzogXCIrYSk7fWZ1bmN0aW9uIEJhKCl7dGhpcy5QZD12b2lkIDB9XG5mdW5jdGlvbiBDYShhLGIsYyl7c3dpdGNoKHR5cGVvZiBiKXtjYXNlIFwic3RyaW5nXCI6RGEoYixjKTticmVhaztjYXNlIFwibnVtYmVyXCI6Yy5wdXNoKGlzRmluaXRlKGIpJiYhaXNOYU4oYik/YjpcIm51bGxcIik7YnJlYWs7Y2FzZSBcImJvb2xlYW5cIjpjLnB1c2goYik7YnJlYWs7Y2FzZSBcInVuZGVmaW5lZFwiOmMucHVzaChcIm51bGxcIik7YnJlYWs7Y2FzZSBcIm9iamVjdFwiOmlmKG51bGw9PWIpe2MucHVzaChcIm51bGxcIik7YnJlYWt9aWYoZWEoYikpe3ZhciBkPWIubGVuZ3RoO2MucHVzaChcIltcIik7Zm9yKHZhciBlPVwiXCIsZj0wO2Y8ZDtmKyspYy5wdXNoKGUpLGU9YltmXSxDYShhLGEuUGQ/YS5QZC5jYWxsKGIsU3RyaW5nKGYpLGUpOmUsYyksZT1cIixcIjtjLnB1c2goXCJdXCIpO2JyZWFrfWMucHVzaChcIntcIik7ZD1cIlwiO2ZvcihmIGluIGIpT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGIsZikmJihlPWJbZl0sXCJmdW5jdGlvblwiIT10eXBlb2YgZSYmKGMucHVzaChkKSxEYShmLGMpLFxuYy5wdXNoKFwiOlwiKSxDYShhLGEuUGQ/YS5QZC5jYWxsKGIsZixlKTplLGMpLGQ9XCIsXCIpKTtjLnB1c2goXCJ9XCIpO2JyZWFrO2Nhc2UgXCJmdW5jdGlvblwiOmJyZWFrO2RlZmF1bHQ6dGhyb3cgRXJyb3IoXCJVbmtub3duIHR5cGU6IFwiK3R5cGVvZiBiKTt9fXZhciBFYT17J1wiJzonXFxcXFwiJyxcIlxcXFxcIjpcIlxcXFxcXFxcXCIsXCIvXCI6XCJcXFxcL1wiLFwiXFxiXCI6XCJcXFxcYlwiLFwiXFxmXCI6XCJcXFxcZlwiLFwiXFxuXCI6XCJcXFxcblwiLFwiXFxyXCI6XCJcXFxcclwiLFwiXFx0XCI6XCJcXFxcdFwiLFwiXFx4MEJcIjpcIlxcXFx1MDAwYlwifSxGYT0vXFx1ZmZmZi8udGVzdChcIlxcdWZmZmZcIik/L1tcXFxcXFxcIlxceDAwLVxceDFmXFx4N2YtXFx1ZmZmZl0vZzovW1xcXFxcXFwiXFx4MDAtXFx4MWZcXHg3Zi1cXHhmZl0vZztcbmZ1bmN0aW9uIERhKGEsYil7Yi5wdXNoKCdcIicsYS5yZXBsYWNlKEZhLGZ1bmN0aW9uKGEpe2lmKGEgaW4gRWEpcmV0dXJuIEVhW2FdO3ZhciBiPWEuY2hhckNvZGVBdCgwKSxlPVwiXFxcXHVcIjsxNj5iP2UrPVwiMDAwXCI6MjU2PmI/ZSs9XCIwMFwiOjQwOTY+YiYmKGUrPVwiMFwiKTtyZXR1cm4gRWFbYV09ZStiLnRvU3RyaW5nKDE2KX0pLCdcIicpfTtmdW5jdGlvbiBHYSgpe3JldHVybiBNYXRoLmZsb29yKDIxNDc0ODM2NDgqTWF0aC5yYW5kb20oKSkudG9TdHJpbmcoMzYpK01hdGguYWJzKE1hdGguZmxvb3IoMjE0NzQ4MzY0OCpNYXRoLnJhbmRvbSgpKV5sYSgpKS50b1N0cmluZygzNil9O3ZhciBIYTthOnt2YXIgSWE9YWEubmF2aWdhdG9yO2lmKElhKXt2YXIgSmE9SWEudXNlckFnZW50O2lmKEphKXtIYT1KYTticmVhayBhfX1IYT1cIlwifTtmdW5jdGlvbiBLYSgpe3RoaXMuV2E9LTF9O2Z1bmN0aW9uIExhKCl7dGhpcy5XYT0tMTt0aGlzLldhPTY0O3RoaXMuUj1bXTt0aGlzLmxlPVtdO3RoaXMuVGY9W107dGhpcy5JZD1bXTt0aGlzLklkWzBdPTEyODtmb3IodmFyIGE9MTthPHRoaXMuV2E7KythKXRoaXMuSWRbYV09MDt0aGlzLmJlPXRoaXMuJGI9MDt0aGlzLnJlc2V0KCl9bWEoTGEsS2EpO0xhLnByb3RvdHlwZS5yZXNldD1mdW5jdGlvbigpe3RoaXMuUlswXT0xNzMyNTg0MTkzO3RoaXMuUlsxXT00MDIzMjMzNDE3O3RoaXMuUlsyXT0yNTYyMzgzMTAyO3RoaXMuUlszXT0yNzE3MzM4Nzg7dGhpcy5SWzRdPTMyODUzNzc1MjA7dGhpcy5iZT10aGlzLiRiPTB9O1xuZnVuY3Rpb24gTWEoYSxiLGMpe2N8fChjPTApO3ZhciBkPWEuVGY7aWYocChiKSlmb3IodmFyIGU9MDsxNj5lO2UrKylkW2VdPWIuY2hhckNvZGVBdChjKTw8MjR8Yi5jaGFyQ29kZUF0KGMrMSk8PDE2fGIuY2hhckNvZGVBdChjKzIpPDw4fGIuY2hhckNvZGVBdChjKzMpLGMrPTQ7ZWxzZSBmb3IoZT0wOzE2PmU7ZSsrKWRbZV09YltjXTw8MjR8YltjKzFdPDwxNnxiW2MrMl08PDh8YltjKzNdLGMrPTQ7Zm9yKGU9MTY7ODA+ZTtlKyspe3ZhciBmPWRbZS0zXV5kW2UtOF1eZFtlLTE0XV5kW2UtMTZdO2RbZV09KGY8PDF8Zj4+PjMxKSY0Mjk0OTY3Mjk1fWI9YS5SWzBdO2M9YS5SWzFdO2Zvcih2YXIgZz1hLlJbMl0saz1hLlJbM10sbD1hLlJbNF0sbSxlPTA7ODA+ZTtlKyspNDA+ZT8yMD5lPyhmPWteYyYoZ15rKSxtPTE1MTg1MDAyNDkpOihmPWNeZ15rLG09MTg1OTc3NTM5Myk6NjA+ZT8oZj1jJmd8ayYoY3xnKSxtPTI0MDA5NTk3MDgpOihmPWNeZ15rLG09MzM5NTQ2OTc4MiksZj0oYjw8XG41fGI+Pj4yNykrZitsK20rZFtlXSY0Mjk0OTY3Mjk1LGw9ayxrPWcsZz0oYzw8MzB8Yz4+PjIpJjQyOTQ5NjcyOTUsYz1iLGI9ZjthLlJbMF09YS5SWzBdK2ImNDI5NDk2NzI5NTthLlJbMV09YS5SWzFdK2MmNDI5NDk2NzI5NTthLlJbMl09YS5SWzJdK2cmNDI5NDk2NzI5NTthLlJbM109YS5SWzNdK2smNDI5NDk2NzI5NTthLlJbNF09YS5SWzRdK2wmNDI5NDk2NzI5NX1cbkxhLnByb3RvdHlwZS51cGRhdGU9ZnVuY3Rpb24oYSxiKXtpZihudWxsIT1hKXtuKGIpfHwoYj1hLmxlbmd0aCk7Zm9yKHZhciBjPWItdGhpcy5XYSxkPTAsZT10aGlzLmxlLGY9dGhpcy4kYjtkPGI7KXtpZigwPT1mKWZvcig7ZDw9YzspTWEodGhpcyxhLGQpLGQrPXRoaXMuV2E7aWYocChhKSlmb3IoO2Q8Yjspe2lmKGVbZl09YS5jaGFyQ29kZUF0KGQpLCsrZiwrK2QsZj09dGhpcy5XYSl7TWEodGhpcyxlKTtmPTA7YnJlYWt9fWVsc2UgZm9yKDtkPGI7KWlmKGVbZl09YVtkXSwrK2YsKytkLGY9PXRoaXMuV2Epe01hKHRoaXMsZSk7Zj0wO2JyZWFrfX10aGlzLiRiPWY7dGhpcy5iZSs9Yn19O3ZhciB0PUFycmF5LnByb3RvdHlwZSxOYT10LmluZGV4T2Y/ZnVuY3Rpb24oYSxiLGMpe3JldHVybiB0LmluZGV4T2YuY2FsbChhLGIsYyl9OmZ1bmN0aW9uKGEsYixjKXtjPW51bGw9PWM/MDowPmM/TWF0aC5tYXgoMCxhLmxlbmd0aCtjKTpjO2lmKHAoYSkpcmV0dXJuIHAoYikmJjE9PWIubGVuZ3RoP2EuaW5kZXhPZihiLGMpOi0xO2Zvcig7YzxhLmxlbmd0aDtjKyspaWYoYyBpbiBhJiZhW2NdPT09YilyZXR1cm4gYztyZXR1cm4tMX0sT2E9dC5mb3JFYWNoP2Z1bmN0aW9uKGEsYixjKXt0LmZvckVhY2guY2FsbChhLGIsYyl9OmZ1bmN0aW9uKGEsYixjKXtmb3IodmFyIGQ9YS5sZW5ndGgsZT1wKGEpP2Euc3BsaXQoXCJcIik6YSxmPTA7ZjxkO2YrKylmIGluIGUmJmIuY2FsbChjLGVbZl0sZixhKX0sUGE9dC5maWx0ZXI/ZnVuY3Rpb24oYSxiLGMpe3JldHVybiB0LmZpbHRlci5jYWxsKGEsYixjKX06ZnVuY3Rpb24oYSxiLGMpe2Zvcih2YXIgZD1hLmxlbmd0aCxlPVtdLGY9MCxnPXAoYSk/XG5hLnNwbGl0KFwiXCIpOmEsaz0wO2s8ZDtrKyspaWYoayBpbiBnKXt2YXIgbD1nW2tdO2IuY2FsbChjLGwsayxhKSYmKGVbZisrXT1sKX1yZXR1cm4gZX0sUWE9dC5tYXA/ZnVuY3Rpb24oYSxiLGMpe3JldHVybiB0Lm1hcC5jYWxsKGEsYixjKX06ZnVuY3Rpb24oYSxiLGMpe2Zvcih2YXIgZD1hLmxlbmd0aCxlPUFycmF5KGQpLGY9cChhKT9hLnNwbGl0KFwiXCIpOmEsZz0wO2c8ZDtnKyspZyBpbiBmJiYoZVtnXT1iLmNhbGwoYyxmW2ddLGcsYSkpO3JldHVybiBlfSxSYT10LnJlZHVjZT9mdW5jdGlvbihhLGIsYyxkKXtmb3IodmFyIGU9W10sZj0xLGc9YXJndW1lbnRzLmxlbmd0aDtmPGc7ZisrKWUucHVzaChhcmd1bWVudHNbZl0pO2QmJihlWzBdPXEoYixkKSk7cmV0dXJuIHQucmVkdWNlLmFwcGx5KGEsZSl9OmZ1bmN0aW9uKGEsYixjLGQpe3ZhciBlPWM7T2EoYSxmdW5jdGlvbihjLGcpe2U9Yi5jYWxsKGQsZSxjLGcsYSl9KTtyZXR1cm4gZX0sU2E9dC5ldmVyeT9mdW5jdGlvbihhLGIsXG5jKXtyZXR1cm4gdC5ldmVyeS5jYWxsKGEsYixjKX06ZnVuY3Rpb24oYSxiLGMpe2Zvcih2YXIgZD1hLmxlbmd0aCxlPXAoYSk/YS5zcGxpdChcIlwiKTphLGY9MDtmPGQ7ZisrKWlmKGYgaW4gZSYmIWIuY2FsbChjLGVbZl0sZixhKSlyZXR1cm4hMTtyZXR1cm4hMH07ZnVuY3Rpb24gVGEoYSxiKXt2YXIgYz1VYShhLGIsdm9pZCAwKTtyZXR1cm4gMD5jP251bGw6cChhKT9hLmNoYXJBdChjKTphW2NdfWZ1bmN0aW9uIFVhKGEsYixjKXtmb3IodmFyIGQ9YS5sZW5ndGgsZT1wKGEpP2Euc3BsaXQoXCJcIik6YSxmPTA7ZjxkO2YrKylpZihmIGluIGUmJmIuY2FsbChjLGVbZl0sZixhKSlyZXR1cm4gZjtyZXR1cm4tMX1mdW5jdGlvbiBWYShhLGIpe3ZhciBjPU5hKGEsYik7MDw9YyYmdC5zcGxpY2UuY2FsbChhLGMsMSl9ZnVuY3Rpb24gV2EoYSxiLGMpe3JldHVybiAyPj1hcmd1bWVudHMubGVuZ3RoP3Quc2xpY2UuY2FsbChhLGIpOnQuc2xpY2UuY2FsbChhLGIsYyl9XG5mdW5jdGlvbiBYYShhLGIpe2Euc29ydChifHxZYSl9ZnVuY3Rpb24gWWEoYSxiKXtyZXR1cm4gYT5iPzE6YTxiPy0xOjB9O3ZhciBaYT0tMSE9SGEuaW5kZXhPZihcIk9wZXJhXCIpfHwtMSE9SGEuaW5kZXhPZihcIk9QUlwiKSwkYT0tMSE9SGEuaW5kZXhPZihcIlRyaWRlbnRcIil8fC0xIT1IYS5pbmRleE9mKFwiTVNJRVwiKSxhYj0tMSE9SGEuaW5kZXhPZihcIkdlY2tvXCIpJiYtMT09SGEudG9Mb3dlckNhc2UoKS5pbmRleE9mKFwid2Via2l0XCIpJiYhKC0xIT1IYS5pbmRleE9mKFwiVHJpZGVudFwiKXx8LTEhPUhhLmluZGV4T2YoXCJNU0lFXCIpKSxiYj0tMSE9SGEudG9Mb3dlckNhc2UoKS5pbmRleE9mKFwid2Via2l0XCIpO1xuKGZ1bmN0aW9uKCl7dmFyIGE9XCJcIixiO2lmKFphJiZhYS5vcGVyYSlyZXR1cm4gYT1hYS5vcGVyYS52ZXJzaW9uLGhhKGEpP2EoKTphO2FiP2I9L3J2XFw6KFteXFwpO10rKShcXCl8OykvOiRhP2I9L1xcYig/Ok1TSUV8cnYpWzogXShbXlxcKTtdKykoXFwpfDspLzpiYiYmKGI9L1dlYktpdFxcLyhcXFMrKS8pO2ImJihhPShhPWIuZXhlYyhIYSkpP2FbMV06XCJcIik7cmV0dXJuICRhJiYoYj0oYj1hYS5kb2N1bWVudCk/Yi5kb2N1bWVudE1vZGU6dm9pZCAwLGI+cGFyc2VGbG9hdChhKSk/U3RyaW5nKGIpOmF9KSgpO3ZhciBjYj1udWxsLGRiPW51bGwsZWI9bnVsbDtmdW5jdGlvbiBmYihhLGIpe2lmKCFmYShhKSl0aHJvdyBFcnJvcihcImVuY29kZUJ5dGVBcnJheSB0YWtlcyBhbiBhcnJheSBhcyBhIHBhcmFtZXRlclwiKTtnYigpO2Zvcih2YXIgYz1iP2RiOmNiLGQ9W10sZT0wO2U8YS5sZW5ndGg7ZSs9Myl7dmFyIGY9YVtlXSxnPWUrMTxhLmxlbmd0aCxrPWc/YVtlKzFdOjAsbD1lKzI8YS5sZW5ndGgsbT1sP2FbZSsyXTowLHY9Zj4+MixmPShmJjMpPDw0fGs+PjQsaz0oayYxNSk8PDJ8bT4+NixtPW0mNjM7bHx8KG09NjQsZ3x8KGs9NjQpKTtkLnB1c2goY1t2XSxjW2ZdLGNba10sY1ttXSl9cmV0dXJuIGQuam9pbihcIlwiKX1cbmZ1bmN0aW9uIGdiKCl7aWYoIWNiKXtjYj17fTtkYj17fTtlYj17fTtmb3IodmFyIGE9MDs2NT5hO2ErKyljYlthXT1cIkFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5Ky89XCIuY2hhckF0KGEpLGRiW2FdPVwiQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODktXy5cIi5jaGFyQXQoYSksZWJbZGJbYV1dPWEsNjI8PWEmJihlYltcIkFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5Ky89XCIuY2hhckF0KGEpXT1hKX19O2Z1bmN0aW9uIHUoYSxiKXtyZXR1cm4gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGEsYil9ZnVuY3Rpb24gdyhhLGIpe2lmKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChhLGIpKXJldHVybiBhW2JdfWZ1bmN0aW9uIGhiKGEsYil7Zm9yKHZhciBjIGluIGEpT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGEsYykmJmIoYyxhW2NdKX1mdW5jdGlvbiBpYihhKXt2YXIgYj17fTtoYihhLGZ1bmN0aW9uKGEsZCl7YlthXT1kfSk7cmV0dXJuIGJ9O2Z1bmN0aW9uIGpiKGEpe3ZhciBiPVtdO2hiKGEsZnVuY3Rpb24oYSxkKXtlYShkKT9PYShkLGZ1bmN0aW9uKGQpe2IucHVzaChlbmNvZGVVUklDb21wb25lbnQoYSkrXCI9XCIrZW5jb2RlVVJJQ29tcG9uZW50KGQpKX0pOmIucHVzaChlbmNvZGVVUklDb21wb25lbnQoYSkrXCI9XCIrZW5jb2RlVVJJQ29tcG9uZW50KGQpKX0pO3JldHVybiBiLmxlbmd0aD9cIiZcIitiLmpvaW4oXCImXCIpOlwiXCJ9ZnVuY3Rpb24ga2IoYSl7dmFyIGI9e307YT1hLnJlcGxhY2UoL15cXD8vLFwiXCIpLnNwbGl0KFwiJlwiKTtPYShhLGZ1bmN0aW9uKGEpe2EmJihhPWEuc3BsaXQoXCI9XCIpLGJbYVswXV09YVsxXSl9KTtyZXR1cm4gYn07ZnVuY3Rpb24geChhLGIsYyxkKXt2YXIgZTtkPGI/ZT1cImF0IGxlYXN0IFwiK2I6ZD5jJiYoZT0wPT09Yz9cIm5vbmVcIjpcIm5vIG1vcmUgdGhhbiBcIitjKTtpZihlKXRocm93IEVycm9yKGErXCIgZmFpbGVkOiBXYXMgY2FsbGVkIHdpdGggXCIrZCsoMT09PWQ/XCIgYXJndW1lbnQuXCI6XCIgYXJndW1lbnRzLlwiKStcIiBFeHBlY3RzIFwiK2UrXCIuXCIpO31mdW5jdGlvbiB6KGEsYixjKXt2YXIgZD1cIlwiO3N3aXRjaChiKXtjYXNlIDE6ZD1jP1wiZmlyc3RcIjpcIkZpcnN0XCI7YnJlYWs7Y2FzZSAyOmQ9Yz9cInNlY29uZFwiOlwiU2Vjb25kXCI7YnJlYWs7Y2FzZSAzOmQ9Yz9cInRoaXJkXCI6XCJUaGlyZFwiO2JyZWFrO2Nhc2UgNDpkPWM/XCJmb3VydGhcIjpcIkZvdXJ0aFwiO2JyZWFrO2RlZmF1bHQ6dGhyb3cgRXJyb3IoXCJlcnJvclByZWZpeCBjYWxsZWQgd2l0aCBhcmd1bWVudE51bWJlciA+IDQuICBOZWVkIHRvIHVwZGF0ZSBpdD9cIik7fXJldHVybiBhPWErXCIgZmFpbGVkOiBcIisoZCtcIiBhcmd1bWVudCBcIil9XG5mdW5jdGlvbiBBKGEsYixjLGQpe2lmKCghZHx8bihjKSkmJiFoYShjKSl0aHJvdyBFcnJvcih6KGEsYixkKStcIm11c3QgYmUgYSB2YWxpZCBmdW5jdGlvbi5cIik7fWZ1bmN0aW9uIGxiKGEsYixjKXtpZihuKGMpJiYoIWlhKGMpfHxudWxsPT09YykpdGhyb3cgRXJyb3IoeihhLGIsITApK1wibXVzdCBiZSBhIHZhbGlkIGNvbnRleHQgb2JqZWN0LlwiKTt9O2Z1bmN0aW9uIG1iKGEpe3JldHVyblwidW5kZWZpbmVkXCIhPT10eXBlb2YgSlNPTiYmbihKU09OLnBhcnNlKT9KU09OLnBhcnNlKGEpOkFhKGEpfWZ1bmN0aW9uIEIoYSl7aWYoXCJ1bmRlZmluZWRcIiE9PXR5cGVvZiBKU09OJiZuKEpTT04uc3RyaW5naWZ5KSlhPUpTT04uc3RyaW5naWZ5KGEpO2Vsc2V7dmFyIGI9W107Q2EobmV3IEJhLGEsYik7YT1iLmpvaW4oXCJcIil9cmV0dXJuIGF9O2Z1bmN0aW9uIG5iKCl7dGhpcy5TZD1DfW5iLnByb3RvdHlwZS5qPWZ1bmN0aW9uKGEpe3JldHVybiB0aGlzLlNkLm9hKGEpfTtuYi5wcm90b3R5cGUudG9TdHJpbmc9ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5TZC50b1N0cmluZygpfTtmdW5jdGlvbiBvYigpe31vYi5wcm90b3R5cGUucGY9ZnVuY3Rpb24oKXtyZXR1cm4gbnVsbH07b2IucHJvdG90eXBlLnhlPWZ1bmN0aW9uKCl7cmV0dXJuIG51bGx9O3ZhciBwYj1uZXcgb2I7ZnVuY3Rpb24gcWIoYSxiLGMpe3RoaXMuUWY9YTt0aGlzLkthPWI7dGhpcy5IZD1jfXFiLnByb3RvdHlwZS5wZj1mdW5jdGlvbihhKXt2YXIgYj10aGlzLkthLkQ7aWYocmIoYixhKSlyZXR1cm4gYi5qKCkuTShhKTtiPW51bGwhPXRoaXMuSGQ/bmV3IHNiKHRoaXMuSGQsITAsITEpOnRoaXMuS2EudSgpO3JldHVybiB0aGlzLlFmLlhhKGEsYil9O3FiLnByb3RvdHlwZS54ZT1mdW5jdGlvbihhLGIsYyl7dmFyIGQ9bnVsbCE9dGhpcy5IZD90aGlzLkhkOnRiKHRoaXMuS2EpO2E9dGhpcy5RZi5tZShkLGIsMSxjLGEpO3JldHVybiAwPT09YS5sZW5ndGg/bnVsbDphWzBdfTtmdW5jdGlvbiB1Yigpe3RoaXMudGI9W119ZnVuY3Rpb24gdmIoYSxiKXtmb3IodmFyIGM9bnVsbCxkPTA7ZDxiLmxlbmd0aDtkKyspe3ZhciBlPWJbZF0sZj1lLlliKCk7bnVsbD09PWN8fGYuWihjLlliKCkpfHwoYS50Yi5wdXNoKGMpLGM9bnVsbCk7bnVsbD09PWMmJihjPW5ldyB3YihmKSk7Yy5hZGQoZSl9YyYmYS50Yi5wdXNoKGMpfWZ1bmN0aW9uIHhiKGEsYixjKXt2YihhLGMpO3liKGEsZnVuY3Rpb24oYSl7cmV0dXJuIGEuWihiKX0pfWZ1bmN0aW9uIHpiKGEsYixjKXt2YihhLGMpO3liKGEsZnVuY3Rpb24oYSl7cmV0dXJuIGEuY29udGFpbnMoYil8fGIuY29udGFpbnMoYSl9KX1cbmZ1bmN0aW9uIHliKGEsYil7Zm9yKHZhciBjPSEwLGQ9MDtkPGEudGIubGVuZ3RoO2QrKyl7dmFyIGU9YS50YltkXTtpZihlKWlmKGU9ZS5ZYigpLGIoZSkpe2Zvcih2YXIgZT1hLnRiW2RdLGY9MDtmPGUuc2QubGVuZ3RoO2YrKyl7dmFyIGc9ZS5zZFtmXTtpZihudWxsIT09Zyl7ZS5zZFtmXT1udWxsO3ZhciBrPWcuVWIoKTtBYiYmQmIoXCJldmVudDogXCIrZy50b1N0cmluZygpKTtDYihrKX19YS50YltkXT1udWxsfWVsc2UgYz0hMX1jJiYoYS50Yj1bXSl9ZnVuY3Rpb24gd2IoYSl7dGhpcy5xYT1hO3RoaXMuc2Q9W119d2IucHJvdG90eXBlLmFkZD1mdW5jdGlvbihhKXt0aGlzLnNkLnB1c2goYSl9O3diLnByb3RvdHlwZS5ZYj1mdW5jdGlvbigpe3JldHVybiB0aGlzLnFhfTtmdW5jdGlvbiBEKGEsYixjLGQpe3RoaXMudHlwZT1hO3RoaXMuSmE9Yjt0aGlzLllhPWM7dGhpcy5KZT1kO3RoaXMuTmQ9dm9pZCAwfWZ1bmN0aW9uIERiKGEpe3JldHVybiBuZXcgRChFYixhKX12YXIgRWI9XCJ2YWx1ZVwiO2Z1bmN0aW9uIEZiKGEsYixjLGQpe3RoaXMudGU9Yjt0aGlzLldkPWM7dGhpcy5OZD1kO3RoaXMucmQ9YX1GYi5wcm90b3R5cGUuWWI9ZnVuY3Rpb24oKXt2YXIgYT10aGlzLldkLmxjKCk7cmV0dXJuXCJ2YWx1ZVwiPT09dGhpcy5yZD9hLnBhdGg6YS5wYXJlbnQoKS5wYXRofTtGYi5wcm90b3R5cGUueWU9ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5yZH07RmIucHJvdG90eXBlLlViPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMudGUuVWIodGhpcyl9O0ZiLnByb3RvdHlwZS50b1N0cmluZz1mdW5jdGlvbigpe3JldHVybiB0aGlzLlliKCkudG9TdHJpbmcoKStcIjpcIit0aGlzLnJkK1wiOlwiK0IodGhpcy5XZC5sZigpKX07ZnVuY3Rpb24gR2IoYSxiLGMpe3RoaXMudGU9YTt0aGlzLmVycm9yPWI7dGhpcy5wYXRoPWN9R2IucHJvdG90eXBlLlliPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMucGF0aH07R2IucHJvdG90eXBlLnllPWZ1bmN0aW9uKCl7cmV0dXJuXCJjYW5jZWxcIn07XG5HYi5wcm90b3R5cGUuVWI9ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy50ZS5VYih0aGlzKX07R2IucHJvdG90eXBlLnRvU3RyaW5nPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMucGF0aC50b1N0cmluZygpK1wiOmNhbmNlbFwifTtmdW5jdGlvbiBzYihhLGIsYyl7dGhpcy5CPWE7dGhpcy4kPWI7dGhpcy5UYj1jfWZ1bmN0aW9uIEhiKGEpe3JldHVybiBhLiR9ZnVuY3Rpb24gcmIoYSxiKXtyZXR1cm4gYS4kJiYhYS5UYnx8YS5CLkhhKGIpfXNiLnByb3RvdHlwZS5qPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuQn07ZnVuY3Rpb24gSWIoYSl7dGhpcy5kZz1hO3RoaXMuQWQ9bnVsbH1JYi5wcm90b3R5cGUuZ2V0PWZ1bmN0aW9uKCl7dmFyIGE9dGhpcy5kZy5nZXQoKSxiPXhhKGEpO2lmKHRoaXMuQWQpZm9yKHZhciBjIGluIHRoaXMuQWQpYltjXS09dGhpcy5BZFtjXTt0aGlzLkFkPWE7cmV0dXJuIGJ9O2Z1bmN0aW9uIEpiKGEsYil7dGhpcy5NZj17fTt0aGlzLllkPW5ldyBJYihhKTt0aGlzLmNhPWI7dmFyIGM9MUU0KzJFNCpNYXRoLnJhbmRvbSgpO3NldFRpbWVvdXQocSh0aGlzLkhmLHRoaXMpLE1hdGguZmxvb3IoYykpfUpiLnByb3RvdHlwZS5IZj1mdW5jdGlvbigpe3ZhciBhPXRoaXMuWWQuZ2V0KCksYj17fSxjPSExLGQ7Zm9yKGQgaW4gYSkwPGFbZF0mJnUodGhpcy5NZixkKSYmKGJbZF09YVtkXSxjPSEwKTtjJiZ0aGlzLmNhLlRlKGIpO3NldFRpbWVvdXQocSh0aGlzLkhmLHRoaXMpLE1hdGguZmxvb3IoNkU1Kk1hdGgucmFuZG9tKCkpKX07ZnVuY3Rpb24gS2IoKXt0aGlzLkRjPXt9fWZ1bmN0aW9uIExiKGEsYixjKXtuKGMpfHwoYz0xKTt1KGEuRGMsYil8fChhLkRjW2JdPTApO2EuRGNbYl0rPWN9S2IucHJvdG90eXBlLmdldD1mdW5jdGlvbigpe3JldHVybiB4YSh0aGlzLkRjKX07dmFyIE1iPXt9LE5iPXt9O2Z1bmN0aW9uIE9iKGEpe2E9YS50b1N0cmluZygpO01iW2FdfHwoTWJbYV09bmV3IEtiKTtyZXR1cm4gTWJbYV19ZnVuY3Rpb24gUGIoYSxiKXt2YXIgYz1hLnRvU3RyaW5nKCk7TmJbY118fChOYltjXT1iKCkpO3JldHVybiBOYltjXX07ZnVuY3Rpb24gRShhLGIpe3RoaXMubmFtZT1hO3RoaXMuUz1ifWZ1bmN0aW9uIFFiKGEsYil7cmV0dXJuIG5ldyBFKGEsYil9O2Z1bmN0aW9uIFJiKGEsYil7cmV0dXJuIFNiKGEubmFtZSxiLm5hbWUpfWZ1bmN0aW9uIFRiKGEsYil7cmV0dXJuIFNiKGEsYil9O2Z1bmN0aW9uIFViKGEsYixjKXt0aGlzLnR5cGU9VmI7dGhpcy5zb3VyY2U9YTt0aGlzLnBhdGg9Yjt0aGlzLklhPWN9VWIucHJvdG90eXBlLldjPWZ1bmN0aW9uKGEpe3JldHVybiB0aGlzLnBhdGguZSgpP25ldyBVYih0aGlzLnNvdXJjZSxGLHRoaXMuSWEuTShhKSk6bmV3IFViKHRoaXMuc291cmNlLEcodGhpcy5wYXRoKSx0aGlzLklhKX07VWIucHJvdG90eXBlLnRvU3RyaW5nPWZ1bmN0aW9uKCl7cmV0dXJuXCJPcGVyYXRpb24oXCIrdGhpcy5wYXRoK1wiOiBcIit0aGlzLnNvdXJjZS50b1N0cmluZygpK1wiIG92ZXJ3cml0ZTogXCIrdGhpcy5JYS50b1N0cmluZygpK1wiKVwifTtmdW5jdGlvbiBXYihhLGIpe3RoaXMudHlwZT1YYjt0aGlzLnNvdXJjZT1ZYjt0aGlzLnBhdGg9YTt0aGlzLlZlPWJ9V2IucHJvdG90eXBlLldjPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMucGF0aC5lKCk/dGhpczpuZXcgV2IoRyh0aGlzLnBhdGgpLHRoaXMuVmUpfTtXYi5wcm90b3R5cGUudG9TdHJpbmc9ZnVuY3Rpb24oKXtyZXR1cm5cIk9wZXJhdGlvbihcIit0aGlzLnBhdGgrXCI6IFwiK3RoaXMuc291cmNlLnRvU3RyaW5nKCkrXCIgYWNrIHdyaXRlIHJldmVydD1cIit0aGlzLlZlK1wiKVwifTtmdW5jdGlvbiBaYihhLGIpe3RoaXMudHlwZT0kYjt0aGlzLnNvdXJjZT1hO3RoaXMucGF0aD1ifVpiLnByb3RvdHlwZS5XYz1mdW5jdGlvbigpe3JldHVybiB0aGlzLnBhdGguZSgpP25ldyBaYih0aGlzLnNvdXJjZSxGKTpuZXcgWmIodGhpcy5zb3VyY2UsRyh0aGlzLnBhdGgpKX07WmIucHJvdG90eXBlLnRvU3RyaW5nPWZ1bmN0aW9uKCl7cmV0dXJuXCJPcGVyYXRpb24oXCIrdGhpcy5wYXRoK1wiOiBcIit0aGlzLnNvdXJjZS50b1N0cmluZygpK1wiIGxpc3Rlbl9jb21wbGV0ZSlcIn07ZnVuY3Rpb24gYWMoYSxiKXt0aGlzLkxhPWE7dGhpcy54YT1iP2I6YmN9aD1hYy5wcm90b3R5cGU7aC5OYT1mdW5jdGlvbihhLGIpe3JldHVybiBuZXcgYWModGhpcy5MYSx0aGlzLnhhLk5hKGEsYix0aGlzLkxhKS5YKG51bGwsbnVsbCwhMSxudWxsLG51bGwpKX07aC5yZW1vdmU9ZnVuY3Rpb24oYSl7cmV0dXJuIG5ldyBhYyh0aGlzLkxhLHRoaXMueGEucmVtb3ZlKGEsdGhpcy5MYSkuWChudWxsLG51bGwsITEsbnVsbCxudWxsKSl9O2guZ2V0PWZ1bmN0aW9uKGEpe2Zvcih2YXIgYixjPXRoaXMueGE7IWMuZSgpOyl7Yj10aGlzLkxhKGEsYy5rZXkpO2lmKDA9PT1iKXJldHVybiBjLnZhbHVlOzA+Yj9jPWMubGVmdDowPGImJihjPWMucmlnaHQpfXJldHVybiBudWxsfTtcbmZ1bmN0aW9uIGNjKGEsYil7Zm9yKHZhciBjLGQ9YS54YSxlPW51bGw7IWQuZSgpOyl7Yz1hLkxhKGIsZC5rZXkpO2lmKDA9PT1jKXtpZihkLmxlZnQuZSgpKXJldHVybiBlP2Uua2V5Om51bGw7Zm9yKGQ9ZC5sZWZ0OyFkLnJpZ2h0LmUoKTspZD1kLnJpZ2h0O3JldHVybiBkLmtleX0wPmM/ZD1kLmxlZnQ6MDxjJiYoZT1kLGQ9ZC5yaWdodCl9dGhyb3cgRXJyb3IoXCJBdHRlbXB0ZWQgdG8gZmluZCBwcmVkZWNlc3NvciBrZXkgZm9yIGEgbm9uZXhpc3RlbnQga2V5LiAgV2hhdCBnaXZlcz9cIik7fWguZT1mdW5jdGlvbigpe3JldHVybiB0aGlzLnhhLmUoKX07aC5jb3VudD1mdW5jdGlvbigpe3JldHVybiB0aGlzLnhhLmNvdW50KCl9O2guUmM9ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy54YS5SYygpfTtoLmVjPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMueGEuZWMoKX07aC5oYT1mdW5jdGlvbihhKXtyZXR1cm4gdGhpcy54YS5oYShhKX07XG5oLldiPWZ1bmN0aW9uKGEpe3JldHVybiBuZXcgZGModGhpcy54YSxudWxsLHRoaXMuTGEsITEsYSl9O2guWGI9ZnVuY3Rpb24oYSxiKXtyZXR1cm4gbmV3IGRjKHRoaXMueGEsYSx0aGlzLkxhLCExLGIpfTtoLlpiPWZ1bmN0aW9uKGEsYil7cmV0dXJuIG5ldyBkYyh0aGlzLnhhLGEsdGhpcy5MYSwhMCxiKX07aC5yZj1mdW5jdGlvbihhKXtyZXR1cm4gbmV3IGRjKHRoaXMueGEsbnVsbCx0aGlzLkxhLCEwLGEpfTtmdW5jdGlvbiBkYyhhLGIsYyxkLGUpe3RoaXMuUmQ9ZXx8bnVsbDt0aGlzLkVlPWQ7dGhpcy5QYT1bXTtmb3IoZT0xOyFhLmUoKTspaWYoZT1iP2MoYS5rZXksYik6MSxkJiYoZSo9LTEpLDA+ZSlhPXRoaXMuRWU/YS5sZWZ0OmEucmlnaHQ7ZWxzZSBpZigwPT09ZSl7dGhpcy5QYS5wdXNoKGEpO2JyZWFrfWVsc2UgdGhpcy5QYS5wdXNoKGEpLGE9dGhpcy5FZT9hLnJpZ2h0OmEubGVmdH1cbmZ1bmN0aW9uIEgoYSl7aWYoMD09PWEuUGEubGVuZ3RoKXJldHVybiBudWxsO3ZhciBiPWEuUGEucG9wKCksYztjPWEuUmQ/YS5SZChiLmtleSxiLnZhbHVlKTp7a2V5OmIua2V5LHZhbHVlOmIudmFsdWV9O2lmKGEuRWUpZm9yKGI9Yi5sZWZ0OyFiLmUoKTspYS5QYS5wdXNoKGIpLGI9Yi5yaWdodDtlbHNlIGZvcihiPWIucmlnaHQ7IWIuZSgpOylhLlBhLnB1c2goYiksYj1iLmxlZnQ7cmV0dXJuIGN9ZnVuY3Rpb24gZWMoYSl7aWYoMD09PWEuUGEubGVuZ3RoKXJldHVybiBudWxsO3ZhciBiO2I9YS5QYTtiPWJbYi5sZW5ndGgtMV07cmV0dXJuIGEuUmQ/YS5SZChiLmtleSxiLnZhbHVlKTp7a2V5OmIua2V5LHZhbHVlOmIudmFsdWV9fWZ1bmN0aW9uIGZjKGEsYixjLGQsZSl7dGhpcy5rZXk9YTt0aGlzLnZhbHVlPWI7dGhpcy5jb2xvcj1udWxsIT1jP2M6ITA7dGhpcy5sZWZ0PW51bGwhPWQ/ZDpiYzt0aGlzLnJpZ2h0PW51bGwhPWU/ZTpiY31oPWZjLnByb3RvdHlwZTtcbmguWD1mdW5jdGlvbihhLGIsYyxkLGUpe3JldHVybiBuZXcgZmMobnVsbCE9YT9hOnRoaXMua2V5LG51bGwhPWI/Yjp0aGlzLnZhbHVlLG51bGwhPWM/Yzp0aGlzLmNvbG9yLG51bGwhPWQ/ZDp0aGlzLmxlZnQsbnVsbCE9ZT9lOnRoaXMucmlnaHQpfTtoLmNvdW50PWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMubGVmdC5jb3VudCgpKzErdGhpcy5yaWdodC5jb3VudCgpfTtoLmU9ZnVuY3Rpb24oKXtyZXR1cm4hMX07aC5oYT1mdW5jdGlvbihhKXtyZXR1cm4gdGhpcy5sZWZ0LmhhKGEpfHxhKHRoaXMua2V5LHRoaXMudmFsdWUpfHx0aGlzLnJpZ2h0LmhhKGEpfTtmdW5jdGlvbiBnYyhhKXtyZXR1cm4gYS5sZWZ0LmUoKT9hOmdjKGEubGVmdCl9aC5SYz1mdW5jdGlvbigpe3JldHVybiBnYyh0aGlzKS5rZXl9O2guZWM9ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5yaWdodC5lKCk/dGhpcy5rZXk6dGhpcy5yaWdodC5lYygpfTtcbmguTmE9ZnVuY3Rpb24oYSxiLGMpe3ZhciBkLGU7ZT10aGlzO2Q9YyhhLGUua2V5KTtlPTA+ZD9lLlgobnVsbCxudWxsLG51bGwsZS5sZWZ0Lk5hKGEsYixjKSxudWxsKTowPT09ZD9lLlgobnVsbCxiLG51bGwsbnVsbCxudWxsKTplLlgobnVsbCxudWxsLG51bGwsbnVsbCxlLnJpZ2h0Lk5hKGEsYixjKSk7cmV0dXJuIGhjKGUpfTtmdW5jdGlvbiBpYyhhKXtpZihhLmxlZnQuZSgpKXJldHVybiBiYzthLmxlZnQuZmEoKXx8YS5sZWZ0LmxlZnQuZmEoKXx8KGE9amMoYSkpO2E9YS5YKG51bGwsbnVsbCxudWxsLGljKGEubGVmdCksbnVsbCk7cmV0dXJuIGhjKGEpfVxuaC5yZW1vdmU9ZnVuY3Rpb24oYSxiKXt2YXIgYyxkO2M9dGhpcztpZigwPmIoYSxjLmtleSkpYy5sZWZ0LmUoKXx8Yy5sZWZ0LmZhKCl8fGMubGVmdC5sZWZ0LmZhKCl8fChjPWpjKGMpKSxjPWMuWChudWxsLG51bGwsbnVsbCxjLmxlZnQucmVtb3ZlKGEsYiksbnVsbCk7ZWxzZXtjLmxlZnQuZmEoKSYmKGM9a2MoYykpO2MucmlnaHQuZSgpfHxjLnJpZ2h0LmZhKCl8fGMucmlnaHQubGVmdC5mYSgpfHwoYz1sYyhjKSxjLmxlZnQubGVmdC5mYSgpJiYoYz1rYyhjKSxjPWxjKGMpKSk7aWYoMD09PWIoYSxjLmtleSkpe2lmKGMucmlnaHQuZSgpKXJldHVybiBiYztkPWdjKGMucmlnaHQpO2M9Yy5YKGQua2V5LGQudmFsdWUsbnVsbCxudWxsLGljKGMucmlnaHQpKX1jPWMuWChudWxsLG51bGwsbnVsbCxudWxsLGMucmlnaHQucmVtb3ZlKGEsYikpfXJldHVybiBoYyhjKX07aC5mYT1mdW5jdGlvbigpe3JldHVybiB0aGlzLmNvbG9yfTtcbmZ1bmN0aW9uIGhjKGEpe2EucmlnaHQuZmEoKSYmIWEubGVmdC5mYSgpJiYoYT1tYyhhKSk7YS5sZWZ0LmZhKCkmJmEubGVmdC5sZWZ0LmZhKCkmJihhPWtjKGEpKTthLmxlZnQuZmEoKSYmYS5yaWdodC5mYSgpJiYoYT1sYyhhKSk7cmV0dXJuIGF9ZnVuY3Rpb24gamMoYSl7YT1sYyhhKTthLnJpZ2h0LmxlZnQuZmEoKSYmKGE9YS5YKG51bGwsbnVsbCxudWxsLG51bGwsa2MoYS5yaWdodCkpLGE9bWMoYSksYT1sYyhhKSk7cmV0dXJuIGF9ZnVuY3Rpb24gbWMoYSl7cmV0dXJuIGEucmlnaHQuWChudWxsLG51bGwsYS5jb2xvcixhLlgobnVsbCxudWxsLCEwLG51bGwsYS5yaWdodC5sZWZ0KSxudWxsKX1mdW5jdGlvbiBrYyhhKXtyZXR1cm4gYS5sZWZ0LlgobnVsbCxudWxsLGEuY29sb3IsbnVsbCxhLlgobnVsbCxudWxsLCEwLGEubGVmdC5yaWdodCxudWxsKSl9XG5mdW5jdGlvbiBsYyhhKXtyZXR1cm4gYS5YKG51bGwsbnVsbCwhYS5jb2xvcixhLmxlZnQuWChudWxsLG51bGwsIWEubGVmdC5jb2xvcixudWxsLG51bGwpLGEucmlnaHQuWChudWxsLG51bGwsIWEucmlnaHQuY29sb3IsbnVsbCxudWxsKSl9ZnVuY3Rpb24gbmMoKXt9aD1uYy5wcm90b3R5cGU7aC5YPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXN9O2guTmE9ZnVuY3Rpb24oYSxiKXtyZXR1cm4gbmV3IGZjKGEsYixudWxsKX07aC5yZW1vdmU9ZnVuY3Rpb24oKXtyZXR1cm4gdGhpc307aC5jb3VudD1mdW5jdGlvbigpe3JldHVybiAwfTtoLmU9ZnVuY3Rpb24oKXtyZXR1cm4hMH07aC5oYT1mdW5jdGlvbigpe3JldHVybiExfTtoLlJjPWZ1bmN0aW9uKCl7cmV0dXJuIG51bGx9O2guZWM9ZnVuY3Rpb24oKXtyZXR1cm4gbnVsbH07aC5mYT1mdW5jdGlvbigpe3JldHVybiExfTt2YXIgYmM9bmV3IG5jO2Z1bmN0aW9uIG9jKGEsYil7cmV0dXJuIGEmJlwib2JqZWN0XCI9PT10eXBlb2YgYT8oSihcIi5zdlwiaW4gYSxcIlVuZXhwZWN0ZWQgbGVhZiBub2RlIG9yIHByaW9yaXR5IGNvbnRlbnRzXCIpLGJbYVtcIi5zdlwiXV0pOmF9ZnVuY3Rpb24gcGMoYSxiKXt2YXIgYz1uZXcgcWM7cmMoYSxuZXcgSyhcIlwiKSxmdW5jdGlvbihhLGUpe2MubWMoYSxzYyhlLGIpKX0pO3JldHVybiBjfWZ1bmN0aW9uIHNjKGEsYil7dmFyIGM9YS5BKCkuSygpLGM9b2MoYyxiKSxkO2lmKGEuTigpKXt2YXIgZT1vYyhhLkJhKCksYik7cmV0dXJuIGUhPT1hLkJhKCl8fGMhPT1hLkEoKS5LKCk/bmV3IHRjKGUsTChjKSk6YX1kPWE7YyE9PWEuQSgpLksoKSYmKGQ9ZC5kYShuZXcgdGMoYykpKTthLlUoTSxmdW5jdGlvbihhLGMpe3ZhciBlPXNjKGMsYik7ZSE9PWMmJihkPWQuUShhLGUpKX0pO3JldHVybiBkfTtmdW5jdGlvbiBLKGEsYil7aWYoMT09YXJndW1lbnRzLmxlbmd0aCl7dGhpcy5uPWEuc3BsaXQoXCIvXCIpO2Zvcih2YXIgYz0wLGQ9MDtkPHRoaXMubi5sZW5ndGg7ZCsrKTA8dGhpcy5uW2RdLmxlbmd0aCYmKHRoaXMubltjXT10aGlzLm5bZF0sYysrKTt0aGlzLm4ubGVuZ3RoPWM7dGhpcy5ZPTB9ZWxzZSB0aGlzLm49YSx0aGlzLlk9Yn1mdW5jdGlvbiBOKGEsYil7dmFyIGM9TyhhKTtpZihudWxsPT09YylyZXR1cm4gYjtpZihjPT09TyhiKSlyZXR1cm4gTihHKGEpLEcoYikpO3Rocm93IEVycm9yKFwiSU5URVJOQUwgRVJST1I6IGlubmVyUGF0aCAoXCIrYitcIikgaXMgbm90IHdpdGhpbiBvdXRlclBhdGggKFwiK2ErXCIpXCIpO31mdW5jdGlvbiBPKGEpe3JldHVybiBhLlk+PWEubi5sZW5ndGg/bnVsbDphLm5bYS5ZXX1mdW5jdGlvbiB1YyhhKXtyZXR1cm4gYS5uLmxlbmd0aC1hLll9XG5mdW5jdGlvbiBHKGEpe3ZhciBiPWEuWTtiPGEubi5sZW5ndGgmJmIrKztyZXR1cm4gbmV3IEsoYS5uLGIpfWZ1bmN0aW9uIHZjKGEpe3JldHVybiBhLlk8YS5uLmxlbmd0aD9hLm5bYS5uLmxlbmd0aC0xXTpudWxsfWg9Sy5wcm90b3R5cGU7aC50b1N0cmluZz1mdW5jdGlvbigpe2Zvcih2YXIgYT1cIlwiLGI9dGhpcy5ZO2I8dGhpcy5uLmxlbmd0aDtiKyspXCJcIiE9PXRoaXMubltiXSYmKGErPVwiL1wiK3RoaXMubltiXSk7cmV0dXJuIGF8fFwiL1wifTtoLnNsaWNlPWZ1bmN0aW9uKGEpe3JldHVybiB0aGlzLm4uc2xpY2UodGhpcy5ZKyhhfHwwKSl9O2gucGFyZW50PWZ1bmN0aW9uKCl7aWYodGhpcy5ZPj10aGlzLm4ubGVuZ3RoKXJldHVybiBudWxsO2Zvcih2YXIgYT1bXSxiPXRoaXMuWTtiPHRoaXMubi5sZW5ndGgtMTtiKyspYS5wdXNoKHRoaXMubltiXSk7cmV0dXJuIG5ldyBLKGEsMCl9O1xuaC53PWZ1bmN0aW9uKGEpe2Zvcih2YXIgYj1bXSxjPXRoaXMuWTtjPHRoaXMubi5sZW5ndGg7YysrKWIucHVzaCh0aGlzLm5bY10pO2lmKGEgaW5zdGFuY2VvZiBLKWZvcihjPWEuWTtjPGEubi5sZW5ndGg7YysrKWIucHVzaChhLm5bY10pO2Vsc2UgZm9yKGE9YS5zcGxpdChcIi9cIiksYz0wO2M8YS5sZW5ndGg7YysrKTA8YVtjXS5sZW5ndGgmJmIucHVzaChhW2NdKTtyZXR1cm4gbmV3IEsoYiwwKX07aC5lPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuWT49dGhpcy5uLmxlbmd0aH07aC5aPWZ1bmN0aW9uKGEpe2lmKHVjKHRoaXMpIT09dWMoYSkpcmV0dXJuITE7Zm9yKHZhciBiPXRoaXMuWSxjPWEuWTtiPD10aGlzLm4ubGVuZ3RoO2IrKyxjKyspaWYodGhpcy5uW2JdIT09YS5uW2NdKXJldHVybiExO3JldHVybiEwfTtcbmguY29udGFpbnM9ZnVuY3Rpb24oYSl7dmFyIGI9dGhpcy5ZLGM9YS5ZO2lmKHVjKHRoaXMpPnVjKGEpKXJldHVybiExO2Zvcig7Yjx0aGlzLm4ubGVuZ3RoOyl7aWYodGhpcy5uW2JdIT09YS5uW2NdKXJldHVybiExOysrYjsrK2N9cmV0dXJuITB9O3ZhciBGPW5ldyBLKFwiXCIpO2Z1bmN0aW9uIHdjKGEsYil7dGhpcy5RYT1hLnNsaWNlKCk7dGhpcy5FYT1NYXRoLm1heCgxLHRoaXMuUWEubGVuZ3RoKTt0aGlzLmtmPWI7Zm9yKHZhciBjPTA7Yzx0aGlzLlFhLmxlbmd0aDtjKyspdGhpcy5FYSs9eGModGhpcy5RYVtjXSk7eWModGhpcyl9d2MucHJvdG90eXBlLnB1c2g9ZnVuY3Rpb24oYSl7MDx0aGlzLlFhLmxlbmd0aCYmKHRoaXMuRWErPTEpO3RoaXMuUWEucHVzaChhKTt0aGlzLkVhKz14YyhhKTt5Yyh0aGlzKX07d2MucHJvdG90eXBlLnBvcD1mdW5jdGlvbigpe3ZhciBhPXRoaXMuUWEucG9wKCk7dGhpcy5FYS09eGMoYSk7MDx0aGlzLlFhLmxlbmd0aCYmLS10aGlzLkVhfTtcbmZ1bmN0aW9uIHljKGEpe2lmKDc2ODxhLkVhKXRocm93IEVycm9yKGEua2YrXCJoYXMgYSBrZXkgcGF0aCBsb25nZXIgdGhhbiA3NjggYnl0ZXMgKFwiK2EuRWErXCIpLlwiKTtpZigzMjxhLlFhLmxlbmd0aCl0aHJvdyBFcnJvcihhLmtmK1wicGF0aCBzcGVjaWZpZWQgZXhjZWVkcyB0aGUgbWF4aW11bSBkZXB0aCB0aGF0IGNhbiBiZSB3cml0dGVuICgzMikgb3Igb2JqZWN0IGNvbnRhaW5zIGEgY3ljbGUgXCIremMoYSkpO31mdW5jdGlvbiB6YyhhKXtyZXR1cm4gMD09YS5RYS5sZW5ndGg/XCJcIjpcImluIHByb3BlcnR5ICdcIithLlFhLmpvaW4oXCIuXCIpK1wiJ1wifTtmdW5jdGlvbiBBYygpe3RoaXMud2M9e319QWMucHJvdG90eXBlLnNldD1mdW5jdGlvbihhLGIpe251bGw9PWI/ZGVsZXRlIHRoaXMud2NbYV06dGhpcy53Y1thXT1ifTtBYy5wcm90b3R5cGUuZ2V0PWZ1bmN0aW9uKGEpe3JldHVybiB1KHRoaXMud2MsYSk/dGhpcy53Y1thXTpudWxsfTtBYy5wcm90b3R5cGUucmVtb3ZlPWZ1bmN0aW9uKGEpe2RlbGV0ZSB0aGlzLndjW2FdfTtBYy5wcm90b3R5cGUudWY9ITA7ZnVuY3Rpb24gQmMoYSl7dGhpcy5FYz1hO3RoaXMuTWQ9XCJmaXJlYmFzZTpcIn1oPUJjLnByb3RvdHlwZTtoLnNldD1mdW5jdGlvbihhLGIpe251bGw9PWI/dGhpcy5FYy5yZW1vdmVJdGVtKHRoaXMuTWQrYSk6dGhpcy5FYy5zZXRJdGVtKHRoaXMuTWQrYSxCKGIpKX07aC5nZXQ9ZnVuY3Rpb24oYSl7YT10aGlzLkVjLmdldEl0ZW0odGhpcy5NZCthKTtyZXR1cm4gbnVsbD09YT9udWxsOm1iKGEpfTtoLnJlbW92ZT1mdW5jdGlvbihhKXt0aGlzLkVjLnJlbW92ZUl0ZW0odGhpcy5NZCthKX07aC51Zj0hMTtoLnRvU3RyaW5nPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuRWMudG9TdHJpbmcoKX07ZnVuY3Rpb24gQ2MoYSl7dHJ5e2lmKFwidW5kZWZpbmVkXCIhPT10eXBlb2Ygd2luZG93JiZcInVuZGVmaW5lZFwiIT09dHlwZW9mIHdpbmRvd1thXSl7dmFyIGI9d2luZG93W2FdO2Iuc2V0SXRlbShcImZpcmViYXNlOnNlbnRpbmVsXCIsXCJjYWNoZVwiKTtiLnJlbW92ZUl0ZW0oXCJmaXJlYmFzZTpzZW50aW5lbFwiKTtyZXR1cm4gbmV3IEJjKGIpfX1jYXRjaChjKXt9cmV0dXJuIG5ldyBBY312YXIgRGM9Q2MoXCJsb2NhbFN0b3JhZ2VcIiksUD1DYyhcInNlc3Npb25TdG9yYWdlXCIpO2Z1bmN0aW9uIEVjKGEsYixjLGQsZSl7dGhpcy5ob3N0PWEudG9Mb3dlckNhc2UoKTt0aGlzLmRvbWFpbj10aGlzLmhvc3Quc3Vic3RyKHRoaXMuaG9zdC5pbmRleE9mKFwiLlwiKSsxKTt0aGlzLmxiPWI7dGhpcy5DYj1jO3RoaXMuVGc9ZDt0aGlzLkxkPWV8fFwiXCI7dGhpcy5PYT1EYy5nZXQoXCJob3N0OlwiK2EpfHx0aGlzLmhvc3R9ZnVuY3Rpb24gRmMoYSxiKXtiIT09YS5PYSYmKGEuT2E9YixcInMtXCI9PT1hLk9hLnN1YnN0cigwLDIpJiZEYy5zZXQoXCJob3N0OlwiK2EuaG9zdCxhLk9hKSl9RWMucHJvdG90eXBlLnRvU3RyaW5nPWZ1bmN0aW9uKCl7dmFyIGE9KHRoaXMubGI/XCJodHRwczovL1wiOlwiaHR0cDovL1wiKSt0aGlzLmhvc3Q7dGhpcy5MZCYmKGErPVwiPFwiK3RoaXMuTGQrXCI+XCIpO3JldHVybiBhfTt2YXIgR2M9ZnVuY3Rpb24oKXt2YXIgYT0xO3JldHVybiBmdW5jdGlvbigpe3JldHVybiBhKyt9fSgpO2Z1bmN0aW9uIEooYSxiKXtpZighYSl0aHJvdyBIYyhiKTt9ZnVuY3Rpb24gSGMoYSl7cmV0dXJuIEVycm9yKFwiRmlyZWJhc2UgKDIuMi41KSBJTlRFUk5BTCBBU1NFUlQgRkFJTEVEOiBcIithKX1cbmZ1bmN0aW9uIEljKGEpe3RyeXt2YXIgYjtpZihcInVuZGVmaW5lZFwiIT09dHlwZW9mIGF0b2IpYj1hdG9iKGEpO2Vsc2V7Z2IoKTtmb3IodmFyIGM9ZWIsZD1bXSxlPTA7ZTxhLmxlbmd0aDspe3ZhciBmPWNbYS5jaGFyQXQoZSsrKV0sZz1lPGEubGVuZ3RoP2NbYS5jaGFyQXQoZSldOjA7KytlO3ZhciBrPWU8YS5sZW5ndGg/Y1thLmNoYXJBdChlKV06NjQ7KytlO3ZhciBsPWU8YS5sZW5ndGg/Y1thLmNoYXJBdChlKV06NjQ7KytlO2lmKG51bGw9PWZ8fG51bGw9PWd8fG51bGw9PWt8fG51bGw9PWwpdGhyb3cgRXJyb3IoKTtkLnB1c2goZjw8MnxnPj40KTs2NCE9ayYmKGQucHVzaChnPDw0JjI0MHxrPj4yKSw2NCE9bCYmZC5wdXNoKGs8PDYmMTkyfGwpKX1pZig4MTkyPmQubGVuZ3RoKWI9U3RyaW5nLmZyb21DaGFyQ29kZS5hcHBseShudWxsLGQpO2Vsc2V7YT1cIlwiO2ZvcihjPTA7YzxkLmxlbmd0aDtjKz04MTkyKWErPVN0cmluZy5mcm9tQ2hhckNvZGUuYXBwbHkobnVsbCxXYShkLGMsXG5jKzgxOTIpKTtiPWF9fXJldHVybiBifWNhdGNoKG0pe0JiKFwiYmFzZTY0RGVjb2RlIGZhaWxlZDogXCIsbSl9cmV0dXJuIG51bGx9ZnVuY3Rpb24gSmMoYSl7dmFyIGI9S2MoYSk7YT1uZXcgTGE7YS51cGRhdGUoYik7dmFyIGI9W10sYz04KmEuYmU7NTY+YS4kYj9hLnVwZGF0ZShhLklkLDU2LWEuJGIpOmEudXBkYXRlKGEuSWQsYS5XYS0oYS4kYi01NikpO2Zvcih2YXIgZD1hLldhLTE7NTY8PWQ7ZC0tKWEubGVbZF09YyYyNTUsYy89MjU2O01hKGEsYS5sZSk7Zm9yKGQ9Yz0wOzU+ZDtkKyspZm9yKHZhciBlPTI0OzA8PWU7ZS09OCliW2NdPWEuUltkXT4+ZSYyNTUsKytjO3JldHVybiBmYihiKX1cbmZ1bmN0aW9uIExjKGEpe2Zvcih2YXIgYj1cIlwiLGM9MDtjPGFyZ3VtZW50cy5sZW5ndGg7YysrKWI9ZmEoYXJndW1lbnRzW2NdKT9iK0xjLmFwcGx5KG51bGwsYXJndW1lbnRzW2NdKTpcIm9iamVjdFwiPT09dHlwZW9mIGFyZ3VtZW50c1tjXT9iK0IoYXJndW1lbnRzW2NdKTpiK2FyZ3VtZW50c1tjXSxiKz1cIiBcIjtyZXR1cm4gYn12YXIgQWI9bnVsbCxNYz0hMDtmdW5jdGlvbiBCYihhKXshMD09PU1jJiYoTWM9ITEsbnVsbD09PUFiJiYhMD09PVAuZ2V0KFwibG9nZ2luZ19lbmFibGVkXCIpJiZOYyghMCkpO2lmKEFiKXt2YXIgYj1MYy5hcHBseShudWxsLGFyZ3VtZW50cyk7QWIoYil9fWZ1bmN0aW9uIE9jKGEpe3JldHVybiBmdW5jdGlvbigpe0JiKGEsYXJndW1lbnRzKX19XG5mdW5jdGlvbiBQYyhhKXtpZihcInVuZGVmaW5lZFwiIT09dHlwZW9mIGNvbnNvbGUpe3ZhciBiPVwiRklSRUJBU0UgSU5URVJOQUwgRVJST1I6IFwiK0xjLmFwcGx5KG51bGwsYXJndW1lbnRzKTtcInVuZGVmaW5lZFwiIT09dHlwZW9mIGNvbnNvbGUuZXJyb3I/Y29uc29sZS5lcnJvcihiKTpjb25zb2xlLmxvZyhiKX19ZnVuY3Rpb24gUWMoYSl7dmFyIGI9TGMuYXBwbHkobnVsbCxhcmd1bWVudHMpO3Rocm93IEVycm9yKFwiRklSRUJBU0UgRkFUQUwgRVJST1I6IFwiK2IpO31mdW5jdGlvbiBRKGEpe2lmKFwidW5kZWZpbmVkXCIhPT10eXBlb2YgY29uc29sZSl7dmFyIGI9XCJGSVJFQkFTRSBXQVJOSU5HOiBcIitMYy5hcHBseShudWxsLGFyZ3VtZW50cyk7XCJ1bmRlZmluZWRcIiE9PXR5cGVvZiBjb25zb2xlLndhcm4/Y29uc29sZS53YXJuKGIpOmNvbnNvbGUubG9nKGIpfX1cbmZ1bmN0aW9uIFJjKGEpe3ZhciBiPVwiXCIsYz1cIlwiLGQ9XCJcIixlPVwiXCIsZj0hMCxnPVwiaHR0cHNcIixrPTQ0MztpZihwKGEpKXt2YXIgbD1hLmluZGV4T2YoXCIvL1wiKTswPD1sJiYoZz1hLnN1YnN0cmluZygwLGwtMSksYT1hLnN1YnN0cmluZyhsKzIpKTtsPWEuaW5kZXhPZihcIi9cIik7LTE9PT1sJiYobD1hLmxlbmd0aCk7Yj1hLnN1YnN0cmluZygwLGwpO2U9XCJcIjthPWEuc3Vic3RyaW5nKGwpLnNwbGl0KFwiL1wiKTtmb3IobD0wO2w8YS5sZW5ndGg7bCsrKWlmKDA8YVtsXS5sZW5ndGgpe3ZhciBtPWFbbF07dHJ5e209ZGVjb2RlVVJJQ29tcG9uZW50KG0ucmVwbGFjZSgvXFwrL2csXCIgXCIpKX1jYXRjaCh2KXt9ZSs9XCIvXCIrbX1hPWIuc3BsaXQoXCIuXCIpOzM9PT1hLmxlbmd0aD8oYz1hWzFdLGQ9YVswXS50b0xvd2VyQ2FzZSgpKToyPT09YS5sZW5ndGgmJihjPWFbMF0pO2w9Yi5pbmRleE9mKFwiOlwiKTswPD1sJiYoZj1cImh0dHBzXCI9PT1nfHxcIndzc1wiPT09ZyxrPWIuc3Vic3RyaW5nKGwrMSksaXNGaW5pdGUoaykmJlxuKGs9U3RyaW5nKGspKSxrPXAoayk/L15cXHMqLT8weC9pLnRlc3Qoayk/cGFyc2VJbnQoaywxNik6cGFyc2VJbnQoaywxMCk6TmFOKX1yZXR1cm57aG9zdDpiLHBvcnQ6ayxkb21haW46YyxRZzpkLGxiOmYsc2NoZW1lOmcsWmM6ZX19ZnVuY3Rpb24gU2MoYSl7cmV0dXJuIGdhKGEpJiYoYSE9YXx8YT09TnVtYmVyLlBPU0lUSVZFX0lORklOSVRZfHxhPT1OdW1iZXIuTkVHQVRJVkVfSU5GSU5JVFkpfVxuZnVuY3Rpb24gVGMoYSl7aWYoXCJjb21wbGV0ZVwiPT09ZG9jdW1lbnQucmVhZHlTdGF0ZSlhKCk7ZWxzZXt2YXIgYj0hMSxjPWZ1bmN0aW9uKCl7ZG9jdW1lbnQuYm9keT9ifHwoYj0hMCxhKCkpOnNldFRpbWVvdXQoYyxNYXRoLmZsb29yKDEwKSl9O2RvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXI/KGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsYywhMSksd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsYywhMSkpOmRvY3VtZW50LmF0dGFjaEV2ZW50JiYoZG9jdW1lbnQuYXR0YWNoRXZlbnQoXCJvbnJlYWR5c3RhdGVjaGFuZ2VcIixmdW5jdGlvbigpe1wiY29tcGxldGVcIj09PWRvY3VtZW50LnJlYWR5U3RhdGUmJmMoKX0pLHdpbmRvdy5hdHRhY2hFdmVudChcIm9ubG9hZFwiLGMpKX19XG5mdW5jdGlvbiBTYihhLGIpe2lmKGE9PT1iKXJldHVybiAwO2lmKFwiW01JTl9OQU1FXVwiPT09YXx8XCJbTUFYX05BTUVdXCI9PT1iKXJldHVybi0xO2lmKFwiW01JTl9OQU1FXVwiPT09Ynx8XCJbTUFYX05BTUVdXCI9PT1hKXJldHVybiAxO3ZhciBjPVVjKGEpLGQ9VWMoYik7cmV0dXJuIG51bGwhPT1jP251bGwhPT1kPzA9PWMtZD9hLmxlbmd0aC1iLmxlbmd0aDpjLWQ6LTE6bnVsbCE9PWQ/MTphPGI/LTE6MX1mdW5jdGlvbiBWYyhhLGIpe2lmKGImJmEgaW4gYilyZXR1cm4gYlthXTt0aHJvdyBFcnJvcihcIk1pc3NpbmcgcmVxdWlyZWQga2V5IChcIithK1wiKSBpbiBvYmplY3Q6IFwiK0IoYikpO31cbmZ1bmN0aW9uIFdjKGEpe2lmKFwib2JqZWN0XCIhPT10eXBlb2YgYXx8bnVsbD09PWEpcmV0dXJuIEIoYSk7dmFyIGI9W10sYztmb3IoYyBpbiBhKWIucHVzaChjKTtiLnNvcnQoKTtjPVwie1wiO2Zvcih2YXIgZD0wO2Q8Yi5sZW5ndGg7ZCsrKTAhPT1kJiYoYys9XCIsXCIpLGMrPUIoYltkXSksYys9XCI6XCIsYys9V2MoYVtiW2RdXSk7cmV0dXJuIGMrXCJ9XCJ9ZnVuY3Rpb24gWGMoYSxiKXtpZihhLmxlbmd0aDw9YilyZXR1cm5bYV07Zm9yKHZhciBjPVtdLGQ9MDtkPGEubGVuZ3RoO2QrPWIpZCtiPmE/Yy5wdXNoKGEuc3Vic3RyaW5nKGQsYS5sZW5ndGgpKTpjLnB1c2goYS5zdWJzdHJpbmcoZCxkK2IpKTtyZXR1cm4gY31mdW5jdGlvbiBZYyhhLGIpe2lmKGVhKGEpKWZvcih2YXIgYz0wO2M8YS5sZW5ndGg7KytjKWIoYyxhW2NdKTtlbHNlIHIoYSxiKX1cbmZ1bmN0aW9uIFpjKGEpe0ooIVNjKGEpLFwiSW52YWxpZCBKU09OIG51bWJlclwiKTt2YXIgYixjLGQsZTswPT09YT8oZD1jPTAsYj0tSW5maW5pdHk9PT0xL2E/MTowKTooYj0wPmEsYT1NYXRoLmFicyhhKSxhPj1NYXRoLnBvdygyLC0xMDIyKT8oZD1NYXRoLm1pbihNYXRoLmZsb29yKE1hdGgubG9nKGEpL01hdGguTE4yKSwxMDIzKSxjPWQrMTAyMyxkPU1hdGgucm91bmQoYSpNYXRoLnBvdygyLDUyLWQpLU1hdGgucG93KDIsNTIpKSk6KGM9MCxkPU1hdGgucm91bmQoYS9NYXRoLnBvdygyLC0xMDc0KSkpKTtlPVtdO2ZvcihhPTUyO2E7LS1hKWUucHVzaChkJTI/MTowKSxkPU1hdGguZmxvb3IoZC8yKTtmb3IoYT0xMTthOy0tYSllLnB1c2goYyUyPzE6MCksYz1NYXRoLmZsb29yKGMvMik7ZS5wdXNoKGI/MTowKTtlLnJldmVyc2UoKTtiPWUuam9pbihcIlwiKTtjPVwiXCI7Zm9yKGE9MDs2ND5hO2ErPTgpZD1wYXJzZUludChiLnN1YnN0cihhLDgpLDIpLnRvU3RyaW5nKDE2KSwxPT09ZC5sZW5ndGgmJlxuKGQ9XCIwXCIrZCksYys9ZDtyZXR1cm4gYy50b0xvd2VyQ2FzZSgpfXZhciAkYz0vXi0/XFxkezEsMTB9JC87ZnVuY3Rpb24gVWMoYSl7cmV0dXJuICRjLnRlc3QoYSkmJihhPU51bWJlcihhKSwtMjE0NzQ4MzY0ODw9YSYmMjE0NzQ4MzY0Nz49YSk/YTpudWxsfWZ1bmN0aW9uIENiKGEpe3RyeXthKCl9Y2F0Y2goYil7c2V0VGltZW91dChmdW5jdGlvbigpe1EoXCJFeGNlcHRpb24gd2FzIHRocm93biBieSB1c2VyIGNhbGxiYWNrLlwiLGIuc3RhY2t8fFwiXCIpO3Rocm93IGI7fSxNYXRoLmZsb29yKDApKX19ZnVuY3Rpb24gUihhLGIpe2lmKGhhKGEpKXt2YXIgYz1BcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsMSkuc2xpY2UoKTtDYihmdW5jdGlvbigpe2EuYXBwbHkobnVsbCxjKX0pfX07ZnVuY3Rpb24gS2MoYSl7Zm9yKHZhciBiPVtdLGM9MCxkPTA7ZDxhLmxlbmd0aDtkKyspe3ZhciBlPWEuY2hhckNvZGVBdChkKTs1NTI5Njw9ZSYmNTYzMTk+PWUmJihlLT01NTI5NixkKyssSihkPGEubGVuZ3RoLFwiU3Vycm9nYXRlIHBhaXIgbWlzc2luZyB0cmFpbCBzdXJyb2dhdGUuXCIpLGU9NjU1MzYrKGU8PDEwKSsoYS5jaGFyQ29kZUF0KGQpLTU2MzIwKSk7MTI4PmU/YltjKytdPWU6KDIwNDg+ZT9iW2MrK109ZT4+NnwxOTI6KDY1NTM2PmU/YltjKytdPWU+PjEyfDIyNDooYltjKytdPWU+PjE4fDI0MCxiW2MrK109ZT4+MTImNjN8MTI4KSxiW2MrK109ZT4+NiY2M3wxMjgpLGJbYysrXT1lJjYzfDEyOCl9cmV0dXJuIGJ9ZnVuY3Rpb24geGMoYSl7Zm9yKHZhciBiPTAsYz0wO2M8YS5sZW5ndGg7YysrKXt2YXIgZD1hLmNoYXJDb2RlQXQoYyk7MTI4PmQ/YisrOjIwNDg+ZD9iKz0yOjU1Mjk2PD1kJiY1NjMxOT49ZD8oYis9NCxjKyspOmIrPTN9cmV0dXJuIGJ9O2Z1bmN0aW9uIGFkKGEpe3ZhciBiPXt9LGM9e30sZD17fSxlPVwiXCI7dHJ5e3ZhciBmPWEuc3BsaXQoXCIuXCIpLGI9bWIoSWMoZlswXSl8fFwiXCIpLGM9bWIoSWMoZlsxXSl8fFwiXCIpLGU9ZlsyXSxkPWMuZHx8e307ZGVsZXRlIGMuZH1jYXRjaChnKXt9cmV0dXJue1dnOmIsQWM6YyxkYXRhOmQsTmc6ZX19ZnVuY3Rpb24gYmQoYSl7YT1hZChhKS5BYztyZXR1cm5cIm9iamVjdFwiPT09dHlwZW9mIGEmJmEuaGFzT3duUHJvcGVydHkoXCJpYXRcIik/dyhhLFwiaWF0XCIpOm51bGx9ZnVuY3Rpb24gY2QoYSl7YT1hZChhKTt2YXIgYj1hLkFjO3JldHVybiEhYS5OZyYmISFiJiZcIm9iamVjdFwiPT09dHlwZW9mIGImJmIuaGFzT3duUHJvcGVydHkoXCJpYXRcIil9O2Z1bmN0aW9uIGRkKGEpe3RoaXMuVj1hO3RoaXMuZz1hLm8uZ31mdW5jdGlvbiBlZChhLGIsYyxkKXt2YXIgZT1bXSxmPVtdO09hKGIsZnVuY3Rpb24oYil7XCJjaGlsZF9jaGFuZ2VkXCI9PT1iLnR5cGUmJmEuZy54ZChiLkplLGIuSmEpJiZmLnB1c2gobmV3IEQoXCJjaGlsZF9tb3ZlZFwiLGIuSmEsYi5ZYSkpfSk7ZmQoYSxlLFwiY2hpbGRfcmVtb3ZlZFwiLGIsZCxjKTtmZChhLGUsXCJjaGlsZF9hZGRlZFwiLGIsZCxjKTtmZChhLGUsXCJjaGlsZF9tb3ZlZFwiLGYsZCxjKTtmZChhLGUsXCJjaGlsZF9jaGFuZ2VkXCIsYixkLGMpO2ZkKGEsZSxFYixiLGQsYyk7cmV0dXJuIGV9ZnVuY3Rpb24gZmQoYSxiLGMsZCxlLGYpe2Q9UGEoZCxmdW5jdGlvbihhKXtyZXR1cm4gYS50eXBlPT09Y30pO1hhKGQscShhLmVnLGEpKTtPYShkLGZ1bmN0aW9uKGMpe3ZhciBkPWdkKGEsYyxmKTtPYShlLGZ1bmN0aW9uKGUpe2UuSmYoYy50eXBlKSYmYi5wdXNoKGUuY3JlYXRlRXZlbnQoZCxhLlYpKX0pfSl9XG5mdW5jdGlvbiBnZChhLGIsYyl7XCJ2YWx1ZVwiIT09Yi50eXBlJiZcImNoaWxkX3JlbW92ZWRcIiE9PWIudHlwZSYmKGIuTmQ9Yy5xZihiLllhLGIuSmEsYS5nKSk7cmV0dXJuIGJ9ZGQucHJvdG90eXBlLmVnPWZ1bmN0aW9uKGEsYil7aWYobnVsbD09YS5ZYXx8bnVsbD09Yi5ZYSl0aHJvdyBIYyhcIlNob3VsZCBvbmx5IGNvbXBhcmUgY2hpbGRfIGV2ZW50cy5cIik7cmV0dXJuIHRoaXMuZy5jb21wYXJlKG5ldyBFKGEuWWEsYS5KYSksbmV3IEUoYi5ZYSxiLkphKSl9O2Z1bmN0aW9uIGhkKCl7dGhpcy5lYj17fX1cbmZ1bmN0aW9uIGlkKGEsYil7dmFyIGM9Yi50eXBlLGQ9Yi5ZYTtKKFwiY2hpbGRfYWRkZWRcIj09Y3x8XCJjaGlsZF9jaGFuZ2VkXCI9PWN8fFwiY2hpbGRfcmVtb3ZlZFwiPT1jLFwiT25seSBjaGlsZCBjaGFuZ2VzIHN1cHBvcnRlZCBmb3IgdHJhY2tpbmdcIik7SihcIi5wcmlvcml0eVwiIT09ZCxcIk9ubHkgbm9uLXByaW9yaXR5IGNoaWxkIGNoYW5nZXMgY2FuIGJlIHRyYWNrZWQuXCIpO3ZhciBlPXcoYS5lYixkKTtpZihlKXt2YXIgZj1lLnR5cGU7aWYoXCJjaGlsZF9hZGRlZFwiPT1jJiZcImNoaWxkX3JlbW92ZWRcIj09ZilhLmViW2RdPW5ldyBEKFwiY2hpbGRfY2hhbmdlZFwiLGIuSmEsZCxlLkphKTtlbHNlIGlmKFwiY2hpbGRfcmVtb3ZlZFwiPT1jJiZcImNoaWxkX2FkZGVkXCI9PWYpZGVsZXRlIGEuZWJbZF07ZWxzZSBpZihcImNoaWxkX3JlbW92ZWRcIj09YyYmXCJjaGlsZF9jaGFuZ2VkXCI9PWYpYS5lYltkXT1uZXcgRChcImNoaWxkX3JlbW92ZWRcIixlLkplLGQpO2Vsc2UgaWYoXCJjaGlsZF9jaGFuZ2VkXCI9PWMmJlxuXCJjaGlsZF9hZGRlZFwiPT1mKWEuZWJbZF09bmV3IEQoXCJjaGlsZF9hZGRlZFwiLGIuSmEsZCk7ZWxzZSBpZihcImNoaWxkX2NoYW5nZWRcIj09YyYmXCJjaGlsZF9jaGFuZ2VkXCI9PWYpYS5lYltkXT1uZXcgRChcImNoaWxkX2NoYW5nZWRcIixiLkphLGQsZS5KZSk7ZWxzZSB0aHJvdyBIYyhcIklsbGVnYWwgY29tYmluYXRpb24gb2YgY2hhbmdlczogXCIrYitcIiBvY2N1cnJlZCBhZnRlciBcIitlKTt9ZWxzZSBhLmViW2RdPWJ9O2Z1bmN0aW9uIGpkKGEsYixjKXt0aGlzLlBiPWE7dGhpcy5xYj1iO3RoaXMuc2I9Y3x8bnVsbH1oPWpkLnByb3RvdHlwZTtoLkpmPWZ1bmN0aW9uKGEpe3JldHVyblwidmFsdWVcIj09PWF9O2guY3JlYXRlRXZlbnQ9ZnVuY3Rpb24oYSxiKXt2YXIgYz1iLm8uZztyZXR1cm4gbmV3IEZiKFwidmFsdWVcIix0aGlzLG5ldyBTKGEuSmEsYi5sYygpLGMpKX07aC5VYj1mdW5jdGlvbihhKXt2YXIgYj10aGlzLnNiO2lmKFwiY2FuY2VsXCI9PT1hLnllKCkpe0oodGhpcy5xYixcIlJhaXNpbmcgYSBjYW5jZWwgZXZlbnQgb24gYSBsaXN0ZW5lciB3aXRoIG5vIGNhbmNlbCBjYWxsYmFja1wiKTt2YXIgYz10aGlzLnFiO3JldHVybiBmdW5jdGlvbigpe2MuY2FsbChiLGEuZXJyb3IpfX12YXIgZD10aGlzLlBiO3JldHVybiBmdW5jdGlvbigpe2QuY2FsbChiLGEuV2QpfX07aC5mZj1mdW5jdGlvbihhLGIpe3JldHVybiB0aGlzLnFiP25ldyBHYih0aGlzLGEsYik6bnVsbH07XG5oLm1hdGNoZXM9ZnVuY3Rpb24oYSl7cmV0dXJuIGEgaW5zdGFuY2VvZiBqZD9hLlBiJiZ0aGlzLlBiP2EuUGI9PT10aGlzLlBiJiZhLnNiPT09dGhpcy5zYjohMDohMX07aC5zZj1mdW5jdGlvbigpe3JldHVybiBudWxsIT09dGhpcy5QYn07ZnVuY3Rpb24ga2QoYSxiLGMpe3RoaXMuZ2E9YTt0aGlzLnFiPWI7dGhpcy5zYj1jfWg9a2QucHJvdG90eXBlO2guSmY9ZnVuY3Rpb24oYSl7YT1cImNoaWxkcmVuX2FkZGVkXCI9PT1hP1wiY2hpbGRfYWRkZWRcIjphO3JldHVybihcImNoaWxkcmVuX3JlbW92ZWRcIj09PWE/XCJjaGlsZF9yZW1vdmVkXCI6YSlpbiB0aGlzLmdhfTtoLmZmPWZ1bmN0aW9uKGEsYil7cmV0dXJuIHRoaXMucWI/bmV3IEdiKHRoaXMsYSxiKTpudWxsfTtcbmguY3JlYXRlRXZlbnQ9ZnVuY3Rpb24oYSxiKXtKKG51bGwhPWEuWWEsXCJDaGlsZCBldmVudHMgc2hvdWxkIGhhdmUgYSBjaGlsZE5hbWUuXCIpO3ZhciBjPWIubGMoKS53KGEuWWEpO3JldHVybiBuZXcgRmIoYS50eXBlLHRoaXMsbmV3IFMoYS5KYSxjLGIuby5nKSxhLk5kKX07aC5VYj1mdW5jdGlvbihhKXt2YXIgYj10aGlzLnNiO2lmKFwiY2FuY2VsXCI9PT1hLnllKCkpe0oodGhpcy5xYixcIlJhaXNpbmcgYSBjYW5jZWwgZXZlbnQgb24gYSBsaXN0ZW5lciB3aXRoIG5vIGNhbmNlbCBjYWxsYmFja1wiKTt2YXIgYz10aGlzLnFiO3JldHVybiBmdW5jdGlvbigpe2MuY2FsbChiLGEuZXJyb3IpfX12YXIgZD10aGlzLmdhW2EucmRdO3JldHVybiBmdW5jdGlvbigpe2QuY2FsbChiLGEuV2QsYS5OZCl9fTtcbmgubWF0Y2hlcz1mdW5jdGlvbihhKXtpZihhIGluc3RhbmNlb2Yga2Qpe2lmKCF0aGlzLmdhfHwhYS5nYSlyZXR1cm4hMDtpZih0aGlzLnNiPT09YS5zYil7dmFyIGI9cGEoYS5nYSk7aWYoYj09PXBhKHRoaXMuZ2EpKXtpZigxPT09Yil7dmFyIGI9cWEoYS5nYSksYz1xYSh0aGlzLmdhKTtyZXR1cm4gYz09PWImJighYS5nYVtiXXx8IXRoaXMuZ2FbY118fGEuZ2FbYl09PT10aGlzLmdhW2NdKX1yZXR1cm4gb2EodGhpcy5nYSxmdW5jdGlvbihiLGMpe3JldHVybiBhLmdhW2NdPT09Yn0pfX19cmV0dXJuITF9O2guc2Y9ZnVuY3Rpb24oKXtyZXR1cm4gbnVsbCE9PXRoaXMuZ2F9O2Z1bmN0aW9uIGxkKGEpe3RoaXMuZz1hfWg9bGQucHJvdG90eXBlO2guRz1mdW5jdGlvbihhLGIsYyxkLGUpe0ooYS5JYyh0aGlzLmcpLFwiQSBub2RlIG11c3QgYmUgaW5kZXhlZCBpZiBvbmx5IGEgY2hpbGQgaXMgdXBkYXRlZFwiKTtkPWEuTShiKTtpZihkLlooYykpcmV0dXJuIGE7bnVsbCE9ZSYmKGMuZSgpP2EuSGEoYik/aWQoZSxuZXcgRChcImNoaWxkX3JlbW92ZWRcIixkLGIpKTpKKGEuTigpLFwiQSBjaGlsZCByZW1vdmUgd2l0aG91dCBhbiBvbGQgY2hpbGQgb25seSBtYWtlcyBzZW5zZSBvbiBhIGxlYWYgbm9kZVwiKTpkLmUoKT9pZChlLG5ldyBEKFwiY2hpbGRfYWRkZWRcIixjLGIpKTppZChlLG5ldyBEKFwiY2hpbGRfY2hhbmdlZFwiLGMsYixkKSkpO3JldHVybiBhLk4oKSYmYy5lKCk/YTphLlEoYixjKS5tYih0aGlzLmcpfTtcbmgudGE9ZnVuY3Rpb24oYSxiLGMpe251bGwhPWMmJihhLk4oKXx8YS5VKE0sZnVuY3Rpb24oYSxlKXtiLkhhKGEpfHxpZChjLG5ldyBEKFwiY2hpbGRfcmVtb3ZlZFwiLGUsYSkpfSksYi5OKCl8fGIuVShNLGZ1bmN0aW9uKGIsZSl7aWYoYS5IYShiKSl7dmFyIGY9YS5NKGIpO2YuWihlKXx8aWQoYyxuZXcgRChcImNoaWxkX2NoYW5nZWRcIixlLGIsZikpfWVsc2UgaWQoYyxuZXcgRChcImNoaWxkX2FkZGVkXCIsZSxiKSl9KSk7cmV0dXJuIGIubWIodGhpcy5nKX07aC5kYT1mdW5jdGlvbihhLGIpe3JldHVybiBhLmUoKT9DOmEuZGEoYil9O2guR2E9ZnVuY3Rpb24oKXtyZXR1cm4hMX07aC5WYj1mdW5jdGlvbigpe3JldHVybiB0aGlzfTtmdW5jdGlvbiBtZChhKXt0aGlzLkFlPW5ldyBsZChhLmcpO3RoaXMuZz1hLmc7dmFyIGI7YS5sYT8oYj1uZChhKSxiPWEuZy5PYyhvZChhKSxiKSk6Yj1hLmcuU2MoKTt0aGlzLmRkPWI7YS5uYT8oYj1wZChhKSxhPWEuZy5PYyhxZChhKSxiKSk6YT1hLmcuUGMoKTt0aGlzLkZjPWF9aD1tZC5wcm90b3R5cGU7aC5tYXRjaGVzPWZ1bmN0aW9uKGEpe3JldHVybiAwPj10aGlzLmcuY29tcGFyZSh0aGlzLmRkLGEpJiYwPj10aGlzLmcuY29tcGFyZShhLHRoaXMuRmMpfTtoLkc9ZnVuY3Rpb24oYSxiLGMsZCxlKXt0aGlzLm1hdGNoZXMobmV3IEUoYixjKSl8fChjPUMpO3JldHVybiB0aGlzLkFlLkcoYSxiLGMsZCxlKX07aC50YT1mdW5jdGlvbihhLGIsYyl7Yi5OKCkmJihiPUMpO3ZhciBkPWIubWIodGhpcy5nKSxkPWQuZGEoQyksZT10aGlzO2IuVShNLGZ1bmN0aW9uKGEsYil7ZS5tYXRjaGVzKG5ldyBFKGEsYikpfHwoZD1kLlEoYSxDKSl9KTtyZXR1cm4gdGhpcy5BZS50YShhLGQsYyl9O1xuaC5kYT1mdW5jdGlvbihhKXtyZXR1cm4gYX07aC5HYT1mdW5jdGlvbigpe3JldHVybiEwfTtoLlZiPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuQWV9O2Z1bmN0aW9uIHJkKGEpe3RoaXMucmE9bmV3IG1kKGEpO3RoaXMuZz1hLmc7SihhLmlhLFwiT25seSB2YWxpZCBpZiBsaW1pdCBoYXMgYmVlbiBzZXRcIik7dGhpcy5qYT1hLmphO3RoaXMuSmI9IXNkKGEpfWg9cmQucHJvdG90eXBlO2guRz1mdW5jdGlvbihhLGIsYyxkLGUpe3RoaXMucmEubWF0Y2hlcyhuZXcgRShiLGMpKXx8KGM9Qyk7cmV0dXJuIGEuTShiKS5aKGMpP2E6YS5EYigpPHRoaXMuamE/dGhpcy5yYS5WYigpLkcoYSxiLGMsZCxlKTp0ZCh0aGlzLGEsYixjLGQsZSl9O1xuaC50YT1mdW5jdGlvbihhLGIsYyl7dmFyIGQ7aWYoYi5OKCl8fGIuZSgpKWQ9Qy5tYih0aGlzLmcpO2Vsc2UgaWYoMip0aGlzLmphPGIuRGIoKSYmYi5JYyh0aGlzLmcpKXtkPUMubWIodGhpcy5nKTtiPXRoaXMuSmI/Yi5aYih0aGlzLnJhLkZjLHRoaXMuZyk6Yi5YYih0aGlzLnJhLmRkLHRoaXMuZyk7Zm9yKHZhciBlPTA7MDxiLlBhLmxlbmd0aCYmZTx0aGlzLmphOyl7dmFyIGY9SChiKSxnO2lmKGc9dGhpcy5KYj8wPj10aGlzLmcuY29tcGFyZSh0aGlzLnJhLmRkLGYpOjA+PXRoaXMuZy5jb21wYXJlKGYsdGhpcy5yYS5GYykpZD1kLlEoZi5uYW1lLGYuUyksZSsrO2Vsc2UgYnJlYWt9fWVsc2V7ZD1iLm1iKHRoaXMuZyk7ZD1kLmRhKEMpO3ZhciBrLGwsbTtpZih0aGlzLkpiKXtiPWQucmYodGhpcy5nKTtrPXRoaXMucmEuRmM7bD10aGlzLnJhLmRkO3ZhciB2PXVkKHRoaXMuZyk7bT1mdW5jdGlvbihhLGIpe3JldHVybiB2KGIsYSl9fWVsc2UgYj1kLldiKHRoaXMuZyksaz10aGlzLnJhLmRkLFxubD10aGlzLnJhLkZjLG09dWQodGhpcy5nKTtmb3IodmFyIGU9MCx5PSExOzA8Yi5QYS5sZW5ndGg7KWY9SChiKSwheSYmMD49bShrLGYpJiYoeT0hMCksKGc9eSYmZTx0aGlzLmphJiYwPj1tKGYsbCkpP2UrKzpkPWQuUShmLm5hbWUsQyl9cmV0dXJuIHRoaXMucmEuVmIoKS50YShhLGQsYyl9O2guZGE9ZnVuY3Rpb24oYSl7cmV0dXJuIGF9O2guR2E9ZnVuY3Rpb24oKXtyZXR1cm4hMH07aC5WYj1mdW5jdGlvbigpe3JldHVybiB0aGlzLnJhLlZiKCl9O1xuZnVuY3Rpb24gdGQoYSxiLGMsZCxlLGYpe3ZhciBnO2lmKGEuSmIpe3ZhciBrPXVkKGEuZyk7Zz1mdW5jdGlvbihhLGIpe3JldHVybiBrKGIsYSl9fWVsc2UgZz11ZChhLmcpO0ooYi5EYigpPT1hLmphLFwiXCIpO3ZhciBsPW5ldyBFKGMsZCksbT1hLkpiP3dkKGIsYS5nKTp4ZChiLGEuZyksdj1hLnJhLm1hdGNoZXMobCk7aWYoYi5IYShjKSl7dmFyIHk9Yi5NKGMpLG09ZS54ZShhLmcsbSxhLkpiKTtudWxsIT1tJiZtLm5hbWU9PWMmJihtPWUueGUoYS5nLG0sYS5KYikpO2U9bnVsbD09bT8xOmcobSxsKTtpZih2JiYhZC5lKCkmJjA8PWUpcmV0dXJuIG51bGwhPWYmJmlkKGYsbmV3IEQoXCJjaGlsZF9jaGFuZ2VkXCIsZCxjLHkpKSxiLlEoYyxkKTtudWxsIT1mJiZpZChmLG5ldyBEKFwiY2hpbGRfcmVtb3ZlZFwiLHksYykpO2I9Yi5RKGMsQyk7cmV0dXJuIG51bGwhPW0mJmEucmEubWF0Y2hlcyhtKT8obnVsbCE9ZiYmaWQoZixuZXcgRChcImNoaWxkX2FkZGVkXCIsbS5TLG0ubmFtZSkpLGIuUShtLm5hbWUsXG5tLlMpKTpifXJldHVybiBkLmUoKT9iOnYmJjA8PWcobSxsKT8obnVsbCE9ZiYmKGlkKGYsbmV3IEQoXCJjaGlsZF9yZW1vdmVkXCIsbS5TLG0ubmFtZSkpLGlkKGYsbmV3IEQoXCJjaGlsZF9hZGRlZFwiLGQsYykpKSxiLlEoYyxkKS5RKG0ubmFtZSxDKSk6Yn07ZnVuY3Rpb24geWQoYSxiKXt0aGlzLmhlPWE7dGhpcy5jZz1ifWZ1bmN0aW9uIHpkKGEpe3RoaXMuST1hfVxuemQucHJvdG90eXBlLmJiPWZ1bmN0aW9uKGEsYixjLGQpe3ZhciBlPW5ldyBoZCxmO2lmKGIudHlwZT09PVZiKWIuc291cmNlLnZlP2M9QWQodGhpcyxhLGIucGF0aCxiLklhLGMsZCxlKTooSihiLnNvdXJjZS5vZixcIlVua25vd24gc291cmNlLlwiKSxmPWIuc291cmNlLmFmLGM9QmQodGhpcyxhLGIucGF0aCxiLklhLGMsZCxmLGUpKTtlbHNlIGlmKGIudHlwZT09PUNkKWIuc291cmNlLnZlP2M9RGQodGhpcyxhLGIucGF0aCxiLmNoaWxkcmVuLGMsZCxlKTooSihiLnNvdXJjZS5vZixcIlVua25vd24gc291cmNlLlwiKSxmPWIuc291cmNlLmFmLGM9RWQodGhpcyxhLGIucGF0aCxiLmNoaWxkcmVuLGMsZCxmLGUpKTtlbHNlIGlmKGIudHlwZT09PVhiKWlmKGIuVmUpaWYoZj1iLnBhdGgsbnVsbCE9Yy5zYyhmKSljPWE7ZWxzZXtiPW5ldyBxYihjLGEsZCk7ZD1hLkQuaigpO2lmKGYuZSgpfHxcIi5wcmlvcml0eVwiPT09TyhmKSlIYihhLnUoKSk/Yj1jLnVhKHRiKGEpKTooYj1hLnUoKS5qKCksXG5KKGIgaW5zdGFuY2VvZiBULFwic2VydmVyQ2hpbGRyZW4gd291bGQgYmUgY29tcGxldGUgaWYgbGVhZiBub2RlXCIpLGI9Yy54YyhiKSksYj10aGlzLkkudGEoZCxiLGUpO2Vsc2V7Zj1PKGYpO3ZhciBnPWMuWGEoZixhLnUoKSk7bnVsbD09ZyYmcmIoYS51KCksZikmJihnPWQuTShmKSk7Yj1udWxsIT1nP3RoaXMuSS5HKGQsZixnLGIsZSk6YS5ELmooKS5IYShmKT90aGlzLkkuRyhkLGYsQyxiLGUpOmQ7Yi5lKCkmJkhiKGEudSgpKSYmKGQ9Yy51YSh0YihhKSksZC5OKCkmJihiPXRoaXMuSS50YShiLGQsZSkpKX1kPUhiKGEudSgpKXx8bnVsbCE9Yy5zYyhGKTtjPUZkKGEsYixkLHRoaXMuSS5HYSgpKX1lbHNlIGM9R2QodGhpcyxhLGIucGF0aCxjLGQsZSk7ZWxzZSBpZihiLnR5cGU9PT0kYilkPWIucGF0aCxiPWEudSgpLGY9Yi5qKCksZz1iLiR8fGQuZSgpLGM9SGQodGhpcyxuZXcgSWQoYS5ELG5ldyBzYihmLGcsYi5UYikpLGQsYyxwYixlKTtlbHNlIHRocm93IEhjKFwiVW5rbm93biBvcGVyYXRpb24gdHlwZTogXCIrXG5iLnR5cGUpO2U9cmEoZS5lYik7ZD1jO2I9ZC5EO2IuJCYmKGY9Yi5qKCkuTigpfHxiLmooKS5lKCksZz1KZChhKSwoMDxlLmxlbmd0aHx8IWEuRC4kfHxmJiYhYi5qKCkuWihnKXx8IWIuaigpLkEoKS5aKGcuQSgpKSkmJmUucHVzaChEYihKZChkKSkpKTtyZXR1cm4gbmV3IHlkKGMsZSl9O1xuZnVuY3Rpb24gSGQoYSxiLGMsZCxlLGYpe3ZhciBnPWIuRDtpZihudWxsIT1kLnNjKGMpKXJldHVybiBiO3ZhciBrO2lmKGMuZSgpKUooSGIoYi51KCkpLFwiSWYgY2hhbmdlIHBhdGggaXMgZW1wdHksIHdlIG11c3QgaGF2ZSBjb21wbGV0ZSBzZXJ2ZXIgZGF0YVwiKSxiLnUoKS5UYj8oZT10YihiKSxkPWQueGMoZSBpbnN0YW5jZW9mIFQ/ZTpDKSk6ZD1kLnVhKHRiKGIpKSxmPWEuSS50YShiLkQuaigpLGQsZik7ZWxzZXt2YXIgbD1PKGMpO2lmKFwiLnByaW9yaXR5XCI9PWwpSigxPT11YyhjKSxcIkNhbid0IGhhdmUgYSBwcmlvcml0eSB3aXRoIGFkZGl0aW9uYWwgcGF0aCBjb21wb25lbnRzXCIpLGY9Zy5qKCksaz1iLnUoKS5qKCksZD1kLmhkKGMsZixrKSxmPW51bGwhPWQ/YS5JLmRhKGYsZCk6Zy5qKCk7ZWxzZXt2YXIgbT1HKGMpO3JiKGcsbCk/KGs9Yi51KCkuaigpLGQ9ZC5oZChjLGcuaigpLGspLGQ9bnVsbCE9ZD9nLmooKS5NKGwpLkcobSxkKTpnLmooKS5NKGwpKTpkPWQuWGEobCxiLnUoKSk7XG5mPW51bGwhPWQ/YS5JLkcoZy5qKCksbCxkLGUsZik6Zy5qKCl9fXJldHVybiBGZChiLGYsZy4kfHxjLmUoKSxhLkkuR2EoKSl9ZnVuY3Rpb24gQmQoYSxiLGMsZCxlLGYsZyxrKXt2YXIgbD1iLnUoKTtnPWc/YS5JOmEuSS5WYigpO2lmKGMuZSgpKWQ9Zy50YShsLmooKSxkLG51bGwpO2Vsc2UgaWYoZy5HYSgpJiYhbC5UYilkPWwuaigpLkcoYyxkKSxkPWcudGEobC5qKCksZCxudWxsKTtlbHNle3ZhciBtPU8oYyk7aWYoKGMuZSgpPyFsLiR8fGwuVGI6IXJiKGwsTyhjKSkpJiYxPHVjKGMpKXJldHVybiBiO2Q9bC5qKCkuTShtKS5HKEcoYyksZCk7ZD1cIi5wcmlvcml0eVwiPT1tP2cuZGEobC5qKCksZCk6Zy5HKGwuaigpLG0sZCxwYixudWxsKX1sPWwuJHx8Yy5lKCk7Yj1uZXcgSWQoYi5ELG5ldyBzYihkLGwsZy5HYSgpKSk7cmV0dXJuIEhkKGEsYixjLGUsbmV3IHFiKGUsYixmKSxrKX1cbmZ1bmN0aW9uIEFkKGEsYixjLGQsZSxmLGcpe3ZhciBrPWIuRDtlPW5ldyBxYihlLGIsZik7aWYoYy5lKCkpZz1hLkkudGEoYi5ELmooKSxkLGcpLGE9RmQoYixnLCEwLGEuSS5HYSgpKTtlbHNlIGlmKGY9TyhjKSxcIi5wcmlvcml0eVwiPT09ZilnPWEuSS5kYShiLkQuaigpLGQpLGE9RmQoYixnLGsuJCxrLlRiKTtlbHNle3ZhciBsPUcoYyk7Yz1rLmooKS5NKGYpO2lmKCFsLmUoKSl7dmFyIG09ZS5wZihmKTtkPW51bGwhPW0/XCIucHJpb3JpdHlcIj09PXZjKGwpJiZtLm9hKGwucGFyZW50KCkpLmUoKT9tOm0uRyhsLGQpOkN9Yy5aKGQpP2E9YjooZz1hLkkuRyhrLmooKSxmLGQsZSxnKSxhPUZkKGIsZyxrLiQsYS5JLkdhKCkpKX1yZXR1cm4gYX1cbmZ1bmN0aW9uIERkKGEsYixjLGQsZSxmLGcpe3ZhciBrPWI7S2QoZCxmdW5jdGlvbihkLG0pe3ZhciB2PWMudyhkKTtyYihiLkQsTyh2KSkmJihrPUFkKGEsayx2LG0sZSxmLGcpKX0pO0tkKGQsZnVuY3Rpb24oZCxtKXt2YXIgdj1jLncoZCk7cmIoYi5ELE8odikpfHwoaz1BZChhLGssdixtLGUsZixnKSl9KTtyZXR1cm4ga31mdW5jdGlvbiBMZChhLGIpe0tkKGIsZnVuY3Rpb24oYixkKXthPWEuRyhiLGQpfSk7cmV0dXJuIGF9XG5mdW5jdGlvbiBFZChhLGIsYyxkLGUsZixnLGspe2lmKGIudSgpLmooKS5lKCkmJiFIYihiLnUoKSkpcmV0dXJuIGI7dmFyIGw9YjtjPWMuZSgpP2Q6TWQoTmQsYyxkKTt2YXIgbT1iLnUoKS5qKCk7Yy5jaGlsZHJlbi5oYShmdW5jdGlvbihjLGQpe2lmKG0uSGEoYykpe3ZhciBJPWIudSgpLmooKS5NKGMpLEk9TGQoSSxkKTtsPUJkKGEsbCxuZXcgSyhjKSxJLGUsZixnLGspfX0pO2MuY2hpbGRyZW4uaGEoZnVuY3Rpb24oYyxkKXt2YXIgST0hSGIoYi51KCkpJiZudWxsPT1kLnZhbHVlO20uSGEoYyl8fEl8fChJPWIudSgpLmooKS5NKGMpLEk9TGQoSSxkKSxsPUJkKGEsbCxuZXcgSyhjKSxJLGUsZixnLGspKX0pO3JldHVybiBsfVxuZnVuY3Rpb24gR2QoYSxiLGMsZCxlLGYpe2lmKG51bGwhPWQuc2MoYykpcmV0dXJuIGI7dmFyIGc9bmV3IHFiKGQsYixlKSxrPWU9Yi5ELmooKTtpZihIYihiLnUoKSkpe2lmKGMuZSgpKWU9ZC51YSh0YihiKSksaz1hLkkudGEoYi5ELmooKSxlLGYpO2Vsc2UgaWYoXCIucHJpb3JpdHlcIj09PU8oYykpe3ZhciBsPWQuWGEoTyhjKSxiLnUoKSk7bnVsbD09bHx8ZS5lKCl8fGUuQSgpLloobCl8fChrPWEuSS5kYShlLGwpKX1lbHNlIGw9TyhjKSxlPWQuWGEobCxiLnUoKSksbnVsbCE9ZSYmKGs9YS5JLkcoYi5ELmooKSxsLGUsZyxmKSk7ZT0hMH1lbHNlIGlmKGIuRC4kfHxjLmUoKSlrPWUsZT1iLkQuaigpLGUuTigpfHxlLlUoTSxmdW5jdGlvbihjKXt2YXIgZT1kLlhhKGMsYi51KCkpO251bGwhPWUmJihrPWEuSS5HKGssYyxlLGcsZikpfSksZT1iLkQuJDtlbHNle2w9TyhjKTtpZigxPT11YyhjKXx8cmIoYi5ELGwpKWM9ZC5YYShsLGIudSgpKSxudWxsIT1jJiYoaz1hLkkuRyhlLGwsYyxcbmcsZikpO2U9ITF9cmV0dXJuIEZkKGIsayxlLGEuSS5HYSgpKX07ZnVuY3Rpb24gT2QoKXt9dmFyIFBkPXt9O2Z1bmN0aW9uIHVkKGEpe3JldHVybiBxKGEuY29tcGFyZSxhKX1PZC5wcm90b3R5cGUueGQ9ZnVuY3Rpb24oYSxiKXtyZXR1cm4gMCE9PXRoaXMuY29tcGFyZShuZXcgRShcIltNSU5fTkFNRV1cIixhKSxuZXcgRShcIltNSU5fTkFNRV1cIixiKSl9O09kLnByb3RvdHlwZS5TYz1mdW5jdGlvbigpe3JldHVybiBRZH07ZnVuY3Rpb24gUmQoYSl7dGhpcy5iYz1hfW1hKFJkLE9kKTtoPVJkLnByb3RvdHlwZTtoLkhjPWZ1bmN0aW9uKGEpe3JldHVybiFhLk0odGhpcy5iYykuZSgpfTtoLmNvbXBhcmU9ZnVuY3Rpb24oYSxiKXt2YXIgYz1hLlMuTSh0aGlzLmJjKSxkPWIuUy5NKHRoaXMuYmMpLGM9Yy5DYyhkKTtyZXR1cm4gMD09PWM/U2IoYS5uYW1lLGIubmFtZSk6Y307aC5PYz1mdW5jdGlvbihhLGIpe3ZhciBjPUwoYSksYz1DLlEodGhpcy5iYyxjKTtyZXR1cm4gbmV3IEUoYixjKX07XG5oLlBjPWZ1bmN0aW9uKCl7dmFyIGE9Qy5RKHRoaXMuYmMsU2QpO3JldHVybiBuZXcgRShcIltNQVhfTkFNRV1cIixhKX07aC50b1N0cmluZz1mdW5jdGlvbigpe3JldHVybiB0aGlzLmJjfTtmdW5jdGlvbiBUZCgpe31tYShUZCxPZCk7aD1UZC5wcm90b3R5cGU7aC5jb21wYXJlPWZ1bmN0aW9uKGEsYil7dmFyIGM9YS5TLkEoKSxkPWIuUy5BKCksYz1jLkNjKGQpO3JldHVybiAwPT09Yz9TYihhLm5hbWUsYi5uYW1lKTpjfTtoLkhjPWZ1bmN0aW9uKGEpe3JldHVybiFhLkEoKS5lKCl9O2gueGQ9ZnVuY3Rpb24oYSxiKXtyZXR1cm4hYS5BKCkuWihiLkEoKSl9O2guU2M9ZnVuY3Rpb24oKXtyZXR1cm4gUWR9O2guUGM9ZnVuY3Rpb24oKXtyZXR1cm4gbmV3IEUoXCJbTUFYX05BTUVdXCIsbmV3IHRjKFwiW1BSSU9SSVRZLVBPU1RdXCIsU2QpKX07aC5PYz1mdW5jdGlvbihhLGIpe3ZhciBjPUwoYSk7cmV0dXJuIG5ldyBFKGIsbmV3IHRjKFwiW1BSSU9SSVRZLVBPU1RdXCIsYykpfTtcbmgudG9TdHJpbmc9ZnVuY3Rpb24oKXtyZXR1cm5cIi5wcmlvcml0eVwifTt2YXIgTT1uZXcgVGQ7ZnVuY3Rpb24gVWQoKXt9bWEoVWQsT2QpO2g9VWQucHJvdG90eXBlO2guY29tcGFyZT1mdW5jdGlvbihhLGIpe3JldHVybiBTYihhLm5hbWUsYi5uYW1lKX07aC5IYz1mdW5jdGlvbigpe3Rocm93IEhjKFwiS2V5SW5kZXguaXNEZWZpbmVkT24gbm90IGV4cGVjdGVkIHRvIGJlIGNhbGxlZC5cIik7fTtoLnhkPWZ1bmN0aW9uKCl7cmV0dXJuITF9O2guU2M9ZnVuY3Rpb24oKXtyZXR1cm4gUWR9O2guUGM9ZnVuY3Rpb24oKXtyZXR1cm4gbmV3IEUoXCJbTUFYX05BTUVdXCIsQyl9O2guT2M9ZnVuY3Rpb24oYSl7SihwKGEpLFwiS2V5SW5kZXggaW5kZXhWYWx1ZSBtdXN0IGFsd2F5cyBiZSBhIHN0cmluZy5cIik7cmV0dXJuIG5ldyBFKGEsQyl9O2gudG9TdHJpbmc9ZnVuY3Rpb24oKXtyZXR1cm5cIi5rZXlcIn07dmFyIFZkPW5ldyBVZDtmdW5jdGlvbiBXZCgpe31tYShXZCxPZCk7aD1XZC5wcm90b3R5cGU7XG5oLmNvbXBhcmU9ZnVuY3Rpb24oYSxiKXt2YXIgYz1hLlMuQ2MoYi5TKTtyZXR1cm4gMD09PWM/U2IoYS5uYW1lLGIubmFtZSk6Y307aC5IYz1mdW5jdGlvbigpe3JldHVybiEwfTtoLnhkPWZ1bmN0aW9uKGEsYil7cmV0dXJuIWEuWihiKX07aC5TYz1mdW5jdGlvbigpe3JldHVybiBRZH07aC5QYz1mdW5jdGlvbigpe3JldHVybiBYZH07aC5PYz1mdW5jdGlvbihhLGIpe3ZhciBjPUwoYSk7cmV0dXJuIG5ldyBFKGIsYyl9O2gudG9TdHJpbmc9ZnVuY3Rpb24oKXtyZXR1cm5cIi52YWx1ZVwifTt2YXIgWWQ9bmV3IFdkO2Z1bmN0aW9uIFpkKCl7dGhpcy5SYj10aGlzLm5hPXRoaXMuTGI9dGhpcy5sYT10aGlzLmlhPSExO3RoaXMuamE9MDt0aGlzLk5iPVwiXCI7dGhpcy5kYz1udWxsO3RoaXMueGI9XCJcIjt0aGlzLmFjPW51bGw7dGhpcy52Yj1cIlwiO3RoaXMuZz1NfXZhciAkZD1uZXcgWmQ7ZnVuY3Rpb24gc2QoYSl7cmV0dXJuXCJcIj09PWEuTmI/YS5sYTpcImxcIj09PWEuTmJ9ZnVuY3Rpb24gb2QoYSl7SihhLmxhLFwiT25seSB2YWxpZCBpZiBzdGFydCBoYXMgYmVlbiBzZXRcIik7cmV0dXJuIGEuZGN9ZnVuY3Rpb24gbmQoYSl7SihhLmxhLFwiT25seSB2YWxpZCBpZiBzdGFydCBoYXMgYmVlbiBzZXRcIik7cmV0dXJuIGEuTGI/YS54YjpcIltNSU5fTkFNRV1cIn1mdW5jdGlvbiBxZChhKXtKKGEubmEsXCJPbmx5IHZhbGlkIGlmIGVuZCBoYXMgYmVlbiBzZXRcIik7cmV0dXJuIGEuYWN9XG5mdW5jdGlvbiBwZChhKXtKKGEubmEsXCJPbmx5IHZhbGlkIGlmIGVuZCBoYXMgYmVlbiBzZXRcIik7cmV0dXJuIGEuUmI/YS52YjpcIltNQVhfTkFNRV1cIn1mdW5jdGlvbiBhZShhKXt2YXIgYj1uZXcgWmQ7Yi5pYT1hLmlhO2IuamE9YS5qYTtiLmxhPWEubGE7Yi5kYz1hLmRjO2IuTGI9YS5MYjtiLnhiPWEueGI7Yi5uYT1hLm5hO2IuYWM9YS5hYztiLlJiPWEuUmI7Yi52Yj1hLnZiO2IuZz1hLmc7cmV0dXJuIGJ9aD1aZC5wcm90b3R5cGU7aC5HZT1mdW5jdGlvbihhKXt2YXIgYj1hZSh0aGlzKTtiLmlhPSEwO2IuamE9YTtiLk5iPVwiXCI7cmV0dXJuIGJ9O2guSGU9ZnVuY3Rpb24oYSl7dmFyIGI9YWUodGhpcyk7Yi5pYT0hMDtiLmphPWE7Yi5OYj1cImxcIjtyZXR1cm4gYn07aC5JZT1mdW5jdGlvbihhKXt2YXIgYj1hZSh0aGlzKTtiLmlhPSEwO2IuamE9YTtiLk5iPVwiclwiO3JldHVybiBifTtcbmguWGQ9ZnVuY3Rpb24oYSxiKXt2YXIgYz1hZSh0aGlzKTtjLmxhPSEwO24oYSl8fChhPW51bGwpO2MuZGM9YTtudWxsIT1iPyhjLkxiPSEwLGMueGI9Yik6KGMuTGI9ITEsYy54Yj1cIlwiKTtyZXR1cm4gY307aC5xZD1mdW5jdGlvbihhLGIpe3ZhciBjPWFlKHRoaXMpO2MubmE9ITA7bihhKXx8KGE9bnVsbCk7Yy5hYz1hO24oYik/KGMuUmI9ITAsYy52Yj1iKTooYy5ZZz0hMSxjLnZiPVwiXCIpO3JldHVybiBjfTtmdW5jdGlvbiBiZShhLGIpe3ZhciBjPWFlKGEpO2MuZz1iO3JldHVybiBjfWZ1bmN0aW9uIGNlKGEpe3ZhciBiPXt9O2EubGEmJihiLnNwPWEuZGMsYS5MYiYmKGIuc249YS54YikpO2EubmEmJihiLmVwPWEuYWMsYS5SYiYmKGIuZW49YS52YikpO2lmKGEuaWEpe2IubD1hLmphO3ZhciBjPWEuTmI7XCJcIj09PWMmJihjPXNkKGEpP1wibFwiOlwiclwiKTtiLnZmPWN9YS5nIT09TSYmKGIuaT1hLmcudG9TdHJpbmcoKSk7cmV0dXJuIGJ9XG5mdW5jdGlvbiBkZShhKXtyZXR1cm4hKGEubGF8fGEubmF8fGEuaWEpfWZ1bmN0aW9uIGVlKGEpe3ZhciBiPXt9O2lmKGRlKGEpJiZhLmc9PU0pcmV0dXJuIGI7dmFyIGM7YS5nPT09TT9jPVwiJHByaW9yaXR5XCI6YS5nPT09WWQ/Yz1cIiR2YWx1ZVwiOmEuZz09PVZkP2M9XCIka2V5XCI6KEooYS5nIGluc3RhbmNlb2YgUmQsXCJVbnJlY29nbml6ZWQgaW5kZXggdHlwZSFcIiksYz1hLmcudG9TdHJpbmcoKSk7Yi5vcmRlckJ5PUIoYyk7YS5sYSYmKGIuc3RhcnRBdD1CKGEuZGMpLGEuTGImJihiLnN0YXJ0QXQrPVwiLFwiK0IoYS54YikpKTthLm5hJiYoYi5lbmRBdD1CKGEuYWMpLGEuUmImJihiLmVuZEF0Kz1cIixcIitCKGEudmIpKSk7YS5pYSYmKHNkKGEpP2IubGltaXRUb0ZpcnN0PWEuamE6Yi5saW1pdFRvTGFzdD1hLmphKTtyZXR1cm4gYn1oLnRvU3RyaW5nPWZ1bmN0aW9uKCl7cmV0dXJuIEIoY2UodGhpcykpfTtmdW5jdGlvbiBmZShhLGIpe3RoaXMueWQ9YTt0aGlzLmNjPWJ9ZmUucHJvdG90eXBlLmdldD1mdW5jdGlvbihhKXt2YXIgYj13KHRoaXMueWQsYSk7aWYoIWIpdGhyb3cgRXJyb3IoXCJObyBpbmRleCBkZWZpbmVkIGZvciBcIithKTtyZXR1cm4gYj09PVBkP251bGw6Yn07ZnVuY3Rpb24gZ2UoYSxiLGMpe3ZhciBkPW5hKGEueWQsZnVuY3Rpb24oZCxmKXt2YXIgZz13KGEuY2MsZik7SihnLFwiTWlzc2luZyBpbmRleCBpbXBsZW1lbnRhdGlvbiBmb3IgXCIrZik7aWYoZD09PVBkKXtpZihnLkhjKGIuUykpe2Zvcih2YXIgaz1bXSxsPWMuV2IoUWIpLG09SChsKTttOyltLm5hbWUhPWIubmFtZSYmay5wdXNoKG0pLG09SChsKTtrLnB1c2goYik7cmV0dXJuIGhlKGssdWQoZykpfXJldHVybiBQZH1nPWMuZ2V0KGIubmFtZSk7az1kO2cmJihrPWsucmVtb3ZlKG5ldyBFKGIubmFtZSxnKSkpO3JldHVybiBrLk5hKGIsYi5TKX0pO3JldHVybiBuZXcgZmUoZCxhLmNjKX1cbmZ1bmN0aW9uIGllKGEsYixjKXt2YXIgZD1uYShhLnlkLGZ1bmN0aW9uKGEpe2lmKGE9PT1QZClyZXR1cm4gYTt2YXIgZD1jLmdldChiLm5hbWUpO3JldHVybiBkP2EucmVtb3ZlKG5ldyBFKGIubmFtZSxkKSk6YX0pO3JldHVybiBuZXcgZmUoZCxhLmNjKX12YXIgamU9bmV3IGZlKHtcIi5wcmlvcml0eVwiOlBkfSx7XCIucHJpb3JpdHlcIjpNfSk7ZnVuY3Rpb24gdGMoYSxiKXt0aGlzLkM9YTtKKG4odGhpcy5DKSYmbnVsbCE9PXRoaXMuQyxcIkxlYWZOb2RlIHNob3VsZG4ndCBiZSBjcmVhdGVkIHdpdGggbnVsbC91bmRlZmluZWQgdmFsdWUuXCIpO3RoaXMuYmE9Ynx8QztrZSh0aGlzLmJhKTt0aGlzLkJiPW51bGx9aD10Yy5wcm90b3R5cGU7aC5OPWZ1bmN0aW9uKCl7cmV0dXJuITB9O2guQT1mdW5jdGlvbigpe3JldHVybiB0aGlzLmJhfTtoLmRhPWZ1bmN0aW9uKGEpe3JldHVybiBuZXcgdGModGhpcy5DLGEpfTtoLk09ZnVuY3Rpb24oYSl7cmV0dXJuXCIucHJpb3JpdHlcIj09PWE/dGhpcy5iYTpDfTtoLm9hPWZ1bmN0aW9uKGEpe3JldHVybiBhLmUoKT90aGlzOlwiLnByaW9yaXR5XCI9PT1PKGEpP3RoaXMuYmE6Q307aC5IYT1mdW5jdGlvbigpe3JldHVybiExfTtoLnFmPWZ1bmN0aW9uKCl7cmV0dXJuIG51bGx9O1xuaC5RPWZ1bmN0aW9uKGEsYil7cmV0dXJuXCIucHJpb3JpdHlcIj09PWE/dGhpcy5kYShiKTpiLmUoKSYmXCIucHJpb3JpdHlcIiE9PWE/dGhpczpDLlEoYSxiKS5kYSh0aGlzLmJhKX07aC5HPWZ1bmN0aW9uKGEsYil7dmFyIGM9TyhhKTtpZihudWxsPT09YylyZXR1cm4gYjtpZihiLmUoKSYmXCIucHJpb3JpdHlcIiE9PWMpcmV0dXJuIHRoaXM7SihcIi5wcmlvcml0eVwiIT09Y3x8MT09PXVjKGEpLFwiLnByaW9yaXR5IG11c3QgYmUgdGhlIGxhc3QgdG9rZW4gaW4gYSBwYXRoXCIpO3JldHVybiB0aGlzLlEoYyxDLkcoRyhhKSxiKSl9O2guZT1mdW5jdGlvbigpe3JldHVybiExfTtoLkRiPWZ1bmN0aW9uKCl7cmV0dXJuIDB9O2guSz1mdW5jdGlvbihhKXtyZXR1cm4gYSYmIXRoaXMuQSgpLmUoKT97XCIudmFsdWVcIjp0aGlzLkJhKCksXCIucHJpb3JpdHlcIjp0aGlzLkEoKS5LKCl9OnRoaXMuQmEoKX07XG5oLmhhc2g9ZnVuY3Rpb24oKXtpZihudWxsPT09dGhpcy5CYil7dmFyIGE9XCJcIjt0aGlzLmJhLmUoKXx8KGErPVwicHJpb3JpdHk6XCIrbGUodGhpcy5iYS5LKCkpK1wiOlwiKTt2YXIgYj10eXBlb2YgdGhpcy5DLGE9YSsoYitcIjpcIiksYT1cIm51bWJlclwiPT09Yj9hK1pjKHRoaXMuQyk6YSt0aGlzLkM7dGhpcy5CYj1KYyhhKX1yZXR1cm4gdGhpcy5CYn07aC5CYT1mdW5jdGlvbigpe3JldHVybiB0aGlzLkN9O2guQ2M9ZnVuY3Rpb24oYSl7aWYoYT09PUMpcmV0dXJuIDE7aWYoYSBpbnN0YW5jZW9mIFQpcmV0dXJuLTE7SihhLk4oKSxcIlVua25vd24gbm9kZSB0eXBlXCIpO3ZhciBiPXR5cGVvZiBhLkMsYz10eXBlb2YgdGhpcy5DLGQ9TmEobWUsYiksZT1OYShtZSxjKTtKKDA8PWQsXCJVbmtub3duIGxlYWYgdHlwZTogXCIrYik7SigwPD1lLFwiVW5rbm93biBsZWFmIHR5cGU6IFwiK2MpO3JldHVybiBkPT09ZT9cIm9iamVjdFwiPT09Yz8wOnRoaXMuQzxhLkM/LTE6dGhpcy5DPT09YS5DPzA6MTplLWR9O1xudmFyIG1lPVtcIm9iamVjdFwiLFwiYm9vbGVhblwiLFwibnVtYmVyXCIsXCJzdHJpbmdcIl07dGMucHJvdG90eXBlLm1iPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXN9O3RjLnByb3RvdHlwZS5JYz1mdW5jdGlvbigpe3JldHVybiEwfTt0Yy5wcm90b3R5cGUuWj1mdW5jdGlvbihhKXtyZXR1cm4gYT09PXRoaXM/ITA6YS5OKCk/dGhpcy5DPT09YS5DJiZ0aGlzLmJhLlooYS5iYSk6ITF9O3RjLnByb3RvdHlwZS50b1N0cmluZz1mdW5jdGlvbigpe3JldHVybiBCKHRoaXMuSyghMCkpfTtmdW5jdGlvbiBUKGEsYixjKXt0aGlzLm09YTsodGhpcy5iYT1iKSYma2UodGhpcy5iYSk7YS5lKCkmJkooIXRoaXMuYmF8fHRoaXMuYmEuZSgpLFwiQW4gZW1wdHkgbm9kZSBjYW5ub3QgaGF2ZSBhIHByaW9yaXR5XCIpO3RoaXMud2I9Yzt0aGlzLkJiPW51bGx9aD1ULnByb3RvdHlwZTtoLk49ZnVuY3Rpb24oKXtyZXR1cm4hMX07aC5BPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuYmF8fEN9O2guZGE9ZnVuY3Rpb24oYSl7cmV0dXJuIHRoaXMubS5lKCk/dGhpczpuZXcgVCh0aGlzLm0sYSx0aGlzLndiKX07aC5NPWZ1bmN0aW9uKGEpe2lmKFwiLnByaW9yaXR5XCI9PT1hKXJldHVybiB0aGlzLkEoKTthPXRoaXMubS5nZXQoYSk7cmV0dXJuIG51bGw9PT1hP0M6YX07aC5vYT1mdW5jdGlvbihhKXt2YXIgYj1PKGEpO3JldHVybiBudWxsPT09Yj90aGlzOnRoaXMuTShiKS5vYShHKGEpKX07aC5IYT1mdW5jdGlvbihhKXtyZXR1cm4gbnVsbCE9PXRoaXMubS5nZXQoYSl9O1xuaC5RPWZ1bmN0aW9uKGEsYil7SihiLFwiV2Ugc2hvdWxkIGFsd2F5cyBiZSBwYXNzaW5nIHNuYXBzaG90IG5vZGVzXCIpO2lmKFwiLnByaW9yaXR5XCI9PT1hKXJldHVybiB0aGlzLmRhKGIpO3ZhciBjPW5ldyBFKGEsYiksZCxlO2IuZSgpPyhkPXRoaXMubS5yZW1vdmUoYSksYz1pZSh0aGlzLndiLGMsdGhpcy5tKSk6KGQ9dGhpcy5tLk5hKGEsYiksYz1nZSh0aGlzLndiLGMsdGhpcy5tKSk7ZT1kLmUoKT9DOnRoaXMuYmE7cmV0dXJuIG5ldyBUKGQsZSxjKX07aC5HPWZ1bmN0aW9uKGEsYil7dmFyIGM9TyhhKTtpZihudWxsPT09YylyZXR1cm4gYjtKKFwiLnByaW9yaXR5XCIhPT1PKGEpfHwxPT09dWMoYSksXCIucHJpb3JpdHkgbXVzdCBiZSB0aGUgbGFzdCB0b2tlbiBpbiBhIHBhdGhcIik7dmFyIGQ9dGhpcy5NKGMpLkcoRyhhKSxiKTtyZXR1cm4gdGhpcy5RKGMsZCl9O2guZT1mdW5jdGlvbigpe3JldHVybiB0aGlzLm0uZSgpfTtoLkRiPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMubS5jb3VudCgpfTtcbnZhciBuZT0vXigwfFsxLTldXFxkKikkLztoPVQucHJvdG90eXBlO2guSz1mdW5jdGlvbihhKXtpZih0aGlzLmUoKSlyZXR1cm4gbnVsbDt2YXIgYj17fSxjPTAsZD0wLGU9ITA7dGhpcy5VKE0sZnVuY3Rpb24oZixnKXtiW2ZdPWcuSyhhKTtjKys7ZSYmbmUudGVzdChmKT9kPU1hdGgubWF4KGQsTnVtYmVyKGYpKTplPSExfSk7aWYoIWEmJmUmJmQ8MipjKXt2YXIgZj1bXSxnO2ZvcihnIGluIGIpZltnXT1iW2ddO3JldHVybiBmfWEmJiF0aGlzLkEoKS5lKCkmJihiW1wiLnByaW9yaXR5XCJdPXRoaXMuQSgpLksoKSk7cmV0dXJuIGJ9O2guaGFzaD1mdW5jdGlvbigpe2lmKG51bGw9PT10aGlzLkJiKXt2YXIgYT1cIlwiO3RoaXMuQSgpLmUoKXx8KGErPVwicHJpb3JpdHk6XCIrbGUodGhpcy5BKCkuSygpKStcIjpcIik7dGhpcy5VKE0sZnVuY3Rpb24oYixjKXt2YXIgZD1jLmhhc2goKTtcIlwiIT09ZCYmKGErPVwiOlwiK2IrXCI6XCIrZCl9KTt0aGlzLkJiPVwiXCI9PT1hP1wiXCI6SmMoYSl9cmV0dXJuIHRoaXMuQmJ9O1xuaC5xZj1mdW5jdGlvbihhLGIsYyl7cmV0dXJuKGM9b2UodGhpcyxjKSk/KGE9Y2MoYyxuZXcgRShhLGIpKSk/YS5uYW1lOm51bGw6Y2ModGhpcy5tLGEpfTtmdW5jdGlvbiB3ZChhLGIpe3ZhciBjO2M9KGM9b2UoYSxiKSk/KGM9Yy5SYygpKSYmYy5uYW1lOmEubS5SYygpO3JldHVybiBjP25ldyBFKGMsYS5tLmdldChjKSk6bnVsbH1mdW5jdGlvbiB4ZChhLGIpe3ZhciBjO2M9KGM9b2UoYSxiKSk/KGM9Yy5lYygpKSYmYy5uYW1lOmEubS5lYygpO3JldHVybiBjP25ldyBFKGMsYS5tLmdldChjKSk6bnVsbH1oLlU9ZnVuY3Rpb24oYSxiKXt2YXIgYz1vZSh0aGlzLGEpO3JldHVybiBjP2MuaGEoZnVuY3Rpb24oYSl7cmV0dXJuIGIoYS5uYW1lLGEuUyl9KTp0aGlzLm0uaGEoYil9O2guV2I9ZnVuY3Rpb24oYSl7cmV0dXJuIHRoaXMuWGIoYS5TYygpLGEpfTtcbmguWGI9ZnVuY3Rpb24oYSxiKXt2YXIgYz1vZSh0aGlzLGIpO2lmKGMpcmV0dXJuIGMuWGIoYSxmdW5jdGlvbihhKXtyZXR1cm4gYX0pO2Zvcih2YXIgYz10aGlzLm0uWGIoYS5uYW1lLFFiKSxkPWVjKGMpO251bGwhPWQmJjA+Yi5jb21wYXJlKGQsYSk7KUgoYyksZD1lYyhjKTtyZXR1cm4gY307aC5yZj1mdW5jdGlvbihhKXtyZXR1cm4gdGhpcy5aYihhLlBjKCksYSl9O2guWmI9ZnVuY3Rpb24oYSxiKXt2YXIgYz1vZSh0aGlzLGIpO2lmKGMpcmV0dXJuIGMuWmIoYSxmdW5jdGlvbihhKXtyZXR1cm4gYX0pO2Zvcih2YXIgYz10aGlzLm0uWmIoYS5uYW1lLFFiKSxkPWVjKGMpO251bGwhPWQmJjA8Yi5jb21wYXJlKGQsYSk7KUgoYyksZD1lYyhjKTtyZXR1cm4gY307aC5DYz1mdW5jdGlvbihhKXtyZXR1cm4gdGhpcy5lKCk/YS5lKCk/MDotMTphLk4oKXx8YS5lKCk/MTphPT09U2Q/LTE6MH07XG5oLm1iPWZ1bmN0aW9uKGEpe2lmKGE9PT1WZHx8dGEodGhpcy53Yi5jYyxhLnRvU3RyaW5nKCkpKXJldHVybiB0aGlzO3ZhciBiPXRoaXMud2IsYz10aGlzLm07SihhIT09VmQsXCJLZXlJbmRleCBhbHdheXMgZXhpc3RzIGFuZCBpc24ndCBtZWFudCB0byBiZSBhZGRlZCB0byB0aGUgSW5kZXhNYXAuXCIpO2Zvcih2YXIgZD1bXSxlPSExLGM9Yy5XYihRYiksZj1IKGMpO2Y7KWU9ZXx8YS5IYyhmLlMpLGQucHVzaChmKSxmPUgoYyk7ZD1lP2hlKGQsdWQoYSkpOlBkO2U9YS50b1N0cmluZygpO2M9eGEoYi5jYyk7Y1tlXT1hO2E9eGEoYi55ZCk7YVtlXT1kO3JldHVybiBuZXcgVCh0aGlzLm0sdGhpcy5iYSxuZXcgZmUoYSxjKSl9O2guSWM9ZnVuY3Rpb24oYSl7cmV0dXJuIGE9PT1WZHx8dGEodGhpcy53Yi5jYyxhLnRvU3RyaW5nKCkpfTtcbmguWj1mdW5jdGlvbihhKXtpZihhPT09dGhpcylyZXR1cm4hMDtpZihhLk4oKSlyZXR1cm4hMTtpZih0aGlzLkEoKS5aKGEuQSgpKSYmdGhpcy5tLmNvdW50KCk9PT1hLm0uY291bnQoKSl7dmFyIGI9dGhpcy5XYihNKTthPWEuV2IoTSk7Zm9yKHZhciBjPUgoYiksZD1IKGEpO2MmJmQ7KXtpZihjLm5hbWUhPT1kLm5hbWV8fCFjLlMuWihkLlMpKXJldHVybiExO2M9SChiKTtkPUgoYSl9cmV0dXJuIG51bGw9PT1jJiZudWxsPT09ZH1yZXR1cm4hMX07ZnVuY3Rpb24gb2UoYSxiKXtyZXR1cm4gYj09PVZkP251bGw6YS53Yi5nZXQoYi50b1N0cmluZygpKX1oLnRvU3RyaW5nPWZ1bmN0aW9uKCl7cmV0dXJuIEIodGhpcy5LKCEwKSl9O2Z1bmN0aW9uIEwoYSxiKXtpZihudWxsPT09YSlyZXR1cm4gQzt2YXIgYz1udWxsO1wib2JqZWN0XCI9PT10eXBlb2YgYSYmXCIucHJpb3JpdHlcImluIGE/Yz1hW1wiLnByaW9yaXR5XCJdOlwidW5kZWZpbmVkXCIhPT10eXBlb2YgYiYmKGM9Yik7SihudWxsPT09Y3x8XCJzdHJpbmdcIj09PXR5cGVvZiBjfHxcIm51bWJlclwiPT09dHlwZW9mIGN8fFwib2JqZWN0XCI9PT10eXBlb2YgYyYmXCIuc3ZcImluIGMsXCJJbnZhbGlkIHByaW9yaXR5IHR5cGUgZm91bmQ6IFwiK3R5cGVvZiBjKTtcIm9iamVjdFwiPT09dHlwZW9mIGEmJlwiLnZhbHVlXCJpbiBhJiZudWxsIT09YVtcIi52YWx1ZVwiXSYmKGE9YVtcIi52YWx1ZVwiXSk7aWYoXCJvYmplY3RcIiE9PXR5cGVvZiBhfHxcIi5zdlwiaW4gYSlyZXR1cm4gbmV3IHRjKGEsTChjKSk7aWYoYSBpbnN0YW5jZW9mIEFycmF5KXt2YXIgZD1DLGU9YTtyKGUsZnVuY3Rpb24oYSxiKXtpZih1KGUsYikmJlwiLlwiIT09Yi5zdWJzdHJpbmcoMCwxKSl7dmFyIGM9TChhKTtpZihjLk4oKXx8IWMuZSgpKWQ9XG5kLlEoYixjKX19KTtyZXR1cm4gZC5kYShMKGMpKX12YXIgZj1bXSxnPSExLGs9YTtoYihrLGZ1bmN0aW9uKGEpe2lmKFwic3RyaW5nXCIhPT10eXBlb2YgYXx8XCIuXCIhPT1hLnN1YnN0cmluZygwLDEpKXt2YXIgYj1MKGtbYV0pO2IuZSgpfHwoZz1nfHwhYi5BKCkuZSgpLGYucHVzaChuZXcgRShhLGIpKSl9fSk7aWYoMD09Zi5sZW5ndGgpcmV0dXJuIEM7dmFyIGw9aGUoZixSYixmdW5jdGlvbihhKXtyZXR1cm4gYS5uYW1lfSxUYik7aWYoZyl7dmFyIG09aGUoZix1ZChNKSk7cmV0dXJuIG5ldyBUKGwsTChjKSxuZXcgZmUoe1wiLnByaW9yaXR5XCI6bX0se1wiLnByaW9yaXR5XCI6TX0pKX1yZXR1cm4gbmV3IFQobCxMKGMpLGplKX12YXIgcGU9TWF0aC5sb2coMik7XG5mdW5jdGlvbiBxZShhKXt0aGlzLmNvdW50PXBhcnNlSW50KE1hdGgubG9nKGErMSkvcGUsMTApO3RoaXMuaGY9dGhpcy5jb3VudC0xO3RoaXMuYmc9YSsxJnBhcnNlSW50KEFycmF5KHRoaXMuY291bnQrMSkuam9pbihcIjFcIiksMil9ZnVuY3Rpb24gcmUoYSl7dmFyIGI9IShhLmJnJjE8PGEuaGYpO2EuaGYtLTtyZXR1cm4gYn1cbmZ1bmN0aW9uIGhlKGEsYixjLGQpe2Z1bmN0aW9uIGUoYixkKXt2YXIgZj1kLWI7aWYoMD09ZilyZXR1cm4gbnVsbDtpZigxPT1mKXt2YXIgbT1hW2JdLHY9Yz9jKG0pOm07cmV0dXJuIG5ldyBmYyh2LG0uUywhMSxudWxsLG51bGwpfXZhciBtPXBhcnNlSW50KGYvMiwxMCkrYixmPWUoYixtKSx5PWUobSsxLGQpLG09YVttXSx2PWM/YyhtKTptO3JldHVybiBuZXcgZmModixtLlMsITEsZix5KX1hLnNvcnQoYik7dmFyIGY9ZnVuY3Rpb24oYil7ZnVuY3Rpb24gZChiLGcpe3ZhciBrPXYtYix5PXY7di09Yjt2YXIgeT1lKGsrMSx5KSxrPWFba10sST1jP2Moayk6ayx5PW5ldyBmYyhJLGsuUyxnLG51bGwseSk7Zj9mLmxlZnQ9eTptPXk7Zj15fWZvcih2YXIgZj1udWxsLG09bnVsbCx2PWEubGVuZ3RoLHk9MDt5PGIuY291bnQ7Kyt5KXt2YXIgST1yZShiKSx2ZD1NYXRoLnBvdygyLGIuY291bnQtKHkrMSkpO0k/ZCh2ZCwhMSk6KGQodmQsITEpLGQodmQsITApKX1yZXR1cm4gbX0obmV3IHFlKGEubGVuZ3RoKSk7XG5yZXR1cm4gbnVsbCE9PWY/bmV3IGFjKGR8fGIsZik6bmV3IGFjKGR8fGIpfWZ1bmN0aW9uIGxlKGEpe3JldHVyblwibnVtYmVyXCI9PT10eXBlb2YgYT9cIm51bWJlcjpcIitaYyhhKTpcInN0cmluZzpcIithfWZ1bmN0aW9uIGtlKGEpe2lmKGEuTigpKXt2YXIgYj1hLksoKTtKKFwic3RyaW5nXCI9PT10eXBlb2YgYnx8XCJudW1iZXJcIj09PXR5cGVvZiBifHxcIm9iamVjdFwiPT09dHlwZW9mIGImJnUoYixcIi5zdlwiKSxcIlByaW9yaXR5IG11c3QgYmUgYSBzdHJpbmcgb3IgbnVtYmVyLlwiKX1lbHNlIEooYT09PVNkfHxhLmUoKSxcInByaW9yaXR5IG9mIHVuZXhwZWN0ZWQgdHlwZS5cIik7SihhPT09U2R8fGEuQSgpLmUoKSxcIlByaW9yaXR5IG5vZGVzIGNhbid0IGhhdmUgYSBwcmlvcml0eSBvZiB0aGVpciBvd24uXCIpfXZhciBDPW5ldyBUKG5ldyBhYyhUYiksbnVsbCxqZSk7ZnVuY3Rpb24gc2UoKXtULmNhbGwodGhpcyxuZXcgYWMoVGIpLEMsamUpfW1hKHNlLFQpO2g9c2UucHJvdG90eXBlO1xuaC5DYz1mdW5jdGlvbihhKXtyZXR1cm4gYT09PXRoaXM/MDoxfTtoLlo9ZnVuY3Rpb24oYSl7cmV0dXJuIGE9PT10aGlzfTtoLkE9ZnVuY3Rpb24oKXtyZXR1cm4gdGhpc307aC5NPWZ1bmN0aW9uKCl7cmV0dXJuIEN9O2guZT1mdW5jdGlvbigpe3JldHVybiExfTt2YXIgU2Q9bmV3IHNlLFFkPW5ldyBFKFwiW01JTl9OQU1FXVwiLEMpLFhkPW5ldyBFKFwiW01BWF9OQU1FXVwiLFNkKTtmdW5jdGlvbiBJZChhLGIpe3RoaXMuRD1hO3RoaXMuVWQ9Yn1mdW5jdGlvbiBGZChhLGIsYyxkKXtyZXR1cm4gbmV3IElkKG5ldyBzYihiLGMsZCksYS5VZCl9ZnVuY3Rpb24gSmQoYSl7cmV0dXJuIGEuRC4kP2EuRC5qKCk6bnVsbH1JZC5wcm90b3R5cGUudT1mdW5jdGlvbigpe3JldHVybiB0aGlzLlVkfTtmdW5jdGlvbiB0YihhKXtyZXR1cm4gYS5VZC4kP2EuVWQuaigpOm51bGx9O2Z1bmN0aW9uIHRlKGEsYil7dGhpcy5WPWE7dmFyIGM9YS5vLGQ9bmV3IGxkKGMuZyksYz1kZShjKT9uZXcgbGQoYy5nKTpjLmlhP25ldyByZChjKTpuZXcgbWQoYyk7dGhpcy5HZj1uZXcgemQoYyk7dmFyIGU9Yi51KCksZj1iLkQsZz1kLnRhKEMsZS5qKCksbnVsbCksaz1jLnRhKEMsZi5qKCksbnVsbCk7dGhpcy5LYT1uZXcgSWQobmV3IHNiKGssZi4kLGMuR2EoKSksbmV3IHNiKGcsZS4kLGQuR2EoKSkpO3RoaXMuWmE9W107dGhpcy5pZz1uZXcgZGQoYSl9ZnVuY3Rpb24gdWUoYSl7cmV0dXJuIGEuVn1oPXRlLnByb3RvdHlwZTtoLnU9ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5LYS51KCkuaigpfTtoLmhiPWZ1bmN0aW9uKGEpe3ZhciBiPXRiKHRoaXMuS2EpO3JldHVybiBiJiYoZGUodGhpcy5WLm8pfHwhYS5lKCkmJiFiLk0oTyhhKSkuZSgpKT9iLm9hKGEpOm51bGx9O2guZT1mdW5jdGlvbigpe3JldHVybiAwPT09dGhpcy5aYS5sZW5ndGh9O2guT2I9ZnVuY3Rpb24oYSl7dGhpcy5aYS5wdXNoKGEpfTtcbmgua2I9ZnVuY3Rpb24oYSxiKXt2YXIgYz1bXTtpZihiKXtKKG51bGw9PWEsXCJBIGNhbmNlbCBzaG91bGQgY2FuY2VsIGFsbCBldmVudCByZWdpc3RyYXRpb25zLlwiKTt2YXIgZD10aGlzLlYucGF0aDtPYSh0aGlzLlphLGZ1bmN0aW9uKGEpeyhhPWEuZmYoYixkKSkmJmMucHVzaChhKX0pfWlmKGEpe2Zvcih2YXIgZT1bXSxmPTA7Zjx0aGlzLlphLmxlbmd0aDsrK2Ype3ZhciBnPXRoaXMuWmFbZl07aWYoIWcubWF0Y2hlcyhhKSllLnB1c2goZyk7ZWxzZSBpZihhLnNmKCkpe2U9ZS5jb25jYXQodGhpcy5aYS5zbGljZShmKzEpKTticmVha319dGhpcy5aYT1lfWVsc2UgdGhpcy5aYT1bXTtyZXR1cm4gY307XG5oLmJiPWZ1bmN0aW9uKGEsYixjKXthLnR5cGU9PT1DZCYmbnVsbCE9PWEuc291cmNlLkliJiYoSih0Yih0aGlzLkthKSxcIldlIHNob3VsZCBhbHdheXMgaGF2ZSBhIGZ1bGwgY2FjaGUgYmVmb3JlIGhhbmRsaW5nIG1lcmdlc1wiKSxKKEpkKHRoaXMuS2EpLFwiTWlzc2luZyBldmVudCBjYWNoZSwgZXZlbiB0aG91Z2ggd2UgaGF2ZSBhIHNlcnZlciBjYWNoZVwiKSk7dmFyIGQ9dGhpcy5LYTthPXRoaXMuR2YuYmIoZCxhLGIsYyk7Yj10aGlzLkdmO2M9YS5oZTtKKGMuRC5qKCkuSWMoYi5JLmcpLFwiRXZlbnQgc25hcCBub3QgaW5kZXhlZFwiKTtKKGMudSgpLmooKS5JYyhiLkkuZyksXCJTZXJ2ZXIgc25hcCBub3QgaW5kZXhlZFwiKTtKKEhiKGEuaGUudSgpKXx8IUhiKGQudSgpKSxcIk9uY2UgYSBzZXJ2ZXIgc25hcCBpcyBjb21wbGV0ZSwgaXQgc2hvdWxkIG5ldmVyIGdvIGJhY2tcIik7dGhpcy5LYT1hLmhlO3JldHVybiB2ZSh0aGlzLGEuY2csYS5oZS5ELmooKSxudWxsKX07XG5mdW5jdGlvbiB3ZShhLGIpe3ZhciBjPWEuS2EuRCxkPVtdO2MuaigpLk4oKXx8Yy5qKCkuVShNLGZ1bmN0aW9uKGEsYil7ZC5wdXNoKG5ldyBEKFwiY2hpbGRfYWRkZWRcIixiLGEpKX0pO2MuJCYmZC5wdXNoKERiKGMuaigpKSk7cmV0dXJuIHZlKGEsZCxjLmooKSxiKX1mdW5jdGlvbiB2ZShhLGIsYyxkKXtyZXR1cm4gZWQoYS5pZyxiLGMsZD9bZF06YS5aYSl9O2Z1bmN0aW9uIHhlKGEsYixjKXt0aGlzLnR5cGU9Q2Q7dGhpcy5zb3VyY2U9YTt0aGlzLnBhdGg9Yjt0aGlzLmNoaWxkcmVuPWN9eGUucHJvdG90eXBlLldjPWZ1bmN0aW9uKGEpe2lmKHRoaXMucGF0aC5lKCkpcmV0dXJuIGE9dGhpcy5jaGlsZHJlbi5zdWJ0cmVlKG5ldyBLKGEpKSxhLmUoKT9udWxsOmEudmFsdWU/bmV3IFViKHRoaXMuc291cmNlLEYsYS52YWx1ZSk6bmV3IHhlKHRoaXMuc291cmNlLEYsYSk7SihPKHRoaXMucGF0aCk9PT1hLFwiQ2FuJ3QgZ2V0IGEgbWVyZ2UgZm9yIGEgY2hpbGQgbm90IG9uIHRoZSBwYXRoIG9mIHRoZSBvcGVyYXRpb25cIik7cmV0dXJuIG5ldyB4ZSh0aGlzLnNvdXJjZSxHKHRoaXMucGF0aCksdGhpcy5jaGlsZHJlbil9O3hlLnByb3RvdHlwZS50b1N0cmluZz1mdW5jdGlvbigpe3JldHVyblwiT3BlcmF0aW9uKFwiK3RoaXMucGF0aCtcIjogXCIrdGhpcy5zb3VyY2UudG9TdHJpbmcoKStcIiBtZXJnZTogXCIrdGhpcy5jaGlsZHJlbi50b1N0cmluZygpK1wiKVwifTt2YXIgVmI9MCxDZD0xLFhiPTIsJGI9MztmdW5jdGlvbiB5ZShhLGIsYyxkKXt0aGlzLnZlPWE7dGhpcy5vZj1iO3RoaXMuSWI9Yzt0aGlzLmFmPWQ7SighZHx8YixcIlRhZ2dlZCBxdWVyaWVzIG11c3QgYmUgZnJvbSBzZXJ2ZXIuXCIpfXZhciBZYj1uZXcgeWUoITAsITEsbnVsbCwhMSksemU9bmV3IHllKCExLCEwLG51bGwsITEpO3llLnByb3RvdHlwZS50b1N0cmluZz1mdW5jdGlvbigpe3JldHVybiB0aGlzLnZlP1widXNlclwiOnRoaXMuYWY/XCJzZXJ2ZXIocXVlcnlJRD1cIit0aGlzLkliK1wiKVwiOlwic2VydmVyXCJ9O2Z1bmN0aW9uIEFlKGEsYil7dGhpcy5mPU9jKFwicDpyZXN0OlwiKTt0aGlzLkg9YTt0aGlzLkdiPWI7dGhpcy5GYT1udWxsO3RoaXMuYWE9e319ZnVuY3Rpb24gQmUoYSxiKXtpZihuKGIpKXJldHVyblwidGFnJFwiK2I7dmFyIGM9YS5vO0ooZGUoYykmJmMuZz09TSxcInNob3VsZCBoYXZlIGEgdGFnIGlmIGl0J3Mgbm90IGEgZGVmYXVsdCBxdWVyeS5cIik7cmV0dXJuIGEucGF0aC50b1N0cmluZygpfWg9QWUucHJvdG90eXBlO1xuaC54Zj1mdW5jdGlvbihhLGIsYyxkKXt2YXIgZT1hLnBhdGgudG9TdHJpbmcoKTt0aGlzLmYoXCJMaXN0ZW4gY2FsbGVkIGZvciBcIitlK1wiIFwiK2Eud2EoKSk7dmFyIGY9QmUoYSxjKSxnPXt9O3RoaXMuYWFbZl09ZzthPWVlKGEubyk7dmFyIGs9dGhpcztDZSh0aGlzLGUrXCIuanNvblwiLGEsZnVuY3Rpb24oYSxiKXt2YXIgdj1iOzQwND09PWEmJihhPXY9bnVsbCk7bnVsbD09PWEmJmsuR2IoZSx2LCExLGMpO3coay5hYSxmKT09PWcmJmQoYT80MDE9PWE/XCJwZXJtaXNzaW9uX2RlbmllZFwiOlwicmVzdF9lcnJvcjpcIithOlwib2tcIixudWxsKX0pfTtoLk9mPWZ1bmN0aW9uKGEsYil7dmFyIGM9QmUoYSxiKTtkZWxldGUgdGhpcy5hYVtjXX07aC5QPWZ1bmN0aW9uKGEsYil7dGhpcy5GYT1hO3ZhciBjPWFkKGEpLGQ9Yy5kYXRhLGM9Yy5BYyYmYy5BYy5leHA7YiYmYihcIm9rXCIse2F1dGg6ZCxleHBpcmVzOmN9KX07aC5lZT1mdW5jdGlvbihhKXt0aGlzLkZhPW51bGw7YShcIm9rXCIsbnVsbCl9O1xuaC5MZT1mdW5jdGlvbigpe307aC5CZj1mdW5jdGlvbigpe307aC5HZD1mdW5jdGlvbigpe307aC5wdXQ9ZnVuY3Rpb24oKXt9O2gueWY9ZnVuY3Rpb24oKXt9O2guVGU9ZnVuY3Rpb24oKXt9O1xuZnVuY3Rpb24gQ2UoYSxiLGMsZCl7Yz1jfHx7fTtjLmZvcm1hdD1cImV4cG9ydFwiO2EuRmEmJihjLmF1dGg9YS5GYSk7dmFyIGU9KGEuSC5sYj9cImh0dHBzOi8vXCI6XCJodHRwOi8vXCIpK2EuSC5ob3N0K2IrXCI/XCIramIoYyk7YS5mKFwiU2VuZGluZyBSRVNUIHJlcXVlc3QgZm9yIFwiK2UpO3ZhciBmPW5ldyBYTUxIdHRwUmVxdWVzdDtmLm9ucmVhZHlzdGF0ZWNoYW5nZT1mdW5jdGlvbigpe2lmKGQmJjQ9PT1mLnJlYWR5U3RhdGUpe2EuZihcIlJFU1QgUmVzcG9uc2UgZm9yIFwiK2UrXCIgcmVjZWl2ZWQuIHN0YXR1czpcIixmLnN0YXR1cyxcInJlc3BvbnNlOlwiLGYucmVzcG9uc2VUZXh0KTt2YXIgYj1udWxsO2lmKDIwMDw9Zi5zdGF0dXMmJjMwMD5mLnN0YXR1cyl7dHJ5e2I9bWIoZi5yZXNwb25zZVRleHQpfWNhdGNoKGMpe1EoXCJGYWlsZWQgdG8gcGFyc2UgSlNPTiByZXNwb25zZSBmb3IgXCIrZStcIjogXCIrZi5yZXNwb25zZVRleHQpfWQobnVsbCxiKX1lbHNlIDQwMSE9PWYuc3RhdHVzJiY0MDQhPT1cbmYuc3RhdHVzJiZRKFwiR290IHVuc3VjY2Vzc2Z1bCBSRVNUIHJlc3BvbnNlIGZvciBcIitlK1wiIFN0YXR1czogXCIrZi5zdGF0dXMpLGQoZi5zdGF0dXMpO2Q9bnVsbH19O2Yub3BlbihcIkdFVFwiLGUsITApO2Yuc2VuZCgpfTtmdW5jdGlvbiBEZShhLGIpe3RoaXMudmFsdWU9YTt0aGlzLmNoaWxkcmVuPWJ8fEVlfXZhciBFZT1uZXcgYWMoZnVuY3Rpb24oYSxiKXtyZXR1cm4gYT09PWI/MDphPGI/LTE6MX0pO2Z1bmN0aW9uIEZlKGEpe3ZhciBiPU5kO3IoYSxmdW5jdGlvbihhLGQpe2I9Yi5zZXQobmV3IEsoZCksYSl9KTtyZXR1cm4gYn1oPURlLnByb3RvdHlwZTtoLmU9ZnVuY3Rpb24oKXtyZXR1cm4gbnVsbD09PXRoaXMudmFsdWUmJnRoaXMuY2hpbGRyZW4uZSgpfTtmdW5jdGlvbiBHZShhLGIsYyl7aWYobnVsbCE9YS52YWx1ZSYmYyhhLnZhbHVlKSlyZXR1cm57cGF0aDpGLHZhbHVlOmEudmFsdWV9O2lmKGIuZSgpKXJldHVybiBudWxsO3ZhciBkPU8oYik7YT1hLmNoaWxkcmVuLmdldChkKTtyZXR1cm4gbnVsbCE9PWE/KGI9R2UoYSxHKGIpLGMpLG51bGwhPWI/e3BhdGg6KG5ldyBLKGQpKS53KGIucGF0aCksdmFsdWU6Yi52YWx1ZX06bnVsbCk6bnVsbH1cbmZ1bmN0aW9uIEhlKGEsYil7cmV0dXJuIEdlKGEsYixmdW5jdGlvbigpe3JldHVybiEwfSl9aC5zdWJ0cmVlPWZ1bmN0aW9uKGEpe2lmKGEuZSgpKXJldHVybiB0aGlzO3ZhciBiPXRoaXMuY2hpbGRyZW4uZ2V0KE8oYSkpO3JldHVybiBudWxsIT09Yj9iLnN1YnRyZWUoRyhhKSk6TmR9O2guc2V0PWZ1bmN0aW9uKGEsYil7aWYoYS5lKCkpcmV0dXJuIG5ldyBEZShiLHRoaXMuY2hpbGRyZW4pO3ZhciBjPU8oYSksZD0odGhpcy5jaGlsZHJlbi5nZXQoYyl8fE5kKS5zZXQoRyhhKSxiKSxjPXRoaXMuY2hpbGRyZW4uTmEoYyxkKTtyZXR1cm4gbmV3IERlKHRoaXMudmFsdWUsYyl9O1xuaC5yZW1vdmU9ZnVuY3Rpb24oYSl7aWYoYS5lKCkpcmV0dXJuIHRoaXMuY2hpbGRyZW4uZSgpP05kOm5ldyBEZShudWxsLHRoaXMuY2hpbGRyZW4pO3ZhciBiPU8oYSksYz10aGlzLmNoaWxkcmVuLmdldChiKTtyZXR1cm4gYz8oYT1jLnJlbW92ZShHKGEpKSxiPWEuZSgpP3RoaXMuY2hpbGRyZW4ucmVtb3ZlKGIpOnRoaXMuY2hpbGRyZW4uTmEoYixhKSxudWxsPT09dGhpcy52YWx1ZSYmYi5lKCk/TmQ6bmV3IERlKHRoaXMudmFsdWUsYikpOnRoaXN9O2guZ2V0PWZ1bmN0aW9uKGEpe2lmKGEuZSgpKXJldHVybiB0aGlzLnZhbHVlO3ZhciBiPXRoaXMuY2hpbGRyZW4uZ2V0KE8oYSkpO3JldHVybiBiP2IuZ2V0KEcoYSkpOm51bGx9O1xuZnVuY3Rpb24gTWQoYSxiLGMpe2lmKGIuZSgpKXJldHVybiBjO3ZhciBkPU8oYik7Yj1NZChhLmNoaWxkcmVuLmdldChkKXx8TmQsRyhiKSxjKTtkPWIuZSgpP2EuY2hpbGRyZW4ucmVtb3ZlKGQpOmEuY2hpbGRyZW4uTmEoZCxiKTtyZXR1cm4gbmV3IERlKGEudmFsdWUsZCl9ZnVuY3Rpb24gSWUoYSxiKXtyZXR1cm4gSmUoYSxGLGIpfWZ1bmN0aW9uIEplKGEsYixjKXt2YXIgZD17fTthLmNoaWxkcmVuLmhhKGZ1bmN0aW9uKGEsZil7ZFthXT1KZShmLGIudyhhKSxjKX0pO3JldHVybiBjKGIsYS52YWx1ZSxkKX1mdW5jdGlvbiBLZShhLGIsYyl7cmV0dXJuIExlKGEsYixGLGMpfWZ1bmN0aW9uIExlKGEsYixjLGQpe3ZhciBlPWEudmFsdWU/ZChjLGEudmFsdWUpOiExO2lmKGUpcmV0dXJuIGU7aWYoYi5lKCkpcmV0dXJuIG51bGw7ZT1PKGIpO3JldHVybihhPWEuY2hpbGRyZW4uZ2V0KGUpKT9MZShhLEcoYiksYy53KGUpLGQpOm51bGx9XG5mdW5jdGlvbiBNZShhLGIsYyl7dmFyIGQ9RjtpZighYi5lKCkpe3ZhciBlPSEwO2EudmFsdWUmJihlPWMoZCxhLnZhbHVlKSk7ITA9PT1lJiYoZT1PKGIpLChhPWEuY2hpbGRyZW4uZ2V0KGUpKSYmTmUoYSxHKGIpLGQudyhlKSxjKSl9fWZ1bmN0aW9uIE5lKGEsYixjLGQpe2lmKGIuZSgpKXJldHVybiBhO2EudmFsdWUmJmQoYyxhLnZhbHVlKTt2YXIgZT1PKGIpO3JldHVybihhPWEuY2hpbGRyZW4uZ2V0KGUpKT9OZShhLEcoYiksYy53KGUpLGQpOk5kfWZ1bmN0aW9uIEtkKGEsYil7T2UoYSxGLGIpfWZ1bmN0aW9uIE9lKGEsYixjKXthLmNoaWxkcmVuLmhhKGZ1bmN0aW9uKGEsZSl7T2UoZSxiLncoYSksYyl9KTthLnZhbHVlJiZjKGIsYS52YWx1ZSl9ZnVuY3Rpb24gUGUoYSxiKXthLmNoaWxkcmVuLmhhKGZ1bmN0aW9uKGEsZCl7ZC52YWx1ZSYmYihhLGQudmFsdWUpfSl9dmFyIE5kPW5ldyBEZShudWxsKTtcbkRlLnByb3RvdHlwZS50b1N0cmluZz1mdW5jdGlvbigpe3ZhciBhPXt9O0tkKHRoaXMsZnVuY3Rpb24oYixjKXthW2IudG9TdHJpbmcoKV09Yy50b1N0cmluZygpfSk7cmV0dXJuIEIoYSl9O2Z1bmN0aW9uIFFlKGEpe3RoaXMuVz1hfXZhciBSZT1uZXcgUWUobmV3IERlKG51bGwpKTtmdW5jdGlvbiBTZShhLGIsYyl7aWYoYi5lKCkpcmV0dXJuIG5ldyBRZShuZXcgRGUoYykpO3ZhciBkPUhlKGEuVyxiKTtpZihudWxsIT1kKXt2YXIgZT1kLnBhdGgsZD1kLnZhbHVlO2I9TihlLGIpO2Q9ZC5HKGIsYyk7cmV0dXJuIG5ldyBRZShhLlcuc2V0KGUsZCkpfWE9TWQoYS5XLGIsbmV3IERlKGMpKTtyZXR1cm4gbmV3IFFlKGEpfWZ1bmN0aW9uIFRlKGEsYixjKXt2YXIgZD1hO2hiKGMsZnVuY3Rpb24oYSxjKXtkPVNlKGQsYi53KGEpLGMpfSk7cmV0dXJuIGR9UWUucHJvdG90eXBlLk9kPWZ1bmN0aW9uKGEpe2lmKGEuZSgpKXJldHVybiBSZTthPU1kKHRoaXMuVyxhLE5kKTtyZXR1cm4gbmV3IFFlKGEpfTtmdW5jdGlvbiBVZShhLGIpe3ZhciBjPUhlKGEuVyxiKTtyZXR1cm4gbnVsbCE9Yz9hLlcuZ2V0KGMucGF0aCkub2EoTihjLnBhdGgsYikpOm51bGx9XG5mdW5jdGlvbiBWZShhKXt2YXIgYj1bXSxjPWEuVy52YWx1ZTtudWxsIT1jP2MuTigpfHxjLlUoTSxmdW5jdGlvbihhLGMpe2IucHVzaChuZXcgRShhLGMpKX0pOmEuVy5jaGlsZHJlbi5oYShmdW5jdGlvbihhLGMpe251bGwhPWMudmFsdWUmJmIucHVzaChuZXcgRShhLGMudmFsdWUpKX0pO3JldHVybiBifWZ1bmN0aW9uIFdlKGEsYil7aWYoYi5lKCkpcmV0dXJuIGE7dmFyIGM9VWUoYSxiKTtyZXR1cm4gbnVsbCE9Yz9uZXcgUWUobmV3IERlKGMpKTpuZXcgUWUoYS5XLnN1YnRyZWUoYikpfVFlLnByb3RvdHlwZS5lPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuVy5lKCl9O1FlLnByb3RvdHlwZS5hcHBseT1mdW5jdGlvbihhKXtyZXR1cm4gWGUoRix0aGlzLlcsYSl9O1xuZnVuY3Rpb24gWGUoYSxiLGMpe2lmKG51bGwhPWIudmFsdWUpcmV0dXJuIGMuRyhhLGIudmFsdWUpO3ZhciBkPW51bGw7Yi5jaGlsZHJlbi5oYShmdW5jdGlvbihiLGYpe1wiLnByaW9yaXR5XCI9PT1iPyhKKG51bGwhPT1mLnZhbHVlLFwiUHJpb3JpdHkgd3JpdGVzIG11c3QgYWx3YXlzIGJlIGxlYWYgbm9kZXNcIiksZD1mLnZhbHVlKTpjPVhlKGEudyhiKSxmLGMpfSk7Yy5vYShhKS5lKCl8fG51bGw9PT1kfHwoYz1jLkcoYS53KFwiLnByaW9yaXR5XCIpLGQpKTtyZXR1cm4gY307ZnVuY3Rpb24gWWUoKXt0aGlzLlQ9UmU7dGhpcy56YT1bXTt0aGlzLkxjPS0xfWg9WWUucHJvdG90eXBlO1xuaC5PZD1mdW5jdGlvbihhKXt2YXIgYj1VYSh0aGlzLnphLGZ1bmN0aW9uKGIpe3JldHVybiBiLmllPT09YX0pO0ooMDw9YixcInJlbW92ZVdyaXRlIGNhbGxlZCB3aXRoIG5vbmV4aXN0ZW50IHdyaXRlSWQuXCIpO3ZhciBjPXRoaXMuemFbYl07dGhpcy56YS5zcGxpY2UoYiwxKTtmb3IodmFyIGQ9Yy52aXNpYmxlLGU9ITEsZj10aGlzLnphLmxlbmd0aC0xO2QmJjA8PWY7KXt2YXIgZz10aGlzLnphW2ZdO2cudmlzaWJsZSYmKGY+PWImJlplKGcsYy5wYXRoKT9kPSExOmMucGF0aC5jb250YWlucyhnLnBhdGgpJiYoZT0hMCkpO2YtLX1pZihkKXtpZihlKXRoaXMuVD0kZSh0aGlzLnphLGFmLEYpLHRoaXMuTGM9MDx0aGlzLnphLmxlbmd0aD90aGlzLnphW3RoaXMuemEubGVuZ3RoLTFdLmllOi0xO2Vsc2UgaWYoYy5JYSl0aGlzLlQ9dGhpcy5ULk9kKGMucGF0aCk7ZWxzZXt2YXIgaz10aGlzO3IoYy5jaGlsZHJlbixmdW5jdGlvbihhLGIpe2suVD1rLlQuT2QoYy5wYXRoLncoYikpfSl9cmV0dXJuIGMucGF0aH1yZXR1cm4gbnVsbH07XG5oLnVhPWZ1bmN0aW9uKGEsYixjLGQpe2lmKGN8fGQpe3ZhciBlPVdlKHRoaXMuVCxhKTtyZXR1cm4hZCYmZS5lKCk/YjpkfHxudWxsIT1ifHxudWxsIT1VZShlLEYpPyhlPSRlKHRoaXMuemEsZnVuY3Rpb24oYil7cmV0dXJuKGIudmlzaWJsZXx8ZCkmJighY3x8ISgwPD1OYShjLGIuaWUpKSkmJihiLnBhdGguY29udGFpbnMoYSl8fGEuY29udGFpbnMoYi5wYXRoKSl9LGEpLGI9Ynx8QyxlLmFwcGx5KGIpKTpudWxsfWU9VWUodGhpcy5ULGEpO2lmKG51bGwhPWUpcmV0dXJuIGU7ZT1XZSh0aGlzLlQsYSk7cmV0dXJuIGUuZSgpP2I6bnVsbCE9Ynx8bnVsbCE9VWUoZSxGKT8oYj1ifHxDLGUuYXBwbHkoYikpOm51bGx9O1xuaC54Yz1mdW5jdGlvbihhLGIpe3ZhciBjPUMsZD1VZSh0aGlzLlQsYSk7aWYoZClkLk4oKXx8ZC5VKE0sZnVuY3Rpb24oYSxiKXtjPWMuUShhLGIpfSk7ZWxzZSBpZihiKXt2YXIgZT1XZSh0aGlzLlQsYSk7Yi5VKE0sZnVuY3Rpb24oYSxiKXt2YXIgZD1XZShlLG5ldyBLKGEpKS5hcHBseShiKTtjPWMuUShhLGQpfSk7T2EoVmUoZSksZnVuY3Rpb24oYSl7Yz1jLlEoYS5uYW1lLGEuUyl9KX1lbHNlIGU9V2UodGhpcy5ULGEpLE9hKFZlKGUpLGZ1bmN0aW9uKGEpe2M9Yy5RKGEubmFtZSxhLlMpfSk7cmV0dXJuIGN9O2guaGQ9ZnVuY3Rpb24oYSxiLGMsZCl7SihjfHxkLFwiRWl0aGVyIGV4aXN0aW5nRXZlbnRTbmFwIG9yIGV4aXN0aW5nU2VydmVyU25hcCBtdXN0IGV4aXN0XCIpO2E9YS53KGIpO2lmKG51bGwhPVVlKHRoaXMuVCxhKSlyZXR1cm4gbnVsbDthPVdlKHRoaXMuVCxhKTtyZXR1cm4gYS5lKCk/ZC5vYShiKTphLmFwcGx5KGQub2EoYikpfTtcbmguWGE9ZnVuY3Rpb24oYSxiLGMpe2E9YS53KGIpO3ZhciBkPVVlKHRoaXMuVCxhKTtyZXR1cm4gbnVsbCE9ZD9kOnJiKGMsYik/V2UodGhpcy5ULGEpLmFwcGx5KGMuaigpLk0oYikpOm51bGx9O2guc2M9ZnVuY3Rpb24oYSl7cmV0dXJuIFVlKHRoaXMuVCxhKX07aC5tZT1mdW5jdGlvbihhLGIsYyxkLGUsZil7dmFyIGc7YT1XZSh0aGlzLlQsYSk7Zz1VZShhLEYpO2lmKG51bGw9PWcpaWYobnVsbCE9YilnPWEuYXBwbHkoYik7ZWxzZSByZXR1cm5bXTtnPWcubWIoZik7aWYoZy5lKCl8fGcuTigpKXJldHVybltdO2I9W107YT11ZChmKTtlPWU/Zy5aYihjLGYpOmcuWGIoYyxmKTtmb3IoZj1IKGUpO2YmJmIubGVuZ3RoPGQ7KTAhPT1hKGYsYykmJmIucHVzaChmKSxmPUgoZSk7cmV0dXJuIGJ9O1xuZnVuY3Rpb24gWmUoYSxiKXtyZXR1cm4gYS5JYT9hLnBhdGguY29udGFpbnMoYik6ISF1YShhLmNoaWxkcmVuLGZ1bmN0aW9uKGMsZCl7cmV0dXJuIGEucGF0aC53KGQpLmNvbnRhaW5zKGIpfSl9ZnVuY3Rpb24gYWYoYSl7cmV0dXJuIGEudmlzaWJsZX1cbmZ1bmN0aW9uICRlKGEsYixjKXtmb3IodmFyIGQ9UmUsZT0wO2U8YS5sZW5ndGg7KytlKXt2YXIgZj1hW2VdO2lmKGIoZikpe3ZhciBnPWYucGF0aDtpZihmLklhKWMuY29udGFpbnMoZyk/KGc9TihjLGcpLGQ9U2UoZCxnLGYuSWEpKTpnLmNvbnRhaW5zKGMpJiYoZz1OKGcsYyksZD1TZShkLEYsZi5JYS5vYShnKSkpO2Vsc2UgaWYoZi5jaGlsZHJlbilpZihjLmNvbnRhaW5zKGcpKWc9TihjLGcpLGQ9VGUoZCxnLGYuY2hpbGRyZW4pO2Vsc2V7aWYoZy5jb250YWlucyhjKSlpZihnPU4oZyxjKSxnLmUoKSlkPVRlKGQsRixmLmNoaWxkcmVuKTtlbHNlIGlmKGY9dyhmLmNoaWxkcmVuLE8oZykpKWY9Zi5vYShHKGcpKSxkPVNlKGQsRixmKX1lbHNlIHRocm93IEhjKFwiV3JpdGVSZWNvcmQgc2hvdWxkIGhhdmUgLnNuYXAgb3IgLmNoaWxkcmVuXCIpO319cmV0dXJuIGR9ZnVuY3Rpb24gYmYoYSxiKXt0aGlzLk1iPWE7dGhpcy5XPWJ9aD1iZi5wcm90b3R5cGU7XG5oLnVhPWZ1bmN0aW9uKGEsYixjKXtyZXR1cm4gdGhpcy5XLnVhKHRoaXMuTWIsYSxiLGMpfTtoLnhjPWZ1bmN0aW9uKGEpe3JldHVybiB0aGlzLlcueGModGhpcy5NYixhKX07aC5oZD1mdW5jdGlvbihhLGIsYyl7cmV0dXJuIHRoaXMuVy5oZCh0aGlzLk1iLGEsYixjKX07aC5zYz1mdW5jdGlvbihhKXtyZXR1cm4gdGhpcy5XLnNjKHRoaXMuTWIudyhhKSl9O2gubWU9ZnVuY3Rpb24oYSxiLGMsZCxlKXtyZXR1cm4gdGhpcy5XLm1lKHRoaXMuTWIsYSxiLGMsZCxlKX07aC5YYT1mdW5jdGlvbihhLGIpe3JldHVybiB0aGlzLlcuWGEodGhpcy5NYixhLGIpfTtoLnc9ZnVuY3Rpb24oYSl7cmV0dXJuIG5ldyBiZih0aGlzLk1iLncoYSksdGhpcy5XKX07ZnVuY3Rpb24gY2YoKXt0aGlzLnlhPXt9fWg9Y2YucHJvdG90eXBlO2guZT1mdW5jdGlvbigpe3JldHVybiB3YSh0aGlzLnlhKX07aC5iYj1mdW5jdGlvbihhLGIsYyl7dmFyIGQ9YS5zb3VyY2UuSWI7aWYobnVsbCE9PWQpcmV0dXJuIGQ9dyh0aGlzLnlhLGQpLEoobnVsbCE9ZCxcIlN5bmNUcmVlIGdhdmUgdXMgYW4gb3AgZm9yIGFuIGludmFsaWQgcXVlcnkuXCIpLGQuYmIoYSxiLGMpO3ZhciBlPVtdO3IodGhpcy55YSxmdW5jdGlvbihkKXtlPWUuY29uY2F0KGQuYmIoYSxiLGMpKX0pO3JldHVybiBlfTtoLk9iPWZ1bmN0aW9uKGEsYixjLGQsZSl7dmFyIGY9YS53YSgpLGc9dyh0aGlzLnlhLGYpO2lmKCFnKXt2YXIgZz1jLnVhKGU/ZDpudWxsKSxrPSExO2c/az0hMDooZz1kIGluc3RhbmNlb2YgVD9jLnhjKGQpOkMsaz0hMSk7Zz1uZXcgdGUoYSxuZXcgSWQobmV3IHNiKGcsaywhMSksbmV3IHNiKGQsZSwhMSkpKTt0aGlzLnlhW2ZdPWd9Zy5PYihiKTtyZXR1cm4gd2UoZyxiKX07XG5oLmtiPWZ1bmN0aW9uKGEsYixjKXt2YXIgZD1hLndhKCksZT1bXSxmPVtdLGc9bnVsbCE9ZGYodGhpcyk7aWYoXCJkZWZhdWx0XCI9PT1kKXt2YXIgaz10aGlzO3IodGhpcy55YSxmdW5jdGlvbihhLGQpe2Y9Zi5jb25jYXQoYS5rYihiLGMpKTthLmUoKSYmKGRlbGV0ZSBrLnlhW2RdLGRlKGEuVi5vKXx8ZS5wdXNoKGEuVikpfSl9ZWxzZXt2YXIgbD13KHRoaXMueWEsZCk7bCYmKGY9Zi5jb25jYXQobC5rYihiLGMpKSxsLmUoKSYmKGRlbGV0ZSB0aGlzLnlhW2RdLGRlKGwuVi5vKXx8ZS5wdXNoKGwuVikpKX1nJiZudWxsPT1kZih0aGlzKSYmZS5wdXNoKG5ldyBVKGEuayxhLnBhdGgpKTtyZXR1cm57SGc6ZSxqZzpmfX07ZnVuY3Rpb24gZWYoYSl7cmV0dXJuIFBhKHJhKGEueWEpLGZ1bmN0aW9uKGEpe3JldHVybiFkZShhLlYubyl9KX1oLmhiPWZ1bmN0aW9uKGEpe3ZhciBiPW51bGw7cih0aGlzLnlhLGZ1bmN0aW9uKGMpe2I9Ynx8Yy5oYihhKX0pO3JldHVybiBifTtcbmZ1bmN0aW9uIGZmKGEsYil7aWYoZGUoYi5vKSlyZXR1cm4gZGYoYSk7dmFyIGM9Yi53YSgpO3JldHVybiB3KGEueWEsYyl9ZnVuY3Rpb24gZGYoYSl7cmV0dXJuIHZhKGEueWEsZnVuY3Rpb24oYSl7cmV0dXJuIGRlKGEuVi5vKX0pfHxudWxsfTtmdW5jdGlvbiBnZihhKXt0aGlzLnNhPU5kO3RoaXMuSGI9bmV3IFllO3RoaXMuJGU9e307dGhpcy5rYz17fTt0aGlzLk1jPWF9ZnVuY3Rpb24gaGYoYSxiLGMsZCxlKXt2YXIgZj1hLkhiLGc9ZTtKKGQ+Zi5MYyxcIlN0YWNraW5nIGFuIG9sZGVyIHdyaXRlIG9uIHRvcCBvZiBuZXdlciBvbmVzXCIpO24oZyl8fChnPSEwKTtmLnphLnB1c2goe3BhdGg6YixJYTpjLGllOmQsdmlzaWJsZTpnfSk7ZyYmKGYuVD1TZShmLlQsYixjKSk7Zi5MYz1kO3JldHVybiBlP2pmKGEsbmV3IFViKFliLGIsYykpOltdfWZ1bmN0aW9uIGtmKGEsYixjLGQpe3ZhciBlPWEuSGI7SihkPmUuTGMsXCJTdGFja2luZyBhbiBvbGRlciBtZXJnZSBvbiB0b3Agb2YgbmV3ZXIgb25lc1wiKTtlLnphLnB1c2goe3BhdGg6YixjaGlsZHJlbjpjLGllOmQsdmlzaWJsZTohMH0pO2UuVD1UZShlLlQsYixjKTtlLkxjPWQ7Yz1GZShjKTtyZXR1cm4gamYoYSxuZXcgeGUoWWIsYixjKSl9XG5mdW5jdGlvbiBsZihhLGIsYyl7Yz1jfHwhMTtiPWEuSGIuT2QoYik7cmV0dXJuIG51bGw9PWI/W106amYoYSxuZXcgV2IoYixjKSl9ZnVuY3Rpb24gbWYoYSxiLGMpe2M9RmUoYyk7cmV0dXJuIGpmKGEsbmV3IHhlKHplLGIsYykpfWZ1bmN0aW9uIG5mKGEsYixjLGQpe2Q9b2YoYSxkKTtpZihudWxsIT1kKXt2YXIgZT1wZihkKTtkPWUucGF0aDtlPWUuSWI7Yj1OKGQsYik7Yz1uZXcgVWIobmV3IHllKCExLCEwLGUsITApLGIsYyk7cmV0dXJuIHFmKGEsZCxjKX1yZXR1cm5bXX1mdW5jdGlvbiByZihhLGIsYyxkKXtpZihkPW9mKGEsZCkpe3ZhciBlPXBmKGQpO2Q9ZS5wYXRoO2U9ZS5JYjtiPU4oZCxiKTtjPUZlKGMpO2M9bmV3IHhlKG5ldyB5ZSghMSwhMCxlLCEwKSxiLGMpO3JldHVybiBxZihhLGQsYyl9cmV0dXJuW119XG5nZi5wcm90b3R5cGUuT2I9ZnVuY3Rpb24oYSxiKXt2YXIgYz1hLnBhdGgsZD1udWxsLGU9ITE7TWUodGhpcy5zYSxjLGZ1bmN0aW9uKGEsYil7dmFyIGY9TihhLGMpO2Q9Yi5oYihmKTtlPWV8fG51bGwhPWRmKGIpO3JldHVybiFkfSk7dmFyIGY9dGhpcy5zYS5nZXQoYyk7Zj8oZT1lfHxudWxsIT1kZihmKSxkPWR8fGYuaGIoRikpOihmPW5ldyBjZix0aGlzLnNhPXRoaXMuc2Euc2V0KGMsZikpO3ZhciBnO251bGwhPWQ/Zz0hMDooZz0hMSxkPUMsUGUodGhpcy5zYS5zdWJ0cmVlKGMpLGZ1bmN0aW9uKGEsYil7dmFyIGM9Yi5oYihGKTtjJiYoZD1kLlEoYSxjKSl9KSk7dmFyIGs9bnVsbCE9ZmYoZixhKTtpZighayYmIWRlKGEubykpe3ZhciBsPXNmKGEpO0ooIShsIGluIHRoaXMua2MpLFwiVmlldyBkb2VzIG5vdCBleGlzdCwgYnV0IHdlIGhhdmUgYSB0YWdcIik7dmFyIG09dGYrKzt0aGlzLmtjW2xdPW07dGhpcy4kZVtcIl9cIittXT1sfWc9Zi5PYihhLGIsbmV3IGJmKGMsdGhpcy5IYiksXG5kLGcpO2t8fGV8fChmPWZmKGYsYSksZz1nLmNvbmNhdCh1Zih0aGlzLGEsZikpKTtyZXR1cm4gZ307XG5nZi5wcm90b3R5cGUua2I9ZnVuY3Rpb24oYSxiLGMpe3ZhciBkPWEucGF0aCxlPXRoaXMuc2EuZ2V0KGQpLGY9W107aWYoZSYmKFwiZGVmYXVsdFwiPT09YS53YSgpfHxudWxsIT1mZihlLGEpKSl7Zj1lLmtiKGEsYixjKTtlLmUoKSYmKHRoaXMuc2E9dGhpcy5zYS5yZW1vdmUoZCkpO2U9Zi5IZztmPWYuamc7Yj0tMSE9PVVhKGUsZnVuY3Rpb24oYSl7cmV0dXJuIGRlKGEubyl9KTt2YXIgZz1LZSh0aGlzLnNhLGQsZnVuY3Rpb24oYSxiKXtyZXR1cm4gbnVsbCE9ZGYoYil9KTtpZihiJiYhZyYmKGQ9dGhpcy5zYS5zdWJ0cmVlKGQpLCFkLmUoKSkpZm9yKHZhciBkPXZmKGQpLGs9MDtrPGQubGVuZ3RoOysrayl7dmFyIGw9ZFtrXSxtPWwuVixsPXdmKHRoaXMsbCk7dGhpcy5NYy5YZShtLHhmKHRoaXMsbSksbC51ZCxsLkopfWlmKCFnJiYwPGUubGVuZ3RoJiYhYylpZihiKXRoaXMuTWMuWmQoYSxudWxsKTtlbHNle3ZhciB2PXRoaXM7T2EoZSxmdW5jdGlvbihhKXthLndhKCk7dmFyIGI9di5rY1tzZihhKV07XG52Lk1jLlpkKGEsYil9KX15Zih0aGlzLGUpfXJldHVybiBmfTtnZi5wcm90b3R5cGUudWE9ZnVuY3Rpb24oYSxiKXt2YXIgYz10aGlzLkhiLGQ9S2UodGhpcy5zYSxhLGZ1bmN0aW9uKGIsYyl7dmFyIGQ9TihiLGEpO2lmKGQ9Yy5oYihkKSlyZXR1cm4gZH0pO3JldHVybiBjLnVhKGEsZCxiLCEwKX07ZnVuY3Rpb24gdmYoYSl7cmV0dXJuIEllKGEsZnVuY3Rpb24oYSxjLGQpe2lmKGMmJm51bGwhPWRmKGMpKXJldHVybltkZihjKV07dmFyIGU9W107YyYmKGU9ZWYoYykpO3IoZCxmdW5jdGlvbihhKXtlPWUuY29uY2F0KGEpfSk7cmV0dXJuIGV9KX1mdW5jdGlvbiB5ZihhLGIpe2Zvcih2YXIgYz0wO2M8Yi5sZW5ndGg7KytjKXt2YXIgZD1iW2NdO2lmKCFkZShkLm8pKXt2YXIgZD1zZihkKSxlPWEua2NbZF07ZGVsZXRlIGEua2NbZF07ZGVsZXRlIGEuJGVbXCJfXCIrZV19fX1cbmZ1bmN0aW9uIHVmKGEsYixjKXt2YXIgZD1iLnBhdGgsZT14ZihhLGIpO2M9d2YoYSxjKTtiPWEuTWMuWGUoYixlLGMudWQsYy5KKTtkPWEuc2Euc3VidHJlZShkKTtpZihlKUoobnVsbD09ZGYoZC52YWx1ZSksXCJJZiB3ZSdyZSBhZGRpbmcgYSBxdWVyeSwgaXQgc2hvdWxkbid0IGJlIHNoYWRvd2VkXCIpO2Vsc2UgZm9yKGU9SWUoZCxmdW5jdGlvbihhLGIsYyl7aWYoIWEuZSgpJiZiJiZudWxsIT1kZihiKSlyZXR1cm5bdWUoZGYoYikpXTt2YXIgZD1bXTtiJiYoZD1kLmNvbmNhdChRYShlZihiKSxmdW5jdGlvbihhKXtyZXR1cm4gYS5WfSkpKTtyKGMsZnVuY3Rpb24oYSl7ZD1kLmNvbmNhdChhKX0pO3JldHVybiBkfSksZD0wO2Q8ZS5sZW5ndGg7KytkKWM9ZVtkXSxhLk1jLlpkKGMseGYoYSxjKSk7cmV0dXJuIGJ9XG5mdW5jdGlvbiB3ZihhLGIpe3ZhciBjPWIuVixkPXhmKGEsYyk7cmV0dXJue3VkOmZ1bmN0aW9uKCl7cmV0dXJuKGIudSgpfHxDKS5oYXNoKCl9LEo6ZnVuY3Rpb24oYil7aWYoXCJva1wiPT09Yil7aWYoZCl7dmFyIGY9Yy5wYXRoO2lmKGI9b2YoYSxkKSl7dmFyIGc9cGYoYik7Yj1nLnBhdGg7Zz1nLkliO2Y9TihiLGYpO2Y9bmV3IFpiKG5ldyB5ZSghMSwhMCxnLCEwKSxmKTtiPXFmKGEsYixmKX1lbHNlIGI9W119ZWxzZSBiPWpmKGEsbmV3IFpiKHplLGMucGF0aCkpO3JldHVybiBifWY9XCJVbmtub3duIEVycm9yXCI7XCJ0b29fYmlnXCI9PT1iP2Y9XCJUaGUgZGF0YSByZXF1ZXN0ZWQgZXhjZWVkcyB0aGUgbWF4aW11bSBzaXplIHRoYXQgY2FuIGJlIGFjY2Vzc2VkIHdpdGggYSBzaW5nbGUgcmVxdWVzdC5cIjpcInBlcm1pc3Npb25fZGVuaWVkXCI9PWI/Zj1cIkNsaWVudCBkb2Vzbid0IGhhdmUgcGVybWlzc2lvbiB0byBhY2Nlc3MgdGhlIGRlc2lyZWQgZGF0YS5cIjpcInVuYXZhaWxhYmxlXCI9PWImJlxuKGY9XCJUaGUgc2VydmljZSBpcyB1bmF2YWlsYWJsZVwiKTtmPUVycm9yKGIrXCI6IFwiK2YpO2YuY29kZT1iLnRvVXBwZXJDYXNlKCk7cmV0dXJuIGEua2IoYyxudWxsLGYpfX19ZnVuY3Rpb24gc2YoYSl7cmV0dXJuIGEucGF0aC50b1N0cmluZygpK1wiJFwiK2Eud2EoKX1mdW5jdGlvbiBwZihhKXt2YXIgYj1hLmluZGV4T2YoXCIkXCIpO0ooLTEhPT1iJiZiPGEubGVuZ3RoLTEsXCJCYWQgcXVlcnlLZXkuXCIpO3JldHVybntJYjphLnN1YnN0cihiKzEpLHBhdGg6bmV3IEsoYS5zdWJzdHIoMCxiKSl9fWZ1bmN0aW9uIG9mKGEsYil7dmFyIGM9YS4kZSxkPVwiX1wiK2I7cmV0dXJuIGQgaW4gYz9jW2RdOnZvaWQgMH1mdW5jdGlvbiB4ZihhLGIpe3ZhciBjPXNmKGIpO3JldHVybiB3KGEua2MsYyl9dmFyIHRmPTE7XG5mdW5jdGlvbiBxZihhLGIsYyl7dmFyIGQ9YS5zYS5nZXQoYik7SihkLFwiTWlzc2luZyBzeW5jIHBvaW50IGZvciBxdWVyeSB0YWcgdGhhdCB3ZSdyZSB0cmFja2luZ1wiKTtyZXR1cm4gZC5iYihjLG5ldyBiZihiLGEuSGIpLG51bGwpfWZ1bmN0aW9uIGpmKGEsYil7cmV0dXJuIHpmKGEsYixhLnNhLG51bGwsbmV3IGJmKEYsYS5IYikpfWZ1bmN0aW9uIHpmKGEsYixjLGQsZSl7aWYoYi5wYXRoLmUoKSlyZXR1cm4gQWYoYSxiLGMsZCxlKTt2YXIgZj1jLmdldChGKTtudWxsPT1kJiZudWxsIT1mJiYoZD1mLmhiKEYpKTt2YXIgZz1bXSxrPU8oYi5wYXRoKSxsPWIuV2Moayk7aWYoKGM9Yy5jaGlsZHJlbi5nZXQoaykpJiZsKXZhciBtPWQ/ZC5NKGspOm51bGwsaz1lLncoayksZz1nLmNvbmNhdCh6ZihhLGwsYyxtLGspKTtmJiYoZz1nLmNvbmNhdChmLmJiKGIsZSxkKSkpO3JldHVybiBnfVxuZnVuY3Rpb24gQWYoYSxiLGMsZCxlKXt2YXIgZj1jLmdldChGKTtudWxsPT1kJiZudWxsIT1mJiYoZD1mLmhiKEYpKTt2YXIgZz1bXTtjLmNoaWxkcmVuLmhhKGZ1bmN0aW9uKGMsZil7dmFyIG09ZD9kLk0oYyk6bnVsbCx2PWUudyhjKSx5PWIuV2MoYyk7eSYmKGc9Zy5jb25jYXQoQWYoYSx5LGYsbSx2KSkpfSk7ZiYmKGc9Zy5jb25jYXQoZi5iYihiLGUsZCkpKTtyZXR1cm4gZ307ZnVuY3Rpb24gQmYoKXt0aGlzLmNoaWxkcmVuPXt9O3RoaXMua2Q9MDt0aGlzLnZhbHVlPW51bGx9ZnVuY3Rpb24gQ2YoYSxiLGMpe3RoaXMuRGQ9YT9hOlwiXCI7dGhpcy5ZYz1iP2I6bnVsbDt0aGlzLkI9Yz9jOm5ldyBCZn1mdW5jdGlvbiBEZihhLGIpe2Zvcih2YXIgYz1iIGluc3RhbmNlb2YgSz9iOm5ldyBLKGIpLGQ9YSxlO251bGwhPT0oZT1PKGMpKTspZD1uZXcgQ2YoZSxkLHcoZC5CLmNoaWxkcmVuLGUpfHxuZXcgQmYpLGM9RyhjKTtyZXR1cm4gZH1oPUNmLnByb3RvdHlwZTtoLkJhPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuQi52YWx1ZX07ZnVuY3Rpb24gRWYoYSxiKXtKKFwidW5kZWZpbmVkXCIhPT10eXBlb2YgYixcIkNhbm5vdCBzZXQgdmFsdWUgdG8gdW5kZWZpbmVkXCIpO2EuQi52YWx1ZT1iO0ZmKGEpfWguY2xlYXI9ZnVuY3Rpb24oKXt0aGlzLkIudmFsdWU9bnVsbDt0aGlzLkIuY2hpbGRyZW49e307dGhpcy5CLmtkPTA7RmYodGhpcyl9O1xuaC50ZD1mdW5jdGlvbigpe3JldHVybiAwPHRoaXMuQi5rZH07aC5lPWZ1bmN0aW9uKCl7cmV0dXJuIG51bGw9PT10aGlzLkJhKCkmJiF0aGlzLnRkKCl9O2guVT1mdW5jdGlvbihhKXt2YXIgYj10aGlzO3IodGhpcy5CLmNoaWxkcmVuLGZ1bmN0aW9uKGMsZCl7YShuZXcgQ2YoZCxiLGMpKX0pfTtmdW5jdGlvbiBHZihhLGIsYyxkKXtjJiYhZCYmYihhKTthLlUoZnVuY3Rpb24oYSl7R2YoYSxiLCEwLGQpfSk7YyYmZCYmYihhKX1mdW5jdGlvbiBIZihhLGIpe2Zvcih2YXIgYz1hLnBhcmVudCgpO251bGwhPT1jJiYhYihjKTspYz1jLnBhcmVudCgpfWgucGF0aD1mdW5jdGlvbigpe3JldHVybiBuZXcgSyhudWxsPT09dGhpcy5ZYz90aGlzLkRkOnRoaXMuWWMucGF0aCgpK1wiL1wiK3RoaXMuRGQpfTtoLm5hbWU9ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5EZH07aC5wYXJlbnQ9ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5ZY307XG5mdW5jdGlvbiBGZihhKXtpZihudWxsIT09YS5ZYyl7dmFyIGI9YS5ZYyxjPWEuRGQsZD1hLmUoKSxlPXUoYi5CLmNoaWxkcmVuLGMpO2QmJmU/KGRlbGV0ZSBiLkIuY2hpbGRyZW5bY10sYi5CLmtkLS0sRmYoYikpOmR8fGV8fChiLkIuY2hpbGRyZW5bY109YS5CLGIuQi5rZCsrLEZmKGIpKX19O2Z1bmN0aW9uIElmKGEpe0ooZWEoYSkmJjA8YS5sZW5ndGgsXCJSZXF1aXJlcyBhIG5vbi1lbXB0eSBhcnJheVwiKTt0aGlzLlVmPWE7dGhpcy5OYz17fX1JZi5wcm90b3R5cGUuZGU9ZnVuY3Rpb24oYSxiKXtmb3IodmFyIGM9dGhpcy5OY1thXXx8W10sZD0wO2Q8Yy5sZW5ndGg7ZCsrKWNbZF0ueWMuYXBwbHkoY1tkXS5NYSxBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsMSkpfTtJZi5wcm90b3R5cGUuRWI9ZnVuY3Rpb24oYSxiLGMpe0pmKHRoaXMsYSk7dGhpcy5OY1thXT10aGlzLk5jW2FdfHxbXTt0aGlzLk5jW2FdLnB1c2goe3ljOmIsTWE6Y30pOyhhPXRoaXMuemUoYSkpJiZiLmFwcGx5KGMsYSl9O0lmLnByb3RvdHlwZS5nYz1mdW5jdGlvbihhLGIsYyl7SmYodGhpcyxhKTthPXRoaXMuTmNbYV18fFtdO2Zvcih2YXIgZD0wO2Q8YS5sZW5ndGg7ZCsrKWlmKGFbZF0ueWM9PT1iJiYoIWN8fGM9PT1hW2RdLk1hKSl7YS5zcGxpY2UoZCwxKTticmVha319O1xuZnVuY3Rpb24gSmYoYSxiKXtKKFRhKGEuVWYsZnVuY3Rpb24oYSl7cmV0dXJuIGE9PT1ifSksXCJVbmtub3duIGV2ZW50OiBcIitiKX07dmFyIEtmPWZ1bmN0aW9uKCl7dmFyIGE9MCxiPVtdO3JldHVybiBmdW5jdGlvbihjKXt2YXIgZD1jPT09YTthPWM7Zm9yKHZhciBlPUFycmF5KDgpLGY9NzswPD1mO2YtLSllW2ZdPVwiLTAxMjM0NTY3ODlBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWl9hYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5elwiLmNoYXJBdChjJTY0KSxjPU1hdGguZmxvb3IoYy82NCk7SigwPT09YyxcIkNhbm5vdCBwdXNoIGF0IHRpbWUgPT0gMFwiKTtjPWUuam9pbihcIlwiKTtpZihkKXtmb3IoZj0xMTswPD1mJiY2Mz09PWJbZl07Zi0tKWJbZl09MDtiW2ZdKyt9ZWxzZSBmb3IoZj0wOzEyPmY7ZisrKWJbZl09TWF0aC5mbG9vcig2NCpNYXRoLnJhbmRvbSgpKTtmb3IoZj0wOzEyPmY7ZisrKWMrPVwiLTAxMjM0NTY3ODlBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWl9hYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5elwiLmNoYXJBdChiW2ZdKTtKKDIwPT09Yy5sZW5ndGgsXCJuZXh0UHVzaElkOiBMZW5ndGggc2hvdWxkIGJlIDIwLlwiKTtcbnJldHVybiBjfX0oKTtmdW5jdGlvbiBMZigpe0lmLmNhbGwodGhpcyxbXCJvbmxpbmVcIl0pO3RoaXMuaWM9ITA7aWYoXCJ1bmRlZmluZWRcIiE9PXR5cGVvZiB3aW5kb3cmJlwidW5kZWZpbmVkXCIhPT10eXBlb2Ygd2luZG93LmFkZEV2ZW50TGlzdGVuZXIpe3ZhciBhPXRoaXM7d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJvbmxpbmVcIixmdW5jdGlvbigpe2EuaWN8fChhLmljPSEwLGEuZGUoXCJvbmxpbmVcIiwhMCkpfSwhMSk7d2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJvZmZsaW5lXCIsZnVuY3Rpb24oKXthLmljJiYoYS5pYz0hMSxhLmRlKFwib25saW5lXCIsITEpKX0sITEpfX1tYShMZixJZik7TGYucHJvdG90eXBlLnplPWZ1bmN0aW9uKGEpe0ooXCJvbmxpbmVcIj09PWEsXCJVbmtub3duIGV2ZW50IHR5cGU6IFwiK2EpO3JldHVyblt0aGlzLmljXX07Y2EoTGYpO2Z1bmN0aW9uIE1mKCl7SWYuY2FsbCh0aGlzLFtcInZpc2libGVcIl0pO3ZhciBhLGI7XCJ1bmRlZmluZWRcIiE9PXR5cGVvZiBkb2N1bWVudCYmXCJ1bmRlZmluZWRcIiE9PXR5cGVvZiBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyJiYoXCJ1bmRlZmluZWRcIiE9PXR5cGVvZiBkb2N1bWVudC5oaWRkZW4/KGI9XCJ2aXNpYmlsaXR5Y2hhbmdlXCIsYT1cImhpZGRlblwiKTpcInVuZGVmaW5lZFwiIT09dHlwZW9mIGRvY3VtZW50Lm1vekhpZGRlbj8oYj1cIm1venZpc2liaWxpdHljaGFuZ2VcIixhPVwibW96SGlkZGVuXCIpOlwidW5kZWZpbmVkXCIhPT10eXBlb2YgZG9jdW1lbnQubXNIaWRkZW4/KGI9XCJtc3Zpc2liaWxpdHljaGFuZ2VcIixhPVwibXNIaWRkZW5cIik6XCJ1bmRlZmluZWRcIiE9PXR5cGVvZiBkb2N1bWVudC53ZWJraXRIaWRkZW4mJihiPVwid2Via2l0dmlzaWJpbGl0eWNoYW5nZVwiLGE9XCJ3ZWJraXRIaWRkZW5cIikpO3RoaXMudWM9ITA7aWYoYil7dmFyIGM9dGhpcztkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKGIsXG5mdW5jdGlvbigpe3ZhciBiPSFkb2N1bWVudFthXTtiIT09Yy51YyYmKGMudWM9YixjLmRlKFwidmlzaWJsZVwiLGIpKX0sITEpfX1tYShNZixJZik7TWYucHJvdG90eXBlLnplPWZ1bmN0aW9uKGEpe0ooXCJ2aXNpYmxlXCI9PT1hLFwiVW5rbm93biBldmVudCB0eXBlOiBcIithKTtyZXR1cm5bdGhpcy51Y119O2NhKE1mKTt2YXIgTmY9L1tcXFtcXF0uIyRcXC9cXHUwMDAwLVxcdTAwMUZcXHUwMDdGXS8sT2Y9L1tcXFtcXF0uIyRcXHUwMDAwLVxcdTAwMUZcXHUwMDdGXS87ZnVuY3Rpb24gUGYoYSl7cmV0dXJuIHAoYSkmJjAhPT1hLmxlbmd0aCYmIU5mLnRlc3QoYSl9ZnVuY3Rpb24gUWYoYSl7cmV0dXJuIG51bGw9PT1hfHxwKGEpfHxnYShhKSYmIVNjKGEpfHxpYShhKSYmdShhLFwiLnN2XCIpfWZ1bmN0aW9uIFJmKGEsYixjLGQpe2QmJiFuKGIpfHxTZih6KGEsMSxkKSxiLGMpfVxuZnVuY3Rpb24gU2YoYSxiLGMpe2MgaW5zdGFuY2VvZiBLJiYoYz1uZXcgd2MoYyxhKSk7aWYoIW4oYikpdGhyb3cgRXJyb3IoYStcImNvbnRhaW5zIHVuZGVmaW5lZCBcIit6YyhjKSk7aWYoaGEoYikpdGhyb3cgRXJyb3IoYStcImNvbnRhaW5zIGEgZnVuY3Rpb24gXCIremMoYykrXCIgd2l0aCBjb250ZW50czogXCIrYi50b1N0cmluZygpKTtpZihTYyhiKSl0aHJvdyBFcnJvcihhK1wiY29udGFpbnMgXCIrYi50b1N0cmluZygpK1wiIFwiK3pjKGMpKTtpZihwKGIpJiZiLmxlbmd0aD4xMDQ4NTc2MC8zJiYxMDQ4NTc2MDx4YyhiKSl0aHJvdyBFcnJvcihhK1wiY29udGFpbnMgYSBzdHJpbmcgZ3JlYXRlciB0aGFuIDEwNDg1NzYwIHV0ZjggYnl0ZXMgXCIremMoYykrXCIgKCdcIitiLnN1YnN0cmluZygwLDUwKStcIi4uLicpXCIpO2lmKGlhKGIpKXt2YXIgZD0hMSxlPSExO2hiKGIsZnVuY3Rpb24oYixnKXtpZihcIi52YWx1ZVwiPT09YilkPSEwO2Vsc2UgaWYoXCIucHJpb3JpdHlcIiE9PWImJlwiLnN2XCIhPT1iJiYoZT1cbiEwLCFQZihiKSkpdGhyb3cgRXJyb3IoYStcIiBjb250YWlucyBhbiBpbnZhbGlkIGtleSAoXCIrYitcIikgXCIremMoYykrJy4gIEtleXMgbXVzdCBiZSBub24tZW1wdHkgc3RyaW5ncyBhbmQgY2FuXFwndCBjb250YWluIFwiLlwiLCBcIiNcIiwgXCIkXCIsIFwiL1wiLCBcIltcIiwgb3IgXCJdXCInKTtjLnB1c2goYik7U2YoYSxnLGMpO2MucG9wKCl9KTtpZihkJiZlKXRocm93IEVycm9yKGErJyBjb250YWlucyBcIi52YWx1ZVwiIGNoaWxkICcremMoYykrXCIgaW4gYWRkaXRpb24gdG8gYWN0dWFsIGNoaWxkcmVuLlwiKTt9fVxuZnVuY3Rpb24gVGYoYSxiLGMpe2lmKCFpYShiKXx8ZWEoYikpdGhyb3cgRXJyb3IoeihhLDEsITEpK1wiIG11c3QgYmUgYW4gT2JqZWN0IGNvbnRhaW5pbmcgdGhlIGNoaWxkcmVuIHRvIHJlcGxhY2UuXCIpO2lmKHUoYixcIi52YWx1ZVwiKSl0aHJvdyBFcnJvcih6KGEsMSwhMSkrJyBtdXN0IG5vdCBjb250YWluIFwiLnZhbHVlXCIuICBUbyBvdmVyd3JpdGUgd2l0aCBhIGxlYWYgdmFsdWUsIGp1c3QgdXNlIC5zZXQoKSBpbnN0ZWFkLicpO1JmKGEsYixjLCExKX1cbmZ1bmN0aW9uIFVmKGEsYixjKXtpZihTYyhjKSl0aHJvdyBFcnJvcih6KGEsYiwhMSkrXCJpcyBcIitjLnRvU3RyaW5nKCkrXCIsIGJ1dCBtdXN0IGJlIGEgdmFsaWQgRmlyZWJhc2UgcHJpb3JpdHkgKGEgc3RyaW5nLCBmaW5pdGUgbnVtYmVyLCBzZXJ2ZXIgdmFsdWUsIG9yIG51bGwpLlwiKTtpZighUWYoYykpdGhyb3cgRXJyb3IoeihhLGIsITEpK1wibXVzdCBiZSBhIHZhbGlkIEZpcmViYXNlIHByaW9yaXR5IChhIHN0cmluZywgZmluaXRlIG51bWJlciwgc2VydmVyIHZhbHVlLCBvciBudWxsKS5cIik7fVxuZnVuY3Rpb24gVmYoYSxiLGMpe2lmKCFjfHxuKGIpKXN3aXRjaChiKXtjYXNlIFwidmFsdWVcIjpjYXNlIFwiY2hpbGRfYWRkZWRcIjpjYXNlIFwiY2hpbGRfcmVtb3ZlZFwiOmNhc2UgXCJjaGlsZF9jaGFuZ2VkXCI6Y2FzZSBcImNoaWxkX21vdmVkXCI6YnJlYWs7ZGVmYXVsdDp0aHJvdyBFcnJvcih6KGEsMSxjKSsnbXVzdCBiZSBhIHZhbGlkIGV2ZW50IHR5cGU6IFwidmFsdWVcIiwgXCJjaGlsZF9hZGRlZFwiLCBcImNoaWxkX3JlbW92ZWRcIiwgXCJjaGlsZF9jaGFuZ2VkXCIsIG9yIFwiY2hpbGRfbW92ZWRcIi4nKTt9fWZ1bmN0aW9uIFdmKGEsYixjLGQpe2lmKCghZHx8bihjKSkmJiFQZihjKSl0aHJvdyBFcnJvcih6KGEsYixkKSsnd2FzIGFuIGludmFsaWQga2V5OiBcIicrYysnXCIuICBGaXJlYmFzZSBrZXlzIG11c3QgYmUgbm9uLWVtcHR5IHN0cmluZ3MgYW5kIGNhblxcJ3QgY29udGFpbiBcIi5cIiwgXCIjXCIsIFwiJFwiLCBcIi9cIiwgXCJbXCIsIG9yIFwiXVwiKS4nKTt9XG5mdW5jdGlvbiBYZihhLGIpe2lmKCFwKGIpfHwwPT09Yi5sZW5ndGh8fE9mLnRlc3QoYikpdGhyb3cgRXJyb3IoeihhLDEsITEpKyd3YXMgYW4gaW52YWxpZCBwYXRoOiBcIicrYisnXCIuIFBhdGhzIG11c3QgYmUgbm9uLWVtcHR5IHN0cmluZ3MgYW5kIGNhblxcJ3QgY29udGFpbiBcIi5cIiwgXCIjXCIsIFwiJFwiLCBcIltcIiwgb3IgXCJdXCInKTt9ZnVuY3Rpb24gWWYoYSxiKXtpZihcIi5pbmZvXCI9PT1PKGIpKXRocm93IEVycm9yKGErXCIgZmFpbGVkOiBDYW4ndCBtb2RpZnkgZGF0YSB1bmRlciAvLmluZm8vXCIpO31mdW5jdGlvbiBaZihhLGIpe2lmKCFwKGIpKXRocm93IEVycm9yKHooYSwxLCExKStcIm11c3QgYmUgYSB2YWxpZCBjcmVkZW50aWFsIChhIHN0cmluZykuXCIpO31mdW5jdGlvbiAkZihhLGIsYyl7aWYoIXAoYykpdGhyb3cgRXJyb3IoeihhLGIsITEpK1wibXVzdCBiZSBhIHZhbGlkIHN0cmluZy5cIik7fVxuZnVuY3Rpb24gYWcoYSxiLGMsZCl7aWYoIWR8fG4oYykpaWYoIWlhKGMpfHxudWxsPT09Yyl0aHJvdyBFcnJvcih6KGEsYixkKStcIm11c3QgYmUgYSB2YWxpZCBvYmplY3QuXCIpO31mdW5jdGlvbiBiZyhhLGIsYyl7aWYoIWlhKGIpfHxudWxsPT09Ynx8IXUoYixjKSl0aHJvdyBFcnJvcih6KGEsMSwhMSkrJ211c3QgY29udGFpbiB0aGUga2V5IFwiJytjKydcIicpO2lmKCFwKHcoYixjKSkpdGhyb3cgRXJyb3IoeihhLDEsITEpKydtdXN0IGNvbnRhaW4gdGhlIGtleSBcIicrYysnXCIgd2l0aCB0eXBlIFwic3RyaW5nXCInKTt9O2Z1bmN0aW9uIGNnKCl7dGhpcy5zZXQ9e319aD1jZy5wcm90b3R5cGU7aC5hZGQ9ZnVuY3Rpb24oYSxiKXt0aGlzLnNldFthXT1udWxsIT09Yj9iOiEwfTtoLmNvbnRhaW5zPWZ1bmN0aW9uKGEpe3JldHVybiB1KHRoaXMuc2V0LGEpfTtoLmdldD1mdW5jdGlvbihhKXtyZXR1cm4gdGhpcy5jb250YWlucyhhKT90aGlzLnNldFthXTp2b2lkIDB9O2gucmVtb3ZlPWZ1bmN0aW9uKGEpe2RlbGV0ZSB0aGlzLnNldFthXX07aC5jbGVhcj1mdW5jdGlvbigpe3RoaXMuc2V0PXt9fTtoLmU9ZnVuY3Rpb24oKXtyZXR1cm4gd2EodGhpcy5zZXQpfTtoLmNvdW50PWZ1bmN0aW9uKCl7cmV0dXJuIHBhKHRoaXMuc2V0KX07ZnVuY3Rpb24gZGcoYSxiKXtyKGEuc2V0LGZ1bmN0aW9uKGEsZCl7YihkLGEpfSl9aC5rZXlzPWZ1bmN0aW9uKCl7dmFyIGE9W107cih0aGlzLnNldCxmdW5jdGlvbihiLGMpe2EucHVzaChjKX0pO3JldHVybiBhfTtmdW5jdGlvbiBxYygpe3RoaXMubT10aGlzLkM9bnVsbH1xYy5wcm90b3R5cGUuZmluZD1mdW5jdGlvbihhKXtpZihudWxsIT10aGlzLkMpcmV0dXJuIHRoaXMuQy5vYShhKTtpZihhLmUoKXx8bnVsbD09dGhpcy5tKXJldHVybiBudWxsO3ZhciBiPU8oYSk7YT1HKGEpO3JldHVybiB0aGlzLm0uY29udGFpbnMoYik/dGhpcy5tLmdldChiKS5maW5kKGEpOm51bGx9O3FjLnByb3RvdHlwZS5tYz1mdW5jdGlvbihhLGIpe2lmKGEuZSgpKXRoaXMuQz1iLHRoaXMubT1udWxsO2Vsc2UgaWYobnVsbCE9PXRoaXMuQyl0aGlzLkM9dGhpcy5DLkcoYSxiKTtlbHNle251bGw9PXRoaXMubSYmKHRoaXMubT1uZXcgY2cpO3ZhciBjPU8oYSk7dGhpcy5tLmNvbnRhaW5zKGMpfHx0aGlzLm0uYWRkKGMsbmV3IHFjKTtjPXRoaXMubS5nZXQoYyk7YT1HKGEpO2MubWMoYSxiKX19O1xuZnVuY3Rpb24gZWcoYSxiKXtpZihiLmUoKSlyZXR1cm4gYS5DPW51bGwsYS5tPW51bGwsITA7aWYobnVsbCE9PWEuQyl7aWYoYS5DLk4oKSlyZXR1cm4hMTt2YXIgYz1hLkM7YS5DPW51bGw7Yy5VKE0sZnVuY3Rpb24oYixjKXthLm1jKG5ldyBLKGIpLGMpfSk7cmV0dXJuIGVnKGEsYil9cmV0dXJuIG51bGwhPT1hLm0/KGM9TyhiKSxiPUcoYiksYS5tLmNvbnRhaW5zKGMpJiZlZyhhLm0uZ2V0KGMpLGIpJiZhLm0ucmVtb3ZlKGMpLGEubS5lKCk/KGEubT1udWxsLCEwKTohMSk6ITB9ZnVuY3Rpb24gcmMoYSxiLGMpe251bGwhPT1hLkM/YyhiLGEuQyk6YS5VKGZ1bmN0aW9uKGEsZSl7dmFyIGY9bmV3IEsoYi50b1N0cmluZygpK1wiL1wiK2EpO3JjKGUsZixjKX0pfXFjLnByb3RvdHlwZS5VPWZ1bmN0aW9uKGEpe251bGwhPT10aGlzLm0mJmRnKHRoaXMubSxmdW5jdGlvbihiLGMpe2EoYixjKX0pfTt2YXIgZmc9XCJhdXRoLmZpcmViYXNlLmNvbVwiO2Z1bmN0aW9uIGdnKGEsYixjKXt0aGlzLmxkPWF8fHt9O3RoaXMuY2U9Ynx8e307dGhpcy5hYj1jfHx7fTt0aGlzLmxkLnJlbWVtYmVyfHwodGhpcy5sZC5yZW1lbWJlcj1cImRlZmF1bHRcIil9dmFyIGhnPVtcInJlbWVtYmVyXCIsXCJyZWRpcmVjdFRvXCJdO2Z1bmN0aW9uIGlnKGEpe3ZhciBiPXt9LGM9e307aGIoYXx8e30sZnVuY3Rpb24oYSxlKXswPD1OYShoZyxhKT9iW2FdPWU6Y1thXT1lfSk7cmV0dXJuIG5ldyBnZyhiLHt9LGMpfTtmdW5jdGlvbiBqZyhhLGIpe3RoaXMuUGU9W1wic2Vzc2lvblwiLGEuTGQsYS5DYl0uam9pbihcIjpcIik7dGhpcy4kZD1ifWpnLnByb3RvdHlwZS5zZXQ9ZnVuY3Rpb24oYSxiKXtpZighYilpZih0aGlzLiRkLmxlbmd0aCliPXRoaXMuJGRbMF07ZWxzZSB0aHJvdyBFcnJvcihcImZiLmxvZ2luLlNlc3Npb25NYW5hZ2VyIDogTm8gc3RvcmFnZSBvcHRpb25zIGF2YWlsYWJsZSFcIik7Yi5zZXQodGhpcy5QZSxhKX07amcucHJvdG90eXBlLmdldD1mdW5jdGlvbigpe3ZhciBhPVFhKHRoaXMuJGQscSh0aGlzLm5nLHRoaXMpKSxhPVBhKGEsZnVuY3Rpb24oYSl7cmV0dXJuIG51bGwhPT1hfSk7WGEoYSxmdW5jdGlvbihhLGMpe3JldHVybiBiZChjLnRva2VuKS1iZChhLnRva2VuKX0pO3JldHVybiAwPGEubGVuZ3RoP2Euc2hpZnQoKTpudWxsfTtqZy5wcm90b3R5cGUubmc9ZnVuY3Rpb24oYSl7dHJ5e3ZhciBiPWEuZ2V0KHRoaXMuUGUpO2lmKGImJmIudG9rZW4pcmV0dXJuIGJ9Y2F0Y2goYyl7fXJldHVybiBudWxsfTtcbmpnLnByb3RvdHlwZS5jbGVhcj1mdW5jdGlvbigpe3ZhciBhPXRoaXM7T2EodGhpcy4kZCxmdW5jdGlvbihiKXtiLnJlbW92ZShhLlBlKX0pfTtmdW5jdGlvbiBrZygpe3JldHVyblwidW5kZWZpbmVkXCIhPT10eXBlb2Ygd2luZG93JiYhISh3aW5kb3cuY29yZG92YXx8d2luZG93LnBob25lZ2FwfHx3aW5kb3cuUGhvbmVHYXApJiYvaW9zfGlwaG9uZXxpcG9kfGlwYWR8YW5kcm9pZHxibGFja2JlcnJ5fGllbW9iaWxlL2kudGVzdChuYXZpZ2F0b3IudXNlckFnZW50KX1mdW5jdGlvbiBsZygpe3JldHVyblwidW5kZWZpbmVkXCIhPT10eXBlb2YgbG9jYXRpb24mJi9eZmlsZTpcXC8vLnRlc3QobG9jYXRpb24uaHJlZil9XG5mdW5jdGlvbiBtZygpe2lmKFwidW5kZWZpbmVkXCI9PT10eXBlb2YgbmF2aWdhdG9yKXJldHVybiExO3ZhciBhPW5hdmlnYXRvci51c2VyQWdlbnQ7aWYoXCJNaWNyb3NvZnQgSW50ZXJuZXQgRXhwbG9yZXJcIj09PW5hdmlnYXRvci5hcHBOYW1lKXtpZigoYT1hLm1hdGNoKC9NU0lFIChbMC05XXsxLH1bXFwuMC05XXswLH0pLykpJiYxPGEubGVuZ3RoKXJldHVybiA4PD1wYXJzZUZsb2F0KGFbMV0pfWVsc2UgaWYoLTE8YS5pbmRleE9mKFwiVHJpZGVudFwiKSYmKGE9YS5tYXRjaCgvcnY6KFswLTldezIsMn1bXFwuMC05XXswLH0pLykpJiYxPGEubGVuZ3RoKXJldHVybiA4PD1wYXJzZUZsb2F0KGFbMV0pO3JldHVybiExfTtmdW5jdGlvbiBuZygpe3ZhciBhPXdpbmRvdy5vcGVuZXIuZnJhbWVzLGI7Zm9yKGI9YS5sZW5ndGgtMTswPD1iO2ItLSl0cnl7aWYoYVtiXS5sb2NhdGlvbi5wcm90b2NvbD09PXdpbmRvdy5sb2NhdGlvbi5wcm90b2NvbCYmYVtiXS5sb2NhdGlvbi5ob3N0PT09d2luZG93LmxvY2F0aW9uLmhvc3QmJlwiX193aW5jaGFuX3JlbGF5X2ZyYW1lXCI9PT1hW2JdLm5hbWUpcmV0dXJuIGFbYl19Y2F0Y2goYyl7fXJldHVybiBudWxsfWZ1bmN0aW9uIG9nKGEsYixjKXthLmF0dGFjaEV2ZW50P2EuYXR0YWNoRXZlbnQoXCJvblwiK2IsYyk6YS5hZGRFdmVudExpc3RlbmVyJiZhLmFkZEV2ZW50TGlzdGVuZXIoYixjLCExKX1mdW5jdGlvbiBwZyhhLGIsYyl7YS5kZXRhY2hFdmVudD9hLmRldGFjaEV2ZW50KFwib25cIitiLGMpOmEucmVtb3ZlRXZlbnRMaXN0ZW5lciYmYS5yZW1vdmVFdmVudExpc3RlbmVyKGIsYywhMSl9XG5mdW5jdGlvbiBxZyhhKXsvXmh0dHBzPzpcXC9cXC8vLnRlc3QoYSl8fChhPXdpbmRvdy5sb2NhdGlvbi5ocmVmKTt2YXIgYj0vXihodHRwcz86XFwvXFwvW1xcLV9hLXpBLVpcXC4wLTk6XSspLy5leGVjKGEpO3JldHVybiBiP2JbMV06YX1mdW5jdGlvbiByZyhhKXt2YXIgYj1cIlwiO3RyeXthPWEucmVwbGFjZShcIiNcIixcIlwiKTt2YXIgYz1rYihhKTtjJiZ1KGMsXCJfX2ZpcmViYXNlX3JlcXVlc3Rfa2V5XCIpJiYoYj13KGMsXCJfX2ZpcmViYXNlX3JlcXVlc3Rfa2V5XCIpKX1jYXRjaChkKXt9cmV0dXJuIGJ9ZnVuY3Rpb24gc2coKXt2YXIgYT1SYyhmZyk7cmV0dXJuIGEuc2NoZW1lK1wiOi8vXCIrYS5ob3N0K1wiL3YyXCJ9ZnVuY3Rpb24gdGcoYSl7cmV0dXJuIHNnKCkrXCIvXCIrYStcIi9hdXRoL2NoYW5uZWxcIn07ZnVuY3Rpb24gdWcoYSl7dmFyIGI9dGhpczt0aGlzLnpjPWE7dGhpcy5hZT1cIipcIjttZygpP3RoaXMuUWM9dGhpcy53ZD1uZygpOih0aGlzLlFjPXdpbmRvdy5vcGVuZXIsdGhpcy53ZD13aW5kb3cpO2lmKCFiLlFjKXRocm93XCJVbmFibGUgdG8gZmluZCByZWxheSBmcmFtZVwiO29nKHRoaXMud2QsXCJtZXNzYWdlXCIscSh0aGlzLmhjLHRoaXMpKTtvZyh0aGlzLndkLFwibWVzc2FnZVwiLHEodGhpcy5BZix0aGlzKSk7dHJ5e3ZnKHRoaXMse2E6XCJyZWFkeVwifSl9Y2F0Y2goYyl7b2codGhpcy5RYyxcImxvYWRcIixmdW5jdGlvbigpe3ZnKGIse2E6XCJyZWFkeVwifSl9KX1vZyh3aW5kb3csXCJ1bmxvYWRcIixxKHRoaXMueWcsdGhpcykpfWZ1bmN0aW9uIHZnKGEsYil7Yj1CKGIpO21nKCk/YS5RYy5kb1Bvc3QoYixhLmFlKTphLlFjLnBvc3RNZXNzYWdlKGIsYS5hZSl9XG51Zy5wcm90b3R5cGUuaGM9ZnVuY3Rpb24oYSl7dmFyIGI9dGhpcyxjO3RyeXtjPW1iKGEuZGF0YSl9Y2F0Y2goZCl7fWMmJlwicmVxdWVzdFwiPT09Yy5hJiYocGcod2luZG93LFwibWVzc2FnZVwiLHRoaXMuaGMpLHRoaXMuYWU9YS5vcmlnaW4sdGhpcy56YyYmc2V0VGltZW91dChmdW5jdGlvbigpe2IuemMoYi5hZSxjLmQsZnVuY3Rpb24oYSxjKXtiLmFnPSFjO2IuemM9dm9pZCAwO3ZnKGIse2E6XCJyZXNwb25zZVwiLGQ6YSxmb3JjZUtlZXBXaW5kb3dPcGVuOmN9KX0pfSwwKSl9O3VnLnByb3RvdHlwZS55Zz1mdW5jdGlvbigpe3RyeXtwZyh0aGlzLndkLFwibWVzc2FnZVwiLHRoaXMuQWYpfWNhdGNoKGEpe310aGlzLnpjJiYodmcodGhpcyx7YTpcImVycm9yXCIsZDpcInVua25vd24gY2xvc2VkIHdpbmRvd1wifSksdGhpcy56Yz12b2lkIDApO3RyeXt3aW5kb3cuY2xvc2UoKX1jYXRjaChiKXt9fTt1Zy5wcm90b3R5cGUuQWY9ZnVuY3Rpb24oYSl7aWYodGhpcy5hZyYmXCJkaWVcIj09PWEuZGF0YSl0cnl7d2luZG93LmNsb3NlKCl9Y2F0Y2goYil7fX07ZnVuY3Rpb24gd2coYSl7dGhpcy5vYz1HYSgpK0dhKCkrR2EoKTt0aGlzLkRmPWF9d2cucHJvdG90eXBlLm9wZW49ZnVuY3Rpb24oYSxiKXtQLnNldChcInJlZGlyZWN0X3JlcXVlc3RfaWRcIix0aGlzLm9jKTtQLnNldChcInJlZGlyZWN0X3JlcXVlc3RfaWRcIix0aGlzLm9jKTtiLnJlcXVlc3RJZD10aGlzLm9jO2IucmVkaXJlY3RUbz1iLnJlZGlyZWN0VG98fHdpbmRvdy5sb2NhdGlvbi5ocmVmO2ErPSgvXFw/Ly50ZXN0KGEpP1wiXCI6XCI/XCIpK2piKGIpO3dpbmRvdy5sb2NhdGlvbj1hfTt3Zy5pc0F2YWlsYWJsZT1mdW5jdGlvbigpe3JldHVybiFsZygpJiYha2coKX07d2cucHJvdG90eXBlLkJjPWZ1bmN0aW9uKCl7cmV0dXJuXCJyZWRpcmVjdFwifTt2YXIgeGc9e05FVFdPUktfRVJST1I6XCJVbmFibGUgdG8gY29udGFjdCB0aGUgRmlyZWJhc2Ugc2VydmVyLlwiLFNFUlZFUl9FUlJPUjpcIkFuIHVua25vd24gc2VydmVyIGVycm9yIG9jY3VycmVkLlwiLFRSQU5TUE9SVF9VTkFWQUlMQUJMRTpcIlRoZXJlIGFyZSBubyBsb2dpbiB0cmFuc3BvcnRzIGF2YWlsYWJsZSBmb3IgdGhlIHJlcXVlc3RlZCBtZXRob2QuXCIsUkVRVUVTVF9JTlRFUlJVUFRFRDpcIlRoZSBicm93c2VyIHJlZGlyZWN0ZWQgdGhlIHBhZ2UgYmVmb3JlIHRoZSBsb2dpbiByZXF1ZXN0IGNvdWxkIGNvbXBsZXRlLlwiLFVTRVJfQ0FOQ0VMTEVEOlwiVGhlIHVzZXIgY2FuY2VsbGVkIGF1dGhlbnRpY2F0aW9uLlwifTtmdW5jdGlvbiB5ZyhhKXt2YXIgYj1FcnJvcih3KHhnLGEpLGEpO2IuY29kZT1hO3JldHVybiBifTtmdW5jdGlvbiB6ZyhhKXtpZighYS53aW5kb3dfZmVhdHVyZXN8fFwidW5kZWZpbmVkXCIhPT10eXBlb2YgbmF2aWdhdG9yJiYoLTEhPT1uYXZpZ2F0b3IudXNlckFnZW50LmluZGV4T2YoXCJGZW5uZWMvXCIpfHwtMSE9PW5hdmlnYXRvci51c2VyQWdlbnQuaW5kZXhPZihcIkZpcmVmb3gvXCIpJiYtMSE9PW5hdmlnYXRvci51c2VyQWdlbnQuaW5kZXhPZihcIkFuZHJvaWRcIikpKWEud2luZG93X2ZlYXR1cmVzPXZvaWQgMDthLndpbmRvd19uYW1lfHwoYS53aW5kb3dfbmFtZT1cIl9ibGFua1wiKTt0aGlzLm9wdGlvbnM9YX1cbnpnLnByb3RvdHlwZS5vcGVuPWZ1bmN0aW9uKGEsYixjKXtmdW5jdGlvbiBkKGEpe2cmJihkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKGcpLGc9dm9pZCAwKTt2JiYodj1jbGVhckludGVydmFsKHYpKTtwZyh3aW5kb3csXCJtZXNzYWdlXCIsZSk7cGcod2luZG93LFwidW5sb2FkXCIsZCk7aWYobSYmIWEpdHJ5e20uY2xvc2UoKX1jYXRjaChiKXtrLnBvc3RNZXNzYWdlKFwiZGllXCIsbCl9bT1rPXZvaWQgMH1mdW5jdGlvbiBlKGEpe2lmKGEub3JpZ2luPT09bCl0cnl7dmFyIGI9bWIoYS5kYXRhKTtcInJlYWR5XCI9PT1iLmE/ay5wb3N0TWVzc2FnZSh5LGwpOlwiZXJyb3JcIj09PWIuYT8oZCghMSksYyYmKGMoYi5kKSxjPW51bGwpKTpcInJlc3BvbnNlXCI9PT1iLmEmJihkKGIuZm9yY2VLZWVwV2luZG93T3BlbiksYyYmKGMobnVsbCxiLmQpLGM9bnVsbCkpfWNhdGNoKGUpe319dmFyIGY9bWcoKSxnLGs7aWYoIXRoaXMub3B0aW9ucy5yZWxheV91cmwpcmV0dXJuIGMoRXJyb3IoXCJpbnZhbGlkIGFyZ3VtZW50czogb3JpZ2luIG9mIHVybCBhbmQgcmVsYXlfdXJsIG11c3QgbWF0Y2hcIikpO1xudmFyIGw9cWcoYSk7aWYobCE9PXFnKHRoaXMub3B0aW9ucy5yZWxheV91cmwpKWMmJnNldFRpbWVvdXQoZnVuY3Rpb24oKXtjKEVycm9yKFwiaW52YWxpZCBhcmd1bWVudHM6IG9yaWdpbiBvZiB1cmwgYW5kIHJlbGF5X3VybCBtdXN0IG1hdGNoXCIpKX0sMCk7ZWxzZXtmJiYoZz1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaWZyYW1lXCIpLGcuc2V0QXR0cmlidXRlKFwic3JjXCIsdGhpcy5vcHRpb25zLnJlbGF5X3VybCksZy5zdHlsZS5kaXNwbGF5PVwibm9uZVwiLGcuc2V0QXR0cmlidXRlKFwibmFtZVwiLFwiX193aW5jaGFuX3JlbGF5X2ZyYW1lXCIpLGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoZyksaz1nLmNvbnRlbnRXaW5kb3cpO2ErPSgvXFw/Ly50ZXN0KGEpP1wiXCI6XCI/XCIpK2piKGIpO3ZhciBtPXdpbmRvdy5vcGVuKGEsdGhpcy5vcHRpb25zLndpbmRvd19uYW1lLHRoaXMub3B0aW9ucy53aW5kb3dfZmVhdHVyZXMpO2t8fChrPW0pO3ZhciB2PXNldEludGVydmFsKGZ1bmN0aW9uKCl7bSYmbS5jbG9zZWQmJlxuKGQoITEpLGMmJihjKHlnKFwiVVNFUl9DQU5DRUxMRURcIikpLGM9bnVsbCkpfSw1MDApLHk9Qih7YTpcInJlcXVlc3RcIixkOmJ9KTtvZyh3aW5kb3csXCJ1bmxvYWRcIixkKTtvZyh3aW5kb3csXCJtZXNzYWdlXCIsZSl9fTtcbnpnLmlzQXZhaWxhYmxlPWZ1bmN0aW9uKCl7cmV0dXJuXCJwb3N0TWVzc2FnZVwiaW4gd2luZG93JiYhbGcoKSYmIShrZygpfHxcInVuZGVmaW5lZFwiIT09dHlwZW9mIG5hdmlnYXRvciYmKG5hdmlnYXRvci51c2VyQWdlbnQubWF0Y2goL1dpbmRvd3MgUGhvbmUvKXx8d2luZG93LldpbmRvd3MmJi9ebXMtYXBweDovLnRlc3QobG9jYXRpb24uaHJlZikpfHxcInVuZGVmaW5lZFwiIT09dHlwZW9mIG5hdmlnYXRvciYmXCJ1bmRlZmluZWRcIiE9PXR5cGVvZiB3aW5kb3cmJihuYXZpZ2F0b3IudXNlckFnZW50Lm1hdGNoKC8oaVBob25lfGlQb2R8aVBhZCkuKkFwcGxlV2ViS2l0KD8hLipTYWZhcmkpL2kpfHxuYXZpZ2F0b3IudXNlckFnZW50Lm1hdGNoKC9DcmlPUy8pfHxuYXZpZ2F0b3IudXNlckFnZW50Lm1hdGNoKC9Ud2l0dGVyIGZvciBpUGhvbmUvKXx8bmF2aWdhdG9yLnVzZXJBZ2VudC5tYXRjaCgvRkJBTlxcL0ZCSU9TLyl8fHdpbmRvdy5uYXZpZ2F0b3Iuc3RhbmRhbG9uZSkpJiYhKFwidW5kZWZpbmVkXCIhPT1cbnR5cGVvZiBuYXZpZ2F0b3ImJm5hdmlnYXRvci51c2VyQWdlbnQubWF0Y2goL1BoYW50b21KUy8pKX07emcucHJvdG90eXBlLkJjPWZ1bmN0aW9uKCl7cmV0dXJuXCJwb3B1cFwifTtmdW5jdGlvbiBBZyhhKXthLm1ldGhvZHx8KGEubWV0aG9kPVwiR0VUXCIpO2EuaGVhZGVyc3x8KGEuaGVhZGVycz17fSk7YS5oZWFkZXJzLmNvbnRlbnRfdHlwZXx8KGEuaGVhZGVycy5jb250ZW50X3R5cGU9XCJhcHBsaWNhdGlvbi9qc29uXCIpO2EuaGVhZGVycy5jb250ZW50X3R5cGU9YS5oZWFkZXJzLmNvbnRlbnRfdHlwZS50b0xvd2VyQ2FzZSgpO3RoaXMub3B0aW9ucz1hfVxuQWcucHJvdG90eXBlLm9wZW49ZnVuY3Rpb24oYSxiLGMpe2Z1bmN0aW9uIGQoKXtjJiYoYyh5ZyhcIlJFUVVFU1RfSU5URVJSVVBURURcIikpLGM9bnVsbCl9dmFyIGU9bmV3IFhNTEh0dHBSZXF1ZXN0LGY9dGhpcy5vcHRpb25zLm1ldGhvZC50b1VwcGVyQ2FzZSgpLGc7b2cod2luZG93LFwiYmVmb3JldW5sb2FkXCIsZCk7ZS5vbnJlYWR5c3RhdGVjaGFuZ2U9ZnVuY3Rpb24oKXtpZihjJiY0PT09ZS5yZWFkeVN0YXRlKXt2YXIgYTtpZigyMDA8PWUuc3RhdHVzJiYzMDA+ZS5zdGF0dXMpe3RyeXthPW1iKGUucmVzcG9uc2VUZXh0KX1jYXRjaChiKXt9YyhudWxsLGEpfWVsc2UgNTAwPD1lLnN0YXR1cyYmNjAwPmUuc3RhdHVzP2MoeWcoXCJTRVJWRVJfRVJST1JcIikpOmMoeWcoXCJORVRXT1JLX0VSUk9SXCIpKTtjPW51bGw7cGcod2luZG93LFwiYmVmb3JldW5sb2FkXCIsZCl9fTtpZihcIkdFVFwiPT09ZilhKz0oL1xcPy8udGVzdChhKT9cIlwiOlwiP1wiKStqYihiKSxnPW51bGw7ZWxzZXt2YXIgaz10aGlzLm9wdGlvbnMuaGVhZGVycy5jb250ZW50X3R5cGU7XG5cImFwcGxpY2F0aW9uL2pzb25cIj09PWsmJihnPUIoYikpO1wiYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkXCI9PT1rJiYoZz1qYihiKSl9ZS5vcGVuKGYsYSwhMCk7YT17XCJYLVJlcXVlc3RlZC1XaXRoXCI6XCJYTUxIdHRwUmVxdWVzdFwiLEFjY2VwdDpcImFwcGxpY2F0aW9uL2pzb247dGV4dC9wbGFpblwifTt6YShhLHRoaXMub3B0aW9ucy5oZWFkZXJzKTtmb3IodmFyIGwgaW4gYSllLnNldFJlcXVlc3RIZWFkZXIobCxhW2xdKTtlLnNlbmQoZyl9O0FnLmlzQXZhaWxhYmxlPWZ1bmN0aW9uKCl7cmV0dXJuISF3aW5kb3cuWE1MSHR0cFJlcXVlc3QmJlwic3RyaW5nXCI9PT10eXBlb2YobmV3IFhNTEh0dHBSZXF1ZXN0KS5yZXNwb25zZVR5cGUmJighKFwidW5kZWZpbmVkXCIhPT10eXBlb2YgbmF2aWdhdG9yJiYobmF2aWdhdG9yLnVzZXJBZ2VudC5tYXRjaCgvTVNJRS8pfHxuYXZpZ2F0b3IudXNlckFnZW50Lm1hdGNoKC9UcmlkZW50LykpKXx8bWcoKSl9O0FnLnByb3RvdHlwZS5CYz1mdW5jdGlvbigpe3JldHVyblwianNvblwifTtmdW5jdGlvbiBCZyhhKXt0aGlzLm9jPUdhKCkrR2EoKStHYSgpO3RoaXMuRGY9YX1cbkJnLnByb3RvdHlwZS5vcGVuPWZ1bmN0aW9uKGEsYixjKXtmdW5jdGlvbiBkKCl7YyYmKGMoeWcoXCJVU0VSX0NBTkNFTExFRFwiKSksYz1udWxsKX12YXIgZT10aGlzLGY9UmMoZmcpLGc7Yi5yZXF1ZXN0SWQ9dGhpcy5vYztiLnJlZGlyZWN0VG89Zi5zY2hlbWUrXCI6Ly9cIitmLmhvc3QrXCIvYmxhbmsvcGFnZS5odG1sXCI7YSs9L1xcPy8udGVzdChhKT9cIlwiOlwiP1wiO2ErPWpiKGIpOyhnPXdpbmRvdy5vcGVuKGEsXCJfYmxhbmtcIixcImxvY2F0aW9uPW5vXCIpKSYmaGEoZy5hZGRFdmVudExpc3RlbmVyKT8oZy5hZGRFdmVudExpc3RlbmVyKFwibG9hZHN0YXJ0XCIsZnVuY3Rpb24oYSl7dmFyIGI7aWYoYj1hJiZhLnVybClhOnt0cnl7dmFyIG09ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImFcIik7bS5ocmVmPWEudXJsO2I9bS5ob3N0PT09Zi5ob3N0JiZcIi9ibGFuay9wYWdlLmh0bWxcIj09PW0ucGF0aG5hbWU7YnJlYWsgYX1jYXRjaCh2KXt9Yj0hMX1iJiYoYT1yZyhhLnVybCksZy5yZW1vdmVFdmVudExpc3RlbmVyKFwiZXhpdFwiLFxuZCksZy5jbG9zZSgpLGE9bmV3IGdnKG51bGwsbnVsbCx7cmVxdWVzdElkOmUub2MscmVxdWVzdEtleTphfSksZS5EZi5yZXF1ZXN0V2l0aENyZWRlbnRpYWwoXCIvYXV0aC9zZXNzaW9uXCIsYSxjKSxjPW51bGwpfSksZy5hZGRFdmVudExpc3RlbmVyKFwiZXhpdFwiLGQpKTpjKHlnKFwiVFJBTlNQT1JUX1VOQVZBSUxBQkxFXCIpKX07QmcuaXNBdmFpbGFibGU9ZnVuY3Rpb24oKXtyZXR1cm4ga2coKX07QmcucHJvdG90eXBlLkJjPWZ1bmN0aW9uKCl7cmV0dXJuXCJyZWRpcmVjdFwifTtmdW5jdGlvbiBDZyhhKXthLmNhbGxiYWNrX3BhcmFtZXRlcnx8KGEuY2FsbGJhY2tfcGFyYW1ldGVyPVwiY2FsbGJhY2tcIik7dGhpcy5vcHRpb25zPWE7d2luZG93Ll9fZmlyZWJhc2VfYXV0aF9qc29ucD13aW5kb3cuX19maXJlYmFzZV9hdXRoX2pzb25wfHx7fX1cbkNnLnByb3RvdHlwZS5vcGVuPWZ1bmN0aW9uKGEsYixjKXtmdW5jdGlvbiBkKCl7YyYmKGMoeWcoXCJSRVFVRVNUX0lOVEVSUlVQVEVEXCIpKSxjPW51bGwpfWZ1bmN0aW9uIGUoKXtzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7d2luZG93Ll9fZmlyZWJhc2VfYXV0aF9qc29ucFtmXT12b2lkIDA7d2Eod2luZG93Ll9fZmlyZWJhc2VfYXV0aF9qc29ucCkmJih3aW5kb3cuX19maXJlYmFzZV9hdXRoX2pzb25wPXZvaWQgMCk7dHJ5e3ZhciBhPWRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGYpO2EmJmEucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChhKX1jYXRjaChiKXt9fSwxKTtwZyh3aW5kb3csXCJiZWZvcmV1bmxvYWRcIixkKX12YXIgZj1cImZuXCIrKG5ldyBEYXRlKS5nZXRUaW1lKCkrTWF0aC5mbG9vcig5OTk5OSpNYXRoLnJhbmRvbSgpKTtiW3RoaXMub3B0aW9ucy5jYWxsYmFja19wYXJhbWV0ZXJdPVwiX19maXJlYmFzZV9hdXRoX2pzb25wLlwiK2Y7YSs9KC9cXD8vLnRlc3QoYSk/XCJcIjpcIj9cIikramIoYik7XG5vZyh3aW5kb3csXCJiZWZvcmV1bmxvYWRcIixkKTt3aW5kb3cuX19maXJlYmFzZV9hdXRoX2pzb25wW2ZdPWZ1bmN0aW9uKGEpe2MmJihjKG51bGwsYSksYz1udWxsKTtlKCl9O0RnKGYsYSxjKX07XG5mdW5jdGlvbiBEZyhhLGIsYyl7c2V0VGltZW91dChmdW5jdGlvbigpe3RyeXt2YXIgZD1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwic2NyaXB0XCIpO2QudHlwZT1cInRleHQvamF2YXNjcmlwdFwiO2QuaWQ9YTtkLmFzeW5jPSEwO2Quc3JjPWI7ZC5vbmVycm9yPWZ1bmN0aW9uKCl7dmFyIGI9ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoYSk7bnVsbCE9PWImJmIucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChiKTtjJiZjKHlnKFwiTkVUV09SS19FUlJPUlwiKSl9O3ZhciBlPWRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKFwiaGVhZFwiKTsoZSYmMCE9ZS5sZW5ndGg/ZVswXTpkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQpLmFwcGVuZENoaWxkKGQpfWNhdGNoKGYpe2MmJmMoeWcoXCJORVRXT1JLX0VSUk9SXCIpKX19LDApfUNnLmlzQXZhaWxhYmxlPWZ1bmN0aW9uKCl7cmV0dXJuITB9O0NnLnByb3RvdHlwZS5CYz1mdW5jdGlvbigpe3JldHVyblwianNvblwifTtmdW5jdGlvbiBFZyhhLGIsYyxkKXtJZi5jYWxsKHRoaXMsW1wiYXV0aF9zdGF0dXNcIl0pO3RoaXMuSD1hO3RoaXMuZGY9Yjt0aGlzLlNnPWM7dGhpcy5LZT1kO3RoaXMucmM9bmV3IGpnKGEsW0RjLFBdKTt0aGlzLm5iPW51bGw7dGhpcy5SZT0hMTtGZyh0aGlzKX1tYShFZyxJZik7aD1FZy5wcm90b3R5cGU7aC53ZT1mdW5jdGlvbigpe3JldHVybiB0aGlzLm5ifHxudWxsfTtmdW5jdGlvbiBGZyhhKXtQLmdldChcInJlZGlyZWN0X3JlcXVlc3RfaWRcIikmJkdnKGEpO3ZhciBiPWEucmMuZ2V0KCk7YiYmYi50b2tlbj8oSGcoYSxiKSxhLmRmKGIudG9rZW4sZnVuY3Rpb24oYyxkKXtJZyhhLGMsZCwhMSxiLnRva2VuLGIpfSxmdW5jdGlvbihiLGQpe0pnKGEsXCJyZXN1bWVTZXNzaW9uKClcIixiLGQpfSkpOkhnKGEsbnVsbCl9XG5mdW5jdGlvbiBLZyhhLGIsYyxkLGUsZil7XCJmaXJlYmFzZWlvLWRlbW8uY29tXCI9PT1hLkguZG9tYWluJiZRKFwiRmlyZWJhc2UgYXV0aGVudGljYXRpb24gaXMgbm90IHN1cHBvcnRlZCBvbiBkZW1vIEZpcmViYXNlcyAoKi5maXJlYmFzZWlvLWRlbW8uY29tKS4gVG8gc2VjdXJlIHlvdXIgRmlyZWJhc2UsIGNyZWF0ZSBhIHByb2R1Y3Rpb24gRmlyZWJhc2UgYXQgaHR0cHM6Ly93d3cuZmlyZWJhc2UuY29tLlwiKTthLmRmKGIsZnVuY3Rpb24oZixrKXtJZyhhLGYsaywhMCxiLGMsZHx8e30sZSl9LGZ1bmN0aW9uKGIsYyl7SmcoYSxcImF1dGgoKVwiLGIsYyxmKX0pfWZ1bmN0aW9uIExnKGEsYil7YS5yYy5jbGVhcigpO0hnKGEsbnVsbCk7YS5TZyhmdW5jdGlvbihhLGQpe2lmKFwib2tcIj09PWEpUihiLG51bGwpO2Vsc2V7dmFyIGU9KGF8fFwiZXJyb3JcIikudG9VcHBlckNhc2UoKSxmPWU7ZCYmKGYrPVwiOiBcIitkKTtmPUVycm9yKGYpO2YuY29kZT1lO1IoYixmKX19KX1cbmZ1bmN0aW9uIElnKGEsYixjLGQsZSxmLGcsayl7XCJva1wiPT09Yj8oZCYmKGI9Yy5hdXRoLGYuYXV0aD1iLGYuZXhwaXJlcz1jLmV4cGlyZXMsZi50b2tlbj1jZChlKT9lOlwiXCIsYz1udWxsLGImJnUoYixcInVpZFwiKT9jPXcoYixcInVpZFwiKTp1KGYsXCJ1aWRcIikmJihjPXcoZixcInVpZFwiKSksZi51aWQ9YyxjPVwiY3VzdG9tXCIsYiYmdShiLFwicHJvdmlkZXJcIik/Yz13KGIsXCJwcm92aWRlclwiKTp1KGYsXCJwcm92aWRlclwiKSYmKGM9dyhmLFwicHJvdmlkZXJcIikpLGYucHJvdmlkZXI9YyxhLnJjLmNsZWFyKCksY2QoZSkmJihnPWd8fHt9LGM9RGMsXCJzZXNzaW9uT25seVwiPT09Zy5yZW1lbWJlciYmKGM9UCksXCJub25lXCIhPT1nLnJlbWVtYmVyJiZhLnJjLnNldChmLGMpKSxIZyhhLGYpKSxSKGssbnVsbCxmKSk6KGEucmMuY2xlYXIoKSxIZyhhLG51bGwpLGY9YT0oYnx8XCJlcnJvclwiKS50b1VwcGVyQ2FzZSgpLGMmJihmKz1cIjogXCIrYyksZj1FcnJvcihmKSxmLmNvZGU9YSxSKGssZikpfVxuZnVuY3Rpb24gSmcoYSxiLGMsZCxlKXtRKGIrXCIgd2FzIGNhbmNlbGVkOiBcIitkKTthLnJjLmNsZWFyKCk7SGcoYSxudWxsKTthPUVycm9yKGQpO2EuY29kZT1jLnRvVXBwZXJDYXNlKCk7UihlLGEpfWZ1bmN0aW9uIE1nKGEsYixjLGQsZSl7TmcoYSk7Yz1uZXcgZ2coZHx8e30se30sY3x8e30pO09nKGEsW0FnLENnXSxcIi9hdXRoL1wiK2IsYyxlKX1cbmZ1bmN0aW9uIFBnKGEsYixjLGQpe05nKGEpO3ZhciBlPVt6ZyxCZ107Yz1pZyhjKTtcImFub255bW91c1wiPT09Ynx8XCJwYXNzd29yZFwiPT09Yj9zZXRUaW1lb3V0KGZ1bmN0aW9uKCl7UihkLHlnKFwiVFJBTlNQT1JUX1VOQVZBSUxBQkxFXCIpKX0sMCk6KGMuY2Uud2luZG93X2ZlYXR1cmVzPVwibWVudWJhcj15ZXMsbW9kYWw9eWVzLGFsd2F5c1JhaXNlZD15ZXNsb2NhdGlvbj15ZXMscmVzaXphYmxlPXllcyxzY3JvbGxiYXJzPXllcyxzdGF0dXM9eWVzLGhlaWdodD02MjUsd2lkdGg9NjI1LHRvcD1cIisoXCJvYmplY3RcIj09PXR5cGVvZiBzY3JlZW4/LjUqKHNjcmVlbi5oZWlnaHQtNjI1KTowKStcIixsZWZ0PVwiKyhcIm9iamVjdFwiPT09dHlwZW9mIHNjcmVlbj8uNSooc2NyZWVuLndpZHRoLTYyNSk6MCksYy5jZS5yZWxheV91cmw9dGcoYS5ILkNiKSxjLmNlLnJlcXVlc3RXaXRoQ3JlZGVudGlhbD1xKGEucGMsYSksT2coYSxlLFwiL2F1dGgvXCIrYixjLGQpKX1cbmZ1bmN0aW9uIEdnKGEpe3ZhciBiPVAuZ2V0KFwicmVkaXJlY3RfcmVxdWVzdF9pZFwiKTtpZihiKXt2YXIgYz1QLmdldChcInJlZGlyZWN0X2NsaWVudF9vcHRpb25zXCIpO1AucmVtb3ZlKFwicmVkaXJlY3RfcmVxdWVzdF9pZFwiKTtQLnJlbW92ZShcInJlZGlyZWN0X2NsaWVudF9vcHRpb25zXCIpO3ZhciBkPVtBZyxDZ10sYj17cmVxdWVzdElkOmIscmVxdWVzdEtleTpyZyhkb2N1bWVudC5sb2NhdGlvbi5oYXNoKX0sYz1uZXcgZ2coYyx7fSxiKTthLlJlPSEwO3RyeXtkb2N1bWVudC5sb2NhdGlvbi5oYXNoPWRvY3VtZW50LmxvY2F0aW9uLmhhc2gucmVwbGFjZSgvJl9fZmlyZWJhc2VfcmVxdWVzdF9rZXk9KFthLXpBLXowLTldKikvLFwiXCIpfWNhdGNoKGUpe31PZyhhLGQsXCIvYXV0aC9zZXNzaW9uXCIsYyxmdW5jdGlvbigpe3RoaXMuUmU9ITF9LmJpbmQoYSkpfX1cbmgucmU9ZnVuY3Rpb24oYSxiKXtOZyh0aGlzKTt2YXIgYz1pZyhhKTtjLmFiLl9tZXRob2Q9XCJQT1NUXCI7dGhpcy5wYyhcIi91c2Vyc1wiLGMsZnVuY3Rpb24oYSxjKXthP1IoYixhKTpSKGIsYSxjKX0pfTtoLlNlPWZ1bmN0aW9uKGEsYil7dmFyIGM9dGhpcztOZyh0aGlzKTt2YXIgZD1cIi91c2Vycy9cIitlbmNvZGVVUklDb21wb25lbnQoYS5lbWFpbCksZT1pZyhhKTtlLmFiLl9tZXRob2Q9XCJERUxFVEVcIjt0aGlzLnBjKGQsZSxmdW5jdGlvbihhLGQpeyFhJiZkJiZkLnVpZCYmYy5uYiYmYy5uYi51aWQmJmMubmIudWlkPT09ZC51aWQmJkxnKGMpO1IoYixhKX0pfTtoLm9lPWZ1bmN0aW9uKGEsYil7TmcodGhpcyk7dmFyIGM9XCIvdXNlcnMvXCIrZW5jb2RlVVJJQ29tcG9uZW50KGEuZW1haWwpK1wiL3Bhc3N3b3JkXCIsZD1pZyhhKTtkLmFiLl9tZXRob2Q9XCJQVVRcIjtkLmFiLnBhc3N3b3JkPWEubmV3UGFzc3dvcmQ7dGhpcy5wYyhjLGQsZnVuY3Rpb24oYSl7UihiLGEpfSl9O1xuaC5uZT1mdW5jdGlvbihhLGIpe05nKHRoaXMpO3ZhciBjPVwiL3VzZXJzL1wiK2VuY29kZVVSSUNvbXBvbmVudChhLm9sZEVtYWlsKStcIi9lbWFpbFwiLGQ9aWcoYSk7ZC5hYi5fbWV0aG9kPVwiUFVUXCI7ZC5hYi5lbWFpbD1hLm5ld0VtYWlsO2QuYWIucGFzc3dvcmQ9YS5wYXNzd29yZDt0aGlzLnBjKGMsZCxmdW5jdGlvbihhKXtSKGIsYSl9KX07aC5VZT1mdW5jdGlvbihhLGIpe05nKHRoaXMpO3ZhciBjPVwiL3VzZXJzL1wiK2VuY29kZVVSSUNvbXBvbmVudChhLmVtYWlsKStcIi9wYXNzd29yZFwiLGQ9aWcoYSk7ZC5hYi5fbWV0aG9kPVwiUE9TVFwiO3RoaXMucGMoYyxkLGZ1bmN0aW9uKGEpe1IoYixhKX0pfTtoLnBjPWZ1bmN0aW9uKGEsYixjKXtRZyh0aGlzLFtBZyxDZ10sYSxiLGMpfTtcbmZ1bmN0aW9uIE9nKGEsYixjLGQsZSl7UWcoYSxiLGMsZCxmdW5jdGlvbihiLGMpeyFiJiZjJiZjLnRva2VuJiZjLnVpZD9LZyhhLGMudG9rZW4sYyxkLmxkLGZ1bmN0aW9uKGEsYil7YT9SKGUsYSk6UihlLG51bGwsYil9KTpSKGUsYnx8eWcoXCJVTktOT1dOX0VSUk9SXCIpKX0pfVxuZnVuY3Rpb24gUWcoYSxiLGMsZCxlKXtiPVBhKGIsZnVuY3Rpb24oYSl7cmV0dXJuXCJmdW5jdGlvblwiPT09dHlwZW9mIGEuaXNBdmFpbGFibGUmJmEuaXNBdmFpbGFibGUoKX0pOzA9PT1iLmxlbmd0aD9zZXRUaW1lb3V0KGZ1bmN0aW9uKCl7UihlLHlnKFwiVFJBTlNQT1JUX1VOQVZBSUxBQkxFXCIpKX0sMCk6KGI9bmV3IChiLnNoaWZ0KCkpKGQuY2UpLGQ9aWIoZC5hYiksZC52PVwianMtMi4yLjVcIixkLnRyYW5zcG9ydD1iLkJjKCksZC5zdXBwcmVzc19zdGF0dXNfY29kZXM9ITAsYT1zZygpK1wiL1wiK2EuSC5DYitjLGIub3BlbihhLGQsZnVuY3Rpb24oYSxiKXtpZihhKVIoZSxhKTtlbHNlIGlmKGImJmIuZXJyb3Ipe3ZhciBjPUVycm9yKGIuZXJyb3IubWVzc2FnZSk7Yy5jb2RlPWIuZXJyb3IuY29kZTtjLmRldGFpbHM9Yi5lcnJvci5kZXRhaWxzO1IoZSxjKX1lbHNlIFIoZSxudWxsLGIpfSkpfVxuZnVuY3Rpb24gSGcoYSxiKXt2YXIgYz1udWxsIT09YS5uYnx8bnVsbCE9PWI7YS5uYj1iO2MmJmEuZGUoXCJhdXRoX3N0YXR1c1wiLGIpO2EuS2UobnVsbCE9PWIpfWguemU9ZnVuY3Rpb24oYSl7SihcImF1dGhfc3RhdHVzXCI9PT1hLCdpbml0aWFsIGV2ZW50IG11c3QgYmUgb2YgdHlwZSBcImF1dGhfc3RhdHVzXCInKTtyZXR1cm4gdGhpcy5SZT9udWxsOlt0aGlzLm5iXX07ZnVuY3Rpb24gTmcoYSl7dmFyIGI9YS5IO2lmKFwiZmlyZWJhc2Vpby5jb21cIiE9PWIuZG9tYWluJiZcImZpcmViYXNlaW8tZGVtby5jb21cIiE9PWIuZG9tYWluJiZcImF1dGguZmlyZWJhc2UuY29tXCI9PT1mZyl0aHJvdyBFcnJvcihcIlRoaXMgY3VzdG9tIEZpcmViYXNlIHNlcnZlciAoJ1wiK2EuSC5kb21haW4rXCInKSBkb2VzIG5vdCBzdXBwb3J0IGRlbGVnYXRlZCBsb2dpbi5cIik7fTtmdW5jdGlvbiBSZyhhKXt0aGlzLmhjPWE7dGhpcy5LZD1bXTt0aGlzLlFiPTA7dGhpcy5wZT0tMTt0aGlzLkZiPW51bGx9ZnVuY3Rpb24gU2coYSxiLGMpe2EucGU9YjthLkZiPWM7YS5wZTxhLlFiJiYoYS5GYigpLGEuRmI9bnVsbCl9ZnVuY3Rpb24gVGcoYSxiLGMpe2ZvcihhLktkW2JdPWM7YS5LZFthLlFiXTspe3ZhciBkPWEuS2RbYS5RYl07ZGVsZXRlIGEuS2RbYS5RYl07Zm9yKHZhciBlPTA7ZTxkLmxlbmd0aDsrK2UpaWYoZFtlXSl7dmFyIGY9YTtDYihmdW5jdGlvbigpe2YuaGMoZFtlXSl9KX1pZihhLlFiPT09YS5wZSl7YS5GYiYmKGNsZWFyVGltZW91dChhLkZiKSxhLkZiKCksYS5GYj1udWxsKTticmVha31hLlFiKyt9fTtmdW5jdGlvbiBVZyhhLGIsYyl7dGhpcy5xZT1hO3RoaXMuZj1PYyhhKTt0aGlzLm9iPXRoaXMucGI9MDt0aGlzLlZhPU9iKGIpO3RoaXMuVmQ9Yzt0aGlzLkdjPSExO3RoaXMuZ2Q9ZnVuY3Rpb24oYSl7Yi5ob3N0IT09Yi5PYSYmKGEubnM9Yi5DYik7dmFyIGM9W10sZjtmb3IoZiBpbiBhKWEuaGFzT3duUHJvcGVydHkoZikmJmMucHVzaChmK1wiPVwiK2FbZl0pO3JldHVybihiLmxiP1wiaHR0cHM6Ly9cIjpcImh0dHA6Ly9cIikrYi5PYStcIi8ubHA/XCIrYy5qb2luKFwiJlwiKX19dmFyIFZnLFdnO1xuVWcucHJvdG90eXBlLm9wZW49ZnVuY3Rpb24oYSxiKXt0aGlzLmdmPTA7dGhpcy5rYT1iO3RoaXMuemY9bmV3IFJnKGEpO3RoaXMuemI9ITE7dmFyIGM9dGhpczt0aGlzLnJiPXNldFRpbWVvdXQoZnVuY3Rpb24oKXtjLmYoXCJUaW1lZCBvdXQgdHJ5aW5nIHRvIGNvbm5lY3QuXCIpO2MuaWIoKTtjLnJiPW51bGx9LE1hdGguZmxvb3IoM0U0KSk7VGMoZnVuY3Rpb24oKXtpZighYy56Yil7Yy5UYT1uZXcgWGcoZnVuY3Rpb24oYSxiLGQsayxsKXtZZyhjLGFyZ3VtZW50cyk7aWYoYy5UYSlpZihjLnJiJiYoY2xlYXJUaW1lb3V0KGMucmIpLGMucmI9bnVsbCksYy5HYz0hMCxcInN0YXJ0XCI9PWEpYy5pZD1iLGMuRmY9ZDtlbHNlIGlmKFwiY2xvc2VcIj09PWEpYj8oYy5UYS5UZD0hMSxTZyhjLnpmLGIsZnVuY3Rpb24oKXtjLmliKCl9KSk6Yy5pYigpO2Vsc2UgdGhyb3cgRXJyb3IoXCJVbnJlY29nbml6ZWQgY29tbWFuZCByZWNlaXZlZDogXCIrYSk7fSxmdW5jdGlvbihhLGIpe1lnKGMsYXJndW1lbnRzKTtcblRnKGMuemYsYSxiKX0sZnVuY3Rpb24oKXtjLmliKCl9LGMuZ2QpO3ZhciBhPXtzdGFydDpcInRcIn07YS5zZXI9TWF0aC5mbG9vcigxRTgqTWF0aC5yYW5kb20oKSk7Yy5UYS5mZSYmKGEuY2I9Yy5UYS5mZSk7YS52PVwiNVwiO2MuVmQmJihhLnM9Yy5WZCk7XCJ1bmRlZmluZWRcIiE9PXR5cGVvZiBsb2NhdGlvbiYmbG9jYXRpb24uaHJlZiYmLTEhPT1sb2NhdGlvbi5ocmVmLmluZGV4T2YoXCJmaXJlYmFzZWlvLmNvbVwiKSYmKGEucj1cImZcIik7YT1jLmdkKGEpO2MuZihcIkNvbm5lY3RpbmcgdmlhIGxvbmctcG9sbCB0byBcIithKTtaZyhjLlRhLGEsZnVuY3Rpb24oKXt9KX19KX07XG5VZy5wcm90b3R5cGUuc3RhcnQ9ZnVuY3Rpb24oKXt2YXIgYT10aGlzLlRhLGI9dGhpcy5GZjthLnJnPXRoaXMuaWQ7YS5zZz1iO2ZvcihhLmtlPSEwOyRnKGEpOyk7YT10aGlzLmlkO2I9dGhpcy5GZjt0aGlzLmZjPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpZnJhbWVcIik7dmFyIGM9e2RmcmFtZTpcInRcIn07Yy5pZD1hO2MucHc9Yjt0aGlzLmZjLnNyYz10aGlzLmdkKGMpO3RoaXMuZmMuc3R5bGUuZGlzcGxheT1cIm5vbmVcIjtkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRoaXMuZmMpfTtVZy5pc0F2YWlsYWJsZT1mdW5jdGlvbigpe3JldHVybiBWZ3x8IVdnJiZcInVuZGVmaW5lZFwiIT09dHlwZW9mIGRvY3VtZW50JiYhKFwib2JqZWN0XCI9PT10eXBlb2Ygd2luZG93JiZ3aW5kb3cuY2hyb21lJiZ3aW5kb3cuY2hyb21lLmV4dGVuc2lvbiYmIS9eY2hyb21lLy50ZXN0KHdpbmRvdy5sb2NhdGlvbi5ocmVmKSkmJiEoXCJvYmplY3RcIj09PXR5cGVvZiBXaW5kb3dzJiZcIm9iamVjdFwiPT09dHlwZW9mIFdpbmRvd3MuVWcpfTtcbmg9VWcucHJvdG90eXBlO2guQmQ9ZnVuY3Rpb24oKXt9O2guY2Q9ZnVuY3Rpb24oKXt0aGlzLnpiPSEwO3RoaXMuVGEmJih0aGlzLlRhLmNsb3NlKCksdGhpcy5UYT1udWxsKTt0aGlzLmZjJiYoZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZCh0aGlzLmZjKSx0aGlzLmZjPW51bGwpO3RoaXMucmImJihjbGVhclRpbWVvdXQodGhpcy5yYiksdGhpcy5yYj1udWxsKX07aC5pYj1mdW5jdGlvbigpe3RoaXMuemJ8fCh0aGlzLmYoXCJMb25ncG9sbCBpcyBjbG9zaW5nIGl0c2VsZlwiKSx0aGlzLmNkKCksdGhpcy5rYSYmKHRoaXMua2EodGhpcy5HYyksdGhpcy5rYT1udWxsKSl9O2guY2xvc2U9ZnVuY3Rpb24oKXt0aGlzLnpifHwodGhpcy5mKFwiTG9uZ3BvbGwgaXMgYmVpbmcgY2xvc2VkLlwiKSx0aGlzLmNkKCkpfTtcbmguc2VuZD1mdW5jdGlvbihhKXthPUIoYSk7dGhpcy5wYis9YS5sZW5ndGg7TGIodGhpcy5WYSxcImJ5dGVzX3NlbnRcIixhLmxlbmd0aCk7YT1LYyhhKTthPWZiKGEsITApO2E9WGMoYSwxODQwKTtmb3IodmFyIGI9MDtiPGEubGVuZ3RoO2IrKyl7dmFyIGM9dGhpcy5UYTtjLiRjLnB1c2goe0pnOnRoaXMuZ2YsUmc6YS5sZW5ndGgsamY6YVtiXX0pO2Mua2UmJiRnKGMpO3RoaXMuZ2YrK319O2Z1bmN0aW9uIFlnKGEsYil7dmFyIGM9QihiKS5sZW5ndGg7YS5vYis9YztMYihhLlZhLFwiYnl0ZXNfcmVjZWl2ZWRcIixjKX1cbmZ1bmN0aW9uIFhnKGEsYixjLGQpe3RoaXMuZ2Q9ZDt0aGlzLmpiPWM7dGhpcy5PZT1uZXcgY2c7dGhpcy4kYz1bXTt0aGlzLnNlPU1hdGguZmxvb3IoMUU4Kk1hdGgucmFuZG9tKCkpO3RoaXMuVGQ9ITA7dGhpcy5mZT1HYygpO3dpbmRvd1tcInBMUENvbW1hbmRcIit0aGlzLmZlXT1hO3dpbmRvd1tcInBSVExQQ0JcIit0aGlzLmZlXT1iO2E9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImlmcmFtZVwiKTthLnN0eWxlLmRpc3BsYXk9XCJub25lXCI7aWYoZG9jdW1lbnQuYm9keSl7ZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChhKTt0cnl7YS5jb250ZW50V2luZG93LmRvY3VtZW50fHxCYihcIk5vIElFIGRvbWFpbiBzZXR0aW5nIHJlcXVpcmVkXCIpfWNhdGNoKGUpe2Euc3JjPVwiamF2YXNjcmlwdDp2b2lkKChmdW5jdGlvbigpe2RvY3VtZW50Lm9wZW4oKTtkb2N1bWVudC5kb21haW49J1wiK2RvY3VtZW50LmRvbWFpbitcIic7ZG9jdW1lbnQuY2xvc2UoKTt9KSgpKVwifX1lbHNlIHRocm93XCJEb2N1bWVudCBib2R5IGhhcyBub3QgaW5pdGlhbGl6ZWQuIFdhaXQgdG8gaW5pdGlhbGl6ZSBGaXJlYmFzZSB1bnRpbCBhZnRlciB0aGUgZG9jdW1lbnQgaXMgcmVhZHkuXCI7XG5hLmNvbnRlbnREb2N1bWVudD9hLmdiPWEuY29udGVudERvY3VtZW50OmEuY29udGVudFdpbmRvdz9hLmdiPWEuY29udGVudFdpbmRvdy5kb2N1bWVudDphLmRvY3VtZW50JiYoYS5nYj1hLmRvY3VtZW50KTt0aGlzLkNhPWE7YT1cIlwiO3RoaXMuQ2Euc3JjJiZcImphdmFzY3JpcHQ6XCI9PT10aGlzLkNhLnNyYy5zdWJzdHIoMCwxMSkmJihhPSc8c2NyaXB0PmRvY3VtZW50LmRvbWFpbj1cIicrZG9jdW1lbnQuZG9tYWluKydcIjtcXHgzYy9zY3JpcHQ+Jyk7YT1cIjxodG1sPjxib2R5PlwiK2ErXCI8L2JvZHk+PC9odG1sPlwiO3RyeXt0aGlzLkNhLmdiLm9wZW4oKSx0aGlzLkNhLmdiLndyaXRlKGEpLHRoaXMuQ2EuZ2IuY2xvc2UoKX1jYXRjaChmKXtCYihcImZyYW1lIHdyaXRpbmcgZXhjZXB0aW9uXCIpLGYuc3RhY2smJkJiKGYuc3RhY2spLEJiKGYpfX1cblhnLnByb3RvdHlwZS5jbG9zZT1mdW5jdGlvbigpe3RoaXMua2U9ITE7aWYodGhpcy5DYSl7dGhpcy5DYS5nYi5ib2R5LmlubmVySFRNTD1cIlwiO3ZhciBhPXRoaXM7c2V0VGltZW91dChmdW5jdGlvbigpe251bGwhPT1hLkNhJiYoZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZChhLkNhKSxhLkNhPW51bGwpfSxNYXRoLmZsb29yKDApKX12YXIgYj10aGlzLmpiO2ImJih0aGlzLmpiPW51bGwsYigpKX07XG5mdW5jdGlvbiAkZyhhKXtpZihhLmtlJiZhLlRkJiZhLk9lLmNvdW50KCk8KDA8YS4kYy5sZW5ndGg/MjoxKSl7YS5zZSsrO3ZhciBiPXt9O2IuaWQ9YS5yZztiLnB3PWEuc2c7Yi5zZXI9YS5zZTtmb3IodmFyIGI9YS5nZChiKSxjPVwiXCIsZD0wOzA8YS4kYy5sZW5ndGg7KWlmKDE4NzA+PWEuJGNbMF0uamYubGVuZ3RoKzMwK2MubGVuZ3RoKXt2YXIgZT1hLiRjLnNoaWZ0KCksYz1jK1wiJnNlZ1wiK2QrXCI9XCIrZS5KZytcIiZ0c1wiK2QrXCI9XCIrZS5SZytcIiZkXCIrZCtcIj1cIitlLmpmO2QrK31lbHNlIGJyZWFrO2FoKGEsYitjLGEuc2UpO3JldHVybiEwfXJldHVybiExfWZ1bmN0aW9uIGFoKGEsYixjKXtmdW5jdGlvbiBkKCl7YS5PZS5yZW1vdmUoYyk7JGcoYSl9YS5PZS5hZGQoYywxKTt2YXIgZT1zZXRUaW1lb3V0KGQsTWF0aC5mbG9vcigyNUUzKSk7WmcoYSxiLGZ1bmN0aW9uKCl7Y2xlYXJUaW1lb3V0KGUpO2QoKX0pfVxuZnVuY3Rpb24gWmcoYSxiLGMpe3NldFRpbWVvdXQoZnVuY3Rpb24oKXt0cnl7aWYoYS5UZCl7dmFyIGQ9YS5DYS5nYi5jcmVhdGVFbGVtZW50KFwic2NyaXB0XCIpO2QudHlwZT1cInRleHQvamF2YXNjcmlwdFwiO2QuYXN5bmM9ITA7ZC5zcmM9YjtkLm9ubG9hZD1kLm9ucmVhZHlzdGF0ZWNoYW5nZT1mdW5jdGlvbigpe3ZhciBhPWQucmVhZHlTdGF0ZTthJiZcImxvYWRlZFwiIT09YSYmXCJjb21wbGV0ZVwiIT09YXx8KGQub25sb2FkPWQub25yZWFkeXN0YXRlY2hhbmdlPW51bGwsZC5wYXJlbnROb2RlJiZkLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoZCksYygpKX07ZC5vbmVycm9yPWZ1bmN0aW9uKCl7QmIoXCJMb25nLXBvbGwgc2NyaXB0IGZhaWxlZCB0byBsb2FkOiBcIitiKTthLlRkPSExO2EuY2xvc2UoKX07YS5DYS5nYi5ib2R5LmFwcGVuZENoaWxkKGQpfX1jYXRjaChlKXt9fSxNYXRoLmZsb29yKDEpKX07dmFyIGJoPW51bGw7XCJ1bmRlZmluZWRcIiE9PXR5cGVvZiBNb3pXZWJTb2NrZXQ/Ymg9TW96V2ViU29ja2V0OlwidW5kZWZpbmVkXCIhPT10eXBlb2YgV2ViU29ja2V0JiYoYmg9V2ViU29ja2V0KTtmdW5jdGlvbiBjaChhLGIsYyl7dGhpcy5xZT1hO3RoaXMuZj1PYyh0aGlzLnFlKTt0aGlzLmZyYW1lcz10aGlzLkpjPW51bGw7dGhpcy5vYj10aGlzLnBiPXRoaXMuYmY9MDt0aGlzLlZhPU9iKGIpO3RoaXMuZmI9KGIubGI/XCJ3c3M6Ly9cIjpcIndzOi8vXCIpK2IuT2ErXCIvLndzP3Y9NVwiO1widW5kZWZpbmVkXCIhPT10eXBlb2YgbG9jYXRpb24mJmxvY2F0aW9uLmhyZWYmJi0xIT09bG9jYXRpb24uaHJlZi5pbmRleE9mKFwiZmlyZWJhc2Vpby5jb21cIikmJih0aGlzLmZiKz1cIiZyPWZcIik7Yi5ob3N0IT09Yi5PYSYmKHRoaXMuZmI9dGhpcy5mYitcIiZucz1cIitiLkNiKTtjJiYodGhpcy5mYj10aGlzLmZiK1wiJnM9XCIrYyl9dmFyIGRoO1xuY2gucHJvdG90eXBlLm9wZW49ZnVuY3Rpb24oYSxiKXt0aGlzLmpiPWI7dGhpcy53Zz1hO3RoaXMuZihcIldlYnNvY2tldCBjb25uZWN0aW5nIHRvIFwiK3RoaXMuZmIpO3RoaXMuR2M9ITE7RGMuc2V0KFwicHJldmlvdXNfd2Vic29ja2V0X2ZhaWx1cmVcIiwhMCk7dHJ5e3RoaXMudmE9bmV3IGJoKHRoaXMuZmIpfWNhdGNoKGMpe3RoaXMuZihcIkVycm9yIGluc3RhbnRpYXRpbmcgV2ViU29ja2V0LlwiKTt2YXIgZD1jLm1lc3NhZ2V8fGMuZGF0YTtkJiZ0aGlzLmYoZCk7dGhpcy5pYigpO3JldHVybn12YXIgZT10aGlzO3RoaXMudmEub25vcGVuPWZ1bmN0aW9uKCl7ZS5mKFwiV2Vic29ja2V0IGNvbm5lY3RlZC5cIik7ZS5HYz0hMH07dGhpcy52YS5vbmNsb3NlPWZ1bmN0aW9uKCl7ZS5mKFwiV2Vic29ja2V0IGNvbm5lY3Rpb24gd2FzIGRpc2Nvbm5lY3RlZC5cIik7ZS52YT1udWxsO2UuaWIoKX07dGhpcy52YS5vbm1lc3NhZ2U9ZnVuY3Rpb24oYSl7aWYobnVsbCE9PWUudmEpaWYoYT1hLmRhdGEsZS5vYis9XG5hLmxlbmd0aCxMYihlLlZhLFwiYnl0ZXNfcmVjZWl2ZWRcIixhLmxlbmd0aCksZWgoZSksbnVsbCE9PWUuZnJhbWVzKWZoKGUsYSk7ZWxzZXthOntKKG51bGw9PT1lLmZyYW1lcyxcIldlIGFscmVhZHkgaGF2ZSBhIGZyYW1lIGJ1ZmZlclwiKTtpZig2Pj1hLmxlbmd0aCl7dmFyIGI9TnVtYmVyKGEpO2lmKCFpc05hTihiKSl7ZS5iZj1iO2UuZnJhbWVzPVtdO2E9bnVsbDticmVhayBhfX1lLmJmPTE7ZS5mcmFtZXM9W119bnVsbCE9PWEmJmZoKGUsYSl9fTt0aGlzLnZhLm9uZXJyb3I9ZnVuY3Rpb24oYSl7ZS5mKFwiV2ViU29ja2V0IGVycm9yLiAgQ2xvc2luZyBjb25uZWN0aW9uLlwiKTsoYT1hLm1lc3NhZ2V8fGEuZGF0YSkmJmUuZihhKTtlLmliKCl9fTtjaC5wcm90b3R5cGUuc3RhcnQ9ZnVuY3Rpb24oKXt9O1xuY2guaXNBdmFpbGFibGU9ZnVuY3Rpb24oKXt2YXIgYT0hMTtpZihcInVuZGVmaW5lZFwiIT09dHlwZW9mIG5hdmlnYXRvciYmbmF2aWdhdG9yLnVzZXJBZ2VudCl7dmFyIGI9bmF2aWdhdG9yLnVzZXJBZ2VudC5tYXRjaCgvQW5kcm9pZCAoWzAtOV17MCx9XFwuWzAtOV17MCx9KS8pO2ImJjE8Yi5sZW5ndGgmJjQuND5wYXJzZUZsb2F0KGJbMV0pJiYoYT0hMCl9cmV0dXJuIWEmJm51bGwhPT1iaCYmIWRofTtjaC5yZXNwb25zZXNSZXF1aXJlZFRvQmVIZWFsdGh5PTI7Y2guaGVhbHRoeVRpbWVvdXQ9M0U0O2g9Y2gucHJvdG90eXBlO2guQmQ9ZnVuY3Rpb24oKXtEYy5yZW1vdmUoXCJwcmV2aW91c193ZWJzb2NrZXRfZmFpbHVyZVwiKX07ZnVuY3Rpb24gZmgoYSxiKXthLmZyYW1lcy5wdXNoKGIpO2lmKGEuZnJhbWVzLmxlbmd0aD09YS5iZil7dmFyIGM9YS5mcmFtZXMuam9pbihcIlwiKTthLmZyYW1lcz1udWxsO2M9bWIoYyk7YS53ZyhjKX19XG5oLnNlbmQ9ZnVuY3Rpb24oYSl7ZWgodGhpcyk7YT1CKGEpO3RoaXMucGIrPWEubGVuZ3RoO0xiKHRoaXMuVmEsXCJieXRlc19zZW50XCIsYS5sZW5ndGgpO2E9WGMoYSwxNjM4NCk7MTxhLmxlbmd0aCYmdGhpcy52YS5zZW5kKFN0cmluZyhhLmxlbmd0aCkpO2Zvcih2YXIgYj0wO2I8YS5sZW5ndGg7YisrKXRoaXMudmEuc2VuZChhW2JdKX07aC5jZD1mdW5jdGlvbigpe3RoaXMuemI9ITA7dGhpcy5KYyYmKGNsZWFySW50ZXJ2YWwodGhpcy5KYyksdGhpcy5KYz1udWxsKTt0aGlzLnZhJiYodGhpcy52YS5jbG9zZSgpLHRoaXMudmE9bnVsbCl9O2guaWI9ZnVuY3Rpb24oKXt0aGlzLnpifHwodGhpcy5mKFwiV2ViU29ja2V0IGlzIGNsb3NpbmcgaXRzZWxmXCIpLHRoaXMuY2QoKSx0aGlzLmpiJiYodGhpcy5qYih0aGlzLkdjKSx0aGlzLmpiPW51bGwpKX07aC5jbG9zZT1mdW5jdGlvbigpe3RoaXMuemJ8fCh0aGlzLmYoXCJXZWJTb2NrZXQgaXMgYmVpbmcgY2xvc2VkXCIpLHRoaXMuY2QoKSl9O1xuZnVuY3Rpb24gZWgoYSl7Y2xlYXJJbnRlcnZhbChhLkpjKTthLkpjPXNldEludGVydmFsKGZ1bmN0aW9uKCl7YS52YSYmYS52YS5zZW5kKFwiMFwiKTtlaChhKX0sTWF0aC5mbG9vcig0NUUzKSl9O2Z1bmN0aW9uIGdoKGEpe2hoKHRoaXMsYSl9dmFyIGloPVtVZyxjaF07ZnVuY3Rpb24gaGgoYSxiKXt2YXIgYz1jaCYmY2guaXNBdmFpbGFibGUoKSxkPWMmJiEoRGMudWZ8fCEwPT09RGMuZ2V0KFwicHJldmlvdXNfd2Vic29ja2V0X2ZhaWx1cmVcIikpO2IuVGcmJihjfHxRKFwid3NzOi8vIFVSTCB1c2VkLCBidXQgYnJvd3NlciBpc24ndCBrbm93biB0byBzdXBwb3J0IHdlYnNvY2tldHMuICBUcnlpbmcgYW55d2F5LlwiKSxkPSEwKTtpZihkKWEuZWQ9W2NoXTtlbHNle3ZhciBlPWEuZWQ9W107WWMoaWgsZnVuY3Rpb24oYSxiKXtiJiZiLmlzQXZhaWxhYmxlKCkmJmUucHVzaChiKX0pfX1mdW5jdGlvbiBqaChhKXtpZigwPGEuZWQubGVuZ3RoKXJldHVybiBhLmVkWzBdO3Rocm93IEVycm9yKFwiTm8gdHJhbnNwb3J0cyBhdmFpbGFibGVcIik7fTtmdW5jdGlvbiBraChhLGIsYyxkLGUsZil7dGhpcy5pZD1hO3RoaXMuZj1PYyhcImM6XCIrdGhpcy5pZCtcIjpcIik7dGhpcy5oYz1jO3RoaXMuVmM9ZDt0aGlzLmthPWU7dGhpcy5NZT1mO3RoaXMuSD1iO3RoaXMuSmQ9W107dGhpcy5lZj0wO3RoaXMuTmY9bmV3IGdoKGIpO3RoaXMuVWE9MDt0aGlzLmYoXCJDb25uZWN0aW9uIGNyZWF0ZWRcIik7bGgodGhpcyl9XG5mdW5jdGlvbiBsaChhKXt2YXIgYj1qaChhLk5mKTthLkw9bmV3IGIoXCJjOlwiK2EuaWQrXCI6XCIrYS5lZisrLGEuSCk7YS5RZT1iLnJlc3BvbnNlc1JlcXVpcmVkVG9CZUhlYWx0aHl8fDA7dmFyIGM9bWgoYSxhLkwpLGQ9bmgoYSxhLkwpO2EuZmQ9YS5MO2EuYmQ9YS5MO2EuRj1udWxsO2EuQWI9ITE7c2V0VGltZW91dChmdW5jdGlvbigpe2EuTCYmYS5MLm9wZW4oYyxkKX0sTWF0aC5mbG9vcigwKSk7Yj1iLmhlYWx0aHlUaW1lb3V0fHwwOzA8YiYmKGEudmQ9c2V0VGltZW91dChmdW5jdGlvbigpe2EudmQ9bnVsbDthLkFifHwoYS5MJiYxMDI0MDA8YS5MLm9iPyhhLmYoXCJDb25uZWN0aW9uIGV4Y2VlZGVkIGhlYWx0aHkgdGltZW91dCBidXQgaGFzIHJlY2VpdmVkIFwiK2EuTC5vYitcIiBieXRlcy4gIE1hcmtpbmcgY29ubmVjdGlvbiBoZWFsdGh5LlwiKSxhLkFiPSEwLGEuTC5CZCgpKTphLkwmJjEwMjQwPGEuTC5wYj9hLmYoXCJDb25uZWN0aW9uIGV4Y2VlZGVkIGhlYWx0aHkgdGltZW91dCBidXQgaGFzIHNlbnQgXCIrXG5hLkwucGIrXCIgYnl0ZXMuICBMZWF2aW5nIGNvbm5lY3Rpb24gYWxpdmUuXCIpOihhLmYoXCJDbG9zaW5nIHVuaGVhbHRoeSBjb25uZWN0aW9uIGFmdGVyIHRpbWVvdXQuXCIpLGEuY2xvc2UoKSkpfSxNYXRoLmZsb29yKGIpKSl9ZnVuY3Rpb24gbmgoYSxiKXtyZXR1cm4gZnVuY3Rpb24oYyl7Yj09PWEuTD8oYS5MPW51bGwsY3x8MCE9PWEuVWE/MT09PWEuVWEmJmEuZihcIlJlYWx0aW1lIGNvbm5lY3Rpb24gbG9zdC5cIik6KGEuZihcIlJlYWx0aW1lIGNvbm5lY3Rpb24gZmFpbGVkLlwiKSxcInMtXCI9PT1hLkguT2Euc3Vic3RyKDAsMikmJihEYy5yZW1vdmUoXCJob3N0OlwiK2EuSC5ob3N0KSxhLkguT2E9YS5ILmhvc3QpKSxhLmNsb3NlKCkpOmI9PT1hLkY/KGEuZihcIlNlY29uZGFyeSBjb25uZWN0aW9uIGxvc3QuXCIpLGM9YS5GLGEuRj1udWxsLGEuZmQhPT1jJiZhLmJkIT09Y3x8YS5jbG9zZSgpKTphLmYoXCJjbG9zaW5nIGFuIG9sZCBjb25uZWN0aW9uXCIpfX1cbmZ1bmN0aW9uIG1oKGEsYil7cmV0dXJuIGZ1bmN0aW9uKGMpe2lmKDIhPWEuVWEpaWYoYj09PWEuYmQpe3ZhciBkPVZjKFwidFwiLGMpO2M9VmMoXCJkXCIsYyk7aWYoXCJjXCI9PWQpe2lmKGQ9VmMoXCJ0XCIsYyksXCJkXCJpbiBjKWlmKGM9Yy5kLFwiaFwiPT09ZCl7dmFyIGQ9Yy50cyxlPWMudixmPWMuaDthLlZkPWMucztGYyhhLkgsZik7MD09YS5VYSYmKGEuTC5zdGFydCgpLG9oKGEsYS5MLGQpLFwiNVwiIT09ZSYmUShcIlByb3RvY29sIHZlcnNpb24gbWlzbWF0Y2ggZGV0ZWN0ZWRcIiksYz1hLk5mLChjPTE8Yy5lZC5sZW5ndGg/Yy5lZFsxXTpudWxsKSYmcGgoYSxjKSl9ZWxzZSBpZihcIm5cIj09PWQpe2EuZihcInJlY3ZkIGVuZCB0cmFuc21pc3Npb24gb24gcHJpbWFyeVwiKTthLmJkPWEuRjtmb3IoYz0wO2M8YS5KZC5sZW5ndGg7KytjKWEuRmQoYS5KZFtjXSk7YS5KZD1bXTtxaChhKX1lbHNlXCJzXCI9PT1kPyhhLmYoXCJDb25uZWN0aW9uIHNodXRkb3duIGNvbW1hbmQgcmVjZWl2ZWQuIFNodXR0aW5nIGRvd24uLi5cIiksXG5hLk1lJiYoYS5NZShjKSxhLk1lPW51bGwpLGEua2E9bnVsbCxhLmNsb3NlKCkpOlwiclwiPT09ZD8oYS5mKFwiUmVzZXQgcGFja2V0IHJlY2VpdmVkLiAgTmV3IGhvc3Q6IFwiK2MpLEZjKGEuSCxjKSwxPT09YS5VYT9hLmNsb3NlKCk6KHJoKGEpLGxoKGEpKSk6XCJlXCI9PT1kP1BjKFwiU2VydmVyIEVycm9yOiBcIitjKTpcIm9cIj09PWQ/KGEuZihcImdvdCBwb25nIG9uIHByaW1hcnkuXCIpLHNoKGEpLHRoKGEpKTpQYyhcIlVua25vd24gY29udHJvbCBwYWNrZXQgY29tbWFuZDogXCIrZCl9ZWxzZVwiZFwiPT1kJiZhLkZkKGMpfWVsc2UgaWYoYj09PWEuRilpZihkPVZjKFwidFwiLGMpLGM9VmMoXCJkXCIsYyksXCJjXCI9PWQpXCJ0XCJpbiBjJiYoYz1jLnQsXCJhXCI9PT1jP3VoKGEpOlwiclwiPT09Yz8oYS5mKFwiR290IGEgcmVzZXQgb24gc2Vjb25kYXJ5LCBjbG9zaW5nIGl0XCIpLGEuRi5jbG9zZSgpLGEuZmQhPT1hLkYmJmEuYmQhPT1hLkZ8fGEuY2xvc2UoKSk6XCJvXCI9PT1jJiYoYS5mKFwiZ290IHBvbmcgb24gc2Vjb25kYXJ5LlwiKSxcbmEuTGYtLSx1aChhKSkpO2Vsc2UgaWYoXCJkXCI9PWQpYS5KZC5wdXNoKGMpO2Vsc2UgdGhyb3cgRXJyb3IoXCJVbmtub3duIHByb3RvY29sIGxheWVyOiBcIitkKTtlbHNlIGEuZihcIm1lc3NhZ2Ugb24gb2xkIGNvbm5lY3Rpb25cIil9fWtoLnByb3RvdHlwZS5EYT1mdW5jdGlvbihhKXt2aCh0aGlzLHt0OlwiZFwiLGQ6YX0pfTtmdW5jdGlvbiBxaChhKXthLmZkPT09YS5GJiZhLmJkPT09YS5GJiYoYS5mKFwiY2xlYW5pbmcgdXAgYW5kIHByb21vdGluZyBhIGNvbm5lY3Rpb246IFwiK2EuRi5xZSksYS5MPWEuRixhLkY9bnVsbCl9XG5mdW5jdGlvbiB1aChhKXswPj1hLkxmPyhhLmYoXCJTZWNvbmRhcnkgY29ubmVjdGlvbiBpcyBoZWFsdGh5LlwiKSxhLkFiPSEwLGEuRi5CZCgpLGEuRi5zdGFydCgpLGEuZihcInNlbmRpbmcgY2xpZW50IGFjayBvbiBzZWNvbmRhcnlcIiksYS5GLnNlbmQoe3Q6XCJjXCIsZDp7dDpcImFcIixkOnt9fX0pLGEuZihcIkVuZGluZyB0cmFuc21pc3Npb24gb24gcHJpbWFyeVwiKSxhLkwuc2VuZCh7dDpcImNcIixkOnt0OlwiblwiLGQ6e319fSksYS5mZD1hLkYscWgoYSkpOihhLmYoXCJzZW5kaW5nIHBpbmcgb24gc2Vjb25kYXJ5LlwiKSxhLkYuc2VuZCh7dDpcImNcIixkOnt0OlwicFwiLGQ6e319fSkpfWtoLnByb3RvdHlwZS5GZD1mdW5jdGlvbihhKXtzaCh0aGlzKTt0aGlzLmhjKGEpfTtmdW5jdGlvbiBzaChhKXthLkFifHwoYS5RZS0tLDA+PWEuUWUmJihhLmYoXCJQcmltYXJ5IGNvbm5lY3Rpb24gaXMgaGVhbHRoeS5cIiksYS5BYj0hMCxhLkwuQmQoKSkpfVxuZnVuY3Rpb24gcGgoYSxiKXthLkY9bmV3IGIoXCJjOlwiK2EuaWQrXCI6XCIrYS5lZisrLGEuSCxhLlZkKTthLkxmPWIucmVzcG9uc2VzUmVxdWlyZWRUb0JlSGVhbHRoeXx8MDthLkYub3BlbihtaChhLGEuRiksbmgoYSxhLkYpKTtzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7YS5GJiYoYS5mKFwiVGltZWQgb3V0IHRyeWluZyB0byB1cGdyYWRlLlwiKSxhLkYuY2xvc2UoKSl9LE1hdGguZmxvb3IoNkU0KSl9ZnVuY3Rpb24gb2goYSxiLGMpe2EuZihcIlJlYWx0aW1lIGNvbm5lY3Rpb24gZXN0YWJsaXNoZWQuXCIpO2EuTD1iO2EuVWE9MTthLlZjJiYoYS5WYyhjKSxhLlZjPW51bGwpOzA9PT1hLlFlPyhhLmYoXCJQcmltYXJ5IGNvbm5lY3Rpb24gaXMgaGVhbHRoeS5cIiksYS5BYj0hMCk6c2V0VGltZW91dChmdW5jdGlvbigpe3RoKGEpfSxNYXRoLmZsb29yKDVFMykpfVxuZnVuY3Rpb24gdGgoYSl7YS5BYnx8MSE9PWEuVWF8fChhLmYoXCJzZW5kaW5nIHBpbmcgb24gcHJpbWFyeS5cIiksdmgoYSx7dDpcImNcIixkOnt0OlwicFwiLGQ6e319fSkpfWZ1bmN0aW9uIHZoKGEsYil7aWYoMSE9PWEuVWEpdGhyb3dcIkNvbm5lY3Rpb24gaXMgbm90IGNvbm5lY3RlZFwiO2EuZmQuc2VuZChiKX1raC5wcm90b3R5cGUuY2xvc2U9ZnVuY3Rpb24oKXsyIT09dGhpcy5VYSYmKHRoaXMuZihcIkNsb3NpbmcgcmVhbHRpbWUgY29ubmVjdGlvbi5cIiksdGhpcy5VYT0yLHJoKHRoaXMpLHRoaXMua2EmJih0aGlzLmthKCksdGhpcy5rYT1udWxsKSl9O2Z1bmN0aW9uIHJoKGEpe2EuZihcIlNodXR0aW5nIGRvd24gYWxsIGNvbm5lY3Rpb25zXCIpO2EuTCYmKGEuTC5jbG9zZSgpLGEuTD1udWxsKTthLkYmJihhLkYuY2xvc2UoKSxhLkY9bnVsbCk7YS52ZCYmKGNsZWFyVGltZW91dChhLnZkKSxhLnZkPW51bGwpfTtmdW5jdGlvbiB3aChhLGIsYyxkKXt0aGlzLmlkPXhoKys7dGhpcy5mPU9jKFwicDpcIit0aGlzLmlkK1wiOlwiKTt0aGlzLndmPXRoaXMuRGU9ITE7dGhpcy5hYT17fTt0aGlzLnBhPVtdO3RoaXMuWGM9MDt0aGlzLlVjPVtdO3RoaXMubWE9ITE7dGhpcy4kYT0xRTM7dGhpcy5DZD0zRTU7dGhpcy5HYj1iO3RoaXMuVGM9Yzt0aGlzLk5lPWQ7dGhpcy5IPWE7dGhpcy5XZT1udWxsO3RoaXMuUWQ9e307dGhpcy5JZz0wO3RoaXMubWY9ITA7dGhpcy5LYz10aGlzLkZlPW51bGw7eWgodGhpcywwKTtNZi51YigpLkViKFwidmlzaWJsZVwiLHRoaXMuemcsdGhpcyk7LTE9PT1hLmhvc3QuaW5kZXhPZihcImZibG9jYWxcIikmJkxmLnViKCkuRWIoXCJvbmxpbmVcIix0aGlzLnhnLHRoaXMpfXZhciB4aD0wLHpoPTA7aD13aC5wcm90b3R5cGU7XG5oLkRhPWZ1bmN0aW9uKGEsYixjKXt2YXIgZD0rK3RoaXMuSWc7YT17cjpkLGE6YSxiOmJ9O3RoaXMuZihCKGEpKTtKKHRoaXMubWEsXCJzZW5kUmVxdWVzdCBjYWxsIHdoZW4gd2UncmUgbm90IGNvbm5lY3RlZCBub3QgYWxsb3dlZC5cIik7dGhpcy5TYS5EYShhKTtjJiYodGhpcy5RZFtkXT1jKX07aC54Zj1mdW5jdGlvbihhLGIsYyxkKXt2YXIgZT1hLndhKCksZj1hLnBhdGgudG9TdHJpbmcoKTt0aGlzLmYoXCJMaXN0ZW4gY2FsbGVkIGZvciBcIitmK1wiIFwiK2UpO3RoaXMuYWFbZl09dGhpcy5hYVtmXXx8e307SighdGhpcy5hYVtmXVtlXSxcImxpc3RlbigpIGNhbGxlZCB0d2ljZSBmb3Igc2FtZSBwYXRoL3F1ZXJ5SWQuXCIpO2E9e0o6ZCx1ZDpiLEZnOmEsdGFnOmN9O3RoaXMuYWFbZl1bZV09YTt0aGlzLm1hJiZBaCh0aGlzLGEpfTtcbmZ1bmN0aW9uIEFoKGEsYil7dmFyIGM9Yi5GZyxkPWMucGF0aC50b1N0cmluZygpLGU9Yy53YSgpO2EuZihcIkxpc3RlbiBvbiBcIitkK1wiIGZvciBcIitlKTt2YXIgZj17cDpkfTtiLnRhZyYmKGYucT1jZShjLm8pLGYudD1iLnRhZyk7Zi5oPWIudWQoKTthLkRhKFwicVwiLGYsZnVuY3Rpb24oZil7dmFyIGs9Zi5kLGw9Zi5zO2lmKGsmJlwib2JqZWN0XCI9PT10eXBlb2YgayYmdShrLFwid1wiKSl7dmFyIG09dyhrLFwid1wiKTtlYShtKSYmMDw9TmEobSxcIm5vX2luZGV4XCIpJiZRKFwiVXNpbmcgYW4gdW5zcGVjaWZpZWQgaW5kZXguIENvbnNpZGVyIGFkZGluZyBcIisoJ1wiLmluZGV4T25cIjogXCInK2Muby5nLnRvU3RyaW5nKCkrJ1wiJykrXCIgYXQgXCIrYy5wYXRoLnRvU3RyaW5nKCkrXCIgdG8geW91ciBzZWN1cml0eSBydWxlcyBmb3IgYmV0dGVyIHBlcmZvcm1hbmNlXCIpfShhLmFhW2RdJiZhLmFhW2RdW2VdKT09PWImJihhLmYoXCJsaXN0ZW4gcmVzcG9uc2VcIixmKSxcIm9rXCIhPT1sJiZCaChhLGQsZSksYi5KJiZcbmIuSihsLGspKX0pfWguUD1mdW5jdGlvbihhLGIsYyl7dGhpcy5GYT17Zmc6YSxuZjohMSx5YzpiLGpkOmN9O3RoaXMuZihcIkF1dGhlbnRpY2F0aW5nIHVzaW5nIGNyZWRlbnRpYWw6IFwiK2EpO0NoKHRoaXMpOyhiPTQwPT1hLmxlbmd0aCl8fChhPWFkKGEpLkFjLGI9XCJvYmplY3RcIj09PXR5cGVvZiBhJiYhMD09PXcoYSxcImFkbWluXCIpKTtiJiYodGhpcy5mKFwiQWRtaW4gYXV0aCBjcmVkZW50aWFsIGRldGVjdGVkLiAgUmVkdWNpbmcgbWF4IHJlY29ubmVjdCB0aW1lLlwiKSx0aGlzLkNkPTNFNCl9O2guZWU9ZnVuY3Rpb24oYSl7ZGVsZXRlIHRoaXMuRmE7dGhpcy5tYSYmdGhpcy5EYShcInVuYXV0aFwiLHt9LGZ1bmN0aW9uKGIpe2EoYi5zLGIuZCl9KX07XG5mdW5jdGlvbiBDaChhKXt2YXIgYj1hLkZhO2EubWEmJmImJmEuRGEoXCJhdXRoXCIse2NyZWQ6Yi5mZ30sZnVuY3Rpb24oYyl7dmFyIGQ9Yy5zO2M9Yy5kfHxcImVycm9yXCI7XCJva1wiIT09ZCYmYS5GYT09PWImJmRlbGV0ZSBhLkZhO2IubmY/XCJva1wiIT09ZCYmYi5qZCYmYi5qZChkLGMpOihiLm5mPSEwLGIueWMmJmIueWMoZCxjKSl9KX1oLk9mPWZ1bmN0aW9uKGEsYil7dmFyIGM9YS5wYXRoLnRvU3RyaW5nKCksZD1hLndhKCk7dGhpcy5mKFwiVW5saXN0ZW4gY2FsbGVkIGZvciBcIitjK1wiIFwiK2QpO2lmKEJoKHRoaXMsYyxkKSYmdGhpcy5tYSl7dmFyIGU9Y2UoYS5vKTt0aGlzLmYoXCJVbmxpc3RlbiBvbiBcIitjK1wiIGZvciBcIitkKTtjPXtwOmN9O2ImJihjLnE9ZSxjLnQ9Yik7dGhpcy5EYShcIm5cIixjKX19O2guTGU9ZnVuY3Rpb24oYSxiLGMpe3RoaXMubWE/RGgodGhpcyxcIm9cIixhLGIsYyk6dGhpcy5VYy5wdXNoKHtaYzphLGFjdGlvbjpcIm9cIixkYXRhOmIsSjpjfSl9O1xuaC5CZj1mdW5jdGlvbihhLGIsYyl7dGhpcy5tYT9EaCh0aGlzLFwib21cIixhLGIsYyk6dGhpcy5VYy5wdXNoKHtaYzphLGFjdGlvbjpcIm9tXCIsZGF0YTpiLEo6Y30pfTtoLkdkPWZ1bmN0aW9uKGEsYil7dGhpcy5tYT9EaCh0aGlzLFwib2NcIixhLG51bGwsYik6dGhpcy5VYy5wdXNoKHtaYzphLGFjdGlvbjpcIm9jXCIsZGF0YTpudWxsLEo6Yn0pfTtmdW5jdGlvbiBEaChhLGIsYyxkLGUpe2M9e3A6YyxkOmR9O2EuZihcIm9uRGlzY29ubmVjdCBcIitiLGMpO2EuRGEoYixjLGZ1bmN0aW9uKGEpe2UmJnNldFRpbWVvdXQoZnVuY3Rpb24oKXtlKGEucyxhLmQpfSxNYXRoLmZsb29yKDApKX0pfWgucHV0PWZ1bmN0aW9uKGEsYixjLGQpe0VoKHRoaXMsXCJwXCIsYSxiLGMsZCl9O2gueWY9ZnVuY3Rpb24oYSxiLGMsZCl7RWgodGhpcyxcIm1cIixhLGIsYyxkKX07XG5mdW5jdGlvbiBFaChhLGIsYyxkLGUsZil7ZD17cDpjLGQ6ZH07bihmKSYmKGQuaD1mKTthLnBhLnB1c2goe2FjdGlvbjpiLElmOmQsSjplfSk7YS5YYysrO2I9YS5wYS5sZW5ndGgtMTthLm1hP0ZoKGEsYik6YS5mKFwiQnVmZmVyaW5nIHB1dDogXCIrYyl9ZnVuY3Rpb24gRmgoYSxiKXt2YXIgYz1hLnBhW2JdLmFjdGlvbixkPWEucGFbYl0uSWYsZT1hLnBhW2JdLko7YS5wYVtiXS5HZz1hLm1hO2EuRGEoYyxkLGZ1bmN0aW9uKGQpe2EuZihjK1wiIHJlc3BvbnNlXCIsZCk7ZGVsZXRlIGEucGFbYl07YS5YYy0tOzA9PT1hLlhjJiYoYS5wYT1bXSk7ZSYmZShkLnMsZC5kKX0pfWguVGU9ZnVuY3Rpb24oYSl7dGhpcy5tYSYmKGE9e2M6YX0sdGhpcy5mKFwicmVwb3J0U3RhdHNcIixhKSx0aGlzLkRhKFwic1wiLGEsZnVuY3Rpb24oYSl7XCJva1wiIT09YS5zJiZ0aGlzLmYoXCJyZXBvcnRTdGF0c1wiLFwiRXJyb3Igc2VuZGluZyBzdGF0czogXCIrYS5kKX0pKX07XG5oLkZkPWZ1bmN0aW9uKGEpe2lmKFwiclwiaW4gYSl7dGhpcy5mKFwiZnJvbSBzZXJ2ZXI6IFwiK0IoYSkpO3ZhciBiPWEucixjPXRoaXMuUWRbYl07YyYmKGRlbGV0ZSB0aGlzLlFkW2JdLGMoYS5iKSl9ZWxzZXtpZihcImVycm9yXCJpbiBhKXRocm93XCJBIHNlcnZlci1zaWRlIGVycm9yIGhhcyBvY2N1cnJlZDogXCIrYS5lcnJvcjtcImFcImluIGEmJihiPWEuYSxjPWEuYix0aGlzLmYoXCJoYW5kbGVTZXJ2ZXJNZXNzYWdlXCIsYixjKSxcImRcIj09PWI/dGhpcy5HYihjLnAsYy5kLCExLGMudCk6XCJtXCI9PT1iP3RoaXMuR2IoYy5wLGMuZCwhMCxjLnQpOlwiY1wiPT09Yj9HaCh0aGlzLGMucCxjLnEpOlwiYWNcIj09PWI/KGE9Yy5zLGI9Yy5kLGM9dGhpcy5GYSxkZWxldGUgdGhpcy5GYSxjJiZjLmpkJiZjLmpkKGEsYikpOlwic2RcIj09PWI/dGhpcy5XZT90aGlzLldlKGMpOlwibXNnXCJpbiBjJiZcInVuZGVmaW5lZFwiIT09dHlwZW9mIGNvbnNvbGUmJmNvbnNvbGUubG9nKFwiRklSRUJBU0U6IFwiK2MubXNnLnJlcGxhY2UoXCJcXG5cIixcblwiXFxuRklSRUJBU0U6IFwiKSk6UGMoXCJVbnJlY29nbml6ZWQgYWN0aW9uIHJlY2VpdmVkIGZyb20gc2VydmVyOiBcIitCKGIpK1wiXFxuQXJlIHlvdSB1c2luZyB0aGUgbGF0ZXN0IGNsaWVudD9cIikpfX07aC5WYz1mdW5jdGlvbihhKXt0aGlzLmYoXCJjb25uZWN0aW9uIHJlYWR5XCIpO3RoaXMubWE9ITA7dGhpcy5LYz0obmV3IERhdGUpLmdldFRpbWUoKTt0aGlzLk5lKHtzZXJ2ZXJUaW1lT2Zmc2V0OmEtKG5ldyBEYXRlKS5nZXRUaW1lKCl9KTt0aGlzLm1mJiYoYT17fSxhW1wic2RrLmpzLlwiK1wiMi4yLjVcIi5yZXBsYWNlKC9cXC4vZyxcIi1cIildPTEsa2coKSYmKGFbXCJmcmFtZXdvcmsuY29yZG92YVwiXT0xKSx0aGlzLlRlKGEpKTtIaCh0aGlzKTt0aGlzLm1mPSExO3RoaXMuVGMoITApfTtcbmZ1bmN0aW9uIHloKGEsYil7SighYS5TYSxcIlNjaGVkdWxpbmcgYSBjb25uZWN0IHdoZW4gd2UncmUgYWxyZWFkeSBjb25uZWN0ZWQvaW5nP1wiKTthLlNiJiZjbGVhclRpbWVvdXQoYS5TYik7YS5TYj1zZXRUaW1lb3V0KGZ1bmN0aW9uKCl7YS5TYj1udWxsO0loKGEpfSxNYXRoLmZsb29yKGIpKX1oLnpnPWZ1bmN0aW9uKGEpe2EmJiF0aGlzLnVjJiZ0aGlzLiRhPT09dGhpcy5DZCYmKHRoaXMuZihcIldpbmRvdyBiZWNhbWUgdmlzaWJsZS4gIFJlZHVjaW5nIGRlbGF5LlwiKSx0aGlzLiRhPTFFMyx0aGlzLlNhfHx5aCh0aGlzLDApKTt0aGlzLnVjPWF9O2gueGc9ZnVuY3Rpb24oYSl7YT8odGhpcy5mKFwiQnJvd3NlciB3ZW50IG9ubGluZS5cIiksdGhpcy4kYT0xRTMsdGhpcy5TYXx8eWgodGhpcywwKSk6KHRoaXMuZihcIkJyb3dzZXIgd2VudCBvZmZsaW5lLiAgS2lsbGluZyBjb25uZWN0aW9uLlwiKSx0aGlzLlNhJiZ0aGlzLlNhLmNsb3NlKCkpfTtcbmguQ2Y9ZnVuY3Rpb24oKXt0aGlzLmYoXCJkYXRhIGNsaWVudCBkaXNjb25uZWN0ZWRcIik7dGhpcy5tYT0hMTt0aGlzLlNhPW51bGw7Zm9yKHZhciBhPTA7YTx0aGlzLnBhLmxlbmd0aDthKyspe3ZhciBiPXRoaXMucGFbYV07YiYmXCJoXCJpbiBiLklmJiZiLkdnJiYoYi5KJiZiLkooXCJkaXNjb25uZWN0XCIpLGRlbGV0ZSB0aGlzLnBhW2FdLHRoaXMuWGMtLSl9MD09PXRoaXMuWGMmJih0aGlzLnBhPVtdKTt0aGlzLlFkPXt9O0poKHRoaXMpJiYodGhpcy51Yz90aGlzLktjJiYoM0U0PChuZXcgRGF0ZSkuZ2V0VGltZSgpLXRoaXMuS2MmJih0aGlzLiRhPTFFMyksdGhpcy5LYz1udWxsKToodGhpcy5mKFwiV2luZG93IGlzbid0IHZpc2libGUuICBEZWxheWluZyByZWNvbm5lY3QuXCIpLHRoaXMuJGE9dGhpcy5DZCx0aGlzLkZlPShuZXcgRGF0ZSkuZ2V0VGltZSgpKSxhPU1hdGgubWF4KDAsdGhpcy4kYS0oKG5ldyBEYXRlKS5nZXRUaW1lKCktdGhpcy5GZSkpLGEqPU1hdGgucmFuZG9tKCksdGhpcy5mKFwiVHJ5aW5nIHRvIHJlY29ubmVjdCBpbiBcIitcbmErXCJtc1wiKSx5aCh0aGlzLGEpLHRoaXMuJGE9TWF0aC5taW4odGhpcy5DZCwxLjMqdGhpcy4kYSkpO3RoaXMuVGMoITEpfTtmdW5jdGlvbiBJaChhKXtpZihKaChhKSl7YS5mKFwiTWFraW5nIGEgY29ubmVjdGlvbiBhdHRlbXB0XCIpO2EuRmU9KG5ldyBEYXRlKS5nZXRUaW1lKCk7YS5LYz1udWxsO3ZhciBiPXEoYS5GZCxhKSxjPXEoYS5WYyxhKSxkPXEoYS5DZixhKSxlPWEuaWQrXCI6XCIremgrKzthLlNhPW5ldyBraChlLGEuSCxiLGMsZCxmdW5jdGlvbihiKXtRKGIrXCIgKFwiK2EuSC50b1N0cmluZygpK1wiKVwiKTthLndmPSEwfSl9fWgueWI9ZnVuY3Rpb24oKXt0aGlzLkRlPSEwO3RoaXMuU2E/dGhpcy5TYS5jbG9zZSgpOih0aGlzLlNiJiYoY2xlYXJUaW1lb3V0KHRoaXMuU2IpLHRoaXMuU2I9bnVsbCksdGhpcy5tYSYmdGhpcy5DZigpKX07aC5xYz1mdW5jdGlvbigpe3RoaXMuRGU9ITE7dGhpcy4kYT0xRTM7dGhpcy5TYXx8eWgodGhpcywwKX07XG5mdW5jdGlvbiBHaChhLGIsYyl7Yz1jP1FhKGMsZnVuY3Rpb24oYSl7cmV0dXJuIFdjKGEpfSkuam9pbihcIiRcIik6XCJkZWZhdWx0XCI7KGE9QmgoYSxiLGMpKSYmYS5KJiZhLkooXCJwZXJtaXNzaW9uX2RlbmllZFwiKX1mdW5jdGlvbiBCaChhLGIsYyl7Yj0obmV3IEsoYikpLnRvU3RyaW5nKCk7dmFyIGQ7bihhLmFhW2JdKT8oZD1hLmFhW2JdW2NdLGRlbGV0ZSBhLmFhW2JdW2NdLDA9PT1wYShhLmFhW2JdKSYmZGVsZXRlIGEuYWFbYl0pOmQ9dm9pZCAwO3JldHVybiBkfWZ1bmN0aW9uIEhoKGEpe0NoKGEpO3IoYS5hYSxmdW5jdGlvbihiKXtyKGIsZnVuY3Rpb24oYil7QWgoYSxiKX0pfSk7Zm9yKHZhciBiPTA7YjxhLnBhLmxlbmd0aDtiKyspYS5wYVtiXSYmRmgoYSxiKTtmb3IoO2EuVWMubGVuZ3RoOyliPWEuVWMuc2hpZnQoKSxEaChhLGIuYWN0aW9uLGIuWmMsYi5kYXRhLGIuSil9ZnVuY3Rpb24gSmgoYSl7dmFyIGI7Yj1MZi51YigpLmljO3JldHVybiFhLndmJiYhYS5EZSYmYn07dmFyIFY9e2xnOmZ1bmN0aW9uKCl7Vmc9ZGg9ITB9fTtWLmZvcmNlTG9uZ1BvbGxpbmc9Vi5sZztWLm1nPWZ1bmN0aW9uKCl7V2c9ITB9O1YuZm9yY2VXZWJTb2NrZXRzPVYubWc7Vi5NZz1mdW5jdGlvbihhLGIpe2Euay5SYS5XZT1ifTtWLnNldFNlY3VyaXR5RGVidWdDYWxsYmFjaz1WLk1nO1YuWWU9ZnVuY3Rpb24oYSxiKXthLmsuWWUoYil9O1Yuc3RhdHM9Vi5ZZTtWLlplPWZ1bmN0aW9uKGEsYil7YS5rLlplKGIpfTtWLnN0YXRzSW5jcmVtZW50Q291bnRlcj1WLlplO1YucGQ9ZnVuY3Rpb24oYSl7cmV0dXJuIGEuay5wZH07Vi5kYXRhVXBkYXRlQ291bnQ9Vi5wZDtWLnBnPWZ1bmN0aW9uKGEsYil7YS5rLkNlPWJ9O1YuaW50ZXJjZXB0U2VydmVyRGF0YT1WLnBnO1Yudmc9ZnVuY3Rpb24oYSl7bmV3IHVnKGEpfTtWLm9uUG9wdXBPcGVuPVYudmc7Vi5LZz1mdW5jdGlvbihhKXtmZz1hfTtWLnNldEF1dGhlbnRpY2F0aW9uU2VydmVyPVYuS2c7ZnVuY3Rpb24gUyhhLGIsYyl7dGhpcy5CPWE7dGhpcy5WPWI7dGhpcy5nPWN9Uy5wcm90b3R5cGUuSz1mdW5jdGlvbigpe3goXCJGaXJlYmFzZS5EYXRhU25hcHNob3QudmFsXCIsMCwwLGFyZ3VtZW50cy5sZW5ndGgpO3JldHVybiB0aGlzLkIuSygpfTtTLnByb3RvdHlwZS52YWw9Uy5wcm90b3R5cGUuSztTLnByb3RvdHlwZS5sZj1mdW5jdGlvbigpe3goXCJGaXJlYmFzZS5EYXRhU25hcHNob3QuZXhwb3J0VmFsXCIsMCwwLGFyZ3VtZW50cy5sZW5ndGgpO3JldHVybiB0aGlzLkIuSyghMCl9O1MucHJvdG90eXBlLmV4cG9ydFZhbD1TLnByb3RvdHlwZS5sZjtTLnByb3RvdHlwZS5rZz1mdW5jdGlvbigpe3goXCJGaXJlYmFzZS5EYXRhU25hcHNob3QuZXhpc3RzXCIsMCwwLGFyZ3VtZW50cy5sZW5ndGgpO3JldHVybiF0aGlzLkIuZSgpfTtTLnByb3RvdHlwZS5leGlzdHM9Uy5wcm90b3R5cGUua2c7XG5TLnByb3RvdHlwZS53PWZ1bmN0aW9uKGEpe3goXCJGaXJlYmFzZS5EYXRhU25hcHNob3QuY2hpbGRcIiwwLDEsYXJndW1lbnRzLmxlbmd0aCk7Z2EoYSkmJihhPVN0cmluZyhhKSk7WGYoXCJGaXJlYmFzZS5EYXRhU25hcHNob3QuY2hpbGRcIixhKTt2YXIgYj1uZXcgSyhhKSxjPXRoaXMuVi53KGIpO3JldHVybiBuZXcgUyh0aGlzLkIub2EoYiksYyxNKX07Uy5wcm90b3R5cGUuY2hpbGQ9Uy5wcm90b3R5cGUudztTLnByb3RvdHlwZS5IYT1mdW5jdGlvbihhKXt4KFwiRmlyZWJhc2UuRGF0YVNuYXBzaG90Lmhhc0NoaWxkXCIsMSwxLGFyZ3VtZW50cy5sZW5ndGgpO1hmKFwiRmlyZWJhc2UuRGF0YVNuYXBzaG90Lmhhc0NoaWxkXCIsYSk7dmFyIGI9bmV3IEsoYSk7cmV0dXJuIXRoaXMuQi5vYShiKS5lKCl9O1MucHJvdG90eXBlLmhhc0NoaWxkPVMucHJvdG90eXBlLkhhO1xuUy5wcm90b3R5cGUuQT1mdW5jdGlvbigpe3goXCJGaXJlYmFzZS5EYXRhU25hcHNob3QuZ2V0UHJpb3JpdHlcIiwwLDAsYXJndW1lbnRzLmxlbmd0aCk7cmV0dXJuIHRoaXMuQi5BKCkuSygpfTtTLnByb3RvdHlwZS5nZXRQcmlvcml0eT1TLnByb3RvdHlwZS5BO1MucHJvdG90eXBlLmZvckVhY2g9ZnVuY3Rpb24oYSl7eChcIkZpcmViYXNlLkRhdGFTbmFwc2hvdC5mb3JFYWNoXCIsMSwxLGFyZ3VtZW50cy5sZW5ndGgpO0EoXCJGaXJlYmFzZS5EYXRhU25hcHNob3QuZm9yRWFjaFwiLDEsYSwhMSk7aWYodGhpcy5CLk4oKSlyZXR1cm4hMTt2YXIgYj10aGlzO3JldHVybiEhdGhpcy5CLlUodGhpcy5nLGZ1bmN0aW9uKGMsZCl7cmV0dXJuIGEobmV3IFMoZCxiLlYudyhjKSxNKSl9KX07Uy5wcm90b3R5cGUuZm9yRWFjaD1TLnByb3RvdHlwZS5mb3JFYWNoO1xuUy5wcm90b3R5cGUudGQ9ZnVuY3Rpb24oKXt4KFwiRmlyZWJhc2UuRGF0YVNuYXBzaG90Lmhhc0NoaWxkcmVuXCIsMCwwLGFyZ3VtZW50cy5sZW5ndGgpO3JldHVybiB0aGlzLkIuTigpPyExOiF0aGlzLkIuZSgpfTtTLnByb3RvdHlwZS5oYXNDaGlsZHJlbj1TLnByb3RvdHlwZS50ZDtTLnByb3RvdHlwZS5uYW1lPWZ1bmN0aW9uKCl7UShcIkZpcmViYXNlLkRhdGFTbmFwc2hvdC5uYW1lKCkgYmVpbmcgZGVwcmVjYXRlZC4gUGxlYXNlIHVzZSBGaXJlYmFzZS5EYXRhU25hcHNob3Qua2V5KCkgaW5zdGVhZC5cIik7eChcIkZpcmViYXNlLkRhdGFTbmFwc2hvdC5uYW1lXCIsMCwwLGFyZ3VtZW50cy5sZW5ndGgpO3JldHVybiB0aGlzLmtleSgpfTtTLnByb3RvdHlwZS5uYW1lPVMucHJvdG90eXBlLm5hbWU7Uy5wcm90b3R5cGUua2V5PWZ1bmN0aW9uKCl7eChcIkZpcmViYXNlLkRhdGFTbmFwc2hvdC5rZXlcIiwwLDAsYXJndW1lbnRzLmxlbmd0aCk7cmV0dXJuIHRoaXMuVi5rZXkoKX07XG5TLnByb3RvdHlwZS5rZXk9Uy5wcm90b3R5cGUua2V5O1MucHJvdG90eXBlLkRiPWZ1bmN0aW9uKCl7eChcIkZpcmViYXNlLkRhdGFTbmFwc2hvdC5udW1DaGlsZHJlblwiLDAsMCxhcmd1bWVudHMubGVuZ3RoKTtyZXR1cm4gdGhpcy5CLkRiKCl9O1MucHJvdG90eXBlLm51bUNoaWxkcmVuPVMucHJvdG90eXBlLkRiO1MucHJvdG90eXBlLmxjPWZ1bmN0aW9uKCl7eChcIkZpcmViYXNlLkRhdGFTbmFwc2hvdC5yZWZcIiwwLDAsYXJndW1lbnRzLmxlbmd0aCk7cmV0dXJuIHRoaXMuVn07Uy5wcm90b3R5cGUucmVmPVMucHJvdG90eXBlLmxjO2Z1bmN0aW9uIEtoKGEsYil7dGhpcy5IPWE7dGhpcy5WYT1PYihhKTt0aGlzLmVhPW5ldyB1Yjt0aGlzLkVkPTE7dGhpcy5SYT1udWxsO2J8fDA8PShcIm9iamVjdFwiPT09dHlwZW9mIHdpbmRvdyYmd2luZG93Lm5hdmlnYXRvciYmd2luZG93Lm5hdmlnYXRvci51c2VyQWdlbnR8fFwiXCIpLnNlYXJjaCgvZ29vZ2xlYm90fGdvb2dsZSB3ZWJtYXN0ZXIgdG9vbHN8YmluZ2JvdHx5YWhvbyEgc2x1cnB8YmFpZHVzcGlkZXJ8eWFuZGV4Ym90fGR1Y2tkdWNrYm90L2kpPyh0aGlzLmNhPW5ldyBBZSh0aGlzLkgscSh0aGlzLkdiLHRoaXMpKSxzZXRUaW1lb3V0KHEodGhpcy5UYyx0aGlzLCEwKSwwKSk6dGhpcy5jYT10aGlzLlJhPW5ldyB3aCh0aGlzLkgscSh0aGlzLkdiLHRoaXMpLHEodGhpcy5UYyx0aGlzKSxxKHRoaXMuTmUsdGhpcykpO3RoaXMuUGc9UGIoYSxxKGZ1bmN0aW9uKCl7cmV0dXJuIG5ldyBKYih0aGlzLlZhLHRoaXMuY2EpfSx0aGlzKSk7dGhpcy50Yz1uZXcgQ2Y7dGhpcy5CZT1cbm5ldyBuYjt2YXIgYz10aGlzO3RoaXMuemQ9bmV3IGdmKHtYZTpmdW5jdGlvbihhLGIsZixnKXtiPVtdO2Y9Yy5CZS5qKGEucGF0aCk7Zi5lKCl8fChiPWpmKGMuemQsbmV3IFViKHplLGEucGF0aCxmKSksc2V0VGltZW91dChmdW5jdGlvbigpe2coXCJva1wiKX0sMCkpO3JldHVybiBifSxaZDpiYX0pO0xoKHRoaXMsXCJjb25uZWN0ZWRcIiwhMSk7dGhpcy5rYT1uZXcgcWM7dGhpcy5QPW5ldyBFZyhhLHEodGhpcy5jYS5QLHRoaXMuY2EpLHEodGhpcy5jYS5lZSx0aGlzLmNhKSxxKHRoaXMuS2UsdGhpcykpO3RoaXMucGQ9MDt0aGlzLkNlPW51bGw7dGhpcy5PPW5ldyBnZih7WGU6ZnVuY3Rpb24oYSxiLGYsZyl7Yy5jYS54ZihhLGYsYixmdW5jdGlvbihiLGUpe3ZhciBmPWcoYixlKTt6YihjLmVhLGEucGF0aCxmKX0pO3JldHVybltdfSxaZDpmdW5jdGlvbihhLGIpe2MuY2EuT2YoYSxiKX19KX1oPUtoLnByb3RvdHlwZTtcbmgudG9TdHJpbmc9ZnVuY3Rpb24oKXtyZXR1cm4odGhpcy5ILmxiP1wiaHR0cHM6Ly9cIjpcImh0dHA6Ly9cIikrdGhpcy5ILmhvc3R9O2gubmFtZT1mdW5jdGlvbigpe3JldHVybiB0aGlzLkguQ2J9O2Z1bmN0aW9uIE1oKGEpe2E9YS5CZS5qKG5ldyBLKFwiLmluZm8vc2VydmVyVGltZU9mZnNldFwiKSkuSygpfHwwO3JldHVybihuZXcgRGF0ZSkuZ2V0VGltZSgpK2F9ZnVuY3Rpb24gTmgoYSl7YT1hPXt0aW1lc3RhbXA6TWgoYSl9O2EudGltZXN0YW1wPWEudGltZXN0YW1wfHwobmV3IERhdGUpLmdldFRpbWUoKTtyZXR1cm4gYX1cbmguR2I9ZnVuY3Rpb24oYSxiLGMsZCl7dGhpcy5wZCsrO3ZhciBlPW5ldyBLKGEpO2I9dGhpcy5DZT90aGlzLkNlKGEsYik6YjthPVtdO2Q/Yz8oYj1uYShiLGZ1bmN0aW9uKGEpe3JldHVybiBMKGEpfSksYT1yZih0aGlzLk8sZSxiLGQpKTooYj1MKGIpLGE9bmYodGhpcy5PLGUsYixkKSk6Yz8oZD1uYShiLGZ1bmN0aW9uKGEpe3JldHVybiBMKGEpfSksYT1tZih0aGlzLk8sZSxkKSk6KGQ9TChiKSxhPWpmKHRoaXMuTyxuZXcgVWIoemUsZSxkKSkpO2Q9ZTswPGEubGVuZ3RoJiYoZD1PaCh0aGlzLGUpKTt6Yih0aGlzLmVhLGQsYSl9O2guVGM9ZnVuY3Rpb24oYSl7TGgodGhpcyxcImNvbm5lY3RlZFwiLGEpOyExPT09YSYmUGgodGhpcyl9O2guTmU9ZnVuY3Rpb24oYSl7dmFyIGI9dGhpcztZYyhhLGZ1bmN0aW9uKGEsZCl7TGgoYixkLGEpfSl9O2guS2U9ZnVuY3Rpb24oYSl7TGgodGhpcyxcImF1dGhlbnRpY2F0ZWRcIixhKX07XG5mdW5jdGlvbiBMaChhLGIsYyl7Yj1uZXcgSyhcIi8uaW5mby9cIitiKTtjPUwoYyk7dmFyIGQ9YS5CZTtkLlNkPWQuU2QuRyhiLGMpO2M9amYoYS56ZCxuZXcgVWIoemUsYixjKSk7emIoYS5lYSxiLGMpfWguS2I9ZnVuY3Rpb24oYSxiLGMsZCl7dGhpcy5mKFwic2V0XCIse3BhdGg6YS50b1N0cmluZygpLHZhbHVlOmIsWGc6Y30pO3ZhciBlPU5oKHRoaXMpO2I9TChiLGMpO3ZhciBlPXNjKGIsZSksZj10aGlzLkVkKyssZT1oZih0aGlzLk8sYSxlLGYsITApO3ZiKHRoaXMuZWEsZSk7dmFyIGc9dGhpczt0aGlzLmNhLnB1dChhLnRvU3RyaW5nKCksYi5LKCEwKSxmdW5jdGlvbihiLGMpe3ZhciBlPVwib2tcIj09PWI7ZXx8UShcInNldCBhdCBcIithK1wiIGZhaWxlZDogXCIrYik7ZT1sZihnLk8sZiwhZSk7emIoZy5lYSxhLGUpO1FoKGQsYixjKX0pO2U9UmgodGhpcyxhKTtPaCh0aGlzLGUpO3piKHRoaXMuZWEsZSxbXSl9O1xuaC51cGRhdGU9ZnVuY3Rpb24oYSxiLGMpe3RoaXMuZihcInVwZGF0ZVwiLHtwYXRoOmEudG9TdHJpbmcoKSx2YWx1ZTpifSk7dmFyIGQ9ITAsZT1OaCh0aGlzKSxmPXt9O3IoYixmdW5jdGlvbihhLGIpe2Q9ITE7dmFyIGM9TChhKTtmW2JdPXNjKGMsZSl9KTtpZihkKUJiKFwidXBkYXRlKCkgY2FsbGVkIHdpdGggZW1wdHkgZGF0YS4gIERvbid0IGRvIGFueXRoaW5nLlwiKSxRaChjLFwib2tcIik7ZWxzZXt2YXIgZz10aGlzLkVkKyssaz1rZih0aGlzLk8sYSxmLGcpO3ZiKHRoaXMuZWEsayk7dmFyIGw9dGhpczt0aGlzLmNhLnlmKGEudG9TdHJpbmcoKSxiLGZ1bmN0aW9uKGIsZCl7dmFyIGU9XCJva1wiPT09YjtlfHxRKFwidXBkYXRlIGF0IFwiK2ErXCIgZmFpbGVkOiBcIitiKTt2YXIgZT1sZihsLk8sZywhZSksZj1hOzA8ZS5sZW5ndGgmJihmPU9oKGwsYSkpO3piKGwuZWEsZixlKTtRaChjLGIsZCl9KTtiPVJoKHRoaXMsYSk7T2godGhpcyxiKTt6Yih0aGlzLmVhLGEsW10pfX07XG5mdW5jdGlvbiBQaChhKXthLmYoXCJvbkRpc2Nvbm5lY3RFdmVudHNcIik7dmFyIGI9TmgoYSksYz1bXTtyYyhwYyhhLmthLGIpLEYsZnVuY3Rpb24oYixlKXtjPWMuY29uY2F0KGpmKGEuTyxuZXcgVWIoemUsYixlKSkpO3ZhciBmPVJoKGEsYik7T2goYSxmKX0pO2Eua2E9bmV3IHFjO3piKGEuZWEsRixjKX1oLkdkPWZ1bmN0aW9uKGEsYil7dmFyIGM9dGhpczt0aGlzLmNhLkdkKGEudG9TdHJpbmcoKSxmdW5jdGlvbihkLGUpe1wib2tcIj09PWQmJmVnKGMua2EsYSk7UWgoYixkLGUpfSl9O2Z1bmN0aW9uIFNoKGEsYixjLGQpe3ZhciBlPUwoYyk7YS5jYS5MZShiLnRvU3RyaW5nKCksZS5LKCEwKSxmdW5jdGlvbihjLGcpe1wib2tcIj09PWMmJmEua2EubWMoYixlKTtRaChkLGMsZyl9KX1mdW5jdGlvbiBUaChhLGIsYyxkLGUpe3ZhciBmPUwoYyxkKTthLmNhLkxlKGIudG9TdHJpbmcoKSxmLksoITApLGZ1bmN0aW9uKGMsZCl7XCJva1wiPT09YyYmYS5rYS5tYyhiLGYpO1FoKGUsYyxkKX0pfVxuZnVuY3Rpb24gVWgoYSxiLGMsZCl7dmFyIGU9ITAsZjtmb3IoZiBpbiBjKWU9ITE7ZT8oQmIoXCJvbkRpc2Nvbm5lY3QoKS51cGRhdGUoKSBjYWxsZWQgd2l0aCBlbXB0eSBkYXRhLiAgRG9uJ3QgZG8gYW55dGhpbmcuXCIpLFFoKGQsXCJva1wiKSk6YS5jYS5CZihiLnRvU3RyaW5nKCksYyxmdW5jdGlvbihlLGYpe2lmKFwib2tcIj09PWUpZm9yKHZhciBsIGluIGMpe3ZhciBtPUwoY1tsXSk7YS5rYS5tYyhiLncobCksbSl9UWgoZCxlLGYpfSl9ZnVuY3Rpb24gVmgoYSxiLGMpe2M9XCIuaW5mb1wiPT09TyhiLnBhdGgpP2EuemQuT2IoYixjKTphLk8uT2IoYixjKTt4YihhLmVhLGIucGF0aCxjKX1oLnliPWZ1bmN0aW9uKCl7dGhpcy5SYSYmdGhpcy5SYS55YigpfTtoLnFjPWZ1bmN0aW9uKCl7dGhpcy5SYSYmdGhpcy5SYS5xYygpfTtcbmguWWU9ZnVuY3Rpb24oYSl7aWYoXCJ1bmRlZmluZWRcIiE9PXR5cGVvZiBjb25zb2xlKXthPyh0aGlzLllkfHwodGhpcy5ZZD1uZXcgSWIodGhpcy5WYSkpLGE9dGhpcy5ZZC5nZXQoKSk6YT10aGlzLlZhLmdldCgpO3ZhciBiPVJhKHNhKGEpLGZ1bmN0aW9uKGEsYil7cmV0dXJuIE1hdGgubWF4KGIubGVuZ3RoLGEpfSwwKSxjO2ZvcihjIGluIGEpe2Zvcih2YXIgZD1hW2NdLGU9Yy5sZW5ndGg7ZTxiKzI7ZSsrKWMrPVwiIFwiO2NvbnNvbGUubG9nKGMrZCl9fX07aC5aZT1mdW5jdGlvbihhKXtMYih0aGlzLlZhLGEpO3RoaXMuUGcuTWZbYV09ITB9O2guZj1mdW5jdGlvbihhKXt2YXIgYj1cIlwiO3RoaXMuUmEmJihiPXRoaXMuUmEuaWQrXCI6XCIpO0JiKGIsYXJndW1lbnRzKX07XG5mdW5jdGlvbiBRaChhLGIsYyl7YSYmQ2IoZnVuY3Rpb24oKXtpZihcIm9rXCI9PWIpYShudWxsKTtlbHNle3ZhciBkPShifHxcImVycm9yXCIpLnRvVXBwZXJDYXNlKCksZT1kO2MmJihlKz1cIjogXCIrYyk7ZT1FcnJvcihlKTtlLmNvZGU9ZDthKGUpfX0pfTtmdW5jdGlvbiBXaChhLGIsYyxkLGUpe2Z1bmN0aW9uIGYoKXt9YS5mKFwidHJhbnNhY3Rpb24gb24gXCIrYik7dmFyIGc9bmV3IFUoYSxiKTtnLkViKFwidmFsdWVcIixmKTtjPXtwYXRoOmIsdXBkYXRlOmMsSjpkLHN0YXR1czpudWxsLEVmOkdjKCksY2Y6ZSxLZjowLGdlOmZ1bmN0aW9uKCl7Zy5nYyhcInZhbHVlXCIsZil9LGplOm51bGwsQWE6bnVsbCxtZDpudWxsLG5kOm51bGwsb2Q6bnVsbH07ZD1hLk8udWEoYix2b2lkIDApfHxDO2MubWQ9ZDtkPWMudXBkYXRlKGQuSygpKTtpZihuKGQpKXtTZihcInRyYW5zYWN0aW9uIGZhaWxlZDogRGF0YSByZXR1cm5lZCBcIixkLGMucGF0aCk7Yy5zdGF0dXM9MTtlPURmKGEudGMsYik7dmFyIGs9ZS5CYSgpfHxbXTtrLnB1c2goYyk7RWYoZSxrKTtcIm9iamVjdFwiPT09dHlwZW9mIGQmJm51bGwhPT1kJiZ1KGQsXCIucHJpb3JpdHlcIik/KGs9dyhkLFwiLnByaW9yaXR5XCIpLEooUWYoayksXCJJbnZhbGlkIHByaW9yaXR5IHJldHVybmVkIGJ5IHRyYW5zYWN0aW9uLiBQcmlvcml0eSBtdXN0IGJlIGEgdmFsaWQgc3RyaW5nLCBmaW5pdGUgbnVtYmVyLCBzZXJ2ZXIgdmFsdWUsIG9yIG51bGwuXCIpKTpcbms9KGEuTy51YShiKXx8QykuQSgpLksoKTtlPU5oKGEpO2Q9TChkLGspO2U9c2MoZCxlKTtjLm5kPWQ7Yy5vZD1lO2MuQWE9YS5FZCsrO2M9aGYoYS5PLGIsZSxjLkFhLGMuY2YpO3piKGEuZWEsYixjKTtYaChhKX1lbHNlIGMuZ2UoKSxjLm5kPW51bGwsYy5vZD1udWxsLGMuSiYmKGE9bmV3IFMoYy5tZCxuZXcgVShhLGMucGF0aCksTSksYy5KKG51bGwsITEsYSkpfWZ1bmN0aW9uIFhoKGEsYil7dmFyIGM9Ynx8YS50YztifHxZaChhLGMpO2lmKG51bGwhPT1jLkJhKCkpe3ZhciBkPVpoKGEsYyk7SigwPGQubGVuZ3RoLFwiU2VuZGluZyB6ZXJvIGxlbmd0aCB0cmFuc2FjdGlvbiBxdWV1ZVwiKTtTYShkLGZ1bmN0aW9uKGEpe3JldHVybiAxPT09YS5zdGF0dXN9KSYmJGgoYSxjLnBhdGgoKSxkKX1lbHNlIGMudGQoKSYmYy5VKGZ1bmN0aW9uKGIpe1hoKGEsYil9KX1cbmZ1bmN0aW9uICRoKGEsYixjKXtmb3IodmFyIGQ9UWEoYyxmdW5jdGlvbihhKXtyZXR1cm4gYS5BYX0pLGU9YS5PLnVhKGIsZCl8fEMsZD1lLGU9ZS5oYXNoKCksZj0wO2Y8Yy5sZW5ndGg7ZisrKXt2YXIgZz1jW2ZdO0ooMT09PWcuc3RhdHVzLFwidHJ5VG9TZW5kVHJhbnNhY3Rpb25RdWV1ZV86IGl0ZW1zIGluIHF1ZXVlIHNob3VsZCBhbGwgYmUgcnVuLlwiKTtnLnN0YXR1cz0yO2cuS2YrKzt2YXIgaz1OKGIsZy5wYXRoKSxkPWQuRyhrLGcubmQpfWQ9ZC5LKCEwKTthLmNhLnB1dChiLnRvU3RyaW5nKCksZCxmdW5jdGlvbihkKXthLmYoXCJ0cmFuc2FjdGlvbiBwdXQgcmVzcG9uc2VcIix7cGF0aDpiLnRvU3RyaW5nKCksc3RhdHVzOmR9KTt2YXIgZT1bXTtpZihcIm9rXCI9PT1kKXtkPVtdO2ZvcihmPTA7ZjxjLmxlbmd0aDtmKyspe2NbZl0uc3RhdHVzPTM7ZT1lLmNvbmNhdChsZihhLk8sY1tmXS5BYSkpO2lmKGNbZl0uSil7dmFyIGc9Y1tmXS5vZCxrPW5ldyBVKGEsY1tmXS5wYXRoKTtkLnB1c2gocShjW2ZdLkosXG5udWxsLG51bGwsITAsbmV3IFMoZyxrLE0pKSl9Y1tmXS5nZSgpfVloKGEsRGYoYS50YyxiKSk7WGgoYSk7emIoYS5lYSxiLGUpO2ZvcihmPTA7ZjxkLmxlbmd0aDtmKyspQ2IoZFtmXSl9ZWxzZXtpZihcImRhdGFzdGFsZVwiPT09ZClmb3IoZj0wO2Y8Yy5sZW5ndGg7ZisrKWNbZl0uc3RhdHVzPTQ9PT1jW2ZdLnN0YXR1cz81OjE7ZWxzZSBmb3IoUShcInRyYW5zYWN0aW9uIGF0IFwiK2IudG9TdHJpbmcoKStcIiBmYWlsZWQ6IFwiK2QpLGY9MDtmPGMubGVuZ3RoO2YrKyljW2ZdLnN0YXR1cz01LGNbZl0uamU9ZDtPaChhLGIpfX0sZSl9ZnVuY3Rpb24gT2goYSxiKXt2YXIgYz1haShhLGIpLGQ9Yy5wYXRoKCksYz1aaChhLGMpO2JpKGEsYyxkKTtyZXR1cm4gZH1cbmZ1bmN0aW9uIGJpKGEsYixjKXtpZigwIT09Yi5sZW5ndGgpe2Zvcih2YXIgZD1bXSxlPVtdLGY9UWEoYixmdW5jdGlvbihhKXtyZXR1cm4gYS5BYX0pLGc9MDtnPGIubGVuZ3RoO2crKyl7dmFyIGs9YltnXSxsPU4oYyxrLnBhdGgpLG09ITEsdjtKKG51bGwhPT1sLFwicmVydW5UcmFuc2FjdGlvbnNVbmRlck5vZGVfOiByZWxhdGl2ZVBhdGggc2hvdWxkIG5vdCBiZSBudWxsLlwiKTtpZig1PT09ay5zdGF0dXMpbT0hMCx2PWsuamUsZT1lLmNvbmNhdChsZihhLk8say5BYSwhMCkpO2Vsc2UgaWYoMT09PWsuc3RhdHVzKWlmKDI1PD1rLktmKW09ITAsdj1cIm1heHJldHJ5XCIsZT1lLmNvbmNhdChsZihhLk8say5BYSwhMCkpO2Vsc2V7dmFyIHk9YS5PLnVhKGsucGF0aCxmKXx8QztrLm1kPXk7dmFyIEk9YltnXS51cGRhdGUoeS5LKCkpO24oSSk/KFNmKFwidHJhbnNhY3Rpb24gZmFpbGVkOiBEYXRhIHJldHVybmVkIFwiLEksay5wYXRoKSxsPUwoSSksXCJvYmplY3RcIj09PXR5cGVvZiBJJiZudWxsIT1cbkkmJnUoSSxcIi5wcmlvcml0eVwiKXx8KGw9bC5kYSh5LkEoKSkpLHk9ay5BYSxJPU5oKGEpLEk9c2MobCxJKSxrLm5kPWwsay5vZD1JLGsuQWE9YS5FZCsrLFZhKGYseSksZT1lLmNvbmNhdChoZihhLk8say5wYXRoLEksay5BYSxrLmNmKSksZT1lLmNvbmNhdChsZihhLk8seSwhMCkpKToobT0hMCx2PVwibm9kYXRhXCIsZT1lLmNvbmNhdChsZihhLk8say5BYSwhMCkpKX16YihhLmVhLGMsZSk7ZT1bXTttJiYoYltnXS5zdGF0dXM9MyxzZXRUaW1lb3V0KGJbZ10uZ2UsTWF0aC5mbG9vcigwKSksYltnXS5KJiYoXCJub2RhdGFcIj09PXY/KGs9bmV3IFUoYSxiW2ddLnBhdGgpLGQucHVzaChxKGJbZ10uSixudWxsLG51bGwsITEsbmV3IFMoYltnXS5tZCxrLE0pKSkpOmQucHVzaChxKGJbZ10uSixudWxsLEVycm9yKHYpLCExLG51bGwpKSkpfVloKGEsYS50Yyk7Zm9yKGc9MDtnPGQubGVuZ3RoO2crKylDYihkW2ddKTtYaChhKX19XG5mdW5jdGlvbiBhaShhLGIpe2Zvcih2YXIgYyxkPWEudGM7bnVsbCE9PShjPU8oYikpJiZudWxsPT09ZC5CYSgpOylkPURmKGQsYyksYj1HKGIpO3JldHVybiBkfWZ1bmN0aW9uIFpoKGEsYil7dmFyIGM9W107Y2koYSxiLGMpO2Muc29ydChmdW5jdGlvbihhLGIpe3JldHVybiBhLkVmLWIuRWZ9KTtyZXR1cm4gY31mdW5jdGlvbiBjaShhLGIsYyl7dmFyIGQ9Yi5CYSgpO2lmKG51bGwhPT1kKWZvcih2YXIgZT0wO2U8ZC5sZW5ndGg7ZSsrKWMucHVzaChkW2VdKTtiLlUoZnVuY3Rpb24oYil7Y2koYSxiLGMpfSl9ZnVuY3Rpb24gWWgoYSxiKXt2YXIgYz1iLkJhKCk7aWYoYyl7Zm9yKHZhciBkPTAsZT0wO2U8Yy5sZW5ndGg7ZSsrKTMhPT1jW2VdLnN0YXR1cyYmKGNbZF09Y1tlXSxkKyspO2MubGVuZ3RoPWQ7RWYoYiwwPGMubGVuZ3RoP2M6bnVsbCl9Yi5VKGZ1bmN0aW9uKGIpe1loKGEsYil9KX1cbmZ1bmN0aW9uIFJoKGEsYil7dmFyIGM9YWkoYSxiKS5wYXRoKCksZD1EZihhLnRjLGIpO0hmKGQsZnVuY3Rpb24oYil7ZGkoYSxiKX0pO2RpKGEsZCk7R2YoZCxmdW5jdGlvbihiKXtkaShhLGIpfSk7cmV0dXJuIGN9XG5mdW5jdGlvbiBkaShhLGIpe3ZhciBjPWIuQmEoKTtpZihudWxsIT09Yyl7Zm9yKHZhciBkPVtdLGU9W10sZj0tMSxnPTA7ZzxjLmxlbmd0aDtnKyspNCE9PWNbZ10uc3RhdHVzJiYoMj09PWNbZ10uc3RhdHVzPyhKKGY9PT1nLTEsXCJBbGwgU0VOVCBpdGVtcyBzaG91bGQgYmUgYXQgYmVnaW5uaW5nIG9mIHF1ZXVlLlwiKSxmPWcsY1tnXS5zdGF0dXM9NCxjW2ddLmplPVwic2V0XCIpOihKKDE9PT1jW2ddLnN0YXR1cyxcIlVuZXhwZWN0ZWQgdHJhbnNhY3Rpb24gc3RhdHVzIGluIGFib3J0XCIpLGNbZ10uZ2UoKSxlPWUuY29uY2F0KGxmKGEuTyxjW2ddLkFhLCEwKSksY1tnXS5KJiZkLnB1c2gocShjW2ddLkosbnVsbCxFcnJvcihcInNldFwiKSwhMSxudWxsKSkpKTstMT09PWY/RWYoYixudWxsKTpjLmxlbmd0aD1mKzE7emIoYS5lYSxiLnBhdGgoKSxlKTtmb3IoZz0wO2c8ZC5sZW5ndGg7ZysrKUNiKGRbZ10pfX07ZnVuY3Rpb24gVygpe3RoaXMubmM9e307dGhpcy5QZj0hMX1jYShXKTtXLnByb3RvdHlwZS55Yj1mdW5jdGlvbigpe2Zvcih2YXIgYSBpbiB0aGlzLm5jKXRoaXMubmNbYV0ueWIoKX07Vy5wcm90b3R5cGUuaW50ZXJydXB0PVcucHJvdG90eXBlLnliO1cucHJvdG90eXBlLnFjPWZ1bmN0aW9uKCl7Zm9yKHZhciBhIGluIHRoaXMubmMpdGhpcy5uY1thXS5xYygpfTtXLnByb3RvdHlwZS5yZXN1bWU9Vy5wcm90b3R5cGUucWM7Vy5wcm90b3R5cGUudWU9ZnVuY3Rpb24oKXt0aGlzLlBmPSEwfTtmdW5jdGlvbiBYKGEsYil7dGhpcy5hZD1hO3RoaXMucWE9Yn1YLnByb3RvdHlwZS5jYW5jZWw9ZnVuY3Rpb24oYSl7eChcIkZpcmViYXNlLm9uRGlzY29ubmVjdCgpLmNhbmNlbFwiLDAsMSxhcmd1bWVudHMubGVuZ3RoKTtBKFwiRmlyZWJhc2Uub25EaXNjb25uZWN0KCkuY2FuY2VsXCIsMSxhLCEwKTt0aGlzLmFkLkdkKHRoaXMucWEsYXx8bnVsbCl9O1gucHJvdG90eXBlLmNhbmNlbD1YLnByb3RvdHlwZS5jYW5jZWw7WC5wcm90b3R5cGUucmVtb3ZlPWZ1bmN0aW9uKGEpe3goXCJGaXJlYmFzZS5vbkRpc2Nvbm5lY3QoKS5yZW1vdmVcIiwwLDEsYXJndW1lbnRzLmxlbmd0aCk7WWYoXCJGaXJlYmFzZS5vbkRpc2Nvbm5lY3QoKS5yZW1vdmVcIix0aGlzLnFhKTtBKFwiRmlyZWJhc2Uub25EaXNjb25uZWN0KCkucmVtb3ZlXCIsMSxhLCEwKTtTaCh0aGlzLmFkLHRoaXMucWEsbnVsbCxhKX07WC5wcm90b3R5cGUucmVtb3ZlPVgucHJvdG90eXBlLnJlbW92ZTtcblgucHJvdG90eXBlLnNldD1mdW5jdGlvbihhLGIpe3goXCJGaXJlYmFzZS5vbkRpc2Nvbm5lY3QoKS5zZXRcIiwxLDIsYXJndW1lbnRzLmxlbmd0aCk7WWYoXCJGaXJlYmFzZS5vbkRpc2Nvbm5lY3QoKS5zZXRcIix0aGlzLnFhKTtSZihcIkZpcmViYXNlLm9uRGlzY29ubmVjdCgpLnNldFwiLGEsdGhpcy5xYSwhMSk7QShcIkZpcmViYXNlLm9uRGlzY29ubmVjdCgpLnNldFwiLDIsYiwhMCk7U2godGhpcy5hZCx0aGlzLnFhLGEsYil9O1gucHJvdG90eXBlLnNldD1YLnByb3RvdHlwZS5zZXQ7XG5YLnByb3RvdHlwZS5LYj1mdW5jdGlvbihhLGIsYyl7eChcIkZpcmViYXNlLm9uRGlzY29ubmVjdCgpLnNldFdpdGhQcmlvcml0eVwiLDIsMyxhcmd1bWVudHMubGVuZ3RoKTtZZihcIkZpcmViYXNlLm9uRGlzY29ubmVjdCgpLnNldFdpdGhQcmlvcml0eVwiLHRoaXMucWEpO1JmKFwiRmlyZWJhc2Uub25EaXNjb25uZWN0KCkuc2V0V2l0aFByaW9yaXR5XCIsYSx0aGlzLnFhLCExKTtVZihcIkZpcmViYXNlLm9uRGlzY29ubmVjdCgpLnNldFdpdGhQcmlvcml0eVwiLDIsYik7QShcIkZpcmViYXNlLm9uRGlzY29ubmVjdCgpLnNldFdpdGhQcmlvcml0eVwiLDMsYywhMCk7VGgodGhpcy5hZCx0aGlzLnFhLGEsYixjKX07WC5wcm90b3R5cGUuc2V0V2l0aFByaW9yaXR5PVgucHJvdG90eXBlLktiO1xuWC5wcm90b3R5cGUudXBkYXRlPWZ1bmN0aW9uKGEsYil7eChcIkZpcmViYXNlLm9uRGlzY29ubmVjdCgpLnVwZGF0ZVwiLDEsMixhcmd1bWVudHMubGVuZ3RoKTtZZihcIkZpcmViYXNlLm9uRGlzY29ubmVjdCgpLnVwZGF0ZVwiLHRoaXMucWEpO2lmKGVhKGEpKXtmb3IodmFyIGM9e30sZD0wO2Q8YS5sZW5ndGg7KytkKWNbXCJcIitkXT1hW2RdO2E9YztRKFwiUGFzc2luZyBhbiBBcnJheSB0byBGaXJlYmFzZS5vbkRpc2Nvbm5lY3QoKS51cGRhdGUoKSBpcyBkZXByZWNhdGVkLiBVc2Ugc2V0KCkgaWYgeW91IHdhbnQgdG8gb3ZlcndyaXRlIHRoZSBleGlzdGluZyBkYXRhLCBvciBhbiBPYmplY3Qgd2l0aCBpbnRlZ2VyIGtleXMgaWYgeW91IHJlYWxseSBkbyB3YW50IHRvIG9ubHkgdXBkYXRlIHNvbWUgb2YgdGhlIGNoaWxkcmVuLlwiKX1UZihcIkZpcmViYXNlLm9uRGlzY29ubmVjdCgpLnVwZGF0ZVwiLGEsdGhpcy5xYSk7QShcIkZpcmViYXNlLm9uRGlzY29ubmVjdCgpLnVwZGF0ZVwiLDIsYiwhMCk7XG5VaCh0aGlzLmFkLHRoaXMucWEsYSxiKX07WC5wcm90b3R5cGUudXBkYXRlPVgucHJvdG90eXBlLnVwZGF0ZTtmdW5jdGlvbiBZKGEsYixjLGQpe3RoaXMuaz1hO3RoaXMucGF0aD1iO3RoaXMubz1jO3RoaXMuamM9ZH1cbmZ1bmN0aW9uIGVpKGEpe3ZhciBiPW51bGwsYz1udWxsO2EubGEmJihiPW9kKGEpKTthLm5hJiYoYz1xZChhKSk7aWYoYS5nPT09VmQpe2lmKGEubGEpe2lmKFwiW01JTl9OQU1FXVwiIT1uZChhKSl0aHJvdyBFcnJvcihcIlF1ZXJ5OiBXaGVuIG9yZGVyaW5nIGJ5IGtleSwgeW91IG1heSBvbmx5IHBhc3Mgb25lIGFyZ3VtZW50IHRvIHN0YXJ0QXQoKSwgZW5kQXQoKSwgb3IgZXF1YWxUbygpLlwiKTtpZihcInN0cmluZ1wiIT09dHlwZW9mIGIpdGhyb3cgRXJyb3IoXCJRdWVyeTogV2hlbiBvcmRlcmluZyBieSBrZXksIHRoZSBhcmd1bWVudCBwYXNzZWQgdG8gc3RhcnRBdCgpLCBlbmRBdCgpLG9yIGVxdWFsVG8oKSBtdXN0IGJlIGEgc3RyaW5nLlwiKTt9aWYoYS5uYSl7aWYoXCJbTUFYX05BTUVdXCIhPXBkKGEpKXRocm93IEVycm9yKFwiUXVlcnk6IFdoZW4gb3JkZXJpbmcgYnkga2V5LCB5b3UgbWF5IG9ubHkgcGFzcyBvbmUgYXJndW1lbnQgdG8gc3RhcnRBdCgpLCBlbmRBdCgpLCBvciBlcXVhbFRvKCkuXCIpO2lmKFwic3RyaW5nXCIhPT1cbnR5cGVvZiBjKXRocm93IEVycm9yKFwiUXVlcnk6IFdoZW4gb3JkZXJpbmcgYnkga2V5LCB0aGUgYXJndW1lbnQgcGFzc2VkIHRvIHN0YXJ0QXQoKSwgZW5kQXQoKSxvciBlcXVhbFRvKCkgbXVzdCBiZSBhIHN0cmluZy5cIik7fX1lbHNlIGlmKGEuZz09PU0pe2lmKG51bGwhPWImJiFRZihiKXx8bnVsbCE9YyYmIVFmKGMpKXRocm93IEVycm9yKFwiUXVlcnk6IFdoZW4gb3JkZXJpbmcgYnkgcHJpb3JpdHksIHRoZSBmaXJzdCBhcmd1bWVudCBwYXNzZWQgdG8gc3RhcnRBdCgpLCBlbmRBdCgpLCBvciBlcXVhbFRvKCkgbXVzdCBiZSBhIHZhbGlkIHByaW9yaXR5IHZhbHVlIChudWxsLCBhIG51bWJlciwgb3IgYSBzdHJpbmcpLlwiKTt9ZWxzZSBpZihKKGEuZyBpbnN0YW5jZW9mIFJkfHxhLmc9PT1ZZCxcInVua25vd24gaW5kZXggdHlwZS5cIiksbnVsbCE9YiYmXCJvYmplY3RcIj09PXR5cGVvZiBifHxudWxsIT1jJiZcIm9iamVjdFwiPT09dHlwZW9mIGMpdGhyb3cgRXJyb3IoXCJRdWVyeTogRmlyc3QgYXJndW1lbnQgcGFzc2VkIHRvIHN0YXJ0QXQoKSwgZW5kQXQoKSwgb3IgZXF1YWxUbygpIGNhbm5vdCBiZSBhbiBvYmplY3QuXCIpO1xufWZ1bmN0aW9uIGZpKGEpe2lmKGEubGEmJmEubmEmJmEuaWEmJighYS5pYXx8XCJcIj09PWEuTmIpKXRocm93IEVycm9yKFwiUXVlcnk6IENhbid0IGNvbWJpbmUgc3RhcnRBdCgpLCBlbmRBdCgpLCBhbmQgbGltaXQoKS4gVXNlIGxpbWl0VG9GaXJzdCgpIG9yIGxpbWl0VG9MYXN0KCkgaW5zdGVhZC5cIik7fWZ1bmN0aW9uIGdpKGEsYil7aWYoITA9PT1hLmpjKXRocm93IEVycm9yKGIrXCI6IFlvdSBjYW4ndCBjb21iaW5lIG11bHRpcGxlIG9yZGVyQnkgY2FsbHMuXCIpO31ZLnByb3RvdHlwZS5sYz1mdW5jdGlvbigpe3goXCJRdWVyeS5yZWZcIiwwLDAsYXJndW1lbnRzLmxlbmd0aCk7cmV0dXJuIG5ldyBVKHRoaXMuayx0aGlzLnBhdGgpfTtZLnByb3RvdHlwZS5yZWY9WS5wcm90b3R5cGUubGM7XG5ZLnByb3RvdHlwZS5FYj1mdW5jdGlvbihhLGIsYyxkKXt4KFwiUXVlcnkub25cIiwyLDQsYXJndW1lbnRzLmxlbmd0aCk7VmYoXCJRdWVyeS5vblwiLGEsITEpO0EoXCJRdWVyeS5vblwiLDIsYiwhMSk7dmFyIGU9aGkoXCJRdWVyeS5vblwiLGMsZCk7aWYoXCJ2YWx1ZVwiPT09YSlWaCh0aGlzLmssdGhpcyxuZXcgamQoYixlLmNhbmNlbHx8bnVsbCxlLk1hfHxudWxsKSk7ZWxzZXt2YXIgZj17fTtmW2FdPWI7VmgodGhpcy5rLHRoaXMsbmV3IGtkKGYsZS5jYW5jZWwsZS5NYSkpfXJldHVybiBifTtZLnByb3RvdHlwZS5vbj1ZLnByb3RvdHlwZS5FYjtcblkucHJvdG90eXBlLmdjPWZ1bmN0aW9uKGEsYixjKXt4KFwiUXVlcnkub2ZmXCIsMCwzLGFyZ3VtZW50cy5sZW5ndGgpO1ZmKFwiUXVlcnkub2ZmXCIsYSwhMCk7QShcIlF1ZXJ5Lm9mZlwiLDIsYiwhMCk7bGIoXCJRdWVyeS5vZmZcIiwzLGMpO3ZhciBkPW51bGwsZT1udWxsO1widmFsdWVcIj09PWE/ZD1uZXcgamQoYnx8bnVsbCxudWxsLGN8fG51bGwpOmEmJihiJiYoZT17fSxlW2FdPWIpLGQ9bmV3IGtkKGUsbnVsbCxjfHxudWxsKSk7ZT10aGlzLms7ZD1cIi5pbmZvXCI9PT1PKHRoaXMucGF0aCk/ZS56ZC5rYih0aGlzLGQpOmUuTy5rYih0aGlzLGQpO3hiKGUuZWEsdGhpcy5wYXRoLGQpfTtZLnByb3RvdHlwZS5vZmY9WS5wcm90b3R5cGUuZ2M7XG5ZLnByb3RvdHlwZS5BZz1mdW5jdGlvbihhLGIpe2Z1bmN0aW9uIGMoZyl7ZiYmKGY9ITEsZS5nYyhhLGMpLGIuY2FsbChkLk1hLGcpKX14KFwiUXVlcnkub25jZVwiLDIsNCxhcmd1bWVudHMubGVuZ3RoKTtWZihcIlF1ZXJ5Lm9uY2VcIixhLCExKTtBKFwiUXVlcnkub25jZVwiLDIsYiwhMSk7dmFyIGQ9aGkoXCJRdWVyeS5vbmNlXCIsYXJndW1lbnRzWzJdLGFyZ3VtZW50c1szXSksZT10aGlzLGY9ITA7dGhpcy5FYihhLGMsZnVuY3Rpb24oYil7ZS5nYyhhLGMpO2QuY2FuY2VsJiZkLmNhbmNlbC5jYWxsKGQuTWEsYil9KX07WS5wcm90b3R5cGUub25jZT1ZLnByb3RvdHlwZS5BZztcblkucHJvdG90eXBlLkdlPWZ1bmN0aW9uKGEpe1EoXCJRdWVyeS5saW1pdCgpIGJlaW5nIGRlcHJlY2F0ZWQuIFBsZWFzZSB1c2UgUXVlcnkubGltaXRUb0ZpcnN0KCkgb3IgUXVlcnkubGltaXRUb0xhc3QoKSBpbnN0ZWFkLlwiKTt4KFwiUXVlcnkubGltaXRcIiwxLDEsYXJndW1lbnRzLmxlbmd0aCk7aWYoIWdhKGEpfHxNYXRoLmZsb29yKGEpIT09YXx8MD49YSl0aHJvdyBFcnJvcihcIlF1ZXJ5LmxpbWl0OiBGaXJzdCBhcmd1bWVudCBtdXN0IGJlIGEgcG9zaXRpdmUgaW50ZWdlci5cIik7aWYodGhpcy5vLmlhKXRocm93IEVycm9yKFwiUXVlcnkubGltaXQ6IExpbWl0IHdhcyBhbHJlYWR5IHNldCAoYnkgYW5vdGhlciBjYWxsIHRvIGxpbWl0LCBsaW1pdFRvRmlyc3QsIG9ybGltaXRUb0xhc3QuXCIpO3ZhciBiPXRoaXMuby5HZShhKTtmaShiKTtyZXR1cm4gbmV3IFkodGhpcy5rLHRoaXMucGF0aCxiLHRoaXMuamMpfTtZLnByb3RvdHlwZS5saW1pdD1ZLnByb3RvdHlwZS5HZTtcblkucHJvdG90eXBlLkhlPWZ1bmN0aW9uKGEpe3goXCJRdWVyeS5saW1pdFRvRmlyc3RcIiwxLDEsYXJndW1lbnRzLmxlbmd0aCk7aWYoIWdhKGEpfHxNYXRoLmZsb29yKGEpIT09YXx8MD49YSl0aHJvdyBFcnJvcihcIlF1ZXJ5LmxpbWl0VG9GaXJzdDogRmlyc3QgYXJndW1lbnQgbXVzdCBiZSBhIHBvc2l0aXZlIGludGVnZXIuXCIpO2lmKHRoaXMuby5pYSl0aHJvdyBFcnJvcihcIlF1ZXJ5LmxpbWl0VG9GaXJzdDogTGltaXQgd2FzIGFscmVhZHkgc2V0IChieSBhbm90aGVyIGNhbGwgdG8gbGltaXQsIGxpbWl0VG9GaXJzdCwgb3IgbGltaXRUb0xhc3QpLlwiKTtyZXR1cm4gbmV3IFkodGhpcy5rLHRoaXMucGF0aCx0aGlzLm8uSGUoYSksdGhpcy5qYyl9O1kucHJvdG90eXBlLmxpbWl0VG9GaXJzdD1ZLnByb3RvdHlwZS5IZTtcblkucHJvdG90eXBlLkllPWZ1bmN0aW9uKGEpe3goXCJRdWVyeS5saW1pdFRvTGFzdFwiLDEsMSxhcmd1bWVudHMubGVuZ3RoKTtpZighZ2EoYSl8fE1hdGguZmxvb3IoYSkhPT1hfHwwPj1hKXRocm93IEVycm9yKFwiUXVlcnkubGltaXRUb0xhc3Q6IEZpcnN0IGFyZ3VtZW50IG11c3QgYmUgYSBwb3NpdGl2ZSBpbnRlZ2VyLlwiKTtpZih0aGlzLm8uaWEpdGhyb3cgRXJyb3IoXCJRdWVyeS5saW1pdFRvTGFzdDogTGltaXQgd2FzIGFscmVhZHkgc2V0IChieSBhbm90aGVyIGNhbGwgdG8gbGltaXQsIGxpbWl0VG9GaXJzdCwgb3IgbGltaXRUb0xhc3QpLlwiKTtyZXR1cm4gbmV3IFkodGhpcy5rLHRoaXMucGF0aCx0aGlzLm8uSWUoYSksdGhpcy5qYyl9O1kucHJvdG90eXBlLmxpbWl0VG9MYXN0PVkucHJvdG90eXBlLkllO1xuWS5wcm90b3R5cGUuQmc9ZnVuY3Rpb24oYSl7eChcIlF1ZXJ5Lm9yZGVyQnlDaGlsZFwiLDEsMSxhcmd1bWVudHMubGVuZ3RoKTtpZihcIiRrZXlcIj09PWEpdGhyb3cgRXJyb3IoJ1F1ZXJ5Lm9yZGVyQnlDaGlsZDogXCIka2V5XCIgaXMgaW52YWxpZC4gIFVzZSBRdWVyeS5vcmRlckJ5S2V5KCkgaW5zdGVhZC4nKTtpZihcIiRwcmlvcml0eVwiPT09YSl0aHJvdyBFcnJvcignUXVlcnkub3JkZXJCeUNoaWxkOiBcIiRwcmlvcml0eVwiIGlzIGludmFsaWQuICBVc2UgUXVlcnkub3JkZXJCeVByaW9yaXR5KCkgaW5zdGVhZC4nKTtpZihcIiR2YWx1ZVwiPT09YSl0aHJvdyBFcnJvcignUXVlcnkub3JkZXJCeUNoaWxkOiBcIiR2YWx1ZVwiIGlzIGludmFsaWQuICBVc2UgUXVlcnkub3JkZXJCeVZhbHVlKCkgaW5zdGVhZC4nKTtXZihcIlF1ZXJ5Lm9yZGVyQnlDaGlsZFwiLDEsYSwhMSk7Z2kodGhpcyxcIlF1ZXJ5Lm9yZGVyQnlDaGlsZFwiKTt2YXIgYj1iZSh0aGlzLm8sbmV3IFJkKGEpKTtlaShiKTtyZXR1cm4gbmV3IFkodGhpcy5rLFxudGhpcy5wYXRoLGIsITApfTtZLnByb3RvdHlwZS5vcmRlckJ5Q2hpbGQ9WS5wcm90b3R5cGUuQmc7WS5wcm90b3R5cGUuQ2c9ZnVuY3Rpb24oKXt4KFwiUXVlcnkub3JkZXJCeUtleVwiLDAsMCxhcmd1bWVudHMubGVuZ3RoKTtnaSh0aGlzLFwiUXVlcnkub3JkZXJCeUtleVwiKTt2YXIgYT1iZSh0aGlzLm8sVmQpO2VpKGEpO3JldHVybiBuZXcgWSh0aGlzLmssdGhpcy5wYXRoLGEsITApfTtZLnByb3RvdHlwZS5vcmRlckJ5S2V5PVkucHJvdG90eXBlLkNnO1kucHJvdG90eXBlLkRnPWZ1bmN0aW9uKCl7eChcIlF1ZXJ5Lm9yZGVyQnlQcmlvcml0eVwiLDAsMCxhcmd1bWVudHMubGVuZ3RoKTtnaSh0aGlzLFwiUXVlcnkub3JkZXJCeVByaW9yaXR5XCIpO3ZhciBhPWJlKHRoaXMubyxNKTtlaShhKTtyZXR1cm4gbmV3IFkodGhpcy5rLHRoaXMucGF0aCxhLCEwKX07WS5wcm90b3R5cGUub3JkZXJCeVByaW9yaXR5PVkucHJvdG90eXBlLkRnO1xuWS5wcm90b3R5cGUuRWc9ZnVuY3Rpb24oKXt4KFwiUXVlcnkub3JkZXJCeVZhbHVlXCIsMCwwLGFyZ3VtZW50cy5sZW5ndGgpO2dpKHRoaXMsXCJRdWVyeS5vcmRlckJ5VmFsdWVcIik7dmFyIGE9YmUodGhpcy5vLFlkKTtlaShhKTtyZXR1cm4gbmV3IFkodGhpcy5rLHRoaXMucGF0aCxhLCEwKX07WS5wcm90b3R5cGUub3JkZXJCeVZhbHVlPVkucHJvdG90eXBlLkVnO1xuWS5wcm90b3R5cGUuWGQ9ZnVuY3Rpb24oYSxiKXt4KFwiUXVlcnkuc3RhcnRBdFwiLDAsMixhcmd1bWVudHMubGVuZ3RoKTtSZihcIlF1ZXJ5LnN0YXJ0QXRcIixhLHRoaXMucGF0aCwhMCk7V2YoXCJRdWVyeS5zdGFydEF0XCIsMixiLCEwKTt2YXIgYz10aGlzLm8uWGQoYSxiKTtmaShjKTtlaShjKTtpZih0aGlzLm8ubGEpdGhyb3cgRXJyb3IoXCJRdWVyeS5zdGFydEF0OiBTdGFydGluZyBwb2ludCB3YXMgYWxyZWFkeSBzZXQgKGJ5IGFub3RoZXIgY2FsbCB0byBzdGFydEF0IG9yIGVxdWFsVG8pLlwiKTtuKGEpfHwoYj1hPW51bGwpO3JldHVybiBuZXcgWSh0aGlzLmssdGhpcy5wYXRoLGMsdGhpcy5qYyl9O1kucHJvdG90eXBlLnN0YXJ0QXQ9WS5wcm90b3R5cGUuWGQ7XG5ZLnByb3RvdHlwZS5xZD1mdW5jdGlvbihhLGIpe3goXCJRdWVyeS5lbmRBdFwiLDAsMixhcmd1bWVudHMubGVuZ3RoKTtSZihcIlF1ZXJ5LmVuZEF0XCIsYSx0aGlzLnBhdGgsITApO1dmKFwiUXVlcnkuZW5kQXRcIiwyLGIsITApO3ZhciBjPXRoaXMuby5xZChhLGIpO2ZpKGMpO2VpKGMpO2lmKHRoaXMuby5uYSl0aHJvdyBFcnJvcihcIlF1ZXJ5LmVuZEF0OiBFbmRpbmcgcG9pbnQgd2FzIGFscmVhZHkgc2V0IChieSBhbm90aGVyIGNhbGwgdG8gZW5kQXQgb3IgZXF1YWxUbykuXCIpO3JldHVybiBuZXcgWSh0aGlzLmssdGhpcy5wYXRoLGMsdGhpcy5qYyl9O1kucHJvdG90eXBlLmVuZEF0PVkucHJvdG90eXBlLnFkO1xuWS5wcm90b3R5cGUuaGc9ZnVuY3Rpb24oYSxiKXt4KFwiUXVlcnkuZXF1YWxUb1wiLDEsMixhcmd1bWVudHMubGVuZ3RoKTtSZihcIlF1ZXJ5LmVxdWFsVG9cIixhLHRoaXMucGF0aCwhMSk7V2YoXCJRdWVyeS5lcXVhbFRvXCIsMixiLCEwKTtpZih0aGlzLm8ubGEpdGhyb3cgRXJyb3IoXCJRdWVyeS5lcXVhbFRvOiBTdGFydGluZyBwb2ludCB3YXMgYWxyZWFkeSBzZXQgKGJ5IGFub3RoZXIgY2FsbCB0byBlbmRBdCBvciBlcXVhbFRvKS5cIik7aWYodGhpcy5vLm5hKXRocm93IEVycm9yKFwiUXVlcnkuZXF1YWxUbzogRW5kaW5nIHBvaW50IHdhcyBhbHJlYWR5IHNldCAoYnkgYW5vdGhlciBjYWxsIHRvIGVuZEF0IG9yIGVxdWFsVG8pLlwiKTtyZXR1cm4gdGhpcy5YZChhLGIpLnFkKGEsYil9O1kucHJvdG90eXBlLmVxdWFsVG89WS5wcm90b3R5cGUuaGc7XG5ZLnByb3RvdHlwZS50b1N0cmluZz1mdW5jdGlvbigpe3goXCJRdWVyeS50b1N0cmluZ1wiLDAsMCxhcmd1bWVudHMubGVuZ3RoKTtmb3IodmFyIGE9dGhpcy5wYXRoLGI9XCJcIixjPWEuWTtjPGEubi5sZW5ndGg7YysrKVwiXCIhPT1hLm5bY10mJihiKz1cIi9cIitlbmNvZGVVUklDb21wb25lbnQoU3RyaW5nKGEubltjXSkpKTtyZXR1cm4gdGhpcy5rLnRvU3RyaW5nKCkrKGJ8fFwiL1wiKX07WS5wcm90b3R5cGUudG9TdHJpbmc9WS5wcm90b3R5cGUudG9TdHJpbmc7WS5wcm90b3R5cGUud2E9ZnVuY3Rpb24oKXt2YXIgYT1XYyhjZSh0aGlzLm8pKTtyZXR1cm5cInt9XCI9PT1hP1wiZGVmYXVsdFwiOmF9O1xuZnVuY3Rpb24gaGkoYSxiLGMpe3ZhciBkPXtjYW5jZWw6bnVsbCxNYTpudWxsfTtpZihiJiZjKWQuY2FuY2VsPWIsQShhLDMsZC5jYW5jZWwsITApLGQuTWE9YyxsYihhLDQsZC5NYSk7ZWxzZSBpZihiKWlmKFwib2JqZWN0XCI9PT10eXBlb2YgYiYmbnVsbCE9PWIpZC5NYT1iO2Vsc2UgaWYoXCJmdW5jdGlvblwiPT09dHlwZW9mIGIpZC5jYW5jZWw9YjtlbHNlIHRocm93IEVycm9yKHooYSwzLCEwKStcIiBtdXN0IGVpdGhlciBiZSBhIGNhbmNlbCBjYWxsYmFjayBvciBhIGNvbnRleHQgb2JqZWN0LlwiKTtyZXR1cm4gZH07dmFyIFo9e307Wi52Yz13aDtaLkRhdGFDb25uZWN0aW9uPVoudmM7d2gucHJvdG90eXBlLk9nPWZ1bmN0aW9uKGEsYil7dGhpcy5EYShcInFcIix7cDphfSxiKX07Wi52Yy5wcm90b3R5cGUuc2ltcGxlTGlzdGVuPVoudmMucHJvdG90eXBlLk9nO3doLnByb3RvdHlwZS5nZz1mdW5jdGlvbihhLGIpe3RoaXMuRGEoXCJlY2hvXCIse2Q6YX0sYil9O1oudmMucHJvdG90eXBlLmVjaG89Wi52Yy5wcm90b3R5cGUuZ2c7d2gucHJvdG90eXBlLmludGVycnVwdD13aC5wcm90b3R5cGUueWI7Wi5TZj1raDtaLlJlYWxUaW1lQ29ubmVjdGlvbj1aLlNmO2toLnByb3RvdHlwZS5zZW5kUmVxdWVzdD1raC5wcm90b3R5cGUuRGE7a2gucHJvdG90eXBlLmNsb3NlPWtoLnByb3RvdHlwZS5jbG9zZTtcbloub2c9ZnVuY3Rpb24oYSl7dmFyIGI9d2gucHJvdG90eXBlLnB1dDt3aC5wcm90b3R5cGUucHV0PWZ1bmN0aW9uKGMsZCxlLGYpe24oZikmJihmPWEoKSk7Yi5jYWxsKHRoaXMsYyxkLGUsZil9O3JldHVybiBmdW5jdGlvbigpe3doLnByb3RvdHlwZS5wdXQ9Yn19O1ouaGlqYWNrSGFzaD1aLm9nO1ouUmY9RWM7Wi5Db25uZWN0aW9uVGFyZ2V0PVouUmY7Wi53YT1mdW5jdGlvbihhKXtyZXR1cm4gYS53YSgpfTtaLnF1ZXJ5SWRlbnRpZmllcj1aLndhO1oucWc9ZnVuY3Rpb24oYSl7cmV0dXJuIGEuay5SYS5hYX07Wi5saXN0ZW5zPVoucWc7Wi51ZT1mdW5jdGlvbihhKXthLnVlKCl9O1ouZm9yY2VSZXN0Q2xpZW50PVoudWU7ZnVuY3Rpb24gVShhLGIpe3ZhciBjLGQsZTtpZihhIGluc3RhbmNlb2YgS2gpYz1hLGQ9YjtlbHNle3goXCJuZXcgRmlyZWJhc2VcIiwxLDIsYXJndW1lbnRzLmxlbmd0aCk7ZD1SYyhhcmd1bWVudHNbMF0pO2M9ZC5RZztcImZpcmViYXNlXCI9PT1kLmRvbWFpbiYmUWMoZC5ob3N0K1wiIGlzIG5vIGxvbmdlciBzdXBwb3J0ZWQuIFBsZWFzZSB1c2UgPFlPVVIgRklSRUJBU0U+LmZpcmViYXNlaW8uY29tIGluc3RlYWRcIik7Y3x8UWMoXCJDYW5ub3QgcGFyc2UgRmlyZWJhc2UgdXJsLiBQbGVhc2UgdXNlIGh0dHBzOi8vPFlPVVIgRklSRUJBU0U+LmZpcmViYXNlaW8uY29tXCIpO2QubGJ8fFwidW5kZWZpbmVkXCIhPT10eXBlb2Ygd2luZG93JiZ3aW5kb3cubG9jYXRpb24mJndpbmRvdy5sb2NhdGlvbi5wcm90b2NvbCYmLTEhPT13aW5kb3cubG9jYXRpb24ucHJvdG9jb2wuaW5kZXhPZihcImh0dHBzOlwiKSYmUShcIkluc2VjdXJlIEZpcmViYXNlIGFjY2VzcyBmcm9tIGEgc2VjdXJlIHBhZ2UuIFBsZWFzZSB1c2UgaHR0cHMgaW4gY2FsbHMgdG8gbmV3IEZpcmViYXNlKCkuXCIpO1xuYz1uZXcgRWMoZC5ob3N0LGQubGIsYyxcIndzXCI9PT1kLnNjaGVtZXx8XCJ3c3NcIj09PWQuc2NoZW1lKTtkPW5ldyBLKGQuWmMpO2U9ZC50b1N0cmluZygpO3ZhciBmOyEoZj0hcChjLmhvc3QpfHwwPT09Yy5ob3N0Lmxlbmd0aHx8IVBmKGMuQ2IpKSYmKGY9MCE9PWUubGVuZ3RoKSYmKGUmJihlPWUucmVwbGFjZSgvXlxcLypcXC5pbmZvKFxcL3wkKS8sXCIvXCIpKSxmPSEocChlKSYmMCE9PWUubGVuZ3RoJiYhT2YudGVzdChlKSkpO2lmKGYpdGhyb3cgRXJyb3IoeihcIm5ldyBGaXJlYmFzZVwiLDEsITEpKydtdXN0IGJlIGEgdmFsaWQgZmlyZWJhc2UgVVJMIGFuZCB0aGUgcGF0aCBjYW5cXCd0IGNvbnRhaW4gXCIuXCIsIFwiI1wiLCBcIiRcIiwgXCJbXCIsIG9yIFwiXVwiLicpO2lmKGIpaWYoYiBpbnN0YW5jZW9mIFcpZT1iO2Vsc2UgaWYocChiKSllPVcudWIoKSxjLkxkPWI7ZWxzZSB0aHJvdyBFcnJvcihcIkV4cGVjdGVkIGEgdmFsaWQgRmlyZWJhc2UuQ29udGV4dCBmb3Igc2Vjb25kIGFyZ3VtZW50IHRvIG5ldyBGaXJlYmFzZSgpXCIpO1xuZWxzZSBlPVcudWIoKTtmPWMudG9TdHJpbmcoKTt2YXIgZz13KGUubmMsZik7Z3x8KGc9bmV3IEtoKGMsZS5QZiksZS5uY1tmXT1nKTtjPWd9WS5jYWxsKHRoaXMsYyxkLCRkLCExKX1tYShVLFkpO3ZhciBpaT1VLGppPVtcIkZpcmViYXNlXCJdLGtpPWFhO2ppWzBdaW4ga2l8fCFraS5leGVjU2NyaXB0fHxraS5leGVjU2NyaXB0KFwidmFyIFwiK2ppWzBdKTtmb3IodmFyIGxpO2ppLmxlbmd0aCYmKGxpPWppLnNoaWZ0KCkpOykhamkubGVuZ3RoJiZuKGlpKT9raVtsaV09aWk6a2k9a2lbbGldP2tpW2xpXTpraVtsaV09e307VS5wcm90b3R5cGUubmFtZT1mdW5jdGlvbigpe1EoXCJGaXJlYmFzZS5uYW1lKCkgYmVpbmcgZGVwcmVjYXRlZC4gUGxlYXNlIHVzZSBGaXJlYmFzZS5rZXkoKSBpbnN0ZWFkLlwiKTt4KFwiRmlyZWJhc2UubmFtZVwiLDAsMCxhcmd1bWVudHMubGVuZ3RoKTtyZXR1cm4gdGhpcy5rZXkoKX07VS5wcm90b3R5cGUubmFtZT1VLnByb3RvdHlwZS5uYW1lO1xuVS5wcm90b3R5cGUua2V5PWZ1bmN0aW9uKCl7eChcIkZpcmViYXNlLmtleVwiLDAsMCxhcmd1bWVudHMubGVuZ3RoKTtyZXR1cm4gdGhpcy5wYXRoLmUoKT9udWxsOnZjKHRoaXMucGF0aCl9O1UucHJvdG90eXBlLmtleT1VLnByb3RvdHlwZS5rZXk7VS5wcm90b3R5cGUudz1mdW5jdGlvbihhKXt4KFwiRmlyZWJhc2UuY2hpbGRcIiwxLDEsYXJndW1lbnRzLmxlbmd0aCk7aWYoZ2EoYSkpYT1TdHJpbmcoYSk7ZWxzZSBpZighKGEgaW5zdGFuY2VvZiBLKSlpZihudWxsPT09Tyh0aGlzLnBhdGgpKXt2YXIgYj1hO2ImJihiPWIucmVwbGFjZSgvXlxcLypcXC5pbmZvKFxcL3wkKS8sXCIvXCIpKTtYZihcIkZpcmViYXNlLmNoaWxkXCIsYil9ZWxzZSBYZihcIkZpcmViYXNlLmNoaWxkXCIsYSk7cmV0dXJuIG5ldyBVKHRoaXMuayx0aGlzLnBhdGgudyhhKSl9O1UucHJvdG90eXBlLmNoaWxkPVUucHJvdG90eXBlLnc7XG5VLnByb3RvdHlwZS5wYXJlbnQ9ZnVuY3Rpb24oKXt4KFwiRmlyZWJhc2UucGFyZW50XCIsMCwwLGFyZ3VtZW50cy5sZW5ndGgpO3ZhciBhPXRoaXMucGF0aC5wYXJlbnQoKTtyZXR1cm4gbnVsbD09PWE/bnVsbDpuZXcgVSh0aGlzLmssYSl9O1UucHJvdG90eXBlLnBhcmVudD1VLnByb3RvdHlwZS5wYXJlbnQ7VS5wcm90b3R5cGUucm9vdD1mdW5jdGlvbigpe3goXCJGaXJlYmFzZS5yZWZcIiwwLDAsYXJndW1lbnRzLmxlbmd0aCk7Zm9yKHZhciBhPXRoaXM7bnVsbCE9PWEucGFyZW50KCk7KWE9YS5wYXJlbnQoKTtyZXR1cm4gYX07VS5wcm90b3R5cGUucm9vdD1VLnByb3RvdHlwZS5yb290O1xuVS5wcm90b3R5cGUuc2V0PWZ1bmN0aW9uKGEsYil7eChcIkZpcmViYXNlLnNldFwiLDEsMixhcmd1bWVudHMubGVuZ3RoKTtZZihcIkZpcmViYXNlLnNldFwiLHRoaXMucGF0aCk7UmYoXCJGaXJlYmFzZS5zZXRcIixhLHRoaXMucGF0aCwhMSk7QShcIkZpcmViYXNlLnNldFwiLDIsYiwhMCk7dGhpcy5rLktiKHRoaXMucGF0aCxhLG51bGwsYnx8bnVsbCl9O1UucHJvdG90eXBlLnNldD1VLnByb3RvdHlwZS5zZXQ7XG5VLnByb3RvdHlwZS51cGRhdGU9ZnVuY3Rpb24oYSxiKXt4KFwiRmlyZWJhc2UudXBkYXRlXCIsMSwyLGFyZ3VtZW50cy5sZW5ndGgpO1lmKFwiRmlyZWJhc2UudXBkYXRlXCIsdGhpcy5wYXRoKTtpZihlYShhKSl7Zm9yKHZhciBjPXt9LGQ9MDtkPGEubGVuZ3RoOysrZCljW1wiXCIrZF09YVtkXTthPWM7UShcIlBhc3NpbmcgYW4gQXJyYXkgdG8gRmlyZWJhc2UudXBkYXRlKCkgaXMgZGVwcmVjYXRlZC4gVXNlIHNldCgpIGlmIHlvdSB3YW50IHRvIG92ZXJ3cml0ZSB0aGUgZXhpc3RpbmcgZGF0YSwgb3IgYW4gT2JqZWN0IHdpdGggaW50ZWdlciBrZXlzIGlmIHlvdSByZWFsbHkgZG8gd2FudCB0byBvbmx5IHVwZGF0ZSBzb21lIG9mIHRoZSBjaGlsZHJlbi5cIil9VGYoXCJGaXJlYmFzZS51cGRhdGVcIixhLHRoaXMucGF0aCk7QShcIkZpcmViYXNlLnVwZGF0ZVwiLDIsYiwhMCk7dGhpcy5rLnVwZGF0ZSh0aGlzLnBhdGgsYSxifHxudWxsKX07VS5wcm90b3R5cGUudXBkYXRlPVUucHJvdG90eXBlLnVwZGF0ZTtcblUucHJvdG90eXBlLktiPWZ1bmN0aW9uKGEsYixjKXt4KFwiRmlyZWJhc2Uuc2V0V2l0aFByaW9yaXR5XCIsMiwzLGFyZ3VtZW50cy5sZW5ndGgpO1lmKFwiRmlyZWJhc2Uuc2V0V2l0aFByaW9yaXR5XCIsdGhpcy5wYXRoKTtSZihcIkZpcmViYXNlLnNldFdpdGhQcmlvcml0eVwiLGEsdGhpcy5wYXRoLCExKTtVZihcIkZpcmViYXNlLnNldFdpdGhQcmlvcml0eVwiLDIsYik7QShcIkZpcmViYXNlLnNldFdpdGhQcmlvcml0eVwiLDMsYywhMCk7aWYoXCIubGVuZ3RoXCI9PT10aGlzLmtleSgpfHxcIi5rZXlzXCI9PT10aGlzLmtleSgpKXRocm93XCJGaXJlYmFzZS5zZXRXaXRoUHJpb3JpdHkgZmFpbGVkOiBcIit0aGlzLmtleSgpK1wiIGlzIGEgcmVhZC1vbmx5IG9iamVjdC5cIjt0aGlzLmsuS2IodGhpcy5wYXRoLGEsYixjfHxudWxsKX07VS5wcm90b3R5cGUuc2V0V2l0aFByaW9yaXR5PVUucHJvdG90eXBlLktiO1xuVS5wcm90b3R5cGUucmVtb3ZlPWZ1bmN0aW9uKGEpe3goXCJGaXJlYmFzZS5yZW1vdmVcIiwwLDEsYXJndW1lbnRzLmxlbmd0aCk7WWYoXCJGaXJlYmFzZS5yZW1vdmVcIix0aGlzLnBhdGgpO0EoXCJGaXJlYmFzZS5yZW1vdmVcIiwxLGEsITApO3RoaXMuc2V0KG51bGwsYSl9O1UucHJvdG90eXBlLnJlbW92ZT1VLnByb3RvdHlwZS5yZW1vdmU7XG5VLnByb3RvdHlwZS50cmFuc2FjdGlvbj1mdW5jdGlvbihhLGIsYyl7eChcIkZpcmViYXNlLnRyYW5zYWN0aW9uXCIsMSwzLGFyZ3VtZW50cy5sZW5ndGgpO1lmKFwiRmlyZWJhc2UudHJhbnNhY3Rpb25cIix0aGlzLnBhdGgpO0EoXCJGaXJlYmFzZS50cmFuc2FjdGlvblwiLDEsYSwhMSk7QShcIkZpcmViYXNlLnRyYW5zYWN0aW9uXCIsMixiLCEwKTtpZihuKGMpJiZcImJvb2xlYW5cIiE9dHlwZW9mIGMpdGhyb3cgRXJyb3IoeihcIkZpcmViYXNlLnRyYW5zYWN0aW9uXCIsMywhMCkrXCJtdXN0IGJlIGEgYm9vbGVhbi5cIik7aWYoXCIubGVuZ3RoXCI9PT10aGlzLmtleSgpfHxcIi5rZXlzXCI9PT10aGlzLmtleSgpKXRocm93XCJGaXJlYmFzZS50cmFuc2FjdGlvbiBmYWlsZWQ6IFwiK3RoaXMua2V5KCkrXCIgaXMgYSByZWFkLW9ubHkgb2JqZWN0LlwiO1widW5kZWZpbmVkXCI9PT10eXBlb2YgYyYmKGM9ITApO1doKHRoaXMuayx0aGlzLnBhdGgsYSxifHxudWxsLGMpfTtVLnByb3RvdHlwZS50cmFuc2FjdGlvbj1VLnByb3RvdHlwZS50cmFuc2FjdGlvbjtcblUucHJvdG90eXBlLkxnPWZ1bmN0aW9uKGEsYil7eChcIkZpcmViYXNlLnNldFByaW9yaXR5XCIsMSwyLGFyZ3VtZW50cy5sZW5ndGgpO1lmKFwiRmlyZWJhc2Uuc2V0UHJpb3JpdHlcIix0aGlzLnBhdGgpO1VmKFwiRmlyZWJhc2Uuc2V0UHJpb3JpdHlcIiwxLGEpO0EoXCJGaXJlYmFzZS5zZXRQcmlvcml0eVwiLDIsYiwhMCk7dGhpcy5rLktiKHRoaXMucGF0aC53KFwiLnByaW9yaXR5XCIpLGEsbnVsbCxiKX07VS5wcm90b3R5cGUuc2V0UHJpb3JpdHk9VS5wcm90b3R5cGUuTGc7XG5VLnByb3RvdHlwZS5wdXNoPWZ1bmN0aW9uKGEsYil7eChcIkZpcmViYXNlLnB1c2hcIiwwLDIsYXJndW1lbnRzLmxlbmd0aCk7WWYoXCJGaXJlYmFzZS5wdXNoXCIsdGhpcy5wYXRoKTtSZihcIkZpcmViYXNlLnB1c2hcIixhLHRoaXMucGF0aCwhMCk7QShcIkZpcmViYXNlLnB1c2hcIiwyLGIsITApO3ZhciBjPU1oKHRoaXMuayksYz1LZihjKSxjPXRoaXMudyhjKTtcInVuZGVmaW5lZFwiIT09dHlwZW9mIGEmJm51bGwhPT1hJiZjLnNldChhLGIpO3JldHVybiBjfTtVLnByb3RvdHlwZS5wdXNoPVUucHJvdG90eXBlLnB1c2g7VS5wcm90b3R5cGUuamI9ZnVuY3Rpb24oKXtZZihcIkZpcmViYXNlLm9uRGlzY29ubmVjdFwiLHRoaXMucGF0aCk7cmV0dXJuIG5ldyBYKHRoaXMuayx0aGlzLnBhdGgpfTtVLnByb3RvdHlwZS5vbkRpc2Nvbm5lY3Q9VS5wcm90b3R5cGUuamI7XG5VLnByb3RvdHlwZS5QPWZ1bmN0aW9uKGEsYixjKXtRKFwiRmlyZWJhc2VSZWYuYXV0aCgpIGJlaW5nIGRlcHJlY2F0ZWQuIFBsZWFzZSB1c2UgRmlyZWJhc2VSZWYuYXV0aFdpdGhDdXN0b21Ub2tlbigpIGluc3RlYWQuXCIpO3goXCJGaXJlYmFzZS5hdXRoXCIsMSwzLGFyZ3VtZW50cy5sZW5ndGgpO1pmKFwiRmlyZWJhc2UuYXV0aFwiLGEpO0EoXCJGaXJlYmFzZS5hdXRoXCIsMixiLCEwKTtBKFwiRmlyZWJhc2UuYXV0aFwiLDMsYiwhMCk7S2codGhpcy5rLlAsYSx7fSx7cmVtZW1iZXI6XCJub25lXCJ9LGIsYyl9O1UucHJvdG90eXBlLmF1dGg9VS5wcm90b3R5cGUuUDtVLnByb3RvdHlwZS5lZT1mdW5jdGlvbihhKXt4KFwiRmlyZWJhc2UudW5hdXRoXCIsMCwxLGFyZ3VtZW50cy5sZW5ndGgpO0EoXCJGaXJlYmFzZS51bmF1dGhcIiwxLGEsITApO0xnKHRoaXMuay5QLGEpfTtVLnByb3RvdHlwZS51bmF1dGg9VS5wcm90b3R5cGUuZWU7XG5VLnByb3RvdHlwZS53ZT1mdW5jdGlvbigpe3goXCJGaXJlYmFzZS5nZXRBdXRoXCIsMCwwLGFyZ3VtZW50cy5sZW5ndGgpO3JldHVybiB0aGlzLmsuUC53ZSgpfTtVLnByb3RvdHlwZS5nZXRBdXRoPVUucHJvdG90eXBlLndlO1UucHJvdG90eXBlLnVnPWZ1bmN0aW9uKGEsYil7eChcIkZpcmViYXNlLm9uQXV0aFwiLDEsMixhcmd1bWVudHMubGVuZ3RoKTtBKFwiRmlyZWJhc2Uub25BdXRoXCIsMSxhLCExKTtsYihcIkZpcmViYXNlLm9uQXV0aFwiLDIsYik7dGhpcy5rLlAuRWIoXCJhdXRoX3N0YXR1c1wiLGEsYil9O1UucHJvdG90eXBlLm9uQXV0aD1VLnByb3RvdHlwZS51ZztVLnByb3RvdHlwZS50Zz1mdW5jdGlvbihhLGIpe3goXCJGaXJlYmFzZS5vZmZBdXRoXCIsMSwyLGFyZ3VtZW50cy5sZW5ndGgpO0EoXCJGaXJlYmFzZS5vZmZBdXRoXCIsMSxhLCExKTtsYihcIkZpcmViYXNlLm9mZkF1dGhcIiwyLGIpO3RoaXMuay5QLmdjKFwiYXV0aF9zdGF0dXNcIixhLGIpfTtVLnByb3RvdHlwZS5vZmZBdXRoPVUucHJvdG90eXBlLnRnO1xuVS5wcm90b3R5cGUuV2Y9ZnVuY3Rpb24oYSxiLGMpe3goXCJGaXJlYmFzZS5hdXRoV2l0aEN1c3RvbVRva2VuXCIsMiwzLGFyZ3VtZW50cy5sZW5ndGgpO1pmKFwiRmlyZWJhc2UuYXV0aFdpdGhDdXN0b21Ub2tlblwiLGEpO0EoXCJGaXJlYmFzZS5hdXRoV2l0aEN1c3RvbVRva2VuXCIsMixiLCExKTthZyhcIkZpcmViYXNlLmF1dGhXaXRoQ3VzdG9tVG9rZW5cIiwzLGMsITApO0tnKHRoaXMuay5QLGEse30sY3x8e30sYil9O1UucHJvdG90eXBlLmF1dGhXaXRoQ3VzdG9tVG9rZW49VS5wcm90b3R5cGUuV2Y7VS5wcm90b3R5cGUuWGY9ZnVuY3Rpb24oYSxiLGMpe3goXCJGaXJlYmFzZS5hdXRoV2l0aE9BdXRoUG9wdXBcIiwyLDMsYXJndW1lbnRzLmxlbmd0aCk7JGYoXCJGaXJlYmFzZS5hdXRoV2l0aE9BdXRoUG9wdXBcIiwxLGEpO0EoXCJGaXJlYmFzZS5hdXRoV2l0aE9BdXRoUG9wdXBcIiwyLGIsITEpO2FnKFwiRmlyZWJhc2UuYXV0aFdpdGhPQXV0aFBvcHVwXCIsMyxjLCEwKTtQZyh0aGlzLmsuUCxhLGMsYil9O1xuVS5wcm90b3R5cGUuYXV0aFdpdGhPQXV0aFBvcHVwPVUucHJvdG90eXBlLlhmO1UucHJvdG90eXBlLllmPWZ1bmN0aW9uKGEsYixjKXt4KFwiRmlyZWJhc2UuYXV0aFdpdGhPQXV0aFJlZGlyZWN0XCIsMiwzLGFyZ3VtZW50cy5sZW5ndGgpOyRmKFwiRmlyZWJhc2UuYXV0aFdpdGhPQXV0aFJlZGlyZWN0XCIsMSxhKTtBKFwiRmlyZWJhc2UuYXV0aFdpdGhPQXV0aFJlZGlyZWN0XCIsMixiLCExKTthZyhcIkZpcmViYXNlLmF1dGhXaXRoT0F1dGhSZWRpcmVjdFwiLDMsYywhMCk7dmFyIGQ9dGhpcy5rLlA7TmcoZCk7dmFyIGU9W3dnXSxmPWlnKGMpO1wiYW5vbnltb3VzXCI9PT1hfHxcImZpcmViYXNlXCI9PT1hP1IoYix5ZyhcIlRSQU5TUE9SVF9VTkFWQUlMQUJMRVwiKSk6KFAuc2V0KFwicmVkaXJlY3RfY2xpZW50X29wdGlvbnNcIixmLmxkKSxPZyhkLGUsXCIvYXV0aC9cIithLGYsYikpfTtVLnByb3RvdHlwZS5hdXRoV2l0aE9BdXRoUmVkaXJlY3Q9VS5wcm90b3R5cGUuWWY7XG5VLnByb3RvdHlwZS5aZj1mdW5jdGlvbihhLGIsYyxkKXt4KFwiRmlyZWJhc2UuYXV0aFdpdGhPQXV0aFRva2VuXCIsMyw0LGFyZ3VtZW50cy5sZW5ndGgpOyRmKFwiRmlyZWJhc2UuYXV0aFdpdGhPQXV0aFRva2VuXCIsMSxhKTtBKFwiRmlyZWJhc2UuYXV0aFdpdGhPQXV0aFRva2VuXCIsMyxjLCExKTthZyhcIkZpcmViYXNlLmF1dGhXaXRoT0F1dGhUb2tlblwiLDQsZCwhMCk7cChiKT8oJGYoXCJGaXJlYmFzZS5hdXRoV2l0aE9BdXRoVG9rZW5cIiwyLGIpLE1nKHRoaXMuay5QLGErXCIvdG9rZW5cIix7YWNjZXNzX3Rva2VuOmJ9LGQsYykpOihhZyhcIkZpcmViYXNlLmF1dGhXaXRoT0F1dGhUb2tlblwiLDIsYiwhMSksTWcodGhpcy5rLlAsYStcIi90b2tlblwiLGIsZCxjKSl9O1UucHJvdG90eXBlLmF1dGhXaXRoT0F1dGhUb2tlbj1VLnByb3RvdHlwZS5aZjtcblUucHJvdG90eXBlLlZmPWZ1bmN0aW9uKGEsYil7eChcIkZpcmViYXNlLmF1dGhBbm9ueW1vdXNseVwiLDEsMixhcmd1bWVudHMubGVuZ3RoKTtBKFwiRmlyZWJhc2UuYXV0aEFub255bW91c2x5XCIsMSxhLCExKTthZyhcIkZpcmViYXNlLmF1dGhBbm9ueW1vdXNseVwiLDIsYiwhMCk7TWcodGhpcy5rLlAsXCJhbm9ueW1vdXNcIix7fSxiLGEpfTtVLnByb3RvdHlwZS5hdXRoQW5vbnltb3VzbHk9VS5wcm90b3R5cGUuVmY7XG5VLnByb3RvdHlwZS4kZj1mdW5jdGlvbihhLGIsYyl7eChcIkZpcmViYXNlLmF1dGhXaXRoUGFzc3dvcmRcIiwyLDMsYXJndW1lbnRzLmxlbmd0aCk7YWcoXCJGaXJlYmFzZS5hdXRoV2l0aFBhc3N3b3JkXCIsMSxhLCExKTtiZyhcIkZpcmViYXNlLmF1dGhXaXRoUGFzc3dvcmRcIixhLFwiZW1haWxcIik7YmcoXCJGaXJlYmFzZS5hdXRoV2l0aFBhc3N3b3JkXCIsYSxcInBhc3N3b3JkXCIpO0EoXCJGaXJlYmFzZS5hdXRoQW5vbnltb3VzbHlcIiwyLGIsITEpO2FnKFwiRmlyZWJhc2UuYXV0aEFub255bW91c2x5XCIsMyxjLCEwKTtNZyh0aGlzLmsuUCxcInBhc3N3b3JkXCIsYSxjLGIpfTtVLnByb3RvdHlwZS5hdXRoV2l0aFBhc3N3b3JkPVUucHJvdG90eXBlLiRmO1xuVS5wcm90b3R5cGUucmU9ZnVuY3Rpb24oYSxiKXt4KFwiRmlyZWJhc2UuY3JlYXRlVXNlclwiLDIsMixhcmd1bWVudHMubGVuZ3RoKTthZyhcIkZpcmViYXNlLmNyZWF0ZVVzZXJcIiwxLGEsITEpO2JnKFwiRmlyZWJhc2UuY3JlYXRlVXNlclwiLGEsXCJlbWFpbFwiKTtiZyhcIkZpcmViYXNlLmNyZWF0ZVVzZXJcIixhLFwicGFzc3dvcmRcIik7QShcIkZpcmViYXNlLmNyZWF0ZVVzZXJcIiwyLGIsITEpO3RoaXMuay5QLnJlKGEsYil9O1UucHJvdG90eXBlLmNyZWF0ZVVzZXI9VS5wcm90b3R5cGUucmU7VS5wcm90b3R5cGUuU2U9ZnVuY3Rpb24oYSxiKXt4KFwiRmlyZWJhc2UucmVtb3ZlVXNlclwiLDIsMixhcmd1bWVudHMubGVuZ3RoKTthZyhcIkZpcmViYXNlLnJlbW92ZVVzZXJcIiwxLGEsITEpO2JnKFwiRmlyZWJhc2UucmVtb3ZlVXNlclwiLGEsXCJlbWFpbFwiKTtiZyhcIkZpcmViYXNlLnJlbW92ZVVzZXJcIixhLFwicGFzc3dvcmRcIik7QShcIkZpcmViYXNlLnJlbW92ZVVzZXJcIiwyLGIsITEpO3RoaXMuay5QLlNlKGEsYil9O1xuVS5wcm90b3R5cGUucmVtb3ZlVXNlcj1VLnByb3RvdHlwZS5TZTtVLnByb3RvdHlwZS5vZT1mdW5jdGlvbihhLGIpe3goXCJGaXJlYmFzZS5jaGFuZ2VQYXNzd29yZFwiLDIsMixhcmd1bWVudHMubGVuZ3RoKTthZyhcIkZpcmViYXNlLmNoYW5nZVBhc3N3b3JkXCIsMSxhLCExKTtiZyhcIkZpcmViYXNlLmNoYW5nZVBhc3N3b3JkXCIsYSxcImVtYWlsXCIpO2JnKFwiRmlyZWJhc2UuY2hhbmdlUGFzc3dvcmRcIixhLFwib2xkUGFzc3dvcmRcIik7YmcoXCJGaXJlYmFzZS5jaGFuZ2VQYXNzd29yZFwiLGEsXCJuZXdQYXNzd29yZFwiKTtBKFwiRmlyZWJhc2UuY2hhbmdlUGFzc3dvcmRcIiwyLGIsITEpO3RoaXMuay5QLm9lKGEsYil9O1UucHJvdG90eXBlLmNoYW5nZVBhc3N3b3JkPVUucHJvdG90eXBlLm9lO1xuVS5wcm90b3R5cGUubmU9ZnVuY3Rpb24oYSxiKXt4KFwiRmlyZWJhc2UuY2hhbmdlRW1haWxcIiwyLDIsYXJndW1lbnRzLmxlbmd0aCk7YWcoXCJGaXJlYmFzZS5jaGFuZ2VFbWFpbFwiLDEsYSwhMSk7YmcoXCJGaXJlYmFzZS5jaGFuZ2VFbWFpbFwiLGEsXCJvbGRFbWFpbFwiKTtiZyhcIkZpcmViYXNlLmNoYW5nZUVtYWlsXCIsYSxcIm5ld0VtYWlsXCIpO2JnKFwiRmlyZWJhc2UuY2hhbmdlRW1haWxcIixhLFwicGFzc3dvcmRcIik7QShcIkZpcmViYXNlLmNoYW5nZUVtYWlsXCIsMixiLCExKTt0aGlzLmsuUC5uZShhLGIpfTtVLnByb3RvdHlwZS5jaGFuZ2VFbWFpbD1VLnByb3RvdHlwZS5uZTtcblUucHJvdG90eXBlLlVlPWZ1bmN0aW9uKGEsYil7eChcIkZpcmViYXNlLnJlc2V0UGFzc3dvcmRcIiwyLDIsYXJndW1lbnRzLmxlbmd0aCk7YWcoXCJGaXJlYmFzZS5yZXNldFBhc3N3b3JkXCIsMSxhLCExKTtiZyhcIkZpcmViYXNlLnJlc2V0UGFzc3dvcmRcIixhLFwiZW1haWxcIik7QShcIkZpcmViYXNlLnJlc2V0UGFzc3dvcmRcIiwyLGIsITEpO3RoaXMuay5QLlVlKGEsYil9O1UucHJvdG90eXBlLnJlc2V0UGFzc3dvcmQ9VS5wcm90b3R5cGUuVWU7VS5nb09mZmxpbmU9ZnVuY3Rpb24oKXt4KFwiRmlyZWJhc2UuZ29PZmZsaW5lXCIsMCwwLGFyZ3VtZW50cy5sZW5ndGgpO1cudWIoKS55YigpfTtVLmdvT25saW5lPWZ1bmN0aW9uKCl7eChcIkZpcmViYXNlLmdvT25saW5lXCIsMCwwLGFyZ3VtZW50cy5sZW5ndGgpO1cudWIoKS5xYygpfTtcbmZ1bmN0aW9uIE5jKGEsYil7SighYnx8ITA9PT1hfHwhMT09PWEsXCJDYW4ndCB0dXJuIG9uIGN1c3RvbSBsb2dnZXJzIHBlcnNpc3RlbnRseS5cIik7ITA9PT1hPyhcInVuZGVmaW5lZFwiIT09dHlwZW9mIGNvbnNvbGUmJihcImZ1bmN0aW9uXCI9PT10eXBlb2YgY29uc29sZS5sb2c/QWI9cShjb25zb2xlLmxvZyxjb25zb2xlKTpcIm9iamVjdFwiPT09dHlwZW9mIGNvbnNvbGUubG9nJiYoQWI9ZnVuY3Rpb24oYSl7Y29uc29sZS5sb2coYSl9KSksYiYmUC5zZXQoXCJsb2dnaW5nX2VuYWJsZWRcIiwhMCkpOmE/QWI9YTooQWI9bnVsbCxQLnJlbW92ZShcImxvZ2dpbmdfZW5hYmxlZFwiKSl9VS5lbmFibGVMb2dnaW5nPU5jO1UuU2VydmVyVmFsdWU9e1RJTUVTVEFNUDp7XCIuc3ZcIjpcInRpbWVzdGFtcFwifX07VS5TREtfVkVSU0lPTj1cIjIuMi41XCI7VS5JTlRFUk5BTD1WO1UuQ29udGV4dD1XO1UuVEVTVF9BQ0NFU1M9Wjt9KSgpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IEZpcmViYXNlO1xuIiwidmFyIF8gPSByZXF1aXJlKCcuLi91dGlsJylcblxuLyoqXG4gKiBDcmVhdGUgYSBjaGlsZCBpbnN0YW5jZSB0aGF0IHByb3RvdHlwYWxseSBpbmVocml0c1xuICogZGF0YSBvbiBwYXJlbnQuIFRvIGFjaGlldmUgdGhhdCB3ZSBjcmVhdGUgYW4gaW50ZXJtZWRpYXRlXG4gKiBjb25zdHJ1Y3RvciB3aXRoIGl0cyBwcm90b3R5cGUgcG9pbnRpbmcgdG8gcGFyZW50LlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRzXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbQmFzZUN0b3JdXG4gKiBAcmV0dXJuIHtWdWV9XG4gKiBAcHVibGljXG4gKi9cblxuZXhwb3J0cy4kYWRkQ2hpbGQgPSBmdW5jdGlvbiAob3B0cywgQmFzZUN0b3IpIHtcbiAgQmFzZUN0b3IgPSBCYXNlQ3RvciB8fCBfLlZ1ZVxuICBvcHRzID0gb3B0cyB8fCB7fVxuICB2YXIgcGFyZW50ID0gdGhpc1xuICB2YXIgQ2hpbGRWdWVcbiAgdmFyIGluaGVyaXQgPSBvcHRzLmluaGVyaXQgIT09IHVuZGVmaW5lZFxuICAgID8gb3B0cy5pbmhlcml0XG4gICAgOiBCYXNlQ3Rvci5vcHRpb25zLmluaGVyaXRcbiAgaWYgKGluaGVyaXQpIHtcbiAgICB2YXIgY3RvcnMgPSBwYXJlbnQuX2NoaWxkQ3RvcnNcbiAgICBDaGlsZFZ1ZSA9IGN0b3JzW0Jhc2VDdG9yLmNpZF1cbiAgICBpZiAoIUNoaWxkVnVlKSB7XG4gICAgICB2YXIgb3B0aW9uTmFtZSA9IEJhc2VDdG9yLm9wdGlvbnMubmFtZVxuICAgICAgdmFyIGNsYXNzTmFtZSA9IG9wdGlvbk5hbWVcbiAgICAgICAgPyBfLmNsYXNzaWZ5KG9wdGlvbk5hbWUpXG4gICAgICAgIDogJ1Z1ZUNvbXBvbmVudCdcbiAgICAgIENoaWxkVnVlID0gbmV3IEZ1bmN0aW9uKFxuICAgICAgICAncmV0dXJuIGZ1bmN0aW9uICcgKyBjbGFzc05hbWUgKyAnIChvcHRpb25zKSB7JyArXG4gICAgICAgICd0aGlzLmNvbnN0cnVjdG9yID0gJyArIGNsYXNzTmFtZSArICc7JyArXG4gICAgICAgICd0aGlzLl9pbml0KG9wdGlvbnMpIH0nXG4gICAgICApKClcbiAgICAgIENoaWxkVnVlLm9wdGlvbnMgPSBCYXNlQ3Rvci5vcHRpb25zXG4gICAgICBDaGlsZFZ1ZS5wcm90b3R5cGUgPSB0aGlzXG4gICAgICBjdG9yc1tCYXNlQ3Rvci5jaWRdID0gQ2hpbGRWdWVcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgQ2hpbGRWdWUgPSBCYXNlQ3RvclxuICB9XG4gIG9wdHMuX3BhcmVudCA9IHBhcmVudFxuICBvcHRzLl9yb290ID0gcGFyZW50LiRyb290XG4gIHZhciBjaGlsZCA9IG5ldyBDaGlsZFZ1ZShvcHRzKVxuICByZXR1cm4gY2hpbGRcbn0iLCJ2YXIgXyA9IHJlcXVpcmUoJy4uL3V0aWwnKVxudmFyIFdhdGNoZXIgPSByZXF1aXJlKCcuLi93YXRjaGVyJylcbnZhciBQYXRoID0gcmVxdWlyZSgnLi4vcGFyc2Vycy9wYXRoJylcbnZhciB0ZXh0UGFyc2VyID0gcmVxdWlyZSgnLi4vcGFyc2Vycy90ZXh0JylcbnZhciBkaXJQYXJzZXIgPSByZXF1aXJlKCcuLi9wYXJzZXJzL2RpcmVjdGl2ZScpXG52YXIgZXhwUGFyc2VyID0gcmVxdWlyZSgnLi4vcGFyc2Vycy9leHByZXNzaW9uJylcbnZhciBmaWx0ZXJSRSA9IC9bXnxdXFx8W158XS9cblxuLyoqXG4gKiBHZXQgdGhlIHZhbHVlIGZyb20gYW4gZXhwcmVzc2lvbiBvbiB0aGlzIHZtLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBleHBcbiAqIEByZXR1cm4geyp9XG4gKi9cblxuZXhwb3J0cy4kZ2V0ID0gZnVuY3Rpb24gKGV4cCkge1xuICB2YXIgcmVzID0gZXhwUGFyc2VyLnBhcnNlKGV4cClcbiAgaWYgKHJlcykge1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4gcmVzLmdldC5jYWxsKHRoaXMsIHRoaXMpXG4gICAgfSBjYXRjaCAoZSkge31cbiAgfVxufVxuXG4vKipcbiAqIFNldCB0aGUgdmFsdWUgZnJvbSBhbiBleHByZXNzaW9uIG9uIHRoaXMgdm0uXG4gKiBUaGUgZXhwcmVzc2lvbiBtdXN0IGJlIGEgdmFsaWQgbGVmdC1oYW5kXG4gKiBleHByZXNzaW9uIGluIGFuIGFzc2lnbm1lbnQuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV4cFxuICogQHBhcmFtIHsqfSB2YWxcbiAqL1xuXG5leHBvcnRzLiRzZXQgPSBmdW5jdGlvbiAoZXhwLCB2YWwpIHtcbiAgdmFyIHJlcyA9IGV4cFBhcnNlci5wYXJzZShleHAsIHRydWUpXG4gIGlmIChyZXMgJiYgcmVzLnNldCkge1xuICAgIHJlcy5zZXQuY2FsbCh0aGlzLCB0aGlzLCB2YWwpXG4gIH1cbn1cblxuLyoqXG4gKiBBZGQgYSBwcm9wZXJ0eSBvbiB0aGUgVk1cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30ga2V5XG4gKiBAcGFyYW0geyp9IHZhbFxuICovXG5cbmV4cG9ydHMuJGFkZCA9IGZ1bmN0aW9uIChrZXksIHZhbCkge1xuICB0aGlzLl9kYXRhLiRhZGQoa2V5LCB2YWwpXG59XG5cbi8qKlxuICogRGVsZXRlIGEgcHJvcGVydHkgb24gdGhlIFZNXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGtleVxuICovXG5cbmV4cG9ydHMuJGRlbGV0ZSA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgdGhpcy5fZGF0YS4kZGVsZXRlKGtleSlcbn1cblxuLyoqXG4gKiBXYXRjaCBhbiBleHByZXNzaW9uLCB0cmlnZ2VyIGNhbGxiYWNrIHdoZW4gaXRzXG4gKiB2YWx1ZSBjaGFuZ2VzLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBleHBcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNiXG4gKiBAcGFyYW0ge0Jvb2xlYW59IFtkZWVwXVxuICogQHBhcmFtIHtCb29sZWFufSBbaW1tZWRpYXRlXVxuICogQHJldHVybiB7RnVuY3Rpb259IC0gdW53YXRjaEZuXG4gKi9cblxuZXhwb3J0cy4kd2F0Y2ggPSBmdW5jdGlvbiAoZXhwLCBjYiwgZGVlcCwgaW1tZWRpYXRlKSB7XG4gIHZhciB2bSA9IHRoaXNcbiAgdmFyIGtleSA9IGRlZXAgPyBleHAgKyAnKipkZWVwKionIDogZXhwXG4gIHZhciB3YXRjaGVyID0gdm0uX3VzZXJXYXRjaGVyc1trZXldXG4gIHZhciB3cmFwcGVkQ2IgPSBmdW5jdGlvbiAodmFsLCBvbGRWYWwpIHtcbiAgICBjYi5jYWxsKHZtLCB2YWwsIG9sZFZhbClcbiAgfVxuICBpZiAoIXdhdGNoZXIpIHtcbiAgICB3YXRjaGVyID0gdm0uX3VzZXJXYXRjaGVyc1trZXldID1cbiAgICAgIG5ldyBXYXRjaGVyKHZtLCBleHAsIHdyYXBwZWRDYiwge1xuICAgICAgICBkZWVwOiBkZWVwLFxuICAgICAgICB1c2VyOiB0cnVlXG4gICAgICB9KVxuICB9IGVsc2Uge1xuICAgIHdhdGNoZXIuYWRkQ2Iod3JhcHBlZENiKVxuICB9XG4gIGlmIChpbW1lZGlhdGUpIHtcbiAgICB3cmFwcGVkQ2Iod2F0Y2hlci52YWx1ZSlcbiAgfVxuICByZXR1cm4gZnVuY3Rpb24gdW53YXRjaEZuICgpIHtcbiAgICB3YXRjaGVyLnJlbW92ZUNiKHdyYXBwZWRDYilcbiAgICBpZiAoIXdhdGNoZXIuYWN0aXZlKSB7XG4gICAgICB2bS5fdXNlcldhdGNoZXJzW2tleV0gPSBudWxsXG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogRXZhbHVhdGUgYSB0ZXh0IGRpcmVjdGl2ZSwgaW5jbHVkaW5nIGZpbHRlcnMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHRleHRcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuXG5leHBvcnRzLiRldmFsID0gZnVuY3Rpb24gKHRleHQpIHtcbiAgLy8gY2hlY2sgZm9yIGZpbHRlcnMuXG4gIGlmIChmaWx0ZXJSRS50ZXN0KHRleHQpKSB7XG4gICAgdmFyIGRpciA9IGRpclBhcnNlci5wYXJzZSh0ZXh0KVswXVxuICAgIC8vIHRoZSBmaWx0ZXIgcmVnZXggY2hlY2sgbWlnaHQgZ2l2ZSBmYWxzZSBwb3NpdGl2ZVxuICAgIC8vIGZvciBwaXBlcyBpbnNpZGUgc3RyaW5ncywgc28gaXQncyBwb3NzaWJsZSB0aGF0XG4gICAgLy8gd2UgZG9uJ3QgZ2V0IGFueSBmaWx0ZXJzIGhlcmVcbiAgICByZXR1cm4gZGlyLmZpbHRlcnNcbiAgICAgID8gXy5hcHBseUZpbHRlcnMoXG4gICAgICAgICAgdGhpcy4kZ2V0KGRpci5leHByZXNzaW9uKSxcbiAgICAgICAgICBfLnJlc29sdmVGaWx0ZXJzKHRoaXMsIGRpci5maWx0ZXJzKS5yZWFkLFxuICAgICAgICAgIHRoaXNcbiAgICAgICAgKVxuICAgICAgOiB0aGlzLiRnZXQoZGlyLmV4cHJlc3Npb24pXG4gIH0gZWxzZSB7XG4gICAgLy8gbm8gZmlsdGVyXG4gICAgcmV0dXJuIHRoaXMuJGdldCh0ZXh0KVxuICB9XG59XG5cbi8qKlxuICogSW50ZXJwb2xhdGUgYSBwaWVjZSBvZiB0ZW1wbGF0ZSB0ZXh0LlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB0ZXh0XG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cblxuZXhwb3J0cy4kaW50ZXJwb2xhdGUgPSBmdW5jdGlvbiAodGV4dCkge1xuICB2YXIgdG9rZW5zID0gdGV4dFBhcnNlci5wYXJzZSh0ZXh0KVxuICB2YXIgdm0gPSB0aGlzXG4gIGlmICh0b2tlbnMpIHtcbiAgICByZXR1cm4gdG9rZW5zLmxlbmd0aCA9PT0gMVxuICAgICAgPyB2bS4kZXZhbCh0b2tlbnNbMF0udmFsdWUpXG4gICAgICA6IHRva2Vucy5tYXAoZnVuY3Rpb24gKHRva2VuKSB7XG4gICAgICAgICAgcmV0dXJuIHRva2VuLnRhZ1xuICAgICAgICAgICAgPyB2bS4kZXZhbCh0b2tlbi52YWx1ZSlcbiAgICAgICAgICAgIDogdG9rZW4udmFsdWVcbiAgICAgICAgfSkuam9pbignJylcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gdGV4dFxuICB9XG59XG5cbi8qKlxuICogTG9nIGluc3RhbmNlIGRhdGEgYXMgYSBwbGFpbiBKUyBvYmplY3RcbiAqIHNvIHRoYXQgaXQgaXMgZWFzaWVyIHRvIGluc3BlY3QgaW4gY29uc29sZS5cbiAqIFRoaXMgbWV0aG9kIGFzc3VtZXMgY29uc29sZSBpcyBhdmFpbGFibGUuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IFtwYXRoXVxuICovXG5cbmV4cG9ydHMuJGxvZyA9IGZ1bmN0aW9uIChwYXRoKSB7XG4gIHZhciBkYXRhID0gcGF0aFxuICAgID8gUGF0aC5nZXQodGhpcy5fZGF0YSwgcGF0aClcbiAgICA6IHRoaXMuX2RhdGFcbiAgaWYgKGRhdGEpIHtcbiAgICBkYXRhID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShkYXRhKSlcbiAgfVxuICBjb25zb2xlLmxvZyhkYXRhKVxufSIsInZhciBfID0gcmVxdWlyZSgnLi4vdXRpbCcpXG52YXIgdHJhbnNpdGlvbiA9IHJlcXVpcmUoJy4uL3RyYW5zaXRpb24nKVxuXG4vKipcbiAqIEFwcGVuZCBpbnN0YW5jZSB0byB0YXJnZXRcbiAqXG4gKiBAcGFyYW0ge05vZGV9IHRhcmdldFxuICogQHBhcmFtIHtGdW5jdGlvbn0gW2NiXVxuICogQHBhcmFtIHtCb29sZWFufSBbd2l0aFRyYW5zaXRpb25dIC0gZGVmYXVsdHMgdG8gdHJ1ZVxuICovXG5cbmV4cG9ydHMuJGFwcGVuZFRvID0gZnVuY3Rpb24gKHRhcmdldCwgY2IsIHdpdGhUcmFuc2l0aW9uKSB7XG4gIHJldHVybiBpbnNlcnQoXG4gICAgdGhpcywgdGFyZ2V0LCBjYiwgd2l0aFRyYW5zaXRpb24sXG4gICAgYXBwZW5kLCB0cmFuc2l0aW9uLmFwcGVuZFxuICApXG59XG5cbi8qKlxuICogUHJlcGVuZCBpbnN0YW5jZSB0byB0YXJnZXRcbiAqXG4gKiBAcGFyYW0ge05vZGV9IHRhcmdldFxuICogQHBhcmFtIHtGdW5jdGlvbn0gW2NiXVxuICogQHBhcmFtIHtCb29sZWFufSBbd2l0aFRyYW5zaXRpb25dIC0gZGVmYXVsdHMgdG8gdHJ1ZVxuICovXG5cbmV4cG9ydHMuJHByZXBlbmRUbyA9IGZ1bmN0aW9uICh0YXJnZXQsIGNiLCB3aXRoVHJhbnNpdGlvbikge1xuICB0YXJnZXQgPSBxdWVyeSh0YXJnZXQpXG4gIGlmICh0YXJnZXQuaGFzQ2hpbGROb2RlcygpKSB7XG4gICAgdGhpcy4kYmVmb3JlKHRhcmdldC5maXJzdENoaWxkLCBjYiwgd2l0aFRyYW5zaXRpb24pXG4gIH0gZWxzZSB7XG4gICAgdGhpcy4kYXBwZW5kVG8odGFyZ2V0LCBjYiwgd2l0aFRyYW5zaXRpb24pXG4gIH1cbiAgcmV0dXJuIHRoaXNcbn1cblxuLyoqXG4gKiBJbnNlcnQgaW5zdGFuY2UgYmVmb3JlIHRhcmdldFxuICpcbiAqIEBwYXJhbSB7Tm9kZX0gdGFyZ2V0XG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY2JdXG4gKiBAcGFyYW0ge0Jvb2xlYW59IFt3aXRoVHJhbnNpdGlvbl0gLSBkZWZhdWx0cyB0byB0cnVlXG4gKi9cblxuZXhwb3J0cy4kYmVmb3JlID0gZnVuY3Rpb24gKHRhcmdldCwgY2IsIHdpdGhUcmFuc2l0aW9uKSB7XG4gIHJldHVybiBpbnNlcnQoXG4gICAgdGhpcywgdGFyZ2V0LCBjYiwgd2l0aFRyYW5zaXRpb24sXG4gICAgYmVmb3JlLCB0cmFuc2l0aW9uLmJlZm9yZVxuICApXG59XG5cbi8qKlxuICogSW5zZXJ0IGluc3RhbmNlIGFmdGVyIHRhcmdldFxuICpcbiAqIEBwYXJhbSB7Tm9kZX0gdGFyZ2V0XG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY2JdXG4gKiBAcGFyYW0ge0Jvb2xlYW59IFt3aXRoVHJhbnNpdGlvbl0gLSBkZWZhdWx0cyB0byB0cnVlXG4gKi9cblxuZXhwb3J0cy4kYWZ0ZXIgPSBmdW5jdGlvbiAodGFyZ2V0LCBjYiwgd2l0aFRyYW5zaXRpb24pIHtcbiAgdGFyZ2V0ID0gcXVlcnkodGFyZ2V0KVxuICBpZiAodGFyZ2V0Lm5leHRTaWJsaW5nKSB7XG4gICAgdGhpcy4kYmVmb3JlKHRhcmdldC5uZXh0U2libGluZywgY2IsIHdpdGhUcmFuc2l0aW9uKVxuICB9IGVsc2Uge1xuICAgIHRoaXMuJGFwcGVuZFRvKHRhcmdldC5wYXJlbnROb2RlLCBjYiwgd2l0aFRyYW5zaXRpb24pXG4gIH1cbiAgcmV0dXJuIHRoaXNcbn1cblxuLyoqXG4gKiBSZW1vdmUgaW5zdGFuY2UgZnJvbSBET01cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY2JdXG4gKiBAcGFyYW0ge0Jvb2xlYW59IFt3aXRoVHJhbnNpdGlvbl0gLSBkZWZhdWx0cyB0byB0cnVlXG4gKi9cblxuZXhwb3J0cy4kcmVtb3ZlID0gZnVuY3Rpb24gKGNiLCB3aXRoVHJhbnNpdGlvbikge1xuICB2YXIgaW5Eb2MgPSB0aGlzLl9pc0F0dGFjaGVkICYmIF8uaW5Eb2ModGhpcy4kZWwpXG4gIC8vIGlmIHdlIGFyZSBub3QgaW4gZG9jdW1lbnQsIG5vIG5lZWQgdG8gY2hlY2tcbiAgLy8gZm9yIHRyYW5zaXRpb25zXG4gIGlmICghaW5Eb2MpIHdpdGhUcmFuc2l0aW9uID0gZmFsc2VcbiAgdmFyIG9wXG4gIHZhciBzZWxmID0gdGhpc1xuICB2YXIgcmVhbENiID0gZnVuY3Rpb24gKCkge1xuICAgIGlmIChpbkRvYykgc2VsZi5fY2FsbEhvb2soJ2RldGFjaGVkJylcbiAgICBpZiAoY2IpIGNiKClcbiAgfVxuICBpZiAoXG4gICAgdGhpcy5faXNCbG9jayAmJlxuICAgICF0aGlzLl9ibG9ja0ZyYWdtZW50Lmhhc0NoaWxkTm9kZXMoKVxuICApIHtcbiAgICBvcCA9IHdpdGhUcmFuc2l0aW9uID09PSBmYWxzZVxuICAgICAgPyBhcHBlbmRcbiAgICAgIDogdHJhbnNpdGlvbi5yZW1vdmVUaGVuQXBwZW5kXG4gICAgYmxvY2tPcCh0aGlzLCB0aGlzLl9ibG9ja0ZyYWdtZW50LCBvcCwgcmVhbENiKVxuICB9IGVsc2Uge1xuICAgIG9wID0gd2l0aFRyYW5zaXRpb24gPT09IGZhbHNlXG4gICAgICA/IHJlbW92ZVxuICAgICAgOiB0cmFuc2l0aW9uLnJlbW92ZVxuICAgIG9wKHRoaXMuJGVsLCB0aGlzLCByZWFsQ2IpXG4gIH1cbiAgcmV0dXJuIHRoaXNcbn1cblxuLyoqXG4gKiBTaGFyZWQgRE9NIGluc2VydGlvbiBmdW5jdGlvbi5cbiAqXG4gKiBAcGFyYW0ge1Z1ZX0gdm1cbiAqIEBwYXJhbSB7RWxlbWVudH0gdGFyZ2V0XG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY2JdXG4gKiBAcGFyYW0ge0Jvb2xlYW59IFt3aXRoVHJhbnNpdGlvbl1cbiAqIEBwYXJhbSB7RnVuY3Rpb259IG9wMSAtIG9wIGZvciBub24tdHJhbnNpdGlvbiBpbnNlcnRcbiAqIEBwYXJhbSB7RnVuY3Rpb259IG9wMiAtIG9wIGZvciB0cmFuc2l0aW9uIGluc2VydFxuICogQHJldHVybiB2bVxuICovXG5cbmZ1bmN0aW9uIGluc2VydCAodm0sIHRhcmdldCwgY2IsIHdpdGhUcmFuc2l0aW9uLCBvcDEsIG9wMikge1xuICB0YXJnZXQgPSBxdWVyeSh0YXJnZXQpXG4gIHZhciB0YXJnZXRJc0RldGFjaGVkID0gIV8uaW5Eb2ModGFyZ2V0KVxuICB2YXIgb3AgPSB3aXRoVHJhbnNpdGlvbiA9PT0gZmFsc2UgfHwgdGFyZ2V0SXNEZXRhY2hlZFxuICAgID8gb3AxXG4gICAgOiBvcDJcbiAgdmFyIHNob3VsZENhbGxIb29rID1cbiAgICAhdGFyZ2V0SXNEZXRhY2hlZCAmJlxuICAgICF2bS5faXNBdHRhY2hlZCAmJlxuICAgICFfLmluRG9jKHZtLiRlbClcbiAgaWYgKHZtLl9pc0Jsb2NrKSB7XG4gICAgYmxvY2tPcCh2bSwgdGFyZ2V0LCBvcCwgY2IpXG4gIH0gZWxzZSB7XG4gICAgb3Aodm0uJGVsLCB0YXJnZXQsIHZtLCBjYilcbiAgfVxuICBpZiAoc2hvdWxkQ2FsbEhvb2spIHtcbiAgICB2bS5fY2FsbEhvb2soJ2F0dGFjaGVkJylcbiAgfVxuICByZXR1cm4gdm1cbn1cblxuLyoqXG4gKiBFeGVjdXRlIGEgdHJhbnNpdGlvbiBvcGVyYXRpb24gb24gYSBibG9jayBpbnN0YW5jZSxcbiAqIGl0ZXJhdGluZyB0aHJvdWdoIGFsbCBpdHMgYmxvY2sgbm9kZXMuXG4gKlxuICogQHBhcmFtIHtWdWV9IHZtXG4gKiBAcGFyYW0ge05vZGV9IHRhcmdldFxuICogQHBhcmFtIHtGdW5jdGlvbn0gb3BcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNiXG4gKi9cblxuZnVuY3Rpb24gYmxvY2tPcCAodm0sIHRhcmdldCwgb3AsIGNiKSB7XG4gIHZhciBjdXJyZW50ID0gdm0uX2Jsb2NrU3RhcnRcbiAgdmFyIGVuZCA9IHZtLl9ibG9ja0VuZFxuICB2YXIgbmV4dFxuICB3aGlsZSAobmV4dCAhPT0gZW5kKSB7XG4gICAgbmV4dCA9IGN1cnJlbnQubmV4dFNpYmxpbmdcbiAgICBvcChjdXJyZW50LCB0YXJnZXQsIHZtKVxuICAgIGN1cnJlbnQgPSBuZXh0XG4gIH1cbiAgb3AoZW5kLCB0YXJnZXQsIHZtLCBjYilcbn1cblxuLyoqXG4gKiBDaGVjayBmb3Igc2VsZWN0b3JzXG4gKlxuICogQHBhcmFtIHtTdHJpbmd8RWxlbWVudH0gZWxcbiAqL1xuXG5mdW5jdGlvbiBxdWVyeSAoZWwpIHtcbiAgcmV0dXJuIHR5cGVvZiBlbCA9PT0gJ3N0cmluZydcbiAgICA/IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoZWwpXG4gICAgOiBlbFxufVxuXG4vKipcbiAqIEFwcGVuZCBvcGVyYXRpb24gdGhhdCB0YWtlcyBhIGNhbGxiYWNrLlxuICpcbiAqIEBwYXJhbSB7Tm9kZX0gZWxcbiAqIEBwYXJhbSB7Tm9kZX0gdGFyZ2V0XG4gKiBAcGFyYW0ge1Z1ZX0gdm0gLSB1bnVzZWRcbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtjYl1cbiAqL1xuXG5mdW5jdGlvbiBhcHBlbmQgKGVsLCB0YXJnZXQsIHZtLCBjYikge1xuICB0YXJnZXQuYXBwZW5kQ2hpbGQoZWwpXG4gIGlmIChjYikgY2IoKVxufVxuXG4vKipcbiAqIEluc2VydEJlZm9yZSBvcGVyYXRpb24gdGhhdCB0YWtlcyBhIGNhbGxiYWNrLlxuICpcbiAqIEBwYXJhbSB7Tm9kZX0gZWxcbiAqIEBwYXJhbSB7Tm9kZX0gdGFyZ2V0XG4gKiBAcGFyYW0ge1Z1ZX0gdm0gLSB1bnVzZWRcbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtjYl1cbiAqL1xuXG5mdW5jdGlvbiBiZWZvcmUgKGVsLCB0YXJnZXQsIHZtLCBjYikge1xuICBfLmJlZm9yZShlbCwgdGFyZ2V0KVxuICBpZiAoY2IpIGNiKClcbn1cblxuLyoqXG4gKiBSZW1vdmUgb3BlcmF0aW9uIHRoYXQgdGFrZXMgYSBjYWxsYmFjay5cbiAqXG4gKiBAcGFyYW0ge05vZGV9IGVsXG4gKiBAcGFyYW0ge1Z1ZX0gdm0gLSB1bnVzZWRcbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtjYl1cbiAqL1xuXG5mdW5jdGlvbiByZW1vdmUgKGVsLCB2bSwgY2IpIHtcbiAgXy5yZW1vdmUoZWwpXG4gIGlmIChjYikgY2IoKVxufSIsInZhciBfID0gcmVxdWlyZSgnLi4vdXRpbCcpXG5cbi8qKlxuICogTGlzdGVuIG9uIHRoZSBnaXZlbiBgZXZlbnRgIHdpdGggYGZuYC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKi9cblxuZXhwb3J0cy4kb24gPSBmdW5jdGlvbiAoZXZlbnQsIGZuKSB7XG4gICh0aGlzLl9ldmVudHNbZXZlbnRdIHx8ICh0aGlzLl9ldmVudHNbZXZlbnRdID0gW10pKVxuICAgIC5wdXNoKGZuKVxuICBtb2RpZnlMaXN0ZW5lckNvdW50KHRoaXMsIGV2ZW50LCAxKVxuICByZXR1cm4gdGhpc1xufVxuXG4vKipcbiAqIEFkZHMgYW4gYGV2ZW50YCBsaXN0ZW5lciB0aGF0IHdpbGwgYmUgaW52b2tlZCBhIHNpbmdsZVxuICogdGltZSB0aGVuIGF1dG9tYXRpY2FsbHkgcmVtb3ZlZC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKi9cblxuZXhwb3J0cy4kb25jZSA9IGZ1bmN0aW9uIChldmVudCwgZm4pIHtcbiAgdmFyIHNlbGYgPSB0aGlzXG4gIGZ1bmN0aW9uIG9uICgpIHtcbiAgICBzZWxmLiRvZmYoZXZlbnQsIG9uKVxuICAgIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cylcbiAgfVxuICBvbi5mbiA9IGZuXG4gIHRoaXMuJG9uKGV2ZW50LCBvbilcbiAgcmV0dXJuIHRoaXNcbn1cblxuLyoqXG4gKiBSZW1vdmUgdGhlIGdpdmVuIGNhbGxiYWNrIGZvciBgZXZlbnRgIG9yIGFsbFxuICogcmVnaXN0ZXJlZCBjYWxsYmFja3MuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICovXG5cbmV4cG9ydHMuJG9mZiA9IGZ1bmN0aW9uIChldmVudCwgZm4pIHtcbiAgdmFyIGNic1xuICAvLyBhbGxcbiAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgaWYgKHRoaXMuJHBhcmVudCkge1xuICAgICAgZm9yIChldmVudCBpbiB0aGlzLl9ldmVudHMpIHtcbiAgICAgICAgY2JzID0gdGhpcy5fZXZlbnRzW2V2ZW50XVxuICAgICAgICBpZiAoY2JzKSB7XG4gICAgICAgICAgbW9kaWZ5TGlzdGVuZXJDb3VudCh0aGlzLCBldmVudCwgLWNicy5sZW5ndGgpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5fZXZlbnRzID0ge31cbiAgICByZXR1cm4gdGhpc1xuICB9XG4gIC8vIHNwZWNpZmljIGV2ZW50XG4gIGNicyA9IHRoaXMuX2V2ZW50c1tldmVudF1cbiAgaWYgKCFjYnMpIHtcbiAgICByZXR1cm4gdGhpc1xuICB9XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAxKSB7XG4gICAgbW9kaWZ5TGlzdGVuZXJDb3VudCh0aGlzLCBldmVudCwgLWNicy5sZW5ndGgpXG4gICAgdGhpcy5fZXZlbnRzW2V2ZW50XSA9IG51bGxcbiAgICByZXR1cm4gdGhpc1xuICB9XG4gIC8vIHNwZWNpZmljIGhhbmRsZXJcbiAgdmFyIGNiXG4gIHZhciBpID0gY2JzLmxlbmd0aFxuICB3aGlsZSAoaS0tKSB7XG4gICAgY2IgPSBjYnNbaV1cbiAgICBpZiAoY2IgPT09IGZuIHx8IGNiLmZuID09PSBmbikge1xuICAgICAgbW9kaWZ5TGlzdGVuZXJDb3VudCh0aGlzLCBldmVudCwgLTEpXG4gICAgICBjYnMuc3BsaWNlKGksIDEpXG4gICAgICBicmVha1xuICAgIH1cbiAgfVxuICByZXR1cm4gdGhpc1xufVxuXG4vKipcbiAqIFRyaWdnZXIgYW4gZXZlbnQgb24gc2VsZi5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqL1xuXG5leHBvcnRzLiRlbWl0ID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gIHRoaXMuX2V2ZW50Q2FuY2VsbGVkID0gZmFsc2VcbiAgdmFyIGNicyA9IHRoaXMuX2V2ZW50c1tldmVudF1cbiAgaWYgKGNicykge1xuICAgIC8vIGF2b2lkIGxlYWtpbmcgYXJndW1lbnRzOlxuICAgIC8vIGh0dHA6Ly9qc3BlcmYuY29tL2Nsb3N1cmUtd2l0aC1hcmd1bWVudHNcbiAgICB2YXIgaSA9IGFyZ3VtZW50cy5sZW5ndGggLSAxXG4gICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkoaSlcbiAgICB3aGlsZSAoaS0tKSB7XG4gICAgICBhcmdzW2ldID0gYXJndW1lbnRzW2kgKyAxXVxuICAgIH1cbiAgICBpID0gMFxuICAgIGNicyA9IGNicy5sZW5ndGggPiAxXG4gICAgICA/IF8udG9BcnJheShjYnMpXG4gICAgICA6IGNic1xuICAgIGZvciAodmFyIGwgPSBjYnMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICBpZiAoY2JzW2ldLmFwcGx5KHRoaXMsIGFyZ3MpID09PSBmYWxzZSkge1xuICAgICAgICB0aGlzLl9ldmVudENhbmNlbGxlZCA9IHRydWVcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRoaXNcbn1cblxuLyoqXG4gKiBSZWN1cnNpdmVseSBicm9hZGNhc3QgYW4gZXZlbnQgdG8gYWxsIGNoaWxkcmVuIGluc3RhbmNlcy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEBwYXJhbSB7Li4uKn0gYWRkaXRpb25hbCBhcmd1bWVudHNcbiAqL1xuXG5leHBvcnRzLiRicm9hZGNhc3QgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgLy8gaWYgbm8gY2hpbGQgaGFzIHJlZ2lzdGVyZWQgZm9yIHRoaXMgZXZlbnQsXG4gIC8vIHRoZW4gdGhlcmUncyBubyBuZWVkIHRvIGJyb2FkY2FzdC5cbiAgaWYgKCF0aGlzLl9ldmVudHNDb3VudFtldmVudF0pIHJldHVyblxuICB2YXIgY2hpbGRyZW4gPSB0aGlzLl9jaGlsZHJlblxuICBmb3IgKHZhciBpID0gMCwgbCA9IGNoaWxkcmVuLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgIHZhciBjaGlsZCA9IGNoaWxkcmVuW2ldXG4gICAgY2hpbGQuJGVtaXQuYXBwbHkoY2hpbGQsIGFyZ3VtZW50cylcbiAgICBpZiAoIWNoaWxkLl9ldmVudENhbmNlbGxlZCkge1xuICAgICAgY2hpbGQuJGJyb2FkY2FzdC5hcHBseShjaGlsZCwgYXJndW1lbnRzKVxuICAgIH1cbiAgfVxuICByZXR1cm4gdGhpc1xufVxuXG4vKipcbiAqIFJlY3Vyc2l2ZWx5IHByb3BhZ2F0ZSBhbiBldmVudCB1cCB0aGUgcGFyZW50IGNoYWluLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICogQHBhcmFtIHsuLi4qfSBhZGRpdGlvbmFsIGFyZ3VtZW50c1xuICovXG5cbmV4cG9ydHMuJGRpc3BhdGNoID0gZnVuY3Rpb24gKCkge1xuICB2YXIgcGFyZW50ID0gdGhpcy4kcGFyZW50XG4gIHdoaWxlIChwYXJlbnQpIHtcbiAgICBwYXJlbnQuJGVtaXQuYXBwbHkocGFyZW50LCBhcmd1bWVudHMpXG4gICAgcGFyZW50ID0gcGFyZW50Ll9ldmVudENhbmNlbGxlZFxuICAgICAgPyBudWxsXG4gICAgICA6IHBhcmVudC4kcGFyZW50XG4gIH1cbiAgcmV0dXJuIHRoaXNcbn1cblxuLyoqXG4gKiBNb2RpZnkgdGhlIGxpc3RlbmVyIGNvdW50cyBvbiBhbGwgcGFyZW50cy5cbiAqIFRoaXMgYm9va2tlZXBpbmcgYWxsb3dzICRicm9hZGNhc3QgdG8gcmV0dXJuIGVhcmx5IHdoZW5cbiAqIG5vIGNoaWxkIGhhcyBsaXN0ZW5lZCB0byBhIGNlcnRhaW4gZXZlbnQuXG4gKlxuICogQHBhcmFtIHtWdWV9IHZtXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSBjb3VudFxuICovXG5cbnZhciBob29rUkUgPSAvXmhvb2s6L1xuZnVuY3Rpb24gbW9kaWZ5TGlzdGVuZXJDb3VudCAodm0sIGV2ZW50LCBjb3VudCkge1xuICB2YXIgcGFyZW50ID0gdm0uJHBhcmVudFxuICAvLyBob29rcyBkbyBub3QgZ2V0IGJyb2FkY2FzdGVkIHNvIG5vIG5lZWRcbiAgLy8gdG8gZG8gYm9va2tlZXBpbmcgZm9yIHRoZW1cbiAgaWYgKCFwYXJlbnQgfHwgIWNvdW50IHx8IGhvb2tSRS50ZXN0KGV2ZW50KSkgcmV0dXJuXG4gIHdoaWxlIChwYXJlbnQpIHtcbiAgICBwYXJlbnQuX2V2ZW50c0NvdW50W2V2ZW50XSA9XG4gICAgICAocGFyZW50Ll9ldmVudHNDb3VudFtldmVudF0gfHwgMCkgKyBjb3VudFxuICAgIHBhcmVudCA9IHBhcmVudC4kcGFyZW50XG4gIH1cbn0iLCJ2YXIgXyA9IHJlcXVpcmUoJy4uL3V0aWwnKVxudmFyIG1lcmdlT3B0aW9ucyA9IHJlcXVpcmUoJy4uL3V0aWwvbWVyZ2Utb3B0aW9uJylcblxuLyoqXG4gKiBFeHBvc2UgdXNlZnVsIGludGVybmFsc1xuICovXG5cbmV4cG9ydHMudXRpbCA9IF9cbmV4cG9ydHMubmV4dFRpY2sgPSBfLm5leHRUaWNrXG5leHBvcnRzLmNvbmZpZyA9IHJlcXVpcmUoJy4uL2NvbmZpZycpXG5cbmV4cG9ydHMuY29tcGlsZXIgPSB7XG4gIGNvbXBpbGU6IHJlcXVpcmUoJy4uL2NvbXBpbGVyL2NvbXBpbGUnKSxcbiAgdHJhbnNjbHVkZTogcmVxdWlyZSgnLi4vY29tcGlsZXIvdHJhbnNjbHVkZScpXG59XG5cbmV4cG9ydHMucGFyc2VycyA9IHtcbiAgcGF0aDogcmVxdWlyZSgnLi4vcGFyc2Vycy9wYXRoJyksXG4gIHRleHQ6IHJlcXVpcmUoJy4uL3BhcnNlcnMvdGV4dCcpLFxuICB0ZW1wbGF0ZTogcmVxdWlyZSgnLi4vcGFyc2Vycy90ZW1wbGF0ZScpLFxuICBkaXJlY3RpdmU6IHJlcXVpcmUoJy4uL3BhcnNlcnMvZGlyZWN0aXZlJyksXG4gIGV4cHJlc3Npb246IHJlcXVpcmUoJy4uL3BhcnNlcnMvZXhwcmVzc2lvbicpXG59XG5cbi8qKlxuICogRWFjaCBpbnN0YW5jZSBjb25zdHJ1Y3RvciwgaW5jbHVkaW5nIFZ1ZSwgaGFzIGEgdW5pcXVlXG4gKiBjaWQuIFRoaXMgZW5hYmxlcyB1cyB0byBjcmVhdGUgd3JhcHBlZCBcImNoaWxkXG4gKiBjb25zdHJ1Y3RvcnNcIiBmb3IgcHJvdG90eXBhbCBpbmhlcml0YW5jZSBhbmQgY2FjaGUgdGhlbS5cbiAqL1xuXG5leHBvcnRzLmNpZCA9IDBcbnZhciBjaWQgPSAxXG5cbi8qKlxuICogQ2xhc3MgaW5laHJpdGFuY2VcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gZXh0ZW5kT3B0aW9uc1xuICovXG5cbmV4cG9ydHMuZXh0ZW5kID0gZnVuY3Rpb24gKGV4dGVuZE9wdGlvbnMpIHtcbiAgZXh0ZW5kT3B0aW9ucyA9IGV4dGVuZE9wdGlvbnMgfHwge31cbiAgdmFyIFN1cGVyID0gdGhpc1xuICB2YXIgU3ViID0gY3JlYXRlQ2xhc3MoXG4gICAgZXh0ZW5kT3B0aW9ucy5uYW1lIHx8XG4gICAgU3VwZXIub3B0aW9ucy5uYW1lIHx8XG4gICAgJ1Z1ZUNvbXBvbmVudCdcbiAgKVxuICBTdWIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShTdXBlci5wcm90b3R5cGUpXG4gIFN1Yi5wcm90b3R5cGUuY29uc3RydWN0b3IgPSBTdWJcbiAgU3ViLmNpZCA9IGNpZCsrXG4gIFN1Yi5vcHRpb25zID0gbWVyZ2VPcHRpb25zKFxuICAgIFN1cGVyLm9wdGlvbnMsXG4gICAgZXh0ZW5kT3B0aW9uc1xuICApXG4gIFN1Ylsnc3VwZXInXSA9IFN1cGVyXG4gIC8vIGFsbG93IGZ1cnRoZXIgZXh0ZW5zaW9uXG4gIFN1Yi5leHRlbmQgPSBTdXBlci5leHRlbmRcbiAgLy8gY3JlYXRlIGFzc2V0IHJlZ2lzdGVycywgc28gZXh0ZW5kZWQgY2xhc3Nlc1xuICAvLyBjYW4gaGF2ZSB0aGVpciBwcml2YXRlIGFzc2V0cyB0b28uXG4gIGNyZWF0ZUFzc2V0UmVnaXN0ZXJzKFN1YilcbiAgcmV0dXJuIFN1YlxufVxuXG4vKipcbiAqIEEgZnVuY3Rpb24gdGhhdCByZXR1cm5zIGEgc3ViLWNsYXNzIGNvbnN0cnVjdG9yIHdpdGggdGhlXG4gKiBnaXZlbiBuYW1lLiBUaGlzIGdpdmVzIHVzIG11Y2ggbmljZXIgb3V0cHV0IHdoZW5cbiAqIGxvZ2dpbmcgaW5zdGFuY2VzIGluIHRoZSBjb25zb2xlLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqL1xuXG5mdW5jdGlvbiBjcmVhdGVDbGFzcyAobmFtZSkge1xuICByZXR1cm4gbmV3IEZ1bmN0aW9uKFxuICAgICdyZXR1cm4gZnVuY3Rpb24gJyArIF8uY2xhc3NpZnkobmFtZSkgK1xuICAgICcgKG9wdGlvbnMpIHsgdGhpcy5faW5pdChvcHRpb25zKSB9J1xuICApKClcbn1cblxuLyoqXG4gKiBQbHVnaW4gc3lzdGVtXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHBsdWdpblxuICovXG5cbmV4cG9ydHMudXNlID0gZnVuY3Rpb24gKHBsdWdpbikge1xuICAvLyBhZGRpdGlvbmFsIHBhcmFtZXRlcnNcbiAgdmFyIGFyZ3MgPSBfLnRvQXJyYXkoYXJndW1lbnRzLCAxKVxuICBhcmdzLnVuc2hpZnQodGhpcylcbiAgaWYgKHR5cGVvZiBwbHVnaW4uaW5zdGFsbCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIHBsdWdpbi5pbnN0YWxsLmFwcGx5KHBsdWdpbiwgYXJncylcbiAgfSBlbHNlIHtcbiAgICBwbHVnaW4uYXBwbHkobnVsbCwgYXJncylcbiAgfVxuICByZXR1cm4gdGhpc1xufVxuXG4vKipcbiAqIERlZmluZSBhc3NldCByZWdpc3RyYXRpb24gbWV0aG9kcyBvbiBhIGNvbnN0cnVjdG9yLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IENvbnN0cnVjdG9yXG4gKi9cblxudmFyIGFzc2V0VHlwZXMgPSBbXG4gICdkaXJlY3RpdmUnLFxuICAnZmlsdGVyJyxcbiAgJ3BhcnRpYWwnLFxuICAndHJhbnNpdGlvbidcbl1cblxuZnVuY3Rpb24gY3JlYXRlQXNzZXRSZWdpc3RlcnMgKENvbnN0cnVjdG9yKSB7XG5cbiAgLyogQXNzZXQgcmVnaXN0cmF0aW9uIG1ldGhvZHMgc2hhcmUgdGhlIHNhbWUgc2lnbmF0dXJlOlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gaWRcbiAgICogQHBhcmFtIHsqfSBkZWZpbml0aW9uXG4gICAqL1xuXG4gIGFzc2V0VHlwZXMuZm9yRWFjaChmdW5jdGlvbiAodHlwZSkge1xuICAgIENvbnN0cnVjdG9yW3R5cGVdID0gZnVuY3Rpb24gKGlkLCBkZWZpbml0aW9uKSB7XG4gICAgICBpZiAoIWRlZmluaXRpb24pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMub3B0aW9uc1t0eXBlICsgJ3MnXVtpZF1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMub3B0aW9uc1t0eXBlICsgJ3MnXVtpZF0gPSBkZWZpbml0aW9uXG4gICAgICB9XG4gICAgfVxuICB9KVxuXG4gIC8qKlxuICAgKiBDb21wb25lbnQgcmVnaXN0cmF0aW9uIG5lZWRzIHRvIGF1dG9tYXRpY2FsbHkgaW52b2tlXG4gICAqIFZ1ZS5leHRlbmQgb24gb2JqZWN0IHZhbHVlcy5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IGlkXG4gICAqIEBwYXJhbSB7T2JqZWN0fEZ1bmN0aW9ufSBkZWZpbml0aW9uXG4gICAqL1xuXG4gIENvbnN0cnVjdG9yLmNvbXBvbmVudCA9IGZ1bmN0aW9uIChpZCwgZGVmaW5pdGlvbikge1xuICAgIGlmICghZGVmaW5pdGlvbikge1xuICAgICAgcmV0dXJuIHRoaXMub3B0aW9ucy5jb21wb25lbnRzW2lkXVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoXy5pc1BsYWluT2JqZWN0KGRlZmluaXRpb24pKSB7XG4gICAgICAgIGRlZmluaXRpb24ubmFtZSA9IGlkXG4gICAgICAgIGRlZmluaXRpb24gPSBfLlZ1ZS5leHRlbmQoZGVmaW5pdGlvbilcbiAgICAgIH1cbiAgICAgIHRoaXMub3B0aW9ucy5jb21wb25lbnRzW2lkXSA9IGRlZmluaXRpb25cbiAgICB9XG4gIH1cbn1cblxuY3JlYXRlQXNzZXRSZWdpc3RlcnMoZXhwb3J0cykiLCJ2YXIgXyA9IHJlcXVpcmUoJy4uL3V0aWwnKVxudmFyIGNvbXBpbGUgPSByZXF1aXJlKCcuLi9jb21waWxlci9jb21waWxlJylcblxuLyoqXG4gKiBTZXQgaW5zdGFuY2UgdGFyZ2V0IGVsZW1lbnQgYW5kIGtpY2sgb2ZmIHRoZSBjb21waWxhdGlvblxuICogcHJvY2Vzcy4gVGhlIHBhc3NlZCBpbiBgZWxgIGNhbiBiZSBhIHNlbGVjdG9yIHN0cmluZywgYW5cbiAqIGV4aXN0aW5nIEVsZW1lbnQsIG9yIGEgRG9jdW1lbnRGcmFnbWVudCAoZm9yIGJsb2NrXG4gKiBpbnN0YW5jZXMpLlxuICpcbiAqIEBwYXJhbSB7RWxlbWVudHxEb2N1bWVudEZyYWdtZW50fHN0cmluZ30gZWxcbiAqIEBwdWJsaWNcbiAqL1xuXG5leHBvcnRzLiRtb3VudCA9IGZ1bmN0aW9uIChlbCkge1xuICBpZiAodGhpcy5faXNDb21waWxlZCkge1xuICAgIF8ud2FybignJG1vdW50KCkgc2hvdWxkIGJlIGNhbGxlZCBvbmx5IG9uY2UuJylcbiAgICByZXR1cm5cbiAgfVxuICBpZiAoIWVsKSB7XG4gICAgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICB9IGVsc2UgaWYgKHR5cGVvZiBlbCA9PT0gJ3N0cmluZycpIHtcbiAgICB2YXIgc2VsZWN0b3IgPSBlbFxuICAgIGVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihlbClcbiAgICBpZiAoIWVsKSB7XG4gICAgICBfLndhcm4oJ0Nhbm5vdCBmaW5kIGVsZW1lbnQ6ICcgKyBzZWxlY3RvcilcbiAgICAgIHJldHVyblxuICAgIH1cbiAgfVxuICB0aGlzLl9jb21waWxlKGVsKVxuICB0aGlzLl9pc0NvbXBpbGVkID0gdHJ1ZVxuICB0aGlzLl9jYWxsSG9vaygnY29tcGlsZWQnKVxuICBpZiAoXy5pbkRvYyh0aGlzLiRlbCkpIHtcbiAgICB0aGlzLl9jYWxsSG9vaygnYXR0YWNoZWQnKVxuICAgIHRoaXMuX2luaXRET01Ib29rcygpXG4gICAgcmVhZHkuY2FsbCh0aGlzKVxuICB9IGVsc2Uge1xuICAgIHRoaXMuX2luaXRET01Ib29rcygpXG4gICAgdGhpcy4kb25jZSgnaG9vazphdHRhY2hlZCcsIHJlYWR5KVxuICB9XG4gIHJldHVybiB0aGlzXG59XG5cbi8qKlxuICogTWFyayBhbiBpbnN0YW5jZSBhcyByZWFkeS5cbiAqL1xuXG5mdW5jdGlvbiByZWFkeSAoKSB7XG4gIHRoaXMuX2lzQXR0YWNoZWQgPSB0cnVlXG4gIHRoaXMuX2lzUmVhZHkgPSB0cnVlXG4gIHRoaXMuX2NhbGxIb29rKCdyZWFkeScpXG59XG5cbi8qKlxuICogVGVhcmRvd24gdGhlIGluc3RhbmNlLCBzaW1wbHkgZGVsZWdhdGUgdG8gdGhlIGludGVybmFsXG4gKiBfZGVzdHJveS5cbiAqL1xuXG5leHBvcnRzLiRkZXN0cm95ID0gZnVuY3Rpb24gKHJlbW92ZSwgZGVmZXJDbGVhbnVwKSB7XG4gIHRoaXMuX2Rlc3Ryb3kocmVtb3ZlLCBkZWZlckNsZWFudXApXG59XG5cbi8qKlxuICogUGFydGlhbGx5IGNvbXBpbGUgYSBwaWVjZSBvZiBET00gYW5kIHJldHVybiBhXG4gKiBkZWNvbXBpbGUgZnVuY3Rpb24uXG4gKlxuICogQHBhcmFtIHtFbGVtZW50fERvY3VtZW50RnJhZ21lbnR9IGVsXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqL1xuXG5leHBvcnRzLiRjb21waWxlID0gZnVuY3Rpb24gKGVsKSB7XG4gIHJldHVybiBjb21waWxlKGVsLCB0aGlzLiRvcHRpb25zLCB0cnVlKSh0aGlzLCBlbClcbn0iLCJ2YXIgXyA9IHJlcXVpcmUoJy4vdXRpbCcpXG52YXIgTUFYX1VQREFURV9DT1VOVCA9IDEwXG5cbi8vIHdlIGhhdmUgdHdvIHNlcGFyYXRlIHF1ZXVlczogb25lIGZvciBkaXJlY3RpdmUgdXBkYXRlc1xuLy8gYW5kIG9uZSBmb3IgdXNlciB3YXRjaGVyIHJlZ2lzdGVyZWQgdmlhICR3YXRjaCgpLlxuLy8gd2Ugd2FudCB0byBndWFyYW50ZWUgZGlyZWN0aXZlIHVwZGF0ZXMgdG8gYmUgY2FsbGVkXG4vLyBiZWZvcmUgdXNlciB3YXRjaGVycyBzbyB0aGF0IHdoZW4gdXNlciB3YXRjaGVycyBhcmVcbi8vIHRyaWdnZXJlZCwgdGhlIERPTSB3b3VsZCBoYXZlIGFscmVhZHkgYmVlbiBpbiB1cGRhdGVkXG4vLyBzdGF0ZS5cbnZhciBxdWV1ZSA9IFtdXG52YXIgdXNlclF1ZXVlID0gW11cbnZhciBoYXMgPSB7fVxudmFyIHdhaXRpbmcgPSBmYWxzZVxudmFyIGZsdXNoaW5nID0gZmFsc2VcblxuLyoqXG4gKiBSZXNldCB0aGUgYmF0Y2hlcidzIHN0YXRlLlxuICovXG5cbmZ1bmN0aW9uIHJlc2V0ICgpIHtcbiAgcXVldWUgPSBbXVxuICB1c2VyUXVldWUgPSBbXVxuICBoYXMgPSB7fVxuICB3YWl0aW5nID0gZmFsc2VcbiAgZmx1c2hpbmcgPSBmYWxzZVxufVxuXG4vKipcbiAqIEZsdXNoIGJvdGggcXVldWVzIGFuZCBydW4gdGhlIGpvYnMuXG4gKi9cblxuZnVuY3Rpb24gZmx1c2ggKCkge1xuICBmbHVzaGluZyA9IHRydWVcbiAgcnVuKHF1ZXVlKVxuICBydW4odXNlclF1ZXVlKVxuICByZXNldCgpXG59XG5cbi8qKlxuICogUnVuIHRoZSBqb2JzIGluIGEgc2luZ2xlIHF1ZXVlLlxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IHF1ZXVlXG4gKi9cblxuZnVuY3Rpb24gcnVuIChxdWV1ZSkge1xuICAvLyBkbyBub3QgY2FjaGUgbGVuZ3RoIGJlY2F1c2UgbW9yZSBqb2JzIG1pZ2h0IGJlIHB1c2hlZFxuICAvLyBhcyB3ZSBydW4gZXhpc3Rpbmcgam9ic1xuICBmb3IgKHZhciBpID0gMDsgaSA8IHF1ZXVlLmxlbmd0aDsgaSsrKSB7XG4gICAgcXVldWVbaV0ucnVuKClcbiAgfVxufVxuXG4vKipcbiAqIFB1c2ggYSBqb2IgaW50byB0aGUgam9iIHF1ZXVlLlxuICogSm9icyB3aXRoIGR1cGxpY2F0ZSBJRHMgd2lsbCBiZSBza2lwcGVkIHVubGVzcyBpdCdzXG4gKiBwdXNoZWQgd2hlbiB0aGUgcXVldWUgaXMgYmVpbmcgZmx1c2hlZC5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gam9iXG4gKiAgIHByb3BlcnRpZXM6XG4gKiAgIC0ge1N0cmluZ3xOdW1iZXJ9IGlkXG4gKiAgIC0ge0Z1bmN0aW9ufSAgICAgIHJ1blxuICovXG5cbmV4cG9ydHMucHVzaCA9IGZ1bmN0aW9uIChqb2IpIHtcbiAgdmFyIGlkID0gam9iLmlkXG4gIGlmICghaWQgfHwgIWhhc1tpZF0gfHwgZmx1c2hpbmcpIHtcbiAgICBpZiAoIWhhc1tpZF0pIHtcbiAgICAgIGhhc1tpZF0gPSAxXG4gICAgfSBlbHNlIHtcbiAgICAgIGhhc1tpZF0rK1xuICAgICAgLy8gZGV0ZWN0IHBvc3NpYmxlIGluZmluaXRlIHVwZGF0ZSBsb29wc1xuICAgICAgaWYgKGhhc1tpZF0gPiBNQVhfVVBEQVRFX0NPVU5UKSB7XG4gICAgICAgIF8ud2FybihcbiAgICAgICAgICAnWW91IG1heSBoYXZlIGFuIGluZmluaXRlIHVwZGF0ZSBsb29wIGZvciB0aGUgJyArXG4gICAgICAgICAgJ3dhdGNoZXIgd2l0aCBleHByZXNzaW9uOiBcIicgKyBqb2IuZXhwcmVzc2lvbiArICdcIi4nXG4gICAgICAgIClcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgfVxuICAgIC8vIEEgdXNlciB3YXRjaGVyIGNhbGxiYWNrIGNvdWxkIHRyaWdnZXIgYW5vdGhlclxuICAgIC8vIGRpcmVjdGl2ZSB1cGRhdGUgZHVyaW5nIHRoZSBmbHVzaGluZzsgYXQgdGhhdCB0aW1lXG4gICAgLy8gdGhlIGRpcmVjdGl2ZSBxdWV1ZSB3b3VsZCBhbHJlYWR5IGhhdmUgYmVlbiBydW4sIHNvXG4gICAgLy8gd2UgY2FsbCB0aGF0IHVwZGF0ZSBpbW1lZGlhdGVseSBhcyBpdCBpcyBwdXNoZWQuXG4gICAgaWYgKGZsdXNoaW5nICYmICFqb2IudXNlcikge1xuICAgICAgam9iLnJ1bigpXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgOyhqb2IudXNlciA/IHVzZXJRdWV1ZSA6IHF1ZXVlKS5wdXNoKGpvYilcbiAgICBpZiAoIXdhaXRpbmcpIHtcbiAgICAgIHdhaXRpbmcgPSB0cnVlXG4gICAgICBfLm5leHRUaWNrKGZsdXNoKVxuICAgIH1cbiAgfVxufSIsIi8qKlxuICogQSBkb3VibHkgbGlua2VkIGxpc3QtYmFzZWQgTGVhc3QgUmVjZW50bHkgVXNlZCAoTFJVKVxuICogY2FjaGUuIFdpbGwga2VlcCBtb3N0IHJlY2VudGx5IHVzZWQgaXRlbXMgd2hpbGVcbiAqIGRpc2NhcmRpbmcgbGVhc3QgcmVjZW50bHkgdXNlZCBpdGVtcyB3aGVuIGl0cyBsaW1pdCBpc1xuICogcmVhY2hlZC4gVGhpcyBpcyBhIGJhcmUtYm9uZSB2ZXJzaW9uIG9mXG4gKiBSYXNtdXMgQW5kZXJzc29uJ3MganMtbHJ1OlxuICpcbiAqICAgaHR0cHM6Ly9naXRodWIuY29tL3JzbXMvanMtbHJ1XG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IGxpbWl0XG4gKiBAY29uc3RydWN0b3JcbiAqL1xuXG5mdW5jdGlvbiBDYWNoZSAobGltaXQpIHtcbiAgdGhpcy5zaXplID0gMFxuICB0aGlzLmxpbWl0ID0gbGltaXRcbiAgdGhpcy5oZWFkID0gdGhpcy50YWlsID0gdW5kZWZpbmVkXG4gIHRoaXMuX2tleW1hcCA9IHt9XG59XG5cbnZhciBwID0gQ2FjaGUucHJvdG90eXBlXG5cbi8qKlxuICogUHV0IDx2YWx1ZT4gaW50byB0aGUgY2FjaGUgYXNzb2NpYXRlZCB3aXRoIDxrZXk+LlxuICogUmV0dXJucyB0aGUgZW50cnkgd2hpY2ggd2FzIHJlbW92ZWQgdG8gbWFrZSByb29tIGZvclxuICogdGhlIG5ldyBlbnRyeS4gT3RoZXJ3aXNlIHVuZGVmaW5lZCBpcyByZXR1cm5lZC5cbiAqIChpLmUuIGlmIHRoZXJlIHdhcyBlbm91Z2ggcm9vbSBhbHJlYWR5KS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30ga2V5XG4gKiBAcGFyYW0geyp9IHZhbHVlXG4gKiBAcmV0dXJuIHtFbnRyeXx1bmRlZmluZWR9XG4gKi9cblxucC5wdXQgPSBmdW5jdGlvbiAoa2V5LCB2YWx1ZSkge1xuICB2YXIgZW50cnkgPSB7XG4gICAga2V5OmtleSxcbiAgICB2YWx1ZTp2YWx1ZVxuICB9XG4gIHRoaXMuX2tleW1hcFtrZXldID0gZW50cnlcbiAgaWYgKHRoaXMudGFpbCkge1xuICAgIHRoaXMudGFpbC5uZXdlciA9IGVudHJ5XG4gICAgZW50cnkub2xkZXIgPSB0aGlzLnRhaWxcbiAgfSBlbHNlIHtcbiAgICB0aGlzLmhlYWQgPSBlbnRyeVxuICB9XG4gIHRoaXMudGFpbCA9IGVudHJ5XG4gIGlmICh0aGlzLnNpemUgPT09IHRoaXMubGltaXQpIHtcbiAgICByZXR1cm4gdGhpcy5zaGlmdCgpXG4gIH0gZWxzZSB7XG4gICAgdGhpcy5zaXplKytcbiAgfVxufVxuXG4vKipcbiAqIFB1cmdlIHRoZSBsZWFzdCByZWNlbnRseSB1c2VkIChvbGRlc3QpIGVudHJ5IGZyb20gdGhlXG4gKiBjYWNoZS4gUmV0dXJucyB0aGUgcmVtb3ZlZCBlbnRyeSBvciB1bmRlZmluZWQgaWYgdGhlXG4gKiBjYWNoZSB3YXMgZW1wdHkuXG4gKi9cblxucC5zaGlmdCA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGVudHJ5ID0gdGhpcy5oZWFkXG4gIGlmIChlbnRyeSkge1xuICAgIHRoaXMuaGVhZCA9IHRoaXMuaGVhZC5uZXdlclxuICAgIHRoaXMuaGVhZC5vbGRlciA9IHVuZGVmaW5lZFxuICAgIGVudHJ5Lm5ld2VyID0gZW50cnkub2xkZXIgPSB1bmRlZmluZWRcbiAgICB0aGlzLl9rZXltYXBbZW50cnkua2V5XSA9IHVuZGVmaW5lZFxuICB9XG4gIHJldHVybiBlbnRyeVxufVxuXG4vKipcbiAqIEdldCBhbmQgcmVnaXN0ZXIgcmVjZW50IHVzZSBvZiA8a2V5Pi4gUmV0dXJucyB0aGUgdmFsdWVcbiAqIGFzc29jaWF0ZWQgd2l0aCA8a2V5PiBvciB1bmRlZmluZWQgaWYgbm90IGluIGNhY2hlLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBrZXlcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gcmV0dXJuRW50cnlcbiAqIEByZXR1cm4ge0VudHJ5fCp9XG4gKi9cblxucC5nZXQgPSBmdW5jdGlvbiAoa2V5LCByZXR1cm5FbnRyeSkge1xuICB2YXIgZW50cnkgPSB0aGlzLl9rZXltYXBba2V5XVxuICBpZiAoZW50cnkgPT09IHVuZGVmaW5lZCkgcmV0dXJuXG4gIGlmIChlbnRyeSA9PT0gdGhpcy50YWlsKSB7XG4gICAgcmV0dXJuIHJldHVybkVudHJ5XG4gICAgICA/IGVudHJ5XG4gICAgICA6IGVudHJ5LnZhbHVlXG4gIH1cbiAgLy8gSEVBRC0tLS0tLS0tLS0tLS0tVEFJTFxuICAvLyAgIDwub2xkZXIgICAubmV3ZXI+XG4gIC8vICA8LS0tIGFkZCBkaXJlY3Rpb24gLS1cbiAgLy8gICBBICBCICBDICA8RD4gIEVcbiAgaWYgKGVudHJ5Lm5ld2VyKSB7XG4gICAgaWYgKGVudHJ5ID09PSB0aGlzLmhlYWQpIHtcbiAgICAgIHRoaXMuaGVhZCA9IGVudHJ5Lm5ld2VyXG4gICAgfVxuICAgIGVudHJ5Lm5ld2VyLm9sZGVyID0gZW50cnkub2xkZXIgLy8gQyA8LS0gRS5cbiAgfVxuICBpZiAoZW50cnkub2xkZXIpIHtcbiAgICBlbnRyeS5vbGRlci5uZXdlciA9IGVudHJ5Lm5ld2VyIC8vIEMuIC0tPiBFXG4gIH1cbiAgZW50cnkubmV3ZXIgPSB1bmRlZmluZWQgLy8gRCAtLXhcbiAgZW50cnkub2xkZXIgPSB0aGlzLnRhaWwgLy8gRC4gLS0+IEVcbiAgaWYgKHRoaXMudGFpbCkge1xuICAgIHRoaXMudGFpbC5uZXdlciA9IGVudHJ5IC8vIEUuIDwtLSBEXG4gIH1cbiAgdGhpcy50YWlsID0gZW50cnlcbiAgcmV0dXJuIHJldHVybkVudHJ5XG4gICAgPyBlbnRyeVxuICAgIDogZW50cnkudmFsdWVcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBDYWNoZSIsInZhciBfID0gcmVxdWlyZSgnLi4vdXRpbCcpXG52YXIgY29uZmlnID0gcmVxdWlyZSgnLi4vY29uZmlnJylcbnZhciB0ZXh0UGFyc2VyID0gcmVxdWlyZSgnLi4vcGFyc2Vycy90ZXh0JylcbnZhciBkaXJQYXJzZXIgPSByZXF1aXJlKCcuLi9wYXJzZXJzL2RpcmVjdGl2ZScpXG52YXIgdGVtcGxhdGVQYXJzZXIgPSByZXF1aXJlKCcuLi9wYXJzZXJzL3RlbXBsYXRlJylcblxubW9kdWxlLmV4cG9ydHMgPSBjb21waWxlXG5cbi8qKlxuICogQ29tcGlsZSBhIHRlbXBsYXRlIGFuZCByZXR1cm4gYSByZXVzYWJsZSBjb21wb3NpdGUgbGlua1xuICogZnVuY3Rpb24sIHdoaWNoIHJlY3Vyc2l2ZWx5IGNvbnRhaW5zIG1vcmUgbGluayBmdW5jdGlvbnNcbiAqIGluc2lkZS4gVGhpcyB0b3AgbGV2ZWwgY29tcGlsZSBmdW5jdGlvbiBzaG91bGQgb25seSBiZVxuICogY2FsbGVkIG9uIGluc3RhbmNlIHJvb3Qgbm9kZXMuXG4gKlxuICogQHBhcmFtIHtFbGVtZW50fERvY3VtZW50RnJhZ21lbnR9IGVsXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICogQHBhcmFtIHtCb29sZWFufSBwYXJ0aWFsXG4gKiBAcGFyYW0ge0Jvb2xlYW59IHRyYW5zY2x1ZGVkXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqL1xuXG5mdW5jdGlvbiBjb21waWxlIChlbCwgb3B0aW9ucywgcGFydGlhbCwgdHJhbnNjbHVkZWQpIHtcbiAgdmFyIGlzQmxvY2sgPSBlbC5ub2RlVHlwZSA9PT0gMTFcbiAgLy8gbGluayBmdW5jdGlvbiBmb3IgcGFyYW0gYXR0cmlidXRlcy5cbiAgdmFyIHBhcmFtcyA9IG9wdGlvbnMucGFyYW1BdHRyaWJ1dGVzXG4gIHZhciBwYXJhbXNMaW5rRm4gPSBwYXJhbXMgJiYgIXBhcnRpYWwgJiYgIXRyYW5zY2x1ZGVkICYmICFpc0Jsb2NrXG4gICAgPyBjb21waWxlUGFyYW1BdHRyaWJ1dGVzKGVsLCBwYXJhbXMsIG9wdGlvbnMpXG4gICAgOiBudWxsXG4gIC8vIGxpbmsgZnVuY3Rpb24gZm9yIHRoZSBub2RlIGl0c2VsZi5cbiAgLy8gaWYgdGhpcyBpcyBhIGJsb2NrIGluc3RhbmNlLCB3ZSByZXR1cm4gYSBsaW5rIGZ1bmN0aW9uXG4gIC8vIGZvciB0aGUgYXR0cmlidXRlcyBmb3VuZCBvbiB0aGUgY29udGFpbmVyLCBpZiBhbnkuXG4gIC8vIG9wdGlvbnMuX2NvbnRhaW5lckF0dHJzIGFyZSBjb2xsZWN0ZWQgZHVyaW5nIHRyYW5zY2x1c2lvbi5cbiAgdmFyIG5vZGVMaW5rRm4gPSBpc0Jsb2NrXG4gICAgPyBjb21waWxlQmxvY2tDb250YWluZXIob3B0aW9ucy5fY29udGFpbmVyQXR0cnMsIHBhcmFtcywgb3B0aW9ucylcbiAgICA6IGNvbXBpbGVOb2RlKGVsLCBvcHRpb25zKVxuICAvLyBsaW5rIGZ1bmN0aW9uIGZvciB0aGUgY2hpbGROb2Rlc1xuICB2YXIgY2hpbGRMaW5rRm4gPVxuICAgICEobm9kZUxpbmtGbiAmJiBub2RlTGlua0ZuLnRlcm1pbmFsKSAmJlxuICAgIGVsLnRhZ05hbWUgIT09ICdTQ1JJUFQnICYmXG4gICAgZWwuaGFzQ2hpbGROb2RlcygpXG4gICAgICA/IGNvbXBpbGVOb2RlTGlzdChlbC5jaGlsZE5vZGVzLCBvcHRpb25zKVxuICAgICAgOiBudWxsXG5cbiAgLyoqXG4gICAqIEEgY29tcG9zaXRlIGxpbmtlciBmdW5jdGlvbiB0byBiZSBjYWxsZWQgb24gYSBhbHJlYWR5XG4gICAqIGNvbXBpbGVkIHBpZWNlIG9mIERPTSwgd2hpY2ggaW5zdGFudGlhdGVzIGFsbCBkaXJlY3RpdmVcbiAgICogaW5zdGFuY2VzLlxuICAgKlxuICAgKiBAcGFyYW0ge1Z1ZX0gdm1cbiAgICogQHBhcmFtIHtFbGVtZW50fERvY3VtZW50RnJhZ21lbnR9IGVsXG4gICAqIEByZXR1cm4ge0Z1bmN0aW9ufHVuZGVmaW5lZH1cbiAgICovXG5cbiAgZnVuY3Rpb24gY29tcG9zaXRlTGlua0ZuICh2bSwgZWwpIHtcbiAgICB2YXIgb3JpZ2luYWxEaXJDb3VudCA9IHZtLl9kaXJlY3RpdmVzLmxlbmd0aFxuICAgIHZhciBwYXJlbnRPcmlnaW5hbERpckNvdW50ID1cbiAgICAgIHZtLiRwYXJlbnQgJiYgdm0uJHBhcmVudC5fZGlyZWN0aXZlcy5sZW5ndGhcbiAgICBpZiAocGFyYW1zTGlua0ZuKSB7XG4gICAgICBwYXJhbXNMaW5rRm4odm0sIGVsKVxuICAgIH1cbiAgICAvLyBjYWNoZSBjaGlsZE5vZGVzIGJlZm9yZSBsaW5raW5nIHBhcmVudCwgZml4ICM2NTdcbiAgICB2YXIgY2hpbGROb2RlcyA9IF8udG9BcnJheShlbC5jaGlsZE5vZGVzKVxuICAgIC8vIGlmIHRoaXMgaXMgYSB0cmFuc2NsdWRlZCBjb21waWxlLCBsaW5rZXJzIG5lZWQgdG8gYmVcbiAgICAvLyBjYWxsZWQgaW4gc291cmNlIHNjb3BlLCBhbmQgdGhlIGhvc3QgbmVlZHMgdG8gYmVcbiAgICAvLyBwYXNzZWQgZG93bi5cbiAgICB2YXIgc291cmNlID0gdHJhbnNjbHVkZWQgPyB2bS4kcGFyZW50IDogdm1cbiAgICB2YXIgaG9zdCA9IHRyYW5zY2x1ZGVkID8gdm0gOiB1bmRlZmluZWRcbiAgICAvLyBsaW5rXG4gICAgaWYgKG5vZGVMaW5rRm4pIG5vZGVMaW5rRm4oc291cmNlLCBlbCwgaG9zdClcbiAgICBpZiAoY2hpbGRMaW5rRm4pIGNoaWxkTGlua0ZuKHNvdXJjZSwgY2hpbGROb2RlcywgaG9zdClcblxuICAgIC8qKlxuICAgICAqIElmIHRoaXMgaXMgYSBwYXJ0aWFsIGNvbXBpbGUsIHRoZSBsaW5rZXIgZnVuY3Rpb25cbiAgICAgKiByZXR1cm5zIGFuIHVubGluayBmdW5jdGlvbiB0aGF0IHRlYXJzZG93biBhbGxcbiAgICAgKiBkaXJlY3RpdmVzIGluc3RhbmNlcyBnZW5lcmF0ZWQgZHVyaW5nIHRoZSBwYXJ0aWFsXG4gICAgICogbGlua2luZy5cbiAgICAgKi9cblxuICAgIGlmIChwYXJ0aWFsICYmICF0cmFuc2NsdWRlZCkge1xuICAgICAgdmFyIHNlbGZEaXJzID0gdm0uX2RpcmVjdGl2ZXMuc2xpY2Uob3JpZ2luYWxEaXJDb3VudClcbiAgICAgIHZhciBwYXJlbnREaXJzID0gdm0uJHBhcmVudCAmJlxuICAgICAgICB2bS4kcGFyZW50Ll9kaXJlY3RpdmVzLnNsaWNlKHBhcmVudE9yaWdpbmFsRGlyQ291bnQpXG5cbiAgICAgIHZhciB0ZWFyZG93bkRpcnMgPSBmdW5jdGlvbiAodm0sIGRpcnMpIHtcbiAgICAgICAgdmFyIGkgPSBkaXJzLmxlbmd0aFxuICAgICAgICB3aGlsZSAoaS0tKSB7XG4gICAgICAgICAgZGlyc1tpXS5fdGVhcmRvd24oKVxuICAgICAgICB9XG4gICAgICAgIGkgPSB2bS5fZGlyZWN0aXZlcy5pbmRleE9mKGRpcnNbMF0pXG4gICAgICAgIHZtLl9kaXJlY3RpdmVzLnNwbGljZShpLCBkaXJzLmxlbmd0aClcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGZ1bmN0aW9uIHVubGluayAoKSB7XG4gICAgICAgIHRlYXJkb3duRGlycyh2bSwgc2VsZkRpcnMpXG4gICAgICAgIGlmIChwYXJlbnREaXJzKSB7XG4gICAgICAgICAgdGVhcmRvd25EaXJzKHZtLiRwYXJlbnQsIHBhcmVudERpcnMpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyB0cmFuc2NsdWRlZCBsaW5rRm5zIGFyZSB0ZXJtaW5hbCwgYmVjYXVzZSBpdCB0YWtlc1xuICAvLyBvdmVyIHRoZSBlbnRpcmUgc3ViLXRyZWUuXG4gIGlmICh0cmFuc2NsdWRlZCkge1xuICAgIGNvbXBvc2l0ZUxpbmtGbi50ZXJtaW5hbCA9IHRydWVcbiAgfVxuXG4gIHJldHVybiBjb21wb3NpdGVMaW5rRm5cbn1cblxuLyoqXG4gKiBDb21waWxlIHRoZSBhdHRyaWJ1dGVzIGZvdW5kIG9uIGEgXCJibG9jayBjb250YWluZXJcIiAtXG4gKiBpLmUuIHRoZSBjb250YWluZXIgbm9kZSBpbiB0aGUgcGFyZW50IHRlbXBhdGUgb2YgYSBibG9ja1xuICogaW5zdGFuY2UuIFdlIGFyZSBvbmx5IGNvbmNlcm5lZCB3aXRoIHYtd2l0aCBhbmRcbiAqIHBhcmFtQXR0cmlidXRlcyBoZXJlLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBhdHRycyAtIGEgbWFwIG9mIGF0dHIgbmFtZS92YWx1ZSBwYWlyc1xuICogQHBhcmFtIHtBcnJheX0gcGFyYW1zIC0gcGFyYW0gYXR0cmlidXRlcyBsaXN0XG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICogQHJldHVybiB7RnVuY3Rpb259XG4gKi9cblxuZnVuY3Rpb24gY29tcGlsZUJsb2NrQ29udGFpbmVyIChhdHRycywgcGFyYW1zLCBvcHRpb25zKSB7XG4gIGlmICghYXR0cnMpIHJldHVybiBudWxsXG4gIHZhciBwYXJhbXNMaW5rRm4gPSBwYXJhbXNcbiAgICA/IGNvbXBpbGVQYXJhbUF0dHJpYnV0ZXMoYXR0cnMsIHBhcmFtcywgb3B0aW9ucylcbiAgICA6IG51bGxcbiAgdmFyIHdpdGhWYWwgPSBhdHRyc1tjb25maWcucHJlZml4ICsgJ3dpdGgnXVxuICB2YXIgd2l0aExpbmtGbiA9IG51bGxcbiAgaWYgKHdpdGhWYWwpIHtcbiAgICB2YXIgZGVzY3JpcHRvciA9IGRpclBhcnNlci5wYXJzZSh3aXRoVmFsKVswXVxuICAgIHZhciBkZWYgPSBvcHRpb25zLmRpcmVjdGl2ZXNbJ3dpdGgnXVxuICAgIHdpdGhMaW5rRm4gPSBmdW5jdGlvbiAodm0sIGVsKSB7XG4gICAgICB2bS5fYmluZERpcignd2l0aCcsIGVsLCBkZXNjcmlwdG9yLCBkZWYpICAgXG4gICAgfVxuICB9XG4gIHJldHVybiBmdW5jdGlvbiBibG9ja0NvbnRhaW5lckxpbmtGbiAodm0pIHtcbiAgICAvLyBleHBsaWNpdGx5IHBhc3NpbmcgbnVsbCB0byB0aGUgbGlua2Vyc1xuICAgIC8vIHNpbmNlIHYtd2l0aCBkb2Vzbid0IG5lZWQgYSByZWFsIGVsZW1lbnRcbiAgICBpZiAocGFyYW1zTGlua0ZuKSBwYXJhbXNMaW5rRm4odm0sIG51bGwpXG4gICAgaWYgKHdpdGhMaW5rRm4pIHdpdGhMaW5rRm4odm0sIG51bGwpXG4gIH1cbn1cblxuLyoqXG4gKiBDb21waWxlIGEgbm9kZSBhbmQgcmV0dXJuIGEgbm9kZUxpbmtGbiBiYXNlZCBvbiB0aGVcbiAqIG5vZGUgdHlwZS5cbiAqXG4gKiBAcGFyYW0ge05vZGV9IG5vZGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKiBAcmV0dXJuIHtGdW5jdGlvbnxudWxsfVxuICovXG5cbmZ1bmN0aW9uIGNvbXBpbGVOb2RlIChub2RlLCBvcHRpb25zKSB7XG4gIHZhciB0eXBlID0gbm9kZS5ub2RlVHlwZVxuICBpZiAodHlwZSA9PT0gMSAmJiBub2RlLnRhZ05hbWUgIT09ICdTQ1JJUFQnKSB7XG4gICAgcmV0dXJuIGNvbXBpbGVFbGVtZW50KG5vZGUsIG9wdGlvbnMpXG4gIH0gZWxzZSBpZiAodHlwZSA9PT0gMyAmJiBjb25maWcuaW50ZXJwb2xhdGUgJiYgbm9kZS5kYXRhLnRyaW0oKSkge1xuICAgIHJldHVybiBjb21waWxlVGV4dE5vZGUobm9kZSwgb3B0aW9ucylcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gbnVsbFxuICB9XG59XG5cbi8qKlxuICogQ29tcGlsZSBhbiBlbGVtZW50IGFuZCByZXR1cm4gYSBub2RlTGlua0ZuLlxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKiBAcmV0dXJuIHtGdW5jdGlvbnxudWxsfVxuICovXG5cbmZ1bmN0aW9uIGNvbXBpbGVFbGVtZW50IChlbCwgb3B0aW9ucykge1xuICBpZiAoY2hlY2tUcmFuc2NsdXNpb24oZWwpKSB7XG4gICAgLy8gdW53cmFwIHRleHROb2RlXG4gICAgaWYgKGVsLmhhc0F0dHJpYnV0ZSgnX192dWVfX3dyYXAnKSkge1xuICAgICAgZWwgPSBlbC5maXJzdENoaWxkXG4gICAgfVxuICAgIHJldHVybiBjb21waWxlKGVsLCBvcHRpb25zLl9wYXJlbnQuJG9wdGlvbnMsIHRydWUsIHRydWUpXG4gIH1cbiAgdmFyIGxpbmtGbiwgdGFnLCBjb21wb25lbnRcbiAgLy8gY2hlY2sgY3VzdG9tIGVsZW1lbnQgY29tcG9uZW50LCBidXQgb25seSBvbiBub24tcm9vdFxuICBpZiAoIWVsLl9fdnVlX18pIHtcbiAgICB0YWcgPSBlbC50YWdOYW1lLnRvTG93ZXJDYXNlKClcbiAgICBjb21wb25lbnQgPVxuICAgICAgdGFnLmluZGV4T2YoJy0nKSA+IDAgJiZcbiAgICAgIG9wdGlvbnMuY29tcG9uZW50c1t0YWddXG4gICAgaWYgKGNvbXBvbmVudCkge1xuICAgICAgZWwuc2V0QXR0cmlidXRlKGNvbmZpZy5wcmVmaXggKyAnY29tcG9uZW50JywgdGFnKVxuICAgIH1cbiAgfVxuICBpZiAoY29tcG9uZW50IHx8IGVsLmhhc0F0dHJpYnV0ZXMoKSkge1xuICAgIC8vIGNoZWNrIHRlcm1pbmFsIGRpcmVjaXR2ZXNcbiAgICBsaW5rRm4gPSBjaGVja1Rlcm1pbmFsRGlyZWN0aXZlcyhlbCwgb3B0aW9ucylcbiAgICAvLyBpZiBub3QgdGVybWluYWwsIGJ1aWxkIG5vcm1hbCBsaW5rIGZ1bmN0aW9uXG4gICAgaWYgKCFsaW5rRm4pIHtcbiAgICAgIHZhciBkaXJzID0gY29sbGVjdERpcmVjdGl2ZXMoZWwsIG9wdGlvbnMpXG4gICAgICBsaW5rRm4gPSBkaXJzLmxlbmd0aFxuICAgICAgICA/IG1ha2VOb2RlTGlua0ZuKGRpcnMpXG4gICAgICAgIDogbnVsbFxuICAgIH1cbiAgfVxuICAvLyBpZiB0aGUgZWxlbWVudCBpcyBhIHRleHRhcmVhLCB3ZSBuZWVkIHRvIGludGVycG9sYXRlXG4gIC8vIGl0cyBjb250ZW50IG9uIGluaXRpYWwgcmVuZGVyLlxuICBpZiAoZWwudGFnTmFtZSA9PT0gJ1RFWFRBUkVBJykge1xuICAgIHZhciByZWFsTGlua0ZuID0gbGlua0ZuXG4gICAgbGlua0ZuID0gZnVuY3Rpb24gKHZtLCBlbCkge1xuICAgICAgZWwudmFsdWUgPSB2bS4kaW50ZXJwb2xhdGUoZWwudmFsdWUpXG4gICAgICBpZiAocmVhbExpbmtGbikgcmVhbExpbmtGbih2bSwgZWwpXG4gICAgfVxuICAgIGxpbmtGbi50ZXJtaW5hbCA9IHRydWVcbiAgfVxuICByZXR1cm4gbGlua0ZuXG59XG5cbi8qKlxuICogQnVpbGQgYSBsaW5rIGZ1bmN0aW9uIGZvciBhbGwgZGlyZWN0aXZlcyBvbiBhIHNpbmdsZSBub2RlLlxuICpcbiAqIEBwYXJhbSB7QXJyYXl9IGRpcmVjdGl2ZXNcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufSBkaXJlY3RpdmVzTGlua0ZuXG4gKi9cblxuZnVuY3Rpb24gbWFrZU5vZGVMaW5rRm4gKGRpcmVjdGl2ZXMpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIG5vZGVMaW5rRm4gKHZtLCBlbCwgaG9zdCkge1xuICAgIC8vIHJldmVyc2UgYXBwbHkgYmVjYXVzZSBpdCdzIHNvcnRlZCBsb3cgdG8gaGlnaFxuICAgIHZhciBpID0gZGlyZWN0aXZlcy5sZW5ndGhcbiAgICB2YXIgZGlyLCBqLCBrLCB0YXJnZXRcbiAgICB3aGlsZSAoaS0tKSB7XG4gICAgICBkaXIgPSBkaXJlY3RpdmVzW2ldXG4gICAgICAvLyBhIGRpcmVjdGl2ZSBjYW4gYmUgdHJhbnNjbHVkZWQgaWYgaXQncyB3cml0dGVuXG4gICAgICAvLyBvbiBhIGNvbXBvbmVudCdzIGNvbnRhaW5lciBpbiBpdHMgcGFyZW50IHRlbXBhbHRlLlxuICAgICAgdGFyZ2V0ID0gZGlyLnRyYW5zY2x1ZGVkXG4gICAgICAgID8gdm0uJHBhcmVudFxuICAgICAgICA6IHZtXG4gICAgICBpZiAoZGlyLl9saW5rKSB7XG4gICAgICAgIC8vIGN1c3RvbSBsaW5rIGZuXG4gICAgICAgIGRpci5fbGluayh0YXJnZXQsIGVsKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgayA9IGRpci5kZXNjcmlwdG9ycy5sZW5ndGhcbiAgICAgICAgZm9yIChqID0gMDsgaiA8IGs7IGorKykge1xuICAgICAgICAgIHRhcmdldC5fYmluZERpcihkaXIubmFtZSwgZWwsXG4gICAgICAgICAgICBkaXIuZGVzY3JpcHRvcnNbal0sIGRpci5kZWYsIGhvc3QpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBDb21waWxlIGEgdGV4dE5vZGUgYW5kIHJldHVybiBhIG5vZGVMaW5rRm4uXG4gKlxuICogQHBhcmFtIHtUZXh0Tm9kZX0gbm9kZVxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufG51bGx9IHRleHROb2RlTGlua0ZuXG4gKi9cblxuZnVuY3Rpb24gY29tcGlsZVRleHROb2RlIChub2RlLCBvcHRpb25zKSB7XG4gIHZhciB0b2tlbnMgPSB0ZXh0UGFyc2VyLnBhcnNlKG5vZGUuZGF0YSlcbiAgaWYgKCF0b2tlbnMpIHtcbiAgICByZXR1cm4gbnVsbFxuICB9XG4gIHZhciBmcmFnID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpXG4gIHZhciBlbCwgdG9rZW5cbiAgZm9yICh2YXIgaSA9IDAsIGwgPSB0b2tlbnMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgdG9rZW4gPSB0b2tlbnNbaV1cbiAgICBlbCA9IHRva2VuLnRhZ1xuICAgICAgPyBwcm9jZXNzVGV4dFRva2VuKHRva2VuLCBvcHRpb25zKVxuICAgICAgOiBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSh0b2tlbi52YWx1ZSlcbiAgICBmcmFnLmFwcGVuZENoaWxkKGVsKVxuICB9XG4gIHJldHVybiBtYWtlVGV4dE5vZGVMaW5rRm4odG9rZW5zLCBmcmFnLCBvcHRpb25zKVxufVxuXG4vKipcbiAqIFByb2Nlc3MgYSBzaW5nbGUgdGV4dCB0b2tlbi5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdG9rZW5cbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKiBAcmV0dXJuIHtOb2RlfVxuICovXG5cbmZ1bmN0aW9uIHByb2Nlc3NUZXh0VG9rZW4gKHRva2VuLCBvcHRpb25zKSB7XG4gIHZhciBlbFxuICBpZiAodG9rZW4ub25lVGltZSkge1xuICAgIGVsID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUodG9rZW4udmFsdWUpXG4gIH0gZWxzZSB7XG4gICAgaWYgKHRva2VuLmh0bWwpIHtcbiAgICAgIGVsID0gZG9jdW1lbnQuY3JlYXRlQ29tbWVudCgndi1odG1sJylcbiAgICAgIHNldFRva2VuVHlwZSgnaHRtbCcpXG4gICAgfSBlbHNlIGlmICh0b2tlbi5wYXJ0aWFsKSB7XG4gICAgICBlbCA9IGRvY3VtZW50LmNyZWF0ZUNvbW1lbnQoJ3YtcGFydGlhbCcpXG4gICAgICBzZXRUb2tlblR5cGUoJ3BhcnRpYWwnKVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBJRSB3aWxsIGNsZWFuIHVwIGVtcHR5IHRleHROb2RlcyBkdXJpbmdcbiAgICAgIC8vIGZyYWcuY2xvbmVOb2RlKHRydWUpLCBzbyB3ZSBoYXZlIHRvIGdpdmUgaXRcbiAgICAgIC8vIHNvbWV0aGluZyBoZXJlLi4uXG4gICAgICBlbCA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKCcgJylcbiAgICAgIHNldFRva2VuVHlwZSgndGV4dCcpXG4gICAgfVxuICB9XG4gIGZ1bmN0aW9uIHNldFRva2VuVHlwZSAodHlwZSkge1xuICAgIHRva2VuLnR5cGUgPSB0eXBlXG4gICAgdG9rZW4uZGVmID0gb3B0aW9ucy5kaXJlY3RpdmVzW3R5cGVdXG4gICAgdG9rZW4uZGVzY3JpcHRvciA9IGRpclBhcnNlci5wYXJzZSh0b2tlbi52YWx1ZSlbMF1cbiAgfVxuICByZXR1cm4gZWxcbn1cblxuLyoqXG4gKiBCdWlsZCBhIGZ1bmN0aW9uIHRoYXQgcHJvY2Vzc2VzIGEgdGV4dE5vZGUuXG4gKlxuICogQHBhcmFtIHtBcnJheTxPYmplY3Q+fSB0b2tlbnNcbiAqIEBwYXJhbSB7RG9jdW1lbnRGcmFnbWVudH0gZnJhZ1xuICovXG5cbmZ1bmN0aW9uIG1ha2VUZXh0Tm9kZUxpbmtGbiAodG9rZW5zLCBmcmFnKSB7XG4gIHJldHVybiBmdW5jdGlvbiB0ZXh0Tm9kZUxpbmtGbiAodm0sIGVsKSB7XG4gICAgdmFyIGZyYWdDbG9uZSA9IGZyYWcuY2xvbmVOb2RlKHRydWUpXG4gICAgdmFyIGNoaWxkTm9kZXMgPSBfLnRvQXJyYXkoZnJhZ0Nsb25lLmNoaWxkTm9kZXMpXG4gICAgdmFyIHRva2VuLCB2YWx1ZSwgbm9kZVxuICAgIGZvciAodmFyIGkgPSAwLCBsID0gdG9rZW5zLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgdG9rZW4gPSB0b2tlbnNbaV1cbiAgICAgIHZhbHVlID0gdG9rZW4udmFsdWVcbiAgICAgIGlmICh0b2tlbi50YWcpIHtcbiAgICAgICAgbm9kZSA9IGNoaWxkTm9kZXNbaV1cbiAgICAgICAgaWYgKHRva2VuLm9uZVRpbWUpIHtcbiAgICAgICAgICB2YWx1ZSA9IHZtLiRldmFsKHZhbHVlKVxuICAgICAgICAgIGlmICh0b2tlbi5odG1sKSB7XG4gICAgICAgICAgICBfLnJlcGxhY2Uobm9kZSwgdGVtcGxhdGVQYXJzZXIucGFyc2UodmFsdWUsIHRydWUpKVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBub2RlLmRhdGEgPSB2YWx1ZVxuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB2bS5fYmluZERpcih0b2tlbi50eXBlLCBub2RlLFxuICAgICAgICAgICAgICAgICAgICAgIHRva2VuLmRlc2NyaXB0b3IsIHRva2VuLmRlZilcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBfLnJlcGxhY2UoZWwsIGZyYWdDbG9uZSlcbiAgfVxufVxuXG4vKipcbiAqIENvbXBpbGUgYSBub2RlIGxpc3QgYW5kIHJldHVybiBhIGNoaWxkTGlua0ZuLlxuICpcbiAqIEBwYXJhbSB7Tm9kZUxpc3R9IG5vZGVMaXN0XG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICogQHJldHVybiB7RnVuY3Rpb258dW5kZWZpbmVkfVxuICovXG5cbmZ1bmN0aW9uIGNvbXBpbGVOb2RlTGlzdCAobm9kZUxpc3QsIG9wdGlvbnMpIHtcbiAgdmFyIGxpbmtGbnMgPSBbXVxuICB2YXIgbm9kZUxpbmtGbiwgY2hpbGRMaW5rRm4sIG5vZGVcbiAgZm9yICh2YXIgaSA9IDAsIGwgPSBub2RlTGlzdC5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICBub2RlID0gbm9kZUxpc3RbaV1cbiAgICBub2RlTGlua0ZuID0gY29tcGlsZU5vZGUobm9kZSwgb3B0aW9ucylcbiAgICBjaGlsZExpbmtGbiA9XG4gICAgICAhKG5vZGVMaW5rRm4gJiYgbm9kZUxpbmtGbi50ZXJtaW5hbCkgJiZcbiAgICAgIG5vZGUudGFnTmFtZSAhPT0gJ1NDUklQVCcgJiZcbiAgICAgIG5vZGUuaGFzQ2hpbGROb2RlcygpXG4gICAgICAgID8gY29tcGlsZU5vZGVMaXN0KG5vZGUuY2hpbGROb2Rlcywgb3B0aW9ucylcbiAgICAgICAgOiBudWxsXG4gICAgbGlua0Zucy5wdXNoKG5vZGVMaW5rRm4sIGNoaWxkTGlua0ZuKVxuICB9XG4gIHJldHVybiBsaW5rRm5zLmxlbmd0aFxuICAgID8gbWFrZUNoaWxkTGlua0ZuKGxpbmtGbnMpXG4gICAgOiBudWxsXG59XG5cbi8qKlxuICogTWFrZSBhIGNoaWxkIGxpbmsgZnVuY3Rpb24gZm9yIGEgbm9kZSdzIGNoaWxkTm9kZXMuXG4gKlxuICogQHBhcmFtIHtBcnJheTxGdW5jdGlvbj59IGxpbmtGbnNcbiAqIEByZXR1cm4ge0Z1bmN0aW9ufSBjaGlsZExpbmtGblxuICovXG5cbmZ1bmN0aW9uIG1ha2VDaGlsZExpbmtGbiAobGlua0Zucykge1xuICByZXR1cm4gZnVuY3Rpb24gY2hpbGRMaW5rRm4gKHZtLCBub2RlcywgaG9zdCkge1xuICAgIHZhciBub2RlLCBub2RlTGlua0ZuLCBjaGlsZHJlbkxpbmtGblxuICAgIGZvciAodmFyIGkgPSAwLCBuID0gMCwgbCA9IGxpbmtGbnMubGVuZ3RoOyBpIDwgbDsgbisrKSB7XG4gICAgICBub2RlID0gbm9kZXNbbl1cbiAgICAgIG5vZGVMaW5rRm4gPSBsaW5rRm5zW2krK11cbiAgICAgIGNoaWxkcmVuTGlua0ZuID0gbGlua0Zuc1tpKytdXG4gICAgICAvLyBjYWNoZSBjaGlsZE5vZGVzIGJlZm9yZSBsaW5raW5nIHBhcmVudCwgZml4ICM2NTdcbiAgICAgIHZhciBjaGlsZE5vZGVzID0gXy50b0FycmF5KG5vZGUuY2hpbGROb2RlcylcbiAgICAgIGlmIChub2RlTGlua0ZuKSB7XG4gICAgICAgIG5vZGVMaW5rRm4odm0sIG5vZGUsIGhvc3QpXG4gICAgICB9XG4gICAgICBpZiAoY2hpbGRyZW5MaW5rRm4pIHtcbiAgICAgICAgY2hpbGRyZW5MaW5rRm4odm0sIGNoaWxkTm9kZXMsIGhvc3QpXG4gICAgICB9XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogQ29tcGlsZSBwYXJhbSBhdHRyaWJ1dGVzIG9uIGEgcm9vdCBlbGVtZW50IGFuZCByZXR1cm5cbiAqIGEgcGFyYW1BdHRyaWJ1dGVzIGxpbmsgZnVuY3Rpb24uXG4gKlxuICogQHBhcmFtIHtFbGVtZW50fE9iamVjdH0gZWxcbiAqIEBwYXJhbSB7QXJyYXl9IGF0dHJzXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICogQHJldHVybiB7RnVuY3Rpb259IHBhcmFtc0xpbmtGblxuICovXG5cbmZ1bmN0aW9uIGNvbXBpbGVQYXJhbUF0dHJpYnV0ZXMgKGVsLCBhdHRycywgb3B0aW9ucykge1xuICB2YXIgcGFyYW1zID0gW11cbiAgdmFyIGlzRWwgPSBlbC5ub2RlVHlwZVxuICB2YXIgaSA9IGF0dHJzLmxlbmd0aFxuICB2YXIgbmFtZSwgdmFsdWUsIHBhcmFtXG4gIHdoaWxlIChpLS0pIHtcbiAgICBuYW1lID0gYXR0cnNbaV1cbiAgICBpZiAoL1tBLVpdLy50ZXN0KG5hbWUpKSB7XG4gICAgICBfLndhcm4oXG4gICAgICAgICdZb3Ugc2VlbSB0byBiZSB1c2luZyBjYW1lbENhc2UgZm9yIGEgcGFyYW1BdHRyaWJ1dGUsICcgK1xuICAgICAgICAnYnV0IEhUTUwgZG9lc25cXCd0IGRpZmZlcmVudGlhdGUgYmV0d2VlbiB1cHBlciBhbmQgJyArXG4gICAgICAgICdsb3dlciBjYXNlLiBZb3Ugc2hvdWxkIHVzZSBoeXBoZW4tZGVsaW1pdGVkICcgK1xuICAgICAgICAnYXR0cmlidXRlIG5hbWVzLiBGb3IgbW9yZSBpbmZvIHNlZSAnICtcbiAgICAgICAgJ2h0dHA6Ly92dWVqcy5vcmcvYXBpL29wdGlvbnMuaHRtbCNwYXJhbUF0dHJpYnV0ZXMnXG4gICAgICApXG4gICAgfVxuICAgIHZhbHVlID0gaXNFbCA/IGVsLmdldEF0dHJpYnV0ZShuYW1lKSA6IGVsW25hbWVdXG4gICAgaWYgKHZhbHVlICE9PSBudWxsKSB7XG4gICAgICBwYXJhbSA9IHtcbiAgICAgICAgbmFtZTogbmFtZSxcbiAgICAgICAgdmFsdWU6IHZhbHVlXG4gICAgICB9XG4gICAgICB2YXIgdG9rZW5zID0gdGV4dFBhcnNlci5wYXJzZSh2YWx1ZSlcbiAgICAgIGlmICh0b2tlbnMpIHtcbiAgICAgICAgaWYgKGlzRWwpIGVsLnJlbW92ZUF0dHJpYnV0ZShuYW1lKVxuICAgICAgICBpZiAodG9rZW5zLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICBfLndhcm4oXG4gICAgICAgICAgICAnSW52YWxpZCBwYXJhbSBhdHRyaWJ1dGUgYmluZGluZzogXCInICtcbiAgICAgICAgICAgIG5hbWUgKyAnPVwiJyArIHZhbHVlICsgJ1wiJyArXG4gICAgICAgICAgICAnXFxuRG9uXFwndCBtaXggYmluZGluZyB0YWdzIHdpdGggcGxhaW4gdGV4dCAnICtcbiAgICAgICAgICAgICdpbiBwYXJhbSBhdHRyaWJ1dGUgYmluZGluZ3MuJ1xuICAgICAgICAgIClcbiAgICAgICAgICBjb250aW51ZVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHBhcmFtLmR5bmFtaWMgPSB0cnVlXG4gICAgICAgICAgcGFyYW0udmFsdWUgPSB0b2tlbnNbMF0udmFsdWVcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcGFyYW1zLnB1c2gocGFyYW0pXG4gICAgfVxuICB9XG4gIHJldHVybiBtYWtlUGFyYW1zTGlua0ZuKHBhcmFtcywgb3B0aW9ucylcbn1cblxuLyoqXG4gKiBCdWlsZCBhIGZ1bmN0aW9uIHRoYXQgYXBwbGllcyBwYXJhbSBhdHRyaWJ1dGVzIHRvIGEgdm0uXG4gKlxuICogQHBhcmFtIHtBcnJheX0gcGFyYW1zXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICogQHJldHVybiB7RnVuY3Rpb259IHBhcmFtc0xpbmtGblxuICovXG5cbnZhciBkYXRhQXR0clJFID0gL15kYXRhLS9cblxuZnVuY3Rpb24gbWFrZVBhcmFtc0xpbmtGbiAocGFyYW1zLCBvcHRpb25zKSB7XG4gIHZhciBkZWYgPSBvcHRpb25zLmRpcmVjdGl2ZXNbJ3dpdGgnXVxuICByZXR1cm4gZnVuY3Rpb24gcGFyYW1zTGlua0ZuICh2bSwgZWwpIHtcbiAgICB2YXIgaSA9IHBhcmFtcy5sZW5ndGhcbiAgICB2YXIgcGFyYW0sIHBhdGhcbiAgICB3aGlsZSAoaS0tKSB7XG4gICAgICBwYXJhbSA9IHBhcmFtc1tpXVxuICAgICAgLy8gcGFyYW1zIGNvdWxkIGNvbnRhaW4gZGFzaGVzLCB3aGljaCB3aWxsIGJlXG4gICAgICAvLyBpbnRlcnByZXRlZCBhcyBtaW51cyBjYWxjdWxhdGlvbnMgYnkgdGhlIHBhcnNlclxuICAgICAgLy8gc28gd2UgbmVlZCB0byB3cmFwIHRoZSBwYXRoIGhlcmVcbiAgICAgIHBhdGggPSBfLmNhbWVsaXplKHBhcmFtLm5hbWUucmVwbGFjZShkYXRhQXR0clJFLCAnJykpXG4gICAgICBpZiAocGFyYW0uZHluYW1pYykge1xuICAgICAgICAvLyBkeW5hbWljIHBhcmFtIGF0dHJpYnR1ZXMgYXJlIGJvdW5kIGFzIHYtd2l0aC5cbiAgICAgICAgLy8gd2UgY2FuIGRpcmVjdGx5IGR1Y2sgdGhlIGRlc2NyaXB0b3IgaGVyZSBiZWFjdXNlXG4gICAgICAgIC8vIHBhcmFtIGF0dHJpYnV0ZXMgY2Fubm90IHVzZSBleHByZXNzaW9ucyBvclxuICAgICAgICAvLyBmaWx0ZXJzLlxuICAgICAgICB2bS5fYmluZERpcignd2l0aCcsIGVsLCB7XG4gICAgICAgICAgYXJnOiBwYXRoLFxuICAgICAgICAgIGV4cHJlc3Npb246IHBhcmFtLnZhbHVlXG4gICAgICAgIH0sIGRlZilcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIGp1c3Qgc2V0IG9uY2VcbiAgICAgICAgdm0uJHNldChwYXRoLCBwYXJhbS52YWx1ZSlcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBDaGVjayBhbiBlbGVtZW50IGZvciB0ZXJtaW5hbCBkaXJlY3RpdmVzIGluIGZpeGVkIG9yZGVyLlxuICogSWYgaXQgZmluZHMgb25lLCByZXR1cm4gYSB0ZXJtaW5hbCBsaW5rIGZ1bmN0aW9uLlxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn0gdGVybWluYWxMaW5rRm5cbiAqL1xuXG52YXIgdGVybWluYWxEaXJlY3RpdmVzID0gW1xuICAncmVwZWF0JyxcbiAgJ2lmJyxcbiAgJ2NvbXBvbmVudCdcbl1cblxuZnVuY3Rpb24gc2tpcCAoKSB7fVxuc2tpcC50ZXJtaW5hbCA9IHRydWVcblxuZnVuY3Rpb24gY2hlY2tUZXJtaW5hbERpcmVjdGl2ZXMgKGVsLCBvcHRpb25zKSB7XG4gIGlmIChfLmF0dHIoZWwsICdwcmUnKSAhPT0gbnVsbCkge1xuICAgIHJldHVybiBza2lwXG4gIH1cbiAgdmFyIHZhbHVlLCBkaXJOYW1lXG4gIC8qIGpzaGludCBib3NzOiB0cnVlICovXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgMzsgaSsrKSB7XG4gICAgZGlyTmFtZSA9IHRlcm1pbmFsRGlyZWN0aXZlc1tpXVxuICAgIGlmICh2YWx1ZSA9IF8uYXR0cihlbCwgZGlyTmFtZSkpIHtcbiAgICAgIHJldHVybiBtYWtlVGVybWluYWxOb2RlTGlua0ZuKGVsLCBkaXJOYW1lLCB2YWx1ZSwgb3B0aW9ucylcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBCdWlsZCBhIG5vZGUgbGluayBmdW5jdGlvbiBmb3IgYSB0ZXJtaW5hbCBkaXJlY3RpdmUuXG4gKiBBIHRlcm1pbmFsIGxpbmsgZnVuY3Rpb24gdGVybWluYXRlcyB0aGUgY3VycmVudFxuICogY29tcGlsYXRpb24gcmVjdXJzaW9uIGFuZCBoYW5kbGVzIGNvbXBpbGF0aW9uIG9mIHRoZVxuICogc3VidHJlZSBpbiB0aGUgZGlyZWN0aXZlLlxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxcbiAqIEBwYXJhbSB7U3RyaW5nfSBkaXJOYW1lXG4gKiBAcGFyYW0ge1N0cmluZ30gdmFsdWVcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn0gdGVybWluYWxMaW5rRm5cbiAqL1xuXG5mdW5jdGlvbiBtYWtlVGVybWluYWxOb2RlTGlua0ZuIChlbCwgZGlyTmFtZSwgdmFsdWUsIG9wdGlvbnMpIHtcbiAgdmFyIGRlc2NyaXB0b3IgPSBkaXJQYXJzZXIucGFyc2UodmFsdWUpWzBdXG4gIHZhciBkZWYgPSBvcHRpb25zLmRpcmVjdGl2ZXNbZGlyTmFtZV1cbiAgdmFyIGZuID0gZnVuY3Rpb24gdGVybWluYWxOb2RlTGlua0ZuICh2bSwgZWwsIGhvc3QpIHtcbiAgICB2bS5fYmluZERpcihkaXJOYW1lLCBlbCwgZGVzY3JpcHRvciwgZGVmLCBob3N0KVxuICB9XG4gIGZuLnRlcm1pbmFsID0gdHJ1ZVxuICByZXR1cm4gZm5cbn1cblxuLyoqXG4gKiBDb2xsZWN0IHRoZSBkaXJlY3RpdmVzIG9uIGFuIGVsZW1lbnQuXG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBlbFxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqIEByZXR1cm4ge0FycmF5fVxuICovXG5cbmZ1bmN0aW9uIGNvbGxlY3REaXJlY3RpdmVzIChlbCwgb3B0aW9ucykge1xuICB2YXIgYXR0cnMgPSBfLnRvQXJyYXkoZWwuYXR0cmlidXRlcylcbiAgdmFyIGkgPSBhdHRycy5sZW5ndGhcbiAgdmFyIGRpcnMgPSBbXVxuICB2YXIgYXR0ciwgYXR0ck5hbWUsIGRpciwgZGlyTmFtZSwgZGlyRGVmLCB0cmFuc2NsdWRlZFxuICB3aGlsZSAoaS0tKSB7XG4gICAgYXR0ciA9IGF0dHJzW2ldXG4gICAgYXR0ck5hbWUgPSBhdHRyLm5hbWVcbiAgICB0cmFuc2NsdWRlZCA9XG4gICAgICBvcHRpb25zLl90cmFuc2NsdWRlZEF0dHJzICYmXG4gICAgICBvcHRpb25zLl90cmFuc2NsdWRlZEF0dHJzW2F0dHJOYW1lXVxuICAgIGlmIChhdHRyTmFtZS5pbmRleE9mKGNvbmZpZy5wcmVmaXgpID09PSAwKSB7XG4gICAgICBkaXJOYW1lID0gYXR0ck5hbWUuc2xpY2UoY29uZmlnLnByZWZpeC5sZW5ndGgpXG4gICAgICBkaXJEZWYgPSBvcHRpb25zLmRpcmVjdGl2ZXNbZGlyTmFtZV1cbiAgICAgIF8uYXNzZXJ0QXNzZXQoZGlyRGVmLCAnZGlyZWN0aXZlJywgZGlyTmFtZSlcbiAgICAgIGlmIChkaXJEZWYpIHtcbiAgICAgICAgZGlycy5wdXNoKHtcbiAgICAgICAgICBuYW1lOiBkaXJOYW1lLFxuICAgICAgICAgIGRlc2NyaXB0b3JzOiBkaXJQYXJzZXIucGFyc2UoYXR0ci52YWx1ZSksXG4gICAgICAgICAgZGVmOiBkaXJEZWYsXG4gICAgICAgICAgdHJhbnNjbHVkZWQ6IHRyYW5zY2x1ZGVkXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChjb25maWcuaW50ZXJwb2xhdGUpIHtcbiAgICAgIGRpciA9IGNvbGxlY3RBdHRyRGlyZWN0aXZlKGVsLCBhdHRyTmFtZSwgYXR0ci52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnMpXG4gICAgICBpZiAoZGlyKSB7XG4gICAgICAgIGRpci50cmFuc2NsdWRlZCA9IHRyYW5zY2x1ZGVkXG4gICAgICAgIGRpcnMucHVzaChkaXIpXG4gICAgICB9XG4gICAgfVxuICB9XG4gIC8vIHNvcnQgYnkgcHJpb3JpdHksIExPVyB0byBISUdIXG4gIGRpcnMuc29ydChkaXJlY3RpdmVDb21wYXJhdG9yKVxuICByZXR1cm4gZGlyc1xufVxuXG4vKipcbiAqIENoZWNrIGFuIGF0dHJpYnV0ZSBmb3IgcG90ZW50aWFsIGR5bmFtaWMgYmluZGluZ3MsXG4gKiBhbmQgcmV0dXJuIGEgZGlyZWN0aXZlIG9iamVjdC5cbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICogQHBhcmFtIHtTdHJpbmd9IHZhbHVlXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICogQHJldHVybiB7T2JqZWN0fVxuICovXG5cbmZ1bmN0aW9uIGNvbGxlY3RBdHRyRGlyZWN0aXZlIChlbCwgbmFtZSwgdmFsdWUsIG9wdGlvbnMpIHtcbiAgdmFyIHRva2VucyA9IHRleHRQYXJzZXIucGFyc2UodmFsdWUpXG4gIGlmICh0b2tlbnMpIHtcbiAgICB2YXIgZGVmID0gb3B0aW9ucy5kaXJlY3RpdmVzLmF0dHJcbiAgICB2YXIgaSA9IHRva2Vucy5sZW5ndGhcbiAgICB2YXIgYWxsT25lVGltZSA9IHRydWVcbiAgICB3aGlsZSAoaS0tKSB7XG4gICAgICB2YXIgdG9rZW4gPSB0b2tlbnNbaV1cbiAgICAgIGlmICh0b2tlbi50YWcgJiYgIXRva2VuLm9uZVRpbWUpIHtcbiAgICAgICAgYWxsT25lVGltZSA9IGZhbHNlXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICBkZWY6IGRlZixcbiAgICAgIF9saW5rOiBhbGxPbmVUaW1lXG4gICAgICAgID8gZnVuY3Rpb24gKHZtLCBlbCkge1xuICAgICAgICAgICAgZWwuc2V0QXR0cmlidXRlKG5hbWUsIHZtLiRpbnRlcnBvbGF0ZSh2YWx1ZSkpXG4gICAgICAgICAgfVxuICAgICAgICA6IGZ1bmN0aW9uICh2bSwgZWwpIHtcbiAgICAgICAgICAgIHZhciB2YWx1ZSA9IHRleHRQYXJzZXIudG9rZW5zVG9FeHAodG9rZW5zLCB2bSlcbiAgICAgICAgICAgIHZhciBkZXNjID0gZGlyUGFyc2VyLnBhcnNlKG5hbWUgKyAnOicgKyB2YWx1ZSlbMF1cbiAgICAgICAgICAgIHZtLl9iaW5kRGlyKCdhdHRyJywgZWwsIGRlc2MsIGRlZilcbiAgICAgICAgICB9XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogRGlyZWN0aXZlIHByaW9yaXR5IHNvcnQgY29tcGFyYXRvclxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBhXG4gKiBAcGFyYW0ge09iamVjdH0gYlxuICovXG5cbmZ1bmN0aW9uIGRpcmVjdGl2ZUNvbXBhcmF0b3IgKGEsIGIpIHtcbiAgYSA9IGEuZGVmLnByaW9yaXR5IHx8IDBcbiAgYiA9IGIuZGVmLnByaW9yaXR5IHx8IDBcbiAgcmV0dXJuIGEgPiBiID8gMSA6IC0xXG59XG5cbi8qKlxuICogQ2hlY2sgd2hldGhlciBhbiBlbGVtZW50IGlzIHRyYW5zY2x1ZGVkXG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBlbFxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqL1xuXG52YXIgdHJhbnNjbHVkZWRGbGFnQXR0ciA9ICdfX3Z1ZV9fdHJhbnNjbHVkZWQnXG5mdW5jdGlvbiBjaGVja1RyYW5zY2x1c2lvbiAoZWwpIHtcbiAgaWYgKGVsLm5vZGVUeXBlID09PSAxICYmIGVsLmhhc0F0dHJpYnV0ZSh0cmFuc2NsdWRlZEZsYWdBdHRyKSkge1xuICAgIGVsLnJlbW92ZUF0dHJpYnV0ZSh0cmFuc2NsdWRlZEZsYWdBdHRyKVxuICAgIHJldHVybiB0cnVlXG4gIH1cbn0iLCJ2YXIgXyA9IHJlcXVpcmUoJy4uL3V0aWwnKVxudmFyIGNvbmZpZyA9IHJlcXVpcmUoJy4uL2NvbmZpZycpXG52YXIgdGVtcGxhdGVQYXJzZXIgPSByZXF1aXJlKCcuLi9wYXJzZXJzL3RlbXBsYXRlJylcbnZhciB0cmFuc2NsdWRlZEZsYWdBdHRyID0gJ19fdnVlX190cmFuc2NsdWRlZCdcblxuLyoqXG4gKiBQcm9jZXNzIGFuIGVsZW1lbnQgb3IgYSBEb2N1bWVudEZyYWdtZW50IGJhc2VkIG9uIGFcbiAqIGluc3RhbmNlIG9wdGlvbiBvYmplY3QuIFRoaXMgYWxsb3dzIHVzIHRvIHRyYW5zY2x1ZGVcbiAqIGEgdGVtcGxhdGUgbm9kZS9mcmFnbWVudCBiZWZvcmUgdGhlIGluc3RhbmNlIGlzIGNyZWF0ZWQsXG4gKiBzbyB0aGUgcHJvY2Vzc2VkIGZyYWdtZW50IGNhbiB0aGVuIGJlIGNsb25lZCBhbmQgcmV1c2VkXG4gKiBpbiB2LXJlcGVhdC5cbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICogQHJldHVybiB7RWxlbWVudHxEb2N1bWVudEZyYWdtZW50fVxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gdHJhbnNjbHVkZSAoZWwsIG9wdGlvbnMpIHtcbiAgaWYgKG9wdGlvbnMgJiYgb3B0aW9ucy5fYXNDb21wb25lbnQpIHtcbiAgICAvLyBtdXRhdGluZyB0aGUgb3B0aW9ucyBvYmplY3QgaGVyZSBhc3N1bWluZyB0aGUgc2FtZVxuICAgIC8vIG9iamVjdCB3aWxsIGJlIHVzZWQgZm9yIGNvbXBpbGUgcmlnaHQgYWZ0ZXIgdGhpc1xuICAgIG9wdGlvbnMuX3RyYW5zY2x1ZGVkQXR0cnMgPSBleHRyYWN0QXR0cnMoZWwuYXR0cmlidXRlcylcbiAgICAvLyBNYXJrIGNvbnRlbnQgbm9kZXMgYW5kIGF0dHJzIHNvIHRoYXQgdGhlIGNvbXBpbGVyXG4gICAgLy8ga25vd3MgdGhleSBzaG91bGQgYmUgY29tcGlsZWQgaW4gcGFyZW50IHNjb3BlLlxuICAgIHZhciBpID0gZWwuY2hpbGROb2Rlcy5sZW5ndGhcbiAgICB3aGlsZSAoaS0tKSB7XG4gICAgICB2YXIgbm9kZSA9IGVsLmNoaWxkTm9kZXNbaV1cbiAgICAgIGlmIChub2RlLm5vZGVUeXBlID09PSAxKSB7XG4gICAgICAgIG5vZGUuc2V0QXR0cmlidXRlKHRyYW5zY2x1ZGVkRmxhZ0F0dHIsICcnKVxuICAgICAgfSBlbHNlIGlmIChub2RlLm5vZGVUeXBlID09PSAzICYmIG5vZGUuZGF0YS50cmltKCkpIHtcbiAgICAgICAgLy8gd3JhcCB0cmFuc2NsdWRlZCB0ZXh0Tm9kZXMgaW4gc3BhbnMsIGJlY2F1c2VcbiAgICAgICAgLy8gcmF3IHRleHROb2RlcyBjYW4ndCBiZSBwZXJzaXN0ZWQgdGhyb3VnaCBjbG9uZXNcbiAgICAgICAgLy8gYnkgYXR0YWNoaW5nIGF0dHJpYnV0ZXMuXG4gICAgICAgIHZhciB3cmFwcGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpXG4gICAgICAgIHdyYXBwZXIudGV4dENvbnRlbnQgPSBub2RlLmRhdGFcbiAgICAgICAgd3JhcHBlci5zZXRBdHRyaWJ1dGUoJ19fdnVlX193cmFwJywgJycpXG4gICAgICAgIHdyYXBwZXIuc2V0QXR0cmlidXRlKHRyYW5zY2x1ZGVkRmxhZ0F0dHIsICcnKVxuICAgICAgICBlbC5yZXBsYWNlQ2hpbGQod3JhcHBlciwgbm9kZSlcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgLy8gZm9yIHRlbXBsYXRlIHRhZ3MsIHdoYXQgd2Ugd2FudCBpcyBpdHMgY29udGVudCBhc1xuICAvLyBhIGRvY3VtZW50RnJhZ21lbnQgKGZvciBibG9jayBpbnN0YW5jZXMpXG4gIGlmIChlbC50YWdOYW1lID09PSAnVEVNUExBVEUnKSB7XG4gICAgZWwgPSB0ZW1wbGF0ZVBhcnNlci5wYXJzZShlbClcbiAgfVxuICBpZiAob3B0aW9ucyAmJiBvcHRpb25zLnRlbXBsYXRlKSB7XG4gICAgZWwgPSB0cmFuc2NsdWRlVGVtcGxhdGUoZWwsIG9wdGlvbnMpXG4gIH1cbiAgaWYgKGVsIGluc3RhbmNlb2YgRG9jdW1lbnRGcmFnbWVudCkge1xuICAgIF8ucHJlcGVuZChkb2N1bWVudC5jcmVhdGVDb21tZW50KCd2LXN0YXJ0JyksIGVsKVxuICAgIGVsLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZUNvbW1lbnQoJ3YtZW5kJykpXG4gIH1cbiAgcmV0dXJuIGVsXG59XG5cbi8qKlxuICogUHJvY2VzcyB0aGUgdGVtcGxhdGUgb3B0aW9uLlxuICogSWYgdGhlIHJlcGxhY2Ugb3B0aW9uIGlzIHRydWUgdGhpcyB3aWxsIHN3YXAgdGhlICRlbC5cbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICogQHJldHVybiB7RWxlbWVudHxEb2N1bWVudEZyYWdtZW50fVxuICovXG5cbmZ1bmN0aW9uIHRyYW5zY2x1ZGVUZW1wbGF0ZSAoZWwsIG9wdGlvbnMpIHtcbiAgdmFyIHRlbXBsYXRlID0gb3B0aW9ucy50ZW1wbGF0ZVxuICB2YXIgZnJhZyA9IHRlbXBsYXRlUGFyc2VyLnBhcnNlKHRlbXBsYXRlLCB0cnVlKVxuICBpZiAoIWZyYWcpIHtcbiAgICBfLndhcm4oJ0ludmFsaWQgdGVtcGxhdGUgb3B0aW9uOiAnICsgdGVtcGxhdGUpXG4gIH0gZWxzZSB7XG4gICAgdmFyIHJhd0NvbnRlbnQgPSBvcHRpb25zLl9jb250ZW50IHx8IF8uZXh0cmFjdENvbnRlbnQoZWwpXG4gICAgaWYgKG9wdGlvbnMucmVwbGFjZSkge1xuICAgICAgaWYgKGZyYWcuY2hpbGROb2Rlcy5sZW5ndGggPiAxKSB7XG4gICAgICAgIC8vIHRoaXMgaXMgYSBibG9jayBpbnN0YW5jZSB3aGljaCBoYXMgbm8gcm9vdCBub2RlLlxuICAgICAgICAvLyBob3dldmVyLCB0aGUgY29udGFpbmVyIGluIHRoZSBwYXJlbnQgdGVtcGxhdGVcbiAgICAgICAgLy8gKHdoaWNoIGlzIHJlcGxhY2VkIGhlcmUpIG1heSBjb250YWluIHYtd2l0aCBhbmRcbiAgICAgICAgLy8gcGFyYW1BdHRyaWJ1dGVzIHRoYXQgc3RpbGwgbmVlZCB0byBiZSBjb21waWxlZFxuICAgICAgICAvLyBmb3IgdGhlIGNoaWxkLiB3ZSBzdG9yZSBhbGwgdGhlIGNvbnRhaW5lclxuICAgICAgICAvLyBhdHRyaWJ1dGVzIG9uIHRoZSBvcHRpb25zIG9iamVjdCBhbmQgcGFzcyBpdCBkb3duXG4gICAgICAgIC8vIHRvIHRoZSBjb21waWxlci5cbiAgICAgICAgdmFyIGNvbnRhaW5lckF0dHJzID0gb3B0aW9ucy5fY29udGFpbmVyQXR0cnMgPSB7fVxuICAgICAgICB2YXIgaSA9IGVsLmF0dHJpYnV0ZXMubGVuZ3RoXG4gICAgICAgIHdoaWxlIChpLS0pIHtcbiAgICAgICAgICB2YXIgYXR0ciA9IGVsLmF0dHJpYnV0ZXNbaV1cbiAgICAgICAgICBjb250YWluZXJBdHRyc1thdHRyLm5hbWVdID0gYXR0ci52YWx1ZVxuICAgICAgICB9XG4gICAgICAgIHRyYW5zY2x1ZGVDb250ZW50KGZyYWcsIHJhd0NvbnRlbnQpXG4gICAgICAgIHJldHVybiBmcmFnXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgcmVwbGFjZXIgPSBmcmFnLmZpcnN0Q2hpbGRcbiAgICAgICAgXy5jb3B5QXR0cmlidXRlcyhlbCwgcmVwbGFjZXIpXG4gICAgICAgIHRyYW5zY2x1ZGVDb250ZW50KHJlcGxhY2VyLCByYXdDb250ZW50KVxuICAgICAgICByZXR1cm4gcmVwbGFjZXJcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgZWwuYXBwZW5kQ2hpbGQoZnJhZylcbiAgICAgIHRyYW5zY2x1ZGVDb250ZW50KGVsLCByYXdDb250ZW50KVxuICAgICAgcmV0dXJuIGVsXG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogUmVzb2x2ZSA8Y29udGVudD4gaW5zZXJ0aW9uIHBvaW50cyBtaW1pY2tpbmcgdGhlIGJlaGF2aW9yXG4gKiBvZiB0aGUgU2hhZG93IERPTSBzcGVjOlxuICpcbiAqICAgaHR0cDovL3czYy5naXRodWIuaW8vd2ViY29tcG9uZW50cy9zcGVjL3NoYWRvdy8jaW5zZXJ0aW9uLXBvaW50c1xuICpcbiAqIEBwYXJhbSB7RWxlbWVudHxEb2N1bWVudEZyYWdtZW50fSBlbFxuICogQHBhcmFtIHtFbGVtZW50fSByYXdcbiAqL1xuXG5mdW5jdGlvbiB0cmFuc2NsdWRlQ29udGVudCAoZWwsIHJhdykge1xuICB2YXIgb3V0bGV0cyA9IGdldE91dGxldHMoZWwpXG4gIHZhciBpID0gb3V0bGV0cy5sZW5ndGhcbiAgaWYgKCFpKSByZXR1cm5cbiAgdmFyIG91dGxldCwgc2VsZWN0LCBzZWxlY3RlZCwgaiwgbWFpblxuXG4gIGZ1bmN0aW9uIGlzRGlyZWN0Q2hpbGQgKG5vZGUpIHtcbiAgICByZXR1cm4gbm9kZS5wYXJlbnROb2RlID09PSByYXdcbiAgfVxuXG4gIC8vIGZpcnN0IHBhc3MsIGNvbGxlY3QgY29ycmVzcG9uZGluZyBjb250ZW50XG4gIC8vIGZvciBlYWNoIG91dGxldC5cbiAgd2hpbGUgKGktLSkge1xuICAgIG91dGxldCA9IG91dGxldHNbaV1cbiAgICBpZiAocmF3KSB7XG4gICAgICBzZWxlY3QgPSBvdXRsZXQuZ2V0QXR0cmlidXRlKCdzZWxlY3QnKVxuICAgICAgaWYgKHNlbGVjdCkgeyAgLy8gc2VsZWN0IGNvbnRlbnRcbiAgICAgICAgc2VsZWN0ZWQgPSByYXcucXVlcnlTZWxlY3RvckFsbChzZWxlY3QpXG4gICAgICAgIGlmIChzZWxlY3RlZC5sZW5ndGgpIHtcbiAgICAgICAgICAvLyBhY2NvcmRpbmcgdG8gU2hhZG93IERPTSBzcGVjLCBgc2VsZWN0YCBjYW5cbiAgICAgICAgICAvLyBvbmx5IHNlbGVjdCBkaXJlY3QgY2hpbGRyZW4gb2YgdGhlIGhvc3Qgbm9kZS5cbiAgICAgICAgICAvLyBlbmZvcmNpbmcgdGhpcyBhbHNvIGZpeGVzICM3ODYuXG4gICAgICAgICAgc2VsZWN0ZWQgPSBbXS5maWx0ZXIuY2FsbChzZWxlY3RlZCwgaXNEaXJlY3RDaGlsZClcbiAgICAgICAgfVxuICAgICAgICBvdXRsZXQuY29udGVudCA9IHNlbGVjdGVkLmxlbmd0aFxuICAgICAgICAgID8gc2VsZWN0ZWRcbiAgICAgICAgICA6IF8udG9BcnJheShvdXRsZXQuY2hpbGROb2RlcylcbiAgICAgIH0gZWxzZSB7IC8vIGRlZmF1bHQgY29udGVudFxuICAgICAgICBtYWluID0gb3V0bGV0XG4gICAgICB9XG4gICAgfSBlbHNlIHsgLy8gZmFsbGJhY2sgY29udGVudFxuICAgICAgb3V0bGV0LmNvbnRlbnQgPSBfLnRvQXJyYXkob3V0bGV0LmNoaWxkTm9kZXMpXG4gICAgfVxuICB9XG4gIC8vIHNlY29uZCBwYXNzLCBhY3R1YWxseSBpbnNlcnQgdGhlIGNvbnRlbnRzXG4gIGZvciAoaSA9IDAsIGogPSBvdXRsZXRzLmxlbmd0aDsgaSA8IGo7IGkrKykge1xuICAgIG91dGxldCA9IG91dGxldHNbaV1cbiAgICBpZiAob3V0bGV0ICE9PSBtYWluKSB7XG4gICAgICBpbnNlcnRDb250ZW50QXQob3V0bGV0LCBvdXRsZXQuY29udGVudClcbiAgICB9XG4gIH1cbiAgLy8gZmluYWxseSBpbnNlcnQgdGhlIG1haW4gY29udGVudFxuICBpZiAobWFpbikge1xuICAgIGluc2VydENvbnRlbnRBdChtYWluLCBfLnRvQXJyYXkocmF3LmNoaWxkTm9kZXMpKVxuICB9XG59XG5cbi8qKlxuICogR2V0IDxjb250ZW50PiBvdXRsZXRzIGZyb20gdGhlIGVsZW1lbnQvbGlzdFxuICpcbiAqIEBwYXJhbSB7RWxlbWVudHxBcnJheX0gZWxcbiAqIEByZXR1cm4ge0FycmF5fVxuICovXG5cbnZhciBjb25jYXQgPSBbXS5jb25jYXRcbmZ1bmN0aW9uIGdldE91dGxldHMgKGVsKSB7XG4gIHJldHVybiBfLmlzQXJyYXkoZWwpXG4gICAgPyBjb25jYXQuYXBwbHkoW10sIGVsLm1hcChnZXRPdXRsZXRzKSlcbiAgICA6IGVsLnF1ZXJ5U2VsZWN0b3JBbGxcbiAgICAgID8gXy50b0FycmF5KGVsLnF1ZXJ5U2VsZWN0b3JBbGwoJ2NvbnRlbnQnKSlcbiAgICAgIDogW11cbn1cblxuLyoqXG4gKiBJbnNlcnQgYW4gYXJyYXkgb2Ygbm9kZXMgYXQgb3V0bGV0LFxuICogdGhlbiByZW1vdmUgdGhlIG91dGxldC5cbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IG91dGxldFxuICogQHBhcmFtIHtBcnJheX0gY29udGVudHNcbiAqL1xuXG5mdW5jdGlvbiBpbnNlcnRDb250ZW50QXQgKG91dGxldCwgY29udGVudHMpIHtcbiAgLy8gbm90IHVzaW5nIHV0aWwgRE9NIG1ldGhvZHMgaGVyZSBiZWNhdXNlXG4gIC8vIHBhcmVudE5vZGUgY2FuIGJlIGNhY2hlZFxuICB2YXIgcGFyZW50ID0gb3V0bGV0LnBhcmVudE5vZGVcbiAgZm9yICh2YXIgaSA9IDAsIGogPSBjb250ZW50cy5sZW5ndGg7IGkgPCBqOyBpKyspIHtcbiAgICBwYXJlbnQuaW5zZXJ0QmVmb3JlKGNvbnRlbnRzW2ldLCBvdXRsZXQpXG4gIH1cbiAgcGFyZW50LnJlbW92ZUNoaWxkKG91dGxldClcbn1cblxuLyoqXG4gKiBIZWxwZXIgdG8gZXh0cmFjdCBhIGNvbXBvbmVudCBjb250YWluZXIncyBhdHRyaWJ1dGUgbmFtZXNcbiAqIGludG8gYSBtYXAsIGFuZCBmaWx0ZXJpbmcgb3V0IGB2LXdpdGhgIGluIHRoZSBwcm9jZXNzLlxuICogVGhlIHJlc3VsdGluZyBtYXAgd2lsbCBiZSB1c2VkIGluIGNvbXBpbGVyL2NvbXBpbGUgdG9cbiAqIGRldGVybWluZSB3aGV0aGVyIGFuIGF0dHJpYnV0ZSBpcyB0cmFuc2NsdWRlZC5cbiAqXG4gKiBAcGFyYW0ge05hbWVOb2RlTWFwfSBhdHRyc1xuICovXG5cbmZ1bmN0aW9uIGV4dHJhY3RBdHRycyAoYXR0cnMpIHtcbiAgaWYgKCFhdHRycykgcmV0dXJuIG51bGxcbiAgdmFyIHJlcyA9IHt9XG4gIHZhciB2d2l0aCA9IGNvbmZpZy5wcmVmaXggKyAnd2l0aCdcbiAgdmFyIGkgPSBhdHRycy5sZW5ndGhcbiAgd2hpbGUgKGktLSkge1xuICAgIHZhciBuYW1lID0gYXR0cnNbaV0ubmFtZVxuICAgIGlmIChuYW1lICE9PSB2d2l0aCkgcmVzW25hbWVdID0gdHJ1ZVxuICB9XG4gIHJldHVybiByZXNcbn0iLCJtb2R1bGUuZXhwb3J0cyA9IHtcblxuICAvKipcbiAgICogVGhlIHByZWZpeCB0byBsb29rIGZvciB3aGVuIHBhcnNpbmcgZGlyZWN0aXZlcy5cbiAgICpcbiAgICogQHR5cGUge1N0cmluZ31cbiAgICovXG5cbiAgcHJlZml4OiAndi0nLFxuXG4gIC8qKlxuICAgKiBXaGV0aGVyIHRvIHByaW50IGRlYnVnIG1lc3NhZ2VzLlxuICAgKiBBbHNvIGVuYWJsZXMgc3RhY2sgdHJhY2UgZm9yIHdhcm5pbmdzLlxuICAgKlxuICAgKiBAdHlwZSB7Qm9vbGVhbn1cbiAgICovXG5cbiAgZGVidWc6IGZhbHNlLFxuXG4gIC8qKlxuICAgKiBXaGV0aGVyIHRvIHN1cHByZXNzIHdhcm5pbmdzLlxuICAgKlxuICAgKiBAdHlwZSB7Qm9vbGVhbn1cbiAgICovXG5cbiAgc2lsZW50OiBmYWxzZSxcblxuICAvKipcbiAgICogV2hldGhlciBhbGxvdyBvYnNlcnZlciB0byBhbHRlciBkYXRhIG9iamVjdHMnXG4gICAqIF9fcHJvdG9fXy5cbiAgICpcbiAgICogQHR5cGUge0Jvb2xlYW59XG4gICAqL1xuXG4gIHByb3RvOiB0cnVlLFxuXG4gIC8qKlxuICAgKiBXaGV0aGVyIHRvIHBhcnNlIG11c3RhY2hlIHRhZ3MgaW4gdGVtcGxhdGVzLlxuICAgKlxuICAgKiBAdHlwZSB7Qm9vbGVhbn1cbiAgICovXG5cbiAgaW50ZXJwb2xhdGU6IHRydWUsXG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdG8gdXNlIGFzeW5jIHJlbmRlcmluZy5cbiAgICovXG5cbiAgYXN5bmM6IHRydWUsXG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdG8gd2FybiBhZ2FpbnN0IGVycm9ycyBjYXVnaHQgd2hlbiBldmFsdWF0aW5nXG4gICAqIGV4cHJlc3Npb25zLlxuICAgKi9cblxuICB3YXJuRXhwcmVzc2lvbkVycm9yczogdHJ1ZSxcblxuICAvKipcbiAgICogSW50ZXJuYWwgZmxhZyB0byBpbmRpY2F0ZSB0aGUgZGVsaW1pdGVycyBoYXZlIGJlZW5cbiAgICogY2hhbmdlZC5cbiAgICpcbiAgICogQHR5cGUge0Jvb2xlYW59XG4gICAqL1xuXG4gIF9kZWxpbWl0ZXJzQ2hhbmdlZDogdHJ1ZVxuXG59XG5cbi8qKlxuICogSW50ZXJwb2xhdGlvbiBkZWxpbWl0ZXJzLlxuICogV2UgbmVlZCB0byBtYXJrIHRoZSBjaGFuZ2VkIGZsYWcgc28gdGhhdCB0aGUgdGV4dCBwYXJzZXJcbiAqIGtub3dzIGl0IG5lZWRzIHRvIHJlY29tcGlsZSB0aGUgcmVnZXguXG4gKlxuICogQHR5cGUge0FycmF5PFN0cmluZz59XG4gKi9cblxudmFyIGRlbGltaXRlcnMgPSBbJ3t7JywgJ319J11cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShtb2R1bGUuZXhwb3J0cywgJ2RlbGltaXRlcnMnLCB7XG4gIGdldDogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBkZWxpbWl0ZXJzXG4gIH0sXG4gIHNldDogZnVuY3Rpb24gKHZhbCkge1xuICAgIGRlbGltaXRlcnMgPSB2YWxcbiAgICB0aGlzLl9kZWxpbWl0ZXJzQ2hhbmdlZCA9IHRydWVcbiAgfVxufSkiLCJ2YXIgXyA9IHJlcXVpcmUoJy4vdXRpbCcpXG52YXIgY29uZmlnID0gcmVxdWlyZSgnLi9jb25maWcnKVxudmFyIFdhdGNoZXIgPSByZXF1aXJlKCcuL3dhdGNoZXInKVxudmFyIHRleHRQYXJzZXIgPSByZXF1aXJlKCcuL3BhcnNlcnMvdGV4dCcpXG52YXIgZXhwUGFyc2VyID0gcmVxdWlyZSgnLi9wYXJzZXJzL2V4cHJlc3Npb24nKVxuXG4vKipcbiAqIEEgZGlyZWN0aXZlIGxpbmtzIGEgRE9NIGVsZW1lbnQgd2l0aCBhIHBpZWNlIG9mIGRhdGEsXG4gKiB3aGljaCBpcyB0aGUgcmVzdWx0IG9mIGV2YWx1YXRpbmcgYW4gZXhwcmVzc2lvbi5cbiAqIEl0IHJlZ2lzdGVycyBhIHdhdGNoZXIgd2l0aCB0aGUgZXhwcmVzc2lvbiBhbmQgY2FsbHNcbiAqIHRoZSBET00gdXBkYXRlIGZ1bmN0aW9uIHdoZW4gYSBjaGFuZ2UgaXMgdHJpZ2dlcmVkLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lXG4gKiBAcGFyYW0ge05vZGV9IGVsXG4gKiBAcGFyYW0ge1Z1ZX0gdm1cbiAqIEBwYXJhbSB7T2JqZWN0fSBkZXNjcmlwdG9yXG4gKiAgICAgICAgICAgICAgICAgLSB7U3RyaW5nfSBleHByZXNzaW9uXG4gKiAgICAgICAgICAgICAgICAgLSB7U3RyaW5nfSBbYXJnXVxuICogICAgICAgICAgICAgICAgIC0ge0FycmF5PE9iamVjdD59IFtmaWx0ZXJzXVxuICogQHBhcmFtIHtPYmplY3R9IGRlZiAtIGRpcmVjdGl2ZSBkZWZpbml0aW9uIG9iamVjdFxuICogQHBhcmFtIHtWdWV8dW5kZWZpbmVkfSBob3N0IC0gdHJhbnNjbHVzaW9uIGhvc3QgdGFyZ2V0XG4gKiBAY29uc3RydWN0b3JcbiAqL1xuXG5mdW5jdGlvbiBEaXJlY3RpdmUgKG5hbWUsIGVsLCB2bSwgZGVzY3JpcHRvciwgZGVmLCBob3N0KSB7XG4gIC8vIHB1YmxpY1xuICB0aGlzLm5hbWUgPSBuYW1lXG4gIHRoaXMuZWwgPSBlbFxuICB0aGlzLnZtID0gdm1cbiAgLy8gY29weSBkZXNjcmlwdG9yIHByb3BzXG4gIHRoaXMucmF3ID0gZGVzY3JpcHRvci5yYXdcbiAgdGhpcy5leHByZXNzaW9uID0gZGVzY3JpcHRvci5leHByZXNzaW9uXG4gIHRoaXMuYXJnID0gZGVzY3JpcHRvci5hcmdcbiAgdGhpcy5maWx0ZXJzID0gXy5yZXNvbHZlRmlsdGVycyh2bSwgZGVzY3JpcHRvci5maWx0ZXJzKVxuICAvLyBwcml2YXRlXG4gIHRoaXMuX2hvc3QgPSBob3N0XG4gIHRoaXMuX2xvY2tlZCA9IGZhbHNlXG4gIHRoaXMuX2JvdW5kID0gZmFsc2VcbiAgLy8gaW5pdFxuICB0aGlzLl9iaW5kKGRlZilcbn1cblxudmFyIHAgPSBEaXJlY3RpdmUucHJvdG90eXBlXG5cbi8qKlxuICogSW5pdGlhbGl6ZSB0aGUgZGlyZWN0aXZlLCBtaXhpbiBkZWZpbml0aW9uIHByb3BlcnRpZXMsXG4gKiBzZXR1cCB0aGUgd2F0Y2hlciwgY2FsbCBkZWZpbml0aW9uIGJpbmQoKSBhbmQgdXBkYXRlKClcbiAqIGlmIHByZXNlbnQuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IGRlZlxuICovXG5cbnAuX2JpbmQgPSBmdW5jdGlvbiAoZGVmKSB7XG4gIGlmICh0aGlzLm5hbWUgIT09ICdjbG9haycgJiYgdGhpcy5lbCAmJiB0aGlzLmVsLnJlbW92ZUF0dHJpYnV0ZSkge1xuICAgIHRoaXMuZWwucmVtb3ZlQXR0cmlidXRlKGNvbmZpZy5wcmVmaXggKyB0aGlzLm5hbWUpXG4gIH1cbiAgaWYgKHR5cGVvZiBkZWYgPT09ICdmdW5jdGlvbicpIHtcbiAgICB0aGlzLnVwZGF0ZSA9IGRlZlxuICB9IGVsc2Uge1xuICAgIF8uZXh0ZW5kKHRoaXMsIGRlZilcbiAgfVxuICB0aGlzLl93YXRjaGVyRXhwID0gdGhpcy5leHByZXNzaW9uXG4gIHRoaXMuX2NoZWNrRHluYW1pY0xpdGVyYWwoKVxuICBpZiAodGhpcy5iaW5kKSB7XG4gICAgdGhpcy5iaW5kKClcbiAgfVxuICBpZiAodGhpcy5fd2F0Y2hlckV4cCAmJlxuICAgICAgKHRoaXMudXBkYXRlIHx8IHRoaXMudHdvV2F5KSAmJlxuICAgICAgKCF0aGlzLmlzTGl0ZXJhbCB8fCB0aGlzLl9pc0R5bmFtaWNMaXRlcmFsKSAmJlxuICAgICAgIXRoaXMuX2NoZWNrU3RhdGVtZW50KCkpIHtcbiAgICAvLyB3cmFwcGVkIHVwZGF0ZXIgZm9yIGNvbnRleHRcbiAgICB2YXIgZGlyID0gdGhpc1xuICAgIHZhciB1cGRhdGUgPSB0aGlzLl91cGRhdGUgPSB0aGlzLnVwZGF0ZVxuICAgICAgPyBmdW5jdGlvbiAodmFsLCBvbGRWYWwpIHtcbiAgICAgICAgICBpZiAoIWRpci5fbG9ja2VkKSB7XG4gICAgICAgICAgICBkaXIudXBkYXRlKHZhbCwgb2xkVmFsKVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgOiBmdW5jdGlvbiAoKSB7fSAvLyBub29wIGlmIG5vIHVwZGF0ZSBpcyBwcm92aWRlZFxuICAgIC8vIHVzZSByYXcgZXhwcmVzc2lvbiBhcyBpZGVudGlmaWVyIGJlY2F1c2UgZmlsdGVyc1xuICAgIC8vIG1ha2UgdGhlbSBkaWZmZXJlbnQgd2F0Y2hlcnNcbiAgICB2YXIgd2F0Y2hlciA9IHRoaXMudm0uX3dhdGNoZXJzW3RoaXMucmF3XVxuICAgIC8vIHYtcmVwZWF0IGFsd2F5cyBjcmVhdGVzIGEgbmV3IHdhdGNoZXIgYmVjYXVzZSBpdCBoYXNcbiAgICAvLyBhIHNwZWNpYWwgZmlsdGVyIHRoYXQncyBib3VuZCB0byBpdHMgZGlyZWN0aXZlXG4gICAgLy8gaW5zdGFuY2UuXG4gICAgaWYgKCF3YXRjaGVyIHx8IHRoaXMubmFtZSA9PT0gJ3JlcGVhdCcpIHtcbiAgICAgIHdhdGNoZXIgPSB0aGlzLnZtLl93YXRjaGVyc1t0aGlzLnJhd10gPSBuZXcgV2F0Y2hlcihcbiAgICAgICAgdGhpcy52bSxcbiAgICAgICAgdGhpcy5fd2F0Y2hlckV4cCxcbiAgICAgICAgdXBkYXRlLCAvLyBjYWxsYmFja1xuICAgICAgICB7XG4gICAgICAgICAgZmlsdGVyczogdGhpcy5maWx0ZXJzLFxuICAgICAgICAgIHR3b1dheTogdGhpcy50d29XYXksXG4gICAgICAgICAgZGVlcDogdGhpcy5kZWVwXG4gICAgICAgIH1cbiAgICAgIClcbiAgICB9IGVsc2Uge1xuICAgICAgd2F0Y2hlci5hZGRDYih1cGRhdGUpXG4gICAgfVxuICAgIHRoaXMuX3dhdGNoZXIgPSB3YXRjaGVyXG4gICAgaWYgKHRoaXMuX2luaXRWYWx1ZSAhPSBudWxsKSB7XG4gICAgICB3YXRjaGVyLnNldCh0aGlzLl9pbml0VmFsdWUpXG4gICAgfSBlbHNlIGlmICh0aGlzLnVwZGF0ZSkge1xuICAgICAgdGhpcy51cGRhdGUod2F0Y2hlci52YWx1ZSlcbiAgICB9XG4gIH1cbiAgdGhpcy5fYm91bmQgPSB0cnVlXG59XG5cbi8qKlxuICogY2hlY2sgaWYgdGhpcyBpcyBhIGR5bmFtaWMgbGl0ZXJhbCBiaW5kaW5nLlxuICpcbiAqIGUuZy4gdi1jb21wb25lbnQ9XCJ7e2N1cnJlbnRWaWV3fX1cIlxuICovXG5cbnAuX2NoZWNrRHluYW1pY0xpdGVyYWwgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBleHByZXNzaW9uID0gdGhpcy5leHByZXNzaW9uXG4gIGlmIChleHByZXNzaW9uICYmIHRoaXMuaXNMaXRlcmFsKSB7XG4gICAgdmFyIHRva2VucyA9IHRleHRQYXJzZXIucGFyc2UoZXhwcmVzc2lvbilcbiAgICBpZiAodG9rZW5zKSB7XG4gICAgICB2YXIgZXhwID0gdGV4dFBhcnNlci50b2tlbnNUb0V4cCh0b2tlbnMpXG4gICAgICB0aGlzLmV4cHJlc3Npb24gPSB0aGlzLnZtLiRnZXQoZXhwKVxuICAgICAgdGhpcy5fd2F0Y2hlckV4cCA9IGV4cFxuICAgICAgdGhpcy5faXNEeW5hbWljTGl0ZXJhbCA9IHRydWVcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBDaGVjayBpZiB0aGUgZGlyZWN0aXZlIGlzIGEgZnVuY3Rpb24gY2FsbGVyXG4gKiBhbmQgaWYgdGhlIGV4cHJlc3Npb24gaXMgYSBjYWxsYWJsZSBvbmUuIElmIGJvdGggdHJ1ZSxcbiAqIHdlIHdyYXAgdXAgdGhlIGV4cHJlc3Npb24gYW5kIHVzZSBpdCBhcyB0aGUgZXZlbnRcbiAqIGhhbmRsZXIuXG4gKlxuICogZS5nLiB2LW9uPVwiY2xpY2s6IGErK1wiXG4gKlxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqL1xuXG5wLl9jaGVja1N0YXRlbWVudCA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGV4cHJlc3Npb24gPSB0aGlzLmV4cHJlc3Npb25cbiAgaWYgKFxuICAgIGV4cHJlc3Npb24gJiYgdGhpcy5hY2NlcHRTdGF0ZW1lbnQgJiZcbiAgICAhZXhwUGFyc2VyLnBhdGhUZXN0UkUudGVzdChleHByZXNzaW9uKVxuICApIHtcbiAgICB2YXIgZm4gPSBleHBQYXJzZXIucGFyc2UoZXhwcmVzc2lvbikuZ2V0XG4gICAgdmFyIHZtID0gdGhpcy52bVxuICAgIHZhciBoYW5kbGVyID0gZnVuY3Rpb24gKCkge1xuICAgICAgZm4uY2FsbCh2bSwgdm0pXG4gICAgfVxuICAgIGlmICh0aGlzLmZpbHRlcnMpIHtcbiAgICAgIGhhbmRsZXIgPSBfLmFwcGx5RmlsdGVycyhcbiAgICAgICAgaGFuZGxlcixcbiAgICAgICAgdGhpcy5maWx0ZXJzLnJlYWQsXG4gICAgICAgIHZtXG4gICAgICApXG4gICAgfVxuICAgIHRoaXMudXBkYXRlKGhhbmRsZXIpXG4gICAgcmV0dXJuIHRydWVcbiAgfVxufVxuXG4vKipcbiAqIENoZWNrIGZvciBhbiBhdHRyaWJ1dGUgZGlyZWN0aXZlIHBhcmFtLCBlLmcuIGxhenlcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5cbnAuX2NoZWNrUGFyYW0gPSBmdW5jdGlvbiAobmFtZSkge1xuICB2YXIgcGFyYW0gPSB0aGlzLmVsLmdldEF0dHJpYnV0ZShuYW1lKVxuICBpZiAocGFyYW0gIT09IG51bGwpIHtcbiAgICB0aGlzLmVsLnJlbW92ZUF0dHJpYnV0ZShuYW1lKVxuICB9XG4gIHJldHVybiBwYXJhbVxufVxuXG4vKipcbiAqIFRlYXJkb3duIHRoZSB3YXRjaGVyIGFuZCBjYWxsIHVuYmluZC5cbiAqL1xuXG5wLl90ZWFyZG93biA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKHRoaXMuX2JvdW5kKSB7XG4gICAgaWYgKHRoaXMudW5iaW5kKSB7XG4gICAgICB0aGlzLnVuYmluZCgpXG4gICAgfVxuICAgIHZhciB3YXRjaGVyID0gdGhpcy5fd2F0Y2hlclxuICAgIGlmICh3YXRjaGVyICYmIHdhdGNoZXIuYWN0aXZlKSB7XG4gICAgICB3YXRjaGVyLnJlbW92ZUNiKHRoaXMuX3VwZGF0ZSlcbiAgICAgIGlmICghd2F0Y2hlci5hY3RpdmUpIHtcbiAgICAgICAgdGhpcy52bS5fd2F0Y2hlcnNbdGhpcy5yYXddID0gbnVsbFxuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLl9ib3VuZCA9IGZhbHNlXG4gICAgdGhpcy52bSA9IHRoaXMuZWwgPSB0aGlzLl93YXRjaGVyID0gbnVsbFxuICB9XG59XG5cbi8qKlxuICogU2V0IHRoZSBjb3JyZXNwb25kaW5nIHZhbHVlIHdpdGggdGhlIHNldHRlci5cbiAqIFRoaXMgc2hvdWxkIG9ubHkgYmUgdXNlZCBpbiB0d28td2F5IGRpcmVjdGl2ZXNcbiAqIGUuZy4gdi1tb2RlbC5cbiAqXG4gKiBAcGFyYW0geyp9IHZhbHVlXG4gKiBAcGFyYW0ge0Jvb2xlYW59IGxvY2sgLSBwcmV2ZW50IHdydGllIHRyaWdnZXJpbmcgdXBkYXRlLlxuICogQHB1YmxpY1xuICovXG5cbnAuc2V0ID0gZnVuY3Rpb24gKHZhbHVlLCBsb2NrKSB7XG4gIGlmICh0aGlzLnR3b1dheSkge1xuICAgIGlmIChsb2NrKSB7XG4gICAgICB0aGlzLl9sb2NrZWQgPSB0cnVlXG4gICAgfVxuICAgIHRoaXMuX3dhdGNoZXIuc2V0KHZhbHVlKVxuICAgIGlmIChsb2NrKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXNcbiAgICAgIF8ubmV4dFRpY2soZnVuY3Rpb24gKCkge1xuICAgICAgICBzZWxmLl9sb2NrZWQgPSBmYWxzZVxuICAgICAgfSlcbiAgICB9XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBEaXJlY3RpdmUiLCIvLyB4bGlua1xudmFyIHhsaW5rTlMgPSAnaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluaydcbnZhciB4bGlua1JFID0gL154bGluazovXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIHByaW9yaXR5OiA4NTAsXG5cbiAgYmluZDogZnVuY3Rpb24gKCkge1xuICAgIHZhciBuYW1lID0gdGhpcy5hcmdcbiAgICB0aGlzLnVwZGF0ZSA9IHhsaW5rUkUudGVzdChuYW1lKVxuICAgICAgPyB4bGlua0hhbmRsZXJcbiAgICAgIDogZGVmYXVsdEhhbmRsZXJcbiAgfVxuXG59XG5cbmZ1bmN0aW9uIGRlZmF1bHRIYW5kbGVyICh2YWx1ZSkge1xuICBpZiAodmFsdWUgfHwgdmFsdWUgPT09IDApIHtcbiAgICB0aGlzLmVsLnNldEF0dHJpYnV0ZSh0aGlzLmFyZywgdmFsdWUpXG4gIH0gZWxzZSB7XG4gICAgdGhpcy5lbC5yZW1vdmVBdHRyaWJ1dGUodGhpcy5hcmcpXG4gIH1cbn1cblxuZnVuY3Rpb24geGxpbmtIYW5kbGVyICh2YWx1ZSkge1xuICBpZiAodmFsdWUgIT0gbnVsbCkge1xuICAgIHRoaXMuZWwuc2V0QXR0cmlidXRlTlMoeGxpbmtOUywgdGhpcy5hcmcsIHZhbHVlKVxuICB9IGVsc2Uge1xuICAgIHRoaXMuZWwucmVtb3ZlQXR0cmlidXRlTlMoeGxpbmtOUywgJ2hyZWYnKVxuICB9XG59IiwidmFyIF8gPSByZXF1aXJlKCcuLi91dGlsJylcbnZhciBhZGRDbGFzcyA9IF8uYWRkQ2xhc3NcbnZhciByZW1vdmVDbGFzcyA9IF8ucmVtb3ZlQ2xhc3NcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgaWYgKHRoaXMuYXJnKSB7XG4gICAgdmFyIG1ldGhvZCA9IHZhbHVlID8gYWRkQ2xhc3MgOiByZW1vdmVDbGFzc1xuICAgIG1ldGhvZCh0aGlzLmVsLCB0aGlzLmFyZylcbiAgfSBlbHNlIHtcbiAgICBpZiAodGhpcy5sYXN0VmFsKSB7XG4gICAgICByZW1vdmVDbGFzcyh0aGlzLmVsLCB0aGlzLmxhc3RWYWwpXG4gICAgfVxuICAgIGlmICh2YWx1ZSkge1xuICAgICAgYWRkQ2xhc3ModGhpcy5lbCwgdmFsdWUpXG4gICAgICB0aGlzLmxhc3RWYWwgPSB2YWx1ZVxuICAgIH1cbiAgfVxufSIsInZhciBjb25maWcgPSByZXF1aXJlKCcuLi9jb25maWcnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICBiaW5kOiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGVsID0gdGhpcy5lbFxuICAgIHRoaXMudm0uJG9uY2UoJ2hvb2s6Y29tcGlsZWQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICBlbC5yZW1vdmVBdHRyaWJ1dGUoY29uZmlnLnByZWZpeCArICdjbG9haycpXG4gICAgfSlcbiAgfVxuXG59IiwidmFyIF8gPSByZXF1aXJlKCcuLi91dGlsJylcbnZhciB0ZW1wbGF0ZVBhcnNlciA9IHJlcXVpcmUoJy4uL3BhcnNlcnMvdGVtcGxhdGUnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICBpc0xpdGVyYWw6IHRydWUsXG5cbiAgLyoqXG4gICAqIFNldHVwLiBUd28gcG9zc2libGUgdXNhZ2VzOlxuICAgKlxuICAgKiAtIHN0YXRpYzpcbiAgICogICB2LWNvbXBvbmVudD1cImNvbXBcIlxuICAgKlxuICAgKiAtIGR5bmFtaWM6XG4gICAqICAgdi1jb21wb25lbnQ9XCJ7e2N1cnJlbnRWaWV3fX1cIlxuICAgKi9cblxuICBiaW5kOiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKCF0aGlzLmVsLl9fdnVlX18pIHtcbiAgICAgIC8vIGNyZWF0ZSBhIHJlZiBhbmNob3JcbiAgICAgIHRoaXMucmVmID0gZG9jdW1lbnQuY3JlYXRlQ29tbWVudCgndi1jb21wb25lbnQnKVxuICAgICAgXy5yZXBsYWNlKHRoaXMuZWwsIHRoaXMucmVmKVxuICAgICAgLy8gY2hlY2sga2VlcC1hbGl2ZSBvcHRpb25zLlxuICAgICAgLy8gSWYgeWVzLCBpbnN0ZWFkIG9mIGRlc3Ryb3lpbmcgdGhlIGFjdGl2ZSB2bSB3aGVuXG4gICAgICAvLyBoaWRpbmcgKHYtaWYpIG9yIHN3aXRjaGluZyAoZHluYW1pYyBsaXRlcmFsKSBpdCxcbiAgICAgIC8vIHdlIHNpbXBseSByZW1vdmUgaXQgZnJvbSB0aGUgRE9NIGFuZCBzYXZlIGl0IGluIGFcbiAgICAgIC8vIGNhY2hlIG9iamVjdCwgd2l0aCBpdHMgY29uc3RydWN0b3IgaWQgYXMgdGhlIGtleS5cbiAgICAgIHRoaXMua2VlcEFsaXZlID0gdGhpcy5fY2hlY2tQYXJhbSgna2VlcC1hbGl2ZScpICE9IG51bGxcbiAgICAgIC8vIGNoZWNrIHJlZlxuICAgICAgdGhpcy5yZWZJRCA9IF8uYXR0cih0aGlzLmVsLCAncmVmJylcbiAgICAgIGlmICh0aGlzLmtlZXBBbGl2ZSkge1xuICAgICAgICB0aGlzLmNhY2hlID0ge31cbiAgICAgIH1cbiAgICAgIC8vIGNoZWNrIGlubGluZS10ZW1wbGF0ZVxuICAgICAgaWYgKHRoaXMuX2NoZWNrUGFyYW0oJ2lubGluZS10ZW1wbGF0ZScpICE9PSBudWxsKSB7XG4gICAgICAgIC8vIGV4dHJhY3QgaW5saW5lIHRlbXBsYXRlIGFzIGEgRG9jdW1lbnRGcmFnbWVudFxuICAgICAgICB0aGlzLnRlbXBsYXRlID0gXy5leHRyYWN0Q29udGVudCh0aGlzLmVsLCB0cnVlKVxuICAgICAgfVxuICAgICAgLy8gaWYgc3RhdGljLCBidWlsZCByaWdodCBub3cuXG4gICAgICBpZiAoIXRoaXMuX2lzRHluYW1pY0xpdGVyYWwpIHtcbiAgICAgICAgdGhpcy5yZXNvbHZlQ3Rvcih0aGlzLmV4cHJlc3Npb24pXG4gICAgICAgIHZhciBjaGlsZCA9IHRoaXMuYnVpbGQoKVxuICAgICAgICBjaGlsZC4kYmVmb3JlKHRoaXMucmVmKVxuICAgICAgICB0aGlzLnNldEN1cnJlbnQoY2hpbGQpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBjaGVjayBkeW5hbWljIGNvbXBvbmVudCBwYXJhbXNcbiAgICAgICAgdGhpcy5yZWFkeUV2ZW50ID0gdGhpcy5fY2hlY2tQYXJhbSgnd2FpdC1mb3InKVxuICAgICAgICB0aGlzLnRyYW5zTW9kZSA9IHRoaXMuX2NoZWNrUGFyYW0oJ3RyYW5zaXRpb24tbW9kZScpXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIF8ud2FybihcbiAgICAgICAgJ3YtY29tcG9uZW50PVwiJyArIHRoaXMuZXhwcmVzc2lvbiArICdcIiBjYW5ub3QgYmUgJyArXG4gICAgICAgICd1c2VkIG9uIGFuIGFscmVhZHkgbW91bnRlZCBpbnN0YW5jZS4nXG4gICAgICApXG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBSZXNvbHZlIHRoZSBjb21wb25lbnQgY29uc3RydWN0b3IgdG8gdXNlIHdoZW4gY3JlYXRpbmdcbiAgICogdGhlIGNoaWxkIHZtLlxuICAgKi9cblxuICByZXNvbHZlQ3RvcjogZnVuY3Rpb24gKGlkKSB7XG4gICAgdGhpcy5jdG9ySWQgPSBpZFxuICAgIHRoaXMuQ3RvciA9IHRoaXMudm0uJG9wdGlvbnMuY29tcG9uZW50c1tpZF1cbiAgICBfLmFzc2VydEFzc2V0KHRoaXMuQ3RvciwgJ2NvbXBvbmVudCcsIGlkKVxuICB9LFxuXG4gIC8qKlxuICAgKiBJbnN0YW50aWF0ZS9pbnNlcnQgYSBuZXcgY2hpbGQgdm0uXG4gICAqIElmIGtlZXAgYWxpdmUgYW5kIGhhcyBjYWNoZWQgaW5zdGFuY2UsIGluc2VydCB0aGF0XG4gICAqIGluc3RhbmNlOyBvdGhlcndpc2UgYnVpbGQgYSBuZXcgb25lIGFuZCBjYWNoZSBpdC5cbiAgICpcbiAgICogQHJldHVybiB7VnVlfSAtIHRoZSBjcmVhdGVkIGluc3RhbmNlXG4gICAqL1xuXG4gIGJ1aWxkOiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMua2VlcEFsaXZlKSB7XG4gICAgICB2YXIgY2FjaGVkID0gdGhpcy5jYWNoZVt0aGlzLmN0b3JJZF1cbiAgICAgIGlmIChjYWNoZWQpIHtcbiAgICAgICAgcmV0dXJuIGNhY2hlZFxuICAgICAgfVxuICAgIH1cbiAgICB2YXIgdm0gPSB0aGlzLnZtXG4gICAgdmFyIGVsID0gdGVtcGxhdGVQYXJzZXIuY2xvbmUodGhpcy5lbClcbiAgICBpZiAodGhpcy5DdG9yKSB7XG4gICAgICB2YXIgY2hpbGQgPSB2bS4kYWRkQ2hpbGQoe1xuICAgICAgICBlbDogZWwsXG4gICAgICAgIHRlbXBsYXRlOiB0aGlzLnRlbXBsYXRlLFxuICAgICAgICBfYXNDb21wb25lbnQ6IHRydWUsXG4gICAgICAgIF9ob3N0OiB0aGlzLl9ob3N0XG4gICAgICB9LCB0aGlzLkN0b3IpXG4gICAgICBpZiAodGhpcy5rZWVwQWxpdmUpIHtcbiAgICAgICAgdGhpcy5jYWNoZVt0aGlzLmN0b3JJZF0gPSBjaGlsZFxuICAgICAgfVxuICAgICAgcmV0dXJuIGNoaWxkXG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBUZWFyZG93biB0aGUgY3VycmVudCBjaGlsZCwgYnV0IGRlZmVycyBjbGVhbnVwIHNvXG4gICAqIHRoYXQgd2UgY2FuIHNlcGFyYXRlIHRoZSBkZXN0cm95IGFuZCByZW1vdmFsIHN0ZXBzLlxuICAgKi9cblxuICB1bmJ1aWxkOiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNoaWxkID0gdGhpcy5jaGlsZFZNXG4gICAgaWYgKCFjaGlsZCB8fCB0aGlzLmtlZXBBbGl2ZSkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIC8vIHRoZSBzb2xlIHB1cnBvc2Ugb2YgYGRlZmVyQ2xlYW51cGAgaXMgc28gdGhhdCB3ZSBjYW5cbiAgICAvLyBcImRlYWN0aXZhdGVcIiB0aGUgdm0gcmlnaHQgbm93IGFuZCBwZXJmb3JtIERPTSByZW1vdmFsXG4gICAgLy8gbGF0ZXIuXG4gICAgY2hpbGQuJGRlc3Ryb3koZmFsc2UsIHRydWUpXG4gIH0sXG5cbiAgLyoqXG4gICAqIFJlbW92ZSBjdXJyZW50IGRlc3Ryb3llZCBjaGlsZCBhbmQgbWFudWFsbHkgZG9cbiAgICogdGhlIGNsZWFudXAgYWZ0ZXIgcmVtb3ZhbC5cbiAgICpcbiAgICogQHBhcmFtIHtGdW5jdGlvbn0gY2JcbiAgICovXG5cbiAgcmVtb3ZlOiBmdW5jdGlvbiAoY2hpbGQsIGNiKSB7XG4gICAgdmFyIGtlZXBBbGl2ZSA9IHRoaXMua2VlcEFsaXZlXG4gICAgaWYgKGNoaWxkKSB7XG4gICAgICBjaGlsZC4kcmVtb3ZlKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKCFrZWVwQWxpdmUpIGNoaWxkLl9jbGVhbnVwKClcbiAgICAgICAgaWYgKGNiKSBjYigpXG4gICAgICB9KVxuICAgIH0gZWxzZSBpZiAoY2IpIHtcbiAgICAgIGNiKClcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIFVwZGF0ZSBjYWxsYmFjayBmb3IgdGhlIGR5bmFtaWMgbGl0ZXJhbCBzY2VuYXJpbyxcbiAgICogZS5nLiB2LWNvbXBvbmVudD1cInt7dmlld319XCJcbiAgICovXG5cbiAgdXBkYXRlOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICBpZiAoIXZhbHVlKSB7XG4gICAgICAvLyBqdXN0IGRlc3Ryb3kgYW5kIHJlbW92ZSBjdXJyZW50XG4gICAgICB0aGlzLnVuYnVpbGQoKVxuICAgICAgdGhpcy5yZW1vdmUodGhpcy5jaGlsZFZNKVxuICAgICAgdGhpcy51bnNldEN1cnJlbnQoKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLnJlc29sdmVDdG9yKHZhbHVlKVxuICAgICAgdGhpcy51bmJ1aWxkKClcbiAgICAgIHZhciBuZXdDb21wb25lbnQgPSB0aGlzLmJ1aWxkKClcbiAgICAgIHZhciBzZWxmID0gdGhpc1xuICAgICAgaWYgKHRoaXMucmVhZHlFdmVudCkge1xuICAgICAgICBuZXdDb21wb25lbnQuJG9uY2UodGhpcy5yZWFkeUV2ZW50LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgc2VsZi5zd2FwVG8obmV3Q29tcG9uZW50KVxuICAgICAgICB9KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5zd2FwVG8obmV3Q29tcG9uZW50KVxuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICAvKipcbiAgICogQWN0dWFsbHkgc3dhcCB0aGUgY29tcG9uZW50cywgZGVwZW5kaW5nIG9uIHRoZVxuICAgKiB0cmFuc2l0aW9uIG1vZGUuIERlZmF1bHRzIHRvIHNpbXVsdGFuZW91cy5cbiAgICpcbiAgICogQHBhcmFtIHtWdWV9IHRhcmdldFxuICAgKi9cblxuICBzd2FwVG86IGZ1bmN0aW9uICh0YXJnZXQpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXNcbiAgICB2YXIgY3VycmVudCA9IHRoaXMuY2hpbGRWTVxuICAgIHRoaXMudW5zZXRDdXJyZW50KClcbiAgICB0aGlzLnNldEN1cnJlbnQodGFyZ2V0KVxuICAgIHN3aXRjaCAoc2VsZi50cmFuc01vZGUpIHtcbiAgICAgIGNhc2UgJ2luLW91dCc6XG4gICAgICAgIHRhcmdldC4kYmVmb3JlKHNlbGYucmVmLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgc2VsZi5yZW1vdmUoY3VycmVudClcbiAgICAgICAgfSlcbiAgICAgICAgYnJlYWtcbiAgICAgIGNhc2UgJ291dC1pbic6XG4gICAgICAgIHNlbGYucmVtb3ZlKGN1cnJlbnQsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICB0YXJnZXQuJGJlZm9yZShzZWxmLnJlZilcbiAgICAgICAgfSlcbiAgICAgICAgYnJlYWtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHNlbGYucmVtb3ZlKGN1cnJlbnQpXG4gICAgICAgIHRhcmdldC4kYmVmb3JlKHNlbGYucmVmKVxuICAgIH1cbiAgfSxcblxuICAvKipcbiAgICogU2V0IGNoaWxkVk0gYW5kIHBhcmVudCByZWZcbiAgICovXG4gIFxuICBzZXRDdXJyZW50OiBmdW5jdGlvbiAoY2hpbGQpIHtcbiAgICB0aGlzLmNoaWxkVk0gPSBjaGlsZFxuICAgIHZhciByZWZJRCA9IGNoaWxkLl9yZWZJRCB8fCB0aGlzLnJlZklEXG4gICAgaWYgKHJlZklEKSB7XG4gICAgICB0aGlzLnZtLiRbcmVmSURdID0gY2hpbGRcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIFVuc2V0IGNoaWxkVk0gYW5kIHBhcmVudCByZWZcbiAgICovXG5cbiAgdW5zZXRDdXJyZW50OiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNoaWxkID0gdGhpcy5jaGlsZFZNXG4gICAgdGhpcy5jaGlsZFZNID0gbnVsbFxuICAgIHZhciByZWZJRCA9IChjaGlsZCAmJiBjaGlsZC5fcmVmSUQpIHx8IHRoaXMucmVmSURcbiAgICBpZiAocmVmSUQpIHtcbiAgICAgIHRoaXMudm0uJFtyZWZJRF0gPSBudWxsXG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBVbmJpbmQuXG4gICAqL1xuXG4gIHVuYmluZDogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMudW5idWlsZCgpXG4gICAgLy8gZGVzdHJveSBhbGwga2VlcC1hbGl2ZSBjYWNoZWQgaW5zdGFuY2VzXG4gICAgaWYgKHRoaXMuY2FjaGUpIHtcbiAgICAgIGZvciAodmFyIGtleSBpbiB0aGlzLmNhY2hlKSB7XG4gICAgICAgIHRoaXMuY2FjaGVba2V5XS4kZGVzdHJveSgpXG4gICAgICB9XG4gICAgICB0aGlzLmNhY2hlID0gbnVsbFxuICAgIH1cbiAgfVxuXG59IiwibW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgaXNMaXRlcmFsOiB0cnVlLFxuXG4gIGJpbmQ6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLnZtLiQkW3RoaXMuZXhwcmVzc2lvbl0gPSB0aGlzLmVsXG4gIH0sXG5cbiAgdW5iaW5kOiBmdW5jdGlvbiAoKSB7XG4gICAgZGVsZXRlIHRoaXMudm0uJCRbdGhpcy5leHByZXNzaW9uXVxuICB9XG4gIFxufSIsInZhciBfID0gcmVxdWlyZSgnLi4vdXRpbCcpXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIGFjY2VwdFN0YXRlbWVudDogdHJ1ZSxcblxuICBiaW5kOiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNoaWxkID0gdGhpcy5lbC5fX3Z1ZV9fXG4gICAgaWYgKCFjaGlsZCB8fCB0aGlzLnZtICE9PSBjaGlsZC4kcGFyZW50KSB7XG4gICAgICBfLndhcm4oXG4gICAgICAgICdgdi1ldmVudHNgIHNob3VsZCBvbmx5IGJlIHVzZWQgb24gYSBjaGlsZCBjb21wb25lbnQgJyArXG4gICAgICAgICdmcm9tIHRoZSBwYXJlbnQgdGVtcGxhdGUuJ1xuICAgICAgKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICB9LFxuXG4gIHVwZGF0ZTogZnVuY3Rpb24gKGhhbmRsZXIsIG9sZEhhbmRsZXIpIHtcbiAgICBpZiAodHlwZW9mIGhhbmRsZXIgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgIF8ud2FybihcbiAgICAgICAgJ0RpcmVjdGl2ZSBcInYtZXZlbnRzOicgKyB0aGlzLmV4cHJlc3Npb24gKyAnXCIgJyArXG4gICAgICAgICdleHBlY3RzIGEgZnVuY3Rpb24gdmFsdWUuJ1xuICAgICAgKVxuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIHZhciBjaGlsZCA9IHRoaXMuZWwuX192dWVfX1xuICAgIGlmIChvbGRIYW5kbGVyKSB7XG4gICAgICBjaGlsZC4kb2ZmKHRoaXMuYXJnLCBvbGRIYW5kbGVyKVxuICAgIH1cbiAgICBjaGlsZC4kb24odGhpcy5hcmcsIGhhbmRsZXIpXG4gIH1cblxuICAvLyB3aGVuIGNoaWxkIGlzIGRlc3Ryb3llZCwgYWxsIGV2ZW50cyBhcmUgdHVybmVkIG9mZixcbiAgLy8gc28gbm8gbmVlZCBmb3IgdW5iaW5kIGhlcmUuXG5cbn0iLCJ2YXIgXyA9IHJlcXVpcmUoJy4uL3V0aWwnKVxudmFyIHRlbXBsYXRlUGFyc2VyID0gcmVxdWlyZSgnLi4vcGFyc2Vycy90ZW1wbGF0ZScpXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIGJpbmQ6IGZ1bmN0aW9uICgpIHtcbiAgICAvLyBhIGNvbW1lbnQgbm9kZSBtZWFucyB0aGlzIGlzIGEgYmluZGluZyBmb3JcbiAgICAvLyB7e3sgaW5saW5lIHVuZXNjYXBlZCBodG1sIH19fVxuICAgIGlmICh0aGlzLmVsLm5vZGVUeXBlID09PSA4KSB7XG4gICAgICAvLyBob2xkIG5vZGVzXG4gICAgICB0aGlzLm5vZGVzID0gW11cbiAgICB9XG4gIH0sXG5cbiAgdXBkYXRlOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICB2YWx1ZSA9IF8udG9TdHJpbmcodmFsdWUpXG4gICAgaWYgKHRoaXMubm9kZXMpIHtcbiAgICAgIHRoaXMuc3dhcCh2YWx1ZSlcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5lbC5pbm5lckhUTUwgPSB2YWx1ZVxuICAgIH1cbiAgfSxcblxuICBzd2FwOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAvLyByZW1vdmUgb2xkIG5vZGVzXG4gICAgdmFyIGkgPSB0aGlzLm5vZGVzLmxlbmd0aFxuICAgIHdoaWxlIChpLS0pIHtcbiAgICAgIF8ucmVtb3ZlKHRoaXMubm9kZXNbaV0pXG4gICAgfVxuICAgIC8vIGNvbnZlcnQgbmV3IHZhbHVlIHRvIGEgZnJhZ21lbnRcbiAgICAvLyBkbyBub3QgYXR0ZW1wdCB0byByZXRyaWV2ZSBmcm9tIGlkIHNlbGVjdG9yXG4gICAgdmFyIGZyYWcgPSB0ZW1wbGF0ZVBhcnNlci5wYXJzZSh2YWx1ZSwgdHJ1ZSwgdHJ1ZSlcbiAgICAvLyBzYXZlIGEgcmVmZXJlbmNlIHRvIHRoZXNlIG5vZGVzIHNvIHdlIGNhbiByZW1vdmUgbGF0ZXJcbiAgICB0aGlzLm5vZGVzID0gXy50b0FycmF5KGZyYWcuY2hpbGROb2RlcylcbiAgICBfLmJlZm9yZShmcmFnLCB0aGlzLmVsKVxuICB9XG5cbn0iLCJ2YXIgXyA9IHJlcXVpcmUoJy4uL3V0aWwnKVxudmFyIGNvbXBpbGUgPSByZXF1aXJlKCcuLi9jb21waWxlci9jb21waWxlJylcbnZhciB0ZW1wbGF0ZVBhcnNlciA9IHJlcXVpcmUoJy4uL3BhcnNlcnMvdGVtcGxhdGUnKVxudmFyIHRyYW5zaXRpb24gPSByZXF1aXJlKCcuLi90cmFuc2l0aW9uJylcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgYmluZDogZnVuY3Rpb24gKCkge1xuICAgIHZhciBlbCA9IHRoaXMuZWxcbiAgICBpZiAoIWVsLl9fdnVlX18pIHtcbiAgICAgIHRoaXMuc3RhcnQgPSBkb2N1bWVudC5jcmVhdGVDb21tZW50KCd2LWlmLXN0YXJ0JylcbiAgICAgIHRoaXMuZW5kID0gZG9jdW1lbnQuY3JlYXRlQ29tbWVudCgndi1pZi1lbmQnKVxuICAgICAgXy5yZXBsYWNlKGVsLCB0aGlzLmVuZClcbiAgICAgIF8uYmVmb3JlKHRoaXMuc3RhcnQsIHRoaXMuZW5kKVxuICAgICAgaWYgKGVsLnRhZ05hbWUgPT09ICdURU1QTEFURScpIHtcbiAgICAgICAgdGhpcy50ZW1wbGF0ZSA9IHRlbXBsYXRlUGFyc2VyLnBhcnNlKGVsLCB0cnVlKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy50ZW1wbGF0ZSA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKVxuICAgICAgICB0aGlzLnRlbXBsYXRlLmFwcGVuZENoaWxkKHRlbXBsYXRlUGFyc2VyLmNsb25lKGVsKSlcbiAgICAgIH1cbiAgICAgIC8vIGNvbXBpbGUgdGhlIG5lc3RlZCBwYXJ0aWFsXG4gICAgICB0aGlzLmxpbmtlciA9IGNvbXBpbGUoXG4gICAgICAgIHRoaXMudGVtcGxhdGUsXG4gICAgICAgIHRoaXMudm0uJG9wdGlvbnMsXG4gICAgICAgIHRydWVcbiAgICAgIClcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5pbnZhbGlkID0gdHJ1ZVxuICAgICAgXy53YXJuKFxuICAgICAgICAndi1pZj1cIicgKyB0aGlzLmV4cHJlc3Npb24gKyAnXCIgY2Fubm90IGJlICcgK1xuICAgICAgICAndXNlZCBvbiBhbiBhbHJlYWR5IG1vdW50ZWQgaW5zdGFuY2UuJ1xuICAgICAgKVxuICAgIH1cbiAgfSxcblxuICB1cGRhdGU6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgIGlmICh0aGlzLmludmFsaWQpIHJldHVyblxuICAgIGlmICh2YWx1ZSkge1xuICAgICAgLy8gYXZvaWQgZHVwbGljYXRlIGNvbXBpbGVzLCBzaW5jZSB1cGRhdGUoKSBjYW4gYmVcbiAgICAgIC8vIGNhbGxlZCB3aXRoIGRpZmZlcmVudCB0cnV0aHkgdmFsdWVzXG4gICAgICBpZiAoIXRoaXMudW5saW5rKSB7XG4gICAgICAgIHZhciBmcmFnID0gdGVtcGxhdGVQYXJzZXIuY2xvbmUodGhpcy50ZW1wbGF0ZSlcbiAgICAgICAgdGhpcy5jb21waWxlKGZyYWcpXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMudGVhcmRvd24oKVxuICAgIH1cbiAgfSxcblxuICAvLyBOT1RFOiB0aGlzIGZ1bmN0aW9uIGlzIHNoYXJlZCBpbiB2LXBhcnRpYWxcbiAgY29tcGlsZTogZnVuY3Rpb24gKGZyYWcpIHtcbiAgICB2YXIgdm0gPSB0aGlzLnZtXG4gICAgLy8gdGhlIGxpbmtlciBpcyBub3QgZ3VhcmFudGVlZCB0byBiZSBwcmVzZW50IGJlY2F1c2VcbiAgICAvLyB0aGlzIGZ1bmN0aW9uIG1pZ2h0IGdldCBjYWxsZWQgYnkgdi1wYXJ0aWFsIFxuICAgIHRoaXMudW5saW5rID0gdGhpcy5saW5rZXJcbiAgICAgID8gdGhpcy5saW5rZXIodm0sIGZyYWcpXG4gICAgICA6IHZtLiRjb21waWxlKGZyYWcpXG4gICAgdHJhbnNpdGlvbi5ibG9ja0FwcGVuZChmcmFnLCB0aGlzLmVuZCwgdm0pXG4gICAgLy8gY2FsbCBhdHRhY2hlZCBmb3IgYWxsIHRoZSBjaGlsZCBjb21wb25lbnRzIGNyZWF0ZWRcbiAgICAvLyBkdXJpbmcgdGhlIGNvbXBpbGF0aW9uXG4gICAgaWYgKF8uaW5Eb2Modm0uJGVsKSkge1xuICAgICAgdmFyIGNoaWxkcmVuID0gdGhpcy5nZXRDb250YWluZWRDb21wb25lbnRzKClcbiAgICAgIGlmIChjaGlsZHJlbikgY2hpbGRyZW4uZm9yRWFjaChjYWxsQXR0YWNoKVxuICAgIH1cbiAgfSxcblxuICAvLyBOT1RFOiB0aGlzIGZ1bmN0aW9uIGlzIHNoYXJlZCBpbiB2LXBhcnRpYWxcbiAgdGVhcmRvd246IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoIXRoaXMudW5saW5rKSByZXR1cm5cbiAgICAvLyBjb2xsZWN0IGNoaWxkcmVuIGJlZm9yZWhhbmRcbiAgICB2YXIgY2hpbGRyZW5cbiAgICBpZiAoXy5pbkRvYyh0aGlzLnZtLiRlbCkpIHtcbiAgICAgIGNoaWxkcmVuID0gdGhpcy5nZXRDb250YWluZWRDb21wb25lbnRzKClcbiAgICB9XG4gICAgdHJhbnNpdGlvbi5ibG9ja1JlbW92ZSh0aGlzLnN0YXJ0LCB0aGlzLmVuZCwgdGhpcy52bSlcbiAgICBpZiAoY2hpbGRyZW4pIGNoaWxkcmVuLmZvckVhY2goY2FsbERldGFjaClcbiAgICB0aGlzLnVubGluaygpXG4gICAgdGhpcy51bmxpbmsgPSBudWxsXG4gIH0sXG5cbiAgLy8gTk9URTogdGhpcyBmdW5jdGlvbiBpcyBzaGFyZWQgaW4gdi1wYXJ0aWFsXG4gIGdldENvbnRhaW5lZENvbXBvbmVudHM6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgdm0gPSB0aGlzLnZtXG4gICAgdmFyIHN0YXJ0ID0gdGhpcy5zdGFydC5uZXh0U2libGluZ1xuICAgIHZhciBlbmQgPSB0aGlzLmVuZFxuICAgIHZhciBzZWxmQ29tcG9lbnRzID1cbiAgICAgIHZtLl9jaGlsZHJlbi5sZW5ndGggJiZcbiAgICAgIHZtLl9jaGlsZHJlbi5maWx0ZXIoY29udGFpbnMpXG4gICAgdmFyIHRyYW5zQ29tcG9uZW50cyA9XG4gICAgICB2bS5fdHJhbnNDcG50cyAmJlxuICAgICAgdm0uX3RyYW5zQ3BudHMuZmlsdGVyKGNvbnRhaW5zKVxuXG4gICAgZnVuY3Rpb24gY29udGFpbnMgKGMpIHtcbiAgICAgIHZhciBjdXIgPSBzdGFydFxuICAgICAgdmFyIG5leHRcbiAgICAgIHdoaWxlIChuZXh0ICE9PSBlbmQpIHtcbiAgICAgICAgbmV4dCA9IGN1ci5uZXh0U2libGluZ1xuICAgICAgICBpZiAoY3VyLmNvbnRhaW5zKGMuJGVsKSkge1xuICAgICAgICAgIHJldHVybiB0cnVlXG4gICAgICAgIH1cbiAgICAgICAgY3VyID0gbmV4dFxuICAgICAgfVxuICAgICAgcmV0dXJuIGZhbHNlXG4gICAgfVxuXG4gICAgcmV0dXJuIHNlbGZDb21wb2VudHNcbiAgICAgID8gdHJhbnNDb21wb25lbnRzXG4gICAgICAgID8gc2VsZkNvbXBvZW50cy5jb25jYXQodHJhbnNDb21wb25lbnRzKVxuICAgICAgICA6IHNlbGZDb21wb2VudHNcbiAgICAgIDogdHJhbnNDb21wb25lbnRzXG4gIH0sXG5cbiAgLy8gTk9URTogdGhpcyBmdW5jdGlvbiBpcyBzaGFyZWQgaW4gdi1wYXJ0aWFsXG4gIHVuYmluZDogZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLnVubGluaykgdGhpcy51bmxpbmsoKVxuICB9XG5cbn1cblxuZnVuY3Rpb24gY2FsbEF0dGFjaCAoY2hpbGQpIHtcbiAgaWYgKCFjaGlsZC5faXNBdHRhY2hlZCkge1xuICAgIGNoaWxkLl9jYWxsSG9vaygnYXR0YWNoZWQnKVxuICB9XG59XG5cbmZ1bmN0aW9uIGNhbGxEZXRhY2ggKGNoaWxkKSB7XG4gIGlmIChjaGlsZC5faXNBdHRhY2hlZCkge1xuICAgIGNoaWxkLl9jYWxsSG9vaygnZGV0YWNoZWQnKVxuICB9XG59IiwiLy8gbWFuaXB1bGF0aW9uIGRpcmVjdGl2ZXNcbmV4cG9ydHMudGV4dCAgICAgICA9IHJlcXVpcmUoJy4vdGV4dCcpXG5leHBvcnRzLmh0bWwgICAgICAgPSByZXF1aXJlKCcuL2h0bWwnKVxuZXhwb3J0cy5hdHRyICAgICAgID0gcmVxdWlyZSgnLi9hdHRyJylcbmV4cG9ydHMuc2hvdyAgICAgICA9IHJlcXVpcmUoJy4vc2hvdycpXG5leHBvcnRzWydjbGFzcyddICAgPSByZXF1aXJlKCcuL2NsYXNzJylcbmV4cG9ydHMuZWwgICAgICAgICA9IHJlcXVpcmUoJy4vZWwnKVxuZXhwb3J0cy5yZWYgICAgICAgID0gcmVxdWlyZSgnLi9yZWYnKVxuZXhwb3J0cy5jbG9hayAgICAgID0gcmVxdWlyZSgnLi9jbG9haycpXG5leHBvcnRzLnN0eWxlICAgICAgPSByZXF1aXJlKCcuL3N0eWxlJylcbmV4cG9ydHMucGFydGlhbCAgICA9IHJlcXVpcmUoJy4vcGFydGlhbCcpXG5leHBvcnRzLnRyYW5zaXRpb24gPSByZXF1aXJlKCcuL3RyYW5zaXRpb24nKVxuXG4vLyBldmVudCBsaXN0ZW5lciBkaXJlY3RpdmVzXG5leHBvcnRzLm9uICAgICAgICAgPSByZXF1aXJlKCcuL29uJylcbmV4cG9ydHMubW9kZWwgICAgICA9IHJlcXVpcmUoJy4vbW9kZWwnKVxuXG4vLyBjaGlsZCB2bSBkaXJlY3RpdmVzXG5leHBvcnRzLmNvbXBvbmVudCAgPSByZXF1aXJlKCcuL2NvbXBvbmVudCcpXG5leHBvcnRzLnJlcGVhdCAgICAgPSByZXF1aXJlKCcuL3JlcGVhdCcpXG5leHBvcnRzWydpZiddICAgICAgPSByZXF1aXJlKCcuL2lmJylcblxuLy8gY2hpbGQgdm0gY29tbXVuaWNhdGlvbiBkaXJlY3RpdmVzXG5leHBvcnRzWyd3aXRoJ10gICAgPSByZXF1aXJlKCcuL3dpdGgnKVxuZXhwb3J0cy5ldmVudHMgICAgID0gcmVxdWlyZSgnLi9ldmVudHMnKSIsInZhciBfID0gcmVxdWlyZSgnLi4vLi4vdXRpbCcpXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIGJpbmQ6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXNcbiAgICB2YXIgZWwgPSB0aGlzLmVsXG4gICAgdGhpcy5saXN0ZW5lciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHNlbGYuc2V0KGVsLmNoZWNrZWQsIHRydWUpXG4gICAgfVxuICAgIF8ub24oZWwsICdjaGFuZ2UnLCB0aGlzLmxpc3RlbmVyKVxuICAgIGlmIChlbC5jaGVja2VkKSB7XG4gICAgICB0aGlzLl9pbml0VmFsdWUgPSBlbC5jaGVja2VkXG4gICAgfVxuICB9LFxuXG4gIHVwZGF0ZTogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgdGhpcy5lbC5jaGVja2VkID0gISF2YWx1ZVxuICB9LFxuXG4gIHVuYmluZDogZnVuY3Rpb24gKCkge1xuICAgIF8ub2ZmKHRoaXMuZWwsICdjaGFuZ2UnLCB0aGlzLmxpc3RlbmVyKVxuICB9XG5cbn0iLCJ2YXIgXyA9IHJlcXVpcmUoJy4uLy4uL3V0aWwnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICBiaW5kOiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzXG4gICAgdmFyIGVsID0gdGhpcy5lbFxuXG4gICAgLy8gY2hlY2sgcGFyYW1zXG4gICAgLy8gLSBsYXp5OiB1cGRhdGUgbW9kZWwgb24gXCJjaGFuZ2VcIiBpbnN0ZWFkIG9mIFwiaW5wdXRcIlxuICAgIHZhciBsYXp5ID0gdGhpcy5fY2hlY2tQYXJhbSgnbGF6eScpICE9IG51bGxcbiAgICAvLyAtIG51bWJlcjogY2FzdCB2YWx1ZSBpbnRvIG51bWJlciB3aGVuIHVwZGF0aW5nIG1vZGVsLlxuICAgIHZhciBudW1iZXIgPSB0aGlzLl9jaGVja1BhcmFtKCdudW1iZXInKSAhPSBudWxsXG4gICAgLy8gLSBkZWJvdW5jZTogZGVib3VuY2UgdGhlIGlucHV0IGxpc3RlbmVyXG4gICAgdmFyIGRlYm91bmNlID0gcGFyc2VJbnQodGhpcy5fY2hlY2tQYXJhbSgnZGVib3VuY2UnKSwgMTApXG5cbiAgICAvLyBoYW5kbGUgY29tcG9zaXRpb24gZXZlbnRzLlxuICAgIC8vIGh0dHA6Ly9ibG9nLmV2YW55b3UubWUvMjAxNC8wMS8wMy9jb21wb3NpdGlvbi1ldmVudC9cbiAgICB2YXIgY3BMb2NrZWQgPSBmYWxzZVxuICAgIHRoaXMuY3BMb2NrID0gZnVuY3Rpb24gKCkge1xuICAgICAgY3BMb2NrZWQgPSB0cnVlXG4gICAgfVxuICAgIHRoaXMuY3BVbmxvY2sgPSBmdW5jdGlvbiAoKSB7XG4gICAgICBjcExvY2tlZCA9IGZhbHNlXG4gICAgICAvLyBpbiBJRTExIHRoZSBcImNvbXBvc2l0aW9uZW5kXCIgZXZlbnQgZmlyZXMgQUZURVJcbiAgICAgIC8vIHRoZSBcImlucHV0XCIgZXZlbnQsIHNvIHRoZSBpbnB1dCBoYW5kbGVyIGlzIGJsb2NrZWRcbiAgICAgIC8vIGF0IHRoZSBlbmQuLi4gaGF2ZSB0byBjYWxsIGl0IGhlcmUuXG4gICAgICBzZXQoKVxuICAgIH1cbiAgICBfLm9uKGVsLCdjb21wb3NpdGlvbnN0YXJ0JywgdGhpcy5jcExvY2spXG4gICAgXy5vbihlbCwnY29tcG9zaXRpb25lbmQnLCB0aGlzLmNwVW5sb2NrKVxuXG4gICAgLy8gc2hhcmVkIHNldHRlclxuICAgIGZ1bmN0aW9uIHNldCAoKSB7XG4gICAgICBzZWxmLnNldChcbiAgICAgICAgbnVtYmVyID8gXy50b051bWJlcihlbC52YWx1ZSkgOiBlbC52YWx1ZSxcbiAgICAgICAgdHJ1ZVxuICAgICAgKVxuICAgIH1cblxuICAgIC8vIGlmIHRoZSBkaXJlY3RpdmUgaGFzIGZpbHRlcnMsIHdlIG5lZWQgdG9cbiAgICAvLyByZWNvcmQgY3Vyc29yIHBvc2l0aW9uIGFuZCByZXN0b3JlIGl0IGFmdGVyIHVwZGF0aW5nXG4gICAgLy8gdGhlIGlucHV0IHdpdGggdGhlIGZpbHRlcmVkIHZhbHVlLlxuICAgIC8vIGFsc28gZm9yY2UgdXBkYXRlIGZvciB0eXBlPVwicmFuZ2VcIiBpbnB1dHMgdG8gZW5hYmxlXG4gICAgLy8gXCJsb2NrIGluIHJhbmdlXCIgKHNlZSAjNTA2KVxuICAgIHZhciBoYXNSZWFkRmlsdGVyID0gdGhpcy5maWx0ZXJzICYmIHRoaXMuZmlsdGVycy5yZWFkXG4gICAgdGhpcy5saXN0ZW5lciA9IGhhc1JlYWRGaWx0ZXIgfHwgZWwudHlwZSA9PT0gJ3JhbmdlJ1xuICAgICAgPyBmdW5jdGlvbiB0ZXh0SW5wdXRMaXN0ZW5lciAoKSB7XG4gICAgICAgICAgaWYgKGNwTG9ja2VkKSByZXR1cm5cbiAgICAgICAgICB2YXIgY2hhcnNPZmZzZXRcbiAgICAgICAgICAvLyBzb21lIEhUTUw1IGlucHV0IHR5cGVzIHRocm93IGVycm9yIGhlcmVcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gcmVjb3JkIGhvdyBtYW55IGNoYXJzIGZyb20gdGhlIGVuZCBvZiBpbnB1dFxuICAgICAgICAgICAgLy8gdGhlIGN1cnNvciB3YXMgYXRcbiAgICAgICAgICAgIGNoYXJzT2Zmc2V0ID0gZWwudmFsdWUubGVuZ3RoIC0gZWwuc2VsZWN0aW9uU3RhcnRcbiAgICAgICAgICB9IGNhdGNoIChlKSB7fVxuICAgICAgICAgIC8vIEZpeCBJRTEwLzExIGluZmluaXRlIHVwZGF0ZSBjeWNsZVxuICAgICAgICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS95eXg5OTA4MDMvdnVlL2lzc3Vlcy81OTJcbiAgICAgICAgICAvKiBpc3RhbmJ1bCBpZ25vcmUgaWYgKi9cbiAgICAgICAgICBpZiAoY2hhcnNPZmZzZXQgPCAwKSB7XG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICB9XG4gICAgICAgICAgc2V0KClcbiAgICAgICAgICBfLm5leHRUaWNrKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIC8vIGZvcmNlIGEgdmFsdWUgdXBkYXRlLCBiZWNhdXNlIGluXG4gICAgICAgICAgICAvLyBjZXJ0YWluIGNhc2VzIHRoZSB3cml0ZSBmaWx0ZXJzIG91dHB1dCB0aGVcbiAgICAgICAgICAgIC8vIHNhbWUgcmVzdWx0IGZvciBkaWZmZXJlbnQgaW5wdXQgdmFsdWVzLCBhbmRcbiAgICAgICAgICAgIC8vIHRoZSBPYnNlcnZlciBzZXQgZXZlbnRzIHdvbid0IGJlIHRyaWdnZXJlZC5cbiAgICAgICAgICAgIHZhciBuZXdWYWwgPSBzZWxmLl93YXRjaGVyLnZhbHVlXG4gICAgICAgICAgICBzZWxmLnVwZGF0ZShuZXdWYWwpXG4gICAgICAgICAgICBpZiAoY2hhcnNPZmZzZXQgIT0gbnVsbCkge1xuICAgICAgICAgICAgICB2YXIgY3Vyc29yUG9zID1cbiAgICAgICAgICAgICAgICBfLnRvU3RyaW5nKG5ld1ZhbCkubGVuZ3RoIC0gY2hhcnNPZmZzZXRcbiAgICAgICAgICAgICAgZWwuc2V0U2VsZWN0aW9uUmFuZ2UoY3Vyc29yUG9zLCBjdXJzb3JQb3MpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgOiBmdW5jdGlvbiB0ZXh0SW5wdXRMaXN0ZW5lciAoKSB7XG4gICAgICAgICAgaWYgKGNwTG9ja2VkKSByZXR1cm5cbiAgICAgICAgICBzZXQoKVxuICAgICAgICB9XG5cbiAgICBpZiAoZGVib3VuY2UpIHtcbiAgICAgIHRoaXMubGlzdGVuZXIgPSBfLmRlYm91bmNlKHRoaXMubGlzdGVuZXIsIGRlYm91bmNlKVxuICAgIH1cbiAgICB0aGlzLmV2ZW50ID0gbGF6eSA/ICdjaGFuZ2UnIDogJ2lucHV0J1xuICAgIC8vIFN1cHBvcnQgalF1ZXJ5IGV2ZW50cywgc2luY2UgalF1ZXJ5LnRyaWdnZXIoKSBkb2Vzbid0XG4gICAgLy8gdHJpZ2dlciBuYXRpdmUgZXZlbnRzIGluIHNvbWUgY2FzZXMgYW5kIHNvbWUgcGx1Z2luc1xuICAgIC8vIHJlbHkgb24gJC50cmlnZ2VyKClcbiAgICAvLyBcbiAgICAvLyBXZSB3YW50IHRvIG1ha2Ugc3VyZSBpZiBhIGxpc3RlbmVyIGlzIGF0dGFjaGVkIHVzaW5nXG4gICAgLy8galF1ZXJ5LCBpdCBpcyBhbHNvIHJlbW92ZWQgd2l0aCBqUXVlcnksIHRoYXQncyB3aHlcbiAgICAvLyB3ZSBkbyB0aGUgY2hlY2sgZm9yIGVhY2ggZGlyZWN0aXZlIGluc3RhbmNlIGFuZFxuICAgIC8vIHN0b3JlIHRoYXQgY2hlY2sgcmVzdWx0IG9uIGl0c2VsZi4gVGhpcyBhbHNvIGFsbG93c1xuICAgIC8vIGVhc2llciB0ZXN0IGNvdmVyYWdlIGNvbnRyb2wgYnkgdW5zZXR0aW5nIHRoZSBnbG9iYWxcbiAgICAvLyBqUXVlcnkgdmFyaWFibGUgaW4gdGVzdHMuXG4gICAgdGhpcy5oYXNqUXVlcnkgPSB0eXBlb2YgalF1ZXJ5ID09PSAnZnVuY3Rpb24nXG4gICAgaWYgKHRoaXMuaGFzalF1ZXJ5KSB7XG4gICAgICBqUXVlcnkoZWwpLm9uKHRoaXMuZXZlbnQsIHRoaXMubGlzdGVuZXIpXG4gICAgfSBlbHNlIHtcbiAgICAgIF8ub24oZWwsIHRoaXMuZXZlbnQsIHRoaXMubGlzdGVuZXIpXG4gICAgfVxuXG4gICAgLy8gSUU5IGRvZXNuJ3QgZmlyZSBpbnB1dCBldmVudCBvbiBiYWNrc3BhY2UvZGVsL2N1dFxuICAgIGlmICghbGF6eSAmJiBfLmlzSUU5KSB7XG4gICAgICB0aGlzLm9uQ3V0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBfLm5leHRUaWNrKHNlbGYubGlzdGVuZXIpXG4gICAgICB9XG4gICAgICB0aGlzLm9uRGVsID0gZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgaWYgKGUua2V5Q29kZSA9PT0gNDYgfHwgZS5rZXlDb2RlID09PSA4KSB7XG4gICAgICAgICAgc2VsZi5saXN0ZW5lcigpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIF8ub24oZWwsICdjdXQnLCB0aGlzLm9uQ3V0KVxuICAgICAgXy5vbihlbCwgJ2tleXVwJywgdGhpcy5vbkRlbClcbiAgICB9XG5cbiAgICAvLyBzZXQgaW5pdGlhbCB2YWx1ZSBpZiBwcmVzZW50XG4gICAgaWYgKFxuICAgICAgZWwuaGFzQXR0cmlidXRlKCd2YWx1ZScpIHx8XG4gICAgICAoZWwudGFnTmFtZSA9PT0gJ1RFWFRBUkVBJyAmJiBlbC52YWx1ZS50cmltKCkpXG4gICAgKSB7XG4gICAgICB0aGlzLl9pbml0VmFsdWUgPSBudW1iZXJcbiAgICAgICAgPyBfLnRvTnVtYmVyKGVsLnZhbHVlKVxuICAgICAgICA6IGVsLnZhbHVlXG4gICAgfVxuICB9LFxuXG4gIHVwZGF0ZTogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgdGhpcy5lbC52YWx1ZSA9IF8udG9TdHJpbmcodmFsdWUpXG4gIH0sXG5cbiAgdW5iaW5kOiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGVsID0gdGhpcy5lbFxuICAgIGlmICh0aGlzLmhhc2pRdWVyeSkge1xuICAgICAgalF1ZXJ5KGVsKS5vZmYodGhpcy5ldmVudCwgdGhpcy5saXN0ZW5lcilcbiAgICB9IGVsc2Uge1xuICAgICAgXy5vZmYoZWwsIHRoaXMuZXZlbnQsIHRoaXMubGlzdGVuZXIpXG4gICAgfVxuICAgIF8ub2ZmKGVsLCdjb21wb3NpdGlvbnN0YXJ0JywgdGhpcy5jcExvY2spXG4gICAgXy5vZmYoZWwsJ2NvbXBvc2l0aW9uZW5kJywgdGhpcy5jcFVubG9jaylcbiAgICBpZiAodGhpcy5vbkN1dCkge1xuICAgICAgXy5vZmYoZWwsJ2N1dCcsIHRoaXMub25DdXQpXG4gICAgICBfLm9mZihlbCwna2V5dXAnLCB0aGlzLm9uRGVsKVxuICAgIH1cbiAgfVxuXG59IiwidmFyIF8gPSByZXF1aXJlKCcuLi8uLi91dGlsJylcblxudmFyIGhhbmRsZXJzID0ge1xuICBfZGVmYXVsdDogcmVxdWlyZSgnLi9kZWZhdWx0JyksXG4gIHJhZGlvOiByZXF1aXJlKCcuL3JhZGlvJyksXG4gIHNlbGVjdDogcmVxdWlyZSgnLi9zZWxlY3QnKSxcbiAgY2hlY2tib3g6IHJlcXVpcmUoJy4vY2hlY2tib3gnKVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICBwcmlvcml0eTogODAwLFxuICB0d29XYXk6IHRydWUsXG4gIGhhbmRsZXJzOiBoYW5kbGVycyxcblxuICAvKipcbiAgICogUG9zc2libGUgZWxlbWVudHM6XG4gICAqICAgPHNlbGVjdD5cbiAgICogICA8dGV4dGFyZWE+XG4gICAqICAgPGlucHV0IHR5cGU9XCIqXCI+XG4gICAqICAgICAtIHRleHRcbiAgICogICAgIC0gY2hlY2tib3hcbiAgICogICAgIC0gcmFkaW9cbiAgICogICAgIC0gbnVtYmVyXG4gICAqICAgICAtIFRPRE86IG1vcmUgdHlwZXMgbWF5IGJlIHN1cHBsaWVkIGFzIGEgcGx1Z2luXG4gICAqL1xuXG4gIGJpbmQ6IGZ1bmN0aW9uICgpIHtcbiAgICAvLyBmcmllbmRseSB3YXJuaW5nLi4uXG4gICAgdmFyIGZpbHRlcnMgPSB0aGlzLmZpbHRlcnNcbiAgICBpZiAoZmlsdGVycyAmJiBmaWx0ZXJzLnJlYWQgJiYgIWZpbHRlcnMud3JpdGUpIHtcbiAgICAgIF8ud2FybihcbiAgICAgICAgJ0l0IHNlZW1zIHlvdSBhcmUgdXNpbmcgYSByZWFkLW9ubHkgZmlsdGVyIHdpdGggJyArXG4gICAgICAgICd2LW1vZGVsLiBZb3UgbWlnaHQgd2FudCB0byB1c2UgYSB0d28td2F5IGZpbHRlciAnICtcbiAgICAgICAgJ3RvIGVuc3VyZSBjb3JyZWN0IGJlaGF2aW9yLidcbiAgICAgIClcbiAgICB9XG4gICAgdmFyIGVsID0gdGhpcy5lbFxuICAgIHZhciB0YWcgPSBlbC50YWdOYW1lXG4gICAgdmFyIGhhbmRsZXJcbiAgICBpZiAodGFnID09PSAnSU5QVVQnKSB7XG4gICAgICBoYW5kbGVyID0gaGFuZGxlcnNbZWwudHlwZV0gfHwgaGFuZGxlcnMuX2RlZmF1bHRcbiAgICB9IGVsc2UgaWYgKHRhZyA9PT0gJ1NFTEVDVCcpIHtcbiAgICAgIGhhbmRsZXIgPSBoYW5kbGVycy5zZWxlY3RcbiAgICB9IGVsc2UgaWYgKHRhZyA9PT0gJ1RFWFRBUkVBJykge1xuICAgICAgaGFuZGxlciA9IGhhbmRsZXJzLl9kZWZhdWx0XG4gICAgfSBlbHNlIHtcbiAgICAgIF8ud2FybihcInYtbW9kZWwgZG9lc24ndCBzdXBwb3J0IGVsZW1lbnQgdHlwZTogXCIgKyB0YWcpXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgaGFuZGxlci5iaW5kLmNhbGwodGhpcylcbiAgICB0aGlzLnVwZGF0ZSA9IGhhbmRsZXIudXBkYXRlXG4gICAgdGhpcy51bmJpbmQgPSBoYW5kbGVyLnVuYmluZFxuICB9XG5cbn0iLCJ2YXIgXyA9IHJlcXVpcmUoJy4uLy4uL3V0aWwnKVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICBiaW5kOiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzXG4gICAgdmFyIGVsID0gdGhpcy5lbFxuICAgIHRoaXMubGlzdGVuZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICBzZWxmLnNldChlbC52YWx1ZSwgdHJ1ZSlcbiAgICB9XG4gICAgXy5vbihlbCwgJ2NoYW5nZScsIHRoaXMubGlzdGVuZXIpXG4gICAgaWYgKGVsLmNoZWNrZWQpIHtcbiAgICAgIHRoaXMuX2luaXRWYWx1ZSA9IGVsLnZhbHVlXG4gICAgfVxuICB9LFxuXG4gIHVwZGF0ZTogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgLyoganNoaW50IGVxZXFlcTogZmFsc2UgKi9cbiAgICB0aGlzLmVsLmNoZWNrZWQgPSB2YWx1ZSA9PSB0aGlzLmVsLnZhbHVlXG4gIH0sXG5cbiAgdW5iaW5kOiBmdW5jdGlvbiAoKSB7XG4gICAgXy5vZmYodGhpcy5lbCwgJ2NoYW5nZScsIHRoaXMubGlzdGVuZXIpXG4gIH1cblxufSIsInZhciBfID0gcmVxdWlyZSgnLi4vLi4vdXRpbCcpXG52YXIgV2F0Y2hlciA9IHJlcXVpcmUoJy4uLy4uL3dhdGNoZXInKVxudmFyIGRpclBhcnNlciA9IHJlcXVpcmUoJy4uLy4uL3BhcnNlcnMvZGlyZWN0aXZlJylcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgYmluZDogZnVuY3Rpb24gKCkge1xuICAgIHZhciBzZWxmID0gdGhpc1xuICAgIHZhciBlbCA9IHRoaXMuZWxcbiAgICAvLyBjaGVjayBvcHRpb25zIHBhcmFtXG4gICAgdmFyIG9wdGlvbnNQYXJhbSA9IHRoaXMuX2NoZWNrUGFyYW0oJ29wdGlvbnMnKVxuICAgIGlmIChvcHRpb25zUGFyYW0pIHtcbiAgICAgIGluaXRPcHRpb25zLmNhbGwodGhpcywgb3B0aW9uc1BhcmFtKVxuICAgIH1cbiAgICB0aGlzLm51bWJlciA9IHRoaXMuX2NoZWNrUGFyYW0oJ251bWJlcicpICE9IG51bGxcbiAgICB0aGlzLm11bHRpcGxlID0gZWwuaGFzQXR0cmlidXRlKCdtdWx0aXBsZScpXG4gICAgdGhpcy5saXN0ZW5lciA9IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciB2YWx1ZSA9IHNlbGYubXVsdGlwbGVcbiAgICAgICAgPyBnZXRNdWx0aVZhbHVlKGVsKVxuICAgICAgICA6IGVsLnZhbHVlXG4gICAgICB2YWx1ZSA9IHNlbGYubnVtYmVyXG4gICAgICAgID8gXy5pc0FycmF5KHZhbHVlKVxuICAgICAgICAgID8gdmFsdWUubWFwKF8udG9OdW1iZXIpXG4gICAgICAgICAgOiBfLnRvTnVtYmVyKHZhbHVlKVxuICAgICAgICA6IHZhbHVlXG4gICAgICBzZWxmLnNldCh2YWx1ZSwgdHJ1ZSlcbiAgICB9XG4gICAgXy5vbihlbCwgJ2NoYW5nZScsIHRoaXMubGlzdGVuZXIpXG4gICAgY2hlY2tJbml0aWFsVmFsdWUuY2FsbCh0aGlzKVxuICB9LFxuXG4gIHVwZGF0ZTogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgLyoganNoaW50IGVxZXFlcTogZmFsc2UgKi9cbiAgICB2YXIgZWwgPSB0aGlzLmVsXG4gICAgZWwuc2VsZWN0ZWRJbmRleCA9IC0xXG4gICAgdmFyIG11bHRpID0gdGhpcy5tdWx0aXBsZSAmJiBfLmlzQXJyYXkodmFsdWUpXG4gICAgdmFyIG9wdGlvbnMgPSBlbC5vcHRpb25zXG4gICAgdmFyIGkgPSBvcHRpb25zLmxlbmd0aFxuICAgIHZhciBvcHRpb25cbiAgICB3aGlsZSAoaS0tKSB7XG4gICAgICBvcHRpb24gPSBvcHRpb25zW2ldXG4gICAgICBvcHRpb24uc2VsZWN0ZWQgPSBtdWx0aVxuICAgICAgICA/IGluZGV4T2YodmFsdWUsIG9wdGlvbi52YWx1ZSkgPiAtMVxuICAgICAgICA6IHZhbHVlID09IG9wdGlvbi52YWx1ZVxuICAgIH1cbiAgfSxcblxuICB1bmJpbmQ6IGZ1bmN0aW9uICgpIHtcbiAgICBfLm9mZih0aGlzLmVsLCAnY2hhbmdlJywgdGhpcy5saXN0ZW5lcilcbiAgICBpZiAodGhpcy5vcHRpb25XYXRjaGVyKSB7XG4gICAgICB0aGlzLm9wdGlvbldhdGNoZXIudGVhcmRvd24oKVxuICAgIH1cbiAgfVxuXG59XG5cbi8qKlxuICogSW5pdGlhbGl6ZSB0aGUgb3B0aW9uIGxpc3QgZnJvbSB0aGUgcGFyYW0uXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV4cHJlc3Npb25cbiAqL1xuXG5mdW5jdGlvbiBpbml0T3B0aW9ucyAoZXhwcmVzc2lvbikge1xuICB2YXIgc2VsZiA9IHRoaXNcbiAgdmFyIGRlc2NyaXB0b3IgPSBkaXJQYXJzZXIucGFyc2UoZXhwcmVzc2lvbilbMF1cbiAgZnVuY3Rpb24gb3B0aW9uVXBkYXRlV2F0Y2hlciAodmFsdWUpIHtcbiAgICBpZiAoXy5pc0FycmF5KHZhbHVlKSkge1xuICAgICAgc2VsZi5lbC5pbm5lckhUTUwgPSAnJ1xuICAgICAgYnVpbGRPcHRpb25zKHNlbGYuZWwsIHZhbHVlKVxuICAgICAgaWYgKHNlbGYuX3dhdGNoZXIpIHtcbiAgICAgICAgc2VsZi51cGRhdGUoc2VsZi5fd2F0Y2hlci52YWx1ZSlcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgXy53YXJuKCdJbnZhbGlkIG9wdGlvbnMgdmFsdWUgZm9yIHYtbW9kZWw6ICcgKyB2YWx1ZSlcbiAgICB9XG4gIH1cbiAgdGhpcy5vcHRpb25XYXRjaGVyID0gbmV3IFdhdGNoZXIoXG4gICAgdGhpcy52bSxcbiAgICBkZXNjcmlwdG9yLmV4cHJlc3Npb24sXG4gICAgb3B0aW9uVXBkYXRlV2F0Y2hlcixcbiAgICB7XG4gICAgICBkZWVwOiB0cnVlLFxuICAgICAgZmlsdGVyczogXy5yZXNvbHZlRmlsdGVycyh0aGlzLnZtLCBkZXNjcmlwdG9yLmZpbHRlcnMpXG4gICAgfVxuICApXG4gIC8vIHVwZGF0ZSB3aXRoIGluaXRpYWwgdmFsdWVcbiAgb3B0aW9uVXBkYXRlV2F0Y2hlcih0aGlzLm9wdGlvbldhdGNoZXIudmFsdWUpXG59XG5cbi8qKlxuICogQnVpbGQgdXAgb3B0aW9uIGVsZW1lbnRzLiBJRTkgZG9lc24ndCBjcmVhdGUgb3B0aW9uc1xuICogd2hlbiBzZXR0aW5nIGlubmVySFRNTCBvbiA8c2VsZWN0PiBlbGVtZW50cywgc28gd2UgaGF2ZVxuICogdG8gdXNlIERPTSBBUEkgaGVyZS5cbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IHBhcmVudCAtIGEgPHNlbGVjdD4gb3IgYW4gPG9wdGdyb3VwPlxuICogQHBhcmFtIHtBcnJheX0gb3B0aW9uc1xuICovXG5cbmZ1bmN0aW9uIGJ1aWxkT3B0aW9ucyAocGFyZW50LCBvcHRpb25zKSB7XG4gIHZhciBvcCwgZWxcbiAgZm9yICh2YXIgaSA9IDAsIGwgPSBvcHRpb25zLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgIG9wID0gb3B0aW9uc1tpXVxuICAgIGlmICghb3Aub3B0aW9ucykge1xuICAgICAgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdvcHRpb24nKVxuICAgICAgaWYgKHR5cGVvZiBvcCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgZWwudGV4dCA9IGVsLnZhbHVlID0gb3BcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGVsLnRleHQgPSBvcC50ZXh0XG4gICAgICAgIGVsLnZhbHVlID0gb3AudmFsdWVcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdvcHRncm91cCcpXG4gICAgICBlbC5sYWJlbCA9IG9wLmxhYmVsXG4gICAgICBidWlsZE9wdGlvbnMoZWwsIG9wLm9wdGlvbnMpXG4gICAgfVxuICAgIHBhcmVudC5hcHBlbmRDaGlsZChlbClcbiAgfVxufVxuXG4vKipcbiAqIENoZWNrIHRoZSBpbml0aWFsIHZhbHVlIGZvciBzZWxlY3RlZCBvcHRpb25zLlxuICovXG5cbmZ1bmN0aW9uIGNoZWNrSW5pdGlhbFZhbHVlICgpIHtcbiAgdmFyIGluaXRWYWx1ZVxuICB2YXIgb3B0aW9ucyA9IHRoaXMuZWwub3B0aW9uc1xuICBmb3IgKHZhciBpID0gMCwgbCA9IG9wdGlvbnMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgaWYgKG9wdGlvbnNbaV0uaGFzQXR0cmlidXRlKCdzZWxlY3RlZCcpKSB7XG4gICAgICBpZiAodGhpcy5tdWx0aXBsZSkge1xuICAgICAgICAoaW5pdFZhbHVlIHx8IChpbml0VmFsdWUgPSBbXSkpXG4gICAgICAgICAgLnB1c2gob3B0aW9uc1tpXS52YWx1ZSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGluaXRWYWx1ZSA9IG9wdGlvbnNbaV0udmFsdWVcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgaWYgKHR5cGVvZiBpbml0VmFsdWUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgdGhpcy5faW5pdFZhbHVlID0gdGhpcy5udW1iZXJcbiAgICAgID8gXy50b051bWJlcihpbml0VmFsdWUpXG4gICAgICA6IGluaXRWYWx1ZVxuICB9XG59XG5cbi8qKlxuICogSGVscGVyIHRvIGV4dHJhY3QgYSB2YWx1ZSBhcnJheSBmb3Igc2VsZWN0W211bHRpcGxlXVxuICpcbiAqIEBwYXJhbSB7U2VsZWN0RWxlbWVudH0gZWxcbiAqIEByZXR1cm4ge0FycmF5fVxuICovXG5cbmZ1bmN0aW9uIGdldE11bHRpVmFsdWUgKGVsKSB7XG4gIHJldHVybiBBcnJheS5wcm90b3R5cGUuZmlsdGVyXG4gICAgLmNhbGwoZWwub3B0aW9ucywgZmlsdGVyU2VsZWN0ZWQpXG4gICAgLm1hcChnZXRPcHRpb25WYWx1ZSlcbn1cblxuZnVuY3Rpb24gZmlsdGVyU2VsZWN0ZWQgKG9wKSB7XG4gIHJldHVybiBvcC5zZWxlY3RlZFxufVxuXG5mdW5jdGlvbiBnZXRPcHRpb25WYWx1ZSAob3ApIHtcbiAgcmV0dXJuIG9wLnZhbHVlIHx8IG9wLnRleHRcbn1cblxuLyoqXG4gKiBOYXRpdmUgQXJyYXkuaW5kZXhPZiB1c2VzIHN0cmljdCBlcXVhbCwgYnV0IGluIHRoaXNcbiAqIGNhc2Ugd2UgbmVlZCB0byBtYXRjaCBzdHJpbmcvbnVtYmVycyB3aXRoIHNvZnQgZXF1YWwuXG4gKlxuICogQHBhcmFtIHtBcnJheX0gYXJyXG4gKiBAcGFyYW0geyp9IHZhbFxuICovXG5cbmZ1bmN0aW9uIGluZGV4T2YgKGFyciwgdmFsKSB7XG4gIC8qIGpzaGludCBlcWVxZXE6IGZhbHNlICovXG4gIHZhciBpID0gYXJyLmxlbmd0aFxuICB3aGlsZSAoaS0tKSB7XG4gICAgaWYgKGFycltpXSA9PSB2YWwpIHJldHVybiBpXG4gIH1cbiAgcmV0dXJuIC0xXG59IiwidmFyIF8gPSByZXF1aXJlKCcuLi91dGlsJylcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgYWNjZXB0U3RhdGVtZW50OiB0cnVlLFxuICBwcmlvcml0eTogNzAwLFxuXG4gIGJpbmQ6IGZ1bmN0aW9uICgpIHtcbiAgICAvLyBkZWFsIHdpdGggaWZyYW1lc1xuICAgIGlmIChcbiAgICAgIHRoaXMuZWwudGFnTmFtZSA9PT0gJ0lGUkFNRScgJiZcbiAgICAgIHRoaXMuYXJnICE9PSAnbG9hZCdcbiAgICApIHtcbiAgICAgIHZhciBzZWxmID0gdGhpc1xuICAgICAgdGhpcy5pZnJhbWVCaW5kID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBfLm9uKHNlbGYuZWwuY29udGVudFdpbmRvdywgc2VsZi5hcmcsIHNlbGYuaGFuZGxlcilcbiAgICAgIH1cbiAgICAgIF8ub24odGhpcy5lbCwgJ2xvYWQnLCB0aGlzLmlmcmFtZUJpbmQpXG4gICAgfVxuICB9LFxuXG4gIHVwZGF0ZTogZnVuY3Rpb24gKGhhbmRsZXIpIHtcbiAgICBpZiAodHlwZW9mIGhhbmRsZXIgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgIF8ud2FybihcbiAgICAgICAgJ0RpcmVjdGl2ZSBcInYtb246JyArIHRoaXMuZXhwcmVzc2lvbiArICdcIiAnICtcbiAgICAgICAgJ2V4cGVjdHMgYSBmdW5jdGlvbiB2YWx1ZS4nXG4gICAgICApXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgdGhpcy5yZXNldCgpXG4gICAgdmFyIHZtID0gdGhpcy52bVxuICAgIHRoaXMuaGFuZGxlciA9IGZ1bmN0aW9uIChlKSB7XG4gICAgICBlLnRhcmdldFZNID0gdm1cbiAgICAgIHZtLiRldmVudCA9IGVcbiAgICAgIHZhciByZXMgPSBoYW5kbGVyKGUpXG4gICAgICB2bS4kZXZlbnQgPSBudWxsXG4gICAgICByZXR1cm4gcmVzXG4gICAgfVxuICAgIGlmICh0aGlzLmlmcmFtZUJpbmQpIHtcbiAgICAgIHRoaXMuaWZyYW1lQmluZCgpXG4gICAgfSBlbHNlIHtcbiAgICAgIF8ub24odGhpcy5lbCwgdGhpcy5hcmcsIHRoaXMuaGFuZGxlcilcbiAgICB9XG4gIH0sXG5cbiAgcmVzZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgZWwgPSB0aGlzLmlmcmFtZUJpbmRcbiAgICAgID8gdGhpcy5lbC5jb250ZW50V2luZG93XG4gICAgICA6IHRoaXMuZWxcbiAgICBpZiAodGhpcy5oYW5kbGVyKSB7XG4gICAgICBfLm9mZihlbCwgdGhpcy5hcmcsIHRoaXMuaGFuZGxlcilcbiAgICB9XG4gIH0sXG5cbiAgdW5iaW5kOiBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5yZXNldCgpXG4gICAgXy5vZmYodGhpcy5lbCwgJ2xvYWQnLCB0aGlzLmlmcmFtZUJpbmQpXG4gIH1cbn0iLCJ2YXIgXyA9IHJlcXVpcmUoJy4uL3V0aWwnKVxudmFyIHRlbXBsYXRlUGFyc2VyID0gcmVxdWlyZSgnLi4vcGFyc2Vycy90ZW1wbGF0ZScpXG52YXIgdklmID0gcmVxdWlyZSgnLi9pZicpXG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXG4gIGlzTGl0ZXJhbDogdHJ1ZSxcblxuICAvLyBzYW1lIGxvZ2ljIHJldXNlIGZyb20gdi1pZlxuICBjb21waWxlOiB2SWYuY29tcGlsZSxcbiAgdGVhcmRvd246IHZJZi50ZWFyZG93bixcbiAgZ2V0Q29udGFpbmVkQ29tcG9uZW50czogdklmLmdldENvbnRhaW5lZENvbXBvbmVudHMsXG4gIHVuYmluZDogdklmLnVuYmluZCxcblxuICBiaW5kOiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGVsID0gdGhpcy5lbFxuICAgIHRoaXMuc3RhcnQgPSBkb2N1bWVudC5jcmVhdGVDb21tZW50KCd2LXBhcnRpYWwtc3RhcnQnKVxuICAgIHRoaXMuZW5kID0gZG9jdW1lbnQuY3JlYXRlQ29tbWVudCgndi1wYXJ0aWFsLWVuZCcpXG4gICAgaWYgKGVsLm5vZGVUeXBlICE9PSA4KSB7XG4gICAgICBlbC5pbm5lckhUTUwgPSAnJ1xuICAgIH1cbiAgICBpZiAoZWwudGFnTmFtZSA9PT0gJ1RFTVBMQVRFJyB8fCBlbC5ub2RlVHlwZSA9PT0gOCkge1xuICAgICAgXy5yZXBsYWNlKGVsLCB0aGlzLmVuZClcbiAgICB9IGVsc2Uge1xuICAgICAgZWwuYXBwZW5kQ2hpbGQodGhpcy5lbmQpXG4gICAgfVxuICAgIF8uYmVmb3JlKHRoaXMuc3RhcnQsIHRoaXMuZW5kKVxuICAgIGlmICghdGhpcy5faXNEeW5hbWljTGl0ZXJhbCkge1xuICAgICAgdGhpcy5pbnNlcnQodGhpcy5leHByZXNzaW9uKVxuICAgIH1cbiAgfSxcblxuICB1cGRhdGU6IGZ1bmN0aW9uIChpZCkge1xuICAgIHRoaXMudGVhcmRvd24oKVxuICAgIHRoaXMuaW5zZXJ0KGlkKVxuICB9LFxuXG4gIGluc2VydDogZnVuY3Rpb24gKGlkKSB7XG4gICAgdmFyIHBhcnRpYWwgPSB0aGlzLnZtLiRvcHRpb25zLnBhcnRpYWxzW2lkXVxuICAgIF8uYXNzZXJ0QXNzZXQocGFydGlhbCwgJ3BhcnRpYWwnLCBpZClcbiAgICBpZiAocGFydGlhbCkge1xuICAgICAgdmFyIGZpbHRlcnMgPSB0aGlzLmZpbHRlcnMgJiYgdGhpcy5maWx0ZXJzLnJlYWRcbiAgICAgIGlmIChmaWx0ZXJzKSB7XG4gICAgICAgIHBhcnRpYWwgPSBfLmFwcGx5RmlsdGVycyhwYXJ0aWFsLCBmaWx0ZXJzLCB0aGlzLnZtKVxuICAgICAgfVxuICAgICAgdGhpcy5jb21waWxlKHRlbXBsYXRlUGFyc2VyLnBhcnNlKHBhcnRpYWwsIHRydWUpKVxuICAgIH1cbiAgfVxuXG59IiwidmFyIF8gPSByZXF1aXJlKCcuLi91dGlsJylcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgaXNMaXRlcmFsOiB0cnVlLFxuXG4gIGJpbmQ6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgdm0gPSB0aGlzLmVsLl9fdnVlX19cbiAgICBpZiAoIXZtKSB7XG4gICAgICBfLndhcm4oXG4gICAgICAgICd2LXJlZiBzaG91bGQgb25seSBiZSB1c2VkIG9uIGEgY29tcG9uZW50IHJvb3QgZWxlbWVudC4nXG4gICAgICApXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgLy8gSWYgd2UgZ2V0IGhlcmUsIGl0IG1lYW5zIHRoaXMgaXMgYSBgdi1yZWZgIG9uIGFcbiAgICAvLyBjaGlsZCwgYmVjYXVzZSBwYXJlbnQgc2NvcGUgYHYtcmVmYCBpcyBzdHJpcHBlZCBpblxuICAgIC8vIGB2LWNvbXBvbmVudGAgYWxyZWFkeS4gU28gd2UganVzdCByZWNvcmQgb3VyIG93biByZWZcbiAgICAvLyBoZXJlIC0gaXQgd2lsbCBvdmVyd3JpdGUgcGFyZW50IHJlZiBpbiBgdi1jb21wb25lbnRgLFxuICAgIC8vIGlmIGFueS5cbiAgICB2bS5fcmVmSUQgPSB0aGlzLmV4cHJlc3Npb25cbiAgfVxuICBcbn0iLCJ2YXIgXyA9IHJlcXVpcmUoJy4uL3V0aWwnKVxudmFyIGlzT2JqZWN0ID0gXy5pc09iamVjdFxudmFyIGlzUGxhaW5PYmplY3QgPSBfLmlzUGxhaW5PYmplY3RcbnZhciB0ZXh0UGFyc2VyID0gcmVxdWlyZSgnLi4vcGFyc2Vycy90ZXh0JylcbnZhciBleHBQYXJzZXIgPSByZXF1aXJlKCcuLi9wYXJzZXJzL2V4cHJlc3Npb24nKVxudmFyIHRlbXBsYXRlUGFyc2VyID0gcmVxdWlyZSgnLi4vcGFyc2Vycy90ZW1wbGF0ZScpXG52YXIgY29tcGlsZSA9IHJlcXVpcmUoJy4uL2NvbXBpbGVyL2NvbXBpbGUnKVxudmFyIHRyYW5zY2x1ZGUgPSByZXF1aXJlKCcuLi9jb21waWxlci90cmFuc2NsdWRlJylcbnZhciBtZXJnZU9wdGlvbnMgPSByZXF1aXJlKCcuLi91dGlsL21lcmdlLW9wdGlvbicpXG52YXIgdWlkID0gMFxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICAvKipcbiAgICogU2V0dXAuXG4gICAqL1xuXG4gIGJpbmQ6IGZ1bmN0aW9uICgpIHtcbiAgICAvLyB1aWQgYXMgYSBjYWNoZSBpZGVudGlmaWVyXG4gICAgdGhpcy5pZCA9ICdfX3ZfcmVwZWF0XycgKyAoKyt1aWQpXG4gICAgLy8gd2UgbmVlZCB0byBpbnNlcnQgdGhlIG9ialRvQXJyYXkgY29udmVydGVyXG4gICAgLy8gYXMgdGhlIGZpcnN0IHJlYWQgZmlsdGVyLCBiZWNhdXNlIGl0IGhhcyB0byBiZSBpbnZva2VkXG4gICAgLy8gYmVmb3JlIGFueSB1c2VyIGZpbHRlcnMuIChjYW4ndCBkbyBpdCBpbiBgdXBkYXRlYClcbiAgICBpZiAoIXRoaXMuZmlsdGVycykge1xuICAgICAgdGhpcy5maWx0ZXJzID0ge31cbiAgICB9XG4gICAgLy8gYWRkIHRoZSBvYmplY3QgLT4gYXJyYXkgY29udmVydCBmaWx0ZXJcbiAgICB2YXIgb2JqZWN0Q29udmVydGVyID0gXy5iaW5kKG9ialRvQXJyYXksIHRoaXMpXG4gICAgaWYgKCF0aGlzLmZpbHRlcnMucmVhZCkge1xuICAgICAgdGhpcy5maWx0ZXJzLnJlYWQgPSBbb2JqZWN0Q29udmVydGVyXVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmZpbHRlcnMucmVhZC51bnNoaWZ0KG9iamVjdENvbnZlcnRlcilcbiAgICB9XG4gICAgLy8gc2V0dXAgcmVmIG5vZGVcbiAgICB0aGlzLnJlZiA9IGRvY3VtZW50LmNyZWF0ZUNvbW1lbnQoJ3YtcmVwZWF0JylcbiAgICBfLnJlcGxhY2UodGhpcy5lbCwgdGhpcy5yZWYpXG4gICAgLy8gY2hlY2sgaWYgdGhpcyBpcyBhIGJsb2NrIHJlcGVhdFxuICAgIHRoaXMudGVtcGxhdGUgPSB0aGlzLmVsLnRhZ05hbWUgPT09ICdURU1QTEFURSdcbiAgICAgID8gdGVtcGxhdGVQYXJzZXIucGFyc2UodGhpcy5lbCwgdHJ1ZSlcbiAgICAgIDogdGhpcy5lbFxuICAgIC8vIGNoZWNrIG90aGVyIGRpcmVjdGl2ZXMgdGhhdCBuZWVkIHRvIGJlIGhhbmRsZWRcbiAgICAvLyBhdCB2LXJlcGVhdCBsZXZlbFxuICAgIHRoaXMuY2hlY2tJZigpXG4gICAgdGhpcy5jaGVja1JlZigpXG4gICAgdGhpcy5jaGVja0NvbXBvbmVudCgpXG4gICAgLy8gY2hlY2sgZm9yIHRyYWNrYnkgcGFyYW1cbiAgICB0aGlzLmlkS2V5ID1cbiAgICAgIHRoaXMuX2NoZWNrUGFyYW0oJ3RyYWNrLWJ5JykgfHxcbiAgICAgIHRoaXMuX2NoZWNrUGFyYW0oJ3RyYWNrYnknKSAvLyAwLjExLjAgY29tcGF0XG4gICAgdGhpcy5jYWNoZSA9IE9iamVjdC5jcmVhdGUobnVsbClcbiAgfSxcblxuICAvKipcbiAgICogV2FybiBhZ2FpbnN0IHYtaWYgdXNhZ2UuXG4gICAqL1xuXG4gIGNoZWNrSWY6IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoXy5hdHRyKHRoaXMuZWwsICdpZicpICE9PSBudWxsKSB7XG4gICAgICBfLndhcm4oXG4gICAgICAgICdEb25cXCd0IHVzZSB2LWlmIHdpdGggdi1yZXBlYXQuICcgK1xuICAgICAgICAnVXNlIHYtc2hvdyBvciB0aGUgXCJmaWx0ZXJCeVwiIGZpbHRlciBpbnN0ZWFkLidcbiAgICAgIClcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIENoZWNrIGlmIHYtcmVmLyB2LWVsIGlzIGFsc28gcHJlc2VudC5cbiAgICovXG5cbiAgY2hlY2tSZWY6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgcmVmSUQgPSBfLmF0dHIodGhpcy5lbCwgJ3JlZicpXG4gICAgdGhpcy5yZWZJRCA9IHJlZklEXG4gICAgICA/IHRoaXMudm0uJGludGVycG9sYXRlKHJlZklEKVxuICAgICAgOiBudWxsXG4gICAgdmFyIGVsSWQgPSBfLmF0dHIodGhpcy5lbCwgJ2VsJylcbiAgICB0aGlzLmVsSWQgPSBlbElkXG4gICAgICA/IHRoaXMudm0uJGludGVycG9sYXRlKGVsSWQpXG4gICAgICA6IG51bGxcbiAgfSxcblxuICAvKipcbiAgICogQ2hlY2sgdGhlIGNvbXBvbmVudCBjb25zdHJ1Y3RvciB0byB1c2UgZm9yIHJlcGVhdGVkXG4gICAqIGluc3RhbmNlcy4gSWYgc3RhdGljIHdlIHJlc29sdmUgaXQgbm93LCBvdGhlcndpc2UgaXRcbiAgICogbmVlZHMgdG8gYmUgcmVzb2x2ZWQgYXQgYnVpbGQgdGltZSB3aXRoIGFjdHVhbCBkYXRhLlxuICAgKi9cblxuICBjaGVja0NvbXBvbmVudDogZnVuY3Rpb24gKCkge1xuICAgIHZhciBpZCA9IF8uYXR0cih0aGlzLmVsLCAnY29tcG9uZW50JylcbiAgICB2YXIgb3B0aW9ucyA9IHRoaXMudm0uJG9wdGlvbnNcbiAgICBpZiAoIWlkKSB7XG4gICAgICAvLyBkZWZhdWx0IGNvbnN0cnVjdG9yXG4gICAgICB0aGlzLkN0b3IgPSBfLlZ1ZVxuICAgICAgLy8gaW5saW5lIHJlcGVhdHMgc2hvdWxkIGluaGVyaXRcbiAgICAgIHRoaXMuaW5oZXJpdCA9IHRydWVcbiAgICAgIC8vIGltcG9ydGFudDogdHJhbnNjbHVkZSB3aXRoIG5vIG9wdGlvbnMsIGp1c3RcbiAgICAgIC8vIHRvIGVuc3VyZSBibG9jayBzdGFydCBhbmQgYmxvY2sgZW5kXG4gICAgICB0aGlzLnRlbXBsYXRlID0gdHJhbnNjbHVkZSh0aGlzLnRlbXBsYXRlKVxuICAgICAgdGhpcy5fbGlua0ZuID0gY29tcGlsZSh0aGlzLnRlbXBsYXRlLCBvcHRpb25zKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmFzQ29tcG9uZW50ID0gdHJ1ZVxuICAgICAgLy8gY2hlY2sgaW5saW5lLXRlbXBsYXRlXG4gICAgICBpZiAodGhpcy5fY2hlY2tQYXJhbSgnaW5saW5lLXRlbXBsYXRlJykgIT09IG51bGwpIHtcbiAgICAgICAgLy8gZXh0cmFjdCBpbmxpbmUgdGVtcGxhdGUgYXMgYSBEb2N1bWVudEZyYWdtZW50XG4gICAgICAgIHRoaXMuaW5saW5lVGVtcGFsdGUgPSBfLmV4dHJhY3RDb250ZW50KHRoaXMuZWwsIHRydWUpXG4gICAgICB9XG4gICAgICB2YXIgdG9rZW5zID0gdGV4dFBhcnNlci5wYXJzZShpZClcbiAgICAgIGlmICghdG9rZW5zKSB7IC8vIHN0YXRpYyBjb21wb25lbnRcbiAgICAgICAgdmFyIEN0b3IgPSB0aGlzLkN0b3IgPSBvcHRpb25zLmNvbXBvbmVudHNbaWRdXG4gICAgICAgIF8uYXNzZXJ0QXNzZXQoQ3RvciwgJ2NvbXBvbmVudCcsIGlkKVxuICAgICAgICB2YXIgbWVyZ2VkID0gbWVyZ2VPcHRpb25zKEN0b3Iub3B0aW9ucywge30sIHtcbiAgICAgICAgICAkcGFyZW50OiB0aGlzLnZtXG4gICAgICAgIH0pXG4gICAgICAgIG1lcmdlZC50ZW1wbGF0ZSA9IHRoaXMuaW5saW5lVGVtcGFsdGUgfHwgbWVyZ2VkLnRlbXBsYXRlXG4gICAgICAgIG1lcmdlZC5fYXNDb21wb25lbnQgPSB0cnVlXG4gICAgICAgIG1lcmdlZC5fcGFyZW50ID0gdGhpcy52bVxuICAgICAgICB0aGlzLnRlbXBsYXRlID0gdHJhbnNjbHVkZSh0aGlzLnRlbXBsYXRlLCBtZXJnZWQpXG4gICAgICAgIC8vIEltcG9ydGFudDogbWFyayB0aGUgdGVtcGxhdGUgYXMgYSByb290IG5vZGUgc28gdGhhdFxuICAgICAgICAvLyBjdXN0b20gZWxlbWVudCBjb21wb25lbnRzIGRvbid0IGdldCBjb21waWxlZCB0d2ljZS5cbiAgICAgICAgLy8gZml4ZXMgIzgyMlxuICAgICAgICB0aGlzLnRlbXBsYXRlLl9fdnVlX18gPSB0cnVlXG4gICAgICAgIHRoaXMuX2xpbmtGbiA9IGNvbXBpbGUodGhpcy50ZW1wbGF0ZSwgbWVyZ2VkKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gdG8gYmUgcmVzb2x2ZWQgbGF0ZXJcbiAgICAgICAgdmFyIGN0b3JFeHAgPSB0ZXh0UGFyc2VyLnRva2Vuc1RvRXhwKHRva2VucylcbiAgICAgICAgdGhpcy5jdG9yR2V0dGVyID0gZXhwUGFyc2VyLnBhcnNlKGN0b3JFeHApLmdldFxuICAgICAgfVxuICAgIH1cbiAgfSxcblxuICAvKipcbiAgICogVXBkYXRlLlxuICAgKiBUaGlzIGlzIGNhbGxlZCB3aGVuZXZlciB0aGUgQXJyYXkgbXV0YXRlcy5cbiAgICpcbiAgICogQHBhcmFtIHtBcnJheXxOdW1iZXJ8U3RyaW5nfSBkYXRhXG4gICAqL1xuXG4gIHVwZGF0ZTogZnVuY3Rpb24gKGRhdGEpIHtcbiAgICBkYXRhID0gZGF0YSB8fCBbXVxuICAgIHZhciB0eXBlID0gdHlwZW9mIGRhdGFcbiAgICBpZiAodHlwZSA9PT0gJ251bWJlcicpIHtcbiAgICAgIGRhdGEgPSByYW5nZShkYXRhKVxuICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGRhdGEgPSBfLnRvQXJyYXkoZGF0YSlcbiAgICB9XG4gICAgdGhpcy52bXMgPSB0aGlzLmRpZmYoZGF0YSwgdGhpcy52bXMpXG4gICAgLy8gdXBkYXRlIHYtcmVmXG4gICAgaWYgKHRoaXMucmVmSUQpIHtcbiAgICAgIHRoaXMudm0uJFt0aGlzLnJlZklEXSA9IHRoaXMudm1zXG4gICAgfVxuICAgIGlmICh0aGlzLmVsSWQpIHtcbiAgICAgIHRoaXMudm0uJCRbdGhpcy5lbElkXSA9IHRoaXMudm1zLm1hcChmdW5jdGlvbiAodm0pIHtcbiAgICAgICAgcmV0dXJuIHZtLiRlbFxuICAgICAgfSlcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIERpZmYsIGJhc2VkIG9uIG5ldyBkYXRhIGFuZCBvbGQgZGF0YSwgZGV0ZXJtaW5lIHRoZVxuICAgKiBtaW5pbXVtIGFtb3VudCBvZiBET00gbWFuaXB1bGF0aW9ucyBuZWVkZWQgdG8gbWFrZSB0aGVcbiAgICogRE9NIHJlZmxlY3QgdGhlIG5ldyBkYXRhIEFycmF5LlxuICAgKlxuICAgKiBUaGUgYWxnb3JpdGhtIGRpZmZzIHRoZSBuZXcgZGF0YSBBcnJheSBieSBzdG9yaW5nIGFcbiAgICogaGlkZGVuIHJlZmVyZW5jZSB0byBhbiBvd25lciB2bSBpbnN0YW5jZSBvbiBwcmV2aW91c2x5XG4gICAqIHNlZW4gZGF0YS4gVGhpcyBhbGxvd3MgdXMgdG8gYWNoaWV2ZSBPKG4pIHdoaWNoIGlzXG4gICAqIGJldHRlciB0aGFuIGEgbGV2ZW5zaHRlaW4gZGlzdGFuY2UgYmFzZWQgYWxnb3JpdGhtLFxuICAgKiB3aGljaCBpcyBPKG0gKiBuKS5cbiAgICpcbiAgICogQHBhcmFtIHtBcnJheX0gZGF0YVxuICAgKiBAcGFyYW0ge0FycmF5fSBvbGRWbXNcbiAgICogQHJldHVybiB7QXJyYXl9XG4gICAqL1xuXG4gIGRpZmY6IGZ1bmN0aW9uIChkYXRhLCBvbGRWbXMpIHtcbiAgICB2YXIgaWRLZXkgPSB0aGlzLmlkS2V5XG4gICAgdmFyIGNvbnZlcnRlZCA9IHRoaXMuY29udmVydGVkXG4gICAgdmFyIHJlZiA9IHRoaXMucmVmXG4gICAgdmFyIGFsaWFzID0gdGhpcy5hcmdcbiAgICB2YXIgaW5pdCA9ICFvbGRWbXNcbiAgICB2YXIgdm1zID0gbmV3IEFycmF5KGRhdGEubGVuZ3RoKVxuICAgIHZhciBvYmosIHJhdywgdm0sIGksIGxcbiAgICAvLyBGaXJzdCBwYXNzLCBnbyB0aHJvdWdoIHRoZSBuZXcgQXJyYXkgYW5kIGZpbGwgdXBcbiAgICAvLyB0aGUgbmV3IHZtcyBhcnJheS4gSWYgYSBwaWVjZSBvZiBkYXRhIGhhcyBhIGNhY2hlZFxuICAgIC8vIGluc3RhbmNlIGZvciBpdCwgd2UgcmV1c2UgaXQuIE90aGVyd2lzZSBidWlsZCBhIG5ld1xuICAgIC8vIGluc3RhbmNlLlxuICAgIGZvciAoaSA9IDAsIGwgPSBkYXRhLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgb2JqID0gZGF0YVtpXVxuICAgICAgcmF3ID0gY29udmVydGVkID8gb2JqLiR2YWx1ZSA6IG9ialxuICAgICAgdm0gPSAhaW5pdCAmJiB0aGlzLmdldFZtKHJhdylcbiAgICAgIGlmICh2bSkgeyAvLyByZXVzYWJsZSBpbnN0YW5jZVxuICAgICAgICB2bS5fcmV1c2VkID0gdHJ1ZVxuICAgICAgICB2bS4kaW5kZXggPSBpIC8vIHVwZGF0ZSAkaW5kZXhcbiAgICAgICAgaWYgKGNvbnZlcnRlZCkge1xuICAgICAgICAgIHZtLiRrZXkgPSBvYmouJGtleSAvLyB1cGRhdGUgJGtleVxuICAgICAgICB9XG4gICAgICAgIGlmIChpZEtleSkgeyAvLyBzd2FwIHRyYWNrIGJ5IGlkIGRhdGFcbiAgICAgICAgICBpZiAoYWxpYXMpIHtcbiAgICAgICAgICAgIHZtW2FsaWFzXSA9IHJhd1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2bS5fc2V0RGF0YShyYXcpXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2UgeyAvLyBuZXcgaW5zdGFuY2VcbiAgICAgICAgdm0gPSB0aGlzLmJ1aWxkKG9iaiwgaSwgdHJ1ZSlcbiAgICAgICAgdm0uX25ldyA9IHRydWVcbiAgICAgICAgdm0uX3JldXNlZCA9IGZhbHNlXG4gICAgICB9XG4gICAgICB2bXNbaV0gPSB2bVxuICAgICAgLy8gaW5zZXJ0IGlmIHRoaXMgaXMgZmlyc3QgcnVuXG4gICAgICBpZiAoaW5pdCkge1xuICAgICAgICB2bS4kYmVmb3JlKHJlZilcbiAgICAgIH1cbiAgICB9XG4gICAgLy8gaWYgdGhpcyBpcyB0aGUgZmlyc3QgcnVuLCB3ZSdyZSBkb25lLlxuICAgIGlmIChpbml0KSB7XG4gICAgICByZXR1cm4gdm1zXG4gICAgfVxuICAgIC8vIFNlY29uZCBwYXNzLCBnbyB0aHJvdWdoIHRoZSBvbGQgdm0gaW5zdGFuY2VzIGFuZFxuICAgIC8vIGRlc3Ryb3kgdGhvc2Ugd2hvIGFyZSBub3QgcmV1c2VkIChhbmQgcmVtb3ZlIHRoZW1cbiAgICAvLyBmcm9tIGNhY2hlKVxuICAgIGZvciAoaSA9IDAsIGwgPSBvbGRWbXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICB2bSA9IG9sZFZtc1tpXVxuICAgICAgaWYgKCF2bS5fcmV1c2VkKSB7XG4gICAgICAgIHRoaXMudW5jYWNoZVZtKHZtKVxuICAgICAgICB2bS4kZGVzdHJveSh0cnVlKVxuICAgICAgfVxuICAgIH1cbiAgICAvLyBmaW5hbCBwYXNzLCBtb3ZlL2luc2VydCBuZXcgaW5zdGFuY2VzIGludG8gdGhlXG4gICAgLy8gcmlnaHQgcGxhY2UuIFdlJ3JlIGdvaW5nIGluIHJldmVyc2UgaGVyZSBiZWNhdXNlXG4gICAgLy8gaW5zZXJ0QmVmb3JlIHJlbGllcyBvbiB0aGUgbmV4dCBzaWJsaW5nIHRvIGJlXG4gICAgLy8gcmVzb2x2ZWQuXG4gICAgdmFyIHRhcmdldE5leHQsIGN1cnJlbnROZXh0XG4gICAgaSA9IHZtcy5sZW5ndGhcbiAgICB3aGlsZSAoaS0tKSB7XG4gICAgICB2bSA9IHZtc1tpXVxuICAgICAgLy8gdGhpcyBpcyB0aGUgdm0gdGhhdCB3ZSBzaG91bGQgYmUgaW4gZnJvbnQgb2ZcbiAgICAgIHRhcmdldE5leHQgPSB2bXNbaSArIDFdXG4gICAgICBpZiAoIXRhcmdldE5leHQpIHtcbiAgICAgICAgLy8gVGhpcyBpcyB0aGUgbGFzdCBpdGVtLiBJZiBpdCdzIHJldXNlZCB0aGVuXG4gICAgICAgIC8vIGV2ZXJ5dGhpbmcgZWxzZSB3aWxsIGV2ZW50dWFsbHkgYmUgaW4gdGhlIHJpZ2h0XG4gICAgICAgIC8vIHBsYWNlLCBzbyBubyBuZWVkIHRvIHRvdWNoIGl0LiBPdGhlcndpc2UsIGluc2VydFxuICAgICAgICAvLyBpdC5cbiAgICAgICAgaWYgKCF2bS5fcmV1c2VkKSB7XG4gICAgICAgICAgdm0uJGJlZm9yZShyZWYpXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBuZXh0RWwgPSB0YXJnZXROZXh0LiRlbFxuICAgICAgICBpZiAodm0uX3JldXNlZCkge1xuICAgICAgICAgIC8vIHRoaXMgaXMgdGhlIHZtIHdlIGFyZSBhY3R1YWxseSBpbiBmcm9udCBvZlxuICAgICAgICAgIGN1cnJlbnROZXh0ID0gZmluZE5leHRWbSh2bSwgcmVmKVxuICAgICAgICAgIC8vIHdlIG9ubHkgbmVlZCB0byBtb3ZlIGlmIHdlIGFyZSBub3QgaW4gdGhlIHJpZ2h0XG4gICAgICAgICAgLy8gcGxhY2UgYWxyZWFkeS5cbiAgICAgICAgICBpZiAoY3VycmVudE5leHQgIT09IHRhcmdldE5leHQpIHtcbiAgICAgICAgICAgIHZtLiRiZWZvcmUobmV4dEVsLCBudWxsLCBmYWxzZSlcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gbmV3IGluc3RhbmNlLCBpbnNlcnQgdG8gZXhpc3RpbmcgbmV4dFxuICAgICAgICAgIHZtLiRiZWZvcmUobmV4dEVsKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICB2bS5fbmV3ID0gZmFsc2VcbiAgICAgIHZtLl9yZXVzZWQgPSBmYWxzZVxuICAgIH1cbiAgICByZXR1cm4gdm1zXG4gIH0sXG5cbiAgLyoqXG4gICAqIEJ1aWxkIGEgbmV3IGluc3RhbmNlIGFuZCBjYWNoZSBpdC5cbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IGRhdGFcbiAgICogQHBhcmFtIHtOdW1iZXJ9IGluZGV4XG4gICAqIEBwYXJhbSB7Qm9vbGVhbn0gbmVlZENhY2hlXG4gICAqL1xuXG4gIGJ1aWxkOiBmdW5jdGlvbiAoZGF0YSwgaW5kZXgsIG5lZWRDYWNoZSkge1xuICAgIHZhciBtZXRhID0geyAkaW5kZXg6IGluZGV4IH1cbiAgICBpZiAodGhpcy5jb252ZXJ0ZWQpIHtcbiAgICAgIG1ldGEuJGtleSA9IGRhdGEuJGtleVxuICAgIH1cbiAgICB2YXIgcmF3ID0gdGhpcy5jb252ZXJ0ZWQgPyBkYXRhLiR2YWx1ZSA6IGRhdGFcbiAgICB2YXIgYWxpYXMgPSB0aGlzLmFyZ1xuICAgIGlmIChhbGlhcykge1xuICAgICAgZGF0YSA9IHt9XG4gICAgICBkYXRhW2FsaWFzXSA9IHJhd1xuICAgIH0gZWxzZSBpZiAoIWlzUGxhaW5PYmplY3QocmF3KSkge1xuICAgICAgLy8gbm9uLW9iamVjdCB2YWx1ZXNcbiAgICAgIGRhdGEgPSB7fVxuICAgICAgbWV0YS4kdmFsdWUgPSByYXdcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gZGVmYXVsdFxuICAgICAgZGF0YSA9IHJhd1xuICAgIH1cbiAgICAvLyByZXNvbHZlIGNvbnN0cnVjdG9yXG4gICAgdmFyIEN0b3IgPSB0aGlzLkN0b3IgfHwgdGhpcy5yZXNvbHZlQ3RvcihkYXRhLCBtZXRhKVxuICAgIHZhciB2bSA9IHRoaXMudm0uJGFkZENoaWxkKHtcbiAgICAgIGVsOiB0ZW1wbGF0ZVBhcnNlci5jbG9uZSh0aGlzLnRlbXBsYXRlKSxcbiAgICAgIF9hc0NvbXBvbmVudDogdGhpcy5hc0NvbXBvbmVudCxcbiAgICAgIF9ob3N0OiB0aGlzLl9ob3N0LFxuICAgICAgX2xpbmtGbjogdGhpcy5fbGlua0ZuLFxuICAgICAgX21ldGE6IG1ldGEsXG4gICAgICBkYXRhOiBkYXRhLFxuICAgICAgaW5oZXJpdDogdGhpcy5pbmhlcml0LFxuICAgICAgdGVtcGxhdGU6IHRoaXMuaW5saW5lVGVtcGFsdGVcbiAgICB9LCBDdG9yKVxuICAgIC8vIGZsYWcgdGhpcyBpbnN0YW5jZSBhcyBhIHJlcGVhdCBpbnN0YW5jZVxuICAgIC8vIHNvIHRoYXQgd2UgY2FuIHNraXAgaXQgaW4gdm0uX2RpZ2VzdFxuICAgIHZtLl9yZXBlYXQgPSB0cnVlXG4gICAgLy8gY2FjaGUgaW5zdGFuY2VcbiAgICBpZiAobmVlZENhY2hlKSB7XG4gICAgICB0aGlzLmNhY2hlVm0ocmF3LCB2bSlcbiAgICB9XG4gICAgLy8gc3luYyBiYWNrIGNoYW5nZXMgZm9yICR2YWx1ZSwgcGFydGljdWxhcmx5IGZvclxuICAgIC8vIHR3by13YXkgYmluZGluZ3Mgb2YgcHJpbWl0aXZlIHZhbHVlc1xuICAgIHZhciBzZWxmID0gdGhpc1xuICAgIHZtLiR3YXRjaCgnJHZhbHVlJywgZnVuY3Rpb24gKHZhbCkge1xuICAgICAgaWYgKHNlbGYuY29udmVydGVkKSB7XG4gICAgICAgIHNlbGYucmF3VmFsdWVbdm0uJGtleV0gPSB2YWxcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNlbGYucmF3VmFsdWUuJHNldCh2bS4kaW5kZXgsIHZhbClcbiAgICAgIH1cbiAgICB9KVxuICAgIHJldHVybiB2bVxuICB9LFxuXG4gIC8qKlxuICAgKiBSZXNvbHZlIGEgY29udHJ1Y3RvciB0byB1c2UgZm9yIGFuIGluc3RhbmNlLlxuICAgKiBUaGUgdHJpY2t5IHBhcnQgaGVyZSBpcyB0aGF0IHRoZXJlIGNvdWxkIGJlIGR5bmFtaWNcbiAgICogY29tcG9uZW50cyBkZXBlbmRpbmcgb24gaW5zdGFuY2UgZGF0YS5cbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IGRhdGFcbiAgICogQHBhcmFtIHtPYmplY3R9IG1ldGFcbiAgICogQHJldHVybiB7RnVuY3Rpb259XG4gICAqL1xuXG4gIHJlc29sdmVDdG9yOiBmdW5jdGlvbiAoZGF0YSwgbWV0YSkge1xuICAgIC8vIGNyZWF0ZSBhIHRlbXBvcmFyeSBjb250ZXh0IG9iamVjdCBhbmQgY29weSBkYXRhXG4gICAgLy8gYW5kIG1ldGEgcHJvcGVydGllcyBvbnRvIGl0LlxuICAgIC8vIHVzZSBfLmRlZmluZSB0byBhdm9pZCBhY2NpZGVudGFsbHkgb3ZlcndyaXRpbmcgc2NvcGVcbiAgICAvLyBwcm9wZXJ0aWVzLlxuICAgIHZhciBjb250ZXh0ID0gT2JqZWN0LmNyZWF0ZSh0aGlzLnZtKVxuICAgIHZhciBrZXlcbiAgICBmb3IgKGtleSBpbiBkYXRhKSB7XG4gICAgICBfLmRlZmluZShjb250ZXh0LCBrZXksIGRhdGFba2V5XSlcbiAgICB9XG4gICAgZm9yIChrZXkgaW4gbWV0YSkge1xuICAgICAgXy5kZWZpbmUoY29udGV4dCwga2V5LCBtZXRhW2tleV0pXG4gICAgfVxuICAgIHZhciBpZCA9IHRoaXMuY3RvckdldHRlci5jYWxsKGNvbnRleHQsIGNvbnRleHQpXG4gICAgdmFyIEN0b3IgPSB0aGlzLnZtLiRvcHRpb25zLmNvbXBvbmVudHNbaWRdXG4gICAgXy5hc3NlcnRBc3NldChDdG9yLCAnY29tcG9uZW50JywgaWQpXG4gICAgcmV0dXJuIEN0b3JcbiAgfSxcblxuICAvKipcbiAgICogVW5iaW5kLCB0ZWFyZG93biBldmVyeXRoaW5nXG4gICAqL1xuXG4gIHVuYmluZDogZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLnJlZklEKSB7XG4gICAgICB0aGlzLnZtLiRbdGhpcy5yZWZJRF0gPSBudWxsXG4gICAgfVxuICAgIGlmICh0aGlzLnZtcykge1xuICAgICAgdmFyIGkgPSB0aGlzLnZtcy5sZW5ndGhcbiAgICAgIHZhciB2bVxuICAgICAgd2hpbGUgKGktLSkge1xuICAgICAgICB2bSA9IHRoaXMudm1zW2ldXG4gICAgICAgIHRoaXMudW5jYWNoZVZtKHZtKVxuICAgICAgICB2bS4kZGVzdHJveSgpXG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBDYWNoZSBhIHZtIGluc3RhbmNlIGJhc2VkIG9uIGl0cyBkYXRhLlxuICAgKlxuICAgKiBJZiB0aGUgZGF0YSBpcyBhbiBvYmplY3QsIHdlIHNhdmUgdGhlIHZtJ3MgcmVmZXJlbmNlIG9uXG4gICAqIHRoZSBkYXRhIG9iamVjdCBhcyBhIGhpZGRlbiBwcm9wZXJ0eS4gT3RoZXJ3aXNlIHdlXG4gICAqIGNhY2hlIHRoZW0gaW4gYW4gb2JqZWN0IGFuZCBmb3IgZWFjaCBwcmltaXRpdmUgdmFsdWVcbiAgICogdGhlcmUgaXMgYW4gYXJyYXkgaW4gY2FzZSB0aGVyZSBhcmUgZHVwbGljYXRlcy5cbiAgICpcbiAgICogQHBhcmFtIHtPYmplY3R9IGRhdGFcbiAgICogQHBhcmFtIHtWdWV9IHZtXG4gICAqL1xuXG4gIGNhY2hlVm06IGZ1bmN0aW9uIChkYXRhLCB2bSkge1xuICAgIHZhciBpZEtleSA9IHRoaXMuaWRLZXlcbiAgICB2YXIgY2FjaGUgPSB0aGlzLmNhY2hlXG4gICAgdmFyIGlkXG4gICAgaWYgKGlkS2V5KSB7XG4gICAgICBpZCA9IGRhdGFbaWRLZXldXG4gICAgICBpZiAoIWNhY2hlW2lkXSkge1xuICAgICAgICBjYWNoZVtpZF0gPSB2bVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgXy53YXJuKCdEdXBsaWNhdGUgdHJhY2stYnkga2V5IGluIHYtcmVwZWF0OiAnICsgaWQpXG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChpc09iamVjdChkYXRhKSkge1xuICAgICAgaWQgPSB0aGlzLmlkXG4gICAgICBpZiAoZGF0YS5oYXNPd25Qcm9wZXJ0eShpZCkpIHtcbiAgICAgICAgaWYgKGRhdGFbaWRdID09PSBudWxsKSB7XG4gICAgICAgICAgZGF0YVtpZF0gPSB2bVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIF8ud2FybihcbiAgICAgICAgICAgICdEdXBsaWNhdGUgb2JqZWN0cyBhcmUgbm90IHN1cHBvcnRlZCBpbiB2LXJlcGVhdCAnICtcbiAgICAgICAgICAgICd3aGVuIHVzaW5nIGNvbXBvbmVudHMgb3IgdHJhbnNpdGlvbnMuJ1xuICAgICAgICAgIClcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgXy5kZWZpbmUoZGF0YSwgdGhpcy5pZCwgdm0pXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICghY2FjaGVbZGF0YV0pIHtcbiAgICAgICAgY2FjaGVbZGF0YV0gPSBbdm1dXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjYWNoZVtkYXRhXS5wdXNoKHZtKVxuICAgICAgfVxuICAgIH1cbiAgICB2bS5fcmF3ID0gZGF0YVxuICB9LFxuXG4gIC8qKlxuICAgKiBUcnkgdG8gZ2V0IGEgY2FjaGVkIGluc3RhbmNlIGZyb20gYSBwaWVjZSBvZiBkYXRhLlxuICAgKlxuICAgKiBAcGFyYW0ge09iamVjdH0gZGF0YVxuICAgKiBAcmV0dXJuIHtWdWV8dW5kZWZpbmVkfVxuICAgKi9cblxuICBnZXRWbTogZnVuY3Rpb24gKGRhdGEpIHtcbiAgICBpZiAodGhpcy5pZEtleSkge1xuICAgICAgcmV0dXJuIHRoaXMuY2FjaGVbZGF0YVt0aGlzLmlkS2V5XV1cbiAgICB9IGVsc2UgaWYgKGlzT2JqZWN0KGRhdGEpKSB7XG4gICAgICByZXR1cm4gZGF0YVt0aGlzLmlkXVxuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgY2FjaGVkID0gdGhpcy5jYWNoZVtkYXRhXVxuICAgICAgaWYgKGNhY2hlZCkge1xuICAgICAgICB2YXIgaSA9IDBcbiAgICAgICAgdmFyIHZtID0gY2FjaGVkW2ldXG4gICAgICAgIC8vIHNpbmNlIGR1cGxpY2F0ZWQgdm0gaW5zdGFuY2VzIG1pZ2h0IGJlIGEgcmV1c2VkXG4gICAgICAgIC8vIG9uZSBPUiBhIG5ld2x5IGNyZWF0ZWQgb25lLCB3ZSBuZWVkIHRvIHJldHVybiB0aGVcbiAgICAgICAgLy8gZmlyc3QgaW5zdGFuY2UgdGhhdCBpcyBuZWl0aGVyIG9mIHRoZXNlLlxuICAgICAgICB3aGlsZSAodm0gJiYgKHZtLl9yZXVzZWQgfHwgdm0uX25ldykpIHtcbiAgICAgICAgICB2bSA9IGNhY2hlZFsrK2ldXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHZtXG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBEZWxldGUgYSBjYWNoZWQgdm0gaW5zdGFuY2UuXG4gICAqXG4gICAqIEBwYXJhbSB7VnVlfSB2bVxuICAgKi9cblxuICB1bmNhY2hlVm06IGZ1bmN0aW9uICh2bSkge1xuICAgIHZhciBkYXRhID0gdm0uX3Jhd1xuICAgIGlmICh0aGlzLmlkS2V5KSB7XG4gICAgICB0aGlzLmNhY2hlW2RhdGFbdGhpcy5pZEtleV1dID0gbnVsbFxuICAgIH0gZWxzZSBpZiAoaXNPYmplY3QoZGF0YSkpIHtcbiAgICAgIGRhdGFbdGhpcy5pZF0gPSBudWxsXG4gICAgICB2bS5fcmF3ID0gbnVsbFxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmNhY2hlW2RhdGFdLnBvcCgpXG4gICAgfVxuICB9XG5cbn1cblxuLyoqXG4gKiBIZWxwZXIgdG8gZmluZCB0aGUgbmV4dCBlbGVtZW50IHRoYXQgaXMgYW4gaW5zdGFuY2VcbiAqIHJvb3Qgbm9kZS4gVGhpcyBpcyBuZWNlc3NhcnkgYmVjYXVzZSBhIGRlc3Ryb3llZCB2bSdzXG4gKiBlbGVtZW50IGNvdWxkIHN0aWxsIGJlIGxpbmdlcmluZyBpbiB0aGUgRE9NIGJlZm9yZSBpdHNcbiAqIGxlYXZpbmcgdHJhbnNpdGlvbiBmaW5pc2hlcywgYnV0IGl0cyBfX3Z1ZV9fIHJlZmVyZW5jZVxuICogc2hvdWxkIGhhdmUgYmVlbiByZW1vdmVkIHNvIHdlIGNhbiBza2lwIHRoZW0uXG4gKlxuICogQHBhcmFtIHtWdWV9IHZtXG4gKiBAcGFyYW0ge0NvbW1lbnROb2RlfSByZWZcbiAqIEByZXR1cm4ge1Z1ZX1cbiAqL1xuXG5mdW5jdGlvbiBmaW5kTmV4dFZtICh2bSwgcmVmKSB7XG4gIHZhciBlbCA9ICh2bS5fYmxvY2tFbmQgfHwgdm0uJGVsKS5uZXh0U2libGluZ1xuICB3aGlsZSAoIWVsLl9fdnVlX18gJiYgZWwgIT09IHJlZikge1xuICAgIGVsID0gZWwubmV4dFNpYmxpbmdcbiAgfVxuICByZXR1cm4gZWwuX192dWVfX1xufVxuXG4vKipcbiAqIEF0dGVtcHQgdG8gY29udmVydCBub24tQXJyYXkgb2JqZWN0cyB0byBhcnJheS5cbiAqIFRoaXMgaXMgdGhlIGRlZmF1bHQgZmlsdGVyIGluc3RhbGxlZCB0byBldmVyeSB2LXJlcGVhdFxuICogZGlyZWN0aXZlLlxuICpcbiAqIEl0IHdpbGwgYmUgY2FsbGVkIHdpdGggKip0aGUgZGlyZWN0aXZlKiogYXMgYHRoaXNgXG4gKiBjb250ZXh0IHNvIHRoYXQgd2UgY2FuIG1hcmsgdGhlIHJlcGVhdCBhcnJheSBhcyBjb252ZXJ0ZWRcbiAqIGZyb20gYW4gb2JqZWN0LlxuICpcbiAqIEBwYXJhbSB7Kn0gb2JqXG4gKiBAcmV0dXJuIHtBcnJheX1cbiAqIEBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gb2JqVG9BcnJheSAob2JqKSB7XG4gIC8vIHJlZ2FyZGxlc3Mgb2YgdHlwZSwgc3RvcmUgdGhlIHVuLWZpbHRlcmVkIHJhdyB2YWx1ZS5cbiAgdGhpcy5yYXdWYWx1ZSA9IG9ialxuICBpZiAoIWlzUGxhaW5PYmplY3Qob2JqKSkge1xuICAgIHJldHVybiBvYmpcbiAgfVxuICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKG9iailcbiAgdmFyIGkgPSBrZXlzLmxlbmd0aFxuICB2YXIgcmVzID0gbmV3IEFycmF5KGkpXG4gIHZhciBrZXlcbiAgd2hpbGUgKGktLSkge1xuICAgIGtleSA9IGtleXNbaV1cbiAgICByZXNbaV0gPSB7XG4gICAgICAka2V5OiBrZXksXG4gICAgICAkdmFsdWU6IG9ialtrZXldXG4gICAgfVxuICB9XG4gIC8vIGB0aGlzYCBwb2ludHMgdG8gdGhlIHJlcGVhdCBkaXJlY3RpdmUgaW5zdGFuY2VcbiAgdGhpcy5jb252ZXJ0ZWQgPSB0cnVlXG4gIHJldHVybiByZXNcbn1cblxuLyoqXG4gKiBDcmVhdGUgYSByYW5nZSBhcnJheSBmcm9tIGdpdmVuIG51bWJlci5cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gblxuICogQHJldHVybiB7QXJyYXl9XG4gKi9cblxuZnVuY3Rpb24gcmFuZ2UgKG4pIHtcbiAgdmFyIGkgPSAtMVxuICB2YXIgcmV0ID0gbmV3IEFycmF5KG4pXG4gIHdoaWxlICgrK2kgPCBuKSB7XG4gICAgcmV0W2ldID0gaVxuICB9XG4gIHJldHVybiByZXRcbn0iLCJ2YXIgdHJhbnNpdGlvbiA9IHJlcXVpcmUoJy4uL3RyYW5zaXRpb24nKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICB2YXIgZWwgPSB0aGlzLmVsXG4gIHRyYW5zaXRpb24uYXBwbHkoZWwsIHZhbHVlID8gMSA6IC0xLCBmdW5jdGlvbiAoKSB7XG4gICAgZWwuc3R5bGUuZGlzcGxheSA9IHZhbHVlID8gJycgOiAnbm9uZSdcbiAgfSwgdGhpcy52bSlcbn0iLCJ2YXIgXyA9IHJlcXVpcmUoJy4uL3V0aWwnKVxudmFyIHByZWZpeGVzID0gWyctd2Via2l0LScsICctbW96LScsICctbXMtJ11cbnZhciBjYW1lbFByZWZpeGVzID0gWydXZWJraXQnLCAnTW96JywgJ21zJ11cbnZhciBpbXBvcnRhbnRSRSA9IC8haW1wb3J0YW50Oz8kL1xudmFyIGNhbWVsUkUgPSAvKFthLXpdKShbQS1aXSkvZ1xudmFyIHRlc3RFbCA9IG51bGxcbnZhciBwcm9wQ2FjaGUgPSB7fVxuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICBkZWVwOiB0cnVlLFxuXG4gIHVwZGF0ZTogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgaWYgKHRoaXMuYXJnKSB7XG4gICAgICB0aGlzLnNldFByb3AodGhpcy5hcmcsIHZhbHVlKVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jykge1xuICAgICAgICAvLyBjYWNoZSBvYmplY3Qgc3R5bGVzIHNvIHRoYXQgb25seSBjaGFuZ2VkIHByb3BzXG4gICAgICAgIC8vIGFyZSBhY3R1YWxseSB1cGRhdGVkLlxuICAgICAgICBpZiAoIXRoaXMuY2FjaGUpIHRoaXMuY2FjaGUgPSB7fVxuICAgICAgICBmb3IgKHZhciBwcm9wIGluIHZhbHVlKSB7XG4gICAgICAgICAgdGhpcy5zZXRQcm9wKHByb3AsIHZhbHVlW3Byb3BdKVxuICAgICAgICAgIC8qIGpzaGludCBlcWVxZXE6IGZhbHNlICovXG4gICAgICAgICAgaWYgKHZhbHVlW3Byb3BdICE9IHRoaXMuY2FjaGVbcHJvcF0pIHtcbiAgICAgICAgICAgIHRoaXMuY2FjaGVbcHJvcF0gPSB2YWx1ZVtwcm9wXVxuICAgICAgICAgICAgdGhpcy5zZXRQcm9wKHByb3AsIHZhbHVlW3Byb3BdKVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5lbC5zdHlsZS5jc3NUZXh0ID0gdmFsdWVcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgc2V0UHJvcDogZnVuY3Rpb24gKHByb3AsIHZhbHVlKSB7XG4gICAgcHJvcCA9IG5vcm1hbGl6ZShwcm9wKVxuICAgIGlmICghcHJvcCkgcmV0dXJuIC8vIHVuc3VwcG9ydGVkIHByb3BcbiAgICAvLyBjYXN0IHBvc3NpYmxlIG51bWJlcnMvYm9vbGVhbnMgaW50byBzdHJpbmdzXG4gICAgaWYgKHZhbHVlICE9IG51bGwpIHZhbHVlICs9ICcnXG4gICAgaWYgKHZhbHVlKSB7XG4gICAgICB2YXIgaXNJbXBvcnRhbnQgPSBpbXBvcnRhbnRSRS50ZXN0KHZhbHVlKVxuICAgICAgICA/ICdpbXBvcnRhbnQnXG4gICAgICAgIDogJydcbiAgICAgIGlmIChpc0ltcG9ydGFudCkge1xuICAgICAgICB2YWx1ZSA9IHZhbHVlLnJlcGxhY2UoaW1wb3J0YW50UkUsICcnKS50cmltKClcbiAgICAgIH1cbiAgICAgIHRoaXMuZWwuc3R5bGUuc2V0UHJvcGVydHkocHJvcCwgdmFsdWUsIGlzSW1wb3J0YW50KVxuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmVsLnN0eWxlLnJlbW92ZVByb3BlcnR5KHByb3ApXG4gICAgfVxuICB9XG5cbn1cblxuLyoqXG4gKiBOb3JtYWxpemUgYSBDU1MgcHJvcGVydHkgbmFtZS5cbiAqIC0gY2FjaGUgcmVzdWx0XG4gKiAtIGF1dG8gcHJlZml4XG4gKiAtIGNhbWVsQ2FzZSAtPiBkYXNoLWNhc2VcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gcHJvcFxuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5cbmZ1bmN0aW9uIG5vcm1hbGl6ZSAocHJvcCkge1xuICBpZiAocHJvcENhY2hlW3Byb3BdKSB7XG4gICAgcmV0dXJuIHByb3BDYWNoZVtwcm9wXVxuICB9XG4gIHZhciByZXMgPSBwcmVmaXgocHJvcClcbiAgcHJvcENhY2hlW3Byb3BdID0gcHJvcENhY2hlW3Jlc10gPSByZXNcbiAgcmV0dXJuIHJlc1xufVxuXG4vKipcbiAqIEF1dG8gZGV0ZWN0IHRoZSBhcHByb3ByaWF0ZSBwcmVmaXggZm9yIGEgQ1NTIHByb3BlcnR5LlxuICogaHR0cHM6Ly9naXN0LmdpdGh1Yi5jb20vcGF1bGlyaXNoLzUyMzY5MlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBwcm9wXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cblxuZnVuY3Rpb24gcHJlZml4IChwcm9wKSB7XG4gIHByb3AgPSBwcm9wLnJlcGxhY2UoY2FtZWxSRSwgJyQxLSQyJykudG9Mb3dlckNhc2UoKVxuICB2YXIgY2FtZWwgPSBfLmNhbWVsaXplKHByb3ApXG4gIHZhciB1cHBlciA9IGNhbWVsLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgY2FtZWwuc2xpY2UoMSlcbiAgaWYgKCF0ZXN0RWwpIHtcbiAgICB0ZXN0RWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKVxuICB9XG4gIGlmIChjYW1lbCBpbiB0ZXN0RWwuc3R5bGUpIHtcbiAgICByZXR1cm4gcHJvcFxuICB9XG4gIHZhciBpID0gcHJlZml4ZXMubGVuZ3RoXG4gIHZhciBwcmVmaXhlZFxuICB3aGlsZSAoaS0tKSB7XG4gICAgcHJlZml4ZWQgPSBjYW1lbFByZWZpeGVzW2ldICsgdXBwZXJcbiAgICBpZiAocHJlZml4ZWQgaW4gdGVzdEVsLnN0eWxlKSB7XG4gICAgICByZXR1cm4gcHJlZml4ZXNbaV0gKyBwcm9wXG4gICAgfVxuICB9XG59IiwidmFyIF8gPSByZXF1aXJlKCcuLi91dGlsJylcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgYmluZDogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuYXR0ciA9IHRoaXMuZWwubm9kZVR5cGUgPT09IDNcbiAgICAgID8gJ25vZGVWYWx1ZSdcbiAgICAgIDogJ3RleHRDb250ZW50J1xuICB9LFxuXG4gIHVwZGF0ZTogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgdGhpcy5lbFt0aGlzLmF0dHJdID0gXy50b1N0cmluZyh2YWx1ZSlcbiAgfVxuICBcbn0iLCJtb2R1bGUuZXhwb3J0cyA9IHtcblxuICBwcmlvcml0eTogMTAwMCxcbiAgaXNMaXRlcmFsOiB0cnVlLFxuXG4gIGJpbmQ6IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoIXRoaXMuX2lzRHluYW1pY0xpdGVyYWwpIHtcbiAgICAgIHRoaXMudXBkYXRlKHRoaXMuZXhwcmVzc2lvbilcbiAgICB9XG4gIH0sXG5cbiAgdXBkYXRlOiBmdW5jdGlvbiAoaWQpIHtcbiAgICB2YXIgdm0gPSB0aGlzLmVsLl9fdnVlX18gfHwgdGhpcy52bVxuICAgIHRoaXMuZWwuX192X3RyYW5zID0ge1xuICAgICAgaWQ6IGlkLFxuICAgICAgLy8gcmVzb2x2ZSB0aGUgY3VzdG9tIHRyYW5zaXRpb24gZnVuY3Rpb25zIG5vd1xuICAgICAgLy8gc28gdGhlIHRyYW5zaXRpb24gbW9kdWxlIGtub3dzIHRoaXMgaXMgYVxuICAgICAgLy8gamF2YXNjcmlwdCB0cmFuc2l0aW9uIHdpdGhvdXQgaGF2aW5nIHRvIGNoZWNrXG4gICAgICAvLyBjb21wdXRlZCBDU1MuXG4gICAgICBmbnM6IHZtLiRvcHRpb25zLnRyYW5zaXRpb25zW2lkXVxuICAgIH1cbiAgfVxuXG59IiwidmFyIF8gPSByZXF1aXJlKCcuLi91dGlsJylcbnZhciBXYXRjaGVyID0gcmVxdWlyZSgnLi4vd2F0Y2hlcicpXG52YXIgZXhwUGFyc2VyID0gcmVxdWlyZSgnLi4vcGFyc2Vycy9leHByZXNzaW9uJylcbnZhciBsaXRlcmFsUkUgPSAvXih0cnVlfGZhbHNlfFxccz8oJ1teJ10qJ3xcIlteXCJdXCIpXFxzPykkL1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblxuICBwcmlvcml0eTogOTAwLFxuXG4gIGJpbmQ6IGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBjaGlsZCA9IHRoaXMudm1cbiAgICB2YXIgcGFyZW50ID0gY2hpbGQuJHBhcmVudFxuICAgIHZhciBjaGlsZEtleSA9IHRoaXMuYXJnIHx8ICckZGF0YSdcbiAgICB2YXIgcGFyZW50S2V5ID0gdGhpcy5leHByZXNzaW9uXG5cbiAgICBpZiAodGhpcy5lbCAmJiB0aGlzLmVsICE9PSBjaGlsZC4kZWwpIHtcbiAgICAgIF8ud2FybihcbiAgICAgICAgJ3Ytd2l0aCBjYW4gb25seSBiZSB1c2VkIG9uIGluc3RhbmNlIHJvb3QgZWxlbWVudHMuJ1xuICAgICAgKVxuICAgIH0gZWxzZSBpZiAoIXBhcmVudCkge1xuICAgICAgXy53YXJuKFxuICAgICAgICAndi13aXRoIG11c3QgYmUgdXNlZCBvbiBhbiBpbnN0YW5jZSB3aXRoIGEgcGFyZW50LidcbiAgICAgIClcbiAgICB9IGVsc2UgaWYgKGxpdGVyYWxSRS50ZXN0KHBhcmVudEtleSkpIHtcbiAgICAgIC8vIG5vIG5lZWQgdG8gc2V0dXAgd2F0Y2hlcnMgZm9yIGxpdGVyYWwgYmluZGluZ3NcbiAgICAgIGlmICghdGhpcy5hcmcpIHtcbiAgICAgICAgXy53YXJuKFxuICAgICAgICAgICd2LXdpdGggY2Fubm90IGJpbmQgbGl0ZXJhbCB2YWx1ZSBhcyAkZGF0YTogJyArXG4gICAgICAgICAgcGFyZW50S2V5XG4gICAgICAgIClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciB2YWx1ZSA9IGV4cFBhcnNlci5wYXJzZShwYXJlbnRLZXkpLmdldCgpXG4gICAgICAgIGNoaWxkLiRzZXQoY2hpbGRLZXksIHZhbHVlKVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG5cbiAgICAgIC8vIHNpbXBsZSBsb2NrIHRvIGF2b2lkIGNpcmN1bGFyIHVwZGF0ZXMuXG4gICAgICAvLyB3aXRob3V0IHRoaXMgaXQgd291bGQgc3RhYmlsaXplIHRvbywgYnV0IHRoaXMgbWFrZXNcbiAgICAgIC8vIHN1cmUgaXQgZG9lc24ndCBjYXVzZSBvdGhlciB3YXRjaGVycyB0byByZS1ldmFsdWF0ZS5cbiAgICAgIHZhciBsb2NrZWQgPSBmYWxzZVxuICAgICAgdmFyIGxvY2sgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGxvY2tlZCA9IHRydWVcbiAgICAgICAgXy5uZXh0VGljayh1bmxvY2spXG4gICAgICB9XG4gICAgICB2YXIgdW5sb2NrID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBsb2NrZWQgPSBmYWxzZVxuICAgICAgfVxuXG4gICAgICB0aGlzLnBhcmVudFdhdGNoZXIgPSBuZXcgV2F0Y2hlcihcbiAgICAgICAgcGFyZW50LFxuICAgICAgICBwYXJlbnRLZXksXG4gICAgICAgIGZ1bmN0aW9uICh2YWwpIHtcbiAgICAgICAgICBpZiAoIWxvY2tlZCkge1xuICAgICAgICAgICAgbG9jaygpXG4gICAgICAgICAgICBjaGlsZC4kc2V0KGNoaWxkS2V5LCB2YWwpXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICApXG4gICAgICBcbiAgICAgIC8vIHNldCB0aGUgY2hpbGQgaW5pdGlhbCB2YWx1ZSBmaXJzdCwgYmVmb3JlIHNldHRpbmdcbiAgICAgIC8vIHVwIHRoZSBjaGlsZCB3YXRjaGVyIHRvIGF2b2lkIHRyaWdnZXJpbmcgaXRcbiAgICAgIC8vIGltbWVkaWF0ZWx5LlxuICAgICAgY2hpbGQuJHNldChjaGlsZEtleSwgdGhpcy5wYXJlbnRXYXRjaGVyLnZhbHVlKVxuXG4gICAgICB0aGlzLmNoaWxkV2F0Y2hlciA9IG5ldyBXYXRjaGVyKFxuICAgICAgICBjaGlsZCxcbiAgICAgICAgY2hpbGRLZXksXG4gICAgICAgIGZ1bmN0aW9uICh2YWwpIHtcbiAgICAgICAgICBpZiAoIWxvY2tlZCkge1xuICAgICAgICAgICAgbG9jaygpXG4gICAgICAgICAgICBwYXJlbnQuJHNldChwYXJlbnRLZXksIHZhbClcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIClcbiAgICB9XG4gIH0sXG5cbiAgdW5iaW5kOiBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMucGFyZW50V2F0Y2hlcikge1xuICAgICAgdGhpcy5wYXJlbnRXYXRjaGVyLnRlYXJkb3duKClcbiAgICAgIHRoaXMuY2hpbGRXYXRjaGVyLnRlYXJkb3duKClcbiAgICB9XG4gIH1cblxufSIsInZhciBfID0gcmVxdWlyZSgnLi4vdXRpbCcpXG52YXIgUGF0aCA9IHJlcXVpcmUoJy4uL3BhcnNlcnMvcGF0aCcpXG5cbi8qKlxuICogRmlsdGVyIGZpbHRlciBmb3Igdi1yZXBlYXRcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc2VhcmNoS2V5XG4gKiBAcGFyYW0ge1N0cmluZ30gW2RlbGltaXRlcl1cbiAqIEBwYXJhbSB7U3RyaW5nfSBkYXRhS2V5XG4gKi9cblxuZXhwb3J0cy5maWx0ZXJCeSA9IGZ1bmN0aW9uIChhcnIsIHNlYXJjaEtleSwgZGVsaW1pdGVyLCBkYXRhS2V5KSB7XG4gIC8vIGFsbG93IG9wdGlvbmFsIGBpbmAgZGVsaW1pdGVyXG4gIC8vIGJlY2F1c2Ugd2h5IG5vdFxuICBpZiAoZGVsaW1pdGVyICYmIGRlbGltaXRlciAhPT0gJ2luJykge1xuICAgIGRhdGFLZXkgPSBkZWxpbWl0ZXJcbiAgfVxuICAvLyBnZXQgdGhlIHNlYXJjaCBzdHJpbmdcbiAgdmFyIHNlYXJjaCA9XG4gICAgXy5zdHJpcFF1b3RlcyhzZWFyY2hLZXkpIHx8XG4gICAgdGhpcy4kZ2V0KHNlYXJjaEtleSlcbiAgaWYgKCFzZWFyY2gpIHtcbiAgICByZXR1cm4gYXJyXG4gIH1cbiAgc2VhcmNoID0gKCcnICsgc2VhcmNoKS50b0xvd2VyQ2FzZSgpXG4gIC8vIGdldCB0aGUgb3B0aW9uYWwgZGF0YUtleVxuICBkYXRhS2V5ID1cbiAgICBkYXRhS2V5ICYmXG4gICAgKF8uc3RyaXBRdW90ZXMoZGF0YUtleSkgfHwgdGhpcy4kZ2V0KGRhdGFLZXkpKVxuICByZXR1cm4gYXJyLmZpbHRlcihmdW5jdGlvbiAoaXRlbSkge1xuICAgIHJldHVybiBkYXRhS2V5XG4gICAgICA/IGNvbnRhaW5zKFBhdGguZ2V0KGl0ZW0sIGRhdGFLZXkpLCBzZWFyY2gpXG4gICAgICA6IGNvbnRhaW5zKGl0ZW0sIHNlYXJjaClcbiAgfSlcbn1cblxuLyoqXG4gKiBGaWx0ZXIgZmlsdGVyIGZvciB2LXJlcGVhdFxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzb3J0S2V5XG4gKiBAcGFyYW0ge1N0cmluZ30gcmV2ZXJzZUtleVxuICovXG5cbmV4cG9ydHMub3JkZXJCeSA9IGZ1bmN0aW9uIChhcnIsIHNvcnRLZXksIHJldmVyc2VLZXkpIHtcbiAgdmFyIGtleSA9XG4gICAgXy5zdHJpcFF1b3Rlcyhzb3J0S2V5KSB8fFxuICAgIHRoaXMuJGdldChzb3J0S2V5KVxuICBpZiAoIWtleSkge1xuICAgIHJldHVybiBhcnJcbiAgfVxuICB2YXIgb3JkZXIgPSAxXG4gIGlmIChyZXZlcnNlS2V5KSB7XG4gICAgaWYgKHJldmVyc2VLZXkgPT09ICctMScpIHtcbiAgICAgIG9yZGVyID0gLTFcbiAgICB9IGVsc2UgaWYgKHJldmVyc2VLZXkuY2hhckNvZGVBdCgwKSA9PT0gMHgyMSkgeyAvLyAhXG4gICAgICByZXZlcnNlS2V5ID0gcmV2ZXJzZUtleS5zbGljZSgxKVxuICAgICAgb3JkZXIgPSB0aGlzLiRnZXQocmV2ZXJzZUtleSkgPyAxIDogLTFcbiAgICB9IGVsc2Uge1xuICAgICAgb3JkZXIgPSB0aGlzLiRnZXQocmV2ZXJzZUtleSkgPyAtMSA6IDFcbiAgICB9XG4gIH1cbiAgLy8gc29ydCBvbiBhIGNvcHkgdG8gYXZvaWQgbXV0YXRpbmcgb3JpZ2luYWwgYXJyYXlcbiAgcmV0dXJuIGFyci5zbGljZSgpLnNvcnQoZnVuY3Rpb24gKGEsIGIpIHtcbiAgICBhID0gXy5pc09iamVjdChhKSA/IFBhdGguZ2V0KGEsIGtleSkgOiBhXG4gICAgYiA9IF8uaXNPYmplY3QoYikgPyBQYXRoLmdldChiLCBrZXkpIDogYlxuICAgIHJldHVybiBhID09PSBiID8gMCA6IGEgPiBiID8gb3JkZXIgOiAtb3JkZXJcbiAgfSlcbn1cblxuLyoqXG4gKiBTdHJpbmcgY29udGFpbiBoZWxwZXJcbiAqXG4gKiBAcGFyYW0geyp9IHZhbFxuICogQHBhcmFtIHtTdHJpbmd9IHNlYXJjaFxuICovXG5cbmZ1bmN0aW9uIGNvbnRhaW5zICh2YWwsIHNlYXJjaCkge1xuICBpZiAoXy5pc09iamVjdCh2YWwpKSB7XG4gICAgZm9yICh2YXIga2V5IGluIHZhbCkge1xuICAgICAgaWYgKGNvbnRhaW5zKHZhbFtrZXldLCBzZWFyY2gpKSB7XG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICB9XG4gICAgfVxuICB9IGVsc2UgaWYgKHZhbCAhPSBudWxsKSB7XG4gICAgcmV0dXJuIHZhbC50b1N0cmluZygpLnRvTG93ZXJDYXNlKCkuaW5kZXhPZihzZWFyY2gpID4gLTFcbiAgfVxufSIsInZhciBfID0gcmVxdWlyZSgnLi4vdXRpbCcpXG5cbi8qKlxuICogU3RyaW5naWZ5IHZhbHVlLlxuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBpbmRlbnRcbiAqL1xuXG5leHBvcnRzLmpzb24gPSB7XG4gIHJlYWQ6IGZ1bmN0aW9uICh2YWx1ZSwgaW5kZW50KSB7XG4gICAgcmV0dXJuIHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZydcbiAgICAgID8gdmFsdWVcbiAgICAgIDogSlNPTi5zdHJpbmdpZnkodmFsdWUsIG51bGwsIE51bWJlcihpbmRlbnQpIHx8IDIpXG4gIH0sXG4gIHdyaXRlOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIEpTT04ucGFyc2UodmFsdWUpXG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgcmV0dXJuIHZhbHVlXG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogJ2FiYycgPT4gJ0FiYydcbiAqL1xuXG5leHBvcnRzLmNhcGl0YWxpemUgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgaWYgKCF2YWx1ZSAmJiB2YWx1ZSAhPT0gMCkgcmV0dXJuICcnXG4gIHZhbHVlID0gdmFsdWUudG9TdHJpbmcoKVxuICByZXR1cm4gdmFsdWUuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyB2YWx1ZS5zbGljZSgxKVxufVxuXG4vKipcbiAqICdhYmMnID0+ICdBQkMnXG4gKi9cblxuZXhwb3J0cy51cHBlcmNhc2UgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgcmV0dXJuICh2YWx1ZSB8fCB2YWx1ZSA9PT0gMClcbiAgICA/IHZhbHVlLnRvU3RyaW5nKCkudG9VcHBlckNhc2UoKVxuICAgIDogJydcbn1cblxuLyoqXG4gKiAnQWJDJyA9PiAnYWJjJ1xuICovXG5cbmV4cG9ydHMubG93ZXJjYXNlID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gIHJldHVybiAodmFsdWUgfHwgdmFsdWUgPT09IDApXG4gICAgPyB2YWx1ZS50b1N0cmluZygpLnRvTG93ZXJDYXNlKClcbiAgICA6ICcnXG59XG5cbi8qKlxuICogMTIzNDUgPT4gJDEyLDM0NS4wMFxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzaWduXG4gKi9cblxudmFyIGRpZ2l0c1JFID0gLyhcXGR7M30pKD89XFxkKS9nXG5cbmV4cG9ydHMuY3VycmVuY3kgPSBmdW5jdGlvbiAodmFsdWUsIHNpZ24pIHtcbiAgdmFsdWUgPSBwYXJzZUZsb2F0KHZhbHVlKVxuICBpZiAoIWlzRmluaXRlKHZhbHVlKSB8fCAoIXZhbHVlICYmIHZhbHVlICE9PSAwKSkgcmV0dXJuICcnXG4gIHNpZ24gPSBzaWduIHx8ICckJ1xuICB2YXIgcyA9IE1hdGguZmxvb3IoTWF0aC5hYnModmFsdWUpKS50b1N0cmluZygpLFxuICAgIGkgPSBzLmxlbmd0aCAlIDMsXG4gICAgaCA9IGkgPiAwXG4gICAgICA/IChzLnNsaWNlKDAsIGkpICsgKHMubGVuZ3RoID4gMyA/ICcsJyA6ICcnKSlcbiAgICAgIDogJycsXG4gICAgdiA9IE1hdGguYWJzKHBhcnNlSW50KCh2YWx1ZSAqIDEwMCkgJSAxMDAsIDEwKSksXG4gICAgZiA9ICcuJyArICh2IDwgMTAgPyAoJzAnICsgdikgOiB2KVxuICByZXR1cm4gKHZhbHVlIDwgMCA/ICctJyA6ICcnKSArXG4gICAgc2lnbiArIGggKyBzLnNsaWNlKGkpLnJlcGxhY2UoZGlnaXRzUkUsICckMSwnKSArIGZcbn1cblxuLyoqXG4gKiAnaXRlbScgPT4gJ2l0ZW1zJ1xuICpcbiAqIEBwYXJhbXNcbiAqICBhbiBhcnJheSBvZiBzdHJpbmdzIGNvcnJlc3BvbmRpbmcgdG9cbiAqICB0aGUgc2luZ2xlLCBkb3VibGUsIHRyaXBsZSAuLi4gZm9ybXMgb2YgdGhlIHdvcmQgdG9cbiAqICBiZSBwbHVyYWxpemVkLiBXaGVuIHRoZSBudW1iZXIgdG8gYmUgcGx1cmFsaXplZFxuICogIGV4Y2VlZHMgdGhlIGxlbmd0aCBvZiB0aGUgYXJncywgaXQgd2lsbCB1c2UgdGhlIGxhc3RcbiAqICBlbnRyeSBpbiB0aGUgYXJyYXkuXG4gKlxuICogIGUuZy4gWydzaW5nbGUnLCAnZG91YmxlJywgJ3RyaXBsZScsICdtdWx0aXBsZSddXG4gKi9cblxuZXhwb3J0cy5wbHVyYWxpemUgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgdmFyIGFyZ3MgPSBfLnRvQXJyYXkoYXJndW1lbnRzLCAxKVxuICByZXR1cm4gYXJncy5sZW5ndGggPiAxXG4gICAgPyAoYXJnc1t2YWx1ZSAlIDEwIC0gMV0gfHwgYXJnc1thcmdzLmxlbmd0aCAtIDFdKVxuICAgIDogKGFyZ3NbMF0gKyAodmFsdWUgPT09IDEgPyAnJyA6ICdzJykpXG59XG5cbi8qKlxuICogQSBzcGVjaWFsIGZpbHRlciB0aGF0IHRha2VzIGEgaGFuZGxlciBmdW5jdGlvbixcbiAqIHdyYXBzIGl0IHNvIGl0IG9ubHkgZ2V0cyB0cmlnZ2VyZWQgb24gc3BlY2lmaWNcbiAqIGtleXByZXNzZXMuIHYtb24gb25seS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30ga2V5XG4gKi9cblxudmFyIGtleUNvZGVzID0ge1xuICBlbnRlciAgICA6IDEzLFxuICB0YWIgICAgICA6IDksXG4gICdkZWxldGUnIDogNDYsXG4gIHVwICAgICAgIDogMzgsXG4gIGxlZnQgICAgIDogMzcsXG4gIHJpZ2h0ICAgIDogMzksXG4gIGRvd24gICAgIDogNDAsXG4gIGVzYyAgICAgIDogMjdcbn1cblxuZXhwb3J0cy5rZXkgPSBmdW5jdGlvbiAoaGFuZGxlciwga2V5KSB7XG4gIGlmICghaGFuZGxlcikgcmV0dXJuXG4gIHZhciBjb2RlID0ga2V5Q29kZXNba2V5XVxuICBpZiAoIWNvZGUpIHtcbiAgICBjb2RlID0gcGFyc2VJbnQoa2V5LCAxMClcbiAgfVxuICByZXR1cm4gZnVuY3Rpb24gKGUpIHtcbiAgICBpZiAoZS5rZXlDb2RlID09PSBjb2RlKSB7XG4gICAgICByZXR1cm4gaGFuZGxlci5jYWxsKHRoaXMsIGUpXG4gICAgfVxuICB9XG59XG5cbi8vIGV4cG9zZSBrZXljb2RlIGhhc2hcbmV4cG9ydHMua2V5LmtleUNvZGVzID0ga2V5Q29kZXNcblxuLyoqXG4gKiBJbnN0YWxsIHNwZWNpYWwgYXJyYXkgZmlsdGVyc1xuICovXG5cbl8uZXh0ZW5kKGV4cG9ydHMsIHJlcXVpcmUoJy4vYXJyYXktZmlsdGVycycpKVxuIiwidmFyIF8gPSByZXF1aXJlKCcuLi91dGlsJylcbnZhciBEaXJlY3RpdmUgPSByZXF1aXJlKCcuLi9kaXJlY3RpdmUnKVxudmFyIGNvbXBpbGUgPSByZXF1aXJlKCcuLi9jb21waWxlci9jb21waWxlJylcbnZhciB0cmFuc2NsdWRlID0gcmVxdWlyZSgnLi4vY29tcGlsZXIvdHJhbnNjbHVkZScpXG5cbi8qKlxuICogVHJhbnNjbHVkZSwgY29tcGlsZSBhbmQgbGluayBlbGVtZW50LlxuICpcbiAqIElmIGEgcHJlLWNvbXBpbGVkIGxpbmtlciBpcyBhdmFpbGFibGUsIHRoYXQgbWVhbnMgdGhlXG4gKiBwYXNzZWQgaW4gZWxlbWVudCB3aWxsIGJlIHByZS10cmFuc2NsdWRlZCBhbmQgY29tcGlsZWRcbiAqIGFzIHdlbGwgLSBhbGwgd2UgbmVlZCB0byBkbyBpcyB0byBjYWxsIHRoZSBsaW5rZXIuXG4gKlxuICogT3RoZXJ3aXNlIHdlIG5lZWQgdG8gY2FsbCB0cmFuc2NsdWRlL2NvbXBpbGUvbGluayBoZXJlLlxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxcbiAqIEByZXR1cm4ge0VsZW1lbnR9XG4gKi9cblxuZXhwb3J0cy5fY29tcGlsZSA9IGZ1bmN0aW9uIChlbCkge1xuICB2YXIgb3B0aW9ucyA9IHRoaXMuJG9wdGlvbnNcbiAgaWYgKG9wdGlvbnMuX2xpbmtGbikge1xuICAgIC8vIHByZS10cmFuc2NsdWRlZCB3aXRoIGxpbmtlciwganVzdCB1c2UgaXRcbiAgICB0aGlzLl9pbml0RWxlbWVudChlbClcbiAgICBvcHRpb25zLl9saW5rRm4odGhpcywgZWwpXG4gIH0gZWxzZSB7XG4gICAgLy8gdHJhbnNjbHVkZSBhbmQgaW5pdCBlbGVtZW50XG4gICAgLy8gdHJhbnNjbHVkZSBjYW4gcG90ZW50aWFsbHkgcmVwbGFjZSBvcmlnaW5hbFxuICAgIC8vIHNvIHdlIG5lZWQgdG8ga2VlcCByZWZlcmVuY2VcbiAgICB2YXIgb3JpZ2luYWwgPSBlbFxuICAgIGVsID0gdHJhbnNjbHVkZShlbCwgb3B0aW9ucylcbiAgICB0aGlzLl9pbml0RWxlbWVudChlbClcbiAgICAvLyBjb21waWxlIGFuZCBsaW5rIHRoZSByZXN0XG4gICAgY29tcGlsZShlbCwgb3B0aW9ucykodGhpcywgZWwpXG4gICAgLy8gZmluYWxseSByZXBsYWNlIG9yaWdpbmFsXG4gICAgaWYgKG9wdGlvbnMucmVwbGFjZSkge1xuICAgICAgXy5yZXBsYWNlKG9yaWdpbmFsLCBlbClcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGVsXG59XG5cbi8qKlxuICogSW5pdGlhbGl6ZSBpbnN0YW5jZSBlbGVtZW50LiBDYWxsZWQgaW4gdGhlIHB1YmxpY1xuICogJG1vdW50KCkgbWV0aG9kLlxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxcbiAqL1xuXG5leHBvcnRzLl9pbml0RWxlbWVudCA9IGZ1bmN0aW9uIChlbCkge1xuICBpZiAoZWwgaW5zdGFuY2VvZiBEb2N1bWVudEZyYWdtZW50KSB7XG4gICAgdGhpcy5faXNCbG9jayA9IHRydWVcbiAgICB0aGlzLiRlbCA9IHRoaXMuX2Jsb2NrU3RhcnQgPSBlbC5maXJzdENoaWxkXG4gICAgdGhpcy5fYmxvY2tFbmQgPSBlbC5sYXN0Q2hpbGRcbiAgICB0aGlzLl9ibG9ja0ZyYWdtZW50ID0gZWxcbiAgfSBlbHNlIHtcbiAgICB0aGlzLiRlbCA9IGVsXG4gIH1cbiAgdGhpcy4kZWwuX192dWVfXyA9IHRoaXNcbiAgdGhpcy5fY2FsbEhvb2soJ2JlZm9yZUNvbXBpbGUnKVxufVxuXG4vKipcbiAqIENyZWF0ZSBhbmQgYmluZCBhIGRpcmVjdGl2ZSB0byBhbiBlbGVtZW50LlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBuYW1lIC0gZGlyZWN0aXZlIG5hbWVcbiAqIEBwYXJhbSB7Tm9kZX0gbm9kZSAgIC0gdGFyZ2V0IG5vZGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBkZXNjIC0gcGFyc2VkIGRpcmVjdGl2ZSBkZXNjcmlwdG9yXG4gKiBAcGFyYW0ge09iamVjdH0gZGVmICAtIGRpcmVjdGl2ZSBkZWZpbml0aW9uIG9iamVjdFxuICogQHBhcmFtIHtWdWV8dW5kZWZpbmVkfSBob3N0IC0gdHJhbnNjbHVzaW9uIGhvc3QgY29tcG9uZW50XG4gKi9cblxuZXhwb3J0cy5fYmluZERpciA9IGZ1bmN0aW9uIChuYW1lLCBub2RlLCBkZXNjLCBkZWYsIGhvc3QpIHtcbiAgdGhpcy5fZGlyZWN0aXZlcy5wdXNoKFxuICAgIG5ldyBEaXJlY3RpdmUobmFtZSwgbm9kZSwgdGhpcywgZGVzYywgZGVmLCBob3N0KVxuICApXG59XG5cbi8qKlxuICogVGVhcmRvd24gYW4gaW5zdGFuY2UsIHVub2JzZXJ2ZXMgdGhlIGRhdGEsIHVuYmluZCBhbGwgdGhlXG4gKiBkaXJlY3RpdmVzLCB0dXJuIG9mZiBhbGwgdGhlIGV2ZW50IGxpc3RlbmVycywgZXRjLlxuICpcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gcmVtb3ZlIC0gd2hldGhlciB0byByZW1vdmUgdGhlIERPTSBub2RlLlxuICogQHBhcmFtIHtCb29sZWFufSBkZWZlckNsZWFudXAgLSBpZiB0cnVlLCBkZWZlciBjbGVhbnVwIHRvXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJlIGNhbGxlZCBsYXRlclxuICovXG5cbmV4cG9ydHMuX2Rlc3Ryb3kgPSBmdW5jdGlvbiAocmVtb3ZlLCBkZWZlckNsZWFudXApIHtcbiAgaWYgKHRoaXMuX2lzQmVpbmdEZXN0cm95ZWQpIHtcbiAgICByZXR1cm5cbiAgfVxuICB0aGlzLl9jYWxsSG9vaygnYmVmb3JlRGVzdHJveScpXG4gIHRoaXMuX2lzQmVpbmdEZXN0cm95ZWQgPSB0cnVlXG4gIHZhciBpXG4gIC8vIHJlbW92ZSBzZWxmIGZyb20gcGFyZW50LiBvbmx5IG5lY2Vzc2FyeVxuICAvLyBpZiBwYXJlbnQgaXMgbm90IGJlaW5nIGRlc3Ryb3llZCBhcyB3ZWxsLlxuICB2YXIgcGFyZW50ID0gdGhpcy4kcGFyZW50XG4gIGlmIChwYXJlbnQgJiYgIXBhcmVudC5faXNCZWluZ0Rlc3Ryb3llZCkge1xuICAgIGkgPSBwYXJlbnQuX2NoaWxkcmVuLmluZGV4T2YodGhpcylcbiAgICBwYXJlbnQuX2NoaWxkcmVuLnNwbGljZShpLCAxKVxuICB9XG4gIC8vIHNhbWUgZm9yIHRyYW5zY2x1c2lvbiBob3N0LlxuICB2YXIgaG9zdCA9IHRoaXMuX2hvc3RcbiAgaWYgKGhvc3QgJiYgIWhvc3QuX2lzQmVpbmdEZXN0cm95ZWQpIHtcbiAgICBpID0gaG9zdC5fdHJhbnNDcG50cy5pbmRleE9mKHRoaXMpXG4gICAgaG9zdC5fdHJhbnNDcG50cy5zcGxpY2UoaSwgMSlcbiAgfVxuICAvLyBkZXN0cm95IGFsbCBjaGlsZHJlbi5cbiAgaSA9IHRoaXMuX2NoaWxkcmVuLmxlbmd0aFxuICB3aGlsZSAoaS0tKSB7XG4gICAgdGhpcy5fY2hpbGRyZW5baV0uJGRlc3Ryb3koKVxuICB9XG4gIC8vIHRlYXJkb3duIGFsbCBkaXJlY3RpdmVzLiB0aGlzIGFsc28gdGVhcnNkb3duIGFsbFxuICAvLyBkaXJlY3RpdmUtb3duZWQgd2F0Y2hlcnMuIGludGVudGlvbmFsbHkgY2hlY2sgZm9yXG4gIC8vIGRpcmVjdGl2ZXMgYXJyYXkgbGVuZ3RoIG9uIGV2ZXJ5IGxvb3Agc2luY2UgZGlyZWN0aXZlc1xuICAvLyB0aGF0IG1hbmFnZXMgcGFydGlhbCBjb21waWxhdGlvbiBjYW4gc3BsaWNlIG9uZXMgb3V0XG4gIGZvciAoaSA9IDA7IGkgPCB0aGlzLl9kaXJlY3RpdmVzLmxlbmd0aDsgaSsrKSB7XG4gICAgdGhpcy5fZGlyZWN0aXZlc1tpXS5fdGVhcmRvd24oKVxuICB9XG4gIC8vIHRlYXJkb3duIGFsbCB1c2VyIHdhdGNoZXJzLlxuICB2YXIgd2F0Y2hlclxuICBmb3IgKGkgaW4gdGhpcy5fdXNlcldhdGNoZXJzKSB7XG4gICAgd2F0Y2hlciA9IHRoaXMuX3VzZXJXYXRjaGVyc1tpXVxuICAgIGlmICh3YXRjaGVyKSB7XG4gICAgICB3YXRjaGVyLnRlYXJkb3duKClcbiAgICB9XG4gIH1cbiAgLy8gcmVtb3ZlIHJlZmVyZW5jZSB0byBzZWxmIG9uICRlbFxuICBpZiAodGhpcy4kZWwpIHtcbiAgICB0aGlzLiRlbC5fX3Z1ZV9fID0gbnVsbFxuICB9XG4gIC8vIHJlbW92ZSBET00gZWxlbWVudFxuICB2YXIgc2VsZiA9IHRoaXNcbiAgaWYgKHJlbW92ZSAmJiB0aGlzLiRlbCkge1xuICAgIHRoaXMuJHJlbW92ZShmdW5jdGlvbiAoKSB7XG4gICAgICBzZWxmLl9jbGVhbnVwKClcbiAgICB9KVxuICB9IGVsc2UgaWYgKCFkZWZlckNsZWFudXApIHtcbiAgICB0aGlzLl9jbGVhbnVwKClcbiAgfVxufVxuXG4vKipcbiAqIENsZWFuIHVwIHRvIGVuc3VyZSBnYXJiYWdlIGNvbGxlY3Rpb24uXG4gKiBUaGlzIGlzIGNhbGxlZCBhZnRlciB0aGUgbGVhdmUgdHJhbnNpdGlvbiBpZiB0aGVyZVxuICogaXMgYW55LlxuICovXG5cbmV4cG9ydHMuX2NsZWFudXAgPSBmdW5jdGlvbiAoKSB7XG4gIC8vIHJlbW92ZSByZWZlcmVuY2UgZnJvbSBkYXRhIG9iXG4gIHRoaXMuX2RhdGEuX19vYl9fLnJlbW92ZVZtKHRoaXMpXG4gIHRoaXMuX2RhdGEgPVxuICB0aGlzLl93YXRjaGVycyA9XG4gIHRoaXMuX3VzZXJXYXRjaGVycyA9XG4gIHRoaXMuX3dhdGNoZXJMaXN0ID1cbiAgdGhpcy4kZWwgPVxuICB0aGlzLiRwYXJlbnQgPVxuICB0aGlzLiRyb290ID1cbiAgdGhpcy5fY2hpbGRyZW4gPVxuICB0aGlzLl90cmFuc0NwbnRzID1cbiAgdGhpcy5fZGlyZWN0aXZlcyA9IG51bGxcbiAgLy8gY2FsbCB0aGUgbGFzdCBob29rLi4uXG4gIHRoaXMuX2lzRGVzdHJveWVkID0gdHJ1ZVxuICB0aGlzLl9jYWxsSG9vaygnZGVzdHJveWVkJylcbiAgLy8gdHVybiBvZmYgYWxsIGluc3RhbmNlIGxpc3RlbmVycy5cbiAgdGhpcy4kb2ZmKClcbn0iLCJ2YXIgXyA9IHJlcXVpcmUoJy4uL3V0aWwnKVxudmFyIGluRG9jID0gXy5pbkRvY1xuXG4vKipcbiAqIFNldHVwIHRoZSBpbnN0YW5jZSdzIG9wdGlvbiBldmVudHMgJiB3YXRjaGVycy5cbiAqIElmIHRoZSB2YWx1ZSBpcyBhIHN0cmluZywgd2UgcHVsbCBpdCBmcm9tIHRoZVxuICogaW5zdGFuY2UncyBtZXRob2RzIGJ5IG5hbWUuXG4gKi9cblxuZXhwb3J0cy5faW5pdEV2ZW50cyA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIG9wdGlvbnMgPSB0aGlzLiRvcHRpb25zXG4gIHJlZ2lzdGVyQ2FsbGJhY2tzKHRoaXMsICckb24nLCBvcHRpb25zLmV2ZW50cylcbiAgcmVnaXN0ZXJDYWxsYmFja3ModGhpcywgJyR3YXRjaCcsIG9wdGlvbnMud2F0Y2gpXG59XG5cbi8qKlxuICogUmVnaXN0ZXIgY2FsbGJhY2tzIGZvciBvcHRpb24gZXZlbnRzIGFuZCB3YXRjaGVycy5cbiAqXG4gKiBAcGFyYW0ge1Z1ZX0gdm1cbiAqIEBwYXJhbSB7U3RyaW5nfSBhY3Rpb25cbiAqIEBwYXJhbSB7T2JqZWN0fSBoYXNoXG4gKi9cblxuZnVuY3Rpb24gcmVnaXN0ZXJDYWxsYmFja3MgKHZtLCBhY3Rpb24sIGhhc2gpIHtcbiAgaWYgKCFoYXNoKSByZXR1cm5cbiAgdmFyIGhhbmRsZXJzLCBrZXksIGksIGpcbiAgZm9yIChrZXkgaW4gaGFzaCkge1xuICAgIGhhbmRsZXJzID0gaGFzaFtrZXldXG4gICAgaWYgKF8uaXNBcnJheShoYW5kbGVycykpIHtcbiAgICAgIGZvciAoaSA9IDAsIGogPSBoYW5kbGVycy5sZW5ndGg7IGkgPCBqOyBpKyspIHtcbiAgICAgICAgcmVnaXN0ZXIodm0sIGFjdGlvbiwga2V5LCBoYW5kbGVyc1tpXSlcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgcmVnaXN0ZXIodm0sIGFjdGlvbiwga2V5LCBoYW5kbGVycylcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBIZWxwZXIgdG8gcmVnaXN0ZXIgYW4gZXZlbnQvd2F0Y2ggY2FsbGJhY2suXG4gKlxuICogQHBhcmFtIHtWdWV9IHZtXG4gKiBAcGFyYW0ge1N0cmluZ30gYWN0aW9uXG4gKiBAcGFyYW0ge1N0cmluZ30ga2V5XG4gKiBAcGFyYW0geyp9IGhhbmRsZXJcbiAqL1xuXG5mdW5jdGlvbiByZWdpc3RlciAodm0sIGFjdGlvbiwga2V5LCBoYW5kbGVyKSB7XG4gIHZhciB0eXBlID0gdHlwZW9mIGhhbmRsZXJcbiAgaWYgKHR5cGUgPT09ICdmdW5jdGlvbicpIHtcbiAgICB2bVthY3Rpb25dKGtleSwgaGFuZGxlcilcbiAgfSBlbHNlIGlmICh0eXBlID09PSAnc3RyaW5nJykge1xuICAgIHZhciBtZXRob2RzID0gdm0uJG9wdGlvbnMubWV0aG9kc1xuICAgIHZhciBtZXRob2QgPSBtZXRob2RzICYmIG1ldGhvZHNbaGFuZGxlcl1cbiAgICBpZiAobWV0aG9kKSB7XG4gICAgICB2bVthY3Rpb25dKGtleSwgbWV0aG9kKVxuICAgIH0gZWxzZSB7XG4gICAgICBfLndhcm4oXG4gICAgICAgICdVbmtub3duIG1ldGhvZDogXCInICsgaGFuZGxlciArICdcIiB3aGVuICcgK1xuICAgICAgICAncmVnaXN0ZXJpbmcgY2FsbGJhY2sgZm9yICcgKyBhY3Rpb24gK1xuICAgICAgICAnOiBcIicgKyBrZXkgKyAnXCIuJ1xuICAgICAgKVxuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIFNldHVwIHJlY3Vyc2l2ZSBhdHRhY2hlZC9kZXRhY2hlZCBjYWxsc1xuICovXG5cbmV4cG9ydHMuX2luaXRET01Ib29rcyA9IGZ1bmN0aW9uICgpIHtcbiAgdGhpcy4kb24oJ2hvb2s6YXR0YWNoZWQnLCBvbkF0dGFjaGVkKVxuICB0aGlzLiRvbignaG9vazpkZXRhY2hlZCcsIG9uRGV0YWNoZWQpXG59XG5cbi8qKlxuICogQ2FsbGJhY2sgdG8gcmVjdXJzaXZlbHkgY2FsbCBhdHRhY2hlZCBob29rIG9uIGNoaWxkcmVuXG4gKi9cblxuZnVuY3Rpb24gb25BdHRhY2hlZCAoKSB7XG4gIHRoaXMuX2lzQXR0YWNoZWQgPSB0cnVlXG4gIHRoaXMuX2NoaWxkcmVuLmZvckVhY2goY2FsbEF0dGFjaClcbiAgaWYgKHRoaXMuX3RyYW5zQ3BudHMubGVuZ3RoKSB7XG4gICAgdGhpcy5fdHJhbnNDcG50cy5mb3JFYWNoKGNhbGxBdHRhY2gpXG4gIH1cbn1cblxuLyoqXG4gKiBJdGVyYXRvciB0byBjYWxsIGF0dGFjaGVkIGhvb2tcbiAqIFxuICogQHBhcmFtIHtWdWV9IGNoaWxkXG4gKi9cblxuZnVuY3Rpb24gY2FsbEF0dGFjaCAoY2hpbGQpIHtcbiAgaWYgKCFjaGlsZC5faXNBdHRhY2hlZCAmJiBpbkRvYyhjaGlsZC4kZWwpKSB7XG4gICAgY2hpbGQuX2NhbGxIb29rKCdhdHRhY2hlZCcpXG4gIH1cbn1cblxuLyoqXG4gKiBDYWxsYmFjayB0byByZWN1cnNpdmVseSBjYWxsIGRldGFjaGVkIGhvb2sgb24gY2hpbGRyZW5cbiAqL1xuXG5mdW5jdGlvbiBvbkRldGFjaGVkICgpIHtcbiAgdGhpcy5faXNBdHRhY2hlZCA9IGZhbHNlXG4gIHRoaXMuX2NoaWxkcmVuLmZvckVhY2goY2FsbERldGFjaClcbiAgaWYgKHRoaXMuX3RyYW5zQ3BudHMubGVuZ3RoKSB7XG4gICAgdGhpcy5fdHJhbnNDcG50cy5mb3JFYWNoKGNhbGxEZXRhY2gpXG4gIH1cbn1cblxuLyoqXG4gKiBJdGVyYXRvciB0byBjYWxsIGRldGFjaGVkIGhvb2tcbiAqIFxuICogQHBhcmFtIHtWdWV9IGNoaWxkXG4gKi9cblxuZnVuY3Rpb24gY2FsbERldGFjaCAoY2hpbGQpIHtcbiAgaWYgKGNoaWxkLl9pc0F0dGFjaGVkICYmICFpbkRvYyhjaGlsZC4kZWwpKSB7XG4gICAgY2hpbGQuX2NhbGxIb29rKCdkZXRhY2hlZCcpXG4gIH1cbn1cblxuLyoqXG4gKiBUcmlnZ2VyIGFsbCBoYW5kbGVycyBmb3IgYSBob29rXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGhvb2tcbiAqL1xuXG5leHBvcnRzLl9jYWxsSG9vayA9IGZ1bmN0aW9uIChob29rKSB7XG4gIHZhciBoYW5kbGVycyA9IHRoaXMuJG9wdGlvbnNbaG9va11cbiAgaWYgKGhhbmRsZXJzKSB7XG4gICAgZm9yICh2YXIgaSA9IDAsIGogPSBoYW5kbGVycy5sZW5ndGg7IGkgPCBqOyBpKyspIHtcbiAgICAgIGhhbmRsZXJzW2ldLmNhbGwodGhpcylcbiAgICB9XG4gIH1cbiAgdGhpcy4kZW1pdCgnaG9vazonICsgaG9vaylcbn0iLCJ2YXIgbWVyZ2VPcHRpb25zID0gcmVxdWlyZSgnLi4vdXRpbC9tZXJnZS1vcHRpb24nKVxuXG4vKipcbiAqIFRoZSBtYWluIGluaXQgc2VxdWVuY2UuIFRoaXMgaXMgY2FsbGVkIGZvciBldmVyeVxuICogaW5zdGFuY2UsIGluY2x1ZGluZyBvbmVzIHRoYXQgYXJlIGNyZWF0ZWQgZnJvbSBleHRlbmRlZFxuICogY29uc3RydWN0b3JzLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zIC0gdGhpcyBvcHRpb25zIG9iamVjdCBzaG91bGQgYmVcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhlIHJlc3VsdCBvZiBtZXJnaW5nIGNsYXNzXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnMgYW5kIHRoZSBvcHRpb25zIHBhc3NlZFxuICogICAgICAgICAgICAgICAgICAgICAgICAgICBpbiB0byB0aGUgY29uc3RydWN0b3IuXG4gKi9cblxuZXhwb3J0cy5faW5pdCA9IGZ1bmN0aW9uIChvcHRpb25zKSB7XG5cbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge31cblxuICB0aGlzLiRlbCAgICAgICAgICAgPSBudWxsXG4gIHRoaXMuJHBhcmVudCAgICAgICA9IG9wdGlvbnMuX3BhcmVudFxuICB0aGlzLiRyb290ICAgICAgICAgPSBvcHRpb25zLl9yb290IHx8IHRoaXNcbiAgdGhpcy4kICAgICAgICAgICAgID0ge30gLy8gY2hpbGQgdm0gcmVmZXJlbmNlc1xuICB0aGlzLiQkICAgICAgICAgICAgPSB7fSAvLyBlbGVtZW50IHJlZmVyZW5jZXNcbiAgdGhpcy5fd2F0Y2hlckxpc3QgID0gW10gLy8gYWxsIHdhdGNoZXJzIGFzIGFuIGFycmF5XG4gIHRoaXMuX3dhdGNoZXJzICAgICA9IHt9IC8vIGludGVybmFsIHdhdGNoZXJzIGFzIGEgaGFzaFxuICB0aGlzLl91c2VyV2F0Y2hlcnMgPSB7fSAvLyB1c2VyIHdhdGNoZXJzIGFzIGEgaGFzaFxuICB0aGlzLl9kaXJlY3RpdmVzICAgPSBbXSAvLyBhbGwgZGlyZWN0aXZlc1xuXG4gIC8vIGEgZmxhZyB0byBhdm9pZCB0aGlzIGJlaW5nIG9ic2VydmVkXG4gIHRoaXMuX2lzVnVlID0gdHJ1ZVxuXG4gIC8vIGV2ZW50cyBib29ra2VlcGluZ1xuICB0aGlzLl9ldmVudHMgICAgICAgICA9IHt9ICAgIC8vIHJlZ2lzdGVyZWQgY2FsbGJhY2tzXG4gIHRoaXMuX2V2ZW50c0NvdW50ICAgID0ge30gICAgLy8gZm9yICRicm9hZGNhc3Qgb3B0aW1pemF0aW9uXG4gIHRoaXMuX2V2ZW50Q2FuY2VsbGVkID0gZmFsc2UgLy8gZm9yIGV2ZW50IGNhbmNlbGxhdGlvblxuXG4gIC8vIGJsb2NrIGluc3RhbmNlIHByb3BlcnRpZXNcbiAgdGhpcy5faXNCbG9jayAgICAgPSBmYWxzZVxuICB0aGlzLl9ibG9ja1N0YXJ0ICA9ICAgICAgICAgIC8vIEB0eXBlIHtDb21tZW50Tm9kZX1cbiAgdGhpcy5fYmxvY2tFbmQgICAgPSBudWxsICAgICAvLyBAdHlwZSB7Q29tbWVudE5vZGV9XG5cbiAgLy8gbGlmZWN5Y2xlIHN0YXRlXG4gIHRoaXMuX2lzQ29tcGlsZWQgID1cbiAgdGhpcy5faXNEZXN0cm95ZWQgPVxuICB0aGlzLl9pc1JlYWR5ICAgICA9XG4gIHRoaXMuX2lzQXR0YWNoZWQgID1cbiAgdGhpcy5faXNCZWluZ0Rlc3Ryb3llZCA9IGZhbHNlXG5cbiAgLy8gY2hpbGRyZW5cbiAgdGhpcy5fY2hpbGRyZW4gPSBbXVxuICB0aGlzLl9jaGlsZEN0b3JzID0ge31cblxuICAvLyB0cmFuc2NsdXNpb24gdW5saW5rIGZ1bmN0aW9uc1xuICB0aGlzLl9jb250YWluZXJVbmxpbmtGbiA9XG4gIHRoaXMuX2NvbnRlbnRVbmxpbmtGbiA9IG51bGxcblxuICAvLyB0cmFuc2NsdWRlZCBjb21wb25lbnRzIHRoYXQgYmVsb25nIHRvIHRoZSBwYXJlbnQuXG4gIC8vIG5lZWQgdG8ga2VlcCB0cmFjayBvZiB0aGVtIHNvIHRoYXQgd2UgY2FuIGNhbGxcbiAgLy8gYXR0YWNoZWQvZGV0YWNoZWQgaG9va3Mgb24gdGhlbS5cbiAgdGhpcy5fdHJhbnNDcG50cyA9IFtdXG4gIHRoaXMuX2hvc3QgPSBvcHRpb25zLl9ob3N0XG5cbiAgLy8gcHVzaCBzZWxmIGludG8gcGFyZW50IC8gdHJhbnNjbHVzaW9uIGhvc3RcbiAgaWYgKHRoaXMuJHBhcmVudCkge1xuICAgIHRoaXMuJHBhcmVudC5fY2hpbGRyZW4ucHVzaCh0aGlzKVxuICB9XG4gIGlmICh0aGlzLl9ob3N0KSB7XG4gICAgdGhpcy5faG9zdC5fdHJhbnNDcG50cy5wdXNoKHRoaXMpXG4gIH1cblxuICAvLyBwcm9wcyB1c2VkIGluIHYtcmVwZWF0IGRpZmZpbmdcbiAgdGhpcy5fbmV3ID0gdHJ1ZVxuICB0aGlzLl9yZXVzZWQgPSBmYWxzZVxuXG4gIC8vIG1lcmdlIG9wdGlvbnMuXG4gIG9wdGlvbnMgPSB0aGlzLiRvcHRpb25zID0gbWVyZ2VPcHRpb25zKFxuICAgIHRoaXMuY29uc3RydWN0b3Iub3B0aW9ucyxcbiAgICBvcHRpb25zLFxuICAgIHRoaXNcbiAgKVxuXG4gIC8vIHNldCBkYXRhIGFmdGVyIG1lcmdlLlxuICB0aGlzLl9kYXRhID0gb3B0aW9ucy5kYXRhIHx8IHt9XG5cbiAgLy8gaW5pdGlhbGl6ZSBkYXRhIG9ic2VydmF0aW9uIGFuZCBzY29wZSBpbmhlcml0YW5jZS5cbiAgdGhpcy5faW5pdFNjb3BlKClcblxuICAvLyBzZXR1cCBldmVudCBzeXN0ZW0gYW5kIG9wdGlvbiBldmVudHMuXG4gIHRoaXMuX2luaXRFdmVudHMoKVxuXG4gIC8vIGNhbGwgY3JlYXRlZCBob29rXG4gIHRoaXMuX2NhbGxIb29rKCdjcmVhdGVkJylcblxuICAvLyBpZiBgZWxgIG9wdGlvbiBpcyBwYXNzZWQsIHN0YXJ0IGNvbXBpbGF0aW9uLlxuICBpZiAob3B0aW9ucy5lbCkge1xuICAgIHRoaXMuJG1vdW50KG9wdGlvbnMuZWwpXG4gIH1cbn0iLCJ2YXIgXyA9IHJlcXVpcmUoJy4uL3V0aWwnKVxudmFyIE9ic2VydmVyID0gcmVxdWlyZSgnLi4vb2JzZXJ2ZXInKVxudmFyIERlcCA9IHJlcXVpcmUoJy4uL29ic2VydmVyL2RlcCcpXG5cbi8qKlxuICogU2V0dXAgdGhlIHNjb3BlIG9mIGFuIGluc3RhbmNlLCB3aGljaCBjb250YWluczpcbiAqIC0gb2JzZXJ2ZWQgZGF0YVxuICogLSBjb21wdXRlZCBwcm9wZXJ0aWVzXG4gKiAtIHVzZXIgbWV0aG9kc1xuICogLSBtZXRhIHByb3BlcnRpZXNcbiAqL1xuXG5leHBvcnRzLl9pbml0U2NvcGUgPSBmdW5jdGlvbiAoKSB7XG4gIHRoaXMuX2luaXREYXRhKClcbiAgdGhpcy5faW5pdENvbXB1dGVkKClcbiAgdGhpcy5faW5pdE1ldGhvZHMoKVxuICB0aGlzLl9pbml0TWV0YSgpXG59XG5cbi8qKlxuICogSW5pdGlhbGl6ZSB0aGUgZGF0YS4gXG4gKi9cblxuZXhwb3J0cy5faW5pdERhdGEgPSBmdW5jdGlvbiAoKSB7XG4gIC8vIHByb3h5IGRhdGEgb24gaW5zdGFuY2VcbiAgdmFyIGRhdGEgPSB0aGlzLl9kYXRhXG4gIHZhciBrZXlzID0gT2JqZWN0LmtleXMoZGF0YSlcbiAgdmFyIGkgPSBrZXlzLmxlbmd0aFxuICB2YXIga2V5XG4gIHdoaWxlIChpLS0pIHtcbiAgICBrZXkgPSBrZXlzW2ldXG4gICAgaWYgKCFfLmlzUmVzZXJ2ZWQoa2V5KSkge1xuICAgICAgdGhpcy5fcHJveHkoa2V5KVxuICAgIH1cbiAgfVxuICAvLyBvYnNlcnZlIGRhdGFcbiAgT2JzZXJ2ZXIuY3JlYXRlKGRhdGEpLmFkZFZtKHRoaXMpXG59XG5cbi8qKlxuICogU3dhcCB0aGUgaXNudGFuY2UncyAkZGF0YS4gQ2FsbGVkIGluICRkYXRhJ3Mgc2V0dGVyLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBuZXdEYXRhXG4gKi9cblxuZXhwb3J0cy5fc2V0RGF0YSA9IGZ1bmN0aW9uIChuZXdEYXRhKSB7XG4gIG5ld0RhdGEgPSBuZXdEYXRhIHx8IHt9XG4gIHZhciBvbGREYXRhID0gdGhpcy5fZGF0YVxuICB0aGlzLl9kYXRhID0gbmV3RGF0YVxuICB2YXIga2V5cywga2V5LCBpXG4gIC8vIHVucHJveHkga2V5cyBub3QgcHJlc2VudCBpbiBuZXcgZGF0YVxuICBrZXlzID0gT2JqZWN0LmtleXMob2xkRGF0YSlcbiAgaSA9IGtleXMubGVuZ3RoXG4gIHdoaWxlIChpLS0pIHtcbiAgICBrZXkgPSBrZXlzW2ldXG4gICAgaWYgKCFfLmlzUmVzZXJ2ZWQoa2V5KSAmJiAhKGtleSBpbiBuZXdEYXRhKSkge1xuICAgICAgdGhpcy5fdW5wcm94eShrZXkpXG4gICAgfVxuICB9XG4gIC8vIHByb3h5IGtleXMgbm90IGFscmVhZHkgcHJveGllZCxcbiAgLy8gYW5kIHRyaWdnZXIgY2hhbmdlIGZvciBjaGFuZ2VkIHZhbHVlc1xuICBrZXlzID0gT2JqZWN0LmtleXMobmV3RGF0YSlcbiAgaSA9IGtleXMubGVuZ3RoXG4gIHdoaWxlIChpLS0pIHtcbiAgICBrZXkgPSBrZXlzW2ldXG4gICAgaWYgKCF0aGlzLmhhc093blByb3BlcnR5KGtleSkgJiYgIV8uaXNSZXNlcnZlZChrZXkpKSB7XG4gICAgICAvLyBuZXcgcHJvcGVydHlcbiAgICAgIHRoaXMuX3Byb3h5KGtleSlcbiAgICB9XG4gIH1cbiAgb2xkRGF0YS5fX29iX18ucmVtb3ZlVm0odGhpcylcbiAgT2JzZXJ2ZXIuY3JlYXRlKG5ld0RhdGEpLmFkZFZtKHRoaXMpXG4gIHRoaXMuX2RpZ2VzdCgpXG59XG5cbi8qKlxuICogUHJveHkgYSBwcm9wZXJ0eSwgc28gdGhhdFxuICogdm0ucHJvcCA9PT0gdm0uX2RhdGEucHJvcFxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBrZXlcbiAqL1xuXG5leHBvcnRzLl9wcm94eSA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgLy8gbmVlZCB0byBzdG9yZSByZWYgdG8gc2VsZiBoZXJlXG4gIC8vIGJlY2F1c2UgdGhlc2UgZ2V0dGVyL3NldHRlcnMgbWlnaHRcbiAgLy8gYmUgY2FsbGVkIGJ5IGNoaWxkIGluc3RhbmNlcyFcbiAgdmFyIHNlbGYgPSB0aGlzXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShzZWxmLCBrZXksIHtcbiAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICBnZXQ6IGZ1bmN0aW9uIHByb3h5R2V0dGVyICgpIHtcbiAgICAgIHJldHVybiBzZWxmLl9kYXRhW2tleV1cbiAgICB9LFxuICAgIHNldDogZnVuY3Rpb24gcHJveHlTZXR0ZXIgKHZhbCkge1xuICAgICAgc2VsZi5fZGF0YVtrZXldID0gdmFsXG4gICAgfVxuICB9KVxufVxuXG4vKipcbiAqIFVucHJveHkgYSBwcm9wZXJ0eS5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30ga2V5XG4gKi9cblxuZXhwb3J0cy5fdW5wcm94eSA9IGZ1bmN0aW9uIChrZXkpIHtcbiAgZGVsZXRlIHRoaXNba2V5XVxufVxuXG4vKipcbiAqIEZvcmNlIHVwZGF0ZSBvbiBldmVyeSB3YXRjaGVyIGluIHNjb3BlLlxuICovXG5cbmV4cG9ydHMuX2RpZ2VzdCA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGkgPSB0aGlzLl93YXRjaGVyTGlzdC5sZW5ndGhcbiAgd2hpbGUgKGktLSkge1xuICAgIHRoaXMuX3dhdGNoZXJMaXN0W2ldLnVwZGF0ZSgpXG4gIH1cbiAgdmFyIGNoaWxkcmVuID0gdGhpcy5fY2hpbGRyZW5cbiAgaSA9IGNoaWxkcmVuLmxlbmd0aFxuICB3aGlsZSAoaS0tKSB7XG4gICAgdmFyIGNoaWxkID0gY2hpbGRyZW5baV1cbiAgICBpZiAoY2hpbGQuJG9wdGlvbnMuaW5oZXJpdCkge1xuICAgICAgY2hpbGQuX2RpZ2VzdCgpXG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogU2V0dXAgY29tcHV0ZWQgcHJvcGVydGllcy4gVGhleSBhcmUgZXNzZW50aWFsbHlcbiAqIHNwZWNpYWwgZ2V0dGVyL3NldHRlcnNcbiAqL1xuXG5mdW5jdGlvbiBub29wICgpIHt9XG5leHBvcnRzLl9pbml0Q29tcHV0ZWQgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBjb21wdXRlZCA9IHRoaXMuJG9wdGlvbnMuY29tcHV0ZWRcbiAgaWYgKGNvbXB1dGVkKSB7XG4gICAgZm9yICh2YXIga2V5IGluIGNvbXB1dGVkKSB7XG4gICAgICB2YXIgdXNlckRlZiA9IGNvbXB1dGVkW2tleV1cbiAgICAgIHZhciBkZWYgPSB7XG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgfVxuICAgICAgaWYgKHR5cGVvZiB1c2VyRGVmID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGRlZi5nZXQgPSBfLmJpbmQodXNlckRlZiwgdGhpcylcbiAgICAgICAgZGVmLnNldCA9IG5vb3BcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRlZi5nZXQgPSB1c2VyRGVmLmdldFxuICAgICAgICAgID8gXy5iaW5kKHVzZXJEZWYuZ2V0LCB0aGlzKVxuICAgICAgICAgIDogbm9vcFxuICAgICAgICBkZWYuc2V0ID0gdXNlckRlZi5zZXRcbiAgICAgICAgICA/IF8uYmluZCh1c2VyRGVmLnNldCwgdGhpcylcbiAgICAgICAgICA6IG5vb3BcbiAgICAgIH1cbiAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBrZXksIGRlZilcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBTZXR1cCBpbnN0YW5jZSBtZXRob2RzLiBNZXRob2RzIG11c3QgYmUgYm91bmQgdG8gdGhlXG4gKiBpbnN0YW5jZSBzaW5jZSB0aGV5IG1pZ2h0IGJlIGNhbGxlZCBieSBjaGlsZHJlblxuICogaW5oZXJpdGluZyB0aGVtLlxuICovXG5cbmV4cG9ydHMuX2luaXRNZXRob2RzID0gZnVuY3Rpb24gKCkge1xuICB2YXIgbWV0aG9kcyA9IHRoaXMuJG9wdGlvbnMubWV0aG9kc1xuICBpZiAobWV0aG9kcykge1xuICAgIGZvciAodmFyIGtleSBpbiBtZXRob2RzKSB7XG4gICAgICB0aGlzW2tleV0gPSBfLmJpbmQobWV0aG9kc1trZXldLCB0aGlzKVxuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEluaXRpYWxpemUgbWV0YSBpbmZvcm1hdGlvbiBsaWtlICRpbmRleCwgJGtleSAmICR2YWx1ZS5cbiAqL1xuXG5leHBvcnRzLl9pbml0TWV0YSA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIG1ldGFzID0gdGhpcy4kb3B0aW9ucy5fbWV0YVxuICBpZiAobWV0YXMpIHtcbiAgICBmb3IgKHZhciBrZXkgaW4gbWV0YXMpIHtcbiAgICAgIHRoaXMuX2RlZmluZU1ldGEoa2V5LCBtZXRhc1trZXldKVxuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIERlZmluZSBhIG1ldGEgcHJvcGVydHksIGUuZyAkaW5kZXgsICRrZXksICR2YWx1ZVxuICogd2hpY2ggb25seSBleGlzdHMgb24gdGhlIHZtIGluc3RhbmNlIGJ1dCBub3QgaW4gJGRhdGEuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGtleVxuICogQHBhcmFtIHsqfSB2YWx1ZVxuICovXG5cbmV4cG9ydHMuX2RlZmluZU1ldGEgPSBmdW5jdGlvbiAoa2V5LCB2YWx1ZSkge1xuICB2YXIgZGVwID0gbmV3IERlcCgpXG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBrZXksIHtcbiAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICBnZXQ6IGZ1bmN0aW9uIG1ldGFHZXR0ZXIgKCkge1xuICAgICAgaWYgKE9ic2VydmVyLnRhcmdldCkge1xuICAgICAgICBPYnNlcnZlci50YXJnZXQuYWRkRGVwKGRlcClcbiAgICAgIH1cbiAgICAgIHJldHVybiB2YWx1ZVxuICAgIH0sXG4gICAgc2V0OiBmdW5jdGlvbiBtZXRhU2V0dGVyICh2YWwpIHtcbiAgICAgIGlmICh2YWwgIT09IHZhbHVlKSB7XG4gICAgICAgIHZhbHVlID0gdmFsXG4gICAgICAgIGRlcC5ub3RpZnkoKVxuICAgICAgfVxuICAgIH1cbiAgfSlcbn0iLCJ2YXIgXyA9IHJlcXVpcmUoJy4uL3V0aWwnKVxudmFyIGFycmF5UHJvdG8gPSBBcnJheS5wcm90b3R5cGVcbnZhciBhcnJheU1ldGhvZHMgPSBPYmplY3QuY3JlYXRlKGFycmF5UHJvdG8pXG5cbi8qKlxuICogSW50ZXJjZXB0IG11dGF0aW5nIG1ldGhvZHMgYW5kIGVtaXQgZXZlbnRzXG4gKi9cblxuO1tcbiAgJ3B1c2gnLFxuICAncG9wJyxcbiAgJ3NoaWZ0JyxcbiAgJ3Vuc2hpZnQnLFxuICAnc3BsaWNlJyxcbiAgJ3NvcnQnLFxuICAncmV2ZXJzZSdcbl1cbi5mb3JFYWNoKGZ1bmN0aW9uIChtZXRob2QpIHtcbiAgLy8gY2FjaGUgb3JpZ2luYWwgbWV0aG9kXG4gIHZhciBvcmlnaW5hbCA9IGFycmF5UHJvdG9bbWV0aG9kXVxuICBfLmRlZmluZShhcnJheU1ldGhvZHMsIG1ldGhvZCwgZnVuY3Rpb24gbXV0YXRvciAoKSB7XG4gICAgLy8gYXZvaWQgbGVha2luZyBhcmd1bWVudHM6XG4gICAgLy8gaHR0cDovL2pzcGVyZi5jb20vY2xvc3VyZS13aXRoLWFyZ3VtZW50c1xuICAgIHZhciBpID0gYXJndW1lbnRzLmxlbmd0aFxuICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGkpXG4gICAgd2hpbGUgKGktLSkge1xuICAgICAgYXJnc1tpXSA9IGFyZ3VtZW50c1tpXVxuICAgIH1cbiAgICB2YXIgcmVzdWx0ID0gb3JpZ2luYWwuYXBwbHkodGhpcywgYXJncylcbiAgICB2YXIgb2IgPSB0aGlzLl9fb2JfX1xuICAgIHZhciBpbnNlcnRlZFxuICAgIHN3aXRjaCAobWV0aG9kKSB7XG4gICAgICBjYXNlICdwdXNoJzpcbiAgICAgICAgaW5zZXJ0ZWQgPSBhcmdzXG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlICd1bnNoaWZ0JzpcbiAgICAgICAgaW5zZXJ0ZWQgPSBhcmdzXG4gICAgICAgIGJyZWFrXG4gICAgICBjYXNlICdzcGxpY2UnOlxuICAgICAgICBpbnNlcnRlZCA9IGFyZ3Muc2xpY2UoMilcbiAgICAgICAgYnJlYWtcbiAgICB9XG4gICAgaWYgKGluc2VydGVkKSBvYi5vYnNlcnZlQXJyYXkoaW5zZXJ0ZWQpXG4gICAgLy8gbm90aWZ5IGNoYW5nZVxuICAgIG9iLm5vdGlmeSgpXG4gICAgcmV0dXJuIHJlc3VsdFxuICB9KVxufSlcblxuLyoqXG4gKiBTd2FwIHRoZSBlbGVtZW50IGF0IHRoZSBnaXZlbiBpbmRleCB3aXRoIGEgbmV3IHZhbHVlXG4gKiBhbmQgZW1pdHMgY29ycmVzcG9uZGluZyBldmVudC5cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gaW5kZXhcbiAqIEBwYXJhbSB7Kn0gdmFsXG4gKiBAcmV0dXJuIHsqfSAtIHJlcGxhY2VkIGVsZW1lbnRcbiAqL1xuXG5fLmRlZmluZShcbiAgYXJyYXlQcm90byxcbiAgJyRzZXQnLFxuICBmdW5jdGlvbiAkc2V0IChpbmRleCwgdmFsKSB7XG4gICAgaWYgKGluZGV4ID49IHRoaXMubGVuZ3RoKSB7XG4gICAgICB0aGlzLmxlbmd0aCA9IGluZGV4ICsgMVxuICAgIH1cbiAgICByZXR1cm4gdGhpcy5zcGxpY2UoaW5kZXgsIDEsIHZhbClbMF1cbiAgfVxuKVxuXG4vKipcbiAqIENvbnZlbmllbmNlIG1ldGhvZCB0byByZW1vdmUgdGhlIGVsZW1lbnQgYXQgZ2l2ZW4gaW5kZXguXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IGluZGV4XG4gKiBAcGFyYW0geyp9IHZhbFxuICovXG5cbl8uZGVmaW5lKFxuICBhcnJheVByb3RvLFxuICAnJHJlbW92ZScsXG4gIGZ1bmN0aW9uICRyZW1vdmUgKGluZGV4KSB7XG4gICAgaWYgKHR5cGVvZiBpbmRleCAhPT0gJ251bWJlcicpIHtcbiAgICAgIGluZGV4ID0gdGhpcy5pbmRleE9mKGluZGV4KVxuICAgIH1cbiAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgcmV0dXJuIHRoaXMuc3BsaWNlKGluZGV4LCAxKVswXVxuICAgIH1cbiAgfVxuKVxuXG5tb2R1bGUuZXhwb3J0cyA9IGFycmF5TWV0aG9kcyIsInZhciB1aWQgPSAwXG52YXIgXyA9IHJlcXVpcmUoJy4uL3V0aWwnKVxuXG4vKipcbiAqIEEgZGVwIGlzIGFuIG9ic2VydmFibGUgdGhhdCBjYW4gaGF2ZSBtdWx0aXBsZVxuICogZGlyZWN0aXZlcyBzdWJzY3JpYmluZyB0byBpdC5cbiAqXG4gKiBAY29uc3RydWN0b3JcbiAqL1xuXG5mdW5jdGlvbiBEZXAgKCkge1xuICB0aGlzLmlkID0gKyt1aWRcbiAgdGhpcy5zdWJzID0gW11cbn1cblxudmFyIHAgPSBEZXAucHJvdG90eXBlXG5cbi8qKlxuICogQWRkIGEgZGlyZWN0aXZlIHN1YnNjcmliZXIuXG4gKlxuICogQHBhcmFtIHtEaXJlY3RpdmV9IHN1YlxuICovXG5cbnAuYWRkU3ViID0gZnVuY3Rpb24gKHN1Yikge1xuICB0aGlzLnN1YnMucHVzaChzdWIpXG59XG5cbi8qKlxuICogUmVtb3ZlIGEgZGlyZWN0aXZlIHN1YnNjcmliZXIuXG4gKlxuICogQHBhcmFtIHtEaXJlY3RpdmV9IHN1YlxuICovXG5cbnAucmVtb3ZlU3ViID0gZnVuY3Rpb24gKHN1Yikge1xuICBpZiAodGhpcy5zdWJzLmxlbmd0aCkge1xuICAgIHZhciBpID0gdGhpcy5zdWJzLmluZGV4T2Yoc3ViKVxuICAgIGlmIChpID4gLTEpIHRoaXMuc3Vicy5zcGxpY2UoaSwgMSlcbiAgfVxufVxuXG4vKipcbiAqIE5vdGlmeSBhbGwgc3Vic2NyaWJlcnMgb2YgYSBuZXcgdmFsdWUuXG4gKi9cblxucC5ub3RpZnkgPSBmdW5jdGlvbiAoKSB7XG4gIC8vIHN0YWJsaXplIHRoZSBzdWJzY3JpYmVyIGxpc3QgZmlyc3RcbiAgdmFyIHN1YnMgPSBfLnRvQXJyYXkodGhpcy5zdWJzKVxuICBmb3IgKHZhciBpID0gMCwgbCA9IHN1YnMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgc3Vic1tpXS51cGRhdGUoKVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRGVwIiwidmFyIF8gPSByZXF1aXJlKCcuLi91dGlsJylcbnZhciBjb25maWcgPSByZXF1aXJlKCcuLi9jb25maWcnKVxudmFyIERlcCA9IHJlcXVpcmUoJy4vZGVwJylcbnZhciBhcnJheU1ldGhvZHMgPSByZXF1aXJlKCcuL2FycmF5JylcbnZhciBhcnJheUtleXMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhhcnJheU1ldGhvZHMpXG5yZXF1aXJlKCcuL29iamVjdCcpXG5cbnZhciB1aWQgPSAwXG5cbi8qKlxuICogVHlwZSBlbnVtc1xuICovXG5cbnZhciBBUlJBWSAgPSAwXG52YXIgT0JKRUNUID0gMVxuXG4vKipcbiAqIEF1Z21lbnQgYW4gdGFyZ2V0IE9iamVjdCBvciBBcnJheSBieSBpbnRlcmNlcHRpbmdcbiAqIHRoZSBwcm90b3R5cGUgY2hhaW4gdXNpbmcgX19wcm90b19fXG4gKlxuICogQHBhcmFtIHtPYmplY3R8QXJyYXl9IHRhcmdldFxuICogQHBhcmFtIHtPYmplY3R9IHByb3RvXG4gKi9cblxuZnVuY3Rpb24gcHJvdG9BdWdtZW50ICh0YXJnZXQsIHNyYykge1xuICB0YXJnZXQuX19wcm90b19fID0gc3JjXG59XG5cbi8qKlxuICogQXVnbWVudCBhbiB0YXJnZXQgT2JqZWN0IG9yIEFycmF5IGJ5IGRlZmluaW5nXG4gKiBoaWRkZW4gcHJvcGVydGllcy5cbiAqXG4gKiBAcGFyYW0ge09iamVjdHxBcnJheX0gdGFyZ2V0XG4gKiBAcGFyYW0ge09iamVjdH0gcHJvdG9cbiAqL1xuXG5mdW5jdGlvbiBjb3B5QXVnbWVudCAodGFyZ2V0LCBzcmMsIGtleXMpIHtcbiAgdmFyIGkgPSBrZXlzLmxlbmd0aFxuICB2YXIga2V5XG4gIHdoaWxlIChpLS0pIHtcbiAgICBrZXkgPSBrZXlzW2ldXG4gICAgXy5kZWZpbmUodGFyZ2V0LCBrZXksIHNyY1trZXldKVxuICB9XG59XG5cbi8qKlxuICogT2JzZXJ2ZXIgY2xhc3MgdGhhdCBhcmUgYXR0YWNoZWQgdG8gZWFjaCBvYnNlcnZlZFxuICogb2JqZWN0LiBPbmNlIGF0dGFjaGVkLCB0aGUgb2JzZXJ2ZXIgY29udmVydHMgdGFyZ2V0XG4gKiBvYmplY3QncyBwcm9wZXJ0eSBrZXlzIGludG8gZ2V0dGVyL3NldHRlcnMgdGhhdFxuICogY29sbGVjdCBkZXBlbmRlbmNpZXMgYW5kIGRpc3BhdGNoZXMgdXBkYXRlcy5cbiAqXG4gKiBAcGFyYW0ge0FycmF5fE9iamVjdH0gdmFsdWVcbiAqIEBwYXJhbSB7TnVtYmVyfSB0eXBlXG4gKiBAY29uc3RydWN0b3JcbiAqL1xuXG5mdW5jdGlvbiBPYnNlcnZlciAodmFsdWUsIHR5cGUpIHtcbiAgdGhpcy5pZCA9ICsrdWlkXG4gIHRoaXMudmFsdWUgPSB2YWx1ZVxuICB0aGlzLmFjdGl2ZSA9IHRydWVcbiAgdGhpcy5kZXBzID0gW11cbiAgXy5kZWZpbmUodmFsdWUsICdfX29iX18nLCB0aGlzKVxuICBpZiAodHlwZSA9PT0gQVJSQVkpIHtcbiAgICB2YXIgYXVnbWVudCA9IGNvbmZpZy5wcm90byAmJiBfLmhhc1Byb3RvXG4gICAgICA/IHByb3RvQXVnbWVudFxuICAgICAgOiBjb3B5QXVnbWVudFxuICAgIGF1Z21lbnQodmFsdWUsIGFycmF5TWV0aG9kcywgYXJyYXlLZXlzKVxuICAgIHRoaXMub2JzZXJ2ZUFycmF5KHZhbHVlKVxuICB9IGVsc2UgaWYgKHR5cGUgPT09IE9CSkVDVCkge1xuICAgIHRoaXMud2Fsayh2YWx1ZSlcbiAgfVxufVxuXG5PYnNlcnZlci50YXJnZXQgPSBudWxsXG5cbnZhciBwID0gT2JzZXJ2ZXIucHJvdG90eXBlXG5cbi8qKlxuICogQXR0ZW1wdCB0byBjcmVhdGUgYW4gb2JzZXJ2ZXIgaW5zdGFuY2UgZm9yIGEgdmFsdWUsXG4gKiByZXR1cm5zIHRoZSBuZXcgb2JzZXJ2ZXIgaWYgc3VjY2Vzc2Z1bGx5IG9ic2VydmVkLFxuICogb3IgdGhlIGV4aXN0aW5nIG9ic2VydmVyIGlmIHRoZSB2YWx1ZSBhbHJlYWR5IGhhcyBvbmUuXG4gKlxuICogQHBhcmFtIHsqfSB2YWx1ZVxuICogQHJldHVybiB7T2JzZXJ2ZXJ8dW5kZWZpbmVkfVxuICogQHN0YXRpY1xuICovXG5cbk9ic2VydmVyLmNyZWF0ZSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuICBpZiAoXG4gICAgdmFsdWUgJiZcbiAgICB2YWx1ZS5oYXNPd25Qcm9wZXJ0eSgnX19vYl9fJykgJiZcbiAgICB2YWx1ZS5fX29iX18gaW5zdGFuY2VvZiBPYnNlcnZlclxuICApIHtcbiAgICByZXR1cm4gdmFsdWUuX19vYl9fXG4gIH0gZWxzZSBpZiAoXy5pc0FycmF5KHZhbHVlKSkge1xuICAgIHJldHVybiBuZXcgT2JzZXJ2ZXIodmFsdWUsIEFSUkFZKVxuICB9IGVsc2UgaWYgKFxuICAgIF8uaXNQbGFpbk9iamVjdCh2YWx1ZSkgJiZcbiAgICAhdmFsdWUuX2lzVnVlIC8vIGF2b2lkIFZ1ZSBpbnN0YW5jZVxuICApIHtcbiAgICByZXR1cm4gbmV3IE9ic2VydmVyKHZhbHVlLCBPQkpFQ1QpXG4gIH1cbn1cblxuLyoqXG4gKiBXYWxrIHRocm91Z2ggZWFjaCBwcm9wZXJ0eSBhbmQgY29udmVydCB0aGVtIGludG9cbiAqIGdldHRlci9zZXR0ZXJzLiBUaGlzIG1ldGhvZCBzaG91bGQgb25seSBiZSBjYWxsZWQgd2hlblxuICogdmFsdWUgdHlwZSBpcyBPYmplY3QuIFByb3BlcnRpZXMgcHJlZml4ZWQgd2l0aCBgJGAgb3IgYF9gXG4gKiBhbmQgYWNjZXNzb3IgcHJvcGVydGllcyBhcmUgaWdub3JlZC5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqXG4gKi9cblxucC53YWxrID0gZnVuY3Rpb24gKG9iaikge1xuICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKG9iailcbiAgdmFyIGkgPSBrZXlzLmxlbmd0aFxuICB2YXIga2V5LCBwcmVmaXhcbiAgd2hpbGUgKGktLSkge1xuICAgIGtleSA9IGtleXNbaV1cbiAgICBwcmVmaXggPSBrZXkuY2hhckNvZGVBdCgwKVxuICAgIGlmIChwcmVmaXggIT09IDB4MjQgJiYgcHJlZml4ICE9PSAweDVGKSB7IC8vIHNraXAgJCBvciBfXG4gICAgICB0aGlzLmNvbnZlcnQoa2V5LCBvYmpba2V5XSlcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBUcnkgdG8gY2FyZXRlIGFuIG9ic2VydmVyIGZvciBhIGNoaWxkIHZhbHVlLFxuICogYW5kIGlmIHZhbHVlIGlzIGFycmF5LCBsaW5rIGRlcCB0byB0aGUgYXJyYXkuXG4gKlxuICogQHBhcmFtIHsqfSB2YWxcbiAqIEByZXR1cm4ge0RlcHx1bmRlZmluZWR9XG4gKi9cblxucC5vYnNlcnZlID0gZnVuY3Rpb24gKHZhbCkge1xuICByZXR1cm4gT2JzZXJ2ZXIuY3JlYXRlKHZhbClcbn1cblxuLyoqXG4gKiBPYnNlcnZlIGEgbGlzdCBvZiBBcnJheSBpdGVtcy5cbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBpdGVtc1xuICovXG5cbnAub2JzZXJ2ZUFycmF5ID0gZnVuY3Rpb24gKGl0ZW1zKSB7XG4gIHZhciBpID0gaXRlbXMubGVuZ3RoXG4gIHdoaWxlIChpLS0pIHtcbiAgICB0aGlzLm9ic2VydmUoaXRlbXNbaV0pXG4gIH1cbn1cblxuLyoqXG4gKiBDb252ZXJ0IGEgcHJvcGVydHkgaW50byBnZXR0ZXIvc2V0dGVyIHNvIHdlIGNhbiBlbWl0XG4gKiB0aGUgZXZlbnRzIHdoZW4gdGhlIHByb3BlcnR5IGlzIGFjY2Vzc2VkL2NoYW5nZWQuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGtleVxuICogQHBhcmFtIHsqfSB2YWxcbiAqL1xuXG5wLmNvbnZlcnQgPSBmdW5jdGlvbiAoa2V5LCB2YWwpIHtcbiAgdmFyIG9iID0gdGhpc1xuICB2YXIgY2hpbGRPYiA9IG9iLm9ic2VydmUodmFsKVxuICB2YXIgZGVwID0gbmV3IERlcCgpXG4gIGlmIChjaGlsZE9iKSB7XG4gICAgY2hpbGRPYi5kZXBzLnB1c2goZGVwKVxuICB9XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYi52YWx1ZSwga2V5LCB7XG4gICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAvLyBPYnNlcnZlci50YXJnZXQgaXMgYSB3YXRjaGVyIHdob3NlIGdldHRlciBpc1xuICAgICAgLy8gY3VycmVudGx5IGJlaW5nIGV2YWx1YXRlZC5cbiAgICAgIGlmIChvYi5hY3RpdmUgJiYgT2JzZXJ2ZXIudGFyZ2V0KSB7XG4gICAgICAgIE9ic2VydmVyLnRhcmdldC5hZGREZXAoZGVwKVxuICAgICAgfVxuICAgICAgcmV0dXJuIHZhbFxuICAgIH0sXG4gICAgc2V0OiBmdW5jdGlvbiAobmV3VmFsKSB7XG4gICAgICBpZiAobmV3VmFsID09PSB2YWwpIHJldHVyblxuICAgICAgLy8gcmVtb3ZlIGRlcCBmcm9tIG9sZCB2YWx1ZVxuICAgICAgdmFyIG9sZENoaWxkT2IgPSB2YWwgJiYgdmFsLl9fb2JfX1xuICAgICAgaWYgKG9sZENoaWxkT2IpIHtcbiAgICAgICAgdmFyIG9sZERlcHMgPSBvbGRDaGlsZE9iLmRlcHNcbiAgICAgICAgb2xkRGVwcy5zcGxpY2Uob2xkRGVwcy5pbmRleE9mKGRlcCksIDEpXG4gICAgICB9XG4gICAgICB2YWwgPSBuZXdWYWxcbiAgICAgIC8vIGFkZCBkZXAgdG8gbmV3IHZhbHVlXG4gICAgICB2YXIgbmV3Q2hpbGRPYiA9IG9iLm9ic2VydmUobmV3VmFsKVxuICAgICAgaWYgKG5ld0NoaWxkT2IpIHtcbiAgICAgICAgbmV3Q2hpbGRPYi5kZXBzLnB1c2goZGVwKVxuICAgICAgfVxuICAgICAgZGVwLm5vdGlmeSgpXG4gICAgfVxuICB9KVxufVxuXG4vKipcbiAqIE5vdGlmeSBjaGFuZ2Ugb24gYWxsIHNlbGYgZGVwcyBvbiBhbiBvYnNlcnZlci5cbiAqIFRoaXMgaXMgY2FsbGVkIHdoZW4gYSBtdXRhYmxlIHZhbHVlIG11dGF0ZXMuIGUuZy5cbiAqIHdoZW4gYW4gQXJyYXkncyBtdXRhdGluZyBtZXRob2RzIGFyZSBjYWxsZWQsIG9yIGFuXG4gKiBPYmplY3QncyAkYWRkLyRkZWxldGUgYXJlIGNhbGxlZC5cbiAqL1xuXG5wLm5vdGlmeSA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIGRlcHMgPSB0aGlzLmRlcHNcbiAgZm9yICh2YXIgaSA9IDAsIGwgPSBkZXBzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgIGRlcHNbaV0ubm90aWZ5KClcbiAgfVxufVxuXG4vKipcbiAqIEFkZCBhbiBvd25lciB2bSwgc28gdGhhdCB3aGVuICRhZGQvJGRlbGV0ZSBtdXRhdGlvbnNcbiAqIGhhcHBlbiB3ZSBjYW4gbm90aWZ5IG93bmVyIHZtcyB0byBwcm94eSB0aGUga2V5cyBhbmRcbiAqIGRpZ2VzdCB0aGUgd2F0Y2hlcnMuIFRoaXMgaXMgb25seSBjYWxsZWQgd2hlbiB0aGUgb2JqZWN0XG4gKiBpcyBvYnNlcnZlZCBhcyBhbiBpbnN0YW5jZSdzIHJvb3QgJGRhdGEuXG4gKlxuICogQHBhcmFtIHtWdWV9IHZtXG4gKi9cblxucC5hZGRWbSA9IGZ1bmN0aW9uICh2bSkge1xuICAodGhpcy52bXMgPSB0aGlzLnZtcyB8fCBbXSkucHVzaCh2bSlcbn1cblxuLyoqXG4gKiBSZW1vdmUgYW4gb3duZXIgdm0uIFRoaXMgaXMgY2FsbGVkIHdoZW4gdGhlIG9iamVjdCBpc1xuICogc3dhcHBlZCBvdXQgYXMgYW4gaW5zdGFuY2UncyAkZGF0YSBvYmplY3QuXG4gKlxuICogQHBhcmFtIHtWdWV9IHZtXG4gKi9cblxucC5yZW1vdmVWbSA9IGZ1bmN0aW9uICh2bSkge1xuICB0aGlzLnZtcy5zcGxpY2UodGhpcy52bXMuaW5kZXhPZih2bSksIDEpXG59XG5cbm1vZHVsZS5leHBvcnRzID0gT2JzZXJ2ZXJcbiIsInZhciBfID0gcmVxdWlyZSgnLi4vdXRpbCcpXG52YXIgb2JqUHJvdG8gPSBPYmplY3QucHJvdG90eXBlXG5cbi8qKlxuICogQWRkIGEgbmV3IHByb3BlcnR5IHRvIGFuIG9ic2VydmVkIG9iamVjdFxuICogYW5kIGVtaXRzIGNvcnJlc3BvbmRpbmcgZXZlbnRcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30ga2V5XG4gKiBAcGFyYW0geyp9IHZhbFxuICogQHB1YmxpY1xuICovXG5cbl8uZGVmaW5lKFxuICBvYmpQcm90byxcbiAgJyRhZGQnLFxuICBmdW5jdGlvbiAkYWRkIChrZXksIHZhbCkge1xuICAgIGlmICh0aGlzLmhhc093blByb3BlcnR5KGtleSkpIHJldHVyblxuICAgIHZhciBvYiA9IHRoaXMuX19vYl9fXG4gICAgaWYgKCFvYiB8fCBfLmlzUmVzZXJ2ZWQoa2V5KSkge1xuICAgICAgdGhpc1trZXldID0gdmFsXG4gICAgICByZXR1cm5cbiAgICB9XG4gICAgb2IuY29udmVydChrZXksIHZhbClcbiAgICBpZiAob2Iudm1zKSB7XG4gICAgICB2YXIgaSA9IG9iLnZtcy5sZW5ndGhcbiAgICAgIHdoaWxlIChpLS0pIHtcbiAgICAgICAgdmFyIHZtID0gb2Iudm1zW2ldXG4gICAgICAgIHZtLl9wcm94eShrZXkpXG4gICAgICAgIHZtLl9kaWdlc3QoKVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBvYi5ub3RpZnkoKVxuICAgIH1cbiAgfVxuKVxuXG4vKipcbiAqIFNldCBhIHByb3BlcnR5IG9uIGFuIG9ic2VydmVkIG9iamVjdCwgY2FsbGluZyBhZGQgdG9cbiAqIGVuc3VyZSB0aGUgcHJvcGVydHkgaXMgb2JzZXJ2ZWQuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGtleVxuICogQHBhcmFtIHsqfSB2YWxcbiAqIEBwdWJsaWNcbiAqL1xuXG5fLmRlZmluZShcbiAgb2JqUHJvdG8sXG4gICckc2V0JyxcbiAgZnVuY3Rpb24gJHNldCAoa2V5LCB2YWwpIHtcbiAgICB0aGlzLiRhZGQoa2V5LCB2YWwpXG4gICAgdGhpc1trZXldID0gdmFsXG4gIH1cbilcblxuLyoqXG4gKiBEZWxldGVzIGEgcHJvcGVydHkgZnJvbSBhbiBvYnNlcnZlZCBvYmplY3RcbiAqIGFuZCBlbWl0cyBjb3JyZXNwb25kaW5nIGV2ZW50XG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGtleVxuICogQHB1YmxpY1xuICovXG5cbl8uZGVmaW5lKFxuICBvYmpQcm90byxcbiAgJyRkZWxldGUnLFxuICBmdW5jdGlvbiAkZGVsZXRlIChrZXkpIHtcbiAgICBpZiAoIXRoaXMuaGFzT3duUHJvcGVydHkoa2V5KSkgcmV0dXJuXG4gICAgZGVsZXRlIHRoaXNba2V5XVxuICAgIHZhciBvYiA9IHRoaXMuX19vYl9fXG4gICAgaWYgKCFvYiB8fCBfLmlzUmVzZXJ2ZWQoa2V5KSkge1xuICAgICAgcmV0dXJuXG4gICAgfVxuICAgIGlmIChvYi52bXMpIHtcbiAgICAgIHZhciBpID0gb2Iudm1zLmxlbmd0aFxuICAgICAgd2hpbGUgKGktLSkge1xuICAgICAgICB2YXIgdm0gPSBvYi52bXNbaV1cbiAgICAgICAgdm0uX3VucHJveHkoa2V5KVxuICAgICAgICB2bS5fZGlnZXN0KClcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgb2Iubm90aWZ5KClcbiAgICB9XG4gIH1cbikiLCJ2YXIgXyA9IHJlcXVpcmUoJy4uL3V0aWwnKVxudmFyIENhY2hlID0gcmVxdWlyZSgnLi4vY2FjaGUnKVxudmFyIGNhY2hlID0gbmV3IENhY2hlKDEwMDApXG52YXIgYXJnUkUgPSAvXlteXFx7XFw/XSskfF4nW14nXSonJHxeXCJbXlwiXSpcIiQvXG52YXIgZmlsdGVyVG9rZW5SRSA9IC9bXlxccydcIl0rfCdbXiddKyd8XCJbXlwiXStcIi9nXG5cbi8qKlxuICogUGFyc2VyIHN0YXRlXG4gKi9cblxudmFyIHN0clxudmFyIGMsIGksIGxcbnZhciBpblNpbmdsZVxudmFyIGluRG91YmxlXG52YXIgY3VybHlcbnZhciBzcXVhcmVcbnZhciBwYXJlblxudmFyIGJlZ2luXG52YXIgYXJnSW5kZXhcbnZhciBkaXJzXG52YXIgZGlyXG52YXIgbGFzdEZpbHRlckluZGV4XG52YXIgYXJnXG5cbi8qKlxuICogUHVzaCBhIGRpcmVjdGl2ZSBvYmplY3QgaW50byB0aGUgcmVzdWx0IEFycmF5XG4gKi9cblxuZnVuY3Rpb24gcHVzaERpciAoKSB7XG4gIGRpci5yYXcgPSBzdHIuc2xpY2UoYmVnaW4sIGkpLnRyaW0oKVxuICBpZiAoZGlyLmV4cHJlc3Npb24gPT09IHVuZGVmaW5lZCkge1xuICAgIGRpci5leHByZXNzaW9uID0gc3RyLnNsaWNlKGFyZ0luZGV4LCBpKS50cmltKClcbiAgfSBlbHNlIGlmIChsYXN0RmlsdGVySW5kZXggIT09IGJlZ2luKSB7XG4gICAgcHVzaEZpbHRlcigpXG4gIH1cbiAgaWYgKGkgPT09IDAgfHwgZGlyLmV4cHJlc3Npb24pIHtcbiAgICBkaXJzLnB1c2goZGlyKVxuICB9XG59XG5cbi8qKlxuICogUHVzaCBhIGZpbHRlciB0byB0aGUgY3VycmVudCBkaXJlY3RpdmUgb2JqZWN0XG4gKi9cblxuZnVuY3Rpb24gcHVzaEZpbHRlciAoKSB7XG4gIHZhciBleHAgPSBzdHIuc2xpY2UobGFzdEZpbHRlckluZGV4LCBpKS50cmltKClcbiAgdmFyIGZpbHRlclxuICBpZiAoZXhwKSB7XG4gICAgZmlsdGVyID0ge31cbiAgICB2YXIgdG9rZW5zID0gZXhwLm1hdGNoKGZpbHRlclRva2VuUkUpXG4gICAgZmlsdGVyLm5hbWUgPSB0b2tlbnNbMF1cbiAgICBmaWx0ZXIuYXJncyA9IHRva2Vucy5sZW5ndGggPiAxID8gdG9rZW5zLnNsaWNlKDEpIDogbnVsbFxuICB9XG4gIGlmIChmaWx0ZXIpIHtcbiAgICAoZGlyLmZpbHRlcnMgPSBkaXIuZmlsdGVycyB8fCBbXSkucHVzaChmaWx0ZXIpXG4gIH1cbiAgbGFzdEZpbHRlckluZGV4ID0gaSArIDFcbn1cblxuLyoqXG4gKiBQYXJzZSBhIGRpcmVjdGl2ZSBzdHJpbmcgaW50byBhbiBBcnJheSBvZiBBU1QtbGlrZVxuICogb2JqZWN0cyByZXByZXNlbnRpbmcgZGlyZWN0aXZlcy5cbiAqXG4gKiBFeGFtcGxlOlxuICpcbiAqIFwiY2xpY2s6IGEgPSBhICsgMSB8IHVwcGVyY2FzZVwiIHdpbGwgeWllbGQ6XG4gKiB7XG4gKiAgIGFyZzogJ2NsaWNrJyxcbiAqICAgZXhwcmVzc2lvbjogJ2EgPSBhICsgMScsXG4gKiAgIGZpbHRlcnM6IFtcbiAqICAgICB7IG5hbWU6ICd1cHBlcmNhc2UnLCBhcmdzOiBudWxsIH1cbiAqICAgXVxuICogfVxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge0FycmF5PE9iamVjdD59XG4gKi9cblxuZXhwb3J0cy5wYXJzZSA9IGZ1bmN0aW9uIChzKSB7XG5cbiAgdmFyIGhpdCA9IGNhY2hlLmdldChzKVxuICBpZiAoaGl0KSB7XG4gICAgcmV0dXJuIGhpdFxuICB9XG5cbiAgLy8gcmVzZXQgcGFyc2VyIHN0YXRlXG4gIHN0ciA9IHNcbiAgaW5TaW5nbGUgPSBpbkRvdWJsZSA9IGZhbHNlXG4gIGN1cmx5ID0gc3F1YXJlID0gcGFyZW4gPSBiZWdpbiA9IGFyZ0luZGV4ID0gMFxuICBsYXN0RmlsdGVySW5kZXggPSAwXG4gIGRpcnMgPSBbXVxuICBkaXIgPSB7fVxuICBhcmcgPSBudWxsXG5cbiAgZm9yIChpID0gMCwgbCA9IHN0ci5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICBjID0gc3RyLmNoYXJDb2RlQXQoaSlcbiAgICBpZiAoaW5TaW5nbGUpIHtcbiAgICAgIC8vIGNoZWNrIHNpbmdsZSBxdW90ZVxuICAgICAgaWYgKGMgPT09IDB4MjcpIGluU2luZ2xlID0gIWluU2luZ2xlXG4gICAgfSBlbHNlIGlmIChpbkRvdWJsZSkge1xuICAgICAgLy8gY2hlY2sgZG91YmxlIHF1b3RlXG4gICAgICBpZiAoYyA9PT0gMHgyMikgaW5Eb3VibGUgPSAhaW5Eb3VibGVcbiAgICB9IGVsc2UgaWYgKFxuICAgICAgYyA9PT0gMHgyQyAmJiAvLyBjb21tYVxuICAgICAgIXBhcmVuICYmICFjdXJseSAmJiAhc3F1YXJlXG4gICAgKSB7XG4gICAgICAvLyByZWFjaGVkIHRoZSBlbmQgb2YgYSBkaXJlY3RpdmVcbiAgICAgIHB1c2hEaXIoKVxuICAgICAgLy8gcmVzZXQgJiBza2lwIHRoZSBjb21tYVxuICAgICAgZGlyID0ge31cbiAgICAgIGJlZ2luID0gYXJnSW5kZXggPSBsYXN0RmlsdGVySW5kZXggPSBpICsgMVxuICAgIH0gZWxzZSBpZiAoXG4gICAgICBjID09PSAweDNBICYmIC8vIGNvbG9uXG4gICAgICAhZGlyLmV4cHJlc3Npb24gJiZcbiAgICAgICFkaXIuYXJnXG4gICAgKSB7XG4gICAgICAvLyBhcmd1bWVudFxuICAgICAgYXJnID0gc3RyLnNsaWNlKGJlZ2luLCBpKS50cmltKClcbiAgICAgIC8vIHRlc3QgZm9yIHZhbGlkIGFyZ3VtZW50IGhlcmVcbiAgICAgIC8vIHNpbmNlIHdlIG1heSBoYXZlIGNhdWdodCBzdHVmZiBsaWtlIGZpcnN0IGhhbGYgb2ZcbiAgICAgIC8vIGFuIG9iamVjdCBsaXRlcmFsIG9yIGEgdGVybmFyeSBleHByZXNzaW9uLlxuICAgICAgaWYgKGFyZ1JFLnRlc3QoYXJnKSkge1xuICAgICAgICBhcmdJbmRleCA9IGkgKyAxXG4gICAgICAgIGRpci5hcmcgPSBfLnN0cmlwUXVvdGVzKGFyZykgfHwgYXJnXG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChcbiAgICAgIGMgPT09IDB4N0MgJiYgLy8gcGlwZVxuICAgICAgc3RyLmNoYXJDb2RlQXQoaSArIDEpICE9PSAweDdDICYmXG4gICAgICBzdHIuY2hhckNvZGVBdChpIC0gMSkgIT09IDB4N0NcbiAgICApIHtcbiAgICAgIGlmIChkaXIuZXhwcmVzc2lvbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIC8vIGZpcnN0IGZpbHRlciwgZW5kIG9mIGV4cHJlc3Npb25cbiAgICAgICAgbGFzdEZpbHRlckluZGV4ID0gaSArIDFcbiAgICAgICAgZGlyLmV4cHJlc3Npb24gPSBzdHIuc2xpY2UoYXJnSW5kZXgsIGkpLnRyaW0oKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gYWxyZWFkeSBoYXMgZmlsdGVyXG4gICAgICAgIHB1c2hGaWx0ZXIoKVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBzd2l0Y2ggKGMpIHtcbiAgICAgICAgY2FzZSAweDIyOiBpbkRvdWJsZSA9IHRydWU7IGJyZWFrIC8vIFwiXG4gICAgICAgIGNhc2UgMHgyNzogaW5TaW5nbGUgPSB0cnVlOyBicmVhayAvLyAnXG4gICAgICAgIGNhc2UgMHgyODogcGFyZW4rKzsgYnJlYWsgICAgICAgICAvLyAoXG4gICAgICAgIGNhc2UgMHgyOTogcGFyZW4tLTsgYnJlYWsgICAgICAgICAvLyApXG4gICAgICAgIGNhc2UgMHg1Qjogc3F1YXJlKys7IGJyZWFrICAgICAgICAvLyBbXG4gICAgICAgIGNhc2UgMHg1RDogc3F1YXJlLS07IGJyZWFrICAgICAgICAvLyBdXG4gICAgICAgIGNhc2UgMHg3QjogY3VybHkrKzsgYnJlYWsgICAgICAgICAvLyB7XG4gICAgICAgIGNhc2UgMHg3RDogY3VybHktLTsgYnJlYWsgICAgICAgICAvLyB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgaWYgKGkgPT09IDAgfHwgYmVnaW4gIT09IGkpIHtcbiAgICBwdXNoRGlyKClcbiAgfVxuXG4gIGNhY2hlLnB1dChzLCBkaXJzKVxuICByZXR1cm4gZGlyc1xufSIsInZhciBfID0gcmVxdWlyZSgnLi4vdXRpbCcpXG52YXIgUGF0aCA9IHJlcXVpcmUoJy4vcGF0aCcpXG52YXIgQ2FjaGUgPSByZXF1aXJlKCcuLi9jYWNoZScpXG52YXIgZXhwcmVzc2lvbkNhY2hlID0gbmV3IENhY2hlKDEwMDApXG5cbnZhciBhbGxvd2VkS2V5d29yZHMgPVxuICAnTWF0aCxEYXRlLHRoaXMsdHJ1ZSxmYWxzZSxudWxsLHVuZGVmaW5lZCxJbmZpbml0eSxOYU4sJyArXG4gICdpc05hTixpc0Zpbml0ZSxkZWNvZGVVUkksZGVjb2RlVVJJQ29tcG9uZW50LGVuY29kZVVSSSwnICtcbiAgJ2VuY29kZVVSSUNvbXBvbmVudCxwYXJzZUludCxwYXJzZUZsb2F0J1xudmFyIGFsbG93ZWRLZXl3b3Jkc1JFID1cbiAgbmV3IFJlZ0V4cCgnXignICsgYWxsb3dlZEtleXdvcmRzLnJlcGxhY2UoLywvZywgJ1xcXFxifCcpICsgJ1xcXFxiKScpXG5cbi8vIGtleXdvcmRzIHRoYXQgZG9uJ3QgbWFrZSBzZW5zZSBpbnNpZGUgZXhwcmVzc2lvbnNcbnZhciBpbXByb3BlcktleXdvcmRzID1cbiAgJ2JyZWFrLGNhc2UsY2xhc3MsY2F0Y2gsY29uc3QsY29udGludWUsZGVidWdnZXIsZGVmYXVsdCwnICtcbiAgJ2RlbGV0ZSxkbyxlbHNlLGV4cG9ydCxleHRlbmRzLGZpbmFsbHksZm9yLGZ1bmN0aW9uLGlmLCcgK1xuICAnaW1wb3J0LGluLGluc3RhbmNlb2YsbGV0LHJldHVybixzdXBlcixzd2l0Y2gsdGhyb3csdHJ5LCcgK1xuICAndmFyLHdoaWxlLHdpdGgseWllbGQsZW51bSxhd2FpdCxpbXBsZW1lbnRzLHBhY2thZ2UsJyArXG4gICdwcm9jdGVjdGVkLHN0YXRpYyxpbnRlcmZhY2UscHJpdmF0ZSxwdWJsaWMnXG52YXIgaW1wcm9wZXJLZXl3b3Jkc1JFID1cbiAgbmV3IFJlZ0V4cCgnXignICsgaW1wcm9wZXJLZXl3b3Jkcy5yZXBsYWNlKC8sL2csICdcXFxcYnwnKSArICdcXFxcYiknKVxuXG52YXIgd3NSRSA9IC9cXHMvZ1xudmFyIG5ld2xpbmVSRSA9IC9cXG4vZ1xudmFyIHNhdmVSRSA9IC9bXFx7LF1cXHMqW1xcd1xcJF9dK1xccyo6fCgnW14nXSonfFwiW15cIl0qXCIpfG5ldyB8dHlwZW9mIHx2b2lkIC9nXG52YXIgcmVzdG9yZVJFID0gL1wiKFxcZCspXCIvZ1xudmFyIHBhdGhUZXN0UkUgPSAvXltBLVphLXpfJF1bXFx3JF0qKFxcLltBLVphLXpfJF1bXFx3JF0qfFxcWycuKj8nXFxdfFxcW1wiLio/XCJcXF18XFxbXFxkK1xcXSkqJC9cbnZhciBwYXRoUmVwbGFjZVJFID0gL1teXFx3JFxcLl0oW0EtWmEtel8kXVtcXHckXSooXFwuW0EtWmEtel8kXVtcXHckXSp8XFxbJy4qPydcXF18XFxbXCIuKj9cIlxcXSkqKS9nXG52YXIgYm9vbGVhbkxpdGVyYWxSRSA9IC9eKHRydWV8ZmFsc2UpJC9cblxuLyoqXG4gKiBTYXZlIC8gUmV3cml0ZSAvIFJlc3RvcmVcbiAqXG4gKiBXaGVuIHJld3JpdGluZyBwYXRocyBmb3VuZCBpbiBhbiBleHByZXNzaW9uLCBpdCBpc1xuICogcG9zc2libGUgZm9yIHRoZSBzYW1lIGxldHRlciBzZXF1ZW5jZXMgdG8gYmUgZm91bmQgaW5cbiAqIHN0cmluZ3MgYW5kIE9iamVjdCBsaXRlcmFsIHByb3BlcnR5IGtleXMuIFRoZXJlZm9yZSB3ZVxuICogcmVtb3ZlIGFuZCBzdG9yZSB0aGVzZSBwYXJ0cyBpbiBhIHRlbXBvcmFyeSBhcnJheSwgYW5kXG4gKiByZXN0b3JlIHRoZW0gYWZ0ZXIgdGhlIHBhdGggcmV3cml0ZS5cbiAqL1xuXG52YXIgc2F2ZWQgPSBbXVxuXG4vKipcbiAqIFNhdmUgcmVwbGFjZXJcbiAqXG4gKiBUaGUgc2F2ZSByZWdleCBjYW4gbWF0Y2ggdHdvIHBvc3NpYmxlIGNhc2VzOlxuICogMS4gQW4gb3BlbmluZyBvYmplY3QgbGl0ZXJhbFxuICogMi4gQSBzdHJpbmdcbiAqIElmIG1hdGNoZWQgYXMgYSBwbGFpbiBzdHJpbmcsIHdlIG5lZWQgdG8gZXNjYXBlIGl0c1xuICogbmV3bGluZXMsIHNpbmNlIHRoZSBzdHJpbmcgbmVlZHMgdG8gYmUgcHJlc2VydmVkIHdoZW5cbiAqIGdlbmVyYXRpbmcgdGhlIGZ1bmN0aW9uIGJvZHkuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IHN0clxuICogQHBhcmFtIHtTdHJpbmd9IGlzU3RyaW5nIC0gc3RyIGlmIG1hdGNoZWQgYXMgYSBzdHJpbmdcbiAqIEByZXR1cm4ge1N0cmluZ30gLSBwbGFjZWhvbGRlciB3aXRoIGluZGV4XG4gKi9cblxuZnVuY3Rpb24gc2F2ZSAoc3RyLCBpc1N0cmluZykge1xuICB2YXIgaSA9IHNhdmVkLmxlbmd0aFxuICBzYXZlZFtpXSA9IGlzU3RyaW5nXG4gICAgPyBzdHIucmVwbGFjZShuZXdsaW5lUkUsICdcXFxcbicpXG4gICAgOiBzdHJcbiAgcmV0dXJuICdcIicgKyBpICsgJ1wiJ1xufVxuXG4vKipcbiAqIFBhdGggcmV3cml0ZSByZXBsYWNlclxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSByYXdcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuXG5mdW5jdGlvbiByZXdyaXRlIChyYXcpIHtcbiAgdmFyIGMgPSByYXcuY2hhckF0KDApXG4gIHZhciBwYXRoID0gcmF3LnNsaWNlKDEpXG4gIGlmIChhbGxvd2VkS2V5d29yZHNSRS50ZXN0KHBhdGgpKSB7XG4gICAgcmV0dXJuIHJhd1xuICB9IGVsc2Uge1xuICAgIHBhdGggPSBwYXRoLmluZGV4T2YoJ1wiJykgPiAtMVxuICAgICAgPyBwYXRoLnJlcGxhY2UocmVzdG9yZVJFLCByZXN0b3JlKVxuICAgICAgOiBwYXRoXG4gICAgcmV0dXJuIGMgKyAnc2NvcGUuJyArIHBhdGhcbiAgfVxufVxuXG4vKipcbiAqIFJlc3RvcmUgcmVwbGFjZXJcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcGFyYW0ge1N0cmluZ30gaSAtIG1hdGNoZWQgc2F2ZSBpbmRleFxuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5cbmZ1bmN0aW9uIHJlc3RvcmUgKHN0ciwgaSkge1xuICByZXR1cm4gc2F2ZWRbaV1cbn1cblxuLyoqXG4gKiBSZXdyaXRlIGFuIGV4cHJlc3Npb24sIHByZWZpeGluZyBhbGwgcGF0aCBhY2Nlc3NvcnMgd2l0aFxuICogYHNjb3BlLmAgYW5kIGdlbmVyYXRlIGdldHRlci9zZXR0ZXIgZnVuY3Rpb25zLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBleHBcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gbmVlZFNldFxuICogQHJldHVybiB7RnVuY3Rpb259XG4gKi9cblxuZnVuY3Rpb24gY29tcGlsZUV4cEZucyAoZXhwLCBuZWVkU2V0KSB7XG4gIGlmIChpbXByb3BlcktleXdvcmRzUkUudGVzdChleHApKSB7XG4gICAgXy53YXJuKFxuICAgICAgJ0F2b2lkIHVzaW5nIHJlc2VydmVkIGtleXdvcmRzIGluIGV4cHJlc3Npb246ICdcbiAgICAgICsgZXhwXG4gICAgKVxuICB9XG4gIC8vIHJlc2V0IHN0YXRlXG4gIHNhdmVkLmxlbmd0aCA9IDBcbiAgLy8gc2F2ZSBzdHJpbmdzIGFuZCBvYmplY3QgbGl0ZXJhbCBrZXlzXG4gIHZhciBib2R5ID0gZXhwXG4gICAgLnJlcGxhY2Uoc2F2ZVJFLCBzYXZlKVxuICAgIC5yZXBsYWNlKHdzUkUsICcnKVxuICAvLyByZXdyaXRlIGFsbCBwYXRoc1xuICAvLyBwYWQgMSBzcGFjZSBoZXJlIGJlY2F1ZSB0aGUgcmVnZXggbWF0Y2hlcyAxIGV4dHJhIGNoYXJcbiAgYm9keSA9ICgnICcgKyBib2R5KVxuICAgIC5yZXBsYWNlKHBhdGhSZXBsYWNlUkUsIHJld3JpdGUpXG4gICAgLnJlcGxhY2UocmVzdG9yZVJFLCByZXN0b3JlKVxuICB2YXIgZ2V0dGVyID0gbWFrZUdldHRlcihib2R5KVxuICBpZiAoZ2V0dGVyKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGdldDogZ2V0dGVyLFxuICAgICAgYm9keTogYm9keSxcbiAgICAgIHNldDogbmVlZFNldFxuICAgICAgICA/IG1ha2VTZXR0ZXIoYm9keSlcbiAgICAgICAgOiBudWxsXG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogQ29tcGlsZSBnZXR0ZXIgc2V0dGVycyBmb3IgYSBzaW1wbGUgcGF0aC5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gZXhwXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqL1xuXG5mdW5jdGlvbiBjb21waWxlUGF0aEZucyAoZXhwKSB7XG4gIHZhciBnZXR0ZXIsIHBhdGhcbiAgaWYgKGV4cC5pbmRleE9mKCdbJykgPCAwKSB7XG4gICAgLy8gcmVhbGx5IHNpbXBsZSBwYXRoXG4gICAgcGF0aCA9IGV4cC5zcGxpdCgnLicpXG4gICAgZ2V0dGVyID0gUGF0aC5jb21waWxlR2V0dGVyKHBhdGgpXG4gIH0gZWxzZSB7XG4gICAgLy8gZG8gdGhlIHJlYWwgcGFyc2luZ1xuICAgIHBhdGggPSBQYXRoLnBhcnNlKGV4cClcbiAgICBnZXR0ZXIgPSBwYXRoLmdldFxuICB9XG4gIHJldHVybiB7XG4gICAgZ2V0OiBnZXR0ZXIsXG4gICAgLy8gYWx3YXlzIGdlbmVyYXRlIHNldHRlciBmb3Igc2ltcGxlIHBhdGhzXG4gICAgc2V0OiBmdW5jdGlvbiAob2JqLCB2YWwpIHtcbiAgICAgIFBhdGguc2V0KG9iaiwgcGF0aCwgdmFsKVxuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEJ1aWxkIGEgZ2V0dGVyIGZ1bmN0aW9uLiBSZXF1aXJlcyBldmFsLlxuICpcbiAqIFdlIGlzb2xhdGUgdGhlIHRyeS9jYXRjaCBzbyBpdCBkb2Vzbid0IGFmZmVjdCB0aGVcbiAqIG9wdGltaXphdGlvbiBvZiB0aGUgcGFyc2UgZnVuY3Rpb24gd2hlbiBpdCBpcyBub3QgY2FsbGVkLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBib2R5XG4gKiBAcmV0dXJuIHtGdW5jdGlvbnx1bmRlZmluZWR9XG4gKi9cblxuZnVuY3Rpb24gbWFrZUdldHRlciAoYm9keSkge1xuICB0cnkge1xuICAgIHJldHVybiBuZXcgRnVuY3Rpb24oJ3Njb3BlJywgJ3JldHVybiAnICsgYm9keSArICc7JylcbiAgfSBjYXRjaCAoZSkge1xuICAgIF8ud2FybihcbiAgICAgICdJbnZhbGlkIGV4cHJlc3Npb24uICcgK1xuICAgICAgJ0dlbmVyYXRlZCBmdW5jdGlvbiBib2R5OiAnICsgYm9keVxuICAgIClcbiAgfVxufVxuXG4vKipcbiAqIEJ1aWxkIGEgc2V0dGVyIGZ1bmN0aW9uLlxuICpcbiAqIFRoaXMgaXMgb25seSBuZWVkZWQgaW4gcmFyZSBzaXR1YXRpb25zIGxpa2UgXCJhW2JdXCIgd2hlcmVcbiAqIGEgc2V0dGFibGUgcGF0aCByZXF1aXJlcyBkeW5hbWljIGV2YWx1YXRpb24uXG4gKlxuICogVGhpcyBzZXR0ZXIgZnVuY3Rpb24gbWF5IHRocm93IGVycm9yIHdoZW4gY2FsbGVkIGlmIHRoZVxuICogZXhwcmVzc2lvbiBib2R5IGlzIG5vdCBhIHZhbGlkIGxlZnQtaGFuZCBleHByZXNzaW9uIGluXG4gKiBhc3NpZ25tZW50LlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBib2R5XG4gKiBAcmV0dXJuIHtGdW5jdGlvbnx1bmRlZmluZWR9XG4gKi9cblxuZnVuY3Rpb24gbWFrZVNldHRlciAoYm9keSkge1xuICB0cnkge1xuICAgIHJldHVybiBuZXcgRnVuY3Rpb24oJ3Njb3BlJywgJ3ZhbHVlJywgYm9keSArICc9dmFsdWU7JylcbiAgfSBjYXRjaCAoZSkge1xuICAgIF8ud2FybignSW52YWxpZCBzZXR0ZXIgZnVuY3Rpb24gYm9keTogJyArIGJvZHkpXG4gIH1cbn1cblxuLyoqXG4gKiBDaGVjayBmb3Igc2V0dGVyIGV4aXN0ZW5jZSBvbiBhIGNhY2hlIGhpdC5cbiAqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBoaXRcbiAqL1xuXG5mdW5jdGlvbiBjaGVja1NldHRlciAoaGl0KSB7XG4gIGlmICghaGl0LnNldCkge1xuICAgIGhpdC5zZXQgPSBtYWtlU2V0dGVyKGhpdC5ib2R5KVxuICB9XG59XG5cbi8qKlxuICogUGFyc2UgYW4gZXhwcmVzc2lvbiBpbnRvIHJlLXdyaXR0ZW4gZ2V0dGVyL3NldHRlcnMuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV4cFxuICogQHBhcmFtIHtCb29sZWFufSBuZWVkU2V0XG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqL1xuXG5leHBvcnRzLnBhcnNlID0gZnVuY3Rpb24gKGV4cCwgbmVlZFNldCkge1xuICBleHAgPSBleHAudHJpbSgpXG4gIC8vIHRyeSBjYWNoZVxuICB2YXIgaGl0ID0gZXhwcmVzc2lvbkNhY2hlLmdldChleHApXG4gIGlmIChoaXQpIHtcbiAgICBpZiAobmVlZFNldCkge1xuICAgICAgY2hlY2tTZXR0ZXIoaGl0KVxuICAgIH1cbiAgICByZXR1cm4gaGl0XG4gIH1cbiAgLy8gd2UgZG8gYSBzaW1wbGUgcGF0aCBjaGVjayB0byBvcHRpbWl6ZSBmb3IgdGhlbS5cbiAgLy8gdGhlIGNoZWNrIGZhaWxzIHZhbGlkIHBhdGhzIHdpdGggdW51c2FsIHdoaXRlc3BhY2VzLFxuICAvLyBidXQgdGhhdCdzIHRvbyByYXJlIGFuZCB3ZSBkb24ndCBjYXJlLlxuICAvLyBhbHNvIHNraXAgYm9vbGVhbiBsaXRlcmFscyBhbmQgcGF0aHMgdGhhdCBzdGFydCB3aXRoXG4gIC8vIGdsb2JhbCBcIk1hdGhcIlxuICB2YXIgcmVzID1cbiAgICBwYXRoVGVzdFJFLnRlc3QoZXhwKSAmJlxuICAgIC8vIGRvbid0IHRyZWF0IHRydWUvZmFsc2UgYXMgcGF0aHNcbiAgICAhYm9vbGVhbkxpdGVyYWxSRS50ZXN0KGV4cCkgJiZcbiAgICAvLyBNYXRoIGNvbnN0YW50cyBlLmcuIE1hdGguUEksIE1hdGguRSBldGMuXG4gICAgZXhwLnNsaWNlKDAsIDUpICE9PSAnTWF0aC4nXG4gICAgICA/IGNvbXBpbGVQYXRoRm5zKGV4cClcbiAgICAgIDogY29tcGlsZUV4cEZucyhleHAsIG5lZWRTZXQpXG4gIGV4cHJlc3Npb25DYWNoZS5wdXQoZXhwLCByZXMpXG4gIHJldHVybiByZXNcbn1cblxuLy8gRXhwb3J0IHRoZSBwYXRoUmVnZXggZm9yIGV4dGVybmFsIHVzZVxuZXhwb3J0cy5wYXRoVGVzdFJFID0gcGF0aFRlc3RSRSIsInZhciBfID0gcmVxdWlyZSgnLi4vdXRpbCcpXG52YXIgQ2FjaGUgPSByZXF1aXJlKCcuLi9jYWNoZScpXG52YXIgcGF0aENhY2hlID0gbmV3IENhY2hlKDEwMDApXG52YXIgaWRlbnRSRSA9IC9eWyRfYS16QS1aXStbXFx3JF0qJC9cblxuLyoqXG4gKiBQYXRoLXBhcnNpbmcgYWxnb3JpdGhtIHNjb29wZWQgZnJvbSBQb2x5bWVyL29ic2VydmUtanNcbiAqL1xuXG52YXIgcGF0aFN0YXRlTWFjaGluZSA9IHtcbiAgJ2JlZm9yZVBhdGgnOiB7XG4gICAgJ3dzJzogWydiZWZvcmVQYXRoJ10sXG4gICAgJ2lkZW50JzogWydpbklkZW50JywgJ2FwcGVuZCddLFxuICAgICdbJzogWydiZWZvcmVFbGVtZW50J10sXG4gICAgJ2VvZic6IFsnYWZ0ZXJQYXRoJ11cbiAgfSxcblxuICAnaW5QYXRoJzoge1xuICAgICd3cyc6IFsnaW5QYXRoJ10sXG4gICAgJy4nOiBbJ2JlZm9yZUlkZW50J10sXG4gICAgJ1snOiBbJ2JlZm9yZUVsZW1lbnQnXSxcbiAgICAnZW9mJzogWydhZnRlclBhdGgnXVxuICB9LFxuXG4gICdiZWZvcmVJZGVudCc6IHtcbiAgICAnd3MnOiBbJ2JlZm9yZUlkZW50J10sXG4gICAgJ2lkZW50JzogWydpbklkZW50JywgJ2FwcGVuZCddXG4gIH0sXG5cbiAgJ2luSWRlbnQnOiB7XG4gICAgJ2lkZW50JzogWydpbklkZW50JywgJ2FwcGVuZCddLFxuICAgICcwJzogWydpbklkZW50JywgJ2FwcGVuZCddLFxuICAgICdudW1iZXInOiBbJ2luSWRlbnQnLCAnYXBwZW5kJ10sXG4gICAgJ3dzJzogWydpblBhdGgnLCAncHVzaCddLFxuICAgICcuJzogWydiZWZvcmVJZGVudCcsICdwdXNoJ10sXG4gICAgJ1snOiBbJ2JlZm9yZUVsZW1lbnQnLCAncHVzaCddLFxuICAgICdlb2YnOiBbJ2FmdGVyUGF0aCcsICdwdXNoJ11cbiAgfSxcblxuICAnYmVmb3JlRWxlbWVudCc6IHtcbiAgICAnd3MnOiBbJ2JlZm9yZUVsZW1lbnQnXSxcbiAgICAnMCc6IFsnYWZ0ZXJaZXJvJywgJ2FwcGVuZCddLFxuICAgICdudW1iZXInOiBbJ2luSW5kZXgnLCAnYXBwZW5kJ10sXG4gICAgXCInXCI6IFsnaW5TaW5nbGVRdW90ZScsICdhcHBlbmQnLCAnJ10sXG4gICAgJ1wiJzogWydpbkRvdWJsZVF1b3RlJywgJ2FwcGVuZCcsICcnXVxuICB9LFxuXG4gICdhZnRlclplcm8nOiB7XG4gICAgJ3dzJzogWydhZnRlckVsZW1lbnQnLCAncHVzaCddLFxuICAgICddJzogWydpblBhdGgnLCAncHVzaCddXG4gIH0sXG5cbiAgJ2luSW5kZXgnOiB7XG4gICAgJzAnOiBbJ2luSW5kZXgnLCAnYXBwZW5kJ10sXG4gICAgJ251bWJlcic6IFsnaW5JbmRleCcsICdhcHBlbmQnXSxcbiAgICAnd3MnOiBbJ2FmdGVyRWxlbWVudCddLFxuICAgICddJzogWydpblBhdGgnLCAncHVzaCddXG4gIH0sXG5cbiAgJ2luU2luZ2xlUXVvdGUnOiB7XG4gICAgXCInXCI6IFsnYWZ0ZXJFbGVtZW50J10sXG4gICAgJ2VvZic6ICdlcnJvcicsXG4gICAgJ2Vsc2UnOiBbJ2luU2luZ2xlUXVvdGUnLCAnYXBwZW5kJ11cbiAgfSxcblxuICAnaW5Eb3VibGVRdW90ZSc6IHtcbiAgICAnXCInOiBbJ2FmdGVyRWxlbWVudCddLFxuICAgICdlb2YnOiAnZXJyb3InLFxuICAgICdlbHNlJzogWydpbkRvdWJsZVF1b3RlJywgJ2FwcGVuZCddXG4gIH0sXG5cbiAgJ2FmdGVyRWxlbWVudCc6IHtcbiAgICAnd3MnOiBbJ2FmdGVyRWxlbWVudCddLFxuICAgICddJzogWydpblBhdGgnLCAncHVzaCddXG4gIH1cbn1cblxuZnVuY3Rpb24gbm9vcCAoKSB7fVxuXG4vKipcbiAqIERldGVybWluZSB0aGUgdHlwZSBvZiBhIGNoYXJhY3RlciBpbiBhIGtleXBhdGguXG4gKlxuICogQHBhcmFtIHtDaGFyfSBjaGFyXG4gKiBAcmV0dXJuIHtTdHJpbmd9IHR5cGVcbiAqL1xuXG5mdW5jdGlvbiBnZXRQYXRoQ2hhclR5cGUgKGNoYXIpIHtcbiAgaWYgKGNoYXIgPT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybiAnZW9mJ1xuICB9XG5cbiAgdmFyIGNvZGUgPSBjaGFyLmNoYXJDb2RlQXQoMClcblxuICBzd2l0Y2goY29kZSkge1xuICAgIGNhc2UgMHg1QjogLy8gW1xuICAgIGNhc2UgMHg1RDogLy8gXVxuICAgIGNhc2UgMHgyRTogLy8gLlxuICAgIGNhc2UgMHgyMjogLy8gXCJcbiAgICBjYXNlIDB4Mjc6IC8vICdcbiAgICBjYXNlIDB4MzA6IC8vIDBcbiAgICAgIHJldHVybiBjaGFyXG5cbiAgICBjYXNlIDB4NUY6IC8vIF9cbiAgICBjYXNlIDB4MjQ6IC8vICRcbiAgICAgIHJldHVybiAnaWRlbnQnXG5cbiAgICBjYXNlIDB4MjA6IC8vIFNwYWNlXG4gICAgY2FzZSAweDA5OiAvLyBUYWJcbiAgICBjYXNlIDB4MEE6IC8vIE5ld2xpbmVcbiAgICBjYXNlIDB4MEQ6IC8vIFJldHVyblxuICAgIGNhc2UgMHhBMDogIC8vIE5vLWJyZWFrIHNwYWNlXG4gICAgY2FzZSAweEZFRkY6ICAvLyBCeXRlIE9yZGVyIE1hcmtcbiAgICBjYXNlIDB4MjAyODogIC8vIExpbmUgU2VwYXJhdG9yXG4gICAgY2FzZSAweDIwMjk6ICAvLyBQYXJhZ3JhcGggU2VwYXJhdG9yXG4gICAgICByZXR1cm4gJ3dzJ1xuICB9XG5cbiAgLy8gYS16LCBBLVpcbiAgaWYgKCgweDYxIDw9IGNvZGUgJiYgY29kZSA8PSAweDdBKSB8fFxuICAgICAgKDB4NDEgPD0gY29kZSAmJiBjb2RlIDw9IDB4NUEpKSB7XG4gICAgcmV0dXJuICdpZGVudCdcbiAgfVxuXG4gIC8vIDEtOVxuICBpZiAoMHgzMSA8PSBjb2RlICYmIGNvZGUgPD0gMHgzOSkge1xuICAgIHJldHVybiAnbnVtYmVyJ1xuICB9XG5cbiAgcmV0dXJuICdlbHNlJ1xufVxuXG4vKipcbiAqIFBhcnNlIGEgc3RyaW5nIHBhdGggaW50byBhbiBhcnJheSBvZiBzZWdtZW50c1xuICogVG9kbyBpbXBsZW1lbnQgY2FjaGVcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gcGF0aFxuICogQHJldHVybiB7QXJyYXl8dW5kZWZpbmVkfVxuICovXG5cbmZ1bmN0aW9uIHBhcnNlUGF0aCAocGF0aCkge1xuICB2YXIga2V5cyA9IFtdXG4gIHZhciBpbmRleCA9IC0xXG4gIHZhciBtb2RlID0gJ2JlZm9yZVBhdGgnXG4gIHZhciBjLCBuZXdDaGFyLCBrZXksIHR5cGUsIHRyYW5zaXRpb24sIGFjdGlvbiwgdHlwZU1hcFxuXG4gIHZhciBhY3Rpb25zID0ge1xuICAgIHB1c2g6IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKGtleSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVyblxuICAgICAgfVxuICAgICAga2V5cy5wdXNoKGtleSlcbiAgICAgIGtleSA9IHVuZGVmaW5lZFxuICAgIH0sXG4gICAgYXBwZW5kOiBmdW5jdGlvbigpIHtcbiAgICAgIGlmIChrZXkgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBrZXkgPSBuZXdDaGFyXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBrZXkgKz0gbmV3Q2hhclxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIG1heWJlVW5lc2NhcGVRdW90ZSAoKSB7XG4gICAgdmFyIG5leHRDaGFyID0gcGF0aFtpbmRleCArIDFdXG4gICAgaWYgKChtb2RlID09PSAnaW5TaW5nbGVRdW90ZScgJiYgbmV4dENoYXIgPT09IFwiJ1wiKSB8fFxuICAgICAgICAobW9kZSA9PT0gJ2luRG91YmxlUXVvdGUnICYmIG5leHRDaGFyID09PSAnXCInKSkge1xuICAgICAgaW5kZXgrK1xuICAgICAgbmV3Q2hhciA9IG5leHRDaGFyXG4gICAgICBhY3Rpb25zLmFwcGVuZCgpXG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIH1cbiAgfVxuXG4gIHdoaWxlIChtb2RlKSB7XG4gICAgaW5kZXgrK1xuICAgIGMgPSBwYXRoW2luZGV4XVxuXG4gICAgaWYgKGMgPT09ICdcXFxcJyAmJiBtYXliZVVuZXNjYXBlUXVvdGUoKSkge1xuICAgICAgY29udGludWVcbiAgICB9XG5cbiAgICB0eXBlID0gZ2V0UGF0aENoYXJUeXBlKGMpXG4gICAgdHlwZU1hcCA9IHBhdGhTdGF0ZU1hY2hpbmVbbW9kZV1cbiAgICB0cmFuc2l0aW9uID0gdHlwZU1hcFt0eXBlXSB8fCB0eXBlTWFwWydlbHNlJ10gfHwgJ2Vycm9yJ1xuXG4gICAgaWYgKHRyYW5zaXRpb24gPT09ICdlcnJvcicpIHtcbiAgICAgIHJldHVybiAvLyBwYXJzZSBlcnJvclxuICAgIH1cblxuICAgIG1vZGUgPSB0cmFuc2l0aW9uWzBdXG4gICAgYWN0aW9uID0gYWN0aW9uc1t0cmFuc2l0aW9uWzFdXSB8fCBub29wXG4gICAgbmV3Q2hhciA9IHRyYW5zaXRpb25bMl0gPT09IHVuZGVmaW5lZFxuICAgICAgPyBjXG4gICAgICA6IHRyYW5zaXRpb25bMl1cbiAgICBhY3Rpb24oKVxuXG4gICAgaWYgKG1vZGUgPT09ICdhZnRlclBhdGgnKSB7XG4gICAgICByZXR1cm4ga2V5c1xuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEZvcm1hdCBhIGFjY2Vzc29yIHNlZ21lbnQgYmFzZWQgb24gaXRzIHR5cGUuXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGtleVxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqL1xuXG5mdW5jdGlvbiBmb3JtYXRBY2Nlc3NvcihrZXkpIHtcbiAgaWYgKGlkZW50UkUudGVzdChrZXkpKSB7IC8vIGlkZW50aWZpZXJcbiAgICByZXR1cm4gJy4nICsga2V5XG4gIH0gZWxzZSBpZiAoK2tleSA9PT0ga2V5ID4+PiAwKSB7IC8vIGJyYWNrZXQgaW5kZXhcbiAgICByZXR1cm4gJ1snICsga2V5ICsgJ10nXG4gIH0gZWxzZSB7IC8vIGJyYWNrZXQgc3RyaW5nXG4gICAgcmV0dXJuICdbXCInICsga2V5LnJlcGxhY2UoL1wiL2csICdcXFxcXCInKSArICdcIl0nXG4gIH1cbn1cblxuLyoqXG4gKiBDb21waWxlcyBhIGdldHRlciBmdW5jdGlvbiB3aXRoIGEgZml4ZWQgcGF0aC5cbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBwYXRoXG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqL1xuXG5leHBvcnRzLmNvbXBpbGVHZXR0ZXIgPSBmdW5jdGlvbiAocGF0aCkge1xuICB2YXIgYm9keSA9ICdyZXR1cm4gbycgKyBwYXRoLm1hcChmb3JtYXRBY2Nlc3Nvcikuam9pbignJylcbiAgcmV0dXJuIG5ldyBGdW5jdGlvbignbycsIGJvZHkpXG59XG5cbi8qKlxuICogRXh0ZXJuYWwgcGFyc2UgdGhhdCBjaGVjayBmb3IgYSBjYWNoZSBoaXQgZmlyc3RcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gcGF0aFxuICogQHJldHVybiB7QXJyYXl8dW5kZWZpbmVkfVxuICovXG5cbmV4cG9ydHMucGFyc2UgPSBmdW5jdGlvbiAocGF0aCkge1xuICB2YXIgaGl0ID0gcGF0aENhY2hlLmdldChwYXRoKVxuICBpZiAoIWhpdCkge1xuICAgIGhpdCA9IHBhcnNlUGF0aChwYXRoKVxuICAgIGlmIChoaXQpIHtcbiAgICAgIGhpdC5nZXQgPSBleHBvcnRzLmNvbXBpbGVHZXR0ZXIoaGl0KVxuICAgICAgcGF0aENhY2hlLnB1dChwYXRoLCBoaXQpXG4gICAgfVxuICB9XG4gIHJldHVybiBoaXRcbn1cblxuLyoqXG4gKiBHZXQgZnJvbSBhbiBvYmplY3QgZnJvbSBhIHBhdGggc3RyaW5nXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IG9ialxuICogQHBhcmFtIHtTdHJpbmd9IHBhdGhcbiAqL1xuXG5leHBvcnRzLmdldCA9IGZ1bmN0aW9uIChvYmosIHBhdGgpIHtcbiAgcGF0aCA9IGV4cG9ydHMucGFyc2UocGF0aClcbiAgaWYgKHBhdGgpIHtcbiAgICByZXR1cm4gcGF0aC5nZXQob2JqKVxuICB9XG59XG5cbi8qKlxuICogU2V0IG9uIGFuIG9iamVjdCBmcm9tIGEgcGF0aFxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcbiAqIEBwYXJhbSB7U3RyaW5nIHwgQXJyYXl9IHBhdGhcbiAqIEBwYXJhbSB7Kn0gdmFsXG4gKi9cblxuZXhwb3J0cy5zZXQgPSBmdW5jdGlvbiAob2JqLCBwYXRoLCB2YWwpIHtcbiAgaWYgKHR5cGVvZiBwYXRoID09PSAnc3RyaW5nJykge1xuICAgIHBhdGggPSBleHBvcnRzLnBhcnNlKHBhdGgpXG4gIH1cbiAgaWYgKCFwYXRoIHx8ICFfLmlzT2JqZWN0KG9iaikpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxuICB2YXIgbGFzdCwga2V5XG4gIGZvciAodmFyIGkgPSAwLCBsID0gcGF0aC5sZW5ndGggLSAxOyBpIDwgbDsgaSsrKSB7XG4gICAgbGFzdCA9IG9ialxuICAgIGtleSA9IHBhdGhbaV1cbiAgICBvYmogPSBvYmpba2V5XVxuICAgIGlmICghXy5pc09iamVjdChvYmopKSB7XG4gICAgICBvYmogPSB7fVxuICAgICAgbGFzdC4kYWRkKGtleSwgb2JqKVxuICAgIH1cbiAgfVxuICBrZXkgPSBwYXRoW2ldXG4gIGlmIChrZXkgaW4gb2JqKSB7XG4gICAgb2JqW2tleV0gPSB2YWxcbiAgfSBlbHNlIHtcbiAgICBvYmouJGFkZChrZXksIHZhbClcbiAgfVxuICByZXR1cm4gdHJ1ZVxufSIsInZhciBfID0gcmVxdWlyZSgnLi4vdXRpbCcpXG52YXIgQ2FjaGUgPSByZXF1aXJlKCcuLi9jYWNoZScpXG52YXIgdGVtcGxhdGVDYWNoZSA9IG5ldyBDYWNoZSgxMDAwKVxudmFyIGlkU2VsZWN0b3JDYWNoZSA9IG5ldyBDYWNoZSgxMDAwKVxuXG52YXIgbWFwID0ge1xuICBfZGVmYXVsdCA6IFswLCAnJywgJyddLFxuICBsZWdlbmQgICA6IFsxLCAnPGZpZWxkc2V0PicsICc8L2ZpZWxkc2V0PiddLFxuICB0ciAgICAgICA6IFsyLCAnPHRhYmxlPjx0Ym9keT4nLCAnPC90Ym9keT48L3RhYmxlPiddLFxuICBjb2wgICAgICA6IFtcbiAgICAyLFxuICAgICc8dGFibGU+PHRib2R5PjwvdGJvZHk+PGNvbGdyb3VwPicsXG4gICAgJzwvY29sZ3JvdXA+PC90YWJsZT4nXG4gIF1cbn1cblxubWFwLnRkID1cbm1hcC50aCA9IFtcbiAgMyxcbiAgJzx0YWJsZT48dGJvZHk+PHRyPicsXG4gICc8L3RyPjwvdGJvZHk+PC90YWJsZT4nXG5dXG5cbm1hcC5vcHRpb24gPVxubWFwLm9wdGdyb3VwID0gW1xuICAxLFxuICAnPHNlbGVjdCBtdWx0aXBsZT1cIm11bHRpcGxlXCI+JyxcbiAgJzwvc2VsZWN0Pidcbl1cblxubWFwLnRoZWFkID1cbm1hcC50Ym9keSA9XG5tYXAuY29sZ3JvdXAgPVxubWFwLmNhcHRpb24gPVxubWFwLnRmb290ID0gWzEsICc8dGFibGU+JywgJzwvdGFibGU+J11cblxubWFwLmcgPVxubWFwLmRlZnMgPVxubWFwLnN5bWJvbCA9XG5tYXAudXNlID1cbm1hcC5pbWFnZSA9XG5tYXAudGV4dCA9XG5tYXAuY2lyY2xlID1cbm1hcC5lbGxpcHNlID1cbm1hcC5saW5lID1cbm1hcC5wYXRoID1cbm1hcC5wb2x5Z29uID1cbm1hcC5wb2x5bGluZSA9XG5tYXAucmVjdCA9IFtcbiAgMSxcbiAgJzxzdmcgJyArXG4gICAgJ3htbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiAnICtcbiAgICAneG1sbnM6eGxpbms9XCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rXCIgJyArXG4gICAgJ3htbG5zOmV2PVwiaHR0cDovL3d3dy53My5vcmcvMjAwMS94bWwtZXZlbnRzXCInICtcbiAgICAndmVyc2lvbj1cIjEuMVwiPicsXG4gICc8L3N2Zz4nXG5dXG5cbnZhciB0YWdSRSA9IC88KFtcXHc6XSspL1xudmFyIGVudGl0eVJFID0gLyZcXHcrOy9cblxuLyoqXG4gKiBDb252ZXJ0IGEgc3RyaW5nIHRlbXBsYXRlIHRvIGEgRG9jdW1lbnRGcmFnbWVudC5cbiAqIERldGVybWluZXMgY29ycmVjdCB3cmFwcGluZyBieSB0YWcgdHlwZXMuIFdyYXBwaW5nXG4gKiBzdHJhdGVneSBmb3VuZCBpbiBqUXVlcnkgJiBjb21wb25lbnQvZG9taWZ5LlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSB0ZW1wbGF0ZVN0cmluZ1xuICogQHJldHVybiB7RG9jdW1lbnRGcmFnbWVudH1cbiAqL1xuXG5mdW5jdGlvbiBzdHJpbmdUb0ZyYWdtZW50ICh0ZW1wbGF0ZVN0cmluZykge1xuICAvLyB0cnkgYSBjYWNoZSBoaXQgZmlyc3RcbiAgdmFyIGhpdCA9IHRlbXBsYXRlQ2FjaGUuZ2V0KHRlbXBsYXRlU3RyaW5nKVxuICBpZiAoaGl0KSB7XG4gICAgcmV0dXJuIGhpdFxuICB9XG5cbiAgdmFyIGZyYWcgPSBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KClcbiAgdmFyIHRhZ01hdGNoID0gdGVtcGxhdGVTdHJpbmcubWF0Y2godGFnUkUpXG4gIHZhciBlbnRpdHlNYXRjaCA9IGVudGl0eVJFLnRlc3QodGVtcGxhdGVTdHJpbmcpXG5cbiAgaWYgKCF0YWdNYXRjaCAmJiAhZW50aXR5TWF0Y2gpIHtcbiAgICAvLyB0ZXh0IG9ubHksIHJldHVybiBhIHNpbmdsZSB0ZXh0IG5vZGUuXG4gICAgZnJhZy5hcHBlbmRDaGlsZChcbiAgICAgIGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKHRlbXBsYXRlU3RyaW5nKVxuICAgIClcbiAgfSBlbHNlIHtcblxuICAgIHZhciB0YWcgICAgPSB0YWdNYXRjaCAmJiB0YWdNYXRjaFsxXVxuICAgIHZhciB3cmFwICAgPSBtYXBbdGFnXSB8fCBtYXAuX2RlZmF1bHRcbiAgICB2YXIgZGVwdGggID0gd3JhcFswXVxuICAgIHZhciBwcmVmaXggPSB3cmFwWzFdXG4gICAgdmFyIHN1ZmZpeCA9IHdyYXBbMl1cbiAgICB2YXIgbm9kZSAgID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcblxuICAgIG5vZGUuaW5uZXJIVE1MID0gcHJlZml4ICsgdGVtcGxhdGVTdHJpbmcudHJpbSgpICsgc3VmZml4XG4gICAgd2hpbGUgKGRlcHRoLS0pIHtcbiAgICAgIG5vZGUgPSBub2RlLmxhc3RDaGlsZFxuICAgIH1cblxuICAgIHZhciBjaGlsZFxuICAgIC8qIGpzaGludCBib3NzOnRydWUgKi9cbiAgICB3aGlsZSAoY2hpbGQgPSBub2RlLmZpcnN0Q2hpbGQpIHtcbiAgICAgIGZyYWcuYXBwZW5kQ2hpbGQoY2hpbGQpXG4gICAgfVxuICB9XG5cbiAgdGVtcGxhdGVDYWNoZS5wdXQodGVtcGxhdGVTdHJpbmcsIGZyYWcpXG4gIHJldHVybiBmcmFnXG59XG5cbi8qKlxuICogQ29udmVydCBhIHRlbXBsYXRlIG5vZGUgdG8gYSBEb2N1bWVudEZyYWdtZW50LlxuICpcbiAqIEBwYXJhbSB7Tm9kZX0gbm9kZVxuICogQHJldHVybiB7RG9jdW1lbnRGcmFnbWVudH1cbiAqL1xuXG5mdW5jdGlvbiBub2RlVG9GcmFnbWVudCAobm9kZSkge1xuICB2YXIgdGFnID0gbm9kZS50YWdOYW1lXG4gIC8vIGlmIGl0cyBhIHRlbXBsYXRlIHRhZyBhbmQgdGhlIGJyb3dzZXIgc3VwcG9ydHMgaXQsXG4gIC8vIGl0cyBjb250ZW50IGlzIGFscmVhZHkgYSBkb2N1bWVudCBmcmFnbWVudC5cbiAgaWYgKFxuICAgIHRhZyA9PT0gJ1RFTVBMQVRFJyAmJlxuICAgIG5vZGUuY29udGVudCBpbnN0YW5jZW9mIERvY3VtZW50RnJhZ21lbnRcbiAgKSB7XG4gICAgcmV0dXJuIG5vZGUuY29udGVudFxuICB9XG4gIC8vIHNjcmlwdCB0ZW1wbGF0ZVxuICBpZiAodGFnID09PSAnU0NSSVBUJykge1xuICAgIHJldHVybiBzdHJpbmdUb0ZyYWdtZW50KG5vZGUudGV4dENvbnRlbnQpXG4gIH1cbiAgLy8gbm9ybWFsIG5vZGUsIGNsb25lIGl0IHRvIGF2b2lkIG11dGF0aW5nIHRoZSBvcmlnaW5hbFxuICB2YXIgY2xvbmUgPSBleHBvcnRzLmNsb25lKG5vZGUpXG4gIHZhciBmcmFnID0gZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpXG4gIHZhciBjaGlsZFxuICAvKiBqc2hpbnQgYm9zczp0cnVlICovXG4gIHdoaWxlIChjaGlsZCA9IGNsb25lLmZpcnN0Q2hpbGQpIHtcbiAgICBmcmFnLmFwcGVuZENoaWxkKGNoaWxkKVxuICB9XG4gIHJldHVybiBmcmFnXG59XG5cbi8vIFRlc3QgZm9yIHRoZSBwcmVzZW5jZSBvZiB0aGUgU2FmYXJpIHRlbXBsYXRlIGNsb25pbmcgYnVnXG4vLyBodHRwczovL2J1Z3Mud2Via2l0Lm9yZy9zaG93X2J1Zy5jZ2k/aWQ9MTM3NzU1XG52YXIgaGFzQnJva2VuVGVtcGxhdGUgPSBfLmluQnJvd3NlclxuICA/IChmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgYSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpXG4gICAgICBhLmlubmVySFRNTCA9ICc8dGVtcGxhdGU+MTwvdGVtcGxhdGU+J1xuICAgICAgcmV0dXJuICFhLmNsb25lTm9kZSh0cnVlKS5maXJzdENoaWxkLmlubmVySFRNTFxuICAgIH0pKClcbiAgOiBmYWxzZVxuXG4vLyBUZXN0IGZvciBJRTEwLzExIHRleHRhcmVhIHBsYWNlaG9sZGVyIGNsb25lIGJ1Z1xudmFyIGhhc1RleHRhcmVhQ2xvbmVCdWcgPSBfLmluQnJvd3NlclxuICA/IChmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RleHRhcmVhJylcbiAgICAgIHQucGxhY2Vob2xkZXIgPSAndCdcbiAgICAgIHJldHVybiB0LmNsb25lTm9kZSh0cnVlKS52YWx1ZSA9PT0gJ3QnXG4gICAgfSkoKVxuICA6IGZhbHNlXG5cbi8qKlxuICogMS4gRGVhbCB3aXRoIFNhZmFyaSBjbG9uaW5nIG5lc3RlZCA8dGVtcGxhdGU+IGJ1ZyBieVxuICogICAgbWFudWFsbHkgY2xvbmluZyBhbGwgdGVtcGxhdGUgaW5zdGFuY2VzLlxuICogMi4gRGVhbCB3aXRoIElFMTAvMTEgdGV4dGFyZWEgcGxhY2Vob2xkZXIgYnVnIGJ5IHNldHRpbmdcbiAqICAgIHRoZSBjb3JyZWN0IHZhbHVlIGFmdGVyIGNsb25pbmcuXG4gKlxuICogQHBhcmFtIHtFbGVtZW50fERvY3VtZW50RnJhZ21lbnR9IG5vZGVcbiAqIEByZXR1cm4ge0VsZW1lbnR8RG9jdW1lbnRGcmFnbWVudH1cbiAqL1xuXG5leHBvcnRzLmNsb25lID0gZnVuY3Rpb24gKG5vZGUpIHtcbiAgdmFyIHJlcyA9IG5vZGUuY2xvbmVOb2RlKHRydWUpXG4gIHZhciBpLCBvcmlnaW5hbCwgY2xvbmVkXG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICBpZiAoaGFzQnJva2VuVGVtcGxhdGUpIHtcbiAgICBvcmlnaW5hbCA9IG5vZGUucXVlcnlTZWxlY3RvckFsbCgndGVtcGxhdGUnKVxuICAgIGlmIChvcmlnaW5hbC5sZW5ndGgpIHtcbiAgICAgIGNsb25lZCA9IHJlcy5xdWVyeVNlbGVjdG9yQWxsKCd0ZW1wbGF0ZScpXG4gICAgICBpID0gY2xvbmVkLmxlbmd0aFxuICAgICAgd2hpbGUgKGktLSkge1xuICAgICAgICBjbG9uZWRbaV0ucGFyZW50Tm9kZS5yZXBsYWNlQ2hpbGQoXG4gICAgICAgICAgb3JpZ2luYWxbaV0uY2xvbmVOb2RlKHRydWUpLFxuICAgICAgICAgIGNsb25lZFtpXVxuICAgICAgICApXG4gICAgICB9XG4gICAgfVxuICB9XG4gIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICBpZiAoaGFzVGV4dGFyZWFDbG9uZUJ1Zykge1xuICAgIGlmIChub2RlLnRhZ05hbWUgPT09ICdURVhUQVJFQScpIHtcbiAgICAgIHJlcy52YWx1ZSA9IG5vZGUudmFsdWVcbiAgICB9IGVsc2Uge1xuICAgICAgb3JpZ2luYWwgPSBub2RlLnF1ZXJ5U2VsZWN0b3JBbGwoJ3RleHRhcmVhJylcbiAgICAgIGlmIChvcmlnaW5hbC5sZW5ndGgpIHtcbiAgICAgICAgY2xvbmVkID0gcmVzLnF1ZXJ5U2VsZWN0b3JBbGwoJ3RleHRhcmVhJylcbiAgICAgICAgaSA9IGNsb25lZC5sZW5ndGhcbiAgICAgICAgd2hpbGUgKGktLSkge1xuICAgICAgICAgIGNsb25lZFtpXS52YWx1ZSA9IG9yaWdpbmFsW2ldLnZhbHVlXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc1xufVxuXG4vKipcbiAqIFByb2Nlc3MgdGhlIHRlbXBsYXRlIG9wdGlvbiBhbmQgbm9ybWFsaXplcyBpdCBpbnRvIGFcbiAqIGEgRG9jdW1lbnRGcmFnbWVudCB0aGF0IGNhbiBiZSB1c2VkIGFzIGEgcGFydGlhbCBvciBhXG4gKiBpbnN0YW5jZSB0ZW1wbGF0ZS5cbiAqXG4gKiBAcGFyYW0geyp9IHRlbXBsYXRlXG4gKiAgICBQb3NzaWJsZSB2YWx1ZXMgaW5jbHVkZTpcbiAqICAgIC0gRG9jdW1lbnRGcmFnbWVudCBvYmplY3RcbiAqICAgIC0gTm9kZSBvYmplY3Qgb2YgdHlwZSBUZW1wbGF0ZVxuICogICAgLSBpZCBzZWxlY3RvcjogJyNzb21lLXRlbXBsYXRlLWlkJ1xuICogICAgLSB0ZW1wbGF0ZSBzdHJpbmc6ICc8ZGl2PjxzcGFuPnt7bXNnfX08L3NwYW4+PC9kaXY+J1xuICogQHBhcmFtIHtCb29sZWFufSBjbG9uZVxuICogQHBhcmFtIHtCb29sZWFufSBub1NlbGVjdG9yXG4gKiBAcmV0dXJuIHtEb2N1bWVudEZyYWdtZW50fHVuZGVmaW5lZH1cbiAqL1xuXG5leHBvcnRzLnBhcnNlID0gZnVuY3Rpb24gKHRlbXBsYXRlLCBjbG9uZSwgbm9TZWxlY3Rvcikge1xuICB2YXIgbm9kZSwgZnJhZ1xuXG4gIC8vIGlmIHRoZSB0ZW1wbGF0ZSBpcyBhbHJlYWR5IGEgZG9jdW1lbnQgZnJhZ21lbnQsXG4gIC8vIGRvIG5vdGhpbmdcbiAgaWYgKHRlbXBsYXRlIGluc3RhbmNlb2YgRG9jdW1lbnRGcmFnbWVudCkge1xuICAgIHJldHVybiBjbG9uZVxuICAgICAgPyB0ZW1wbGF0ZS5jbG9uZU5vZGUodHJ1ZSlcbiAgICAgIDogdGVtcGxhdGVcbiAgfVxuXG4gIGlmICh0eXBlb2YgdGVtcGxhdGUgPT09ICdzdHJpbmcnKSB7XG4gICAgLy8gaWQgc2VsZWN0b3JcbiAgICBpZiAoIW5vU2VsZWN0b3IgJiYgdGVtcGxhdGUuY2hhckF0KDApID09PSAnIycpIHtcbiAgICAgIC8vIGlkIHNlbGVjdG9yIGNhbiBiZSBjYWNoZWQgdG9vXG4gICAgICBmcmFnID0gaWRTZWxlY3RvckNhY2hlLmdldCh0ZW1wbGF0ZSlcbiAgICAgIGlmICghZnJhZykge1xuICAgICAgICBub2RlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodGVtcGxhdGUuc2xpY2UoMSkpXG4gICAgICAgIGlmIChub2RlKSB7XG4gICAgICAgICAgZnJhZyA9IG5vZGVUb0ZyYWdtZW50KG5vZGUpXG4gICAgICAgICAgLy8gc2F2ZSBzZWxlY3RvciB0byBjYWNoZVxuICAgICAgICAgIGlkU2VsZWN0b3JDYWNoZS5wdXQodGVtcGxhdGUsIGZyYWcpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gbm9ybWFsIHN0cmluZyB0ZW1wbGF0ZVxuICAgICAgZnJhZyA9IHN0cmluZ1RvRnJhZ21lbnQodGVtcGxhdGUpXG4gICAgfVxuICB9IGVsc2UgaWYgKHRlbXBsYXRlLm5vZGVUeXBlKSB7XG4gICAgLy8gYSBkaXJlY3Qgbm9kZVxuICAgIGZyYWcgPSBub2RlVG9GcmFnbWVudCh0ZW1wbGF0ZSlcbiAgfVxuXG4gIHJldHVybiBmcmFnICYmIGNsb25lXG4gICAgPyBleHBvcnRzLmNsb25lKGZyYWcpXG4gICAgOiBmcmFnXG59IiwidmFyIENhY2hlID0gcmVxdWlyZSgnLi4vY2FjaGUnKVxudmFyIGNvbmZpZyA9IHJlcXVpcmUoJy4uL2NvbmZpZycpXG52YXIgZGlyUGFyc2VyID0gcmVxdWlyZSgnLi9kaXJlY3RpdmUnKVxudmFyIHJlZ2V4RXNjYXBlUkUgPSAvWy0uKis/XiR7fSgpfFtcXF1cXC9cXFxcXS9nXG52YXIgY2FjaGUsIHRhZ1JFLCBodG1sUkUsIGZpcnN0Q2hhciwgbGFzdENoYXJcblxuLyoqXG4gKiBFc2NhcGUgYSBzdHJpbmcgc28gaXQgY2FuIGJlIHVzZWQgaW4gYSBSZWdFeHBcbiAqIGNvbnN0cnVjdG9yLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqL1xuXG5mdW5jdGlvbiBlc2NhcGVSZWdleCAoc3RyKSB7XG4gIHJldHVybiBzdHIucmVwbGFjZShyZWdleEVzY2FwZVJFLCAnXFxcXCQmJylcbn1cblxuLyoqXG4gKiBDb21waWxlIHRoZSBpbnRlcnBvbGF0aW9uIHRhZyByZWdleC5cbiAqXG4gKiBAcmV0dXJuIHtSZWdFeHB9XG4gKi9cblxuZnVuY3Rpb24gY29tcGlsZVJlZ2V4ICgpIHtcbiAgY29uZmlnLl9kZWxpbWl0ZXJzQ2hhbmdlZCA9IGZhbHNlXG4gIHZhciBvcGVuID0gY29uZmlnLmRlbGltaXRlcnNbMF1cbiAgdmFyIGNsb3NlID0gY29uZmlnLmRlbGltaXRlcnNbMV1cbiAgZmlyc3RDaGFyID0gb3Blbi5jaGFyQXQoMClcbiAgbGFzdENoYXIgPSBjbG9zZS5jaGFyQXQoY2xvc2UubGVuZ3RoIC0gMSlcbiAgdmFyIGZpcnN0Q2hhclJFID0gZXNjYXBlUmVnZXgoZmlyc3RDaGFyKVxuICB2YXIgbGFzdENoYXJSRSA9IGVzY2FwZVJlZ2V4KGxhc3RDaGFyKVxuICB2YXIgb3BlblJFID0gZXNjYXBlUmVnZXgob3BlbilcbiAgdmFyIGNsb3NlUkUgPSBlc2NhcGVSZWdleChjbG9zZSlcbiAgdGFnUkUgPSBuZXcgUmVnRXhwKFxuICAgIGZpcnN0Q2hhclJFICsgJz8nICsgb3BlblJFICtcbiAgICAnKC4rPyknICtcbiAgICBjbG9zZVJFICsgbGFzdENoYXJSRSArICc/JyxcbiAgICAnZydcbiAgKVxuICBodG1sUkUgPSBuZXcgUmVnRXhwKFxuICAgICdeJyArIGZpcnN0Q2hhclJFICsgb3BlblJFICtcbiAgICAnLionICtcbiAgICBjbG9zZVJFICsgbGFzdENoYXJSRSArICckJ1xuICApXG4gIC8vIHJlc2V0IGNhY2hlXG4gIGNhY2hlID0gbmV3IENhY2hlKDEwMDApXG59XG5cbi8qKlxuICogUGFyc2UgYSB0ZW1wbGF0ZSB0ZXh0IHN0cmluZyBpbnRvIGFuIGFycmF5IG9mIHRva2Vucy5cbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gdGV4dFxuICogQHJldHVybiB7QXJyYXk8T2JqZWN0PiB8IG51bGx9XG4gKiAgICAgICAgICAgICAgIC0ge1N0cmluZ30gdHlwZVxuICogICAgICAgICAgICAgICAtIHtTdHJpbmd9IHZhbHVlXG4gKiAgICAgICAgICAgICAgIC0ge0Jvb2xlYW59IFtodG1sXVxuICogICAgICAgICAgICAgICAtIHtCb29sZWFufSBbb25lVGltZV1cbiAqL1xuXG5leHBvcnRzLnBhcnNlID0gZnVuY3Rpb24gKHRleHQpIHtcbiAgaWYgKGNvbmZpZy5fZGVsaW1pdGVyc0NoYW5nZWQpIHtcbiAgICBjb21waWxlUmVnZXgoKVxuICB9XG4gIHZhciBoaXQgPSBjYWNoZS5nZXQodGV4dClcbiAgaWYgKGhpdCkge1xuICAgIHJldHVybiBoaXRcbiAgfVxuICBpZiAoIXRhZ1JFLnRlc3QodGV4dCkpIHtcbiAgICByZXR1cm4gbnVsbFxuICB9XG4gIHZhciB0b2tlbnMgPSBbXVxuICB2YXIgbGFzdEluZGV4ID0gdGFnUkUubGFzdEluZGV4ID0gMFxuICB2YXIgbWF0Y2gsIGluZGV4LCB2YWx1ZSwgZmlyc3QsIG9uZVRpbWUsIHBhcnRpYWxcbiAgLyoganNoaW50IGJvc3M6dHJ1ZSAqL1xuICB3aGlsZSAobWF0Y2ggPSB0YWdSRS5leGVjKHRleHQpKSB7XG4gICAgaW5kZXggPSBtYXRjaC5pbmRleFxuICAgIC8vIHB1c2ggdGV4dCB0b2tlblxuICAgIGlmIChpbmRleCA+IGxhc3RJbmRleCkge1xuICAgICAgdG9rZW5zLnB1c2goe1xuICAgICAgICB2YWx1ZTogdGV4dC5zbGljZShsYXN0SW5kZXgsIGluZGV4KVxuICAgICAgfSlcbiAgICB9XG4gICAgLy8gdGFnIHRva2VuXG4gICAgZmlyc3QgPSBtYXRjaFsxXS5jaGFyQ29kZUF0KDApXG4gICAgb25lVGltZSA9IGZpcnN0ID09PSAweDJBIC8vICpcbiAgICBwYXJ0aWFsID0gZmlyc3QgPT09IDB4M0UgLy8gPlxuICAgIHZhbHVlID0gKG9uZVRpbWUgfHwgcGFydGlhbClcbiAgICAgID8gbWF0Y2hbMV0uc2xpY2UoMSlcbiAgICAgIDogbWF0Y2hbMV1cbiAgICB0b2tlbnMucHVzaCh7XG4gICAgICB0YWc6IHRydWUsXG4gICAgICB2YWx1ZTogdmFsdWUudHJpbSgpLFxuICAgICAgaHRtbDogaHRtbFJFLnRlc3QobWF0Y2hbMF0pLFxuICAgICAgb25lVGltZTogb25lVGltZSxcbiAgICAgIHBhcnRpYWw6IHBhcnRpYWxcbiAgICB9KVxuICAgIGxhc3RJbmRleCA9IGluZGV4ICsgbWF0Y2hbMF0ubGVuZ3RoXG4gIH1cbiAgaWYgKGxhc3RJbmRleCA8IHRleHQubGVuZ3RoKSB7XG4gICAgdG9rZW5zLnB1c2goe1xuICAgICAgdmFsdWU6IHRleHQuc2xpY2UobGFzdEluZGV4KVxuICAgIH0pXG4gIH1cbiAgY2FjaGUucHV0KHRleHQsIHRva2VucylcbiAgcmV0dXJuIHRva2Vuc1xufVxuXG4vKipcbiAqIEZvcm1hdCBhIGxpc3Qgb2YgdG9rZW5zIGludG8gYW4gZXhwcmVzc2lvbi5cbiAqIGUuZy4gdG9rZW5zIHBhcnNlZCBmcm9tICdhIHt7Yn19IGMnIGNhbiBiZSBzZXJpYWxpemVkXG4gKiBpbnRvIG9uZSBzaW5nbGUgZXhwcmVzc2lvbiBhcyAnXCJhIFwiICsgYiArIFwiIGNcIicuXG4gKlxuICogQHBhcmFtIHtBcnJheX0gdG9rZW5zXG4gKiBAcGFyYW0ge1Z1ZX0gW3ZtXVxuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5cbmV4cG9ydHMudG9rZW5zVG9FeHAgPSBmdW5jdGlvbiAodG9rZW5zLCB2bSkge1xuICByZXR1cm4gdG9rZW5zLmxlbmd0aCA+IDFcbiAgICA/IHRva2Vucy5tYXAoZnVuY3Rpb24gKHRva2VuKSB7XG4gICAgICAgIHJldHVybiBmb3JtYXRUb2tlbih0b2tlbiwgdm0pXG4gICAgICB9KS5qb2luKCcrJylcbiAgICA6IGZvcm1hdFRva2VuKHRva2Vuc1swXSwgdm0sIHRydWUpXG59XG5cbi8qKlxuICogRm9ybWF0IGEgc2luZ2xlIHRva2VuLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSB0b2tlblxuICogQHBhcmFtIHtWdWV9IFt2bV1cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gc2luZ2xlXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cblxuZnVuY3Rpb24gZm9ybWF0VG9rZW4gKHRva2VuLCB2bSwgc2luZ2xlKSB7XG4gIHJldHVybiB0b2tlbi50YWdcbiAgICA/IHZtICYmIHRva2VuLm9uZVRpbWVcbiAgICAgID8gJ1wiJyArIHZtLiRldmFsKHRva2VuLnZhbHVlKSArICdcIidcbiAgICAgIDogc2luZ2xlXG4gICAgICAgID8gdG9rZW4udmFsdWVcbiAgICAgICAgOiBpbmxpbmVGaWx0ZXJzKHRva2VuLnZhbHVlKVxuICAgIDogJ1wiJyArIHRva2VuLnZhbHVlICsgJ1wiJ1xufVxuXG4vKipcbiAqIEZvciBhbiBhdHRyaWJ1dGUgd2l0aCBtdWx0aXBsZSBpbnRlcnBvbGF0aW9uIHRhZ3MsXG4gKiBlLmcuIGF0dHI9XCJzb21lLXt7dGhpbmcgfCBmaWx0ZXJ9fVwiLCBpbiBvcmRlciB0byBjb21iaW5lXG4gKiB0aGUgd2hvbGUgdGhpbmcgaW50byBhIHNpbmdsZSB3YXRjaGFibGUgZXhwcmVzc2lvbiwgd2VcbiAqIGhhdmUgdG8gaW5saW5lIHRob3NlIGZpbHRlcnMuIFRoaXMgZnVuY3Rpb24gZG9lcyBleGFjdGx5XG4gKiB0aGF0LiBUaGlzIGlzIGEgYml0IGhhY2t5IGJ1dCBpdCBhdm9pZHMgaGVhdnkgY2hhbmdlc1xuICogdG8gZGlyZWN0aXZlIHBhcnNlciBhbmQgd2F0Y2hlciBtZWNoYW5pc20uXG4gKlxuICogQHBhcmFtIHtTdHJpbmd9IGV4cFxuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5cbnZhciBmaWx0ZXJSRSA9IC9bXnxdXFx8W158XS9cbmZ1bmN0aW9uIGlubGluZUZpbHRlcnMgKGV4cCkge1xuICBpZiAoIWZpbHRlclJFLnRlc3QoZXhwKSkge1xuICAgIHJldHVybiAnKCcgKyBleHAgKyAnKSdcbiAgfSBlbHNlIHtcbiAgICB2YXIgZGlyID0gZGlyUGFyc2VyLnBhcnNlKGV4cClbMF1cbiAgICBpZiAoIWRpci5maWx0ZXJzKSB7XG4gICAgICByZXR1cm4gJygnICsgZXhwICsgJyknXG4gICAgfSBlbHNlIHtcbiAgICAgIGV4cCA9IGRpci5leHByZXNzaW9uXG4gICAgICBmb3IgKHZhciBpID0gMCwgbCA9IGRpci5maWx0ZXJzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgICB2YXIgZmlsdGVyID0gZGlyLmZpbHRlcnNbaV1cbiAgICAgICAgdmFyIGFyZ3MgPSBmaWx0ZXIuYXJnc1xuICAgICAgICAgID8gJyxcIicgKyBmaWx0ZXIuYXJncy5qb2luKCdcIixcIicpICsgJ1wiJ1xuICAgICAgICAgIDogJydcbiAgICAgICAgZmlsdGVyID0gJ3RoaXMuJG9wdGlvbnMuZmlsdGVyc1tcIicgKyBmaWx0ZXIubmFtZSArICdcIl0nXG4gICAgICAgIGV4cCA9ICcoJyArIGZpbHRlciArICcucmVhZHx8JyArIGZpbHRlciArICcpJyArXG4gICAgICAgICAgJy5hcHBseSh0aGlzLFsnICsgZXhwICsgYXJncyArICddKSdcbiAgICAgIH1cbiAgICAgIHJldHVybiBleHBcbiAgICB9XG4gIH1cbn0iLCJ2YXIgXyA9IHJlcXVpcmUoJy4uL3V0aWwnKVxudmFyIGFkZENsYXNzID0gXy5hZGRDbGFzc1xudmFyIHJlbW92ZUNsYXNzID0gXy5yZW1vdmVDbGFzc1xudmFyIHRyYW5zRHVyYXRpb25Qcm9wID0gXy50cmFuc2l0aW9uUHJvcCArICdEdXJhdGlvbidcbnZhciBhbmltRHVyYXRpb25Qcm9wID0gXy5hbmltYXRpb25Qcm9wICsgJ0R1cmF0aW9uJ1xuXG52YXIgcXVldWUgPSBbXVxudmFyIHF1ZXVlZCA9IGZhbHNlXG5cbi8qKlxuICogUHVzaCBhIGpvYiBpbnRvIHRoZSB0cmFuc2l0aW9uIHF1ZXVlLCB3aGljaCBpcyB0byBiZVxuICogZXhlY3V0ZWQgb24gbmV4dCBmcmFtZS5cbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsICAgIC0gdGFyZ2V0IGVsZW1lbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSBkaXIgICAgLSAxOiBlbnRlciwgLTE6IGxlYXZlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBvcCAgIC0gdGhlIGFjdHVhbCBkb20gb3BlcmF0aW9uXG4gKiBAcGFyYW0ge1N0cmluZ30gY2xzICAgIC0gdGhlIGNsYXNzTmFtZSB0byByZW1vdmUgd2hlbiB0aGVcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2l0aW9uIGlzIGRvbmUuXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY2JdIC0gdXNlciBzdXBwbGllZCBjYWxsYmFjay5cbiAqL1xuXG5mdW5jdGlvbiBwdXNoIChlbCwgZGlyLCBvcCwgY2xzLCBjYikge1xuICBxdWV1ZS5wdXNoKHtcbiAgICBlbCAgOiBlbCxcbiAgICBkaXIgOiBkaXIsXG4gICAgY2IgIDogY2IsXG4gICAgY2xzIDogY2xzLFxuICAgIG9wICA6IG9wXG4gIH0pXG4gIGlmICghcXVldWVkKSB7XG4gICAgcXVldWVkID0gdHJ1ZVxuICAgIF8ubmV4dFRpY2soZmx1c2gpXG4gIH1cbn1cblxuLyoqXG4gKiBGbHVzaCB0aGUgcXVldWUsIGFuZCBkbyBvbmUgZm9yY2VkIHJlZmxvdyBiZWZvcmVcbiAqIHRyaWdnZXJpbmcgdHJhbnNpdGlvbnMuXG4gKi9cblxuZnVuY3Rpb24gZmx1c2ggKCkge1xuICAvKiBqc2hpbnQgdW51c2VkOiBmYWxzZSAqL1xuICB2YXIgZiA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5vZmZzZXRIZWlnaHRcbiAgcXVldWUuZm9yRWFjaChydW4pXG4gIHF1ZXVlID0gW11cbiAgcXVldWVkID0gZmFsc2Vcbn1cblxuLyoqXG4gKiBSdW4gYSB0cmFuc2l0aW9uIGpvYi5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gam9iXG4gKi9cblxuZnVuY3Rpb24gcnVuIChqb2IpIHtcblxuICB2YXIgZWwgPSBqb2IuZWxcbiAgdmFyIGRhdGEgPSBlbC5fX3ZfdHJhbnNcbiAgdmFyIGNscyA9IGpvYi5jbHNcbiAgdmFyIGNiID0gam9iLmNiXG4gIHZhciBvcCA9IGpvYi5vcFxuICB2YXIgdHJhbnNpdGlvblR5cGUgPSBnZXRUcmFuc2l0aW9uVHlwZShlbCwgZGF0YSwgY2xzKVxuXG4gIGlmIChqb2IuZGlyID4gMCkgeyAvLyBFTlRFUlxuICAgIGlmICh0cmFuc2l0aW9uVHlwZSA9PT0gMSkge1xuICAgICAgLy8gdHJpZ2dlciB0cmFuc2l0aW9uIGJ5IHJlbW92aW5nIGVudGVyIGNsYXNzXG4gICAgICByZW1vdmVDbGFzcyhlbCwgY2xzKVxuICAgICAgLy8gb25seSBuZWVkIHRvIGxpc3RlbiBmb3IgdHJhbnNpdGlvbmVuZCBpZiB0aGVyZSdzXG4gICAgICAvLyBhIHVzZXIgY2FsbGJhY2tcbiAgICAgIGlmIChjYikgc2V0dXBUcmFuc2l0aW9uQ2IoXy50cmFuc2l0aW9uRW5kRXZlbnQpXG4gICAgfSBlbHNlIGlmICh0cmFuc2l0aW9uVHlwZSA9PT0gMikge1xuICAgICAgLy8gYW5pbWF0aW9ucyBhcmUgdHJpZ2dlcmVkIHdoZW4gY2xhc3MgaXMgYWRkZWRcbiAgICAgIC8vIHNvIHdlIGp1c3QgbGlzdGVuIGZvciBhbmltYXRpb25lbmQgdG8gcmVtb3ZlIGl0LlxuICAgICAgc2V0dXBUcmFuc2l0aW9uQ2IoXy5hbmltYXRpb25FbmRFdmVudCwgZnVuY3Rpb24gKCkge1xuICAgICAgICByZW1vdmVDbGFzcyhlbCwgY2xzKVxuICAgICAgfSlcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gbm8gdHJhbnNpdGlvbiBhcHBsaWNhYmxlXG4gICAgICByZW1vdmVDbGFzcyhlbCwgY2xzKVxuICAgICAgaWYgKGNiKSBjYigpXG4gICAgfVxuICB9IGVsc2UgeyAvLyBMRUFWRVxuICAgIGlmICh0cmFuc2l0aW9uVHlwZSkge1xuICAgICAgLy8gbGVhdmUgdHJhbnNpdGlvbnMvYW5pbWF0aW9ucyBhcmUgYm90aCB0cmlnZ2VyZWRcbiAgICAgIC8vIGJ5IGFkZGluZyB0aGUgY2xhc3MsIGp1c3QgcmVtb3ZlIGl0IG9uIGVuZCBldmVudC5cbiAgICAgIHZhciBldmVudCA9IHRyYW5zaXRpb25UeXBlID09PSAxXG4gICAgICAgID8gXy50cmFuc2l0aW9uRW5kRXZlbnRcbiAgICAgICAgOiBfLmFuaW1hdGlvbkVuZEV2ZW50XG4gICAgICBzZXR1cFRyYW5zaXRpb25DYihldmVudCwgZnVuY3Rpb24gKCkge1xuICAgICAgICBvcCgpXG4gICAgICAgIHJlbW92ZUNsYXNzKGVsLCBjbHMpXG4gICAgICB9KVxuICAgIH0gZWxzZSB7XG4gICAgICBvcCgpXG4gICAgICByZW1vdmVDbGFzcyhlbCwgY2xzKVxuICAgICAgaWYgKGNiKSBjYigpXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFNldCB1cCBhIHRyYW5zaXRpb24gZW5kIGNhbGxiYWNrLCBzdG9yZSB0aGUgY2FsbGJhY2tcbiAgICogb24gdGhlIGVsZW1lbnQncyBfX3ZfdHJhbnMgZGF0YSBvYmplY3QsIHNvIHdlIGNhblxuICAgKiBjbGVhbiBpdCB1cCBpZiBhbm90aGVyIHRyYW5zaXRpb24gaXMgdHJpZ2dlcmVkIGJlZm9yZVxuICAgKiB0aGUgY2FsbGJhY2sgaXMgZmlyZWQuXG4gICAqXG4gICAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY2xlYW51cEZuXVxuICAgKi9cblxuICBmdW5jdGlvbiBzZXR1cFRyYW5zaXRpb25DYiAoZXZlbnQsIGNsZWFudXBGbikge1xuICAgIGRhdGEuZXZlbnQgPSBldmVudFxuICAgIHZhciBvbkVuZCA9IGRhdGEuY2FsbGJhY2sgPSBmdW5jdGlvbiB0cmFuc2l0aW9uQ2IgKGUpIHtcbiAgICAgIGlmIChlLnRhcmdldCA9PT0gZWwpIHtcbiAgICAgICAgXy5vZmYoZWwsIGV2ZW50LCBvbkVuZClcbiAgICAgICAgZGF0YS5ldmVudCA9IGRhdGEuY2FsbGJhY2sgPSBudWxsXG4gICAgICAgIGlmIChjbGVhbnVwRm4pIGNsZWFudXBGbigpXG4gICAgICAgIGlmIChjYikgY2IoKVxuICAgICAgfVxuICAgIH1cbiAgICBfLm9uKGVsLCBldmVudCwgb25FbmQpXG4gIH1cbn1cblxuLyoqXG4gKiBHZXQgYW4gZWxlbWVudCdzIHRyYW5zaXRpb24gdHlwZSBiYXNlZCBvbiB0aGVcbiAqIGNhbGN1bGF0ZWQgc3R5bGVzXG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBlbFxuICogQHBhcmFtIHtPYmplY3R9IGRhdGFcbiAqIEBwYXJhbSB7U3RyaW5nfSBjbGFzc05hbWVcbiAqIEByZXR1cm4ge051bWJlcn1cbiAqICAgICAgICAgMSAtIHRyYW5zaXRpb25cbiAqICAgICAgICAgMiAtIGFuaW1hdGlvblxuICovXG5cbmZ1bmN0aW9uIGdldFRyYW5zaXRpb25UeXBlIChlbCwgZGF0YSwgY2xhc3NOYW1lKSB7XG4gIHZhciB0eXBlID0gZGF0YS5jYWNoZSAmJiBkYXRhLmNhY2hlW2NsYXNzTmFtZV1cbiAgaWYgKHR5cGUpIHJldHVybiB0eXBlXG4gIHZhciBpbmxpbmVTdHlsZXMgPSBlbC5zdHlsZVxuICB2YXIgY29tcHV0ZWRTdHlsZXMgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZShlbClcbiAgdmFyIHRyYW5zRHVyYXRpb24gPVxuICAgIGlubGluZVN0eWxlc1t0cmFuc0R1cmF0aW9uUHJvcF0gfHxcbiAgICBjb21wdXRlZFN0eWxlc1t0cmFuc0R1cmF0aW9uUHJvcF1cbiAgaWYgKHRyYW5zRHVyYXRpb24gJiYgdHJhbnNEdXJhdGlvbiAhPT0gJzBzJykge1xuICAgIHR5cGUgPSAxXG4gIH0gZWxzZSB7XG4gICAgdmFyIGFuaW1EdXJhdGlvbiA9XG4gICAgICBpbmxpbmVTdHlsZXNbYW5pbUR1cmF0aW9uUHJvcF0gfHxcbiAgICAgIGNvbXB1dGVkU3R5bGVzW2FuaW1EdXJhdGlvblByb3BdXG4gICAgaWYgKGFuaW1EdXJhdGlvbiAmJiBhbmltRHVyYXRpb24gIT09ICcwcycpIHtcbiAgICAgIHR5cGUgPSAyXG4gICAgfVxuICB9XG4gIGlmICh0eXBlKSB7XG4gICAgaWYgKCFkYXRhLmNhY2hlKSBkYXRhLmNhY2hlID0ge31cbiAgICBkYXRhLmNhY2hlW2NsYXNzTmFtZV0gPSB0eXBlXG4gIH1cbiAgcmV0dXJuIHR5cGVcbn1cblxuLyoqXG4gKiBBcHBseSBDU1MgdHJhbnNpdGlvbiB0byBhbiBlbGVtZW50LlxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxcbiAqIEBwYXJhbSB7TnVtYmVyfSBkaXJlY3Rpb24gLSAxOiBlbnRlciwgLTE6IGxlYXZlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBvcCAtIHRoZSBhY3R1YWwgRE9NIG9wZXJhdGlvblxuICogQHBhcmFtIHtPYmplY3R9IGRhdGEgLSB0YXJnZXQgZWxlbWVudCdzIHRyYW5zaXRpb24gZGF0YVxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGVsLCBkaXJlY3Rpb24sIG9wLCBkYXRhLCBjYikge1xuICB2YXIgcHJlZml4ID0gZGF0YS5pZCB8fCAndidcbiAgdmFyIGVudGVyQ2xhc3MgPSBwcmVmaXggKyAnLWVudGVyJ1xuICB2YXIgbGVhdmVDbGFzcyA9IHByZWZpeCArICctbGVhdmUnXG4gIC8vIGNsZWFuIHVwIHBvdGVudGlhbCBwcmV2aW91cyB1bmZpbmlzaGVkIHRyYW5zaXRpb25cbiAgaWYgKGRhdGEuY2FsbGJhY2spIHtcbiAgICBfLm9mZihlbCwgZGF0YS5ldmVudCwgZGF0YS5jYWxsYmFjaylcbiAgICByZW1vdmVDbGFzcyhlbCwgZW50ZXJDbGFzcylcbiAgICByZW1vdmVDbGFzcyhlbCwgbGVhdmVDbGFzcylcbiAgICBkYXRhLmV2ZW50ID0gZGF0YS5jYWxsYmFjayA9IG51bGxcbiAgfVxuICBpZiAoZGlyZWN0aW9uID4gMCkgeyAvLyBlbnRlclxuICAgIGFkZENsYXNzKGVsLCBlbnRlckNsYXNzKVxuICAgIG9wKClcbiAgICBwdXNoKGVsLCBkaXJlY3Rpb24sIG51bGwsIGVudGVyQ2xhc3MsIGNiKVxuICB9IGVsc2UgeyAvLyBsZWF2ZVxuICAgIGFkZENsYXNzKGVsLCBsZWF2ZUNsYXNzKVxuICAgIHB1c2goZWwsIGRpcmVjdGlvbiwgb3AsIGxlYXZlQ2xhc3MsIGNiKVxuICB9XG59IiwidmFyIF8gPSByZXF1aXJlKCcuLi91dGlsJylcbnZhciBhcHBseUNTU1RyYW5zaXRpb24gPSByZXF1aXJlKCcuL2NzcycpXG52YXIgYXBwbHlKU1RyYW5zaXRpb24gPSByZXF1aXJlKCcuL2pzJylcbnZhciBkb2MgPSB0eXBlb2YgZG9jdW1lbnQgPT09ICd1bmRlZmluZWQnID8gbnVsbCA6IGRvY3VtZW50XG5cbi8qKlxuICogQXBwZW5kIHdpdGggdHJhbnNpdGlvbi5cbiAqXG4gKiBAb2FyYW0ge0VsZW1lbnR9IGVsXG4gKiBAcGFyYW0ge0VsZW1lbnR9IHRhcmdldFxuICogQHBhcmFtIHtWdWV9IHZtXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY2JdXG4gKi9cblxuZXhwb3J0cy5hcHBlbmQgPSBmdW5jdGlvbiAoZWwsIHRhcmdldCwgdm0sIGNiKSB7XG4gIGFwcGx5KGVsLCAxLCBmdW5jdGlvbiAoKSB7XG4gICAgdGFyZ2V0LmFwcGVuZENoaWxkKGVsKVxuICB9LCB2bSwgY2IpXG59XG5cbi8qKlxuICogSW5zZXJ0QmVmb3JlIHdpdGggdHJhbnNpdGlvbi5cbiAqXG4gKiBAb2FyYW0ge0VsZW1lbnR9IGVsXG4gKiBAcGFyYW0ge0VsZW1lbnR9IHRhcmdldFxuICogQHBhcmFtIHtWdWV9IHZtXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY2JdXG4gKi9cblxuZXhwb3J0cy5iZWZvcmUgPSBmdW5jdGlvbiAoZWwsIHRhcmdldCwgdm0sIGNiKSB7XG4gIGFwcGx5KGVsLCAxLCBmdW5jdGlvbiAoKSB7XG4gICAgXy5iZWZvcmUoZWwsIHRhcmdldClcbiAgfSwgdm0sIGNiKVxufVxuXG4vKipcbiAqIFJlbW92ZSB3aXRoIHRyYW5zaXRpb24uXG4gKlxuICogQG9hcmFtIHtFbGVtZW50fSBlbFxuICogQHBhcmFtIHtWdWV9IHZtXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY2JdXG4gKi9cblxuZXhwb3J0cy5yZW1vdmUgPSBmdW5jdGlvbiAoZWwsIHZtLCBjYikge1xuICBhcHBseShlbCwgLTEsIGZ1bmN0aW9uICgpIHtcbiAgICBfLnJlbW92ZShlbClcbiAgfSwgdm0sIGNiKVxufVxuXG4vKipcbiAqIFJlbW92ZSBieSBhcHBlbmRpbmcgdG8gYW5vdGhlciBwYXJlbnQgd2l0aCB0cmFuc2l0aW9uLlxuICogVGhpcyBpcyBvbmx5IHVzZWQgaW4gYmxvY2sgb3BlcmF0aW9ucy5cbiAqXG4gKiBAb2FyYW0ge0VsZW1lbnR9IGVsXG4gKiBAcGFyYW0ge0VsZW1lbnR9IHRhcmdldFxuICogQHBhcmFtIHtWdWV9IHZtXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBbY2JdXG4gKi9cblxuZXhwb3J0cy5yZW1vdmVUaGVuQXBwZW5kID0gZnVuY3Rpb24gKGVsLCB0YXJnZXQsIHZtLCBjYikge1xuICBhcHBseShlbCwgLTEsIGZ1bmN0aW9uICgpIHtcbiAgICB0YXJnZXQuYXBwZW5kQ2hpbGQoZWwpXG4gIH0sIHZtLCBjYilcbn1cblxuLyoqXG4gKiBBcHBlbmQgdGhlIGNoaWxkTm9kZXMgb2YgYSBmcmFnbWVudCB0byB0YXJnZXQuXG4gKlxuICogQHBhcmFtIHtEb2N1bWVudEZyYWdtZW50fSBibG9ja1xuICogQHBhcmFtIHtOb2RlfSB0YXJnZXRcbiAqIEBwYXJhbSB7VnVlfSB2bVxuICovXG5cbmV4cG9ydHMuYmxvY2tBcHBlbmQgPSBmdW5jdGlvbiAoYmxvY2ssIHRhcmdldCwgdm0pIHtcbiAgdmFyIG5vZGVzID0gXy50b0FycmF5KGJsb2NrLmNoaWxkTm9kZXMpXG4gIGZvciAodmFyIGkgPSAwLCBsID0gbm9kZXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgZXhwb3J0cy5iZWZvcmUobm9kZXNbaV0sIHRhcmdldCwgdm0pXG4gIH1cbn1cblxuLyoqXG4gKiBSZW1vdmUgYSBibG9jayBvZiBub2RlcyBiZXR3ZWVuIHR3byBlZGdlIG5vZGVzLlxuICpcbiAqIEBwYXJhbSB7Tm9kZX0gc3RhcnRcbiAqIEBwYXJhbSB7Tm9kZX0gZW5kXG4gKiBAcGFyYW0ge1Z1ZX0gdm1cbiAqL1xuXG5leHBvcnRzLmJsb2NrUmVtb3ZlID0gZnVuY3Rpb24gKHN0YXJ0LCBlbmQsIHZtKSB7XG4gIHZhciBub2RlID0gc3RhcnQubmV4dFNpYmxpbmdcbiAgdmFyIG5leHRcbiAgd2hpbGUgKG5vZGUgIT09IGVuZCkge1xuICAgIG5leHQgPSBub2RlLm5leHRTaWJsaW5nXG4gICAgZXhwb3J0cy5yZW1vdmUobm9kZSwgdm0pXG4gICAgbm9kZSA9IG5leHRcbiAgfVxufVxuXG4vKipcbiAqIEFwcGx5IHRyYW5zaXRpb25zIHdpdGggYW4gb3BlcmF0aW9uIGNhbGxiYWNrLlxuICpcbiAqIEBvYXJhbSB7RWxlbWVudH0gZWxcbiAqIEBwYXJhbSB7TnVtYmVyfSBkaXJlY3Rpb25cbiAqICAgICAgICAgICAgICAgICAgMTogZW50ZXJcbiAqICAgICAgICAgICAgICAgICAtMTogbGVhdmVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IG9wIC0gdGhlIGFjdHVhbCBET00gb3BlcmF0aW9uXG4gKiBAcGFyYW0ge1Z1ZX0gdm1cbiAqIEBwYXJhbSB7RnVuY3Rpb259IFtjYl1cbiAqL1xuXG52YXIgYXBwbHkgPSBleHBvcnRzLmFwcGx5ID0gZnVuY3Rpb24gKGVsLCBkaXJlY3Rpb24sIG9wLCB2bSwgY2IpIHtcbiAgdmFyIHRyYW5zRGF0YSA9IGVsLl9fdl90cmFuc1xuICBpZiAoXG4gICAgIXRyYW5zRGF0YSB8fFxuICAgICF2bS5faXNDb21waWxlZCB8fFxuICAgIC8vIGlmIHRoZSB2bSBpcyBiZWluZyBtYW5pcHVsYXRlZCBieSBhIHBhcmVudCBkaXJlY3RpdmVcbiAgICAvLyBkdXJpbmcgdGhlIHBhcmVudCdzIGNvbXBpbGF0aW9uIHBoYXNlLCBza2lwIHRoZVxuICAgIC8vIGFuaW1hdGlvbi5cbiAgICAodm0uJHBhcmVudCAmJiAhdm0uJHBhcmVudC5faXNDb21waWxlZClcbiAgKSB7XG4gICAgb3AoKVxuICAgIGlmIChjYikgY2IoKVxuICAgIHJldHVyblxuICB9XG4gIC8vIGRldGVybWluZSB0aGUgdHJhbnNpdGlvbiB0eXBlIG9uIHRoZSBlbGVtZW50XG4gIHZhciBqc1RyYW5zaXRpb24gPSB0cmFuc0RhdGEuZm5zXG4gIGlmIChqc1RyYW5zaXRpb24pIHtcbiAgICAvLyBqc1xuICAgIGFwcGx5SlNUcmFuc2l0aW9uKFxuICAgICAgZWwsXG4gICAgICBkaXJlY3Rpb24sXG4gICAgICBvcCxcbiAgICAgIHRyYW5zRGF0YSxcbiAgICAgIGpzVHJhbnNpdGlvbixcbiAgICAgIHZtLFxuICAgICAgY2JcbiAgICApXG4gIH0gZWxzZSBpZiAoXG4gICAgXy50cmFuc2l0aW9uRW5kRXZlbnQgJiZcbiAgICAvLyBza2lwIENTUyB0cmFuc2l0aW9ucyBpZiBwYWdlIGlzIG5vdCB2aXNpYmxlIC1cbiAgICAvLyB0aGlzIHNvbHZlcyB0aGUgaXNzdWUgb2YgdHJhbnNpdGlvbmVuZCBldmVudHMgbm90XG4gICAgLy8gZmlyaW5nIHVudGlsIHRoZSBwYWdlIGlzIHZpc2libGUgYWdhaW4uXG4gICAgLy8gcGFnZVZpc2liaWxpdHkgQVBJIGlzIHN1cHBvcnRlZCBpbiBJRTEwKywgc2FtZSBhc1xuICAgIC8vIENTUyB0cmFuc2l0aW9ucy5cbiAgICAhKGRvYyAmJiBkb2MuaGlkZGVuKVxuICApIHtcbiAgICAvLyBjc3NcbiAgICBhcHBseUNTU1RyYW5zaXRpb24oXG4gICAgICBlbCxcbiAgICAgIGRpcmVjdGlvbixcbiAgICAgIG9wLFxuICAgICAgdHJhbnNEYXRhLFxuICAgICAgY2JcbiAgICApXG4gIH0gZWxzZSB7XG4gICAgLy8gbm90IGFwcGxpY2FibGVcbiAgICBvcCgpXG4gICAgaWYgKGNiKSBjYigpXG4gIH1cbn0iLCIvKipcbiAqIEFwcGx5IEphdmFTY3JpcHQgZW50ZXIvbGVhdmUgZnVuY3Rpb25zLlxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxcbiAqIEBwYXJhbSB7TnVtYmVyfSBkaXJlY3Rpb24gLSAxOiBlbnRlciwgLTE6IGxlYXZlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBvcCAtIHRoZSBhY3R1YWwgRE9NIG9wZXJhdGlvblxuICogQHBhcmFtIHtPYmplY3R9IGRhdGEgLSB0YXJnZXQgZWxlbWVudCdzIHRyYW5zaXRpb24gZGF0YVxuICogQHBhcmFtIHtPYmplY3R9IGRlZiAtIHRyYW5zaXRpb24gZGVmaW5pdGlvbiBvYmplY3RcbiAqIEBwYXJhbSB7VnVlfSB2bSAtIHRoZSBvd25lciB2bSBvZiB0aGUgZWxlbWVudFxuICogQHBhcmFtIHtGdW5jdGlvbn0gW2NiXVxuICovXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGVsLCBkaXJlY3Rpb24sIG9wLCBkYXRhLCBkZWYsIHZtLCBjYikge1xuICAvLyBpZiB0aGUgZWxlbWVudCBpcyB0aGUgcm9vdCBvZiBhbiBpbnN0YW5jZSxcbiAgLy8gdXNlIHRoYXQgaW5zdGFuY2UgYXMgdGhlIHRyYW5zaXRpb24gZnVuY3Rpb24gY29udGV4dFxuICB2bSA9IGVsLl9fdnVlX18gfHwgdm1cbiAgaWYgKGRhdGEuY2FuY2VsKSB7XG4gICAgZGF0YS5jYW5jZWwoKVxuICAgIGRhdGEuY2FuY2VsID0gbnVsbFxuICB9XG4gIGlmIChkaXJlY3Rpb24gPiAwKSB7IC8vIGVudGVyXG4gICAgaWYgKGRlZi5iZWZvcmVFbnRlcikge1xuICAgICAgZGVmLmJlZm9yZUVudGVyLmNhbGwodm0sIGVsKVxuICAgIH1cbiAgICBvcCgpXG4gICAgaWYgKGRlZi5lbnRlcikge1xuICAgICAgZGF0YS5jYW5jZWwgPSBkZWYuZW50ZXIuY2FsbCh2bSwgZWwsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgZGF0YS5jYW5jZWwgPSBudWxsXG4gICAgICAgIGlmIChjYikgY2IoKVxuICAgICAgfSlcbiAgICB9IGVsc2UgaWYgKGNiKSB7XG4gICAgICBjYigpXG4gICAgfVxuICB9IGVsc2UgeyAvLyBsZWF2ZVxuICAgIGlmIChkZWYubGVhdmUpIHtcbiAgICAgIGRhdGEuY2FuY2VsID0gZGVmLmxlYXZlLmNhbGwodm0sIGVsLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGRhdGEuY2FuY2VsID0gbnVsbFxuICAgICAgICBvcCgpXG4gICAgICAgIGlmIChjYikgY2IoKVxuICAgICAgfSlcbiAgICB9IGVsc2Uge1xuICAgICAgb3AoKVxuICAgICAgaWYgKGNiKSBjYigpXG4gICAgfVxuICB9XG59IiwidmFyIGNvbmZpZyA9IHJlcXVpcmUoJy4uL2NvbmZpZycpXG5cbi8qKlxuICogRW5hYmxlIGRlYnVnIHV0aWxpdGllcy4gVGhlIGVuYWJsZURlYnVnKCkgZnVuY3Rpb24gYW5kXG4gKiBhbGwgXy5sb2coKSAmIF8ud2FybigpIGNhbGxzIHdpbGwgYmUgZHJvcHBlZCBpbiB0aGVcbiAqIG1pbmlmaWVkIHByb2R1Y3Rpb24gYnVpbGQuXG4gKi9cblxuZW5hYmxlRGVidWcoKVxuXG5mdW5jdGlvbiBlbmFibGVEZWJ1ZyAoKSB7XG5cbiAgdmFyIGhhc0NvbnNvbGUgPSB0eXBlb2YgY29uc29sZSAhPT0gJ3VuZGVmaW5lZCdcbiAgXG4gIC8qKlxuICAgKiBMb2cgYSBtZXNzYWdlLlxuICAgKlxuICAgKiBAcGFyYW0ge1N0cmluZ30gbXNnXG4gICAqL1xuXG4gIGV4cG9ydHMubG9nID0gZnVuY3Rpb24gKG1zZykge1xuICAgIGlmIChoYXNDb25zb2xlICYmIGNvbmZpZy5kZWJ1Zykge1xuICAgICAgY29uc29sZS5sb2coJ1tWdWUgaW5mb106ICcgKyBtc2cpXG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFdlJ3ZlIGdvdCBhIHByb2JsZW0gaGVyZS5cbiAgICpcbiAgICogQHBhcmFtIHtTdHJpbmd9IG1zZ1xuICAgKi9cblxuICBleHBvcnRzLndhcm4gPSBmdW5jdGlvbiAobXNnKSB7XG4gICAgaWYgKGhhc0NvbnNvbGUgJiYgKCFjb25maWcuc2lsZW50IHx8IGNvbmZpZy5kZWJ1ZykpIHtcbiAgICAgIGNvbnNvbGUud2FybignW1Z1ZSB3YXJuXTogJyArIG1zZylcbiAgICAgIC8qIGlzdGFuYnVsIGlnbm9yZSBpZiAqL1xuICAgICAgaWYgKGNvbmZpZy5kZWJ1Zykge1xuICAgICAgICAvKiBqc2hpbnQgZGVidWc6IHRydWUgKi9cbiAgICAgICAgZGVidWdnZXJcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQXNzZXJ0IGFzc2V0IGV4aXN0c1xuICAgKi9cblxuICBleHBvcnRzLmFzc2VydEFzc2V0ID0gZnVuY3Rpb24gKHZhbCwgdHlwZSwgaWQpIHtcbiAgICBpZiAoIXZhbCkge1xuICAgICAgZXhwb3J0cy53YXJuKCdGYWlsZWQgdG8gcmVzb2x2ZSAnICsgdHlwZSArICc6ICcgKyBpZClcbiAgICB9XG4gIH1cbn0iLCJ2YXIgY29uZmlnID0gcmVxdWlyZSgnLi4vY29uZmlnJylcblxuLyoqXG4gKiBDaGVjayBpZiBhIG5vZGUgaXMgaW4gdGhlIGRvY3VtZW50LlxuICogTm90ZTogZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNvbnRhaW5zIHNob3VsZCB3b3JrIGhlcmVcbiAqIGJ1dCBhbHdheXMgcmV0dXJucyBmYWxzZSBmb3IgY29tbWVudCBub2RlcyBpbiBwaGFudG9tanMsXG4gKiBtYWtpbmcgdW5pdCB0ZXN0cyBkaWZmaWN1bHQuIFRoaXMgaXMgZml4ZWQgYnl5IGRvaW5nIHRoZVxuICogY29udGFpbnMoKSBjaGVjayBvbiB0aGUgbm9kZSdzIHBhcmVudE5vZGUgaW5zdGVhZCBvZlxuICogdGhlIG5vZGUgaXRzZWxmLlxuICpcbiAqIEBwYXJhbSB7Tm9kZX0gbm9kZVxuICogQHJldHVybiB7Qm9vbGVhbn1cbiAqL1xuXG52YXIgZG9jID1cbiAgdHlwZW9mIGRvY3VtZW50ICE9PSAndW5kZWZpbmVkJyAmJlxuICBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnRcblxuZXhwb3J0cy5pbkRvYyA9IGZ1bmN0aW9uIChub2RlKSB7XG4gIHZhciBwYXJlbnQgPSBub2RlICYmIG5vZGUucGFyZW50Tm9kZVxuICByZXR1cm4gZG9jID09PSBub2RlIHx8XG4gICAgZG9jID09PSBwYXJlbnQgfHxcbiAgICAhIShwYXJlbnQgJiYgcGFyZW50Lm5vZGVUeXBlID09PSAxICYmIChkb2MuY29udGFpbnMocGFyZW50KSkpXG59XG5cbi8qKlxuICogRXh0cmFjdCBhbiBhdHRyaWJ1dGUgZnJvbSBhIG5vZGUuXG4gKlxuICogQHBhcmFtIHtOb2RlfSBub2RlXG4gKiBAcGFyYW0ge1N0cmluZ30gYXR0clxuICovXG5cbmV4cG9ydHMuYXR0ciA9IGZ1bmN0aW9uIChub2RlLCBhdHRyKSB7XG4gIGF0dHIgPSBjb25maWcucHJlZml4ICsgYXR0clxuICB2YXIgdmFsID0gbm9kZS5nZXRBdHRyaWJ1dGUoYXR0cilcbiAgaWYgKHZhbCAhPT0gbnVsbCkge1xuICAgIG5vZGUucmVtb3ZlQXR0cmlidXRlKGF0dHIpXG4gIH1cbiAgcmV0dXJuIHZhbFxufVxuXG4vKipcbiAqIEluc2VydCBlbCBiZWZvcmUgdGFyZ2V0XG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBlbFxuICogQHBhcmFtIHtFbGVtZW50fSB0YXJnZXRcbiAqL1xuXG5leHBvcnRzLmJlZm9yZSA9IGZ1bmN0aW9uIChlbCwgdGFyZ2V0KSB7XG4gIHRhcmdldC5wYXJlbnROb2RlLmluc2VydEJlZm9yZShlbCwgdGFyZ2V0KVxufVxuXG4vKipcbiAqIEluc2VydCBlbCBhZnRlciB0YXJnZXRcbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsXG4gKiBAcGFyYW0ge0VsZW1lbnR9IHRhcmdldFxuICovXG5cbmV4cG9ydHMuYWZ0ZXIgPSBmdW5jdGlvbiAoZWwsIHRhcmdldCkge1xuICBpZiAodGFyZ2V0Lm5leHRTaWJsaW5nKSB7XG4gICAgZXhwb3J0cy5iZWZvcmUoZWwsIHRhcmdldC5uZXh0U2libGluZylcbiAgfSBlbHNlIHtcbiAgICB0YXJnZXQucGFyZW50Tm9kZS5hcHBlbmRDaGlsZChlbClcbiAgfVxufVxuXG4vKipcbiAqIFJlbW92ZSBlbCBmcm9tIERPTVxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxcbiAqL1xuXG5leHBvcnRzLnJlbW92ZSA9IGZ1bmN0aW9uIChlbCkge1xuICBlbC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGVsKVxufVxuXG4vKipcbiAqIFByZXBlbmQgZWwgdG8gdGFyZ2V0XG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBlbFxuICogQHBhcmFtIHtFbGVtZW50fSB0YXJnZXRcbiAqL1xuXG5leHBvcnRzLnByZXBlbmQgPSBmdW5jdGlvbiAoZWwsIHRhcmdldCkge1xuICBpZiAodGFyZ2V0LmZpcnN0Q2hpbGQpIHtcbiAgICBleHBvcnRzLmJlZm9yZShlbCwgdGFyZ2V0LmZpcnN0Q2hpbGQpXG4gIH0gZWxzZSB7XG4gICAgdGFyZ2V0LmFwcGVuZENoaWxkKGVsKVxuICB9XG59XG5cbi8qKlxuICogUmVwbGFjZSB0YXJnZXQgd2l0aCBlbFxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gdGFyZ2V0XG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsXG4gKi9cblxuZXhwb3J0cy5yZXBsYWNlID0gZnVuY3Rpb24gKHRhcmdldCwgZWwpIHtcbiAgdmFyIHBhcmVudCA9IHRhcmdldC5wYXJlbnROb2RlXG4gIGlmIChwYXJlbnQpIHtcbiAgICBwYXJlbnQucmVwbGFjZUNoaWxkKGVsLCB0YXJnZXQpXG4gIH1cbn1cblxuLyoqXG4gKiBDb3B5IGF0dHJpYnV0ZXMgZnJvbSBvbmUgZWxlbWVudCB0byBhbm90aGVyLlxuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZnJvbVxuICogQHBhcmFtIHtFbGVtZW50fSB0b1xuICovXG5cbmV4cG9ydHMuY29weUF0dHJpYnV0ZXMgPSBmdW5jdGlvbiAoZnJvbSwgdG8pIHtcbiAgaWYgKGZyb20uaGFzQXR0cmlidXRlcygpKSB7XG4gICAgdmFyIGF0dHJzID0gZnJvbS5hdHRyaWJ1dGVzXG4gICAgZm9yICh2YXIgaSA9IDAsIGwgPSBhdHRycy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgIHZhciBhdHRyID0gYXR0cnNbaV1cbiAgICAgIHRvLnNldEF0dHJpYnV0ZShhdHRyLm5hbWUsIGF0dHIudmFsdWUpXG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogQWRkIGV2ZW50IGxpc3RlbmVyIHNob3J0aGFuZC5cbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNiXG4gKi9cblxuZXhwb3J0cy5vbiA9IGZ1bmN0aW9uIChlbCwgZXZlbnQsIGNiKSB7XG4gIGVsLmFkZEV2ZW50TGlzdGVuZXIoZXZlbnQsIGNiKVxufVxuXG4vKipcbiAqIFJlbW92ZSBldmVudCBsaXN0ZW5lciBzaG9ydGhhbmQuXG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBlbFxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYlxuICovXG5cbmV4cG9ydHMub2ZmID0gZnVuY3Rpb24gKGVsLCBldmVudCwgY2IpIHtcbiAgZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudCwgY2IpXG59XG5cbi8qKlxuICogQWRkIGNsYXNzIHdpdGggY29tcGF0aWJpbGl0eSBmb3IgSUUgJiBTVkdcbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsXG4gKiBAcGFyYW0ge1N0cm9uZ30gY2xzXG4gKi9cblxuZXhwb3J0cy5hZGRDbGFzcyA9IGZ1bmN0aW9uIChlbCwgY2xzKSB7XG4gIGlmIChlbC5jbGFzc0xpc3QpIHtcbiAgICBlbC5jbGFzc0xpc3QuYWRkKGNscylcbiAgfSBlbHNlIHtcbiAgICB2YXIgY3VyID0gJyAnICsgKGVsLmdldEF0dHJpYnV0ZSgnY2xhc3MnKSB8fCAnJykgKyAnICdcbiAgICBpZiAoY3VyLmluZGV4T2YoJyAnICsgY2xzICsgJyAnKSA8IDApIHtcbiAgICAgIGVsLnNldEF0dHJpYnV0ZSgnY2xhc3MnLCAoY3VyICsgY2xzKS50cmltKCkpXG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogUmVtb3ZlIGNsYXNzIHdpdGggY29tcGF0aWJpbGl0eSBmb3IgSUUgJiBTVkdcbiAqXG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsXG4gKiBAcGFyYW0ge1N0cm9uZ30gY2xzXG4gKi9cblxuZXhwb3J0cy5yZW1vdmVDbGFzcyA9IGZ1bmN0aW9uIChlbCwgY2xzKSB7XG4gIGlmIChlbC5jbGFzc0xpc3QpIHtcbiAgICBlbC5jbGFzc0xpc3QucmVtb3ZlKGNscylcbiAgfSBlbHNlIHtcbiAgICB2YXIgY3VyID0gJyAnICsgKGVsLmdldEF0dHJpYnV0ZSgnY2xhc3MnKSB8fCAnJykgKyAnICdcbiAgICB2YXIgdGFyID0gJyAnICsgY2xzICsgJyAnXG4gICAgd2hpbGUgKGN1ci5pbmRleE9mKHRhcikgPj0gMCkge1xuICAgICAgY3VyID0gY3VyLnJlcGxhY2UodGFyLCAnICcpXG4gICAgfVxuICAgIGVsLnNldEF0dHJpYnV0ZSgnY2xhc3MnLCBjdXIudHJpbSgpKVxuICB9XG59XG5cbi8qKlxuICogRXh0cmFjdCByYXcgY29udGVudCBpbnNpZGUgYW4gZWxlbWVudCBpbnRvIGEgdGVtcG9yYXJ5XG4gKiBjb250YWluZXIgZGl2XG4gKlxuICogQHBhcmFtIHtFbGVtZW50fSBlbFxuICogQHBhcmFtIHtCb29sZWFufSBhc0ZyYWdtZW50XG4gKiBAcmV0dXJuIHtFbGVtZW50fVxuICovXG5cbmV4cG9ydHMuZXh0cmFjdENvbnRlbnQgPSBmdW5jdGlvbiAoZWwsIGFzRnJhZ21lbnQpIHtcbiAgdmFyIGNoaWxkXG4gIHZhciByYXdDb250ZW50XG4gIGlmIChlbC5oYXNDaGlsZE5vZGVzKCkpIHtcbiAgICByYXdDb250ZW50ID0gYXNGcmFnbWVudFxuICAgICAgPyBkb2N1bWVudC5jcmVhdGVEb2N1bWVudEZyYWdtZW50KClcbiAgICAgIDogZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2JylcbiAgICAvKiBqc2hpbnQgYm9zczp0cnVlICovXG4gICAgd2hpbGUgKGNoaWxkID0gZWwuZmlyc3RDaGlsZCkge1xuICAgICAgcmF3Q29udGVudC5hcHBlbmRDaGlsZChjaGlsZClcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJhd0NvbnRlbnRcbn1cbiIsIi8qKlxuICogQ2FuIHdlIHVzZSBfX3Byb3RvX18/XG4gKlxuICogQHR5cGUge0Jvb2xlYW59XG4gKi9cblxuZXhwb3J0cy5oYXNQcm90byA9ICdfX3Byb3RvX18nIGluIHt9XG5cbi8qKlxuICogSW5kaWNhdGVzIHdlIGhhdmUgYSB3aW5kb3dcbiAqXG4gKiBAdHlwZSB7Qm9vbGVhbn1cbiAqL1xuXG52YXIgdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nXG52YXIgaW5Ccm93c2VyID0gZXhwb3J0cy5pbkJyb3dzZXIgPVxuICB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJlxuICB0b1N0cmluZy5jYWxsKHdpbmRvdykgIT09ICdbb2JqZWN0IE9iamVjdF0nXG5cbi8qKlxuICogRGVmZXIgYSB0YXNrIHRvIGV4ZWN1dGUgaXQgYXN5bmNocm9ub3VzbHkuIElkZWFsbHkgdGhpc1xuICogc2hvdWxkIGJlIGV4ZWN1dGVkIGFzIGEgbWljcm90YXNrLCBzbyB3ZSBsZXZlcmFnZVxuICogTXV0YXRpb25PYnNlcnZlciBpZiBpdCdzIGF2YWlsYWJsZSwgYW5kIGZhbGxiYWNrIHRvXG4gKiBzZXRUaW1lb3V0KDApLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNiXG4gKiBAcGFyYW0ge09iamVjdH0gY3R4XG4gKi9cblxuZXhwb3J0cy5uZXh0VGljayA9IChmdW5jdGlvbiAoKSB7XG4gIHZhciBjYWxsYmFja3MgPSBbXVxuICB2YXIgcGVuZGluZyA9IGZhbHNlXG4gIHZhciB0aW1lckZ1bmNcbiAgZnVuY3Rpb24gaGFuZGxlICgpIHtcbiAgICBwZW5kaW5nID0gZmFsc2VcbiAgICB2YXIgY29waWVzID0gY2FsbGJhY2tzLnNsaWNlKDApXG4gICAgY2FsbGJhY2tzID0gW11cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNvcGllcy5sZW5ndGg7IGkrKykge1xuICAgICAgY29waWVzW2ldKClcbiAgICB9XG4gIH1cbiAgLyogaXN0YW5idWwgaWdub3JlIGlmICovXG4gIGlmICh0eXBlb2YgTXV0YXRpb25PYnNlcnZlciAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICB2YXIgY291bnRlciA9IDFcbiAgICB2YXIgb2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcihoYW5kbGUpXG4gICAgdmFyIHRleHROb2RlID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoY291bnRlcilcbiAgICBvYnNlcnZlci5vYnNlcnZlKHRleHROb2RlLCB7XG4gICAgICBjaGFyYWN0ZXJEYXRhOiB0cnVlXG4gICAgfSlcbiAgICB0aW1lckZ1bmMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICBjb3VudGVyID0gKGNvdW50ZXIgKyAxKSAlIDJcbiAgICAgIHRleHROb2RlLmRhdGEgPSBjb3VudGVyXG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHRpbWVyRnVuYyA9IHNldFRpbWVvdXRcbiAgfVxuICByZXR1cm4gZnVuY3Rpb24gKGNiLCBjdHgpIHtcbiAgICB2YXIgZnVuYyA9IGN0eFxuICAgICAgPyBmdW5jdGlvbiAoKSB7IGNiLmNhbGwoY3R4KSB9XG4gICAgICA6IGNiXG4gICAgY2FsbGJhY2tzLnB1c2goZnVuYylcbiAgICBpZiAocGVuZGluZykgcmV0dXJuXG4gICAgcGVuZGluZyA9IHRydWVcbiAgICB0aW1lckZ1bmMoaGFuZGxlLCAwKVxuICB9XG59KSgpXG5cbi8qKlxuICogRGV0ZWN0IGlmIHdlIGFyZSBpbiBJRTkuLi5cbiAqXG4gKiBAdHlwZSB7Qm9vbGVhbn1cbiAqL1xuXG5leHBvcnRzLmlzSUU5ID1cbiAgaW5Ccm93c2VyICYmXG4gIG5hdmlnYXRvci51c2VyQWdlbnQuaW5kZXhPZignTVNJRSA5LjAnKSA+IDBcblxuLyoqXG4gKiBTbmlmZiB0cmFuc2l0aW9uL2FuaW1hdGlvbiBldmVudHNcbiAqL1xuXG5pZiAoaW5Ccm93c2VyICYmICFleHBvcnRzLmlzSUU5KSB7XG4gIHZhciBpc1dlYmtpdFRyYW5zID1cbiAgICB3aW5kb3cub250cmFuc2l0aW9uZW5kID09PSB1bmRlZmluZWQgJiZcbiAgICB3aW5kb3cub253ZWJraXR0cmFuc2l0aW9uZW5kICE9PSB1bmRlZmluZWRcbiAgdmFyIGlzV2Via2l0QW5pbSA9XG4gICAgd2luZG93Lm9uYW5pbWF0aW9uZW5kID09PSB1bmRlZmluZWQgJiZcbiAgICB3aW5kb3cub253ZWJraXRhbmltYXRpb25lbmQgIT09IHVuZGVmaW5lZFxuICBleHBvcnRzLnRyYW5zaXRpb25Qcm9wID0gaXNXZWJraXRUcmFuc1xuICAgID8gJ1dlYmtpdFRyYW5zaXRpb24nXG4gICAgOiAndHJhbnNpdGlvbidcbiAgZXhwb3J0cy50cmFuc2l0aW9uRW5kRXZlbnQgPSBpc1dlYmtpdFRyYW5zXG4gICAgPyAnd2Via2l0VHJhbnNpdGlvbkVuZCdcbiAgICA6ICd0cmFuc2l0aW9uZW5kJ1xuICBleHBvcnRzLmFuaW1hdGlvblByb3AgPSBpc1dlYmtpdEFuaW1cbiAgICA/ICdXZWJraXRBbmltYXRpb24nXG4gICAgOiAnYW5pbWF0aW9uJ1xuICBleHBvcnRzLmFuaW1hdGlvbkVuZEV2ZW50ID0gaXNXZWJraXRBbmltXG4gICAgPyAnd2Via2l0QW5pbWF0aW9uRW5kJ1xuICAgIDogJ2FuaW1hdGlvbmVuZCdcbn0iLCJ2YXIgXyA9IHJlcXVpcmUoJy4vZGVidWcnKVxuXG4vKipcbiAqIFJlc29sdmUgcmVhZCAmIHdyaXRlIGZpbHRlcnMgZm9yIGEgdm0gaW5zdGFuY2UuIFRoZVxuICogZmlsdGVycyBkZXNjcmlwdG9yIEFycmF5IGNvbWVzIGZyb20gdGhlIGRpcmVjdGl2ZSBwYXJzZXIuXG4gKlxuICogVGhpcyBpcyBleHRyYWN0ZWQgaW50byBpdHMgb3duIHV0aWxpdHkgc28gaXQgY2FuXG4gKiBiZSB1c2VkIGluIG11bHRpcGxlIHNjZW5hcmlvcy5cbiAqXG4gKiBAcGFyYW0ge1Z1ZX0gdm1cbiAqIEBwYXJhbSB7QXJyYXk8T2JqZWN0Pn0gZmlsdGVyc1xuICogQHBhcmFtIHtPYmplY3R9IFt0YXJnZXRdXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKi9cblxuZXhwb3J0cy5yZXNvbHZlRmlsdGVycyA9IGZ1bmN0aW9uICh2bSwgZmlsdGVycywgdGFyZ2V0KSB7XG4gIGlmICghZmlsdGVycykge1xuICAgIHJldHVyblxuICB9XG4gIHZhciByZXMgPSB0YXJnZXQgfHwge31cbiAgLy8gdmFyIHJlZ2lzdHJ5ID0gdm0uJG9wdGlvbnMuZmlsdGVyc1xuICBmaWx0ZXJzLmZvckVhY2goZnVuY3Rpb24gKGYpIHtcbiAgICB2YXIgZGVmID0gdm0uJG9wdGlvbnMuZmlsdGVyc1tmLm5hbWVdXG4gICAgXy5hc3NlcnRBc3NldChkZWYsICdmaWx0ZXInLCBmLm5hbWUpXG4gICAgaWYgKCFkZWYpIHJldHVyblxuICAgIHZhciBhcmdzID0gZi5hcmdzXG4gICAgdmFyIHJlYWRlciwgd3JpdGVyXG4gICAgaWYgKHR5cGVvZiBkZWYgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJlYWRlciA9IGRlZlxuICAgIH0gZWxzZSB7XG4gICAgICByZWFkZXIgPSBkZWYucmVhZFxuICAgICAgd3JpdGVyID0gZGVmLndyaXRlXG4gICAgfVxuICAgIGlmIChyZWFkZXIpIHtcbiAgICAgIGlmICghcmVzLnJlYWQpIHJlcy5yZWFkID0gW11cbiAgICAgIHJlcy5yZWFkLnB1c2goZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIHJldHVybiBhcmdzXG4gICAgICAgICAgPyByZWFkZXIuYXBwbHkodm0sIFt2YWx1ZV0uY29uY2F0KGFyZ3MpKVxuICAgICAgICAgIDogcmVhZGVyLmNhbGwodm0sIHZhbHVlKVxuICAgICAgfSlcbiAgICB9XG4gICAgaWYgKHdyaXRlcikge1xuICAgICAgaWYgKCFyZXMud3JpdGUpIHJlcy53cml0ZSA9IFtdXG4gICAgICByZXMud3JpdGUucHVzaChmdW5jdGlvbiAodmFsdWUsIG9sZFZhbCkge1xuICAgICAgICByZXR1cm4gYXJnc1xuICAgICAgICAgID8gd3JpdGVyLmFwcGx5KHZtLCBbdmFsdWUsIG9sZFZhbF0uY29uY2F0KGFyZ3MpKVxuICAgICAgICAgIDogd3JpdGVyLmNhbGwodm0sIHZhbHVlLCBvbGRWYWwpXG4gICAgICB9KVxuICAgIH1cbiAgfSlcbiAgcmV0dXJuIHJlc1xufVxuXG4vKipcbiAqIEFwcGx5IGZpbHRlcnMgdG8gYSB2YWx1ZVxuICpcbiAqIEBwYXJhbSB7Kn0gdmFsdWVcbiAqIEBwYXJhbSB7QXJyYXl9IGZpbHRlcnNcbiAqIEBwYXJhbSB7VnVlfSB2bVxuICogQHBhcmFtIHsqfSBvbGRWYWxcbiAqIEByZXR1cm4geyp9XG4gKi9cblxuZXhwb3J0cy5hcHBseUZpbHRlcnMgPSBmdW5jdGlvbiAodmFsdWUsIGZpbHRlcnMsIHZtLCBvbGRWYWwpIHtcbiAgaWYgKCFmaWx0ZXJzKSB7XG4gICAgcmV0dXJuIHZhbHVlXG4gIH1cbiAgZm9yICh2YXIgaSA9IDAsIGwgPSBmaWx0ZXJzLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgIHZhbHVlID0gZmlsdGVyc1tpXS5jYWxsKHZtLCB2YWx1ZSwgb2xkVmFsKVxuICB9XG4gIHJldHVybiB2YWx1ZVxufSIsInZhciBsYW5nICAgPSByZXF1aXJlKCcuL2xhbmcnKVxudmFyIGV4dGVuZCA9IGxhbmcuZXh0ZW5kXG5cbmV4dGVuZChleHBvcnRzLCBsYW5nKVxuZXh0ZW5kKGV4cG9ydHMsIHJlcXVpcmUoJy4vZW52JykpXG5leHRlbmQoZXhwb3J0cywgcmVxdWlyZSgnLi9kb20nKSlcbmV4dGVuZChleHBvcnRzLCByZXF1aXJlKCcuL2ZpbHRlcicpKVxuZXh0ZW5kKGV4cG9ydHMsIHJlcXVpcmUoJy4vZGVidWcnKSkiLCIvKipcbiAqIENoZWNrIGlzIGEgc3RyaW5nIHN0YXJ0cyB3aXRoICQgb3IgX1xuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKi9cblxuZXhwb3J0cy5pc1Jlc2VydmVkID0gZnVuY3Rpb24gKHN0cikge1xuICB2YXIgYyA9IChzdHIgKyAnJykuY2hhckNvZGVBdCgwKVxuICByZXR1cm4gYyA9PT0gMHgyNCB8fCBjID09PSAweDVGXG59XG5cbi8qKlxuICogR3VhcmQgdGV4dCBvdXRwdXQsIG1ha2Ugc3VyZSB1bmRlZmluZWQgb3V0cHV0c1xuICogZW1wdHkgc3RyaW5nXG4gKlxuICogQHBhcmFtIHsqfSB2YWx1ZVxuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5cbmV4cG9ydHMudG9TdHJpbmcgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlID09IG51bGxcbiAgICA/ICcnXG4gICAgOiB2YWx1ZS50b1N0cmluZygpXG59XG5cbi8qKlxuICogQ2hlY2sgYW5kIGNvbnZlcnQgcG9zc2libGUgbnVtZXJpYyBudW1iZXJzIGJlZm9yZVxuICogc2V0dGluZyBiYWNrIHRvIGRhdGFcbiAqXG4gKiBAcGFyYW0geyp9IHZhbHVlXG4gKiBAcmV0dXJuIHsqfE51bWJlcn1cbiAqL1xuXG5leHBvcnRzLnRvTnVtYmVyID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gIHJldHVybiAoXG4gICAgaXNOYU4odmFsdWUpIHx8XG4gICAgdmFsdWUgPT09IG51bGwgfHxcbiAgICB0eXBlb2YgdmFsdWUgPT09ICdib29sZWFuJ1xuICApID8gdmFsdWVcbiAgICA6IE51bWJlcih2YWx1ZSlcbn1cblxuLyoqXG4gKiBTdHJpcCBxdW90ZXMgZnJvbSBhIHN0cmluZ1xuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge1N0cmluZyB8IGZhbHNlfVxuICovXG5cbmV4cG9ydHMuc3RyaXBRdW90ZXMgPSBmdW5jdGlvbiAoc3RyKSB7XG4gIHZhciBhID0gc3RyLmNoYXJDb2RlQXQoMClcbiAgdmFyIGIgPSBzdHIuY2hhckNvZGVBdChzdHIubGVuZ3RoIC0gMSlcbiAgcmV0dXJuIGEgPT09IGIgJiYgKGEgPT09IDB4MjIgfHwgYSA9PT0gMHgyNylcbiAgICA/IHN0ci5zbGljZSgxLCAtMSlcbiAgICA6IGZhbHNlXG59XG5cbi8qKlxuICogUmVwbGFjZSBoZWxwZXJcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gXyAtIG1hdGNoZWQgZGVsaW1pdGVyXG4gKiBAcGFyYW0ge1N0cmluZ30gYyAtIG1hdGNoZWQgY2hhclxuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5mdW5jdGlvbiB0b1VwcGVyIChfLCBjKSB7XG4gIHJldHVybiBjID8gYy50b1VwcGVyQ2FzZSAoKSA6ICcnXG59XG5cbi8qKlxuICogQ2FtZWxpemUgYSBoeXBoZW4tZGVsbWl0ZWQgc3RyaW5nLlxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuXG52YXIgY2FtZWxSRSA9IC8tKFxcdykvZ1xuZXhwb3J0cy5jYW1lbGl6ZSA9IGZ1bmN0aW9uIChzdHIpIHtcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKGNhbWVsUkUsIHRvVXBwZXIpXG59XG5cbi8qKlxuICogQ29udmVydHMgaHlwaGVuL3VuZGVyc2NvcmUvc2xhc2ggZGVsaW1pdGVyZWQgbmFtZXMgaW50b1xuICogY2FtZWxpemVkIGNsYXNzTmFtZXMuXG4gKlxuICogZS5nLiBteS1jb21wb25lbnQgPT4gTXlDb21wb25lbnRcbiAqICAgICAgc29tZV9lbHNlICAgID0+IFNvbWVFbHNlXG4gKiAgICAgIHNvbWUvY29tcCAgICA9PiBTb21lQ29tcFxuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm4ge1N0cmluZ31cbiAqL1xuXG52YXIgY2xhc3NpZnlSRSA9IC8oPzpefFstX1xcL10pKFxcdykvZ1xuZXhwb3J0cy5jbGFzc2lmeSA9IGZ1bmN0aW9uIChzdHIpIHtcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKGNsYXNzaWZ5UkUsIHRvVXBwZXIpXG59XG5cbi8qKlxuICogU2ltcGxlIGJpbmQsIGZhc3RlciB0aGFuIG5hdGl2ZVxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcGFyYW0ge09iamVjdH0gY3R4XG4gKiBAcmV0dXJuIHtGdW5jdGlvbn1cbiAqL1xuXG5leHBvcnRzLmJpbmQgPSBmdW5jdGlvbiAoZm4sIGN0eCkge1xuICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBmbi5hcHBseShjdHgsIGFyZ3VtZW50cylcbiAgfVxufVxuXG4vKipcbiAqIENvbnZlcnQgYW4gQXJyYXktbGlrZSBvYmplY3QgdG8gYSByZWFsIEFycmF5LlxuICpcbiAqIEBwYXJhbSB7QXJyYXktbGlrZX0gbGlzdFxuICogQHBhcmFtIHtOdW1iZXJ9IFtzdGFydF0gLSBzdGFydCBpbmRleFxuICogQHJldHVybiB7QXJyYXl9XG4gKi9cblxuZXhwb3J0cy50b0FycmF5ID0gZnVuY3Rpb24gKGxpc3QsIHN0YXJ0KSB7XG4gIHN0YXJ0ID0gc3RhcnQgfHwgMFxuICB2YXIgaSA9IGxpc3QubGVuZ3RoIC0gc3RhcnRcbiAgdmFyIHJldCA9IG5ldyBBcnJheShpKVxuICB3aGlsZSAoaS0tKSB7XG4gICAgcmV0W2ldID0gbGlzdFtpICsgc3RhcnRdXG4gIH1cbiAgcmV0dXJuIHJldFxufVxuXG4vKipcbiAqIE1peCBwcm9wZXJ0aWVzIGludG8gdGFyZ2V0IG9iamVjdC5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gdG9cbiAqIEBwYXJhbSB7T2JqZWN0fSBmcm9tXG4gKi9cblxuZXhwb3J0cy5leHRlbmQgPSBmdW5jdGlvbiAodG8sIGZyb20pIHtcbiAgZm9yICh2YXIga2V5IGluIGZyb20pIHtcbiAgICB0b1trZXldID0gZnJvbVtrZXldXG4gIH1cbiAgcmV0dXJuIHRvXG59XG5cbi8qKlxuICogUXVpY2sgb2JqZWN0IGNoZWNrIC0gdGhpcyBpcyBwcmltYXJpbHkgdXNlZCB0byB0ZWxsXG4gKiBPYmplY3RzIGZyb20gcHJpbWl0aXZlIHZhbHVlcyB3aGVuIHdlIGtub3cgdGhlIHZhbHVlXG4gKiBpcyBhIEpTT04tY29tcGxpYW50IHR5cGUuXG4gKlxuICogQHBhcmFtIHsqfSBvYmpcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKi9cblxuZXhwb3J0cy5pc09iamVjdCA9IGZ1bmN0aW9uIChvYmopIHtcbiAgcmV0dXJuIG9iaiAmJiB0eXBlb2Ygb2JqID09PSAnb2JqZWN0J1xufVxuXG4vKipcbiAqIFN0cmljdCBvYmplY3QgdHlwZSBjaGVjay4gT25seSByZXR1cm5zIHRydWVcbiAqIGZvciBwbGFpbiBKYXZhU2NyaXB0IG9iamVjdHMuXG4gKlxuICogQHBhcmFtIHsqfSBvYmpcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKi9cblxudmFyIHRvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZ1xuZXhwb3J0cy5pc1BsYWluT2JqZWN0ID0gZnVuY3Rpb24gKG9iaikge1xuICByZXR1cm4gdG9TdHJpbmcuY2FsbChvYmopID09PSAnW29iamVjdCBPYmplY3RdJ1xufVxuXG4vKipcbiAqIEFycmF5IHR5cGUgY2hlY2suXG4gKlxuICogQHBhcmFtIHsqfSBvYmpcbiAqIEByZXR1cm4ge0Jvb2xlYW59XG4gKi9cblxuZXhwb3J0cy5pc0FycmF5ID0gZnVuY3Rpb24gKG9iaikge1xuICByZXR1cm4gQXJyYXkuaXNBcnJheShvYmopXG59XG5cbi8qKlxuICogRGVmaW5lIGEgbm9uLWVudW1lcmFibGUgcHJvcGVydHlcbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqXG4gKiBAcGFyYW0ge1N0cmluZ30ga2V5XG4gKiBAcGFyYW0geyp9IHZhbFxuICogQHBhcmFtIHtCb29sZWFufSBbZW51bWVyYWJsZV1cbiAqL1xuXG5leHBvcnRzLmRlZmluZSA9IGZ1bmN0aW9uIChvYmosIGtleSwgdmFsLCBlbnVtZXJhYmxlKSB7XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIGtleSwge1xuICAgIHZhbHVlICAgICAgICA6IHZhbCxcbiAgICBlbnVtZXJhYmxlICAgOiAhIWVudW1lcmFibGUsXG4gICAgd3JpdGFibGUgICAgIDogdHJ1ZSxcbiAgICBjb25maWd1cmFibGUgOiB0cnVlXG4gIH0pXG59XG5cbi8qKlxuICogRGVib3VuY2UgYSBmdW5jdGlvbiBzbyBpdCBvbmx5IGdldHMgY2FsbGVkIGFmdGVyIHRoZVxuICogaW5wdXQgc3RvcHMgYXJyaXZpbmcgYWZ0ZXIgdGhlIGdpdmVuIHdhaXQgcGVyaW9kLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZ1bmNcbiAqIEBwYXJhbSB7TnVtYmVyfSB3YWl0XG4gKiBAcmV0dXJuIHtGdW5jdGlvbn0gLSB0aGUgZGVib3VuY2VkIGZ1bmN0aW9uXG4gKi9cblxuZXhwb3J0cy5kZWJvdW5jZSA9IGZ1bmN0aW9uKGZ1bmMsIHdhaXQpIHtcbiAgdmFyIHRpbWVvdXQsIGFyZ3MsIGNvbnRleHQsIHRpbWVzdGFtcCwgcmVzdWx0XG4gIHZhciBsYXRlciA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBsYXN0ID0gRGF0ZS5ub3coKSAtIHRpbWVzdGFtcFxuICAgIGlmIChsYXN0IDwgd2FpdCAmJiBsYXN0ID49IDApIHtcbiAgICAgIHRpbWVvdXQgPSBzZXRUaW1lb3V0KGxhdGVyLCB3YWl0IC0gbGFzdClcbiAgICB9IGVsc2Uge1xuICAgICAgdGltZW91dCA9IG51bGxcbiAgICAgIHJlc3VsdCA9IGZ1bmMuYXBwbHkoY29udGV4dCwgYXJncylcbiAgICAgIGlmICghdGltZW91dCkgY29udGV4dCA9IGFyZ3MgPSBudWxsXG4gICAgfVxuICB9XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICBjb250ZXh0ID0gdGhpc1xuICAgIGFyZ3MgPSBhcmd1bWVudHNcbiAgICB0aW1lc3RhbXAgPSBEYXRlLm5vdygpXG4gICAgaWYgKCF0aW1lb3V0KSB7XG4gICAgICB0aW1lb3V0ID0gc2V0VGltZW91dChsYXRlciwgd2FpdClcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdFxuICB9XG59IiwidmFyIF8gPSByZXF1aXJlKCcuL2luZGV4JylcbnZhciBleHRlbmQgPSBfLmV4dGVuZFxuXG4vKipcbiAqIE9wdGlvbiBvdmVyd3JpdGluZyBzdHJhdGVnaWVzIGFyZSBmdW5jdGlvbnMgdGhhdCBoYW5kbGVcbiAqIGhvdyB0byBtZXJnZSBhIHBhcmVudCBvcHRpb24gdmFsdWUgYW5kIGEgY2hpbGQgb3B0aW9uXG4gKiB2YWx1ZSBpbnRvIHRoZSBmaW5hbCB2YWx1ZS5cbiAqXG4gKiBBbGwgc3RyYXRlZ3kgZnVuY3Rpb25zIGZvbGxvdyB0aGUgc2FtZSBzaWduYXR1cmU6XG4gKlxuICogQHBhcmFtIHsqfSBwYXJlbnRWYWxcbiAqIEBwYXJhbSB7Kn0gY2hpbGRWYWxcbiAqIEBwYXJhbSB7VnVlfSBbdm1dXG4gKi9cblxudmFyIHN0cmF0cyA9IE9iamVjdC5jcmVhdGUobnVsbClcblxuLyoqXG4gKiBIZWxwZXIgdGhhdCByZWN1cnNpdmVseSBtZXJnZXMgdHdvIGRhdGEgb2JqZWN0cyB0b2dldGhlci5cbiAqL1xuXG5mdW5jdGlvbiBtZXJnZURhdGEgKHRvLCBmcm9tKSB7XG4gIHZhciBrZXksIHRvVmFsLCBmcm9tVmFsXG4gIGZvciAoa2V5IGluIGZyb20pIHtcbiAgICB0b1ZhbCA9IHRvW2tleV1cbiAgICBmcm9tVmFsID0gZnJvbVtrZXldXG4gICAgaWYgKCF0by5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICB0by4kYWRkKGtleSwgZnJvbVZhbClcbiAgICB9IGVsc2UgaWYgKF8uaXNPYmplY3QodG9WYWwpICYmIF8uaXNPYmplY3QoZnJvbVZhbCkpIHtcbiAgICAgIG1lcmdlRGF0YSh0b1ZhbCwgZnJvbVZhbClcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRvXG59XG5cbi8qKlxuICogRGF0YVxuICovXG5cbnN0cmF0cy5kYXRhID0gZnVuY3Rpb24gKHBhcmVudFZhbCwgY2hpbGRWYWwsIHZtKSB7XG4gIGlmICghdm0pIHtcbiAgICAvLyBpbiBhIFZ1ZS5leHRlbmQgbWVyZ2UsIGJvdGggc2hvdWxkIGJlIGZ1bmN0aW9uc1xuICAgIGlmICghY2hpbGRWYWwpIHtcbiAgICAgIHJldHVybiBwYXJlbnRWYWxcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBjaGlsZFZhbCAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgXy53YXJuKFxuICAgICAgICAnVGhlIFwiZGF0YVwiIG9wdGlvbiBzaG91bGQgYmUgYSBmdW5jdGlvbiAnICtcbiAgICAgICAgJ3RoYXQgcmV0dXJucyBhIHBlci1pbnN0YW5jZSB2YWx1ZSBpbiBjb21wb25lbnQgJyArXG4gICAgICAgICdkZWZpbml0aW9ucy4nXG4gICAgICApXG4gICAgICByZXR1cm4gcGFyZW50VmFsXG4gICAgfVxuICAgIGlmICghcGFyZW50VmFsKSB7XG4gICAgICByZXR1cm4gY2hpbGRWYWxcbiAgICB9XG4gICAgLy8gd2hlbiBwYXJlbnRWYWwgJiBjaGlsZFZhbCBhcmUgYm90aCBwcmVzZW50LFxuICAgIC8vIHdlIG5lZWQgdG8gcmV0dXJuIGEgZnVuY3Rpb24gdGhhdCByZXR1cm5zIHRoZVxuICAgIC8vIG1lcmdlZCByZXN1bHQgb2YgYm90aCBmdW5jdGlvbnMuLi4gbm8gbmVlZCB0b1xuICAgIC8vIGNoZWNrIGlmIHBhcmVudFZhbCBpcyBhIGZ1bmN0aW9uIGhlcmUgYmVjYXVzZVxuICAgIC8vIGl0IGhhcyB0byBiZSBhIGZ1bmN0aW9uIHRvIHBhc3MgcHJldmlvdXMgbWVyZ2VzLlxuICAgIHJldHVybiBmdW5jdGlvbiBtZXJnZWREYXRhRm4gKCkge1xuICAgICAgcmV0dXJuIG1lcmdlRGF0YShcbiAgICAgICAgY2hpbGRWYWwuY2FsbCh0aGlzKSxcbiAgICAgICAgcGFyZW50VmFsLmNhbGwodGhpcylcbiAgICAgIClcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgLy8gaW5zdGFuY2UgbWVyZ2UsIHJldHVybiByYXcgb2JqZWN0XG4gICAgdmFyIGluc3RhbmNlRGF0YSA9IHR5cGVvZiBjaGlsZFZhbCA9PT0gJ2Z1bmN0aW9uJ1xuICAgICAgPyBjaGlsZFZhbC5jYWxsKHZtKVxuICAgICAgOiBjaGlsZFZhbFxuICAgIHZhciBkZWZhdWx0RGF0YSA9IHR5cGVvZiBwYXJlbnRWYWwgPT09ICdmdW5jdGlvbidcbiAgICAgID8gcGFyZW50VmFsLmNhbGwodm0pXG4gICAgICA6IHVuZGVmaW5lZFxuICAgIGlmIChpbnN0YW5jZURhdGEpIHtcbiAgICAgIHJldHVybiBtZXJnZURhdGEoaW5zdGFuY2VEYXRhLCBkZWZhdWx0RGF0YSlcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGRlZmF1bHREYXRhXG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogRWxcbiAqL1xuXG5zdHJhdHMuZWwgPSBmdW5jdGlvbiAocGFyZW50VmFsLCBjaGlsZFZhbCwgdm0pIHtcbiAgaWYgKCF2bSAmJiBjaGlsZFZhbCAmJiB0eXBlb2YgY2hpbGRWYWwgIT09ICdmdW5jdGlvbicpIHtcbiAgICBfLndhcm4oXG4gICAgICAnVGhlIFwiZWxcIiBvcHRpb24gc2hvdWxkIGJlIGEgZnVuY3Rpb24gJyArXG4gICAgICAndGhhdCByZXR1cm5zIGEgcGVyLWluc3RhbmNlIHZhbHVlIGluIGNvbXBvbmVudCAnICtcbiAgICAgICdkZWZpbml0aW9ucy4nXG4gICAgKVxuICAgIHJldHVyblxuICB9XG4gIHZhciByZXQgPSBjaGlsZFZhbCB8fCBwYXJlbnRWYWxcbiAgLy8gaW52b2tlIHRoZSBlbGVtZW50IGZhY3RvcnkgaWYgdGhpcyBpcyBpbnN0YW5jZSBtZXJnZVxuICByZXR1cm4gdm0gJiYgdHlwZW9mIHJldCA9PT0gJ2Z1bmN0aW9uJ1xuICAgID8gcmV0LmNhbGwodm0pXG4gICAgOiByZXRcbn1cblxuLyoqXG4gKiBIb29rcyBhbmQgcGFyYW0gYXR0cmlidXRlcyBhcmUgbWVyZ2VkIGFzIGFycmF5cy5cbiAqL1xuXG5zdHJhdHMuY3JlYXRlZCA9XG5zdHJhdHMucmVhZHkgPVxuc3RyYXRzLmF0dGFjaGVkID1cbnN0cmF0cy5kZXRhY2hlZCA9XG5zdHJhdHMuYmVmb3JlQ29tcGlsZSA9XG5zdHJhdHMuY29tcGlsZWQgPVxuc3RyYXRzLmJlZm9yZURlc3Ryb3kgPVxuc3RyYXRzLmRlc3Ryb3llZCA9XG5zdHJhdHMucGFyYW1BdHRyaWJ1dGVzID0gZnVuY3Rpb24gKHBhcmVudFZhbCwgY2hpbGRWYWwpIHtcbiAgcmV0dXJuIGNoaWxkVmFsXG4gICAgPyBwYXJlbnRWYWxcbiAgICAgID8gcGFyZW50VmFsLmNvbmNhdChjaGlsZFZhbClcbiAgICAgIDogXy5pc0FycmF5KGNoaWxkVmFsKVxuICAgICAgICA/IGNoaWxkVmFsXG4gICAgICAgIDogW2NoaWxkVmFsXVxuICAgIDogcGFyZW50VmFsXG59XG5cbi8qKlxuICogQXNzZXRzXG4gKlxuICogV2hlbiBhIHZtIGlzIHByZXNlbnQgKGluc3RhbmNlIGNyZWF0aW9uKSwgd2UgbmVlZCB0byBkb1xuICogYSB0aHJlZS13YXkgbWVyZ2UgYmV0d2VlbiBjb25zdHJ1Y3RvciBvcHRpb25zLCBpbnN0YW5jZVxuICogb3B0aW9ucyBhbmQgcGFyZW50IG9wdGlvbnMuXG4gKi9cblxuc3RyYXRzLmRpcmVjdGl2ZXMgPVxuc3RyYXRzLmZpbHRlcnMgPVxuc3RyYXRzLnBhcnRpYWxzID1cbnN0cmF0cy50cmFuc2l0aW9ucyA9XG5zdHJhdHMuY29tcG9uZW50cyA9IGZ1bmN0aW9uIChwYXJlbnRWYWwsIGNoaWxkVmFsLCB2bSwga2V5KSB7XG4gIHZhciByZXQgPSBPYmplY3QuY3JlYXRlKFxuICAgIHZtICYmIHZtLiRwYXJlbnRcbiAgICAgID8gdm0uJHBhcmVudC4kb3B0aW9uc1trZXldXG4gICAgICA6IF8uVnVlLm9wdGlvbnNba2V5XVxuICApXG4gIGlmIChwYXJlbnRWYWwpIHtcbiAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKHBhcmVudFZhbClcbiAgICB2YXIgaSA9IGtleXMubGVuZ3RoXG4gICAgdmFyIGZpZWxkXG4gICAgd2hpbGUgKGktLSkge1xuICAgICAgZmllbGQgPSBrZXlzW2ldXG4gICAgICByZXRbZmllbGRdID0gcGFyZW50VmFsW2ZpZWxkXVxuICAgIH1cbiAgfVxuICBpZiAoY2hpbGRWYWwpIGV4dGVuZChyZXQsIGNoaWxkVmFsKVxuICByZXR1cm4gcmV0XG59XG5cbi8qKlxuICogRXZlbnRzICYgV2F0Y2hlcnMuXG4gKlxuICogRXZlbnRzICYgd2F0Y2hlcnMgaGFzaGVzIHNob3VsZCBub3Qgb3ZlcndyaXRlIG9uZVxuICogYW5vdGhlciwgc28gd2UgbWVyZ2UgdGhlbSBhcyBhcnJheXMuXG4gKi9cblxuc3RyYXRzLndhdGNoID1cbnN0cmF0cy5ldmVudHMgPSBmdW5jdGlvbiAocGFyZW50VmFsLCBjaGlsZFZhbCkge1xuICBpZiAoIWNoaWxkVmFsKSByZXR1cm4gcGFyZW50VmFsXG4gIGlmICghcGFyZW50VmFsKSByZXR1cm4gY2hpbGRWYWxcbiAgdmFyIHJldCA9IHt9XG4gIGV4dGVuZChyZXQsIHBhcmVudFZhbClcbiAgZm9yICh2YXIga2V5IGluIGNoaWxkVmFsKSB7XG4gICAgdmFyIHBhcmVudCA9IHJldFtrZXldXG4gICAgdmFyIGNoaWxkID0gY2hpbGRWYWxba2V5XVxuICAgIGlmIChwYXJlbnQgJiYgIV8uaXNBcnJheShwYXJlbnQpKSB7XG4gICAgICBwYXJlbnQgPSBbcGFyZW50XVxuICAgIH1cbiAgICByZXRba2V5XSA9IHBhcmVudFxuICAgICAgPyBwYXJlbnQuY29uY2F0KGNoaWxkKVxuICAgICAgOiBbY2hpbGRdXG4gIH1cbiAgcmV0dXJuIHJldFxufVxuXG4vKipcbiAqIE90aGVyIG9iamVjdCBoYXNoZXMuXG4gKi9cblxuc3RyYXRzLm1ldGhvZHMgPVxuc3RyYXRzLmNvbXB1dGVkID0gZnVuY3Rpb24gKHBhcmVudFZhbCwgY2hpbGRWYWwpIHtcbiAgaWYgKCFjaGlsZFZhbCkgcmV0dXJuIHBhcmVudFZhbFxuICBpZiAoIXBhcmVudFZhbCkgcmV0dXJuIGNoaWxkVmFsXG4gIHZhciByZXQgPSBPYmplY3QuY3JlYXRlKHBhcmVudFZhbClcbiAgZXh0ZW5kKHJldCwgY2hpbGRWYWwpXG4gIHJldHVybiByZXRcbn1cblxuLyoqXG4gKiBEZWZhdWx0IHN0cmF0ZWd5LlxuICovXG5cbnZhciBkZWZhdWx0U3RyYXQgPSBmdW5jdGlvbiAocGFyZW50VmFsLCBjaGlsZFZhbCkge1xuICByZXR1cm4gY2hpbGRWYWwgPT09IHVuZGVmaW5lZFxuICAgID8gcGFyZW50VmFsXG4gICAgOiBjaGlsZFZhbFxufVxuXG4vKipcbiAqIE1ha2Ugc3VyZSBjb21wb25lbnQgb3B0aW9ucyBnZXQgY29udmVydGVkIHRvIGFjdHVhbFxuICogY29uc3RydWN0b3JzLlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBjb21wb25lbnRzXG4gKi9cblxuZnVuY3Rpb24gZ3VhcmRDb21wb25lbnRzIChjb21wb25lbnRzKSB7XG4gIGlmIChjb21wb25lbnRzKSB7XG4gICAgdmFyIGRlZlxuICAgIGZvciAodmFyIGtleSBpbiBjb21wb25lbnRzKSB7XG4gICAgICBkZWYgPSBjb21wb25lbnRzW2tleV1cbiAgICAgIGlmIChfLmlzUGxhaW5PYmplY3QoZGVmKSkge1xuICAgICAgICBkZWYubmFtZSA9IGtleVxuICAgICAgICBjb21wb25lbnRzW2tleV0gPSBfLlZ1ZS5leHRlbmQoZGVmKVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIE1lcmdlIHR3byBvcHRpb24gb2JqZWN0cyBpbnRvIGEgbmV3IG9uZS5cbiAqIENvcmUgdXRpbGl0eSB1c2VkIGluIGJvdGggaW5zdGFudGlhdGlvbiBhbmQgaW5oZXJpdGFuY2UuXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHBhcmVudFxuICogQHBhcmFtIHtPYmplY3R9IGNoaWxkXG4gKiBAcGFyYW0ge1Z1ZX0gW3ZtXSAtIGlmIHZtIGlzIHByZXNlbnQsIGluZGljYXRlcyB0aGlzIGlzXG4gKiAgICAgICAgICAgICAgICAgICAgIGFuIGluc3RhbnRpYXRpb24gbWVyZ2UuXG4gKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBtZXJnZU9wdGlvbnMgKHBhcmVudCwgY2hpbGQsIHZtKSB7XG4gIGd1YXJkQ29tcG9uZW50cyhjaGlsZC5jb21wb25lbnRzKVxuICB2YXIgb3B0aW9ucyA9IHt9XG4gIHZhciBrZXlcbiAgaWYgKGNoaWxkLm1peGlucykge1xuICAgIGZvciAodmFyIGkgPSAwLCBsID0gY2hpbGQubWl4aW5zLmxlbmd0aDsgaSA8IGw7IGkrKykge1xuICAgICAgcGFyZW50ID0gbWVyZ2VPcHRpb25zKHBhcmVudCwgY2hpbGQubWl4aW5zW2ldLCB2bSlcbiAgICB9XG4gIH1cbiAgZm9yIChrZXkgaW4gcGFyZW50KSB7XG4gICAgbWVyZ2Uoa2V5KVxuICB9XG4gIGZvciAoa2V5IGluIGNoaWxkKSB7XG4gICAgaWYgKCEocGFyZW50Lmhhc093blByb3BlcnR5KGtleSkpKSB7XG4gICAgICBtZXJnZShrZXkpXG4gICAgfVxuICB9XG4gIGZ1bmN0aW9uIG1lcmdlIChrZXkpIHtcbiAgICB2YXIgc3RyYXQgPSBzdHJhdHNba2V5XSB8fCBkZWZhdWx0U3RyYXRcbiAgICBvcHRpb25zW2tleV0gPSBzdHJhdChwYXJlbnRba2V5XSwgY2hpbGRba2V5XSwgdm0sIGtleSlcbiAgfVxuICByZXR1cm4gb3B0aW9uc1xufSIsInZhciBfID0gcmVxdWlyZSgnLi91dGlsJylcbnZhciBleHRlbmQgPSBfLmV4dGVuZFxuXG4vKipcbiAqIFRoZSBleHBvc2VkIFZ1ZSBjb25zdHJ1Y3Rvci5cbiAqXG4gKiBBUEkgY29udmVudGlvbnM6XG4gKiAtIHB1YmxpYyBBUEkgbWV0aG9kcy9wcm9wZXJ0aWVzIGFyZSBwcmVmaWV4ZWQgd2l0aCBgJGBcbiAqIC0gaW50ZXJuYWwgbWV0aG9kcy9wcm9wZXJ0aWVzIGFyZSBwcmVmaXhlZCB3aXRoIGBfYFxuICogLSBub24tcHJlZml4ZWQgcHJvcGVydGllcyBhcmUgYXNzdW1lZCB0byBiZSBwcm94aWVkIHVzZXJcbiAqICAgZGF0YS5cbiAqXG4gKiBAY29uc3RydWN0b3JcbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cbiAqIEBwdWJsaWNcbiAqL1xuXG5mdW5jdGlvbiBWdWUgKG9wdGlvbnMpIHtcbiAgdGhpcy5faW5pdChvcHRpb25zKVxufVxuXG4vKipcbiAqIE1peGluIGdsb2JhbCBBUElcbiAqL1xuXG5leHRlbmQoVnVlLCByZXF1aXJlKCcuL2FwaS9nbG9iYWwnKSlcblxuLyoqXG4gKiBWdWUgYW5kIGV2ZXJ5IGNvbnN0cnVjdG9yIHRoYXQgZXh0ZW5kcyBWdWUgaGFzIGFuXG4gKiBhc3NvY2lhdGVkIG9wdGlvbnMgb2JqZWN0LCB3aGljaCBjYW4gYmUgYWNjZXNzZWQgZHVyaW5nXG4gKiBjb21waWxhdGlvbiBzdGVwcyBhcyBgdGhpcy5jb25zdHJ1Y3Rvci5vcHRpb25zYC5cbiAqXG4gKiBUaGVzZSBjYW4gYmUgc2VlbiBhcyB0aGUgZGVmYXVsdCBvcHRpb25zIG9mIGV2ZXJ5XG4gKiBWdWUgaW5zdGFuY2UuXG4gKi9cblxuVnVlLm9wdGlvbnMgPSB7XG4gIGRpcmVjdGl2ZXMgIDogcmVxdWlyZSgnLi9kaXJlY3RpdmVzJyksXG4gIGZpbHRlcnMgICAgIDogcmVxdWlyZSgnLi9maWx0ZXJzJyksXG4gIHBhcnRpYWxzICAgIDoge30sXG4gIHRyYW5zaXRpb25zIDoge30sXG4gIGNvbXBvbmVudHMgIDoge31cbn1cblxuLyoqXG4gKiBCdWlsZCB1cCB0aGUgcHJvdG90eXBlXG4gKi9cblxudmFyIHAgPSBWdWUucHJvdG90eXBlXG5cbi8qKlxuICogJGRhdGEgaGFzIGEgc2V0dGVyIHdoaWNoIGRvZXMgYSBidW5jaCBvZlxuICogdGVhcmRvd24vc2V0dXAgd29ya1xuICovXG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShwLCAnJGRhdGEnLCB7XG4gIGdldDogZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB0aGlzLl9kYXRhXG4gIH0sXG4gIHNldDogZnVuY3Rpb24gKG5ld0RhdGEpIHtcbiAgICB0aGlzLl9zZXREYXRhKG5ld0RhdGEpXG4gIH1cbn0pXG5cbi8qKlxuICogTWl4aW4gaW50ZXJuYWwgaW5zdGFuY2UgbWV0aG9kc1xuICovXG5cbmV4dGVuZChwLCByZXF1aXJlKCcuL2luc3RhbmNlL2luaXQnKSlcbmV4dGVuZChwLCByZXF1aXJlKCcuL2luc3RhbmNlL2V2ZW50cycpKVxuZXh0ZW5kKHAsIHJlcXVpcmUoJy4vaW5zdGFuY2Uvc2NvcGUnKSlcbmV4dGVuZChwLCByZXF1aXJlKCcuL2luc3RhbmNlL2NvbXBpbGUnKSlcblxuLyoqXG4gKiBNaXhpbiBwdWJsaWMgQVBJIG1ldGhvZHNcbiAqL1xuXG5leHRlbmQocCwgcmVxdWlyZSgnLi9hcGkvZGF0YScpKVxuZXh0ZW5kKHAsIHJlcXVpcmUoJy4vYXBpL2RvbScpKVxuZXh0ZW5kKHAsIHJlcXVpcmUoJy4vYXBpL2V2ZW50cycpKVxuZXh0ZW5kKHAsIHJlcXVpcmUoJy4vYXBpL2NoaWxkJykpXG5leHRlbmQocCwgcmVxdWlyZSgnLi9hcGkvbGlmZWN5Y2xlJykpXG5cbm1vZHVsZS5leHBvcnRzID0gXy5WdWUgPSBWdWUiLCJ2YXIgXyA9IHJlcXVpcmUoJy4vdXRpbCcpXG52YXIgY29uZmlnID0gcmVxdWlyZSgnLi9jb25maWcnKVxudmFyIE9ic2VydmVyID0gcmVxdWlyZSgnLi9vYnNlcnZlcicpXG52YXIgZXhwUGFyc2VyID0gcmVxdWlyZSgnLi9wYXJzZXJzL2V4cHJlc3Npb24nKVxudmFyIGJhdGNoZXIgPSByZXF1aXJlKCcuL2JhdGNoZXInKVxudmFyIHVpZCA9IDBcblxuLyoqXG4gKiBBIHdhdGNoZXIgcGFyc2VzIGFuIGV4cHJlc3Npb24sIGNvbGxlY3RzIGRlcGVuZGVuY2llcyxcbiAqIGFuZCBmaXJlcyBjYWxsYmFjayB3aGVuIHRoZSBleHByZXNzaW9uIHZhbHVlIGNoYW5nZXMuXG4gKiBUaGlzIGlzIHVzZWQgZm9yIGJvdGggdGhlICR3YXRjaCgpIGFwaSBhbmQgZGlyZWN0aXZlcy5cbiAqXG4gKiBAcGFyYW0ge1Z1ZX0gdm1cbiAqIEBwYXJhbSB7U3RyaW5nfSBleHByZXNzaW9uXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYlxuICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAqICAgICAgICAgICAgICAgICAtIHtBcnJheX0gZmlsdGVyc1xuICogICAgICAgICAgICAgICAgIC0ge0Jvb2xlYW59IHR3b1dheVxuICogICAgICAgICAgICAgICAgIC0ge0Jvb2xlYW59IGRlZXBcbiAqICAgICAgICAgICAgICAgICAtIHtCb29sZWFufSB1c2VyXG4gKiBAY29uc3RydWN0b3JcbiAqL1xuXG5mdW5jdGlvbiBXYXRjaGVyICh2bSwgZXhwcmVzc2lvbiwgY2IsIG9wdGlvbnMpIHtcbiAgdGhpcy52bSA9IHZtXG4gIHZtLl93YXRjaGVyTGlzdC5wdXNoKHRoaXMpXG4gIHRoaXMuZXhwcmVzc2lvbiA9IGV4cHJlc3Npb25cbiAgdGhpcy5jYnMgPSBbY2JdXG4gIHRoaXMuaWQgPSArK3VpZCAvLyB1aWQgZm9yIGJhdGNoaW5nXG4gIHRoaXMuYWN0aXZlID0gdHJ1ZVxuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fVxuICB0aGlzLmRlZXAgPSAhIW9wdGlvbnMuZGVlcFxuICB0aGlzLnVzZXIgPSAhIW9wdGlvbnMudXNlclxuICB0aGlzLmRlcHMgPSBPYmplY3QuY3JlYXRlKG51bGwpXG4gIC8vIHNldHVwIGZpbHRlcnMgaWYgYW55LlxuICAvLyBXZSBkZWxlZ2F0ZSBkaXJlY3RpdmUgZmlsdGVycyBoZXJlIHRvIHRoZSB3YXRjaGVyXG4gIC8vIGJlY2F1c2UgdGhleSBuZWVkIHRvIGJlIGluY2x1ZGVkIGluIHRoZSBkZXBlbmRlbmN5XG4gIC8vIGNvbGxlY3Rpb24gcHJvY2Vzcy5cbiAgaWYgKG9wdGlvbnMuZmlsdGVycykge1xuICAgIHRoaXMucmVhZEZpbHRlcnMgPSBvcHRpb25zLmZpbHRlcnMucmVhZFxuICAgIHRoaXMud3JpdGVGaWx0ZXJzID0gb3B0aW9ucy5maWx0ZXJzLndyaXRlXG4gIH1cbiAgLy8gcGFyc2UgZXhwcmVzc2lvbiBmb3IgZ2V0dGVyL3NldHRlclxuICB2YXIgcmVzID0gZXhwUGFyc2VyLnBhcnNlKGV4cHJlc3Npb24sIG9wdGlvbnMudHdvV2F5KVxuICB0aGlzLmdldHRlciA9IHJlcy5nZXRcbiAgdGhpcy5zZXR0ZXIgPSByZXMuc2V0XG4gIHRoaXMudmFsdWUgPSB0aGlzLmdldCgpXG59XG5cbnZhciBwID0gV2F0Y2hlci5wcm90b3R5cGVcblxuLyoqXG4gKiBBZGQgYSBkZXBlbmRlbmN5IHRvIHRoaXMgZGlyZWN0aXZlLlxuICpcbiAqIEBwYXJhbSB7RGVwfSBkZXBcbiAqL1xuXG5wLmFkZERlcCA9IGZ1bmN0aW9uIChkZXApIHtcbiAgdmFyIGlkID0gZGVwLmlkXG4gIGlmICghdGhpcy5uZXdEZXBzW2lkXSkge1xuICAgIHRoaXMubmV3RGVwc1tpZF0gPSBkZXBcbiAgICBpZiAoIXRoaXMuZGVwc1tpZF0pIHtcbiAgICAgIHRoaXMuZGVwc1tpZF0gPSBkZXBcbiAgICAgIGRlcC5hZGRTdWIodGhpcylcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBFdmFsdWF0ZSB0aGUgZ2V0dGVyLCBhbmQgcmUtY29sbGVjdCBkZXBlbmRlbmNpZXMuXG4gKi9cblxucC5nZXQgPSBmdW5jdGlvbiAoKSB7XG4gIHRoaXMuYmVmb3JlR2V0KClcbiAgdmFyIHZtID0gdGhpcy52bVxuICB2YXIgdmFsdWVcbiAgdHJ5IHtcbiAgICB2YWx1ZSA9IHRoaXMuZ2V0dGVyLmNhbGwodm0sIHZtKVxuICB9IGNhdGNoIChlKSB7XG4gICAgaWYgKGNvbmZpZy53YXJuRXhwcmVzc2lvbkVycm9ycykge1xuICAgICAgXy53YXJuKFxuICAgICAgICAnRXJyb3Igd2hlbiBldmFsdWF0aW5nIGV4cHJlc3Npb24gXCInICtcbiAgICAgICAgdGhpcy5leHByZXNzaW9uICsgJ1wiOlxcbiAgICcgKyBlXG4gICAgICApXG4gICAgfVxuICB9XG4gIC8vIFwidG91Y2hcIiBldmVyeSBwcm9wZXJ0eSBzbyB0aGV5IGFyZSBhbGwgdHJhY2tlZCBhc1xuICAvLyBkZXBlbmRlbmNpZXMgZm9yIGRlZXAgd2F0Y2hpbmdcbiAgaWYgKHRoaXMuZGVlcCkge1xuICAgIHRyYXZlcnNlKHZhbHVlKVxuICB9XG4gIHZhbHVlID0gXy5hcHBseUZpbHRlcnModmFsdWUsIHRoaXMucmVhZEZpbHRlcnMsIHZtKVxuICB0aGlzLmFmdGVyR2V0KClcbiAgcmV0dXJuIHZhbHVlXG59XG5cbi8qKlxuICogU2V0IHRoZSBjb3JyZXNwb25kaW5nIHZhbHVlIHdpdGggdGhlIHNldHRlci5cbiAqXG4gKiBAcGFyYW0geyp9IHZhbHVlXG4gKi9cblxucC5zZXQgPSBmdW5jdGlvbiAodmFsdWUpIHtcbiAgdmFyIHZtID0gdGhpcy52bVxuICB2YWx1ZSA9IF8uYXBwbHlGaWx0ZXJzKFxuICAgIHZhbHVlLCB0aGlzLndyaXRlRmlsdGVycywgdm0sIHRoaXMudmFsdWVcbiAgKVxuICB0cnkge1xuICAgIHRoaXMuc2V0dGVyLmNhbGwodm0sIHZtLCB2YWx1ZSlcbiAgfSBjYXRjaCAoZSkge1xuICAgIGlmIChjb25maWcud2FybkV4cHJlc3Npb25FcnJvcnMpIHtcbiAgICAgIF8ud2FybihcbiAgICAgICAgJ0Vycm9yIHdoZW4gZXZhbHVhdGluZyBzZXR0ZXIgXCInICtcbiAgICAgICAgdGhpcy5leHByZXNzaW9uICsgJ1wiOlxcbiAgICcgKyBlXG4gICAgICApXG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogUHJlcGFyZSBmb3IgZGVwZW5kZW5jeSBjb2xsZWN0aW9uLlxuICovXG5cbnAuYmVmb3JlR2V0ID0gZnVuY3Rpb24gKCkge1xuICBPYnNlcnZlci50YXJnZXQgPSB0aGlzXG4gIHRoaXMubmV3RGVwcyA9IHt9XG59XG5cbi8qKlxuICogQ2xlYW4gdXAgZm9yIGRlcGVuZGVuY3kgY29sbGVjdGlvbi5cbiAqL1xuXG5wLmFmdGVyR2V0ID0gZnVuY3Rpb24gKCkge1xuICBPYnNlcnZlci50YXJnZXQgPSBudWxsXG4gIGZvciAodmFyIGlkIGluIHRoaXMuZGVwcykge1xuICAgIGlmICghdGhpcy5uZXdEZXBzW2lkXSkge1xuICAgICAgdGhpcy5kZXBzW2lkXS5yZW1vdmVTdWIodGhpcylcbiAgICB9XG4gIH1cbiAgdGhpcy5kZXBzID0gdGhpcy5uZXdEZXBzXG59XG5cbi8qKlxuICogU3Vic2NyaWJlciBpbnRlcmZhY2UuXG4gKiBXaWxsIGJlIGNhbGxlZCB3aGVuIGEgZGVwZW5kZW5jeSBjaGFuZ2VzLlxuICovXG5cbnAudXBkYXRlID0gZnVuY3Rpb24gKCkge1xuICBpZiAoIWNvbmZpZy5hc3luYyB8fCBjb25maWcuZGVidWcpIHtcbiAgICB0aGlzLnJ1bigpXG4gIH0gZWxzZSB7XG4gICAgYmF0Y2hlci5wdXNoKHRoaXMpXG4gIH1cbn1cblxuLyoqXG4gKiBCYXRjaGVyIGpvYiBpbnRlcmZhY2UuXG4gKiBXaWxsIGJlIGNhbGxlZCBieSB0aGUgYmF0Y2hlci5cbiAqL1xuXG5wLnJ1biA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKHRoaXMuYWN0aXZlKSB7XG4gICAgdmFyIHZhbHVlID0gdGhpcy5nZXQoKVxuICAgIGlmIChcbiAgICAgIHZhbHVlICE9PSB0aGlzLnZhbHVlIHx8XG4gICAgICBBcnJheS5pc0FycmF5KHZhbHVlKSB8fFxuICAgICAgdGhpcy5kZWVwXG4gICAgKSB7XG4gICAgICB2YXIgb2xkVmFsdWUgPSB0aGlzLnZhbHVlXG4gICAgICB0aGlzLnZhbHVlID0gdmFsdWVcbiAgICAgIHZhciBjYnMgPSB0aGlzLmNic1xuICAgICAgZm9yICh2YXIgaSA9IDAsIGwgPSBjYnMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgIGNic1tpXSh2YWx1ZSwgb2xkVmFsdWUpXG4gICAgICAgIC8vIGlmIGEgY2FsbGJhY2sgYWxzbyByZW1vdmVkIG90aGVyIGNhbGxiYWNrcyxcbiAgICAgICAgLy8gd2UgbmVlZCB0byBhZGp1c3QgdGhlIGxvb3AgYWNjb3JkaW5nbHkuXG4gICAgICAgIHZhciByZW1vdmVkID0gbCAtIGNicy5sZW5ndGhcbiAgICAgICAgaWYgKHJlbW92ZWQpIHtcbiAgICAgICAgICBpIC09IHJlbW92ZWRcbiAgICAgICAgICBsIC09IHJlbW92ZWRcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG4vKipcbiAqIEFkZCBhIGNhbGxiYWNrLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNiXG4gKi9cblxucC5hZGRDYiA9IGZ1bmN0aW9uIChjYikge1xuICB0aGlzLmNicy5wdXNoKGNiKVxufVxuXG4vKipcbiAqIFJlbW92ZSBhIGNhbGxiYWNrLlxuICpcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNiXG4gKi9cblxucC5yZW1vdmVDYiA9IGZ1bmN0aW9uIChjYikge1xuICB2YXIgY2JzID0gdGhpcy5jYnNcbiAgaWYgKGNicy5sZW5ndGggPiAxKSB7XG4gICAgdmFyIGkgPSBjYnMuaW5kZXhPZihjYilcbiAgICBpZiAoaSA+IC0xKSB7XG4gICAgICBjYnMuc3BsaWNlKGksIDEpXG4gICAgfVxuICB9IGVsc2UgaWYgKGNiID09PSBjYnNbMF0pIHtcbiAgICB0aGlzLnRlYXJkb3duKClcbiAgfVxufVxuXG4vKipcbiAqIFJlbW92ZSBzZWxmIGZyb20gYWxsIGRlcGVuZGVuY2llcycgc3ViY3JpYmVyIGxpc3QuXG4gKi9cblxucC50ZWFyZG93biA9IGZ1bmN0aW9uICgpIHtcbiAgaWYgKHRoaXMuYWN0aXZlKSB7XG4gICAgLy8gcmVtb3ZlIHNlbGYgZnJvbSB2bSdzIHdhdGNoZXIgbGlzdFxuICAgIC8vIHdlIGNhbiBza2lwIHRoaXMgaWYgdGhlIHZtIGlmIGJlaW5nIGRlc3Ryb3llZFxuICAgIC8vIHdoaWNoIGNhbiBpbXByb3ZlIHRlYXJkb3duIHBlcmZvcm1hbmNlLlxuICAgIGlmICghdGhpcy52bS5faXNCZWluZ0Rlc3Ryb3llZCkge1xuICAgICAgdmFyIGxpc3QgPSB0aGlzLnZtLl93YXRjaGVyTGlzdFxuICAgICAgdmFyIGkgPSBsaXN0LmluZGV4T2YodGhpcylcbiAgICAgIGlmIChpID4gLTEpIHtcbiAgICAgICAgbGlzdC5zcGxpY2UoaSwgMSlcbiAgICAgIH1cbiAgICB9XG4gICAgZm9yICh2YXIgaWQgaW4gdGhpcy5kZXBzKSB7XG4gICAgICB0aGlzLmRlcHNbaWRdLnJlbW92ZVN1Yih0aGlzKVxuICAgIH1cbiAgICB0aGlzLmFjdGl2ZSA9IGZhbHNlXG4gICAgdGhpcy52bSA9IHRoaXMuY2JzID0gdGhpcy52YWx1ZSA9IG51bGxcbiAgfVxufVxuXG5cbi8qKlxuICogUmVjcnVzaXZlbHkgdHJhdmVyc2UgYW4gb2JqZWN0IHRvIGV2b2tlIGFsbCBjb252ZXJ0ZWRcbiAqIGdldHRlcnMsIHNvIHRoYXQgZXZlcnkgbmVzdGVkIHByb3BlcnR5IGluc2lkZSB0aGUgb2JqZWN0XG4gKiBpcyBjb2xsZWN0ZWQgYXMgYSBcImRlZXBcIiBkZXBlbmRlbmN5LlxuICpcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcbiAqL1xuXG5mdW5jdGlvbiB0cmF2ZXJzZSAob2JqKSB7XG4gIHZhciBrZXksIHZhbCwgaVxuICBmb3IgKGtleSBpbiBvYmopIHtcbiAgICB2YWwgPSBvYmpba2V5XVxuICAgIGlmIChfLmlzQXJyYXkodmFsKSkge1xuICAgICAgaSA9IHZhbC5sZW5ndGhcbiAgICAgIHdoaWxlIChpLS0pIHRyYXZlcnNlKHZhbFtpXSlcbiAgICB9IGVsc2UgaWYgKF8uaXNPYmplY3QodmFsKSkge1xuICAgICAgdHJhdmVyc2UodmFsKVxuICAgIH1cbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IFdhdGNoZXIiLCJ2YXIgVnVlID0gcmVxdWlyZSgndnVlJylcblxudmFyIGFwcCA9IG5ldyBWdWUocmVxdWlyZSgnLi9hcHAnKSlcblxuYXBwLiRtb3VudChkb2N1bWVudC5ib2R5KVxuIl19
