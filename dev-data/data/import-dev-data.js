const dotenv = require('dotenv');
const mongoose = require('mongoose');
const fs = require('fs');
const Tour = require('../../Model/Tour');
const User = require('../../Model/User');
const Review = require('../../Model/Review');

dotenv.config({ path: './config.env' });
mongoose.set('debug', true);
mongoose.Promise = Promise;
mongoose
  .connect(process.env.DATABASE_LOCAL, {
    keepAlive: true,
    useNewUrlParser: true,
    useFindAndModify: false
  })
  .then(() => console.log('DB connection successful'));

//READ JOSON FILE
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const user = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'));

//Import data into database

const importData = async () => {
  try {
    await Tour.create(tours);
    await User.create(user, { validateBeforeSave: false });
    await Review.create(reviews);
    console.log('Data Successfully loaded');
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

// DELETE ALL DATA FROM DB
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log('Data sucessfully deleted');
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
console.log(process.argv);
