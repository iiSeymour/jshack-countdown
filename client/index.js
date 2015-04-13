var express = require('express');
var app = express();

var router = express.Router();
router.use(express.static(__dirname + '/views'));

var options = {
    root: __dirname + '/views/',
    dotfiles: 'deny',
    headers: {
        'x-timestamp': Date.now(),
        'x-sent': true
    }
  };


app.get('/', function(req, res) {
  res.sendFile('index.html', options);
});

app.use(router);
app.listen(3000);
