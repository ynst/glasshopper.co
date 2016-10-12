// Copyright 2015-2016, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';

var extend = require('lodash').assign;
var mysql = require('mysql');
var config = require('../config');

function getConnection () {
  return mysql.createConnection(extend({
    database: 'website_data'
  }, {
    host: config.get('MYSQL_HOST'),
    user: config.get('MYSQL_USER'),
    password: config.get('MYSQL_PASSWORD')
  }));
}

function list (limit, token, cb) {
  token = token ? parseInt(token, 10) : 0;
  var connection = getConnection();
  connection.query(
    `SELECT clubs.*, colleges.glasshopper_url as college_url FROM clubs JOIN colleges on colleges.ID = clubs.college_id 
        where is_active = 1 and is_self_registered = 0
        LIMIT ? OFFSET ?`, [limit, token],
    function (err, results) {
      if (err) {
        return cb(err);
      }
      var hasMore = results.length === limit ? token + results.length : false;
      cb(null, results, hasMore);
    }
  );
  connection.end();
}

// [START listby]
function listBy (userId, limit, token, cb) {
  token = token ? parseInt(token, 10) : 0;
  var connection = getConnection();
  connection.query(
    'SELECT * FROM `clubs` WHERE `createdById` = ? LIMIT ? OFFSET ?',
    [userId, limit, token],
    function (err, results) {
      if (err) {
        return cb(err);
      }
      var hasMore = results.length === limit ? token + results.length : false;
      cb(null, results, hasMore);
    });
  connection.end();
}
// [END listby]

function create_user (data, cb) {
  var connection2 = getConnection();
  connection2.query('INSERT INTO `users` SET ?', data, function (err, res) {
    if (err) {
      return cb(err);
    }
    cb(null, res)
  });
  connection2.end();
}

function create_review (data, cb) {
  var connection = getConnection();
  connection.query('INSERT INTO `reviews` SET ?', data, function (err, res) {
    if (err) {
      return cb(err);
    }
    cb(null, res)
  });
  connection.end();
}


function update_star_ratings (club_id, review_data, cb) {
  var connection = getConnection();
  connection.query(
    `UPDATE clubs set
    avg_rating_hours_per_week = (avg_rating_hours_per_week * num_reviews + ?)/(num_reviews + 1),
    avg_rating_day_to_day = (avg_rating_day_to_day * num_reviews + ?)/(num_reviews + 1),
    avg_rating_legitimacy = (avg_rating_legitimacy * num_reviews + ?)/(num_reviews + 1),
    avg_rating_future_value = (avg_rating_future_value * num_reviews + ?)/(num_reviews + 1),
    avg_rating_people = (avg_rating_people * num_reviews + ?)/(num_reviews + 1),
    avg_recommend = (avg_recommend * num_reviews + ?)/(num_reviews + 1),
    avg_approval = (avg_approval * num_reviews + ?)/(num_reviews + 1),
    num_reviews = num_reviews + 1
    where id = ?`, 
    [review_data.rating_hours_per_week, 
    review_data.rating_day_to_day,
    review_data.rating_legitimacy,
    review_data.rating_future_value,
    review_data.rating_people,
    review_data.overall_recommend,
    review_data.approve_leadership,
    club_id], function (err, res) {
    if (err) {
      return cb(err);
    }
    cb(null, res)
  });
  connection.end();
}

function create_university (unis, cb) {
  var connection = getConnection();
    var uni = {name: "placeholder", email_domain: "placeholder"}
    for (var i = unis.length - 1; i >= 0; i--) {
    uni.name = unis[i].name
    uni.email_domain = unis[i].domain 
  connection.query('INSERT INTO `colleges` SET ?', uni, cb);
}
  connection.end();
}

function read_review (id, cb) {
  var connection = getConnection();
  connection.query(
    'SELECT * FROM `clubs` WHERE `id` = ?', id, function (err, results) {
      if (err) {
        return cb(err);
      }
      if (!results.length) {
        return cb({
          code: 404,
          message: 'Not found'
        });
      }
      cb(null, results[0]);
    });
  connection.end();
}

