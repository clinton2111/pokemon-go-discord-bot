import { CommandKit } from 'commandkit';
import Interaction, { Client } from 'discord.js';

export const data = {
  name: 'ping',
  description: 'Returns with bot client and websocket ping',
};

/**
 *
 * @param {Client} client
 * @param {Interaction} interaction
 * @param {CommandKit} handler
 */
export const run = async ({ interaction, client, handler }) => {
  await interaction.deferReply();
  const reply = await interaction.fetchReply();

  const ping = reply.createdTimestamp - interaction.createdTimestamp;

  interaction.editReply(`🌐 Client ${ping} ms | Websocket 🔌: ${client.ws.ping} ms`);
};

export const options = {
  devOnly: true,
  deleted: false,
};
