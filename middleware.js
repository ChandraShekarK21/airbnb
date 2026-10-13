const Listing = require('./models/listing');
const Review = require('./models/review');
const { listingSchema, listingUpdateSchema } = require('./schema');
const { reviewSchema } = require('./schema');
const ExpressError = require('./utils/ExpressError');

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.redirectURL = req.originalUrl; // Store the original URL in the session
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login');
    }
    next();
};

module.exports.saveRedirectURL = (req, res, next) => {
    if (req.session.redirectURL) {
        res.locals.redirectURL = req.session.redirectURL; // Make it available in res.locals
        delete req.session.redirectURL; // Clear it from the session after using it
    }
    next();
};

module.exports.isOwner = async (req, res, next) => {
    const { id } = req.params;
    let listing=await Listing.findById(id);
    if(!listing || !listing.owner || !listing.owner.equals(res.locals.currentUser._id)){
        req.flash('error', 'You are not authorized to perform this action!');
        return res.redirect(`/listings/${id}`);
    }
    next();
};  

module.exports.validateListing = (req, res, next) => {
  const schema = req.method === 'PUT' ? listingUpdateSchema : listingSchema;
  const { error } = schema.validate(req.body);
  if (error) {
    throw new ExpressError(400, 'Invalid listing data');
  }else {
  next();
  }
};

module.exports.validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    throw new ExpressError(400, 'Invalid review data');
  } else {
    next();
  }
};

module.exports.isReviewAuthor = async (req, res, next) => {
    let { id, reviewId } = req.params;
    let review=await Review.findById(reviewId);
    if(!review.author.equals(res.locals.currentUser._id)){
        req.flash('error', 'You are not authorized to perform this action!');
        return res.redirect(`/listings/${id}`);
    }
    next();
};  
