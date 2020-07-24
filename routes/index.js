var express = require('express');
var router = express.Router();
const path = require('path');
var publicdir = path.normalize(path.normalize(__dirname+"/..")+"/public"); //Erlaubt probemlosen zugriff auf den Public Ordner

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.get('/Startseite', function(req, res, next) {
  res.sendFile(publicdir+'/Startseite.html');
});

module.exports = router;
