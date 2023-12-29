import 'dotenv/config';

import { Client, GatewayIntentBits } from 'discord.js';
import { mongoose } from 'mongoose';
import { CommandKit } from 'commandkit';
import { fileURLToPath } from 'url';
import path from 'path';
import {
  MESSAGES,
  TEST_SERVER_IDS,
  DEVELOPER_IDS,
} from './config/constants.js';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
  ],
});

try {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));

  mongoose.set('strictQuery', false);
  await mongoose.connect(process.env.MONGODB_URI);
  console.log(MESSAGES.DB_CONNECTION_SUCCESS);

  new CommandKit({
    client,
    commandsPath: path.join(__dirname, 'commands'),
    eventsPath: path.join(__dirname, 'events'),
    devGuildIds: TEST_SERVER_IDS,
    devUserIds: DEVELOPER_IDS,
    bulkRegister: true,
  });

  client.login(process.env.TOKEN);
} catch (error) {
  console.log(MESSAGES.DB_CONNECTION_ERROR);
}
