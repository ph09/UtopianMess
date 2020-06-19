/*
* GET home page.
*/
 
// exports.index_common = function(req, res){
//     var message = 'we are on index page';
//   res.render('index.ejs',{message: message});
 
// };
//------------show of home page-----------//

exports.index_common=function(req,res){

   var ql="select *from menu_update where date=curdate();";
   db.query(ql,function(e,r){
      var sql_id="select count(*) as strength from student;";
      var tot=0;
      var give=function(callback){
               db.query(sql_id,function(er,re){
                  if(er)
                     return callback(er);
                  tot=re[0].strength;
                  callback(null,tot);
               });
         };    
         
         give(function(er,ret){
            if(er)
               throw er;
            tot=ret;
            console.log("tot: ",tot);
            res.render('index.ejs',{data:[r,tot]});
         });
   });
};
