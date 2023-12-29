import 'dotenv/config';

const TEST_SERVER_IDS = process.env.DEV_SERVER.split(', '),
  DEVELOPER_IDS = process.env.DEV_USERS.split(', '),
  ACTIVITY_STATUS = [
    'Running from a wild Poochyena',
    'Studying the woods with Treeko',
    'Playing with Mudkip',
    'Feeding Torchic some Poké snacks',
    'Littleroot town is home',
  ],
  MESSAGES = {
    DB_CONNECTION_SUCCESS: '✅ Connected to database',
    DB_CONNECTION_ERROR: '❌ Error: Could not connect to database',
    GENERIC_ERROR: '❌ Error in file',
  },
  APIS = {
    ALL_POKEMON_ENDPOINT:
      'https://pokemon-go-api.github.io/pokemon-go-api/api/pokedex.json',
  };

export { TEST_SERVER_IDS, DEVELOPER_IDS, ACTIVITY_STATUS, MESSAGES, APIS };
