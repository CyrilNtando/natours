const express = require('express');
const morgan = require('morgan');
const app = express();

//MIDDLEWARES
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
//access static files from folder not routes
app.use(express.static(`${__dirname}/public`));
//ROUTES HANDLERS
const tourRoutes = require('./routes/tourRoutes');
const userRoutes = require('./routes/userRoutes');
//MOUNTING ROUTES
app.use('/api/v1/tours', tourRoutes);
app.use('/api/v1/users', userRoutes);

module.exports = app;
