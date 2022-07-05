cd ./client/
npm run build
cd ..
cp -r ./client/build/* ./server/www/
cd ./server/
npm start

