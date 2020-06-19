//----------mess login------------//
exports.login = function(req, res){
   var message = '';
   var sess = req.session; 

   if(req.method == "POST"){
      var post  = req.body;
      var mess_id=post.mess_id;
      var password= post.password;
      
      var sql="SELECT * FROM `mess` WHERE `mess_id`='"+mess_id+"' and password = '"+password+"'";                           
      db.query(sql, function(err, results){      
         if(results.length){
            req.session.userId = results[0].mess_id;
            req.session.user = results[0];
            // console.log(results[0].mess_id);
            // res.redirect('/home_mes');

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
               res.render('home_mes.ejs',{data:[r,tot]});
            });
         });


         }
         else{
            message = 'Wrong Credentials.';
            res.render('login_mes.ejs',{message: message});
         }
                 
      });
   } else {
      res.render('login_mes.ejs',{message: message});
   }
           
};
//----------mess signup------------//
exports.signup = function(req, res){
   message = '';
   if(req.method == "POST"){
      var post  = req.body;
      var name= post.name;
      var password= post.password;
      var phone_no= post.phone_no;
      var email= post.email;

      var check_sql="Select * from mess where email='"+email+"';";

      db.query(check_sql, function(e, r){
         console.log("results: ",r);      
         if(r.length){
               if(e){
                  console.log("some piroblem");
                  throw e;
               }
               message = "User with given Email already exists!";
               res.render('signup_mes.ejs',{message: message});
         }
         else{
               
               var sql = "INSERT INTO `mess`(`name`,`phone_no`,`email`,`password`) VALUES ('" + name + "','" + phone_no+ "','" + email + "','" + password+ "');";

               var query = db.query(sql, function(err, result) {
                           var sql_id="Select mess_id from mess where email='"+email+"';";
                           var give=function(callback){
                           db.query(sql_id,function(error,rs){
                           if(error)return callback(error);
                           console.log("**************");
                           var data=rs;
                           var giv=data[0].mess_id;
                           callback(null,giv);
               });
         };
         //var id="no id assigned!";
         give(function(err,ret){
            if(err)throw err;
            id=ret;
            
            message = 'Succesfully! Your account has been created. And your mess ID is: "'+id+'";';
           // console.log("give: "+id);
            res.render('signup_mes.ejs',{message: message});
         });
         
      });
         
      
         }
                 
      });
      
   } else {
      res.render('signup_mes.ejs');
   }
};
//----------------mess home page-----------------//
exports.home_mes = function(req, res, next){
           
   var user =  req.session.user,
   userId = req.session.userId;
   console.log("########### "+{user:user}+"       ######");
   console.log('ddd='+userId);
   if(userId == null){
      res.redirect("/");
      return;
   }

   var sql="SELECT * FROM `mess` WHERE `mess_id`='"+userId+"'";

   db.query(sql, function(err, results){
      // console.log(results);
      // console.log("&&&&&&&&&&&&&&&&&&");
      console.log({user:user});
      res.render('home_mes.ejs', {user:user});    
   });       
}; 
//----------------logout-------------//
exports.logout=function(req,res){
   req.session.destroy(function(err) {
      res.redirect("/");
   })
};
//-------------history--------------//
exports.history=function(req,res){
   var userId=req.session.userId;
   if(userId==null){
      res.redirect("/");
      return;
   }

   var sql="select * from student_history;";

   db.query(sql,function(err,result){
      res.render('mes_history.ejs',{data:result});
   })
};

//------------showing bill-----------//
exports.bill=function(req,res){
   var userId=req.session.userId;
   if(userId==null){
      res.redirect("/");
      return;
   }

   var sql="select k.mess_rollno,sum(k.bill) as tot from (select s.mess_rollno,s.meal_type,s.response*t.meal_cost as bill from"+ 
   " student_history s,cost t where s.meal_type=t.meal_type ) k group by k.mess_rollno;";
   
   db.query(sql,function(err,result){
      if(err){
         console.log("yess err");
         throw err;
      }
      console.log("upar: ",result);

      //**************************************//
      var sql_id="select sum(p.tot) as earn from (select k.mess_rollno,sum(k.bill) as tot from"+ 
      " (select s.mess_rollno,s.meal_type,s.response*t.meal_cost as bill from student_history s,"+
         " cost t where s.meal_type=t.meal_type ) k group by k.mess_rollno) p;";
      var tot=0;
      var give=function(callback){
               db.query(sql_id,function(er,re){
                  if(er)return callback(er);
                  tot=re[0].earn;
                  callback(null,tot);
               });
         };    
         
         give(function(er,ret){
            if(er)throw er;
            tot=ret;
            console.log("tot: ",tot);
           // message = "Succesfully! Your account has been created. And ur mess roll no is:"+id+" !";
            res.render('bill.ejs',{data:[result,tot]});
         });
      //*****************************************//

      // res.render('my_history.ejs',{data:[result,tot]});
   });

   
};

//for earn query for mess 
/*select sum(p.tot) as earn from (select k.mess_rollno,sum(k.bill) as tot from (select s.mess_rollno,s.meal_type,s.response*t.meal_cost
 as bill from student_history s,cost t where s.meal_type=t.meal_type ) k group by k.mess_rollno) p;*/

//for total bill history how much each student owe?
/*select k.mess_rollno,sum(k.bill) as tot from (select s.mess_rollno,s.meal_type,s.response*t.meal_cost as bill from 
student_history s,cost t where s.meal_type=t.meal_type ) k group by k.mess_rollno;*/

//--------------menu_update---------------//
exports.menu_update = function(req, res){
   var userId=req.session.userId;
   if(userId==null){
      res.redirect("/");
      return;
   }
   var message='';
   if(req.method == "POST"){
      var post  = req.body;
      var breakfast= post.breakfast;
      var lunch = post.lunch;
      var snacks= post.snacks;
      var dinner= post.dinner;

      var sql ="insert into menu_update values ("+"'"+userId+"',curdate(),'"+breakfast+"','"+lunch+"','"+snacks+"','"+dinner+"');";
      var query = db.query(sql, function(err, result) {
            if(err){
               console.log("problem in updating menu");
               throw err;
            }                
      });
      message = 'Menu has been updated succesfully';
      console.log("message**: "+message);
      res.render('menu_update.ejs',{message: message});

   } 
   else {
      res.render('menu_update.ejs',{message: message});
   }
};

//----------------menu history-------------//
exports.menu_history=function(req,res){
   var userId=req.session.userId;
   if(userId==null){
      res.redirect("/");
      return;
   }

   var sql="select * from menu_update;";

   db.query(sql,function(err,result){
      res.render('menu_history.ejs',{data:result});
   })
};
//------------orders for today---------------//
exports.orders_placed=function(req,res){
   var userId=req.session.userId;
   if(userId==null){
      res.redirect("/");
      return;
   }

   var sql="select meal_type,sum(response) as response from student_history where date=curdate() group by meal_type;";

   db.query(sql,function(err,result){
      console.log("response result:", result)
      res.render('total_orders.ejs',{data:result});
   })
};