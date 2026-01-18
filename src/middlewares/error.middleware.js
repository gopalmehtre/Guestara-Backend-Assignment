const { success } = require('zod');
const {NODE_ENV} = require('../config/env');

const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    const response = {
        success : false,
        message,
        ...(err.errors && {errors : err.errors}),
        ...(NODE_ENV === 'development' && {stack: err.stack}),
    };

    console.log('Error :', err);
    res.status(statusCode).json(response);
};

const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};

module.exports = {errorHandler, notFound};