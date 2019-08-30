const mongoose = require('mongoose');
mongoose.set('debug', true);
mongoose.Promise = Promise;
mongoose
  .connect(process.env.DATABASE_LOCAL, {
    keepAlive: true,
    useNewUrlParser: true,
    useFindAndModify: false
  })
  .then(() => console.log('DB connection successful'));

module.exports.User = require('./User');
module.exports.Tour = require('./Tour');
module.exports.Review = require('./Review');
