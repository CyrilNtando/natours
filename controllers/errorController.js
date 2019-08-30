const AppError = require('./../utils/appError');
const handleCastErrorDB = error => {
  const message = `Invalid ${error.path}: ${error.value}`;
  return new AppError(message, 400);
};

const handleDuplicateFields = error => {
  console.log(error);
  const value = error.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value ${value}. Please use another value`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = error => {
  const errors = Object.values(error.errors).map(el => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};
// const sendErrorDev = (error, res) => {
//   res.status(error.statusCode).json({
//     status: error.status,
//     message: error.message,
//     error: error,
//     stack: error.stack
//   });
// };

const handleJWTError = () => new AppError('Invalid token. Please log in again!', 401);
const handleJWTExpiredError = () =>
  new AppError('Your token has expired! Please log in again', 401);
const sendErrorProd = (error, res) => {
  //operational, trusted error: send message to client
  if (error.isOperational) {
    res.status(error.statusCode).json({
      status: error.status,
      message: error.message
    });
    //Programming or other unknown error: don't leak error details
  } else {
    //1 log error
    console.error('Error', error);
    //2 send generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong!!'
    });
  }
};
module.exports = (err, req, res, next) => {
  //error handling middleware
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  let error = Object.assign({}, err, { message: err.message });
  if (error.name === 'CastError') error = handleCastErrorDB(error);
  if (error.code === 11000) error = handleDuplicateFields(error);
  if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
  if (error.name === 'JsonWebTokenError') error = handleJWTError();
  if (error.name === 'JsonExpiredError') error = handleJWTExpiredError();
  sendErrorProd(error, res);
};
