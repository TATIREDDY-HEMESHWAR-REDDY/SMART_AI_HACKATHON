import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';

const directory = path.join(process.cwd(), 'data');
fs.mkdirSync(directory, { recursive: true });
const db = new DatabaseSync(path.join(directory, 'campusos.db'));
db.exec(`
  DROP TABLE IF EXISTS users; DROP TABLE IF EXISTS sessions; DROP TABLE IF EXISTS students; DROP TABLE IF EXISTS subject_attendance; DROP TABLE IF EXISTS insights; DROP TABLE IF EXISTS opportunities; DROP TABLE IF EXISTS marks; DROP TABLE IF EXISTS skills; DROP TABLE IF EXISTS student_profile;
  DROP TABLE IF EXISTS calendar_events;
  DROP TABLE IF EXISTS student_fees;
  DROP TABLE IF EXISTS timetable;
  DROP TABLE IF EXISTS safety_incidents;
  DROP TABLE IF EXISTS visitors;
  DROP TABLE IF EXISTS wellbeing_checkins;
  DROP TABLE IF EXISTS student_hostel;
  DROP TABLE IF EXISTS student_transport;
  DROP TABLE IF EXISTS hostel_exits;
  
  CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT UNIQUE, password TEXT, role TEXT, full_name TEXT, section TEXT, email TEXT UNIQUE, must_reset_password INTEGER DEFAULT 0);
  CREATE TABLE sessions (token TEXT PRIMARY KEY, user_id INTEGER NOT NULL, created_at TEXT NOT NULL);
  CREATE TABLE students (id INTEGER PRIMARY KEY, user_id INTEGER UNIQUE NOT NULL, register_no TEXT, department TEXT, section TEXT, cgpa REAL, attendance INTEGER, student_phone TEXT, parent_phone TEXT);
  CREATE TABLE subject_attendance (id INTEGER PRIMARY KEY, subject TEXT, attended INTEGER, total INTEGER, trend INTEGER);
  CREATE TABLE insights (id INTEGER PRIMARY KEY, category TEXT, status TEXT, title TEXT, detail TEXT, priority TEXT);
  CREATE TABLE opportunities (id INTEGER PRIMARY KEY, company TEXT, role TEXT, package TEXT, match_score INTEGER, deadline TEXT, gap TEXT);
  CREATE TABLE marks (id INTEGER PRIMARY KEY, subject TEXT, internal_1 INTEGER, internal_2 INTEGER, assignment INTEGER, end_sem_max INTEGER, credit INTEGER);
  CREATE TABLE skills (id INTEGER PRIMARY KEY, name TEXT UNIQUE, level TEXT, score INTEGER);
  CREATE TABLE student_profile (id INTEGER PRIMARY KEY, phone TEXT, linkedin TEXT, github TEXT, portfolio TEXT, resume_name TEXT, target_role TEXT, completion INTEGER);
  
  CREATE TABLE calendar_events (id INTEGER PRIMARY KEY, title TEXT, type TEXT, date TEXT, description TEXT, section TEXT);
  CREATE TABLE student_fees (id INTEGER PRIMARY KEY, user_id INTEGER UNIQUE NOT NULL, type TEXT, amount REAL, paid REAL, status TEXT);
  CREATE TABLE timetable (id INTEGER PRIMARY KEY, section TEXT, day TEXT, time_slot TEXT, subject TEXT, classroom TEXT);
  CREATE TABLE safety_incidents (id INTEGER PRIMARY KEY, user_id INTEGER NOT NULL, type TEXT, title TEXT, description TEXT, status TEXT, created_at TEXT);
  CREATE TABLE visitors (id INTEGER PRIMARY KEY, name TEXT, purpose TEXT, host_name TEXT, in_time TEXT, out_time TEXT, status TEXT);
  CREATE TABLE wellbeing_checkins (id INTEGER PRIMARY KEY, user_id INTEGER NOT NULL, mood_score INTEGER NOT NULL, notes TEXT, created_at TEXT);
  CREATE TABLE student_hostel (id INTEGER PRIMARY KEY, user_id INTEGER UNIQUE NOT NULL, room_no TEXT, block_name TEXT, warden_name TEXT);
  CREATE TABLE student_transport (id INTEGER PRIMARY KEY, user_id INTEGER UNIQUE NOT NULL, location TEXT, pickup_time TEXT, drop_time TEXT, route_no TEXT, driver_name TEXT, driver_phone TEXT);
  CREATE TABLE hostel_exits (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, duration_hours INTEGER NOT NULL, reason TEXT NOT NULL, status TEXT NOT NULL, created_at TEXT NOT NULL, approved_at TEXT);
`);
const users = db.prepare('INSERT INTO users (username,password,role,full_name,section,email,must_reset_password) VALUES (?,?,?,?,?,?,?)');
[
  ['admin','admin','ADMIN','Ananya Rao',null,'admin@campusos.local',0],
  ['warden','warden','WARDEN','Warden Rajesh Kumar',null,'warden@campusos.local',0],
  ['teacher.a1','teacher.a1','TEACHER','Dr. Priya Nair','A1','priya.nair@campusos.local',0],
  ['teacher.b1','teacher.b1','TEACHER','Dr. Arjun Menon','B1','arjun.menon@campusos.local',0],
  ['teacher.c1','teacher.c1','TEACHER','Dr. Kavya Iyer','C1','kavya.iyer@campusos.local',0],
  
  // Section A1 Students
  ['student','student','STUDENT','Aarav Sharma','A1','aarav@example.com',0],
  ['riya.a1','riya.a1','STUDENT','Riya Kapoor','A1','riya@example.com',0],
  ['dev.a1','dev.a1','STUDENT','Dev Patel','A1','dev@example.com',0],
  ['ananya.a1','student','STUDENT','Ananya Gupta','A1','ananya.g@example.com',0],
  ['kunal.a1','student','STUDENT','Kunal Sen','A1','kunal@example.com',0],
  
  // Section B1 Students
  ['ishaan.b1','student','STUDENT','Ishaan Verma','B1','ishaan@example.com',0],
  ['meera.b1','student','STUDENT','Meera Joshi','B1','meera@example.com',0],
  ['rohan.b1','student','STUDENT','Rohan Das','B1','rohan@example.com',0],
  ['sneha.b1','student','STUDENT','Sneha Reddy','B1','sneha@example.com',0],
  ['varun.b1','student','STUDENT','Varun Mehta','B1','varun@example.com',0],
  
  // Section C1 Students
  ['zoya.c1','student','STUDENT','Zoya Khan','C1','zoya@example.com',0],
  ['aditya.c1','aditya.c1','STUDENT','Aditya Singh','C1','aditya@example.com',0],
  ['neha.c1','student','STUDENT','Neha Nair','C1','neha@example.com',0],
  ['vikram.c1','student','STUDENT','Vikram Rao','C1','vikram@example.com',0],
  ['kriti.c1','student','STUDENT','Kriti Sharma','C1','kriti@example.com',0]
].forEach((user) => users.run(...user));

