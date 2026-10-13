const Listing = require('../models/listing');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const ExpressError = require('../utils/ExpressError');
const maptoken= process.env.MAP_TOKEN;
const  geocodingClient = mbxGeocoding({ accessToken: maptoken });

const geocodeLocation = async (location) => {
  const response = await geocodingClient.forwardGeocode({
    query: location,
    limit: 1,
  }).send();
  const geometry = response.body.features[0]?.geometry;

  if (!geometry || geometry.type !== 'Point' || !Array.isArray(geometry.coordinates)) {
    throw new ExpressError(400, 'Could not find coordinates for the provided location.');
  }

  return geometry;
};

module.exports.index = async (req, res) => {
  const alllistings = await Listing.find();
  res.render("listings/index.ejs", { alllistings, categories: Listing.categories });
};


module.exports.renderNewForm =async (req, res) => {
  res.render("listings/new.ejs", { categories: Listing.categories });
};


module.exports.showListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: { path: "author", select: "username" },
    })
    .populate("owner");
  if (!listing) {
    req.flash('error', 'Listing you requested for not exists');
    return res.redirect("/listings");
  }
  res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res) => {
  let url=req.file.path;
  let filename=req.file.filename;

  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id; // Set the owner to the current user
  newListing.image={url,filename};
  newListing.geometry = await geocodeLocation(req.body.listing.location);
  let savedListing=await newListing.save();
  console.log(savedListing);
  req.flash('success', 'Listing created successfully!');
  res.redirect("/listings");
};

module.exports.renderEditForm =async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash('error', 'Listing you requested for not exists');
    return res.redirect("/listings");
  }
  let originalImageURL= listing.image.url;
  originalImageURL= originalImageURL.replace("/upload", "/upload/w_250");
  res.render("listings/edit.ejs", { listing, originalImageURL, categories: Listing.categories });
};


module.exports.updateListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash('error', 'Listing you requested for not exists');
    return res.redirect('/listings');
  }

  const listingData = { ...req.body.listing };
  if (listingData.location !== listing.location || !listing.geometry?.coordinates?.length) {
    listingData.geometry = await geocodeLocation(listingData.location);
  }
  if (req.file) {
    listingData.image = {
      url: req.file.path,
      filename: req.file.filename,
    };
  } else {
    delete listingData.image;
  }
  const updatedListing = await Listing.findByIdAndUpdate(id, listingData, { runValidators: true });
  console.log("updated listing", updatedListing);
  req.flash('success', 'Listing updated successfully!');
  res.redirect(`/listings/${id}`);
};


module.exports.destroyListing = async (req, res) => {
  const { id } = req.params;
  let deleteditem = await Listing.findByIdAndDelete(id);
  console.log("deleted item", deleteditem);
  req.flash('success', 'Listing deleted successfully!');
  res.redirect("/listings");
};