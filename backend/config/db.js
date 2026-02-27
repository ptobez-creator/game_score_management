const mongoose = require('mongoose');

// Function to connect to MongoDB using the DB_URI from environment variables
const connectDB = async () => {
    try {
        // Connect to MongoDB using the URI defined in .env
        await mongoose.connect(process.env.DB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected...');
    } catch (err) {
        console.error('Error connecting to MongoDB', err);
        process.exit(1);  // Exit the process with failure
    }
};

module.exports = connectDB;