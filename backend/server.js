// Production startup file for Webuzo Node.js App
require('dotenv').config();

// For TypeScript support, we need to build first with 'npm run build'
// Then this file will run the compiled JavaScript
const app = require('./dist/index.js').default;

const PORT = process.env.PORT || 3029;

console.log(`🚀 Backend server starting on port ${PORT}`);
console.log(`📊 Database: ${process.env.DATABASE_URL ? 'Connected' : 'Not configured'}`);
console.log(`🌐 CORS allowed origin: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
