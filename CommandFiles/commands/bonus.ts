import { CollectibleItem, InventoryItem } from "@cass-modules/cassidyUser";
import { CROP_CONFIG } from "@cass-modules/GardenConfig";
import { Inventory } from "@cass-modules/InventoryEnhanced";
import { UNIRedux } from "@cassidy/unispectra";
import { generateGift } from "@cassidy/ut-shop";
import { FontSystem } from "cassidy-styler";

export const meta: CommandMeta = {
  name: "daily",
  description: "Daily login bonus!",
  version: "2.0.0",
  author: "Liane Cagara",
  category: "Rewards",
  otherNames: ["bonus"],
  requirement: "4.1.0",
  icon: "💎",
};

export const style: CommandStyle = {
  title: "Login Bonus 💎",
  titleFont: "bold",
  contentFont: "fancy",
  topLine: "double",
  lineDeco: "none",
};

export interface Reward {
  items: InventoryItem[];
  clls: { key: string; amountAdded: number }[];
  cash: number;
  bp: number;
}

export const possibleRewardItems = new Inventory([
  generateGift("gift", {
    name: "Basic Pet Bundle ☆",
    icon: "🐾",
    flavorText: "A bundle of pets for sale! Use inv use to open.",
    sellPrice: 3100,
    treasureKey: "randomGrouped_petsI",
    key: "petBundle",
  }),
  {
    name: "Shadow Coin",
    key: "shadowCoin",
    flavorText:
      "A coin rumored to have been forged in the depths of a forgotten realm, carrying with it the clandestine power to transfer fortunes unseen.",
    icon: "🌒",
    type: "food",
    heal: 120,
    sellPrice: 500,
    healParty: true,
  },
  {
    name: "Lotto Ticket",
    key: "lottoTicket",
    flavorText:
      "A mysterious ticket purchased from the Meow Shop. Its purpose remains unclear, but it brims with potential.",
    icon: "🔖",
    type: "key",
    sellPrice: 5,
    prob: 0.35,
    group: ["generic", "banking"],
  },
  generateGift("gift"),
  generateGift("pack"),

  {
    name: "Dog",
    key: "dog",
    flavorText: "A loyal pet from the Pet Shop. Always there for you.",
    icon: "🐕",
    type: "pet",
    sellPrice: 250,
    group: ["pets", "petsI"],
    prob: 1,
  },
  {
    name: "Deer",
    key: "deer",
    flavorText: "A gentle pet from the Pet Shop. Moves with grace.",
    icon: "🦌",
    type: "pet",
    sellPrice: 350,
    group: ["pets", "petsI"],
    prob: 1,
  },
  {
    name: "Tiger",
    key: "tiger",
    flavorText: "A majestic pet from the Pet Shop. Commands respect.",
    icon: "🐅",
    type: "pet",
    sellPrice: 750,
    group: ["pets", "petsI"],
    prob: 1,
  },
  {
    name: "Snake",
    key: "snake",
    flavorText: "A mysterious pet from the Pet Shop. Intriguing to watch.",
    icon: "🐍",
    type: "pet",
    sellPrice: 500,
    group: ["pets", "petsI"],
    prob: 1,
  },
  {
    name: "Dragon",
    key: "dragon",
    flavorText: "A legendary pet from the Pet Shop. A symbol of power.",
    icon: "🐉",
    type: "pet",
    sellPrice: 1200,
    group: ["pets", "petsI"],
    prob: 1,
  },
  {
    name: "Cat",
    key: "cat",
    flavorText: "A curious pet from the Rosa Shop. Loves to explore.",
    icon: "🐈",
    type: "pet",
    sellPrice: 200,
  },
  {
    name: "Cosmic Punch 𝔼𝕏 ✦",
    icon: "🥊",
    key: "cosmicPunchEX",
    sellPrice: 500,
    type: "food",
    heal: 250,
    flavorText:
      "Punchy cosmic treats for your cosmic dragon, normal dragon.. or almost everyone",
    picky: true,
    prob: 0.35,
    group: ["generic", "petfoods", "dragonhelp", "punch"],
  },
  {
    key: "gsBamboo",
    name: "Bamboo Seed",
    flavorText: "Fast-growing and sturdy.",
    icon: "🎍",
    type: "gardenSeed",
    sellPrice: 1,
    cropData: {
      baseValue: 3610,
      growthTime: CROP_CONFIG.GROWTH_BASE * 10,
      harvests: 1,
      yields: 1,
      baseKG: 5,
    },
  },
  {
    name: "HighRoll Pass",
    key: "highRollPass",
    flavorText:
      "A pass won by achieving a 7-win streak in slots. This pass allows you to place slot bets over 100000, unlocking bigger wins and higher stakes. Remember, with great risk comes great reward. Surprisingly easy to toss away like a normal item!",
    icon: "🃏",
    sellPrice: 2500000,
    type: "armor",
    def: 15,
    prob: 0.005,
    group: ["generic", "cards", "pass"],
  },
  {
    name: "Cursed Sword",
    key: "cursedSword",
    flavorText:
      "A sword delicately developed by the witches using the special ore's and special cursed magic, this sword allows you to get 20% atk damage to the enemies.",
    icon: "🗡️",
    type: "weapon",
    def: 4,
    atk: 20,
    sellPrice: 3000,
    prob: 0.1,
    group: ["generic", "gears"],
  },
  {
    name: "Endless Battle",
    icon: "🔱",
    flavorText:
      "War has never ceased in the Land of Dawn: the Endless War, the unification of the Moniyan Empire, the Conflicts in the North... The artifact has witness every struggle for survival for centuries.",
    key: "endlessBattle",
    group: ["generic", "legends"],
    prob: 0.1,
    type: "weapon",
    atk: 65,
    def: -45,
    sellPrice: 500000,
  },
  {
    name: "Kraken",
    key: "kraken",
    flavorText: "A legendary sea monster with immense power and tentacles.",
    icon: "🐙",
    type: "pet",
    sellPrice: 4500,
    group: ["pets", "petsIII"],
    prob: 1,
  },
  {
    name: "Panda",
    key: "panda",
    flavorText:
      "A cute creature with a natural talent of balancing the power of the Yin and Yang.",
    icon: "🐼",
    type: "pet",
    sellPrice: 1400,
    group: ["pets", "petsII"],
    prob: 0.5,
    cannotToss: false,
  },
  {
    name: "Bamboo Boquet",
    key: "bambooSticks",
    flavorText:
      "Freshly grown green bamboos that good for pandas. If you wonder what's inside the belly of the pandas, this is what it is.",
    icon: "🎍",
    type: "panda_food",
    sellPrice: 550,
    saturation: 6000000,
    cannotToss: false,
  },
  {
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
      baseKG: 8,
    },
  },
  {
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
      baseKG: 3,
    },
  },
  {
    key: "gsSugarApple",
    name: "Sugar Apple",
    flavorText: "Do we still need flavor texts?",
    icon: "🍏",
    type: "gardenSeed",
    sellPrice: 1,
    cropData: {
      baseValue: 43_320,
      growthTime: CROP_CONFIG.GROWTH_BASE * 0.3,
      harvests: 800,
      yields: 26,
      baseKG: 6,
    },
  },
  {
    key: "gsEmberLily",
    name: "Ember Lily",
    flavorText: "A blazing bloom that thrives in heat and glows at dusk.",
    icon: "🏵️",
    type: "gardenSeed",
    sellPrice: 1,
    cropData: {
      baseValue: 50_138,
      growthTime: CROP_CONFIG.GROWTH_BASE * 0.2,
      harvests: 400,
      yields: 24,
      baseKG: 12,
    },
  },
  {
    key: "pFlowerSeed",
    name: "Flower Seed Pack",
    flavorText: "A seed pack contaning many types of flower seeds.",
    icon: "🎴🪻",
    type: "roulette_pack",
    sellPrice: 1,
    treasureKey: "randomGrouped_pFlowers",
  },
  {
    key: "gsLilac",
    name: "Lilac Seed",
    flavorText:
      "Elegant pink blossoms spiral up a long green stem, flourishing with legendary charm.",
    icon: "💮🌿",
    type: "gardenSeed",
    sellPrice: 1,
    cropData: {
      baseValue: 31_588,
      growthTime: CROP_CONFIG.GROWTH_BASE * 5.25,
      harvests: 80,
      yields: 6,
    },
  },
  {
    key: "gsRose",
    name: "Rose Seed",
    flavorText:
      "A thorny yet elegant flower, blooming in deep maroon from angular petals.",
    icon: "🌹",
    type: "gardenSeed",
    sellPrice: 1,
    cropData: {
      baseValue: 4_513,
      growthTime: CROP_CONFIG.GROWTH_BASE * 5.2,
      harvests: 60,
      yields: 3,
    },
  },
  {
    key: "gsSunflower",
    name: "Sunflower Seed",
    flavorText:
      "A divine bloom that follows the sun's gaze, radiating unmatched brilliance with every harvest.",
    icon: "🌻🌞",
    type: "gardenSeed",
    sellPrice: 1,
    cropData: {
      baseValue: 144_400,
      growthTime: CROP_CONFIG.GROWTH_BASE * 3.8,
      harvests: 240,
      yields: 10,
      baseKG: 25,
    },
  },
  {
    name: "Mystic Nectar 𝔼𝕏 ✦",
    key: "mysticNectarEX",
    flavorText:
      "Harvested from sky-blooms during lunar eclipses. Griffins and dragons adore it.",
    icon: "🧃",
    type: "mythical_food",
    sellPrice: 1000,
    saturation: 400 * 60 * 1000,
    prob: 0.5,
    picky: true,
    group: ["generic", "petfoods", "unicornhelp", "griffinhelp", "dragonhelp"],
  },
  {
    name: "Starfeather Jerky 𝔼𝕏 ✦",
    key: "starfeatherJerkyEX",
    flavorText:
      "Sun-dried meats of meteoric birds, fit for a Griffin's celestial appetite.",
    icon: "🪶",
    type: "griffin_food",
    sellPrice: 650,
    saturation: 280 * 60 * 1000,
    prob: 0.35,
    picky: true,
    group: ["generic", "petfoods", "griffinhelp"],
  },
  {
    name: "Leviathan Lure 𝔼𝕏 ✦",
    key: "leviathanLureEX",
    flavorText:
      "A titanic seafood platter that whispers to deep-sea beasts. Kraken-approved.",
    icon: "🐙",
    type: "kraken_food",
    sellPrice: 800,
    saturation: 350 * 60 * 1000,
    prob: 0.35,
    picky: true,
    group: ["generic", "petfoods", "krakenhelp"],
  },
]);

