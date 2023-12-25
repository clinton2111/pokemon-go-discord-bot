const { testServer, messages } = require('../../../config.json');
const getApplicationCommands = require('../../utils/getApplicationCommands');
const getLocalCommands = require('../../utils/getLocalCommands');
const areCommandsDifferent = require('../../utils/areCommandsDifferent');
const { Client } = require('discord.js');

/**
 *
 * @param {Client} client
 */
module.exports = async (client) => {
  try {
    const localCommands = getLocalCommands();
    const applicationCommands = await getApplicationCommands(
      client,
      testServer,
    );

    for (const localCommand of localCommands) {
      const { name, description, options } = localCommand;

      const existingCommand = await applicationCommands.cache.find(
        (cmd) => cmd.name === name,
      );

      if (existingCommand) {
        if (localCommand.deleted) {
          await applicationCommands.delete(existingCommand.id);
          console.log(`${messages.COMMANDS.DELETED} - "${name}"`);
          continue;
        }

        if (areCommandsDifferent(existingCommand, localCommand)) {
          await applicationCommands.edit(existingCommand.id, {
            description,
            options,
          });
          console.log(`${messages.COMMANDS.EDITED} - "${name}"`);
        }
      } else {
        if (localCommand.deleted) {
          console.log(`${messages.COMMANDS.SKIPPED} - "${name}"`);
          continue;
        }

        await applicationCommands.create({
          name,
          description,
          options,
        });

        console.log(`${messages.COMMANDS.REGISTERED} - "${name}"`);
      }
    }
  } catch (error) {
    console.log(
      `${messages.GENERIC_ERROR} - ${__filename.slice(__dirname.length + 1)}`,
    );
    console.log(error);
  }
};
