const wholeMultipliers = [
  0, 0.094, 0.16639787, 0.21573247, 0.25572005, 0.29024988, 0.3210876, 0.34921268, 0.3752356, 0.39956728, 0.4225,
  0.44310755, 0.4627984, 0.48168495, 0.49985844, 0.51739395, 0.5343543, 0.5507927, 0.5667545, 0.5822789, 0.5974,
  0.6121573, 0.6265671, 0.64065295, 0.65443563, 0.667934, 0.6811649, 0.69414365, 0.7068842, 0.7193991, 0.7317,
  0.7377695, 0.74378943, 0.74976104, 0.7556855, 0.76156384, 0.76739717, 0.7731865, 0.77893275, 0.784637, 0.7903,
  0.79530001, 0.8003, 0.8053, 0.81029999, 0.81529999, 0.82029999, 0.82529999, 0.83029999, 0.83529999, 0.84029999,
];

const halfMultipliers = {
  1.5: 0.1351374318,
  2.5: 0.192650919,
  3.5: 0.2365726613,
  4.5: 0.2735303812,
  5.5: 0.3060573775,
  6.5: 0.3354450362,
  7.5: 0.3624577511,
  8.5: 0.387592416,
  9.5: 0.4111935514,
  10.5: 0.4329264091,
  11.5: 0.4530599591,
  12.5: 0.472336093,
  13.5: 0.4908558003,
  14.5: 0.508701765,
  15.5: 0.5259425113,
  16.5: 0.5426357375,
  17.5: 0.5588305862,
  18.5: 0.5745691333,
  19.5: 0.5898879072,
  20.5: 0.6048236651,
  21.5: 0.6194041216,
  22.5: 0.6336491432,
  23.5: 0.6475809666,
  24.5: 0.6612192524,
  25.5: 0.6745818959,
  26.5: 0.6876849038,
  27.5: 0.70054287,
  28.5: 0.7131691091,
  29.5: 0.7255756136,
  30.5: 0.7347410093,
  31.5: 0.7407855938,
  32.5: 0.7467812109,
  33.5: 0.7527290867,
  34.5: 0.7586303683,
  35.5: 0.7644860647,
  36.5: 0.7702972656,
  37.5: 0.7760649616,
  38.5: 0.7817900548,
  39.5: 0.7874736075,
  40.5: 0.792803968,
  41.5: 0.797800015,
  42.5: 0.802799995,
  43.5: 0.8078,
  44.5: 0.812799985,
  45.5: 0.81779999,
  46.5: 0.82279999,
  47.5: 0.82779999,
  48.5: 0.83279999,
  49.5: 0.83779999,
  50.5: 0.84279999,
};

const calculateMultiplier = (level) => {
  if (level < 1 || level > 50.5) return false;

  if (Number.isInteger(level)) {
    return wholeMultipliers[level] || false;
  } else {
    return halfMultipliers[level] || false;
  }
};

const calculateCP = (
  baseAttack,
  baseDefence,
  baseStamina,
  level = 50,
  { ivAttack = 15, ivDefence = 15, ivStamina = 15 } = {},
) => {
  const multiplier = calculateMultiplier(level);
  if (!multiplier) return false;

  let cp =
    (Math.sqrt(baseDefence + ivDefence) *
      Math.sqrt(baseStamina + ivStamina) *
      Math.pow(multiplier, 2) *
      (baseAttack + ivAttack)) /
    10;

  return Math.floor(cp); // Round down to the nearest whole number
};

export const calculateNotableCPValues = (baseAttack, baseDefence, baseStamina) => {
  // Max CP
  const maxCP = calculateCP(baseAttack, baseDefence, baseStamina, 50);

  // Research Encounters
  const research = {
    min: calculateCP(baseAttack, baseDefence, baseStamina, 15, {
      ivAttack: 10,
      ivDefence: 10,
      ivStamina: 10,
    }),
    max: calculateCP(baseAttack, baseDefence, baseStamina, 15),
  };

  // Raids & Eggs
  const raids = {
    min: calculateCP(baseAttack, baseDefence, baseStamina, 20, {
      ivAttack: 10,
      ivDefence: 10,
      ivStamina: 10,
    }),
    max: calculateCP(baseAttack, baseDefence, baseStamina, 20),
    minWB: calculateCP(baseAttack, baseDefence, baseStamina, 25, {
      ivAttack: 10,
      ivDefence: 10,
      ivStamina: 10,
    }),
    maxWB: calculateCP(baseAttack, baseDefence, baseStamina, 25),
  };

  // Rocket Grunts
  const rocketGrunts = {
    gruntMin: calculateCP(baseAttack, baseDefence, baseStamina, 8, {
      ivAttack: 0,
      ivDefence: 0,
      ivStamina: 0,
    }),
    gruntMax: calculateCP(baseAttack, baseDefence, baseStamina, 8),
    gruntMinWB: calculateCP(baseAttack, baseDefence, baseStamina, 13, {
      ivAttack: 0,
      ivDefence: 0,
      ivStamina: 0,
    }),
    gruntMaxWB: calculateCP(baseAttack, baseDefence, baseStamina, 13),
  };

  // Shadow Raids
  const shadowRaids = {
    min: calculateCP(baseAttack, baseDefence, baseStamina, 20, {
      ivAttack: 6,
      ivDefence: 6,
      ivStamina: 6,
    }),
    max: calculateCP(baseAttack, baseDefence, baseStamina, 20),
    minWB: calculateCP(baseAttack, baseDefence, baseStamina, 25, {
      ivAttack: 6,
      ivDefence: 6,
      ivStamina: 6,
    }),
    maxWB: calculateCP(baseAttack, baseDefence, baseStamina, 25),
  };

  return {
    maxCP,
    research,
    raids,
    rocketGrunts,
    shadowRaids,
    eggs: {
      min: raids.min,
      max: raids.max,
    },
  };
};
