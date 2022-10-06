// require('dotenv').config();
const { Client, GatewayIntentBits, Partials } = require('discord.js');

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
  console.log('ready');

  while (true) {
    await precenseStatusUpdate();
  }
});

client.login(process.env.TOKEN);

async function getOnlineMembersCount() {
  const GUILD_MEMBERS = await client.guilds.cache
    .get(process.env.GUILD_ID)
    .members.fetch({ withPresences: true });

  const onlineMembers = {
    online: (await GUILD_MEMBERS.filter((online) => online.presence?.status === 'online')).filter(
      (member) => !member.user.bot,
    ).size,
    idle: (await GUILD_MEMBERS.filter((online) => online.presence?.status === 'idle')).filter(
      (member) => !member.user.bot,
    ).size,
    dnd: (await GUILD_MEMBERS.filter((online) => online.presence?.status === 'dnd')).filter(
      (member) => !member.user.bot,
    ).size,
  };

  const summaryOnlineMembers = onlineMembers.online + onlineMembers.idle + onlineMembers.dnd;
  return summaryOnlineMembers;
}

async function getMembersCount() {
  const GUILD_MEMBERS = await client.guilds.cache
    .get(process.env.GUILD_ID)
    .members.fetch({ withPresences: true });

  return GUILD_MEMBERS.filter((member) => !member.user.bot).size;
}

async function precenseStatusUpdate() {
  const guild = client.guilds.cache.get(process.env.GUILD_ID);
  const infoOnlineChannel = guild.channels.cache.get(process.env.INFO_ONLINE_CHANNEL_ID);
  const infoOverallChannel = guild.channels.cache.get(process.env.INFO_OVERALL_CHANNEL_ID);

  const currentOnlineCount = await getOnlineMembersCount();
  const currentCount = await getMembersCount();
  console.log(currentOnlineCount);
  console.log(currentCount);

  if (lastOnlineCount != currentOnlineCount) {
    await infoOnlineChannel
      .setName(`👤 Онлайн: ${currentOnlineCount}`)
      .then((newChannel) => console.log(`Channel's new name is ${newChannel.name}`))
      .catch(console.error);

    lastOnlineCount = currentOnlineCount;
    console.log('update online');
  }

  if (lastCount != currentCount) {
    await infoOverallChannel
      .setName(`👤 На сервере: ${currentCount}`)
      .then((newChannel) => console.log(`Channel's new name is ${newChannel.name}`))
      .catch(console.error);

    lastCount = currentCount;
    console.log('update members');
  }

  console.log('all updated');
  await new Promise((resolve) => setTimeout(resolve, 180000));
}
