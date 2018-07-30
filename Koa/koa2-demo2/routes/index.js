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
router.get('/newsfeed',async (ctx,next)=>{
  await ctx.render("../views/NewsFeed/newsfeed", {
      title: 'news feed'
    })
});
router.get('/inbox',async (ctx,next)=>{
  await ctx.render("../views/Inbox/inbox", {
      title: 'news feed'
    })
});
router.get('/tasks',async (ctx,next)=>{
  await ctx.render("../views/Tasks/tasks", {
      title: 'news feed'
    })
});
router.get('/allusers',async (ctx,next)=>{
  await ctx.render("../views/AllUsers/allusers", {
      title: 'news feed'
    })
});
router.get('/login',async (ctx,next)=>{
  await ctx.render("../views/Login/login", {
      title: 'news feed'
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
