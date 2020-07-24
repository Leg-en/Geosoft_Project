var express = require('express');
var router = express.Router();
const path = require('path');
var publicdir = path.normalize(path.normalize(__dirname+"/..")+"/public/HTMLs"); //Erlaubt probemlosen zugriff auf den Public Ordner

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});
router.get('/Startseite', function(req, res, next) {
  res.sendFile(publicdir+'/Startseite.html');
});
router.get('/fahrt', function(req, res, next) {
  res.sendFile(publicdir+'/FahrtTaetigen.html');
});
router.get('/GetaetigteFahrten', function(req, res, next) {
  res.sendFile(publicdir+'/GetaetigteFahrten.html');
});
//Todo: Rollen Abhängigkeit Hinzufügen
router.get('/Arzt', function(req, res, next) {
  res.sendFile(publicdir+'/ArztMenue.html');
});
module.exports = router;
