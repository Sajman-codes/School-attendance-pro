const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Student = sequelize.define('Student', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  admissionNo: { type: DataTypes.STRING, allowNull: false, unique: true },
  className: { type: DataTypes.STRING, allowNull: false },
  teacherId: { type: DataTypes.INTEGER, allowNull: false }
});

module.exports = Student;
