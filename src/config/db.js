const mongoose = require('mongoose');
const {MONGODB_URL} = require('./env');

const connectDB = async() => {
    try {
        const conn = await mongoose.connect(MONGODB_URL);
        console.log(`MongoDB Connected : ${conn.connection.host}`);
    } catch(err) {
        console.error(`Error : ${err.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;