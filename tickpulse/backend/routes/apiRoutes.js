const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { tokenStore, generateAccessToken, generateRefreshToken } = require('../utils/authUtils');
const { verifyToken } = require('../utils/authUtils');
const { checkAuthenticated } = require('../middleware/authMiddleware.js');
const { sendResponse } = require('../utils/response');

router.get('/protected-data', verifyToken, (req, res) => {
	res.json({ secret: 'Protected data' });
});

router.get('/home-data', verifyToken, (req, res) => {
	res.json({
		protectedData: 'Protected data for authenticated users',
		user: req.user
	});
});

router.post('/refresh-token', (req, res) => {
	const oldRefreshToken = req.body.refreshToken;
  
	// 1. Validate the validity of Refresh Token 
	const meta = tokenStore.refreshTokens.get(oldRefreshToken);
	if (!meta || !meta.valid) {
	  return sendResponse.error(res, 'Invalid Refresh Token', 403);
	}

	// 2. Generate new Tokens
	const newAccessToken = generateAccessToken({ id: meta.userId }).token;
	const newRefreshToken = generateRefreshToken(meta.userId);

	// 3. Invalidate old Token and store new Token
	tokenStore.invalidateRefreshToken(oldRefreshToken);

	// 4. Return standardized response
	sendResponse.success(res, {
	  accessToken: newAccessToken,
	  refreshToken: newRefreshToken
	});
  });

router.get('/verify-token', verifyToken, (req, res) => {
	res.json({
		valid: true,
		user: req.user
	});
});

// Public Data 
router.get('/data', (req, res) => {
	res.json({
		message: 'Public Data, No Authentication Required',
		timestamp: new Date().toISOString()
	});
});

module.exports = router