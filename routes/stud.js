var nodemailer = require('nodemailer');
//----------mess login------------//
exports.login = function(req, res){
   var message = '';
   var sess = req.session; 

   if(req.method == "POST"){
      var post  = req.body;
      var mess_rollno= post.mess_rollno;
      var password= post.password;
     
      var sql="SELECT * FROM `student` WHERE `mess_rollno`='"+mess_rollno+"' and password = '"+password+"'";                           
      db.query(sql, function(err, results){      
         if(results.length){
            console.log(results);
            req.session.userId = results[0].mess_rollno;
            req.session.user = results[0];
            // console.log("***************"+results[0].mess_rollno+"****************");
            // res.redirect('/home_stu');

             var ql="select * from menu_update where date=curdate();";
            db.query(ql,function(e,r){
            var sql_id="select count(*) as strength from student;";
               var tot=0;
               var give=function(callback){
               db.query(sql_id,function(er,re){
                  if(er)return callback(er);
                  tot=re[0].strength;
                  callback(null,tot);
               });
            };    
         
            give(function(er,ret){
               if(er)throw er;
               tot=ret;
               console.log("tot: ",tot);
               res.render('home_stu.ejs',{data:[r,tot]});
            });
         });


         }
         else{
            message = 'Wrong Credentials.';
            res.render('login_stu.ejs',{message: message});
         }
                 
      });
   } else {
      res.render('login_stu.ejs',{message: message});
   }
           
};
//----------student signup------------//
exports.signup = function(req, res){
   message = '';
   if(req.method == "POST"){
      var post  = req.body;
      var rollno= post.rollno;
      var password= post.password;
      var name= post.name;
      var email= post.email;
      var phone_no= post.phone_no;


      var check_sql="Select * from student where email='"+email+"'or rollno='"+rollno+"';";

      db.query(check_sql, function(e, r){
         console.log("results: ",r);      
         if(r.length){
               if(e){
                  console.log("some piroblem");
                  throw e;
               }
               message = "User with given Rollno or Email already exists!";
               res.render('signup_stu.ejs',{message: message});
         }
         else{
               
         var sql = "INSERT INTO `student`(`rollno`,`name`,`phone_no`,`email`, `password`) VALUES ('" + rollno + "','" + name + "','" + phone_no + "','" + email + "','" + password + "')";
         //res.render('home_stu.ejs',{message: message});
         var query = db.query(sql, function(err, result) {
         if(err)console.log("got an error");
         var sql_id="Select mess_rollno from student where email='"+email+"';";
         var give=function(callback){
               db.query(sql_id,function(er,re){
                  if(er)return callback(er);
                  var data=re;
                  var giv=data[0].mess_rollno;
                  callback(null,giv);
               });
         };    
         
         give(function(er,ret){
            if(er)throw er;
            var id=ret;
            message = "Succesfully! Your account has been created. And ur mess roll no is:"+id+" ! A mail confirming "+
            "the same has been emailed to you.";

            //making changes for sending mails
               

               var transporter = nodemailer.createTransport({
               service: 'gmail',
               auth: {
                     user: 'utopianmess529@gmail.com',
                     pass: 'mess!@#$%'
                     }
               });

               var mailOptions = {
               from: 'utopianmess529@gmail.com',
               to: email,
               subject: 'Resgistration Succesful on Utopian Mess!!!',
               text: 'Hello '+ name+', Welcome to Utopian Mess ,eat whenever and as much as you want :). You can login with Your mess_rollno: '
               + id+ ' . '
               };

               transporter.sendMail(mailOptions, function(error, info){
               if (error) {
                console.log(error);
               } else {
               console.log('Email sent: ' + info.response);
               }
            });

            //***********************************//

            res.render('signup_stu.ejs',{message: message});
            });
         });
         }
                 
      });

   } else {
      res.render('signup_stu.ejs');
   }
};
//----------------student home page-----------------//
exports.home_stu = function(req, res, next){
           
   var user =  req.session.user,
   userId= req.session.userId;
   console.log('ddd='+userId);
   if(userId == null){
      res.redirect("/");
      return;
   }

   var sql="SELECT * FROM `student` WHERE `mess_rollno`='"+userId+"'";

   db.query(sql, function(err, results){
      console.log({user:user});
      res.render('home_stu.ejs', {user:user});    
   });       
}; 
//----------------logout-------------//
exports.logout=function(req,res){
   req.session.destroy(function(err) {
      res.redirect("/");
   })
};
//-------------profile----------------//
exports.profile_stu = function(req, res){

   var userId = req.session.userId;
   if(userId == null){
      res.redirect("/");
      return;
   }

   var sql="SELECT * FROM `student` WHERE `mess_rollno`='"+userId+"'";   
   

   db.query(sql, function(err, result){
   //console.log(result);
   console.log({data:result});  
      res.render('profile_stu.ejs',{data:result});
   });
};
//-------------history--------------//
//var tot=0;
exports.history=function(req,res){
   var userId=req.session.userId;
   if(userId==null){
      res.redirect("/");
      return;
   }

   var sql="select * from student_history where mess_rollno="+userId+";";
   //var net=cost(userId);
   //tot=0;
   //cost(userId);
   db.query(sql,function(err,result){
      console.log("upar: ",result);

      //**************************************//
      var sql_id="select sum(k.bill) as net from (select s.meal_type,s.response*t.meal_cost as bill"+ 
      " from student_history s,cost t where s.meal_type=t.meal_type and s.mess_rollno=" +userId+") k;";
      var tot=0;
      var give=function(callback){
               db.query(sql_id,function(er,re){
                  if(er)return callback(er);
                  tot=re[0].net;
                  callback(null,tot);
               });
         };    
         
         give(function(er,ret){
            if(er)throw er;
            tot=ret;
            console.log("tot: ",tot);
           // message = "Succesfully! Your account has been created. And ur mess roll no is:"+id+" !";
            res.render('my_history.ejs',{data:[result,tot]});
         });
      //*****************************************//

      // res.render('my_history.ejs',{data:[result,tot]});
   });
};

//---------------student response-----------//
exports.response= function(req, res){
   var userId=req.session.userId;
   if(userId==null){
      res.redirect("/");
      return;
   }
   var message='';
   if(req.method == "POST"){
      var post  = req.body;
      var breakfast_res= post.breakfast;
      var lunch_res = post.lunch;
      var snacks_res= post.snacks;
      var dinner_res= post.dinner;

      var sql ="insert into student_history values ("+"'"+userId+"',curdate(),'breakfast','"+breakfast_res+"'),('"
      +userId+"',curdate(),'lunch','"+lunch_res+"'),('"+userId+"',curdate(),'snacks','"
      +snacks_res+"'),('"+userId+"',curdate(),'dinner','"+dinner_res+"')";

      var query = db.query(sql, function(err, result) {
            if(err){
               console.log("problem in sending response");
               throw err;
            }                
      });
      message = 'Response sent succesfully';
      console.log("message**: "+message);
      res.render('response.ejs',{message: message});

   } 
   else {
      res.render('response.ejs',{message: message});
   }
};
