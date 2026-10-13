const express = require('express');
const router = express.Router({ mergeParams: true });
const Listing = require('../models/listing');
const wrapAsync = require('../utils/wrapAsync');
const { listingSchema } = require('../schema');
const { reviewSchema } = require('../schema');
const ExpressError = require('../utils/ExpressError');
const Review = require('../models/review');
const {isLoggedIn, validateReview, isReviewAuthor} = require('../middleware.js');
const reviewController = require('../controllers/reviews.js');


//create reviews--post route
router.post("/", isLoggedIn, validateReview, wrapAsync(reviewController.createReview));

//delete review
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, wrapAsync(reviewController.destroyReview));  

module.exports = router;
