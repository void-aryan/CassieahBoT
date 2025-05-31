export const CROP_CONFIG = {
  MUTATIONS: [
    { name: "Wet", valueMultiplier: 2, chance: 0.1 },
    { name: "Gold", valueMultiplier: 1.5, chance: 0.05 },
    { name: "Disco", valueMultiplier: 2.25, chance: 0.02 },
    { name: "Shocked", valueMultiplier: 1.8, chance: 0.15 },
    { name: "Chilled", valueMultiplier: 1.6, chance: 0.1 },
    { name: "Bloodlit", valueMultiplier: 2.5, chance: 0.05 },
    { name: "Chocolate", valueMultiplier: 2.2, chance: 0.08 },
    { name: "Angry", valueMultiplier: 1.9, chance: 0.12 },
    { name: "Moonlit", valueMultiplier: 2.3, chance: 0.06 },
    { name: "Celestial", valueMultiplier: 2.4, chance: 0.04 },
    { name: "Chocolate", valueMultiplier: 2.1, chance: 0.07 },
  ],
  MBIAS: 5,
  GROWTH_BASE: 5 * 60 * 1000,
  OVERGROWTH_PENALTY: 1.5,
  LUCKY_HARVEST_CHANCE: 0.05,
  ACHIEVEMENTS: [
    { key: "harvest_100", name: "Harvest Master", harvests: 100, reward: 1000 },
    { key: "mutation_10", name: "Mutation Maniac", mutations: 10, reward: 500 },
    { key: "expand_1", name: "Land Baron", expansions: 1, reward: 2000 },
  ],
};
