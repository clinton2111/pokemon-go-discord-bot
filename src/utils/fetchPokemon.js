import { mongoose } from 'mongoose';
import { MESSAGES, CACHE_KEYS } from '../config/constants.js';
import availablePokemon from '../models/AvailablePokemon.js';
import map from 'lodash/map.js';
import { redis } from '../lib/redis.js';

const formatPokemonData = (pokemon) => {
  try {
    let standardizedOptions = [];

    map(pokemon, (mon) => {
      let extraIdentifier = null;
      if (mon.formId.toLowerCase() !== mon.nameEN.toLowerCase()) {
        // Cause region form nomenclature
        // https://bulbapedia.bulbagarden.net/wiki/Regional_form

        if (mon.formId.includes('_HISUIAN')) {
          extraIdentifier = ' (Hisuian)';
        } else if (mon.formId.includes('_PALDEA')) {
          extraIdentifier = ' (Paldean)';
        } else {
          // These mons have weird alt form names so a bit of cleaning is needed
          if (
            [25, 150, 243, 244, 245, 249, 250, 380, 381, 413, 664, 665, 666, 801, 890, 892, 898].includes(mon.pokeDexNo)
          ) {
            extraIdentifier =
              ' (' +
              mon.formId
                .replace(mon.nameEN.toUpperCase() + '_', '')
                .replace(new RegExp('_', 'g'), ' ')
                .toLowerCase()
                .replace(/\b\S/g, (t) => t.toUpperCase()) +
              ')';
          }
        }
      }

      standardizedOptions.push({
        id: `${mon.pokeDexNo}#${mon.formId}`,
        name: `#${mon.pokeDexNo} ${mon.nameEN}${extraIdentifier !== null ? extraIdentifier : ''}`,
        isRegional: mon.isRegional,
      });
    });

    return standardizedOptions;
  } catch (error) {
    console.log('Error formatting options ', error);
  }
};

const fetchPokemon = async () => {
  try {
    const cachedPokemonData = await redis.get(CACHE_KEYS.AUTOCOMPLETE_OPTIONS);

    if (cachedPokemonData) {
      return JSON.parse(cachedPokemonData);
    }

    /*
    Connection ready state
    0 = disconnected
    1 = connected
    2 = connecting
    3 = disconnecting
    */
    if (mongoose.connection.readyState !== 1) throw new Error(MESSAGES.DB_CONNECTION_ERROR);

    // Fetch all the pokemon from the DB
    availablePokemon
      .find({})
      .select('pokeDexNo formId nameEN isRegional -_id')
      .sort({ pokeDexNo: 1, formId: 1 })
      .then(async (pokemon) => {
        const autoCompleteOptions = formatPokemonData(pokemon);

        if (autoCompleteOptions.length > 0) {
          await redis.set(
            CACHE_KEYS.AUTOCOMPLETE_OPTIONS,
            JSON.stringify(autoCompleteOptions),
            'EX',
            86400, // 24 hours in seconds
          );
        }

        return autoCompleteOptions;
      })
      .catch((err) => {
        throw new Error('Error fetching from mongo:', err);
      });
  } catch (error) {
    console.log(error);
  }
};

const pokemonAutoCompleteData = await fetchPokemon();

export default pokemonAutoCompleteData;
