const db = require('../Model');
const factory = require('./handlerFactory');

exports.setTourUserIds = (req, res, next) => {
  //Allow nested routes
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user._id;
  next();
};
exports.getAllReview = factory.getAll(db.Review);
exports.getReview = factory.getOne(db.Review);
exports.createReview = factory.createOne(db.Review);
exports.updateReview = factory.updateOne(db.Review);
exports.deleteReview = factory.deleteOne(db.Review);
