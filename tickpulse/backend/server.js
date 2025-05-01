require("dotenv").config();
const express = require("express"); 
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");
const jwt = require('jsonwebtoken');

const app = express();


// Middleware to handle CORS
app.use
    (cors({
        origin: process.env.CLIENT_URL || "*",
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

// Connect to MySQL Database
connectDB();

const createTaskTable = require('./models/Task');

(async () => {
    await createTaskTable();
})();

const createUserTable = require('./models/User');

(async () => {
    await createUserTable();
})();

const token = jwt.sign({ id: 1 }, process.env.JWT_SECRET, { expiresIn: '7d' });
console.log('Generated Token:', token);

// Middleware    
app.use(express.json());

// Routes
const taskRoutes = require("./routes/taskRoutes");
// app.use("/api/auth", authRoutes);
// app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);
// app.use("/api/reports", reportRoutes);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});