const { Client, Interaction } = require('discord.js');

module.exports = {
  name: 'ping',
  description: 'Returns with bot ping',
  devOnly: true,
  testOnly: true,
  // options: Object,

  /**
   *
   * @param {Client} client
   * @param {Interaction} interaction
   */
  callback: async (client, interaction) => {
    await interaction.deferReply();
    const reply = await interaction.fetchReply();

    const ping = reply.createdTimestamp - interaction.createdTimestamp;

    interaction.editReply(
      `🌐 Client ${ping} ms | Websocket 🔌: ${client.ws.ping} ms`,
    );
  },
};
