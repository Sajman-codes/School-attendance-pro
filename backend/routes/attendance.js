const express = require('express');
const { Op } = require('sequelize');
const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Get attendance for a specific date
router.get('/date/:date', authMiddleware, async (req, res) => {
  try {
    const { date } = req.params;
    const className = req.teacher.className;
    const students = await Student.findAll({ where: { className }, order: [['name', 'ASC']] });
    const records = await Attendance.findAll({ where: { date, className } });

    const result = students.map(s => {
      const record = records.find(r => r.studentId === s.id);
      return { studentId: s.id, name: s.name, admissionNo: s.admissionNo, status: record ? record.status : null };
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Save/update attendance for a date
router.post('/save', authMiddleware, async (req, res) => {
  try {
    const { date, records } = req.body;
    const className = req.teacher.className;

    for (const record of records) {
      await Attendance.upsert({
        studentId: record.studentId,
        date,
        status: record.status,
        className
      });
    }
    res.json({ message: 'Attendance saved successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get attendance summary per student
router.get('/summary', authMiddleware, async (req, res) => {
  try {
    const className = req.teacher.className;
    const students = await Student.findAll({ where: { className }, order: [['name', 'ASC']] });
    const allRecords = await Attendance.findAll({ where: { className } });

    const summary = students.map(s => {
      const studentRecords = allRecords.filter(r => r.studentId === s.id);
      const present = studentRecords.filter(r => r.status === 'present').length;
      const absent = studentRecords.filter(r => r.status === 'absent').length;
      const total = studentRecords.length;
      const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
      return { id: s.id, name: s.name, admissionNo: s.admissionNo, present, absent, total, percentage };
    });
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all dates attendance was marked
router.get('/dates', authMiddleware, async (req, res) => {
  try {
    const className = req.teacher.className;
    const records = await Attendance.findAll({
      where: { className },
      attributes: ['date'],
      group: ['date'],
      order: [['date', 'DESC']]
    });
    res.json(records.map(r => r.date));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get daily stats for charts
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const className = req.teacher.className;
    const totalStudents = await Student.count({ where: { className } });
    const dates = await Attendance.findAll({
      where: { className },
      attributes: ['date'],
      group: ['date'],
      order: [['date', 'ASC']]
    });

    const stats = await Promise.all(dates.map(async ({ date }) => {
      const present = await Attendance.count({ where: { className, date, status: 'present' } });
      const absent = await Attendance.count({ where: { className, date, status: 'absent' } });
      return { date, present, absent, total: totalStudents, percentage: totalStudents > 0 ? Math.round((present / totalStudents) * 100) : 0 };
    }));

    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
