// Too many imports? Just rely on auto-imports of Typescript Language Server. 🧑‍🌾👍
// NOTE: Do not modify without the help of Typescript Checking

// ---- For Inventory and Collectibles class to handle arrays (of items) in a simpler way ----
import { Collectibles, Inventory } from "@cass-modules/InventoryEnhanced";

// ---- For Unicode symbols, UNIRedux is outdated, but hey? just use it ----
import { UNIRedux, UNISpectra } from "@cass-modules/unisym.js";

// ---- The main component used to list subcommands (in commands) and handle them automatically ----
import { Config, SpectralCMDHome } from "@cassidy/spectral-home";

// ---- Only used as type : ) ----
import { InventoryItem, UserStatsManager } from "@cass-modules/cassidyUser";

// ---- For the sake of consistency in formatting and parsing NUMERICAL input. ----
import {
  abbreviateNumber,
  formatCash,
  formatTimeSentence,
  formatValue,
  parseBet,
} from "@cass-modules/ArielUtils";

// ---- Just used as type too for CommandContext.output ----
import OutputProps from "output-cassidy";

// ---- Just also used as type for CommandContext.input and for the roles ----
import InputClass, { InputRoles } from "@cass-modules/InputClass";

// ---- Shop items and other components! ----
import {
  GardenChoice,
  GardenChoiceConfig,
  gardenShop,
} from "@cass-modules/GardenShop";

// ---- Garden Configuration I wanna move somewhere else ----
import { CROP_CONFIG, fetchSeedStock } from "@cass-modules/GardenConfig";
import {
  EVENT_CONFIG,
  GardenEventItem,
  GardenWeatherItem,
} from "@cass-modules/GardenEventConfig";

// ---- For unicode fonts (barely used) ----
import { FontSystem } from "cassidy-styler";

// ---- For biased random numbers, because I love to make their life worst, maybe? ----
import { randomBiased } from "@cass-modules/unitypes";

// ---- Do not ask wth this was ----
import { Datum } from "@cass-modules/Datum";

// ---- Just used as types ----
import { BreifcaseUsagePlugin } from "@cass-modules/BriefcaseAPI";

// ---- Hacky stuff ----
import { evaluateItemBalance } from "@cass-modules/GardenBalancer";

export const meta: CassidySpectra.CommandMeta = {
  name: "garden",
  description: "Grow crops and earn Money in your garden!",
  otherNames: ["grow", "growgarden", "gr", "g", "gag"],
  version: "2.0.21",
  usage: "{prefix}{name} [subcommand]",
  category: "Idle Investment Games",
  author: "Liane Cagara 🎀",
  role: 0,
  // self, please do not use "both" or true, i hate noprefix
  noPrefix: false,
  waitingTime: 1,
  requirement: "3.0.0",
  icon: "🌱",
  cmdType: "cplx_g",
};

// ---- For the sake of gift/giftPack to give seeds as rewards too ----
export const treasuresTable: InventoryItem[] = [
  ...gardenShop.honeyShop
    .filter((i) => i.pack === "pFlowerSeed")
    .map((shopItem) => {
      let inventoryItem: GardenItem | null = null;
      const mockMoneySet = {
        inventory: [] as GardenItem[],
      };

      shopItem.onPurchase({ moneySet: mockMoneySet });
      inventoryItem = mockMoneySet.inventory[0] || null;

      if (!inventoryItem) {
        return null;
      }

      return {
        ...inventoryItem,
        group: ["pFlowers"],
        prob: shopItem.packChance ?? 0,
      };
    })
    .filter(Boolean),
  ...gardenShop.itemData
    .map((shopItem) => {
      let inventoryItem: GardenItem | null = null;
      const mockMoneySet = {
        inventory: [] as GardenItem[],
      };

      shopItem.onPurchase({ moneySet: mockMoneySet });
      inventoryItem = mockMoneySet.inventory[0] || null;

      if (!inventoryItem) {
        return null;
      }

      return {
        ...inventoryItem,
        group: ["generic", "gardenShop"],
        prob: shopItem.stockChance ?? 0.5,
      };
    })
    .filter(Boolean),
];

// ---- For bc use ----
export const briefcaseUsage: Record<string, BreifcaseUsagePlugin> = {
  gardenSeed(arg, ctx, _bctx) {
    const item = arg.item as GardenSeed;
    return `${UNISpectra.arrowFromT} ${item.icon} **${
      item.name
    }** is a garden seed! You can **plant** this item.\n\n${
      UNIRedux.charm
    } Base Value: ${formatCash(item.cropData?.baseValue, true)}\n\nType **${
      ctx.prefix
    }${meta.name} plant ${item.key} ${arg.customInventory.getAmount(
      item.key
    )}** without fonts to plant it.`;
  },
  gardenPet(arg, ctx, _bctx) {
    const item = arg.item as GardenSeed;
    return `${UNISpectra.arrowFromT} ${item.icon} **${item.name}** is a garden pet! You can **uncage** this pet.\n\nType **${ctx.prefix}${meta.name} uncage ${item.key}** without fonts to uncage it.`;
  },
  gardenTool(arg, _ctx, _bctx) {
    const item = arg.item as GardenSeed;
    return `${UNISpectra.arrowFromT} ${item.icon} **${item.name}** is a garden gear! Just **keep** it in your inventory/briefcase and it will have an **effect**.`;
  },
};

export const PLOT_LIMIT = 36;
export const PLOT_EXPANSION_LIMIT = 56 * 2;
export const PET_LIMIT = 60;
export const PET_EQUIP_LIMIT = 8;
export const ITEMS_PER_PAGE = 6;

export type GardenSeed = InventoryItem & {
  type: "gardenSeed";
  cropData: {
    baseValue: number;
    growthTime: number;
    harvests: number;
    yields: number;
  };
  isFavorite?: boolean;
};

export type GardenPetCage = InventoryItem & {
  type: "gardenPetCage";
  petData: { name: string; collectionRate: number; seedTypes: string[] };
  isFavorite?: boolean;
};

export type GardenTool = InventoryItem & {
  type: "gardenTool";
  toolData: {
    growthMultiplier?: number;
    mutationChance?: { [key: string]: number };
    favoriteEnabled?: boolean;
  };
  isFavorite?: boolean;
};

export type GardenPlot = InventoryItem & {
  key: string;
  seedKey: string;
  name: string;
  icon: string;
  yields: number;
  plantedAt: number;
  growthTime: number;
  harvestsLeft: number;
  baseValue: number;
  mutation: string[];
  isFavorite?: boolean;
  originalGrowthTime: number;
  price: number;
  lastMutation: number;
  noAutoMutation?: never;
  kiloGrams: number;
  maxKiloGrams: number;
  mutationAttempts: number;
};

export function toBarnItem(plot: GardenPlot): GardenBarn[] {
  const {
    key,
    icon,
    name,
    flavorText,
    mutation,
    kiloGrams,
    seedKey,
    isFavorite,
    price,
  } = plot;

  const { final: value, yields } = calculateCropValue(plot);

  const item: GardenBarn = {
    key,
    uuid: Inventory.generateUUID(),
    icon,
    name,
    flavorText,
    value,
    mutation,
    kiloGrams,
    seedKey,
    type: "gardenBarn",
    isFavorite,
    price,
  };

  return Array.from({ length: yields }, () => ({
    ...item,
    uuid: Inventory.generateUUID(),
  }));
}

export type GardenBarn = InventoryItem & {
  key: string;
  seedKey: string;
  name: string;
  icon: string;
  mutation: string[];
  isFavorite?: boolean;
  kiloGrams: number;
  value: number;
  price: number;
};

export type GardenPetActive = InventoryItem & {
  key: string;
  name: string;
  icon: string;
  lastCollect: number;
  petData: { collectionRate: number; seedTypes: string[] };
  isEquipped: boolean;
};

export interface GardenStats {
  plotsHarvested: number;
  mutationsFound: number;
  expansions: number;
  achievements: string[];
}

export type GardenItem = GardenSeed | GardenPetCage | GardenTool;

export function calculateCropValue(crop: GardenPlot) {
  const mutations = (crop.mutation || [])
    .map((mutationName) =>
      CROP_CONFIG.MUTATIONS.find((m) => m.name === mutationName)
    )
    .filter(Boolean);

  const totalMutationBonus = mutations.reduce(
    (acc, curr) => acc * (curr.valueMultiplier || 1),
    1
  );

  const yields = getPossibleYields(crop);

  const combinedMultiplier = totalMutationBonus;

  const final = Math.floor(
    crop.baseValue * combinedMultiplier * (crop.maxKiloGrams + 1)
  );

  const noExtra = Math.floor(final - crop.baseValue * combinedMultiplier);

  const allYield = Math.floor(final * yields);

  return {
    final: Math.max(final, 0) || 0,
    noExtra: Math.max(0, noExtra) || 0,
    yields,
    allYield,
    remainingHarvests: (crop.harvestsLeft || 0) - yields,
  };
}

function isCropReady(crop: GardenPlot) {
  return cropTimeLeft(crop) <= 0;
}

function cropTimeLeft(plot: GardenPlot, allowNegative = false) {
  const e = plot.plantedAt + plot.growthTime - Date.now();
  if (allowNegative) {
    return e;
  }
  const timeLeft = Math.max(0, e);
  return timeLeft;
}

function safeEX(a: number, p: number) {
  return a === 0 ? 0 : a < 0 ? -Math.pow(-a, p) : Math.pow(a, p);
}

function calculateCropKG(crop: GardenPlot): number {
  const percent =
    getCropFullnessPercent(crop) + getOvergrownBonusPercent(crop) / 2;
  const rawKG = crop.maxKiloGrams * percent;
  return Number(rawKG.toFixed(2));
}

function getPossibleYields(crop: GardenPlot): number {
  const timeLeft = cropTimeLeft(crop, true);
  if (cropTimeLeft(crop, true) > 0) return 0;

  const growthTimePerYield = crop.growthTime;

  if (growthTimePerYield <= 0) return 0;

  const timeRemaining = -timeLeft;
  const yieldCountFromTime = Math.ceil(timeRemaining / growthTimePerYield);

  const maxPossibleYields = Math.min(crop.yields || 1, crop.harvestsLeft || 1);

  const possibleYields = Math.min(yieldCountFromTime, maxPossibleYields);

  return Math.max(0, possibleYields);
}

function getOvergrownBonusPercent(crop: GardenPlot): number {
  const timeLeft = cropTimeLeft(crop, true);
  const originalGrowth = crop.growthTime;
  const elapsed = originalGrowth - timeLeft;

  const overgrownElapsed = elapsed * originalGrowth;

  if (overgrownElapsed <= 0) return 0;

  const bonusPercent = overgrownElapsed / originalGrowth;

  return Math.floor(Math.min(bonusPercent, 2) / 2);
}

function getCropFullnessPercent(plot: GardenPlot): number {
  const timeLeft = cropTimeLeft(plot, true);
  const growthTime = plot.growthTime;
  const elapsed = growthTime - timeLeft;

  const percent = elapsed / growthTime;
  return Math.min(Math.max(percent, 0), 1);
}

async function autoUpdateCropData(
  crop: GardenPlot,
  tools: Inventory<GardenTool>,
  pets: Inventory<GardenPetActive>
) {
  if (!crop) return null;
  crop.yields ??= 1;
  crop.mutationAttempts ??= 0;
  crop.maxKiloGrams ??= randomBiased(
    CROP_CONFIG.MIN_KG,
    CROP_CONFIG.MAX_KG,
    CROP_CONFIG.KILO_BIAS
  );
  crop.maxKiloGrams = Math.max(
    Math.min(CROP_CONFIG.MAX_KG, crop.maxKiloGrams),
    CROP_CONFIG.MIN_KG
  );
  crop.originalGrowthTime ??= crop.growthTime;
  crop.mutation ??= [];
  if (typeof crop.mutation === "string") {
    crop.mutation = [crop.mutation];
  }

  if (!Array.isArray(crop.mutation)) {
    crop.mutation = [];
  }

  const isOver = isCropOvergrown(crop);
  let now = Date.now();
  const allowM = crop.lastMutation
    ? now - crop.lastMutation >= CROP_CONFIG.MUTATION_INTERVAL
    : true;

  if (
    isOver &&
    allowM &&
    crop.mutationAttempts <= CROP_CONFIG.MAX_MUTATION_ATT
  ) {
    const repeats = crop.lastMutation
      ? Math.floor((now - crop.lastMutation) / CROP_CONFIG.MUTATION_INTERVAL)
      : 1;

    const skipStamp =
      (await Cassidy.databases.globalDB.getCache("skipStamp"))?.skipStamp || 0;
    const cycle = EVENT_CONFIG.WEATHER_CYCLE_NEW;
    const adjustedNow = now + skipStamp;
    const currentCycle = Math.floor(adjustedNow / cycle);

    for (let i = 0; i < repeats; i++) {
      const simulatedTime =
        crop.lastMutation + i * CROP_CONFIG.MUTATION_INTERVAL;
      const adjustedSimTime = simulatedTime + skipStamp;
      const simCycle = Math.floor(adjustedSimTime / cycle);

      const skips = simCycle - currentCycle;
      const nextWeather = await getNextWeather(skips);

      await applyMutation(crop, tools, pets, true, nextWeather);
    }
  }

  const weather = await getCurrentWeather();

  const baseGrowthMultiplier = weather.growthMultiplier || 1;

  let growthBoost = Math.min(0.99, safeEX(baseGrowthMultiplier, 0.9));

  tools.getAll().forEach((tool) => {
    if (tool.toolData?.growthMultiplier) {
      const toolBoost = tool.toolData.growthMultiplier || 0;
      growthBoost += safeEX(toolBoost / (1 - growthBoost), 0.9);
      growthBoost = Math.min(10.0, growthBoost);
    }
  });

  crop.growthTime = Math.floor(
    Math.max(
      crop.originalGrowthTime / Math.max(growthBoost, 1),
      crop.originalGrowthTime * 0.25
    )
  );

  if ((crop.mutation ?? []).length > 0 && crop.harvestsLeft > 1) {
    crop.growthTime = Math.floor(
      crop.growthTime * CROP_CONFIG.OVERGROWTH_PENALTY
    );
  }

  for (const mutation of CROP_CONFIG.MUTATIONS) {
    if (Array.isArray(mutation.both)) {
      if (
        mutation.both.every((i) => crop.mutation.includes(i)) &&
        !crop.mutation.includes(mutation.name)
      ) {
        crop.mutation.push(mutation.name);
      }
    }
  }

  crop.mutation = [...new Set(crop.mutation)];

  crop.kiloGrams = calculateCropKG(crop);

  crop.name = String(crop.name).replaceAll("Seed", "").trim();

  crop = correctPlot(crop);

  return crop;
}

function isCropOvergrown(crop: GardenPlot) {
  const timeLeft = cropTimeLeft(crop, true);
  const originalGrowth = crop.originalGrowthTime ?? crop.growthTime;
  const growthProgress = (originalGrowth - timeLeft) / originalGrowth;

  return growthProgress >= 2;
}
// function getCropOvergrown(crop: GardenPlot) {
//   const timeLeft = cropTimeLeft(crop, true);
//   const originalGrowth = crop.originalGrowthTime ?? crop.growthTime;
//   const growthProgress = (originalGrowth - timeLeft) / originalGrowth;

//   return Math.max(0, growthProgress - 2);
// }

// function getOvergrownElapsed(crop: GardenPlot): number {
//   const timeLeft = cropTimeLeft(crop, true);
//   const originalGrowth = crop.originalGrowthTime ?? crop.growthTime;
//   const elapsed = originalGrowth - timeLeft;
//   const overgrownThreshold = 2 * originalGrowth;

//   return Math.max(0, elapsed - overgrownThreshold);
// }

async function getTimeForNextWeather() {
  const { globalDB } = Cassidy.databases;

  const { skipStamp = 0 } = await globalDB.getCache("skipStamp");
  const cycle = EVENT_CONFIG.WEATHER_CYCLE_NEW;
  const now = Date.now() + skipStamp;
  const timeIntoCycle = now % cycle;
  const timeUntilNextEvent = cycle - timeIntoCycle;
  return timeUntilNextEvent;
}

async function getCurrentWeather() {
  const { globalDB } = Cassidy.databases;
  const { skipStamp = 0 } = await globalDB.getCache("skipStamp");
  const adjustedNow = Date.now() + skipStamp;
  const weekNumber =
    Math.floor(adjustedNow / EVENT_CONFIG.WEATHER_CYCLE_NEW) %
    EVENT_CONFIG.WEATHERS.length;
  const event = EVENT_CONFIG.WEATHERS[weekNumber];

  return event;
}
async function getCurrentEvent() {
  const event = EVENT_CONFIG.CURRENT_EVENT;

  return event;
}
async function getNextWeather(skips: number = 1) {
  const { globalDB } = Cassidy.databases;
  const { skipStamp = 0 } = await globalDB.getCache("skipStamp");

  const adjustedNow = Date.now() + skipStamp;
  const cycle = EVENT_CONFIG.WEATHER_CYCLE_NEW;

  const totalCyclesPassed = Math.floor(adjustedNow / cycle) + skips;
  const len = EVENT_CONFIG.WEATHERS.length;
  const weekNumber = ((totalCyclesPassed % len) + len) % len;

  const event = EVENT_CONFIG.WEATHERS[weekNumber];

  return event;
}

