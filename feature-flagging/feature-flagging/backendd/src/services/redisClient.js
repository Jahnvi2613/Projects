const Redis = require('ioredis');
let pub, sub, client;

async function initRedis() {
  const url = process.env.REDIS_URL || 'redis://localhost:6379';
  client = new Redis(url);
  pub = new Redis(url);
  sub = new Redis(url);

  sub.subscribe('flags_updates', (err) => {
    if (err) console.error('sub error', err);
    else console.log('Subscribed to flags_updates');
  });

  sub.on('message', (channel, message) => {
    try {
      const payload = JSON.parse(message);
      // Emit process-level event or call a handler to refresh cache
      console.log('FLAG UPDATE', payload);
      // For now, just log. Later, import flagService and refresh local cache.
    } catch (e) { console.error(e) }
  });

  client.on('error', console.error);
  console.log('Redis initialized');
}

function getClient() { return client; }
function getPub() { return pub; }
function getSub() { return sub; }
module.exports = { initRedis, getClient, getPub,getSub };