function get_club_id (university_url, club_url, cb){
  var connection = getConnection();
  connection.query(
    "SELECT ID from clubs join colleges on colleges.ID = clubs.college_id where colleges.glasshopper_url = ?  and clubs.glasshopper_url = ? ", [university_url, club_url], function (err, results) {
      if (err) {
        return cb(err);
      }
      if (!results.length) {
        return cb({
          code: 404,
          message: 'Not found'
        });
      }
      cb(null, results[0].ID);
    });
  connection.end();
}

function read_club (university_url, club_url, cb) {
  var connection = getConnection();
  // get_club_id(university_url, club_url, function (err, club_id) {
  connection.query(
    `SELECT clubs.*, colleges.name as college_name, colleges.glasshopper_url as university_url, 
    club_types.name as type
    from clubs 
    join colleges on colleges.ID = clubs.college_id 
    join club_types  on club_types.id = clubs.club_type_id
    where colleges.glasshopper_url = ? and clubs.glasshopper_url = ? `
    , [university_url, club_url], function (err, results) {
      if (err) {
        return cb(err);
      }
      if (!results.length) {
        return cb({
          code: 404,
          message: 'Not found'
        });
      }
      cb(null, results[0]);
    });
  connection.end();
  // })
}

function read_user (user_id, cb) {
  var connection = getConnection();
  // get_club_id(university_url, club_url, function (err, club_id) {
  connection.query(
    `SELECT users.*,
    colleges.name as university_name
    from users 
    left join colleges on colleges.ID = users.college_id 
    where users.ID = ?`, [user_id], function (err, results) {
      if (err) {
        return cb(err);
      }
      if (!results.length) {
        return cb({
          code: 404,
          message: 'Not found'
        });
      }
      cb(null, results[0]);
    });
  connection.end();
  // })
}

function read_user_following_clubs (user, cb) {
  var connection = getConnection();
  // get_club_id(university_url, club_url, function (err, club_id) {
  connection.query(
    `SELECT clubs.*, colleges.name as university_name, colleges.glasshopper_url as university_url 
    from user_follows_club 
    join clubs on clubs.id = user_follows_club.club_id 
    join colleges on colleges.ID = clubs.college_id 
    where user_follows_club.user_id = ?`
    , [user.ID], function (err, results) {
      if (err) {
        return cb(err);
      }
      cb(null, results);
    });
  connection.end();
  // })
}

function read_user_verified_member (user, cb) {
  var connection = getConnection();
  // get_club_id(university_url, club_url, function (err, club_id) {
  connection.query(
    `SELECT clubs.*, colleges.name as college_name, colleges.glasshopper_url as university_url 
    from verified_members 
    join clubs on clubs.id = verified_members.club_id 
    join colleges on colleges.ID = clubs.college_id 
    where verified_members.verified_email = ?`
    , [user.email], function (err, results) {
      if (err) {
        return cb(err);
      }
      cb(null, results);
    });
  connection.end();
  // })
}


function follow_handler (club_id, user_id, cb) {
  var connection = getConnection();
  connection.query('select * from `user_follows_club` where `club_id` = ? and `user_id` = ?', [club_id, user_id], function (err, rows){
    if (err){
      return cb(err)
    }
    var connection2 = getConnection();
    // console.log(rows)
    if (rows.length == 0){
      // console.log(club_id)
      // console.log(user_id)
      connection2.query('INSERT INTO user_follows_club (club_id, user_id) values (?, ?)', [club_id, user_id], 
        function (err, savedData) {
          // console.log(savedData)
            return cb(null, savedData)
        }
      );
    }
    else{
      connection2.query('delete from `user_follows_club` where club_id = ? and user_id = ?', [club_id, user_id], cb);
    }
  })
  connection.end();
}

