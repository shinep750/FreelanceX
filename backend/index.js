require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { connectDB, sequelize } = require('./config/db');

// Initialize Models to establish relationships and register with Sequelize
require('./models/User');
require('./models/Job');
require('./models/Application');
require('./models/Profile');
require('./models/Message');
require('./models/Dispute');
require('./models/Transaction');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const jobRoutes = require('./routes/jobRoutes');
const messageRoutes = require('./routes/messageRoutes');
const transactionRoutes = require('./routes/transactionRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Strict CORS Configuration
const allowedOrigins = process.env.FRONTEND_URL 
    ? [process.env.FRONTEND_URL, 'http://localhost:5173'] 
    : ['http://localhost:5173'];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));

// Security Middleware
app.use(helmet({ 
    crossOriginResourcePolicy: false // Allow cross-origin requests (localhost:5173 -> localhost:5000)
})); 

// Rate Limiting Config
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // increased limit to prevent polling from triggering it
    message: { message: "Too many requests from this IP, please try again later." }
});
app.use('/api/', limiter); // Apply to all /api/ routes

app.use(express.json()); // Parse JSON payloads
app.use(express.urlencoded({ extended: false })); // Parse URL-encoded payloads

// Connect and Sync Database
connectDB()
    .then(async () => {
        // Sync the models with database (creates tables if they don't exist based on User.js etc)
        // using { alter: true } so it modifies structure safely rather than dropping tables
        await sequelize.sync({ alter: true });
        console.log('✅ Synchronized Sequelize Models with the Database');

        // Start server only after database connection is successful
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('❌ Failed to start server due to Database connection error:', err);
    });

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/transactions', transactionRoutes);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'success', message: 'FreelanceX API is running perfectly!' });
});

// Fallback for undefined routes
app.use((req, res, next) => {
    res.status(404).json({ message: 'Endpoint not found' });
});

