if(process.env.NODE_ENV != "production"){
  require("dotenv").config();
}

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const ExpressError = require('./utils/ExpressError');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');;

const listingRouter = require('./routes/listings');
const reviewRouter= require('./routes/reviews');
const userRouter = require('./routes/user');

//const dns = require("dns");
// Force Node.js to use Google DNS
//dns.setServers(["8.8.8.8", "8.8.4.4"]);
// Or Cloudflare
// dns.setServers(["1.1.1.1", "1.0.0.1"]);

//const MONGO_URL = 'mongodb://127.0.0.1:27017/wanderlust';
const dbUrl=process.env.ATLASDB_URL;
main().then(() => {
  console.log('MongoDB connection established');
}   ).catch((err) => {
  console.error('MongoDB connection error:', err);
});

async function main() {
  await mongoose.connect(dbUrl);
  console.log('Connected to MongoDB');
}

app.use(methodOverride('_method'));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.engine('ejs', ejsMate);

const store=MongoStore.create({
  mongoUrl:dbUrl,
  crypto:{
    secret: process.env.SECRET,
  },
  touchAfter:24 *3600,
});

store.on("error",()=>{
  console.log("ERROR in MONGO SESSION STORE",err);
})
const sessionOptions={
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie:{
    expires: Date.now() + 7* 24 * 60 * 60 * 1000 , // 1 week
    maxAge: 7* 24 * 60 * 60 * 1000, // 1 week
    httpOnly: true,
  }
}; 
app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  if (res.locals.success && res.locals.success.length > 0) {
    console.log('Success message:', res.locals.success);
  }
  res.locals.error = req.flash('error');
  if (res.locals.error && res.locals.error.length > 0) {
    console.log('Error message:', res.locals.error);
  }
  res.locals.currentUser = req.user;
  next();
});

app.use("/demouser", async (req, res) => {
  let demoUser = new User({
     email: 'fake@example.com' ,
     username: 'fakeuser'
  });
  let registeredUser = await User.register(demoUser, 'fakepassword');
  res.send('registeredUser: ' + registeredUser);
});

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

app.use((req, res, next) => {
  next(new ExpressError(404, 'Page Not Found'));
});

app.use((err, req, res, next) => {
  let { statusCode = 500, message = 'Something went wrong' } = err;
  if (!err.message) err.message = 'Oh No, Something Went Wrong!';
  res.status(statusCode).render('error.ejs', { err });
  //res.status(statusCode).send(message);
});

 

/*app.get('/testlistings', async (req, res) => {
  const sampleListing=new Listing({
    title: "Sample Listing",
    description: "This is a sample listing for testing.",   
    images: "https://unsplash.com/photos/sailing-boats-in-nyhavn-copenhagen-8E_RqlT7RUs",
    price: 100,
    location: "Sample Location",
    country: "Sample Country"
  });
  await sampleListing.save();
  console.log('Sample listing created and saved to the database.');
  res.send('Sample listing created and saved to the database.');
});*/

const port = 8080;  
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});