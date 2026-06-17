const express = require("express");

const router = express.Router();

router.get("/index", (req, res, next) => {
  res.locals.filter = null;
  res.render("index.ejs");
});
router.get("/", (req, res, next) => {
  res.render("home.ejs");
});
router.get("/error", (req, res, next) => {
  res.render("error.ejs");
});
module.exports = router;
