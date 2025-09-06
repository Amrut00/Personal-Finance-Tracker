import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function testConnection() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected successfully!');

        // Test creating a user
        const User = mongoose.model('User', {
            firstname: String,
            email: String,
            password: String
        });

        const testUser = new User({
            firstname: 'Test',
            email: 'test@example.com',
            password: 'password123'
        });

        await testUser.save();
        console.log('Test user created successfully!');

        // Test finding the user
        const foundUser = await User.findOne({ email: 'test@example.com' });
        console.log('Found user:', foundUser);

        // Clean up test data
        await User.deleteOne({ email: 'test@example.com' });
        console.log('Test data cleaned up');

        // Close connection
        await mongoose.connection.close();
        console.log('Connection closed');

    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

testConnection();