export const possibleRewardPacks = new Inventory([
  {
    key: "beginnerPack",
    name: "Beginner Bonus Pack",
    icon: "📦👶",
    type: "zip",
    sellPrice: -1,
    flavorText: "Decent pack for any player that's just starting the game.",
    zipContents: [
      { ...possibleRewardItems.getOne("petBundle") },
      { ...possibleRewardItems.getOne("shadowCoin") },
      { ...possibleRewardItems.getOne("shadowCoin") },
      { ...possibleRewardItems.getOne("lottoTicket") },
      { ...possibleRewardItems.getOne("lottoTicket") },
      { ...possibleRewardItems.getOne("giftPack") },
    ],
  },
  {
    key: "lovePack",
    name: "Loved Bonus Pack",
    icon: "📦💌",
    type: "zip",
    sellPrice: -1,
    flavorText:
      "Well crafted pack with some love, a very pleasant gift to anyone.",
    zipContents: [
      { ...possibleRewardItems.getOne("cat") },
      { ...possibleRewardItems.getOne("cat") },
      { ...possibleRewardItems.getOne("cosmicPunchEX") },
      { ...possibleRewardItems.getOne("gift") },
      { ...possibleRewardItems.getOne("gsCocounut") },
      { ...possibleRewardItems.getOne("gsCocounut") },
    ],
  },
  {
    key: "bambooPack1",
    name: "Bamboo Bonus Pack",
    icon: "📦🎍",
    type: "zip",
    sellPrice: -1,
    flavorText: "A pack that literally has anything related to bamboo.",
    zipContents: [
      { ...possibleRewardItems.getOne("panda") },
      { ...possibleRewardItems.getOne("panda") },
      { ...possibleRewardItems.getOne("bambooSticks") },
      { ...possibleRewardItems.getOne("bambooSticks") },
      { ...possibleRewardItems.getOne("gsBamboo") },
      { ...possibleRewardItems.getOne("gsBamboo") },
    ],
  },
  {
    key: "wieldersPack",
    name: "Wielders Bonus Pack",
    icon: "📦⚔️",
    type: "zip",
    sellPrice: -1,
    flavorText: "Pack for arena players!",
    zipContents: [
      { ...possibleRewardItems.getOne("cursedSword") },
      { ...possibleRewardItems.getOne("cursedSword") },
      { ...possibleRewardItems.getOne("dragon") },
      { ...possibleRewardItems.getOne("cosmicPunchEX") },
      { ...possibleRewardItems.getOne("cosmicPunchEX") },
      { ...possibleRewardItems.getOne("snake") },
    ],
  },
  {
    key: "wieldersPack2",
    name: `Wielders Bonus Pack ${FontSystem.applyFonts(
      "PLUS",
      "double_struck"
    )}`,
    icon: "📦⚔️",
    type: "zip",
    sellPrice: -1,
    flavorText: "Pack for arena players! But better!!",
    zipContents: [
      { ...possibleRewardItems.getOne("endlessBattle") },
      { ...possibleRewardItems.getOne("endlessBattle") },
      { ...possibleRewardItems.getOne("kraken") },
      { ...possibleRewardItems.getOne("kraken") },
      { ...possibleRewardItems.getOne("cosmicPunchEX") },
      { ...possibleRewardItems.getOne("cosmicPunchEX") },
    ],
  },
  {
    key: "jandelPack1",
    name: `Jandel Bonus Pack`,
    icon: "📦🌱",
    type: "zip",
    sellPrice: -1,
    flavorText: "Pack for gardeners, I guess?",
    zipContents: [
      { ...possibleRewardItems.getOne("gsPepper") },
      { ...possibleRewardItems.getOne("gsPepper") },
      { ...possibleRewardItems.getOne("gsCoconut") },
      { ...possibleRewardItems.getOne("gsCoconut") },
      { ...possibleRewardItems.getOne("gsSugarApple") },
      { ...possibleRewardItems.getOne("gsEmberLily") },
    ],
  },
  {
    key: "jandelPack2",
    name: `Jandel Bonus Pack II`,
    icon: "📦🐝",
    type: "zip",
    sellPrice: -1,
    flavorText: "Pack for gardeners, and the forgotten bees, lmao.",
    zipContents: [
      { ...possibleRewardItems.getOne("pFlowerSeed") },
      { ...possibleRewardItems.getOne("pFlowerSeed") },
      { ...possibleRewardItems.getOne("pFlowerSeed") },
      { ...possibleRewardItems.getOne("gsLilac") },
      { ...possibleRewardItems.getOne("gsRose") },
      { ...possibleRewardItems.getOne("gsSunflower") },
    ],
  },
  {
    key: "mexPack",
    name: `${FontSystem.applyFonts("EX", "double_struck")} Foods Bonus Pack`,
    icon: "📦🧃",
    type: "zip",
    sellPrice: -1,
    flavorText: "A pack with literally free of the paywalled foods for pets.",
    zipContents: [
      { ...possibleRewardItems.getOne("cosmicPunchEX") },
      { ...possibleRewardItems.getOne("cosmicPunchEX") },
      { ...possibleRewardItems.getOne("cosmicPunchEX") },
      { ...possibleRewardItems.getOne("mysticNectarEX") },
      { ...possibleRewardItems.getOne("starfeatherJerkyEX") },
      { ...possibleRewardItems.getOne("leviathanLureEX") },
    ],
  },
  {
    key: "giftOverloadPack",
    name: `Gift Overload Bonus Pack`,
    icon: "📦🎁",
    type: "zip",
    sellPrice: -1,
    flavorText: "A pack with 6 gifts, okay?",
    zipContents: [
      { ...possibleRewardItems.getOne("gift") },
      { ...possibleRewardItems.getOne("gift") },
      { ...possibleRewardItems.getOne("gift") },
      { ...possibleRewardItems.getOne("gift") },
      { ...possibleRewardItems.getOne("gift") },
      { ...possibleRewardItems.getOne("gift") },
    ],
  },
  {
    key: "gamblerPack",
    name: "Gambler10 Bonus Pack",
    icon: "📦🎰",
    type: "zip",
    sellPrice: -1,
    flavorText: "A pack for gamblers! Worth 10 days of streak.",
    zipContents: [
      { ...possibleRewardItems.getOne("highRollPass") },
      { ...possibleRewardItems.getOne("lottoTicket") },
      { ...possibleRewardItems.getOne("lottoTicket") },
      { ...possibleRewardItems.getOne("shadowCoin") },
      { ...possibleRewardItems.getOne("shadowCoin") },
      { ...possibleRewardItems.getOne("shadowCoin") },
    ],
  },
]);

