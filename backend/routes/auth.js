const express = require('express');
const jwt = require('jsonwebtoken');
const Teacher = require('../models/Teacher');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Register a new teacher (admin use)
router.post('/register', async (req, res) => {
  try {
    const { fullName, username, password, className, email } = req.body;
    if (!fullName || !username || !password || !className || !email) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    const existing = await Teacher.findOne({ where: { username } });
    if (existing) return res.status(400).json({ error: 'Username already exists' });

    const teacher = await Teacher.create({ fullName, username, password, className, email });
    res.status(201).json({
      message: 'Teacher registered successfully',
      teacher: { id: teacher.id, username: teacher.username, className: teacher.className, fullName: teacher.fullName }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

    const teacher = await Teacher.findOne({ where: { username } });
    if (!teacher) return res.status(404).json({ error: 'Teacher not found' });

    const valid = await teacher.validatePassword(password);
    if (!valid) return res.status(401).json({ error: 'Incorrect password' });

    const token = jwt.sign(
      { id: teacher.id, username: teacher.username, className: teacher.className, fullName: teacher.fullName },
      process.env.JWT_SECRET,
      { expiresIn: '12h' }
    );

    res.json({
      message: 'Login successful',
      token,
      teacher: { id: teacher.id, username: teacher.username, className: teacher.className, fullName: teacher.fullName }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get current teacher
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const teacher = await Teacher.findByPk(req.teacher.id, {
      attributes: { exclude: ['password'] }
    });
    res.json(teacher);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all teachers (for landing page class list)
router.get('/classes', async (req, res) => {
  try {
    const teachers = await Teacher.findAll({
      attributes: ['className', 'fullName'],
      order: [['className', 'ASC']]
    });
    res.json(teachers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
