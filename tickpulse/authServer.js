// require('dotenv').config()

// const express = require('express')
// const app = express()
// const jwt = require('jsonwebtoken')
// const bcrypt = require('bcrypt');
// const passport = require('passport');
// const LocalStrategy = require('passport-local').Strategy;

// app.use(express.json())

// let users = [];
// let refreshTokens = []

// // Passport
// passport.use(new LocalStrategy({
//   usernameField: 'email'
// }, async (email, password, done) => {
//   try {
//     const user = users.find(u => u.email === email);
//     if (!user) return done(null, false, { message: '用户不存在' });
    
//     if (await bcrypt.compare(password, user.password)) {
//       return done(null, user);
//     } else {
//       return done(null, false, { message: '密码错误' });
//     }
//   } catch (e) {
//     return done(e);
//   }
// }));




// app.post('/token', (req, res) => {
//   const refreshToken = req.body.token
//   if (refreshToken == null) 
//     return res.sendStatus(401)

//   if (!refreshTokens.includes(refreshToken)) 
//     return res.sendStatus(403)

//   jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
//     if (err) 
//         return res.sendStatus(403)
//     const accessToken = generateAccessToken({ name: user.name })
//     res.json({ accessToken: accessToken })
//   })

// })

// // try {
// //     const salt = await bcrypt.genSalt()
// //     const hashedPassword = await bcrypt.hash(req.body.password, salt)
// //     const user = { name: req.body.name, password: hashedPassword }
// //     users.push(user) 
// //     res.status(201).send()
// // } catch {
// //     res.status(500).send()
// // }

// app.post('/register', async (req, res) => {
//   try {
//     const hashedPassword = await bcrypt.hash(req.body.password, 10);
//     const user = {
//       id: Date.now().toString(),
//       email: req.body.email,
//       password: hashedPassword
//     };
    
//     users.push(user);
//     const accessToken = generateAccessToken(user);
//     const refreshToken = generateRefreshToken(user);
//     refreshTokens.push(refreshToken);
    
//     res.status(201).json({ 
//       accessToken,
//       refreshToken,
//       user: { id: user.id, email: user.email }
//     });
//   } catch {
//     res.status(500).json({ error: '注册失败' });
//   }
// });

// app.delete('/logout', (req, res) => {
//   refreshTokens = refreshTokens.filter(token => token !== req.body.token)
//   res.sendStatus(204)
// })

// app.post('/login', (req, res) => {
//   // Authenticate User

//   const username = req.body.username
//   const user = { name: username }

//   const accessToken = generateAccessToken(user)
//   const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET)
//   refreshTokens.push(refreshToken)
//   res.json({ accessToken: accessToken, refreshToken: refreshToken })
// })

// function generateAccessToken(user) {
//   return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1m' })
// }



// app.listen(4000)
// authServer.js

const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
require('dotenv').config();

const app = express();
app.use(express.json());

const users = [];
const refreshTokens = [];

passport.use(
  new LocalStrategy(
    { usernameField: 'email' },
    async (email, password, done) => {
      const user = users.find((u) => u.email === email);
      if (!user) {
        return done(null, false, { message: 'User not found' });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return done(null, false, { message: 'Incorrect password' });
      }
      return done(null, user);
    }
  )
);

const generateAccessToken = (user) => {
  return jwt.sign({ id: user.id, email: user.email }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: '15m',
  });
};

const generateRefreshToken = (user) => {
  const refreshToken = jwt.sign({ id: user.id, email: user.email }, process.env.REFRESH_TOKEN_SECRET);
  refreshTokens.push(refreshToken);
  return refreshToken;
};

const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }
      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
};

app.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = { id: Date.now().toString(), email, password: hashedPassword };
    users.push(user);
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    res.status(201).json({ accessToken, refreshToken, user: { id: user.id, email: user.email } });
  } catch (error) {
    res.status(500).json({ message: 'Registration failed' });
  }
});

app.post('/login', passport.authenticate('local', { session: false }), (req, res) => {
  const user = req.user;
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  res.json({ token: accessToken, refreshToken, user: { id: user.id, email: user.email } });
});

app.post('/token', (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.sendStatus(401);
  }
  if (!refreshTokens.includes(token)) {
    return res.sendStatus(403);
  }
  jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }
    const accessToken = generateAccessToken({ id: user.id, email: user.email });
    res.json({ accessToken });
  });
});

app.delete('/logout', (req, res) => {
  const { token } = req.body;
  refreshTokens = refreshTokens.filter((t) => t !== token);
  res.sendStatus(204);
});

app.listen(4000, () => {
  console.log('Server running on http://localhost:4000');
});