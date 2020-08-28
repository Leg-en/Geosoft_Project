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
router.get('/fahrtdef', function(req, res, next) {
  res.sendFile(publicdir+'/FahrtTaetigenSimple.html');
});
router.get('/GetaetigteFahrten', function(req, res, next) {
  res.sendFile(publicdir+'/GetaetigteFahrten.html');
});
//Todo: Rollen Abhängigkeit Hinzufügen
router.get('/Arzt', function(req, res, next) {
  res.sendFile(publicdir+'/ArztMenue.html');
});
router.get('/Registrierung', function(req, res, next) {
  res.sendFile(publicdir+'/Registrierung.html');
});
router.get('/Login', function(req, res, next) {
  res.sendFile(publicdir+'/Login.html');
});

//Datenbakrouten
//Müsste eine Fahrt entgegennehmen und speichern
router.post("/setFahrten", (req, res)=>{
  //Todo: Evtl daten erst verifizieren bevor ich sie in die Datenbank packe
  app.locals.db.collection("fahrten").insertOne(req.body);
  res.send({status: 'SUCCESS'});
});
//Sendet Fahrt zurück
//Todo: Fahrt Filtern
router.get("/getFahrten", (req, res)=>{
  app.locals.db.collection("fahrten").find({}).toArray((mongoError, result)=>{
    if(mongoError) throw mongoError;
    res.json(result);
  });
})

module.exports = router;
