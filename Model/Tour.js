const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: [true, 'tour name already exists'],
      trim: true,
      maxlength: [40, 'A tour name must have less or equal 40 characters'],
      minlength: [10, 'A tour name must have more or equal than 10 characters']
      //validate: [validator.isAlpha, 'Tour name must only contain characters']
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size']
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have difficulty'],
      enum: {
        //String validator
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium, difficult'
      }
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0']
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price']
    },
    priceDiscount: {
      type: Number,
      validate: {
        message: 'Discount price({VALUE}) should be below regular price',
        validator: function(val) {
          //custom validator return true or false
          //this only points to current doc on new document creation
          return val < this.price;
        }
      }
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a summary']
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image']
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false //hide field from user
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false
    }
  },
  {
    //define in schema that we want virtual properties in onject
    toJSON: { virtuals: true }, //if data is outputted  as json
    toObject: { virtuals: true } //if data is outputted  as object
  }
);
//not stored in the database or not persistent and cannot be used in a query
tourSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7;
});

//DOCUMENT MIDDLEWARE
/** *Document Middleware runs before .save() and .create() command only**/
tourSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});
/** *run after .save() and .create() or after the document has been created**/
// tourSchema.post('save', function(doc, next) {
//   next();
// });
//QUERY MIDDLEWARE
/*** run before a find query is execcuted*/
//tourSchema.pre('find', function(next)
//any query that start with find
//secretTour no equals to true
tourSchema.pre(/^find/, function(next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

/*** run after a find query is execcuted*/
tourSchema.post(/^find/, function(doc, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds`);
  //console.log(doc);
  next();
});

//AGGREGATION MIDDLEWARE
tourSchema.pre('aggregate', function(next) {
  //add element/stage at the beginning of the array
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next();
});
const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;
