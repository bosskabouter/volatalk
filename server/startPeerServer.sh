 

export DEBUG=true
export PORT_HTTPS=999
export KEY_FILE=./crt/peer.pm.key
export CERT_FILE=./crt/peer.pm.crt

export DO_STATIC=false
export DO_WEBPUSH=false;

export DO_CORS=true

export DO_PEERJS=true;
export DO_PEERJS_SECURE=true;
export PEER_CONTEXT=/
export PEERJS_KEY=volakey

node /home/admin/Server.js -peerserver > ./logs/peerserver.log 2>&1 


