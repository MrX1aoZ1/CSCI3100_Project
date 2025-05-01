const express = require('express');
const router = express.Router();
const passport = require('passport');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { generateAccessToken, handleLogout } = require('../utils/authUtils');
const { sendResponse } = require('../utils/response');
const { checkNotAuthenticated } = require('../middleware/authMiddleware');
const users = require('../data/users');

const initializePassport = require('../passport-config')
initializePassport(
	passport,
	email => users.find(user => user.email === email),
	id => users.find(user => user.id === id)
)

router.get('/login', checkNotAuthenticated, (req, res) => {
	res.redirect('/')
});

router.post('/login', checkNotAuthenticated, (req, res, next) => {
	passport.authenticate('local', (err, user, info) => {
		if (err) return sendResponse.error(res, 'Server Error', 500);
		if (!user) return sendResponse.error(res, info.message || 'Auth Failed', 401);

		req.login(user, (err) => {
			if (err) return sendResponse.error(res, 'Session Error', 500);

			const accessToken = generateAccessToken(user);
			const refreshToken = jwt.sign(
				{ userId: user.id },
				process.env.REFRESH_TOKEN_SECRET,
				{ expiresIn: '24h' }
			);

			sendResponse.success(res, {
				user: { id: user.id, email: user.email },
				accessToken,
				refreshToken
			});
		});
	})(req, res, next);
});

router.get('/sign-up', checkNotAuthenticated, (req, res) => {
	res.redirect('/')
});

router.post('/sign-up', checkNotAuthenticated, async (req, res) => {
	try {
		if (!req.body || !req.body.email || !req.body.password) {
			return sendResponse.error(res, 'Email and password are required', 400);
		}

		const { email, password } = req.body;

		const userExists = users.some(user => user.email === email);
		if (userExists) {
			return sendResponse.error(res, 'Email Already Exist', 400);
		}

		const hashedPassword = await bcrypt.hash(password, 10);
		const newUser = {
			id: Date.now().toString(),
			email: email,
			password: hashedPassword
		};
		users.push(newUser);

		sendResponse.success(res, {
			user: { id: newUser.id, email: newUser.email }
		});
	} catch (error) {
		console.error("Sign-Up Error:", error);
		sendResponse.error(res, 'Server Error, Please Try Again Later', 500);
	}
});

router.delete('/logout', handleLogout);

module.exports = router;