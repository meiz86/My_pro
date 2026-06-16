require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
var logger = require("morgan");
const createError = require("http-errors");
const session = require("express-session");
const passport = require("passport");
const SQliteStore = require("connect-sqlite3")(session);
const indexRouter = require("../routes/index");

const app = express();
app.locals.pluralize = require("pluralize");

// View Engine
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser);
app.use(express.static("public"));
// a session secret is simply used to compute hash
app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
    store: new SQliteStore({
      db: "sessionStorage.db",
      dir: "./var/dir",
    }),
  }),
);

app.use(passport.authenticate("session"));
app.use((req, res, next) => {
  let msgs = req.session.messages || [];
  res.locals.messages = msgs;
  res.locals.hasMessages = !!msgs.length;
  req.session.messages = [];
  next();
});

//catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// Error Habdler
app.use((er, req, res) => {
  // set locals only providing error in development
  res.locals.messages = err.messages;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  //   Render error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
