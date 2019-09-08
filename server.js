var http = require('http');
var port = 3000;
var url = require('url');
var fs = require('fs');
var path = require('path');
var mime = require('./mime').types;
var config = require('./config').Expires;
/*config.fileMatch
config.maxAge*/
var server = http.createServer(function(request,response) {
	var pathname = url.parse(request.url).pathname;
	var realPath = 'assets' +pathname;
	var ext = path.extname(realPath);
	
	ext = ext ? ext.slice(1) : 'unknow';
	var contentType = mime[ext] || 'text/plain';
	/*加入缓存*/
	if(ext.match(config.fileMatch)) {
		var expires = new Date();
		expires.setTime(expires.getTime() + config.maxAge * 1000);
		response.setHeader('Expires',expires.toUTCString());
		response.setHeader('Cache-Control','max-age='+ config.maxAge);

	}
	fs.stat(realPath,function(err,stat){
		/*设置lastModified*/
		
		var lastModified = stat.mtime.toUTCString();
		response.setHeader('Last-Modified',lastModified);

		if(request.headers['if-modified-since'] && lastModified == request.headers['if-modified-since']) {
			response.writeHead(304,'Not Modified');
			response.end();
		} else {
			fs.exists(realPath,function(exists){
			if(!exists) {
				response.writeHead(404,{
					'Content-Type':'text/plain'
				})

				response.write('not Found');
				response.end();
			} else {
				fs.readFile(realPath,'binary',function(err,file) {
					if(err) {
						response.writeHead(500,{
							'Content-Type':'text/plain'
						})
						response.end();
					} else {
						response.writeHead(200,{
							'Content-Type':contentType
						})
						response.write(file,'binary');
						response.end();

					}
				})
		   }
		}
	  )
	}
  })
	
});
server.listen(port);
console.log('Server runing at port:' + port);