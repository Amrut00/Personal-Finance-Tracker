import mongoose from 'mongoose';

async function testConnection() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Database connection successful!');
    } catch (error) {
        console.error('Database connection failed:', error);
    }
}

testConnection();
