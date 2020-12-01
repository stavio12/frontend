const express = require("express");
const path = require("path");
const bodyParser = require("body-Parser");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const ejs = require("ejs");
const app = express();
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const flash = require("connect-flash");

dotenv.config({ path: "./config.env" });

app.use(express.static("public"));

//Configure mongoose dbs

const User = require("./models/user");

mongoose.connect(process.env.DATABASE_LOCAL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

//Configuring sessions
app.use(
  session({
    secret: "trumu-baku",
    resave: true,
    saveUninitialized: true,
  })
);

//configuring passport
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy({ usernameField: "email" }, User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//configuring flash messages and making variables global
app.use(flash());

app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  res.locals.currentUser = req.user;

  next();
});

const navigate = require("./routes/nav");

app.use(bodyParser.urlencoded({ extended: true }));

//configuring ejs and routes to html pages
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

//Setting routes
app.use(navigate);

const port = process.env.PORT;
app.listen(port, () => {
  console.log("Server running on " + port);
});
