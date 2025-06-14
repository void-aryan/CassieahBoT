import { CROP_CONFIG } from "@cass-modules/GardenConfig";
import { GardenItem } from "@cass-commands/grow_garden";
import { ShopItem } from "./GardenBalancer";

export namespace gardenShop {
  export interface GardenShopItem extends ShopItem {
    icon: string;
    name: string;
    key: string;
    flavorText: string;
    price: number;
    rarity: GardenRarity;
    stockLimitOfficial?: number;
    inStock: boolean;
    isEventItem?: boolean;
    stockChance: number;
    stockLimit?: number;
    minStock: number;
    maxStock: number;
    isOfficialStock?: boolean;
    onPurchase({ moneySet }: { moneySet: { inventory: GardenItem[] } }): void;
  }
  export type GardenRarity =
    | "Common"
    | "Uncommon"
    | "Rare"
    | "Legendary"
    | "Mythical"
    | "Divine"
    | "Prismatic";
  export let key = "gardenShop";
  export let lastRestock = 0;
  export const stockRefreshInterval = 5 * 60 * 1000;
  export const stockInterval = stockRefreshInterval;
  export let itemData: GardenShopItem[] = [
    {
      icon: "🥕",
      name: "Carrot Seed",
      key: "gsCarrot",
      flavorText: "A basic crop for quick profits.",
      price: 10,
      rarity: "Common",
      stockLimitOfficial: 20,
      inStock: true,
      isEventItem: false,
      stockChance: 1.0,
      stockLimit: 20,
      minStock: 5,
      maxStock: 25,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          key: "gsCarrot",
          name: "Carrot Seed",
          flavorText: "A basic crop for quick profits.",
          icon: "🥕",
          type: "gardenSeed",
          sellPrice: 1,
          cropData: {
            baseValue: 18,
            growthTime: CROP_CONFIG.GROWTH_BASE,
            harvests: 1,
            yields: 1,
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
      isOfficialStock: false,
      inStock: true,
      stockLimit: 4,
      minStock: 1,
      maxStock: 6,
      stockChance: 1.0,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          key: "gsStrawberry",
          name: "Strawberry Seed",
          flavorText: "Sweet berries with multiple harvests.",
          icon: "🍓",
          type: "gardenSeed",
          sellPrice: 1,
          cropData: {
            baseValue: 14,
            growthTime: CROP_CONFIG.GROWTH_BASE * 2,
            harvests: 6,
            yields: 4,
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
      stockLimit: 4,
      stockChance: 1,
      minStock: 1,
      maxStock: 5,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          key: "gsBlueberry",
          name: "Blueberry Seed",
          flavorText: "Tasty berries with multiple harvests.",
          icon: "🫐",
          type: "gardenSeed",
          sellPrice: 1,
          cropData: {
            baseValue: 18,
            growthTime: CROP_CONFIG.GROWTH_BASE * 2.5,
            harvests: 30,
            yields: 8,
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
      stockLimit: 12,
      minStock: 5,
      maxStock: 25,
      stockChance: 0.34,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          key: "gsOrangeTulip",
          name: "Orange Tulip Seed",
          flavorText: "Bright and delicate flower crop.",
          icon: "🌷",
          type: "gardenSeed",
          sellPrice: 1,
          cropData: {
            baseValue: 767,
            growthTime: CROP_CONFIG.GROWTH_BASE * 3,
            harvests: 1,
            yields: 1,
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
      stockLimit: 2,
      minStock: 1,
      maxStock: 3,
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
            baseValue: 27,
            growthTime: CROP_CONFIG.GROWTH_BASE * 3.5,
            harvests: 40,
            yields: 5,
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
      stockLimit: 3,
      rarity: "Rare",
      inStock: true,
      stockChance: 0.17,
      minStock: 1,
      maxStock: 4,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          key: "gsCorn",
          name: "Corn Seed",
          flavorText: "Golden grain with steady yield.",
          icon: "🌽",
          type: "gardenSeed",
          sellPrice: 1,
          cropData: {
            baseValue: 36,
            growthTime: CROP_CONFIG.GROWTH_BASE * 3,
            harvests: 50,
            yields: 1,
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
      stockLimit: 4,
      rarity: "Rare",
      inStock: true,
      stockChance: 0.145,
      minStock: 1,
      maxStock: 6,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          key: "gsDaffodil",
          name: "Daffodil Seed",
          flavorText: "Cheerful flower with fair value.",
          icon: "🌼",
          type: "gardenSeed",
          sellPrice: 1,
          cropData: {
            baseValue: 903,
            growthTime: CROP_CONFIG.GROWTH_BASE * 1.5,
            harvests: 1,
            yields: 1,
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
      stockLimit: 5,
      stockChance: 0.14,
      minStock: 1,
      maxStock: 6,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          key: "gsWatermelon",
          name: "Watermelon Seed",
          flavorText: "Large fruit with high value.",
          icon: "🍉",
          type: "gardenSeed",
          sellPrice: 1,
          cropData: {
            baseValue: 2708,
            growthTime: CROP_CONFIG.GROWTH_BASE * 2,
            harvests: 1,
            yields: 1,
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
      minStock: 1,
      maxStock: 4,
      rarity: "Legendary",
      inStock: true,
      stockLimit: 3,
      stockChance: 0.1,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          key: "gsPumpkin",
          name: "Pumpkin Seed",
          flavorText: "A seasonal giant with huge value.",
          icon: "🎃",
          type: "gardenSeed",
          sellPrice: 1,
          cropData: {
            baseValue: 3700,
            growthTime: CROP_CONFIG.GROWTH_BASE * 2,
            harvests: 1,
            yields: 1,
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
      stockLimit: 2,
      minStock: 1,
      maxStock: 3,
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
          sellPrice: 1,
          cropData: {
            baseValue: 248,
            growthTime: CROP_CONFIG.GROWTH_BASE * 3.5,
            harvests: 16,
            yields: 6,
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
      stockLimit: 15,
      rarity: "Legendary",
      inStock: true,
      stockChance: 0.3,
      minStock: 10,
      maxStock: 20,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          key: "gsBamboo",
          name: "Bamboo Seed",
          flavorText: "Fast-growing and sturdy.",
          icon: "🎍",
          type: "gardenSeed",
          sellPrice: 1,
          cropData: {
            baseValue: 3610,
            growthTime: CROP_CONFIG.GROWTH_BASE * 2,
            harvests: 1,
            yields: 1,
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
      stockLimit: 2,
      rarity: "Mythical",
      inStock: true,
      stockChance: 0.05,
      minStock: 1,
      maxStock: 2,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          key: "gsCoconut",
          name: "Coconut Seed",
          flavorText: "Tropical and rich in value.",
          icon: "🥥",
          type: "gardenSeed",
          sellPrice: 1,
          cropData: {
            baseValue: 361,
            growthTime: CROP_CONFIG.GROWTH_BASE * 4,
            harvests: 20,
            yields: 12,
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
      stockLimit: 3,
      rarity: "Mythical",
      inStock: true,
      minStock: 1,
      maxStock: 5,
      stockChance: 0.03,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          key: "gsCactus",
          name: "Cactus Seed",
          flavorText: "Tough crop for extreme climates.",
          icon: "🌵",
          type: "gardenSeed",
          sellPrice: 1,
          cropData: {
            baseValue: 3068,
            growthTime: CROP_CONFIG.GROWTH_BASE * 3.5,
            harvests: 7,
            yields: 3,
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
      stockLimit: 2,
      inStock: true,
      minStock: 1,
      maxStock: 4,
      stockChance: 0.022,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          key: "gsDragonFruit",
          name: "Dragon Fruit Seed",
          flavorText: "Exotic and magical fruit.",
          icon: "🐉",
          type: "gardenSeed",
          sellPrice: 1,
          cropData: {
            baseValue: 4287,
            growthTime: CROP_CONFIG.GROWTH_BASE * 5,
            harvests: 17,
            yields: 6,
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
      stockLimit: 2,
      minStock: 1,
      maxStock: 3,
      stockChance: 0.013,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          key: "gsMango",
          name: "Mango Seed",
          flavorText: "Sweet tropical fruit with great flavor.",
          icon: "🥭",
          type: "gardenSeed",
          sellPrice: 1,
          cropData: {
            baseValue: 5_866,
            growthTime: CROP_CONFIG.GROWTH_BASE * 3.5,
            harvests: 25,
            yields: 4,
          },
        });
      },
    },

    {
      icon: "🍇",
      name: "Grape Seed",
      key: "gsGrape",
      stockLimit: 1,
      flavorText: "Sweet clusters perfect for wine.",
      price: 850_000,
      rarity: "Divine",
      inStock: true,
      stockChance: 0.01,
      minStock: 1,
      maxStock: 1,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          key: "gsGrape",
          name: "Grape Seed",
          flavorText: "Sweet clusters perfect for wine.",
          icon: "🍇",
          type: "gardenSeed",
          sellPrice: 1,
          cropData: {
            baseValue: 7_085,
            growthTime: CROP_CONFIG.GROWTH_BASE * 1.5,
            harvests: 140,
            yields: 12,
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
      stockLimit: 12,
      rarity: "Divine",
      inStock: true,
      minStock: 1,
      maxStock: 25,
      stockChance: 0.09,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          key: "gsMushroom",
          name: "Mushroom Seed",
          flavorText: "Fungi with earthy flavor and value.",
          icon: "🍄",
          type: "gardenSeed",
          sellPrice: 1,
          cropData: {
            baseValue: 136_278,
            growthTime: CROP_CONFIG.GROWTH_BASE * 1.5,
            harvests: 1,
            yields: 1,
          },
        });
      },
    },
    {
      icon: "🌶️",
      name: "Pepper Seed",
      key: "gsPepper",
      stockLimit: 12,
      flavorText: "Spicy crop that adds heat to dishes.",
      price: 1_000_000,
      rarity: "Divine",
      inStock: true,
      stockChance: 0.06,
      minStock: 1,
      maxStock: 1,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          key: "gsPepper",
          name: "Pepper Seed",
          flavorText: "Spicy crop that adds heat to dishes.",
          icon: "🌶️",
          type: "gardenSeed",
          sellPrice: 1,
          cropData: {
            baseValue: 7_220,
            growthTime: CROP_CONFIG.GROWTH_BASE * 1.5,
            harvests: 200,
            yields: 12,
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
      stockLimit: 1,
      rarity: "Divine",
      inStock: true,
      stockChance: 0.01,
      minStock: 1,
      maxStock: 1,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          key: "gsCacao",
          name: "Cacao Seed",
          flavorText: "Bean for rich chocolate production.",
          icon: "🍫",
          type: "gardenSeed",
          sellPrice: 1,
          cropData: {
            baseValue: 10_830,
            growthTime: CROP_CONFIG.GROWTH_BASE * 0.5,
            harvests: 280,
            yields: 12,
          },
        });
      },
    },

    {
      icon: "🌱",
      name: "Beanstalk Seed",
      key: "gsBeanstalk",
      flavorText: "Magical vine that reaches the skies.",
      price: 10_000_000,
      rarity: "Prismatic",
      inStock: true,
      stockLimit: 1,
      minStock: 1,
      maxStock: 1,
      stockChance: 0.03,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          key: "gsBeanstalk",
          name: "Beanstalk Seed",
          flavorText: "Magical vine that reaches the skies.",
          icon: "🌱",
          type: "gardenSeed",
          sellPrice: 1,
          cropData: {
            baseValue: 25_270,
            growthTime: CROP_CONFIG.GROWTH_BASE * 0.3,
            harvests: 450,
            yields: 12,
          },
        });
      },
    },

    {
      icon: "🌺",
      name: "Ember Lily",
      key: "gsEmberLily",
      flavorText: "A blazing bloom that thrives in heat and glows at dusk.",
      price: 15_000_000,
      rarity: "Prismatic",
      inStock: true,
      stockLimit: 1,
      minStock: 1,
      maxStock: 1,
      stockChance: 0.02,
      onPurchase({ moneySet }) {
        moneySet.inventory.push({
          key: "gsEmberLily",
          name: "Ember Lily",
          flavorText: "A blazing bloom that thrives in heat and glows at dusk.",
          icon: "🌺",
          type: "gardenSeed",
          sellPrice: 1,
          cropData: {
            baseValue: 50_000,
            growthTime: CROP_CONFIG.GROWTH_BASE * 0.2,
            harvests: 400,
            yields: 24,
          },
        });
      },
    },
  ];
  export let gnpShop: GardenShopItem[] = [
    // {
    //   icon: "🐶",
    //   name: "Dog",
    //   key: "gpDog",
    //   flavorText: "Caged pet. Uncage to dig up seeds!",
    //   price: 100000,
    //   rarity: "Common",
    //   inStock: true,
    //   stockLimit: 1,
    //   stockChance: 0.8,
    //   onPurchase({ moneySet }) {
    //     moneySet.inventory.push({
    //       key: "gpDog",
    //       name: "Dog",
    //       flavorText: "Caged pet. Use uncage to release!",
    //       icon: "🐶",
    //       type: "gardenPetCage",
    //       sellPrice: 100000,
    //       petData: {
    //         name: "Dog",
    //         collectionRate: 0.05,
    //         seedTypes: ["gsCarrot", "gsStrawberry", "gsBlueberry", "gsTomato"],
    //       },
    //     });
    //   },
    // },
    // {
    //   icon: "💦",
    //   inStock: true,
    //   stockLimit: 1,
    //   name: "Sprinkler",
    //   key: "gtSprinkler",
    //   flavorText:
    //     "Boosts growth speed and Wet mutations. You only need one of these in your inventory to work.",
    //   price: 200_000,
    //   rarity: "Common",
    //   stockChance: 0.7,
    //   onPurchase({ moneySet }) {
    //     moneySet.inventory.push({
    //       key: "gtSprinkler",
    //       name: "Sprinkler",
    //       flavorText: "Boosts growth speed and Wet mutations.",
    //       icon: "💦",
    //       type: "gardenTool",
    //       sellPrice: 20_000,
    //       toolData: { growthMultiplier: 1.2, mutationChance: { Wet: 0.2 } },
    //     });
    //   },
    // },
    // {
    //   stockLimit: 1,
    //   icon: "🌿",
    //   name: "Fertilizer",
    //   key: "gtFertilizer",
    //   flavorText:
    //     "Increases Gold and Disco mutations. You only need one of these in your inventory to work.",
    //   price: 500_000,
    //   inStock: true,
    //   rarity: "Uncommon",
    //   stockChance: 0.5,
    //   onPurchase({ moneySet }) {
    //     moneySet.inventory.push({
    //       key: "gtFertilizer",
    //       name: "Fertilizer",
    //       flavorText: "Increases Gold and Disco mutations.",
    //       icon: "🌿",
    //       type: "gardenTool",
    //       sellPrice: 25_000,
    //       toolData: {
    //         growthMultiplier: 1,
    //         mutationChance: { Gold: 0.1, Disco: 0.05 },
    //       },
    //     });
    //   },
    // },
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
  export let eventItems: GardenShopItem[] = [];
}
