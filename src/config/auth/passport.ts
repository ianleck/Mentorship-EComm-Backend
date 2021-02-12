import {Student} from "../../models/Student";

const LocalStrategy = require('passport-local').Strategy;
import bcrypt from 'bcrypt';
import {Sensei} from "../../models/Sensei";

module.exports = function(passport) {
    passport.use('sensei-local',
        new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
            // Match user
            Sensei.findOne({
                where:{email}
            }).then(user => {
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

    passport.use('student-local',
        new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
            // Match user
            Student.findOne({
                where: {email}
            }).then(student => {
                if (!student) {
                    return done(null, false, { message: 'Invalid email or password' });
                }

                // Match password
                bcrypt.compare(password, student.password, (err, isMatch) => {
                    if (err) throw err;
                    if (isMatch) {
                        return done(null, student);
                    } else {
                        return done(null, false, { message: 'Invalid email or password' });
                    }
                });
            });
        })
    );

    passport.serializeUser(function(user, done) { // Got to test once login interface is done
        done(null, { id: user.accountId, type: user.userType });
    });

    passport.deserializeUser(function (obj, done) {
        switch (obj.userType) {
            case 'STUDENT':
                Student.findOne({where: {accountId: obj.accountId}})
                    .then(user => {
                        if (user) {
                            done(null, user);
                        }
                        else {
                            done(new Error('user id not found:' + obj.accountId));
                        }
                    });
                break;
            case 'SENSEI':
                Sensei.findOne({where: {accountId: obj.accountId}})
                    .then(device => {
                        if (device) {
                            done(null, device);
                        } else {
                            done(new Error('device id not found:' + obj.accountId));
                        }
                    });
                break;
            default:
                done(new Error('no entity type:'+ obj.userType));
                break;
        }
    });
};