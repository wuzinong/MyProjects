const router = require('koa-router')();
 
router.get('/',async (ctx,next)=>{
    await ctx.render("../views/Login/login", {
        title: 'login page'
      })
});

module.exports = router;