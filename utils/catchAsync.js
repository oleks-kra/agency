function catchAsync(fn) {
  return (request, response, next) => {
    fn(request, response, next).catch(error => {
      console.log(`Rejected promise in 'catchAsync': ${error.message}`);
      return next(error);
    });
  };
}
module.exports = catchAsync;
