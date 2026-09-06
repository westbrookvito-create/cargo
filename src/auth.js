const config = require('./config');
const db = require('./db');

function isOwner(userId) {
  return config.ownerIds.includes(String(userId));
}

// Silently gated: on failure it just stops here without replying, so a
// single shared handler (e.g. bot.on('text', ...)) can still fall through
// to project-owner / guest handling for the same update.
function ownerOnly() {
  return async (ctx, next) => {
    if (ctx.chat && ctx.chat.type !== 'private') return;
    if (!ctx.from || !isOwner(ctx.from.id)) return;
    return next();
  };
}

// Classifies who is talking to the bot in a private chat:
// - 'owner': a global bot owner (full admin access)
// - 'projectOwner': bound to one or more projects, read-only stats access
// - 'guest': anyone else
function resolveAccess(ctx) {
  if (!ctx.from) return { role: 'guest', projects: [] };
  if (isOwner(ctx.from.id)) return { role: 'owner', projects: [] };
  if (ctx.from.username) db.bindOwnerByUsername(ctx.from.id, ctx.from.username);
  const projects = db.getProjectsByOwnerUserId(ctx.from.id);
  if (projects.length > 0) return { role: 'projectOwner', projects };
  return { role: 'guest', projects: [] };
}

function canViewProject(ctx, channelId) {
  if (!ctx.from) return false;
  if (isOwner(ctx.from.id)) return true;
  const project = db.getProject(channelId);
  return !!project && project.owner_user_id === String(ctx.from.id);
}

module.exports = { isOwner, ownerOnly, resolveAccess, canViewProject };
