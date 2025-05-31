import { CROP_CONFIG } from "@cass-modules/GardenConfig";

export namespace gardenShop {
  export let key = "gardenShop";
  export let lastRestock = 0;
  export const stockRefreshInterval = 5 * 60 * 1000;
  export let itemData = [
    {
      icon: "🥕",
      name: "Carrot Seed",
      key: "gsCarrot",
      flavorText: "A basic crop for quick profits.",
      price: 10,
      rarity: "Common",
      inStock: true,
      isEventItem: false,
      stockChance: 1.0,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          key: "gsCarrot",
          name: "Carrot Seed",
          flavorText: "A basic crop for quick profits.",
          icon: "🥕",
          type: "gardenSeed",
          sellPrice: 10,
          cropData: {
            baseValue: 20,
            growthTime: CROP_CONFIG.GROWTH_BASE,
            harvests: 1,
          },
        });
      },
    },
    {
      icon: "🍓",
      name: "Strawberry Seed",
      key: "gsStrawberry",
      flavorText: "Sweet berries with multiple harvests.",
      price: 50,
      rarity: "Common",
      inStock: true,

      stockChance: 1.0,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          key: "gsStrawberry",
          name: "Strawberry Seed",
          flavorText: "Sweet berries with multiple harvests.",
          icon: "🍓",
          type: "gardenSeed",
          sellPrice: 50,
          cropData: {
            baseValue: 30,
            growthTime: CROP_CONFIG.GROWTH_BASE * 2,
            harvests: 3,
          },
        });
      },
    },
    {
      icon: "🫐",
      name: "Blueberry Seed",
      key: "gsBlueberry",
      flavorText: "Tasty berries with multiple harvests.",
      price: 400,
      rarity: "Uncommon",
      inStock: true,

      stockChance: 1,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          key: "gsBlueberry",
          name: "Blueberry Seed",
          flavorText: "Tasty berries with multiple harvests.",
          icon: "🫐",
          type: "gardenSeed",
          sellPrice: 400,
          cropData: {
            baseValue: 200,
            growthTime: CROP_CONFIG.GROWTH_BASE * 2.5,
            harvests: 3,
          },
        });
      },
    },
    {
      icon: "🌷",
      name: "Orange Tulip Seed",
      key: "gsOrangeTulip",
      flavorText: "Bright and delicate flower crop.",
      price: 600,
      rarity: "Uncommon",
      inStock: true,
      stockChance: 0.34,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          key: "gsOrangeTulip",
          name: "Orange Tulip Seed",
          flavorText: "Bright and delicate flower crop.",
          icon: "🌷",
          type: "gardenSeed",
          sellPrice: 600,
          cropData: {
            baseValue: 700,
            growthTime: CROP_CONFIG.GROWTH_BASE * 2,
            harvests: 2,
          },
        });
      },
    },
    {
      icon: "🍅",
      name: "Tomato Seed",
      key: "gsTomato",
      flavorText: "Juicy tomatoes for big profits.",
      price: 800,
      rarity: "Rare",
      inStock: true,
      stockChance: 1,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          key: "gsTomato",
          name: "Tomato Seed",
          flavorText: "Juicy tomatoes for big profits.",
          icon: "🍅",
          type: "gardenSeed",
          sellPrice: 800,
          cropData: {
            baseValue: 600,
            growthTime: CROP_CONFIG.GROWTH_BASE * 3,
            harvests: 3,
          },
        });
      },
    },
    {
      icon: "🌽",
      name: "Corn Seed",
      key: "gsCorn",
      flavorText: "Golden grain with steady yield.",
      price: 1300,
      rarity: "Rare",
      inStock: true,
      stockChance: 0.17,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          key: "gsCorn",
          name: "Corn Seed",
          flavorText: "Golden grain with steady yield.",
          icon: "🌽",
          type: "gardenSeed",
          sellPrice: 1300,
          cropData: {
            baseValue: 2400,
            growthTime: CROP_CONFIG.GROWTH_BASE * 3,
            harvests: 2,
          },
        });
      },
    },
    {
      icon: "🌼",
      name: "Daffodil Seed",
      key: "gsDaffodil",
      flavorText: "Cheerful flower with fair value.",
      price: 1000,
      rarity: "Rare",
      inStock: true,
      stockChance: 0.145,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          key: "gsDaffodil",
          name: "Daffodil Seed",
          flavorText: "Cheerful flower with fair value.",
          icon: "🌼",
          type: "gardenSeed",
          sellPrice: 1000,
          cropData: {
            baseValue: 2000,
            growthTime: CROP_CONFIG.GROWTH_BASE * 2.5,
            harvests: 1,
          },
        });
      },
    },
    {
      icon: "🍉",
      name: "Watermelon Seed",
      key: "gsWatermelon",
      flavorText: "Large fruit with high value.",
      price: 2500,
      rarity: "Legendary",
      inStock: true,

      stockChance: 0.14,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          key: "gsWatermelon",
          name: "Watermelon Seed",
          flavorText: "Large fruit with high value.",
          icon: "🍉",
          type: "gardenSeed",
          sellPrice: 2500,
          cropData: {
            baseValue: 5000,
            growthTime: CROP_CONFIG.GROWTH_BASE * 4,
            harvests: 1,
          },
        });
      },
    },
    {
      icon: "🎃",
      name: "Pumpkin Seed",
      key: "gsPumpkin",
      flavorText: "A seasonal giant with huge value.",
      price: 3000,
      rarity: "Legendary",
      inStock: true,
      stockChance: 0.1,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          key: "gsPumpkin",
          name: "Pumpkin Seed",
          flavorText: "A seasonal giant with huge value.",
          icon: "🎃",
          type: "gardenSeed",
          sellPrice: 3000,
          cropData: {
            baseValue: 6000,
            growthTime: CROP_CONFIG.GROWTH_BASE * 4,
            harvests: 1,
          },
        });
      },
    },
    {
      icon: "🍎",
      name: "Apple Seed",
      key: "gsApple",
      flavorText: "A classic fruit for every season.",
      price: 3250,
      rarity: "Legendary",
      inStock: true,
      stockChance: 0.07,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          key: "gsApple",
          name: "Apple Seed",
          flavorText: "A classic fruit for every season.",
          icon: "🍎",
          type: "gardenSeed",
          sellPrice: 3250,
          cropData: {
            baseValue: 3500,
            growthTime: CROP_CONFIG.GROWTH_BASE * 3.5,
            harvests: 4,
          },
        });
      },
    },
    {
      icon: "🎍",
      name: "Bamboo Seed",
      key: "gsBamboo",
      flavorText: "Fast-growing and sturdy.",
      price: 4000,
      rarity: "Legendary",
      inStock: true,
      stockChance: 0.3,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          key: "gsBamboo",
          name: "Bamboo Seed",
          flavorText: "Fast-growing and sturdy.",
          icon: "🎍",
          type: "gardenSeed",
          sellPrice: 4000,
          cropData: {
            baseValue: 8000,
            growthTime: CROP_CONFIG.GROWTH_BASE * 2,
            harvests: 1,
          },
        });
      },
    },
    {
      icon: "🍈",
      name: "Coconut Seed",
      key: "gsCoconut",
      flavorText: "Tropical and rich in value.",
      price: 6000,
      rarity: "Mythical",
      inStock: true,
      stockChance: 0.05,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          key: "gsCoconut",
          name: "Coconut Seed",
          flavorText: "Tropical and rich in value.",
          icon: "🥥",
          type: "gardenSeed",
          sellPrice: 6000,
          cropData: {
            baseValue: 3000,
            growthTime: CROP_CONFIG.GROWTH_BASE * 4,
            harvests: 4,
          },
        });
      },
    },
    {
      icon: "🌵",
      name: "Cactus Seed",
      key: "gsCactus",
      flavorText: "Tough crop for extreme climates.",
      price: 15_000,
      rarity: "Mythical",
      inStock: true,
      stockChance: 0.03,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          key: "gsCactus",
          name: "Cactus Seed",
          flavorText: "Tough crop for extreme climates.",
          icon: "🌵",
          type: "gardenSeed",
          sellPrice: 5000,
          cropData: {
            baseValue: 5000,
            growthTime: CROP_CONFIG.GROWTH_BASE * 3.5,
            harvests: 5,
          },
        });
      },
    },

    {
      icon: "🐉",
      name: "Dragon Fruit Seed",
      key: "gsDragonFruit",
      flavorText: "Exotic and magical fruit.",
      price: 50_000,
      rarity: "Mythical",
      inStock: true,
      stockChance: 0.022,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          key: "gsDragonFruit",
          name: "Dragon Fruit Seed",
          flavorText: "Exotic and magical fruit.",
          icon: "🐉",
          type: "gardenSeed",
          sellPrice: 8000,
          cropData: {
            baseValue: 8000,
            growthTime: CROP_CONFIG.GROWTH_BASE * 5,
            harvests: 10,
          },
        });
      },
    },
    {
      icon: "🥭",
      name: "Mango Seed",
      key: "gsMango",
      flavorText: "Sweet tropical fruit with great flavor.",
      price: 100_000,
      rarity: "Mythical",
      inStock: true,
      stockChance: 0.013,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          key: "gsMango",
          name: "Mango Seed",
          flavorText: "Sweet tropical fruit with great flavor.",
          icon: "🥭",
          type: "gardenSeed",
          sellPrice: 10_000,
          cropData: {
            baseValue: 10_000,
            growthTime: CROP_CONFIG.GROWTH_BASE * 4.5,
            harvests: 20,
          },
        });
      },
    },

    {
      icon: "🍇",
      name: "Grape Seed",
      key: "gsGrape",
      flavorText: "Sweet clusters perfect for wine.",
      price: 850_000,
      rarity: "Divine",
      inStock: true,
      stockChance: 0.01,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          key: "gsGrape",
          name: "Grape Seed",
          flavorText: "Sweet clusters perfect for wine.",
          icon: "🍇",
          type: "gardenSeed",
          sellPrice: 50_000,
          cropData: {
            baseValue: 50_000,
            growthTime: CROP_CONFIG.GROWTH_BASE * 3.5,
            harvests: 20,
          },
        });
      },
    },
    {
      icon: "🍄",
      name: "Mushroom Seed",
      key: "gsMushroom",
      flavorText: "Fungi with earthy flavor and value.",
      price: 150_000,
      rarity: "Divine",
      inStock: true,
      stockChance: 0.09,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          key: "gsMushroom",
          name: "Mushroom Seed",
          flavorText: "Fungi with earthy flavor and value.",
          icon: "🍄",
          type: "gardenSeed",
          sellPrice: 80_000,
          cropData: {
            baseValue: 80_000,
            growthTime: CROP_CONFIG.GROWTH_BASE * 2.5,
            harvests: 3,
          },
        });
      },
    },
    {
      icon: "🌶️",
      name: "Pepper Seed",
      key: "gsPepper",
      flavorText: "Spicy crop that adds heat to dishes.",
      price: 1_000_000,
      rarity: "Divine",
      inStock: true,
      stockChance: 0.06,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          key: "gsPepper",
          name: "Pepper Seed",
          flavorText: "Spicy crop that adds heat to dishes.",
          icon: "🌶️",
          type: "gardenSeed",
          sellPrice: 700_000,
          cropData: {
            baseValue: 700_000,
            growthTime: CROP_CONFIG.GROWTH_BASE * 3,
            harvests: 2,
          },
        });
      },
    },
    {
      icon: "🍫",
      name: "Cacao Seed",
      key: "gsCacao",
      flavorText: "Bean for rich chocolate production.",
      price: 2_500_000,
      rarity: "Divine",
      inStock: true,
      stockChance: 0.01,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          key: "gsCacao",
          name: "Cacao Seed",
          flavorText: "Bean for rich chocolate production.",
          icon: "🍫",
          type: "gardenSeed",
          sellPrice: 150_000,
          cropData: {
            baseValue: 150_000,
            growthTime: CROP_CONFIG.GROWTH_BASE * 3.5,
            harvests: 25,
          },
        });
      },
    },

    // {
    //   icon: "🍇",
    //   name: "Raspberry Seed",
    //   key: "gsRaspberry",
    //   flavorText: "Tart berry that grows in clusters.",
    //   price: 1400,
    //   rarity: "Rare",
    //   inStock: true,
    //   stockChance: 0.3,
    //   onPurchase({ moneySet }) {
    //     moneySet.inventory.push({
    //       key: "gsRaspberry",
    //       name: "Raspberry Seed",
    //       flavorText: "Tart berry that grows in clusters.",
    //       icon: "🍇",
    //       type: "gardenSeed",
    //       sellPrice: 700,
    //       cropData: {
    //         baseValue: 2800,
    //         growthTime: CROP_CONFIG.GROWTH_BASE * 2.5,
    //         harvests: 3,
    //       },
    //     });
    //   },
    // },
    // {
    //   icon: "🍐",
    //   name: "Pear Seed",
    //   key: "gsPear",
    //   flavorText: "Soft and sweet fruit for the patient.",
    //   price: 1500,
    //   rarity: "Rare",
    //   inStock: true,
    //   stockChance: 0.25,
    //   onPurchase({ moneySet }) {
    //     moneySet.inventory.push({
    //       key: "gsPear",
    //       name: "Pear Seed",
    //       flavorText: "Soft and sweet fruit for the patient.",
    //       icon: "🍐",
    //       type: "gardenSeed",
    //       sellPrice: 750,
    //       cropData: {
    //         baseValue: 3000,
    //         growthTime: CROP_CONFIG.GROWTH_BASE * 3,
    //         harvests: 2,
    //       },
    //     });
    //   },
    // },

    // {
    //   icon: "🍑",
    //   name: "Peach Seed",
    //   key: "gsPeach",
    //   flavorText: "Juicy fruit perfect for desserts.",
    //   price: 5000,
    //   rarity: "Mythical",
    //   inStock: true,
    //   stockChance: 0.07,
    //   onPurchase({ moneySet }) {
    //     moneySet.inventory.push({
    //       key: "gsPeach",
    //       name: "Peach Seed",
    //       flavorText: "Juicy fruit perfect for desserts.",
    //       icon: "🍑",
    //       type: "gardenSeed",
    //       sellPrice: 2500,
    //       cropData: {
    //         baseValue: 10000,
    //         growthTime: CROP_CONFIG.GROWTH_BASE * 4,
    //         harvests: 2,
    //       },
    //     });
    //   },
    // },
    // {
    //   icon: "🍍",
    //   name: "Pineapple Seed",
    //   key: "gsPineapple",
    //   flavorText: "Tropical fruit with a tough exterior.",
    //   price: 5200,
    //   rarity: "Mythical",
    //   inStock: true,
    //   stockChance: 0.06,
    //   onPurchase({ moneySet }) {
    //     moneySet.inventory.push({
    //       key: "gsPineapple",
    //       name: "Pineapple Seed",
    //       flavorText: "Tropical fruit with a tough exterior.",
    //       icon: "🍍",
    //       type: "gardenSeed",
    //       sellPrice: 2600,
    //       cropData: {
    //         baseValue: 10400,
    //         growthTime: CROP_CONFIG.GROWTH_BASE * 4,
    //         harvests: 1,
    //       },
    //     });
    //   },
    // },

    {
      icon: "🌱",
      name: "Beanstalk Seed",
      key: "gsBeanstalk",
      flavorText: "Magical vine that reaches the skies.",
      price: 10_000_000,
      rarity: "Prismatic",
      inStock: true,
      stockChance: 0.03,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          key: "gsBeanstalk",
          name: "Beanstalk Seed",
          flavorText: "Magical vine that reaches the skies.",
          icon: "🌱",
          type: "gardenSeed",
          sellPrice: 1_000_000,
          cropData: {
            baseValue: 2_000_000,
            growthTime: CROP_CONFIG.GROWTH_BASE * 5,
            harvests: 20,
          },
        });
      },
    },

    // {
    //   icon: "🌙",
    //   name: "Moonflower Seed",
    //   key: "gsMoonflower",
    //   flavorText: "Rare flower blooming under moonlight.",
    //   price: 8000,
    //   rarity: "Legendary",
    //   inStock: false,
    //   stockChance: 0,
    //   onPurchase({ moneySet }) {
    //     moneySet.inventory.push({
    //       key: "gsMoonflower",
    //       name: "Moonflower Seed",
    //       flavorText: "Rare flower blooming under moonlight.",
    //       icon: "🌙",
    //       type: "gardenSeed",
    //       sellPrice: 4000,
    //       cropData: {
    //         baseValue: 16000,
    //         growthTime: CROP_CONFIG.GROWTH_BASE * 4.5,
    //         harvests: 1,
    //       },
    //     });
    //   },
    // },
    // {
    //   icon: "🍃",
    //   name: "Mint Seed",
    //   key: "gsMint",
    //   flavorText: "Refreshing herb with culinary uses.",
    //   price: 2200,
    //   rarity: "Rare",
    //   inStock: false,
    //   stockChance: 0,
    //   onPurchase({ moneySet }) {
    //     moneySet.inventory.push({
    //       key: "gsMint",
    //       name: "Mint Seed",
    //       flavorText: "Refreshing herb with culinary uses.",
    //       icon: "🍃",
    //       type: "gardenSeed",
    //       sellPrice: 1100,
    //       cropData: {
    //         baseValue: 4400,
    //         growthTime: CROP_CONFIG.GROWTH_BASE * 2,
    //         harvests: 2,
    //       },
    //     });
    //   },
    // },
    // {
    //   icon: "🍄",
    //   name: "Glowshroom Seed",
    //   key: "gsGlowshroom",
    //   flavorText: "Bioluminescent mushroom with unique glow.",
    //   price: 3000,
    //   rarity: "Rare",
    //   inStock: false,
    //   stockChance: 0,
    //   onPurchase({ moneySet }) {
    //     moneySet.inventory.push({
    //       key: "gsGlowshroom",
    //       name: "Glowshroom Seed",
    //       flavorText: "Bioluminescent mushroom with unique glow.",
    //       icon: "🍄",
    //       type: "gardenSeed",
    //       sellPrice: 1500,
    //       cropData: {
    //         baseValue: 6000,
    //         growthTime: CROP_CONFIG.GROWTH_BASE * 3,
    //         harvests: 2,
    //       },
    //     });
    //   },
    // },
    {
      icon: "🐶",
      name: "Dog",
      key: "gpDog",
      flavorText: "Caged pet. Uncage to dig up seeds!",
      price: 100000,
      rarity: "Common",
      inStock: true,

      stockChance: 0.8,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          key: "gpDog",
          name: "Dog",
          flavorText: "Caged pet. Use uncage to release!",
          icon: "🐶",
          type: "gardenPetCage",
          sellPrice: 100000,
          petData: {
            name: "Dog",
            collectionRate: 0.05,
            seedTypes: ["gsCarrot", "gsStrawberry", "gsBlueberry", "gsTomato"],
          },
        });
      },
    },
    {
      icon: "💦",
      inStock: true,

      name: "Sprinkler",
      key: "gtSprinkler",
      flavorText:
        "Boosts growth speed and Wet mutations. You only need one of these in your inventory to work.",
      price: 200_000,
      rarity: "Common",
      stockChance: 0.7,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          key: "gtSprinkler",
          name: "Sprinkler",
          flavorText: "Boosts growth speed and Wet mutations.",
          icon: "💦",
          type: "gardenTool",
          sellPrice: 20_000,
          toolData: { growthMultiplier: 1.2, mutationChance: { Wet: 0.2 } },
        });
      },
    },
    {
      icon: "🌿",
      name: "Fertilizer",
      key: "gtFertilizer",
      flavorText:
        "Increases Gold and Disco mutations. You only need one of these in your inventory to work.",
      price: 500_000,
      inStock: true,

      rarity: "Uncommon",
      stockChance: 0.5,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          key: "gtFertilizer",
          name: "Fertilizer",
          flavorText: "Increases Gold and Disco mutations.",
          icon: "🌿",
          type: "gardenTool",
          sellPrice: 25_000,
          toolData: {
            growthMultiplier: 1,
            mutationChance: { Gold: 0.1, Disco: 0.05 },
          },
        });
      },
    },
    // {
    //   icon: "⭐",
    //   name: "Favorite Tool",
    //   key: "gtFavorite",
    //   inStock: true,
    //   flavorText:
    //     "Allows favoriting crops to prevent selling. You only need one of these in your inventory to work.",
    //   price: 1000,
    //   rarity: "Rare",
    //   stockChance: 0.3,
    //   onPurchase({ moneySet }) {
    //     moneySet.inventory.push({
    //       key: "gtFavorite",
    //       name: "Favorite Tool",
    //       flavorText: "Allows favoriting crops to prevent selling.",
    //       icon: "⭐",
    //       type: "gardenTool",
    //       sellPrice: 500,
    //       toolData: { favoriteEnabled: true },
    //     });
    //   },
    // },
  ];
  export const welcomeTexts = [
    "🌱 Welcome to Shop! Start growing today!",
    "🌱 Hey there! Ready to plant some crops?",
    "🌱 Browse our seeds, pets, and gears to boost your farm!",
  ];
  export const buyTexts = [
    "🌱 What do you want to buy today?",
    "🌱 Pick a seed, pet, or gear to grow your garden!",
    "🌱 Let me know what catches your eye!",
  ];
  export const thankTexts = [
    "🌱 Thanks for shopping! Happy planting!",
    "🌱 Your garden's gonna thrive with that!",
    "🌱 Come back soon for more goodies!",
  ];
}

export namespace gardenShop {
  export let eventItems: (typeof gardenShop.itemData)[number][] = [];
}
