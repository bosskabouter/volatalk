export DEBUG=true
export PORT_HTTPS=443
export KEY_FILE=./crt/volatalk.org.key
export CERT_FILE=./crt/volatalk.org.crt

export DO_CORS=false
export DO_WEBPUSH=false;
export DO_PEERJS=false;

export DO_STATIC=true
export DIR_PUB_STATIC=/www

node /home/admin/Server.js -webserver > ./logs/webserver.log 2>&1 
