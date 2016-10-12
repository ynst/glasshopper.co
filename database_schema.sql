 create table colleges (ID int NOT NULL AUTO_INCREMENT, 
 	name varchar (200) NOT NULL, 
 	email_domain varchar (50) NOT NULL, -- logo file names are named by this field : logo-<email-domain>.png
 	glasshopper_url varchar (200) NOT NULL, 
 	PRIMARY KEY (ID));

  create table clubs (ID int NOT NULL AUTO_INCREMENT, 
  	glasshopper_url varchar (100),
  	college_id int NOT NULL,
 	name varchar (200) NOT NULL, 
 	manager_email varchar (100), 
 	manager_1_name varchar (100),
 	manager_2_name varchar (100), 
 	manager_3_name varchar (100), 
 	description varchar (400),
 	club_type_id int, 
 	member_range_id int, -- upper bound, 1-10->10 11-25->25, 26-50->50, 50+->100
 	leadership_circulation int, -- 1 yearly 2 every 2 years 0 semester
 	website varchar (100),
 	social_media_ln_fb varchar (100),
 	social_media_ln_twitter varchar (100),
 	social_media_ln_youtube varchar (100),
 	social_media_ln_instagram varchar (100),
 	social_media_ln_linkedin varchar (100),
 	is_active int default 0,
 	is_recruiting int default 0,
 	is_claimed int default 0,
 	is_self_registered int default 0,
 	self_registered_by int, -- user ID
 	PRIMARY KEY (ID));

create index college_id on clubs (college_id);

 create table club_types (ID int NOT NULL AUTO_INCREMENT, 
 	name varchar(50),
 	PRIMARY KEY (ID));  

   create table club_ratings (ID int NOT NULL AUTO_INCREMENT, 
 	club_id int NOT NULL, 
 	year int NOT NULL, -- 2016-2017 academic year --> year = 2016 
 	avg_hours_per_week decimal (4,1),
 	avg_day_to_day decimal (4,1),
 	avg_legitimacy decimal (4,1),
 	avg_future_value decimal (4,1),
 	avg_people decimal (4,1),
 	overall_recommend_percent int,
 	approve_leadership_percent int,
 	avg_stars decimal (4,1), -- average of the first four evaluations
 	PRIMARY KEY (ID));

	create index club_id_year on club_ratings
	(club_id, year); 
  
  create table users (ID int NOT NULL AUTO_INCREMENT, 
 	name varchar (200) NOT NULL, 
 	personal_email varchar (100) NOT NULL, -- can use gmail authentication and verify edu email to review 
 	has_verified_p_email int default 0,
 	edu_email varchar (100), 
 	has_verified_edu_email int default 0,
 	college_id int, -- found using top domain of edu email
 	demographic_type int, -- 0 no college student, 1 freshman, 2 sophomore, 3 junior, 4 senior, 5 other
 	is_blocked int default 0,
 	PRIMARY KEY (ID));

   create table user_follows_club (ID int NOT NULL AUTO_INCREMENT, 
 	club_id int NOT NULL, 
 	user_id int NOT NULL,
 	date_last_followed date,
 	PRIMARY KEY (ID));

	create index club_id_user on user_follows_club
	(club_id, user_id); 

	create index user_id_club on user_follows_club
	(user_id, club_id); 

  create table verified_members  (ID int NOT NULL AUTO_INCREMENT, 
  club_id int NOT NULL, 
  user_id int NOT NULL,
  date_added date,
  added_by_user_id int not null,
  PRIMARY KEY (ID));

  create index club_id_user on verified_members
  (club_id, user_id); 

  create index user_id_club on verified_members
  (user_id, club_id); 
  
   create table reviews (ID int NOT NULL AUTO_INCREMENT, 
   	club_id int not null,
   	user_id int not null,
   	submission_date datetime NOT NULL default CURRENT_TIMESTAMP,
   	is_current_member int default 0,
   	position_id int, -- head 1, board member 2, member 3, volunteer 4, not available 0
   	last_academic_year_involved int, -- 2016-2017 academic year --> year = 2016 
   	last_semester_involved int, -- 1 fall (2016 fall), 2 spring (2017 spring), 3 summer (2017 summer)
   	first_academic_year_involved int, -- 2016-2017 academic year --> year = 2016 
   	first_semester_involved int, -- 1 fall (2016 fall), 2 spring (2017 spring), 3 summer (2017 summer)
	  rating_hours_per_week int,
   	rating_day_to_day int,
   	rating_legitimacy int,
   	rating_future_value int,
   	rating_people int,
   	overall_recommend int default 0,
   	approve_leadership int default 0,
   	pros varchar (2000),
   	cons varchar (2000),
  	is_removed int default 0,
  	PRIMARY KEY (ID));

   UPDATE clubs SET
    club_type_id =
    case
    when ID < 84 then
     5
    when ID > 83  and ID < 227 then
     6
    when ID > 226 and ID  < 325 then
     7
    when ID > 324 and ID < 343 then
     8
    when ID > 342 and ID < 420 then
     9
    when ID > 419 and ID < 430 then
     10
    when ID > 429 and ID < 471 then
     11
    when ID > 470 and ID < 503 then
     12
    when ID > 502 and ID < 540 then
     13
    when ID > 539 and ID < 563 then
     14
    when ID > 562 and ID < 581 then
     15
    else
      16
    end