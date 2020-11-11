var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const db = require("./models");
var expressVue = require("express-vue");
var swaggerJsdoc = require("swagger-jsdoc");
var swaggerUi = require("swagger-ui-express");
var swaggerOptions = require("./swagger.json");

var indexRouter = require('./routes/index/index');
var apiRouter = require('./routes/api/api');

var app = express();

// view engine setup
//ExpressVue Setup
const vueOptions = {
  rootPath: path.join(__dirname, "routes"),
  template: {
    html: {
      start: '<!DOCTYPE html><html>',
      end: '</html>'
    },
    body: {
      start: '<body class="gray-bg">',
      end: '</body>'
    },
    template: {
      start: '<div id="app">',
      end: '</div>'
    }
  }
};
expressVue.use(app, vueOptions);
const expressVueMiddleware = expressVue.init(vueOptions);
app.use(expressVueMiddleware);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api', apiRouter);
const specs = swaggerJsdoc(swaggerOptions);
app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(specs)
);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


//Setup database and create base data for product inventory
db.sequelize.sync({ force: true }).then(() => {
  console.log("Database models sync - SUCCESS");
  db.products.create({name:'ZX 700 HD SHOES', quantity: 55});
  db.products.create({name:'PREDATOR MUTATOR 20.1', quantity: 265});
  db.products.create({name:'SUPERSTAR SHOES', quantity: 10});
  db.products.create({name:'032C CAMPUS PRINCE', quantity: 4});
  db.products.create({name:'COPA 20.1 FG', quantity: 60});
  db.products.create({name:'PREDATOR 20.3', quantity: 82});
  db.products.create({name:'NEMEZIZ 7', quantity: 39});
  db.products.create({name:'COPA GLORO', quantity: 19});
  db.products.create({name:'KOKE 8', quantity: 3});
  db.products.create({name:'SPUNKY 30.2', quantity: 76});
  console.log("Product Inventory create - SUCCESS");
});

module.exports = app;
