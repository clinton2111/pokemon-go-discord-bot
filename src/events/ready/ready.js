import { CommandKit } from 'commandkit';
import { ActivityType, Client } from 'discord.js';
import { ACTIVITY_STATUS } from '../../config/constants.js';
import { fetchPokemon } from '../../../src/utils/fetchPokemon.js';

/**
 *
 * @param {Client} client
 * @param {CommandKit} handler
 */
const ready = async (client, handler) => {
  let status = [];

  for (const activity of ACTIVITY_STATUS) {
    status.push({
      name: activity,
      type: ActivityType.Custom,
    });
  }

  console.log(`✅ ${client.user.tag} is ready - ${new Date().toLocaleString()}`);
  const pokemon = await fetchPokemon();
  if (pokemon && pokemon.length > 0) {
    console.log(`✅ Pokemon list is ready - ${new Date().toLocaleString()}`);
  } else {
    console.log(`❌ Pokemon list is empty or not loaded`);
  }

  setInterval(() => {
    client.user.setActivity(status[Math.floor(Math.random() * status.length)]);
  }, 120000);
};

export default ready;
