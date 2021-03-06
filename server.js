var express = require("express");
var morgan = require("morgan");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var app = express();
var port = process.env.PORT || 3000;
var authe = require('./authentication/Authenticate')
var au = require('./authentication/ValidToken');
var jwt = require("jsonwebtoken");
var User = require('./models/User');

mongoose.connect('mongodb://localhost/foo');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(morgan("dev"));
app.use(function(req, res, next) {
res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
    next();
});

app.post('/login', authe.login);
app.post('/signin', function(req, res) {
  User.findOne({email: req.body.email, password: req.body.password}, function(err, user) {
    if (err) {
      res.json({
        type: false,
        data: "Error occured: " + err
      });
    } else {
      if (user) {
        res.json({
          type: false,
          data: "User already exists!"
        });
      } else {
        var userModel = new User();
        userModel.email = req.body.email;
        userModel.password = req.body.password;
        userModel.save(function(err, user) {
          user.token = jwt.sign(user, process.env.JWT_SECRET);
          user.save(function(err, user1) {
            res.json({ type: true, data: user1, token: user1.token });
          });
        })
      }
    }
  });
});

process.on('uncaughtException', function(err) {
  console.log(err);
});

app.listen(port, function () {
  console.log( "Servidor Express observando a porta " + port);
});
