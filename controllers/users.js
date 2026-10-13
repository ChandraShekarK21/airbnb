const User = require('../models/user');


module.exports.renderSignupForm=(req, res) => {
    res.render('users/signup.ejs');
};

module.exports.signup =async (req, res) => {
    try {
        let { username, email, password } = req.body; 
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, (err) => {
            if (err) {
                req.flash('error', 'An error occurred during login. Please try again.');
                return res.redirect('/login');
            }
            req.flash('success', 'WELCOME TO WANDERLUST!');
            res.redirect('/listings');
        });
        
    } catch (err) {
        req.flash('error', err.message);
        res.redirect('/signup');
    }
};

module.exports.renderLogininForm=(req, res) => {
    res.render('users/login.ejs');
};

module.exports.login=async (req, res) => {
    // Authentication logic will be handled by Passport.js middleware
    req.flash('success', 'Welcome back!');
    res.redirect(res.locals.redirectURL || '/listings');
};

module.exports.logout=(req, res) => {
    req.logout((err) => {
        if (err) {
            console.error('Error during logout:', err);
            req.flash('error', 'An error occurred during logout. Please try again.');
            return res.redirect('/listings');
        }
        req.flash('success', 'You have been logged out successfully.');
        res.redirect('/listings');
    });
};