export const STREAK_REWARDS_0: Reward[] = [
  {
    cash: 10000,
    bp: 0,
    clls: [{ key: "gems", amountAdded: 3 }],
    items: [{ ...possibleRewardPacks.getOne("beginnerPack") }],
  },
];

export async function entry({
  input,
  output,
  money,
  Collectibles,
  CassExpress,
  CassEXP,
  getInflationRate,
}: CommandContext) {
  let {
    money: userMoney,
    lastDailyClaim,
    collectibles: rawCLL,
    battlePoints = 0,
    cassExpress: cexpr = {},
    cassEXP: cxp,
    name = "Unregistered",
  } = await money.getItem(input.senderID);
  let cassEXP = new CassEXP(cxp);
  const cassExpress = new CassExpress(cexpr);
  const rate = await getInflationRate();
  const collectibles = new Collectibles(rawCLL);

  const currentTime = Date.now();
  const oneDayInMilliseconds = 24 * 60 * 60 * 1000;

  let canClaim = false;

  const elapsedTime = currentTime - (lastDailyClaim || Date.now());
  const claimTimes = Math.max(
    1,
    Math.floor(elapsedTime / oneDayInMilliseconds)
  );
  let dailyReward = 100 * claimTimes;
  dailyReward + Math.floor(dailyReward + dailyReward * rate);
  const gemReward = claimTimes;
  const extraEXP = claimTimes * cassEXP.level * 5;
  const petPoints = Math.floor(dailyReward / 10);

  const rewardList =
    `${UNIRedux.arrow} ***Next Rewards***\n\n` +
    `🧪 **Experience Points** (x${extraEXP}) [exp]\n` +
    `💵 **Money** (x${dailyReward.toLocaleString()}) [money]\n` +
    `💶 **Pet Points** (x${petPoints.toLocaleString()}) [battlePoints]\n` +
    `💎 **Gems** (x${gemReward}) [gems]`;

  if (!lastDailyClaim) {
    canClaim = true;
  } else {
    const timeElapsed = currentTime - lastDailyClaim;
    if (timeElapsed >= oneDayInMilliseconds) {
      canClaim = true;
    } else if (input.isAdmin && input.arguments[0] === "cheat") {
      canClaim = true;
    } else {
      const timeRemaining = oneDayInMilliseconds - timeElapsed;
      const hoursRemaining = Math.floor(
        (timeRemaining / (1000 * 60 * 60)) % 24
      );
      const minutesRemaining = Math.floor((timeRemaining / (1000 / 60)) % 60);
      const secondsRemaining = Math.floor((timeRemaining / 1000) % 60);

      return output.reply(
        `👤 **${name}** (Daily Claim)\n\n` +
          `❌ Wait ${hoursRemaining} hours, ${minutesRemaining} minutes, and ${secondsRemaining} seconds to claim again.\n\n` +
          `${rewardList}`
      );
    }
  }

  if (canClaim) {
    cassExpress.createMail({
      title: `Daily Reward Claimed`,
      author: input.senderID,
      body: `Congratulations **${name}** for claiming your daily reward!`,
      timeStamp: Date.now(),
    });

    cassEXP.expControls.raise(extraEXP);
    collectibles.raise("gems", gemReward);
    await money.setItem(input.senderID, {
      money: userMoney + dailyReward,
      lastDailyClaim: currentTime,
      battlePoints: battlePoints + petPoints,
      collectibles: Array.from(collectibles),
      cassExpress: cassExpress.raw(),
      cassEXP: cassEXP.raw(),
    });

    const claimedList =
      `${UNIRedux.arrow} ***Rewards***\n\n` +
      `🧪 **Experience Points** (x${extraEXP}) [exp]\n` +
      `💵 **Money** (x${dailyReward.toLocaleString()}) [money]\n` +
      `💶 **Pet Points** (x${petPoints.toLocaleString()}) [battlePoints]\n` +
      `💎 **Gems** (x${gemReward}) [gems]`;

    return output.reply(
      `👤 **${name}** (Daily Claim)\n\n` +
        `✅ Claimed your daily reward! Come back tomorrow.\n\n` +
        `${claimedList}`
    );
  }
}
