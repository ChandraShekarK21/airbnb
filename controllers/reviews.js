const Listing = require('../models/listing');
const Review = require('../models/review');

module.exports.createReview = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    return res.status(404).send('Listing not found');
  }
  const review = new Review(req.body.review);
  review.author = req.user._id;
  await review.save();
  await Listing.findByIdAndUpdate(id, { $push: { reviews: review._id } });
  req.flash('success', 'Review added successfully!');
  res.redirect(`/listings/${id}`);
};

module.exports.destroyReview = async (req, res) => {
  const { id, reviewId } = req.params;
  const listing = await Listing.findById(id); 
  if (!listing) {
    return res.status(404).send('Listing not found');
  }
  const review = await Review.findById(reviewId);
  if (!review) {
    return res.status(404).send('Review not found');
  }
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: review._id } });
  await review.deleteOne();
  req.flash('success', 'Review deleted successfully!');
  res.redirect(`/listings/${id}`);
};
