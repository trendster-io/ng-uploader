const express = require('express');
const logger = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const status = require('http-status');

const routes = require('./routes');

const { FRONTEND_URL, NODE_ENV } = process.env;

const app = express();
app.use(logger(NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(helmet());
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  }),
);
app.use(compression());
app.use(express.json());
app.use('/api', routes);

// Logic Error Handler
app.use((err, req, res, next) => {
  if (NODE_ENV !== 'production') {
    console.error(err);
  }
  res.status(err.statusCode || status.INTERNAL_SERVER_ERROR).json({
    msg: err.msg || status[status.INTERNAL_SERVER_ERROR],
  });
});

// 404 Error Handler
app.use((req, res) => {
  res.status(status.NOT_FOUND).json({
    msg: status[status.NOT_FOUND],
  });
});

module.exports = app;
