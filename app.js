const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const path = require('path');
const appError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRoutes = require('./routes/tourRoutes');
const userRoutes = require('./routes/userRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const viewRoutes = require('./routes/viewRoutes');
const app = express();

app.set('view engine', 'pug');
//access static files from folders
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));

//MIDDLEWARES
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
//SECURITY:Set Security HTTP headers
app.use(helmet());

//SECURITY: limits number of request from an IP
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, Please try again in an hour'
});
app.use('/api', limiter);

//body-parser,reading data from body into req.body
app.use(express.json({ limit: '10kb' })); //parse data less than 10kb
//SECURITY:Data Sanitization
//Data sanitization against NoSQL query injection
app.use(mongoSanitize()); //filter out dollar signs and dots
//Data sanitization against XSS
app.use(xss()); //filter html codes
//Prevent parameter pollution
app.use(
  hpp({
    whitelist: ['duration', 'ratingsQuantity', 'maxGroupSize', 'difficulty', 'price']
  })
);
//pug route

//MOUNTING ROUTES//ROUTES HANDLERS
app.use('/', viewRoutes);
app.use('/api/v1/tours', tourRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/reviews', reviewRoutes);

app.all('*', (req, res, next) => {
  // const error = new Error(`Can't find ${req.originalUrl} on this server`);
  // error.status = 'fail';
  // error.statusCode = 404;
  next(new appError(`Can't find ${req.originalUrl} on this server`, 404));
});
app.use(globalErrorHandler);
module.exports = app;
