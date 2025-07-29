require('dotenv').config();
const mongoose = require('mongoose');

console.log('Testing MongoDB connection...');

const options = {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4,
    maxPoolSize: 10,
    retryWrites: true,
    w: 'majority'
};

mongoose.connect(process.env.MONGODB_URI, options)
    .then(() => {
        console.log('✅ MongoDB connected successfully');
        console.log('Database:', mongoose.connection.db.databaseName);
        console.log('Host:', mongoose.connection.host);
        return mongoose.connection.close();
    })
    .then(() => {
        console.log('Connection closed successfully');
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ MongoDB connection error:', err.message);
        process.exit(1);
    });