// @ts-check
import { CassEXP } from "../modules/cassEXP.js";
import { clamp } from "@cassidy/unispectra";
import { Inventory, Collectibles } from "@cass-modules/InventoryEnhanced";

export const meta = {
  name: "ut-shop",
  author: "Liane Cagara",
  version: "1.2.7",
  description: "I'm lazy so I made these",
  supported: "^1.0.0",
  order: 1,
  type: "plugin",
  expect: [
    "getInflationRate",
    "randomWithProb",
    "generateGift",
    "generateTrash",
    "generateTreasure",
    "Collectibles",
    "treasures",
    "petPlayerMaps",
    "UTShop",
    "Inventory",
    "CassEXP",
  ],
};
const { parseCurrency: pCy } = global.utils;

export function generateGift() {
  return {
    name: "Gift",
    icon: "🎁",
    flavorText:
      "This is a gift item, this item might grant you something. It's not guaranteed enough, you can use this using inventory command, if you know..",
    sellPrice: 100,
    type: "treasure",
    treasureKey: "generic",
    key: "gift",
  };
}
export function generateTrash() {
  const types = ["dog", "cat", "dragon", "anypet"];
  const type = types[Math.floor(Math.random() * types.length)];
  return {
    name: `***${String(type).toUpperCase()}*** Canned Food `,
    icon: "🥫",
    flavorText: `This is a canned food item, it's not very edible but it's a good product.`,
    sellPrice: 100,
    type: `${type}_food`,
    saturation: (Math.floor(Math.random() * 27) + 5) * 60 * 1000,
    key: `${type}Can`,
    prob: (70 + Math.floor(Math.random() * 100) - 70) / 100,
    group: ["generic", "unlucky", ...(type === "anypet" ? [] : ["curse"])],
    isTrash: true,
  };
}

export function generateChequeGift(amount = 100, groups = []) {
  return {
    key: `cheque_${amount}`,
    icon: "💵",
    name: `Cheque of $${amount}`,
    flavorText: `A cheque worth $${amount} that is found from a gift. Cash it to add the amount to your balance.`,
    chequeAmount: amount,
    sellPrice: Math.floor(amount * 0.75),
    type: "cheque",
    cannotToss: false,
    prob: Math.min(Math.pow(1 / amount, 0.3), 1),
    group: groups.length > 0 ? groups : ["generic", "money"],
  };
}

export function generateTrashOld() {
  const types = ["dog", "cat", "dragon"];
  const type = types[Math.floor(Math.random() * types.length)];
  return {
    name: "Trash",
    icon: "🗞️",
    flavorText: `A not-so-useless pile of newspapers, and might be a food for your ${type}.`,
    sellPrice: 20,
    type: `${type}_food`,
    saturation: (Math.floor(Math.random() * 27) + 5) * 60 * 1000,
    key: "trash",
    isTrash: true,
    prob: (70 + Math.floor(Math.random() * 100) - 70) / 100,
    picky: true,
    group: ["generic", "unlucky", "curse"],
  };
}

