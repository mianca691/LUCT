const express = require('express');
const cors = require('cors');
require('dotenv').config();
const helmet = require('helmet');

const authRoutes = require('./routes/auth.routes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        connectSrc: ["'self'", "http://localhost:5000"], // allows API calls
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
      },
    },
  })
);
// Routes
app.use('/auth', authRoutes);

app.get("/ping", (req, res) => {
  res.json({ message: "pong" });
});

module.exports = app;
