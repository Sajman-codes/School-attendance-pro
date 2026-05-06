const express = require('express');
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');
const authMiddleware = require('../middleware/auth');
const router = express.Router();

// Get all students for teacher's class
router.get('/', authMiddleware, async (req, res) => {
  try {
    const students = await Student.findAll({
      where: { className: req.teacher.className },
      order: [['name', 'ASC']]
    });
    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add single student
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name } = req.body;
    const className = req.teacher.className;
    const count = await Student.count({ where: { className } });
    const admissionNo = `ADM/${className}/${new Date().getFullYear()}/${String(count + 1).padStart(3, '0')}`;
    const student = await Student.create({ name, admissionNo, className, teacherId: req.teacher.id });
    res.status(201).json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Bulk add students - names as array
router.post('/bulk', authMiddleware, async (req, res) => {
  try {
    const { names } = req.body; // array of names
    if (!names || !Array.isArray(names) || names.length === 0) {
      return res.status(400).json({ error: 'Please provide an array of student names' });
    }
    const className = req.teacher.className;
    const existing = await Student.count({ where: { className } });

    const studentsToCreate = names
      .map(n => n.trim())
      .filter(n => n.length > 0)
      .map((name, i) => ({
        name,
        admissionNo: `ADM/${className}/${new Date().getFullYear()}/${String(existing + i + 1).padStart(3, '0')}`,
        className,
        teacherId: req.teacher.id
      }));

    const created = await Student.bulkCreate(studentsToCreate, { ignoreDuplicates: true });
    res.status(201).json({ message: `${created.length} students added successfully`, students: created });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete student
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const student = await Student.findOne({ where: { id: req.params.id, className: req.teacher.className } });
    if (!student) return res.status(404).json({ error: 'Student not found' });
    await Attendance.destroy({ where: { studentId: student.id } });
    await student.destroy();
    res.json({ message: 'Student deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
