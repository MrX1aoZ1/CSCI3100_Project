require('dotenv').config();
const express = require('express');
const app = express();

// 初始化模块
const initializeMiddleware = require('./config/middleware');
const authRoutes = require('./routes/authRoutes');
const apiRoutes = require('./routes/apiRoutes');

// 全局配置
initializeMiddleware(app);

// 路由挂载
app.use('/auth', authRoutes);
app.use('/api', apiRoutes);

// Public Routing
app.get('/api/data', (req, res) => {
  res.json({ 
    message: 'Public Data, No Authentication Required',
    timestamp: new Date().toISOString()
  });
});

// Start Server
app.listen(3000, () => {
  console.log('Server running on port 3000');
});