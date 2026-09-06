const db = require('../db');
const config = require('../config');

module.exports = (bot) => {
  bot.on('my_chat_member', async (ctx) => {
    const update = ctx.update.my_chat_member;
    const chat = update.chat;
    if (chat.type === 'private') return;

    const newStatus = update.new_chat_member.status;
    const channelId = String(chat.id);

    if (newStatus === 'administrator') {
      const { created } = db.upsertProjectFromChat(channelId, chat.title || channelId);
      if (created) {
        for (const ownerId of config.ownerIds) {
          try {
            await ctx.telegram.sendMessage(
              ownerId,
              `✅ Бот назначен админом в «${chat.title}» (ID ${channelId}).\n` +
                `Проект зарегистрирован. Откройте /projects, чтобы задать цену за подписчика и срок удержания.`
            );
          } catch (_) {
            // owner may not have started a DM with the bot yet
          }
        }
      }
    }
  });
};