const student = db.prepare('INSERT INTO students (user_id,register_no,department,section,cgpa,attendance,student_phone,parent_phone) VALUES (?,?,?,?,?,?,?,?)');
[
  // Section A1 Students
  [5,'22BCE1001','Computer Science','A1',7.9,84,'9876543201','9123456701'],
  [6,'22BCE1002','Computer Science','A1',8.6,91,'9876543202','9123456702'],
  [7,'22BCE1003','Computer Science','A1',7.2,76,'9876543203','9123456703'],
  [8,'22BCE1004','Computer Science','A1',9.1,95,'9876543204','9123456704'],
  [9,'22BCE1005','Computer Science','A1',6.8,72,'9876543205','9123456705'],
  
  // Section B1 Students
  [10,'22BCE1101','Computer Science','B1',8.2,88,'9876543206','9123456706'],
  [11,'22BCE1102','Computer Science','B1',7.5,79,'9876543207','9123456707'],
  [12,'22BCE1103','Computer Science','B1',8.0,85,'9876543208','9123456708'],
  [13,'22BCE1104','Computer Science','B1',8.9,92,'9876543209','9123456709'],
  [14,'22BCE1105','Computer Science','B1',7.1,70,'9876543210','9123456710'],
  
  // Section C1 Students
  [15,'22BCE1201','Computer Science','C1',8.8,93,'9876543211','9123456711'],
  [16,'22BCE1202','Computer Science','C1',6.9,72,'9876543212','9123456712'],
  [17,'22BCE1203','Computer Science','C1',8.5,89,'9876543213','9123456713'],
  [18,'22BCE1204','Computer Science','C1',7.4,78,'9876543214','9123456714'],
  [19,'22BCE1205','Computer Science','C1',9.2,96,'9876543215','9123456715']
].forEach((row) => student.run(...row));
const attendance = db.prepare('INSERT INTO subject_attendance (subject,attended,total,trend) VALUES (?,?,?,?)');
[['Operating Systems',22,30,-11], ['Database Management',31,36,4], ['Computer Networks',29,32,2], ['Java Programming',30,34,1]].forEach((row) => attendance.run(...row));
const insight = db.prepare('INSERT INTO insights (category,status,title,detail,priority) VALUES (?,?,?,?,?)');
[
  ['Academic','Stable','DBMS momentum is improving','Your DBMS score improved 14% across the last two assessments.','positive'],
  ['Attendance','Needs attention','Operating Systems is approaching shortage','Attendance fell from 84% to 73%. Attend the next 3 sessions to regain buffer.','warning'],
  ['Coding','Improving','Practice consistency is up','You solved 18 problems this month, 6 more than last month.','positive'],
  ['Placement','Strong opportunity','Eight drives currently match your profile','Your CGPA, Java and SQL match most SDE Intern requirements.','info']
].forEach((row) => insight.run(...row));
const opportunity = db.prepare('INSERT INTO opportunities (company,role,package,match_score,deadline,gap) VALUES (?,?,?,?,?,?)');
[['TechCorp','SDE Intern','₹12 LPA',92,'Aug 30','System Design'], ['Infosys','Systems Engineer','₹9.5 LPA',88,'Sep 04','Cloud fundamentals'], ['Accenture','Associate Software Engineer','₹7.2 LPA',84,'Sep 08','Docker']].forEach((row) => opportunity.run(...row));
const marks = db.prepare('INSERT INTO marks (subject,internal_1,internal_2,assignment,end_sem_max,credit) VALUES (?,?,?,?,?,?)');
[['Operating Systems',16,14,8,60,4],['Database Management',18,17,9,60,4],['Computer Networks',17,18,9,60,3],['Java Programming',19,18,10,60,3],['Discrete Mathematics',15,16,8,60,3]].forEach((row) => marks.run(...row));
const skills = db.prepare('INSERT INTO skills (name,level,score) VALUES (?,?,?)');
[['Java','Advanced',86],['Python','Intermediate',72],['SQL','Intermediate',76],['React','Intermediate',68],['Data Structures & Algorithms','Intermediate',74],['Git & GitHub','Advanced',83],['AWS','Beginner',38]].forEach((row) => skills.run(...row));
db.prepare('INSERT INTO student_profile (phone,linkedin,github,portfolio,resume_name,target_role,completion) VALUES (?,?,?,?,?,?,?)').run('', '', '', '', '', 'Software Engineer', 0);

