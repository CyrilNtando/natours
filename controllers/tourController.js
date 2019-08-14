const db = require('../Model');
exports.checkID = (req, res, next, val) => {
  next();
};
exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res.status(400).json({
      status: 'fail',
      message: 'Missing Name  or price'
    });
  }
  next();
};
exports.getAllTours = async (req, res, next) => {
  try {
    let tours = await db.Tour.find();
    res.status(200).json({
      status: 'success',
      result: tours.length,
      data: {
        tours
      }
    });
  } catch (error) {}
};

exports.getTour = async (req, res, next) => {
  try {
    //db.Tour.findOne({_id: req.params.id})
    let tour = await db.Tour.findById(req.params.id);

    res.status(200).json({
      status: 'success',
      data: {
        tour
      }
    });
  } catch (error) {
    res.status(200).json({
      status: 'fail',
      message: error
    });
  }
};

exports.createTour = async (req, res, next) => {
  console.log('start');
  try {
    let newTour = await db.Tour.create(req.body);
    return res.status(201).json({
      status: 'success',
      data: {
        tour: newTour
      }
    });
  } catch (error) {
    res.status(400).json({
      status: 'fails',
      message: 'Invalid data sent'
    });
  }
};

exports.updateTour = async (req, res, next) => {
  try {
    let tour = await db.Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      status: 'success',
      data: {
        tour
      }
    });
  } catch (error) {
    res.status(200).json({
      status: 'fail',
      message: error
    });
  }
};

exports.deleteTour = async (req, res, next) => {
  try {
    await db.Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    res.status(200).json({
      status: 'fail',
      message: error
    });
  }
};
