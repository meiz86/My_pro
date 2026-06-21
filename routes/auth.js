const express = require("express");
const passport = require("passport");
const localSterategy = require("passport-local");
const crypto = require("crypto");
const db = require("../db");

passport.use(
  new localSterategy(function verify(username, password, cb) {
    db.get(
      "SELECT * FROM users WHERE username = ?",
      [username],
      function (err, row) {
        if (err) return cb(err + "NANA");
        if (!row)
          return cb(null, false, {
            message: "Incorrect username or Password",
          });

        crypto.pbkdf2(
          password,
          row.salt,
          310000,
          32,
          "sha256",
          (err, hashedPassword) => {
            if (err) return cb(err + "NANA");
            if (!crypto.timingSafeEqual(row.hashed_password, hashedPassword)) {
              return cb(null, false, {
                message: "Incorrect username or Password",
              });
            }
            return cb(null, row);
          },
        );
      },
    );
  }),
);

const router = express.Router();
// it scedules the cb function to be exectuted in the next iteration
passport.serializeUser((user, cb) =>
  process.nextTick(() =>
    cb(null, { id: user.id, username: user.username, name: user.name }),
  ),
);

passport.deserializeUser((user, cb) => process.nextTick(() => cb(null, user)));

router.get("/login", (req, res, next) => {
  res.render("login");
});

router.post(
  "/login/password",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
  }),
);

router.post("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect("/");
  });
});

router.get("/signup", (req, res, next) => res.render("signup"));

router.post("/signup", (req, res, next) => {
  let salt = crypto.randomBytes(16);
  crypto.pbkdf2(
    req.body.password,
    salt,
    310000,
    32,
    "sha256",
    (err, hashedPassword) => {
      if (err) return next(err);
      db.run(
        "INSERT INTO users (username,hashed_password,salt) VALUES (?,?,?)",
        [req.body.username, hashedPassword, salt],
        function (err) {
          if (err) return next(err);
          let user = {
            id: this.lastID,
            username: req.body.username,
          };
          req.login(user, (err) => {
            if (err) return next(err);
            res.redirect("/");
          });
        },
      );
    },
  );
});

module.exports = router;
