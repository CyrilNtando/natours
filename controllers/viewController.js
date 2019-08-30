const db = require('../Model');
const catchAsync = require('../utils/catchAsync');

exports.getOverview = catchAsync(async (req, res) => {
  //Get tour data from the collection
  const tours = await db.Tour.find();
  //Build template
  //render that template using tour data from 1
  res.status(200).render('overview', {
    title: 'All Tours',
    tours: tours
  });
});
exports.getTour = catchAsync(async (req, res) => {
  res.status(200).render('tour', {});
});
