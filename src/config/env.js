require('dotenv').config();

module.exports = {
    PORT: process.env.PORT || 8000,
    MONGODB_URL: process.env.MONGODB_URL,
    NODE_ENV: process.env.NODE_ENV || 'development',
};