function forgivingRandom(bias?: number) {
  return Math.random() ** (bias || 1.2);
}

async function skipWeather(
  skipped: number,
  targetTimeLeft = EVENT_CONFIG.WEATHER_CYCLE_NEW
) {
  const { globalDB } = Cassidy.databases;
  const cycle = EVENT_CONFIG.WEATHER_CYCLE_NEW;
  const now = Date.now();

  const { skipStamp: currentSkipStamp = 0 } = await globalDB.getCache(
    "skipStamp"
  );

  const adjustedNow = now + currentSkipStamp;
  const newAdjustedNow = adjustedNow + skipped * cycle;

  const newTimeIntoCycle = newAdjustedNow % cycle;
  const desiredTimeIntoCycle = cycle - targetTimeLeft;
  const correction = desiredTimeIntoCycle - newTimeIntoCycle;

  const finalAdjustedNow = newAdjustedNow + correction;
  const skipStamp = finalAdjustedNow - now;

  await globalDB.setItem("skipStamp", { skipStamp });

  return skipStamp;
}

async function applyMutation(
  crop: GardenPlot,
  tools: Inventory<GardenTool>,
  pets: Inventory<GardenPetActive>,
  accum = false,
  weather: GardenWeatherItem
) {
  if (!accum) {
    crop.mutation = [];
  }

  const mutationBoosts = new Map<string, number>();

  CROP_CONFIG.MUTATIONS.forEach((mutation) => {
    mutationBoosts.set(mutation.name, 0.0);
  });

  tools.getAll().forEach((tool) => {
    if (tool.toolData?.mutationChance) {
      Object.entries(tool.toolData.mutationChance).forEach(([key, value]) => {
        const currentBoost = mutationBoosts.get(key) ?? 0;
        const newBoost = currentBoost + safeEX(value / (1 - currentBoost), 0.9);
        mutationBoosts.set(key, Math.min(0.5, newBoost));
      });
    }
  });

  const mutationEffects = weather.effects ?? [];
  const mutationTypeSet = new Set(
    mutationEffects.map((e) => e.mutationType).filter(Boolean)
  );

  const mutations = [
    ...Array.from({ length: CROP_CONFIG.MBIAS }, () =>
      CROP_CONFIG.MUTATIONS.filter((m) => mutationTypeSet.has(m.name))
    ).flat(),
    ...CROP_CONFIG.MUTATIONS.filter((m) => !mutationTypeSet.has(m.name)),
  ];

  for (const mutation of mutations) {
    if (!mutation) continue;

    const matchingEffect = mutationEffects.find(
      (e) => e.mutationType === mutation.name
    );
    let mchance = matchingEffect?.mutationChance ?? mutation.chance;

    if (Array.isArray(mutation.pet)) {
      if (
        mutation.pet.some((i) => pets.has(i)) &&
        !crop.mutation.includes(mutation.name)
      ) {
        mchance = mutation.chance;
      } else {
        mchance = 0;
      }
    }

    const roll = Math.random();
    const boost =
      mchance === 0
        ? 0
        : Math.min(0.99, mutationBoosts.get(mutation.name) ?? 0);
    const chance = Math.min(0.5, mchance * (1 + boost));

    if (roll <= chance && Math.random() < 0.3) {
      if (!crop.mutation.includes(mutation.name)) {
        crop.mutation.push(mutation.name);
      }
    }
  }
  crop.mutationAttempts ??= 0;
  crop.lastMutation = Date.now();
  crop.mutationAttempts++;
  return crop;
}
function getMutation(name: string) {
  return CROP_CONFIG.MUTATIONS.find((m) => m.name === name);
}

function formatMutationStr(plot: GardenPlot | GardenBarn) {
  if (!plot) {
    return ` ❔ **Nothing**`;
  }
  return `${
    (plot.mutation ?? []).length > 0
      ? `[ ${plot.mutation
          .map(
            (i) =>
              `${getMutation(i)?.icon ?? "❓"} ${FontSystem.fonts.double_struck(
                i
              )}`
          )
          .join(" + ")} ] `
      : ""
  }${plot.icon} **${plot.name}** (${plot.kiloGrams}kg)`;
}

// function updatePetCollection(
//   pet: GardenPetActive,
//   inventory: Inventory<GardenItem>,
//   ctx: CommandContext
// ): {
//   pet: GardenPetActive;
//   collections: number;
//   inventory: Inventory<GardenItem>;
//   collected: GardenItem[];
// } {
//   if (!pet.isEquipped) return { pet, collections: 0, inventory, collected: [] };
//   const currentTime = Date.now();
//   const timeSinceLastCollect = currentTime - (pet.lastCollect || currentTime);
//   const collections = Math.round(
//     Math.floor(timeSinceLastCollect / (60 * 1000)) * pet.petData.collectionRate
//   );
//   const collected: GardenItem[] = [];
//   if (collections >= 1) {
//     const shopItems = [...gardenShop.itemData, ...gardenShop.eventItems];
//     pet.lastCollect = currentTime;
//     for (let i = 0; i < collections; i++) {
//       // const seed =
//       //   pet.petData.seedTypes[
//       //     Math.floor(Math.random() * pet.petData.seedTypes.length)
//       //   ];
//       const seed = pickRandomWithProb(
//         pet.petData.seedTypes.map((i) => {
//           const shopItem = shopItems.find((item) => item.key === i);
//           return {
//             chance: (shopItem?.stockChance ?? 0) ** 9,
//             value: i,
//           };
//         })
//       );

//       if (!seed) {
//         continue;
//       }

//       const shopItem = shopItems.find((item) => item.key === seed);
//       if (Math.random() < shopItem.stockChance) {
//         if (shopItem && inventory.size() < global.Cassidy.invLimit) {
//           const cache = inventory.getAll();
//           const cache2 = [...cache];
//           shopItem.onPurchase({ ...ctx, moneySet: { inventory: cache } });
//           inventory = new Inventory(cache);
//           const newItems = cache.filter((i) => !cache2.includes(i));
//           collected.push(...newItems);
//         }
//       }
//     }
//   }
//   return { pet, collections: collected.length, inventory, collected };
// }

async function checkAchievements(
  user: UserData,
  money: UserStatsManager,
  output: OutputProps,
  input: InputClass
) {
  const plotsHarvested = user.gardenStats?.plotsHarvested || 0;
  const mutationsFound = user.gardenStats?.mutationsFound || 0;
  const expansions = user.gardenStats?.expansions || 0;
  let newMoney = user.money || 0;
  let achievementsUnlocked: string[] = [];

  for (const achievement of CROP_CONFIG.ACHIEVEMENTS) {
    if (!user.gardenStats?.achievements?.includes(achievement.key)) {
      if (
        achievement.key === "harvest_100" &&
        plotsHarvested >= achievement.harvests
      ) {
        newMoney += achievement.reward;
        achievementsUnlocked.push(
          `${achievement.name} (+${formatCash(achievement.reward)})`
        );
        user.gardenStats.achievements = user.gardenStats.achievements || [];
        user.gardenStats.achievements.push(achievement.key);
      } else if (
        achievement.key === "mutation_10" &&
        mutationsFound >= achievement.mutations
      ) {
        newMoney += achievement.reward;
        achievementsUnlocked.push(
          `${achievement.name} (+${formatCash(achievement.reward)})`
        );
        user.gardenStats.achievements = user.gardenStats.achievements || [];
        user.gardenStats.achievements.push(achievement.key);
      } else if (
        achievement.key === "expand_1" &&
        expansions >= achievement.expansions
      ) {
        newMoney += achievement.reward;
        achievementsUnlocked.push(
          `${achievement.name} (+${formatCash(achievement.reward)})`
        );
        user.gardenStats.achievements = user.gardenStats.achievements || [];
        user.gardenStats.achievements.push(achievement.key);
      }
    }
  }

  if (achievementsUnlocked.length > 0) {
    await money.setItem(user.senderID, {
      money: newMoney,
      gardenStats: user.gardenStats,
    });
    if (!input.isWeb) {
      await output.replyStyled(
        `🏆 **Achievements Unlocked**:\n${achievementsUnlocked.join(
          "\n"
        )}\n\n💰 New Balance: ${formatCash(newMoney)}`,
        style
      );
    }
  }
}

let officialUpdatedAt: number = null;
const USE_TRUE_STOCK = false;

async function refreshShopStock(force = false) {
  const currentTime = Date.now();
  const timeLeft = getTimeUntilRestock();

  if (timeLeft > 0 && !force) {
    return false;
  }
  console.log("Restocking...");
  let stocks: Awaited<ReturnType<typeof fetchSeedStock>>;
  if (USE_TRUE_STOCK) {
    stocks = await fetchSeedStock();

    if (typeof stocks.updatedAt === "number") {
      if (officialUpdatedAt === stocks.updatedAt) {
        return false;
      }
      officialUpdatedAt = stocks.updatedAt;

      const timePassed = currentTime - officialUpdatedAt;
      const timeLeft =
        (Math.abs(timePassed) % gardenShop.stockRefreshInterval) + 1000;
      gardenShop.lastRestock = currentTime - Math.abs(timeLeft);
      console.log({
        timeLeft,
        timePassed,
        newRestock: currentTime - timeLeft,
      });
      if (getTimeUntilRestock() <= 0) {
        gardenShop.lastRestock = currentTime;
      }
    } else {
      gardenShop.lastRestock = currentTime;
    }
  } else {
    gardenShop.lastRestock = currentTime;
  }
  const event = await getCurrentEvent();
  gardenShop.eventItems = [];

  if (event.shopItems && event.shopItems.length > 0) {
    event.shopItems.forEach((shopItem) => {
      if (!gardenShop.eventItems.some((item) => item.key === shopItem.key)) {
        gardenShop.eventItems.push({ ...shopItem, isEventItem: true });
      }
    });
  }

  const getStock = (item: gardenShop.GardenShopItem) => {
    return typeof item.minStock === "number" &&
      typeof item.maxStock === "number"
      ? Math.ceil(
          randomBiased(item.minStock, item.maxStock, CROP_CONFIG.STOCK_MIN_BIAS)
        )
      : Infinity;
  };
  for (const item of gardenShop.itemData) {
    let fetched =
      stocks && USE_TRUE_STOCK && Array.isArray(stocks.seeds)
        ? stocks.seeds.find(
            (i) =>
              item.name.includes(i) ||
              String(i).includes(item.name) ||
              item.name.split(" ")[0] === String(i).split(" ")[0]
          )
        : null;
    const localChance = USE_TRUE_STOCK
      ? false
      : forgivingRandom() < item.stockChance;
    item.inStock = !!fetched || localChance;
    item.isOfficialStock = !!fetched;
    const reg = /\*\*x(\d+)\*\*/;
    const stockOf = Number(fetched?.match(reg)?.[1]);
    if (!isNaN(stockOf)) {
      item.stockLimitOfficial = stockOf;
    } else {
      delete item.stockLimitOfficial;
    }
    item.stockLimit = getStock(item);
  }

  gardenShop.eventItems.forEach((item) => {
    item.inStock = forgivingRandom() < item.stockChance;
    item.stockLimit = getStock(item);
  });
  gardenShop.gnpShop.forEach((item) => {
    item.inStock = forgivingRandom() < item.stockChance;
    item.stockLimit = getStock(item);
  });

  return true;
}

function getTimeUntilRestock() {
  const currentTime = Date.now();
  const timePassed = currentTime - gardenShop.lastRestock;
  const timeLeft = gardenShop.stockRefreshInterval - timePassed;

  return Math.max(0, timeLeft);
}

function formatShopItems(
  items = gardenShop,
  currentEvent: GardenEventItem,
  isEvent = false
): typeof gardenShop {
  const timeText = `🕒 **Next Restock**:\n${formatTimeSentence(
    getTimeUntilRestock()
  )}`;
  return {
    ...items,
    // itemData: items.itemData.filter((item) => item.inStock !== false),
    itemData: items.itemData
      .map((item) => {
        let noStock = item.inStock === false;
        let flavor = item.flavorText || "";
        if (item.isOfficialStock) {
          // flavor = `🌱 **STOCKED IN ROBLOX!**\n${flavor}`;
        }
        const moneySet: { inventory: GardenItem[] } = { inventory: [] };
        item.onPurchase({ moneySet });
        const purchased = moneySet.inventory[0];
        if (purchased) {
          if (purchased.type === "gardenSeed") {
            flavor = `${`***${item.rarity}*** - ${Math.round(
              (item.stockChance ?? 1) * 100
            )}%`.toUpperCase()}\n🪙 ${abbreviateNumber(
              purchased.cropData.baseValue || 0
            )} | 🧺 ${abbreviateNumber(
              purchased.cropData.harvests || 0
            )} | ⏳ ${
              formatTimeSentence(purchased.cropData.growthTime || 0) ||
              "Instant"
            }`;
          }
        }
        const stockLimit = item.stockLimitOfficial ?? item.stockLimit;
        return {
          ...item,
          cannotBuy: noStock,
          stockLimit,
          flavorText: noStock ? `` : flavor,
        };
      })
      .filter((i) => i.inStock !== false),
    buyTexts: [timeText],
    thankTexts: [timeText],
    ...(currentEvent?.isNoEvent !== true && isEvent && currentEvent
      ? {
          welcomeTexts: [
            `Welcome to the ${currentEvent?.icon ?? "🌱"} **${
              currentEvent.shopName2 ?? "Event Shop."
            }!**`,
          ],
          key: currentEvent?.shopName,
        }
      : {}),
  };
}

function correctItems(rawInv: GardenItem[]) {
  const allItems = [
    ...gardenShop.itemData,
    ...[EVENT_CONFIG.CURRENT_EVENT]
      .map((i) => (i.shopItems ?? []) as typeof gardenShop.itemData)
      .flat(),
    ...EVENT_CONFIG.EVENTS_CONSTRUCTION.map(
      (i) => (i.shopItems ?? []) as typeof gardenShop.itemData
    ).flat(),
  ];
  for (const item of rawInv ?? []) {
    const found = allItems.find((i) => i?.key === item?.key);
    if (found) {
      const temp = [];
      found.onPurchase({ moneySet: { inventory: temp } });
      const newItem = temp[0] as GardenItem;
      if (newItem && newItem.key === item.key) {
        Object.assign(item, newItem);
      }
    }
  }
  return rawInv;
}
function correctPlot(plot: GardenPlot) {
  const allItems = [
    ...gardenShop.itemData,
    ...[EVENT_CONFIG.CURRENT_EVENT]
      .map((i) => (i.shopItems ?? []) as typeof gardenShop.itemData)
      .flat(),
    ...EVENT_CONFIG.EVENTS_CONSTRUCTION.map(
      (i) => (i.shopItems ?? []) as typeof gardenShop.itemData
    ).flat(),
  ];

  const found = allItems.find((i) => i?.key === plot?.seedKey);
  if (found) {
    const temp = [];
    found.onPurchase({ moneySet: { inventory: temp } });
    const foundSeed = temp[0] as GardenSeed;
    if (foundSeed && foundSeed.key === plot.seedKey && foundSeed.cropData) {
      if (plot.baseValue !== foundSeed.cropData.baseValue) {
        plot.baseValue = foundSeed.cropData.baseValue;
        plot.harvestsLeft = foundSeed.cropData.harvests;
        plot.price =
          found.priceType !== "money" && found.priceType
            ? 0
            : Math.min(
                foundSeed.cropData.baseValue || 0,
                (found.price ?? foundSeed.cropData.baseValue) /
                  (foundSeed.cropData.harvests || 1)
              );
      }

      plot.yields = foundSeed.cropData.yields;

      plot.originalGrowthTime = foundSeed.cropData.growthTime;
    }
  }
  return plot;
}

// interface NotifMapItem {
//   threads: Array<{
//     timeout: NodeJS.Timeout;
//     threadID: string;
//     output: OutputProps;
//     ts: number;
//   }>;
//   userID: string;
// }

// export async function registerNotif(ctx: CommandContext) {
//   const { input, output } = ctx;
//   if (input.isWeb) return;

//   const now = Date.now();
//   const userID = input.senderID;
//   const threadID = input.threadID;

//   let notifMap = NOTIF_MAP.find((i) => i.userID === userID);
//   if (!notifMap) {
//     notifMap = { userID, threads: [] };
//     NOTIF_MAP.push(notifMap);
//   }

//   const threads = notifMap.threads;
//   const ex = threads.find((i) => i.threadID === threadID);

//   if (!ex) {
//     const timeout = setTimeout(() => {
//       notifJob(output, userID, threadID);
//       const idx = threads.findIndex((i) => i.threadID === threadID);
//       if (idx !== -1) threads.splice(idx, 1);
//     }, CROP_CONFIG.NOTIF_TIMEOUT);

//     threads.push({
//       output,
//       threadID,
//       timeout,
//       ts: now,
//     });
//   }
// }

// export const NOTIF_MAP: NotifMapItem[] = [];

// export async function notifJob(
//   output: OutputProps,
//   uid: string,
//   threadID: string
// ) {
//   const { databases } = global.Cassidy;
//   const { usersDB } = databases;
//   let {
//     name = "",
//     gardenPlots: rawPlots = [],
//     gardenPets: rawPets = [],
//     inventory: rawInventory = [],
//     // money: userMoney = 0,
//     // gardenStats = {
//     //   plotsHarvested: 0,
//     //   mutationsFound: 0,
//     //   expansions: 0,
//     //   achievements: [],
//     // },
//     // plotLimit = PLOT_LIMIT,
//     // lastSideExpansion = 0,
//     // lastRearExpansion1 = 0,
//     // lastRearExpansion2 = 0,
//     // allowGifting = true,
//     // gardenEarns = 0,
//     // collectibles: rawCLL,
//     // enableGardenNotif = false,
//   } = await usersDB.getCache(uid);
//   // if (!enableGardenNotif) {
//   //   return;
//   // }