// Seeding Timetables for A1, B1, C1
const timetableStmt = db.prepare('INSERT INTO timetable (section,day,time_slot,subject,classroom) VALUES (?,?,?,?,?)');
const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const slots = ['09:00 - 10:00', '10:15 - 11:15', '11:30 - 12:30'];

days.forEach((day, dIdx) => {
  // A1 Timetable
  const aSubjects = [['Operating Systems', 'Database Management', 'Computer Networks'], ['Java Programming', 'Discrete Mathematics', 'Operating Systems'], ['Database Management', 'Computer Networks', 'Java Programming'], ['Discrete Mathematics', 'Operating Systems', 'Database Management'], ['Computer Networks', 'Java Programming', 'Discrete Mathematics']][dIdx];
  const aRooms = ['Room 301', 'Room 302', 'Room 303'];
  slots.forEach((slot, sIdx) => {
    timetableStmt.run('A1', day, slot, aSubjects[sIdx], aRooms[sIdx]);
  });

  // B1 Timetable
  const bSubjects = [['Database Management', 'Computer Networks', 'Java Programming'], ['Discrete Mathematics', 'Operating Systems', 'Database Management'], ['Computer Networks', 'Java Programming', 'Discrete Mathematics'], ['Operating Systems', 'Database Management', 'Computer Networks'], ['Java Programming', 'Discrete Mathematics', 'Operating Systems']][dIdx];
  slots.forEach((slot, sIdx) => {
    timetableStmt.run('B1', day, slot, bSubjects[sIdx], aRooms[(sIdx + 1) % 3]);
  });

  // C1 Timetable
  const cSubjects = [['Computer Networks', 'Java Programming', 'Discrete Mathematics'], ['Operating Systems', 'Database Management', 'Computer Networks'], ['Java Programming', 'Discrete Mathematics', 'Operating Systems'], ['Database Management', 'Computer Networks', 'Java Programming'], ['Discrete Mathematics', 'Operating Systems', 'Database Management']][dIdx];
  slots.forEach((slot, sIdx) => {
    timetableStmt.run('C1', day, slot, cSubjects[sIdx], aRooms[(sIdx + 2) % 3]);
  });
});

// Seeding Student Fees (Alternating HOSTEL / TRANSPORT, mutually exclusive)
const feeStmt = db.prepare('INSERT INTO student_fees (user_id,type,amount,paid,status) VALUES (?,?,?,?,?)');
for (let uid = 5; uid <= 19; uid++) {
  const isHostel = uid % 2 !== 0;
  const type = isHostel ? 'HOSTEL' : 'TRANSPORT';
  const amount = isHostel ? 80000 : 30000;
  const paid = uid % 3 === 0 ? amount : (uid % 3 === 1 ? amount / 2 : 0);
  const status = paid === amount ? 'PAID' : (paid > 0 ? 'PARTIAL' : 'PENDING');
  feeStmt.run(uid, type, amount, paid, status);
}

