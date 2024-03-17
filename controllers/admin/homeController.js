//const Article = require('../../models/articleModel');
const catchAsync = require('../../utils/catchAsync');
//const AppError = require('../../utils/appError');

const displayHome = catchAsync(async (request, response, next) => {
  console.log('displayForm() invoked');

  response.status(200).render('admin/home/adminHome', {
    title: 'Admin home'
  });
});

module.exports = {
  displayHome
};
