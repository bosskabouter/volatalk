machinename=`hostname`
echo $machinename
echo "Generating self-signed certificate for: $machinename"
openssl req -x509 -out $machinename.crt -keyout $machinename.key \
-newkey rsa:2048 -nodes -sha256 \
-subj '/CN='$machinename -extensions EXT -config <( \
printf "[dn]\nCN=$machinename\n[req]\ndistinguished_name = dn\n[EXT]\nsubjectAltName=DNS:\"$machinename\"\nkeyUsage=digitalSignature\nextendedKeyUsage=serverAuth")
