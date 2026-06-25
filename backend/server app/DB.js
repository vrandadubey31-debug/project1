const dotenv = require('dotenv');

dotenv.config();

module.exports = {
    URL: process.env.MONGODB_URL || 'mongodb://127.0.0.1:27017/server-app',
    port: process.env.PORT || 9191
};