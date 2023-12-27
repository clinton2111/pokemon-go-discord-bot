require('dotenv').config();

const { Client, GatewayIntentBits } = require('discord.js');
const { mongoose } = require('mongoose');
const { CommandKit } = require('commandkit');
const { messages, testServer, devs } = require('../config.json');
const path = require('path');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
  ],
});

(async () => {
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(messages.DB_CONNECTION_SUCCESS);

    new CommandKit({
      client,
      commandsPath: path.join(__dirname, 'commands'),
      eventsPath: path.join(__dirname, 'events'),
      devGuildIds: testServer,
      devUserIds: devs,
      bulkRegister: true,
    });

    client.login(process.env.TOKEN);
  } catch (error) {
    console.log(messages.DB_CONNECTION_ERROR);
  }
})();
