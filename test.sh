node ./test/index-test.js &
sleep 5
npm test
kill -9 $(ps aux | grep 'index-test' | awk '{print $2}')