const db = require('./../Model');
const factory = require('./handlerFactory');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });

  return { ...newObj };
};
exports.createUser = (req, res, next) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not defined! Please use  / signup Instead'
  });
};

exports.getMe = (req, res, next) => {
  req.params.id = req.user._id;
  next();
};
exports.updateMe = catchAsync(async (req, res, next) => {
  //1) Create error post password data
  if (req.body.password || req.body.passwordConfirm) {
    next(new AppError('This route is not for password updates/ Please use updateMyPassword', 400));
  }
  //2) update user document and return updated user
  //filtered out unwanted fields names , that are not allowed to be updated
  const filteredBody = filterObj(req.body, 'name', 'email');
  //use findByIdAndUpdate to none-sensitive data
  const updatedUser = await db.User.findByIdAndUpdate(req.user._id, filteredBody, {
    new: true,
    runValidators: true
  });
  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await db.User.findByIdAndUpdate(req.user._id, { active: false });
  res.status(204).json({
    status: 'success',
    data: null
  });
});
exports.getAllUser = factory.getAll(db.User);
exports.getUser = factory.getOne(db.User);
//Do Not update password with this.
exports.updateUser = factory.updateOne(db.User);
exports.deleteUser = factory.deleteOne(db.User);
