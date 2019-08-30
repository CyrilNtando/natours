const crypto = require('crypto');
const { promisify } = require('util');
const db = require('./../Model');
const catchAsync = require('./../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('./../utils/appError');
const sendEmail = require('./../utils/email');

const signToken = userId => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  res.cookie('jwt', token, {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000), //milliSeconds
    //secure: true,https
    httpOnly: true
  });

  //Remove password from the output
  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

exports.signUp = catchAsync(async (req, res, next) => {
  const newUser = await db.User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm
  });
  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  //1 check if email and password exists
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }
  //2 check if user exists && password is correct
  const user = await db.User.findOne({ email }).select('+password');
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }
  //3)if everything ok, send token to client
  createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  //1) Getting token and check if exists
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(new AppError('You are not logged in! Please log in to get access.', 401));
  }
  //2) validate token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  //3)Check if user exists
  const currentUser = await db.User.findById(decoded.id);
  if (!currentUser) return next(new AppError('The user does no longer exist.'), 401);
  //4)Check if user changed password after the token was issued
  if (currentUser.changePasswordAfter(decoded.iat))
    return next(new AppError('User recently changed password! Please log in again', 401));

  //GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action.!', 403));
    } else {
      next();
    }
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1) get user base on posted email
  const user = await db.User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('There is no user with that email address'), 404);
  }
  //2)generate random token
  const resetToken = user.createPasswordResetToken();
  //set validation false
  await user.save({ validateBeforeSave: false });
  //3)Send it to user's email
  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH with your new password and passwordConform to: ${resetURL}\nif you didn't forget your password, please ignore this email`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (Valid for 10 min)',
      message
    });
    res.status(200).json({
      status: 'success',
      message: 'token sent to email'
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError('The was an error sending the email try again later', 500));
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  //1) get user based on token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex'); //hash password from params
  //used hashed password to locate user and use $gt> to check if token is not expired
  const user = await db.User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });
  //2) if token not expired, and there is user, set the new password
  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  //3) update changedPasswordAt property for the user
  //4) Log the user in send JWT
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  //1) get user from the collection
  const user = await db.User.findById(req.user._id).select('+password');
  //2) check if Posted current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong', 401));
  }
  //3)if so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  //User.findByIdAndUpdate will not work as intended
  await user.save();
  //4)Log user in, send JWT
  createSendToken(user, 200, res);
});
