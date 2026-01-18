const { Schema } = require('zod/v3');
const ApiError = require('../utils/ApiError');

const validate = (Schema) => {
    return (req, res, next) => {
        try {
            Schema.parse(req.body);
            next();
        } catch(error) {
            const errors = error.errors.map((err) => ({
                field: err.path.join('.'),
                message: err.message,
            }));
            next(new ApiError(400, 'validation error', errors));
        }
    };
};

module.exports = validate;