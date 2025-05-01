const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const express = require('express');

module.exports = (app) => {
  // CORS setting
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(cors({
    origin: 'http://localhost:3001',
    credentials: true
  }));
  app.use(session({
    secret: process.env.ACCESS_TOKEN_SECRET,
    resave: false,
    saveUninitialized: false
  }));
  app.use(passport.initialize());
  app.use(passport.session());
};