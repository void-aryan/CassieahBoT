import { CROP_CONFIG } from "@cass-modules/GardenConfig";

export const EVENT_CONFIG = {
  WEEKLY_CYCLE: 7 * 24 * 60 * 60 * 1000,
  WEATHER_CYCLE: 1 * 60 * 60 * 1000,
  // LONG ASF
  EVENT_CYCLE: 4 * 60 * 60 * 1000,
  EVENTS: [
    {
      name: "In Construction",
      icon: "🏗️",
      shopName: undefined,
      shopName2: undefined,
      shopAlias: [],
      isNoEvent: true,
      effect: {
        mutationChance: 0,
        growthMultiplier: 1,
        mutationType: undefined,
      },
      shopItems: [],
    },
  ],
  EVENTS_CONSTRUCTION: [
    {
      name: "No Event",
      icon: "🌱",
      isNoEvent: true,
      effect: {
        mutationChance: 0.1,
        growthMultiplier: 1,
      },
      shopItems: [],
    },
    {
      name: "Cherry Blossom Event",
      icon: "🌸🩷",
      shopName: "Blossom Seed Shop",
      shopName2: "Cherry Market",
      shopAlias: ["cherryshop", "blossom"],
      effect: {
        mutationChance: 0.3,
        growthMultiplier: 1.4,
        mutationType: "Bloom",
      },
      shopItems: [
        {
          icon: "🌷",
          name: "Cherry Tulip Seed",
          key: "gsCherryTulip",
          flavorText:
            "A bright, cup-shaped flower with smooth petals and a tall, slender stem, often seen in vibrant spring colors like red, yellow, and pink.",
          price: 10_500,
          rarity: "Common",
          stockLimit: 25,
          stockChance: 1.0,
          inStock: true,
          onPurchase({ moneySet }) {
            moneySet.inventory.push({
              key: "gsCherryTulip",
              name: "Cherry Tulip Seed",
              flavorText:
                "Delicate pink or white flowers that bloom in clusters on tree branches, signaling the arrival of spring.",
              icon: "🌷",
              type: "gardenSeed",
              sellPrice: 1_250,
              cropData: {
                baseValue: 3_000,
                growthTime: CROP_CONFIG.GROWTH_BASE * 1.5,
                harvests: 5,
              },
            });
          },
        },
        {
          icon: "🪷",
          name: "Cherry Lotus Seed",
          key: "gsCherryLotus",
          flavorText:
            "A large, round flower with smooth petals that floats gracefully on the water's surface.",
          price: 30_000,
          rarity: "Uncommon",
          stockLimit: 20,
          stockChance: 0.9,
          inStock: true,
          onPurchase({ moneySet }) {
            moneySet.inventory.push({
              key: "gsCherryLotus",
              name: "Cherry Lotus Seed",
              flavorText:
                "A water flower with broad petals and a central seed pod, often seen resting on lily pads.",
              icon: "🪷",
              type: "gardenSeed",
              sellPrice: 4_000,
              cropData: {
                baseValue: 6_500,
                growthTime: CROP_CONFIG.GROWTH_BASE * 2.5,
                harvests: 5,
              },
            });
          },
        },
        {
          icon: "🌺",
          name: "Blossom Hibiscus Seed",
          key: "gsBlossomHibiscus",
          flavorText:
            "A bold, tropical flower with large trumpet-shaped petals and a long, protruding stamen.",
          price: 100_000,
          rarity: "Rare",
          stockLimit: 5,
          stockChance: 0.7,
          inStock: true,
          onPurchase({ moneySet }) {
            moneySet.inventory.push({
              key: "gsBlossomHibiscus",
              name: "Blossom Hibiscus Seed",
              flavorText:
                "A vibrant bloom with wide, delicate petals and a striking central column, often found in warm, sunny places.",
              icon: "🌺",
              type: "gardenSeed",
              sellPrice: 14_000,
              cropData: {
                baseValue: 20_000,
                growthTime: CROP_CONFIG.GROWTH_BASE * 3.5,
                harvests: 6,
              },
            });
          },
        },
        {
          icon: "🏵️",
          name: "Rosette Seed",
          key: "gsRosette",
          flavorText:
            "A circular floral design with layered petals, often used as a decorative or celebratory symbol.",
          price: 600_000,
          rarity: "Legendary",
          stockLimit: 7,
          stockChance: 0.2,
          inStock: true,
          onPurchase({ moneySet }) {
            moneySet.inventory.push({
              key: "gsRosette",
              name: "Rosette Seed",
              flavorText:
                "A stylized bloom with symmetrical, rounded petals arranged in a neat, spiral-like pattern.",
              icon: "🏵️",
              type: "gardenSeed",
              sellPrice: 50_000,
              cropData: {
                baseValue: 80_000,
                growthTime: CROP_CONFIG.GROWTH_BASE * 5,
                harvests: 8,
              },
            });
          },
        },
        {
          icon: "💮",
          name: "White Flower Seed",
          key: "gsWhiteFlower",
          flavorText:
            "A soft pink blossom with delicate petals in a circular bloom.",
          price: 4_000_000,
          rarity: "Mythical",
          stockLimit: 5,
          stockChance: 0.07,
          inStock: true,
          onPurchase({ moneySet }) {
            moneySet.inventory.push({
              key: "gsWhiteFlower",
              name: "White Flower Seed",
              flavorText:
                "A floral symbol with a gentle glow, styled like a perfect seal of approval.",
              icon: "💮",
              type: "gardenSeed",
              sellPrice: 250_000,
              cropData: {
                baseValue: 500_000,
                growthTime: CROP_CONFIG.GROWTH_BASE * 10,
                harvests: 10,
              },
            });
          },
        },
        {
          icon: "🌸🩷",
          name: "Jane Blossom Seed",
          key: "gsJaneBlossom",
          flavorText:
            "A delicate flower with soft pink petals that bloom in clusters on tree branches.",
          price: 9_000_000,
          rarity: "Divine",
          stockLimit: 3,
          stockChance: 0.05,
          inStock: true,
          onPurchase({ moneySet }) {
            moneySet.inventory.push({
              key: "gsJaneBlossom",
              name: "Jane Blossom Seed",
              flavorText:
                "Soft petals like pale confetti cover the branches, blooming all at once and falling just as quickly—a quiet celebration of spring’s gentle touch.",
              icon: "🌸🩷",
              type: "gardenSeed",
              sellPrice: 1_000_000,
              cropData: {
                baseValue: 1_000_000,
                growthTime: CROP_CONFIG.GROWTH_BASE * 15,
                harvests: 10,
              },
            });
          },
        },
      ],
    },

    {
      name: "Relapse Event",
      icon: "🥀💔",
      timeStart: (12 + 10) * 60 * 60 * 1000,
      timeEnd: 4 * 60 * 60 * 1000,
      shopName: "relapseshop",
      shopName2: "Batak Mag Relapse Shop",
      shopAlias: ["rshop", "relapse", "rsh"],
      effect: {
        mutationChance: 0.25,
        growthMultiplier: 2.5,
        mutationType: "Relapsed",
      },
      shopItems: [
        {
          icon: "🌸",
          name: "Ben&Petal",
          key: "gsBenPetal",
          flavorText: "A delicate flower duo that blooms in harmony.",
          price: 2500,
          rarity: "Common",
          stockLimit: 20,
          stockChance: 1,
          inStock: true,
          onPurchase({ moneySet }) {
            moneySet.inventory.push({
              key: "gsBenPetal",
              name: "Ben&Petal",
              flavorText: "A delicate flower duo that blooms in harmony.",
              icon: "🌸",
              type: "gardenSeed",
              sellPrice: 1250,
              cropData: {
                baseValue: 2000,
                growthTime: CROP_CONFIG.GROWTH_BASE * 2,
                harvests: 3,
              },
            });
          },
        },
        {
          icon: "🍇",
          name: "Di na Muliberry",
          key: "gsMuliberry",
          flavorText: "A bittersweet berry that lingers on the vine.",
          price: 5000,
          stockLimit: 20,
          rarity: "Uncommon",
          stockChance: 1,
          inStock: true,
          onPurchase({ moneySet }) {
            moneySet.inventory.push({
              key: "gsMuliberry",
              name: "Di na Muliberry",
              flavorText: "A bittersweet berry that lingers on the vine.",
              icon: "🍇",
              type: "gardenSeed",
              sellPrice: 2500,
              cropData: {
                baseValue: 2_000,
                growthTime: CROP_CONFIG.GROWTH_BASE * 3,
                harvests: 4,
              },
            });
          },
        },
        {
          icon: "🌿",
          name: "Magbalikweed",
          key: "gsMagbalikweed",
          flavorText: "A resilient herb that always finds its way back.",
          price: 10_000,
          rarity: "Uncommon",
          stockLimit: 20,

          stockChance: 1,
          inStock: true,
          onPurchase({ moneySet }) {
            moneySet.inventory.push({
              key: "gsMagbalikweed",
              name: "Magbalikweed",
              flavorText: "A resilient herb that always finds its way back.",
              icon: "🌿",
              type: "gardenSeed",
              sellPrice: 5000,
              cropData: {
                baseValue: 5_000,
                growthTime: CROP_CONFIG.GROWTH_BASE * 4,
                harvests: 5,
              },
            });
          },
        },
        {
          icon: "🌺",
          name: "Pagsamunngo",
          key: "gsPagsamunngo",
          stockLimit: 20,

          flavorText: "A vibrant flower symbolizing reunion.",
          price: 50_000,
          rarity: "Rare",
          stockChance: 0.5,
          inStock: true,
          onPurchase({ moneySet }) {
            moneySet.inventory.push({
              key: "gsPagsamunngo",
              name: "Pagsamunngo",
              flavorText: "A vibrant flower symbolizing reunion.",
              icon: "🌺",
              type: "gardenSeed",
              sellPrice: 25_000,
              cropData: {
                baseValue: 10_000,
                growthTime: CROP_CONFIG.GROWTH_BASE * 5,
                harvests: 8,
              },
            });
          },
        },
        {
          icon: "🌱",
          name: "Binhi mo lang ako",
          key: "gsBinhi",
          flavorText: "A humble seed with untapped potential.",
          price: 100_000,
          stockLimit: 12,

          rarity: "Rare",
          stockChance: 0.35,
          inStock: true,
          onPurchase({ moneySet }) {
            moneySet.inventory.push({
              key: "gsBinhi",
              name: "Binhi mo lang ako",
              flavorText: "A humble seed with untapped potential.",
              icon: "🌱",
              type: "gardenSeed",
              sellPrice: 50_000,
              cropData: {
                baseValue: 20_000,
                growthTime: CROP_CONFIG.GROWTH_BASE * 6,
                harvests: 8,
              },
            });
          },
        },
        {
          icon: "🍃",
          name: "Kathang Leafip",
          key: "gsLeafip",
          stockLimit: 12,

          flavorText: "A mythical leaf woven from stories.",
          price: 250_000,
          rarity: "Legendary",
          stockChance: 0.5,
          inStock: true,
          onPurchase({ moneySet }) {
            moneySet.inventory.push({
              key: "gsLeafip",
              name: "Kathang Leafip",
              flavorText: "A mythical leaf woven from stories.",
              icon: "🍃",
              type: "gardenSeed",
              sellPrice: 125_000,
              cropData: {
                baseValue: 50_000,
                growthTime: CROP_CONFIG.GROWTH_BASE * 7,
                harvests: 8,
              },
            });
          },
        },
        {
          icon: "🧅",
          name: "Allium Too Well",
          key: "gsAllium",
          flavorText: "An onion that brings tears of nostalgia.",
          price: 500_000,
          stockLimit: 5,

          rarity: "Legendary",
          stockChance: 0.25,
          inStock: true,
          onPurchase({ moneySet }) {
            moneySet.inventory.push({
              key: "gsAllium",
              name: "Allium Too Well",
              flavorText: "An onion that brings tears of nostalgia.",
              icon: "🧅",
              type: "gardenSeed",
              sellPrice: 250_000,
              cropData: {
                baseValue: 700_000,
                growthTime: CROP_CONFIG.GROWTH_BASE * 8,
                harvests: 1,
              },
            });
          },
        },
        {
          icon: "🌷",
          name: "Lavendeja Vu",
          key: "gsLavendeja",
          flavorText: "A lavender with a hauntingly familiar scent.",
          price: 1_000_000,
          stockLimit: 9,

          rarity: "Legendary",
          stockChance: 0.09,
          inStock: true,
          onPurchase({ moneySet }) {
            moneySet.inventory.push({
              key: "gsLavendeja",
              name: "Lavendeja Vu",
              flavorText: "A lavender with a hauntingly familiar scent.",
              icon: "🌷",
              type: "gardenSeed",
              sellPrice: 500_000,
              cropData: {
                baseValue: 100_000,
                growthTime: CROP_CONFIG.GROWTH_BASE * 9,
                harvests: 18,
              },
            });
          },
        },
        {
          icon: "☘️",
          name: "When I was your clover",
          key: "gsClover",
          stockLimit: 20,

          flavorText: "A four-leaf clover of past promises.",
          price: 2_500_000,
          rarity: "Mythical",
          stockChance: 0.07,
          inStock: true,
          onPurchase({ moneySet }) {
            moneySet.inventory.push({
              key: "gsClover",
              name: "When I was your clover",
              flavorText: "A four-leaf clover of past promises.",
              icon: "☘️",
              type: "gardenSeed",
              sellPrice: 1_250_000,
              cropData: {
                baseValue: 500_000,
                growthTime: CROP_CONFIG.GROWTH_BASE * 10,
                harvests: 9,
              },
            });
          },
        },
        {
          icon: "🌿✨",
          name: "Enchanmint",
          key: "gsEnchanmint",
          stockLimit: 5,

          flavorText: "A magical mint that captivates the senses.",
          price: 5_000_000,
          rarity: "Mythical",
          stockChance: 0.08,
          inStock: true,
          onPurchase({ moneySet }) {
            moneySet.inventory.push({
              key: "gsEnchanmint",
              name: "Enchanmint",
              flavorText: "A magical mint that captivates the senses.",
              icon: "🌿✨",
              type: "gardenSeed",
              sellPrice: 2_500_000,
              cropData: {
                baseValue: 500_000,
                growthTime: CROP_CONFIG.GROWTH_BASE * 11,
                harvests: 25,
              },
            });
          },
        },
        {
          icon: "🌱",
          name: "Kathang Sitaw",
          key: "gsSitaw",
          stockLimit: 12,

          flavorText: "A string bean spun from tales of fate.",
          price: 10_000_000,
          rarity: "Divine",
          stockChance: 0.08,
          inStock: true,
          onPurchase({ moneySet }) {
            moneySet.inventory.push({
              key: "gsSitaw",
              name: "Kathang Sitaw",
              flavorText: "A string bean spun from tales of fate.",
              icon: "🌱",
              type: "gardenSeed",
              sellPrice: 5_000_000,
              cropData: {
                baseValue: 1_000_000,
                growthTime: CROP_CONFIG.GROWTH_BASE * 12,
                harvests: 30,
              },
            });
          },
        },
        {
          icon: "🌸💫",
          name: "Pinagtagpo, Pero Hindi Tinanamin",
          key: "gsPinagtagpo",
          flavorText: "The rarest bloom of destined but unplanted love.",
          price: 50_000_000,
          rarity: "Divine",
          stockLimit: 5,

          stockChance: 0.08,
          inStock: true,
          onPurchase({ moneySet }) {
            moneySet.inventory.push({
              key: "gsPinagtagpo",
              name: "Pinagtagpo, Pero Hindi Tinanamin",
              flavorText: "The rarest bloom of destined but unplanted love.",
              icon: "🌸💫",
              type: "gardenSeed",
              sellPrice: 25_000_000,
              cropData: {
                baseValue: 4_000_000,
                growthTime: CROP_CONFIG.GROWTH_BASE * 15,
                harvests: 40,
              },
            });
          },
        },
      ],
    },
    {
      name: "Frost",
      icon: "❄️",
      effect: {
        mutationChance: 0.3,
        growthMultiplier: 0.9,
        mutationType: "Chilled",
      },
      shopItems: [],
    },
    {
      name: "Astral Festival",
      icon: "✨🌌",
      shopName: "astralshop",
      shopName2: "Stellar Caravan Shop",
      shopAlias: ["ash", "astral", "starshop"],
      effect: {
        mutationChance: 0.35,
        growthMultiplier: 1.4,
        mutationType: "Astral",
      },
      shopItems: [
        {
          icon: "🌠",
          name: "Stellar Sprout Seed",
          key: "gsStellarSprout",
          flavorText: "A glowing sprout born under a cosmic sky.",
          price: 5_000,
          rarity: "Common",
          stockLimit: 20,
          stockChance: 1.0,
          inStock: true,
          onPurchase({ moneySet }) {
            moneySet.inventory.push({
              key: "gsStellarSprout",
              name: "Stellar Sprout Seed",
              flavorText: "A glowing sprout born under a cosmic sky.",
              icon: "🌠",
              type: "gardenSeed",
              sellPrice: 2_500,
              cropData: {
                baseValue: 4_000,
                growthTime: CROP_CONFIG.GROWTH_BASE * 8,
                harvests: 2,
              },
            });
          },
        },
        {
          icon: "🌟",
          name: "Cosmo Petal Seed",
          key: "gsCosmoPetal",
          flavorText: "A radiant flower that mirrors distant galaxies.",
          price: 15_000,
          rarity: "Uncommon",
          stockLimit: 18,
          stockChance: 1,
          inStock: true,
          onPurchase({ moneySet }) {
            moneySet.inventory.push({
              key: "gsCosmoPetal",
              name: "Cosmo Petal Seed",
              flavorText: "A radiant flower that mirrors distant galaxies.",
              icon: "🌟",
              type: "gardenSeed",
              sellPrice: 7_500,
              cropData: {
                baseValue: 12_000,
                growthTime: CROP_CONFIG.GROWTH_BASE * 8,
                harvests: 2,
              },
            });
          },
        },
        {
          icon: "🪐",
          name: "Nebula Fruit Seed",
          key: "gsNebulaFruit",
          flavorText: "A juicy fruit infused with stardust.",
          price: 50_000,
          rarity: "Rare",
          stockLimit: 15,
          stockChance: 0.6,
          inStock: true,
          onPurchase({ moneySet }) {
            moneySet.inventory.push({
              key: "gsNebulaFruit",
              name: "Nebula Fruit Seed",
              flavorText: "A juicy fruit infused with stardust.",
              icon: "🪐",
              type: "gardenSeed",
              sellPrice: 25_000,
              cropData: {
                baseValue: 40_000,
                growthTime: CROP_CONFIG.GROWTH_BASE * 8,
                harvests: 2,
              },
            });
          },
        },
        {
          icon: "💫",
          name: "Aether Bloom Seed",
          key: "gsAetherBloom",
          flavorText: "A rare flower that pulses with cosmic energy.",
          price: 200_000,
          rarity: "Legendary",
          stockLimit: 10,
          stockChance: 0.3,
          inStock: true,
          onPurchase({ moneySet }) {
            moneySet.inventory.push({
              key: "gsAetherBloom",
              name: "Aether Bloom Seed",
              flavorText: "A rare flower that pulses with cosmic energy.",
              icon: "💫",
              type: "gardenSeed",
              sellPrice: 100_000,
              cropData: {
                baseValue: 150_000,
                growthTime: CROP_CONFIG.GROWTH_BASE * 8,
                harvests: 2,
              },
            });
          },
        },
        {
          icon: "🌌",
          name: "Starweave Vine Seed",
          key: "gsStarweaveVine",
          flavorText: "A divine vine that connects the stars.",
          price: 1_000_000,
          rarity: "Mythical",
          stockLimit: 5,
          stockChance: 0.05,
          inStock: true,
          onPurchase({ moneySet }) {
            moneySet.inventory.push({
              key: "gsStarweaveVine",
              name: "Starweave Vine Seed",
              flavorText: "A divine vine that connects the stars.",
              icon: "🌌",
              type: "gardenSeed",
              sellPrice: 500_000,
              cropData: {
                baseValue: 800_000,
                growthTime: CROP_CONFIG.GROWTH_BASE * 10,
                harvests: 2,
              },
            });
          },
        },
        {
          icon: "☄️",
          name: "Comet Shard Seed",
          key: "gsCometShard",
          flavorText: "A celestial seed that blazes with astral power.",
          price: 5_000_000,
          rarity: "Divine",
          stockLimit: 3,
          stockChance: 0.02,
          inStock: true,
          onPurchase({ moneySet }) {
            moneySet.inventory.push({
              key: "gsCometShard",
              name: "Comet Shard Seed",
              flavorText: "A celestial seed that blazes with astral power.",
              icon: "☄️",
              type: "gardenSeed",
              sellPrice: 2_500_000,
              cropData: {
                baseValue: 4_000_000,
                growthTime: CROP_CONFIG.GROWTH_BASE * 12,
                harvests: 2,
              },
            });
          },
        },
        {
          icon: "🦋",
          name: "Stellar Butterfly",
          key: "gpStellarButterfly",
          flavorText: "A cosmic pet that flutters through starlight.",
          price: 20_000_000,
          rarity: "Rare",
          stockLimit: 1,
          stockChance: 0.3,
          inStock: true,
          onPurchase({ moneySet }) {
            moneySet.inventory.push({
              key: "gpStellarButterfly",
              name: "Stellar Butterfly",
              flavorText: "Caged pet. Uncage to dig up Astral seeds!",
              icon: "🦋",
              type: "gardenPetCage",
              sellPrice: 10_000_000,
              petData: {
                name: "Stellar Butterfly",
                collectionRate: 0.15,
                seedTypes: ["gsStellarSprout", "gsCosmoPetal", "gsNebulaFruit"],
              },
            });
          },
        },
        {
          icon: "🦅",
          name: "Astral Hawk",
          key: "gpAstralHawk",
          flavorText: "A majestic pet soaring through the cosmos.",
          price: 30_500_000,
          rarity: "Legendary",
          stockLimit: 1,
          stockChance: 0.1,
          inStock: true,
          onPurchase({ moneySet }) {
            moneySet.inventory.push({
              key: "gpAstralHawk",
              name: "Astral Hawk",
              flavorText: "Caged pet. Uncage to dig up Astral seeds!",
              icon: "🦅",
              type: "gardenPetCage",
              sellPrice: 10_750_000,
              petData: {
                name: "Astral Hawk",
                collectionRate: 0.2,
                seedTypes: ["gsAetherBloom", "gsStarweaveVine"],
              },
            });
          },
        },
        {
          icon: "🦁🌌",
          name: "Cosmic Lion",
          key: "gpCosmicLion",
          flavorText: "A divine pet that roars with stellar might.",
          price: 60_000_000,
          rarity: "Mythical",
          stockLimit: 1,
          stockChance: 0.1,
          inStock: true,
          onPurchase({ moneySet }) {
            moneySet.inventory.push({
              key: "gpCosmicLion",
              name: "Cosmic Lion",
              flavorText: "Caged pet. Uncage to dig up Astral seeds!",
              icon: "🦁🌌",
              type: "gardenPetCage",
              sellPrice: 30_000_000,
              petData: {
                name: "Cosmic Lion",
                collectionRate: 0.25,
                seedTypes: ["gsStarweaveVine", "gsCometShard"],
              },
            });
          },
        },
        {
          icon: "🔭",
          name: "Astral Lens",
          key: "gtAstralLens",
          flavorText: "Enhances Astral mutations for cosmic crops.",
          price: 10_500_000,
          rarity: "Rare",
          stockLimit: 1,
          stockChance: 0.4,
          inStock: true,
          onPurchase({ moneySet }) {
            moneySet.inventory.push({
              key: "gtAstralLens",
              name: "Astral Lens",
              flavorText: "Enhances Astral mutations for cosmic crops.",
              icon: "🔭",
              type: "gardenTool",
              sellPrice: 750_000,
              toolData: {
                growthMultiplier: 1.3,
                mutationChance: { Astral: 0.3 },
              },
            });
          },
        },
        {
          icon: "✨",
          name: "Starlight Dust",
          key: "gtStarlightDust",
          flavorText: "Boosts growth speed for crops.",
          price: 5_000_000,
          rarity: "Uncommon",
          stockLimit: 5,
          stockChance: 0.6,
          inStock: true,
          onPurchase({ moneySet }) {
            moneySet.inventory.push({
              key: "gtStarlightDust",
              name: "Starlight Dust",
              flavorText: "Boosts growth speed for crops.",
              icon: "✨",
              type: "gardenTool",
              sellPrice: 250_000,
              toolData: {
                growthMultiplier: 1.5,
              },
            });
          },
        },
      ],
    },

    {
      name: "Thunderstorm",
      icon: "⛈️",
      effect: {
        mutationChance: 0.1,
        growthMultiplier: 1.5,
        mutationType: "Shocked",
      },
      shopItems: [],
    },

    {
      name: "Easter Event 2025",
      icon: "🐣",
      shopName: "eastershop",
      shopName2: "Poppy's Easter Shop",
      shopAlias: ["easter", "eash"],
      effect: {
        mutationChance: 0.3,
        growthMultiplier: 1.2,
        mutationType: "Chocolate",
      },
      shopItems: [
        {
          icon: "🍫",
          name: "Chocolate Carrot Seed",
          key: "gsChocoCarrot",
          flavorText: "A sweet carrot from the Easter Event!",
          price: 10_000,
          stockLimit: 20,

          rarity: "Common",
          stockChance: 1.0,
          inStock: true,
          onPurchase({ moneySet }) {
            moneySet.inventory.push({
              key: "gsChocoCarrot",
              name: "Chocolate Carrot Seed",
              flavorText: "A sweet carrot from the Easter Event.",
              icon: "🍫",
              type: "gardenSeed",
              sellPrice: 100,
              cropData: {
                baseValue: 16_500,
                growthTime: CROP_CONFIG.GROWTH_BASE * 0.5,
                harvests: 1,
              },
            });
          },
        },
        {
          icon: "🍭",
          name: "Red Lollipop Seed",
          key: "gsRedLollipop",
          flavorText: "A sugary treat from the Easter Event.",
          price: 45_000,
          rarity: "Uncommon",
          stockLimit: 18,

          stockChance: 0.5,
          inStock: true,
          onPurchase({ moneySet }) {
            moneySet.inventory.push({
              key: "gsRedLollipop",
              name: "Red Lollipop Seed",
              flavorText: "A sugary treat from the Easter Event.",
              icon: "🍭",
              type: "gardenSeed",
              sellPrice: 250,
              cropData: {
                baseValue: 70_000,
                growthTime: CROP_CONFIG.GROWTH_BASE * 2,
                harvests: 1,
              },
            });
          },
        },
        {
          icon: "🌻",
          name: "Candy Sunflower Seed",
          key: "gsCandySunflower",
          flavorText: "A radiant flower from the Easter Event.",
          price: 75_000,
          stockLimit: 14,
          rarity: "Rare",
          stockChance: 0.5,
          inStock: true,
          onPurchase({ moneySet }) {
            moneySet.inventory.push({
              key: "gsCandySunflower",
              name: "Candy Sunflower Seed",
              flavorText: "A radiant flower from the Easter Event.",
              icon: "🌻",
              type: "gardenSeed",
              sellPrice: 600,
              cropData: {
                baseValue: 145_000,
                growthTime: CROP_CONFIG.GROWTH_BASE * 2.5,
                harvests: 1,
              },
            });
          },
        },
        {
          icon: "🥚",
          name: "Easter Egg Seed",
          key: "gsEasterEgg",
          flavorText: "A festive egg from the Easter Event.",
          price: 500_000,
          rarity: "Legendary",
          stockChance: 0.3,
          stockLimit: 7,

          inStock: true,
          onPurchase({ moneySet }) {
            moneySet.inventory.push({
              key: "gsEasterEgg",
              name: "Easter Egg Seed",
              flavorText: "A festive egg from the Easter Event.",
              icon: "🥚",
              type: "gardenSeed",
              sellPrice: 1500,
              cropData: {
                baseValue: 60_000,
                growthTime: CROP_CONFIG.GROWTH_BASE * 3,
                harvests: 10,
              },
            });
          },
        },
        {
          icon: "🌸",
          name: "Candy Blossom Seed",
          key: "gsCandyBlossom",
          flavorText: "A divine bloom from the Easter Event.",
          price: 10_000_000,
          rarity: "Divine",
          stockLimit: 5,

          stockChance: 0.04,
          inStock: true,
          onPurchase({ moneySet }) {
            moneySet.inventory.push({
              key: "gsCandyBlossom",
              name: "Candy Blossom Seed",
              flavorText: "A divine bloom from the Easter Event.",
              icon: "🌸",
              type: "gardenSeed",
              sellPrice: 3000,
              cropData: {
                baseValue: 1_200_000,
                growthTime: CROP_CONFIG.GROWTH_BASE * 11,
                harvests: 12,
              },
            });
          },
        },
        {
          icon: "🍫💦",
          name: "Chocolate Sprinkler",
          key: "gtChocoSprinkler",
          flavorText: "Boosts Chocolate mutations for Easter crops.",
          price: 1_000_000,
          stockLimit: 1,

          rarity: "Rare",
          stockChance: 0.4,
          inStock: true,
          onPurchase({ moneySet }) {
            moneySet.inventory.push({
              key: "gtChocoSprinkler",
              name: "Chocolate Sprinkler",
              flavorText: "Boosts Chocolate mutations for Easter crops.",
              icon: "🍫💦",
              type: "gardenTool",
              sellPrice: 500,
              toolData: {
                growthMultiplier: 1.2,
                mutationChance: { Chocolate: 0.3 },
              },
            });
          },
        },
      ],
    },
    {
      name: "Angry Plant Event",
      icon: "🌿😣",
      shopName2: "Angry Shop",
      shopName: "angryshop",
      shopAlias: ["ashop", "angshop", "angry"],
      effect: {
        growthMultiplier: 1.1,
      },
      shopItems: [
        // {
        //   icon: "🪷",
        //   name: "Lotus Seed",
        //   key: "gsLotus",
        //   flavorText: "A rare seed available during Angry Plant Event!",
        //   price: 500,
        //   rarity: "Divine",
        //   stockChance: 0.1,
        //   inStock: true,
        //   onPurchase({ moneySet }) {
        //     moneySet.inventory.push({
        //       key: "gsLotus",
        //       name: "Lotus Seed",
        //       flavorText: "A rare seed from Angry Plant Event.",
        //       icon: "🪷",
        //       type: "gardenSeed",
        //       sellPrice: 250,
        //       cropData: {
        //         baseValue: 1000,
        //         growthTime: CROP_CONFIG.GROWTH_BASE * 3,
        //         harvests: 1,
        //       },
        //     });
        //   },
        // },
        {
          icon: "🍒",
          name: "Cranberry Seed",
          key: "gsCranberry",
          flavorText: "A tart fruit from the Angry Plant Event.",
          price: 3500,
          rarity: "Legendary",
          stockChance: 0.3,
          inStock: true,
          stockLimit: 20,

          onPurchase({ moneySet }) {
            moneySet.inventory.push({
              key: "gsCranberry",
              name: "Cranberry Seed",
              flavorText: "A tart fruit from the Angry Plant Event.",
              icon: "🍒",
              type: "gardenSeed",
              sellPrice: 1750,
              cropData: {
                baseValue: 7000,
                growthTime: CROP_CONFIG.GROWTH_BASE * 3.5,
                harvests: 2,
              },
            });
          },
        },
        {
          icon: "🥭",
          name: "Durian Seed",
          key: "gsDurian",
          flavorText: "A pungent fruit from the Angry Plant Event.",
          price: 4000,
          rarity: "Legendary",
          stockLimit: 20,

          stockChance: 0.25,
          inStock: true,
          onPurchase({ moneySet }) {
            moneySet.inventory.push({
              key: "gsDurian",
              name: "Durian Seed",
              flavorText: "A pungent fruit from the Angry Plant Event.",
              icon: "🥭",
              type: "gardenSeed",
              sellPrice: 2000,
              cropData: {
                baseValue: 8000,
                growthTime: CROP_CONFIG.GROWTH_BASE * 3.5,
                harvests: 2,
              },
            });
          },
        },
        {
          icon: "🍆",
          name: "Eggplant Seed",
          key: "gsEggplant",
          flavorText: "A versatile veggie from the Angry Plant Event.",
          price: 5000,
          stockLimit: 7,

          rarity: "Mythical",
          stockChance: 0.2,
          inStock: true,
          onPurchase({ moneySet }) {
            moneySet.inventory.push({
              key: "gsEggplant",
              name: "Eggplant Seed",
              flavorText: "A versatile veggie from the Angry Plant Event.",
              icon: "🍆",
              type: "gardenSeed",
              sellPrice: 2500,
              cropData: {
                baseValue: 10000,
                growthTime: CROP_CONFIG.GROWTH_BASE * 4,
                harvests: 2,
              },
            });
          },
        },
        {
          icon: "🪷",
          name: "Lotus Seed",
          key: "gsLotus",
          flavorText: "A serene flower from the Angry Plant Event.",
          price: 60_000,
          stockLimit: 12,

          rarity: "Divine",
          stockChance: 0.15,
          inStock: true,
          onPurchase({ moneySet }) {
            moneySet.inventory.push({
              key: "gsLotus",
              name: "Lotus Seed",
              flavorText: "A serene flower from the Angry Plant Event.",
              icon: "🪷",
              type: "gardenSeed",
              sellPrice: 3000,
              cropData: {
                baseValue: 20_000,
                growthTime: CROP_CONFIG.GROWTH_BASE * 4,
                harvests: 5,
              },
            });
          },
        },
        {
          icon: "🪴",
          name: "Venus Fly Trap Seed",
          key: "gsVenusFlyTrap",
          flavorText: "A carnivorous plant from the Angry Plant Event.",
          price: 6500,
          stockLimit: 12,

          rarity: "Divine",
          stockChance: 0.1,
          inStock: true,
          onPurchase({ moneySet }) {
            moneySet.inventory.push({
              key: "gsVenusFlyTrap",
              name: "Venus Fly Trap Seed",
              flavorText: "A carnivorous plant from the Angry Plant Event.",
              icon: "🪴",
              type: "gardenSeed",
              sellPrice: 3250,
              cropData: {
                baseValue: 17000,
                growthTime: CROP_CONFIG.GROWTH_BASE * 4.5,
                harvests: 1,
              },
            });
          },
        },
        // {
        //   icon: "🌱",
        //   name: "Basic Seed Pack",
        //   key: "gtBasicSeedPack",
        //   flavorText: "A pack of basic seeds from the Angry Plant Event.",
        //   price: 500,
        //   rarity: "Common",
        //   stockChance: 0.8,
        //   inStock: true,
        //   onPurchase({ moneySet }) {
        //     moneySet.inventory.push({
        //       key: "gtBasicSeedPack",
        //       name: "Basic Seed Pack",
        //       flavorText: "A pack of basic seeds from the Angry Plant Event.",
        //       icon: "🌱",
        //       type: "gardenTool",
        //       sellPrice: 250,
        //       toolData: {
        //         seedTypes: ["gsCarrot", "gsStrawberry", "gsBlueberry"],
        //       },
        //     });
        //   },
        // },
        // {
        //   icon: "🌟",
        //   name: "Premium Seed Pack",
        //   key: "gtPremiumSeedPack",
        //   flavorText:
        //     "A pack of premium seeds with a chance for rainbow sacks.",
        //   price: 1500,
        //   rarity: "Rare",
        //   stockChance: 0.4,
        //   inStock: true,
        //   onPurchase({ moneySet }) {
        //     moneySet.inventory.push({
        //       key: "gtPremiumSeedPack",
        //       name: "Premium Seed Pack",
        //       flavorText:
        //         "A pack of premium seeds with a chance for rainbow sacks.",
        //       icon: "🌟",
        //       type: "gardenTool",
        //       sellPrice: 750,
        //       toolData: {
        //         seedTypes: ["gsTomato", "gsWatermelon", "gsOrangeTulip"],
        //       },
        //     });
        //   },
        // },
      ],
    },
    {
      name: "Lunar Glow Event",
      icon: "🌙",
      shopName: "twilightshop",
      shopName2: "Twilight Shop",
      shopAlias: ["tshop", "twilight", "tsh"],
      effect: {
        mutationChance: 0.3,
        growthMultiplier: 1.3,
        mutationType: "Moonlit",
      },
      shopItems: [
        {
          icon: "🌙",
          name: "Moonflower Seed",
          key: "gsMoonflower",
          flavorText: "Rare flower blooming under moonlight.",
          price: 80_000,
          rarity: "Legendary",
          stockChance: 0.2,
          stockLimit: 15,

          inStock: true,
          onPurchase({ moneySet }) {
            moneySet.inventory.push({
              key: "gsMoonflower",
              name: "Moonflower Seed",
              flavorText: "Rare flower blooming under moonlight.",
              icon: "🌙",
              type: "gardenSeed",
              sellPrice: 4000,
              cropData: {
                baseValue: 8500,
                growthTime: CROP_CONFIG.GROWTH_BASE * 8.5,
                harvests: 20,
              },
            });
          },
        },
        {
          icon: "🍃",
          name: "Mint Seed",
          key: "gsMint",
          flavorText: "Refreshing herb with culinary uses.",
          price: 2200,
          stockLimit: 20,

          rarity: "Rare",
          stockChance: 0.5,
          inStock: true,
          onPurchase({ moneySet }) {
            moneySet.inventory.push({
              key: "gsMint",
              name: "Mint Seed",
              flavorText: "Refreshing herb with culinary uses.",
              icon: "🍃",
              type: "gardenSeed",
              sellPrice: 1100,
              cropData: {
                baseValue: 4400,
                growthTime: CROP_CONFIG.GROWTH_BASE * 2,
                harvests: 2,
              },
            });
          },
        },
        {
          icon: "🍄",
          name: "Glowshroom Seed",
          key: "gsGlowshroom",
          flavorText: "Bioluminescent mushroom with unique glow.",
          price: 3000,
          rarity: "Rare",
          stockLimit: 20,

          stockChance: 0.4,
          inStock: true,
          onPurchase({ moneySet }) {
            moneySet.inventory.push({
              key: "gsGlowshroom",
              name: "Glowshroom Seed",
              flavorText: "Bioluminescent mushroom with unique glow.",
              icon: "🍄",
              type: "gardenSeed",
              sellPrice: 1500,
              cropData: {
                baseValue: 6000,
                growthTime: CROP_CONFIG.GROWTH_BASE * 3,
                harvests: 2,
              },
            });
          },
        },
        {
          icon: "🌟",
          name: "Starfruit Seed",
          stockLimit: 12,

          key: "gsStarfruit",
          flavorText: "A radiant fruit from the Lunar Glow Event.",
          price: 140_000,
          rarity: "Legendary",
          stockChance: 0.3,
          inStock: true,
          onPurchase({ moneySet }) {
            moneySet.inventory.push({
              key: "gsStarfruit",
              name: "Starfruit Seed",
              flavorText: "A radiant fruit from the Lunar Glow Event.",
              icon: "🌟",
              type: "gardenSeed",
              sellPrice: 1750,
              cropData: {
                baseValue: 14000,
                growthTime: CROP_CONFIG.GROWTH_BASE * 3.5,
                harvests: 15,
              },
            });
          },
        },
        {
          icon: "🌼",
          name: "Moonglow Seed",
          key: "gsMoonglow",
          flavorText: "A glowing flower from the Lunar Glow Event.",
          price: 180_000,
          stockLimit: 10,

          rarity: "Legendary",
          stockChance: 0.25,
          inStock: true,
          onPurchase({ moneySet }) {
            moneySet.inventory.push({
              key: "gsMoonglow",
              name: "Moonglow Seed",
              flavorText: "A glowing flower from the Lunar Glow Event.",
              icon: "🌼",
              type: "gardenSeed",
              sellPrice: 2000,
              cropData: {
                baseValue: 18_000,
                growthTime: CROP_CONFIG.GROWTH_BASE * 9.5,
                harvests: 20,
              },
            });
          },
        },
        {
          icon: "🌸",
          name: "Moon Blossom Seed",
          key: "gsMoonBlossom",
          stockLimit: 5,

          flavorText: "A divine bloom from the Lunar Glow Event.",
          price: 600_000,
          rarity: "Divine",
          stockChance: 0.15,
          inStock: true,
          onPurchase({ moneySet }) {
            moneySet.inventory.push({
              key: "gsMoonBlossom",
              name: "Moon Blossom Seed",
              flavorText: "A divine bloom from the Lunar Glow Event.",
              icon: "🌸",
              type: "gardenSeed",
              sellPrice: 3000,
              cropData: {
                baseValue: 45_125,
                growthTime: CROP_CONFIG.GROWTH_BASE * 4,
                harvests: 30,
              },
            });
          },
        },
        {
          icon: "🫐",
          name: "Celestiberry Seed",
          key: "gsCelestiberry",
          flavorText: "A celestial berry from the Lunar Glow Event.",
          price: 15_000_000,
          stockLimit: 5,

          rarity: "Mythical",
          stockChance: 0.2,
          inStock: true,
          onPurchase({ moneySet }) {
            moneySet.inventory.push({
              key: "gsCelestiberry",
              name: "Celestiberry Seed",
              flavorText: "A celestial berry from the Lunar Glow Event.",
              icon: "🫐",
              type: "gardenSeed",
              sellPrice: 10_000_000,
              cropData: {
                baseValue: 10_000_000,
                growthTime: CROP_CONFIG.GROWTH_BASE * 7.7,
                harvests: 2,
              },
            });
          },
        },
        {
          icon: "🥭",
          name: "Moon Mango Seed",
          key: "gsMoonMango",
          stockLimit: 2,

          flavorText: "A tropical fruit from the Lunar Glow Event.",
          price: 1_000_000_000,
          rarity: "Mythical",
          stockChance: 0.01,
          inStock: true,
          onPurchase({ moneySet }) {
            moneySet.inventory.push({
              key: "gsMoonMango",
              name: "Moon Mango Seed",
              flavorText: "A tropical fruit from the Lunar Glow Event.",
              icon: "🥭",
              type: "gardenSeed",
              sellPrice: 1_000_000_000,
              cropData: {
                baseValue: 100_000_000,
                growthTime: CROP_CONFIG.GROWTH_BASE * 30.5,
                harvests: 12,
              },
            });
          },
        },
        {
          icon: "🌑",
          name: "Nightshade Seed",
          key: "gsNightshade",
          stockLimit: 20,

          flavorText: "A mysterious crop from the Lunar Glow Event.",
          price: 4500,
          rarity: "Legendary",
          stockChance: 0.25,
          inStock: true,
          onPurchase({ moneySet }) {
            moneySet.inventory.push({
              key: "gsNightshade",
              name: "Nightshade Seed",
              flavorText: "A mysterious crop from the Lunar Glow Event.",
              icon: "🌑",
              type: "gardenSeed",
              sellPrice: 2250,
              cropData: {
                baseValue: 9000,
                growthTime: CROP_CONFIG.GROWTH_BASE * 3.5,
                harvests: 2,
              },
            });
          },
        },
        {
          icon: "🦔",
          name: "Hedgehog",
          stockLimit: 1,
          key: "gpHedgehog",
          flavorText: "A spiky pet from the Lunar Glow Event.",
          price: 2000000,
          rarity: "Uncommon",
          stockChance: 0.6,
          inStock: true,
          onPurchase({ moneySet }) {
            moneySet.inventory.push({
              key: "gpHedgehog",
              name: "Hedgehog",
              flavorText: "Caged pet. Uncage to dig up Lunar seeds!",
              icon: "🦔",
              type: "gardenPetCage",
              sellPrice: 100000,
              petData: {
                name: "Hedgehog",
                collectionRate: 0.1,
                seedTypes: ["gsMoonflower", "gsMint", "gsGlowshroom"],
              },
            });
          },
        },
        {
          icon: "🐹",
          name: "Mole",
          key: "gpMole",
          flavorText: "A digging pet from the Lunar Glow Event.",
          price: 2500000,
          stockLimit: 1,

          rarity: "Uncommon",
          stockChance: 0.5,
          inStock: true,
          onPurchase({ moneySet }) {
            moneySet.inventory.push({
              key: "gpMole",
              name: "Mole",
              flavorText: "Caged pet. Uncage to dig up Lunar seeds!",
              icon: "🐹",
              type: "gardenPetCage",
              sellPrice: 12500,
              petData: {
                name: "Mole",
                collectionRate: 0.1,
                seedTypes: ["gsStarfruit", "gsMoonglow", "gsNightshade"],
              },
            });
          },
        },
        {
          icon: "🐸",
          name: "Frog",
          key: "gpFrog",
          flavorText: "A hopping pet from the Lunar Glow Event.",
          price: 2000000,
          rarity: "Uncommon",
          stockLimit: 1,

          stockChance: 0.01,
          inStock: true,
          onPurchase({ moneySet }) {
            moneySet.inventory.push({
              key: "gpFrog",
              name: "Frog",
              flavorText: "Caged pet. Uncage to dig up Lunar seeds!",
              icon: "🐸",
              type: "gardenPetCage",
              sellPrice: 1000000,
              petData: {
                name: "Frog",
                collectionRate: 0.1,
                seedTypes: ["gsMoonBlossom", "gsBloodBanana", "gsMoonMelon"],
              },
            });
          },
        },
        {
          icon: "🐸🌙",
          name: "Echo Frog",
          key: "gpEchoFrog",
          flavorText: "A mystical frog from the Lunar Glow Event.",
          price: 3000000,
          rarity: "Rare",
          stockChance: 0.001,
          stockLimit: 1,

          inStock: true,
          onPurchase({ moneySet }) {
            moneySet.inventory.push({
              key: "gpEchoFrog",
              name: "Echo Frog",
              flavorText: "Caged pet. Uncage to dig up Lunar seeds!",
              icon: "🐸🌙",
              type: "gardenPetCage",
              sellPrice: 150000,
              petData: {
                name: "Echo Frog",
                collectionRate: 0.15,
                seedTypes: ["gsCelestiberry", "gsMoonMango"],
              },
            });
          },
        },
        {
          icon: "🦇",
          name: "Night Owl",
          key: "gpNightOwl",
          flavorText: "A nocturnal pet from the Lunar Glow Event.",
          price: 3500000,
          stockLimit: 1,

          rarity: "Rare",
          stockChance: 0.1,
          inStock: true,
          onPurchase({ moneySet }) {
            moneySet.inventory.push({
              key: "gpNightOwl",
              name: "Night Owl",
              flavorText: "Caged pet. Uncage to dig up Lunar seeds!",
              icon: "🦇",
              type: "gardenPetCage",
              sellPrice: 1750000,
              petData: {
                name: "Night Owl",
                collectionRate: 0.15,
                seedTypes: ["gsMoonflower", "gsMoonglow", "gsMoonBlossom"],
              },
            });
          },
        },
        {
          icon: "🦝",
          name: "Raccoon",
          key: "gpRaccoon",
          flavorText: "A sneaky pet from the Lunar Glow Event.",
          price: 3000000,
          stockLimit: 1,

          rarity: "Rare",
          stockChance: 0.1,
          inStock: true,
          onPurchase({ moneySet }) {
            moneySet.inventory.push({
              key: "gpRaccoon",
              name: "Raccoon",
              flavorText: "Caged pet. Uncage to dig up Lunar seeds!",
              icon: "🦝",
              type: "gardenPetCage",
              sellPrice: 150000,
              petData: {
                name: "Raccoon",
                collectionRate: 0.15,
                seedTypes: ["gsBloodBanana", "gsMoonMelon", "gsCelestiberry"],
              },
            });
          },
        },
        {
          icon: "🥝",
          name: "Kiwi",
          stockLimit: 1,

          key: "gpKiwi",
          flavorText: "A fuzzy pet from the Lunar Glow Event.",
          price: 4000000,
          rarity: "Legendary",
          stockChance: 0.0002,
          inStock: true,
          onPurchase({ moneySet }) {
            moneySet.inventory.push({
              key: "gpKiwi",
              name: "Kiwi",
              flavorText: "Caged pet. Uncage to dig up Lunar seeds!",
              icon: "🥝",
              type: "gardenPetCage",
              sellPrice: 200000,
              petData: {
                name: "Kiwi",
                collectionRate: 0.01,
                seedTypes: ["gsMoonMango", "gsNightshade"],
              },
            });
          },
        },
        {
          icon: "🦉",
          name: "Owl",
          key: "gpOwl",
          flavorText: "A wise pet from the Lunar Glow Event.",
          price: 5000000,
          stockLimit: 1,

          rarity: "Legendary",
          stockChance: 0.15,
          inStock: true,
          onPurchase({ moneySet }) {
            moneySet.inventory.push({
              key: "gpOwl",
              name: "Owl",
              flavorText: "Caged pet. Uncage to dig up Lunar seeds!",
              icon: "🦉",
              type: "gardenPetCage",
              sellPrice: 250000,
              petData: {
                name: "Owl",
                collectionRate: 0.2,
                seedTypes: ["gsMoonflower", "gsStarfruit", "gsMoonglow"],
              },
            });
          },
        },
        {
          icon: "🥝🌑",
          name: "Blood Kiwi",
          stockLimit: 1,

          key: "gpBloodKiwi",
          flavorText: "A rare pet from the Lunar Glow Event.",
          price: 6000000,
          rarity: "Mythical",
          stockChance: 0.1,
          inStock: true,
          onPurchase({ moneySet }) {
            moneySet.inventory.push({
              key: "gpBloodKiwi",
              name: "Blood Kiwi",
              flavorText: "Caged pet. Uncage to dig up Lunar seeds!",
              icon: "🥝🌑",
              type: "gardenPetCage",
              sellPrice: 300000,
              petData: {
                name: "Blood Kiwi",
                collectionRate: 0.25,
                seedTypes: ["gsBloodBanana", "gsMoonMelon"],
              },
            });
          },
        },
        {
          icon: "🦔🌑",
          name: "Blood Hedgehog",
          key: "gpBloodHedgehog",
          flavorText: "A fierce pet from the Lunar Glow Event.",
          price: 6000000,
          stockLimit: 1,

          rarity: "Mythical",
          stockChance: 0.0001,
          inStock: true,
          onPurchase({ moneySet }) {
            moneySet.inventory.push({
              key: "gpBloodHedgehog",
              name: "Blood Hedgehog",
              flavorText: "Caged pet. Uncage to dig up Lunar seeds!",
              icon: "🦔🌑",
              type: "gardenPetCage",
              sellPrice: 300000,
              petData: {
                name: "Blood Hedgehog",
                collectionRate: 0.025,
                seedTypes: ["gsCelestiberry", "gsMoonMango"],
              },
            });
          },
        },
        {
          icon: "🦉🌑",
          name: "Blood Owl",
          stockLimit: 1,

          key: "gpBloodOwl",
          flavorText: "A mystical pet from the Lunar Glow Event.",
          price: 6500000,
          rarity: "Mythical",
          stockChance: 0.1,
          inStock: true,
          onPurchase({ moneySet }) {
            moneySet.inventory.push({
              key: "gpBloodOwl",
              name: "Blood Owl",
              flavorText: "Caged pet. Uncage to dig up Lunar seeds!",
              icon: "🦉🌑",
              type: "gardenPetCage",
              sellPrice: 325000,
              petData: {
                name: "Blood Owl",
                collectionRate: 0.25,
                seedTypes: ["gsMoonflower", "gsMoonglow"],
              },
            });
          },
        },
        {
          icon: "🐔💀",
          name: "Chicken Zombie",
          stockLimit: 1,

          key: "gpChickenZombie",
          flavorText: "A spooky pet from the Lunar Glow Event.",
          price: 7000000,
          rarity: "Divine",
          stockChance: 0.05,
          inStock: true,
          onPurchase({ moneySet }) {
            moneySet.inventory.push({
              key: "gpChickenZombie",
              name: "Chicken Zombie",
              flavorText: "Caged pet. Uncage to dig up Lunar seeds!",
              icon: "🐔💀",
              type: "gardenPetCage",
              sellPrice: 3500,
              petData: {
                name: "Chicken Zombie",
                collectionRate: 0.3,
                seedTypes: ["gsNightshade", "gsMoonBlossom"],
              },
            });
          },
        },
        {
          icon: "🌟",
          name: "Night Staff",
          key: "gtNightStaff",
          stockLimit: 1,

          flavorText: "Boosts Moonlit mutations for Lunar crops.",
          price: 1500,
          rarity: "Rare",
          stockChance: 0.4,
          inStock: true,
          onPurchase({ moneySet }) {
            moneySet.inventory.push({
              key: "gtNightStaff",
              name: "Night Staff",
              flavorText: "Boosts Moonlit mutations for Lunar crops.",
              icon: "🌟",
              type: "gardenTool",
              sellPrice: 750,
              toolData: {
                growthMultiplier: 1.3,
                mutationChance: { Moonlit: 0.3 },
              },
            });
          },
        },
        {
          icon: "🥚🌙",
          name: "Night Egg",
          key: "gtNightEgg",
          stockLimit: 0.3,

          flavorText: "A mysterious egg from the Lunar Glow Event.",
          price: 1000,
          rarity: "Uncommon",
          stockChance: 0.5,
          inStock: true,
          onPurchase({ moneySet }) {
            moneySet.inventory.push({
              key: "gtNightEgg",
              name: "Night Egg",
              flavorText: "A mysterious egg from the Lunar Glow Event.",
              icon: "🥚🌙",
              type: "gardenTool",
              sellPrice: 500,
              toolData: { growthMultiplier: 1.1 },
            });
          },
        },

        // {
        //   icon: "📦",
        //   name: "Mysterious Crate",
        //   key: "gtMysteriousCrate",
        //   flavorText: "A crate of surprises from the Lunar Glow Event.",
        //   price: 2500,
        //   rarity: "Rare",
        //   stockChance: 0.3,
        //   inStock: true,
        //   onPurchase({ moneySet }) {
        //     moneySet.inventory.push({
        //       key: "gtMysteriousCrate",
        //       name: "Mysterious Crate",
        //       flavorText: "A crate of surprises from the Lunar Glow Event.",
        //       icon: "📦",
        //       type: "gardenTool",
        //       sellPrice: 1250,
        //       toolData: {
        //         seedTypes: ["gsMoonflower", "gsStarfruit", "gsMoonglow"],
        //       },
        //     });
        //   },
        // },
        // {
        //   icon: "🌱🌙",
        //   name: "Night Seed Pack",
        //   key: "gtNightSeedPack",
        //   flavorText: "A pack of lunar seeds from the Lunar Glow Event.",
        //   price: 1500,
        //   rarity: "Rare",
        //   stockChance: 0.4,
        //   inStock: true,
        //   onPurchase({ moneySet }) {
        //     moneySet.inventory.push({
        //       key: "gtNightSeedPack",
        //       name: "Night Seed Pack",
        //       flavorText: "A pack of lunar seeds from the Lunar Glow Event.",
        //       icon: "🌱🌙",
        //       type: "gardenTool",
        //       sellPrice: 750,
        //       toolData: {
        //         seedTypes: ["gsMoonBlossom", "gsBloodBanana", "gsMoonMelon"],
        //       },
        //     });
        //   },
        // },
      ],
    },
    {
      name: "Blood Moon",
      icon: "🌑",
      shopName: "bloodmoonshop",
      shopAlias: ["bmsh", "bmshop", "moonshop"],
      shopName2: "Blood Moon Shop",
      effect: {
        mutationChance: 0.2,
        growthMultiplier: 0.8,
        mutationType: "Bloodlit",
      },
      shopItems: [
        {
          icon: "🍌",
          name: "Blood Banana Seed",
          key: "gsBloodBanana",
          flavorText: "A rare fruit from the Blood Moon Event.",
          price: 200_000,
          rarity: "Mythical",
          stockLimit: 18,

          stockChance: 0.1,
          inStock: true,
          onPurchase({ moneySet }) {
            moneySet.inventory.push({
              key: "gsBloodBanana",
              name: "Blood Banana Seed",
              flavorText: "A rare fruit from the Blood Moon Event.",
              icon: "🍌",
              type: "gardenSeed",
              sellPrice: 150_000,
              cropData: {
                baseValue: 150_000,
                growthTime: CROP_CONFIG.GROWTH_BASE * 7,
                harvests: 2,
              },
            });
          },
        },
        {
          icon: "🍈",
          name: "Moon Melon Seed",
          key: "gsMoonMelon",
          flavorText: "A juicy melon from the Lunar Blood Moon Event.",
          price: 500_000,
          rarity: "Mythical",
          stockLimit: 9,

          stockChance: 0.05,
          inStock: true,
          onPurchase({ moneySet }) {
            moneySet.inventory.push({
              key: "gsMoonMelon",
              name: "Moon Melon Seed",
              flavorText: "A juicy melon from the Lunar Blood Moon Event.",
              icon: "🍈",
              type: "gardenSeed",
              sellPrice: 20_000,
              cropData: {
                baseValue: 10400,
                growthTime: CROP_CONFIG.GROWTH_BASE * 7,
                harvests: 30,
              },
            });
          },
        },
        {
          icon: "📡",
          name: "Star Caller",
          key: "gtStarCaller",
          flavorText: "Enhances Celestial mutations for Blood Moon crops.",
          price: 2000,
          stockLimit: 1,

          rarity: "Rare",
          stockChance: 0.3,
          inStock: true,
          onPurchase({ moneySet }) {
            moneySet.inventory.push({
              key: "gtStarCaller",
              name: "Star Caller",
              flavorText: "Enhances Celestial mutations for Blood Moon crops.",
              icon: "📡",
              type: "gardenTool",
              sellPrice: 1000,
              toolData: {
                growthMultiplier: 1.2,
                mutationChance: { Celestial: 0.2 },
              },
            });
          },
        },
        {
          icon: "🌹",
          name: "Blood Rose Seed",
          key: "gsBloodRose",
          stockLimit: 12,

          flavorText: "A rare seed available during Blood Moon!",
          price: 250_000,
          rarity: "Divine",
          stockChance: 0.4,
          inStock: true,
          onPurchase({ moneySet }) {
            moneySet.inventory.push({
              key: "gsBloodRose",
              name: "Blood Rose Seed",
              flavorText: "A rare seed from Blood Moon.",
              icon: "🌹",
              type: "gardenSeed",
              sellPrice: 125_000,
              cropData: {
                baseValue: 125_000,
                growthTime: CROP_CONFIG.GROWTH_BASE * 9,
                harvests: 3,
              },
            });
          },
        },
      ],
    },
    {
      name: "Rainy Days",
      icon: "☔",
      effect: {
        mutationChance: 0.3,
        growthMultiplier: 1.5,
        mutationType: "Wet",
      },
      shopItems: [],
    },
  ],
};
