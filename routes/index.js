var express = require('express');
var router = express.Router();
var passport = require('passport');
const methodOverride = require('method-override')
const path = require('path');
const bcrypt = require('bcrypt')
var publicdir = path.normalize(path.normalize(__dirname + "/..") + "/public/HTMLs"); //Erlaubt probemlosen zugriff auf den Public Ordner
var viewdir = path.normalize(path.normalize(__dirname + "/..") + "/Views");  //Zugriff auf Views
const mongodb = require('mongodb');






/* GET home page. */
router.get('/', checkAuthenticated, async (req, res, next) => {
    res.redirect("/Startseite")

});
router.get('/Startseite', checkAuthenticated, async (req, res, next) => {
    var Nutzer = await req.user;
    if (Nutzer.Arzt){
        res.render(viewdir + "/Startseite.ejs",  {name: Nutzer.Name, Role: "Arzt Menü"});
    }else{
        res.render(viewdir + "/Startseite.ejs",  {name: Nutzer.Name, Role: null});
    }

});
router.get('/fahrt', checkAuthenticated,function (req, res, next) {
    res.sendFile(publicdir + '/FahrtTaetigen.html');

});
router.get('/fahrtdef', checkAuthenticated,async (req, res, next) =>{
    var Nutzer = await req.user;
    if (Nutzer.Arzt){
        res.render(viewdir + "/FahrtTaetigen.ejs",  {name: Nutzer.Name, Role: "Arzt Menü"});
    }else{
        res.render(viewdir + "/FahrtTaetigen.ejs",  {name: Nutzer.Name, Role: null});
    }
});
router.get('/GetaetigteFahrten', checkAuthenticated,async (req, res, next) => {
    var Nutzer = await req.user;
    if (Nutzer.Arzt){
        res.render(viewdir + "/GetaetigteFahrten.ejs",  {name: Nutzer.Name, Role: "Arzt Menü"});
    }else{
        res.render(viewdir + "/GetaetigteFahrten.ejs",  {name: Nutzer.Name, Role: null});
    }
});
//Todo: Rollen Abhängigkeit Hinzufügen
router.get('/Arzt', checkAuthenticated, isInRole, async (req, res, next) =>{
    var db = req.app.get("db");
    var Nutzer = await req.user;
    var User = await db.collection("nutzer").find({}).toArray();

    if (Nutzer.Arzt){
        res.render(viewdir + "/ArztMenue.ejs",  {name: Nutzer.Name, Role: "Arzt Menü", User: User});
    }else{
        res.render(viewdir + "/Startseite.ejs",  {name: Nutzer.Name, Role: null});
    }
});
router.get('/Registrierung',checkNotAuthenticated, function (req, res, next) {
    res.render(viewdir + '/Registrierung.ejs');
});
router.get('/Login', checkNotAuthenticated,function (req, res, next) {
    res.render(viewdir + '/Login.ejs');
});
//User System

router.post("/register", checkNotAuthenticated, async (req, res) => {
    try {
        var db = req.app.get("db");
        hashedpassword = await bcrypt.hash(req.body.Password, 10);

        var exNutzer = await db.collection("nutzer").find({Email: req.body.Email}).toArray();


        try{
            if (req.body.Email == exNutzer[0].Email) {
                res.redirect("/Registrierung") //Todo: Ersetzen durch Fehlermeldung
                return;
            }
        }catch (e){
            //Keine bessere Idee für ne Lösung
        }

        var Arzt = false;


        if(req.body.Rolle == "Arzt"){
            Arzt = true;
        }
        db.collection("nutzer").insertOne({
            Name: req.body.Username,
            Email: req.body.Email,
            password: hashedpassword,
            Arzt: Arzt,
            Fahrten: []
        })
        res.redirect("/Login")
    } catch (e) {
        console.log(e)
    }

})

router.delete("/logout", ((req, res) => {
    req.logOut();
    res.redirect("/Login")
}))

router.post("/Login", passport.authenticate('local', {
    successRedirect: '/Startseite',
    failureRedirect: '/Login',
    failureFlash: true
}))




//Datenbakrouten
//Müsste eine Fahrt entgegennehmen und speichern
router.post("/setFahrten",checkAuthenticated, async (req, res) => {
    try {
        //Todo: Evtl daten erst verifizieren bevor ich sie in die Datenbank packe
        //Fahrt  in die Fahrtdatenbank packen
        var Nutzer = await req.user;
        var db = req.app.get("db");
        var data = req.body;
        db.collection("fahrten").insertOne(data);

        //In der Nutzer Datenbank  dem Nutzer die Fahrt  Hinzufügen
        var user = await req.user;
        var Nutzer = await db.collection("nutzer").find({_id: new mongodb.ObjectID(user._id)}).toArray();
        Nutzer[0].Fahrten.push(data._id)
        db.collection("nutzer").updateOne({_id:  user._id},{$set:  {Fahrten: Nutzer[0].Fahrten}})



        res.send({status: 'SUCCESS'});
    } catch (e) {
        console.log(e)
    }
})
router.post("/Markieren",  async (req, res) => {

    var db = req.app.get("db");
    var user = await req.user;
    var Nutzer = await db.collection("nutzer").find({_id: new mongodb.ObjectID(user._id)}).toArray();

})



//Sendet Fahrt zurück
//Todo: Fahrt Filtern
router.get("/getFahrten", async (req, res) => {
    var db = req.app.get("db");
    var db = req.app.get("db");
    var user = await req.user;
    var Fahrten = [];
    var Nutzer = await db.collection("nutzer").find({_id: new mongodb.ObjectID(user._id)}).toArray();
    for(var i = 0; i<Nutzer[0].Fahrten.length; i++){
        var data = await db.collection("fahrten").find({_id: Nutzer[0].Fahrten[i]}).toArray();
        Fahrten.push(data[0]);
    }
    var result =  {Fahrten: Fahrten};
    res.json(result);
})



function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }

    res.redirect('/Login')
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/Startseite')
    }
    next()
}
async function isInRole(req, res, next){
    var Nutzer = await req.user
    if(!Nutzer.Arzt){
        return res.redirect("/Startseite") //Todo: Durch Fehlermeldung Ergänzen
    }
    next();
}

module.exports = router;
