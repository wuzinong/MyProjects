const router = require('koa-router')()

router.get('/home', async (ctx, next) => {
    await ctx.render('index', {
      title: 'Hello Koa 2!'
    })
});

router.get('/Dashboard',async (ctx,next)=>{
  await ctx.render("../views/Dashboard/dashboard", {
      title: 'dashboard page'
    })
});

router.get('/catalog',async (ctx,next)=>{
  await ctx.render("../views/Catalog/catalog", {
      title: 'catelog page'
    })
});

router.get('/string', async (ctx, next) => {
  ctx.body = 'koa2 string'
})

router.get('/json', async (ctx, next) => {
  ctx.body = {
    title: 'koa2 json'
  }
})

module.exports = router
