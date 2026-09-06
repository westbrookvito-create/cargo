const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');
const config = require('./config');

fs.mkdirSync(path.dirname(config.dbPath), { recursive: true });

const db = new Database(config.dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS projects (
    channel_id   TEXT PRIMARY KEY,
    title        TEXT NOT NULL,
    price_per_sub REAL NOT NULL DEFAULT 0,
    currency     TEXT NOT NULL DEFAULT 'USD',
    hold_days    INTEGER NOT NULL DEFAULT 3,
    created_at   INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS invite_links (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    channel_id  TEXT NOT NULL,
    link        TEXT NOT NULL UNIQUE,
    label       TEXT,
    created_at  INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS subscribers (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    channel_id     TEXT NOT NULL,
    user_id        TEXT NOT NULL,
    invite_link_id INTEGER,
    joined_at      INTEGER NOT NULL,
    left_at        INTEGER,
    status         TEXT NOT NULL DEFAULT 'pending',
    confirmed_at   INTEGER
  );

  CREATE INDEX IF NOT EXISTS idx_subs_channel_status ON subscribers(channel_id, status);
  CREATE INDEX IF NOT EXISTS idx_subs_channel_open ON subscribers(channel_id, user_id, left_at);
  CREATE INDEX IF NOT EXISTS idx_subs_link ON subscribers(invite_link_id);
`);

const projectColumns = db.prepare('PRAGMA table_info(projects)').all().map((c) => c.name);
if (!projectColumns.includes('owner_user_id')) {
  db.exec('ALTER TABLE projects ADD COLUMN owner_user_id TEXT');
}
if (!projectColumns.includes('owner_username')) {
  db.exec('ALTER TABLE projects ADD COLUMN owner_username TEXT');
}

function upsertProjectFromChat(channelId, title) {
  const existing = db.prepare('SELECT * FROM projects WHERE channel_id = ?').get(channelId);
  if (existing) {
    db.prepare('UPDATE projects SET title = ? WHERE channel_id = ?').run(title, channelId);
    return { created: false, project: getProject(channelId) };
  }
  db.prepare(
    `INSERT INTO projects (channel_id, title, price_per_sub, currency, hold_days, created_at)
     VALUES (?, ?, 0, ?, ?, ?)`
  ).run(channelId, title, config.defaultCurrency, config.defaultHoldDays, Date.now());
  return { created: true, project: getProject(channelId) };
}

function getProject(channelId) {
  return db.prepare('SELECT * FROM projects WHERE channel_id = ?').get(channelId);
}

function listProjects() {
  return db.prepare('SELECT * FROM projects ORDER BY created_at DESC').all();
}

function setPrice(channelId, price) {
  db.prepare('UPDATE projects SET price_per_sub = ? WHERE channel_id = ?').run(price, channelId);
}

function setCurrency(channelId, currency) {
  db.prepare('UPDATE projects SET currency = ? WHERE channel_id = ?').run(currency, channelId);
}

function setHoldDays(channelId, days) {
  db.prepare('UPDATE projects SET hold_days = ? WHERE channel_id = ?').run(days, channelId);
}

function setProjectOwnerId(channelId, userId) {
  db.prepare('UPDATE projects SET owner_user_id = ?, owner_username = NULL WHERE channel_id = ?').run(
    String(userId),
    channelId
  );
}

function setProjectOwnerUsername(channelId, username) {
  db.prepare('UPDATE projects SET owner_username = ?, owner_user_id = NULL WHERE channel_id = ?').run(
    username.toLowerCase(),
    channelId
  );
}

function clearProjectOwner(channelId) {
  db.prepare('UPDATE projects SET owner_user_id = NULL, owner_username = NULL WHERE channel_id = ?').run(channelId);
}

function getProjectsByOwnerUserId(userId) {
  return db.prepare('SELECT * FROM projects WHERE owner_user_id = ?').all(String(userId));
}

function bindOwnerByUsername(userId, username) {
  if (!username) return;
  db.prepare(
    'UPDATE projects SET owner_user_id = ? WHERE owner_username = ? AND owner_user_id IS NULL'
  ).run(String(userId), username.toLowerCase());
}

function removeProject(channelId) {
  db.prepare('DELETE FROM subscribers WHERE channel_id = ?').run(channelId);
  db.prepare('DELETE FROM invite_links WHERE channel_id = ?').run(channelId);
  db.prepare('DELETE FROM projects WHERE channel_id = ?').run(channelId);
}

function upsertInviteLink(channelId, url, label) {
  const existing = db.prepare('SELECT * FROM invite_links WHERE link = ?').get(url);
  if (existing) {
    if (label && !existing.label) {
      db.prepare('UPDATE invite_links SET label = ? WHERE id = ?').run(label, existing.id);
    }
    return existing.id;
  }
  const info = db
    .prepare('INSERT INTO invite_links (channel_id, link, label, created_at) VALUES (?, ?, ?, ?)')
    .run(channelId, url, label || null, Date.now());
  return info.lastInsertRowid;
}

function createTrackingLink(channelId, label) {
  const now = Date.now();
  const placeholderUrl = `pending:${channelId}:${now}:${Math.random().toString(36).slice(2)}`;
  const info = db
    .prepare('INSERT INTO invite_links (channel_id, link, label, created_at) VALUES (?, ?, ?, ?)')
    .run(channelId, placeholderUrl, label, now);
  return info.lastInsertRowid;
}

function finalizeTrackingLink(id, realUrl) {
  db.prepare('UPDATE invite_links SET link = ? WHERE id = ?').run(realUrl, id);
}

function listInviteLinks(channelId) {
  return db
    .prepare('SELECT * FROM invite_links WHERE channel_id = ? ORDER BY created_at DESC')
    .all(channelId);
}

function recordJoin({ channelId, userId, link, joinedAt }) {
  let inviteLinkId = null;
  if (link && link.url) {
    inviteLinkId = upsertInviteLink(channelId, link.url, link.label);
  }
  const openExisting = db
    .prepare('SELECT id FROM subscribers WHERE channel_id = ? AND user_id = ? AND left_at IS NULL')
    .get(channelId, userId);
  if (openExisting) {
    // Already tracked as currently joined (duplicate event) - ignore.
    return;
  }
  db.prepare(
    `INSERT INTO subscribers (channel_id, user_id, invite_link_id, joined_at, status)
     VALUES (?, ?, ?, ?, 'pending')`
  ).run(channelId, userId, inviteLinkId, joinedAt);
}

function recordLeave({ channelId, userId, leftAt }) {
  const open = db
    .prepare(
      'SELECT id, status FROM subscribers WHERE channel_id = ? AND user_id = ? AND left_at IS NULL ORDER BY joined_at DESC LIMIT 1'
    )
    .get(channelId, userId);
  if (!open) return;
  const newStatus = open.status === 'pending' ? 'left_early' : open.status;
  db.prepare('UPDATE subscribers SET left_at = ?, status = ? WHERE id = ?').run(leftAt, newStatus, open.id);
}

function confirmDueSubscribers() {
  const now = Date.now();
  const due = db
    .prepare(
      `SELECT s.id FROM subscribers s
       JOIN projects p ON p.channel_id = s.channel_id
       WHERE s.status = 'pending'
         AND s.left_at IS NULL
         AND (? - s.joined_at) >= (p.hold_days * 86400000)`
    )
    .all(now);
  const update = db.prepare("UPDATE subscribers SET status = 'confirmed', confirmed_at = ? WHERE id = ?");
  const tx = db.transaction((rows) => {
    for (const row of rows) update.run(now, row.id);
  });
  tx(due);
  return due.length;
}

function getPeriodStats(channelId, from, to) {
  const project = getProject(channelId);
  if (!project) return null;

  const newRows = db
    .prepare(
      `SELECT il.id AS link_id, il.label AS label, COUNT(*) AS cnt
       FROM subscribers s
       LEFT JOIN invite_links il ON il.id = s.invite_link_id
       WHERE s.channel_id = ? AND s.joined_at BETWEEN ? AND ?
       GROUP BY il.id`
    )
    .all(channelId, from, to);

  const confirmedRows = db
    .prepare(
      `SELECT il.id AS link_id, il.label AS label, COUNT(*) AS cnt
       FROM subscribers s
       LEFT JOIN invite_links il ON il.id = s.invite_link_id
       WHERE s.channel_id = ? AND s.status = 'confirmed' AND s.confirmed_at BETWEEN ? AND ?
       GROUP BY il.id`
    )
    .all(channelId, from, to);

  const leftRows = db
    .prepare(
      `SELECT il.id AS link_id, il.label AS label, COUNT(*) AS cnt
       FROM subscribers s
       LEFT JOIN invite_links il ON il.id = s.invite_link_id
       WHERE s.channel_id = ? AND s.status = 'left_early' AND s.left_at BETWEEN ? AND ?
       GROUP BY il.id`
    )
    .all(channelId, from, to);

  const byLink = new Map();
  const ensure = (linkId, label) => {
    const key = linkId === null ? 'null' : linkId;
    if (!byLink.has(key)) {
      byLink.set(key, { label: label || 'Без метки / прямая ссылка', newSubs: 0, confirmed: 0, leftEarly: 0 });
    }
    return byLink.get(key);
  };
  for (const r of newRows) ensure(r.link_id, r.label).newSubs = r.cnt;
  for (const r of confirmedRows) ensure(r.link_id, r.label).confirmed = r.cnt;
  for (const r of leftRows) ensure(r.link_id, r.label).leftEarly = r.cnt;

  const sources = [...byLink.values()]
    .map((s) => ({ ...s, earnings: s.confirmed * project.price_per_sub }))
    .sort((a, b) => b.confirmed - a.confirmed || b.newSubs - a.newSubs);

  const totals = sources.reduce(
    (acc, s) => {
      acc.newSubs += s.newSubs;
      acc.confirmed += s.confirmed;
      acc.leftEarly += s.leftEarly;
      acc.earnings += s.earnings;
      return acc;
    },
    { newSubs: 0, confirmed: 0, leftEarly: 0, earnings: 0 }
  );

  return { project, sources, totals };
}

function exportRows(channelId) {
  return db
    .prepare(
      `SELECT s.user_id, il.label AS label, s.joined_at, s.left_at, s.status, s.confirmed_at
       FROM subscribers s
       LEFT JOIN invite_links il ON il.id = s.invite_link_id
       WHERE s.channel_id = ?
       ORDER BY s.joined_at DESC`
    )
    .all(channelId);
}

function getAllProjectsPeriodStats(from, to) {
  const projects = listProjects();
  const stmt = db.prepare(
    `SELECT
       SUM(CASE WHEN joined_at BETWEEN ? AND ? THEN 1 ELSE 0 END) AS newSubs,
       SUM(CASE WHEN status = 'confirmed' AND confirmed_at BETWEEN ? AND ? THEN 1 ELSE 0 END) AS confirmed,
       SUM(CASE WHEN status = 'left_early' AND left_at BETWEEN ? AND ? THEN 1 ELSE 0 END) AS leftEarly
     FROM subscribers WHERE channel_id = ?`
  );

  const results = projects.map((project) => {
    const row = stmt.get(from, to, from, to, from, to, project.channel_id);
    const newSubs = row.newSubs || 0;
    const confirmed = row.confirmed || 0;
    const leftEarly = row.leftEarly || 0;
    return { project, newSubs, confirmed, leftEarly, earnings: confirmed * project.price_per_sub };
  });

  const totalsByCurrency = {};
  for (const r of results) {
    totalsByCurrency[r.project.currency] = (totalsByCurrency[r.project.currency] || 0) + r.earnings;
  }

  return { results, totalsByCurrency };
}

function exportAllRows() {
  return db
    .prepare(
      `SELECT p.title AS project_title, s.channel_id, s.user_id, il.label AS label,
              s.joined_at, s.left_at, s.status, s.confirmed_at
       FROM subscribers s
       JOIN projects p ON p.channel_id = s.channel_id
       LEFT JOIN invite_links il ON il.id = s.invite_link_id
       ORDER BY p.title, s.joined_at DESC`
    )
    .all();
}

module.exports = {
  db,
  upsertProjectFromChat,
  getProject,
  listProjects,
  setPrice,
  setCurrency,
  setHoldDays,
  removeProject,
  createTrackingLink,
  finalizeTrackingLink,
  listInviteLinks,
  recordJoin,
  recordLeave,
  confirmDueSubscribers,
  getPeriodStats,
  exportRows,
  getAllProjectsPeriodStats,
  exportAllRows,
  setProjectOwnerId,
  setProjectOwnerUsername,
  clearProjectOwner,
  getProjectsByOwnerUserId,
  bindOwnerByUsername,
};
