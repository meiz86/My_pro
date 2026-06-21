require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
var logger = require("morgan");
const session = require("express-session");
const SQliteStore = require("connect-sqlite3")(session);
const createError = require("http-errors");

const passport = require("passport");

const indexRouter = require("../routes/index");
const path = require("path");
const db = require("../db");
const authRouter = require("../routes/auth");

const app = express();
app.locals.pluralize = require("pluralize");
const message = "Not Found";

// View Engine
app.set("views", path.join(__dirname, "..", "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "..", "public", "css")));
// a session secret is simply used to compute hash

app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: false,
    store: new SQliteStore({
      db: "sessions.db",
      dir: "./var/db",
    }),
  }),
);
app.use(passport.authenticate("session"));
app.use("/", indexRouter);
app.use("/", authRouter);

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
app.use((err, req, res, next) => {
  // set locals only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  //   Render error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
