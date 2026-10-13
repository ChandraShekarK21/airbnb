const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync');
//const Review = require('../models/review');
const { isLoggedIn, isOwner, validateListing } = require('../middleware.js');
const listingController  = require('../controllers/listings.js');
const multer= require("multer");
const {storage}= require("../cloudConfig.js")
const upload=multer({ storage })

//index route all_listings //create route
router.route("/")
.get(wrapAsync(listingController.index))
.post(isLoggedIn, upload.single("listing[image]"), (req, res, next) => {
    if (req.file && req.body.listing) {
        req.body.listing.image = req.file.path;
    }
    next();
}, validateListing, wrapAsync(listingController.createListing));

//NEW route
router.get("/new", isLoggedIn, listingController.renderNewForm);

//show route //update route //delete route
router.route("/:id")
.get( wrapAsync(listingController.showListing))
.put(isLoggedIn, isOwner, upload.single("listing[image]"), (req, res, next) => {
    if (req.file && req.body.listing) {
        req.body.listing.image = req.file.path;
    }
    next();
}, validateListing, wrapAsync(listingController.updateListing))
.delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));

//edit form route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));



module.exports = router;
