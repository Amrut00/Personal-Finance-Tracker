import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
    try {
        const mongooseOptions = {
            serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
            socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
            family: 4 // Use IPv4, skip trying IPv6
        };

        const conn = await mongoose.connect(process.env.MONGODB_URI, mongooseOptions);
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        // Add connection event handlers
        mongoose.connection.on('error', (error) => {
            console.error('MongoDB Connection Error:', error);
            process.exit(1);
        });

        mongoose.connection.on('disconnected', () => {
            console.error('MongoDB Disconnected');
            process.exit(1);
        });

        mongoose.connection.on('reconnected', () => {
            console.log('MongoDB Reconnected');
        });

    } catch (error) {
        console.error(`MongoDB Connection Error: ${error.message}`);
        process.exit(1);
    }
};

export default connectDB;

