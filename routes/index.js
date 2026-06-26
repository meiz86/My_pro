const express = require("express");
const db = require("../db");
const crypto = require("crypto");
const { title, nextTick } = require("process");
const { url } = require("inspector");
const { log } = require("console");
const ensureLogIn = require("connect-ensure-login").ensureLoggedIn;

const router = express.Router();

const ensuredLoggedIn = ensureLogIn();

function fetchExer(req, res, next) {
  db.all(
    "SELECT * FROM exer WHERE owner_id = ?",
    [req.user.id],
    (err, rows) => {
      if (err) return next(err);
      const exer = rows.map((row) => {
        return {
          id: row.id,
          title: row.title,
          completed: row.completed === 1 ? true : false,
          url: "/" + row.id,
        };
      });
      res.locals.exer = exer; // now we can access row with EJS locally
      res.locals.activeCount = exer.filter((todo) => !todo.completed).length;
      res.locals.completedCount = exer.length - res.locals.activeCount;
      next();
    },
  );
}

// router.get("/index", (req, res, next) => {
//   res.locals.filter = null;
//   res.render("index.ejs");
// });
router.get(
  "/",
  (req, res, next) => {
    //   console.log("req.user =", req.user);

    if (!req.user) return res.render("home");
    next();
  },
  fetchExer,
  function (req, res, next) {
    res.locals.filter = null;
    res.render("index", { user: req.user });
  },
);

router.get("/active", ensuredLoggedIn, fetchExer, (req, res, next) => {
  res.locals.exer = res.locals.exer.filter((todo) => !todo.completed);
  res.locals.filter = "active";
  res.render("index", { user: req.user });
});

router.get("/completed", ensuredLoggedIn, fetchExer, (req, res, next) => {
  res.locals.exer = res.locals.exer.filter((todo) => todo.completed);
  res.locals.filter = "completed";
  res.render("index", { user: req.user });
});

router.post(
  "/",
  ensuredLoggedIn,
  (req, res, next) => {
    req.body.title = req.body.title.trim(); //remove white spaces
    next();
  },

  (req, res, next) => {
    if (req.body.title !== "") return next();
    return res.redirect("/" + (req.body.filter || ""));
  },
  function (req, res, next) {
    db.run(
      "INSERT INTO exer (owner_id, title, completed) VALUES (?, ?, ?)",
      [req.user.id, req.body.title, req.body.completed == true ? 1 : null],
      function (err) {
        if (err) {
          return next(err);
        }
        return res.redirect("/" + (req.body.filter || ""));
      },
    );
  },
);

module.exports = router;
