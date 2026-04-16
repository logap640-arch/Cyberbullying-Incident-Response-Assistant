/* ============================================================
   CyberGuard — Database Layer (Pure JSON file storage)
   No native compilation required — works on all platforms.
   ============================================================ */

const fs     = require('fs');
const path   = require('path');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, 'cyberguard_db.json');

// ── Default schema ──
const DEFAULT_DB = {
  users:   [],
  reports: []
};

// ── Load / initialize ──
function loadDB() {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(DEFAULT_DB, null, 2));
  }
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  } catch {
    return { ...DEFAULT_DB };
  }
}

function saveDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// ── Seed default data if empty ──
let _db = loadDB();

if (_db.users.length === 0) {
  _db.users = [
    { id: 1, username: 'student',   passwordHash: bcrypt.hashSync('student123',   10), role: 'student',   name: 'Alex Johnson',     grade: 'Grade 10', title: null },
    { id: 2, username: 'student2',  passwordHash: bcrypt.hashSync('pass123',       10), role: 'student',   name: 'Sam Rivera',       grade: 'Grade 9',  title: null },
    { id: 3, username: 'counselor', passwordHash: bcrypt.hashSync('counselor123',  10), role: 'counselor', name: 'Dr. Morgan Ellis',  grade: null, title: 'School Counselor' },
    { id: 4, username: 'admin',     passwordHash: bcrypt.hashSync('admin123',      10), role: 'counselor', name: 'Principal Davies',  grade: null, title: 'School Principal' },
  ];
  console.log('[DB] Seeded 4 default users.');
}

if (_db.reports.length === 0) {
  const now = Date.now();
  const day = 86400000;
  _db.reports = [
    {
      id: 'RPT-001', timestamp: new Date(now - 7*day).toISOString(), platform: 'Instagram',
      bullyingType: 'verbal', severity: 'medium', frequency: 'Daily', duration: '2 weeks',
      reportText: 'Someone in my class keeps posting mean comments under my photos saying I am ugly and that nobody likes me. It happens almost every day. I feel scared to post anything now and I keep deleting my photos.',
      extra: 'It started after a group project where we disagreed.',
      summary: 'Repeated verbal harassment on Instagram targeting the student\'s appearance and social standing over a 2-week period. Daily nature of incidents suggests escalating pattern requiring timely intervention.',
      interventions: ['Platform content report filing', 'Peer mediation session', 'Digital wellness counseling', 'Parent-counselor collaboration meeting', 'Follow-up check-in in 1 week'],
      status: 'reviewing', anonymous: true, piiClean: true, aiClassified: true
    },
    {
      id: 'RPT-002', timestamp: new Date(now - 4*day).toISOString(), platform: 'WhatsApp Group',
      bullyingType: 'social', severity: 'high', frequency: 'Multiple times a day', duration: '1 month',
      reportText: 'A group of students created a WhatsApp group without me and they share screenshots of my private messages making fun of what I write. I found out because a friend told me. Now everyone ignores me at lunch and someone wrote something on my desk.',
      extra: '',
      summary: 'Organized social exclusion via private WhatsApp group combined with real-world ostracism. Screenshot sharing of private content is a serious privacy violation. Month-long duration indicates sustained campaign.',
      interventions: ['Schedule same-day counselor meeting', 'Group mediation and restorative justice circle', 'Social integration support plan', 'Weekly counselor check-in for 1 month', 'Parent notification'],
      status: 'action_taken', anonymous: true, piiClean: true, aiClassified: true
    },
    {
      id: 'RPT-003', timestamp: new Date(now - 1*day).toISOString(), platform: 'School Email',
      bullyingType: 'threats', severity: 'critical', frequency: 'Once', duration: 'Single incident',
      reportText: 'I received an anonymous email through the school system saying that if I tell anyone about what happened in the gym last week something very bad will happen to me. I am very scared and cannot sleep properly. I have saved the email.',
      extra: 'I believe I know who sent it but I am scared to say.',
      summary: 'CRITICAL: Direct anonymous threat via school email system indicating possible witness intimidation. Student reports psychological distress and sleep disruption. Evidence preserved. Immediate administrative escalation and possible law enforcement involvement required.',
      interventions: ['⚠️ IMMEDIATE: Principal escalation — ACTION REQUIRED NOW', 'Evidence preservation (email screenshot + headers)', 'Law enforcement notification if principal deems necessary', 'Student safety plan activation', 'Parent emergency contact', 'Daily counselor check-in until resolved'],
      status: 'escalated', anonymous: true, piiClean: true, aiClassified: true
    },
    {
      id: 'RPT-004', timestamp: new Date(now - 10*day).toISOString(), platform: 'Snapchat',
      bullyingType: 'verbal', severity: 'low', frequency: 'Once or twice', duration: '3 days',
      reportText: 'Someone sent me a snap calling me names and saying mean things about how I look. It happened a couple of times but seems to have stopped.',
      extra: '',
      summary: 'Minor verbal incident on Snapchat. Low frequency and short duration with apparent cessation. Monitoring recommended with proactive digital literacy guidance.',
      interventions: ['Informal counselor check-in', 'Digital literacy session on online safety', 'Self-report encouraged if recurs', 'Monitor for escalation'],
      status: 'resolved', anonymous: true, piiClean: true, aiClassified: true
    },
    {
      id: 'RPT-005', timestamp: new Date(now - 2*day).toISOString(), platform: 'TikTok',
      bullyingType: 'sexual', severity: 'high', frequency: 'A few times a week', duration: '1 week',
      reportText: 'Someone has been sending me inappropriate photos and messages that make me very uncomfortable. They keep asking me to send photos back and threatening to tell people things if I don\'t. I do not know how they got my number.',
      extra: '',
      summary: 'High severity sexual harassment involving coercion and inappropriate imagery. Possible online grooming indicators. Mandatory reporting protocols may apply. Designated safeguarding officer must be involved immediately.',
      interventions: ['⚠️ IMMEDIATE: Designated Safeguarding Officer notification', 'Mandatory reporting protocol review', 'Victim support specialist assignment', 'Device evidence preservation (do not delete messages)', 'Legal authority notification', 'Parent/guardian emergency contact'],
      status: 'escalated', anonymous: true, piiClean: true, aiClassified: true
    },
    {
      id: 'RPT-006', timestamp: new Date(now - 5*day).toISOString(), platform: 'Discord',
      bullyingType: 'social', severity: 'medium', frequency: 'A few times a week', duration: '2 weeks',
      reportText: 'There is a Discord server that a bunch of people from my class are in. They keep kicking me whenever I join and posting things mocking my gaming style and calling me terrible names. Even my old friends are doing it now.',
      extra: 'I have screenshots.',
      summary: 'Repeated social exclusion and verbal harassment on Discord gaming server. Loss of previously established friendships indicates expanding social impact. Screenshots exist as evidence, which should be preserved.',
      interventions: ['Evidence collection (screenshots)', 'Platform abuse report to Discord', 'Peer support group referral', 'Counselor mediation with friend group', 'Bi-weekly check-ins for 1 month'],
      status: 'reviewing', anonymous: true, piiClean: true, aiClassified: true
    },
    {
      id: 'RPT-007', timestamp: new Date(now - 3*day).toISOString(), platform: 'Text Messages (SMS)',
      bullyingType: 'threats', severity: 'high', frequency: 'Daily', duration: '1 week',
      reportText: 'I have been getting anonymous text messages every day with threats like "watch your back" and "you will regret this". I am scared to walk home alone now and my grades are dropping because I cannot focus.',
      extra: 'I changed my number but they keep finding it.',
      summary: 'High severity daily threatening SMS messages causing significant psychological impact including academic decline and fear for personal safety. Persistent contact despite number change suggests organized effort.',
      interventions: ['Schedule same-day counselor meeting', 'Report to phone carrier + police non-emergency line', 'Student safety escort plan (school to home)', 'Academic support consultation', 'Parent notification and safety plan', 'Daily counselor check-in'],
      status: 'pending', anonymous: true, piiClean: true, aiClassified: true
    },
    {
      id: 'RPT-008', timestamp: new Date(now - 6*day).toISOString(), platform: 'School Platform / Portal',
      bullyingType: 'verbal', severity: 'low', frequency: 'Once', duration: 'Single incident',
      reportText: 'Someone left an unkind anonymous comment on my project submission on the school portal saying my work was stupid and that I should not be in the class.',
      extra: '',
      summary: 'Single low-severity verbal incident on school platform. Unkind anonymous comment on academic work. Single occurrence with no threat component. Standard monitoring protocol.',
      interventions: ['Review school platform anonymity settings', 'Report to platform administrator to trace account', 'Informal counselor conversation', 'Monitor for repetition'],
      status: 'resolved', anonymous: true, piiClean: true, aiClassified: false
    }
  ];
  console.log('[DB] Seeded 8 sample reports.');
}

