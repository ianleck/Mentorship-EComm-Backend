// import { Student } from '../../models/Student';
import bcrypt from 'bcrypt';
import { JWT_SECRET } from '../../constants/constants';
import { Admin } from '../../models/Admin';
import { User } from '../../models/User';

const LocalStrategy = require('passport-local').Strategy;

const passportJWT = require('passport-jwt');

const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

module.exports = function (passport) {
  passport.use(
    'isAuthenticated',
    new JWTStrategy(
      {
        jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
        secretOrKey: JWT_SECRET,
      },
      (jwtPayload, done) => {
        done(null, jwtPayload);
      }
    )
  );

  passport.use(
    'jwt-local',
    new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
      // Match user
      User.findOne({
        where: {
          email,
        },
      }).then((user) => {
        if (!user) {
          return done(null, false, { message: 'Invalid email or password' });
        }

        // Match password
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) throw err;
          if (isMatch) {
            return done(null, user);
          } else {
            return done(null, false, { message: 'Invalid email or password' });
          }
        });
      });
    })
  );
  passport.use(
    'admin-local',
    new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
      // Match user
      Admin.findOne({
        where: { email },
      }).then((admin) => {
        if (!admin) {
          return done(null, false, { message: 'Invalid email or password' });
        }

        // Match password
        bcrypt.compare(password, admin.password, (err, isMatch) => {
          if (err) throw err;
          if (isMatch) {
            return done(null, admin);
          } else {
            return done(null, false, { message: 'Invalid email or password' });
          }
        });
      });
    })
  );
};
