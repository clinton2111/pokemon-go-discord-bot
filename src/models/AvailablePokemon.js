const { Schema, model } = require('mongoose');

const availablePokemonSchema = new Schema(
  {
    pokeDexNo: {
      type: Number,
      required: true,
      default: 0,
    },
    formId: {
      type: String,
      required: true,
      default: null,
    },
    nameEN: {
      type: String,
      required: true,
      default: null,
    },
    nameJP: {
      type: String,
      required: true,
      default: null,
    },
    hasMegaEvolution: {
      type: Boolean,
      required: true,
      default: false,
    },
    isRegional: {
      type: Boolean,
      required: true,
      default: false,
    },
    imageURL: {
      type: String,
      required: false,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = model('availablePokemon', availablePokemonSchema);
