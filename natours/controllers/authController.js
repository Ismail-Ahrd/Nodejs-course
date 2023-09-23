const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/email');


const signToken = id => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { 
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    
    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        //the cookie will only be sent on an encrypted connection(so when we are using https) 
        // secure: true,
        //the cookie can't be accessed or modified in any way by the browser 
        //(the browser will onlyreceive the cookie, store it and send it automatically along with every request)
        httpOnly: true
    }
    if(process.env.NODE_ENV==='production') cookieOptions.secure = true;
    res.cookie('jwt', token, cookieOptions);

    //Remove the password from the output
    user.password = undefined

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    });
};

exports.signUp = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        role: req.body.role,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        passwordChangedAt: req.body.passwordChangedAt
    });

    createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    //1-Check if email and password exist
    if (!email || !password) {
        return next(new AppError('Please provide Email and Password!', 400));
    };

    //2-Check if user exist and password is correct
    const user = await User.findOne({ email }).select('+password');
    // console.log(user);
    // we use + in the select to add password to the object
    //(if we don't use it the user object will only have password)

    if (!user || !await user.correctPassword(password, user.password)) {
        //401: Unauthorized
        return next(new AppError('Incorrect email or password', 401));
    }

    //3-if everything is ok, send token to user
    createSendToken(user, 200, res);
});

exports.protect = catchAsync( async (req, res, next) => {
    //1-Get token and check if it's there
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    };

    if(!token) {
        return next(new AppError('You are not logged in! Please log in to get access.', 401));
    };

    //2-Verification token
    //instead of using a callback fun in the verify method, we are transforming it to a promise
    //with the promisify fun 
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    // console.log(decoded);

    //3-Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if(!currentUser) {
        return next(new AppError('The user belonging to this token does no longer exist.', 401));
    };

    //4-Check if user changed password after the token was issued
    //decoded.iat(): time when the token was issued
    if(currentUser.changedPasswordAfter(decoded.iat)) {
        return next(new AppError('User recently changed password. Please log in again!', 401))
    };
    
    //GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;   //!!!!!!!!
    next();
});

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if(!roles.includes(req.user.role)) {
            //403: forbidden
            next(new AppError('You do not have permission to perform this action', 403));
        }
        next();
    }
};


exports.forgotPassword = catchAsync(async (req, res,next) => {
    //1- Get user based on POSTed email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return next(new AppError('There is no user with this email adress!', 404));
    }

    //2-Generate the random reset token
    const resetToken = user.createPasswordRessetToken();
    //saving the modification in the document
    await user.save({ validateBeforeSave: false });

    //3-Send it to user's email
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to ${resetURL}.\n If you didn't forgot your password please ignore this email.`;
    
    try {
        await sendEmail({
            email: user.email,
            subject: 'Your password reset token (valid for 10min)',
            message
        }) ;
    
        res.status(200).json({
            status: 'success',
            message: 'Token sent to email!'
        });
    } catch(err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });
        // console.log(err);
        return next(new AppError('There was an error sending the email! Try again later'), 500);
    }    
    
});

exports.resetPassword = catchAsync(async (req, res,next) => {
    //1-Get User based on the token
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({ passwordResetToken: hashedToken, passwordResetExpires: { $gt: Date.now() } });

    //2-If tokn has not expired, and there is user, set the new Password
    if(!user) {
        return next(new AppError('Token is invalid or has expired', 400));
    };
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    //3-Update passwordChangedAt proporty of the user
    //4- Log the user in, send the JWT
    createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
    //1-Get User from collection
    console.log(req.user.id);
    const user = await User.findById(req.user.id).select('+password');

    //2-Check if POSTed current password is correct
    if(!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
        return next(new AppError('Your current Password is wrong.', 401));
    };

    //3-If so, Update password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    //4-Log user in, send JWT
    createSendToken(user, 200, res);
});