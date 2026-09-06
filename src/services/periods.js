function startOfDay(ms) {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function startOfMonth(ms) {
  const d = new Date(ms);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

const DAY = 24 * 60 * 60 * 1000;

const PERIODS = {
  today: { label: 'Сегодня', range: () => [startOfDay(Date.now()), Date.now()] },
  yesterday: {
    label: 'Вчера',
    range: () => {
      const todayStart = startOfDay(Date.now());
      return [todayStart - DAY, todayStart];
    },
  },
  '7d': { label: '7 дней', range: () => [Date.now() - 7 * DAY, Date.now()] },
  '30d': { label: '30 дней', range: () => [Date.now() - 30 * DAY, Date.now()] },
  month: { label: 'Этот месяц', range: () => [startOfMonth(Date.now()), Date.now()] },
  all: { label: 'Всё время', range: () => [0, Date.now()] },
};

function getPeriod(key) {
  return PERIODS[key];
}

function listPeriods() {
  return Object.entries(PERIODS).map(([key, v]) => ({ key, label: v.label }));
}

module.exports = { getPeriod, listPeriods };
