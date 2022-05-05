// Includes
var https = require('https');
var express = require('express');
var tls = require('tls');
var vhost = require('vhost');
var fs = require('fs');

const local = true;
const env = local?"dev":"";
// Express objects
var appVolatalk = express();
var appPeer = express();

// SSL Constants
const siteVolatalk = {
    app: appVolatalk,
    context: tls.createSecureContext({
        key: fs.readFileSync(__dirname + '/crt/volatalk.org.key').toString(),
        cert: fs.readFileSync(__dirname + '/crt/volatalk.org.crt').toString()
    }).context
};

const sitePeer = {
    app: appPeer,
    context: tls.createSecureContext({
        key: fs.readFileSync(__dirname + '/crt/peer.pm.key').toString(),
        cert: fs.readFileSync(__dirname + '/crt/peer.pm.crt').toString()
    }).context
};

// Sites
var sitesDev = {
    'www.volatalk.dev': siteVolatalk,
    'volatalk.org.dev': siteVolatalk,
    'peer.pm.dev': sitePeer
}
var sitesProd = {
    'www.volatalk.org': siteVolatalk,
    'volatalk.org': siteVolatalk,
    'peer.pm': sitePeer,
    'peered.me': sitePeer
}
var sites = sitesProd;   

// Setup vhosts
var exp = express();
for (var s in sites) {
    console.log("add app for " + s);
    exp.use(vhost(s, sites[s].app));
}

// Redirect from http port  to https
var http = require('http');
http.createServer(function (req, res) {
    res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
    console.log(req.headers['host']);
    console.log(req.url);
    res.end();
}).listen(80);

// HTTPS Server
var secureOpts = {
    SNICallback: function (domain, cb) {
        if (typeof sites[domain] === "undefined") {
            cb(new Error("domain not found"), null);
            console.log("Error: domain not found: " + domain);

        } else {
            cb(null, sites[domain].context);
        }
    },
    key: siteVolatalk.context.key,
    cert: siteVolatalk.context.cert
};

const PORT_HTTPS = 443;

var httpsServer = https.createServer(secureOpts, exp);
httpsServer.listen(PORT_HTTPS, function () {
    console.log("Listening https on port: " + + this.address().port);
});

appVolatalk.use(express.static("www"));


{ //SETUP PEER
    const { ExpressPeerServer } = require("peer");
    const PEERJS_CONTEXT = "/";
    const PEERJS_KEY = "pmkey";
    //serve peerjs
    const PEERJS_OPTIONS = {
      port: PORT_HTTPS,
      path: PEERJS_CONTEXT,
      key: PEERJS_KEY,
      debug: true,
      ssl: {
        key: sitePeer.context.key,
        cert: sitePeer.context.peer,
      },
    };
  
    const peerServer = ExpressPeerServer(exp, PEERJS_OPTIONS);
    var cors = require("cors");
    //appPeer.use(cors());
    peerServer.use(cors());
    appPeer.use(peerServer);
  }
