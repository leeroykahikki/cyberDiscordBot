// require('dotenv').config();
const { Client, GatewayIntentBits, Partials } = require('discord.js');
const logger = require('log4js').getLogger();
logger.level = 'debug';

let lastCount = 0;
let lastOnlineCount = 0;

const client = new Client({
  intents: [
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Channel],
});

client.once('ready', async () => {
  logger.debug('ready');

  while (true) {
    try {
      await precenseStatusUpdate();
    } catch (err) {
      logger.error(err);
    }
  }
});

client.login(process.env.TOKEN);

async function getOnlineMembersCount() {
  const GUILD_MEMBERS = await client.guilds.cache
    .get(process.env.GUILD_ID)
    .members.fetch({ withPresences: true });

  const onlineMembers = {
    online: GUILD_MEMBERS.filter((online) => online.presence?.status === 'online').size,
    idle: GUILD_MEMBERS.filter((online) => online.presence?.status === 'idle').size,
    dnd: GUILD_MEMBERS.filter((online) => online.presence?.status === 'dnd').size,
  };

  const summaryOnlineMembers = onlineMembers.online + onlineMembers.idle + onlineMembers.dnd;
  return summaryOnlineMembers;
}

async function getMembersCount() {
  const GUILD_MEMBERS = await client.guilds.cache
    .get(process.env.GUILD_ID)
    .members.fetch({ withPresences: true });

  return GUILD_MEMBERS.size;
}

async function precenseStatusUpdate() {
  const guild = client.guilds.cache.get(process.env.GUILD_ID);
  const infoOnlineChannel = guild.channels.cache.get(process.env.INFO_ONLINE_CHANNEL_ID);
  const infoOverallChannel = guild.channels.cache.get(process.env.INFO_OVERALL_CHANNEL_ID);

  const currentOnlineCount = await getOnlineMembersCount();
  const currentCount = await getMembersCount();
  logger.debug(currentOnlineCount);
  logger.debug(currentCount);

  if (lastOnlineCount != currentOnlineCount) {
    await infoOnlineChannel
      .setName(`👤 Онлайн: ${currentOnlineCount}`)
      .then((newChannel) => logger.debug(`Channel's new name is ${newChannel.name}`))
      .catch(console.error());

    lastOnlineCount = currentOnlineCount;
    logger.debug('update online');
  }

  if (lastCount != currentCount) {
    await infoOverallChannel
      .setName(`👤 На сервере: ${currentCount}`)
      .then((newChannel) => logger.debug(`Channel's new name is ${newChannel.name}`))
      .catch(console.error());

    lastCount = currentCount;
    logger.debug('update members');
  }

  logger.debug('all updated');
  await new Promise((resolve) => setTimeout(resolve, 180000));
}
