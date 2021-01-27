const passport = require('passport');
const LocalStrategy = require('passport-local');
import { User} from "../models/user";

passport.use(new LocalStrategy({
    usernameField: 'user[username]',
    passwordField: 'user[password]',
}, (username, password, done) => {
    console.log('strat')
    User.findOne({ where: {username} })
        .then((user) => {
            if(!user) {
                return done(null, false, { errors: { 'email or password': 'is invalid' } });
            }

            return done(null, user);
        }).catch(done);
}));