function follows_club (club_id, user, cb) {
  var connection = getConnection();
  connection.query('select * from user_follows_club where club_id = ? and user_id = ?', [club_id, user.ID], function (err, rows){
    if (err){
      return cb(err)
    }
    cb(null, rows)
  })
  connection.end();
}

function find_club_by_name (university_name_lowercase, college_name_lowercase, cb) {
  var connection = getConnection();
  // get_club_id(university_url, club_url, function (err, club_id) {
  connection.query(
    `SELECT clubs.id, clubs.glasshopper_url, colleges.id as college_id, colleges.glasshopper_url as university_url
    from clubs join colleges on colleges.ID = clubs.college_id 
    where lower(colleges.name) = ? and lower(clubs.name) = ? `, [university_name_lowercase, college_name_lowercase], function (err, results) {
      if (err) {
        return cb(err);
      }
      if (!results.length) {
        return cb({
          code: 404,
          message: "We couldn't find your university"
        });
      }
      cb(null, results[0]);
    });
  connection.end();
  // })
}

function find_uni_by_name_or_url (university_name_or_url, cb) {
  var connection1 = getConnection();
  // get_club_id(university_url, club_url, function (err, club_id) {
  // console.log(university_name.toLowerCase())
  connection1.query(
    `SELECT colleges.id, colleges.name from colleges 
    where lower(colleges.name) = ? or glasshopper_url = ?`, [university_name_or_url.toLowerCase(), university_name_or_url], function (err, results) {
      if (err) {
        return cb(err);
      }
      if (!results.length) {
        return cb({
          code: 404,
          message: "We couldn't find your university"
        });
      }
      cb(null, results[0]);
    });
  connection1.end();
  // })
}

//provide the table name
function select_table_field (table_name, field_name, id, cb) {
  var connection = getConnection();
  // get_club_id(university_url, club_url, function (err, club_id) {
  connection.query(
      " select *  from " + table_name + " where " +field_name+ " = ?", [id], function (err, results) {
      if (err) {
        return cb(err);
      }
      if (!results.length) {
        return cb({
          code: 404,
          message: "We couldn't find a matching element to your query"
        });
      }
      cb(null, results[0]);
    });
  connection.end();
  // })
}

function get_club_types (cb) {
  var connection = getConnection();
  // get_club_id(university_url, club_url, function (err, club_id) {
  connection.query(
      " select *  from `club_types`", function (err, results) {
      if (err) {
        return cb(err);
      }
      // console.log(results)
      // if (!results.length) {
      //   return cb({
      //     code: 404,
      //     message: "We couldn't find a matching element to your query"
      //   });
      // }
      cb(null, results);
    });
  connection.end();
  // })
}
function get_club_by_id (id, cb) {
  var connection = getConnection();
  // get_club_id(university_url, club_url, function (err, club_id) {
  connection.query(
    `select clubs.*, colleges.name as college_name, colleges.glasshopper_url as university_url
    from clubs 
    join colleges on colleges.ID = clubs.college_id 
    where clubs.ID = ? `, [id],  function (err, results) {
      if (err) {
        return cb(err);
      }
      if (!results.length) {
        return cb({
          code: 404,
          message: "We couldn't find a matching element to your query"
        });
      }
      cb(null, results[0]);
    });
  connection.end();
  // })
}
function get_clubs (university_url, cb) {
  var connection = getConnection();
  connection.query(
    `SELECT clubs.* FROM clubs 
    JOIN colleges on colleges.ID = clubs.college_id where colleges.glasshopper_url = ?
    order by RAND()`, [university_url], function (err, results) {
      if (err) {
        return cb(err);
      }
      if (!results.length) {
        return cb(null, []);
      }
      cb(null, results);
    });
  connection.end();
}

