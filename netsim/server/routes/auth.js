const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

/**
 * POST /api/auth/register
 * Validate inputs → hash password → save user → return JWT
 */
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    // Hash password and create user
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, passwordHash },
    });

    // Log activity
    await prisma.activityLog.create({
      data: { userId: user.id, action: 'REGISTER' },
    });
    console.log('[' + new Date().toISOString() + '] User ' + user.id + ' registered (' + email + ')');

    // Sign JWT with 2h expiry
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.status(201).json({
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/auth/login
 * Find user → compare password → sign JWT → return token
 */
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Log activity
    await prisma.activityLog.create({
      data: { userId: user.id, action: 'LOGIN' },
    });
    console.log('[' + new Date().toISOString() + '] User ' + user.id + ' logged in');

    // Sign JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/auth/logout
 * Frontend deletes the token from localStorage.
 * Server-side: just log the event.
 */
router.post('/logout', async (req, res, next) => {
  try {
    // If a valid token was sent, log who logged out
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        await prisma.activityLog.create({
          data: { userId: decoded.id, action: 'LOGOUT' },
        });
        console.log('[' + new Date().toISOString() + '] User ' + decoded.id + ' logged out');
      } catch (_) {
        // Token expired or invalid — that's fine for logout
      }
    }
    res.json({ message: 'Logged out successfully.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
