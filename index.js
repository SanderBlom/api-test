const express = require('express');
const session = require('express-session');
const crypto = require('crypto');
const multer = require('multer');

const app = express();
const PORT = 3000;
const upload = multer();

app.use(express.json());

// Configure session middleware
app.use(session({
  name: '.AspNet.ApplicationCookie', // Custom session cookie name
  secret: crypto.randomBytes(64).toString('hex'), // Generate a random secret key
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false, // Set to true in production when using HTTPS
    maxAge: 1000 * 60 * 30, // 30 minutes session timeout
  },
}));

// Route to simulate login
app.post('/login', upload.none(), (req, res) => {
  console.log(req.body);
  const { tenancyName, usernameOrEmailAddress, password } = req.body;
  if (!tenancyName || !usernameOrEmailAddress || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  if (usernameOrEmailAddress !== 'Amesto') {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  req.session.user = { tenancyName, usernameOrEmailAddress };
  res.json({ message: 'Logged in successfully', user: req.session.user });
});

// Route to check authentication status
app.get('/me', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  res.json({ user: req.session.user });
});

// Route to logout
app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: 'Logout failed' });
    }
    res.clearCookie('.AspNet.ApplicationCookie');
    res.json({ message: 'Logged out successfully' });
  });
});

// Example protected route
app.get('/protected', (req, res) => {
  console.log(req)
  if (!req.session.user) {
    return res.status(403).json({ message: 'Access denied' });
  }
  res.json({ message: 'Welcome to the protected route!', user: req.session.user });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

