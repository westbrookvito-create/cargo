const { Telegraf } = require('telegraf');
const config = require('./config');

if (!config.botToken) {
  console.error('BOT_TOKEN is not set. Copy .env.example to .env and fill it in.');
  process.exit(1);
}
if (config.ownerIds.length === 0) {
  console.error('OWNER_IDS is not set. Add your Telegram user ID to .env.');
  process.exit(1);
}

const bot = new Telegraf(config.botToken);

require('./handlers/myChatMember')(bot);
require('./handlers/chatMember')(bot);
require('./handlers/menu')(bot);

require('./services/confirmJob').start();

bot.catch((err, ctx) => {
  console.error(`Error while handling update ${ctx.updateType}:`, err);
});

bot.launch({
  allowedUpdates: ['message', 'callback_query', 'my_chat_member', 'chat_member'],
});

console.log('Bot started.');

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
