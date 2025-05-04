const express = require('express');
const router = express.Router();
const passport = require('passport');
const bcrypt = require('bcrypt');
const { generateAccessToken, generateRefreshToken, handleLogout } = require('../utils/authUtils');
const { sendResponse } = require('../utils/response');
const { checkNotAuthenticated } = require('../middleware/authMiddleware');
const connectDB = require('../config/db');

// const users = require('../data/users');

// Passport Initialization
const initializePassport = require('../passport-config');
initializePassport(passport);

// Sign-Up
router.post('/sign-up', checkNotAuthenticated, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return sendResponse.error(res, 'Email and password are required', 400);
    }

    const connection = await connectDB();
    const [existingUsers] = await connection.query('SELECT * FROM Users WHERE email = ?', [email]);

    if (existingUsers.length > 0) {
      await connection.end();
      return sendResponse.error(res, 'Email already exists', 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const license_key = "TEM8S2-2ET83-CGKP1-DPSI2-EPZO1"

    const [result] = await connection.query(
      'INSERT INTO Users (email, password, license_key) VALUES (?, ?, ?)',
      [email, hashedPassword, license_key]
    );
    await connection.end();

    sendResponse.success(res, { 
      user: { id: result.insertId, email: email }
    });
  } catch (error) {
    console.error("Sign-Up Error:", error);
    sendResponse.error(res, 'Server Error, Please Try Again Later', 500);
  }
});

//Login
router.post('/login', checkNotAuthenticated, (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      console.error('Login Error:', err);
      return sendResponse.error(res, 'Server Error', 500);
    }
    if (!user) {
      return sendResponse.error(res, info.message || 'Email or password is incorrect', 401);
    }

    req.login(user, async (err) => {
      if (err) {
        console.error('会话错误:', err);
        return sendResponse.error(res, '会话初始化失败', 500);
      }

      try {
        // Generate Token
        const accessToken = generateAccessToken(user).token;
        const refreshToken = generateRefreshToken(user.id);

        // Return response
        sendResponse.success(res, {
          user: { id: user.id, email: user.email },
          accessToken,
          refreshToken
        });
      } catch (error) {
        console.error('Error in generating token:', error);
        sendResponse.error(res, 'Login Failed', 500);
      }
    });
  })(req, res, next);
});



// Logout
router.post('/logout', handleLogout);

module.exports = router;