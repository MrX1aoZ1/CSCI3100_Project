require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const connectDB = require("./config/db");
const createTaskTable = require('./models/Task');
const createUserTable = require('./models/User');
const createTimerTable = require('./models/Timer');
const createCategoryTable = require('./models/Category');

// 初始化模块
const authRoutes = require('./routes/authRoutes');
const apiRoutes = require('./routes/apiRoutes');

// 全局配置
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: 'http://localhost:3001',
  // origin: process.env.CLIENT_URL || "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));
app.use(session({
  secret: process.env.ACCESS_TOKEN_SECRET,
  resave: false,
  saveUninitialized: false
}));

// Connect to the Database and Ensure Tables
(async () => {
    try {
        // Create tables after the database is ensured
        await createUserTable();
        await createTaskTable();
        await createCategoryTable();
        await createTimerTable();

        //console.log('All tables created successfully');
    } catch (error) {
        console.error('Error during initialization:', error);
    }
})();

app.use(passport.initialize());
app.use(passport.session());

// Public Routing
app.get('/api/data', (req, res) => {
  res.json({ 
    message: 'Public Data, No Authentication Required',
    timestamp: new Date().toISOString()
  });
});

// Routes
const taskRoutes = require("./routes/taskRoutes");
const timerRoutes = require("./routes/timerRoutes");
const licenseKeyRoutes = require("./routes/licenseKeyRoutes");
app.use('/auth', authRoutes);
app.use('/api', apiRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/timers", timerRoutes);
app.use("/api/license", licenseKeyRoutes)


// Start Server
// const PORT = process.env.PORT || 5000;
const PORT = 3000
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});