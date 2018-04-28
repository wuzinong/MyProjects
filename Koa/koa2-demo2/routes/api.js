const router = require('koa-router')();

router.post("/api/dologin",async (ctx,next)=>{
    var obj = ctx.request.body;
    if(obj.username==="admin" && obj.password==="12321"){
        console.log("succeess");
        ctx.body = {
            status:1,
            message:"succeed"
        }
    }else{
       ctx.response.type = 'application/json';
       ctx.response.body = {
        status:0,
        message:"your username or email is wrong"
       }
    }
    
})

module.exports = router;