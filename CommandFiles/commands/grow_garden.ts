import { Collectibles, Inventory } from "@cass-modules/InventoryEnhanced";
import { UNIRedux, UNISpectra } from "../modules/unisym.js";
import { SpectralCMDHome } from "@cassidy/spectral-home";
import { InventoryItem, UserStatsManager } from "@cass-modules/cassidyUser";
import {
  abbreviateNumber,
  formatCash,
  formatTimeSentence,
  formatValue,
  parseBet,
} from "@cass-modules/ArielUtils";
import OutputProps from "output-cassidy";
import InputClass, { InputRoles } from "@cass-modules/InputClass";
import { gardenShop } from "../modules/GardenShop";
import { CROP_CONFIG } from "../modules/GardenConfig";
import { EVENT_CONFIG } from "../modules/GardenEventConfig";
import { FontSystem } from "cassidy-styler";

export const meta: CassidySpectra.CommandMeta = {
  name: "garden",
  description: "Grow crops and earn Money in your garden!",
  otherNames: ["grow", "growgarden", "gr", "g", "gag"],
  version: "1.4.15",
  usage: "{prefix}{name} [subcommand]",
  category: "Idle Investment Games",
  author: "Liane Cagara 🎀",
  permissions: [0],
  // self, please do not use "both" or true, i hate noprefix
  noPrefix: false,
  waitingTime: 1,
  requirement: "3.0.0",
  icon: "🌱",
  cmdType: "cplx_g",
};

export const PLOT_LIMIT = 36;
export const PLOT_EXPANSION_LIMIT = 56 * 2;
export const PET_LIMIT = 60;
export const PET_EQUIP_LIMIT = 8;
export const ITEMS_PER_PAGE = 6;

