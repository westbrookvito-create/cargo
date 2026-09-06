const cron = require('node-cron');
const db = require('../db');

function start() {
  db.confirmDueSubscribers();
  cron.schedule('0 * * * *', () => {
    db.confirmDueSubscribers();
  });
}

module.exports = { start };
