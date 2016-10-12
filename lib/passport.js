// config/passport.js

// load all the things we need
var LocalStrategy   = require('passport-local').Strategy;
// var flash = require('connect-flash');

// load up the user model
var mysql = require('mysql');
var bcrypt = require('bcrypt-nodejs');
var dbconfig = require('./database');
var connection = mysql.createConnection(dbconfig.connection);
var config = require('../config');
var flash = require('connect-flash');

var SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
var SENDGRID_SENDER = process.env.SENDGRID_SENDER;
var Sendgrid = require('sendgrid')(SENDGRID_API_KEY);
 
function getModel () {
  return require('../clubs/model-' + config.get('DATA_BACKEND'));
}

connection.query('USE ' + dbconfig.database);
// expose this function to our app using module.exports
module.exports = function(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session
    // used to serialize the user for the session
    passport.serializeUser(function(incoming_user, done) {
        return done(null, incoming_user.ID);
    });

    // used to deserialize the user
    passport.deserializeUser(function(user_id, done) {
        connection.query("SELECT * FROM users WHERE id = ? ", user_id, function(err, rows){
            if(rows){
                done(err, rows[0]);
            }
            else 
                console.log(err)
        });
    });

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use(
        'local-signup',
        new LocalStrategy({
            // by default, local strategy uses email and password, we will override with email
            usernameField : 'email',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, username, password, done) {
            function isValidEmailAddress(emailAddress) {
              var pattern = /^([a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+(\.[a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)*|"((([ \t]*\r\n)?[ \t]+)?([\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*(([ \t]*\r\n)?[ \t]+)?")@(([a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.)+([a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.?$/i;
              return pattern.test(emailAddress);
            };

            if (req.body.is_university_student == 0 &&
                (isValidEmailAddress(username) == false || username.indexOf(".edu") == -1 || username.indexOf(".ac") == -1)){
                return done(null, false, req.flash("Choose the correct type"))
            }
            // find a user whose email is the same as the forms email
            // we are checking to see if the user trying to login already exists
            connection.query("SELECT * FROM users WHERE email = ?",[username], function(err, rows) {
                if (err)
                    return done(err);
                if (rows.length) {
                    return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
                } 
                else {
                    // if there is no user with that email
                    // create the user
                    var newUserMysql = {
                        username: username,
                        password: password//bcrypt.hashSync(password, null, null)  // use the generateHash function in our user model
                    };

                    // ==== glasshopper insert BEGIN ====
                    var incoming_data = req.body;
                    // console.log(incoming_data)
                    //console.log(req)
                    //console.log(incoming_data)

                    //regular controls
                    // if (req.user) {
                    //    res.redirect("/profile");
                    // }

                    if (incoming_data.read_tc == 0){
                      return done(null, false, req.flash('signupMessage', 'Make sure you read the Terms and Conditions'));
                    }

                    if(incoming_data.password != incoming_data['repeat-password']){
                        return done(null, false, req.flash('signupMessage', 'Your passwords are not matching'))
                    }

                    //fine user data to submit to db
                    var user_data = incoming_data

                    delete user_data['repeat-password']
                    delete user_data.read_tc

                    if (user_data.is_university_student == 1){
                      if (!user_data.university_name){
                        return done(null, false, req.flash('signupMessage', 'We couldn\'t find your university. Make sure you type your university email with .edu or .ac'))
                      }
                      // user_data.personal_email = user_data.email
                      user_data.edu_email = user_data.email
                      user_data.demographic_type = user_data.year
                    }

                    else{
                      // user_data.personal_email = user_data.email
                      user_data.demographic_type = 0
                    }

                    user_data.name = user_data.real_name

                    delete user_data.real_name
                    // delete user_data.email
                    delete user_data.year

                    user_data.password = newUserMysql.password

                    //console.log(user_data)
                    if(user_data.is_university_student == 1){
                        // console.log(user_data)
                      getModel().find_uni(user_data.university_name, function (err, entity) {
                        // console.log(entity)
                        if (err) {
                            return done(null, false, req.flash('signupMessage', 'We couldn\'t find your university. Make sure you type your university email with .edu or .ac'))
                        }
                        user_data.college_id = entity.id
                        delete user_data.university_name

                        delete user_data.is_university_student
                        getModel().create_user(user_data, function (err, savedData) {
                          if (err) {
                            return done(null, false, req.flash('signupMessage', 'A problem occured. Please try again'))
                          }
                          // console.log("aa")
                          // console.log(savedData['insertId'])
                          // console.log(savedData.insertId)
                          // console.log(savedData.OkPacket.insertId)
                          user_data.ID = savedData.insertId
                          return done(null, user_data);
                        })
                      });
                    }
                    else{
                        // console.log(user_data)
                      delete user_data.is_university_student
                      delete user_data.university_name

                      getModel().create_user(user_data, function (err, savedData) {
                        if (err) {
                            return done(null, false, req.flash('signupMessage', 'A problem occured. Please try again'))
                        }
                        user_data.ID = savedData.insertId
                        return done(null, user_data);
                      })
                    }
                    // ==== glasshopper insert END ====

                    // var insertQuery = "INSERT INTO users ( email, password ) values (?,?)";

                    // connection.query(insertQuery,[newUserMysql.email, newUserMysql.password],function(err, rows) {
                        // newUserMysql.id = rows.insertId;
                    
                    // });
                }
            });
        })
    );

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use(
        'local-login',
        new LocalStrategy({
            // by default, local strategy uses email and password, we will override with email
            usernameField : 'email',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, username, password, done) { // callback with email and password from our form
            connection.query("SELECT * FROM users WHERE email = ?",[username], function(err, rows){
                if (err)
                    return done(err);
                if (!rows.length) {
                    return done(null, false, req.flash('loginMessage', 'No user found with this email.')); // req.flash is the way to set flashdata using connect-flash
                }

                // console.log(password)
                // console.log(rows[0].password)
                // password = bcrypt.hashSync(password, null, null) 
                // console.log(password)
                // if the user is found but the password is wrong
                if (password!= rows[0].password){//!bcrypt.compareSync(password, rows[0].password)){
                    return done(null, false, req.flash('loginMessage', 'Oops! Wrong password. Try again')); //, req.flash('loginMessage', )); // create the loginMessage and save it to session as flashdata
                }
                //console.log("successfully logged in")
                //console.log(rows[0])
                // all is well, return successful user
                return done(null, rows[0]);
            });
        })
    );
};