export type GardenSeed = InventoryItem & {
  type: "gardenSeed";
  cropData: { baseValue: number; growthTime: number; harvests: number };
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
  plantedAt: number;
  growthTime: number;
  harvestsLeft: number;
  baseValue: number;
  mutation: string | null;
  isFavorite?: boolean;
  originalGrowthTime: number;
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

function calculateCropValue(
  crop: GardenPlot,
  plots: Inventory<GardenPlot>,
  expansions: number,
  totalEarns: number
) {
  const mutation = CROP_CONFIG.MUTATIONS.find((m) => m.name === crop.mutation);
  const plantedCount = plots.getAll().length;
  const plantingBonus = Math.min(1, 0.1 * Math.floor(plantedCount / 10));
  const expansionBonus = 0.05 * expansions;

  const earnMultiplier = Math.max(
    1,
    Math.min(1000000000, safeEX((1 / 1_000_000) * totalEarns, 0.15))
  );

  const final = Math.floor(
    crop.baseValue *
      (mutation ? mutation.valueMultiplier : 1) *
      (1 + plantingBonus + expansionBonus) *
      earnMultiplier
  );
  const noExtra = Math.floor(
    crop.baseValue *
      (mutation ? mutation.valueMultiplier : 1) *
      (1 + plantingBonus + expansionBonus)
  );

  return { final: Math.max(final, 0) || 0, noExtra: Math.max(0, noExtra) || 0 };
}

function isCropReady(crop: GardenPlot) {
  return cropTimeLeft(crop) <= 0;
}

function cropTimeLeft(plot: GardenPlot) {
  const timeLeft = Math.max(0, plot.plantedAt + plot.growthTime - Date.now());
  return timeLeft;
}

function safeEX(a: number, p: number) {
  return a === 0 ? 0 : a < 0 ? -Math.pow(-a, p) : Math.pow(a, p);
}

async function autoUpdateCropData(
  crop: GardenPlot,
  tools: Inventory<GardenTool>
) {
  if (!crop) return null;
  crop.originalGrowthTime ??= crop.growthTime;

  const event = await getCurrentEvent();

  const baseGrowthMultiplier = event.effect?.growthMultiplier || 1;

  let growthBoost = safeEX(baseGrowthMultiplier, 0.9);

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

  if (crop.mutation && crop.harvestsLeft > 1) {
    crop.growthTime = Math.floor(
      crop.growthTime * CROP_CONFIG.OVERGROWTH_PENALTY
    );
  }

  return crop;
}

async function getTimeForNextEvent() {
  const { globalDB } = Cassidy.databases;

  const { skipStamp = 0 } = await globalDB.getCache("skipStamp");
  const cycle = EVENT_CONFIG.EVENT_CYCLE;
  const now = Date.now() + skipStamp;
  const timeIntoCycle = now % cycle;
  const timeUntilNextEvent = cycle - timeIntoCycle;
  return timeUntilNextEvent;
}

async function getCurrentEvent() {
  const { globalDB } = Cassidy.databases;
  const { skipStamp = 0 } = await globalDB.getCache("skipStamp");
  const adjustedNow = Date.now() + skipStamp;
  const weekNumber =
    Math.floor(adjustedNow / EVENT_CONFIG.EVENT_CYCLE) %
    EVENT_CONFIG.EVENTS.length;
  const event = EVENT_CONFIG.EVENTS[weekNumber];

  return event;
}
async function getNextEvent(skips: number = 1) {
  const { globalDB } = Cassidy.databases;
  const { skipStamp = 0 } = await globalDB.getCache("skipStamp");

  const adjustedNow = Date.now() + skipStamp;
  const cycle = EVENT_CONFIG.EVENT_CYCLE;

  const totalCyclesPassed = Math.floor(adjustedNow / cycle) + skips;
  const len = EVENT_CONFIG.EVENTS.length;
  const weekNumber = ((totalCyclesPassed % len) + len) % len;

  const event = EVENT_CONFIG.EVENTS[weekNumber];

  return event;
}

function forgivingRandom(bias?: number) {
  return Math.random() ** (bias || 1.2);
}

async function skipEvent(
  skipped: number,
  targetTimeLeft = EVENT_CONFIG.EVENT_CYCLE
) {
  const { globalDB } = Cassidy.databases;
  const cycle = EVENT_CONFIG.EVENT_CYCLE;
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

async function applyMutation(crop: GardenPlot, tools: Inventory<GardenTool>) {
  const event = await getCurrentEvent();

  const baseMutationChance = event.effect?.mutationChance || 0;

  const baseNonlinearBoost = safeEX(baseMutationChance, 0.9);

  const mutationBoosts = new Map<string, number>();

  CROP_CONFIG.MUTATIONS.forEach((mutation) => {
    mutationBoosts.set(mutation.name, Math.min(0.5, baseNonlinearBoost));
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

  const mutations = event.effect?.mutationType
    ? [
        ...Array.from({ length: CROP_CONFIG.MBIAS }, () =>
          CROP_CONFIG.MUTATIONS.find(
            (m) => m.name === event.effect.mutationType
          )
        ),
        ...CROP_CONFIG.MUTATIONS.filter(
          (m) => m.name !== event.effect.mutationType
        ),
      ]
    : CROP_CONFIG.MUTATIONS;

  for (const mutation of mutations) {
    const roll = Math.random();
    const boost = mutationBoosts.get(mutation.name) ?? 0;
    const chance = Math.min(
      0.5,
      mutation.chance + safeEX(mutation.chance / (1 - boost), 0.9)
    );

    if (roll <= chance && Math.random() < 0.25) {
      crop.mutation = mutation.name;
      return crop;
    }
  }

  return crop;
}

function formatMutationStr(plot: GardenPlot) {
  return `${plot.icon} **${plot.name}**${
    plot.mutation
      ? ` ${UNISpectra.disc} ${FontSystem.fonts.double_struck(
          plot.mutation.toUpperCase?.()
        )}`
      : ""
  }`;
}

function updatePetCollection(
  pet: GardenPetActive,
  inventory: Inventory<GardenItem>,
  ctx: CommandContext
): {
  pet: GardenPetActive;
  collections: number;
  inventory: Inventory<GardenItem>;
  collected: GardenItem[];
} {
  if (!pet.isEquipped) return { pet, collections: 0, inventory, collected: [] };
  const currentTime = Date.now();
  const timeSinceLastCollect = currentTime - (pet.lastCollect || currentTime);
  const collections = Math.round(
    Math.floor(timeSinceLastCollect / (60 * 1000)) * pet.petData.collectionRate
  );
  const collected: GardenItem[] = [];
  if (collections >= 1) {
    pet.lastCollect = currentTime;
    for (let i = 0; i < collections; i++) {
      const seed =
        pet.petData.seedTypes[
          Math.floor(Math.random() * pet.petData.seedTypes.length)
        ];
      const shopItem = [...gardenShop.itemData, ...gardenShop.eventItems].find(
        (item) => item.key === seed
      );
      if (shopItem && inventory.size() < global.Cassidy.invLimit) {
        const cache = inventory.getAll();
        const cache2 = [...cache];
        shopItem.onPurchase({ ...ctx, moneySet: { inventory: cache } });
        inventory = new Inventory(cache);
        const newItems = cache.filter((i) => !cache2.includes(i));
        collected.push(...newItems);
      }
    }
  }
  return { pet, collections: collected.length, inventory, collected };
}

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

async function refreshShopStock() {
  const currentTime = Date.now();
  if (currentTime - gardenShop.lastRestock < gardenShop.stockRefreshInterval)
    return;
  gardenShop.lastRestock = currentTime;

  const event = await getCurrentEvent();
  gardenShop.eventItems = gardenShop.eventItems.filter((item) => {
    if (item.isEventItem) {
      return (
        event.shopItems &&
        event.shopItems.some((shopItem) => shopItem.key === item.key)
      );
    }
    return true;
  });

  if (event.shopItems && event.shopItems.length > 0) {
    event.shopItems.forEach((shopItem) => {
      if (!gardenShop.eventItems.some((item) => item.key === shopItem.key)) {
        gardenShop.eventItems.push({ ...shopItem, isEventItem: true });
      }
    });
  }

  gardenShop.itemData.forEach((item) => {
    item.inStock = forgivingRandom() < item.stockChance;
  });
  gardenShop.eventItems.forEach((item) => {
    item.inStock = forgivingRandom() < item.stockChance;
  });
}

function getTimeUntilRestock() {
  const currentTime = Date.now();
  const timePassed = currentTime - gardenShop.lastRestock;
  const timeLeft = gardenShop.stockRefreshInterval - timePassed;

  return Math.max(0, timeLeft);
}

function formatShopItems(
  items = gardenShop,
  currentEvent: Awaited<ReturnType<typeof getCurrentEvent>>,
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
        const moneySet: { inventory: GardenItem[] } = { inventory: [] };
        item.onPurchase({ moneySet });
        const purchased = moneySet.inventory[0];
        if (purchased) {
          if (purchased.type === "gardenSeed") {
            flavor += `\n🪙 ${abbreviateNumber(
              purchased.cropData.baseValue || 0
            )} | 🧺 ${abbreviateNumber(
              purchased.cropData.harvests || 0
            )} | ⏳ ${
              formatTimeSentence(purchased.cropData.growthTime || 0) ||
              "Instant"
            }`;
          }
        }
        return {
          ...item,
          cannotBuy: noStock,
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
    ...EVENT_CONFIG.EVENTS.map(
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

export async function entry(ctx: CommandContext) {
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

  let {
    name = "",
    gardenPlots: rawPlots = [],
    gardenPets: rawPets = [],
    inventory: rawInventory = [],
    money: userMoney = 0,
    gardenStats = {
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
  let isHypen = !!input.propertyArray[0];
  const collectibles = new Collectibles(rawCLL);
  correctItems(rawInventory as GardenItem[]);

  gardenEarns = gardenEarns || 0;
  gardenEarns = Math.max(gardenEarns, 0);

  const currEvent = await getCurrentEvent();
  let hasEvent = !currEvent.isNoEvent;

  const style: CommandStyle = {
    ...command.style,
    title: {
      content: `${currEvent.icon} ${UNISpectra.charm} **G🍓rden**`,
      text_font: "fancy",
      line_bottom: "default",
    },
    footer: {
      content: hasEvent
        ? `‼️ Event: **${currEvent.name}** ${
            (currEvent.shopItems ?? []).length > 0
              ? `(+${(currEvent.shopItems ?? []).length} Shop Items!)`
              : ""
          }`
        : "Rewards multiply with success.",
      text_font: "fancy",
    },
  };

  if (!name || name === "Unregistered") {
    return output.reply(
      `🌱 Please register first!\nUse: **${prefix}register** without fonts.`
    );
  }

  output.setStyle(style);

  await refreshShopStock();

  const home = new SpectralCMDHome({ isHypen }, [
    {
      key: "shop",
      description: "Visit the Shop",
      aliases: ["-sh"],
      async handler() {
        const shop = new UTShop({
          ...formatShopItems(gardenShop, currEvent),
          style,
        });
        await shop.onPlay({ ...ctx, args: [] });
      },
    },
    ...((currEvent.shopItems ?? []).length > 0
      ? [
          {
            key: currEvent?.shopName ?? "eventshop",
            description: `Shop for ${currEvent.name}.`,
            aliases: [...(currEvent.shopAlias ?? []), "-esh", "eshop"],
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
              await shop.onPlay({ ...ctx, args: [] });
            },
          },
        ]
      : []),
    {
      key: "plant",
      description: "Plant one or more seeds in plots",
      aliases: ["-p"],
      args: ["[seed_key] [quantity]"],
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
          const allItems = [
            ...gardenShop.itemData,
            ...EVENT_CONFIG.EVENTS.map(
              (i) => (i.shopItems ?? []) as typeof gardenShop.itemData
            ).flat(),
          ];
          const priceInt =
            allItems.find((i) => seed.key === i?.key)?.price ??
            seed.cropData.baseValue;
          const price = Math.min(
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
            mutation: null,
            type: "activePlot",
            isFavorite: false,
            price,
          };
          plot = await applyMutation(
            plot,
            new Inventory<GardenTool>(
              rawInventory.filter(
                (item) => item.type === "gardenTool"
              ) as GardenTool[]
            )
          );
          plot = await autoUpdateCropData(
            plot,
            new Inventory<GardenTool>(
              rawInventory.filter(
                (item) => item.type === "gardenTool"
              ) as GardenTool[]
            )
          );
          firstPlot ??= plot;
          plots.addOne(plot);
          if (plot.mutation) {
            gardenStats.mutationsFound = (gardenStats.mutationsFound || 0) + 1;
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
            }\n` +
            `💰 Base Value: ${formatCash(
              calculateCropValue(
                {
                  ...plots.getAll()[plots.getAll().length - 1],
                  mutation: null,
                },
                plots,
                gardenStats.expansions || 0,
                gardenEarns
              ).final
            )}\n\n` +
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
      key: "harvest",
      description: "Harvest ready crops",
      aliases: ["-h"],
      async handler() {
        let origEarns = gardenEarns;
        const plots = new Inventory<GardenPlot>(rawPlots, plotLimit);
        let inventory = new Inventory<GardenItem | InventoryItem>(rawInventory);
        let moneyEarned = 0;
        const harvested: {
          plot: GardenPlot;
          value: { final: number; noExtra: number };
        }[] = [];
        const seedsGained: string[] = [];
        const tools = new Inventory<GardenTool>(
          rawInventory.filter(
            (item) => item.type === "gardenTool"
          ) as GardenTool[]
        );

        const readyPlots: GardenPlot[] = [];
        for (const plot of plots) {
          const item = await autoUpdateCropData(plot, tools);
          if (isCropReady(item)) {
            readyPlots.push(item);
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

        for (const plot of readyPlots) {
          await autoUpdateCropData(
            plot,
            new Inventory<GardenTool>(
              rawInventory.filter(
                (item) => item.type === "gardenTool"
              ) as GardenTool[]
            )
          );
          const value = calculateCropValue(
            plot,
            plots,
            gardenStats.expansions || 0,
            gardenEarns
          );
          moneyEarned += value.final || 0;
          gardenEarns +=
            value.final - Math.min(plot.price || 0, plot.baseValue) ||
            plot.baseValue ||
            0;
          harvested.push({ plot, value });
          plot.harvestsLeft -= 1;
          gardenStats.plotsHarvested = (gardenStats.plotsHarvested || 0) + 1;
          if (forgivingRandom() < CROP_CONFIG.LUCKY_HARVEST_CHANCE) {
            const shopItem = [
              ...gardenShop.itemData,
              ...gardenShop.eventItems,
            ].find((item) => item.key === plot.seedKey);
            if (shopItem && inventory.size() < global.Cassidy.invLimit) {
              const cache = inventory.getAll();
              shopItem.onPurchase({ ...ctx, moneySet: { inventory: cache } });
              inventory = new Inventory(cache);
              seedsGained.push(`${plot.icon} ${plot.name} (Seed)`);
            }
          }
          if (plot.harvestsLeft <= 0) {
            plots.deleteRef(plot);
          } else {
            plot.plantedAt = Date.now();
            plot.growthTime = Math.floor(plot.growthTime * 1.2);
            await applyMutation(
              plot,
              new Inventory<GardenTool>(
                rawInventory.filter(
                  (item) => item.type === "gardenTool"
                ) as GardenTool[]
              )
            );
            plots.deleteRef(plot);
            plots.addOne(plot);
          }
        }

        await money.setItem(input.senderID, {
          money: userMoney + moneyEarned,
          gardenPlots: Array.from(plots),
          inventory: Array.from(inventory),
          gardenStats,
          gardenEarns,
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
              `${plot.icon} ${plot.name}${
                plot.mutation
                  ? ` ${UNISpectra.disc} (${fonts.double_struck(
                      plot.mutation.toUpperCase?.()
                    )} +${abbreviateNumber(value.noExtra - plot.baseValue)})`
                  : ""
              } - ${formatCash(value.final, true)}`
          );
        const addedEarns = gardenEarns - origEarns;

        return output.replyStyled(
          `✅🧺 **Harvested**:\n${harvestedStr.join("\n")}\n\n` +
            (seedsGained.length > 0
              ? `🌱🧺 **Lucky Harvest Seeds**:\n${seedsGained.join("\n")}\n\n`
              : "") +
            `💰 Earned: ${formatCash(moneyEarned, true)}\n` +
            `💵 Balance: ${formatCash(userMoney + moneyEarned)}\n\n` +
            `📈 Total Earns: **${formatCash(
              gardenEarns
            )}** (+${abbreviateNumber(addedEarns)})\n\n` +
            `**Next Steps**:\n` +
            `${UNISpectra.arrowFromT} Plant more: ${prefix}${commandName}${
              isHypen ? "-" : " "
            }plant\n` +
            `${UNISpectra.arrowFromT} Check plots: ${prefix}${commandName}${
              isHypen ? "-" : " "
            }plots`,
          style
        );
      },
    },
    {
      key: "plots",
      description: "View your garden plots",
      aliases: ["-pl"],
      args: ["[page]"],
      async handler(_, { spectralArgs }) {
        const plots = new Inventory<GardenPlot>(rawPlots, plotLimit);
        const page = parseInt(spectralArgs[0]) || 1;
        const start = (page - 1) * ITEMS_PER_PAGE;
        const end = page * ITEMS_PER_PAGE;
        const currentPlots = [...plots.getAll()]
          .sort((a, b) => {
            const at = a.plantedAt + a.growthTime - Date.now();
            const ab = b.plantedAt + b.growthTime - Date.now();
            return at - ab;
          })
          .slice(start, end);
        let result = `🌱 **${name}'s Garden Plots (${
          plots.getAll().length
        }/${plotLimit}, Page ${page})**:\n\n`;
        if (currentPlots.length === 0) {
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

        for (let [index, plot] of currentPlots.entries()) {
          plot = await autoUpdateCropData(
            plot,
            new Inventory<GardenTool>(
              rawInventory.filter(
                (item) => item.type === "gardenTool"
              ) as GardenTool[]
            )
          );
          const timeLeft = cropTimeLeft(plot);
          result +=
            `${start + index + 1}. ${formatMutationStr(plot)}${
              plots.get(plot.key).some((i) => i.isFavorite) ? ` ⭐` : ""
            }\n` +
            `${UNIRedux.charm} Harvests Left: ${plot.harvestsLeft}\n` +
            `${UNIRedux.charm} Time Left: ${
              formatTimeSentence(timeLeft) ||
              (!isCropReady(plot) ? "***BUGGED***!" : "***READY***!")
            }\n` +
            `${UNIRedux.charm} Value: ${formatCash(
              calculateCropValue(
                plot,
                plots,
                gardenStats.expansions || 0,
                gardenEarns
              ).final
            )}\n\n`;
        }
        if (plots.getAll().length > end) {
          result += `View more: ${prefix}${commandName}${
            isHypen ? "-" : " "
          }plots ${page + 1}\n`;
        }

        result += `\n📈 Total Earns: ${formatCash(gardenEarns, true)}\n\n`;

        result +=
          `**Next Steps**:\n` +
          `${UNISpectra.arrowFromT} Harvest crops: ${prefix}${commandName}${
            isHypen ? "-" : " "
          }harvest\n` +
          `${UNISpectra.arrowFromT} Favorite crops: ${prefix}${commandName}${
            isHypen ? "-" : " "
          }favorite`;

        return output.replyStyled(result, style);
      },
    },
    {
      key: "top",
      description:
        "View top 10 garden earners (paged, ranks 20-11 for page 2, etc.)",
      aliases: ["-t"],
      args: ["[page]"],
      async handler(_, { spectralArgs }) {
        const page = parseInt(spectralArgs[0]) || 1;
        const startRank = (page - 1) * 10 + 1;
        const endRank = startRank + 9;

        const allUsers = await money.getAllCache();
        const userStats: {
          userId: string;
          name: string;
          totalEarns: number;
        }[] = [];

        for (const user of Object.values(allUsers)) {
          if (
            ((user.gardenPlots as GardenPlot[]) ?? []).length === 0 &&
            ((user.gardenEarns as number) ?? 0) < 1
          ) {
            continue;
          }
          const plots = new Inventory<GardenPlot>(
            user.gardenPlots || [],
            user.plotLimit || PLOT_LIMIT
          );

          let potentialEarnings = 0;

          plots.getAll().forEach((plot) => {
            if (isCropReady(plot)) {
              const value = calculateCropValue(
                plot,
                plots,
                user.gardenStats?.expansions || 0,
                user.gardenEarns || 0
              );
              potentialEarnings += value.noExtra * plot.harvestsLeft;
            }
          });

          userStats.push({
            userId: user.senderID,
            name: user.name || "Farmer",
            totalEarns: (user.gardenEarns || 0) + potentialEarnings,
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
            `${UNIRedux.arrowFromT}  **${user.name}**\n` +
            `📊🌱 ${formatCash(user.totalEarns, true)}\n`;
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
            `${UNIRedux.charm} Sell Price: ${formatCash(item.sellPrice)}\n` +
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
                      }x, Mutations +${
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
    {
      key: "uncage",
      description: "Uncage a pet to make it active",
      aliases: ["-u"],
      args: ["[pet_key]"],
      async handler(_, { spectralArgs }) {
        const inventory = new Inventory<GardenItem | InventoryItem>(
          rawInventory
        );
        const pets = new Inventory<GardenPetActive>(rawPets, PET_LIMIT);
        const equippedPets = pets
          .getAll()
          .filter((pet) => pet.isEquipped).length;
        const cagedPets = inventory
          .getAll()
          .filter(
            (item): item is GardenPetCage => item.type === "gardenPetCage"
          );
        if (equippedPets >= PET_EQUIP_LIMIT) {
          return output.replyStyled(
            `🐾 Max ${PET_EQUIP_LIMIT} equipped pets! Unequip or sell pets first.\n\n` +
              `**Next Steps**:\n` +
              `${UNISpectra.arrowFromT} View pets: ${prefix}${commandName}${
                isHypen ? "-" : " "
              }pets\n` +
              `${UNISpectra.arrowFromT} Sell pets: ${prefix}${commandName}${
                isHypen ? "-" : " "
              }sell`,
            style
          );
        }
        if (cagedPets.length === 0) {
          return output.replyStyled(
            `🐾 No caged pets! Buy some with ${prefix}${commandName}${
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

        if (!spectralArgs[0]) {
          return output.replyStyled(
            `❌ Specify a pet key to uncage! Check items with ${prefix}${commandName}${
              isHypen ? "-" : " "
            }list.\n\n` +
              `**Next Steps**:\n` +
              `${UNISpectra.arrowFromT} Plant seeds: ${prefix}${commandName}${
                isHypen ? "-" : " "
              }plant\n` +
              `${UNISpectra.arrowFromT} Buy items: ${prefix}${commandName}${
                isHypen ? "-" : " "
              }shop`,
            style
          );
        }

        let cagedPet: GardenPetCage;

        const selected = inventory.getOne(spectralArgs[0]);
        if (!selected || selected.type !== "gardenPetCage") {
          return output.replyStyled(
            `❌ Invalid pet key "${
              spectralArgs[0]
            }"! Check caged pets with ${prefix}${commandName}${
              isHypen ? "-" : " "
            }list.\n\n` +
              `**Next Steps**:\n` +
              `${UNISpectra.arrowFromT} List items: ${prefix}${commandName}${
                isHypen ? "-" : " "
              }list\n` +
              `${UNISpectra.arrowFromT} Buy pets: ${prefix}${commandName}${
                isHypen ? "-" : " "
              }shop`,
            style
          );
        }
        cagedPet = selected as GardenPetCage;

        if (pets.has(cagedPet.key)) {
          return ctx.output.replyStyled(
            "🐾 You cannot have this pet again.",
            style
          );
        }

        inventory.deleteOne(cagedPet.key);
        const isEquipped = equippedPets < 3;
        pets.addOne({
          ...cagedPet,
          key: cagedPet.key,
          name: cagedPet.petData.name,
          icon: cagedPet.icon,
          lastCollect: Date.now(),
          petData: cagedPet.petData,
          isEquipped,
        });

        await money.setItem(input.senderID, {
          inventory: Array.from(inventory),
          gardenPets: Array.from(pets),
        });

        return ctx.output.replyStyled(
          `🐾 Uncaged ${cagedPet.icon} **${cagedPet.name}**! It's now ${
            isEquipped
              ? "equipped and collecting seeds"
              : "active but not equipped"
          }.\n\n` +
            `**Next Steps**:\n` +
            `${UNISpectra.arrowFromT} View pets: ${prefix}${commandName}${
              isHypen ? "-" : " "
            }pets\n` +
            `${UNISpectra.arrowFromT} Equip pets: ${prefix}${commandName}${
              isHypen ? "-" : " "
            }pets`,
          style
        );
      },
    },
    {
      key: "pets",
      description: "View and manage active garden pets",
      aliases: ["-pt"],
      args: ["[equip/unequip/<page>] [pet_key]"],
      async handler(_, { spectralArgs }) {
        const pets = new Inventory<GardenPetActive>(rawPets, PET_LIMIT);
        let inventory = new Inventory<GardenItem | InventoryItem>(rawInventory);
        const page = parseInt(spectralArgs[0]) || 1;
        const action = spectralArgs[0];
        const petKey = spectralArgs[1];
        const equippedPets = pets
          .getAll()
          .filter((pet) => pet.isEquipped).length;

        if (action === "equip" && petKey) {
          const pet = pets.getOne(petKey);
          if (!pet) {
            return output.replyStyled(
              `❌ Invalid pet key "${petKey}"! Check pets with ${prefix}${commandName}${
                isHypen ? "-" : " "
              }pets.\n\n` +
                `**Next Steps**:\n` +
                `${UNISpectra.arrowFromT} View pets: ${prefix}${commandName}${
                  isHypen ? "-" : " "
                }pets`,
              style
            );
          }
          if (equippedPets >= PET_EQUIP_LIMIT) {
            return output.replyStyled(
              `❌ Max ${PET_EQUIP_LIMIT} equipped pets! Unequip a pet first.\n\n` +
                `**Next Steps**:\n` +
                `${UNISpectra.arrowFromT} View pets: ${prefix}${commandName}${
                  isHypen ? "-" : " "
                }pets`,
              style
            );
          }
          pet.isEquipped = true;
          await money.setItem(input.senderID, { gardenPets: Array.from(pets) });
          return output.replyStyled(
            `🐾 Equipped ${pet.icon} **${pet.name}**! It's now collecting seeds.\n\n` +
              `**Next Steps**:\n` +
              `${UNISpectra.arrowFromT} View pets: ${prefix}${commandName}${
                isHypen ? "-" : " "
              }pets`,
            style
          );
        } else if (action === "unequip" && petKey) {
          const pet = pets.getOne(petKey);
          if (!pet) {
            return output.replyStyled(
              `❌ Invalid pet key "${petKey}"! Check pets with ${prefix}${commandName}${
                isHypen ? "-" : " "
              }pets.\n\n` +
                `**Next Steps**:\n` +
                `${UNISpectra.arrowFromT} View pets: ${prefix}${commandName}${
                  isHypen ? "-" : " "
                }pets`,
              style
            );
          }
          pet.isEquipped = false;
          await money.setItem(input.senderID, { gardenPets: Array.from(pets) });
          return output.replyStyled(
            `🐾 Unequipped ${pet.icon} **${pet.name}**! It's no longer collecting seeds.\n\n` +
              `**Next Steps**:\n` +
              `${UNISpectra.arrowFromT} View pets: ${prefix}${commandName}${
                isHypen ? "-" : " "
              }pets`,
            style
          );
        }

        const start = (page - 1) * ITEMS_PER_PAGE;
        const end = page * ITEMS_PER_PAGE;
        const currentPets = pets.getAll().slice(start, end);
        let result = `🐾 **${name}'s Active Pets (Page ${page})**:\n\n`;
        if (currentPets.length === 0) {
          return output.replyStyled(
            `🐾 No active pets! Uncage some with ${prefix}${commandName}${
              isHypen ? "-" : " "
            }uncage.\n\n` +
              `**Next Steps**:\n` +
              `${UNISpectra.arrowFromT} Uncage pets: ${prefix}${commandName}${
                isHypen ? "-" : " "
              }uncage\n` +
              `${
                UNISpectra.arrowFromT
              } Buy caged pets: ${prefix}${commandName}${
                isHypen ? "-" : " "
              }shop`,
            style
          );
        }

        let totalSeedsCollected = 0;
        let finalCollected: GardenItem[] = [];
        currentPets.forEach((pet, index) => {
          const {
            collections,
            collected,
            inventory: rInv,
          } = updatePetCollection(pet, inventory as Inventory<GardenItem>, ctx);
          inventory = rInv;
          finalCollected.push(...collected);
          totalSeedsCollected += collections;
          totalSeedsCollected = Math.min(
            global.Cassidy.invLimit,
            totalSeedsCollected
          );
          result +=
            `${start + index + 1}. ${pet.icon} **${pet.name}**${
              pet.isEquipped ? ` (Equipped)` : ""
            }\n` +
            `${UNIRedux.charm} Collects: ${pet.petData.seedTypes.join(
              ", "
            )}\n` +
            `${UNIRedux.charm} Rate: ${pet.petData.collectionRate} seeds/min${
              collections > 0 ? ` (+${collections} seeds)` : ""
            }\n\n`;
        });

        await money.setItem(input.senderID, {
          inventory: Array.from(inventory),
          gardenPets: Array.from(pets),
        });
        const finalCollInv = new Inventory(finalCollected);

        result +=
          `🌱 Total Seeds Collected: **${totalSeedsCollected}${
            totalSeedsCollected > 0 ? ` (+${totalSeedsCollected})` : ""
          }**\n\n` +
          `${finalCollInv
            .toUnique()
            .map(
              (s) =>
                `**x${finalCollInv.getAmount(s.key)}** ${s.icon} **${
                  s.name
                }** (Key: **${s.key}**)`
            )
            .join("\n")}\n\n` +
          `**Next Steps**:\n` +
          `${UNISpectra.arrowFromT} Check items: ${prefix}${commandName}${
            isHypen ? "-" : " "
          }list\n` +
          `${UNISpectra.arrowFromT} Plant seeds: ${prefix}${commandName}${
            isHypen ? "-" : " "
          }plant\n` +
          `${UNISpectra.arrowFromT} Uncage more: ${prefix}${commandName}${
            isHypen ? "-" : " "
          }uncage`;

        return output.replyStyled(result, style);
      },
    },
    {
      key: "steal",
      description: "Steal a crop from another player's garden",
      aliases: ["-st"],
      args: ["[player_id]"],
      async handler(_, { spectralArgs }) {
        const stealCost = 5;
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
        if (!spectralArgs[0]) {
          return output.replyStyled(
            `❌ Please specify a player ID to steal from!\n\n` +
              `**Next Steps**:\n` +
              `${UNISpectra.arrowFromT} Try again: ${prefix}${commandName}${
                isHypen ? "-" : " "
              }steal [player_id]`,
            style
          );
        }
        const target = await money.getCache(spectralArgs[0]);
        const targetPlots = new Inventory<GardenPlot>(target.gardenPlots || []);
        const stealablePlots = targetPlots
          .getAll()
          .filter((plot) => isCropReady(plot) && !plot.isFavorite);
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

        const stealSuccess = Math.random() > 0.3;
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

        const stolenPlot =
          stealablePlots[Math.floor(Math.random() * stealablePlots.length)];
        let inventory = new Inventory<GardenItem | InventoryItem>(rawInventory);
        const shopItem = [
          ...gardenShop.itemData,
          ...gardenShop.eventItems,
        ].find((item) => item.key === stolenPlot.seedKey);
        if (shopItem && inventory.size() < global.Cassidy.invLimit) {
          const cache = inventory.getAll();
          shopItem.onPurchase({ ...ctx, moneySet: { inventory: cache } });
          inventory = new Inventory(cache);
        }
        targetPlots.deleteRef(stolenPlot);
        collectibles.raise("gems", -stealCost);
        await money.setItem(input.senderID, {
          collectibles: Array.from(collectibles),
          inventory: Array.from(inventory),
        });
        await money.setItem(spectralArgs[0], {
          gardenPlots: Array.from(targetPlots),
        });

        return output.replyStyled(
          `✅ Stole ${formatMutationStr(stolenPlot)} for ${formatValue(
            stealCost,
            "💎",
            true
          )}!\n\n` +
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

        plots.getAll().forEach((plot) => {
          plot.plantedAt = 0;
        });
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
      key: "event",
      description: "Check current garden event or weather",
      aliases: ["-e"],
      async handler() {
        const event = await getCurrentEvent();
        const upcomingEventsCount = 3;
        const upcomingEvents = [];

        for (let i = 1; i <= upcomingEventsCount; i++) {
          const nextEvent = await getNextEvent(i);
          upcomingEvents.push(`${nextEvent.icon} ${nextEvent.name}`);
        }

        const timeLeft = await getTimeForNextEvent();

        const result = [
          `🌦️ **Current Event & Weather**: ${event.icon} ${event.name}`,
          `${UNIRedux.charm} Mutation Chance: +${(
            event.effect.mutationChance * 100
          ).toFixed(0)}%`,
          `${UNIRedux.charm} Growth Speed: ${event.effect.growthMultiplier}x`,
        ];

        if (event.effect.mutationType) {
          result.push(
            `${UNIRedux.charm} Mutation Type: ${
              event.effect.mutationType ?? "None"
            }`
          );
        }

        result.push(
          `🕒 Next Event in: ${formatTimeSentence(timeLeft) || "Ready!"}`
        );

        result.push(`\n🌟 **Upcoming Events:**\n${upcomingEvents.join("\n")}`);

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
      description: "Skip garden events, positive or negative.",
      aliases: ["-sk"],
      args: ["[number/'reset']"],
      async handler(_, { spectralArgs }) {
        if (!input.hasRole(InputRoles.MODERATORBOT)) {
          return output.reply(`🔒 Only moderators can skip events.`);
        }
        const event = await getCurrentEvent();
        if (spectralArgs[0] === "reset") {
          await Cassidy.databases.globalDB.setItem("skipStamp", {
            skipStamp: 0,
          });
        } else {
          const skips = parseInt(spectralArgs[0]) || 1;
          await skipEvent(skips);
        }

        const newEvent = await getCurrentEvent();
        return output.reply(
          `✅ ${
            spectralArgs[0] === "reset"
              ? `Revoked skips to **original**.`
              : `Skipped **${parseInt(spectralArgs[0]) || 1}** events.`
          }\n\n🌦️ **Skipped**: ${event.icon} ${
            event.name
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
            }harvest. 5% chance to get a seed (Lucky Harvest).\n` +
            `${UNIRedux.charm} **Mutations**: Crops may mutate (e.g., Wet, Shocked), boosting value. Affected by weather, tools, and pets.\n` +
            `${
              UNIRedux.charm
            } **Pets**: Uncage pets with ${prefix}${commandName}${
              isHypen ? "-" : " "
            }uncage to collect seeds (up to ${PET_EQUIP_LIMIT} equipped).\n` +
            `${UNIRedux.charm} **Tools**: Sprinkler and Fertilizer boost growth and mutations. Favorite Tool protects items.\n` +
            `${UNIRedux.charm} **Events**: Weekly weather/events (e.g., ${EVENT_CONFIG.EVENTS[0].name}) offer exclusive seeds and bonuses.\n` +
            `${
              UNIRedux.charm
            } **Favoriting**: Use Favorite Tool to mark items/crops with ${prefix}${commandName}${
              isHypen ? "-" : " "
            }favorite to prevent selling.\n` +
            `${
              UNIRedux.charm
            } **Stealing**: Steal crops from others for ${formatCash(
              1000
            )} with ${prefix}${commandName}${
              isHypen ? "-" : " "
            }steal (70% success).\n` +
            `${
              UNIRedux.charm
            } **Gifting**: Gift items/crops with ${prefix}${commandName}${
              isHypen ? "-" : " "
            }gift. Toggle with ${prefix}${commandName}${
              isHypen ? "-" : " "
            }settings.\n` +
            `${
              UNIRedux.charm
            } **Grow All**: Instantly grow all crops for ${formatCash(
              5000
            )} with ${prefix}${commandName}${isHypen ? "-" : " "}growall.\n` +
            `${
              UNIRedux.charm
            } **Expand**: Add plots with ${prefix}${commandName}${
              isHypen ? "-" : " "
            }expand (costs ${formatCash(250000000)}-${formatCash(
              1000000000
            )}).\n` +
            `${
              UNIRedux.charm
            } **Sell**: Sell items/crops at Steven's Stand with ${prefix}${commandName}${
              isHypen ? "-" : " "
            }sell.\n\n` +
            `**Tips**:\n` +
            `- Check events with ${prefix}${commandName}${
              isHypen ? "-" : " "
            }event for bonuses.\n` +
            `- Use tools to speed up growth and get rare mutations.\n` +
            `- Favorite valuable items to avoid accidental sales.\n` +
            `- Expand your plot to grow more crops at once!\n\n` +
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
