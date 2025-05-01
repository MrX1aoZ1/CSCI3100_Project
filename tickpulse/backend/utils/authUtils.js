const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { sendResponse } = require('./response');

// 令牌存储
const tokenStore = new Map();

function generateAccessToken(user) {
	const jti = uuidv4();
	const token = jwt.sign(
		{ userId: user.id, email: user.email, jti },
		process.env.ACCESS_TOKEN_SECRET,
		{ expiresIn: '15m' }
	);

	tokenStore.set(jti, {
		valid: true,
		expires: Date.now() + 15 * 60 * 1000
	});

	return { token, jti };
}

function verifyToken(req, res, next) {
	const token = req.headers.authorization?.split(' ')[1];
	if (!token) return sendResponse.error(res, 'No Token Provided', 401);

	try {
		const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
		const meta = tokenStore.get(decoded.jti);

		if (!meta || !meta.valid || meta.expires < Date.now()) {
			return sendResponse.error(res, 'Invalid Token', 403);
		}

		req.user = decoded;
		next();
	} catch (err) {
		sendResponse.error(res, 'Token Authentication Fail', 403);
	}
}

function handleLogout(req, res) {
	const token = req.headers.authorization?.split(' ')[1];

	if (!token)
		return sendResponse.error(res, 'Invalid Token', 401);

	try {
		const decoded = jwt.decode(token);
		if (decoded?.jti) {
			// 使当前令牌失效
			tokenStore.delete(decoded.jti);
		}
	} catch (e) {
		console.error('Token Parsing Error:', e);
	}

	// Passport注销流程
	req.logout(() => {
		req.session.destroy(() => {
			res.clearCookie('connect.sid', {
				path: '/',
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production'
			});
			sendResponse.success(res, { success: true }, 200);
		});
	});
}

setInterval(() => {
  const now = Date.now();
  tokenStore.forEach((value, key) => {
    if (value.expires < now) tokenStore.delete(key);
  });
}, 60 * 1000);

module.exports = {
	generateAccessToken,
	verifyToken,
	handleLogout,
	tokenStore
};