const rarePets = [
  {
    name: "Unicorn",
    key: "unicorn",
    flavorText:
      "A mythical horse with a single horn. Radiates purity and magic.",
    icon: "🦄",
    type: "pet",
    sellPrice: 2000,
    group: ["pets", "petsII"],
    prob: 1,
  },
  {
    name: "Yeti",
    key: "yeti",
    flavorText:
      "A legendary creature from snowy mountains. Mysterious and elusive.",
    icon: "🏔️",
    type: "pet",
    sellPrice: 1800,
    group: ["pets", "petsII"],
    prob: 1,
  },
  {
    name: "Leviathan",
    key: "leviathan",
    flavorText: "A massive sea serpent with power to stir the oceans.",
    icon: "🌊",
    type: "pet",
    sellPrice: 2400,
    group: ["pets", "petsII"],
    prob: 1,
  },
  {
    name: "Cerberus",
    key: "cerberus",
    flavorText: "A three-headed guardian of the underworld. Fear incarnate.",
    icon: "🐕‍🦺",
    type: "pet",
    sellPrice: 3000,
    group: ["pets", "petsII"],
    prob: 1,
  },
  {
    name: "Sphinx",
    key: "sphinx",
    flavorText:
      "A mythical creature with the body of a lion and the head of a human.",
    icon: "🦁🗿",
    type: "pet",
    sellPrice: 2000,
    group: ["pets", "petsIII"],
    prob: 1,
  },
  {
    name: "Griffin",
    key: "griffin",
    flavorText:
      "A majestic creature with the body of a lion and wings of an eagle.",
    icon: "🦁🦅",
    type: "pet",
    sellPrice: 3000,
    group: ["pets", "petsIII"],
    prob: 1,
  },
  {
    name: "Pegasus",
    key: "pegasus",
    flavorText: "A divine winged horse. Swift and graceful in flight.",
    icon: "🐎✨",
    type: "pet",
    sellPrice: 4000,
    group: ["pets", "petsIII"],
    prob: 1,
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
];

export const treasures = [
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
    name: "Shadow Coin",
    key: "shadowCoin",
    flavorText:
      "A coin rumored to have been forged in the depths of a forgotten realm, carrying with it the clandestine power to transfer fortunes unseen.",
    icon: "🌒",
    type: "food",
    heal: 120,
    sellPrice: 500,
    healParty: true,
    prob: 0.2,
    group: ["generic", "banking"],
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
  {
    key: "tilesBomb",
    name: "Tiles Bomb",
    flavorText:
      "These are leftover bombs from the tiles game, you need to get rid of these ASAP.",
    icon: "💣",
    sellPrice: 500,
    type: "weapon",
    atk: 5,
    def: 1,
    prob: 0.6,
    group: ["generic", "tiles", "unlucky", "curse"],
  },
  {
    name: "Dog Tag",
    key: "dogTag",
    flavorText: "Changes the name of the pet.",
    icon: "🏷️",
    type: "utility",
    sellPrice: 300,
    prob: 0.1,
    group: ["generic", "octoshop", "customize"],
  },
  {
    name: "Cosmic Crunch 𝔼𝕏 ✦",
    icon: "☄️",
    key: "cosmicCrunchEX",
    sellPrice: 500,
    type: "dragon_food",
    saturation: 250 * 60 * 1000,
    flavorText:
      "Tasty cosmic treats for your cosmic dragon.. or normal dragon.",
    picky: true,
    prob: 0.3,
    group: ["generic", "petfoods", "dragonhelp"],
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
    name: "Bad Apple",
    key: "badApple",
    flavorText: "Definitely not touhou.",
    icon: "🍏",
    type: "anypet_food",
    saturation: -2000000,
    sellPrice: -100,
    cannotToss: true,
    cannotBox: true,
    cannotSend: true,
    prob: 0.2,
    group: ["generic", "petfoods", "unlucky", "bad", "curse"],
  },
  {
    name: "Good Apple",
    key: "goodApple",
    flavorText: "Reverses the debuff of Bad Apple",
    icon: "🍎",
    type: "anypet_food",
    saturation: 2000000,
    sellPrice: 300,
    prob: 0.2,
    group: ["generic", "petfoods", "counter"],
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
    name: "Assassin's Pick",
    key: "assassinPick",
    flavorText:
      "Best weapon in terms of damage, but this weapon hurts anyone who equip it, reducing the defense.",
    icon: "⛏️",
    type: "weapon",
    def: -20,
    atk: 49,
    magic: -400,
    sellPrice: 10000,
    cannotToss: false,
    prob: 0.1,
    group: ["generic", "armor"],
  },
  {
    name: "Phoenix Ember 𝔼𝕏 ✦",
    key: "phoenixEmberEX",
    flavorText:
      "A mystical ember known for its transformative properties. When consumed, it imbues the Phoenix with renewed vitality, enhancing its fiery aura and majestic presence.",
    icon: "🔥",
    type: "phoenix_food",
    saturation: 400 * 60 * 1000,
    sellPrice: 500,
    prob: 0.3,
    picky: true,
    group: ["generic", "petfoods", "phoenixhelp"],
  },
  {
    name: "Majestic Meals 𝔼𝕏 ✦",
    key: "majesticMealsEX",
    flavorText: "A medley of wild game for your tiger.",
    icon: "🦌",
    type: "tiger_food",
    sellPrice: 500,
    saturation: 120 * 60 * 1000,
    prob: 0.3,
    picky: true,
    group: ["generic", "petfoods", "tigerhelp"],
  },

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
  ...rarePets,
  generateChequeGift(1_000_000),
  generateChequeGift(10_000_000),
  generateChequeGift(100_000),
  generateChequeGift(50_000),
  generateChequeGift(69_000),
  // generateChequeGift(10_000),
  // generateChequeGift(10_000),
  // generateChequeGift(10_000),
  generateGift(),
  generateGift(),
  generateGift(),
  generateGift(),
];

const treasuresCopy = [...treasures];

/**
 * @param {CommandContext} obj
 */
export async function use(obj) {
  const commandLoots = Cassidy.multiCommands.values().reduce((arr, val) => {
    const { treasuresTable = [] } = val;
    if (Array.isArray(treasuresTable)) {
      arr.push(...treasuresTable);
    }
    return arr;
  }, []);
  const treasures = [
    ...treasuresCopy,
    generateTrashOld(),
    generateTrash(),
    generateTrash(),
    generateTrash(),
    generateTrash(),
    ...commandLoots,
  ];
  /**
   *
   * @param {Record<string, UserData>} usersData
   * @returns
   */
  obj.getInflationRate = async function (usersData) {
    if (global.Cassidy.config.disableInflation) {
      return 0;
    }
    usersData ??= await obj.money.getAll();
    let sum = Object.values(usersData)
      .filter((i) => !isNaN(i?.money))
      .reduce((acc, { money = 0 }) => acc + money, 0);
    const bankDatas = Object.values(usersData).filter(
      (i) =>
        typeof i?.bankData === "object" &&
        typeof i.bankData.bank === "number" &&
        !isNaN(i.bankData.bank)
    );
    const bankSum = bankDatas.reduce(
      (acc, { bankData }) => acc + bankData.bank,
      0
    );
    const lendUsers = Object.values(usersData).filter(
      (i) => typeof i?.lendAmount === "number" && !isNaN(i.lendAmount)
    );
    const lendAmounts = lendUsers.reduce(
      (acc, { lendAmount }) => acc + lendAmount,
      0
    );

    const bankMean = bankSum / bankDatas.length;
    let mean = sum / Object.keys(usersData).length;
    !isNaN(bankMean) ? (mean += bankMean) : null;
    const ll = lendAmounts / lendUsers.length;
    !isNaN(ll) ? (mean += ll) : null;

    const getChequeAmount = (
      /** @type {import("@cass-modules/cassidyUser").InventoryItem[]} */ items
    ) =>
      items.reduce(
        (acc, j) =>
          j.type === "cheque" &&
          typeof j.chequeAmount === "number" &&
          !isNaN(j.chequeAmount)
            ? j.chequeAmount + acc
            : acc,
        0
      );

    const invAmounts = Object.values(usersData).reduce((total, userData) => {
      let userTotal = 0;
      if (Array.isArray(userData.inventory)) {
        userTotal += getChequeAmount(userData.inventory);
      }
      if (Array.isArray(userData.boxItems)) {
        userTotal += getChequeAmount(userData.boxItems);
      }
      if (Array.isArray(userData.tradeVentory)) {
        userTotal += getChequeAmount(userData.tradeVentory);
      }
      return total + userTotal;
    }, 0);

    mean += invAmounts;

    if (isNaN(mean)) {
      return 0;
    }
    // return mean / 5000000000000;
    // return mean / 5_000_000_000_000;
    return mean / 1_000_000_000;
  };
  function randomWithProb(treasures) {
    // Step 1: Shuffle the treasures array to ensure random order for same probability items
    treasures = treasures.sort(() => Math.random() - 0.5);

    // Step 2: Calculate cumulative probabilities
    let cumulativeProbs = [];
    let cumulativeSum = 0;
    for (let i = 0; i < treasures.length; i++) {
      cumulativeSum += treasures[i].prob || 1; // Default probability to 1 if not provided
      cumulativeProbs.push(cumulativeSum);
    }

    // Step 3: Normalize cumulative probabilities to ensure they sum to 1
    let totalSum = cumulativeSum;
    cumulativeProbs = cumulativeProbs.map((prob) => prob / totalSum);

    // Step 4: Generate a random number between 0 and 1
    let random = Math.random();

    // Step 5: Find the corresponding treasure based on the random number
    for (let i = 0; i < cumulativeProbs.length; i++) {
      if (random < cumulativeProbs[i]) {
        const copy = JSON.parse(JSON.stringify(treasures[i]));
        return copy;
      }
    }
  }
  obj.randomWithProb = randomWithProb;
  obj.generateGift = generateGift;
  obj.generateTrash = generateTrash;
  const treasures2 = treasures;

  obj.generateTreasure = function (treasureKey) {
    let treasures = JSON.parse(JSON.stringify(treasures2)).map((i) => {
      i ??= {};
      i.name = `${i.name}`;
      i.isGift = true;
      i.group ??= [];
      i.prob ??= 1;
      return i;
    });

    treasureKey ??= "generic";
    let [type, ...args] = treasureKey.split("_");
    const excluded = [];
    for (const arg of args) {
      const [type, ...keys] = String(arg).split("=>");
      if (type === "exclude") {
        excluded.push(...keys);
      }
    }
    treasures = treasures.filter((i) => {
      i.group ??= [];
      return !i.group.some((g) => excluded.includes(g));
    });

    if (type === "randomInd") {
      return treasures[
        args.filter((key) => treasures.some((i) => i?.key === key))[
          Math.floor(Math.random() * args.length)
        ]
      ];
    }

    if (type === "specific") {
      return treasures.find((i) => i?.key === args[0]);
    }

    if (type === "fullRandom") {
      return randomWithProb(treasures);
    }

    if (type === "randomGrouped") {
      const items = treasures.filter((i) => i?.group?.includes(args[0]));
      return randomWithProb(items);
    }

    if (type === "rare") {
      const items = treasures.filter((i) => i?.rarity === "rare");
      return randomWithProb(items);
    }

    if (type === "legendary") {
      const items = treasures.filter((i) => i?.rarity === "legendary");
      return randomWithProb(items);
    }

    if (type === "customSearch") {
      const items = treasures.filter((i) => i[args[0]] === args[1]);
      return randomWithProb(items);
    }

    const items = treasures.filter((i) => i?.group?.includes("generic"));
    return randomWithProb(items);
  };
  class UTShop {
    constructor({
      itemData = [],
      sellTexts = [],
      talkTexts = [],
      buyTexts = [],
      welcomeTexts = [],
      goBackTexts = [],
      askTalkTexts = [],
      thankTexts = [],
      notScaredGeno,
      genoNote,
      allowSell = false,
      askSellTexts = [],
      sellDisallowed = [],
      onSell = async () => {},
      tradeRefuses = [],
      allowTrade = false,
      tradeData = [],
    }) {
      this.allowTrade = allowTrade;
      this.tradeData = tradeData;
      this.onSell = onSell;
      this.sellDisallowed = sellDisallowed;
      this.tradeRefuses = tradeRefuses;
      this.allowSell = !!allowSell;
      this.itemData = this.mapItemData(itemData);
      this.notScaredGeno = notScaredGeno;
      this.genoNote =
        genoNote ?? "Take whatever you want, but please don't hurt my family.";
      this.sellTexts = sellTexts || [
        "I would be in bankrupt if I started buying these",
        "Don't expect me to give you money.",
        "I'm not a bank, I'm a shop!",
        "Go find other shopkeeper that will buy your stuff.",
      ];
      this.askSellTexts = askSellTexts;
      this.talkTexts = this.mapTalkTexts(talkTexts);
      this.buyTexts = buyTexts || ["Which do you want?"];
      this.welcomeTexts = welcomeTexts || ["Welcome to the shop!"];
      this.goBackTexts = goBackTexts || ["Oh it's okay, what do you want?"];
      this.askTalkTexts = askTalkTexts || ["What do you want to talk about?"];
      this.thankTexts = thankTexts || ["Thanks for buying!"];
      this.playerRoute = "Neutral";
    }
    mapItemData(itemData) {
      const result = itemData.map((item, index) => {
        const {
          price = 0,
          flavorText = "What does this do?",
          name = "Unknown Item",
          icon = "❓",
          onPurchase = () => {},
          atk = null,
          def = null,
          heal = null,
          key,
        } = item;
        return {
          ...item,
          price,
          flavorText,
          name,
          icon,
          atk,
          def,
          heal,
          onPurchase,
          num: index + 1,
          key,
        };
      });
      return result;
    }
    mapTalkTexts(talkTexts) {
      const result = talkTexts.map((text, index) => {
        const { name = "Unknown Topic", responses = [], icon = "🤍" } = text;
        return {
          name,
          icon,
          responses,
          num: index + 1,
        };
      });
      return result;
    }
    stringTalkTexts() {
      const result = this.talkTexts
        .map((text) => {
          return `${text.num} ${text.icon} **${text.name}**`;
        })
        .join("\n");
      return result;
    }
    stringSellData(inventory) {
      const result = inventory
        .map(
          (item) =>
            `${item.index + 1}. **${item.icon} ${item.name}** - **${
              item.shopDisallowed ? `🚫` : `${pCy(item.sellPrice || 0)}$`
            }**\n✦ ${item.flavorText}`
        )
        .join("\n\n");
      return result;
    }
    stringItemData(
      { inventory, boxInventory, userMoney = 0, playersMap } = {
        inventory: undefined,
        boxInventory: undefined,
        playersMap: undefined,
      }
    ) {
      let isLegacy = true;
      if (inventory instanceof Inventory && boxInventory instanceof Inventory) {
        isLegacy = false;
      }
      const data = this.itemData;
      let result;
      if (!isLegacy) {
        result = data
          .map((item) => {
            const invAmount = inventory.getAmount(item.key);
            const boxAmount = boxInventory.getAmount(item.key);
            let isAffordable = userMoney >= (item.price ?? 0);
            let isSellable = true;
            if (item.cannotBuy === true) {
              isSellable = false;
            }
            let hasInv = invAmount && boxAmount;
            let result = ``;
            result += `${item.num}. **${item.icon} ${item.name}**\n`;
            result += `- **${pCy(this.isGenoR() ? 0 : item.price ?? 0)}$** ${
              isSellable ? (isAffordable ? (hasInv ? "✅" : "💰") : "❌") : "🚫"
            } ${invAmount ? `🎒 **x${invAmount}**` : ""} ${
              boxAmount ? `📦 **x${boxAmount}**` : ""
            } ${item.inflation ? `[ 📈 **+${item.inflation ?? 0}$** ]` : ""}\n`;
            if (!(playersMap instanceof Map)) {
              throw new Error(
                `playersMap must be a Map, received ${
                  typeof playersMap === "object"
                    ? playersMap.constructor.name
                    : typeof playersMap
                }`
              );
            }
            if (
              playersMap &&
              playersMap instanceof Map &&
              (item.type === "weapon" || item.type === "armor")
            ) {
              let hasLine = false;
              for (const [, petPlayer] of playersMap) {
                const clone = petPlayer.clone();
                let isHead = false;
                const applyHead = () => {
                  if (!isHead) {
                    result += `☆ ${petPlayer.petIcon} `;
                    isHead = true;
                    hasLine = true;
                  }
                };
                if (item.type === "weapon") {
                  clone.weapon[0] = JSON.parse(JSON.stringify(item));
                  const diff = clone.ATK - petPlayer.ATK;
                  const defDiff = clone.DF - petPlayer.DF;
                  if (diff !== 0) {
                    let i = diff > 0;
                    let b = i ? "**" : "";
                    applyHead();
                    result += `**${diff > 0 ? "+" : ""}${diff}** ${b}ATK${b}, `;
                  }
                  if (defDiff !== 0) {
                    let i = defDiff > 0;
                    let b = i ? "**" : "";
                    applyHead();
                    result += `**${
                      defDiff > 0 ? "+" : ""
                    }${defDiff}** ${b}DEF${b}, `;
                  }
                } else if (item.type === "armor") {
                  if (clone.armors[0] && clone.armors[0].def > item.def) {
                    clone.armors[1] = JSON.parse(JSON.stringify(item));
                  } else {
                    clone.armors[0] = JSON.parse(JSON.stringify(item));
                  }

                  const diff = clone.DF - petPlayer.DF;
                  const atkDiff = clone.ATK - petPlayer.ATK;
                  if (diff !== 0) {
                    applyHead();
                    let i = diff > 0;
                    let b = i ? "**" : "";
                    result += `**${diff > 0 ? "+" : ""}${diff}** ${b}DEF${b}, `;
                  }
                  if (atkDiff !== 0) {
                    let i = atkDiff > 0;
                    let b = i ? "**" : "";
                    applyHead();
                    result += `**${
                      atkDiff > 0 ? "+" : ""
                    }${atkDiff}** ${b}ATK${b}, `;
                  }
                }
                if (isHead) {
                  result += `\n`;
                }
              }
              if (hasLine) {
                result += `\n`;
              }
            }

            result += `✦ ${
              isSellable
                ? item.flavorText
                : item.cannotBuyFlavor ?? item.flavorText
            }`;
            return result;
          })
          .join("\n\n");
      } else {
        result = data
          .map(
            (item) =>
              `${item.num}. **${item.icon} ${item.name}** - **${
                this.isGenoR() ? 0 : item.price
              }$**\n✦ ${item.flavorText}`
          )
          .join("\n\n");
      }
      return result;
    }
    rand(arr) {
      if (arr.length === 1) {
        return arr[0];
      }
      if (arr.length === 2) {
        return Math.random() < 0.5 ? arr[0] : arr[1];
      }
      return arr[Math.floor(Math.random() * arr.length)];
    }
    isGenoR() {
      return false;
      return (
        this.playerRoute.toLowerCase() === "genocide" && !this.notScaredGeno
      );
    }
    optionText() {
      if (this.isGenoR()) {
        return `🗃️ **Steal**\n💰 **Take**\n📄 **Read**\n🏠 **Leave**`;
      }
      //return `💵 **Buy**\n💰 **Sell**\n⚒️ **Trade**\n💬 **Talk**\n🏠 **Leave**`;
      return `      💵        💰         ⚒ 
     **Buy**     **Sell**     **Trade**

            💬         🏠 
          **Talk**     **Leave**`;
    }
    async onPlay(context = obj) {
      try {
        const { invLimit } = global.Cassidy;

        const { UTYPlayer } = global.utils;
        const inventoryLimit = invLimit;
        const { input, output, money, args, Inventory, getInflationRate } =
          context;
        if (args[0]) {
          return output.reply(`(You can reply to the shop texts instead)`);
        }
        const inflationRate = await getInflationRate();
        this.itemData = this.itemData.map((item) => {
          const originalPrice = item.price ?? 0;
          const inflation = Math.round(inflationRate * originalPrice);
          const newPrice = originalPrice + inflation;
          return {
            ...item,
            price: newPrice,
            originalPrice,
            inflation,
          };
        });

        const {
          money: cash,
          money: gold,
          kills = 0,
          spares = 0,
          progress = {},
          name = "Chara",
          exp = 0,
          inventory = [],
        } = await money.get(input.senderID);
        // @ts-ignore
        const player = new UTYPlayer({
          gold,
          kills,
          spares,
          progress,
          name,
          exp,
          inv: new Inventory(inventory),
        });
        this.playerRoute = player.getRoute();
        const i = await output.reply(`✦ ${
          this.isGenoR() ? `But nobody came.` : this.rand(this.welcomeTexts)
        }

${this.optionText()}

**${cash}**$ **${inventory.length}/${inventoryLimit}**`);
        const self = this;
        input.setReply(i.messageID, {
          key: obj.commandName,
          author: input.senderID,
          callback: self.onReply.bind(self),
          detectID: i.messageID,
          player,
        });
      } catch (error) {
        console.error(error);
        obj.output?.error?.(error);
      }
    }
    /**
     * @param {CommandContext & { repObj?: Record<string, any> }} context
     */
    async onReply(context = obj) {
      try {
        const { invLimit } = global.Cassidy;

        const { input, output, money, repObj } = context;
        const { author, player } = repObj;
        const inventoryLimit = invLimit;
        const self = this;
        if (input.senderID !== author) {
          return;
        }
        let [option] = input.splitBody(" ");
        option = option.toLowerCase();
        if (self.isGenoR()) {
          if (repObj.isItemChoose) {
            return handleStealItem();
          }
          switch (option) {
            case "steal":
              return handleSteal();
            case "take":
              return handleTake();
            case "read":
              return handleNote();
            case "leave":
              return handleLeave();
            case "back":
              return handleGoBack();
            default:
              break;
          }
        } else {
          if (repObj.isItemChoose) {
            return handleBuyItem();
          }
          if (repObj.isTalkChoose) {
            return handleTalkChoices();
          }
          if (repObj.isSellNext && option === "next") {
            return handleSell(repObj.isBox);
          }
          if (repObj.isTalkNext && (option === "next" || option === "back")) {
            return handleTalkChoices();
          }
          if (repObj.isTrueSell) {
            return handleSellItem(repObj.isBox);
          }
          if (repObj.sellChoose && option !== "back") {
            return handleSell(option.startsWith("b") ? true : false);
          }
          switch (option) {
            case "buy":
              return handleBuy();
            case "sell":
              return sellChooser();
            case "trade":
              return handleTrade();
            case "talk":
              return handleTalk();
            case "leave":
              return handleLeave();
            case "back":
              return handleGoBack();
            default:
              break;
          }
        }
        async function handleEnd(id, { ...additional } = {}) {
          input.delReply(repObj.detectID);
          input.setReply(id, {
            key: obj.commandName,
            author,
            callback: self.onReply.bind(self),
            detectID: id,
            player,
            ...additional,
          });
        }
        async function handleSteal() {
          const { money: cash, inventory = [] } = await money.get(
            input.senderID
          );
          const items = self.stringItemData();
          const dialogue = `You can take whatever you want. (you cannot take multiple.)`;
          const i = await output.reply(
            `✦ ${dialogue}\n\n${items}\n\n\n**Back**\n**${cash}**$ **${inventory.length}/${inventoryLimit}**`
          );
          handleEnd(i.messageID, {
            isItemChoose: true,
          });
        }
        async function handleBuy() {
          const userInfo = await money.get(input.senderID);
          const { money: cash, inventory = [], boxItems = [] } = userInfo;
          const { playersMap } = context.petPlayerMaps(userInfo);
          const items = self.stringItemData({
            userMoney: cash,
            inventory: new Inventory(inventory),
            boxInventory: new Inventory(boxItems, 100),
            playersMap,
          });
          const dialogue = self.rand(self.buyTexts);
          const i = await output.reply(
            `✦ ${dialogue}\n\n${items}\n\n\n(Reply with <num> <amount>)\n**Back**\n**${cash}**$ **${inventory.length}/${inventoryLimit}**`
          );
          handleEnd(i.messageID, {
            isItemChoose: true,
          });
        }
        function sanitizeSellInv(inventory) {
          return inventory.map((i) => {
            if (self.sellDisallowed.includes(i.key)) {
              i.shopDisallowed = true;
            }
            if (i.sellPrice < 1 || !i.sellPrice) {
              i.shopDisallowed = true;
            }
            return i;
          });
        }
        async function sellChooser() {
          if (!self.allowSell) {
            return handleSell();
          }
          let {
            money: cash,
            inventory: rI = [],
            boxItems: rB = [],
          } = await money.get(input.senderID);
          const inventory = new Inventory(rI);
          const boxItems = new Inventory(rB, 100);
          const dialogue = self.rand(self.askSellTexts);
          const i = await output.reply(
            `✦ ${dialogue}\n\n**A.** Sell **Items** **(${inventory.size()}/${invLimit})**\n**B**. Sell **Box** Items **(${boxItems.size()}/100)**\n\n**Back**\n**${cash}**$`
          );
          handleEnd(i.messageID, {
            sellChoose: true,
          });
        }
        async function handleRealSell(isBox) {
          const magicKey = isBox ? "boxItems" : "inventory";
          const magicSize = isBox ? 100 : global.Cassidy.invLimit;

          try {
            let { [magicKey]: inI = [], money: cash = 0 } = await money.get(
              input.senderID
            );
            const inventory = new Inventory(sanitizeSellInv(inI), magicSize);
            let items = self.stringSellData([...inventory]);
            const dialogue = self.rand(self.askSellTexts);
            const i = await output.reply(
              `✦ ${dialogue}\n\n${items}\n\n\n(Reply with <num> <amount>)\n**Back**\n**${cash}**$ **${
                inventory.getAll().length
              }/${isBox ? 100 : inventoryLimit}**`
            );
            handleEnd(i.messageID, {
              isTrueSell: true,
              sellChoose: false,
              isBox,
            });
          } catch (error) {
            return output.error(error);
          }
        }
        async function handleTrade() {
          if (self.allowTrade) {
            // return handleRealTrade();
          }
          const dialogue = self.rand(self.tradeRefuses) ?? "...";
          const i = await output.reply(`✦ ${dialogue}\n\n**Back**`);
          handleEnd(i.messageID);
        }
        async function handleSell(isBox) {
          if (self.allowSell) {
            return handleRealSell(isBox);
          }
          const index = repObj.sellIndex ?? 0;
          const text = self.sellTexts[index];
          if (text) {
            const i = await output.reply(`✦ ${text}\n\n**Next**\n**Back**`);
            handleEnd(i.messageID, {
              isSellNext: true,
              sellIndex: index + 1,
            });
          } else {
            repObj.isSellNext = false;
            repObj.sellIndex = 0;
            return handleBack();
          }
        }
        async function handleTake() {
          const cash = 20;
          const { money: playerMoney } = await money.get(input.senderID);
          await money.set(input.senderID, {
            money: playerMoney + cash,
          });
          const i = await output.reply(
            `✦ You took ${cash}$ from the cash registry.\n\n**Back**`
          );
          handleEnd(i.messageID);
        }
        async function handleNote() {
          const i = await output.reply(
            `✦ The note says "${self.genoNote}"\n\n**Back**`
          );
          handleEnd(i.messageID);
        }
        async function handleTalk() {
          repObj.isTalkNext = false;
          repObj.talkIndex = 0;

          const talks = self.stringTalkTexts();
          const i = await output.reply(
            `✦ ${self.rand(self.askTalkTexts)}\n\n${talks}\n**Back**`
          );
          handleEnd(i.messageID, {
            isTalkChoose: true,
          });
        }
        async function handleLeave() {
          return output.reply(`(This option does nothing.)`);
        }
        async function handleStealItem() {
          const items = self.stringItemData();
          const num = parseInt(input.words[0]);
          if (String(input.words[0]).toLowerCase() === "back") {
            return handleGoBack();
          }

          const targetItem = self.itemData.find(
            (item) => String(item.num) === String(num)
          );
          if (isNaN(num) || !targetItem) {
            return output.reply(
              `(Go back and reply with a valid number that you can see at the left side of the item name.)`
            );
          }
          const { onPurchase } = targetItem;
          const price = 0;
          const { money: cash, inventory = [] } = await money.get(
            input.senderID
          );
          if (inventory.length >= inventoryLimit) {
            return output.reply(
              `(You cannot steal anything right now.. Your inventory is full (${inventory.length}/${inventoryLimit})`
            );
          }
          try {
            const argu = {
              money: cash - price,
              inventory,
            };
            context.moneySet = argu;
            await onPurchase(context);
            await money.set(input.senderID, argu);
          } catch (error) {
            console.error(error);
            output.error(error);
          }
          const dialogue = `Done, just take more, nobody stops you.`;
          const i = await output.reply(
            `✦ ${dialogue}\n\n${items}\n\n\n**Back**\n**${
              cash - price
            } (-${price})**$ **${inventory.length}/${inventoryLimit}**`
          );
          handleEnd(i.messageID, {
            isItemChoose: true,
          });
        }

        async function handleBuyItem() {
          const { petPlayerMaps } = context;
          const userInfo = await money.get(input.senderID);
          const {
            money: cash = 0,
            inventory = [],
            boxItems: boxInventory = [],

            cassEXP: cxp,
          } = userInfo;

          const cassEXP = new CassEXP(cxp);

          let { playersMap } = petPlayerMaps(userInfo);

          let items = self.stringItemData({
            userMoney: cash,
            inventory: new Inventory(inventory),
            boxInventory: new Inventory(boxInventory, 100),
            playersMap,
          });
          const num = parseInt(input.words[0]);
          let amount = parseInt(String(input.words[1] || 1));
          if (isNaN(amount) || amount <= 0) {
            amount = 1;
          }
          if (String(input.words[0]).toLowerCase() === "back") {
            return handleGoBack();
          }

          const targetItem = self.itemData.find(
            (item) => String(item.num) === String(num)
          );
          if (isNaN(num) || !targetItem) {
            return output.reply(
              `(Go back and reply with a valid number that you can see at the left side of the item name.)`
            );
          }
          let { price = 0, onPurchase } = targetItem;
          if (amount > inventoryLimit - inventory.length) {
            amount = inventoryLimit - inventory.length;
          }

          price = amount * price;
          if (cash < price) {
            return output.reply(
              `(You don't have enough money to buy this item (${cash}$ < ${price}$), please go back and choose a valid option, or just choose "back")`
            );
          }
          if (targetItem.cannotBuy) {
            return output.reply(
              `(No matter what you do, you won't be able to buy this item.)`
            );
          }
          if (inventory.length >= inventoryLimit) {
            return output.reply(
              `(You cannot buy anything right now.. Your inventory is full (${inventory.length}/${inventoryLimit})`
            );
          }
          cassEXP.expControls.raise(
            targetItem.expReward ??
              clamp(0, targetItem.price / 500000, 10) * amount
          );
          const argu = {
            money: cash - price,
            inventory,
            cassEXP: cassEXP.raw(),
            boxInventory,
          };
          context.moneySet = argu;
          for (let i = 0; i < amount; i++) {
            try {
              await onPurchase(context);
            } catch (error) {
              console.error(error);
              output.error(error);
            }
          }
          await money.set(input.senderID, argu);
          items = self.stringItemData({
            userMoney: cash - price,
            inventory: new Inventory(inventory),
            boxInventory: new Inventory(boxInventory, 100),
            playersMap,
          });

          const dialogue = self.rand(self.thankTexts);
          const i = await output.reply(
            `✦ ${dialogue}\n\n${items}\n\n\n**Back**\n**${
              cash - price
            } (-${price})**$ **${
              inventory.length
            }/${inventoryLimit}** (+${amount} item(s))`
          );
          handleEnd(i.messageID, {
            isItemChoose: true,
          });
        }
        async function handleSellItem(isBox) {
          const magicKey = isBox ? "boxItems" : "inventory";
          const magicSize = isBox ? 100 : global.Cassidy.invLimit;
          let { money: cash, [magicKey]: iI = [] } = await money.get(
            input.senderID
          );
          const inventory = new Inventory(sanitizeSellInv(iI), magicSize);

          const num = parseInt(input.words[0]);
          let amount = parseInt(String(input.words[1] || 1));
          if (isNaN(amount) || amount <= 0) {
            amount = 1;
          }
          if (String(input.words[0]).toLowerCase() === "back") {
            return handleGoBack();
          }
          const targetKey = inventory.findKey(
            (i) => String(i.index + 1) === String(num)
          );
          if (!targetKey) {
            return output.reply(
              `(Go back and reply with a valid number of item that exists.`
            );
          }
          const targetItems = inventory
            .getAll()
            .filter((item) => item.key === targetKey);
          let disallowed = [];
          if (amount > inventory.getAmount(targetKey)) {
            amount = inventory.getAmount(targetKey);
          }

          let price = 0;
          for (let i = 0; i < amount; i++) {
            const targetItem = targetItems[i];
            let { sellPrice: indivPrice = 0, shopDisallowed = false } =
              targetItem ?? {
                shopDisallowed: false,
              };
            if (shopDisallowed) {
              disallowed.push(targetItem);
              continue;
            }
            price += indivPrice;
            if (typeof self.onSell === "function") {
              try {
                // @ts-ignore
                await self.onSell({ ...context, targetItem });
              } catch (error) {
                console.error(error);
              }
            }
            inventory.deleteRef(targetItem);
          }
          if (disallowed.length === targetItems.length) {
            return output.reply(
              `(Go back and reply with a valid number that you can see at the left side of the item name.)`
            );
          }

          const argu = {
            money: cash + price,
            [magicKey]: Array.from(inventory),
          };
          await money.set(input.senderID, argu);

          const dialogue = self.rand(self.askSellTexts);
          const items = self.stringSellData([
            ...new Inventory(inventory.raw(), magicSize).getAll(),
          ]);

          const i = await output.reply(
            `✦ ${dialogue}\n\n${items}\n\n\n**Back**\n**${
              cash + price
            } (+${price})**$ **${inventory.getAll().length}/${
              isBox ? 100 : inventoryLimit
            }** (-${amount} item(s))`
          );
          handleEnd(i.messageID, {
            isTrueSell: true,
          });
        }

        async function handleTalkChoices() {
          if (input.words[0] === "back") {
            if (!repObj.isTalkNext) {
              return handleBack();
            }
            return handleTalk();
          }
          const num = parseInt(input.words[0]);
          const targetTalk =
            repObj.targetTalk ??
            self.talkTexts.find((talk) => String(talk.num) === String(num));
          if ((!repObj.isTalkNext && isNaN(num)) || !targetTalk) {
            return output.reply(
              `(Go back and reply with a valid number that you can see at the left side of the choice name.)`
            );
          }
          const { responses } = targetTalk;
          const index = repObj.talkIndex ?? 0;
          const text = responses[index];
          repObj.isTalkChoose = false;
          if (text) {
            const i = await output.reply(`✦ ${text}\n\n**Next**\n**Back**`);
            handleEnd(i.messageID, {
              isTalkNext: true,
              talkIndex: index + 1,
              targetTalk,
              isBox: repObj.isBox,
            });
          } else {
            repObj.isTalkNext = false;
            repObj.talkIndex = 0;
            repObj.targetTalk = null;
            return handleTalk();
          }
        }
        async function handleBack() {
          return handleGoBack();
        }
        async function handleGoBack() {
          const { money: cash, inventory = [] } = await money.get(
            input.senderID
          );

          const i = await output.reply(`✦ ${
            self.isGenoR() ? `Nobody is here.` : self.rand(self.goBackTexts)
          }

${self.optionText()}

**${cash}**$ **${inventory.length}/${inventoryLimit}**`);
          handleEnd(i.messageID);
        }
      } catch (error) {
        console.error(error);
        obj.output?.error?.(error);
      }
    }
  }
  function petPlayerMaps(data) {
    const { GearsManage, Inventory, PetPlayer } = obj;
    const gearsManage = new GearsManage(data.gearsData);
    const petsData = new Inventory(data.petsData);
    const playersMap = new Map();
    for (const pet of petsData) {
      const gear = gearsManage.getGearData(pet.key);
      const player = new PetPlayer(pet, gear);
      playersMap.set(pet.key, player);
    }
    return {
      gearsManage,
      petsData,
      playersMap,
    };
  }
  obj.Collectibles = Collectibles;
  obj.treasures = new Inventory(treasures, 10000000);

  obj.petPlayerMaps = petPlayerMaps;

  obj.UTShop = UTShop;
  obj.Inventory = Inventory;
  obj.CassEXP = CassEXP;
  obj.generateChequeGift = generateChequeGift;
  obj.generateTrashOld = generateTrashOld;
  obj.next();
}

export const treasureInv = new Inventory(treasures, Infinity);
