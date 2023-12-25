require('dotenv').config();

const { Client, GatewayIntentBits } = require('discord.js');
const eventHandler = require('./handlers/eventHandler');
const { mongoose } = require('mongoose');
const { messages } = require('../config.json');

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

    eventHandler(client);

    client.login(process.env.TOKEN);
  } catch (error) {
    console.log(messages.DB_CONNECTION_ERROR);
  }
})();
