import { Casa2d, Casaieah } from "@cass-modules/CasaieahUtils";
import { defineHome } from "@cass/define";
import { Config, SpectralCMDHome } from "@cassidy/spectral-home";

export const meta: Cassieah.Meta = {
  name: "casaieah",
  otherNames: ["casa", "house", "build"],
  icon: "🔨",
  category: "Idle Image-Powered Sim",
  version: "1.0.0",
  description: "Build, Invest, and Earn! Straight from YOUR HOUSE!",
  author: "@lianecagara",
  requirement: "4.0.0",
  role: 0,
  waitingTime: 0,
};

export const style: Cassieah.Style = {
  title: "🔨 Casa-Ieah",
  contentFont: "fancy",
  titleFont: "bold",
  lineDeco: "none",
};

const config: Config[] = [
  {
    key: "create",
    aliases: ["-cr", "new"],
    args: ["<room_name>"],
    async handler({ input, output, user }, { spectralArgs, useDefault }) {
      const { parsed: casa } = await Casaieah.fromDB(input.senderID);
      const w = 10;
      const h = 4;
      const inpname = spectralArgs[0];
      if (!inpname) {
        return useDefault();
      }

      if (Casaieah.getRoom(casa, inpname)) {
        return output.reply(`❌ Room **${inpname}** already exists!`);
      }

      const room = Casa2d.createRoom(inpname, w, h, () => null);

      casa.rooms.push(room);

      await Casaieah.toDB(input.senderID, casa);

      const roomCan = await room.tiles.renderView();
      return output.attach(
        `👤 **${user.name}**\n✅ Room successfully created, and it is empty!\n\n🚪 **Room**: ${room.name}\n***Please refer to the image below***`,
        await roomCan.toStream()
      );
    },
  },
  {
    key: "list",
    aliases: ["-l", "rooms"],
    async handler({ input, output, user }) {
      const { parsed: casa } = await Casaieah.fromDB(input.senderID);
      const rooms = casa.rooms;
      return output.reply(
        `👤 **${user.name}**\n\n${rooms
          .map(
            (room, ind) =>
              `**${ind + 1}**. 🚪 **${room.name}**\n  Size: **${
                room.width
              }**x**${room.height}**\n  Empty Tiles: **x${
                room.tiles.emptyCount
              }**`
          )
          .join("\n\n")}`
      );
    },
  },
  {
    key: "view",
    aliases: ["-v"],
    args: ["[room_name]"],
    async handler({ input, output, user }, { spectralArgs, useDefault }) {
      const { parsed: casa } = await Casaieah.fromDB(input.senderID);
      const inpname = spectralArgs[0];
      if (!inpname) {
        return useDefault();
      }
      const room = Casaieah.getRoom(casa, inpname);
      if (!room) {
        return output.reply(`❌ Room not **found**.`);
      }
      const roomCan = await room.tiles.renderView();
      return output.attach(
        `👤 **${user.name}**\n\n🚪 **Room**: ${room.name}\n***Please refer to the image below***`,
        await roomCan.toStream()
      );
    },
  },
  {
    key: "set",
    aliases: ["-s"],
    args: ["<room_name>", "<x>", "<y>", "<id>"],
    async handler({ input, output, user }, { spectralArgs, useDefault }) {
      const { parsed: casa } = await Casaieah.fromDB(input.senderID);
      const inpname = spectralArgs[0];
      const [x, y] = Casaieah.parseInputCoords(
        spectralArgs[1],
        spectralArgs[2]
      );
      const ID = String(spectralArgs[3] ?? "");
      if (!inpname || isNaN(x) || isNaN(y) || !ID) {
        return useDefault();
      }
      const room = Casaieah.getRoom(casa, inpname);
      if (!room) {
        return output.reply(`❌ Room not **found**.`);
      }
      const item = Casaieah.registry.get(ID);
      if (!item && ID !== "null") {
        return output.reply(`❌ Can't find a tile with ID **${ID}**`);
      }
      if (!room.tiles.inBounds(x, y)) {
        return output.reply(`❌ Out of bounds!`);
      }
      const old = room.tiles.get(x, y);
      room.tiles.set(x, y, item);
      const roomCan = await room.tiles.renderView();
      await Casaieah.toDB(input.senderID, casa);
      return output.attach(
        `👤 **${user.name}**\n\n✅ Set from ${old?.emoji ?? "NULL"} **${
          old?.name ?? "Null"
        }** to ${item?.emoji ?? "NULL"} **${
          item?.name ?? "Null"
        }**\n🚪 **Room**: ${room.name}\n***Please refer to the image below***`,
        await roomCan.toStream()
      );
    },
  },
];
const home = new SpectralCMDHome(
  {
    isHypen: false,
  },
  config
);

export const entry = defineHome(home);
