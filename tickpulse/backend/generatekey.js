const jwt = require('jsonwebtoken');

const token = jwt.sign({ id: 1 }, process.env.JWT_SECRET, { expiresIn: '7d' });
console.log('Generated Token:', token);