//   const plots = new Inventory<GardenPlot>(rawPlots);
//   const exiTool = new Inventory(
//     rawInventory.filter(
//       (item): item is GardenTool => item.type === "gardenTool"
//     )
//   );
//   const exiPets = new Inventory<GardenPetActive>(rawPets, PET_LIMIT);
//   rawPlots.forEach((i: GardenPlot) => autoUpdateCropData(i, exiTool, exiPets));

//   const updatedPlots = new Inventory<GardenPlot>();

//   for (const plot of plots) {
//     const updated = await autoUpdateCropData(plot, exiTool, exiPets);
//     updatedPlots.addOne(updated);
//   }

//   const mutationUpdates: Array<{
//     added: string[];
//     all: string[];
//     plot: GardenPlot;
//   }> = [];

//   for (const plot of updatedPlots) {
//     const outdated = plots.getOne(plot.key);
//     if (!outdated) continue;

//     const oldMut = outdated.mutation ?? [];
//     const newMut = plot.mutation ?? [];

//     const addedMut = newMut.filter((i) => !oldMut.includes(i));
//     if (addedMut.length > 0) {
//       mutationUpdates.push({
//         added: addedMut,
//         all: newMut,
//         plot,
//       });
//     }
//   }

//   if (mutationUpdates.length > 0) {
//     return output.sendStyled(
//       `🌱 Congratulations, **${name}**! Some of your crops mutated!\n\n${mutationUpdates
//         .slice(0, 20)
//         .map((i) => formatMutationStr(i.plot))
//         .join("\n")}`,
//       gardenNotif,
//       threadID
//     );
//   }
// }

// const gardenNotif: CommandStyle = {
//   title: {
//     content: `🔔 ${UNISpectra.charm} **G🍓rden** Notification`,
//     text_font: "fancy",
//     line_bottom: "default",
//   },
//   contentFont: "fancy",
//   footer: {
//     content: "Rewards multiply with success.",
//     text_font: "fancy",
//   },
// };

