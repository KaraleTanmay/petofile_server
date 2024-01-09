const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');
const appError = require('../utils/appErrors');
const sendEmail = require('../utils/mail');
const { promisify } = require('util');
const crypto = require('crypto');

const signToken = (id) => {
    return (jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    }))
}

const createSendJWTToken = (user, statusCode, res) => {
    const token = signToken(user._id);

    const cookieOptions = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 100
        ),
        // httpOnly: true
        secure: true
    }

    // if (process.env.NODE_ENV === "production") {
    //     cookieOptions.secure = true
    // }

    user.password = undefined

    res.cookie("jwt", token, cookieOptions)

    res.status(statusCode).json({
        status: "success",
        data: {
            user
        }
    })
}

exports.signup = catchAsync(async (req, res, next) => {
    if (!req.body.password == req.body.confirmPassword && req.body.email) {
        return next(new appError("passwords do not match", 400))
    }
    const verificationString = crypto.createHash('sha256').update(crypto.randomBytes(4)).digest("hex");
    req.body.verificationString = verificationString
    const newUser = await User.create(req.body);

    const message = "Your account has been created. Verify it by clicking following link";

    try {
        await sendEmail({
            email: newUser.email,
            subject: 'verification of petofile account',
            message,
            link: process.env.url + "verify/" + verificationString
        });

        res.status(200).json({
            status: 'success',
            message: 'Verification link sent to email!'
        });
    } catch (err) {

        await User.findByIdAndDelete(newUser._id);
        console.log(err)
        return next(
            new appError('There was an error sending the email. Try again later!'),
            500
        );
    }

})

exports.verify = catchAsync(async (req, res, next) => {
    const verificationString = req.params.verificationString
    const user = await User.findOne({ verificationString })
    if (!user) {
        new appError('This user does not exists. Please create a new account', 404)
    }
    user.isVerified = true
    await user.save()
    res.redirect(process.env.client)
})

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    // check if password and email exist in sent data
    if (!email || !password) {
        return next((new appError("plaease send email and password", 400)));
    }
    // check if email exist and password is correct
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.checkPassword(password, user.password))) {
        return next((new appError("plaease send correct email and password", 401)));
    }

    createSendJWTToken(user, 200, res)
})

exports.protected = catchAsync(async (req, res, next) => {
    //to check if token exist in request
    let token;
    if (req.headers.cookie) {
        token = req.headers.cookie.split("jwt=")[1];

    }
    if (!token) {
        return next(new appError("please log in first", 401));
    }

    // token varification
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // check if user still exists
    const freshUser = await User.findById(decoded.id);
    if (!freshUser) {
        return next(new appError("the user no longer exists", 401));
    }

    req.user = freshUser;
    next()
})

exports.forgotPassword = catchAsync(async (req, res, next) => {

    // 1) Get user based on POSTed email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(new appError('There is no user with email address.', 404));
    }

    // 2) Generate the random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // 3) Send it to user's email
    const resetURL = `${process.env.url}users/reset-password/${resetToken}`;

    const message = "Forgot password was requested by you. Click below to reset your password. This link is only available for 10 minutes"

    try {
        await sendEmail({
            email: req.body.email,
            subject: 'reset password of petofile account',
            message,
            link: resetURL
        });

        res.status(200).json({
            status: 'success',
            message: 'Token sent to email!'
        });
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });
        console.log(err)
        return next(
            new appError('There was an error sending the email. Try again later!'),
            500
        );
    }
});

exports.resetPassword = catchAsync(async (req, res, next) => {

    // get the user based on the token
    const hashToken = crypto.createHash('sha256').update(req.params.token).digest("hex");
    const user = await User.findOne({ passwordResetToken: hashToken, passwordResetExpires: { $gt: Date.now() } });

    // if the token has not expired and there is user update the password 
    if (!user) {
        return next(new appError("token expired or is invalid", 400))
    }

    const newPassword = crypto.createHash('sha256').update(user.name || user.email).digest("hex")
    user.password = newPassword
    user.passwordResetExpires = undefined;
    user.passwordResetToken = undefined;
    await user.save();

    const message = "Password for your petofile account has been changed to " + newPassword + " click below to log in"
    // send mail to user regarding new password
    try {
        await sendEmail({
            email: user.email,
            subject: 'new password for petofile account',
            message,
            link: process.env.client
        });

        res.status(200).json({
            status: "success",
            message: "please check your email"
        });
    } catch (err) {
        console.log(err)
        return next(
            new appError('There was an error sending the email. Try again later!'),
            500
        );
    }

})

exports.updatePassword = catchAsync(async (req, res, next) => {

    // get the user from collection
    const user = await User.findById(req.user.id).select("+password");

    //check if the posted password is correct
    if (!(await user.checkPassword(req.body.oldPassword, user.password))) {
        return next(new appError("incorrect password", 401));
    }

    //update the password
    if (!req.body.password === req.body.passwordConfirm) {
        return next(new appError("passwords doesn't match"))
    }

    user.password = req.body.password;
    await user.save();

    // log the user in and sending jwt
    res.status(200).json({
        status: "success",
        data: user
    })
})