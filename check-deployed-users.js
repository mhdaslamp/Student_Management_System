const axios = require('axios');

const BACKEND_URL = 'https://saams-1sfv.onrender.com';

const checkStatus = async () => {
    try {
        console.log(`Checking backend at: ${BACKEND_URL}`);
        const res = await axios.get(`${BACKEND_URL}/debug-users`);
        console.log('--- Users in Database ---');
        console.table(res.data);
        
        if (res.data.length === 0) {
            console.log('⚠️ Database is EMPTY. You need to seed it or create users.');
        }
        
    } catch (err) {
        console.error('❌ Error hitting backend:', err.message);
        if (err.response) {
            console.error('Response Data:', err.response.data);
            console.error('Response Status:', err.response.status);
        }
    }
};

checkStatus();
