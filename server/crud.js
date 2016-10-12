'use strict';
 
var express = require('express');
var config = require('../config');
var images = require('../lib/images');
var multer  =   require('multer');
var oauth2 = require('../lib/oauth2');

var Hashids = require('hashids');

var hashids = new Hashids("tuzlusu", 19, "denizkumgunestatilxyzwql");

var SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
var SENDGRID_SENDER = process.env.SENDGRID_SENDER;
var SIGNUP_TEMPLATE_ID = process.env.SIGNUP_TEMPLATE_ID;

// var oauth2 = require('../lib/oauth2');
var passport = require('passport');
var flash = require('connect-flash');
 
var bodyParser = require('body-parser');
 
var jsonParser = bodyParser.json({ type: 'application/json'});
 
function getModel () {
  return require('./model-' + config.get('DATA_BACKEND'));
}

function email(email_address, template_id, subject){
  var helper = require('sendgrid').mail;
  var from_email = new helper.Email(SENDGRID_SENDER);
  var to_email = new helper.Email(email_address);
  var subject = subject;
  var content = new helper.Content(
    'text/html', 'I\'m replacing the <strong>body tag</strong>');
  var mail = new helper.Mail(from_email, subject, to_email, content);
  // mail.personalizations[0].addSubstitution(
  //   new helper.Substitution('-name-', 'Example User'));
  // mail.personalizations[0].addSubstitution(
  //   new helper.Substitution('-city-', 'Denver'));
  mail.setTemplateId(template_id);

  var sg = require('sendgrid')(SENDGRID_API_KEY);
  var request = sg.emptyRequest({
    method: 'POST',
    path: '/v3/mail/send',
    body: mail.toJSON(),
  });

  sg.API(request, function(error, response) {
    console.log(response.statusCode);
    console.log(response.body);
    console.log(response.headers);
  });
}


var router = express.Router();

router.use(flash())

// router.use(session({ secret: 'keyboard cat' }))
// Use the oauth middleware to automatically get the user's profile
// information and expose login/logout URLs to templates.
// router.use(oauth2.template);
 
// Set Content-Type for all responses for these routes
router.use(function (req, res, next) {
  res.set('Content-Type', 'text/html');
  return next();
});

router.use(function(req, res, next) {
    // res.locals.ref_path = (req.url == '') ? req.url : '/'
    res.locals.user = req.user;
    return next();
});

function isLoggedIn(req, res, next) {
  // if user is authenticated in the session, carry on
  if (req.isAuthenticated() && req.user){
    res.locals.user = req.user
    return next();
  }
  // if they aren't redirect them to the home page
  return res.redirect('/');
}
 
// router.post('/api/photo',function(req,res){
//     upload(req,res,function(err) {
//         if(err) {
//             return res.end("Error uploading file.");
//         }
//         res.end("File is uploaded");
//     });
// });

/**
 * GET /clubs/add
 *
 * Display a page of clubs (up to ten at a time).
 */
router.get('/', function list (req, res, next) {
    res.render('clubs/search-container.jade')
  });

// router.get('/flash', function(req, res){
//   res.redirect('/', { message: req.flash('error') });
// });
 
 
router.get('/what-is-glasshopper',function (req, res, next) {
  res.render('clubs/what-is-glasshopper.jade');
});

router.get('/terms-conditions', function (req, res, next){
  res.render('tc.jade')
})
 
// [START mine]
// Use the oauth2.required middleware to ensure that only logged-in users
// can access this handler.
// router.get('/mine', oauth2.required, function list (req, res, next) {
//   getModel().listBy(
//     req.user.id,
//     10,
//     req.query.pageToken,
//     function (err, entities, cursor, apiResponse) {
//       if (err) {
//         return next(err);
//       }
//       res.render('clubs/list.jade', {
//         clubs: entities,
//         nextPageToken: cursor
//       });
//     }
//   );
// });
// [END mine]
 
/**
 * GET /clubs/add
 *
 * Display a form for creating a club.
 */
router.get('/review', isLoggedIn, function addForm (req, res) {
  res.render('clubs/review_form.jade', {
    action_header: 'Review your organization',
  });
});

