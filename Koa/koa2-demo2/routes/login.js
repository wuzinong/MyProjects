const router = require('koa-router')();

router.get('/',async (ctx,next)=>{
    await ctx.render('login', {
        title: 'login page'
      })
});

module.exports = router;