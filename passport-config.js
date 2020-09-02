const LocalStrategy = require("passport-local").Strategy
const bcrypt = require('bcrypt')

function initialize(passport) {
    const authenticateUser = (email, password, done) => {
        const user = getUserByEmail(email)
        if (user == null) {
            return done(null, false, {message: "Kein Nutzer mit der Email"});
        }
        try {
            if (await bcrypt.compare(password, user.password)) {
                return done(null, user)
            } else {
                return done(null, false, {message: "Falsches Passwort"})
            }
        } catch (e) {
            return done(e)
        }
    }

    passport.use(new LocalStrategy({
        usernameField: "Username",
        passwordField: "Password"
    }), authenticateUser)
    passport.serializeUser((user, done) => {

    })
    passport.deserializeUser((user, done) => {

    })
}

module.exports = initialize;