// ---- The main shi ----
export async function entry(ctx: CommandContext) {
  // await registerNotif(ctx);
  const {
    input,
    output,
    money,
    Inventory,
    UTShop,
    prefix,
    commandName,
    command,
    fonts,
  } = ctx;
  await money.ensureUserInfo(input.senderID);

  await (async () => {
    const { money: balance, gardenPlots: rawPlots = [] } = await money.getCache(
      input.senderID
    );
    if (balance <= 0 && rawPlots.length === 0) {
      await money.setItem(input.senderID, {
        money: balance + 40,
      });
    }
  })();

  let {
    name = "",
    gardenPlots: rawPlots = [],
    gardenPlotsBefore: rawPlotsBefore = [],
    gardenBarns: rawBarns = [],
    gardenPets: rawPets = [],
    gardenHeld = "",
    inventory: rawInventory = [],
    money: userMoney = 0,
    gardenStats: _gs = {
      plotsHarvested: 0,
      mutationsFound: 0,
      expansions: 0,
      achievements: [],
    },
    plotLimit = PLOT_LIMIT,
    lastSideExpansion = 0,
    lastRearExpansion1 = 0,
    lastRearExpansion2 = 0,
    // allowGifting = true,
    gardenEarns = 0,
    collectibles: rawCLL,
  } = await money.getCache(input.senderID);
  const gardenStats = _gs as GardenStats;
  let isHypen = !!input.propertyArray[0];
  const collectibles = new Collectibles(rawCLL);
  correctItems(rawInventory as GardenItem[]);
  const exiTool = new Inventory(
    rawInventory.filter(
      (item): item is GardenTool => item.type === "gardenTool"
    )
  );
  const exiPets = new Inventory<GardenPetActive>(rawPets, PET_LIMIT);
  rawPlots.forEach((i: GardenPlot) => autoUpdateCropData(i, exiTool, exiPets));

  gardenEarns = gardenEarns || 0;
  gardenEarns = Math.max(gardenEarns, 0);

  const currWeather = await getCurrentWeather();
  let hasWeather = !currWeather.isNoEvent;
  const plotSorts = [
    "latest",
    "lowest",
    "highest",
    "smallest",
    "largest",
    "least-time",
    "most-time",
  ] as const;

  const currEvent = await getCurrentEvent();
  const xBarn = new Inventory<GardenBarn>(rawBarns, CROP_CONFIG.BARN_LIMIT);

  const currentHeld = xBarn.getOneByID(gardenHeld);
  const style: CommandStyle = {
    ...command.style,
    title: {
      content: `${currEvent.icon} ${UNISpectra.charm} **G🍓rden**`,
      text_font: "fancy",
      line_bottom: "default",
    },
    footer: {
      content: hasWeather
        ? `${currWeather.icon} Weather: **${currWeather.name}**${
            currWeather.effects?.length
              ? " - " +
                currWeather.effects
                  .map(
                    (e) =>
                      `${Math.round((e.mutationChance ?? 0) * 100)}% ${
                        e.mutationType
                      } mutations`
                  )
                  .join(", ")
              : ""
          }`
        : "Rewards multiply with success.",
      text_font: "fancy",
    },
    // ...(xBarn.hasByID(gardenHeld)
    //   ? {
    //       held: {
    //         content: `🫴 ${formatMutationStr(currentHeld)}`,
    //         text_font: "fancy",
    //         line_top: "default",
    //       },
    //     }
    //   : {}),
  };

  if (!name || name === "Unregistered") {
    return output.reply(
      `🌱 Please register first!\nUse: **${prefix}register** without fonts.`
    );
  }

  output.setStyle(style);

  const isRef = await refreshShopStock();

  const home = new SpectralCMDHome({ isHypen }, [
    {
      key: "shop",
      description: "Visit the Shop",
      aliases: ["-sh"],
      icon: "🛒",
      async handler() {
        const shop = new UTShop({
          ...formatShopItems(gardenShop, currEvent),
          style,
        });
        if (isRef) {
          shop.resetStocks(
            ...gardenShop.itemData
              .filter((i) => i.inStock !== false)
              .map((i) => i.key)
          );
        }
        await shop.onPlay({ ...ctx, args: [] });
      },
    },
    {
      key: "gnpshop",
      description: "Visit the Gears & Pets Shop",
      aliases: ["-gnpsh", "-gnp"],
      icon: "🛒",
      async handler() {
        const shop = new UTShop({
          ...formatShopItems(
            { ...gardenShop, itemData: gardenShop.gnpShop },
            currEvent
          ),
          style,
        });
        if (isRef) {
          shop.resetStocks(
            ...gardenShop.gnpShop
              .filter((i) => i.inStock !== false)
              .map((i) => i.key)
          );
        }
        await shop.onPlay({ ...ctx, args: [] });
      },
    },
    ...(((currEvent.shopItems ?? []).length > 0
      ? [
          {
            key: currEvent?.shopName ?? "eventshop",
            description: `Shop for ${currEvent.name}.`,
            aliases: [...(currEvent.shopAlias ?? []), "-esh", "eshop"],
            icon: `${currEvent.icon ?? "🛒"}`,
            async handler() {
              const shop = new UTShop({
                ...formatShopItems(
                  {
                    ...gardenShop,
                    itemData: gardenShop.eventItems,
                  },
                  currEvent,
                  true
                ),
                style,
              });
              if (isRef) {
                shop.resetStocks(
                  ...gardenShop.eventItems
                    .filter((i) => i.inStock !== false)
                    .map((i) => i.key)
                );
              }
              await shop.onPlay({ ...ctx, args: [] });
            },
          },
        ]
      : []) as Config[]),
    {
      key: "sell",
      description: "sell stuffs in Steven's stand!",
      aliases: ["-s"],
      icon: "🌱",
      async handler(_, {}) {
        const str = `🧑‍🌾 Got anything to sell?`;
        const choices: GardenChoiceConfig["choices"] = [
          {
            txt: `I want to sell my entire barn.`,
            async callback(rep) {
              const { gardenBarns = [], money: userMoney = 0 } =
                await rep.usersDB.getCache(rep.uid);
              const barns = new Inventory<GardenBarn>(
                gardenBarns,
                CROP_CONFIG.BARN_LIMIT
              );
              const canBuy = barns.getAll().filter((i) => !i.isFavorite);
              if (canBuy.length === 0) {
                return rep.output.reply(
                  `${UNISpectra.charm} 💬 🧑‍🌾 Nothing to buy.`
                );
              }
              let acc = 0;
              for (const item of canBuy) {
                acc += item.value || 0;
                barns.deleteByID(item.uuid);
              }
              const newMoney = userMoney + (acc || 0);
              await rep.usersDB.setItem(rep.uid, {
                gardenBarns: Array.from(barns),
                money: newMoney,
              });
              return rep.output.reply(
                `${UNISpectra.charm} 💬 🧑‍🌾 Here's your ${formatCash(
                  acc,
                  true
                )}\n\n💰 New Balance: ${formatCash(newMoney)}`
              );
            },
          },
          {
            txt: `I want to sell this 🫴 ${
              currentHeld ? formatMutationStr(currentHeld) : "[no held item]"
            }`,
            async callback(rep) {
              const {
                gardenBarns = [],
                money: userMoney = 0,
                gardenHeld = "",
              } = await rep.usersDB.getCache(rep.uid);
              const barns = new Inventory<GardenBarn>(
                gardenBarns,
                CROP_CONFIG.BARN_LIMIT
              );
              const canBuy = [barns.getOneByID(gardenHeld)]
                .filter(Boolean)
                .filter((i) => !i.isFavorite);
              if (canBuy.length === 0) {
                return rep.output.reply(
                  `${UNISpectra.charm} 💬 🧑‍🌾 I don't see anything.\n\n💡 Hint: try opening your garden barn and hold an item!`
                );
              }
              let acc = 0;
              for (const item of canBuy) {
                acc += item.value || 0;
                barns.deleteByID(item.uuid);
              }
              const newMoney = userMoney + (acc || 0);
              await rep.usersDB.setItem(rep.uid, {
                gardenBarns: Array.from(barns),
                money: newMoney,
              });
              return rep.output.reply(
                `${UNISpectra.charm} 💬 🧑‍🌾 Here's your ${formatCash(
                  acc,
                  true
                )}\n\nSold: ${formatMutationStr(
                  canBuy[0]
                )}\n💰 New Balance: ${formatCash(newMoney)}`
              );
            },
          },

          {
            txt: `How much is this ${
              currentHeld ? formatMutationStr(currentHeld) : "[no held item]"
            } worth?`,
            async callback(rep) {
              const { gardenBarns = [], gardenHeld = "" } =
                await rep.usersDB.getCache(rep.uid);
              const barns = new Inventory<GardenBarn>(
                gardenBarns,
                CROP_CONFIG.BARN_LIMIT
              );
              const canBuy = [barns.getOneByID(gardenHeld)]
                .filter(Boolean)
                .filter((i) => !i.isFavorite);
              if (canBuy.length === 0) {
                return rep.output.reply(
                  `${UNISpectra.charm} 💬 🧑‍🌾 I don't see anything.\n\n💡 Hint: try opening your garden barn and hold an item!`
                );
              }
              let acc = 0;
              for (const item of canBuy) {
                acc += item.value || 0;
              }

              return rep.output.reply(
                `${UNISpectra.charm} 💬 🧑‍🌾 I'd value the ${formatMutationStr(
                  canBuy[0]
                )} at ${formatCash(acc, true)}`
              );
            },
          },

          {
            txt: `Nevermind.`,
            callback(rep) {
              return rep.output.reply(`${UNISpectra.charm} 💬 🧑‍🌾 Goodbye!`);
            },
          },
        ];
        const st: CommandStyle = {
          ...style,
          ...(xBarn.hasByID(gardenHeld)
            ? {
                held: {
                  content: `🫴 ${formatMutationStr(currentHeld)}`,
                  text_font: "fancy",
                },
              }
            : {}),
        };
        delete st.footer;
        const x = GardenChoice({
          title: str,
          choices,
          style: st,
        });
        return x(ctx);
      },
    },
    {
      key: "plant",
      description: "Plant one or more seeds in plots",
      aliases: ["-p"],
      args: ["[seed_key] [quantity]"],
      icon: "🌱",
      async handler(_, { spectralArgs }) {
        let inventory = new Inventory<GardenItem | InventoryItem>(rawInventory);
        let plots = new Inventory<GardenPlot>(rawPlots, plotLimit);
        let seeds = inventory
          .toUnique()
          .filter((item): item is GardenSeed => item.type === "gardenSeed");
        const availablePlots = plotLimit - plots.getAll().length;
        if (availablePlots <= 0) {
          return output.replyStyled(
            `🌱 Max plots reached (${
              plots.getAll().length
            }/${plotLimit})! Harvest with ${prefix}${commandName}${
              isHypen ? "-" : " "
            }harvest or expand with ${prefix}${commandName}${
              isHypen ? "-" : " "
            }expand.\n\n` +
              `**Next Steps**:\n` +
              `${UNISpectra.arrowFromT} Harvest crops: ${prefix}${commandName}${
                isHypen ? "-" : " "
              }harvest\n` +
              `${UNISpectra.arrowFromT} Expand plot: ${prefix}${commandName}${
                isHypen ? "-" : " "
              }expand`,
            style
          );
        }
        if (seeds.length === 0) {
          return output.replyStyled(
            `🌱 No seeds! Buy some with ${prefix}${commandName}${
              isHypen ? "-" : " "
            }shop.\n\n` +
              `**Next Steps**:\n` +
              `${UNISpectra.arrowFromT} Visit shop: ${prefix}${commandName}${
                isHypen ? "-" : " "
              }shop\n` +
              `${UNISpectra.arrowFromT} Check items: ${prefix}${commandName}${
                isHypen ? "-" : " "
              }list`,
            style
          );
        }

        let seed: GardenSeed | null = null;
        let quantity =
          parseBet(
            spectralArgs[1],
            inventory.getAmount(spectralArgs[0] || "")
          ) || 1;
        quantity = Math.min(
          quantity,
          availablePlots,
          inventory.getAmount(spectralArgs[0] || "")
        );
        if (spectralArgs[0]) {
          const selected = inventory.getOne(spectralArgs[0]);
          if (selected && selected.type === "gardenSeed") {
            seed = selected as GardenSeed;
          }
        }
        if (!seed || quantity < 1) {
          const seedList = seeds
            .map(
              (s) =>
                `**x${inventory.getAmount(s.key)}** ${s.icon} **${
                  s.name
                }** (Key: **${s.key}**)`
            )
            .join("\n");
          return output.replyStyled(
            `❌ Invalid seed key${
              spectralArgs[0] ? ` "${spectralArgs[0]}"` : ""
            } or quantity! Use: ${prefix}${commandName}${
              isHypen ? "-" : " "
            }plant [seed_key] [quantity]\n\n` +
              `**Available Seeds**:\n${seedList || "None"}\n\n` +
              `**Next Steps**:\n` +
              `${UNISpectra.arrowFromT} List items: ${prefix}${commandName}${
                isHypen ? "-" : " "
              }list\n` +
              `${UNISpectra.arrowFromT} Buy seeds: ${prefix}${commandName}${
                isHypen ? "-" : " "
              }shop`,
            style
          );
        }

        const planted: string[] = [];
        let firstPlot: GardenPlot = null;
        for (let i = 0; i < quantity; i++) {
          if (
            inventory.getAmount(seed.key) <= 0 ||
            plots.getAll().length >= plotLimit
          )
            break;
          inventory.deleteOne(seed.key);
          const constructions = EVENT_CONFIG.EVENTS_CONSTRUCTION.map(
            (i) => (i.shopItems ?? []) as typeof gardenShop.itemData
          ).flat();
          if (constructions.some((i) => i.key === seed.key)) {
            return output.reply(
              `🚧 This seed is currently in construction. You **cannot** use it right now.\n\n` +
                `**Next Steps**:\n` +
                `${UNISpectra.arrowFromT} List items: ${prefix}${commandName}${
                  isHypen ? "-" : " "
                }list\n` +
                `${UNISpectra.arrowFromT} Buy seeds: ${prefix}${commandName}${
                  isHypen ? "-" : " "
                }shop`
            );
          }
          const allItems = [
            ...gardenShop.itemData,
            ...[EVENT_CONFIG.CURRENT_EVENT]
              .map((i) => (i.shopItems ?? []) as typeof gardenShop.itemData)
              .flat(),
            ...constructions,
          ];
          const shopItem = allItems.find((i) => seed.key === i?.key);
          const priceInt = shopItem?.price ?? seed.cropData.baseValue;
          const price =
            shopItem.priceType !== "money" && shopItem.priceType
              ? 0
              : Math.min(
                  seed.cropData.baseValue || 0,
                  priceInt / (seed.cropData.harvests || 1)
                );
          let plot: GardenPlot = {
            key: `plot_${Date.now()}_${i}`,
            seedKey: seed.key,
            name: `${seed.name}`.replaceAll("Seeds", "").trim(),
            icon: seed.icon,
            plantedAt: Date.now(),
            growthTime: seed.cropData.growthTime,
            originalGrowthTime: seed.cropData.growthTime,
            harvestsLeft: seed.cropData.harvests,
            baseValue: seed.cropData.baseValue,
            mutation: [],
            type: "activePlot",
            yields: seed.cropData.yields,
            isFavorite: false,
            price,
            lastMutation: null,
            kiloGrams: 0,
            maxKiloGrams: randomBiased(
              CROP_CONFIG.MIN_KG,
              CROP_CONFIG.MAX_KG,
              CROP_CONFIG.KILO_BIAS
            ),
            mutationAttempts: 0,
          };
          if (Math.random() < 0.1) {
            plot = await applyMutation(
              plot,
              new Inventory<GardenTool>(
                rawInventory.filter(
                  (item) => item.type === "gardenTool"
                ) as GardenTool[]
              ),
              exiPets,
              false,
              currWeather
            );
          }
          plot.mutationAttempts = 0;
          plot = await autoUpdateCropData(
            plot,
            new Inventory<GardenTool>(
              rawInventory.filter(
                (item) => item.type === "gardenTool"
              ) as GardenTool[]
            ),
            exiPets
          );

          firstPlot ??= plot;
          plots.addOne(plot);
          if (plot.mutation.length > 0) {
            gardenStats.mutationsFound =
              (gardenStats.mutationsFound || 0) + plot.mutation.length;
          }

          planted.push(
            formatMutationStr({ ...plot, name: seed.name, icon: seed.icon })
          );
        }

        await money.setItem(input.senderID, {
          inventory: Array.from(inventory),
          gardenPlots: Array.from(plots),
          gardenStats,
        });
        await checkAchievements(
          {
            ...ctx.user,
            gardenStats,
            senderID: input.senderID,
            money: userMoney,
          },
          money,
          output,
          input
        );

        return ctx.output.replyStyled(
          `🌱 Planted ${planted.length} seed${
            planted.length !== 1 ? "s" : ""
          } (${plots.getAll().length}/${plotLimit} plots):\n${planted.join(
            "\n"
          )}\n` +
            `⏳ First ready in: ${
              formatTimeSentence(cropTimeLeft(firstPlot)) ||
              "***ALREADY READY!***"
            }\n\n` +
            `**Next Steps**:\n` +
            `${UNISpectra.arrowFromT} Check plots: ${prefix}${commandName}${
              isHypen ? "-" : " "
            }plots\n` +
            `${UNISpectra.arrowFromT} Harvest later: ${prefix}${commandName}${
              isHypen ? "-" : " "
            }harvest`,
          style
        );
      },
    },
    {
      key: "collect",
      description: "Collect ready crops",
      aliases: ["-c", "-h", "harvest"],
      icon: "🧺",
      args: ["'all'|seed_key"],
      async handler(_, { spectralArgs }) {
        let origEarns = gardenEarns;
        const plots = new Inventory<GardenPlot>(rawPlots, plotLimit);
        const barn = new Inventory<GardenBarn>(
          rawBarns,
          CROP_CONFIG.BARN_LIMIT
        );
        let inventory = new Inventory<GardenItem | InventoryItem>(rawInventory);
        let moneyEarned = 0;
        const harvested: {
          plot: GardenPlot;
          value: ReturnType<typeof calculateCropValue>;
        }[] = [];
        const seedsGained: string[] = [];
        const tools = new Inventory<GardenTool>(
          rawInventory.filter(
            (item) => item.type === "gardenTool"
          ) as GardenTool[]
        );

        const sortedPlots = [...plots].sort(
          (a, b) =>
            calculateCropValue(b).allYield - calculateCropValue(a).allYield
        );

        const type = spectralArgs[0];

        const isAll = type === "all";

        if ((!type || !sortedPlots.some((i) => i.seedKey === type)) && !isAll) {
          const plotList = Datum.toUniqueArray(sortedPlots, (i) => i.seedKey)
            .filter(isCropReady)
            .map(
              (s) =>
                `**x${
                  plots.getAll().filter((i) => i.seedKey === s.seedKey).length
                }** ${s.icon} **${s.name}** (Key: **${s.seedKey}**)`
            )
            .join("\n");
          return output.replyStyled(
            `🌱 Please specify "all" or a seed key to collect.\n\n` +
              `**Plots**:\n${plotList || "None"}\n\n` +
              `**Next Steps**:\n` +
              `${UNISpectra.arrowFromT} List plots: ${prefix}${commandName}${
                isHypen ? "-" : " "
              }plots\n` +
              `${UNISpectra.arrowFromT} Buy seeds: ${prefix}${commandName}${
                isHypen ? "-" : " "
              }shop`,
            style
          );
        }

        const readyPlots: GardenPlot[] = [];
        for (const plot of sortedPlots) {
          const item = await autoUpdateCropData(plot, tools, exiPets);
          if (isCropReady(item) && readyPlots.length < 20) {
            if (isAll || item.seedKey === type) {
              readyPlots.push(item);
            }
          }
        }
        if (readyPlots.length === 0) {
          return output.replyStyled(
            `🌱 No crops ready! Check plots with ${prefix}${commandName}${
              isHypen ? "-" : " "
            }plots.\n\n` +
              `**Next Steps**:\n` +
              `${UNISpectra.arrowFromT} View plots: ${prefix}${commandName}${
                isHypen ? "-" : " "
              }plots\n` +
              `${UNISpectra.arrowFromT} Plant seeds: ${prefix}${commandName}${
                isHypen ? "-" : " "
              }plant`,
            style
          );
        }
        if (barn.isFull()) {
          return output.replyStyled(
            `🌱 Barn is full! Check barn items with ${prefix}${commandName}${
              isHypen ? "-" : " "
            }barn.\n\n` +
              `**Next Steps**:\n` +
              `${UNISpectra.arrowFromT} View plots: ${prefix}${commandName}${
                isHypen ? "-" : " "
              }plots\n` +
              `${UNISpectra.arrowFromT} Plant seeds: ${prefix}${commandName}${
                isHypen ? "-" : " "
              }plant`,
            style
          );
        }

        for (const plot of readyPlots) {
          await autoUpdateCropData(
            plot,
            new Inventory<GardenTool>(
              rawInventory.filter(
                (item) => item.type === "gardenTool"
              ) as GardenTool[]
            ),
            exiPets
          );

          if (plot.mutation.length > 0) {
            gardenStats.mutationsFound =
              (gardenStats.mutationsFound || 0) + plot.mutation.length;
          }
          const value = calculateCropValue(plot);
          const collected = toBarnItem(plot);
          let yields = Math.min(
            value.yields,
            CROP_CONFIG.BARN_LIMIT - barn.size()
          );
          barn.add(collected.slice(0, yields));
          if (yields <= 0) {
            continue;
          }
          gardenEarns +=
            value.final * yields - (plot.price || plot.baseValue || 0);

          harvested.push({
            plot: { ...plot },
            value: { ...value, allYield: value.final * yields, yields },
          });
          plot.harvestsLeft -= yields;

          gardenStats.plotsHarvested =
            (gardenStats.plotsHarvested || 0) + yields;
          if (Math.random() < CROP_CONFIG.LUCKY_HARVEST_CHANCE) {
            const shopItem = [
              ...gardenShop.itemData,
              ...gardenShop.eventItems,
            ].find((item) => item.key === plot.seedKey);
            if (shopItem && inventory.size() < global.Cassidy.invLimit) {
              const cache = inventory.getAll() as GardenItem[];
              shopItem.onPurchase({ ...ctx, moneySet: { inventory: cache } });
              inventory = new Inventory(cache);
              seedsGained.push(`${plot.icon} ${plot.name} (Seed)`);
            }
          }
          if (plot.harvestsLeft <= 0) {
            plots.deleteByID(plot.uuid);
          } else {
            plot.mutation = [];
            plot.plantedAt = Date.now();
            plot.growthTime = Math.floor(plot.growthTime * 1.2);
            plot.maxKiloGrams = randomBiased(
              CROP_CONFIG.MIN_KG,
              CROP_CONFIG.MAX_KG,
              CROP_CONFIG.KILO_BIAS
            );
            plot.kiloGrams = 0;

            if (Math.random() < 0.1) {
              await applyMutation(
                plot,
                new Inventory<GardenTool>(
                  rawInventory.filter(
                    (item) => item.type === "gardenTool"
                  ) as GardenTool[]
                ),
                exiPets,
                false,
                currWeather
              );
            }
            plot.mutationAttempts = 0;
            plots.deleteByID(plot.uuid);
            plots.addOne(plot);
          }
        }

        gardenEarns = Math.round(Math.max(0, gardenEarns));

        await money.setItem(input.senderID, {
          gardenPlots: Array.from(plots),
          inventory: Array.from(inventory),
          gardenStats,
          gardenEarns,
          gardenBarns: Array.from(barn),
        });
        await checkAchievements(
          {
            ...ctx.user,
            gardenStats,
            senderID: input.senderID,
            money: userMoney + moneyEarned,
          },
          money,
          output,
          input
        );
        const harvestedStr = [...harvested]
          .sort((a, b) => b.value.final - a.value.final)
          .map(
            ({ plot, value }) =>
              `(x${value.yields}) ${
                (plot.mutation ?? []).length > 0
                  ? `[ ${plot.mutation
                      .map(
                        (i) =>
                          `${
                            getMutation(i)?.icon ?? "❓"
                          } ${fonts.double_struck(i)}`
                      )
                      .join(" + ")} +${abbreviateNumber(
                      value.noExtra - plot.baseValue
                    )} ] `
                  : ""
              }${plot.icon} ${plot.name} (${plot.kiloGrams}kg)`
          );
        const addedEarns = gardenEarns - origEarns;

        return output.replyStyled(
          `✅🧺 **Collected and added to the Barn! (${barn.size()}/${
            barn.limit
          })**:\n${harvestedStr.join("\n")}${
            barn.isFull() ? `\n🏡 Barn is full!` : ""
          }\n\n` +
            (seedsGained.length > 0
              ? `🌱🧺 **Lucky Harvest Seeds**:\n${seedsGained.join("\n")}\n\n`
              : "") +
            // `💰 Earned: ${formatCash(moneyEarned, true)}\n` +
            // `💵 Balance: ${formatCash(userMoney + moneyEarned)}\n\n` +
            `📈 Total Earns: **${formatCash(
              gardenEarns
            )}** (+${abbreviateNumber(addedEarns)})\n\n` +
            `**Next Steps**:\n` +
            `${UNISpectra.arrowFromT} Sell crops: ${prefix}${commandName}${
              isHypen ? "-" : " "
            }sell\n` +
            `${UNISpectra.arrowFromT} Check the barn: ${prefix}${commandName}${
              isHypen ? "-" : " "
            }barn`,
          style
        );
      },
    },
    {
      key: "reset_claim",
      description: "Collect reset plants (for players from old versions).",
      icon: "🧺",
      async handler(_, {}) {
        const plotsBefore = new Inventory<GardenPlot>(
          rawPlotsBefore,
          plotLimit
        );
        const barn = new Inventory<GardenBarn>(
          rawBarns,
          CROP_CONFIG.BARN_LIMIT
        );
        const harvested: {
          plot: GardenPlot;
          value: ReturnType<typeof calculateCropValue>;
        }[] = [];
        const tools = new Inventory<GardenTool>(
          rawInventory.filter(
            (item) => item.type === "gardenTool"
          ) as GardenTool[]
        );

        const sortedPlots = [...plotsBefore].sort(
          (a, b) =>
            calculateCropValue(b).allYield - calculateCropValue(a).allYield
        );

        const type = "all";

        const isAll = type === "all";

        const readyPlots: GardenPlot[] = [];
        for (const plot of sortedPlots) {
          const item = await autoUpdateCropData(plot, tools, exiPets);
          if (isCropReady(item) && readyPlots.length < 20) {
            if (isAll || item.seedKey === type) {
              readyPlots.push(item);
            }
          }
        }
        if (readyPlots.length === 0) {
          return output.replyStyled(`🌱 No crops available!`, style);
        }
        if (barn.isFull()) {
          return output.replyStyled(
            `🌱 Barn is full! Check barn items with ${prefix}${commandName}${
              isHypen ? "-" : " "
            }barn.\n\n` +
              `**Next Steps**:\n` +
              `${UNISpectra.arrowFromT} View plots: ${prefix}${commandName}${
                isHypen ? "-" : " "
              }plots\n` +
              `${UNISpectra.arrowFromT} Plant seeds: ${prefix}${commandName}${
                isHypen ? "-" : " "
              }plant`,
            style
          );
        }

        for (const plot of readyPlots) {
          await autoUpdateCropData(
            plot,
            new Inventory<GardenTool>(
              rawInventory.filter(
                (item) => item.type === "gardenTool"
              ) as GardenTool[]
            ),
            exiPets
          );

          if (plot.mutation.length > 0) {
            gardenStats.mutationsFound =
              (gardenStats.mutationsFound || 0) + plot.mutation.length;
          }
          const value = calculateCropValue(plot);
          const collected = toBarnItem(plot);
          let yields = Math.min(
            value.yields,
            CROP_CONFIG.BARN_LIMIT - barn.size()
          );
          barn.add(collected.slice(0, yields));
          if (yields <= 0) {
            continue;
          }

          harvested.push({
            plot: { ...plot },
            value: { ...value, allYield: value.final * yields },
          });
          plot.harvestsLeft -= yields;

          gardenStats.plotsHarvested =
            (gardenStats.plotsHarvested || 0) + yields;

          plotsBefore.deleteByID(plot.uuid);
        }

        gardenEarns = Math.round(Math.max(0, gardenEarns));

        await money.setItem(input.senderID, {
          gardenPlotsBefore: Array.from(plotsBefore),
          gardenStats,
          gardenEarns,
          gardenBarns: Array.from(barn),
        });
        await checkAchievements(
          {
            ...ctx.user,
            gardenStats,
            senderID: input.senderID,
            money: userMoney,
          },
          money,
          output,
          input
        );
        const harvestedStr = [...harvested]
          .sort((a, b) => b.value.final - a.value.final)
          .map(
            ({ plot, value }) =>
              `(x${value.yields}) ${
                (plot.mutation ?? []).length > 0
                  ? `[ ${plot.mutation
                      .map(
                        (i) =>
                          `${
                            getMutation(i)?.icon ?? "❓"
                          } ${fonts.double_struck(i)}`
                      )
                      .join(" + ")} +${abbreviateNumber(
                      value.noExtra - plot.baseValue
                    )} ] `
                  : ""
              }${plot.icon} ${plot.name} (${plot.kiloGrams}kg)`
          );

        return output.replyStyled(
          `✅🧺 **Collected old crops and added to the Barn!**:\n${harvestedStr.join(
            "\n"
          )}\n\n` +
            `**Next Steps**:\n` +
            `${UNISpectra.arrowFromT} Sell crops: ${prefix}${commandName}${
              isHypen ? "-" : " "
            }sell\n` +
            `${UNISpectra.arrowFromT} Check the barn: ${prefix}${commandName}${
              isHypen ? "-" : " "
            }barn`,
          style
        );
      },
    },
    {
      key: "plots",
      description: "View your garden plots",
      aliases: ["-pl"],
      args: [`[${plotSorts.join("/")}]`, "[page]"],
      icon: "🪴",
      async handler(_, { spectralArgs }) {
        type PlotSorts = (typeof plotSorts)[number];
        const plots = new Inventory<GardenPlot>(rawPlots, plotLimit);
        const page = parseInt(spectralArgs[1]) || 1;
        const type: PlotSorts = `${
          spectralArgs[0] || "least-time"
        }`.toLowerCase() as PlotSorts;
        if (!isNaN(parseInt(spectralArgs[0])) && spectralArgs[0]) {
          return output.reply(
            `🌱 Please use the page number as second argument. For the first argument, choose from: **${plotSorts.join(
              ", "
            )}**`
          );
        }
        if (!plotSorts.includes(type)) {
          return output.reply(
            `🌱 Invalid sorting type as first argument. Choose from: **${plotSorts.join(
              ", "
            )}**`
          );
        }
        const start = (page - 1) * ITEMS_PER_PAGE;
        const end = page * ITEMS_PER_PAGE;
        for (const plot of plots) {
          await autoUpdateCropData(
            plot,
            new Inventory<GardenTool>(
              rawInventory.filter(
                (item) => item.type === "gardenTool"
              ) as GardenTool[]
            ),
            exiPets
          );
        }
        const sortedPlots = [...plots.getAll()]
          .sort((a, b) => {
            const timeA = cropTimeLeft(a, true);
            const timeB = cropTimeLeft(b, true);
            if (type === "least-time") {
              return timeA - timeB;
            }
            if (type === "most-time") {
              return timeB - timeA;
            }
            const priceA = calculateCropValue(a).allYield;
            const priceB = calculateCropValue(b).allYield;
            if (type === "highest") {
              return priceB - priceA;
            }
            if (type === "lowest") {
              return priceA - priceB;
            }
            const sizeA = calculateCropKG(a);
            const sizeB = calculateCropKG(b);
            if (type === "largest") {
              return sizeB - sizeA;
            }
            if (type === "smallest") {
              return sizeA - sizeB;
            }
            if (type === "latest") {
              return b.plantedAt - a.plantedAt;
            }
          })
          .slice(start, end)
          .map((i, j) => ({
            plot: i,
            num: start + j + 1,
          }));
        let result = `🌱 **${name}'s Garden Plots (${
          plots.getAll().length
        }/${plotLimit}, Page ${page})**:\n\n`;
        if (sortedPlots.length === 0) {
          return output.replyStyled(
            `🌱 No plots! Plant seeds with ${prefix}${commandName}${
              isHypen ? "-" : " "
            }plant.\n\n` +
              `**Next Steps**:\n` +
              `${UNISpectra.arrowFromT} Plant seeds: ${prefix}${commandName}${
                isHypen ? "-" : " "
              }plant\n` +
              `${UNISpectra.arrowFromT} Buy seeds: ${prefix}${commandName}${
                isHypen ? "-" : " "
              }shop`,
            style
          );
        }

        for (let [, { num, plot }] of sortedPlots.entries()) {
          plot = await autoUpdateCropData(
            plot,
            new Inventory<GardenTool>(
              rawInventory.filter(
                (item) => item.type === "gardenTool"
              ) as GardenTool[]
            ),
            exiPets
          );
          const timeLeft = cropTimeLeft(plot);
          // const price =
          //   Math.min(plot.price || 0, plot.baseValue) || plot.baseValue || 0;
          const calc = calculateCropValue(plot);
          // const cropValue = calc.final;
          // const earns = Math.floor(cropValue - price);
          result +=
            `${num}. ${formatMutationStr(plot)} (x${calc.yields})${
              plots.get(plot.key).some((i) => i.isFavorite) ? ` ⭐` : ""
            }\n` +
            `${UNIRedux.charm} Harvests Left: ${plot.harvestsLeft}\n` +
            `${UNIRedux.charm} Time Left: ${
              formatTimeSentence(timeLeft) ||
              (!isCropReady(plot) ? "***BUGGED***!" : "***READY***!")
            }\n\n`;
        }
        if (plots.getAll().length > end) {
          result += `View more: ${prefix}${commandName}${
            isHypen ? "-" : " "
          }plots ${type} ${page + 1}\n`;
        }
        result += `💡🏗️ To Shovel: ***Reply with***:\nshovel <number> <number> <number>\n`;

        result += `\n📈 Total Earns: ${formatCash(gardenEarns, true)}\n\n`;

        result +=
          `**Next Steps**:\n` +
          `${UNISpectra.arrowFromT} Harvest crops: ${prefix}${commandName}${
            isHypen ? "-" : " "
          }harvest\n` +
          `${UNISpectra.arrowFromT} Favorite crops: ${prefix}${commandName}${
            isHypen ? "-" : " "
          }favorite`;
        await money.setItem(input.senderID, {
          gardenPlots: plots.raw(),
        });
        const info = await output.replyStyled(result, style);
        info.atReply(async (rep) => {
          if (rep.uid !== input.sid) {
            return;
          }
          let [type = "", ...nums_] = rep.input.words;
          type = type.toLowerCase();
          const nums = nums_.map(Number);

          const { gardenPlots: rawPlots = [] } = await rep.usersDB.getCache(
            rep.uid
          );
          const plots = new Inventory<GardenPlot>(rawPlots);
          const targets = nums
            .map((i) => sortedPlots.find((s) => s.num === i)?.plot?.uuid)
            .filter(Boolean)
            .map((i) => plots.getOneByID(i))
            .filter(Boolean);
          rep.output.setStyle(style);
          if (type === "shovel") {
            if (targets.length === 0) {
              return rep.output.reply(`🏗️ No targets provided as arguments.`);
            }
            let str = `✅ **Shoveled Successfully!**\n\n`;
            for (const target of targets) {
              str += `${formatMutationStr(target)}\n`;
              plots.deleteByID(target.uuid);
            }
            str +=
              `\n**Next Steps**:\n` +
              `${UNISpectra.arrowFromT} Harvest crops: ${prefix}${commandName}${
                isHypen ? "-" : " "
              }harvest\n` +
              `${
                UNISpectra.arrowFromT
              } Favorite crops: ${prefix}${commandName}${
                isHypen ? "-" : " "
              }favorite`;
            await rep.usersDB.setItem(rep.uid, {
              gardenPlots: plots.raw(),
            });
            return rep.output.reply(str);
          }
        });
      },
    },
    {
      key: "barn",
      description: "View your collected items.",
      aliases: ["-b"],
      args: ["[page]"],
      icon: "🏡",
      async handler(_, { spectralArgs }) {
        const barn = new Inventory<GardenBarn>(
          rawBarns,
          CROP_CONFIG.BARN_LIMIT
        );
        const page = parseInt(spectralArgs[0]) || 1;

        const start = (page - 1) * ITEMS_PER_PAGE;
        const end = page * ITEMS_PER_PAGE;

        const sortedBarns = [...barn.getAll()]
          .sort((a, b) => {
            return b.value - a.value;
          })
          .slice(start, end)
          .map((i, j) => ({
            item: i,
            num: start + j + 1,
          }));
        let result = `🏡 **${name}'s Barn (${barn.getAll().length}/${
          CROP_CONFIG.BARN_LIMIT
        }, Page ${page})**:\n\n`;
        if (sortedBarns.length === 0) {
          return output.replyStyled(
            `🏡 No barn items! Plant and collect crops with ${prefix}${commandName}${
              isHypen ? "-" : " "
            }collect.\n\n` +
              `**Next Steps**:\n` +
              `${UNISpectra.arrowFromT} Plant seeds: ${prefix}${commandName}${
                isHypen ? "-" : " "
              }plant\n` +
              `${UNISpectra.arrowFromT} Collect crops: ${prefix}${commandName}${
                isHypen ? "-" : " "
              }collect`,
            style
          );
        }

        for (let [, { num, item }] of sortedBarns.entries()) {
          result += `${num}. ${formatMutationStr(item)} ${
            barn.get(item.key).some((i) => i.isFavorite) ? ` ⭐` : ""
          }\n\n`;
        }
        if (barn.getAll().length > end) {
          result += `View more: ${prefix}${commandName}${
            isHypen ? "-" : " "
          }barn ${page + 1}\n`;
        }

        result += `💡🫴 To hold an item: ***Reply with***\nhold <number>`;

        result += `\n📈 Total Earns: ${formatCash(gardenEarns, true)}\n\n`;

        result +=
          `**Next Steps**:\n` +
          `${UNISpectra.arrowFromT} Collect crops: ${prefix}${commandName}${
            isHypen ? "-" : " "
          }collect\n` +
          `${UNISpectra.arrowFromT} Sell barn items: ${prefix}${commandName}${
            isHypen ? "-" : " "
          }sell`;
        const info = await output.replyStyled(result, style);
        info.atReply(async (rep) => {
          if (rep.uid !== input.sid) {
            return;
          }
          let [type = "", ...nums_] = rep.input.words;
          type = type.toLowerCase();
          const nums = nums_.map(Number);

          const { gardenBarns: rawBarns = [], gardenHeld = "" } =
            await rep.usersDB.getCache(rep.uid);
          const barn = new Inventory<GardenBarn>(rawBarns);
          const targets = nums
            .map((i) => sortedBarns.find((s) => s.num === i)?.item?.uuid)
            .filter(Boolean)
            .map((i) => barn.getOneByID(i))
            .filter(Boolean);
          rep.output.setStyle(style);
          if (type === "hold") {
            if (targets.length === 0) {
              return rep.output.reply(`🫴 No targets provided as arguments.`);
            }
            const target = targets[0];

            let isUnheld = gardenHeld === target.uuid;
            let str = `✅🫴 **${
              isUnheld ? "Unheld" : "Held"
            } Successfully!**\n\n`;
            str += `${formatMutationStr(target)}\n`;

            str +=
              `\n**Next Steps**:\n` +
              `${
                UNISpectra.arrowFromT
              } Sell the held item: ${prefix}${commandName}${
                isHypen ? "-" : " "
              }sell\n` +
              `${
                UNISpectra.arrowFromT
              } Favorite crops: ${prefix}${commandName}${
                isHypen ? "-" : " "
              }favorite`;
            await rep.usersDB.setItem(rep.uid, {
              gardenHeld: isUnheld ? "" : target.uuid,
            });
            return rep.output.reply(str);
          }
        });
      },
    },
    {
      key: "top",
      description:
        "View top 10 garden earners (paged, ranks 20-11 for page 2, etc.)",
      aliases: ["-t"],
      args: ["[page]"],
      icon: "🏆",
      async handler(_, { spectralArgs }) {
        const page = parseInt(spectralArgs[0]) || 1;
        const startRank = (page - 1) * 10 + 1;
        const endRank = startRank + 9;

        const allUsers = await money.getAllCache();
        const userStats: {
          userId: string;
          name: string;
          totalEarns: number;
          user: UserData;
        }[] = [];

        for (const user of Object.values(allUsers)) {
          if (
            ((user.gardenPlots as GardenPlot[]) ?? []).length === 0 ||
            ((user.gardenEarns as number) ?? 0) < 1
          ) {
            continue;
          }

          userStats.push({
            userId: user.userID,
            name: user.name || "Farmer",
            totalEarns: user.gardenEarns || 0,
            user,
          });
        }

        const sortedUsers = userStats.sort(
          (a, b) => b.totalEarns - a.totalEarns
        );
        const currentPageUsers = sortedUsers.slice(startRank - 1, endRank);

        let result = `🏆 **TOP ${endRank} GARDENERS**\n${UNISpectra.arrowFromT} Page **${page}**:\n\n`;
        if (currentPageUsers.length === 0) {
          return output.replyStyled(
            `🌱 No users found for ranks ${startRank}-${endRank}!\n\n` +
              `**Next Steps**:\n` +
              `${
                UNISpectra.arrowFromT
              } Check another page: ${prefix}${commandName}${
                isHypen ? "-" : " "
              }top [page]\n` +
              `${UNISpectra.arrowFromT} Harvest crops: ${prefix}${commandName}${
                isHypen ? "-" : " "
              }harvest`,
            style
          );
        }

        currentPageUsers.forEach((user, index) => {
          result +=
            `━━━━━━ ${startRank + index} ━━━━━━\n` +
            `${UNIRedux.arrowFromT}  **${user.name}**${
              user?.user.userMeta?.name &&
              user.name !== user?.user.userMeta?.name
                ? ` (${user.user.userMeta.name})`
                : ""
            }\n` +
            `📊🌱 ${formatCash(user.totalEarns, false)}\n`;
        });

        if (sortedUsers.length > endRank) {
          result += `${
            UNIRedux.standardLine
          }\nView more: ${prefix}${commandName}${isHypen ? "-" : " "}top ${
            page + 1
          }\n`;
        }
        if (page > 2) {
          result += `View previous: ${prefix}${commandName}${
            isHypen ? "-" : " "
          }top ${page - 1}\n`;
        }

        result +=
          `\n**Next Steps**:\n` +
          `${UNISpectra.arrowFromT} Harvest crops: ${prefix}${commandName}${
            isHypen ? "-" : " "
          }harvest\n` +
          `${UNISpectra.arrowFromT} Plant seeds: ${prefix}${commandName}${
            isHypen ? "-" : " "
          }plant`;

        return output.replyStyled(result, style);
      },
    },
    {
      key: "list",
      description: "View garden-related items",
      aliases: ["-l"],
      args: ["[page]"],
      icon: "📃",
      async handler(_, { spectralArgs }) {
        const inventory = new Inventory<GardenItem | InventoryItem>(
          rawInventory
        );
        const gardenItems = inventory
          .toUnique()
          .filter((item) =>
            ["gardenSeed", "gardenPetCage", "gardenTool"].includes(item.type)
          );
        const page = parseInt(spectralArgs[0]) || 1;
        const start = (page - 1) * ITEMS_PER_PAGE;
        const end = page * ITEMS_PER_PAGE;
        const currentItems = gardenItems.slice(start, end);
        let result = `🎒 **${name}'s Garden Items (Page ${page})**:\n\n`;
        if (currentItems.length === 0) {
          return output.replyStyled(
            `🌱 No garden items! Buy some with ${prefix}${commandName}${
              isHypen ? "-" : " "
            }shop.\n\n` +
              `**Next Steps**:\n` +
              `${UNISpectra.arrowFromT} Visit shop: ${prefix}${commandName}${
                isHypen ? "-" : " "
              }shop\n` +
              `${UNISpectra.arrowFromT} Plant seeds: ${prefix}${commandName}${
                isHypen ? "-" : " "
              }plant`,
            style
          );
        }

        currentItems.forEach((_item, index) => {
          let item = _item as GardenItem;
          const count = inventory.getAmount(item.key);
          result +=
            `${start + index + 1}. ${item.icon} **${item.name}**${
              count > 1 ? ` (x${count})` : ""
            }${
              inventory.get(item.key).some((i) => i.isFavorite) ? ` ⭐` : ""
            }\n` +
            `${UNIRedux.charm} Type: ${item.type}\n` +
            `${UNIRedux.charm} Key: **${item.key}**\n` +
            `${
              item.type === "gardenSeed"
                ? `${UNIRedux.charm} Base Value: ${formatCash(
                    item.cropData.baseValue,
                    true
                  )}`
                : `${UNIRedux.charm} Sell Price: ${formatCash(item.sellPrice)}`
            }\n` +
            (item.type === "gardenPetCage"
              ? `${UNIRedux.charm} Collects: ${item.petData.seedTypes.join(
                  ", "
                )} (${item.petData.collectionRate}/min)\n`
              : "") +
            (item.type === "gardenTool"
              ? `${UNIRedux.charm} Effect: ${
                  item.toolData.favoriteEnabled
                    ? "Enables favoriting"
                    : `Growth ${
                        item.toolData.growthMultiplier || 1
                      }x, Mutations (${Object.keys(
                        item.toolData.mutationChance || {}
                      ).join(", ")}) +${
                        Object.values(
                          item.toolData.mutationChance || {}
                        ).reduce((a, b) => a + b, 0) * 100
                      }%`
                }\n`
              : "") +
            `\n`;
        });
        if (gardenItems.length > end) {
          result += `View more: ${prefix}${commandName}${
            isHypen ? "-" : " "
          }list ${page + 1}\n`;
        }

        result +=
          `**Next Steps**:\n` +
          `${UNISpectra.arrowFromT} Plant seeds: ${prefix}${commandName}${
            isHypen ? "-" : " "
          }plant\n` +
          `${UNISpectra.arrowFromT} Favorite items: ${prefix}${commandName}${
            isHypen ? "-" : " "
          }favorite`;

        return output.replyStyled(result, style);
      },
    },
    // {
    //   key: "favorite",
    //   description: "Favorite an item or crop to prevent selling",
    //   aliases: ["-f"],
    //   args: ["[item_key]"],
    //   async handler(_, { spectralArgs }) {
    //     const inventory = new Inventory<GardenItem | InventoryItem>(
    //       rawInventory
    //     );
    //     const plots = new Inventory<GardenPlot>(rawPlots, plotLimit);
    //     const hasFavoriteTool = inventory
    //       .getAll()
    //       .some(
    //         (item) =>
    //           item.type === "gardenTool" &&
    //           (item as GardenTool).toolData?.favoriteEnabled
    //       );
    //     const items = inventory
    //       .getAll()
    //       .filter((item) =>
    //         ["gardenSeed", "gardenPetCage", "gardenTool"].includes(item.type)
    //       )
    //       .concat(plots.getAll().filter((plot) => !plot.isFavorite));
    //     if (!hasFavoriteTool) {
    //       return output.replyStyled(
    //         `❌ You need a Favorite Tool to favorite items! Buy one with ${prefix}${commandName}${
    //           isHypen ? "-" : " "
    //         }shop.\n\n` +
    //           `**Next Steps**:\n` +
    //           `${UNISpectra.arrowFromT} Visit shop: ${prefix}${commandName}${
    //             isHypen ? "-" : " "
    //           }shop`,
    //         style
    //       );
    //     }
    //     if (items.length === 0) {
    //       return output.replyStyled(
    //         `🌱 No items or crops to favorite! Check items with ${prefix}${commandName}${
    //           isHypen ? "-" : " "
    //         }list.\n\n` +
    //           `**Next Steps**:\n` +
    //           `${UNISpectra.arrowFromT} Plant seeds: ${prefix}${commandName}${
    //             isHypen ? "-" : " "
    //           }plant\n` +
    //           `${UNISpectra.arrowFromT} Buy items: ${prefix}${commandName}${
    //             isHypen ? "-" : " "
    //           }shop`,
    //         style
    //       );
    //     }

    //     if (!spectralArgs[0]) {
    //       return output.replyStyled(
    //         `❌ Specify an item or crop key to favorite! Check items with ${prefix}${commandName}${
    //           isHypen ? "-" : " "
    //         }list.\n\n` +
    //           `**Next Steps**:\n` +
    //           `${UNISpectra.arrowFromT} Plant seeds: ${prefix}${commandName}${
    //             isHypen ? "-" : " "
    //           }plant\n` +
    //           `${UNISpectra.arrowFromT} Buy items: ${prefix}${commandName}${
    //             isHypen ? "-" : " "
    //           }shop`,
    //         style
    //       );
    //     }

    //     let itemsTarget: (GardenItem | GardenPlot)[];

    //     itemsTarget = [
    //       ...plots.get(spectralArgs[0]),
    //       ...new Inventory<GardenItem>(items as GardenItem[]).get(
    //         spectralArgs[0]
    //       ),
    //     ];
    //     if (itemsTarget.length === 0) {
    //       return output.replyStyled(
    //         `❌ Invalid item key "${
    //           spectralArgs[0]
    //         }"! Check items with ${prefix}${commandName}${
    //           isHypen ? "-" : " "
    //         }plots.\n\n` +
    //           `**Next Steps**:\n` +
    //           `${UNISpectra.arrowFromT} List items: ${prefix}${commandName}${
    //             isHypen ? "-" : " "
    //           }list`,
    //         style
    //       );
    //     }

    //     itemsTarget.forEach((i) => (i.isFavorite = true));
    //     await money.setItem(input.senderID, {
    //       inventory: Array.from(inventory),
    //       gardenPlots: Array.from(plots),
    //     });

    //     return ctx.output.replyStyled(
    //       `⭐ Favorited ${itemsTarget[0].icon} **${items[0].name}**! It won't be sold in bulk sales.\n\n` +
    //         `**Next Steps**:\n` +
    //         `${UNISpectra.arrowFromT} Check items: ${prefix}${commandName}${
    //           isHypen ? "-" : " "
    //         }list\n` +
    //         `${UNISpectra.arrowFromT} Unfavorite: ${prefix}${commandName}${
    //           isHypen ? "-" : " "
    //         }unfavorite\n` +
    //         `${UNISpectra.arrowFromT} Sell items: ${prefix}${commandName}${
    //           isHypen ? "-" : " "
    //         }sell`,
    //       style
    //     );
    //   },
    // },
    // {
    //   key: "unfavorite",
    //   description: "Remove favorite tag from an item or crop",
    //   aliases: ["-uf"],
    //   args: ["[item_key]"],
    //   async handler(_, { spectralArgs }) {
    //     const inventory = new Inventory<GardenItem | InventoryItem>(
    //       rawInventory
    //     );
    //     const plots = new Inventory<GardenPlot>(rawPlots, plotLimit);

    //     const items = inventory
    //       .getAll()
    //       .filter((item) => item.isFavorite)
    //       .concat(plots.getAll().filter((plot) => plot.isFavorite));

    //     if (items.length === 0) {
    //       return output.replyStyled(
    //         `⭐ Nothing is currently favorited.\n\n` +
    //           `**Next Steps**:\n` +
    //           `${
    //             UNISpectra.arrowFromT
    //           } Favorite something: ${prefix}${commandName}${
    //             isHypen ? "-" : " "
    //           }favorite`,
    //         style
    //       );
    //     }

    //     if (!spectralArgs[0]) {
    //       return output.replyStyled(
    //         `❌ Please specify an item or crop key to unfavorite.\n\n` +
    //           `**Next Steps**:\n` +
    //           `${
    //             UNISpectra.arrowFromT
    //           } List favorites: ${prefix}${commandName}${
    //             isHypen ? "-" : " "
    //           }list`,
    //         style
    //       );
    //     }

    //     const itemsTarget: (GardenItem | GardenPlot)[] = [
    //       ...plots.get(spectralArgs[0]).filter((p) => p.isFavorite),
    //       ...new Inventory<GardenItem>(items as GardenItem[]).get(
    //         spectralArgs[0]
    //       ),
    //     ];

    //     if (itemsTarget.length === 0) {
    //       return output.replyStyled(
    //         `❌ No favorited item found for key "${spectralArgs[0]}".\n\n` +
    //           `**Next Steps**:\n` +
    //           `${
    //             UNISpectra.arrowFromT
    //           } List favorites: ${prefix}${commandName}${
    //             isHypen ? "-" : " "
    //           }list`,
    //         style
    //       );
    //     }

    //     itemsTarget.forEach((i) => (i.isFavorite = false));

    //     await money.setItem(input.senderID, {
    //       inventory: Array.from(inventory),
    //       gardenPlots: Array.from(plots),
    //     });

    //     return output.replyStyled(
    //       `🔓 Unfavorited ${itemsTarget[0].icon} **${itemsTarget[0].name}** — it can now be sold.\n\n` +
    //         `**Next Steps**:\n` +
    //         `${UNISpectra.arrowFromT} Sell items: ${prefix}${commandName}${
    //           isHypen ? "-" : " "
    //         }sell\n` +
    //         `${UNISpectra.arrowFromT} Favorite again: ${prefix}${commandName}${
    //           isHypen ? "-" : " "
    //         }favorite`,
    //       style
    //     );
    //   },
    // },
    // {
    //   key: "uncage",
    //   description: "Uncage a pet to make it active",
    //   aliases: ["-u"],
    //   args: ["[pet_key]"],
    //   icon: "🔓",
    //   async handler(_, { spectralArgs }) {
    //     const inventory = new Inventory<GardenItem | InventoryItem>(
    //       rawInventory
    //     );
    //     const pets = new Inventory<GardenPetActive>(rawPets, PET_LIMIT);
    //     const equippedPets = pets
    //       .getAll()
    //       .filter((pet) => pet.isEquipped).length;
    //     const cagedPets = inventory
    //       .getAll()
    //       .filter(
    //         (item): item is GardenPetCage => item.type === "gardenPetCage"
    //       );
    //     if (equippedPets >= PET_EQUIP_LIMIT) {
    //       return output.replyStyled(
    //         `🐾 Max ${PET_EQUIP_LIMIT} equipped pets! Unequip or sell pets first.\n\n` +
    //           `**Next Steps**:\n` +
    //           `${UNISpectra.arrowFromT} View pets: ${prefix}${commandName}${
    //             isHypen ? "-" : " "
    //           }pets\n` +
    //           `${UNISpectra.arrowFromT} Sell pets: ${prefix}${commandName}${
    //             isHypen ? "-" : " "
    //           }sell`,
    //         style
    //       );
    //     }
    //     if (cagedPets.length === 0) {
    //       return output.replyStyled(
    //         `🐾 No caged pets! Buy some with ${prefix}${commandName}${
    //           isHypen ? "-" : " "
    //         }shop.\n\n` +
    //           `**Next Steps**:\n` +
    //           `${UNISpectra.arrowFromT} Visit shop: ${prefix}${commandName}${
    //             isHypen ? "-" : " "
    //           }shop\n` +
    //           `${UNISpectra.arrowFromT} Check items: ${prefix}${commandName}${
    //             isHypen ? "-" : " "
    //           }list`,
    //         style
    //       );
    //     }

    //     if (!spectralArgs[0]) {
    //       return output.replyStyled(
    //         `❌ Specify a pet key to uncage! Check items with ${prefix}${commandName}${
    //           isHypen ? "-" : " "
    //         }list.\n\n` +
    //           `**Next Steps**:\n` +
    //           `${UNISpectra.arrowFromT} Plant seeds: ${prefix}${commandName}${
    //             isHypen ? "-" : " "
    //           }plant\n` +
    //           `${UNISpectra.arrowFromT} Buy items: ${prefix}${commandName}${
    //             isHypen ? "-" : " "
    //           }shop`,
    //         style
    //       );
    //     }

    //     let cagedPet: GardenPetCage;

    //     const selected = inventory.getOne(spectralArgs[0]);
    //     if (!selected || selected.type !== "gardenPetCage") {
    //       return output.replyStyled(
    //         `❌ Invalid pet key "${
    //           spectralArgs[0]
    //         }"! Check caged pets with ${prefix}${commandName}${
    //           isHypen ? "-" : " "
    //         }list.\n\n` +
    //           `**Next Steps**:\n` +
    //           `${UNISpectra.arrowFromT} List items: ${prefix}${commandName}${
    //             isHypen ? "-" : " "
    //           }list\n` +
    //           `${UNISpectra.arrowFromT} Buy pets: ${prefix}${commandName}${
    //             isHypen ? "-" : " "
    //           }shop`,
    //         style
    //       );
    //     }
    //     cagedPet = selected as GardenPetCage;

    //     if (pets.has(cagedPet.key)) {
    //       return ctx.output.replyStyled(
    //         "🐾 You cannot have this pet again.",
    //         style
    //       );
    //     }

    //     inventory.deleteOne(cagedPet.key);
    //     const isEquipped = equippedPets < 3;
    //     pets.addOne({
    //       ...cagedPet,
    //       key: cagedPet.key,
    //       name: cagedPet.petData.name,
    //       icon: cagedPet.icon,
    //       lastCollect: Date.now(),
    //       petData: cagedPet.petData,
    //       isEquipped,
    //     });

    //     await money.setItem(input.senderID, {
    //       inventory: Array.from(inventory),
    //       gardenPets: Array.from(pets),
    //     });

    //     return ctx.output.replyStyled(
    //       `🐾 Uncaged ${cagedPet.icon} **${cagedPet.name}**! It's now ${
    //         isEquipped
    //           ? "equipped and collecting seeds"
    //           : "active but not equipped"
    //       }.\n\n` +
    //         `**Next Steps**:\n` +
    //         `${UNISpectra.arrowFromT} View pets: ${prefix}${commandName}${
    //           isHypen ? "-" : " "
    //         }pets\n` +
    //         `${UNISpectra.arrowFromT} Equip pets: ${prefix}${commandName}${
    //           isHypen ? "-" : " "
    //         }pets`,
    //       style
    //     );
    //   },
    // },
    // {
    //   key: "pets",
    //   description: "View and manage active garden pets",
    //   aliases: ["-pt"],
    //   icon: "🐶",
    //   args: ["[equip/unequip/<page>] [pet_key]"],
    //   async handler(_, { spectralArgs }) {
    //     const pets = new Inventory<GardenPetActive>(rawPets, PET_LIMIT);
    //     let inventory = new Inventory<GardenItem | InventoryItem>(rawInventory);
    //     const page = parseInt(spectralArgs[0]) || 1;
    //     const action = spectralArgs[0];
    //     const petKey = spectralArgs[1];
    //     const equippedPets = pets
    //       .getAll()
    //       .filter((pet) => pet.isEquipped).length;

    //     if (action === "equip" && petKey) {
    //       const pet = pets.getOne(petKey);
    //       if (!pet) {
    //         return output.replyStyled(
    //           `❌ Invalid pet key "${petKey}"! Check pets with ${prefix}${commandName}${
    //             isHypen ? "-" : " "
    //           }pets.\n\n` +
    //             `**Next Steps**:\n` +
    //             `${UNISpectra.arrowFromT} View pets: ${prefix}${commandName}${
    //               isHypen ? "-" : " "
    //             }pets`,
    //           style
    //         );
    //       }
    //       if (equippedPets >= PET_EQUIP_LIMIT) {
    //         return output.replyStyled(
    //           `❌ Max ${PET_EQUIP_LIMIT} equipped pets! Unequip a pet first.\n\n` +
    //             `**Next Steps**:\n` +
    //             `${UNISpectra.arrowFromT} View pets: ${prefix}${commandName}${
    //               isHypen ? "-" : " "
    //             }pets`,
    //           style
    //         );
    //       }
    //       pet.isEquipped = true;
    //       await money.setItem(input.senderID, { gardenPets: Array.from(pets) });
    //       return output.replyStyled(
    //         `🐾 Equipped ${pet.icon} **${pet.name}**! It's now collecting seeds.\n\n` +
    //           `**Next Steps**:\n` +
    //           `${UNISpectra.arrowFromT} View pets: ${prefix}${commandName}${
    //             isHypen ? "-" : " "
    //           }pets`,
    //         style
    //       );
    //     } else if (action === "unequip" && petKey) {
    //       const pet = pets.getOne(petKey);
    //       if (!pet) {
    //         return output.replyStyled(
    //           `❌ Invalid pet key "${petKey}"! Check pets with ${prefix}${commandName}${
    //             isHypen ? "-" : " "
    //           }pets.\n\n` +
    //             `**Next Steps**:\n` +
    //             `${UNISpectra.arrowFromT} View pets: ${prefix}${commandName}${
    //               isHypen ? "-" : " "
    //             }pets`,
    //           style
    //         );
    //       }
    //       pet.isEquipped = false;
    //       await money.setItem(input.senderID, { gardenPets: Array.from(pets) });
    //       return output.replyStyled(
    //         `🐾 Unequipped ${pet.icon} **${pet.name}**! It's no longer collecting seeds.\n\n` +
    //           `**Next Steps**:\n` +
    //           `${UNISpectra.arrowFromT} View pets: ${prefix}${commandName}${
    //             isHypen ? "-" : " "
    //           }pets`,
    //         style
    //       );
    //     }

    //     const start = (page - 1) * ITEMS_PER_PAGE;
    //     const end = page * ITEMS_PER_PAGE;
    //     const currentPets = pets.getAll().slice(start, end);
    //     let result = `🐾 **${name}'s Active Pets (Page ${page})**:\n\n`;
    //     if (currentPets.length === 0) {
    //       return output.replyStyled(
    //         `🐾 No active pets! Uncage some with ${prefix}${commandName}${
    //           isHypen ? "-" : " "
    //         }uncage.\n\n` +
    //           `**Next Steps**:\n` +
    //           `${UNISpectra.arrowFromT} Uncage pets: ${prefix}${commandName}${
    //             isHypen ? "-" : " "
    //           }uncage\n` +
    //           `${
    //             UNISpectra.arrowFromT
    //           } Buy caged pets: ${prefix}${commandName}${
    //             isHypen ? "-" : " "
    //           }shop`,
    //         style
    //       );
    //     }

    //     let totalSeedsCollected = 0;
    //     let finalCollected: GardenItem[] = [];
    //     currentPets.forEach((pet, index) => {
    //       const {
    //         collections,
    //         collected,
    //         inventory: rInv,
    //       } = updatePetCollection(pet, inventory as Inventory<GardenItem>, ctx);
    //       inventory = rInv;
    //       finalCollected.push(...collected);
    //       totalSeedsCollected += collections;
    //       totalSeedsCollected = Math.min(
    //         global.Cassidy.invLimit,
    //         totalSeedsCollected
    //       );
    //       result +=
    //         `${start + index + 1}. ${pet.icon} **${pet.name}** [${pet.key}]${
    //           pet.isEquipped ? ` (Equipped)` : ""
    //         }\n` +
    //         `${UNIRedux.charm} Collects: ${pet.petData.seedTypes.join(
    //           ", "
    //         )}\n` +
    //         `${UNIRedux.charm} Rate: ${pet.petData.collectionRate} seeds/min${
    //           collections > 0 ? ` (+${collections} seeds)` : ""
    //         }\n\n`;
    //     });

    //     await money.setItem(input.senderID, {
    //       inventory: Array.from(inventory),
    //       gardenPets: Array.from(pets),
    //     });
    //     const finalCollInv = new Inventory(finalCollected);

    //     result +=
    //       `🌱 Total Seeds Collected: **${totalSeedsCollected}${
    //         totalSeedsCollected > 0 ? ` (+${totalSeedsCollected})` : ""
    //       }**\n\n` +
    //       `${finalCollInv
    //         .toUnique()
    //         .map(
    //           (s) =>
    //             `**x${finalCollInv.getAmount(s.key)}** ${s.icon} **${
    //               s.name
    //             }** (Key: **${s.key}**)`
    //         )
    //         .join("\n")}\n\n` +
    //       `**Next Steps**:\n` +
    //       `${UNISpectra.arrowFromT} Check items: ${prefix}${commandName}${
    //         isHypen ? "-" : " "
    //       }list\n` +
    //       `${UNISpectra.arrowFromT} Plant seeds: ${prefix}${commandName}${
    //         isHypen ? "-" : " "
    //       }plant\n` +
    //       `${UNISpectra.arrowFromT} Uncage more: ${prefix}${commandName}${
    //         isHypen ? "-" : " "
    //       }uncage`;

    //     return output.replyStyled(result, style);
    //   },
    // },
    {
      key: "steal",
      description: "Steal a crop from another player's garden",
      aliases: ["-st"],
      args: ["[player_id]"],
      icon: "🥷",
      async handler(_, { spectralArgs }) {
        const stealCost = 200;
        const userGems = collectibles.getAmount("gems");
        if (userGems < stealCost) {
          return output.replyStyled(
            `❌ You need ${formatValue(
              stealCost,
              "💎",
              true
            )} to steal a crop! Your gems: ${formatValue(
              userGems,
              "💎",
              true
            )}.\n\n` +
              `**Next Steps**:\n` +
              `${UNISpectra.arrowFromT} Sell crops: ${prefix}${commandName}${
                isHypen ? "-" : " "
              }sell\n` +
              `${UNISpectra.arrowFromT} Harvest crops: ${prefix}${commandName}${
                isHypen ? "-" : " "
              }harvest`,
            style
          );
        }
        const UID = spectralArgs[0] || input.detectID;
        if (!UID || UID === input.sid) {
          return output.replyStyled(
            `❌ Please specify a player ID to steal from or reply to their message, or mention them!\n\n` +
              `**Next Steps**:\n` +
              `${UNISpectra.arrowFromT} Try again: ${prefix}${commandName}${
                isHypen ? "-" : " "
              }steal [player_id]`,
            style
          );
        }
        const target = await money.getCache(UID);
        const targetPlots = new Inventory<GardenPlot>(target.gardenPlots || []);
        const stealablePlots = targetPlots
          .getAll()
          .filter((plot) => isCropReady(plot) && !plot.isFavorite);
        for (const plot of stealablePlots) {
          await autoUpdateCropData(plot, exiTool, exiPets);
        }

        if (stealablePlots.length === 0) {
          return output.replyStyled(
            `❌ No stealable crops in that player's garden!\n\n` +
              `**Next Steps**:\n` +
              `${
                UNISpectra.arrowFromT
              } Try another player: ${prefix}${commandName}${
                isHypen ? "-" : " "
              }steal [player_id]`,
            style
          );
        }

        const sortedPlots = stealablePlots.toSorted(
          (a, b) =>
            calculateCropValue(b).allYield - calculateCropValue(a).allYield
        );
        const stolenPlot = sortedPlots[0];
        const stealSuccess = Math.random() < 0.3;
        if (!stealSuccess) {
          await money.setItem(input.senderID, { money: userMoney + 100 });
          return output.replyStyled(
            `❌ Steal failed for ${formatValue(
              stealCost,
              "💎",
              true
            )}! You received ${formatCash(100)} as compensation.\n\n` +
              `**Next Steps**:\n` +
              `${UNISpectra.arrowFromT} Try again: ${prefix}${commandName}${
                isHypen ? "-" : " "
              }steal [player_id]\n` +
              `${UNISpectra.arrowFromT} Harvest crops: ${prefix}${commandName}${
                isHypen ? "-" : " "
              }harvest`,
            style
          );
        }
        const myPlots = new Inventory<GardenPlot>(rawPlots);
        const availablePlots = plotLimit - myPlots.getAll().length;
        if (availablePlots <= 0) {
          return output.replyStyled(
            `🌱 Max plots reached (${
              myPlots.getAll().length
            }/${plotLimit})! Harvest with ${prefix}${commandName}${
              isHypen ? "-" : " "
            }harvest or expand with ${prefix}${commandName}${
              isHypen ? "-" : " "
            }expand.\n\n` +
              `**Next Steps**:\n` +
              `${UNISpectra.arrowFromT} Harvest crops: ${prefix}${commandName}${
                isHypen ? "-" : " "
              }harvest\n` +
              `${UNISpectra.arrowFromT} Expand plot: ${prefix}${commandName}${
                isHypen ? "-" : " "
              }expand`,
            style
          );
        }
        myPlots.addOne(stolenPlot);
        targetPlots.deleteOne(stolenPlot.key);

        collectibles.raise("gems", -stealCost);
        await money.setItem(input.senderID, {
          collectibles: Array.from(collectibles),
          gardenPlots: Array.from(myPlots),
        });
        await money.setItem(UID, {
          gardenPlots: Array.from(targetPlots),
        });

        return output.replyStyled(
          `✅ Stole ${formatMutationStr(stolenPlot)} for ${formatValue(
            stealCost,
            "💎",
            true
          )}! It was added to your plots!\n\n${
            UNISpectra.charm
          } Total Value: ${formatCash(
            calculateCropValue(stolenPlot).allYield,
            true
          )}\n\n` +
            `**Next Steps**:\n` +
            `${UNISpectra.arrowFromT} Check items: ${prefix}${commandName}${
              isHypen ? "-" : " "
            }list\n` +
            `${UNISpectra.arrowFromT} Plant seeds: ${prefix}${commandName}${
              isHypen ? "-" : " "
            }plant`,
          style
        );
      },
    },
    /*{
      key: "gift",
      description: "Gift an item or crop to another player",
      aliases: ["-g"],
      args: ["[player_id] [item_key]"],
      async handler(_, { spectralArgs }) {
        if (!allowGifting) {
          return output.replyStyled(
            `❌ Gifting is disabled in your settings!\n\n` +
              `**Next Steps**:\n` +
              `${
                UNISpectra.arrowFromT
              } Enable gifting: ${prefix}${commandName}${
                isHypen ? "-" : " "
              }settings gifting on`,
            style
          );
        }
        if (!spectralArgs[0] || !spectralArgs[1]) {
          return output.replyStyled(
            `❌ Please specify a player ID and item key!\n\n` +
              `**Next Steps**:\n` +
              `${UNISpectra.arrowFromT} Try again: ${prefix}${commandName}${
                isHypen ? "-" : " "
              }gift [player_id] [item_key]\n` +
              `${UNISpectra.arrowFromT} Check items: ${prefix}${commandName}${
                isHypen ? "-" : " "
              }list`,
            style
          );
        }
        const inventory = new Inventory<GardenItem | InventoryItem>(
          rawInventory
        );
        const plots = new Inventory<GardenPlot>(rawPlots, plotLimit);
        const item =
          inventory.getOne(spectralArgs[1]) || plots.getOne(spectralArgs[1]);
        if (!item) {
          return output.replyStyled(
            `❌ Invalid item key "${
              spectralArgs[1]
            }"! Check items with ${prefix}${commandName}${
              isHypen ? "-" : " "
            }list.\n\n` +
              `**Next Steps**:\n` +
              `${UNISpectra.arrowFromT} List items: ${prefix}${commandName}${
                isHypen ? "-" : " "
              }list`,
            style
          );
        }

        const target = await money.getCache(spectralArgs[0]);
        const targetInventory = new Inventory<GardenItem | InventoryItem>(
          target.inventory || []
        );
        if (targetInventory.size() >= global.Cassidy.invLimit) {
          return output.replyStyled(
            `❌ The player's inventory is full!\n\n` +
              `**Next Steps**:\n` +
              `${
                UNISpectra.arrowFromT
              } Try another player: ${prefix}${commandName}${
                isHypen ? "-" : " "
              }gift [player_id] [item_key]`,
            style
          );
        }

        if (item.type === "activePlot") {
          plots.deleteOne(item.key);
          targetInventory.addOne(item);
        } else {
          inventory.deleteOne(item.key);
          targetInventory.addOne(item);
        }
        await money.setItem(input.senderID, {
          inventory: Array.from(inventory),
          gardenPlots: Array.from(plots),
        });
        await money.setItem(spectralArgs[0], {
          inventory: Array.from(targetInventory),
        });

        return output.replyStyled(
          `🎁 Gifted ${item.icon} **${item.name}** to player ${spectralArgs[0]}!\n\n` +
            `**Next Steps**:\n` +
            `${UNISpectra.arrowFromT} Check items: ${prefix}${commandName}${
              isHypen ? "-" : " "
            }list\n` +
            `${UNISpectra.arrowFromT} Plant seeds: ${prefix}${commandName}${
              isHypen ? "-" : " "
            }plant`,
          style
        );
      },
    },*/
    {
      key: "growall",
      icon: "🌱🔓",
      description: "Instantly grow all crops",
      aliases: ["-ga"],
      async handler() {
        const growAllCost = 100;
        const userGems = collectibles.getAmount("gems");
        if (userGems < growAllCost) {
          return output.replyStyled(
            `❌ You need ${formatValue(
              growAllCost,
              "💎",
              true
            )} to grow all crops! Your gems: ${formatValue(
              userGems,
              "💎",
              true
            )}.\n\n` +
              `**Next Steps**:\n` +
              `${UNISpectra.arrowFromT} Sell crops: ${prefix}${commandName}${
                isHypen ? "-" : " "
              }sell\n` +
              `${UNISpectra.arrowFromT} Harvest crops: ${prefix}${commandName}${
                isHypen ? "-" : " "
              }harvest`,
            style
          );
        }
        const plots = new Inventory<GardenPlot>(rawPlots, plotLimit);
        if (plots.getAll().length === 0) {
          return output.replyStyled(
            `🌱 No crops to grow! Plant seeds with ${prefix}${commandName}${
              isHypen ? "-" : " "
            }plant.\n\n` +
              `**Next Steps**:\n` +
              `${UNISpectra.arrowFromT} Plant seeds: ${prefix}${commandName}${
                isHypen ? "-" : " "
              }plant\n` +
              `${UNISpectra.arrowFromT} Buy seeds: ${prefix}${commandName}${
                isHypen ? "-" : " "
              }shop`,
            style
          );
        }

        for (let plot of plots) {
          plot = await autoUpdateCropData(plot, exiTool, exiPets);
          const timeLeft = cropTimeLeft(plot);
          if (timeLeft <= 0) {
            continue;
          }
          plot.plantedAt -= timeLeft;
        }
        collectibles.raise("gems", -growAllCost);
        await money.setItem(input.senderID, {
          gardenPlots: Array.from(plots),
          collectibles: Array.from(collectibles),
        });

        return output.replyStyled(
          `🌱 All crops grown instantly for ${formatValue(
            growAllCost,
            "💎",
            true
          )}!\n\n` +
            `**Next Steps**:\n` +
            `${UNISpectra.arrowFromT} Harvest crops: ${prefix}${commandName}${
              isHypen ? "-" : " "
            }harvest\n` +
            `${UNISpectra.arrowFromT} Check plots: ${prefix}${commandName}${
              isHypen ? "-" : " "
            }plots`,
          style
        );
      },
    },
    {
      key: "expand",
      icon: "🧺🧺",
      description: "Expand your garden plot",
      aliases: ["-ex"],
      args: ["[side/rear1/rear2]"],
      async handler(_, { spectralArgs }) {
        const sideExpansionCost = 250000000;
        const rearExpansion1Cost = 500000000;
        const rearExpansion2Cost = 1000000000;
        const sideExpansionPlots = 8;
        const rearExpansionPlots = 12;
        const sideExpansionDelay = 0;
        const rearExpansion1Delay = 24 * 60 * 60 * 1000;
        const rearExpansion2Delay = 3 * 24 * 60 * 60 * 1000;
        const currentTime = Date.now();

        if (plotLimit >= PLOT_EXPANSION_LIMIT) {
          return output.replyStyled(
            `🌱 Max plot limit (${PLOT_EXPANSION_LIMIT}) reached!\n\n` +
              `**Next Steps**:\n` +
              `${UNISpectra.arrowFromT} Harvest crops: ${prefix}${commandName}${
                isHypen ? "-" : " "
              }harvest\n` +
              `${UNISpectra.arrowFromT} Plant seeds: ${prefix}${commandName}${
                isHypen ? "-" : " "
              }plant`,
            style
          );
        }

        const expansionType = spectralArgs[0];
        if (!expansionType) {
          return output.replyStyled(
            `❌ Invalid expansion type! Use: side, rear1, or rear2.\n\n` +
              `💰 **Costs**:\n\nSide - ${formatCash(
                sideExpansionCost,
                true
              )}\nRear1 - ${formatCash(
                rearExpansion1Cost,
                true
              )}\nRear2 - ${formatCash(rearExpansion2Cost, true)}\n\n` +
              `**Next Steps**:\n` +
              `${UNISpectra.arrowFromT} Try again: ${prefix}${commandName}${
                isHypen ? "-" : " "
              }expand [side/rear1/rear2]`,
            style
          );
        }

        if (expansionType === "side") {
          if (userMoney < sideExpansionCost) {
            return output.replyStyled(
              `❌ You need ${formatCash(
                sideExpansionCost
              )} for a side expansion! Your balance: ${formatCash(
                userMoney
              )}.\n\n` +
                `**Next Steps**:\n` +
                `${UNISpectra.arrowFromT} Sell crops: ${prefix}${commandName}${
                  isHypen ? "-" : " "
                }sell\n` +
                `${
                  UNISpectra.arrowFromT
                } Harvest crops: ${prefix}${commandName}${
                  isHypen ? "-" : " "
                }harvest`,
              style
            );
          }
          if (currentTime - lastSideExpansion < sideExpansionDelay) {
            return output.replyStyled(
              `⏳ Side expansion on cooldown! Try again in ${
                formatTimeSentence(
                  lastSideExpansion + sideExpansionDelay - currentTime
                ) || "Now?"
              }.\n\n` +
                `**Next Steps**:\n` +
                `${
                  UNISpectra.arrowFromT
                } Harvest crops: ${prefix}${commandName}${
                  isHypen ? "-" : " "
                }harvest`,
              style
            );
          }
          await money.setItem(input.senderID, {
            money: userMoney - sideExpansionCost,
            plotLimit: plotLimit + sideExpansionPlots,
            lastSideExpansion: currentTime,
            gardenStats: {
              ...gardenStats,
              expansions: (gardenStats.expansions || 0) + 1,
            },
          });
          await checkAchievements(
            {
              ...ctx.user,
              gardenStats: {
                ...gardenStats,
                expansions: (gardenStats.expansions || 0) + 1,
              },
              senderID: input.senderID,
              money: userMoney - sideExpansionCost,
            },
            money,
            output,
            input
          );
          return output.replyStyled(
            `🌱 Plot expanded by ${sideExpansionPlots} slots for ${formatCash(
              sideExpansionCost
            )}!\n\n` +
              `**Next Steps**:\n` +
              `${UNISpectra.arrowFromT} Plant seeds: ${prefix}${commandName}${
                isHypen ? "-" : " "
              }plant\n` +
              `${UNISpectra.arrowFromT} Check plots: ${prefix}${commandName}${
                isHypen ? "-" : " "
              }plots`,
            style
          );
        } else if (expansionType === "rear1") {
          if (userMoney < rearExpansion1Cost) {
            return output.replyStyled(
              `❌ You need ${formatCash(
                rearExpansion1Cost
              )} for the first rear expansion! Your balance: ${formatCash(
                userMoney
              )}.\n\n` +
                `**Next Steps**:\n` +
                `${UNISpectra.arrowFromT} Sell crops: ${prefix}${commandName}${
                  isHypen ? "-" : " "
                }sell\n` +
                `${
                  UNISpectra.arrowFromT
                } Harvest crops: ${prefix}${commandName}${
                  isHypen ? "-" : " "
                }harvest`,
              style
            );
          }
          if (currentTime - lastRearExpansion1 < rearExpansion1Delay) {
            return output.replyStyled(
              `⏳ First rear expansion on cooldown! Try again in ${
                formatTimeSentence(
                  lastRearExpansion1 + rearExpansion1Delay - currentTime
                ) || "Now?"
              }.\n\n` +
                `**Next Steps**:\n` +
                `${
                  UNISpectra.arrowFromT
                } Harvest crops: ${prefix}${commandName}${
                  isHypen ? "-" : " "
                }harvest`,
              style
            );
          }
          await money.setItem(input.senderID, {
            money: userMoney - rearExpansion1Cost,
            plotLimit: plotLimit + rearExpansionPlots,
            lastRearExpansion1: currentTime,
            gardenStats: {
              ...gardenStats,
              expansions: (gardenStats.expansions || 0) + 1,
            },
          });
          await checkAchievements(
            {
              ...ctx.user,
              gardenStats: {
                ...gardenStats,
                expansions: (gardenStats.expansions || 0) + 1,
              },
              senderID: input.senderID,
              money: userMoney - rearExpansion1Cost,
            },
            money,
            output,
            input
          );
          return output.replyStyled(
            `🌱 Plot expanded by ${rearExpansionPlots} slots for ${formatCash(
              rearExpansion1Cost
            )}!\n\n` +
              `**Next Steps**:\n` +
              `${UNISpectra.arrowFromT} Plant seeds: ${prefix}${commandName}${
                isHypen ? "-" : " "
              }plant\n` +
              `${UNISpectra.arrowFromT} Check plots: ${prefix}${commandName}${
                isHypen ? "-" : " "
              }plots`,
            style
          );
        } else if (expansionType === "rear2") {
          if (userMoney < rearExpansion2Cost) {
            return output.replyStyled(
              `❌ You need ${formatCash(
                rearExpansion2Cost
              )} for the second rear expansion! Your balance: ${formatCash(
                userMoney
              )}.\n\n` +
                `**Next Steps**:\n` +
                `${UNISpectra.arrowFromT} Sell crops: ${prefix}${commandName}${
                  isHypen ? "-" : " "
                }sell\n` +
                `${
                  UNISpectra.arrowFromT
                } Harvest crops: ${prefix}${commandName}${
                  isHypen ? "-" : " "
                }harvest`,
              style
            );
          }
          if (currentTime - lastRearExpansion2 < rearExpansion2Delay) {
            return output.replyStyled(
              `⏳ Second rear expansion on cooldown! Try again in ${
                formatTimeSentence(
                  lastRearExpansion2 + rearExpansion2Delay - currentTime
                ) || "Now?"
              }.\n\n` +
                `**Next Steps**:\n` +
                `${
                  UNISpectra.arrowFromT
                } Harvest crops: ${prefix}${commandName}${
                  isHypen ? "-" : " "
                }harvest`,
              style
            );
          }
          await money.setItem(input.senderID, {
            money: userMoney - rearExpansion2Cost,
            plotLimit: plotLimit + rearExpansionPlots,
            lastRearExpansion2: currentTime,
            gardenStats: {
              ...gardenStats,
              expansions: (gardenStats.expansions || 0) + 1,
            },
          });
          await checkAchievements(
            {
              ...ctx.user,
              gardenStats: {
                ...gardenStats,
                expansions: (gardenStats.expansions || 0) + 1,
              },
              senderID: input.senderID,
              money: userMoney - rearExpansion2Cost,
            },
            money,
            output,
            input
          );
          return output.replyStyled(
            `🌱 Plot expanded by ${rearExpansionPlots} slots for ${formatCash(
              rearExpansion2Cost
            )}!\n\n` +
              `**Next Steps**:\n` +
              `${UNISpectra.arrowFromT} Plant seeds: ${prefix}${commandName}${
                isHypen ? "-" : " "
              }plant\n` +
              `${UNISpectra.arrowFromT} Check plots: ${prefix}${commandName}${
                isHypen ? "-" : " "
              }plots`,
            style
          );
        } else {
          return output.replyStyled(
            `❌ Invalid expansion type! Use: side, rear1, or rear2.\n\n` +
              `💰 **Costs**:\n\nSide - ${formatCash(
                sideExpansionCost,
                true
              )}\nRear1 - ${formatCash(
                rearExpansion1Cost,
                true
              )}\nRear2 - ${formatCash(rearExpansion2Cost, true)}\n\n` +
              `**Next Steps**:\n` +
              `${UNISpectra.arrowFromT} Try again: ${prefix}${commandName}${
                isHypen ? "-" : " "
              }expand [side/rear1/rear2]`,
            style
          );
        }
      },
    },
    /*{
      key: "sell",
      description: "Sell items or crops at Steven's Stand",
      aliases: ["-s"],
      args: ["[item_key/inventory]"],
      async handler(_, { spectralArgs }) {
        const inventory = new Inventory<GardenItem | InventoryItem>(
          rawInventory
        );
        const plots = new Inventory<GardenPlot>(rawPlots, plotLimit);
        let moneyEarned = 0;
        const sold: string[] = [];

        if (spectralArgs[0] === "inventory") {
          const sellableItems = inventory
            .getAll()
            .filter((item) => !item.isFavorite);
          if (sellableItems.length === 0) {
            return output.replyStyled(
              `❌ No sellable items in inventory! Favorite items are protected.\n\n` +
                `**Next Steps**:\n` +
                `${UNISpectra.arrowFromT} Check items: ${prefix}${commandName}${
                  isHypen ? "-" : " "
                }list\n` +
                `${
                  UNISpectra.arrowFromT
                } Favorite items: ${prefix}${commandName}${
                  isHypen ? "-" : " "
                }favorite`,
              style
            );
          }
          sellableItems.forEach((item) => {
            moneyEarned += item.sellPrice;
            sold.push(
              `${item.icon} ${item.name} - ${formatCash(item.sellPrice)}`
            );
            inventory.deleteOne(item.key);
          });
        } else if (spectralArgs[0]) {
          const item =
            inventory.getOne(spectralArgs[0]) || plots.getOne(spectralArgs[0]);
          if (!item) {
            return output.replyStyled(
              `❌ Invalid item key "${
                spectralArgs[0]
              }"! Check items with ${prefix}${commandName}${
                isHypen ? "-" : " "
              }list.\n\n` +
                `**Next Steps**:\n` +
                `${UNISpectra.arrowFromT} List items: ${prefix}${commandName}${
                  isHypen ? "-" : " "
                }list\n` +
                `${UNISpectra.arrowFromT} Check plots: ${prefix}${commandName}${
                  isHypen ? "-" : " "
                }plots`,
              style
            );
          }
          if (item.isFavorite) {
            return output.replyStyled(
              `❌ Cannot sell favorited item ${item.icon} **${item.name}**!\n\n` +
                `**Next Steps**:\n` +
                `${
                  UNISpectra.arrowFromT
                } Unfavorite item: ${prefix}${commandName}${
                  isHypen ? "-" : " "
                }favorite\n` +
                `${UNISpectra.arrowFromT} Check items: ${prefix}${commandName}${
                  isHypen ? "-" : " "
                }list`,
              style
            );
          }
          moneyEarned +=
            item.sellPrice ||
            calculateCropValue(
              item as GardenPlot,
              plots,
              gardenStats.expansions
            );
          sold.push(
            `${item.icon} ${item.name} - ${formatCash(
              item.sellPrice ||
                calculateCropValue(
                  item as GardenPlot,
                  plots,
                  gardenStats.expansions
                )
            )}`
          );
          if (item.type === "activePlot") {
            plots.deleteOne(item.key);
          } else {
            inventory.deleteOne(item.key);
          }
        } else {
          return output.replyStyled(
            `❌ Please specify an item key or "inventory"!\n\n` +
              `**Next Steps**:\n` +
              `${UNISpectra.arrowFromT} List items: ${prefix}${commandName}${
                isHypen ? "-" : " "
              }list\n` +
              `${UNISpectra.arrowFromT} Check plots: ${prefix}${commandName}${
                isHypen ? "-" : " "
              }plots`,
            style
          );
        }

        await money.setItem(input.senderID, {
          money: userMoney + moneyEarned,
          inventory: Array.from(inventory),
          gardenPlots: Array.from(plots),
        });

        return output.replyStyled(
          `💰 **Sold at Steven's Stand**:\n${sold.join("\n")}\n\n` +
            `💰 Earned: ${formatCash(moneyEarned)}\n` +
            `💵 Balance: ${formatCash(userMoney + moneyEarned)}\n\n` +
            `**Next Steps**:\n` +
            `${UNISpectra.arrowFromT} Check items: ${prefix}${commandName}${
              isHypen ? "-" : " "
            }list\n` +
            `${UNISpectra.arrowFromT} Plant seeds: ${prefix}${commandName}${
              isHypen ? "-" : " "
            }plant`,
          style
        );
      },
    },*/
    {
      key: "weather",
      description: "Check current garden  weather",
      aliases: ["-w"],
      icon: "🎈",
      async handler() {
        const weather = await getCurrentWeather();
        const upcomingEventsCount = 3;
        const upcomingEvents = [];

        for (let i = 1; i <= upcomingEventsCount; i++) {
          const nextEvent = await getNextWeather(i);
          upcomingEvents.push(`${nextEvent.icon} ${nextEvent.name}`);
        }

        const timeLeft = await getTimeForNextWeather();

        const result = [
          `🌦️ **Current Weather**: ${weather.icon} ${weather.name}`,
          `${UNIRedux.charm} Growth Speed: ${weather.growthMultiplier}x`,
        ];

        for (const effect of weather.effects ?? []) {
          if (effect.mutationChance != null) {
            result.push(
              `${UNIRedux.charm} Mutation Chance: +${(
                effect.mutationChance * 100
              ).toFixed(0)}%`
            );
          }

          if (effect.mutationType) {
            result.push(
              `${UNIRedux.charm} Mutation Type: ${effect.mutationType}`
            );
          }
        }

        result.push(
          `🕒 Next Weather in: ${formatTimeSentence(timeLeft) || "Ready!"}`
        );

        result.push(`\n🌟 **Upcoming Weather:**\n${upcomingEvents.join("\n")}`);

        result.push(
          `\n**Next Steps**:\n` +
            `${UNISpectra.arrowFromT} Buy event seeds: ${prefix}${commandName}${
              isHypen ? "-" : " "
            }shop\n` +
            `${UNISpectra.arrowFromT} Plant seeds: ${prefix}${commandName}${
              isHypen ? "-" : " "
            }plant`
        );

        return output.replyStyled(result.join("\n"), style);
      },
    },
    {
      key: "skip",
      icon: "⏩",
      description: "Skip garden weathers, positive or negative.",
      aliases: ["-sk"],
      args: ["[number/'reset']"],
      async handler(_, { spectralArgs }) {
        if (!input.hasRole(InputRoles.MODERATORBOT)) {
          return output.reply(`🔒 Only moderators can skip events.`);
        }
        const weather = await getCurrentWeather();
        if (spectralArgs[0] === "reset") {
          await Cassidy.databases.globalDB.setItem("skipStamp", {
            skipStamp: 0,
          });
        } else {
          const skips = parseInt(spectralArgs[0]) || 1;
          await skipWeather(skips);
        }

        const newEvent = await getCurrentWeather();
        return output.reply(
          `✅ ${
            spectralArgs[0] === "reset"
              ? `Revoked skips to **original**.`
              : `Skipped **${parseInt(spectralArgs[0]) || 1}** events.`
          }\n\n🌦️ **Skipped**: ${weather.icon} ${
            weather.name
          }\n\n 🌦️ **Current Event&Weather**: ${newEvent.icon} ${newEvent.name}`
        );
      },
    },
    // {
    //   key: "settings",
    //   description: "Manage garden settings",
    //   aliases: ["-set"],
    //   args: ["gifting [on/off]"],
    //   async handler(_, { spectralArgs }) {
    //     if (
    //       !spectralArgs[0] ||
    //       spectralArgs[0] !== "gifting" ||
    //       !["on", "off"].includes(spectralArgs[1])
    //     ) {
    //       return output.replyStyled(
    //         `❌ Specify setting: ${prefix}${commandName} settings gifting [on/off]\n\n` +
    //           `**Current Settings**:\n` +
    //           `${UNIRedux.charm} Gifting: ${
    //             allowGifting ? "Enabled" : "Disabled"
    //           }\n\n` +
    //           `**Next Steps**:\n` +
    //           `${
    //             UNISpectra.arrowFromT
    //           } Toggle gifting: ${prefix}${commandName}${
    //             isHypen ? "-" : " "
    //           }settings gifting [on/off]`,
    //         style
    //       );
    //     }

    //     const newGiftingSetting = spectralArgs[1] === "on";
    //     await money.setItem(input.senderID, {
    //       allowGifting: newGiftingSetting,
    //     });

    //     return output.replyStyled(
    //       `✅ Gifting ${newGiftingSetting ? "enabled" : "disabled"}!\n\n` +
    //         `**Next Steps**:\n` +
    //         `${UNISpectra.arrowFromT} Gift items: ${prefix}${commandName}${
    //           isHypen ? "-" : " "
    //         }gift\n` +
    //         `${UNISpectra.arrowFromT} Check items: ${prefix}${commandName}${
    //           isHypen ? "-" : " "
    //         }list`,
    //       style
    //     );
    //   },
    // },
    {
      key: "guide",
      description: "Learn how to play Grow a Garden",
      aliases: ["-g"],
      async handler() {
        return output.replyStyled(
          `🌱 **Grow a Garden Guide** 🌱\n\n` +
            `Welcome, ${name}! Grow crops, manage pets, and earn Money in your garden!\n\n` +
            `**How to Play**:\n` +
            `${
              UNIRedux.charm
            } **Shop**: Buy seeds, pets, and tools at Sam's Garden Shop with ${prefix}${commandName}${
              isHypen ? "-" : " "
            }shop.\n` +
            `${
              UNIRedux.charm
            } **Plant**: Plant seeds in up to ${plotLimit} plots with ${prefix}${commandName}${
              isHypen ? "-" : " "
            }plant. Multi-harvest crops yield multiple times.\n` +
            `${
              UNIRedux.charm
            } **Harvest**: Collect crops for Money with ${prefix}${commandName}${
              isHypen ? "-" : " "
            }harvest. 10% chance to get a seed (Lucky Harvest).\n` +
            `${UNIRedux.charm} **Mutations**: Crops may mutate (e.g., Wet, Shocked), boosting value. Affected by weather, tools, pets, and new seasonal blessings.\n` +
            `${
              UNIRedux.charm
            } **Pets**: Uncage pets with ${prefix}${commandName}${
              isHypen ? "-" : " "
            }uncage to collect seeds (up to ${PET_EQUIP_LIMIT} equipped). New pet synergy boosts specific mutations.\n` +
            `${UNIRedux.charm} **Tools**: Sprinkler and Fertilizer boost growth and mutations. Favorite Tool protects items.\n` +
            `${UNIRedux.charm} **Events**: Weekly weather/events (e.g., ${EVENT_CONFIG.WEATHERS[0].name}) offer exclusive seeds, bonuses, and new event-specific mutations.\n` +
            `${
              UNIRedux.charm
            } **Stealing**: Steal crops from others for ${formatValue(
              5,
              "💎",
              true
            )} with ${prefix}${commandName}${
              isHypen ? "-" : " "
            }steal (70% success, new 10% chance to steal mutations).\n` +
            `${
              UNIRedux.charm
            } **Grow All**: Instantly grow all crops for ${formatValue(
              100,
              "💎",
              true
            )} with ${prefix}${commandName}${isHypen ? "-" : " "}growall.\n` +
            `${
              UNIRedux.charm
            } **Expand**: Add plots with ${prefix}${commandName}${
              isHypen ? "-" : " "
            }expand (costs ${formatCash(250000000)}-${formatCash(
              1000000000
            )}). New plot synergy bonuses for full plots.\n` +
            `${UNIRedux.charm} **Hidden Mechanic - Overgrowth Boost**: Overgrown crops (2x growth time) have a 20% higher mutation chance.\n` +
            `${UNIRedux.charm} **Hidden Mechanic - Pet Harmony**: Equipped pets with matching seed types increase collection rate by 15%.\n` +
            `${UNIRedux.charm} **Hidden Mechanic - Event Surge**: During events, harvesting 10+ crops at once grants a 5% value bonus.\n` +
            `\n**Tips**:\n` +
            `- Check events with ${prefix}${commandName}${
              isHypen ? "-" : " "
            }event for bonuses and new mutations.\n` +
            `- Use tools and pets strategically to target specific mutations.\n` +
            `- Expand early to maximize plot synergy bonuses.\n` +
            `- Time harvests during events for surge bonuses.\n` +
            `- Monitor overgrowth for mutation boosts but avoid excessive delays.\n\n` +
            `**Next Steps**:\n` +
            `${UNISpectra.arrowFromT} Start shopping: ${prefix}${commandName}${
              isHypen ? "-" : " "
            }shop\n` +
            `${UNISpectra.arrowFromT} View plots: ${prefix}${commandName}${
              isHypen ? "-" : " "
            }plots`,
          style
        );
      },
    },
    {
      key: "best_seeds",
      description: "View best seeds.",
      aliases: ["-bs"],
      args: ["[page]"],
      icon: "✨",
      async handler(_, { spectralArgs }) {
        if (!input.hasRole(InputRoles.MODERATORBOT)) {
          return output.reply(`🔒 | Only admins and moderators can see this.`);
        }
        const allItems: gardenShop.GardenShopItem[] = [
          ...gardenShop.itemData,
          ...[EVENT_CONFIG.CURRENT_EVENT]
            .map((i) => (i.shopItems ?? []) as typeof gardenShop.itemData)
            .flat(),
          ...EVENT_CONFIG.EVENTS_CONSTRUCTION.map(
            (i) => (i.shopItems ?? []) as typeof gardenShop.itemData
          ).flat(),
        ];

        const page = parseInt(spectralArgs[0]) || 1;

        if (isNaN(parseInt(spectralArgs[0]))) {
          const key = spectralArgs[0];
          const target = allItems.find((i) => i.key === key);
          if (target) {
            const bres = evaluateItemBalance(target);
            if (bres) {
              const sortedItems = allItems
                .toSorted(
                  (a, b) =>
                    (evaluateItemBalance(b)?.score || 0) -
                    (evaluateItemBalance(a)?.score || 0)
                )
                .filter((i) => evaluateItemBalance(i) !== null);

              const itemIndex = sortedItems.findIndex((i) => i.key === key);

              const foundPage =
                itemIndex === -1
                  ? 1
                  : Math.floor(itemIndex / ITEMS_PER_PAGE) + 1;
              const topNumber = itemIndex + 1;

              return output.replyStyled(
                `Found in **Page**: ${foundPage}\n#${topNumber}. ${
                  bres.item.icon
                } **${bres.item.name}** (${bres.item.key})\n🏅 **SCORE**: ${
                  bres.score
                }\n**Stock Chance**: ${(bres.stockChance * 100).toFixed(
                  2
                )}%\n🛒 ${formatCash(bres.price, true)}\n🪙 ${abbreviateNumber(
                  bres.item.cropData.baseValue || 0
                )} | 🧺 ${abbreviateNumber(
                  bres.item.cropData.harvests || 0
                )} | ⏳ ${
                  formatTimeSentence(bres.item.cropData.growthTime || 0) ||
                  "Instant"
                }\n\n`,
                style
              );
            }
          }
        }
        const start = (page - 1) * ITEMS_PER_PAGE;
        const end = page * ITEMS_PER_PAGE;
        const sortedItems = allItems
          .toSorted(
            (a, b) =>
              (evaluateItemBalance(b)?.score || 0) -
              (evaluateItemBalance(a)?.score || 0)
          )
          .filter((i) => evaluateItemBalance(i) !== null);
        const currentItems = sortedItems.slice(start, end);
        let result = `🛒 **Top Best Seeds**:\n\n`;

        if (currentItems.length === 0) {
          result += `No seeds in this page.\n\n`;
        }

        for (const item of currentItems) {
          const bres = evaluateItemBalance(item);

          const i = sortedItems.findIndex((i) => i.key === item.key) + 1;
          result += `${i}. ${bres.item.icon} **${bres.item.name}** (${
            bres.item.key
          })\n🏅 **SCORE**: ${bres.score}\n**Stock Chance**: ${(
            bres.stockChance * 100
          ).toFixed(2)}%\n🛒 ${formatCash(
            bres.price,
            true
          )}\n🪙 ${abbreviateNumber(
            bres.item.cropData.baseValue || 0
          )} | 🧺 ${abbreviateNumber(bres.item.cropData.harvests || 0)} | ⏳ ${
            formatTimeSentence(bres.item.cropData.growthTime || 0) || "Instant"
          }\n\n`;
        }

        result += `${
          UNIRedux.arrowFromT
        } Next page: ${prefix}${commandName} bs ${page + 1}\n${
          UNIRedux.arrowFromT
        } Total Pages: ${Math.ceil(sortedItems.length / ITEMS_PER_PAGE)}`;

        return output.replyStyled(result, style);
      },
    },
  ]);

  await home.runInContext(ctx);
}

export const style: CassidySpectra.CommandStyle = {
  title: {
    content: `${UNISpectra.charm} **G🍓rden**`,
    text_font: "fancy",
    line_bottom: "default",
  },
  contentFont: "fancy",
  footer: {
    content: "Rewards multiply with success.",
    text_font: "fancy",
  },
};

refreshShopStock(true);
