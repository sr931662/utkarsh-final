module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log the full error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('ERROR 💥', err);
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  } else {
    // Send simplified error in production
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  }
};