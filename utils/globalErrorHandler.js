const AppError = require('./appError');

const handleDuplicateFieldDb = error => {
  const path = Object.keys(error.keyValue)[0];
  const message = `Document with ${path} '${error.keyValue[path]}' already exists. Please use another value.`;
  return new AppError(message, 400);
};

const handleValidationErrorDb = error => {
  const errorDetailsArr = [];
  const errorKeysArr = Object.keys(error.errors);
  errorKeysArr.forEach(key => {
    const oneError = error.errors[key];
    if (oneError.name === 'ValidatorError') {
      errorDetailsArr.push(oneError.message);
    }
    if (oneError.name === 'CastError') {
      const path =
        error.errors[key].path[0].toUpperCase() +
        error.errors[key].path.substring(1);
      const type = error.errors[key].kind.toLowerCase();
      errorDetailsArr.push(`${path} must be a ${type}.`);
    }
  });
  const message = `Errors: ${errorDetailsArr.join(' ')}`;
  return new AppError(message, 400);
};

const sendErrorDev = (error, request, response) => {
  if (request.originalUrl.startsWith('/api')) {
    return response.status(error.statusCode).json({
      status: error.status,
      message: error.message,
      stack: error.stack,
      error: error
    });
  }
  response.status(error.statusCode).render('error', {
    title: '404 Not Found',
    msg: error.message
  });
};

const sendErrorProd = (error, request, response) => {
  if (request.originalUrl.startsWith('/api')) {
    if (error.isOperational) {
      return response.status(error.statusCode).json({
        status: error.status,
        message: error.message
      });
    }
    console.log('💥 Unhandled programming error:', error);
    return response.status(error.statusCode).render('error', {
      title: '404 Not Found',
      // vague feedback for production errors
      msg: 'Please try again later'
    });
  }

  if (error.isOperational) {
    return response.status(error.statusCode).render('error', {
      title: '404 Not Found',
      msg: error.message
    });
  }

  console.log('💥 Unhandled programming error:', error);
  return response.status(error.statusCode).render('error', {
    title: '404 Not Found',
    msg: 'Something went wrong. Please try again later.'
  });
};

module.exports = (error, request, response, next) => {
  console.log('global error handler invoked');
  // defaults
  error.statusCode = error.statusCode || 500;
  error.status = error.status || 'error';
  console.log(`Error: ${error.message}`);
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, request, response);
  } else {
    let controlledError = { ...error };
    // Duplicate field error
    if (error.code === 11000) controlledError = handleDuplicateFieldDb(error);
    // Validation error
    if (error.name === 'ValidationError')
      controlledError = handleValidationErrorDb(error);

    sendErrorProd(controlledError, request, response);
  }
};
