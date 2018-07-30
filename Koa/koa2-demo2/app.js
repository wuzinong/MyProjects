const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')

const index = require('./routes/index')
const users = require('./routes/users')

const route = require('./routes/route');

const mongoose = require('mongoose');
const db = 'mongodb://localhost:27017';

//connect db
mongoose.Promise = require('bluebird');
mongoose.connect(db,{useMongoClient:true});

 
// error handler
onerror(app)

// middlewares
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))
app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))

app.use(views(__dirname + '/views', {
  extension: 'pug'
}));

// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

// routes
app.use(route.indexRoute.routes(), route.indexRoute.allowedMethods())
app.use(route.userRoute.routes(), route.userRoute.allowedMethods())
app.use(route.loginRoute.routes(),route.loginRoute.allowedMethods()); 
app.use(route.apiRoute.routes(),route.apiRoute.allowedMethods());
// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

module.exports = app
