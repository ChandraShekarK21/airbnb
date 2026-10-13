const Joi=require('joi');
const Listing = require('./models/listing');

module.exports.listingSchema=Joi.object({
    listing:Joi.object({
        title:Joi.string().required(),
        description:Joi.string().required(),
        category:Joi.string().valid(...Listing.categories).required(),
        image:Joi.string().required(),
        price:Joi.number().required().min(0),
        location:Joi.string().required(),
        country:Joi.string().allow("", null).optional()
    }).required()
});

module.exports.listingUpdateSchema=module.exports.listingSchema.fork(
    [["listing", "image"]],
    (imageSchema) => imageSchema.optional()
);

module.exports.reviewSchema=Joi.object({
    review:Joi.object({
        comment:Joi.string().required(),
        rating:Joi.number().required().min(1).max(5)
    }).required()
});