const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');

const Teacher = sequelize.define('Teacher', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  fullName: { type: DataTypes.STRING, allowNull: false },
  username: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  className: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true }
}, {
  hooks: {
    beforeCreate: async (teacher) => {
      teacher.password = await bcrypt.hash(teacher.password, 10);
    },
    beforeUpdate: async (teacher) => {
      if (teacher.changed('password')) {
        teacher.password = await bcrypt.hash(teacher.password, 10);
      }
    }
  }
});

Teacher.prototype.validatePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

module.exports = Teacher;
