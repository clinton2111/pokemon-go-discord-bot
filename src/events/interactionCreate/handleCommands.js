const { devs, testServer, messages } = require('../../../config.json');
const getLocalCommands = require('../../utils/getLocalCommands');
const { Client, Interaction } = require('discord.js');

/**
 *
 * @param {Client} client
 * @param {Interaction} interaction
 */
module.exports = async (client, interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const localCommands = getLocalCommands();

  try {
    const commandObject = localCommands.find(
      (cmd) => cmd.name === interaction.commandName,
    );

    if (!commandObject) return;

    if (commandObject.devOnly) {
      if (!devs.includes(interaction.member.id)) {
        interaction.reply({
          content: messages.COMMANDS.NOT_DEV_MEMBER,
          ephemeral: true,
        });
        return;
      }
    }

    if (commandObject.testOnly) {
      if (!testServer === interaction.guild.id) {
        interaction.reply({
          content: messages.COMMANDS.NOT_DEV_SERVER,
          ephemeral: true,
        });
        return;
      }
    }

    if (commandObject.permissionsRequired?.length) {
      for (const permission of commandObject.permissionsRequired) {
        if (!interaction.member.permission.has(permission)) {
          interaction.reply({
            content: messages.COMMANDS.NOT_ENOUGH_PERMISSIONS_MEMBER,
            ephemeral: true,
          });
          return;
        }
      }
    }

    if (commandObject.botPermissions?.length) {
      for (const permission of commandObject.botPermissions) {
        const bot = interaction.guild.member.me;

        if (!bot.permission.has(permission)) {
          interaction.reply({
            content: messages.COMMANDS.NOT_ENOUGH_PERMISSIONS_BOT,
            ephemeral: true,
          });
          return;
        }
      }
    }

    await commandObject.callback(client, interaction);
  } catch (error) {
    console.log(
      `${messages.GENERIC_ERROR} - ${__filename.slice(__dirname.length + 1)}`,
    );
    console.log(error);
  }
};
