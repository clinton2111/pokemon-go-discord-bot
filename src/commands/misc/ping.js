module.exports = {
  name: 'ping',
  description: 'Returns ping to the server.',
  // devOnly: Boolean,
  // testOnly: Boolean,
  // options: Object,

  callback: (client, interaction) => {
    interaction.reply(`${client.ws.ping} ms`);
  },
};
