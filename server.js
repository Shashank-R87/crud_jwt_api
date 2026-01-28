require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "https://crud-jwt-client.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS not allowed for this origin: " + origin));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

mongoose.connect(process.env.MONGO_URI).then(() => console.log("MongoDB connected"));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/items', require('./routes/itemRoutes'));

app.listen(process.env.PORT, () => console.log("Server running"));