router.get('/browse', function browse (req, res, next){
  getModel().get_club_types(function (err, club_types){
    // console.log(club_types)
    if(err){
      return next(err)
    }
    if (req.query){
      return res.render('clubs/browse_page.jade',{
        club_types: club_types,
        university: req.query.uni
      });
    }
    res.render('clubs/browse_page.jade',{
      club_types: club_types
    });
  })
})

router.get('/claim', isLoggedIn, function addForm (req, res, next) {
  var encoded_club_id = req.query.club
  var decoded_club_id = hashids.decode(req.query.club)
  req.query.club = decoded_club_id
  res.locals.club = req.query.club
  if (!req.query.club)
  {
      res.redirect('/')
  }
  else 
  {
    getModel().get_club_by_id(req.query.club, function(err, club){
      if (err) {
        return next(err);
      }
      getModel().get_club_types(function (err, club_types){
        // console.log(club_types)
        if(err){
          return next(err)
        }
        if (club.is_claimed_by_userid && club.is_claimed == 0){
          res.status(404).send('We\'re processing the claiming of this club')
        }
        else if (club.is_claimed_by_userid && club.is_claimed == 1){
          res.status(404).send('This club is already claimed')
        }
        else{
          res.render('clubs/club_form.jade',{
            club: club,
            club_types: club_types,
            query_id: encoded_club_id
          });
        }
      })
    })
  }
});

router.get('/verify', isLoggedIn, function addForm (req, res, next) {
  var decoded_club_id = hashids.decode(req.query.club)
  req.query.club = decoded_club_id
  res.locals.club = req.query.club
  if (!req.query.club)
  {
      res.redirect('/')
  }
  else 
  {
    getModel().get_club_by_id(req.query.club, function(err, club){
      if (err) {
        return next(err);
      }
      res.render('clubs/member_entry.jade',{
        club: club
      })
    })
  }
});

router.post('/verify/:club_id', isLoggedIn, function addForm (req, res, next) {
  var decoded_club_id = hashids.decode(req.params.club_id)
  req.params.club_id = decoded_club_id

  if (!req.params.club_id)
  {
      res.send({'redirect': '/'})
  }
  else 
  {
    getModel().get_club_by_id(req.params.club_id, function(err, club){
      if (err) {
        return next(err);
      }
      if (req.body.member_emails){
        getModel().save_verified_users(club.ID, req.user.ID, req.body.member_emails, function(err){
          if (err){
            return next(err)
          }
          res.send({'redirect': '/' + club.university_url + '/' + club.glasshopper_url})
        })
      }
      else{
        return
      }
    })
  }
});

router.post(
  '/claim', 
  images.multer.single('logo'),
  images.sendUploadToGCS, jsonParser, 
  function (req, res, next) {
      var decoded_club_id = hashids.decode(req.query.club)
      req.query.club = decoded_club_id
      // console.log("form submitteed ")
      // console.log(incoming_data)
      //console.log(req)

      
      // club_data.is_claimed_by_userid = req.user.id
      // // console.log(req)
      // club_data.id = req.query.club
      // club_data.is_claimed = 1

      // console.log(club_data)conso

      getModel().get_club_by_id(req.query.club, function (err, entity) {
        var club_data = entity
        club_data = req.body
        club_data.is_claimed_by_userid = req.user.ID
        // console.log(req)
        club_data.id = req.query.club

        if (req.file){
          club_data.logo_url = req.file.path
        }

        if (club_data.is_claimed == 1){
          return next(err)
        } 

        if (req.file && req.file.cloudStoragePublicUrl) {
          club_data.logo_url = req.file.cloudStoragePublicUrl;
        }


        delete club_data.university_name
        delete club_data.university_url

        // console.log("UPDATE")
        if(err){
          return next(err)
        }

        getModel().update_club(club_data.id, club_data, function(err, savedData){
          if(err){
            return next(err)
          }
          email(req.user.email, '84d523c3-94c4-46ba-a5d8-732d27192121', 'Thank you for claiming ' + club_data.name + '!')
          return res.redirect("/" + entity.university_url + '/' + entity.glasshopper_url)
        })
      });
    })

 
