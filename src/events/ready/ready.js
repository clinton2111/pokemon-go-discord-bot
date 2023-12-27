const { CommandKit } = require('commandkit');
const { activityStatus } = require('../../../config.json');
const { ActivityType, Client } = require('discord.js');

/**
 *
 * @param {Client} client
 * @param {CommandKit} handler
 */
module.exports = (client, handler) => {
  let status = [];

  for (const activity of activityStatus) {
    status.push({
      name: activity,
      type: ActivityType.Custom,
    });
  }

  console.log(
    `✅ ${client.user.tag} is ready - ${new Date().toLocaleString()}`,
  );

  setInterval(() => {
    client.user.setActivity(status[Math.floor(Math.random() * status.length)]);
  }, 120000);
};
