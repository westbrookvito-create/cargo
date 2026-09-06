require('dotenv').config();

const ownerIds = (process.env.OWNER_IDS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

module.exports = {
  botToken: process.env.BOT_TOKEN || '',
  ownerIds,
  dbPath: process.env.DB_PATH || './data/bot.db',
  defaultHoldDays: Number(process.env.DEFAULT_HOLD_DAYS || 3),
  defaultCurrency: process.env.DEFAULT_CURRENCY || 'USD',
  botDisplayName: process.env.BOT_DISPLAY_NAME || 'Cherokky Traff',
  guestContact: process.env.GUEST_CONTACT || '@saintsoon',
  // http(s):// or socks5:// proxy URL, for networks where api.telegram.org
  // is blocked or throttled directly (e.g. some ISPs).
  proxyUrl: process.env.BOT_PROXY_URL || '',
};
