const mongoose = require('mongoose');

const connectDB = async () => {
    mongoose.connection.on('connected', () => {
        console.log("connected");
    });
    await mongoose.connect(`${process.env.MONGODB_URI}auth`);
};

module.exports = connectDB;