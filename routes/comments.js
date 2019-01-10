var express = require("express");
// 'mergeParams' allows the comment data to be merged with the campground data so that it can be used.
var router = express.Router({mergeParams: true});
var Campground = require("../models/campground");
var Comment = require("../models/comment");
// an index.js file is actually being required below.
// 'index.js' is assumed to be the default route in JS, just like HTML.
var middleware = require("../middleware");
// ===================================
// ROUTES FOR COMMENTS
// ===================================

// NEW Comment Route - user must be logged in to leave a comment.
router.get("/new", middleware.isLoggedIn, function(req, res){
    // find campground by ID
    Campground.findById(req.params.id, function(err, campground) {
        if(err) {
            console.log(err);
        } else {
            res.render("comments/new", {campground: campground});
        }
    });
});

// CREATE Comment Route
router.post("/", middleware.isLoggedIn, function(req, res) {
    // lookup campground using ID
    Campground.findById(req.params.id, function(err, campground) {
        if(err) {
            console.log(err);
            res.redirect("/campgrounds");
        } else {
            // console.log(req.body.comment);
            Comment.create(req.body.comment, function(err, comment){
                if(err) {
                    req.flash("error", "Something went wrong.");
                    console.log(err);
                } else {
                    // add username and id to comment
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    // save comment
                    comment.save();
                    console.log(comment);
                    campground.comments.push(comment);
                    campground.save();
                    req.flash("success", "Successfully added comment!");
                    res.redirect('/campgrounds/' + campground._id);
                }
            });
        }
    });
});

// EDIT Comment Route
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
    Comment.findById(req.params.comment_id, function(err, foundComment) {
        if(err) {
            res.redirect("back");
        } else {
            res.render("comments/edit", {campground_id: req.params.id, comment: foundComment});  
        } 
    });
});

// UPDATE Comment Route
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    // res.send("This is the UPDATE Comment Route!");
    // find and update the correct campground
  Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
      if(err) {
          res.redirect("back"); 
      } else {
            // redirect to SHOW page
          res.redirect("/campgrounds/" + req.params.id); 
      }
  });
});

// DESTROY Comment Route
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
        if(err) {
            res.redirect("back");
        } else {
            req.flash("success", "Comment deleted.");
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});



module.exports = router;