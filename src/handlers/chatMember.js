const db = require('../db');

const ACTIVE_STATUSES = ['member', 'administrator', 'creator'];

module.exports = (bot) => {
  bot.on('chat_member', async (ctx) => {
    const update = ctx.update.chat_member;
    const chat = update.chat;
    if (chat.type !== 'channel' && chat.type !== 'supergroup') return;

    const channelId = String(chat.id);
    const project = db.getProject(channelId);
    if (!project) return; // untracked chat, ignore

    const user = update.new_chat_member.user;
    if (user.is_bot) return;

    const wasActive = ACTIVE_STATUSES.includes(update.old_chat_member.status);
    const isActive = ACTIVE_STATUSES.includes(update.new_chat_member.status);
    const userId = String(user.id);
    const now = Date.now();

    if (!wasActive && isActive) {
      let link = null;
      if (update.invite_link) {
        link = { url: update.invite_link.invite_link, label: update.invite_link.name || null };
      }
      db.recordJoin({ channelId, userId, link, joinedAt: now });
    } else if (wasActive && !isActive) {
      db.recordLeave({ channelId, userId, leftAt: now });
    }
  });
};
