const indexRouter = require('./index');
const loginRouter = require('./login');
const logoutRouter = require('./logout');
const usersRouter = require('./users');

// module.exports = {
//     indexRouter,
//     loginRouter,
//     logoutRouter,
//     userRouter
// }

exports.indexRouter = indexRouter;
exports.loginRouter = loginRouter;
exports.logoutRouter = logoutRouter;
exports.usersRouter = usersRouter;