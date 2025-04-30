// const posts = [
//     {
//         username: '1664691131e@gmail.com',
//         password: '078529.djwyzt'
//     },
//     {
//         username: 'Jim',
//         title: 'Post 2'
//     }
// ]

// app.get('/posts', authenticateJWT, (req, res) => {
//   res.json(posts.filter(post => post.username === req.user.name))
// })


// app.post('/login', async (req, res) => {
//     // const user = user.find(user => user.name = req.body.name)
//     // if (user == null) {
//     //     return res.status(400).send('Cannot find user') 
//     // }
//     // try {
//     //     if (await bcrypt.compare(req.body.password, user.password)) {
//     //         res.send('Success')
//     //     } else {
//     //         res.send('Not Allowed')
//     //     }
//     // } catch {
//     //     res.status(500).send()
//     // }
//     const username = req.body.name
//     const user = { name: username }

//     const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET)
//     res.json({ accessToken: accessToken })
// })

// function authenticateJWT(req, res, next) {
//   const authHeader = req.headers['authorization'];
//   const token = authHeader && authHeader.split(' ')[1];

//   if (token == null) return res.sendStatus(401);

//   jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
//     console.log(err);
//     if (err) return res.sendStatus(403);
//     req.user = user;
//     next();
//   })
// }


if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config(); 
}

const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')

const initializePassport = require('./passport-config')
initializePassport(
  passport,
  email => users.find(user => user.email === email),
  id => users.find(user => user.id === id)
)

const users = []

const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:3001', // 你的前端地址
  credentials: true
}));

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

app.get('/', checkAuthenticated, (req, res) => {
  //res.render('index.ejs', { name: req.user.name })
})

app.get('/login', checkNotAuthenticated, (req, res) => {
  //res.render('/app/login/page.jsx')
})

app.post('/login', checkNotAuthenticated, (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return res.status(500).json({ error: '服务器错误' });
    }
    if (!user) {
      return res.status(401).json({ error: info.message || '认证失败' });
    }
    req.login(user, (err) => {
      if (err) {
        return res.status(500).json({ error: '会话创建失败' });
      }
      // 返回用户信息和令牌
      return res.json({ 
        success: true,
        user: { id: user.id, email: user.email }
      });
    });
  })(req, res, next);
});

app.get('/sign-up', checkNotAuthenticated, (req, res) => {
  //res.render('/app/sign-up/page.jsx')
})

app.post('/sign-up', checkNotAuthenticated, async (req, res) => {
  try {
    const { email, password } = req.body;

    const userExists = users.some(user => user.email === email);
    if (userExists) {
      return res.status(400).json({ error: "Email 已存在" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: Date.now().toString(),
      email: email,
      password: hashedPassword
    };
    users.push(newUser);

    res.status(200).json({ 
      success: true,
      user: { id: newUser.id, email: newUser.email }
    });
  } catch {
    console.error("註冊失敗:", error);
    res.status(500).json({ error: "伺服器錯誤，請稍後再試" });
  }
})

app.delete('/logout', (req, res) => {
  req.logOut()
  res.redirect('/login')
})

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

app.listen(3000)