require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const sequelize = require('../config/database');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const Attendance = require('../models/Attendance');

const defaultTeachers = [
  { fullName: 'Mr. James Okafor',   username: 'jss1_teacher', password: 'jss1pass123', className: 'JSS1', email: 'jss1@school.com' },
  { fullName: 'Mrs. Ngozi Adeyemi', username: 'jss2_teacher', password: 'jss2pass123', className: 'JSS2', email: 'jss2@school.com' },
  { fullName: 'Mr. Emeka Eze',      username: 'jss3_teacher', password: 'jss3pass123', className: 'JSS3', email: 'jss3@school.com' },
  { fullName: 'Mrs. Fatima Bello',  username: 'sss1_teacher', password: 'sss1pass123', className: 'SSS1', email: 'sss1@school.com' },
  { fullName: 'Mr. Tunde Lawal',    username: 'sss2_teacher', password: 'sss2pass123', className: 'SSS2', email: 'sss2@school.com' },
  { fullName: 'Mrs. Amaka Nwosu',   username: 'sss3_teacher', password: 'sss3pass123', className: 'SSS3', email: 'sss3@school.com' },
];

async function seed() {
  try {
    await sequelize.sync({ force: true });
    console.log('✅ Database synced');

    for (const t of defaultTeachers) {
      await Teacher.create(t);
      console.log(`✅ Created teacher: ${t.username} (${t.className}) — password: ${t.password}`);
    }

    console.log('\n🎉 Seed complete! Default teacher login credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    defaultTeachers.forEach(t => {
      console.log(`  ${t.className}: username=${t.username} | password=${t.password}`);
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
