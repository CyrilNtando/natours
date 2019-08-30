module.exports = fn => {
  //returns anon function
  return (req, res, next) => {
    fn(req, res, next).catch(error => {
      console.log(error);
      next(error);
    });
  };
};
