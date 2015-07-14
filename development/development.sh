kill -9 $(ps aux | grep 'index-development' | awk '{print $2}')
node ./index-development.js &
sleep 5
npm test
kill -9 $(ps aux | grep 'index-development' | awk '{print $2}')