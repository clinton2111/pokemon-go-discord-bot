const { CommandKit } = require('commandkit');
const { Client, Interaction } = require('discord.js');

module.exports = {
  data: {
    name: 'ping',
    description: 'Returns with bot client and websocket ping',
  },

  /**
   *
   * @param {Client} client
   * @param {Interaction} interaction
   * @param {CommandKit} handler
   */
  run: async ({ interaction, client, handler }) => {
    await interaction.deferReply();
    const reply = await interaction.fetchReply();

    const ping = reply.createdTimestamp - interaction.createdTimestamp;

    interaction.editReply(
      `🌐 Client ${ping} ms | Websocket 🔌: ${client.ws.ping} ms`,
    );
  },

  options: {
    devOnly: true,
    deleted: false,
  },
};