router.get('/signup', function addForm (req, res) {
  if (req.user){
    return res.redirect('/profile')
  }
  res.render('clubs/registration_form.jade', {message: req.flash('signupMessage')});
});

router.get('/login', function addForm (req, res) {
  if (req.user){
    return res.redirect('/profile')
  }
  res.render('clubs/login_form.jade', {message: req.flash('loginMessage')});
});

// process the login form
router.post('/login', passport.authenticate('local-login', {
          successRedirect : '/', // redirect to the secure profile section
          failureRedirect : '/login', // redirect back to the signup page if there is an error
          failureFlash : true // allow flash messages
  })
);

// =====================================
// PROFILE SECTION =========================
// =====================================
// we will want this protected so you have to be logged in to visit
// we will use route middleware to verify this (the isLoggedIn function)
router.get('/profile', isLoggedIn, function(req, res, next) {
  getModel().read_user(req.user.ID, function (err, user_full_info) {
    if (err){
      return next(err)
    }
    getModel().read_user_following_clubs(req.user, function(err, clubs_following) {
      if (err){
        return next(err)
      }
      getModel().read_user_verified_member(req.user, function(err, verified_member_in){
        if (err){
          return next(err)
        }
        getModel().suggest_clubs_user(req.user, function(err, suggested_clubs){
          if (err){
            return next(err)
          }
          getModel().list_reviews_by_user(req.user, function (err, reviews_by_user){
            if (err){
              return next(err)
            }
            res.render('clubs/profile.jade', {
              user : user_full_info,
              clubs_following : clubs_following,
              clubs_verified:  verified_member_in,
              reviews_by_user: reviews_by_user,// get the user out of session and pass to template
              suggested_clubs: suggested_clubs
            });
          })
        })
      })
    })
  })
});


// route middleware to make sure


// =====================================
// LOGOUT ==============================
// =====================================
router.get('/logout',  isLoggedIn, function(req, res, next) {
   if ( req.isUnauthenticated() ) {

          // you are not even logged in, wtf
          res.redirect( '/' );

          return;

    }
    // console.log(req.session)
    // var sessionCookie = req.cookies['connect.sid'];

    // if ( ! sessionCookie ) {

    //     // nothing to do here
    //     res.redirect( '/' );

    //     return;
    // }
    // res.clearCookie(sessionCookie, { path: '/' });

    req.logout();
    res.clearCookie('userid', {path: '/'});
    // console.log(req.session)
    req.session.destroy()
    req.sessionStore.destroy()
        res.redirect('/');
    // console.log(req.session)

    // res.redirect( '/' );

});


router.get('/:university_url', function get (req, res, next) {

  if (req.query && req.query.method == 'json'){
    getModel().get_clubs(req.params.university_url, function (err, entities) {
      if (err) {
        return next(err);
      }
      res.json(entities);
    });
  }
  else{
    getModel().find_uni(req.params.university_url, function (err, entity) {
      if (err) {
        return next(err);
      }
      res.redirect('/browse?uni=' + entity.name)
    });
  }
});
 
/**
 * POST /clubs/add
 *
 * Create a club.
 */
