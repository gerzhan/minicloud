if [ -e '/usr/local/bin/iojs' ]; then 
	node ./test/index-test.js & 
else 
	node --harmony-generators ./test/index-test.js & 
fi
sleep 5