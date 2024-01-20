import { CommandKit } from 'commandkit';
import { ActivityType, Client } from 'discord.js';
import { ACTIVITY_STATUS } from '../../config/constants.js';

/**
 *
 * @param {Client} client
 * @param {CommandKit} handler
 */
const ready = (client, handler) => {
  let status = [];

  for (const activity of ACTIVITY_STATUS) {
    status.push({
      name: activity,
      type: ActivityType.Custom,
    });
  }

  console.log(`✅ ${client.user.tag} is ready - ${new Date().toLocaleString()}`);

  setInterval(() => {
    client.user.setActivity(status[Math.floor(Math.random() * status.length)]);
  }, 120000);
};

export default ready;
