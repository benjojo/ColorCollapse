var connect = require('connect');
connect.createServer(
    connect.static(__dirname)
).listen(8080);
connect.createServer(
    connect.static(__dirname)
).listen(8081);