// [START add]
router.post(
  '/review', jsonParser, function insert_review (req, res, next) {
    console.log(req.body)
    var incoming_data = req.body;
    // console.log(incoming_data)
    //console.log(req)
 
    if (req.user && req.user.demographic_type != 0) {
       incoming_data.created_by = req.user.name;
       incoming_data.user_id = req.user.ID;
       incoming_data.reviewer_year_num = req.user.demographic_type;
     } 
     else {
       return res.redirect("/");
     }

    getModel().find_club_by_name(incoming_data['uni-name'].toLowerCase(), incoming_data['club-name'].toLowerCase(), function (err, entity) {
      if (err) {
        return next(err);
      }
 
      var review_data = incoming_data

      review_data.overall_recommend = (incoming_data.overall_recommend == 'on')
      review_data.approve_leadership = (incoming_data.approve_leadership == 'on')
      review_data.is_anon = (incoming_data.is_anon == 'on')
       
      //changing the data to db form
      delete review_data['uni-name']
      delete review_data['club-name']
      review_data.club_id = entity.id
      review_data.college_id = entity.college_id
      delete review_data.emails
 
      review_data.position_id = review_data.position
      delete review_data.position
 
      delete review_data.checkbox
      getModel().list_reviews(review_data.club_id, function (err, entities) {
        if (err){
          return next(err)
        }
        for (var i = 0; i < entities.length; i++) {
          if (entities[i].user_id == review_data.user_id){
            return res.send("You've already reviewed this organization")
          }
        }
        getModel().update_star_ratings(entity.id, review_data, function (err, updatedData){
          if (err){
            return next(err)
          }
          getModel().create_review(review_data, function (err, savedData) {
            if (err) {
              return next(err);
            }
            res.redirect('/' + entity.university_url + '/' + entity.glasshopper_url);
          });
        })
      })
    });
  }
);

router.post('/signup', function(req, res, next) { 
  passport.authenticate('local-signup', function(err, user, info) {
    if (err) { return next(err); }
    if (!user) { return res.redirect('/login'); }
    
    email(user.email, '2ca5e184-04d2-4bca-8111-c58becd69dd2', 'Not just a confirmation email');
     
    req.logIn(user, function(err) {
      if (err) { return next(err); }
      if (user.demographic_type == 1 || user.demographic_type == 0){
        return res.redirect('/');
      }
      else {
        return res.redirect('/review?signedup=2')
      }

    });
  })(req, res, next);
});
/*
router.post(
  '/signup', jsonParser, function insert_review (req, res, next) {
    var incoming_data = req.body;
    // console.log(incoming_data)
    //console.log(req)
    console.log(incoming_data)

    //regular controls
    if (req.user) {
       res.redirect("/profile");
    }
    
    if (incoming_data.read_tc == 0 || incoming_data.password != incoming_data['repeat-password']){
      res.redirect("/clubs/404.jade")
    }

    //fine user data to submit to db
    var user_data = incoming_data

    delete user_data['repeat-password']
    delete user_data.read_tc

    if (user_data.is_university_student == 1){
      if (!user_data.university_name){
        res.redirect('/clubs/404.jade')
      }
      user_data.personal_email = user_data.email
      user_data.edu_email = user_data.email
      user_data.demographic_type = user_data.year
    }

    else{
      user_data.personal_email = user_data.email
      user_data.demographic_type = 0
    }

    user_data.name = user_data.real_name

    delete user_data.real_name
    delete user_data.email
    delete user_data.year

    if(user_data.is_university_student == 1){
      getModel().find_uni(user_data.university_name.toLowerCase(), function (err, entity) {
        if (err) {
          return next(err);
        }
        user_data.college_id = entity
        delete user_data.university_name

        delete user_data.is_university_student

        getModel().create_user(user_data, function (err, savedData) {
          if (err) {
            return next(err);
          }
          console.log(savedData)
        })
      });
    }
    else{
      delete user_data.is_university_student
      getModel().create_user(user_data, function (err, savedData) {
        if (err) {
          return next(err);
        }
        console.log(savedData)
      })
    }
})
*/
// [END add]


 
/**
 * GET /clubs/:id/edit
 *
 * Display a club for editing.
 */
router.get('/:review/edit', function editForm (req, res, next) {
  getModel().find_review (req.params.review, function (err, entity) {
    if (err) {
      return next(err);
    }
    if (!req.user || entity.user_id != req.user.ID){
      res.redirect("/clubs/404.jade");
    }
    res.render('clubs/review_form.jade', {
      review2edit: entity,
      action_header: 'Edit your review'
    });
  });
});
 
/**
 * POST /clubs/:id/edit
 *
 * Update a club.
 */
// router.post(
//   '/:club/edit',
//   images.multer.single('image'),
//   images.sendUploadToGCS,
//   function update (req, res, next) {
//     var data = req.body;
 
//     // Was an image uploaded? If so, we'll use its public URL
//     // in cloud storage.
//     if (req.file && req.file.cloudStoragePublicUrl) {
//       req.body.imageUrl = req.file.cloudStoragePublicUrl;
//     }
 
