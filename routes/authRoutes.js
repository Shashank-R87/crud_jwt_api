const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// register
router.post("/register", async (req, res) => {
  const { username, password, role } = req.body;

  if (
    !username ||
    !password ||
    username.trim().length === 0 ||
    password.trim().length === 0
  ) {
    return res.status(400).json({
      message: "Username and password are required",
    });
  }

  const user = await User.findOne({ username });

  if (user) {
    return res
      .status(409)
      .json({ message: "User already exixts, please login", status_code: 409 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await User.create({
      username,
      password: hashedPassword,
      role,
    });
    res.json({ message: "User registered", user });
  } catch (err) {
    res.status(400).json({ message: "Registration error", status_code: 400 });
  }
});

// login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });

  if (!user) {
    return res
      .status(409)
      .json({ message: "No user found. Please register first.", status_code: 409 });
  }

  if (!(await bcrypt.compare(password, user.password)))
    return res.status(401).json({ message: "Invalid credentials" });

  const accessToken = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "15m" },
  );

  const refreshToken = jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" },
  );

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  });

  res.json({ accessToken });
});

// refresh
router.post("/refresh", (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.status(401).json({ message: "Session expired" });

  jwt.verify(token, process.env.JWT_REFRESH_SECRET, async (err, decoded) => {
    if (err) return res.status(403).json({ message: "Invalid refresh token" });

    const user = await User.findById(decoded.id);

    const newAccessToken = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" },
    );

    res.json({ accessToken: newAccessToken });
  });
});

// logout
router.post("/logout", (req, res) => {
  res.clearCookie("refreshToken");
  res.json({ message: "Logged out" });
});

module.exports = router;
