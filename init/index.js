const mongoose = require('mongoose');
const initdata = require('./data.js');
const Listing    = require("../models/listing.js");


const MONGO_URL = 'mongodb://127.0.0.1:27017/wanderlust';

main().then(() => {
  console.log('MongoDB connection established');
}   ).catch((err) => {
  console.error('MongoDB connection error:', err);
});
async function main() {
  await mongoose.connect(MONGO_URL);
  console.log('Connected to MongoDB');
}


const initDB = async () => {
  try {
    await Listing.deleteMany({});
    
    /*const listings = initdata.data.map(({ image, ...listing }) => ({
      ...listing,
      images: image,
    }));*/
    initdata.data=initdata.data.map((obj)=>({ ...obj, owner:"6ac67391913e34147e0b2e10"}));

    await Listing.insertMany(initdata.data);
    console.log("Database initialized with sample data");
  } catch (error) {
    console.error("Error initializing database:", error);
  }
};


initDB();