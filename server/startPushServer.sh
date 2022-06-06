export DEBUG=true
export PORT_HTTPS=432
export KEY_FILE=./crt/peered.me.key
export CERT_FILE=./crt/peered.me.crt

export DO_STATIC=false
export DO_PEERJS=false;

export DO_CORS=true
export DO_WEBPUSH=true;

export WEBPUSH_CONTEXT=/push

export VAPID_SUBJECT=mailto:push@peered.me

export VAPID_PUBKEY=BOzjBiLaa9psTJ5Nd5T8WEPQjq92HmPgzSr4Lvr53AVGsEhcQiWmjP8crRxS5CIq4KVxCbnBUl5v55axenXLjCg
export VAPID_PRIVKEY=4OJkW95WhL4JzBir_IShOzyjbCLo0gtwZNpcNuvMxAw

node /home/admin/Server.js -pushserver > ./logs/pushserver.log 2>&1 

