import { formatCash, parseBet } from "@cass-modules/ArielUtils";
import { InventoryItem } from "@cass-modules/cassidyUser";
import { defineEntry } from "@cass/define";
import { UNIRedux } from "@cassidy/unispectra";

export const meta: CommandMeta = {
  name: "trade",
  description: "Manage your trading hall.",
  author: "Liane Cagara",
  version: "2.0.1",
  usage: "{prefix}tradinghall",
  category: "Inventory",
  permissions: [0],
  noPrefix: false,
  waitingTime: 1,
  otherNames: ["tradehall", "tradinghall"],
  requirement: "3.0.0",
  icon: "🛒",
  cmdType: "cplx_g",
};
const pCy = formatCash;
const { invLimit } = global.Cassidy;

type TradeVentory = (InventoryItem & { price: number })[] & {
  userID: string;
};

export const style: CommandStyle = {
  title: "Trading Hall 🛒",
  titleFont: "bold",
  contentFont: "fancy",
};

export const entry = defineEntry({
  async sell({ input, output, money, Inventory, args }) {
    const userData = await money.getItem(input.senderID);
    const guide = `**Guide**: ${input.words[0]} <item key> <price> <amount>`;
    const tradeVentory = new Inventory<TradeVentory[number]>(
      userData.tradeVentory ?? []
    );
    const inventory = new Inventory(userData.inventory ?? []);
    const key = args[0];
    const price = parseBet(args[1], Infinity) || 0;
    const amount = parseBet(args[2] ?? "1", inventory.getAmount(key)) || 1;
    if (!key || !price || !amount) {
      return output.reply(guide);
    }

    if (!inventory.has(key)) {
      return output.reply(
        `❌ | You don't have "${key}" in your inventory!\n\n${guide}`
      );
    }
    if (isNaN(amount) || amount <= 0 || inventory.getAmount(key) < amount) {
      return output.reply(
        `❌ | The amount you entered is invalid.\n\n${guide}`
      );
    }
    if (isNaN(price) || price <= 0) {
      return output.reply(`❌ | The price you entered is invalid.\n\n${guide}`);
    }
    const existing = tradeVentory.getOne(key);
    if (existing && existing.price && existing.price !== price) {
      return output.reply(
        `❌ | The price of existing "${key}" was ${pCy(
          existing.price
        )}, your prices must be consistent!`
      );
    }
    if (amount + tradeVentory.getAll().length > invLimit) {
      return output.reply(
        `❌ | You can only **hold** up to ${invLimit} **items** in your trading hall, you currently have ${
          tradeVentory.getAll().length
        } items in the **hall**.`
      );
    }

    const items = inventory
      .get(key)
      .slice(0, amount)
      .map((item) => {
        item.price = price;
        return item;
      }) as TradeVentory;
    tradeVentory.add(items);
    inventory.toss(key, amount);
    await money.setItem(input.senderID, {
      tradeVentory: Array.from(tradeVentory),
      inventory: Array.from(inventory),
    });
    return output.reply(
      `✅ | Added ${amount} item(s) for **${pCy(
        price
      )}** each to the trading hall!\n\n${items
        .map((item) => `${item.icon} **${item.name}**`)
        .join("\n")}`
    );
  },
  async buy({
    input,
    output,
    money,
    Inventory,
    args,
    Slicer,
    TagParser,
    CassExpress,
  }) {
    const allUsers = await money.getAllCache();
    let mappedTrades = Object.entries(allUsers)
      .filter(([, u]) => u?.tradeVentory)

      .filter(([, u]) => u.tradeVentory?.length > 0)
      .sort(([, a], [, b]) => b.tradeVentory.length - a.tradeVentory.length)
      .map(([id, data]) => {
        const copy: TradeVentory = data.tradeVentory ?? [];
        copy.userID = id;
        return copy;
      });
    if (args[0]) {
      const data = TagParser.mainParser(args.join(" "));
      if (data) {
        for (const { tag, value } of data) {
          if (typeof value !== "string") {
            continue;
          }
          mappedTrades = mappedTrades.filter((trades) => {
            return trades.some((item) =>
              String(item[tag]).toLowerCase().includes(value.toLowerCase())
            );
          });
        }
      }
    }
    args[0] = args[0]?.split("[")[0];

    const slicer = new Slicer(mappedTrades, 3);
    let result = "";
    let i = (parseInt(String(args[0] || 1)) - 1) * 5;
    const preservedIndex = {};
    const userData = allUsers[input.senderID];
    const inventory = new Inventory(userData.inventory ?? []);
    const boxInventory = new Inventory(userData.boxItems ?? [], 100);
    const userMoney = userData.money ?? 0;
    for (let j = 0; j < mappedTrades.length; j++) {
      const trade = mappedTrades[j];
      preservedIndex[j + 1] = trade.userID;
    }

    for (const trade of slicer.getPage(args[0])) {
      i++;
      const num = Object.keys(preservedIndex).find(
        (key) => preservedIndex[key] === trade.userID
      );
      const { name = "Unregistered" } = allUsers[trade.userID];
      result += `${num}. ***${name}***\n\n`;
      const tradeX = new Inventory(trade);
      let existedKeys = [];
      for (const item of Array.from(trade).reverse()) {
        if (existedKeys.includes(item.key)) {
          continue;
        }
        const invAmount = inventory.getAmount(item.key);
        const boxAmount = boxInventory.getAmount(item.key);
        const emoji1 =
          userMoney >= item.price
            ? invAmount || boxAmount
              ? "✅"
              : "💰"
            : "❌";
        result += `${item.icon} **x${tradeX.getAmount(item.key)}** **${
          item.name
        }** (${item.key}) ${emoji1}\n- **${pCy(item.price)} each**${
          invAmount ? ` 🎒 **x${invAmount}**` : ""
        }${boxAmount ? ` 📦 **x${boxAmount}**` : ""}\n✦ ${item.flavorText}\n\n`;
        existedKeys.push(item.key);
      }
      result += `${UNIRedux.standardLine}\n`;
    }
    result += `\nType **${input.words[0]}** <page number> to view more trades.
You can also use **tags** like:
${input.words[0]} 1[key=gift, icon=🎁]

Reply with <index> <key> <amount> to **purchase**.

**${pCy(userMoney)}** **${inventory.getAll().length}/${invLimit}**`;
    const inf = await output.reply(result);
    input.setReply(inf.messageID, {
      author: input.senderID,
      key: "tradinghall",
      preservedIndex,

      // @ts-ignore
      callback: handleBuy,
    });

    async function handleBuy(
      r: CommandContext & { repObj: any; detectID: string }
    ) {
      if (r.repObj.author !== r.input.senderID) {
        return;
      }
      const allUsers = await r.money.getAll();
      const userData = allUsers[r.input.senderID];
      let userMoney = userData.money ?? 0;
      const userCass = new CassExpress(userData.cassExpress ?? {});
      const { input, output, Inventory, money } = r;
      const inventory = new Inventory(userData.inventory ?? []);

      let [index, key, amount = "1"]: (string | number)[] = input.words;
      index = parseInt(index);

      const userID = preservedIndex[index];
      if (!userID) {
        return output.reply(`❌ | Please go back and reply a valid **index**.`);
      }
      if (userID === input.senderID) {
        return output.reply(
          `❌ | You can't buy your own items! Consider **cancelling** instead.`
        );
      }
      const trades: TradeVentory = allUsers[userID].tradeVentory ?? [];
      const { name: trader } = allUsers[userID];
      const traderCass = new CassExpress(allUsers[userID].cassExpress ?? {});
      const tradeVentory = new Inventory(trades);
      let traderMoney = allUsers[userID].money ?? 0;
      amount = parseBet(amount, tradeVentory.getAmount(key));
      if (!key) {
        return output.reply(
          `❌ | Please enter a **key** to buy, haven't you read the guide?`
        );
      }

      if (!tradeVentory.has(key)) {
        return output.reply(
          `❌ | **${trader}** doesn't have "${key}" in their trading hall!`
        );
      }
      if (isNaN(amount) || amount <= 0) {
        amount = 1;
      }
      if (amount > tradeVentory.getAmount(key)) {
        amount = tradeVentory.getAmount(key);
      }
      let bought = [] as TradeVentory;

      let total = 0;
      for (let i = 0; i < amount; i++) {
        const item = tradeVentory.getOne(key);
        if (!item) {
          continue;
        }

        if (inventory.getAll().length >= invLimit) {
          bought.push({
            ...item,
            error: "Inventory full.",
          });
          continue;
        }
        if (userMoney < Number(item.price)) {
          bought.push({
            ...item,
            error: "Not enough balance.",
          });
          continue;
        }
        userMoney -= Number(item.price ?? 0);
        total += Number(item.price ?? 0);
        traderMoney += Number(item.price ?? 0);
        inventory.addOne(item);
        tradeVentory.deleteOne(key);
        bought.push(item);
      }
      if (total > 0) {
        const success = bought.filter((i) => !i.error);
        const firstItem = success[0];
        traderCass.createMail({
          title: `${firstItem.icon} Purchased for $${pCy(total)}💵`,
          author: input.senderID,
          timeStamp: Date.now(),
          body: `**${userData.name ?? "Unregistered"}** has purchased **${
            success.length
          }** of your trading hall item(s) for a total of $${pCy(
            total
          )}💵\n\n${success
            .map((i) => `${i.icon} **${i.name}** $${pCy(Number(i.price))}💵`)
            .join("\n")}\n\nIf you need more info, here is the UID: ${
            input.senderID
          }`,
        });
        userCass.createMail({
          title: `You purchased ${firstItem.icon}`,
          author: input.senderID,
          timeStamp: Date.now(),
          body: `Thank you **${
            userData.name ?? "Unregistered"
          }** for purchasing **${
            success.length
          }** item(s) from **${trader}**!\n\n${success
            .map((i) => `${i.icon} **${i.name}** $${pCy(Number(i.price))}💵`)
            .join(
              "\n"
            )}\n\nIf you need more info, here is the UID of trader: ${userID}`,
        });
      }
      await money.setItem(input.senderID, {
        inventory: Array.from(inventory),
        money: userMoney,
        cassExpress: userCass.raw(),
      });
      await money.setItem(userID, {
        tradeVentory: Array.from(tradeVentory),
        money: traderMoney,
        cassExpress: traderCass.raw(),
      });
      return output.reply(
        `✅ You bought ${
          bought.filter((i) => !i.error).length
        } items from **${trader}**!\n\n${bought
          .map(
            (i) =>
              `${i.icon} **${i.name}** - **${pCy(i.price)}** ${
                i.error ? `\n❌ ${i.error}\n` : ""
              }`
          )
          .join("\n")}\n**Total Spent**: **${pCy(total)}**`
      );
    }
  },
  async list({ input, output, args, money, Inventory }) {
    const userData = await money.getItem(args[0] || input.senderID);
    const tradeVentory = new Inventory(userData.tradeVentory ?? []);
    const { name = "Unregistered" } = userData;
    let result = `**${name}'s** Trading Hall\n\n`;
    for (const item of tradeVentory.toUnique()) {
      result += `${item.icon} **x${tradeVentory.getAmount(item.key)}** **${
        item.name
      }** (${item.key}) - **${item.price}**\n✦ ${item.flavorText}\n\n`;
    }
    return output.reply(result);
  },
  async cancel({ input, output, args, money, Inventory }) {
    const userData = await money.getItem(input.senderID);
    const tradeVentory = new Inventory(userData.tradeVentory ?? []);
    const inventory = new Inventory(userData.inventory ?? []);
    const key = args[0];
    const amount = parseBet(args[1] ?? "1", tradeVentory.getAmount(key)) || 0;
    if (!key || !amount) {
      return output.reply(`❌ | Please enter a **key** and **amount**.`);
    }
    if (!tradeVentory.hasAmount(key, amount)) {
      return output.reply(
        `❌ | The amount of "${key}" you want to cancel is **invalid**, you currently have ${tradeVentory.getAmount(
          key
        )} of it.`
      );
    }
    if (inventory.getAll().length + amount > invLimit) {
      return output.reply(
        `❌ | You can only **hold** up to ${invLimit} **items** in your inventory, you currently have ${
          inventory.getAll().length
        }/${invLimit} items.`
      );
    }
    const items = tradeVentory
      .get(key)
      .slice(0, amount)
      .map((item) => {
        delete item.price;
        return item;
      });
    tradeVentory.toss(key, amount);
    inventory.add(items);
    await money.setItem(input.senderID, {
      tradeVentory: Array.from(tradeVentory),
      inventory: Array.from(inventory),
    });
    return output.reply(
      `✅ | You canceled ${amount} items!\n\n${items
        .map((item) => `${item.icon} **${item.name}**`)
        .join("\n")}`
    );
  },
});