function suggest_clubs_user (user, cb) {
  var connection = getConnection();
  connection.query(
    `SELECT clubs.* , colleges.glasshopper_url as university_url, colleges.name as college_name,
    (select count(*) from user_follows_club as uf
    join clubs as c on c.id = uf.club_id where user_id = ?
    and  c.club_type_id = clubs.club_type_id and c.id != clubs.id) as similar_club_count
    FROM clubs 
    join colleges on colleges.id = clubs.college_id
    where college_id = ?
    order by similar_club_count desc, is_claimed desc, rand()`, [user.ID, user.college_id], function (err, results) {
      if (err) {
        return cb(err);
      }
      return cb(null, results);
    });
  connection.end();
}

function list_reviews (club_id, cb) {
  var connection = getConnection();
  connection.query(
    "SELECT * from reviews where club_id = ? order by submission_date desc", [club_id], 
     function (err, results) {
      if (err) {
        return cb(err);
      }
      // if (!results.length) {
      //   return cb({
      //     code: 404,
      //     message: 'Not found'
      //   });
      // }
      cb(null, results);
    });
  connection.end();
}

function list_reviews_by_user (user, cb) {
  var connection = getConnection();
  connection.query(
    `SELECT reviews.*, 
    clubs.name as club_name, clubs.logo_url as club_logo, clubs.glasshopper_url as club_url,
    colleges.name as university_name, colleges.glasshopper_url as university_url
    from reviews 
    join clubs on clubs.id = reviews.club_id
    join colleges on colleges.id = clubs.college_id
    where user_id = ? order by submission_date desc`, [user.ID], 
     function (err, results) {
      if (err) {
        return cb(err);
      }
      // if (!results.length) {
      //   return cb({
      //     code: 404,
      //     message: 'Not found'
      //   });
      // }
      cb(null, results);
    });
  connection.end();
}

function verified_member_handler (club_id, saver_id, emails, cb) {
  var connection = getConnection();
  for (var i = 0; i < emails.length; i++) {
    connection.query(
      "INSERT INTO verified_members (club_id, verified_email, added_by_user_id) values (?, ?, ?)"
      , [club_id, emails[i], saver_id], 
        function (err, savedData) {
          if (err){
            return cb(err)
          }
          return cb(null, savedData)
        }
      );
  }
  connection.end();
}

function update_club (id, data, cb) {
  var connection = getConnection();
  connection.query(
    'UPDATE `clubs` SET ? WHERE `id` = ?', [data, id], function (err) {
      if (err) {
        return cb(err);
      }
      cb(null);
    });
  connection.end();
}

function _delete (id, cb) {
  var connection = getConnection();
  connection.query('DELETE FROM `clubs` WHERE `id` = ?', id, cb);
  connection.end();
}

function remove_review (review_id, cb){
  var connection = getConnection();
  connection.query('UPDATE `reviews` SET is_removed = 1 WHERE `id` = ?', review_id, cb);
  connection.end();
}
module.exports = {
  list: list,
  listBy: listBy,
  create_user: create_user,
  read_user: read_user,
  read_user_verified_member: read_user_verified_member,
  read_user_following_clubs: read_user_following_clubs,
  create_review: create_review,
  create_university: create_university,
  read_review: read_review,
  update_club: update_club,
  delete: _delete,
  read_club: read_club,
  list_reviews: list_reviews,
  list_reviews_by_user: list_reviews_by_user,
  get_clubs: get_clubs,
  get_club_id: get_club_id,
  get_club_types: get_club_types,
  get_club_by_id: get_club_by_id,
  save_verified_users: verified_member_handler, 
  select_table_field: select_table_field,
  suggest_clubs_user: suggest_clubs_user,
  follow_handler: follow_handler,
  follows_club: follows_club,
  find_club_by_name: find_club_by_name,
  find_uni: find_uni_by_name_or_url,
  update_star_ratings: update_star_ratings,
  remove_review: remove_review
};

if (module === require.main) {
  var prompt = require('prompt');
  prompt.start();

  console.log(
    'Running this script directly will allow you to initialize your mysql ' +
    'database.\n This script will not modify any existing tables.\n');

  prompt.get(['host', 'user', 'password'], function (err, result) {
    if (err) {
      return;
    }
  });
}