// Seeding Calendar Events
const calendarStmt = db.prepare('INSERT INTO calendar_events (title,type,date,description,section) VALUES (?,?,?,?,?)');
[
  ['Independence Day Celebration', 'HOLIDAY', '2026-08-15', 'Flag hoisting ceremony at main ground.', null],
  ['Operating Systems Midterm', 'EXAM', '2026-09-14', 'Midterm exam in respective rooms.', 'A1'],
  ['Database Systems Midterm', 'EXAM', '2026-09-16', 'Written exam.', 'B1'],
  ['Ganesh Chaturthi', 'HOLIDAY', '2026-09-07', 'Festival holiday.', null],
  ['Gandhi Jayanti', 'HOLIDAY', '2026-10-02', 'National holiday.', null]
].forEach(event => calendarStmt.run(...event));

// Seeding Safety Incidents
const safetyStmt = db.prepare('INSERT INTO safety_incidents (user_id,type,title,description,status,created_at) VALUES (?,?,?,?,?,?)');
[
  [5, 'SECURITY', 'Suspicious activity near West Gate', 'A person without a visitor badge was photographing building entries.', 'OPEN', '2026-08-22T10:00:00Z'],
  [6, 'INCIDENT', 'Slippery floor in Block A stairs', 'Water spill reported near the second-floor stairwell landing.', 'RESOLVED', '2026-08-22T11:30:00Z'],
  [7, 'WOMEN_SAFETY', 'Late-night escort requested from Library', 'Requesting guard escort back to girls hostel from the library at 9:30 PM.', 'OPEN', '2026-08-22T20:15:00Z']
].forEach(row => safetyStmt.run(...row));

// Seeding Visitor Logs
const visitorStmt = db.prepare('INSERT INTO visitors (name,purpose,host_name,in_time,out_time,status) VALUES (?,?,?,?,?,?)');
[
  ['Ramanathan Swamy', 'Guest Lecture on AI', 'Dr. Priya Nair', '2026-08-22T09:00:00Z', '2026-08-22T11:00:00Z', 'COMPLETED'],
  ['Meenakshi Sundaram', 'Parent Meeting', 'Aarav Sharma', '2026-08-22T14:30:00Z', null, 'ACTIVE']
].forEach(row => visitorStmt.run(...row));

// Seeding Wellbeing logs
const wellbeingStmt = db.prepare('INSERT INTO wellbeing_checkins (user_id,mood_score,notes,created_at) VALUES (?,?,?,?)');
[
  [5, 4, 'Feeling good, completed my network assignments.', '2026-08-22T08:30:00Z'],
  [6, 5, 'Highly motivated today!', '2026-08-22T09:00:00Z'],
  [7, 2, 'Stressed about the upcoming OS Midterm exam.', '2026-08-22T10:15:00Z']
].forEach(row => wellbeingStmt.run(...row));

// Seeding Hostel and Transport detailed profiles
const hostelStmt = db.prepare('INSERT INTO student_hostel (user_id,room_no,block_name,warden_name) VALUES (?,?,?,?)');
const transportStmt = db.prepare('INSERT INTO student_transport (user_id,location,pickup_time,drop_time,route_no,driver_name,driver_phone) VALUES (?,?,?,?,?,?,?)');

const wardens = ['Mr. Rajesh Kumar', 'Mrs. Sunitha Rao', 'Mr. David Miller'];
const blocks = ['Ramanujan Block A', 'Newton Block B', 'Visvesvaraya Block C'];
const locations = ['Tambaram Circle', 'Velachery Junction', 'Adyar Bus Depot', 'Guindy Station', 'Chromepet Main Road'];

for (let uid = 5; uid <= 19; uid++) {
  const isHostel = uid % 2 !== 0;
  if (isHostel) {
    const roomNo = `${['A','B','C'][uid % 3]}-${100 + (uid * 7) % 300}`;
    const block = blocks[uid % 3];
    const warden = wardens[uid % 3];
    hostelStmt.run(uid, roomNo, block, warden);
  } else {
    const loc = locations[uid % 5];
    const pickup = '07:45 AM';
    const drop = '04:30 PM';
    const routeNo = `R-${10 + (uid % 4)}`;
    const driverName = ['Mr. Murugan', 'Mr. Kannan', 'Mr. Velu', 'Mr. Mani'][uid % 4];
    const driverPhone = `9840${(uid * 12345) % 1000000}`;
    transportStmt.run(uid, loc, pickup, drop, routeNo, driverName, driverPhone);
  }
}

console.log('CampusOS SQLite database seeded.');
