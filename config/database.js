require('dotenv').config();

const dbUrl = process.env.MONGODB_URI;
module.exports = dbUrl;