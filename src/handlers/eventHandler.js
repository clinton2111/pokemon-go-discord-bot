const path = require('path');
const getAllFiles = require('../utils/getAllFiles');
const { Client } = require('discord.js');

/**
 *
 * @param {Client} client
 */
module.exports = (client) => {
  const eventFolders = getAllFiles(path.join(__dirname, '..', 'events'), true);

  for (const eventFolder of eventFolders) {
    const eventFiles = getAllFiles(eventFolder);

    /*
      Handling priority by adding a number and a - before the file name
      TODO: find a better way to do this later on
    */
    eventFiles.sort((a, b) => a > b);

    // replacing \\ with / for windows based file paths
    const eventName = eventFolder.replace(/\\/g, '/').split('/').pop();

    client.on(eventName, async (args) => {
      for (const eventFile of eventFiles) {
        try {
          const eventFunction = require(eventFile);
          await eventFunction(client, args);
        } catch (error) {
          console.log(`❌ Could not require function - ${eventFile}`);
        }
      }
    });
  }
};
