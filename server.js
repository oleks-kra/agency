const mongoose = require('mongoose');
require('dotenv').config({ path: './config.env' });

let server;

//CATCH ERRORS
process.on('uncaughtException', error => {
  // controll when it reported when this type of error happens
  console.log(`💥 (uncaughtException) ${error.name}: ${error.message}`);
  process.exit(1);
});
process.on('unhandledRejection', error => {
  console.log(`💥 (unhandledRejection) ${error.name}: ${error.message}`);
  server.close(() => {
    console.log('Server closed!');
    process.exit(1);
  });
});

const DB = process.env.DATABASE.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB)
  .then(() => console.log('DB connection successful'))
  .catch(error => {
    console.log(`Error: ${error.message}`);
  });

const app = require('./app');

console.log(`Mode: ${process.env.NODE_ENV}`);

const port = process.env.PORT || 8000;
server = app.listen(port, () => {
  console.log(`App running at http://localhost:${port}/`);
});
