const LocalStrategy = require('passport-local').Strategy
const bcrypt = require('bcrypt')

function initialize(passport, getUserByEmail, getUserById) {
    const authenticateUser = async (email, password, done) => {
        const user = await getUserByEmail(email)
        console.log(user)
        if (user == null) {
            console.log("No user with that email")
            return done(null, false, {message: 'No user with that email'})
        }

        try {
            if (await bcrypt.compare(password, user.password)) {
                return done(null, user)
            } else {
                console.log("Password incorrect")
                return done(null, false, {message: 'Password incorrect'})
            }
        } catch (e) {
            console.log(e)
            return done(e)
        }
    }

    passport.use(new LocalStrategy({usernameField: 'email'}, authenticateUser))
    passport.serializeUser((user, done) => {
        done(null, user._id)});
    passport.deserializeUser((id, done) => {
        done(null, getUserById(id))
    });
}

module.exports = initialize
