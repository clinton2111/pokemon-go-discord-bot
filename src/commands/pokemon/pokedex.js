import { CommandKit } from 'commandkit';
import Interaction, { Client, SlashCommandBuilder } from 'discord.js';
import { default as pokemon } from '../../utils/fetchPokemon.js';
import { APIS, BOT } from '../../config/constants.js';
import { default as axios } from 'axios';
import has from 'lodash/has.js';
import size from 'lodash/size.js';
import { calculateNotableCPValues } from '../../utils/CombatPowerCalculator.js';
import { typeInfo } from '../../utils/typeData.js';
import availablePokemon from '../../models/AvailablePokemon.js';
import { redis } from '../../lib/redis.js';

export const data = new SlashCommandBuilder()
  .setName('pokedex')
  .setDescription('Retrieves info about a particular pokemon')
  .addStringOption((option) =>
    option.setName('pokemon').setDescription('The pokemon you want to look up').setRequired(true).setAutocomplete(true),
  );

/**
 *
 * @param {Client} client
 * @param {Interaction} interaction
 * @param {CommandKit} handler
 */
export const run = async ({ interaction, client, handler }) => {
  try {
    const selectedPokemonID = interaction.options.getString('pokemon');

    const selectedPokemon = pokemon.find((mon) => mon.id === selectedPokemonID);

    if (selectedPokemon === undefined) {
      interaction.reply({
        content: 'Please select a valid Pokemon from the list',
        ephemeral: true,
      });
      return false;
    }

    let dataEmbed = {};

    await interaction.deferReply();

    const cachedPokemonData = await redis.get(selectedPokemon.id);

    if (cachedPokemonData) {
      const cachedData = JSON.parse(cachedPokemonData);
      dataEmbed = {
        title: selectedPokemon.name,
        author: {
          name: BOT.NAME,
          icon_url: BOT.PIC,
        },
        thumbnail: {
          url: cachedData.pokemonImage,
        },
        fields: cachedData.fields,
        image: {
          url: cachedData.pokemonImage,
        },
        footer: {
          text: "I've been undertaking research. That's what I do",
          icon_url: BOT.PIC,
        },
        timestamp: new Date().toISOString(),
      };

      interaction.editReply({ embeds: [dataEmbed] });

      return false;
    }

    const requestedPokemonData = {
      id: selectedPokemon.id.split('#')[0],
      formIdentifier: selectedPokemon.id.split('#')[1],
      isRegional: selectedPokemon.isRegional,
      cacheKey: selectedPokemon.id,
    };

    const dataEndpointPokeGo = APIS.ID_POKEMON_ENDPOINT_POKE_GO.replace('{id}', requestedPokemonData.id);

    // using an all method incase I want to get data from multiple endpoints simultaneously in the future
    axios
      .all([axios.get(dataEndpointPokeGo)])
      .then(
        axios.spread(async (responsePokeGo) => {
          let pokeGoApiResponse = responsePokeGo.data;
          const fields = [];

          // Check if the requested pokemon is a regional pokemon
          if (requestedPokemonData.isRegional) {
            pokeGoApiResponse = has(pokeGoApiResponse.regionForms, requestedPokemonData.formIdentifier)
              ? pokeGoApiResponse.regionForms[requestedPokemonData.formIdentifier]
              : pokeGoApiResponse;
          }

          const pokemonImage = has(pokeGoApiResponse, 'assets.image') ? pokeGoApiResponse.assets.image : null;

          // Classification
          switch (pokeGoApiResponse.pokemonClass) {
            case 'POKEMON_CLASS_LEGENDARY':
              fields.push({
                name: 'Classification',
                value: 'Legendary',
                inline: true,
              });
              break;
            case 'POKEMON_CLASS_MYTHIC':
              fields.push({
                name: 'Classification',
                value: 'Mythical',
                inline: true,
              });
              break;
            case 'POKEMON_CLASS_ULTRA_BEAST':
              fields.push({
                name: 'Classification',
                value: 'Ultra Beast',
                inline: true,
              });
              break;
            default:
              fields.push({
                name: 'Classification',
                value: 'N/A',
                inline: true,
              });
          }

          const primaryType =
            pokeGoApiResponse.primaryType !== null ? pokeGoApiResponse.primaryType.names.English : null;
          const secondaryType =
            pokeGoApiResponse.secondaryType !== null ? pokeGoApiResponse.secondaryType.names.English : null;

          // Type
          fields.push({
            name: 'Type',
            value: (primaryType !== null ? primaryType : '') + (secondaryType !== null ? '/' + secondaryType : ''),
            inline: true,
          });

          // Weather Boost Conditions
          fields.push({
            name: 'Boost Conditions',
            value:
              (primaryType !== null ? typeInfo[primaryType].weatherBoost.names.English : '') +
              (secondaryType !== null ? '/' + typeInfo[secondaryType].weatherBoost.names.English : ''),
            inline: true,
          });

          const { attack, defense, stamina } = pokeGoApiResponse.stats;
          // Stats
          fields.push({
            name: 'Stats',
            value: 'Attack: ' + attack + '\nDefence:' + defense + '\nStamina: ' + stamina,
          });

          // Notable CPs
          const notableCPs = calculateNotableCPValues(attack, defense, stamina);

          // Notable CPs
          fields.push({
            name: 'Notable CP Values - Raids',
            value:
              'Raids: ' +
              notableCPs.raids.min +
              '-' +
              notableCPs.raids.max +
              '\n' +
              'Raids (WB): ' +
              notableCPs.raids.minWB +
              '-' +
              notableCPs.raids.maxWB +
              '\n' +
              'Shadow Raids: ' +
              notableCPs.shadowRaids.min +
              '-' +
              notableCPs.shadowRaids.max +
              '\n' +
              'Shadow Raids (WB): ' +
              notableCPs.shadowRaids.minWB +
              '-' +
              notableCPs.shadowRaids.maxWB,

            inline: true,
          });

          fields.push({
            name: 'Notable CP Values - Others',
            value:
              'Max CP : ' +
              notableCPs.maxCP +
              ' (15/15/15)' +
              '\n' +
              'Research Encounters: ' +
              notableCPs.research.min +
              '-' +
              notableCPs.research.max +
              '\n' +
              'Eggs: ' +
              notableCPs.raids.min +
              '-' +
              notableCPs.raids.max +
              '\n' +
              'Rocket Grunts: ' +
              notableCPs.rocketGrunts.gruntMin +
              '-' +
              notableCPs.rocketGrunts.gruntMax +
              '\n' +
              'Rocket Grunts (WB): ' +
              notableCPs.rocketGrunts.gruntMinWB +
              '-' +
              notableCPs.rocketGrunts.gruntMaxWB,

            inline: true,
          });

          // Line Break
          fields.push({
            name: '\u200B',
            value: '\u200B',
          });

          // Moves
          const quickMovesFlag = size(pokeGoApiResponse.quickMoves);
          const cinematicMovesFlag = size(pokeGoApiResponse.cinematicMoves);
          const eliteQuickMovesFlag = size(pokeGoApiResponse.eliteQuickMoves);
          const eliteCinematicMovesFlag = size(pokeGoApiResponse.eliteCinematicMoves);

          // Quick Moves
          if (quickMovesFlag) {
            let quickMovesString = '';
            for (let key in pokeGoApiResponse.quickMoves) {
              if (pokeGoApiResponse.quickMoves.hasOwnProperty(key)) {
                quickMovesString +=
                  pokeGoApiResponse.quickMoves[key].names.English +
                  ' (' +
                  pokeGoApiResponse.quickMoves[key].type.names.English +
                  ')\n';
              }
            }

            // Charged Moves
            fields.push({
              name: 'Quick Moves',
              value: quickMovesString,
              inline: true,
            });
          }

          if (cinematicMovesFlag) {
            let cinematicMoves = '';
            for (let key in pokeGoApiResponse.cinematicMoves) {
              if (pokeGoApiResponse.cinematicMoves.hasOwnProperty(key)) {
                cinematicMoves +=
                  pokeGoApiResponse.cinematicMoves[key].names.English +
                  ' (' +
                  pokeGoApiResponse.cinematicMoves[key].type.names.English +
                  ')\n';
              }
            }

            fields.push({
              name: 'Charged Moves',
              value: cinematicMoves,
              inline: true,
            });
          }

          // Elite Quick Moves
          if (eliteQuickMovesFlag) {
            let eliteQuickMoves = '';
            for (let key in pokeGoApiResponse.eliteQuickMoves) {
              if (pokeGoApiResponse.eliteQuickMoves.hasOwnProperty(key)) {
                eliteQuickMoves +=
                  pokeGoApiResponse.eliteQuickMoves[key].names.English +
                  ' (' +
                  pokeGoApiResponse.eliteQuickMoves[key].type.names.English +
                  ')\n';
              }
            }

            fields.push({
              name: 'Elite Quick Moves',
              value: eliteQuickMoves,
              inline: true,
            });
          }

          // Elite Charged Moves
          if (eliteCinematicMovesFlag) {
            let eliteCinematicMoves = '';
            for (let key in pokeGoApiResponse.eliteCinematicMoves) {
              if (pokeGoApiResponse.eliteCinematicMoves.hasOwnProperty(key)) {
                eliteCinematicMoves +=
                  pokeGoApiResponse.eliteCinematicMoves[key].names.English +
                  ' (' +
                  pokeGoApiResponse.eliteCinematicMoves[key].type.names.English +
                  ')\n';
              }
            }

            fields.push({
              name: 'Elite Charged Moves',
              value: eliteCinematicMoves,
              inline: true,
            });
          }

          // Evolutions
          const evolutionFlags = size(pokeGoApiResponse.evolutions);

          if (evolutionFlags) {
            const evoForms = pokeGoApiResponse.evolutions.map((evolution) => evolution.id);
            // Create the $or query dynamically using map
            const query = {
              $or: evoForms.map((id) => ({ formId: id })),
            };

            const evolutions = await availablePokemon
              .find(query)
              .select('pokeDexNo formId nameEN isRegional -_id')
              .sort({ pokeDexNo: 1, formId: 1 });

            if (evolutions.length > 0) {
              let evolutionString = '';
              evolutions.map((evolution) => {
                evolutionString += '#' + evolution.pokeDexNo + ' ' + evolution.nameEN + '\n';
              });

              fields.push({
                name: 'Evolutions',
                value: evolutionString,
              });
            }
          }

          // Mega Evolutions
          if (pokeGoApiResponse.hasMegaEvolution) {
            let megaEvolutions = '';
            for (let key in pokeGoApiResponse.megaEvolutions) {
              if (pokeGoApiResponse.megaEvolutions.hasOwnProperty(key)) {
                const t1 =
                  pokeGoApiResponse.megaEvolutions[key].primaryType !== null
                    ? pokeGoApiResponse.megaEvolutions[key].primaryType.names.English
                    : null;
                const t2 =
                  pokeGoApiResponse.megaEvolutions[key].secondaryType !== null
                    ? pokeGoApiResponse.megaEvolutions[key].secondaryType.names.English
                    : null;
                megaEvolutions +=
                  pokeGoApiResponse.megaEvolutions[key].names.English +
                  ' (' +
                  (t1 !== null ? t1 : '') +
                  (t2 !== null ? '/' + t2 : '') +
                  ')\n';
              }
            }
            fields.push({
              name: 'Mega Evolutions',
              value: megaEvolutions,
            });

            if (fields.length > 0) {
              await redis.set(
                requestedPokemonData.cacheKey,
                JSON.stringify({ fields, pokemonImage }),
                'EX',
                86400, // 24 hours in seconds
              );
            }
          }

          dataEmbed = {
            title: selectedPokemon.name,
            author: {
              name: BOT.NAME,
              icon_url: BOT.PIC,
            },
            thumbnail: {
              url: pokemonImage,
            },
            fields: fields,
            image: {
              url: pokemonImage,
            },
            footer: {
              text: "I've been undertaking research. That's what I do",
              icon_url: BOT.PIC,
            },
            timestamp: new Date().toISOString(),
          };

          interaction.editReply({ embeds: [dataEmbed] });
        }),
      )
      .catch((error) => {
        console.log(error);
        interaction.editReply({
          content: 'Something went wrong, please try again',
          ephemeral: true,
        });
      });
  } catch (error) {
    console.log(error);
  }
};

/**
 *
 * @param {Client} client
 * @param {Interaction} interaction
 * @param {CommandKit} handler
 */
export const autocomplete = ({ interaction, client, handler }) => {
  const focusedPokemon = interaction.options.getFocused(true);

  const filteredChoices = [];
  let count = 0;

  for (let i = 0; i < pokemon.length && count < 25; i++) {
    const mon = pokemon[i];
    if (mon.name.toLowerCase().includes(focusedPokemon.value)) {
      filteredChoices.push(mon);
      count++;
    }
  }

  const results = filteredChoices.map((mon) => {
    return {
      value: mon.id,
      name: mon.name,
    };
  });

  interaction.respond(results).catch(() => {});
};

export const options = {
  devOnly: false,
  deleted: false,
};
