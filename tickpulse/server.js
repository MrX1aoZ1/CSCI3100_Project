if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config(); 
}

const { v4: uuidv4 } = require('uuid');
const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const passport = require('passport')
const jwt = require('jsonwebtoken');
const session = require('express-session')

const initializePassport = require('./passport-config')
initializePassport(
  passport,
  email => users.find(user => user.email === email),
  id => users.find(user => user.id === id)
)

const users = []
const refreshTokens = [];
const tokenStore = new Map();

const sendResponse = {
  success: (res, data = {}, code = 200) => res.status(code).json({ success: true, ...data }),
  error: (res, message, code) => res.status(code).json({ success: false, error: message })
};

const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:3001', // Frontend URL
  credentials: true
}));


app.get('/api/protected-data', verifyToken, (req, res) => {
  res.json({ secret: 'Protected data' });
});

function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) 
    return sendResponse.error(res, 'No Token Provided', 401);

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    
    // Check if the token is valid
    const meta = tokenStore.get(decoded.jti);
    if (!meta || !meta.valid || meta.expires < Date.now()) {
      return res.status(403).json({ error: 'Invalid Token' });
    }

    req.user = decoded;
    next();
  } catch (err) {
    // res.status(403).json({ error: 'Token Authentication Fail' });
    sendResponse.error(res, 'Token Authentication Fail', 403);
  }
}

app.set('view-engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
app.use(express.json());
app.use(flash())

app.use(session({
  secret: process.env.ACCESS_TOKEN_SECRET,
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())

app.use(methodOverride('_method'))

function generateAccessToken(user) {
  const jti = uuidv4(); // Unique identifier for the token
  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email,
      jti: jti
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '15m' }
  );

  // Store Token Metadata
  tokenStore.set(jti, {
    valid: true,
    expires: Date.now() + 15*60*1000
  });
  
  return { token, jti };
}

function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }

  res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/')
  }
  next()
}

app.get('/login', checkNotAuthenticated, (req, res) => {
  res.redirect('/')
})

app.post('/login', checkNotAuthenticated, (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) 
      return sendResponse.error(res, 'Server Error', 500);

    if (!user) 
      return sendResponse.error(res, info.message || 'Auth Failed', 401);
    
    req.login(user, (err) => {
      if (err) 
        return sendResponse.error(res, 'Session Error', 500);
      
      const accessToken = generateAccessToken(user);
      const refreshToken = jwt.sign(
        { userId: user.id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '24h' }
      );
      
      refreshTokens.push(refreshToken);
      
      return res.json({
        success: true,
        user: { id: user.id, email: user.email },
        accessToken,
        refreshToken
      });
    });
  })(req, res, next);
});

app.get('/sign-up', checkNotAuthenticated, (req, res) => {
  res.redirect('/')
})

app.post('/sign-up', checkNotAuthenticated, async (req, res) => {
  try {
    const { email, password } = req.body;

    const userExists = users.some(user => user.email === email);
    if (userExists) {
      // return res.status(400).json({ error: "Email Already Exist" });
      return sendResponse.error(res, 'Email Already Exist', 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: Date.now().toString(),
      email: email,
      password: hashedPassword
    };
    users.push(newUser);

    // res.status(200).json({ 
    //   success: true,
    //   user: { id: newUser.id, email: newUser.email }
    // });

    sendResponse.success(res, { 
      success: true,
      user: { id: newUser.id, email: newUser.email }
    }, 200);
  } catch {
    console.error("Sign-Up Error:", error);
    // res.status(500).json({ error: "Server Error, Please Try Again Later" });
    sendResponse.error(res, 'Server Error, Please Try Again Later', 500);
  }
})


app.delete('/logout', (req, res) => {
  // 获取当前令牌JTI
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) 
    // return res.status(401).json({ error: 'Invalid Token' });
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
      //res.status(200).json({ success: true });
      sendResponse.success(res, { success: true }, 200);
    });
  });
});

app.get('/api/home-data', checkAuthenticated, (req, res) => {
  res.json({ 
    protectedData: 'Protected data for authenticated users',
    user: req.user 
  });
});

app.post('/api/refresh-token', (req, res) => {
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
      expires: Date.now() + 5*60*1000 
    });

    res.json({ 
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    });
  });
});

app.get('/api/verify-token', verifyToken, (req, res) => {
  res.json({ 
    valid: true,
    user: req.user 
  });
});

// Public Data 
app.get('/api/data', (req, res) => {
  res.json({ 
    message: 'Public Data, No Authentication Required',
    timestamp: new Date().toISOString()
  });
});

setInterval(() => {
  const now = Date.now();
  tokenStore.forEach((value, key) => {
    if (value.expires < now) {
      tokenStore.delete(key);
    }
  });
}, 60*1000);

app.listen(3000)