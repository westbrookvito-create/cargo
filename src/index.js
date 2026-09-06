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

function buildProxyAgent(proxyUrl) {
  if (!proxyUrl) return undefined;
  if (proxyUrl.startsWith('socks')) {
    const { SocksProxyAgent } = require('socks-proxy-agent');
    return new SocksProxyAgent(proxyUrl);
  }
  const { HttpsProxyAgent } = require('https-proxy-agent');
  return new HttpsProxyAgent(proxyUrl);
}

const agent = buildProxyAgent(config.proxyUrl);
if (agent) console.log('Using proxy for Telegram API requests.');

const bot = new Telegraf(config.botToken, agent ? { telegram: { agent } } : undefined);

require('./handlers/myChatMember')(bot);
require('./handlers/chatMember')(bot);
require('./handlers/menu')(bot);

require('./services/confirmJob').start();

bot.catch((err, ctx) => {
  console.error(`Error while handling update ${ctx.updateType}:`, err);
});

async function applyBranding() {
  try {
    await bot.telegram.setMyName(config.botDisplayName);
    await bot.telegram.setMyShortDescription(`Трекер подписчиков для арбитража трафика. По вопросам: ${config.guestContact}`);
    await bot.telegram.setMyDescription(
      `${config.botDisplayName} отслеживает подписчиков в ваших Telegram-каналах и считает оплату за трафик. ` +
        `Доступ только у владельцев проектов.`
    );
  } catch (err) {
    console.error('Failed to set bot profile name/description:', err.message);
  }
}

applyBranding();

bot.launch({
  allowedUpdates: ['message', 'callback_query', 'my_chat_member', 'chat_member'],
});

console.log('Bot started.');

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
