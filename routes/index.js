const express = require("express");

const router = express.Router();

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
  function (req, res, next) {
    res.locals.filter = null;
    res.render("index", { user: req.user });
  },
);

router.get("/signup", (req, res, next) => res.render("signup"));

module.exports = router;
