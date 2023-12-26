require('dotenv').config();
const { default: axios } = require('axios');
const { default: mongoose } = require('mongoose');
const { APIS } = require('../../config.json');
const AvailablePokemon = require('../models/AvailablePokemon');

const fetchAllPokemon = async () => {
  try {
    let stdPokemonData = [];

    let startTime = performance.now();

    const response = await axios.get(APIS.ALL_POKEMON_ENDPOINT);

    let endTime = performance.now();
    console.log(`API Response in ${(endTime - startTime).toFixed(2)}ms`);

    const pokemonData = response.data;

    startTime = performance.now();

    for (const pokemon of pokemonData) {
      stdPokemonData.push({
        pokeDexNo: pokemon.dexNr,
        formId: pokemon.formId,
        nameEN: pokemon.names.English,
        nameJP: pokemon.names.Japanese,
        hasMegaEvolution: pokemon.hasMegaEvolution,
        isRegional: false,
        imageURL:
          pokemon.assets !== null && pokemon.assets?.image
            ? pokemon.assets.image
            : null,
      });

      if (Object.keys(pokemon.regionForms).length > 0) {
        for (const [identifier, regional] of Object.entries(
          pokemon.regionForms,
        )) {
          stdPokemonData.push({
            pokeDexNo: regional.dexNr,
            formId: regional.formId,
            nameEN: regional.names.English,
            nameJP: regional.names.Japanese,
            hasMegaEvolution: regional.hasMegaEvolution,
            isRegional: true,
            imageURL:
              regional.assets !== null && regional.assets?.image
                ? regional.assets.image
                : null,
          });
        }
      }
    }

    endTime = performance.now();
    console.log(
      `Data processing finished in ${(endTime - startTime).toFixed(2)}ms`,
    );

    return stdPokemonData;
  } catch (error) {
    return false;
  }
};

// Export the function so it can be used in other files
module.exports = fetchAllPokemon;

// Check to run file directly:
if (require.main === module) {
  (async () => {
    try {
      const pokemonModelData = await fetchAllPokemon();

      if (pokemonModelData.length === 0) return;

      mongoose.connect(process.env.MONGODB_URI);

      const db = mongoose.connection;

      db.on('error', (error) =>
        console.error('MongoDB connection error:', error),
      );
      db.once('open', async () => {
        console.log('Connected to MongoDB');
        const startTime = performance.now();
        console.log('Beginning data population');

        const operations = pokemonModelData.map(async (pokemon) => {
          const query = {
            pokeDexNo: pokemon.pokeDexNo,
            formId: pokemon.formId,
          };

          try {
            const existingPokemon = await AvailablePokemon.findOne(query);

            if (existingPokemon) {
              // Update existing Pokemon data
              existingPokemon.pokeDexNo = pokemon.pokeDexNo;
              existingPokemon.formId = pokemon.formId;
              existingPokemon.nameEN = pokemon.nameEN;
              existingPokemon.nameJP = pokemon.nameJP;
              existingPokemon.hasMegaEvolution = pokemon.hasMegaEvolution;
              existingPokemon.isRegional = pokemon.isRegional;
              existingPokemon.imageURL = pokemon.imageURL;

              await existingPokemon.save().catch((e) => {
                console.log(`Error saving updated data for ${pokemon.nameEN}`);
              });
            } else {
              // Create new Pokemon entry
              const newPokemon = new AvailablePokemon(pokemon);
              await newPokemon.save().catch((e) => {
                console.log(`Error inserting data for ${pokemon.nameEN}`);
              });
            }

            return true; // Indicate success for this iteration
          } catch (error) {
            console.log(
              `Error inserting/updating data for ${pokemon.nameEN}:`,
              error,
            );
            return false; // Indicate failure for this iteration
          }
        });

        try {
          await Promise.all(operations);

          const endTime = performance.now();
          console.log(
            `Data entry/updating finished in ${(endTime - startTime).toFixed(
              2,
            )}ms`,
          );

          db.close();
        } catch (allErrors) {
          console.error('Error with one or more operations:', allErrors);
          db.close();
        }
      });
    } catch (error) {
      console.error('Error:', error);
    }
  })();
}
