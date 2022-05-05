export DEBUG=true
export DIR_PUB_STATIC=../client/build/
export PORT_HTTPS=8443
export KEY_FILE=./crt/volatalk.dev.key
export CERT_FILE=./crt/volatalk.dev.crt
#node /home/admin/Server3.js 
#nohup 
node Server3.js &
