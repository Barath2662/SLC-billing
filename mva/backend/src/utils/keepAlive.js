const cron = require('node-cron');

function startKeepAliveJob(prisma) {
  if (!prisma) {
    console.error('[keep-alive] Prisma client is required to start keep-alive job');
    return;
  }

  const enabled = process.env.KEEP_ALIVE_ENABLED !== 'false';
  if (!enabled) {
    console.log('[keep-alive] Daily keep-alive job is disabled');
    return;
  }

  const schedule = process.env.KEEP_ALIVE_CRON || '0 9 * * *';

  const pingDatabase = async (source) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log(`[keep-alive] (${source}) Supabase ping successful at ${new Date().toISOString()}`);
    } catch (err) {
      console.error(`[keep-alive] (${source}) Supabase ping failed:`, err.message);
    }
  };

  cron.schedule(schedule, async () => {
    await pingDatabase('cron');
  });

  console.log(`[keep-alive] Daily keep-alive scheduled with cron: ${schedule}`);

  // Optional immediate ping on boot for verification/safety.
  pingDatabase('startup');
}

module.exports = { startKeepAliveJob };
