var cp = require('child_process')
var c= "node --version"
var command = cp.spawn('sh', ['-c', c]);
command.stdout.on('data', function (data) {
	var isNode = false
	var version = data.toString() 
	if(version.substring(0,2)=="v0"){
		isNode = true
	}
	c = "node ./test/index-test.js &"
    if(isNode){
    	c = "node --harmony-generators ./test/index-test.js &"
    } 
    cp.spawn('sh', ['-c', c], { stdio: 'inherit' })
})