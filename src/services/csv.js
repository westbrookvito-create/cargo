function csvEscape(value) {
  if (value === null || value === undefined) return '';
  const s = String(value);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function toIso(ms) {
  return ms ? new Date(ms).toISOString() : '';
}

function buildCsv(rows) {
  const header = ['user_id', 'source', 'joined_at', 'left_at', 'status', 'confirmed_at'];
  const lines = [header.join(',')];
  for (const r of rows) {
    lines.push(
      [
        csvEscape(r.user_id),
        csvEscape(r.label || 'direct'),
        csvEscape(toIso(r.joined_at)),
        csvEscape(toIso(r.left_at)),
        csvEscape(r.status),
        csvEscape(toIso(r.confirmed_at)),
      ].join(',')
    );
  }
  return lines.join('\n');
}

function buildAllCsv(rows) {
  const header = ['project', 'user_id', 'source', 'joined_at', 'left_at', 'status', 'confirmed_at'];
  const lines = [header.join(',')];
  for (const r of rows) {
    lines.push(
      [
        csvEscape(r.project_title),
        csvEscape(r.user_id),
        csvEscape(r.label || 'direct'),
        csvEscape(toIso(r.joined_at)),
        csvEscape(toIso(r.left_at)),
        csvEscape(r.status),
        csvEscape(toIso(r.confirmed_at)),
      ].join(',')
    );
  }
  return lines.join('\n');
}

module.exports = { buildCsv, buildAllCsv };
