const express = require('express');
const router = express.Router();
const User = require('../models/user');
const wrapAsync = require('../utils/wrapAsync');
const passport = require('passport');
const {saveRedirectURL} = require('../middleware');
const userController= require('../controllers/users.js');


router.route('/signup')
.get(userController.renderSignupForm)
.post(wrapAsync(userController.signup));

router.route("/login")
.get( userController.renderLogininForm)
.post(saveRedirectURL, passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }), wrapAsync(userController.login));

router.get('/logout', userController.logout);

module.exports = router;