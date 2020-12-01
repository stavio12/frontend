const express = require("express");
const router = express.Router();
const passport = require("passport");
const crypto = require("crypto");
const async = require("async");
const nodemailer = require("nodemailer");

const User = require("../models/user");

//Authenticate user

function verifyUser(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  req.flash("error_msg", "Please Login to access this page!");
  res.redirect("/");
}

//All GET ROUTE
router.get("/", (req, res) => {
  res.render("index");
});

router.get("/signup", (req, res) => {
  res.render("signup");
});

router.get("/signin", (req, res) => {
  res.render("signin");
});

router.get("/form", verifyUser, (req, res) => {
  res.render("form");
});

router.get("/logout", verifyUser, (req, res) => {
  req.logOut();
  req.flash("success_msg", "You have been logged out");
  res.redirect("/signin");
});

//All POST
router.post(
  "/signin",
  passport.authenticate("local", {
    successRedirect: "/form",
    failureRedirect: "/signin",
    failureFlash: "invalid email or password. Try again!!",
  })
);

router.post("/signup", (req, res) => {
  let { username, email, password } = req.body;

  let userData = {
    name: username,
    email: email,
  };

  User.register(userData, password, (err, user) => {
    if (err) {
      console.log(err);
      req.flash("error_msg", "ERROR" + err);
      res.redirect("/signin");
    }

    // After creating send email to user to confirm

    let smtpTransport = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.GMAIL_EMAIL,
        pass: process.env.GMAIL_PASSWORD,
      },
    });

    let mailOptions = {
      to: req.body.email,
      from: "Mocare.io monchare@gmail.com",
      subject: "Moncare account created Created",
      text: "Hi " + req.body.username + ", you have been added as an account holder to Walmart Webscrapper",
    };

    smtpTransport.sendMail(mailOptions, (err) => {
      req.flash("success_msg", "Account Created Successfully");
      res.redirect("/signin");
    });
  });

  console.log(password, email);
});

module.exports = router;
