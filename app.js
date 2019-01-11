var express    = require("express"),
    app        = express(),
    bodyParser = require("body-parser"),
    mongoose   = require("mongoose"),
    flash      = require("connect-flash"),
    passport   = require("passport"),
    LocalStrategy = require("passport-local"),
    methodOverride = require("method-override"),
    Campground = require("./models/campground"),
    Comment    = require("./models/comment"),
    User       = require("./models/user"),
    seedDB     = require("./seeds");
  
// setup links to files containing routes  
var indexRoutes = require("./routes/index"),
    campgroundRoutes = require("./routes/campgrounds"),
    commentRoutes = require("./routes/comments");
    
    console.log(process.env.DATABASEURL);

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
// mongoose.connect("mongodb://localhost:27017/yelp_camp_v9", {useNewUrlParser: true})
// For remote mongoose, use this link to use MLab.
// Use the username and password of the user a user assigned to the database.
// mongoose.connect("mongodb://audiofreak7:passw0rd@ds153304.mlab.com:53304/yelpcamp99", {useNewUrlParser: true});
mongoose.connect(process.env.DATABASEURL, {useNewUrlParser: true});
// Serve the public directory, so that the stylesheet is easier to access
// '__dirname' refers to the app working directory
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());

// remove entries from the database, and seed it with data from the 'seed.js' file
// seedDB();

// PASSPORT CONFIGURATION
app.use(require("express-session") ({
    secret: "My cat's breath smells like cat food",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
// create a new LocalStrategy using the User authenticate method,
// which comes from passportLocalMongoose
passport.use(new LocalStrategy(User.authenticate()));
// The following passport methods read the session then, 
// 1. take the encoded data from the session and unencode it (deserialize)
// 2. encode the data and put it back in the session (serialize)
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// pass the req.user data to every template. The side effect of this is that the navbar auth links appear correctly.
// also, flash popups can be used in every template.
app.use(function(req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

// use the routes that are specified in seperate files 
app.use("/", indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);

// END
app.listen(process.env.PORT, process.env.IP, function() {
   console.log("YelpCamp Server is listening!!!");
});