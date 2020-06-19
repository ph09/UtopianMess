var sum=function(a,b){
	return f(a,b);
}
var flg=0;
function f(a,b){
	flg=1;
	return a+b;
}

var s=sum(2,3);
console.log(s,"flag: ",flg);