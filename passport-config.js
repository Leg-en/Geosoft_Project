const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')

function initialize(passport, getUserByEmail, getUserById) {
    const authenticateUser = async (email, password, done) => {
        const user = await getUserByEmail(email)
        if (user == null) {
            console.log("No user with that email")
            return done(null, false, {message: 'Kein Konto unter dieser Email gefunden.'})
        }

        try {
            if (await bcrypt.compare(password, user.password)) {
                return done(null, user)
            } else {
                console.log("Password incorrect")
                return done(null, false, {message: 'Falsches Passwort'})
            }
        } catch (e) {
            console.log(e)
            return done(e)
        }
    }

    passport.use(new LocalStrategy({usernameField: 'email'}, authenticateUser))
    passport.serializeUser((user, done) => {
        done(null, user._id)});
    passport.deserializeUser( (id, done) => {
        var User =  getUserById(id)
        done(null, User)
    });
}

module.exports = initialize
