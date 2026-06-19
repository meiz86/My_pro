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

module.exports = router;
