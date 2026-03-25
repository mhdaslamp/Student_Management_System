const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const testConnection = async () => {
    const uri = process.env.MONGO_URI;
    console.log('Testing MONGO_URI:', uri);
    
    if (!uri) {
        console.error('Error: MONGO_URI not found in .env');
        process.exit(1);
    }

    try {
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
        console.log('✅ Successfully connected to MongoDB Atlas!');
        await mongoose.disconnect();
    } catch (err) {
        console.error('❌ MongoDB Connection Error:', err.message);
        console.error(err);
        if (err.message.includes('IP not whitelisted')) {
            console.error('💡 TIP: Check your MongoDB Atlas Network Access settings (IP Whitelist).');
        } else if (err.message.includes('Authentication failed')) {
            console.error('💡 TIP: Double-check your username and password in the .env file.');
        }
    } finally {
        process.exit(0);
    }
};

testConnection();
