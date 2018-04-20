var express = require('express');
var app = express();
app.set('port', process.env.PORT || 3000);

app.get('/',(req, res)=>{
    res.send('home');
    
});
app.use('/about',function(req, res){
    res.send('about');
    
});
app.use(function(req, res){
    res.send('404');
});

app.use(function(req, res, next){
    res.send('500');
});


//login
app.use((req,res)=>{
    res.send('success');
})


app.listen(app.get('port'), function () {
    console.log('Express started on http:localhost'+app.get('port'));
});
 