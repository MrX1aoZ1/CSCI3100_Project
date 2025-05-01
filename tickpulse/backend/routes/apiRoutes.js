const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { tokenStore, generateAccessToken } = require('../utils/authUtils');
const { verifyToken } = require('../utils/authUtils');
const { checkAuthenticated } = require('../middleware/authMiddleware.js');


router.get('/protected-data', verifyToken, (req, res) => {
	res.json({ secret: 'Protected data' });
});

router.get('/home-data', checkAuthenticated, (req, res) => {
	res.json({
		protectedData: 'Protected data for authenticated users',
		user: req.user
	});
});

router.post('/refresh-token', (req, res) => {
	const { refreshToken } = req.body;

	jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
		if (err)
			//return res.status(403).json({ error: 'Invalid Refresh Token' });
			return sendResponse.success(res, 'Invalid Refresh Token', 403);

		// Generate a new access token
		const { token: newAccessToken, jti } = generateAccessToken(user);
		const newRefreshToken = jwt.sign(
			{ userId: user.id },
			process.env.REFRESH_TOKEN_SECRET,
			{ expiresIn: '7d' }
		);

		tokenStore.delete(user.jti); // Delete Old Token
		tokenStore.set(jti, {
			valid: true,
			expires: Date.now() + 5 * 60 * 1000
		});

		res.json({
			accessToken: newAccessToken,
			refreshToken: newRefreshToken
		});
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