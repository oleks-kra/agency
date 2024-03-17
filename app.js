const path = require('path');
const morgan = require('morgan');
const express = require('express');

const globalErrorHandler = require('./utils/globalErrorHandler');
const AppError = require('./utils/appError');

// Importing route handlers
const clientRouter = require('./routes/clientRoutes');
const adminRouter = require('./routes/adminRoutes');
const apiRouter = require('./routes/apiRoutes');

const app = express();

// Set up view engine and views directory
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Parse JSON bodies
app.use(
  express.json({
    limit: '2mb'
  })
);

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Mount client-facing routes
app.use('/', clientRouter);

// Mount admin routes
app.use('/admin', adminRouter);

// Mount API routes
app.use('/api/v1', apiRouter);

// Handle undefined routes
app.all('*', (req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server!`, 404));
});

// Global error handling middleware
app.use(globalErrorHandler);

module.exports = app;
