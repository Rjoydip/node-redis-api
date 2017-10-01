var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var redis = require('redis');

// express app instance
var app = express();

// REDIS
var client = redis.createClient({
  retry_strategy: function (options) {
    if (options.error && options.error.code === 'ECONNREFUSED') {
      // End reconnecting on a specific error and flush all commands with
      // a individual error
      return new Error('The server refused the connection');
    }
    if (options.total_retry_time > 1000 * 60 * 60) {
      // End reconnecting after a specific timeout and flush all commands
      // with a individual error
      return new Error('Retry time exhausted');
    }
    if (options.attempt > 10) {
      // End reconnecting with built in error
      return undefined;
    }
    // reconnect after
    return Math.min(options.attempt * 100, 3000);
  }
});

client.on('connect', function () {
  console.log('Redis connected');
});

client.on('error', function (error) {
  console.log(error);
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

app.get('/', function (req, res) {
  res.render("index.html");
});

app.get('/users', function (req, res) {
  client.get("users", function (err, resp) {
    if (err)
      return res.status(200).send({
        users: require("./users.json"),
        from: "From json"
      });

    if (resp === null)
      return res.status(200).send({
        users: require("./users.json"),
        from: "From json"
      });
    else
      return res.status(200).send({
        users: JSON.parse(resp),
        from: "From redis"
      });
  });
});

app.post('/users', function (req, res) {
  client.set("users", JSON.stringify(require("./users.json")), function (err, resp) {
    if (err)
      return res.status(422).send({
        err
      });

    return res.status(200).send({
      resp
    });
  });
});
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send({
    err
  });
});

module.exports = app;