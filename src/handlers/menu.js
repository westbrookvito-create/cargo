const { Markup } = require('telegraf');
const db = require('../db');
const { ownerOnly } = require('../auth');
const { setPending, takePending } = require('../state');
const { buildCsv, buildAllCsv } = require('../services/csv');
const { getPeriod, listPeriods } = require('../services/periods');

function money(amount, currency) {
  return `${Number(amount).toFixed(2)} ${currency}`;
}

function escapeHtml(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function truncate(s, len) {
  s = String(s);
  return s.length > len ? `${s.slice(0, len - 1)}…` : s;
}

function padEnd(s, len) {
  s = String(s);
  return s.length >= len ? s : s + ' '.repeat(len - s.length);
}

function padStart(s, len) {
  s = String(s);
  return s.length >= len ? s : ' '.repeat(len - s.length) + s;
}

function projectsKeyboard() {
  const projects = db.listProjects();
  if (projects.length === 0) return null;
  const rows = [
    [Markup.button.callback('📈 Сводка по всем проектам', 'allperiods')],
    [Markup.button.callback('⬇️ Экспорт всех (CSV)', 'exportall')],
    ...projects.map((p) => [Markup.button.callback(`${p.title}`, `proj:${p.channel_id}`)]),
  ];
  return Markup.inlineKeyboard(rows);
}

function projectKeyboard(channelId) {
  return Markup.inlineKeyboard([
    [Markup.button.callback('📊 Статистика', `periods:${channelId}`)],
    [Markup.button.callback('🔗 Новая трек-ссылка', `newlink:${channelId}`)],
    [Markup.button.callback('💰 Цена за подписчика', `setprice:${channelId}`)],
    [Markup.button.callback('💱 Валюта', `setcur:${channelId}`)],
    [Markup.button.callback('⏳ Срок удержания (дни)', `sethold:${channelId}`)],
    [Markup.button.callback('⬇️ Экспорт CSV', `export:${channelId}`)],
    [Markup.button.callback('« Назад к проектам', 'back')],
  ]);
}

function periodKeyboard(channelId) {
  const periods = listPeriods();
  const rows = [];
  for (let i = 0; i < periods.length; i += 2) {
    rows.push(
      periods
        .slice(i, i + 2)
        .map((p) => Markup.button.callback(p.label, `pstats:${channelId}:${p.key}`))
    );
  }
  rows.push([Markup.button.callback('« К проекту', `proj:${channelId}`)]);
  return Markup.inlineKeyboard(rows);
}

async function showProjectsList(ctx) {
  const kb = projectsKeyboard();
  if (!kb) {
    return ctx.reply(
      'Пока нет ни одного проекта.\n\n' +
        'Добавьте бота администратором в канал, куда льёте трафик, — проект появится здесь автоматически.'
    );
  }
  return ctx.reply('Ваши проекты:', kb);
}

function projectSummaryText(project) {
  return (
    `📁 ${project.title}\n` +
    `ID: ${project.channel_id}\n` +
    `Цена за подтверждённого подписчика: ${money(project.price_per_sub, project.currency)}\n` +
    `Срок удержания: ${project.hold_days} дн.`
  );
}

async function showProjectMenu(ctx, channelId) {
  const project = db.getProject(channelId);
  if (!project) return ctx.answerCbQuery('Проект не найден');
  const text = projectSummaryText(project);
  await ctx.editMessageText(text, projectKeyboard(channelId)).catch(() => ctx.reply(text, projectKeyboard(channelId)));
}

async function showPeriodMenu(ctx, channelId) {
  const project = db.getProject(channelId);
  if (!project) return ctx.answerCbQuery('Проект не найден');
  const text = `📊 ${project.title}\nВыберите период:`;
  await ctx
    .editMessageText(text, periodKeyboard(channelId))
    .catch(() => ctx.reply(text, periodKeyboard(channelId)));
  await ctx.answerCbQuery();
}

async function showPeriodStats(ctx, channelId, periodKey) {
  const period = getPeriod(periodKey);
  if (!period) return ctx.answerCbQuery('Неизвестный период');
  const [from, to] = period.range();
  const stats = db.getPeriodStats(channelId, from, to);
  if (!stats) return ctx.answerCbQuery('Проект не найден');
  const { project, sources, totals } = stats;

  let text = `📊 ${project.title} — ${period.label}\n\n`;
  if (sources.length === 0) {
    text += 'Нет данных за этот период.';
  } else {
    for (const s of sources) {
      text +=
        `• ${s.label}\n` +
        `  новых: ${s.newSubs} | подтверждено: ${s.confirmed} | отписалось рано: ${s.leftEarly}\n` +
        `  заработано: ${money(s.earnings, project.currency)}\n`;
    }
    text +=
      `\nИТОГО за «${period.label}»: новых ${totals.newSubs}, подтверждено ${totals.confirmed}, отписалось рано ${totals.leftEarly}\n` +
      `💰 Заработано: ${money(totals.earnings, project.currency)}`;
  }

  await ctx.reply(
    text,
    Markup.inlineKeyboard([
      [Markup.button.callback('« Другой период', `periods:${channelId}`)],
      [Markup.button.callback('« К проекту', `proj:${channelId}`)],
    ])
  );
  await ctx.answerCbQuery();
}

function allPeriodKeyboard() {
  const periods = listPeriods();
  const rows = [];
  for (let i = 0; i < periods.length; i += 2) {
    rows.push(periods.slice(i, i + 2).map((p) => Markup.button.callback(p.label, `allpstats:${p.key}`)));
  }
  rows.push([Markup.button.callback('« Назад', 'back')]);
  return Markup.inlineKeyboard(rows);
}

async function showAllPeriodMenu(ctx) {
  const text = '📈 Сводка по всем проектам\nВыберите период:';
  await ctx
    .editMessageText(text, allPeriodKeyboard())
    .catch(() => ctx.reply(text, allPeriodKeyboard()));
  await ctx.answerCbQuery();
}

function buildSummaryTable(results) {
  const NAME_W = 14;
  const NUM_W = 5;
  const EARN_W = 13;
  const header =
    padEnd('Проект', NAME_W) + padStart('Нов', NUM_W) + padStart('Подтв', NUM_W) + padStart('Ушли', NUM_W) + padStart('Заработано', EARN_W);
  const lines = [header, '-'.repeat(header.length)];
  for (const r of results) {
    lines.push(
      padEnd(truncate(r.project.title, NAME_W - 1), NAME_W) +
        padStart(r.newSubs, NUM_W) +
        padStart(r.confirmed, NUM_W) +
        padStart(r.leftEarly, NUM_W) +
        padStart(`${r.earnings.toFixed(2)} ${r.project.currency}`, EARN_W)
    );
  }
  return lines.join('\n');
}

async function showAllPeriodStats(ctx, periodKey) {
  const period = getPeriod(periodKey);
  if (!period) return ctx.answerCbQuery('Неизвестный период');
  const [from, to] = period.range();
  const { results, totalsByCurrency } = db.getAllProjectsPeriodStats(from, to);

  if (results.length === 0) {
    await ctx.reply('Пока нет ни одного проекта.');
    return ctx.answerCbQuery();
  }

  const totalNew = results.reduce((s, r) => s + r.newSubs, 0);
  const totalConfirmed = results.reduce((s, r) => s + r.confirmed, 0);
  const totalLeft = results.reduce((s, r) => s + r.leftEarly, 0);

  let text = `📈 Сводка по всем проектам — ${period.label}\n\n<pre>${escapeHtml(buildSummaryTable(results))}</pre>\n\n`;
  text += `Всего: новых ${totalNew}, подтверждено ${totalConfirmed}, отписалось рано ${totalLeft}\n`;
  text += '💰 Заработано по валютам:\n';
  for (const [currency, amount] of Object.entries(totalsByCurrency)) {
    text += `  ${amount.toFixed(2)} ${currency}\n`;
  }

  await ctx.reply(text, {
    parse_mode: 'HTML',
    ...Markup.inlineKeyboard([
      [Markup.button.callback('« Другой период', 'allperiods')],
      [Markup.button.callback('« К проектам', 'back')],
    ]),
  });
  await ctx.answerCbQuery();
}

async function exportAllCsv(ctx) {
  const rows = db.exportAllRows();
  const csv = buildAllCsv(rows);
  await ctx.replyWithDocument({ source: Buffer.from(csv, 'utf8'), filename: 'all_projects_subscribers.csv' });
  await ctx.answerCbQuery();
}

async function createTrackingLink(ctx, channelId, label) {
  const project = db.getProject(channelId);
  if (!project) return ctx.reply('Проект не найден.');
  try {
    const created = await ctx.telegram.createChatInviteLink(channelId, { name: label.slice(0, 32) });
    const id = db.createTrackingLink(channelId, label);
    db.finalizeTrackingLink(id, created.invite_link);
    await ctx.reply(
      `✅ Ссылка создана для источника «${label}»:\n${created.invite_link}\n\n` +
        'Раздайте эту ссылку на конкретный источник/крео — все подписки по ней будут посчитаны отдельно.'
    );
  } catch (err) {
    await ctx.reply(
      `Не удалось создать ссылку: ${err.description || err.message}\n` +
        'Проверьте, что у бота есть право "Приглашать пользователей по ссылке" в этом канале.'
    );
  }
}

async function exportCsv(ctx, channelId) {
  const project = db.getProject(channelId);
  if (!project) return ctx.answerCbQuery('Проект не найден');
  const rows = db.exportRows(channelId);
  const csv = buildCsv(rows);
  const safeTitle = project.title.replace(/[^a-z0-9а-яё_-]+/gi, '_').slice(0, 40) || 'project';
  await ctx.replyWithDocument({
    source: Buffer.from(csv, 'utf8'),
    filename: `${safeTitle}_subscribers.csv`,
  });
  await ctx.answerCbQuery();
}

module.exports = (bot) => {
  bot.command('start', ownerOnly(), (ctx) =>
    ctx.reply(
      'Бот отслеживает подписчиков в ваших каналах и считает оплату по фиксированной цене за подписчика.\n\n' +
        '1. Добавьте бота администратором в канал (с правом приглашать по ссылке).\n' +
        '2. Проект появится в /projects — задайте там цену и срок удержания.\n' +
        '3. Создавайте отдельную трек-ссылку под каждый рекламный источник — статистика будет по каждой ссылке отдельно.'
    )
  );

  bot.command('help', ownerOnly(), (ctx) =>
    ctx.reply(
      'Команды:\n' +
        '/projects — список проектов (каналов)\n\n' +
        'Статусы подписчика:\n' +
        '• в ожидании — подписался недавно, ещё не прошёл срок удержания\n' +
        '• подтверждено — досидел до конца срока удержания, считается к оплате\n' +
        '• отписался рано — вышел из канала до истечения срока удержания, не оплачивается'
    )
  );

  bot.command('projects', ownerOnly(), showProjectsList);

  bot.action('back', ownerOnly(), async (ctx) => {
    await ctx.deleteMessage().catch(() => {});
    await showProjectsList(ctx);
    await ctx.answerCbQuery();
  });

  bot.action(/^proj:(.+)$/, ownerOnly(), (ctx) => showProjectMenu(ctx, ctx.match[1]));
  bot.action(/^periods:(.+)$/, ownerOnly(), (ctx) => showPeriodMenu(ctx, ctx.match[1]));
  bot.action(/^pstats:(-?\d+):([a-z0-9]+)$/, ownerOnly(), (ctx) => showPeriodStats(ctx, ctx.match[1], ctx.match[2]));
  bot.action(/^export:(.+)$/, ownerOnly(), (ctx) => exportCsv(ctx, ctx.match[1]));

  bot.action('allperiods', ownerOnly(), showAllPeriodMenu);
  bot.action(/^allpstats:([a-z0-9]+)$/, ownerOnly(), (ctx) => showAllPeriodStats(ctx, ctx.match[1]));
  bot.action('exportall', ownerOnly(), exportAllCsv);

  bot.action(/^setprice:(.+)$/, ownerOnly(), async (ctx) => {
    setPending(ctx.from.id, { action: 'setprice', channelId: ctx.match[1] });
    await ctx.reply('Введите цену за подтверждённого подписчика (число), например 0.50');
    await ctx.answerCbQuery();
  });

  bot.action(/^setcur:(.+)$/, ownerOnly(), async (ctx) => {
    setPending(ctx.from.id, { action: 'setcur', channelId: ctx.match[1] });
    await ctx.reply('Введите код валюты, например USD, RUB, EUR');
    await ctx.answerCbQuery();
  });

  bot.action(/^sethold:(.+)$/, ownerOnly(), async (ctx) => {
    setPending(ctx.from.id, { action: 'sethold', channelId: ctx.match[1] });
    await ctx.reply('Введите срок удержания в днях (целое число), например 3');
    await ctx.answerCbQuery();
  });

  bot.action(/^newlink:(.+)$/, ownerOnly(), async (ctx) => {
    setPending(ctx.from.id, { action: 'newlink', channelId: ctx.match[1] });
    await ctx.reply('Введите короткое название источника/крео для новой ссылки, например "insta_reels_1"');
    await ctx.answerCbQuery();
  });

  bot.on('text', ownerOnly(), async (ctx, next) => {
    const pending = takePending(ctx.from.id);
    if (!pending) return next();
    const { action, channelId } = pending;
    const value = ctx.message.text.trim();

    if (action === 'setprice') {
      const price = Number(value.replace(',', '.'));
      if (!Number.isFinite(price) || price < 0) return ctx.reply('Нужно положительное число. Попробуйте снова через /projects.');
      db.setPrice(channelId, price);
      await ctx.reply('Цена обновлена.\n\n' + projectSummaryText(db.getProject(channelId)), projectKeyboard(channelId));
      return;
    }

    if (action === 'setcur') {
      db.setCurrency(channelId, value.toUpperCase().slice(0, 10));
      await ctx.reply('Валюта обновлена.\n\n' + projectSummaryText(db.getProject(channelId)), projectKeyboard(channelId));
      return;
    }

    if (action === 'sethold') {
      const days = parseInt(value, 10);
      if (!Number.isInteger(days) || days < 0) return ctx.reply('Нужно целое число дней.');
      db.setHoldDays(channelId, days);
      await ctx.reply('Срок удержания обновлён.\n\n' + projectSummaryText(db.getProject(channelId)), projectKeyboard(channelId));
      return;
    }

    if (action === 'newlink') {
      return createTrackingLink(ctx, channelId, value);
    }

    return next();
  });
};
