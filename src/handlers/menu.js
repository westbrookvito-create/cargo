const { Markup } = require('telegraf');
const db = require('../db');
const { ownerOnly } = require('../auth');
const { setPending, takePending } = require('../state');
const { buildCsv } = require('../services/csv');

function money(amount, currency) {
  return `${Number(amount).toFixed(2)} ${currency}`;
}

function projectsKeyboard() {
  const projects = db.listProjects();
  if (projects.length === 0) return null;
  const rows = projects.map((p) => [
    Markup.button.callback(`${p.title}`, `proj:${p.channel_id}`),
  ]);
  return Markup.inlineKeyboard(rows);
}

function projectKeyboard(channelId) {
  return Markup.inlineKeyboard([
    [Markup.button.callback('📊 Статистика', `stats:${channelId}`)],
    [Markup.button.callback('🔗 Новая трек-ссылка', `newlink:${channelId}`)],
    [Markup.button.callback('💰 Цена за подписчика', `setprice:${channelId}`)],
    [Markup.button.callback('💱 Валюта', `setcur:${channelId}`)],
    [Markup.button.callback('⏳ Срок удержания (дни)', `sethold:${channelId}`)],
    [Markup.button.callback('⬇️ Экспорт CSV', `export:${channelId}`)],
    [Markup.button.callback('« Назад к проектам', 'back')],
  ]);
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

async function showStats(ctx, channelId) {
  const stats = db.getStats(channelId);
  if (!stats) return ctx.answerCbQuery('Проект не найден');
  const { project, sources, totals } = stats;

  let text = `📊 Статистика: ${project.title}\n\n`;
  if (sources.length === 0) {
    text += 'Пока нет ни одного подписчика.';
  } else {
    for (const s of sources) {
      text +=
        `• ${s.label}\n` +
        `  подтверждено: ${s.confirmed} | в ожидании: ${s.pending} | отписались рано: ${s.leftEarly}\n` +
        `  начислено: ${money(s.earnings, project.currency)}\n`;
    }
    text +=
      `\nИТОГО: подтверждено ${totals.confirmed}, в ожидании ${totals.pending}, отписались рано ${totals.leftEarly}\n` +
      `К оплате: ${money(totals.earnings, project.currency)}`;
  }

  await ctx.reply(text, Markup.inlineKeyboard([[Markup.button.callback('« Назад', `proj:${channelId}`)]]));
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
  bot.action(/^stats:(.+)$/, ownerOnly(), (ctx) => showStats(ctx, ctx.match[1]));
  bot.action(/^export:(.+)$/, ownerOnly(), (ctx) => exportCsv(ctx, ctx.match[1]));

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
