/* ============================================================
   CyberGuard — Express Backend Server
   ============================================================ */

require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const path    = require('path');
const DB      = require('./db');

const app    = express();
const PORT   = process.env.PORT || 3000;
const SECRET = process.env.JWT_SECRET || 'cyberguard_fallback_secret';
const EXPIRES = process.env.JWT_EXPIRES_IN || '8h';

// ── Middleware ──
app.use(cors());
app.use(express.json());

// Static frontend — serve cyberguard/ folder from root
app.use(express.static(path.join(__dirname, '..')));

// ── Auth Middleware ──
function authRequired(req, res, next) {
  const header = req.headers['authorization'];
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }
  const token = header.slice(7);
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Token invalid or expired' });
  }
}

function counselorOnly(req, res, next) {
  if (req.user.role !== 'counselor') {
    return res.status(403).json({ error: 'Counselor access required' });
  }
  next();
}

// ────────────────────────────────────────────────
// ROUTES
// ────────────────────────────────────────────────

// ── Health check ──
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString(), service: 'CyberGuard API v1' });
});

// ── POST /api/auth/login ──
app.post('/api/auth/login', (req, res) => {
  try {
    const { username, password, role } = req.body;

    if (!username || !password || !role) {
      return res.status(400).json({ error: 'username, password and role are required' });
    }

    const user = DB.getUserByUsername(username.trim());

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    if (user.role !== role) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const valid = bcrypt.compareSync(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const payload = {
      id:       user.id,
      username: user.username,
      role:     user.role,
      name:     user.name,
      grade:    user.grade || null,
      title:    user.title || null,
    };

    const token = jwt.sign(payload, SECRET, { expiresIn: EXPIRES });

    res.json({ token, user: payload });
  } catch (err) {
    console.error('[Login Error]', err.message);
    res.status(500).json({ error: 'Internal server error during login' });
  }
});

// ── GET /api/reports ──
app.get('/api/reports', authRequired, (req, res) => {
  const reports = DB.getAllReports();

  // Students only see their own session reports? 
  // For this school system — counselors see all, students see all (anonymous)
  res.json({ reports, total: reports.length });
});

// ── POST /api/reports ──
app.post('/api/reports', authRequired, (req, res) => {
  const {
    platform, bullyingType, severity, frequency, duration,
    reportText, extra, summary, interventions, status,
    anonymous, piiClean, aiClassified, timestamp
  } = req.body;

  if (!platform || !bullyingType || !severity || !frequency || !duration || !reportText) {
    return res.status(400).json({ error: 'Missing required report fields' });
  }

  const report = DB.createReport({
    platform,
    bullyingType,
    severity,
    frequency,
    duration,
    reportText,
    extra: extra || '',
    summary: summary || '',
    interventions: interventions || [],
    status: status || 'pending',
    anonymous: anonymous !== false,
    piiClean: piiClean !== false,
    aiClassified: aiClassified !== false,
    timestamp: timestamp || new Date().toISOString(),
  });

  res.status(201).json({ report });
});

// ── PATCH /api/reports/:id/status ──
app.patch('/api/reports/:id/status', authRequired, counselorOnly, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const VALID_STATUSES = ['pending', 'reviewing', 'action_taken', 'escalated', 'resolved'];
  if (!status || !VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: `Status must be one of: ${VALID_STATUSES.join(', ')}` });
  }

  const ok = DB.updateReportStatus(id, status);
  if (!ok) {
    return res.status(404).json({ error: `Report ${id} not found` });
  }

  const updated = DB.getReportById(id);
  res.json({ report: updated });
});

// ── GET /api/stats (counselor dashboard stats) ──
app.get('/api/stats', authRequired, counselorOnly, (req, res) => {
  const reports = DB.getAllReports();
  const total = reports.length;

  const byStatus  = {};
  const bySeverity = {};
  const byType    = {};

  reports.forEach(r => {
    byStatus[r.status]       = (byStatus[r.status]       || 0) + 1;
    bySeverity[r.severity]   = (bySeverity[r.severity]   || 0) + 1;
    byType[r.bullyingType]   = (byType[r.bullyingType]   || 0) + 1;
  });

  // 7-day trend
  const now = Date.now();
  const trend = [];
  for (let i = 6; i >= 0; i--) {
    const dayStart = now - i * 86400000;
    const dayEnd   = dayStart + 86400000;
    const label = new Date(dayStart).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    const count = reports.filter(r => {
      const t = new Date(r.timestamp).getTime();
      return t >= dayStart && t < dayEnd;
    }).length;
    trend.push({ label, count });
  }

  res.json({ total, byStatus, bySeverity, byType, trend });
});

// ── 404 for unknown API routes ──
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// ── SPA fallback — serve index.html for all non-API routes ──
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// ── Start ──
app.listen(PORT, () => {
  console.log(`\n  🛡️  CyberGuard API Server`);
  console.log(`  ─────────────────────────────────`);
  console.log(`  ✅ Running at  http://localhost:${PORT}`);
  console.log(`  📊 Dashboard   http://localhost:${PORT}/pages/counselor.html`);
  console.log(`  🎓 Student     http://localhost:${PORT}/pages/student.html`);
  console.log(`  ─────────────────────────────────\n`);
});

module.exports = app;
