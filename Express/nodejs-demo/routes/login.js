var express = require('express');
var router = express.Router();

/* GET users listing. */

exports.login = function(req, res){
  res.render('login', { title: '用户登陆aaa'});
};

exports.doLogin = function(req,res){
  var user = {
    username:'admin',
    password:'admin'
  }
  if(req.body.username===user.username && req.body.password === user.password){
     res.redirect('/');
  }
  res.redirect('/login');
}

