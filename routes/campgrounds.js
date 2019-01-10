var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
// an index.js file is actually being required below.
// 'index.js' is assumed to be the default route in JS, just like HTML.
var middleware = require("../middleware");

// INDEX Route - show all campgrounds
router.get("/", function(req, res) { // show the campgrounds
    // Get all campgrounds from DB
    Campground.find({}, function(err, allCampgrounds){
        if(err){
            console.log(err);
        } else {
            res.render("campgrounds/index",{campgrounds:allCampgrounds});
        }
    });
});

// CREATE Campground Route - add new campground to DB
router.post("/", middleware.isLoggedIn, function(req, res) { 
    // res.send("YOU HIT THE POST ROUTE!");
    //get data from form and add to campgrounds array
    var name = req.body.name;
    var price = req.body.price;
    var image = req.body.image;
    var desc = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    };
    var newCampground = {name: name, price: price, image: image, description: desc, author: author};
    // console.log(req.user);
    // Create a new campground and save to DB
    Campground.create(newCampground, function(err, newlyCreated) {
        if(err) {
            console.log(err);     
        } else {
            //redirect to campgrounds page
            // console.log(newlyCreated);
            res.redirect("campgrounds"); // redirect defaults as a GET request
        }
    });
});

// NEW Campground Route - show form to add/create new campground
router.get("/new", middleware.isLoggedIn, function(req, res) { // show the form that will feed the post camprounds route.
   res.render("campgrounds/new"); 
});

// SHOW Campground Route - show info about a specific campground
router.get("/:id", function(req, res) {
    //find the campground with the provided ID, then populate the comments for that campground,
    // then execute the query.
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground) {
        if (err) {
            console.log(err);
        } else {
            if(!foundCampground) {
                return res.status(400).send("Item not found.");
            }
            // console.log(foundCampground);
            // render the show template with that campground
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });
});

// EDIT Campground Route
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res){
    Campground.findById(req.params.id, function(err, foundCampground){
        if(err) {
            res.redirect("back");
        } else {
            res.render("campgrounds/edit", {campground: foundCampground});
        }
    });
});

// UPDATE Campground Route
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
   // find and update the correct campground
   Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
       if(err) {
           res.redirect("/campgrounds"); 
       } else {
            // redirect to SHOW page
           res.redirect("/campgrounds/" + req.params.id); 
       }
   });
});

// DESTROY Campground Route
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){
    Campground.findByIdAndRemove(req.params.id, function(err){
        if(err) {
            res.redirect("/campgrounds");
        } else {
            res.redirect("/campgrounds");
        }
    });
});




module.exports = router;