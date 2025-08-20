const mongoose = require('mongoose');

const connectDB = async() => {
    try {
        // use the variable from the .env file
        const conn = await mongoose.connect(process.env.MONGO_URI);

        console.log('Successfully connected to MongoDB!: ${conn.coneection.host}');
    }
    catch (error){
        console.error('Error connection to MongoDB: ${error.message}');
        process.exit(1);
    }
}

module.exports = connectDB;