saveDB(_db);

// ── Helpers ──
function nextReportId() {
  const db = loadDB();
  const nums = db.reports.map(r => parseInt(r.id.replace('RPT-', '')) || 0);
  const max = nums.length ? Math.max(...nums) : 0;
  return 'RPT-' + String(max + 1).padStart(3, '0');
}

// ── Exported functions ──
module.exports = {
  getUserByUsername(username) {
    const db = loadDB();
    return db.users.find(u => u.username === username) || null;
  },

  getAllReports() {
    const db = loadDB();
    return [...db.reports].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  },

  getReportById(id) {
    const db = loadDB();
    return db.reports.find(r => r.id === id) || null;
  },

  createReport(data) {
    const db = loadDB();
    const id = nextReportId();
    const report = {
      id,
      timestamp:    data.timestamp || new Date().toISOString(),
      platform:     data.platform,
      bullyingType: data.bullyingType,
      severity:     data.severity,
      frequency:    data.frequency,
      duration:     data.duration,
      reportText:   data.reportText,
      extra:        data.extra || '',
      summary:      data.summary || '',
      interventions: data.interventions || [],
      status:       data.status || 'pending',
      anonymous:    data.anonymous !== false,
      piiClean:     data.piiClean !== false,
      aiClassified: data.aiClassified !== false,
    };
    db.reports.unshift(report);
    saveDB(db);
    return report;
  },

  updateReportStatus(id, status) {
    const db = loadDB();
    const idx = db.reports.findIndex(r => r.id === id);
    if (idx === -1) return false;
    db.reports[idx].status = status;
    saveDB(db);
    return true;
  }
};
