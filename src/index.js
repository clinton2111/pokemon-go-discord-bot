require('dotenv').config();

const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.on('ready', (clientInstance) => {
  console.log(`✅ ${clientInstance.user.tag} is ready`);
});

client.on('messageCreate', (messageInstance) => {
  if (messageInstance.author.bot) return;

  if (messageInstance.content === 'hehe') {
    messageInstance.reply('hehe');
  }
});

client.login(process.env.TOKEN);
