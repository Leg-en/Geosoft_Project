var express = require('express');
var router = express.Router();
var passport = require('passport');
const methodOverride = require('method-override')
const path = require('path');
const bcrypt = require('bcrypt')
var publicdir = path.normalize(path.normalize(__dirname + "/..") + "/public/HTMLs"); //Erlaubt probemlosen zugriff auf den Public Ordner
var viewdir = path.normalize(path.normalize(__dirname + "/..") + "/Views");  //Zugriff auf Views







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
            Arzt: Arzt
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
        var Nutzer = await req.user;
        var db = req.app.get("db");
        var data = req.body;
        data.NutzerID = Nutzer._id;
        db.collection("fahrten").insertOne(data);
        res.send({status: 'SUCCESS'});
    } catch (e) {
        console.log(e)
    }
})
router.post("/Markieren",  (req, res) => {
    console.log(req.body)
    //var db = req.app.get("db");
    //db.collection("nutz")
})



//Sendet Fahrt zurück
//Todo: Fahrt Filtern
router.get("/getFahrten", (req, res) => {
    var db = req.app.get("db");
    db.collection("fahrten").find({}).toArray((mongoError, result) => {
        if (mongoError) throw mongoError;
        res.json(result);
    });
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
