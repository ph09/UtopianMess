/**
	Shraddha Gole 
* Module dependencies
*/
var express = require('express')
  , routes = require('./routes')
  //, user = require('./routes/user')
  ,index=require('./routes/index')
  ,student=require('./routes/stud')
  ,mess=require('./routes/mess')
  , http = require('http')
  , path = require('path')
  , nodemailer = require('nodemailer');
//var methodOverride = require('method-override');
var session = require('express-session');
var app = express();
var mysql      = require('mysql');
var bodyParser=require("body-parser");
var connection = mysql.createConnection({
              host     : 'localhost',
              user     : 'root',
              password : '1234',
              database : 'report'
            });
 
connection.connect();
 
global.db = connection;
 
// all environments
app.set('port', process.env.PORT || 8080);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
              secret: 'keyboard cat',
              resave: false,
              saveUninitialized: true,
              cookie: { maxAge: 60000 }
            }))
 
// routes
 
app.get('/',index.index_common);//call for main index page
app.get('/login_mes',mess.login);
app.post('/login_mes',mess.login);
app.get('/signup_mes',mess.signup);
app.post('/signup_mes',mess.signup);
app.get('/home_mes',mess.home_mes);
app.get('/home_mes/logout',mess.logout);
app.get('/home_mes/history',mess.history);
app.get('/home_mes/bill',mess.bill);
app.get('/home_mes/update_menu',mess.menu_update);
app.post('/home_mes/update_menu',mess.menu_update);
app.get('/home_mes/menu_history',mess.menu_history);
app.get('/home_mes/orders_placed',mess.orders_placed);

app.get('/login_stu',student.login);
app.post('/login_stu',student.login);
app.get('/signup_stu',student.signup);
app.post('/signup_stu',student.signup); 
app.get('/home_stu',student.home_stu);
app.get('/home_stu/logout',student.logout);
app.get('/home_stu/profile',student.profile_stu);
app.get('/home_stu/history',student.history);
app.get('/home_stu/response',student.response);
app.post('/home_stu/response',student.response);


app.use(express.static("routes"));
app.listen(8000)
