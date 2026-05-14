
const mongoose = require('mongoose');

const server = '127.0.0.1:27017';
const database = 'scores';

async function connect() {
    try {
        await mongoose.connect(`mongodb://${server}/${database}`);
        console.log('Database connection successful');
    } catch (err) {
        console.error('Database connection error:', err);
    }
}

module.exports = connect;