//     getModel().update(req.params.club, data, function (err, savedData) {
//       if (err) {
//         return next(err);
//       }
//       res.redirect(req.baseUrl + '/' + savedData.id);
//     });
//   }
// );
 
/**
 * GET /clubs/:id
 *
 * Display a club.
 */
// router.get('/:club', function get (req, res, next) {
//   getModel().read(req.params.club, function (err, entity) {
//     if (err) {
//       return next(err);
//     }
//     res.render('clubs/view.jade', {
//       club: entity
//     });
//   });
// });
 
router.get('/:university_url/:club_url', function get (req, res, next) {
  getModel().read_club(req.params.university_url, req.params.club_url, function (err, entity) {
    if (err) {
      return next(err);
    }

    var letters_array = 
    [{'letter': 'A', 'color': 'green'},
     {'letter': 'B', 'color': 'olive'},
     {'letter': 'C', 'color': 'yellow'}, 
     {'letter': 'D', 'color': 'orange'},
     {'letter': 'F', 'color': 'red'}]

    var letter_index = Math.floor(club.num_grade / 20)
    
    club.grade = {'num_grade': club.num_grade,
    'letter_grade': letters_array.letter_index.letter,
    'color': letters_array.letter_index.color}

    delete club.num_grade

    var hashed_club_id = hashids.encode(entity.ID)
    getModel().list_reviews(entity.ID, function (err, entities) {
      if (err){
        return next(err);
      }
 
      var other_reviews = entities, own_review;
      if (req.user) {
        for (var i = entities.length - 1; i >= 0; i--) {
          if (entities[i].user_id == req.user.ID){
            own_review = entities[i]
            entities.splice(i,1)
          }
        }
        // for (review in entities){
        //   if (entities[review].user_id == req.user.id){
        //     own_review = entities[review];
        //     entities.splice(review,1);
        //   }
        // }
      }
 
      getModel().get_clubs(req.params.university_url, function(err, clubs){
        if(err){
          return next(err);
        }
        if (req.user){
          getModel().follows_club(entity.ID, req.user, function(err, rows){
            var following = (rows) ? (rows.length > 0) : false
            res.render('clubs/club-page.jade', {
              club: entity,
              suggested_clubs: clubs,
              reviews: other_reviews,
              review_by_user: own_review,
              following: following,
              hashed_club_id: hashed_club_id
            });
          })
        }
        else {
          res.render('clubs/club-page.jade', {
            club: entity,
            suggested_clubs: clubs,
            reviews: other_reviews,
            review_by_user: own_review,
            following: "false",
            hashed_club_id: hashed_club_id
          });
        }
      })
    });
  });
});
 
router.get('/:university_url/:club_url/id', function get (req, res, next) {
  getModel().get_club_id(req.params.university_url, req.params.club_url, function (err, entity) {
    if (err) {
      return next(err);
    }
    res.json(entity);
  });
});
 
// router.get('/:club', function get (req, res, next) {
//   getModel().readclub(req.params.club, function (err, entity) {
//     if (err) {
//       return next(err);
//     }
//     getModel().list_reviews(req.params.club, function (err, entities) {
//       if (err){
//         return next(err);
//       }
//       res.render('clubs/club-page.jade', {
//         club: entity,
//         reviews: entities
//       });
//     });
//   });
// });
 
router.post('/reviews/:review_id/report', function (req, res, next){
  getModel().remove_review(req.params.review_id, function(err){
    if(err){
      return next(err)
    }
  })
})

/**
 * GET /:id/follow
 *
 * Follow a club.
 */
router.post('/follow/:club_id', isLoggedIn, function follow (req, res, next) {
  getModel().follow_handler(req.params.club_id, req.user.ID, function (err, results) {
    return next();
  });
});
 
/**
 * Errors on "/clubs/*" routes.
 */
router.use(function handleRpcError (err, req, res, next) {
  // Format error and forward to generic error handler for logging and
  // responding to the request
  err.response = err.message;
  next(err);
});
 
module.exports = router;