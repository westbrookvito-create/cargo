const config = require('./config');

function isOwner(userId) {
  return config.ownerIds.includes(String(userId));
}

function ownerOnly() {
  return async (ctx, next) => {
    if (ctx.chat && ctx.chat.type !== 'private') return; // only respond to DM commands/menus
    if (!ctx.from || !isOwner(ctx.from.id)) {
      if (ctx.chat && ctx.chat.type === 'private') {
        await ctx.reply('Доступ только для владельца бота.');
      }
      return;
    }
    return next();
  };
}

module.exports = { isOwner, ownerOnly };
